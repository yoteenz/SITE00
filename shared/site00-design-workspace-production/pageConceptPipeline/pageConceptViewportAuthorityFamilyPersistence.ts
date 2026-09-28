/**
 * Preserve founder mobile authority selection/confirmation across server gallery mount and navigation.
 */

import type { ExperienceExpressionAuthority } from './experienceExpressionAuthority.js';
import { pickRicherExperienceExpressionAuthority } from './pageConceptExperienceReviewOpenPolicy.js';
import {
  pageConceptConfirmMobileAuthority,
  pageConceptSelectMobileConcept,
} from './pageConceptViewportFamilyOrchestration.js';
import type {
  PageExperienceExpressionPipelineStatus,
  PageViewportAuthorityFamily,
} from './pageConceptViewportAuthorityFamily.js';
import { isMobileAuthorityConfirmed } from './pageConceptViewportFamilyState.js';
import type { PageConceptGenerationState, PageConceptPipelineSet } from './types.js';

function familyProgressScore(family: PageViewportAuthorityFamily | null | undefined): number {
  if (!family?.selectedMobileConceptId) return 0;
  if (family.status === 'LOCKED') return 100;
  if (family.status === 'APPROVED') return 90;
  if (family.experienceExpressionStatus === 'APPROVED') return 85;
  if (family.experienceExpressionStatus === 'READY_FOR_REVIEW' || family.experienceExpressionStatus === 'GENERATING') {
    return 80;
  }
  if (family.mobileAuthorityStatus === 'CONFIRMED') return 70;
  if (family.mobileAuthorityStatus === 'SELECTED') return 50;
  return 10;
}

function familyUpdatedAtMs(family: PageViewportAuthorityFamily | null | undefined): number {
  const t = family?.updatedAt ? Date.parse(family.updatedAt) : 0;
  return Number.isFinite(t) ? t : 0;
}

/** True when local founder progress must not be replaced by an older server pipeline snapshot. */
export function shouldPreserveLocalViewportAuthorityFamilyProgress(
  local: PageConceptGenerationState,
  merged: PageConceptGenerationState,
): boolean {
  const localFamily = local.pipelineSet?.viewportAuthorityFamily;
  const mergedFamily = merged.pipelineSet?.viewportAuthorityFamily;
  if (!localFamily?.selectedMobileConceptId) return false;
  const localScore = familyProgressScore(localFamily);
  const mergedScore = familyProgressScore(mergedFamily);
  if (localScore > mergedScore) return true;
  if (localScore < mergedScore) return false;
  if (localFamily.mobileAuthorityStatus === 'CONFIRMED' && mergedFamily?.mobileAuthorityStatus !== 'CONFIRMED') {
    return true;
  }
  return familyUpdatedAtMs(localFamily) > familyUpdatedAtMs(mergedFamily);
}

function mergePipelineSetPreservingLocalProgress(
  localPs: PageConceptPipelineSet,
  mergedPs: PageConceptPipelineSet,
): PageConceptPipelineSet {
  const experienceExpressionAuthority = pickRicherExperienceExpressionAuthority(
    localPs.experienceExpressionAuthority,
    mergedPs.experienceExpressionAuthority,
  );
  const experienceExpressionContract =
    experienceExpressionAuthority === localPs.experienceExpressionAuthority ?
      (localPs.experienceExpressionContract ?? mergedPs.experienceExpressionContract)
    : (mergedPs.experienceExpressionContract ?? localPs.experienceExpressionContract);
  const viewportAuthorityFamily =
    experienceExpressionAuthority === mergedPs.experienceExpressionAuthority &&
    mergedPs.viewportAuthorityFamily?.experienceExpressionStatus &&
    (mergedPs.viewportAuthorityFamily.experienceExpressionStatus === 'READY_FOR_REVIEW' ||
      mergedPs.viewportAuthorityFamily.experienceExpressionStatus === 'PARTIAL_FAILURE' ||
      mergedPs.viewportAuthorityFamily.experienceExpressionStatus === 'APPROVED') ?
      mergedPs.viewportAuthorityFamily
    : (localPs.viewportAuthorityFamily ?? mergedPs.viewportAuthorityFamily);
  return {
    ...mergedPs,
    selectedMobileConceptId: localPs.selectedMobileConceptId ?? mergedPs.selectedMobileConceptId,
    viewportAuthorityFamily,
    experienceExpressionAuthority,
    experienceExpressionContract,
    twinImplementationPackage: localPs.twinImplementationPackage ?? mergedPs.twinImplementationPackage,
    pageFamilyBlueprint: localPs.pageFamilyBlueprint ?? mergedPs.pageFamilyBlueprint,
    pageFamilyInteractionMap: localPs.pageFamilyInteractionMap ?? mergedPs.pageFamilyInteractionMap,
    pageFamilySkinBehaviorContract: localPs.pageFamilySkinBehaviorContract ?? mergedPs.pageFamilySkinBehaviorContract,
    opusRepresentativeShellSet: localPs.opusRepresentativeShellSet ?? mergedPs.opusRepresentativeShellSet,
    viewportAuthorityFamilyLock: localPs.viewportAuthorityFamilyLock ?? mergedPs.viewportAuthorityFamilyLock,
  };
}

