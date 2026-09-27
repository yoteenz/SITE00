/**
 * Preserve founder mobile authority selection/confirmation across server gallery mount and navigation.
 */

import type { PageViewportAuthorityFamily } from './pageConceptViewportAuthorityFamily.js';
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
  return {
    ...mergedPs,
    selectedMobileConceptId: localPs.selectedMobileConceptId ?? mergedPs.selectedMobileConceptId,
    viewportAuthorityFamily: localPs.viewportAuthorityFamily ?? mergedPs.viewportAuthorityFamily,
    experienceExpressionAuthority: localPs.experienceExpressionAuthority ?? mergedPs.experienceExpressionAuthority,
    experienceExpressionContract: localPs.experienceExpressionContract ?? mergedPs.experienceExpressionContract,
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
