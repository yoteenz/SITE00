/**
 * P0.VR.8R3 — Browser-safe capture orchestration exports.
 */

export {
  PAGE_CAPTURE_STATUS,
  PROJECT_CAPTURE_RUN_STATUS,
} from './types.js';

export type {
  PageCaptureStatus,
  ProjectCaptureRunStatus,
  CaptureTarget,
  PageCaptureJob,
  ProjectCaptureRun,
  ProjectCaptureRefreshResult,
  CaptureOrchestrationInspectorState,
} from './types.js';

export {
  derivePageCaptureStatus,
  countPagesByCaptureStatus,
  mapCaptureStatusToMirrorFilter,
} from './pageCaptureStatus.js';

export {
  refreshProjectCaptureState,
  getProjectCaptureRefreshProgress,
  isRouteAuditStale,
} from './projectCaptureRefreshOrchestrator.js';

export {
  dispatchCaptureWorker,
  markCaptureWorkerOffline,
  DEFAULT_CAPTURE_CONCURRENCY,
  CAPTURE_RENDER_TIMEOUT_MS,
} from './captureWorker.js';

export {
  getCaptureWorkerHealth,
  setCaptureWorkerConcurrency,
  resetCaptureWorkerHealthForTest,
  type CaptureWorkerHealth,
  type CaptureWorkerHealthStatus,
} from './captureWorkerHealth.js';

export {
  recordCaptureFailure,
  shouldBlockCaptureRetry,
  clearCaptureFailureLoopGuardForTest,
  CAPTURE_FAILURE_LOOP_MAX,
} from './captureFailureLoopGuard.js';

export {
  createProjectCaptureRun,
  getProjectCaptureRun,
  getActiveProjectCaptureRun,
  listProjectCaptureRuns,
  clearProjectCaptureRunsForTest,
} from './projectCaptureRunStore.js';

export { buildCaptureOrchestrationInspectorState } from './captureOrchestrationInspector.js';
