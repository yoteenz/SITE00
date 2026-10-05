/**
 * ExperienceSurfaceDesignLifecycle — visual development must precede production implementation.
 */

export const EXPERIENCE_SURFACE_DESIGN_LIFECYCLE_STATES = [
  'BASELINE',
  'DIRECTION_READY',
  'ASSET_REQUIREMENTS_READY',
  'GENERATION_READY',
  'GENERATING',
  'DESIGN_PROOF_READY',
  'FOUNDER_REVIEW',
  'REVISION_REQUESTED',
  'APPROVED_FOR_IMPLEMENTATION',
  'REJECTED',
  'IMPLEMENTATION_CONTRACT_READY',
  'IMPLEMENTING',
  'IMPLEMENTED',
  'FIDELITY_REVIEW',
  'GENERATION_FAILED',
] as const;

export type ExperienceSurfaceDesignLifecycleState =
  (typeof EXPERIENCE_SURFACE_DESIGN_LIFECYCLE_STATES)[number];

export const SURFACE_DESIGN_FOUNDER_JUDGMENTS = [
  'LOVE_THE_DIRECTION',
  'PROMISING_REVISE',
  'NOT_THE_DIRECTION',
] as const;

export type SurfaceDesignFounderJudgment = (typeof SURFACE_DESIGN_FOUNDER_JUDGMENTS)[number] | null;

export const IMPLEMENTATION_BLOCKER_CODES = [
  'NO_APPROVED_DESIGN_PROOF',
  'MISSING_REQUIRED_PRODUCTION_ASSET',
  'DESIGN_PROOF_VERSION_MISMATCH',
  'FUNCTIONAL_CANON_MISMATCH',
  'WORKSPACE_CANON_MISMATCH',
  'CLIENT_EXPRESSION_MISMATCH',
  'UNRESOLVED_REQUIRED_ASSET_BINDING',
  'IMPLEMENTATION_BLOCKED_NO_APPROVED_VISUAL_REFERENCE',
] as const;

export type ImplementationBlockerCode = (typeof IMPLEMENTATION_BLOCKER_CODES)[number];

export const APPROVED_FOR_IMPLEMENTATION_THRESHOLD: ExperienceSurfaceDesignLifecycleState =
  'APPROVED_FOR_IMPLEMENTATION';

const LIFECYCLE_ORDER: Record<ExperienceSurfaceDesignLifecycleState, number> = {
  BASELINE: 0,
  DIRECTION_READY: 10,
  ASSET_REQUIREMENTS_READY: 20,
  GENERATION_READY: 30,
  GENERATING: 35,
  GENERATION_FAILED: 36,
  DESIGN_PROOF_READY: 40,
  FOUNDER_REVIEW: 50,
  REVISION_REQUESTED: 55,
  REJECTED: 56,
  APPROVED_FOR_IMPLEMENTATION: 60,
  IMPLEMENTATION_CONTRACT_READY: 70,
  IMPLEMENTING: 80,
  IMPLEMENTED: 90,
  FIDELITY_REVIEW: 95,
};

export function lifecycleAtLeast(
  current: ExperienceSurfaceDesignLifecycleState,
  minimum: ExperienceSurfaceDesignLifecycleState,
): boolean {
  return LIFECYCLE_ORDER[current] >= LIFECYCLE_ORDER[minimum];
}

export function assertSurfaceApprovedForImplementation(
  lifecycle: ExperienceSurfaceDesignLifecycleState,
): { allowed: boolean; blocker: ImplementationBlockerCode | null } {
  if (lifecycleAtLeast(lifecycle, APPROVED_FOR_IMPLEMENTATION_THRESHOLD)) {
    return { allowed: true, blocker: null };
  }
  return { allowed: false, blocker: 'IMPLEMENTATION_BLOCKED_NO_APPROVED_VISUAL_REFERENCE' };
}

export function productionPresentationMutationBlocked(
  lifecycle: ExperienceSurfaceDesignLifecycleState,
): boolean {
  return !lifecycleAtLeast(lifecycle, APPROVED_FOR_IMPLEMENTATION_THRESHOLD);
}

export function founderApprovalMutatesProductionUi(): false {
  return false;
}

export function founderApprovalTriggersComposerAutomatically(): false {
  return false;
}

