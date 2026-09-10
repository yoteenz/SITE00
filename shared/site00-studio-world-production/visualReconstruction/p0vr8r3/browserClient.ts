/**
 * P0.VR.8R3 — Browser-safe capture orchestration exports (no worker / Playwright).
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
  getActiveProjectCaptureRun,
  listProjectCaptureRuns,
} from './projectCaptureRunStore.js';

export { buildCaptureOrchestrationInspectorState } from './captureOrchestrationInspector.js';

export {
  getCaptureWorkerHealth,
  type CaptureWorkerHealth,
  type CaptureWorkerHealthStatus,
} from './captureWorkerHealth.js';
