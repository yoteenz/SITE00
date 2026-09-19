/** P0.VR.4R1 — Live reconstruction + auto-bind exports. */
export { P0_VR_4R1_LINEAGE } from './types.js';
export type {
  GenerationReceipt,
  BackgroundRemovalReceipt,
  MaterialPreservationQA,
  LiveBindingSlotRecord,
  GoldenAcceptanceConditions,
  LiveAcceptanceResult,
} from './types.js';
export { checkFalProviderHealth } from './liveFalProvider.js';
export type { FalProviderHealth } from './liveFalProvider.js';
export {
  buildProjectsHeaderPlanetPrompt,
  isProjectsHeaderPlanetAsset,
  PROJECTS_HEADER_PLANET_PROMPT_VERSION,
} from './projectsHeaderPlanetPrompt.js';
export {
  PROJECTS_HEADER_PLANET_CROP,
  PROJECTS_INDEX_APPROVED_REFERENCE_PATH,
} from './browserConstants.js';
export { evaluateMaterialPreservationQA } from './materialPreservationQA.js';
export {
  getLiveBindingSlot,
  getProjectsHeaderPlanetBinding,
  applyLiveBindingSlot,
  loadLiveBindingsFromRepo,
  saveLiveBindingsToRepo,
  projectsHeaderBindingUsesCanonicalSource,
  PROJECTS_HEADER_PLANET_SLOT_ID,
  LIVE_BINDINGS_REGISTRY_PATH,
  clearLiveBindingStoreForTest,
} from './liveBindingStore.js';
export { runLiveProjectsHeaderPlanetAcceptance } from './liveAcceptancePipeline.js';
