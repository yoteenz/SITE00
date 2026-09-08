/** Browser-safe P0.VR.4 exports. */
export {
  P0_VR_4_LINEAGE,
  REFERENCE_ASSET_RECONSTRUCTION_FEATURE_LABEL,
  REFERENCE_ASSET_RECONSTRUCTION_ALT_LABELS,
  DEFAULT_RECONSTRUCTION_MODEL,
  PROJECTS_GOLDEN_TEST,
  PROJECTS_BULK_QUEUE_SEEDS,
  MAX_PRIMARY_GENERATION_DISPATCHES,
  MAX_TARGETED_REVISION_PASSES,
} from './constants.js';
export type {
  DesignReconstructionAsset,
  DesignReconstructionAssetType,
  ReconstructionAssetStatus,
  DetectedAssetRegion,
  BulkQueueItem,
  DesignAssetBinding,
  FounderJudgment,
  SystemInspectorLineage,
  ApprovedScreenshotSource,
} from './types.js';
export {
  detectDesignAssets,
  filterReconstructableRegions,
  shouldAutoGenerate,
  markRegionAsLiveUi,
  markRegionIgnored,
  adjustRegionBounds,
  isLiveUiClassification,
} from './assetDetection.js';
export { buildReferenceCrop, isValidReferenceCrop } from './referenceCrop.js';
export { classifyReconstructionAsset, inferLiveUiRole } from './classification.js';
export {
  buildCanonicalReconstructionPrompt,
  buildTypeSpecificPromptVariant,
  promptIncludesNoBackgroundInstruction,
} from './reconstructionPrompts.js';
export { validateTransparency, backgroundRemovalRequired } from './transparencyValidation.js';
export {
  discoverBackgroundRemovalProviders,
  resolveBackgroundRemovalProvider,
  ideogramProviderSupported,
  pixelcutProviderSupported,
  ideogramDoesNotFabricateEndpoint,
  DEFAULT_BACKGROUND_REMOVAL_FALLBACK_ORDER,
} from './backgroundRemovalProvider.js';
export type { BackgroundRemovalProviderId } from './backgroundRemovalProvider.js';
export { discoverAllProviderCapabilities } from './providerDiscovery.js';
export { evaluateAssetReconstructionQA, qaDomainsExist } from './assetReconstructionQA.js';
export { buildRevisionFromQA } from './targetedRevision.js';
export {
  buildBulkPageQueue,
  groupAssetsByStatus,
  formatQueueLabel,
  bulkQueueDoesNotAutoDispatch,
} from './bulkPageQueue.js';
export {
  getReconstructionAsset,
  listReconstructionAssets,
  clearReconstructionAssetStoreForTest,
} from './assetStore.js';
export {
  detectAndRegisterAssets,
  dispatchReconstructionGeneration,
  buildReconstructionFalInput,
  gptImage2EditSupported,
  referenceImagePassedToEditPath,
  persistApprovedAssetToSupabase,
  applyAssetToLivePage,
} from './reconstructionPipeline.js';
export { approveAssetLoveIt, founderApprovalGatePassed } from './founderApproval.js';
export {
  unapprovedAssetCannotAutoBind,
  canBindAsset,
  createDesignAssetBinding,
} from './liveBinding.js';
export { buildSystemInspectorLineage, systemInspectorExposesLineage } from './systemInspector.js';
export { runProjectsRedPlanetGoldenTest, buildProjectsGoldenScreenshotSource } from './projectsGoldenTest.js';
export {
  DESIGN_RECONSTRUCTION_PRINCIPLES,
  applyCorrectionLearning,
  isOverfitCorrection,
  listLearnedCorrections,
} from './principles.js';
export {
  requiresExplicitFounderDispatch,
  bulkQueueAutoDispatchOnPageLoad,
  providerDispatchOnGet,
  providerDispatchOnRefresh,
  providerDispatchOnOpenPage,
  providerDispatchOnSelectScreenshot,
  canDispatchPrimaryGeneration,
} from './spendGuard.js';
export { classifyImageVsUi, shouldExcludeFromReconstruction } from './imageVsLiveUiGuard.js';
export {
  createRegistryEntryFromApproval,
  listDesignAssetRegistry,
  clearDesignAssetRegistryForTest,
} from './designAssetRegistry.js';
export {
  isTemporaryProviderUrl,
  assertCanonicalLiveSource,
  buildDesignAssetStoragePath,
} from './supabaseStorage.js';
export {
  evaluateContextQA,
  contextQaDomainsExist,
  liveRouteScreenshotVerificationRequired,
} from './contextQA.js';
