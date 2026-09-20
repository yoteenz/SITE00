import type { WorkspaceConceptSlotId } from './types.js';

/** CGPT — one creative contextual direction per invocation. */
export type WorkspaceCreativeDirection = {
  directionId: string;
  conceptSlot: WorkspaceConceptSlotId;
  creativeIntent: string;
  designProblem: string;
  opportunity: string;
  hierarchyPriority: string;
  spatialDirection: string;
  informationDensityDirection: string;
  imageDataBalance: string;
  mobileDirection: string;
  desktopDirection: string;
  immutableFunctionContractId: string;
  cgptProvider: string;
  cgptModel: string;
};

/** GPT2 — exactly one concept brief per invocation (never an array). */
export type WorkspaceSingleConceptBrief = {
  gpt2ConceptId: string;
  conceptId: WorkspaceConceptSlotId;
  conceptSlot: WorkspaceConceptSlotId;
  directionId: string;
  name: string;
  premise: string;
  visualSystem: string;
  layoutStrategy: string;
  hierarchyStrategy: string;
  panelStrategy: string;
  imageDataRelationship: string;
  responsiveStrategy: string;
  mobileComposition: string;
  desktopComposition: string;
  preservedFunctions: readonly string[];
  prohibitedChanges: readonly string[];
  gpt2Provider: string;
  gpt2Model: string;
};

export type WorkspaceDiversityLedgerEntry = {
  conceptSlot: WorkspaceConceptSlotId;
  name: string;
  spatialDirection: string;
  hierarchyPriority: string;
};

export type WorkspaceConceptPipelineSlot = {
  conceptSlot: WorkspaceConceptSlotId;
  direction: WorkspaceCreativeDirection | null;
  concept: WorkspaceSingleConceptBrief | null;
  directionError?: string;
  conceptError?: string;
};

export type WorkspaceSelfCreativePipelineSet = {
  pipelineSetId: string;
  targetId: string;
  captureSetId: string;
  functionContractId: string;
  slots: readonly WorkspaceConceptPipelineSlot[];
  createdAt: string;
};

export type WorkspaceCreativeStageFailure =
  | 'CGPT_DIRECTION_FAILED'
  | 'GPT2_CONCEPT_FAILED'
  | 'NBP_MOBILE_FAILED'
  | 'NBP_DESKTOP_FAILED';
