/**
 * P0.VR.PAGE-CONCEPT-POST-RUN-RESTART-CONTROLS1
 */

import {
  pageConceptCanonicalGpt2MobileActive,
  pageConceptHasFailedNbpJobs,
  pageConceptReviewReady,
} from './pageConceptGeneratorBinding.js';
import { pageConceptInitialSpendNote, pageConceptLegacyNbpEnabled } from './pageConceptCanonicalPipeline.js';
import type { PageConceptGenerationState, PageConceptGenerationStatus } from './types.js';

export type PageConceptPostRunActionId =
  | 'view_renditions'
  | 'new_generation'
  | 'regenerate_cgpt'
  | 'regenerate_gpt2'
  | 'regenerate_nbp'
  | 'retry_failed_only'
  | 'view_run_history';

export type PageConceptPostRunAction = {
  id: PageConceptPostRunActionId;
  label: string;
  spendNote: string | null;
  testId: string;
};

export function pageConceptPostRunReviewActive(status: PageConceptGenerationStatus): boolean {
  return pageConceptReviewReady(status);
}

export function buildPageConceptPostRunActions(state: PageConceptGenerationState): PageConceptPostRunAction[] {
  if (!pageConceptPostRunReviewActive(state.generationStatus)) return [];

  const hasPipeline = Boolean(state.pipelineSet?.creativeInjection);
  const hasGpt2 = Boolean(state.pipelineSet?.gpt2AuthorityConcept);
  const failedNbp = pageConceptHasFailedNbpJobs(state);
  const readyJobs = state.generationJobs.filter((j) => j.status === 'READY').length;

  const canonical = pageConceptCanonicalGpt2MobileActive(state);
  const actions: PageConceptPostRunAction[] = [
    {
      id: 'view_renditions',
      label: canonical ? 'REVIEW OUTPUTS' : 'VIEW RENDITIONS',
      spendNote: null,
      testId: 'page-concept-view-renditions',
    },
    {
      id: 'new_generation',
      label: 'NEW GENERATION',
      spendNote: pageConceptLegacyNbpEnabled() ?
        '1 CGPT · 1 GPT2 · 6 NBP (legacy pipeline · staged approval gates apply)'
      : `${pageConceptInitialSpendNote()} (staged approval gates apply)`,
      testId: 'page-concept-new-generation',
    },
  ];

  if (hasPipeline) {
    actions.push({
      id: 'regenerate_cgpt',
      label: 'REGENERATE CGPT',
      spendNote: '1 CGPT call · new creative branch · prior branch archived',
      testId: 'page-concept-regenerate-cgpt',
    });
  }
  if (hasGpt2) {
    actions.push({
      id: 'regenerate_gpt2',
      label: 'REGENERATE GPT2',
      spendNote: '1 GPT2 call · reuses current CGPT brief · founder review before NBP',
      testId: 'page-concept-regenerate-gpt2',
    });
  }
  if (pageConceptLegacyNbpEnabled() && hasGpt2 && readyJobs > 0) {
    actions.push({
      id: 'regenerate_nbp',
      label: 'REGENERATE NBP',
      spendNote: '6 NBP jobs · reuses approved GPT2 authority · prior NBP preserved in history',
      testId: 'page-concept-regenerate-nbp',
    });
  }
  if (failedNbp) {
    actions.push({
      id: 'retry_failed_only',
      label: 'RETRY FAILED ONLY',
      spendNote: 'NBP jobs for failed slots only',
      testId: 'page-concept-retry-failed',
    });
  }
  if ((state.archivedRuns?.length ?? 0) > 0 || state.pipelineSet) {
    actions.push({
      id: 'view_run_history',
      label: 'VIEW RUN HISTORY',
      spendNote: null,
      testId: 'page-concept-view-run-history',
    });
  }

  return actions;
}

export function pageConceptPostRunPrimaryAction(
  actions: readonly PageConceptPostRunAction[],
): PageConceptPostRunAction | null {
  return actions.find((a) => a.id === 'view_renditions') ?? null;
}

export function pageConceptPostRunSecondaryAction(
  actions: readonly PageConceptPostRunAction[],
): PageConceptPostRunAction | null {
  return actions.find((a) => a.id === 'new_generation') ?? null;
}

export function pageConceptPostRunMoreActions(
  actions: readonly PageConceptPostRunAction[],
): PageConceptPostRunAction[] {
  const omit = new Set<PageConceptPostRunActionId>(['view_renditions', 'new_generation']);
  return actions.filter((a) => !omit.has(a.id));
}

export function pageConceptPostRunConfirmMessage(action: PageConceptPostRunAction): string {
  if (!action.spendNote) return `Proceed with ${action.label}?`;
  return `${action.label}\n\nExpected provider spend:\n${action.spendNote}\n\nConfirm to continue.`;
}

/** Spend confirm for NEW GENERATION when post-run footer actions are not built (e.g. mobile review). */
export function resolvePageConceptNewGenerationConfirmAction(
  postRunActions: readonly PageConceptPostRunAction[],
): PageConceptPostRunAction {
  const listed = postRunActions.find((a) => a.id === 'new_generation');
  if (listed) return listed;
  return {
    id: 'new_generation',
    label: 'NEW GENERATION',
    spendNote: pageConceptLegacyNbpEnabled() ?
      '1 CGPT · 1 GPT2 · 6 NBP (legacy pipeline · staged approval gates apply)'
    : `${pageConceptInitialSpendNote()} (staged approval gates apply)`,
    testId: 'page-concept-new-generation',
  };
}
