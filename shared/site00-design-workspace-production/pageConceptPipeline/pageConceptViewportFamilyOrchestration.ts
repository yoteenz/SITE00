/**
 * P0.VR.GPT2-VIEWPORT-FAMILY-TWIN-ORCHESTRATION1
 */

import { compileProjectSkinContract } from './pageConceptProjectSkinContract.js';
import {
  assertLiveRouteUnchanged,
  computePageConceptLiveImplementationHash,
} from './pageConceptLiveRouteHash.js';
import { assertOpusShellTargetSurface } from './pageConceptTwinLiveFirewall.js';
import type {
  PageConceptGeneratedArtifact,
  PageConceptGenerationState,
  PageConceptGenerationStatus,
  PageConceptPipelineSet,
} from './types.js';
import type {
  PageExperienceExpressionContract,
  PageTwinViewportCapture,
  PageViewportAuthorityFamily,
  PageViewportAuthorityFamilyLock,
  TwinImplementationPackage,
} from './pageConceptViewportAuthorityFamily.js';
import {
  createInitialViewportAuthorityFamily,
  desktopInterpretationArtifactId,
  resolveDesignTwinRoute,
  tabletInterpretationArtifactId,
} from './pageConceptViewportAuthorityFamily.js';

export type ViewportFamilyOrchestrationResult = {
  state: PageConceptGenerationState;
  jobs?: readonly PageConceptGeneratedArtifact[];
  generationStatus: PageConceptGenerationStatus;
};

function invalidateApprovalIfNeeded(family: PageViewportAuthorityFamily): PageViewportAuthorityFamily {
  if (!family.viewportFamilyApprovalId && !family.familyLockId) return family;
  return {
    ...family,
    viewportFamilyApprovalId: null,
    familyLockId: null,
    status:
      family.tabletArtifactId && family.desktopArtifactId ?
        'AWAITING_FOUNDER_FAMILY_REVIEW'
      : family.tabletArtifactId ?
        'TABLET_READY'
      : family.desktopArtifactId ?
        'DESKTOP_READY'
      : family.experienceExpressionContractId ?
        'EXPERIENCE_DEFINED'
      : 'MOBILE_SELECTED',
    updatedAt: new Date().toISOString(),
  };
}

function syncGenerationStatus(family: PageViewportAuthorityFamily): PageConceptGenerationStatus {
  switch (family.status) {
    case 'MOBILE_SELECTED':
      return 'GPT2_MOBILE_AWAITING_SELECTION';
    case 'EXPERIENCE_DEFINED':
      return 'GPT2_MOBILE_AWAITING_SELECTION';
    case 'TABLET_READY':
      return 'VIEWPORT_FAMILY_REVIEW';
    case 'DESKTOP_READY':
      return 'VIEWPORT_FAMILY_REVIEW';
    case 'AWAITING_FOUNDER_FAMILY_REVIEW':
      return 'VIEWPORT_FAMILY_REVIEW';
    case 'APPROVED':
      return 'VIEWPORT_FAMILY_REVIEW';
    case 'LOCKED':
      return 'VIEWPORT_FAMILY_LOCKED';
    default:
      return 'VIEWPORT_FAMILY_REVIEW';
  }
}

function patchPipeline(
  state: PageConceptGenerationState,
  patch: Partial<PageConceptPipelineSet>,
  family?: PageViewportAuthorityFamily,
): PageConceptGenerationState {
  const pipelineSet = state.pipelineSet;
  if (!pipelineSet) throw new Error('PIPELINE_SET_REQUIRED');
  const viewportAuthorityFamily = family ?? patch.viewportAuthorityFamily ?? pipelineSet.viewportAuthorityFamily;
  const next: PageConceptPipelineSet = {
    ...pipelineSet,
    ...patch,
    viewportAuthorityFamily: viewportAuthorityFamily ?? null,
  };
  const generationStatus = viewportAuthorityFamily ? syncGenerationStatus(viewportAuthorityFamily) : state.generationStatus;
  return { ...state, pipelineSet: next, generationStatus };
}

