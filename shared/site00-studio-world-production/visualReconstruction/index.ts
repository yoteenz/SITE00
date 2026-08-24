export * from './types.js';
export * from './constants.js';
export * from './modes.js';
export { ingestScreenshotReference } from './ingestion/ScreenshotReferenceIngestionPipeline.js';
export { evaluateBrowserChrome } from './ingestion/BrowserChromeDetectionEvaluation.js';
export { decomposeReferenceRegions, buildVisualReferenceSet } from './regions/VisualReferenceRegion.js';
export { measureRegions, measureTypographyFromRegions, evaluateLineWrapMatch } from './measurement/VisualMeasurement.js';
export { buildVisualReconstructionBlueprint } from './blueprint/VisualReconstructionBlueprint.js';
export {
  matchRepositoryComponents,
  matchRepositoryAssets,
  buildDefaultSite00RepositoryCatalog,
  preferCanonicalOverReplacement,
} from './matching/RepositoryComponentMatcher.js';
export { evaluateTypographyForRegions, typographyMatchScore } from './typography/TypographyReferenceEvaluation.js';
export { evaluateResponsiveInference } from './responsive/ResponsiveInferenceEvaluation.js';
export { renderControlledReference } from './render/ControlledReferenceRenderer.js';
export { compareRenderedReference, overallScoreCannotHideRegionFailure } from './compare/RenderedReferenceComparison.js';
export { generateVisualDifferenceHeatmap } from './compare/VisualDifferenceHeatmap.js';
export {
  createInitialRegionLocks,
  updateRegionLocksFromScores,
  isRegionLocked,
  detectLockedRegionRegression,
  lockedRegionIds,
} from './locks/VisualRegionLock.js';
export { buildVisualCorrectionPlan, evaluateCorrectionScope } from './correction/VisualCorrectionPlan.js';
export { evaluateConvergence, shouldStopForPlateau, scoreFromComparison } from './correction/ReconstructionConvergenceGuard.js';
export { evaluateReferenceMatchReadiness } from './readiness/ReferenceMatchReadinessEvaluation.js';
export { buildVisualReconstructionReport } from './report/VisualReconstructionReport.js';
export { createReferenceVisualRegressionBaseline, baselineReadyForAudit } from './baseline/ReferenceVisualRegressionBaseline.js';
export { runVisualReconstructionLoop } from './loop/VisualReconstructionLoop.js';
export type { RunVisualReconstructionLoopInput } from './loop/VisualReconstructionLoop.js';
