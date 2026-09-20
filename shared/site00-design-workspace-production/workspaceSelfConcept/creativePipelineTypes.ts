import type { WorkspaceConceptSlotId } from './types.js';

export type WorkspaceSelfPipelineSchemaVersion =
  | 'LEGACY_MULTI_CONCEPT'
  | 'SINGLE_CONCEPT_MULTI_RENDITION';

/** CGPT — one creative context package per generation run. */
export type WorkspaceCreativeContext = {
  creativeContextId: string;
  targetId: string;
  captureSetId: string;
  functionContractId: string;
  identityContext: string;
  pageOrWorkspacePurpose: string;
  requiredContent: string;
  functionalRequirements: string;
  visualProblems: string;
  hierarchyPriorities: string;
  creativeLatitude: string;
  visualDirection: string;
  spatialDirection: string;
  responsiveDirection: string;
  immutableRules: readonly string[];
  createdAt: string;
  cgptProvider: string;
  cgptModel: string;
};

/** GPT2 — one authority concept per generation run (canonical upstream visual). */
export type WorkspaceGPT2AuthorityConcept = {
  conceptId: string;
  creativeContextId: string;
  targetId: string;
  name: string;
  premise: string;
  compositionStrategy: string;
  hierarchyStrategy: string;
  interactionPresentation: string;
  visualLanguage: string;
  responsiveIntent: string;
  authorityImage: string | null;
  layoutStrategy: string;
  mobileComposition: string;
  desktopComposition: string;
  preservedFunctions: readonly string[];
  prohibitedChanges: readonly string[];
  gpt2Provider: string;
  gpt2Model: string;
  createdAt: string;
};

export type WorkspaceConceptRendition = {
  renditionId: string;
  conceptSetId: string;
  slot: WorkspaceConceptSlotId;
  sourceGpt2ConceptId: string;
  mobileArtifactId: string | null;
  desktopArtifactId: string | null;
  status: 'PENDING' | 'PARTIAL' | 'READY' | 'FAILED';
  renditionDirective: string;
};

/** @deprecated LEGACY_MULTI_CONCEPT — per-slot CGPT direction */
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

/** @deprecated LEGACY_MULTI_CONCEPT — per-slot GPT2 brief */
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

/** @deprecated LEGACY_MULTI_CONCEPT */
export type WorkspaceDiversityLedgerEntry = {
  conceptSlot: WorkspaceConceptSlotId;
  name: string;
  spatialDirection: string;
  hierarchyPriority: string;
};

/** @deprecated LEGACY_MULTI_CONCEPT */
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
  schemaVersion: WorkspaceSelfPipelineSchemaVersion;
  creativeContext: WorkspaceCreativeContext | null;
  gpt2AuthorityConcept: WorkspaceGPT2AuthorityConcept | null;
  renditions: readonly WorkspaceConceptRendition[];
  /** @deprecated LEGACY_MULTI_CONCEPT only */
  slots?: readonly WorkspaceConceptPipelineSlot[];
  creativeContextError?: string;
  gpt2AuthorityError?: string;
  createdAt: string;
};

export type WorkspaceCreativeStageFailure =
  | 'CGPT_CONTEXT_FAILED'
  | 'GPT2_AUTHORITY_FAILED'
  | 'NBP_MOBILE_FAILED'
  | 'NBP_DESKTOP_FAILED';
