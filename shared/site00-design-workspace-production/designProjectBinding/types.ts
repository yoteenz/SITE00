/**
 * P0.VR.DESIGN-PROJECT-BINDING1R1 — DESIGN module ↔ active project ↔ page intelligence.
 */

export type DesignModuleHierarchySegment = {
  id: 'projects' | 'design' | 'active-project' | 'pages' | 'page';
  label: string;
  href?: string | null;
};

export type DesignPageDesignStatus =
  | 'PLANNED'
  | 'DESIGN_NEEDED'
  | 'DESIGNING'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'READY_TO_BUILD'
  | 'BUILT'
  | 'AMENDMENT_REQUIRED';

export type DesignPageBuildStatus = 'NOT_STARTED' | 'DESIGN' | 'IN_BUILD' | 'BUILT' | 'BLOCKED';

export type DesignPageInheritanceClass = 'INHERITED' | 'OVERRIDDEN' | 'NEW';

export type DesignBoundPageRecord = {
  projectId: string;
  pageId: string;
  screenId: string;
  pageName: string;
  route: string;
  pageRole: string;
  parentPageId: string | null;
  childPageIds: string[];
  designStatus: DesignPageDesignStatus;
  buildStatus: DesignPageBuildStatus;
  authorityStatus: string;
  designAuthorityVersion: string | null;
  interactionContractVersion: string | null;
  assetManifestVersion: string | null;
  mobilePreviewUrl: string | null;
  desktopPreviewUrl: string | null;
  /** Founder-approved tablet override when Mobile+Desktop pair is insufficient. */
  tabletOverridePreviewUrl?: string | null;
  /** Precomputed responsive tablet preview when Mobile + Desktop authorities both exist. */
  tabletDerivedPreviewUrl?: string | null;
  isConceptOrphan: boolean;
  mirrorStatus: string;
};

export type DesignProjectIntelligence = {
  projectId: string;
  displayName: string;
  projectType: string;
  description: string;
  brandExpression: string;
  primaryCreativeStream: string;
  pageRegistryId: string;
  totalPages: number;
  pagesApproved: number;
  pagesNeedingDesign: number;
  pagesInReview: number;
  pagesReadyToBuild: number;
  pagesBuilt: number;
  pagesBlocked: number;
};

export type DesignWorkspaceSurface = 'project-overview' | 'page-workspace';

export type DesignPageTargetBinding = {
  pageId: string;
  screenId: string;
  pageName: string;
  pageRole: string;
  route: string;
  designStatus: DesignPageDesignStatus;
};

export type CompiledDesignPageContext = {
  activeModule: 'DESIGN';
  activeProjectId: string;
  activePageId: string;
  pageRole: string;
  route: string;
  parentPageId: string | null;
  childPageIds: string[];
  brandContext: string;
  creativeContext: string;
  functionalContext: string;
  currentAuthority: string;
  interactionContract: string;
  assetAuthority: string;
  inheritance: DesignPageInheritanceClass;
};

export type OpusPageContextContract = CompiledDesignPageContext & {
  projectCanon: string;
  pageContentSummary: string;
  currentImplementationRoute: string;
};
