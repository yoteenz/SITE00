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
};

export type PageExperienceExpressionContract = {
  contractId: string;
  projectId: string;
  pageId: string;
  selectedMobileConceptId: string;
  skinContractVersion: string;
  cgptBriefId: string;
  overlayPatterns: readonly string[];
  createdAt: string;
};

export type PageViewportAuthorityFamily = {
  familyId: string;
  cgptBriefId: string;
  selectedMobileConceptId: string | null;
  mobileArtifactId: string | null;
  tabletInterpretationId: string | null;
  tabletArtifactId: string | null;
  desktopInterpretationId: string | null;
  desktopArtifactId: string | null;
  experienceExpressionContractId: string | null;
  skinContractVersion: string;
  status: PageViewportFamilyStatus;
  viewportFamilyApprovalId: string | null;
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
