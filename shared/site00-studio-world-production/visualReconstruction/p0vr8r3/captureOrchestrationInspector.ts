/**
 * P0.VR.8R3 — Capture orchestration inspector state.
 */

import { listCaptureQueue } from '../p0vr8/captureQueue.js';
import { resolveProjectLiveBaseUrl } from '../p0vr8/projectBaseUrl.js';
import { getCaptureWorkerHealth } from './captureWorkerHealth.js';
import { getActiveProjectCaptureRun, listProjectCaptureRuns } from './projectCaptureRunStore.js';
import type { CaptureOrchestrationInspectorState } from './types.js';
import { DEFAULT_CAPTURE_CONCURRENCY } from './constants.js';

export function buildCaptureOrchestrationInspectorState(projectId: string): CaptureOrchestrationInspectorState {
  const jobs = listCaptureQueue(projectId);
  const workerHealth = getCaptureWorkerHealth();

  return {
    projectId,
    activeRun: getActiveProjectCaptureRun(projectId),
    recentRuns: listProjectCaptureRuns(projectId, 10),
    queuedJobs: jobs.filter((j) => j.status === 'QUEUED').length,
    capturingJobs: jobs.filter((j) => j.status === 'CAPTURING').length,
    completedJobs: jobs.filter((j) => j.status === 'COMPLETE').length,
    failedJobs: jobs.filter((j) => j.status === 'FAILED').length,
    workerHealth,
    concurrencyLimit: workerHealth.concurrencyLimit ?? DEFAULT_CAPTURE_CONCURRENCY,
    lastDispatchAt: workerHealth.lastDispatchAt,
    lastError: workerHealth.lastError,
    deploymentTarget: resolveProjectLiveBaseUrl(projectId),
  };
}
