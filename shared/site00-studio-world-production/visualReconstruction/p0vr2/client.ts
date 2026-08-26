/** Browser-safe P0.VR.2 exports for Design workspace UI. */
export {
  DESIGN_WORKSPACE_ROUTES,
  CANONICAL_VIEWPORT_DIMENSIONS,
  P0_VR_2_LINEAGE,
  P0_VR_2_FAILURE_CODES,
  VISUAL_AUTHORITY_ORDER,
  PARENT_GEOMETRY_FIRST_ORDER,
  DESIGN_WORKSPACE_PROJECTS,
} from './constants.js';
export type {
  CanonicalVisualReference,
  DesignViewportClass,
  DesignScreenMatrixRow,
  DesignWorkspaceSelection,
  ImplementationMatchStatus,
  ReconstructionPassState,
  VisualReconstructionComposerBrief,
  FunctionPreservingVisualRebuildContract,
} from './types.js';
export {
  createDefaultFunctionPreservingVisualRebuildContract,
  functionalPreservationIntact,
  visualReplacementAllowed,
} from './functionPreservingVisualRebuildContract.js';
export {
  proposeReferenceScope,
  founderScopeOverrideAllowed,
} from './scopeClassification.js';
export {
  getActiveCanonicalReference,
  createDraftReferenceFromUpload,
  promoteReferenceToCanonical,
  listCanonicalReferences,
} from './canonicalReferenceRegistry.js';
export {
  listDesignScreensForProject,
  resolveDesignScreenRoute,
  findDesignScreen,
} from './designScreenRegistry.js';
export {
  buildDesignScreenMatrix,
  formatMatrixCell,
} from './designScreenMatrix.js';
export {
  startVisualReconstructionRun,
  compileScopedDesignImplementationBundle,
} from './visualReconstructionRun.js';
export {
  buildVisualReconstructionComposerBrief,
  composerBriefIncludesActualReference,
} from './visualReconstructionComposerBrief.js';
export { registerNdxbookDesignPilot } from './ndxPilotRegistration.js';
