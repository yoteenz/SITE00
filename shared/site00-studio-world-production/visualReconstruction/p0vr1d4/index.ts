/**
 * P0.VR.1D.4 — Founder board persistence + region ID alignment + actionable DOM patch execution.
 */

export * from './types.js';
export * from './constants.js';
export {
  normalizeReferenceRegionId,
  canonicalRegionIdsForScreen,
} from './normalizeReferenceRegionId.js';
export {
  buildReferenceDomRegionMap,
  resolveDomMeasurementForCanonicalRegion,
} from './referenceDomRegionMap.js';
export {
  VISUAL_RECONSTRUCTION_COMPONENT_REGISTRY,
  registryEntryForCanonicalRegion,
  visualReconstructionComponentRegistryImplemented,
} from './visualReconstructionComponentRegistry.js';
export type { VisualReconstructionComponentRegistryEntry } from './visualReconstructionComponentRegistry.js';
export {
  buildMappedReferenceDomDelta,
  mappedReferenceDomDeltaNonempty,
  largestMappedDelta,
} from './buildMappedReferenceDomDelta.js';
export {
  compileActionableCodePatches,
  actionablePatchCountWhenDriftExists,
  patchesResolveToComponentOrStyleTarget,
} from './compileActionableCodePatches.js';
export {
  applyCodePatchInstructions,
  patchesExecutedInCode,
} from './applyCodePatchInstructions.js';
export type { ApplyCodePatchInstructionsInput } from './applyCodePatchInstructions.js';
export {
  buildFounderVisualBoardReferences,
  failFounderReferenceMissing,
  actualFounderBoardPersisted,
  FAIL_FOUNDER_REFERENCE_MISSING,
} from './founderVisualBoardReference.js';
export {
  persistFounderVisualBoards,
} from './persistFounderVisualBoards.js';
export type {
  PersistFounderVisualBoardsInput,
  PersistFounderVisualBoardsResult,
} from './persistFounderVisualBoards.js';
export {
  updateRegionLocksFromMappedDomDelta,
  regionLockRequiresRealMeasurement,
  FAIL_REGION_LOCK_WITHOUT_MEASUREMENT,
} from './implementationRegionLockAligned.js';
export {
  runNdxProjectHubAlignedLiveReconstruction,
} from './runNdxProjectHubAlignedLiveReconstruction.js';
export type { RunNdxProjectHubAlignedLiveReconstructionInput } from './runNdxProjectHubAlignedLiveReconstruction.js';
