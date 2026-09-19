/** Browser-safe P0.VR.2A exports for Design workspace UI. */
export {
  P0_VR_2A_LINEAGE,
  P0_VR_2A_FAILURE_CODES,
  DESIGN_WORKSPACE_DEEP_LINK,
} from './constants.js';
export type {
  ReferenceVisualAssetSlot,
  AssetGenerationStatus,
  AssetSlotContract,
  CompiledReferenceAssetPrompt,
  MissingAssetsSummary,
  ReferenceAssetRole,
} from './types.js';
export {
  formatSlotDisplay,
  slotGeometryLocked,
} from './slotGeometry.js';
export {
  listSlotsForScreen,
  summarizeMissingAssets,
  getReferenceVisualAssetSlot,
} from './referenceVisualAssetSlotRegistry.js';
export {
  prepareSlotForGeneration,
  dispatchAssetGeneration,
  dispatchAllReadyToGenerate,
  promoteAssetToCanon,
  regenerateAsset,
  getCompiledPrompt,
  shellReconstructionBlockedOnAssetGeneration,
} from './assetGenerationPipeline.js';
export { buildAssetSlotContracts, extendComposerBriefWithAssetSlots } from './composerBriefAssetSlots.js';
export { ensureNdxPilotAssetSlots, resetNdxPilotAssetSlotsForTest } from './ndxPilotAssetSlots.js';
export {
  listDesignAssetNotifications,
  notificationDeepLinksToDesignWorkspace,
} from './assetNotifications.js';
export { compileReferenceAssetPrompt } from './referenceAssetPromptCompiler.js';
export { buildReferenceAssetBrief } from './referenceAssetBrief.js';
