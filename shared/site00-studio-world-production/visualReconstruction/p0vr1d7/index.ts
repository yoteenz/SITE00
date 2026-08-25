/**
 * P0.VR.1D.7 — Reference scope awareness + desktop composite mapping correction.
 */

export {
  P0_VR_1D7_LINEAGE,
  P0_VR_1D7_REUSED_LINEAGE,
  VISUAL_REFERENCE_SCOPE_FAILURE_CODES,
  INVALID_SCOPE_COMPARISON_MARKER,
  NDX_DESKTOP_COMPOSITE_ROUTE,
  NDX_DESKTOP_SCOPE_ROOTS,
} from './constants.js';
export type { VisualReferenceScopeFailureCode } from './constants.js';

export type {
  VisualReferenceScope,
  ScopeTargetType,
  ScopedComparisonMode,
  FullRouteReferenceStatus,
  ScopeAwareVisualAuthority,
  ScopedImplementationSpec,
  ScopedRenderCaptureInput,
  ScopedRenderCaptureResult,
  ScopedLiveScreenRunResult,
  ReclassifiedFounderReference,
  ScopedRevalidationSummary,
  DesktopCompositeRevalidationReport,
} from './types.js';
export { VISUAL_REFERENCE_SCOPES } from './types.js';

export {
  resolveScopeTargetDefinition,
  allNdxScopeTargetDefinitions,
} from './scopeTargetRegistry.js';
export type { ScopeTargetDefinition } from './scopeTargetRegistry.js';

export {
  classifyVisualReferenceScope,
  classifyExtractedScreenReference,
} from './classifyVisualReferenceScope.js';

export {
  buildScopedImplementationSpec,
  scopeVisualScoreLabel,
  founderInspectScopeLabel,
  founderInspectTargetLabel,
} from './scopedImplementationSpec.js';

export {
  buildScopedReferenceDomRegionMap,
  panelReferenceUsedAsFullRouteAuthority,
  markComparisonScopeValidity,
} from './scopedReferenceDomRegionMap.js';

export {
  normalizeScopedDomMeasurements,
  scopedDomRegionSelector,
} from './scopedDomMeasurement.js';

export {
  captureScopedRenderSnapshot,
  resolveScopedRenderSearch,
  resolveScopedRenderOutputDir,
} from './captureScopedRenderSnapshot.js';

export {
  compareScopedPixelMatch,
  referenceCropComparedToFullRouteWhenScopePanel,
} from './scopedPixelComparison.js';

export {
  reclassifyFounderBoardReferences,
  desktopCompositeClassifiedAsFullScreen,
  desktopPanelCropsClassifiedAsPanelOrModule,
  mobilePhoneScreensClassifiedAsFullScreen,
} from './reclassifyFounderBoardReferences.js';

export {
  markInvalidHistoricalScopeComparisons,
  countInvalidHistoricalScopeComparisons,
} from './markInvalidHistoricalScopeComparisons.js';
export type { HistoricalScopeComparisonRecord } from './markInvalidHistoricalScopeComparisons.js';

export { buildDesktopCompositeScopeRevalidationReport } from './runDesktopCompositeScopeRevalidation.js';
