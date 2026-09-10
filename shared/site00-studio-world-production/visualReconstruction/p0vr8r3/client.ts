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
  P0_VR_8R3R2_BUILD,
  P0_VR_8R3R3_BUILD,
  P0_VR_8R3R4_BUILD,
  P0_VR_8R3R5_BUILD,
  P0_VR_8R3R5R1_BUILD,
} from './constants.js';
export {
  buildCaptureFounderGuidance,
  founderPageStatusLabel,
  founderSummaryChips,
  resolveFounderCaptureWorkflowStage,
  TEST_WORKER_PROGRESS_STEPS,
} from './captureFounderGuidance.js';
export { FOUNDER_CAPTURE_WORKFLOW_STAGES, workflowStageToId } from './founderCaptureWorkflow.js';
export {
  buildCaptureTransportHealthResponse,
} from './captureTransportHealth.js';
export type {
  CaptureTransportHealth,
  CaptureTransportHealthResponse,
  CaptureTransportReceipt,
  CaptureTransportErrorCode,
} from './captureTransportReceipt.js';
export {
  classifyFetchFailure,
  classifyHttpStatus,
  classifyResponseBody,
  deriveTransportHealthStatus,
} from './classifyCaptureTransportError.js';
export {
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

export { startCaptureWorker, stopCaptureWorkerForTest, isCaptureWorkerStarted } from './captureWorkerBoot.js';
export { buildCaptureWorkerIdentity, type CaptureWorkerIdentity } from './captureWorkerIdentity.js';
export { type CaptureWorkerBootReceipt } from './captureWorkerBootReceipt.js';
export {
  type CaptureWorkerHeartbeat,
  CAPTURE_WORKER_HEARTBEAT_EXPIRE_MS,
  resolveWorkerStatusFromHeartbeat,
} from './captureWorkerHeartbeat.js';
export { workerHealthStore, resetWorkerHealthStoreForTest, type WorkerHealthView } from './workerHealthStore.js';
export { captureQueueStore, CAPTURE_JOB_LEASE_MS } from './captureQueueStore.js';
export {
  createCaptureWorkerTestJob,
  getLatestCaptureWorkerTestJob,
  executeCaptureWorkerTestJob,
} from './captureWorkerTestJob.js';
export { probePlaywrightReadiness } from './playwrightReadiness.js';
export { appendCaptureWorkerEvent, type CaptureWorkerEvent } from './captureWorkerEvents.js';

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
export {
  reconcileRecoveredPageCaptureStates,
  normalizeRecoveredCaptureStatuses,
} from './reconcileRecoveredPageCaptureStates.js';
export {
  buildCaptureRunContractReceipt,
  type CaptureRunContractReceipt,
  type CaptureRunContractErrorCode,
} from './captureRunContractReceipt.js';
export {
  resolvePageCaptureState,
  resolvePageCaptureStateFromRecord,
  type ResolvedPageCaptureState,
} from './pageCaptureStateResolver.js';
export { buildProjectCaptureStateSummary, type ProjectCaptureStateSummary } from './projectCaptureStateSummary.js';
export { resolveRuntimeRouteForPage, resolveRuntimeRoutesForProject } from './runtimeRouteResolver.js';
export {
  buildCaptureRunPreflight,
  generateCaptureRunId,
  type CaptureRunPreflight,
} from './captureRunPreflight.js';
export { getProjectCaptureStateSummaryForProject } from './projectCaptureRefreshOrchestrator.js';
export { appendCaptureRunEvent, getLastCaptureRunEvent, listCaptureRunEvents, clearCaptureRunEventsForTest } from './captureRunEvents.js';
export { syncCaptureQueueToPersistence, hydrateCaptureQueueFromPersistence, resetCaptureQueueHydrationForTest } from './captureQueuePersistence.js';
export { clearCaptureOrchestrationRegistryForTest } from './captureRunPersistentStore.js';
