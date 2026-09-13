import type { ActiveProjectExpressionContract } from './activeProjectExpressionContract.js';
import type {
  DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP,
  DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE,
  DESIGN_PAGE_V3_CANONICAL_PATH,
  DESIGN_PAGE_V3_SKELETON_AREAS,
  DESIGN_PAGE_V3_WORKFLOW_PHASES,
  P0_VR_TWIN_V30R5_LINEAGE,
  P0_VR_TWIN_V30_BUILD,
} from './constants.js';
import type { DesignWorkspaceAuthorityPipelineState } from './designWorkspaceAuthorityTypes.js';
import type { DesignPageAuthoritySelfCheck } from './designPageAuthoritySelfCheck.js';
import type { DesignPageAuthorityR3SelfCheck } from './designPageAuthorityR3SelfCheck.js';
import type { DesignPageAuthorityR4SelfCheck } from './projectCreativeGrounding/designPageAuthorityR4SelfCheck.js';
import type {
  AuthorityGroundedAssetManifest,
  ProjectCreativeGroundingGateResult,
  ProjectGroundingReviewSummary,
} from './projectCreativeGrounding/types.js';
import type { PROJECT_CREATIVE_CONTEXT_VERSION } from './projectCreativeGrounding/types.js';
import type { DesignPageV3FounderTerritoryVerdict, DesignPageV3TerritoryId } from './hostProjectExpressionModel.js';

export type DesignPageV3WorkflowPhase = (typeof DESIGN_PAGE_V3_WORKFLOW_PHASES)[number];

export type DesignPageV3SkeletonArea = (typeof DESIGN_PAGE_V3_SKELETON_AREAS)[number];

export type DesignPageV3PhaseState = 'IDLE' | 'READY' | 'ACTIVE' | 'BLOCKED' | 'PASS' | 'FAIL';

export type DesignPageV3ViewportAuthority = 'mobile' | 'desktop';

export type DesignPageAuthorityVisualArtifact = {
  artifactId: string;
  viewport: DesignPageV3ViewportAuthority;
  storageUrl: string;
  widthHintPx: number;
  heightHintPx: number;
  provider: string;
  model: string;
  providerJobRef: string;
  representativePrototype: boolean;
  createdAt: string;
};

export type DesignPageAuthorityTerritoryBundle = {
  territoryId: DesignPageV3TerritoryId;
  territoryName: string;
  mobile: DesignPageAuthorityVisualArtifact;
  desktop: DesignPageAuthorityVisualArtifact;
};

/** One mobile+desktop pair stored under a territory category for compare. */
export type DesignPageAuthorityTerritoryCandidate = {
  candidateId: string;
  territoryId: DesignPageV3TerritoryId;
  territoryName: string;
  batchGeneration: number;
  createdAt: string;
  mobile: DesignPageAuthorityVisualArtifact;
  desktop: DesignPageAuthorityVisualArtifact;
};

export type DesignPageAuthorityTerritoryGallery = Record<
  DesignPageV3TerritoryId,
  DesignPageAuthorityTerritoryCandidate[]
>;

export type DesignPageAuthorityGenerationResult = {
  buildRef: typeof P0_VR_TWIN_V30_BUILD;
  lineage: typeof P0_VR_TWIN_V30R5_LINEAGE;
  authoritySessionId: string;
  projectId: string;
  pageLabel: string;
  hostProduct: string;
  clientProjectOpen: string;
  canonicalPath: typeof DESIGN_PAGE_V3_CANONICAL_PATH;
  skeletonConfirmed: DesignPageV3SkeletonArea[];
  /** R3: three spatial territories × mobile + desktop */
  territories: DesignPageAuthorityTerritoryBundle[];
  /** Active pair for approve flow (selected territory or preview default A) */
  mobile: DesignPageAuthorityVisualArtifact;
  desktop: DesignPageAuthorityVisualArtifact;
  selectedTerritoryId: DesignPageV3TerritoryId | null;
  expressionContract: ActiveProjectExpressionContract;
  zoneSummaries: Record<DesignPageV3SkeletonArea, string>;
  mobileTechnicalDetailsPattern: 'BOTTOM_SHEET_COLLAPSED';
  desktopTechnicalDetailsPattern: 'RIGHT_DRAWER_COLLAPSED';
  hostShellPreserved: true;
  r2SelfCheck: DesignPageAuthoritySelfCheck;
  r3SelfCheck: DesignPageAuthorityR3SelfCheck;
  r4SelfCheck: DesignPageAuthorityR4SelfCheck;
  projectCreativeContextVersion: typeof PROJECT_CREATIVE_CONTEXT_VERSION;
  projectCreativeGroundingGate: ProjectCreativeGroundingGateResult;
  authorityGroundedAssetManifests: AuthorityGroundedAssetManifest[];
  ungroundedAssetCount: number;
  projectGroundingQa: ProjectGroundingReviewSummary;
  /** FAL queue batch trace (parallel enqueue spread + request ids) */
  falProviderTrace: string[];
  classification: DesignPageAuthorityClassification;
  founderReview: DesignPageAuthorityFounderReviewState;
};

export type DesignPageAuthorityClassification =
  | 'DESIGN_PAGE_AUTHORITY_PARTIAL'
  | 'DESIGN_PAGE_AUTHORITY_PROVEN'
  | 'DESIGN_PAGE_AUTHORITY_FAILED';

export type DesignPageAuthorityFounderReviewState = {
  mobileApproved: boolean;
  desktopApproved: boolean;
  mobileLockId: typeof DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE | null;
  desktopLockId: typeof DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP | null;
  selectedTerritoryId: DesignPageV3TerritoryId | null;
  territoryVerdicts: Partial<Record<DesignPageV3TerritoryId, DesignPageV3FounderTerritoryVerdict>>;
  refineNotes: string[];
  lastAction:
    | 'GENERATE'
    | 'REFINE'
    | 'REGENERATE'
    | 'REGENERATE_TERRITORY'
    | 'APPROVE'
    | 'SELECT_TERRITORY'
    | 'SELECT_TERRITORY_CANDIDATE'
    | 'TERRITORY_VERDICT'
    | null;
  updatedAt: string;
};

export type DesignPageAuthorityTerritoryScope = 'ALL' | DesignPageV3TerritoryId;

export type DesignPageAuthorityReviewSession = {
  buildRef: typeof P0_VR_TWIN_V30_BUILD;
  authoritySessionId: string;
  projectId: string;
  pageLabel: string;
  candidateGeneration: number;
  lastResult: DesignPageAuthorityGenerationResult | null;
  /** Accumulated FAL/prototype pairs per territory — compare within A / B / C */
  territoryGallery: DesignPageAuthorityTerritoryGallery;
  /** Active compare selection per territory category */
  selectedCandidateByTerritory: Partial<Record<DesignPageV3TerritoryId, string>>;
  founderReview: DesignPageAuthorityFounderReviewState;
  /** R5: viewport master selection, promotion, pair lock */
  authorityPipeline?: DesignWorkspaceAuthorityPipelineState;
  updatedAt: string;
};
