/**
 * P0.VR.EXPERIENCE-PACKAGE-MULTI-OUTPUT-Dispatch-AND-REVIEW-FIX1
 */

import type { ExperienceExpressionAuthority, ExperienceExpressionVisualState } from './experienceExpressionAuthority.js';
import type { ExperiencePackagingPlan, ExpressionPromptType } from './pageConceptExperienceExpressionFalPlan.js';
import { isNdxbookOverviewExperiencePage } from './ndxbookOverviewExperienceExpressionContentSpec.js';

export type ExperienceGenerationJobStatus = 'PENDING' | 'GENERATING' | 'READY' | 'FAILED' | 'PRESERVED';

export type ExperienceGenerationJob = {
  jobId: string;
  experiencePackageId: string;
  expressionType: ExpressionPromptType | 'BASE_PAGE_AT_REST';
  stateId: string;
  sourceAuthorityId: string;
  promptId: string | null;
  provider: 'FAL_EXPERIENCE' | 'INHERITED_AUTHORITY';
  providerRequestId: string | null;
  status: ExperienceGenerationJobStatus;
  artifactId: string | null;
  error: string | null;
};

export type ExperiencePackageMaterializationReceipt = {
  rootCauseOfSingleOutput: 'DISPATCH_LOOP_TERMINATED_EARLY' | 'ONLY_FIRST_PROMPT_ENQUEUED' | 'NDXBOOK_ROUTE_NOT_RECOGNIZED' | 'OTHER' | null;
  plannedOutputCount: number;
  materializedOutputCount: number;
  inheritedOutputCount: number;
  falOutputCount: number;
  existingFalOutputs: number;
  newFalOutputsNeeded: number;
  ok: boolean;
  errors: readonly string[];
};

export const NDXBOOK_OVERVIEW_PLANNED_VISUAL_COUNT = 4;
export const NDXBOOK_OVERVIEW_FAL_OUTPUT_COUNT = 3;

export function expressionTypeForVisualState(state: ExperienceExpressionVisualState): ExpressionPromptType | 'BASE_PAGE_AT_REST' {
  const types = state.sourceExpressionTypes ?? [];
  if (types.length > 0) return types[0]!;
  if (state.sourceProvider === 'INHERITED_MOBILE') return 'BASE_PAGE_AT_REST';
  const label = (state.outputLabel ?? state.label).toUpperCase();
  if (label.includes('MENU') || label.includes('NAV')) return 'MENU_EXPANDED_NAV';
  if (label.includes('ENTRY') || label.includes('DETAIL') || label.includes('PANEL')) return 'PANEL_OR_DRAWER';
  if (label.includes('ACCESS') || label.includes('OVERLAY')) return 'OVERLAY_OR_DETAIL_STATE';
  return 'OVERLAY_OR_DETAIL_STATE';
}

export function validateExperiencePackagePlan(input: {
  plan: ExperiencePackagingPlan | null | undefined;
  projectId: string;
  route: string;
  pageId?: string;
  screenId?: string;
}): void {
  if (!input.plan?.groupedOutputs.length) {
    throw new Error('EXPERIENCE_PACKAGE_PLAN_INCOMPLETE');
  }
  if (
    !isNdxbookOverviewExperiencePage({
      projectId: input.projectId,
      route: input.route,
      pageId: input.pageId,
      screenId: input.screenId,
    })
  ) {
    return;
  }
  const plannedVisuals = input.plan.groupedOutputs.length + 1;
  if (plannedVisuals !== NDXBOOK_OVERVIEW_PLANNED_VISUAL_COUNT) {
    throw new Error('EXPERIENCE_PACKAGE_PLAN_INCOMPLETE');
  }
  if (input.plan.groupedOutputs.length !== NDXBOOK_OVERVIEW_FAL_OUTPUT_COUNT) {
    throw new Error('EXPERIENCE_PACKAGE_PLAN_INCOMPLETE');
  }
}

