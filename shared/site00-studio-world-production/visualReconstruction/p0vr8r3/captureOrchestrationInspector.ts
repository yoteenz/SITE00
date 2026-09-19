/**
 * P0.VR.8R3R1 — Capture orchestration inspector state.
 */

import { listCaptureQueue } from '../p0vr8/captureQueue.js';
import { resolveProjectLiveBaseUrl } from '../p0vr8/projectBaseUrl.js';
import { getCaptureWorkerHealth } from './captureWorkerHealth.js';
import { getActiveProjectCaptureRun, listProjectCaptureRuns } from './projectCaptureRunStore.js';
import { getLastCaptureRunEvent } from './captureRunEvents.js';
import { listWorkerDispatchReceipts } from './workerDispatchReceipt.js';
import { DEFAULT_CAPTURE_CONCURRENCY } from './constants.js';
import { buildCaptureVersionReceipt } from './buildVersionReceipt.js';
import type { CaptureOrchestrationInspectorState } from './types.js';

export function buildCaptureOrchestrationInspectorState(projectId: string): CaptureOrchestrationInspectorState {
  const jobs = listCaptureQueue(projectId);
  const workerHealth = getCaptureWorkerHealth();
  const activeRun = getActiveProjectCaptureRun(projectId);
  const lastEvent = activeRun ? getLastCaptureRunEvent(activeRun.runId) : null;

  return {
    projectId,
    activeRun: activeRun as CaptureOrchestrationInspectorState['activeRun'],
    recentRuns: listProjectCaptureRuns(projectId, 10) as CaptureOrchestrationInspectorState['recentRuns'],
    queuedJobs: jobs.filter((j) => j.status === 'QUEUED').length,
    capturingJobs: jobs.filter((j) => j.status === 'CAPTURING').length,
    completedJobs: jobs.filter((j) => j.status === 'COMPLETE').length,
    failedJobs: jobs.filter((j) => j.status === 'FAILED').length,
    workerHealth,
    concurrencyLimit: workerHealth.concurrencyLimit ?? DEFAULT_CAPTURE_CONCURRENCY,
    lastDispatchAt: workerHealth.lastDispatchAt,
    lastError: workerHealth.lastError,
    deploymentTarget: resolveProjectLiveBaseUrl(projectId),
    lastEvent,
    dispatchReceipts: listWorkerDispatchReceipts(activeRun?.runId),
    buildReceipt: buildCaptureVersionReceipt(),
  };
}