export function pageConceptSelectMobileConcept(
  state: PageConceptGenerationState,
  conceptId: string,
): ViewportFamilyOrchestrationResult {
  const ps = state.pipelineSet;
  if (!ps?.mobileConcepts?.length) throw new Error('MOBILE_CONCEPTS_REQUIRED');
  const selected = ps.mobileConcepts.find((c) => c.conceptId === conceptId);
  if (!selected) throw new Error('MOBILE_CONCEPT_NOT_FOUND');
  const brief = ps.cgptCreativeBrief;
  if (!brief) throw new Error('CGPT_BRIEF_REQUIRED');
  const skin = compileProjectSkinContract(state.projectId);
  const familyId = ps.viewportAuthorityFamily?.familyId ?? `pvaf-${ps.pipelineSetId}`;
  const family = createInitialViewportAuthorityFamily({
    familyId,
    cgptBriefId: brief.briefId,
    cgptBriefVersion: brief.version,
    skinContractVersion: skin.version,
    skinContractId: skin.contractId,
  });
  const nextFamily: PageViewportAuthorityFamily = {
    ...family,
    selectedMobileConceptId: selected.conceptId,
    selectedMobileVersion: `v1-${selected.conceptId.slice(-8)}`,
    mobileArtifactId: selected.artifactId,
    status: 'MOBILE_SELECTED',
    updatedAt: new Date().toISOString(),
  };
  return {
    state: patchPipeline(state, {
      selectedMobileConceptId: selected.conceptId,
      viewportAuthorityFamily: nextFamily,
    }),
    generationStatus: syncGenerationStatus(nextFamily),
  };
}

export function pageConceptApproveExperienceExpression(
  state: PageConceptGenerationState,
  experienceContract: PageExperienceExpressionContract,
): ViewportFamilyOrchestrationResult {
  const family = state.pipelineSet?.viewportAuthorityFamily;
  if (!family?.selectedMobileConceptId) throw new Error('MOBILE_SELECTION_REQUIRED');
  if (family.status !== 'MOBILE_SELECTED' && family.status !== 'EXPERIENCE_DEFINED') {
    throw new Error('EXPERIENCE_APPROVAL_INVALID_STATE');
  }
  const approved: PageExperienceExpressionContract = {
    ...experienceContract,
    approvedAt: new Date().toISOString(),
  };
  const nextFamily: PageViewportAuthorityFamily = {
    ...family,
    experienceExpressionContractId: approved.contractId,
    experienceExpressionVersion: approved.version,
    status: 'EXPERIENCE_DEFINED',
    updatedAt: new Date().toISOString(),
  };
  return {
    state: patchPipeline(
      state,
      {
        experienceExpressionContract: approved,
        viewportAuthorityFamily: nextFamily,
      },
      nextFamily,
    ),
    generationStatus: syncGenerationStatus(nextFamily),
  };
}

export function pageConceptApplyTabletInterpretation(
  state: PageConceptGenerationState,
  input: {
    job: PageConceptGeneratedArtifact;
    interpretationId: string;
    version: string;
  },
): ViewportFamilyOrchestrationResult {
  let family = state.pipelineSet?.viewportAuthorityFamily;
  if (!family?.experienceExpressionContractId) throw new Error('EXPERIENCE_EXPRESSION_REQUIRED');
  family = invalidateApprovalIfNeeded(family);
  const nextFamily: PageViewportAuthorityFamily = {
    ...family,
    tabletInterpretationId: input.interpretationId,
    tabletArtifactId: input.job.artifactId,
    tabletVersion: input.version,
    status: 'TABLET_READY',
    updatedAt: new Date().toISOString(),
  };
  return {
    state: patchPipeline(state, { viewportAuthorityFamily: nextFamily }, nextFamily),
    jobs: [input.job],
    generationStatus: syncGenerationStatus(nextFamily),
  };
}

