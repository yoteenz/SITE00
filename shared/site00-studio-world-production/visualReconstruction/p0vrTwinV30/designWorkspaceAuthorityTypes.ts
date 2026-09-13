/** P0.VR.TWINV3.0R5 — viewport master + authority pair models. */

import type { PROJECT_CREATIVE_CONTEXT_VERSION } from './projectCreativeGrounding/types.js';
import type { DesignPageV3TerritoryId } from './hostProjectExpressionModel.js';

export type DesignWorkspaceViewport = 'MOBILE' | 'DESKTOP';

export type ConceptCandidateAuthorityState =
  | 'GENERATED'
  | 'NOT_SELECTED'
  | 'SELECTED'
  | 'PROMOTED'
  | 'SUPERSEDED'
  | 'REJECTED';

export type ViewportMasterAuthorityStatus = 'PROMOTED' | 'PAIR_LOCKED' | 'SUPERSEDED';

export type ViewportMasterAuthority = {
  id: string;
  projectId: string;
  workspaceType: 'DESIGN_PAGE_V3';
  viewport: DesignWorkspaceViewport;
  sourceConceptCandidateId: string;
  sourceGenerationId: number;
  sourceTerritoryId: DesignPageV3TerritoryId;
  authorityImageId: string;
  authorityImageHash: string;
  authorityImageUri: string;
  projectCreativeContextVersion: typeof PROJECT_CREATIVE_CONTEXT_VERSION | string;
  designWorkspaceFeatureManifestVersion: string;
  groundingManifestId: string | null;
  lineageId: string;
  promotedBy: string;
  promotedAt: string;
  status: ViewportMasterAuthorityStatus;
  version: number;
  supersedesAuthorityId: string | null;
  immutableAfterPairLock: boolean;
};

export type DesignWorkspaceAuthorityPairStatus =
  | 'DRAFT'
  | 'MOBILE_ONLY'
  | 'DESKTOP_ONLY'
  | 'PAIR_READY'
  | 'PAIR_LOCKED'
  | 'DERIVATION_READY'
  | 'DERIVATION_IN_PROGRESS'
  | 'DERIVATION_COMPLETE'
  | 'SUPERSEDED';

export type DesignWorkspaceAuthorityPairDerivationStatus =
  | 'NOT_STARTED'
  | 'BLOCKED'
  | 'READY'
  | 'IN_PROGRESS'
  | 'COMPLETE'
  | 'STALE';

export type DesignWorkspaceAuthorityPair = {
  id: string;
  projectId: string;
  workspaceType: 'DESIGN_PAGE_V3';
  mobileAuthorityId: string;
  desktopAuthorityId: string;
  pairVersion: number;
  status: DesignWorkspaceAuthorityPairStatus;
  createdAt: string;
  lockedAt: string | null;
  lockedBy: string | null;
  projectCreativeContextVersion: typeof PROJECT_CREATIVE_CONTEXT_VERSION | string;
  pairChecksum: string;
  supersedesPairId: string | null;
  derivationStatus: DesignWorkspaceAuthorityPairDerivationStatus;
};

export type ViewportCandidateRef = {
  territoryId: DesignPageV3TerritoryId;
  candidateId: string;
};

export type AuthorityPipelineEventType =
  | 'VIEWPORT_SELECTED'
  | 'VIEWPORT_UNSELECTED'
  | 'VIEWPORT_MASTER_PROMOTED'
  | 'VIEWPORT_MASTER_SUPERSEDED'
  | 'PAIR_LOCKED'
  | 'PAIR_SUPERSEDED'
  | 'DERIVATION_MARKED_STALE';

export type AuthorityPipelineEvent = {
  id: string;
  type: AuthorityPipelineEventType;
  at: string;
  viewport?: DesignWorkspaceViewport;
  candidateId?: string;
  territoryId?: DesignPageV3TerritoryId;
  authorityId?: string;
  pairId?: string;
  note?: string;
};

export type DesignWorkspaceAuthorityPipelineState = {
  workspaceType: 'DESIGN_PAGE_V3';
  viewportSelection: {
    mobile: ViewportCandidateRef | null;
    desktop: ViewportCandidateRef | null;
  };
  mobileMaster: ViewportMasterAuthority | null;
  desktopMaster: ViewportMasterAuthority | null;
  authorityPair: DesignWorkspaceAuthorityPair | null;
  supersededPairs: DesignWorkspaceAuthorityPair[];
  supersededMasters: ViewportMasterAuthority[];
  candidateViewportStates: Record<
    string,
    { mobile: ConceptCandidateAuthorityState; desktop: ConceptCandidateAuthorityState }
  >;
  events: AuthorityPipelineEvent[];
  executionIntent: 'CREATIVE' | 'TRANSLATION';
  inventionBudget: 'FULL' | 'NONE';
};