export function validateExperiencePackageMaterialization(
  authority: ExperienceExpressionAuthority | null | undefined,
): ExperiencePackageMaterializationReceipt {
  const errors: string[] = [];
  if (!authority) {
    return {
      rootCauseOfSingleOutput: 'OTHER',
      plannedOutputCount: 0,
      materializedOutputCount: 0,
      inheritedOutputCount: 0,
      falOutputCount: 0,
      existingFalOutputs: 0,
      newFalOutputsNeeded: 0,
      ok: false,
      errors: ['EXPERIENCE_AUTHORITY_MISSING'],
    };
  }

  const visualStates = authority.visualStates ?? [];
  const inherited = visualStates.filter((v) => v.sourceProvider === 'INHERITED_MOBILE');
  const falStates = visualStates.filter((v) => v.sourceProvider === 'FAL_EXPERIENCE');
  const materialized = visualStates.filter((v) => Boolean(v.previewImageUri?.trim()));
  const falReady = falStates.filter((v) => Boolean(v.previewImageUri?.trim()));

  const useNdxbook = isNdxbookOverviewExperiencePage({
    projectId: authority.projectId,
    route: authority.packagingPlan?.candidatePrompts[0]?.route ?? '',
    pageId: authority.pageId,
  });

  const plannedOutputCount =
    useNdxbook ? NDXBOOK_OVERVIEW_PLANNED_VISUAL_COUNT : visualStates.length;

  if (useNdxbook && visualStates.length !== NDXBOOK_OVERVIEW_PLANNED_VISUAL_COUNT) {
    errors.push('EXPERIENCE_VISUAL_STATE_COUNT_MISMATCH');
  }
  if (useNdxbook && falStates.length !== NDXBOOK_OVERVIEW_FAL_OUTPUT_COUNT) {
    errors.push('EXPERIENCE_FAL_STATE_COUNT_MISMATCH');
  }
  if (inherited.length < 1) {
    errors.push('EXPERIENCE_BASE_PAGE_MISSING');
  }
  for (const state of falStates) {
    if (!state.previewImageUri?.trim()) {
      errors.push(`EXPERIENCE_FAL_OUTPUT_MISSING:${state.stateId}`);
    }
  }

  const ok = errors.length === 0 && materialized.length >= plannedOutputCount;

  return {
    rootCauseOfSingleOutput:
      useNdxbook && falStates.length === 1 && plannedOutputCount === 4 ? 'NDXBOOK_ROUTE_NOT_RECOGNIZED' : null,
    plannedOutputCount,
    materializedOutputCount: materialized.length,
    inheritedOutputCount: inherited.length,
    falOutputCount: falStates.length,
    existingFalOutputs: falReady.length,
    newFalOutputsNeeded: Math.max(0, falStates.length - falReady.length),
    ok,
    errors,
  };
}

export function mergePreservedExperienceVisualStates(
  next: ExperienceExpressionAuthority,
  prior: ExperienceExpressionAuthority | null | undefined,
): ExperienceExpressionAuthority {
  if (!prior || prior.sourceConceptId !== next.sourceConceptId) return next;
  const priorById = new Map(prior.visualStates.map((v) => [v.stateId, v]));
  const visualStates = next.visualStates.map((state) => {
    const kept = priorById.get(state.stateId);
    if (!kept?.previewImageUri?.trim()) return state;
    if (state.sourceProvider === 'INHERITED_MOBILE') return state;
    return {
      ...state,
      previewImageUri: kept.previewImageUri,
      generatedArtifactId: kept.generatedArtifactId ?? state.generatedArtifactId,
      caption: kept.caption || state.caption,
      materializationStatus: 'READY' as const,
    };
  });
  const preservedJobs = prior.generationJobs ?? [];
  return {
    ...next,
    visualStates,
    generationJobs: preservedJobs,
    expressionAssetIds: [
      ...new Set([
        ...(next.expressionAssetIds ?? []),
        ...(prior.expressionAssetIds ?? []),
      ]),
    ],
  };
}

export function visualStateCardStatus(
  state: ExperienceExpressionVisualState,
  authorityStatus: ExperienceExpressionAuthority['status'],
): 'INHERITED' | 'READY' | 'GENERATING' | 'FAILED' {
  if (state.materializationStatus === 'FAILED') return 'FAILED';
  if (state.sourceProvider === 'INHERITED_MOBILE') return 'INHERITED';
  if (state.previewImageUri?.trim()) return 'READY';
  if (authorityStatus === 'GENERATING') return 'GENERATING';
  if (authorityStatus === 'PARTIAL_FAILURE' || authorityStatus === 'FAILED') return 'FAILED';
  return 'GENERATING';
}
