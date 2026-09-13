import type {
  DESIGN_PAGE_V3_AUTHORITY_V1_DESKTOP,
  DESIGN_PAGE_V3_AUTHORITY_V1_MOBILE,
  DESIGN_PAGE_V3_SKELETON_AREAS,
  DESIGN_PAGE_V3_WORKFLOW_PHASES,
  P0_VR_TWIN_V30_BUILD,
} from './constants.js';

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

export type DesignPageAuthorityGenerationResult = {
  buildRef: typeof P0_VR_TWIN_V30_BUILD;
  authoritySessionId: string;
  projectId: string;
  pageLabel: string;
  hostProduct: string;
  clientProjectOpen: string;
  skeletonConfirmed: DesignPageV3SkeletonArea[];
  mobile: DesignPageAuthorityVisualArtifact;
  desktop: DesignPageAuthorityVisualArtifact;
  site00PageFrameSummary: string;
  primaryWorkAreaSummary: string;
  clientTargetContextSummary: string;
  decisionReviewSummary: string;
  structuredArtifactGroupingSummary: string;
  secondaryDetailZonesSummary: string;
  mobileTechnicalDetailsPattern: 'BOTTOM_SHEET_COLLAPSED';
  desktopTechnicalDetailsPattern: 'RIGHT_DRAWER_COLLAPSED';
  hostShellPreserved: true;
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
  refineNotes: string[];
  lastAction: 'GENERATE' | 'REFINE' | 'REGENERATE' | 'APPROVE' | null;
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