export function pageConceptApplyDesktopInterpretation(
  state: PageConceptGenerationState,
  input: {
    job: PageConceptGeneratedArtifact;
    interpretationId: string;
    version: string;
  },
): ViewportFamilyOrchestrationResult {
  let family = state.pipelineSet?.viewportAuthorityFamily;
  if (!family?.tabletArtifactId) throw new Error('TABLET_REQUIRED_BEFORE_DESKTOP');
  family = invalidateApprovalIfNeeded(family);
  const nextFamily: PageViewportAuthorityFamily = {
    ...family,
    desktopInterpretationId: input.interpretationId,
    desktopArtifactId: input.job.artifactId,
    desktopVersion: input.version,
    status: 'AWAITING_FOUNDER_FAMILY_REVIEW',
    updatedAt: new Date().toISOString(),
  };
  return {
    state: patchPipeline(state, { viewportAuthorityFamily: nextFamily }, nextFamily),
    jobs: [input.job],
    generationStatus: syncGenerationStatus(nextFamily),
  };
}

export function pageConceptApproveViewportFamily(state: PageConceptGenerationState): ViewportFamilyOrchestrationResult {
  const family = state.pipelineSet?.viewportAuthorityFamily;
  if (!family?.mobileArtifactId || !family.tabletArtifactId || !family.desktopArtifactId) {
    throw new Error('VIEWPORT_FAMILY_INCOMPLETE');
  }
  const approvalId = `pvfa-${family.familyId}-${Date.now()}`;
  const nextFamily: PageViewportAuthorityFamily = {
    ...family,
    viewportFamilyApprovalId: approvalId,
    status: 'APPROVED',
    updatedAt: new Date().toISOString(),
  };
  return {
    state: patchPipeline(state, { viewportAuthorityFamily: nextFamily }, nextFamily),
    generationStatus: syncGenerationStatus(nextFamily),
  };
}

export function pageConceptLockViewportFamily(state: PageConceptGenerationState): ViewportFamilyOrchestrationResult {
  const family = state.pipelineSet?.viewportAuthorityFamily;
  if (!family?.viewportFamilyApprovalId) throw new Error('FAMILY_APPROVAL_REQUIRED');
  const lock: PageViewportAuthorityFamilyLock = {
    lockId: `pvfl-${family.familyId}-${Date.now()}`,
    familyId: family.familyId,
    viewportFamilyApprovalId: family.viewportFamilyApprovalId,
    frozenAt: new Date().toISOString(),
    mobileArtifactVersion: family.selectedMobileVersion ?? 'v1',
    tabletArtifactVersion: family.tabletVersion ?? 'v1',
    desktopArtifactVersion: family.desktopVersion ?? 'v1',
    cgptBriefVersion: family.cgptBriefVersion ?? 'v1',
    skinContractVersion: family.skinContractVersion,
    experienceExpressionVersion: family.experienceExpressionVersion ?? 'v1',
  };
  const nextFamily: PageViewportAuthorityFamily = {
    ...family,
    familyLockId: lock.lockId,
    status: 'LOCKED',
    updatedAt: new Date().toISOString(),
  };
  return {
    state: patchPipeline(
      state,
      { viewportAuthorityFamilyLock: lock, viewportAuthorityFamily: nextFamily },
      nextFamily,
    ),
    generationStatus: 'VIEWPORT_FAMILY_LOCKED',
  };
}

