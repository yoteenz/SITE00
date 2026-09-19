/**
 * P0.VR.8R3R1 — Browser-safe capture orchestration exports.
 */

export {
  CAPTURE_RUN_CONTRACT_VERSION,
  normalizeProjectCaptureRunResponse,
  captureRunProgressLabel,
  type ProjectCaptureRunContract,
} from './projectCaptureRunContract.js';

export type { CaptureRunContractReceipt, CaptureRunContractErrorCode } from './captureRunContractReceipt.js';
export type { ProjectCaptureStateSummary } from './projectCaptureStateSummary.js';
export type { CaptureRunPreflight } from './captureRunPreflight.js';

export { P0_VR_8R3R1_BUILD, P0_VR_8R3R3_BUILD, P0_VR_8R3R4_BUILD, P0_VR_8R3R5_BUILD } from './constants.js';
export {
  buildCaptureFounderGuidance,
  founderPageStatusLabel,
  founderSummaryChips,
  founderPageFilterLabels,
  resolveFounderCaptureWorkflowStage,
  TEST_WORKER_PROGRESS_STEPS,
  type CaptureFounderGuidance,
  type FounderCaptureWorkflowStage,
  type TestWorkerProgressStep,
} from './captureFounderGuidance.js';
export { FOUNDER_CAPTURE_WORKFLOW_STAGES, workflowStageToId } from './founderCaptureWorkflow.js';
export { detectBackendVersionMismatch } from './buildVersionReceipt.browser.js';
export type { BuildVersionReceipt } from './buildVersionReceipt.js';

export {
  PAGE_CAPTURE_STATUS,
  PROJECT_CAPTURE_RUN_STATUS,
} from './types.js';

export type {
  PageCaptureStatus,
  ProjectCaptureRunStatus,
  CaptureTarget,
  PageCaptureJob,
  CaptureOrchestrationInspectorState,
} from './types.js';

export {
  derivePageCaptureStatus,
  countPagesByCaptureStatus,
  mapCaptureStatusToMirrorFilter,
} from './pageCaptureStatus.js';

export type { ProjectCaptureRunEvent } from './captureRunEvents.js';
