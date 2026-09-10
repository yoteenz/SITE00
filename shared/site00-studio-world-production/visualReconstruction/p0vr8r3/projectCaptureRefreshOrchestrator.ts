/**
 * P0.VR.8R3R1 — ProjectCaptureRefreshOrchestrator with contract + persistence.
 */

import { enqueuePageCapture, listCaptureQueue, coalesceDuplicateCaptures, prioritizeCaptureQueue } from '../p0vr8/captureQueue.js';
import { resolveCaptureViewportsForPage } from '../p0vr8/capturePolicy.js';
import { listProjectPageRecords, upsertProjectPageRecord } from '../p0vr8/projectPageRegistry.js';
import { resolveProjectLiveBaseUrl } from '../p0vr8/projectBaseUrl.js';
import { dispatchCaptureWorker, type CaptureExecutor } from './captureWorker.js';
import { getCaptureWorkerHealth } from './captureWorkerHealth.js';
import {
  createProjectCaptureRun,
  getActiveProjectCaptureRun,
  getProjectCaptureRun,
  updateProjectCaptureRun,
  upsertCaptureTargets,
  markProjectCaptureRunInvalid,
  type PageCaptureTarget,
  type PersistedCaptureRun,
} from './projectCaptureRunStore.js';
import { syncCaptureQueueToPersistence, hydrateCaptureQueueFromPersistence } from './captureQueuePersistence.js';
import { appendCaptureRunEvent, getLastCaptureRunEvent } from './captureRunEvents.js';
import { normalizeRecoveredCaptureStatuses } from './normalizeRecoveredCaptureStatuses.js';
import {
  normalizeProjectCaptureRunResponse,
  type ProjectCaptureRunContract,
} from './projectCaptureRunContract.js';
import { buildCaptureVersionReceipt } from './buildVersionReceipt.js';
import { loadCaptureOrchestrationRegistry } from './captureRunPersistentStore.js';

const GOLDEN_FIRST_ROUTE = '/projects/ndxbook';

export function isRouteAuditStale(): boolean {
  return false;
}

function sortTargetsMobileFirst(targets: PageCaptureTarget[]): PageCaptureTarget[] {
  return [...targets].sort((a, b) => {
    const aGolden = a.route === GOLDEN_FIRST_ROUTE || a.route.startsWith(`${GOLDEN_FIRST_ROUTE}/`) ? 0 : 1;
    const bGolden = b.route === GOLDEN_FIRST_ROUTE || b.route.startsWith(`${GOLDEN_FIRST_ROUTE}/`) ? 0 : 1;
    if (aGolden !== bGolden) return aGolden - bGolden;
    return a.route.localeCompare(b.route);
  });
}

function buildCaptureTargets(
  projectId: string,
  runId: string,
  viewportMode: 'MOBILE_ONLY' | 'ALL_SUPPORTED',
): PageCaptureTarget[] {
  const pages = listProjectPageRecords(projectId, true);
  const targets: PageCaptureTarget[] = [];

  for (const page of pages) {
    if (!page.isActive || page.status === 'ROUTE_MISSING' || page.status === 'REMOVED') continue;

    let viewports = resolveCaptureViewportsForPage(page);
    if (viewportMode === 'MOBILE_ONLY') {
      viewports = viewports.includes('mobile') ? ['mobile'] : viewports.slice(0, 1);
    }

    for (const viewport of viewports) {
      targets.push({
        targetId: `pct-${runId}-${page.pageId}-${viewport}`,
        runId,
        projectId,
        pageId: page.pageId,
        screenId: page.screenId,
        route: page.representativeRoute ?? page.route,
        viewport,
        status: 'PLANNED',
        jobId: null,
      });
    }
  }

  return sortTargetsMobileFirst(targets);
}

