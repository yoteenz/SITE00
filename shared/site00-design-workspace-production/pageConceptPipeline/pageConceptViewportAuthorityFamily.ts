/**
 * P0.VR.PAGE-CONCEPT-GPT2-CANONICAL-VIEWPORT-FAMILY1R1
 */

export type PageViewportFamilyStatus =
  | 'MOBILE_SELECTED'
  | 'EXPERIENCE_DEFINED'
  | 'TABLET_READY'
  | 'DESKTOP_READY'
  | 'AWAITING_FOUNDER_FAMILY_REVIEW'
  | 'APPROVED'
  | 'LOCKED';

export type PageMobileConceptSlotId = 'MOBILE_CONCEPT_A' | 'MOBILE_CONCEPT_B' | 'MOBILE_CONCEPT_C';

export type PageGpt2MobileConcept = {
  conceptId: string;
  slot: PageMobileConceptSlotId;
  artifactId: string;
  imageUri: string | null;
  status: 'PENDING' | 'RUNNING' | 'READY' | 'FAILED';
  createdAt: string;
  territoryLabel?: string;
  gpt2MobileDebug?: import('./pageConceptGpt2MobilePageAuthority.js').PageGpt2MobileArtifactDebug;
};

export type PageExperienceExpressionContract = {
  contractId: string;
  projectId: string;
  pageId: string;
  selectedMobileConceptId: string;
  skinContractVersion: string;
  cgptBriefId: string;
  overlayPatterns: readonly string[];
  version: string;
  approvedAt: string | null;
  createdAt: string;
};

export type PageViewportAuthorityFamilyLock = {
  lockId: string;
  familyId: string;
  viewportFamilyApprovalId: string;
  frozenAt: string;
  mobileArtifactVersion: string;
  tabletArtifactVersion: string;
  desktopArtifactVersion: string;
  cgptBriefVersion: string;
  skinContractVersion: string;
  experienceExpressionVersion: string;
};

export type PageTwinViewportCapture = {
  twinCaptureId: string;
  viewport: 'MOBILE' | 'TABLET' | 'DESKTOP';
  twinBuildId: string;
  authorityArtifactId: string;
  imageUri: string;
  capturedAt: string;
};

export type PageConceptLiveRouteHashSnapshot = {
  liveRoute: string;
  hash: string;
  capturedAt: string;
};

export type PageViewportAuthorityFamily = {
  familyId: string;
  cgptBriefId: string;
  cgptBriefVersion: string | null;
  selectedMobileConceptId: string | null;
  selectedMobileVersion: string | null;
  mobileArtifactId: string | null;
  tabletInterpretationId: string | null;
  tabletArtifactId: string | null;
  tabletVersion: string | null;
  desktopInterpretationId: string | null;
  desktopArtifactId: string | null;
  desktopVersion: string | null;
  experienceExpressionContractId: string | null;
  experienceExpressionVersion: string | null;
  skinContractVersion: string;
  skinContractId: string | null;
  status: PageViewportFamilyStatus;
  viewportFamilyApprovalId: string | null;
  familyLockId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TwinImplementationPackage = {
  packageId: string;
  projectId: string;
  pageId: string;
  targetSurface: 'TWIN';
  twinRoute: string;
  viewportFamilyApprovalId: string;
  viewportFamilyId: string;
  familyLockId: string;
  cgptBriefId: string;
  cgptBriefVersion: string;
  mobile: { artifactId: string; conceptId: string; version: string };
  tablet: { artifactId: string; interpretationId: string; version: string };
  desktop: { artifactId: string; interpretationId: string; version: string };
  experience: { contractId: string; version: string };
  skins: { contractId: string; version: string };
  functionContractId: string;
  pageContentContractSummary: string;
  interactionRequirements: readonly string[];
  pageFamilySkinBehaviorContractId: string;
  pageFamilyComponentExpressionMapId: string;
  representativeShellSetId: string;
  designDivergenceRulesSummary: string;
  responsiveInheritanceRulesSummary: string;
  twinBuildId: string;
  liveRouteHashBefore: string;
  createdAt: string;
};

export type LivePromotionPackage = {
  packageId: string;
  projectId: string;
  pageId: string;
  twinBuildId: string;
  twinLivePromotionApprovalId: string;
  liveRoute: string;
  twinRoute: string;
  rollbackSnapshotId: string;
  createdAt: string;
};

export const PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS: readonly PageMobileConceptSlotId[] = [
  'MOBILE_CONCEPT_A',
  'MOBILE_CONCEPT_B',
  'MOBILE_CONCEPT_C',
];

export function mobileConceptArtifactId(slot: PageMobileConceptSlotId): string {
  return `pcga-${slot}-MOBILE`;
}

export function resolveDesignTwinRoute(projectSlug: string, pageId: string): string {
  return `/projects/${projectSlug}/design/twin-opus-direct?page=${encodeURIComponent(pageId)}`;
}

export function tabletInterpretationArtifactId(familyId: string): string {
  return `pcga-TABLET-INTERP-${familyId.slice(-12)}`;
}

export function desktopInterpretationArtifactId(familyId: string): string {
  return `pcga-DESKTOP-INTERP-${familyId.slice(-12)}`;
}

export function createInitialViewportAuthorityFamily(input: {
  familyId: string;
  cgptBriefId: string;
  cgptBriefVersion: string;
  skinContractVersion: string;
  skinContractId: string;
}): PageViewportAuthorityFamily {
  const now = new Date().toISOString();
  return {
    familyId: input.familyId,
    cgptBriefId: input.cgptBriefId,
    cgptBriefVersion: input.cgptBriefVersion,
    selectedMobileConceptId: null,
    selectedMobileVersion: null,
    mobileArtifactId: null,
    tabletInterpretationId: null,
    tabletArtifactId: null,
    tabletVersion: null,
    desktopInterpretationId: null,
    desktopArtifactId: null,
    desktopVersion: null,
    experienceExpressionContractId: null,
    experienceExpressionVersion: null,
    skinContractVersion: input.skinContractVersion,
    skinContractId: input.skinContractId,
    status: 'MOBILE_SELECTED',
    viewportFamilyApprovalId: null,
    familyLockId: null,
    createdAt: now,
    updatedAt: now,
  };
}