export function evaluateImplementationBlockers(params: {
  lifecycle: ExperienceSurfaceDesignLifecycleState;
  approvedDesignProofId: string | null;
  approvedDesignProofVersion: string | null;
  contractProofVersion: string | null;
  missingRequiredAssets: string[];
  functionalCanonFingerprint: string | null;
  contractFunctionalFingerprint: string | null;
  workspaceCanonFingerprint: string | null;
  contractWorkspaceFingerprint: string | null;
  clientExpressionFingerprint: string | null;
  contractClientFingerprint: string | null;
}): ImplementationBlockerCode[] {
  const blockers: ImplementationBlockerCode[] = [];
  const approval = assertSurfaceApprovedForImplementation(params.lifecycle);
  if (!approval.allowed) blockers.push(approval.blocker!);
  if (!params.approvedDesignProofId) blockers.push('NO_APPROVED_DESIGN_PROOF');
  if (
    params.approvedDesignProofVersion &&
    params.contractProofVersion &&
    params.approvedDesignProofVersion !== params.contractProofVersion
  ) {
    blockers.push('DESIGN_PROOF_VERSION_MISMATCH');
  }
  if (params.missingRequiredAssets.length > 0) blockers.push('MISSING_REQUIRED_PRODUCTION_ASSET');
  if (
    params.functionalCanonFingerprint &&
    params.contractFunctionalFingerprint &&
    params.functionalCanonFingerprint !== params.contractFunctionalFingerprint
  ) {
    blockers.push('FUNCTIONAL_CANON_MISMATCH');
  }
  if (
    params.workspaceCanonFingerprint &&
    params.contractWorkspaceFingerprint &&
    params.workspaceCanonFingerprint !== params.contractWorkspaceFingerprint
  ) {
    blockers.push('WORKSPACE_CANON_MISMATCH');
  }
  if (
    params.clientExpressionFingerprint &&
    params.contractClientFingerprint &&
    params.clientExpressionFingerprint !== params.contractClientFingerprint
  ) {
    blockers.push('CLIENT_EXPRESSION_MISMATCH');
  }
  return blockers;
}

export type VisualDevelopmentSubstantiveInput = {
  mostlyText: boolean;
  mostlyBorderedRectangles: boolean;
  resemblesCurrentProductionWithRenamedSections: boolean;
  artworkTinyDecorationOnly: boolean;
  noGeneratedAssetMateriallyAffectsDesign: boolean;
  equalWeightRegions: boolean;
  saasDashboardResemblance: boolean;
  adminPortalResemblance: boolean;
  workbenchTerminologyOnly: boolean;
  dossierTerminologyOnly: boolean;
  ndxbookNameOnlyRecognition: boolean;
  site00HostRecognitionLost: boolean;
  literalWorkbenchImageryDominates: boolean;
  literalCaseDossierImageryDominates: boolean;
  generatedAssetCount: number;
  composedImagePresent: boolean;
  authoredVisualExpressionRequired: boolean;
};

export function visualDevelopmentSubstantive(input: VisualDevelopmentSubstantiveInput): {
  passes: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  if (input.mostlyText) failures.push('MOSTLY_TEXT');
  if (input.mostlyBorderedRectangles) failures.push('MOSTLY_BORDERED_RECTANGLES');
  if (input.resemblesCurrentProductionWithRenamedSections) failures.push('RENAMED_PRODUCTION_PAGE');
  if (input.artworkTinyDecorationOnly) failures.push('ARTWORK_TINY_DECORATION');
  if (input.noGeneratedAssetMateriallyAffectsDesign) failures.push('NO_GENERATED_ASSET_PARTICIPATION');
  if (input.equalWeightRegions) failures.push('EQUAL_WEIGHT_REGIONS');
  if (input.saasDashboardResemblance) failures.push('SAAS_DASHBOARD_RESEMBLANCE');
  if (input.adminPortalResemblance) failures.push('ADMIN_PORTAL_RESEMBLANCE');
  if (input.workbenchTerminologyOnly) failures.push('WORKBENCH_TERMINOLOGY_ONLY');
  if (input.dossierTerminologyOnly) failures.push('DOSSIER_TERMINOLOGY_ONLY');
  if (input.ndxbookNameOnlyRecognition) failures.push('NDXBOOK_NAME_ONLY');
  if (input.site00HostRecognitionLost) failures.push('SITE00_HOST_LOST');
  if (input.literalWorkbenchImageryDominates) failures.push('LITERAL_WORKBENCH');
  if (input.literalCaseDossierImageryDominates) failures.push('LITERAL_DOSSIER');
  if (!input.composedImagePresent) failures.push('NO_COMPOSED_IMAGE');
  if (input.authoredVisualExpressionRequired && input.generatedAssetCount < 1) {
    failures.push('AUTHORED_VISUAL_EXPRESSION_MISSING');
  }
  return { passes: failures.length === 0, failures };
}

export const AUTHORED_VISUAL_EXPRESSION_REQUIRED = true;
