/**
 * P0.VR.8R3R1 — Server-side capture orchestration exports.
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
  CAPTURE_RUN_CONTRACT_VERSION,
  normalizeProjectCaptureRunResponse,
  validateProjectCaptureRunContract,
  captureRunProgressLabel,
  type ProjectCaptureRunContract,
} from './projectCaptureRunContract.js';

export {
  P0_VR_8R3R1_BUILD,
  buildCaptureVersionReceipt,
  detectBackendVersionMismatch,
  type BuildVersionReceipt,
} from './buildVersionReceipt.js';

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
  markWorkerOnline,
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
  bootstrapCaptureRunStore,
  createProjectCaptureRun,
  getProjectCaptureRun,
  getActiveProjectCaptureRun,
  listProjectCaptureRuns,
  markProjectCaptureRunInvalid,
  clearProjectCaptureRunsForTest,
  type PersistedCaptureRun,
  type PageCaptureTarget,
} from './projectCaptureRunStore.js';

export { buildCaptureOrchestrationInspectorState } from './captureOrchestrationInspector.js';
export { normalizeRecoveredCaptureStatuses } from './normalizeRecoveredCaptureStatuses.js';
export { appendCaptureRunEvent, getLastCaptureRunEvent, listCaptureRunEvents, clearCaptureRunEventsForTest } from './captureRunEvents.js';
export { syncCaptureQueueToPersistence, hydrateCaptureQueueFromPersistence, resetCaptureQueueHydrationForTest } from './captureQueuePersistence.js';
export { clearCaptureOrchestrationRegistryForTest } from './captureRunPersistentStore.js';
