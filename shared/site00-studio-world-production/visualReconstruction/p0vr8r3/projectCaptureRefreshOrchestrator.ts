/**
 * P0.VR.8R3R2 — ProjectCaptureRefreshOrchestrator with preflight + route resolution.
 */

import { enqueuePageCapture, listCaptureQueue, coalesceDuplicateCaptures, prioritizeCaptureQueue } from '../p0vr8/captureQueue.js';
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
import { reconcileRecoveredPageCaptureStates } from './reconcileRecoveredPageCaptureStates.js';
import {
  normalizeProjectCaptureRunResponse,
  type ProjectCaptureRunContract,
} from './projectCaptureRunContract.js';
import { buildCaptureVersionReceipt } from './buildVersionReceipt.js';
import {
  buildCaptureRunPreflight,
  generateCaptureRunId,
  listEligibleCaptureTargets,
} from './captureRunPreflight.js';
import { buildProjectCaptureStateSummary } from './projectCaptureStateSummary.js';
import { loadCaptureOrchestrationRegistry } from './captureRunPersistentStore.js';

export function isRouteAuditStale(): boolean {
  return false;
}

function runToContract(
  run: PersistedCaptureRun,
  options?: {
    duplicateBlocked?: boolean;
    activeRunId?: string | null;
    repoRoot?: string;
    preflight?: ReturnType<typeof buildCaptureRunPreflight> | null;
  },
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
      preflight: options?.preflight ?? null,
    },
  );
}

