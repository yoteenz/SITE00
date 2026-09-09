/** P0.VR.4R2 — Browser-safe exports. */
export { P0_VR_4R2_LINEAGE, CROP_FAILURE_CLASSES, CROP_QA_STATUSES, REGENERATION_REASON_CLASSES } from './types.js';
export type {
  CropFailureClass,
  CropQaStatus,
  SourcePixelBounds,
  NormalizedBounds,
  CropCoordinateRecord,
  ReferenceCropQaResult,
  DesignGenerationPreflightResult,
  RegenerationReasonClass,
} from './types.js';
export {
  displaySelectionToSourcePixels,
  sourcePixelsToNormalized,
  normalizedToSourcePixels,
  clampBoundsToSource,
  applyPaddingToBounds,
  buildCoordinateRecord,
  computeScaleFactors,
} from './coordinateSpace.js';
export {
  PROJECTS_REFERENCE_SOURCE_WIDTH,
  PROJECTS_REFERENCE_SOURCE_HEIGHT,
  PROJECTS_HEADER_PLANET_OBJECT_BOUNDS,
  PROJECTS_HEADER_PLANET_PADDING_PERCENT,
  PROJECTS_HEADER_PLANET_GOLDEN_FINAL_BOUNDS,
  PROJECTS_HEADER_PLANET_LEGACY_BAD_BOUNDS,
  isLegacyBadPlanetCrop,
} from './projectsHeaderPlanetGoldenCrop.js';
export { referenceCropGeometryGuard, isPointLikeBounds } from './referenceCropGeometryGuard.js';
export { evaluateObjectCoverageQA } from './objectCoverageQA.js';
export { evaluateReferenceCropQA, cropQaAllowsGeneration } from './referenceCropQA.js';
export { runDesignGenerationPreflight } from './designGenerationPreflight.js';
