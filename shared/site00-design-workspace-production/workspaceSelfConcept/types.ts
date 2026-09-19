/**
 * WORKSPACE_SELF staged concept workflow — fixture-backed; no provider invoke.
 */

import type { DesignTargetType } from '../designTargetModel.js';

export type WorkspaceViewport = 'MOBILE' | 'DESKTOP' | 'TABLET';

export type WorkspaceSelfCapture = {
  captureId: string;
  targetId: string;
  viewport: WorkspaceViewport;
  route: string;
  build: string;
  artifactPath: string | null;
  timestamp: string;
  createdBy: string;
};

export type WorkspaceFunctionContract = {
  contractId: string;
  targetId: string;
  version: string;
  routes: readonly string[];
  regions: readonly string[];
  interactions: readonly string[];
  states: readonly string[];
  immutableBehaviors: readonly string[];
  responsiveRequirements: readonly string[];
  createdAt: string;
};

export type WorkspaceConceptSlotId = 'CONCEPT_A' | 'CONCEPT_B' | 'CONCEPT_C';

export type WorkspaceConceptCandidateStatus =
  | 'EMPTY'
  | 'STAGED'
  | 'SELECTED_MOBILE'
  | 'SELECTED_DESKTOP'
  | 'PROMOTED_MOBILE'
  | 'PROMOTED_DESKTOP'
  | 'ARCHIVED';

export type WorkspaceConceptCandidate = {
  conceptId: WorkspaceConceptSlotId;
  targetId: string;
  conceptName: string;
  conceptTerritory: string;
  rationale: string;
  mobileArtifactPath: string | null;
  desktopArtifactPath: string | null;
  visualStrategy: string;
  layoutStrategy: string;
  informationHierarchyStrategy: string;
  responsiveStrategy: string;
  functionContractId: string | null;
  createdAt: string | null;
  status: WorkspaceConceptCandidateStatus;
};

export type WorkspaceConceptGenerationPackageStatus = 'DRAFT' | 'READY_FOR_NBP' | 'GENERATION_REQUESTED';

export type WorkspaceConceptGenerationPackage = {
  packageId: string;
  targetId: string;
  currentMobileCaptureId: string | null;
  currentDesktopCaptureId: string | null;
  functionContractId: string;
  hostDesignSystemVersion: string;
  workspaceArchitectureVersion: string;
  generationCount: 3;
  status: WorkspaceConceptGenerationPackageStatus;
  createdAt: string;
};

export type WorkspaceSelfAuthorityPair = {
  authorityPairId: string;
  targetId: string;
  mobileConceptId: WorkspaceConceptSlotId;
  desktopConceptId: WorkspaceConceptSlotId;
  mobileArtifact: string | null;
  desktopArtifact: string | null;
  functionContractId: string;
  status: 'LOCKED';
  lockedAt: string;
  lockedBy: string;
};

export type OpusDesignShellPackageStatus = 'DRAFT' | 'REQUESTED' | 'STAGED' | 'APPROVED';

export type OpusDesignShellPackage = {
  packageId: string;
  targetId: string;
  authorityPairId: string;
  functionContractId: string;
  allowedMutationScope: readonly string[];
  forbiddenMutationScope: readonly string[];
  status: OpusDesignShellPackageStatus;
  shellArtifactLabel: string | null;
  createdAt: string;
};

export type ComposerWorkspaceHandoffStatus = 'DRAFT' | 'READY' | 'IMPLEMENTATION_STARTED' | 'IMPLEMENTATION_READY';

export type ComposerWorkspaceHandoffPackage = {
  packageId: string;
  targetId: string;
  approvedOpusShellPackageId: string;
  functionContractId: string;
  status: ComposerWorkspaceHandoffStatus;
  createdAt: string;
};

export type WorkspaceSelfWorkflowState = {
  targetId: string;
  targetType: DesignTargetType;
  captures: readonly WorkspaceSelfCapture[];
  functionContract: WorkspaceFunctionContract | null;
  nbpPackage: WorkspaceConceptGenerationPackage | null;
  concepts: readonly WorkspaceConceptCandidate[];
  preferredMobileConceptId: WorkspaceConceptSlotId | null;
  preferredDesktopConceptId: WorkspaceConceptSlotId | null;
  promotedMobileConceptId: WorkspaceConceptSlotId | null;
  promotedDesktopConceptId: WorkspaceConceptSlotId | null;
  pairReviewOpenedAt: string | null;
  pairReviewCompletedAt: string | null;
  authorityPair: WorkspaceSelfAuthorityPair | null;
  opusShellPackage: OpusDesignShellPackage | null;
  composerHandoff: ComposerWorkspaceHandoffPackage | null;
  productionMutationLocked: true;
  history: readonly { type: string; at: string; summary: string }[];
};
