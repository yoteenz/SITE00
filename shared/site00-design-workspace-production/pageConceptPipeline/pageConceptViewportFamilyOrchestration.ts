/**
 * P0.VR.GPT2-VIEWPORT-FAMILY-TWIN-ORCHESTRATION1
 */

import { compileProjectSkinContract } from './pageConceptProjectSkinContract.js';
import {
  compilePageFamilyContractBundle,
  createOpusRepresentativeShellSet,
  markOpusRepresentativeShellsReady,
  type PageFamilySkinBehaviorContract,
} from './pageConceptPageFamilySkinBehavior.js';
import {
  buildOpusPageFamilyHandoff,
  compilePageFamilyBlueprint,
  mapArchetypesToOpusShellKinds,
  validatePageFamilyBlueprint,
} from './pageConceptPageFamilyBlueprint.js';
import {
  buildPageFamilyBuildReadiness,
  compilePageFamilyInteractionMap,
  validatePageFamilyInteractionMap,
} from './pageConceptPageFamilyInteractionMap.js';
import { buildPageSystemReviewModel } from '../designPageSystemReview.js';
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
import { compileExperienceExpressionAuthority } from './experienceExpressionAuthority.js';
import { mergePreservedExperienceVisualStates } from './experiencePackageMaterialization.js';
import { compilePageExperienceExpressionContract } from './pageConceptExperienceExpressionCompile.js';
import { isMobileAuthorityConfirmed } from './pageConceptViewportFamilyState.js';
import { buildExperienceThemeHandoffLines, experienceThemeContinuityBlocksApproval } from './experienceThemeContinuity.js';
import {
  buildExperienceContentHandoffLines,
  COMPOSER_EXPERIENCE_CONTENT_GUARD,
  experienceContentBlocksApproval,
} from './experienceContentManifest.js';
import {
  buildExperienceExpressionCoverageHandoffLines,
  experienceExpressionCoverageBlocksApproval,
} from './experienceExpressionCoverageMap.js';
import { nestedNavContractHandoffLines } from './responsiveExperienceNestedNavContract.js';
import {
  applyFounderFunctionalExpansionDecision,
  buildComposerExpansionImplementationContracts,
  buildOpusFunctionalExpansionHandoffLines,
  buildPageFunctionalExpansionIntelligence,
  injectApprovedFunctionalExpansionsIntoAuthority,
  propagateApprovedExpansionToFamily,
} from './pageFunctionalExpansionIntelligence.js';

export type ViewportFamilyOrchestrationResult = {
  state: PageConceptGenerationState;
  jobs?: readonly PageConceptGeneratedArtifact[];
  generationStatus: PageConceptGenerationStatus;
};

function clearDownstreamExperienceAndInterpretations(
  family: PageViewportAuthorityFamily,
): PageViewportAuthorityFamily {
  return {
    ...family,
    experienceExpressionContractId: null,
    experienceExpressionVersion: null,
    experienceExpressionStatus: 'SUPERSEDED',
    experienceApprovedAt: null,
    tabletInterpretationId: null,
    tabletArtifactId: null,
    tabletVersion: null,
    desktopInterpretationId: null,
    desktopArtifactId: null,
    desktopVersion: null,
    viewportFamilyApprovalId: null,
    familyLockId: null,
    status: family.mobileAuthorityStatus === 'CONFIRMED' ? 'MOBILE_AUTHORITY_CONFIRMED' : 'MOBILE_SELECTED',
    updatedAt: new Date().toISOString(),
  };
}

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