export function pageConceptCreateTwinImplementationPackage(state: PageConceptGenerationState): ViewportFamilyOrchestrationResult {
  const ps = state.pipelineSet;
  const family = ps?.viewportAuthorityFamily;
  const lock = ps?.viewportAuthorityFamilyLock;
  if (!family?.familyLockId || !lock) throw new Error('AUTHORITY_LOCK_REQUIRED');
  if (family.familyLockId !== lock.lockId) throw new Error('LOCK_MISMATCH');

  const twinRoute = resolveDesignTwinRoute(state.projectId, state.pageId);
  assertOpusShellTargetSurface('TWIN');

  const liveHash = computePageConceptLiveImplementationHash(state);
  const before = ps?.liveRouteHashBefore?.hash ?? liveHash;
  assertLiveRouteUnchanged(before, liveHash);

  const twinBuildId = `ptb-${family.familyId}-${Date.now()}`;
  const pkg: TwinImplementationPackage = {
    packageId: `ptip-${family.familyId}-${Date.now()}`,
    projectId: state.projectId,
    pageId: state.pageId,
    targetSurface: 'TWIN',
    twinRoute,
    viewportFamilyApprovalId: family.viewportFamilyApprovalId!,
    viewportFamilyId: family.familyId,
    familyLockId: lock.lockId,
    cgptBriefId: family.cgptBriefId,
    cgptBriefVersion: family.cgptBriefVersion ?? 'v1',
    mobile: {
      artifactId: family.mobileArtifactId!,
      conceptId: family.selectedMobileConceptId!,
      version: family.selectedMobileVersion ?? 'v1',
    },
    tablet: {
      artifactId: family.tabletArtifactId!,
      interpretationId: family.tabletInterpretationId!,
      version: family.tabletVersion ?? 'v1',
    },
    desktop: {
      artifactId: family.desktopArtifactId!,
      interpretationId: family.desktopInterpretationId!,
      version: family.desktopVersion ?? 'v1',
    },
    experience: {
      contractId: family.experienceExpressionContractId!,
      version: family.experienceExpressionVersion ?? 'v1',
    },
    skins: {
      contractId: family.skinContractId ?? `skin-${state.projectId}`,
      version: family.skinContractVersion,
    },
    functionContractId: ps!.functionContractId,
    pageContentContractSummary: ps!.creativeInjection?.immutableRequirements?.join(' · ') ?? '',
    interactionRequirements: state.functionContract?.interactions ?? [],
    twinBuildId,
    liveRouteHashBefore: before,
    createdAt: new Date().toISOString(),
  };

  const liveRouteHashAfter = computePageConceptLiveImplementationHash(state);
  assertLiveRouteUnchanged(before, liveRouteHashAfter);

  return {
    state: patchPipeline(state, {
      twinImplementationPackage: pkg,
      liveRouteHashBefore: ps?.liveRouteHashBefore ?? {
        liveRoute: state.functionContract?.route ?? '',
        hash: before,
        capturedAt: new Date().toISOString(),
      },
      liveRouteHashAfter: {
        liveRoute: state.functionContract?.route ?? '',
        hash: liveRouteHashAfter,
        capturedAt: new Date().toISOString(),
      },
    }),
    generationStatus: 'TWIN_IMPLEMENTATION_PACKAGE_READY',
  };
}

export function pageConceptRecordTwinCapture(
  state: PageConceptGenerationState,
  capture: Omit<PageTwinViewportCapture, 'twinCaptureId' | 'capturedAt'>,
): ViewportFamilyOrchestrationResult {
  const ps = state.pipelineSet;
  if (!ps?.twinImplementationPackage) throw new Error('TWIN_PACKAGE_REQUIRED');
  const record: PageTwinViewportCapture = {
    ...capture,
    twinCaptureId: `ptc-${capture.viewport}-${Date.now()}`,
    capturedAt: new Date().toISOString(),
  };
  const twinCaptures = [...(state.twinCaptures ?? []), record];
  const before = ps.liveRouteHashBefore?.hash ?? computePageConceptLiveImplementationHash(state);
  const after = computePageConceptLiveImplementationHash(state);
  assertLiveRouteUnchanged(before, after);
  return {
    state: {
      ...state,
      twinCaptures,
      pipelineSet: {
        ...ps,
        liveRouteHashAfter: {
          liveRoute: state.functionContract?.route ?? '',
          hash: after,
          capturedAt: new Date().toISOString(),
        },
      },
    },
    generationStatus: state.generationStatus,
  };
}

export function pageConceptTabletArtifactIdForFamily(familyId: string): string {
  return tabletInterpretationArtifactId(familyId);
}

export function pageConceptDesktopArtifactIdForFamily(familyId: string): string {
  return desktopInterpretationArtifactId(familyId);
}
