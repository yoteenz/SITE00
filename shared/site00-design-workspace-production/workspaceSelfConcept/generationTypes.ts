import type { WorkspaceConceptSlotId } from './types.js';
import type { WorkspaceSelfCreativePipelineSet } from './creativePipelineTypes.js';

export type WorkspaceSelfGenerationStatus =
  | 'IDLE'
  | 'PLANNED'
  | 'CREATIVE_BRIEF_RUNNING'
  | 'NBP_RUNNING'
  | 'BLOCKED_NO_CAPTURE'
  | 'BLOCKED_NO_FUNCTION_CONTRACT'
  | 'CREATIVE_BRIEF_FAILED'
  | 'NBP_AUTH_FAILED'
  | 'NBP_JOB_FAILED'
  | 'PARTIAL_GENERATION'
  | 'READY_FOR_REVIEW';

/** @deprecated Use WorkspaceSingleConceptBrief — kept for migration reads */
export type WorkspaceSelfTerritoryBrief = {
  territoryId: string;
  conceptSlotId: WorkspaceConceptSlotId;
  name: string;
  premise: string;
  spatialPhilosophy: string;
  hierarchyStrategy: string;
  layoutStrategy: string;
  imageDataBalance: string;
  mobileStrategy: string;
  desktopStrategy: string;
  visualDirection: string;
};

export type WorkspaceSelfNbpJobStatus = 'PENDING' | 'RUNNING' | 'READY' | 'FAILED';

export type WorkspaceSelfGeneratedArtifact = {
  artifactId: string;
  conceptId: WorkspaceConceptSlotId;
  territoryId: string;
  viewport: 'MOBILE' | 'DESKTOP';
  captureSetId: string;
  functionContractId: string;
  creativeBriefSetId: string;
  creativeDirectionId: string;
  gpt2ConceptId: string;
  provider: 'NBP';
  model: string;
  providerJobId: string | null;
  promptVersion: string;
  createdAt: string;
  status: WorkspaceSelfNbpJobStatus;
  artifactPath: string | null;
  imageUri: string | null;
  width: number;
  height: number;
  failureReason?: string;
};

export type WorkspaceSelfConceptSet = {
  conceptSetId: string;
  targetId: string;
  captureSetId: string;
  functionContractId: string;
  creativeBriefSetId: string;
  conceptA: WorkspaceConceptSlotId;
  conceptB: WorkspaceConceptSlotId;
  conceptC: WorkspaceConceptSlotId;
  status: WorkspaceSelfGenerationStatus;
  createdAt: string;
  createdBy: string;
};

export type WorkspaceSelfGenerationRunResult = {
  plan: WorkspaceSelfGenerationPlan;
  pipelineSet: WorkspaceSelfCreativePipelineSet;
  jobs: readonly WorkspaceSelfGeneratedArtifact[];
};

export type WorkspaceSelfGenerationPlan = {
  targetId: string;
  targetType: 'WORKSPACE_SELF';
  targetLabel: string;
  conceptCount: 3;
  outputCount: 6;
  cgptCalls: 3;
  gpt2Calls: 3;
  nbpJobs: 6;
  viewports: readonly ['MOBILE', 'DESKTOP'];
  creativeLayer: 'CGPT + GPT2';
  renderer: 'NBP';
  captureSetId: string;
  functionContractId: string;
  functionContractVersion: string;
  nbpModel: string;
  nbpPromptVersion: string;
  estimatedCostNote: string;
};
