/** P0.VR.4R1 — Browser-safe exports only (no Node/FAL/sharp). */
export { P0_VR_4R1_LINEAGE, LIVE_ACCEPTANCE_FAILURE_CLASSES } from './types.js';
export type {
  GenerationReceipt,
  BackgroundRemovalReceipt,
  MaterialPreservationQA,
  LiveBindingSlotRecord,
  GoldenAcceptanceConditions,
  LiveAcceptanceResult,
  LiveAcceptanceFailureClass,
} from './types.js';
export {
  buildProjectsHeaderPlanetPrompt,
  isProjectsHeaderPlanetAsset,
  PROJECTS_HEADER_PLANET_PROMPT_VERSION,
} from './projectsHeaderPlanetPrompt.js';
export {
  PROJECTS_HEADER_PLANET_SLOT_ID,
  LIVE_BINDINGS_REGISTRY_PATH,
  PROJECTS_HEADER_PLANET_CROP,
  PROJECTS_INDEX_APPROVED_REFERENCE_PATH,
} from './browserConstants.js';