/**
 * After applying a Supabase server run for gallery mount, re-apply local viewport-family founder progress
 * when it is ahead of the durable run (select/confirm/experience steps are client-only today).
 */
export function preserveLocalViewportAuthorityFamilyProgressAfterServerMerge(
  local: PageConceptGenerationState,
  merged: PageConceptGenerationState,
): PageConceptGenerationState {
  if (!local.pipelineSet || !merged.pipelineSet) return merged;
  if (!shouldPreserveLocalViewportAuthorityFamilyProgress(local, merged)) return merged;

  const pipelineSet = mergePipelineSetPreservingLocalProgress(local.pipelineSet, merged.pipelineSet);
  const generationStatus =
    familyProgressScore(local.pipelineSet.viewportAuthorityFamily) >= familyProgressScore(merged.pipelineSet.viewportAuthorityFamily) ?
      local.generationStatus
    : merged.generationStatus;

  return {
    ...merged,
    pipelineSet,
    generationStatus,
    liveProgress: local.liveProgress ?? merged.liveProgress,
    activeGenerationStage: local.activeGenerationStage ?? merged.activeGenerationStage,
  };
}

/** Discovery score boost so equivalent storage keys prefer confirmed mobile authority. */
export function viewportAuthorityFamilyDiscoveryScoreBoost(state: PageConceptGenerationState): number {
  const family = state.pipelineSet?.viewportAuthorityFamily;
  if (!family?.selectedMobileConceptId) return 0;
  if (family.mobileAuthorityStatus === 'CONFIRMED') return 2e13;
  if (family.mobileAuthorityStatus === 'SELECTED') return 1e13;
  return 0;
}

function mapAuthorityStatusToFamilyExperienceStatus(
  authority: ExperienceExpressionAuthority | null | undefined,
): PageExperienceExpressionPipelineStatus | null {
  if (!authority?.status || authority.status === 'NOT_STARTED' || authority.status === 'SUPERSEDED') {
    return null;
  }
  if (authority.status === 'APPROVED') return 'APPROVED';
  if (authority.status === 'READY_FOR_REVIEW') return 'READY_FOR_REVIEW';
  if (authority.status === 'PARTIAL_FAILURE') return 'PARTIAL_FAILURE';
  if (authority.status === 'GENERATING') return 'GENERATING';
  if (authority.status === 'FAILED') return 'FAILED';
  return null;
}

function inferDurableMobileConceptId(ps: PageConceptPipelineSet): string | null {
  const family = ps.viewportAuthorityFamily;
  return (
    family?.confirmedMobileConceptId ??
    family?.selectedMobileConceptId ??
    ps.selectedMobileConceptId ??
    ps.experienceExpressionContract?.selectedMobileConceptId ??
    ps.experienceExpressionAuthority?.sourceConceptId ??
    null
  );
}