function syncGenerationStatus(
  family: PageViewportAuthorityFamily,
  pipelineSet: PageConceptPipelineSet,
): PageConceptGenerationStatus {
  if (pipelineSet.twinImplementationPackage) return 'TWIN_IMPLEMENTATION_PACKAGE_READY';
  if (family.status === 'LOCKED') return 'VIEWPORT_FAMILY_LOCKED';
  if (family.status === 'APPROVED') {
    const blueprint = pipelineSet.pageFamilyBlueprint;
    if (blueprint && !blueprint.approvedAt) return 'PAGE_FAMILY_BLUEPRINT_REVIEW';
    const interactionMap = pipelineSet.pageFamilyInteractionMap;
    if (blueprint?.approvedAt && interactionMap && !interactionMap.approvedAt) {
      return 'PAGE_FAMILY_INTERACTION_MAP_REVIEW';
    }
    const contract = pipelineSet.pageFamilySkinBehaviorContract;
    if (contract && !contract.approvedAt) return 'PAGE_FAMILY_CONTRACT_REVIEW';
    const shells = pipelineSet.opusRepresentativeShellSet;
    if (contract?.approvedAt && shells && !shells.readyAt) return 'PAGE_FAMILY_CONTRACT_REVIEW';
  }
  switch (family.status) {
    case 'MOBILE_SELECTED':
    case 'MOBILE_AUTHORITY_CONFIRMED':
      return 'GPT2_MOBILE_AWAITING_SELECTION';
    case 'EXPERIENCE_DEFINED':
      return 'VIEWPORT_FAMILY_REVIEW';
    case 'TABLET_READY':
    case 'DESKTOP_READY':
    case 'AWAITING_FOUNDER_FAMILY_REVIEW':
    case 'APPROVED':
      return 'VIEWPORT_FAMILY_REVIEW';
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
  const generationStatus =
    viewportAuthorityFamily ? syncGenerationStatus(viewportAuthorityFamily, next) : state.generationStatus;
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
  const existingFamily = ps.viewportAuthorityFamily;
  const familyId = existingFamily?.familyId ?? `pvaf-${ps.pipelineSetId}`;
  const familyBase =
    existingFamily ??
    createInitialViewportAuthorityFamily({
      familyId,
      cgptBriefId: brief.briefId,
      cgptBriefVersion: brief.version,
      skinContractVersion: skin.version,
      skinContractId: skin.contractId,
    });
  const priorConfirmed = existingFamily?.mobileAuthorityStatus === 'CONFIRMED';
  const conceptChanged = Boolean(
    existingFamily?.selectedMobileConceptId && existingFamily.selectedMobileConceptId !== selected.conceptId,
  );
  let nextFamily: PageViewportAuthorityFamily = {
    ...familyBase,
    selectedMobileConceptId: selected.conceptId,
    selectedMobileVersion: `v1-${selected.conceptId.slice(-8)}`,
    mobileArtifactId: selected.artifactId,
    mobileAuthorityStatus: 'SELECTED',
    confirmedMobileConceptId: null,
    confirmedMobileArtifactId: null,
    confirmedMobileTerritoryId: null,
    mobileAuthorityConfirmedAt: null,
    mobileAuthorityConfirmedByFounder: false,
    status: 'MOBILE_SELECTED',
    updatedAt: new Date().toISOString(),
  };
  if (priorConfirmed || conceptChanged) {
    nextFamily = clearDownstreamExperienceAndInterpretations(nextFamily);
  }
  const nextState = patchPipeline(state, {
    selectedMobileConceptId: selected.conceptId,
    viewportAuthorityFamily: nextFamily,
    experienceExpressionContract: priorConfirmed || conceptChanged ? null : state.pipelineSet?.experienceExpressionContract ?? null,
    experienceExpressionAuthority: priorConfirmed || conceptChanged ? null : state.pipelineSet?.experienceExpressionAuthority ?? null,
  });
  return { state: nextState, generationStatus: nextState.generationStatus };
}

export function pageConceptConfirmMobileAuthority(state: PageConceptGenerationState): ViewportFamilyOrchestrationResult {
  const ps = state.pipelineSet;
  const family = ps?.viewportAuthorityFamily;
  if (!family?.selectedMobileConceptId || !family.mobileArtifactId) {
    throw new Error('MOBILE_SELECTION_REQUIRED');
  }
  const selected = ps!.mobileConcepts?.find((c) => c.conceptId === family.selectedMobileConceptId);
  if (!selected) throw new Error('MOBILE_CONCEPT_NOT_FOUND');
  const now = new Date().toISOString();
  const nextFamily: PageViewportAuthorityFamily = {
    ...family,
    mobileAuthorityStatus: 'CONFIRMED',
    confirmedMobileConceptId: selected.conceptId,
    confirmedMobileArtifactId: selected.artifactId,
    confirmedMobileTerritoryId: selected.territoryLabel ?? null,
    mobileAuthorityConfirmedAt: now,
    mobileAuthorityConfirmedByFounder: true,
    status: 'MOBILE_AUTHORITY_CONFIRMED',
    updatedAt: now,
  };
  const expansionIntelligence =
    ps?.functionalExpansionIntelligence ??
    buildPageFunctionalExpansionIntelligence({
      projectId: state.projectId,
      anchorPageId: state.pageId,
      functionContract: state.functionContract,
    }) ??
    null;
  const nextState: PageConceptGenerationState = {
    ...patchPipeline(
      state,
      {
        viewportAuthorityFamily: nextFamily,
        functionalExpansionIntelligence: expansionIntelligence,
        composerFunctionalExpansionContracts: expansionIntelligence ?
          buildComposerExpansionImplementationContracts(expansionIntelligence)
        : [],
      },
      nextFamily,
    ),
    liveProgress: null,
    activeGenerationStage: null,
  };
  return { state: nextState, generationStatus: nextState.generationStatus };
}

export function pageConceptBeginExperienceExpressionGeneration(state: PageConceptGenerationState): {
  state: PageConceptGenerationState;
  mobileConcept: import('./pageConceptViewportAuthorityFamily.js').PageGpt2MobileConcept;
  authority: import('./experienceExpressionAuthority.js').ExperienceExpressionAuthority;
  contract: PageExperienceExpressionContract;
} {
  const ps = state.pipelineSet;
  const family = ps?.viewportAuthorityFamily;
  if (!isMobileAuthorityConfirmed(family)) throw new Error('MOBILE_AUTHORITY_CONFIRMATION_REQUIRED');
  const conceptId = family!.confirmedMobileConceptId ?? family!.selectedMobileConceptId!;
  const mobileConcept = ps!.mobileConcepts?.find((c) => c.conceptId === conceptId);
  if (!mobileConcept) throw new Error('MOBILE_CONCEPT_NOT_FOUND');
  if (!mobileConcept.imageUri?.trim()) throw new Error('MOBILE_AUTHORITY_IMAGE_MISSING');
  const injection = ps!.creativeInjection!;
  const brief = ps!.cgptCreativeBrief!;
  const skin = compileProjectSkinContract(state.projectId);
  const expansionIntelligence =
    ps?.functionalExpansionIntelligence ??
    buildPageFunctionalExpansionIntelligence({
      projectId: state.projectId,
      anchorPageId: state.pageId,
      functionContract: state.functionContract,
    });
  const authorityBase = compileExperienceExpressionAuthority({
    projectId: state.projectId,
    pageId: state.pageId,
    mobileConcept,
    skinContract: skin,
    cgptBrief: brief,
    injection,
    functionContract: state.functionContract!,
  });
  const merged = mergePreservedExperienceVisualStates(authorityBase, ps?.experienceExpressionAuthority);
  const withExpansions = injectApprovedFunctionalExpansionsIntoAuthority(merged, expansionIntelligence ?? null);
  const authority = { ...withExpansions, status: 'GENERATING' as const };
  const contract = compilePageExperienceExpressionContract({
    projectId: state.projectId,
    pageId: state.pageId,
    selectedMobileConceptId: conceptId,
    skinContract: skin,
    cgptBrief: brief,
    injection,
    functionContract: state.functionContract!,
  });
  const nextFamily: PageViewportAuthorityFamily = {
    ...family!,
    experienceExpressionStatus: 'GENERATING',
    experienceExpressionContractId: contract.contractId,
    experienceExpressionVersion: contract.version,
    updatedAt: new Date().toISOString(),
  };
  const nextState = patchPipeline(
    state,
    {
      experienceExpressionAuthority: authority,
      experienceExpressionContract: contract,
      viewportAuthorityFamily: nextFamily,
      functionalExpansionIntelligence: expansionIntelligence ?? ps?.functionalExpansionIntelligence ?? null,
    },
    nextFamily,
  );
  return { state: nextState, mobileConcept, authority, contract };
}

export function pageConceptApplyExperienceExpressionGenerationResult(
  state: PageConceptGenerationState,
  input: {
    authority: import('./experienceExpressionAuthority.js').ExperienceExpressionAuthority;
    contract: PageExperienceExpressionContract;
    jobs: readonly PageConceptGeneratedArtifact[];
  },
): ViewportFamilyOrchestrationResult {
  const family = state.pipelineSet?.viewportAuthorityFamily;
  if (!family) throw new Error('VIEWPORT_FAMILY_REQUIRED');
  const visualLabels = input.authority.visualStates.map((v) => `${v.label}: ${v.caption}`);
  const packagingLines = input.authority.packagingPlan ?
    [
      `PACKAGING: ${input.authority.packagingPlan.packagingReasoning}`,
      `PLANNED FAL OUTPUTS: ${input.authority.packagingPlan.totalPlannedOutputs} (+ BASE inherit)`,
    ]
  : [];
  const lineageLines =
    input.authority.outputLineage?.map(
      (l) => `${l.label} [${l.packagingMode}]: ${l.sourceExpressionTypes.join('+')}`,
    ) ?? [];
  const themeHandoff = buildExperienceThemeHandoffLines(input.authority);
  const contentHandoff = buildExperienceContentHandoffLines(input.authority);
  const expansionHandoff = buildOpusFunctionalExpansionHandoffLines(
    state.pipelineSet?.functionalExpansionIntelligence,
  );
  const contract: PageExperienceExpressionContract = {
    ...input.contract,
    overlayPatterns: [
      ...input.contract.overlayPatterns,
      'EXPERIENCE VISUAL PACKAGE:',
      ...packagingLines,
      ...lineageLines,
      ...visualLabels,
      'EXPERIENCE THEME CONTINUITY:',
      ...themeHandoff,
      'EXPERIENCE CONTENT MANIFESTS:',
      ...contentHandoff,
      'FUNCTIONAL EXPANSION INTELLIGENCE:',
      ...expansionHandoff,
      COMPOSER_EXPERIENCE_CONTENT_GUARD,
    ],
  };
  const expStatus =
    input.authority.status === 'PARTIAL_FAILURE' ? 'PARTIAL_FAILURE' : 'READY_FOR_REVIEW';
  const nextFamily: PageViewportAuthorityFamily = {
    ...family,
    experienceExpressionStatus: expStatus,
    experienceExpressionContractId: contract.contractId,
    experienceExpressionVersion: contract.version,
    updatedAt: new Date().toISOString(),
  };
  const nextState = patchPipeline(
    state,
    {
      experienceExpressionAuthority: input.authority,
      experienceExpressionContract: contract,
      viewportAuthorityFamily: nextFamily,
    },
    nextFamily,
  );
  return { state: nextState, jobs: [...input.jobs], generationStatus: nextState.generationStatus };
}

export function pageConceptMarkExperienceExpressionGenerationFailed(
  state: PageConceptGenerationState,
  reason: string,
): ViewportFamilyOrchestrationResult {
  const ps = state.pipelineSet;
  const family = ps?.viewportAuthorityFamily;
  const authority = ps?.experienceExpressionAuthority;
  const nextAuthority =
    authority ?
      {
        ...authority,
        status: 'FAILED' as const,
        behaviorContract: `${authority.behaviorContract}\n\nGENERATION FAILED: ${reason}`,
      }
    : null;
  const nextFamily: PageViewportAuthorityFamily | undefined =
    family ?
      {
        ...family,
        experienceExpressionStatus: 'FAILED',
        updatedAt: new Date().toISOString(),
      }
    : undefined;
  const nextState = patchPipeline(
    state,
    {
      experienceExpressionAuthority: nextAuthority,
      viewportAuthorityFamily: nextFamily ?? family ?? undefined,
    },
    nextFamily ?? family ?? undefined,
  );
  return { state: nextState, generationStatus: nextState.generationStatus };
}

/** @deprecated Use async FAL path via runPageConceptViewportFamilyAction */
export function pageConceptGenerateExperienceExpression(_state: PageConceptGenerationState): ViewportFamilyOrchestrationResult {
  throw new Error('EXPERIENCE_EXPRESSION_USE_ASYNC_GENERATION');
}

export function pageConceptApproveExperienceExpression(
  state: PageConceptGenerationState,
  experienceContract: PageExperienceExpressionContract,
): ViewportFamilyOrchestrationResult {
  const ps = state.pipelineSet;
  const family = ps?.viewportAuthorityFamily;
  if (!isMobileAuthorityConfirmed(family)) throw new Error('MOBILE_AUTHORITY_CONFIRMATION_REQUIRED');
  const authority = ps?.experienceExpressionAuthority;
  if (!authority || (authority.status !== 'READY_FOR_REVIEW' && authority.status !== 'PARTIAL_FAILURE')) {
    throw new Error('EXPERIENCE_ARTIFACT_REQUIRED');
  }
  if (authority.status === 'PARTIAL_FAILURE') {
    throw new Error('EXPERIENCE_PACKAGE_INCOMPLETE');
  }
  const falStates = authority.visualStates.filter((v) => v.sourceProvider === 'FAL_EXPERIENCE');
  if (authority.provider === 'FAL' && falStates.length > 0) {
    const missing = falStates.some((v) => !v.previewImageUri?.trim());
    if (missing) throw new Error('EXPERIENCE_FAL_IMAGES_REQUIRED');
  }
  if (authority.sourceConceptId !== (family!.confirmedMobileConceptId ?? family!.selectedMobileConceptId)) {
    throw new Error('EXPERIENCE_MOBILE_LINEAGE_MISMATCH');
  }
  const themeGate = experienceThemeContinuityBlocksApproval(authority);
  if (themeGate.blocked) {
    throw new Error(themeGate.code ?? 'EXPERIENCE_THEME_DRIFT');
  }
  const contentGate = experienceContentBlocksApproval(authority);
  if (contentGate.blocked) {
    throw new Error(contentGate.code ?? 'EXPERIENCE_CONTENT_INVENTED');
  }
  const coverageGate = experienceExpressionCoverageBlocksApproval({
    authority,
    pipelineSet: ps,
    functionContract: state.functionContract ?? null,
  });
  if (coverageGate.blocked) {
    throw new Error(coverageGate.code ?? 'EXPERIENCE_COVERAGE_INCOMPLETE');
  }
  const approvedAt = new Date().toISOString();
  const themeHandoff = buildExperienceThemeHandoffLines(authority);
  const contentHandoff = buildExperienceContentHandoffLines(authority);
  const coverageHandoff =
    authority.experienceExpressionCoverageMap ?
      buildExperienceExpressionCoverageHandoffLines(authority.experienceExpressionCoverageMap)
    : [];
  const approved: PageExperienceExpressionContract = {
    ...experienceContract,
    approvedAt,
    overlayPatterns: [
      ...experienceContract.overlayPatterns,
      'EXPERIENCE THEME CONTINUITY:',
      ...themeHandoff,
      'EXPERIENCE CONTENT MANIFESTS:',
      ...contentHandoff,
      ...coverageHandoff,
      ...nestedNavContractHandoffLines(),
      COMPOSER_EXPERIENCE_CONTENT_GUARD,
    ],
  };
  const approvedAuthority = {
    ...authority,
    status: 'APPROVED' as const,
    approvedAt,
  };
  const nextFamily: PageViewportAuthorityFamily = {
    ...family!,
    experienceExpressionContractId: approved.contractId,
    experienceExpressionVersion: approved.version,
    experienceExpressionStatus: 'APPROVED',
    experienceApprovedAt: approvedAt,
    status: 'EXPERIENCE_DEFINED',
    updatedAt: approvedAt,
  };
  const nextState = patchPipeline(
    state,
    {
      experienceExpressionContract: approved,
      experienceExpressionAuthority: approvedAuthority,
      viewportAuthorityFamily: nextFamily,
    },
    nextFamily,
  );
  return { state: nextState, generationStatus: nextState.generationStatus };
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
  if (!state.pipelineSet?.experienceExpressionContract?.approvedAt) {
    throw new Error('EXPERIENCE_EXPRESSION_APPROVAL_REQUIRED');
  }
  family = invalidateApprovalIfNeeded(family);
  const nextFamily: PageViewportAuthorityFamily = {
    ...family,
    tabletInterpretationId: input.interpretationId,
    tabletArtifactId: input.job.artifactId,
    tabletVersion: input.version,
    status: 'TABLET_READY',
    updatedAt: new Date().toISOString(),
  };
  const nextState = patchPipeline(state, { viewportAuthorityFamily: nextFamily }, nextFamily);
  return { state: nextState, jobs: [input.job], generationStatus: nextState.generationStatus };
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
  const nextState = patchPipeline(state, { viewportAuthorityFamily: nextFamily }, nextFamily);
  return { state: nextState, jobs: [input.job], generationStatus: nextState.generationStatus };
}

export function pageConceptApproveViewportFamily(state: PageConceptGenerationState): ViewportFamilyOrchestrationResult {
  const ps = state.pipelineSet;
  const family = ps?.viewportAuthorityFamily;
  if (!family?.mobileArtifactId || !family.tabletArtifactId || !family.desktopArtifactId) {
    throw new Error('VIEWPORT_FAMILY_INCOMPLETE');
  }
  if (!ps?.experienceExpressionContract?.approvedAt) throw new Error('EXPERIENCE_EXPRESSION_REQUIRED');
  const approvalId = `pvfa-${family.familyId}-${Date.now()}`;
  const nextFamily: PageViewportAuthorityFamily = {
    ...family,
    viewportFamilyApprovalId: approvalId,
    status: 'APPROVED',
    updatedAt: new Date().toISOString(),
  };
  const skin = compileProjectSkinContract(state.projectId);
  const bundle = compilePageFamilyContractBundle({
    projectId: state.projectId,
    pageId: state.pageId,
    parentPageRole: state.functionContract?.route ?? 'parent-page',
    sourceViewportFamilyId: family.familyId,
    experienceContract: ps.experienceExpressionContract,
    skinContract: skin,
    cgptBrief: ps.cgptCreativeBrief!,
    functionContract: state.functionContract!,
  });
  const blueprint = compilePageFamilyBlueprint({
    projectId: state.projectId,
    parentPageId: state.pageId,
    sourceViewportFamilyId: family.familyId,
    skinContract: bundle.contract,
    experienceContract: ps.experienceExpressionContract,
    cgptBrief: ps.cgptCreativeBrief!,
    functionContract: state.functionContract!,
  });
  const review = buildPageSystemReviewModel(state.projectId, state.pageId, 'MOBILE');
  const validation = validatePageFamilyBlueprint(blueprint, review);
  if (!validation.ok) throw new Error(validation.code);
  if (blueprint.hierarchyReceipt.hierarchyDiscoveryStatus !== 'RESOLVED') {
    throw new Error(blueprint.hierarchyReceipt.blockedReason ?? 'PAGE_FAMILY_HIERARCHY_INCOMPLETE');
  }
  const interactionMap = compilePageFamilyInteractionMap({
    blueprint,
    experienceContract: ps.experienceExpressionContract,
    functionContract: state.functionContract!,
  });
  const shellKinds = mapArchetypesToOpusShellKinds(blueprint);
  const representativeShellSet = createOpusRepresentativeShellSet(bundle.contract.contractId, shellKinds);
  const nextState = patchPipeline(
    state,
    {
      viewportAuthorityFamily: nextFamily,
      pageFamilySkinBehaviorContract: bundle.contract,
      pageFamilyBlueprint: blueprint,
      pageFamilyInteractionMap: interactionMap,
      opusPageFamilyHandoff: null,
      pageFamilyComponentExpressionMap: bundle.componentMap,
      opusRepresentativeShellSet: representativeShellSet,
      twinShellApprovalId: null,
      twinImplementationPackage: null,
    },
    nextFamily,
  );
  return { state: nextState, generationStatus: nextState.generationStatus };
}

export function pageConceptApprovePageFamilyBlueprint(
  state: PageConceptGenerationState,
): ViewportFamilyOrchestrationResult {
  const ps = state.pipelineSet;
  const family = ps?.viewportAuthorityFamily;
  const blueprint = ps?.pageFamilyBlueprint;
  const contract = ps?.pageFamilySkinBehaviorContract;
  if (!family?.viewportFamilyApprovalId || family.status !== 'APPROVED') {
    throw new Error('VIEWPORT_FAMILY_APPROVAL_REQUIRED');
  }
  if (!blueprint) throw new Error('PAGE_FAMILY_BLUEPRINT_REQUIRED');
  if (blueprint.approvedAt) throw new Error('PAGE_FAMILY_BLUEPRINT_ALREADY_APPROVED');
  const review = buildPageSystemReviewModel(state.projectId, state.pageId, 'MOBILE');
  const validation = validatePageFamilyBlueprint(blueprint, review);
  if (!validation.ok) throw new Error(validation.code);
  if (!contract) throw new Error('PAGE_FAMILY_CONTRACT_REQUIRED');
  const approvedBlueprint = { ...blueprint, approvedAt: new Date().toISOString() };
  const approvedContract: PageFamilySkinBehaviorContract = {
    ...contract,
    approvedAt: new Date().toISOString(),
  };
  let interactionMap = ps.pageFamilyInteractionMap;
  if (!interactionMap || interactionMap.blueprintId !== blueprint.blueprintId) {
    interactionMap = compilePageFamilyInteractionMap({
      blueprint: approvedBlueprint,
      experienceContract: ps.experienceExpressionContract,
      functionContract: state.functionContract!,
    });
  }
  const ixValidation = validatePageFamilyInteractionMap(interactionMap, approvedBlueprint);
  if (!ixValidation.ok) throw new Error(ixValidation.code);

  const nextState = patchPipeline(state, {
    pageFamilyBlueprint: approvedBlueprint,
    pageFamilySkinBehaviorContract: approvedContract,
    pageFamilyInteractionMap: interactionMap,
    opusPageFamilyHandoff: null,
  });
  return { state: nextState, generationStatus: nextState.generationStatus };
}

export function pageConceptApprovePageFamilyInteractionMap(
  state: PageConceptGenerationState,
): ViewportFamilyOrchestrationResult {
  const ps = state.pipelineSet;
  const family = ps?.viewportAuthorityFamily;
  const blueprint = ps?.pageFamilyBlueprint;
  const map = ps?.pageFamilyInteractionMap;
  if (!family?.viewportFamilyApprovalId || family.status !== 'APPROVED') {
    throw new Error('VIEWPORT_FAMILY_APPROVAL_REQUIRED');
  }
  if (!blueprint?.approvedAt) throw new Error('PAGE_FAMILY_BLUEPRINT_APPROVAL_REQUIRED');
  if (!map) throw new Error('PAGE_FAMILY_INTERACTION_MAP_REQUIRED');
  if (map.approvedAt) throw new Error('PAGE_FAMILY_INTERACTION_MAP_ALREADY_APPROVED');
  const validation = validatePageFamilyInteractionMap(map, blueprint);
  if (!validation.ok) throw new Error(validation.code);
  const approvedMap = {
    ...map,
    approvedAt: new Date().toISOString(),
    buildReadiness: buildPageFamilyBuildReadiness({ blueprint, interactionMap: { ...map, approvedAt: new Date().toISOString() } }),
  };
  const handoff = buildOpusPageFamilyHandoff({
    blueprint,
    viewportFamilyId: family.familyId,
    interactionMap: approvedMap,
  });
  const nextState = patchPipeline(state, {
    pageFamilyInteractionMap: approvedMap,
    opusPageFamilyHandoff: handoff,
  });
  return { state: nextState, generationStatus: nextState.generationStatus };
}

export function pageConceptApprovePageFamilySkinBehavior(
  state: PageConceptGenerationState,
): ViewportFamilyOrchestrationResult {
  const ps = state.pipelineSet;
  const family = ps?.viewportAuthorityFamily;
  const contract = ps?.pageFamilySkinBehaviorContract;
  const blueprint = ps?.pageFamilyBlueprint;
  if (!family?.viewportFamilyApprovalId || family.status !== 'APPROVED') {
    throw new Error('VIEWPORT_FAMILY_APPROVAL_REQUIRED');
  }
  if (!blueprint?.approvedAt) throw new Error('PAGE_FAMILY_BLUEPRINT_APPROVAL_REQUIRED');
  if (!ps?.opusPageFamilyHandoff) throw new Error('OPUS_PAGE_FAMILY_HANDOFF_REQUIRED');
  if (!contract) throw new Error('PAGE_FAMILY_CONTRACT_REQUIRED');
  if (contract.approvedAt) {
    return { state, generationStatus: state.generationStatus };
  }
  const approved: PageFamilySkinBehaviorContract = {
    ...contract,
    approvedAt: new Date().toISOString(),
  };
  const nextState = patchPipeline(state, { pageFamilySkinBehaviorContract: approved });
  return { state: nextState, generationStatus: nextState.generationStatus };
}

export function pageConceptMarkOpusRepresentativeShellsReady(
  state: PageConceptGenerationState,
): ViewportFamilyOrchestrationResult {
  const ps = state.pipelineSet;
  const set = ps?.opusRepresentativeShellSet;
  const contract = ps?.pageFamilySkinBehaviorContract;
  if (!ps?.pageFamilyBlueprint?.approvedAt) throw new Error('PAGE_FAMILY_BLUEPRINT_APPROVAL_REQUIRED');
  if (!ps?.pageFamilyInteractionMap?.approvedAt) throw new Error('PAGE_FAMILY_INTERACTION_MAP_APPROVAL_REQUIRED');
  if (!ps?.opusPageFamilyHandoff) throw new Error('OPUS_PAGE_FAMILY_HANDOFF_REQUIRED');
  if (!contract?.approvedAt) throw new Error('PAGE_FAMILY_CONTRACT_APPROVAL_REQUIRED');
  if (!set) throw new Error('REPRESENTATIVE_SHELL_SET_REQUIRED');
  assertOpusShellTargetSurface('TWIN');
  const ready = markOpusRepresentativeShellsReady(set);
  return {
    state: patchPipeline(state, { opusRepresentativeShellSet: ready }),
    generationStatus: state.generationStatus,
  };
}

export function pageConceptLockViewportFamily(state: PageConceptGenerationState): ViewportFamilyOrchestrationResult {
  const ps = state.pipelineSet;
  const family = ps?.viewportAuthorityFamily;
  if (!family?.viewportFamilyApprovalId) throw new Error('FAMILY_APPROVAL_REQUIRED');
  if (!ps?.pageFamilyBlueprint?.approvedAt) throw new Error('PAGE_FAMILY_BLUEPRINT_APPROVAL_REQUIRED');
  if (!ps?.opusPageFamilyHandoff) throw new Error('OPUS_PAGE_FAMILY_HANDOFF_REQUIRED');
  if (!ps?.pageFamilySkinBehaviorContract?.approvedAt) throw new Error('PAGE_FAMILY_CONTRACT_APPROVAL_REQUIRED');
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
  const familyContract = ps?.pageFamilySkinBehaviorContract;
  const componentMap = ps?.pageFamilyComponentExpressionMap;
  const shellSet = ps?.opusRepresentativeShellSet;
  if (!ps?.pageFamilyBlueprint?.approvedAt) throw new Error('PAGE_FAMILY_BLUEPRINT_APPROVAL_REQUIRED');
  if (!ps?.opusPageFamilyHandoff) throw new Error('OPUS_PAGE_FAMILY_HANDOFF_REQUIRED');
  if (!familyContract?.approvedAt) throw new Error('PAGE_FAMILY_CONTRACT_APPROVAL_REQUIRED');
  if (!componentMap || !shellSet) throw new Error('PAGE_FAMILY_CONTRACT_BUNDLE_INCOMPLETE');
  if (!shellSet.readyAt || shellSet.shells.some((s) => s.status !== 'READY')) {
    throw new Error('OPUS_REPRESENTATIVE_SHELLS_NOT_READY');
  }

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
    pageFamilySkinBehaviorContractId: familyContract.contractId,
    pageFamilyBlueprintId: ps!.pageFamilyBlueprint!.blueprintId,
    pageFamilyInteractionMapId: ps!.pageFamilyInteractionMap!.mapId,
    opusPageFamilyHandoffId: ps!.opusPageFamilyHandoff!.handoffId,
    pageFamilyComponentExpressionMapId: componentMap.mapId,
    representativeShellSetId: shellSet.setId,
    designDivergenceRulesSummary: `parent=${familyContract.inheritanceRules.parent.designDivergenceLevel};child=${familyContract.inheritanceRules.child.designDivergenceLevel};grandchild=${familyContract.inheritanceRules.grandchild.designDivergenceLevel}`,
    responsiveInheritanceRulesSummary: [
      familyContract.responsiveInheritance.mobile[0],
      familyContract.responsiveInheritance.tablet[0],
      familyContract.responsiveInheritance.desktop[0],
    ].join(' | '),
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

export function pageConceptDecideFunctionalExpansion(
  state: PageConceptGenerationState,
  expansionId: string,
  decision: 'APPROVE' | 'REJECT' | 'DEFER',
): ViewportFamilyOrchestrationResult {
  const ps = state.pipelineSet;
  const intelligence = ps?.functionalExpansionIntelligence;
  if (!intelligence) throw new Error('FUNCTIONAL_EXPANSION_INTELLIGENCE_REQUIRED');
  const nextIntelligence = applyFounderFunctionalExpansionDecision(intelligence, expansionId, decision);
  let blueprint = ps?.pageFamilyBlueprint ?? null;
  let proposedInteractions = ps?.functionalExpansionProposedInteractions ?? [];
  if (decision === 'APPROVE' && blueprint) {
    const propagated = propagateApprovedExpansionToFamily({
      intelligence: nextIntelligence,
      blueprint,
      interactionMap: ps?.pageFamilyInteractionMap ?? null,
      expansionId,
    });
    blueprint = propagated.blueprint;
    proposedInteractions = [...proposedInteractions, ...propagated.proposedInteractionRecords];
  }
  const composerFunctionalExpansionContracts = buildComposerExpansionImplementationContracts(nextIntelligence);
  return {
    state: patchPipeline(state, {
      functionalExpansionIntelligence: nextIntelligence,
      pageFamilyBlueprint: blueprint ?? ps?.pageFamilyBlueprint ?? null,
      functionalExpansionProposedInteractions: proposedInteractions,
      composerFunctionalExpansionContracts,
    }),
    generationStatus: state.generationStatus,
  };
}

export function pageConceptTabletArtifactIdForFamily(familyId: string): string {
  return tabletInterpretationArtifactId(familyId);
}

export function pageConceptDesktopArtifactIdForFamily(familyId: string): string {
  return desktopInterpretationArtifactId(familyId);
}