function invalidContractFromPreflight(
  projectId: string,
  preflight: ReturnType<typeof buildCaptureRunPreflight>,
  reason: string,
): ProjectCaptureRunContract {
  return normalizeProjectCaptureRunResponse(
    {
      contractVersion: 'capture-run-v1',
      runId: '',
      projectId,
      status: 'INVALID',
      totalTargets: 0,
      queuedCount: 0,
      capturingCount: 0,
      completedCount: 0,
      failedCount: 0,
      skippedCount: 0,
      currentTargetId: null,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      lastError: reason,
    },
    {
      workerHealth: getCaptureWorkerHealth(),
      buildReceipt: buildCaptureVersionReceipt(),
      preflight,
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
  const baseUrl = options?.baseUrl ?? resolveProjectLiveBaseUrl(projectId);
  const viewportMode = options?.viewportMode ?? 'MOBILE_ONLY';

  reconcileRecoveredPageCaptureStates(projectId);
  hydrateCaptureQueueFromPersistence(projectId, repoRoot);

  const preflight = buildCaptureRunPreflight(projectId, { baseUrl, viewportMode });

  if (preflight.workerStatus === 'OFFLINE') {
    throw new Error('CAPTURE_WORKER_OFFLINE');
  }

  const active = getActiveProjectCaptureRun(projectId, repoRoot);
  if (active) {
    const activeContract = runToContract(active, { activeRunId: active.runId, repoRoot, preflight });
    if (!activeContract.contractValid || active.totalTargets <= 0) {
      markProjectCaptureRunInvalid(active.runId, activeContract.contractError ?? 'MALFORMED_RUN', repoRoot);
    } else if (!options?.forceNewRun) {
      return runToContract(active, { duplicateBlocked: true, activeRunId: active.runId, repoRoot, preflight });
    }
  }

  if (!preflight.ready) {
    return invalidContractFromPreflight(projectId, preflight, preflight.blockReason ?? 'RUN_CONTRACT_INVALID');
  }

  const runId = generateCaptureRunId(projectId);
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

  const eligibleTargets = listEligibleCaptureTargets(projectId, runId, { baseUrl, viewportMode });
  const targets: PageCaptureTarget[] = eligibleTargets.map(({ identity, viewport, targetId }) => {
    const page = listProjectPageRecords(projectId, false).find((p) => p.pageId === identity.pageId)!;
    return {
      targetId,
      runId,
      projectId,
      pageId: identity.pageId,
      screenId: page.screenId,
      route: identity.resolvedRuntimePath!,
      displayRoute: identity.displayRoute,
      resolvedRuntimePath: identity.resolvedRuntimePath,
      captureUrl: identity.captureUrl,
      resolutionSource: identity.resolutionSource,
      routeValid: identity.routeValid,
      viewport,
      status: 'PLANNED',
      jobId: null,
    };
  });

  upsertCaptureTargets(targets, repoRoot);

  run = updateProjectCaptureRun(runId, { totalTargets: targets.length, status: 'QUEUING' }, repoRoot)!;

  appendCaptureRunEvent(
    {
      runId,
      projectId,
      type: 'TARGETS_PLANNED',
      route: preflight.goldenFirstRoute,
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
      route: target.resolvedRuntimePath ?? target.route,
      viewport: target.viewport,
      reason: 'MANUAL_REFRESH',
      deploymentId: page.lastDeploymentId,
      runId,
      targetId: target.targetId,
      priority: target.resolvedRuntimePath?.includes('/projects/ndxbook') ? 100 : 5,
    });

    upsertCaptureTargets([{ ...target, status: 'QUEUED', jobId: job.jobId }], repoRoot);

    if (!page.lastCapturedAt) {
      upsertProjectPageRecord({
        ...page,
        status: 'DISCOVERED',
        updatedAt: new Date().toISOString(),
      });
    } else {
      upsertProjectPageRecord({
        ...page,
        status: 'STALE',
        updatedAt: new Date().toISOString(),
      });
    }
  }

  coalesceDuplicateCaptures(projectId);
  prioritizeCaptureQueue(projectId, preflight.goldenFirstRoute ?? '/projects/ndxbook');
  syncCaptureQueueToPersistence(projectId, runId, repoRoot);

  const queued = listCaptureQueue(projectId).filter((j) => j.runId === runId && j.status === 'QUEUED').length;
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
      route: firstTarget?.resolvedRuntimePath ?? firstTarget?.route ?? null,
      viewport: firstTarget?.viewport ?? null,
      targetId: firstTarget?.targetId ?? null,
      jobId: firstTarget?.jobId ?? null,
      message: `${queued} jobs queued`,
    },
    repoRoot,
  );

  const postPlanContract = runToContract(run, { repoRoot, preflight });
  if (!postPlanContract.contractValid) {
    markProjectCaptureRunInvalid(runId, postPlanContract.contractError ?? 'RUN_CONTRACT_INVALID', repoRoot);
    return postPlanContract;
  }

  if (options?.executeWorker !== false && queued > 0) {
    const workerPromise = dispatchCaptureWorker({
      projectId,
      runId,
      baseUrl,
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
  return runToContract(finalRun, { repoRoot, preflight });
}

export function getProjectCaptureRefreshProgress(
  projectId: string,
  repoRoot?: string,
): ProjectCaptureRunContract | null {
  hydrateCaptureQueueFromPersistence(projectId, repoRoot);
  const preflight = buildCaptureRunPreflight(projectId);

  let run = getActiveProjectCaptureRun(projectId, repoRoot);
  if (!run) {
    const registry = loadCaptureOrchestrationRegistry(repoRoot);
    run = registry.runs.find((r) => r.projectId === projectId && r.status !== 'INVALID') ?? null;
    if (!run) return null;
  }

  if (!run.contractValid || run.totalTargets <= 0 || !run.runId) {
    markProjectCaptureRunInvalid(run.runId, run.lastError ?? 'MALFORMED_RUN', repoRoot);
    return invalidContractFromPreflight(projectId, preflight, run.lastError ?? 'RUN_CONTRACT_INVALID');
  }

  syncRunCounts(run.runId, repoRoot);
  const synced = getProjectCaptureRun(run.runId, repoRoot) ?? run;
  const contract = runToContract(synced, { repoRoot, preflight });
  if (!contract.contractValid) {
    markProjectCaptureRunInvalid(run.runId, contract.contractError ?? 'MALFORMED_RUN', repoRoot);
  }
  return contract;
}

export function getProjectCaptureStateSummaryForProject(projectId: string) {
  const pages = listProjectPageRecords(projectId, true);
  return buildProjectCaptureStateSummary(pages, listCaptureQueue(projectId));
}
