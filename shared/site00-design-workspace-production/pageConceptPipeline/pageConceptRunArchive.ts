/**
 * P0.VR.PAGE-CONCEPT-POST-RUN-RESTART-CONTROLS1 — preserve completed runs/branches.
 */

import type {
  PageConceptArchivedRun,
  PageConceptGenerationState,
  PageConceptPipelineSet,
} from './types.js';

export function nextPageConceptArchiveLabel(archivedCount: number): string {
  return `RUN ${String(archivedCount + 1).padStart(2, '0')}`;
}

export function archivePageConceptRunBranch(
  state: PageConceptGenerationState,
  input: {
    reason: string;
    pipelineSet?: PageConceptPipelineSet | null;
    generationJobs?: PageConceptGenerationState['generationJobs'];
    runId?: string | null;
  },
): PageConceptGenerationState {
  const pipelineSet = input.pipelineSet ?? state.pipelineSet;
  if (!pipelineSet) return state;

  const archivedRuns = state.archivedRuns ?? [];
  const label = nextPageConceptArchiveLabel(archivedRuns.length);
  const entry: PageConceptArchivedRun = {
    archiveId: `pcar-${pipelineSet.pipelineSetId}`,
    runId: input.runId ?? state.activeGenerationRunId ?? pipelineSet.pipelineSetId,
    pipelineSetId: pipelineSet.pipelineSetId,
    archivedAt: new Date().toISOString(),
    label,
    reason: input.reason,
    generationStatus: state.generationStatus,
    pipelineSet,
    generationJobs: [...(input.generationJobs ?? state.generationJobs)],
  };

  return {
    ...state,
    archivedRuns: [...archivedRuns, entry],
    activeReviewRunId: pipelineSet.pipelineSetId,
    history: [
      ...state.history,
      {
        type: 'page_concept_run_archived',
        at: entry.archivedAt,
        summary: `${label} · ${input.reason} · ${pipelineSet.creativeInjection?.injectionId ?? 'no-cgpt'}`,
      },
    ],
  };
}

export function pageConceptRunHistoryLines(state: PageConceptGenerationState): string[] {
  const lines: string[] = [];
  for (const run of state.archivedRuns ?? []) {
    const cgpt = run.pipelineSet.creativeInjection?.injectionId ?? '—';
    const gpt2 = run.pipelineSet.gpt2AuthorityConcept?.conceptId ?? '—';
    const ready = run.generationJobs.filter((j) => j.status === 'READY').length;
    lines.push(`${run.label} · CGPT ${cgpt} · GPT2 ${gpt2} · NBP ${ready}/6 · ${run.generationStatus}`);
  }
  if (state.pipelineSet) {
    const cgpt = state.pipelineSet.creativeInjection?.injectionId ?? '—';
    const gpt2 = state.pipelineSet.gpt2AuthorityConcept?.conceptId ?? '—';
    const ready = state.generationJobs.filter((j) => j.status === 'READY').length;
    lines.push(
      `ACTIVE REVIEW · ${state.pipelineSet.pipelineSetId} · CGPT ${cgpt} · GPT2 ${gpt2} · NBP ${ready}/6 · ${state.generationStatus}`,
    );
  }
  return lines;
}
