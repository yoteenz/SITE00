/**
 * P0.VR.5 — Founder instruction intelligence + multi-asset deconstruction pipeline.
 */

export { P0_VR_5_LINEAGE, P0_VR_5_FEATURE_LABEL } from './constants.js';
export type {
  AssetJob,
  AssetJobPlanSummary,
  AssetJobStatus,
  AssetJobType,
  BackgroundPolicy,
  BoundingBox,
  CandidateClassification,
  DesignInstructionPreset,
  DetectedAssetCandidate,
  DetectionOrderingRule,
  FounderCropDecision,
  JobCostRiskLevel,
  JobEvent,
  JobWorkflowStep,
  ParsedFounderInstruction,
  ReconstructedAssetVersion,
  ReplacementMapping,
  ReplacementSlot,
  ReplacementSlotMatchingMode,
  SourceUploadRecord,
} from './types.js';

export {
  BUILT_IN_PRESET_IDS,
  GENERATION_PROVIDER_PLAN,
  LOW_CONFIDENCE_THRESHOLD,
  HIGH_CONFIDENCE_THRESHOLD,
  DEFAULT_SOURCE_DIMENSIONS,
} from './constants.js';

export { parseFounderInstruction, instructionMatchesPreset } from './instructionParser.js';

export {
  BUILT_IN_INSTRUCTION_PRESETS,
  listAllPresets,
  getPresetById,
  applyInstructionPreset,
  saveDesignInstructionPreset,
  suggestInstructionPresets,
  recordPresetUsageFromJob,
  clearLearnedPresetsForTest,
} from './presetStore.js';

export {
  detectAssetCandidates,
  detectRegionsForIntent,
  isLowConfidenceRegion,
  isHighConfidenceRegion,
  mergeCandidateRegions,
  splitCandidateRegion,
} from './assetCandidateDetection.js';

export { summarizeAssetJobPlan, buildJobFromInstruction, computeCostRiskLevel } from './jobPlan.js';

export {
  createAssetJob,
  getAssetJob,
  listAssetJobs,
  addSourceUpload,
  updateJobInstruction,
  runJobDetection,
  updateJobCandidates,
  markJobStatus,
  incrementJobDispatch,
  getJobEvents,
  clearAssetJobStoreForTest,
  parseInstructionForJob,
} from './jobStore.js';

export {
  applyCropConfirmationActions,
  confirmAssetCrops,
  canBeginGeneration,
  countUnconfirmedRegions,
} from './cropConfirmation.js';
export type { CropConfirmationAction, CropConfirmationResult } from './cropConfirmation.js';

export {
  buildReplacementMappingFromJob,
  mapCandidateToSlot,
  replacementTargetsForJob,
  validateReplacementReadiness,
} from './replacementMapping.js';

export {
  reconstructConfirmedAssets,
  approveReconstructedVersion,
  uploadReconstructedAssets,
  bindReconstructedAssets,
  removeBackgroundIfNeeded,
  cachePreviousAttempt,
} from './orchestration.js';
export type { ReconstructionOrchestrationResult } from './orchestration.js';

export {
  uploadNeverTriggersGeneration,
  noAutoRetrySpirals,
  maxOnePrimaryDispatchPerAssetVersion,
  blockGenerationWithoutCropApproval,
  blockPartialMultiAssetRun,
  estimateDispatchCount,
  providerDispatchOnUpload,
  providerDispatchOnDetect,
} from './spendGuard.js';
