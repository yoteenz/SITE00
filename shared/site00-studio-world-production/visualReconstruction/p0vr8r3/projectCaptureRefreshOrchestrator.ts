/**
 * P0.VR.8R3 — ProjectCaptureRefreshOrchestrator — end-to-end capture refresh.
 */

import { enqueuePageCapture, listCaptureQueue, coalesceDuplicateCaptures } from '../p0vr8/captureQueue.js';
import { resolveCaptureViewportsForPage } from '../p0vr8/capturePolicy.js';
import { getPageRegistryMeta, listProjectPageRecords, upsertProjectPageRecord } from '../p0vr8/projectPageRegistry.js';
import { resolveProjectLiveBaseUrl } from '../p0vr8/projectBaseUrl.js';
import { dispatchCaptureWorker, type CaptureExecutor } from './captureWorker.js';
import { getCaptureWorkerHealth } from './captureWorkerHealth.js';
import {
  createProjectCaptureRun,
  getActiveProjectCaptureRun,
  updateProjectCaptureRun,
} from './projectCaptureRunStore.js';
import type { CaptureTarget, ProjectCaptureRefreshResult, ProjectCaptureRun } from './types.js';

const ROUTE_AUDIT_STALE_MS = 30 * 60 * 1000;

export function isRouteAuditStale(_projectId?: string): boolean {
  const meta = getPageRegistryMeta();
  if (!meta.lastDiscoveryAt) return true;
  const age = Date.now() - new Date(meta.lastDiscoveryAt).getTime();
  return age > ROUTE_AUDIT_STALE_MS;
}

function buildCaptureTargets(
  projectId: string,
  viewportMode: 'MOBILE_ONLY' | 'ALL_SUPPORTED',
): CaptureTarget[] {
  const pages = listProjectPageRecords(projectId, true);
  const targets: CaptureTarget[] = [];

  for (const page of pages) {
    if (!page.isActive || page.status === 'ROUTE_MISSING' || page.status === 'REMOVED') continue;

    let viewports = resolveCaptureViewportsForPage(page);
    if (viewportMode === 'MOBILE_ONLY') {
      viewports = viewports.includes('mobile') ? ['mobile'] : viewports.slice(0, 1);
    }

    for (const viewport of viewports) {
      targets.push({
        pageId: page.pageId,
        screenId: page.screenId,
        route: page.representativeRoute ?? page.route,
        viewport,
      });
    }
  }

  return targets;
}

function queueCompletionRefreshForPages(_projectId: string, pageIds: string[]): number {
  return pageIds.length;
}

export async function refreshProjectCaptureState(
  projectId: string,
  options?: {
    viewportMode?: 'MOBILE_ONLY' | 'ALL_SUPPORTED';
    skipRouteReconciliation?: boolean;
    forceNewRun?: boolean;
    baseUrl?: string;
    repoRoot?: string;
    executeWorker?: boolean;
    captureFn?: CaptureExecutor;
  },
): Promise<ProjectCaptureRefreshResult> {
  const workerHealth = getCaptureWorkerHealth();
  if (workerHealth.status === 'OFFLINE') {
    throw new Error('CAPTURE_WORKER_OFFLINE');
  }

  const active = getActiveProjectCaptureRun(projectId);
  if (active && !options?.forceNewRun) {
    return {
      ...active,
      duplicateBlocked: true,
      activeRunId: active.captureRefreshRunId,
      workerHealth,
    };
  }

  const runId = `pcr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const viewportMode = options?.viewportMode ?? 'MOBILE_ONLY';
  const startedAt = new Date().toISOString();

  let run: ProjectCaptureRun = createProjectCaptureRun({
    captureRefreshRunId: runId,
    projectId,
    totalPages: 0,
    captureTargets: [],
    queuedCount: 0,
    capturingCount: 0,
    completedCount: 0,
    failedCount: 0,
    skippedCount: 0,
    startedAt,
    completedAt: null,
    status: 'PLANNING',
    viewportMode,
  });

  const targets = buildCaptureTargets(projectId, viewportMode);
  const uniquePages = new Set(targets.map((t) => t.pageId));

  run = updateProjectCaptureRun(runId, {
    captureTargets: targets,
    totalPages: uniquePages.size,
    status: 'QUEUING',
  })!;

  for (const target of targets) {
    const page = listProjectPageRecords(projectId, false).find((p) => p.pageId === target.pageId);
    if (!page) continue;

    enqueuePageCapture({
      projectId,
      pageId: target.pageId,
      route: target.route,
      viewport: target.viewport,
      reason: 'MANUAL_REFRESH',
      deploymentId: page.lastDeploymentId,
    });

    upsertProjectPageRecord({
      ...page,
      status: page.lastCapturedAt ? 'STALE' : 'CAPTURE_PENDING',
      updatedAt: new Date().toISOString(),
    });
  }

  coalesceDuplicateCaptures(projectId);

  const queued = listCaptureQueue(projectId).filter((j) => j.status === 'QUEUED').length;
  run = updateProjectCaptureRun(runId, {
    queuedCount: queued,
    status: queued > 0 ? 'CAPTURING' : 'COMPLETE',
    completedAt: queued === 0 ? new Date().toISOString() : null,
  })!;

  queueCompletionRefreshForPages(projectId, [...uniquePages]);

  if (options?.executeWorker !== false && queued > 0) {
    void dispatchCaptureWorker({
      projectId,
      runId,
      baseUrl: options?.baseUrl ?? resolveProjectLiveBaseUrl(projectId),
      repoRoot: options?.repoRoot,
      captureFn: options?.captureFn,
    }).then(() => {
      const final = getActiveProjectCaptureRun(projectId);
      if (final?.captureRefreshRunId === runId) {
        updateProjectCaptureRun(runId, { status: 'COMPLETE', completedAt: new Date().toISOString() });
      }
    });
  }

  return {
    ...run,
    workerHealth: getCaptureWorkerHealth(),
  };
}

export function getProjectCaptureRefreshProgress(projectId: string): ProjectCaptureRefreshResult | null {
  const active = getActiveProjectCaptureRun(projectId);
  if (!active) return null;

  const jobs = listCaptureQueue(projectId);
  const queued = jobs.filter((j) => j.status === 'QUEUED').length;
  const capturing = jobs.filter((j) => j.status === 'CAPTURING').length;
  const completed = jobs.filter((j) => j.status === 'COMPLETE').length;
  const failed = jobs.filter((j) => j.status === 'FAILED').length;

  const updated = updateProjectCaptureRun(active.captureRefreshRunId, {
    queuedCount: queued,
    capturingCount: capturing,
    completedCount: completed,
    failedCount: failed,
    status: capturing > 0 || queued > 0 ? 'CAPTURING' : failed > 0 && completed > 0 ? 'PARTIAL' : failed > 0 ? 'FAILED' : 'COMPLETE',
    completedAt: capturing > 0 || queued > 0 ? null : new Date().toISOString(),
  });

  if (!updated) return null;

  return {
    ...updated,
    workerHealth: getCaptureWorkerHealth(),
  };
}