function shouldTreatMobileAuthorityAsConfirmed(ps: PageConceptPipelineSet, conceptId: string): boolean {
  const family = ps.viewportAuthorityFamily;
  if (family?.mobileAuthorityStatus === 'CONFIRMED') return true;
  if (family?.confirmedMobileConceptId === conceptId) return true;
  if (family?.mobileAuthorityConfirmedByFounder) return true;
  if (family?.tabletArtifactId || family?.desktopArtifactId) return true;
  const auth = ps.experienceExpressionAuthority;
  if (
    auth?.sourceConceptId === conceptId &&
    auth.status !== 'NOT_STARTED' &&
    auth.status !== 'SUPERSEDED'
  ) {
    return true;
  }
  if (ps.experienceExpressionContract?.selectedMobileConceptId === conceptId) return true;
  return false;
}

function patchFamilyExperienceFieldsFromAuthority(
  state: PageConceptGenerationState,
): PageConceptGenerationState {
  const ps = state.pipelineSet;
  const family = ps?.viewportAuthorityFamily;
  const authority = ps?.experienceExpressionAuthority ?? null;
  const expStatus = mapAuthorityStatusToFamilyExperienceStatus(authority);
  if (!ps || !family || !expStatus) return state;
  if (family.experienceExpressionStatus === expStatus) return state;
  const contract = ps.experienceExpressionContract;
  return {
    ...state,
    pipelineSet: {
      ...ps,
      viewportAuthorityFamily: {
        ...family,
        experienceExpressionStatus: expStatus,
        experienceExpressionContractId: contract?.contractId ?? family.experienceExpressionContractId,
        experienceExpressionVersion: contract?.version ?? family.experienceExpressionVersion,
        experienceApprovedAt:
          expStatus === 'APPROVED' ?
            (contract?.approvedAt ?? family.experienceApprovedAt ?? authority?.approvedAt ?? null)
          : family.experienceApprovedAt,
        updatedAt: new Date().toISOString(),
      },
    },
  };
}

/**
 * Cold browser / server gallery mount: rebuild viewportAuthorityFamily from durable pipelineSet signals
 * (selectedMobileConceptId, experienceExpressionAuthority, contracts) when the family object was stripped.
 */
export function rehydrateViewportAuthorityFamilyFromPipelineSignals(
  state: PageConceptGenerationState,
): PageConceptGenerationState {
  const ps = state.pipelineSet;
  if (!ps?.mobileConcepts?.length || !ps.cgptCreativeBrief) return state;

  const conceptId = inferDurableMobileConceptId(ps);
  if (!conceptId) return patchFamilyExperienceFieldsFromAuthority(state);

  const mobile = ps.mobileConcepts.find((c) => c.conceptId === conceptId);
  if (!mobile) return patchFamilyExperienceFieldsFromAuthority(state);

  const family = ps.viewportAuthorityFamily;
  const mobileBound =
    family?.selectedMobileConceptId === conceptId && Boolean(family.mobileArtifactId ?? mobile.artifactId);
  const inferConfirmed = shouldTreatMobileAuthorityAsConfirmed(ps, conceptId);
  const confirmedOk = mobileBound && isMobileAuthorityConfirmed(family);
  const selectedOk = mobileBound && !inferConfirmed && family?.mobileAuthorityStatus === 'SELECTED';

  if (confirmedOk || selectedOk) {
    return patchFamilyExperienceFieldsFromAuthority({
      ...state,
      pipelineSet: {
        ...ps,
        selectedMobileConceptId: ps.selectedMobileConceptId ?? conceptId,
      },
    });
  }

  let next = state;
  const needsSelect = !mobileBound;
  const needsConfirm = inferConfirmed && !isMobileAuthorityConfirmed(next.pipelineSet?.viewportAuthorityFamily);

  try {
    if (needsSelect) {
      next = pageConceptSelectMobileConcept(next, conceptId).state;
    }
    if (needsConfirm) {
      next = pageConceptConfirmMobileAuthority(next).state;
    } else if (needsSelect && !inferConfirmed) {
      // selectedMobileConceptId at pipeline root without confirm — selection only
    }
  } catch {
    return patchFamilyExperienceFieldsFromAuthority(state);
  }

  const psNext = next.pipelineSet;
  if (psNext && !psNext.selectedMobileConceptId) {
    next = {
      ...next,
      pipelineSet: { ...psNext, selectedMobileConceptId: conceptId },
    };
  }

  return patchFamilyExperienceFieldsFromAuthority(next);
}
