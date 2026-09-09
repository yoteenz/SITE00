/**
 * P0.VR.8 — Browser-safe live page mirror exports.
 */

export {
  PAGE_MIRROR_FAILURE_CODES,
  PAGE_MIRROR_STATUS,
  PAGE_MIRROR_FILTERS,
  PAGE_SYNC_EVENT_TYPES,
  PAGE_CAPTURE_MAX_RETRIES,
  PROJECT_LIVE_BASE_URLS,
  P0_VR_8_LINEAGE,
} from './constants.js';

export type {
  PageMirrorFailureCode,
  PageMirrorStatus,
  PageMirrorFilter,
  PageSyncEventType,
  ProjectPageRecord,
  ProjectPageSnapshot,
  ProjectPageSnapshotCaptureType,
  PageSnapshotFreshness,
  PageCaptureQueueJob,
  PageCaptureReadyContract,
  RepresentativeRouteInstance,
  PageContentSummary,
  PageDomManifest,
  PageMirrorRow,
  PageMirrorInspectorState,
  PageSyncEvent,
} from './types.js';

export {
  discoverProjectRoutes,
  screenToPageRecord,
  detectAddedRoutes,
  detectRemovedRoutes,
  detectChangedRoutes,
  reconcileRouteRename,
  normalizeProjectRoutes,
} from './routeDiscoveryService.js';

export {
  reconcileProjectPageRegistry,
  listProjectPageRecords,
  getProjectPageRecord,
  markPageStale,
  markPagesStaleForDeploy,
  assertNoCrossProjectCollision,
  clearProjectPageRegistryForTest,
} from './projectPageRegistry.js';

export {
  computePageSnapshotFreshness,
  mapSnapshotStatusToMirrorStatus,
} from './snapshotFreshness.js';

export {
  detectAffectedPageIds,
  normalizeRouteKey,
  shouldSkipUnrelatedCapture,
} from './changeDetector.js';

export { resolveSharedLayoutImpact } from './sharedLayoutImpactResolver.js';

export {
  enqueuePageCapture,
  coalesceDuplicateCaptures,
  listCaptureQueue,
  clearCaptureQueueForTest,
} from './captureQueue.js';

export { evaluatePageCaptureReady, isRouteCaptureError } from './captureReadyContract.js';

export {
  handlePageSyncEvent,
  listPageSyncEvents,
  mapSyncEventToHistoryLabel,
  emitPageSyncEvent,
  clearPageSyncEventsForTest,
} from './syncOrchestrator.js';

export { resolveProjectLiveBaseUrl, buildProjectPageUrl } from './projectBaseUrl.js';

export {
  buildProjectPageMirrorRows,
  pageMirrorRowToVisualIndexRow,
} from './pageMirrorProjection.js';

export { buildPageMirrorInspectorState } from './inspectorState.js';

export { shouldTriggerConvergenceAfterCapture } from './convergenceBridge.js';

export { resolveCaptureViewportsForPage } from './capturePolicy.js';

export {
  registerProjectPageSnapshot,
  getCurrentPageSnapshot,
  listPageSnapshotHistory,
  clearPageSnapshotStoreForTest,
} from './pageSnapshotStore.js';

export { completeCaptureJob, startCaptureJob } from './captureQueue.js';

export { formatPageDescription, buildPageContentSummaryFromDom } from './contentSummary.js';
