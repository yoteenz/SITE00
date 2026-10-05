export * from './types.js';
export * from './constants.js';
export { resolveWebVisualReferenceAsset, referenceImageRequiredForReconstruction } from './resolveWebVisualReferenceAsset.js';
export {
  createWebVisualReferenceAuthority,
  inferViewportClass,
  textDescriptionOutranksReference,
  visualAuthorityOrder,
  buildImageReferenceProviderPayload,
  unauthorizedDesignImprovementBlocked,
} from './webVisualReferenceAuthority.js';
export { decomposePageVisual, textCannotOverrideGeometry } from './pageVisualDecomposition.js';
export { buildVisualRegionMap, lockMatchedRegions, regionsNeedingCorrection } from './visualRegionMap.js';
export { buildPixelGeometryContract, geometryWithinTolerance } from './pixelGeometryContract.js';
export { buildReferenceTypographyContract, typographyLineBreaksPreserved } from './referenceTypographyContract.js';
export { extractFrameAuthority, cameraDriftDetected } from './frameAuthority.js';
export {
  createDesktopVisualAuthority,
  createMobileVisualAuthority,
  resolveResponsiveAuthorityMode,
  desktopMobileGeometryIndependent,
  interpolationAllowedAfterEndpointMatch,
  preserveUltrawideViewport,
} from './desktopMobileVisualAuthority.js';
export {
  matchReferenceAssets,
  selectAssetByPriority,
  exactBackgroundReuseRequired,
  generatedSubstituteIsLastResort,
} from './referenceAssetMatch.js';
export { evaluatePixelMatch, pixelMatchFromRenderedComparison } from './pixelMatchEvaluation.js';
export { buildVisualDifferenceMap, classifyDifferenceKind, largestDriftRegions } from './visualDifferenceMap.js';
export {
  decomposeMoodboardIntoScreens,
  attachAuthorityToScreen,
  moodboardDoesNotSynthesizeAverage,
} from './moodboardScreenExtraction.js';
export {
  WEB_RECONSTRUCTION_PROVIDERS,
  selectProviderForScreenshotReconstruction,
  textOnlyProviderBlockedAsPrimary,
} from './webReconstructionProviderRouting.js';
export {
  createCanonicalRouteVisualAuthority,
  updateRouteAuthorityStatus,
  enableResponsiveInterpolation,
  websiteReconstructionSeparatedFromDesignGeneration,
} from './canonicalRouteVisualAuthority.js';
export {
  runScreenshotFirstReconstructionPipeline,
  referenceImplementationAligned,
} from './screenshotFirstReconstructionPipeline.js';
export type { RunScreenshotFirstReconstructionInput } from './screenshotFirstReconstructionPipeline.js';
