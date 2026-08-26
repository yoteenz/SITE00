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

export {
  evaluateReferencePalette,
  evaluateWorkspaceLuminosity,
  evaluateBrandAccentAuthority,
  evaluateHostClientVisualAuthority,
  evaluateArtworkAuthority,
  evaluateContainerRepetition,
  evaluateSpatialRhythm,
  evaluateDesignGrammarMatch,
  evaluateBrandEssenceMatch,
  evaluateCompositionalSimilarity,
  evaluateFocalHierarchy,
  evaluateTypographicCharacterMatch,
  evaluateSurfaceGrammar,
  buildRelationalAlignmentGraph,
  generateDesignDisconnectHeatmap,
} from './evaluation/designEvaluationSuite.js';
export { DESIGN_GRAMMAR_FAILURES } from './evaluation/designGrammarFailures.js';
export type { DesignGrammarFailureCode } from './evaluation/designGrammarFailures.js';
export { DEFAULT_EVALUATION_WEIGHTS, weightedScore } from './evaluation/referenceEvaluationWeights.js';
export type { ReferenceEvaluationWeights } from './evaluation/referenceEvaluationWeights.js';
export {
  createFounderPerceptualEvaluation,
  recordFounderPerceptualEvaluation,
} from './evaluation/founderPerceptualEvaluation.js';
export {
  evaluateReferenceMatchReadinessV2,
  pixelScoreCannotOverrideDesignFailure,
} from './readiness/ReferenceMatchReadinessEvaluationV2.js';
export {
  NDX_MODULE_RESPONSIVE_BEHAVIORS,
  evaluateResponsiveRelationship,
  buildVisualReferenceSetFromFounderBoards,
} from './responsive/ResponsiveRelationshipModel.js';
export type { ResponsiveRelationship, ModuleResponsiveBehavior } from './responsive/ResponsiveRelationshipModel.js';
export { runFounderReferenceCalibration } from './calibration/runCalibration.js';
export type { RunCalibrationInput, CalibrationRunResult } from './calibration/runCalibration.js';
export {
  diagnoseCurrentImplementation,
  diagnoseP0VR1ExperimentsHubRegression,
} from './calibration/forensicDiagnosis.js';
export { regionLockRequiresDesignFidelity } from './locks/VisualRegionLock.js';
export {
  evaluateProjectPresenceDiamond,
  adaptiveDiamondIsNotHostMutation,
} from '../projectPresenceAccent/ProjectPresenceVisualReconstruction.js';
export type {
  ProjectPresenceAccent,
  ProjectPresenceAccentSource,
  VisualAuthorityClass,
} from '../projectPresenceAccent/types.js';
export {
  resolveProjectPresenceAccent,
  extractProjectSlugFromPathname,
} from '../projectPresenceAccent/ProjectPresenceAccentResolver.js';

export * from './p0vr1d/index.js';
export * from './p0vr1d1/index.js';
export * from './p0vr1d2/index.js';
export * from './p0vr1d7/index.js';
export * from './p0vr1d9/index.js';
export * from './p0vr1d10/index.js';
export * from './p0vr1d11/index.js';
export {
  P0_VR_2_LINEAGE,
  DESIGN_WORKSPACE_ROUTES,
  CANONICAL_VIEWPORT_DIMENSIONS,
} from './p0vr2/constants.js';
export type {
  CanonicalVisualReference,
  DesignViewportClass,
  FunctionPreservingVisualRebuildContract,
  VisualReconstructionComposerBrief,
} from './p0vr2/types.js';
