import type { ActiveProjectExpressionContract } from './activeProjectExpressionContract.js';
import type {
  DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP,
  DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE,
  DESIGN_PAGE_V3_CANONICAL_PATH,
  DESIGN_PAGE_V3_SKELETON_AREAS,
  DESIGN_PAGE_V3_WORKFLOW_PHASES,
  P0_VR_TWIN_V30R3_LINEAGE,
  P0_VR_TWIN_V30_BUILD,
} from './constants.js';
import type { DesignPageAuthoritySelfCheck } from './designPageAuthoritySelfCheck.js';
import type { DesignPageAuthorityR3SelfCheck } from './designPageAuthorityR3SelfCheck.js';
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

export type DesignPageAuthorityGenerationResult = {
  buildRef: typeof P0_VR_TWIN_V30_BUILD;
  lineage: typeof P0_VR_TWIN_V30R3_LINEAGE;
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
  lastAction: 'GENERATE' | 'REFINE' | 'REGENERATE' | 'APPROVE' | 'SELECT_TERRITORY' | 'TERRITORY_VERDICT' | null;
  updatedAt: string;
};

export type DesignPageAuthorityReviewSession = {
  buildRef: typeof P0_VR_TWIN_V30_BUILD;
  authoritySessionId: string;
  projectId: string;
  pageLabel: string;
  candidateGeneration: number;
  lastResult: DesignPageAuthorityGenerationResult | null;
  founderReview: DesignPageAuthorityFounderReviewState;
  updatedAt: string;
};