function runToContract(
  run: PersistedCaptureRun,
  options?: { duplicateBlocked?: boolean; activeRunId?: string | null; repoRoot?: string },
): ProjectCaptureRunContract {
  const workerHealth = getCaptureWorkerHealth();
  const lastEvent = getLastCaptureRunEvent(run.runId, options?.repoRoot);
  return normalizeProjectCaptureRunResponse(
    {
      contractVersion: 'capture-run-v1',
      runId: run.runId,
      projectId: run.projectId,
      status: run.status,
      totalTargets: run.totalTargets,
      queuedCount: run.queuedCount,
      capturingCount: run.capturingCount,
      completedCount: run.completedCount,
      failedCount: run.failedCount,
      skippedCount: run.skippedCount,
      currentTargetId: run.currentTargetId,
      startedAt: run.startedAt,
      updatedAt: run.updatedAt,
      completedAt: run.completedAt,
      lastError: run.lastError,
      duplicateBlocked: options?.duplicateBlocked,
      activeRunId: options?.activeRunId,
    },
    {
      workerHealth,
      lastEvent,
      buildReceipt: buildCaptureVersionReceipt(),
      duplicateBlocked: options?.duplicateBlocked,
      activeRunId: options?.activeRunId,
    },
  );
}

function syncRunCounts(runId: string, repoRoot?: string): PersistedCaptureRun | null {
  const run = getProjectCaptureRun(runId, repoRoot);
  if (!run) return null;

  const jobs = listCaptureQueue(run.projectId);
  const runJobs = jobs.filter((j) => j.runId === runId || !j.runId);
  const queued = runJobs.filter((j) => j.status === 'QUEUED').length;
  const capturing = runJobs.filter((j) => j.status === 'CAPTURING').length;
  const completed = runJobs.filter((j) => j.status === 'COMPLETE').length;
  const failed = runJobs.filter((j) => j.status === 'FAILED').length;

  let status = run.status;
  if (capturing > 0 || queued > 0) status = 'CAPTURING';
  else if (failed > 0 && completed > 0) status = 'PARTIAL';
  else if (failed > 0 && completed === 0) status = 'FAILED';
  else if (completed > 0) status = completed >= run.totalTargets ? 'COMPLETE' : 'PARTIAL';

  syncCaptureQueueToPersistence(run.projectId, runId, repoRoot);

  return updateProjectCaptureRun(
    runId,
    {
      queuedCount: queued,
      capturingCount: capturing,
      completedCount: completed,
      failedCount: failed,
      status,
      completedAt: capturing > 0 || queued > 0 ? null : new Date().toISOString(),
    },
    repoRoot,
  );
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
    awaitFirstCapture?: boolean;
  },
): Promise<ProjectCaptureRunContract> {
  const repoRoot = options?.repoRoot;
  normalizeRecoveredCaptureStatuses(projectId);
  hydrateCaptureQueueFromPersistence(projectId, repoRoot);

  const workerHealth = getCaptureWorkerHealth();
  if (workerHealth.status === 'OFFLINE') {
    throw new Error('CAPTURE_WORKER_OFFLINE');
  }

  const active = getActiveProjectCaptureRun(projectId, repoRoot);
  if (active) {
    if (!active.contractValid || active.totalTargets <= 0) {
      markProjectCaptureRunInvalid(active.runId, 'MALFORMED_RUN', repoRoot);
    } else if (!options?.forceNewRun) {
      return runToContract(active, { duplicateBlocked: true, activeRunId: active.runId, repoRoot });
    }
  }

  const runId = `pcr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const viewportMode = options?.viewportMode ?? 'MOBILE_ONLY';
  const startedAt = new Date().toISOString();

  let run = createProjectCaptureRun(
    {
      runId,
      projectId,
      totalTargets: 0,
      queuedCount: 0,
      capturingCount: 0,
      completedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      currentTargetId: null,
      startedAt,
      updatedAt: startedAt,
      completedAt: null,
      status: 'PLANNING',
      lastError: null,
      viewportMode,
      contractValid: true,
    },
    repoRoot,
  );

  appendCaptureRunEvent(
    { runId, projectId, type: 'RUN_CREATED', route: null, viewport: null, targetId: null, jobId: null, message: 'Run created' },
    repoRoot,
  );

  const targets = buildCaptureTargets(projectId, runId, viewportMode);
  upsertCaptureTargets(targets, repoRoot);

  run = updateProjectCaptureRun(runId, { totalTargets: targets.length, status: 'QUEUING' }, repoRoot)!;

  appendCaptureRunEvent(
    {
      runId,
      projectId,
      type: 'TARGETS_PLANNED',
      route: null,
      viewport: null,
      targetId: null,
      jobId: null,
      message: `${targets.length} targets planned`,
    },
    repoRoot,
  );

  for (const target of targets) {
    const page = listProjectPageRecords(projectId, false).find((p) => p.pageId === target.pageId);
    if (!page) continue;

    const job = enqueuePageCapture({
      projectId,
      pageId: target.pageId,
      route: target.route,
      viewport: target.viewport,
      reason: 'MANUAL_REFRESH',
      deploymentId: page.lastDeploymentId,
      runId,
      targetId: target.targetId,
      priority: target.route === GOLDEN_FIRST_ROUTE ? 100 : 5,
    });

    upsertCaptureTargets([{ ...target, status: 'QUEUED', jobId: job.jobId }], repoRoot);

    upsertProjectPageRecord({
      ...page,
      status: page.lastCapturedAt ? 'STALE' : 'CAPTURE_PENDING',
      updatedAt: new Date().toISOString(),
    });
  }

  coalesceDuplicateCaptures(projectId);
  prioritizeCaptureQueue(projectId, GOLDEN_FIRST_ROUTE);
  syncCaptureQueueToPersistence(projectId, runId, repoRoot);

  const queued = listCaptureQueue(projectId).filter((j) => j.status === 'QUEUED').length;
  run = updateProjectCaptureRun(
    runId,
    {
      queuedCount: queued,
      status: queued > 0 ? 'CAPTURING' : 'COMPLETE',
      completedAt: queued === 0 ? new Date().toISOString() : null,
    },
    repoRoot,
  )!;

  const firstTarget = targets[0];
  appendCaptureRunEvent(
    {
      runId,
      projectId,
      type: 'JOBS_QUEUED',
      route: firstTarget?.route ?? null,
      viewport: firstTarget?.viewport ?? null,
      targetId: firstTarget?.targetId ?? null,
      jobId: firstTarget?.jobId ?? null,
      message: `${queued} jobs queued`,
    },
    repoRoot,
  );

  if (options?.executeWorker !== false && queued > 0) {
    const workerPromise = dispatchCaptureWorker({
      projectId,
      runId,
      baseUrl: options?.baseUrl ?? resolveProjectLiveBaseUrl(projectId),
      repoRoot,
      captureFn: options?.captureFn,
    }).then(() => {
      syncRunCounts(runId, repoRoot);
      appendCaptureRunEvent(
        {
          runId,
          projectId,
          type: 'RUN_COMPLETED',
          route: null,
          viewport: null,
          targetId: null,
          jobId: null,
          message: 'Run finished',
        },
        repoRoot,
      );
    });

    if (options?.awaitFirstCapture) {
      await workerPromise;
    } else {
      void workerPromise;
    }
  }

  syncRunCounts(runId, repoRoot);
  const finalRun = getProjectCaptureRun(runId, repoRoot) ?? run;
  return runToContract(finalRun, { repoRoot });
}

export function getProjectCaptureRefreshProgress(
  projectId: string,
  repoRoot?: string,
): ProjectCaptureRunContract | null {
  hydrateCaptureQueueFromPersistence(projectId, repoRoot);
  let run = getActiveProjectCaptureRun(projectId, repoRoot);
  if (!run) {
    const registry = loadCaptureOrchestrationRegistry(repoRoot);
    run = registry.runs.find((r) => r.projectId === projectId) ?? null;
    if (!run) return null;
  }

  syncRunCounts(run.runId, repoRoot);
  const synced = getProjectCaptureRun(run.runId, repoRoot) ?? run;
  return runToContract(synced, { repoRoot });
}
