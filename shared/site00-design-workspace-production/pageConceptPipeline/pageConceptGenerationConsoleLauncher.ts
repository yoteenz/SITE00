/**
 * P0.VR.DESIGN-WORKSPACE-CONCEPT-GALLERY-AND-GENERATOR-ENTRY-FIX1 — hero compare header launcher copy.
 */

import { pageConceptReviewReady } from './pageConceptGeneratorBinding.js';
import type { PageConceptGenerationState } from './types.js';

function stateHasReadyMobileArtifacts(state: PageConceptGenerationState): boolean {
  if (state.pipelineSet?.pipelineLineage !== 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE') {
    return state.generationJobs.some((j) => j.provider === 'GPT2_MOBILE' && j.status === 'READY');
  }
  const concepts = state.pipelineSet?.mobileConcepts ?? [];
  if (concepts.some((c) => c.status === 'READY')) return true;
  return state.generationJobs.some((j) => j.provider === 'GPT2_MOBILE' && j.status === 'READY');
}

export type PageConceptGenerationConsoleLauncher = {
  label: string;
  shortLabel: string;
  statusLine: string | null;
  testId: string;
  disabled: boolean;
};

export function resolvePageConceptGenerationConsoleLauncher(input: {
  state: PageConceptGenerationState;
  generating: boolean;
}): PageConceptGenerationConsoleLauncher {
  const { state, generating } = input;
  const readyCount =
    state.pipelineSet?.mobileConcepts?.filter((c) => c.status === 'READY').length ??
    state.generationJobs.filter((j) => j.provider === 'GPT2_MOBILE' && j.status === 'READY').length;
  const totalSlots = 3;

  if (generating) {
    return {
      label: 'VIEW GENERATION',
      shortLabel: 'GENERATION',
      statusLine: readyCount > 0 ? `GENERATION · ${readyCount}/${totalSlots} READY` : 'GENERATION RUNNING',
      testId: 'hero-generation-console-view',
      disabled: false,
    };
  }

  if (pageConceptReviewReady(state.generationStatus) || stateHasReadyMobileArtifacts(state)) {
    const selected =
      state.pipelineSet?.viewportAuthorityFamily?.selectedMobileConceptId ??
      state.pipelineSet?.selectedMobileConceptId ??
      null;
    return {
      label: selected ? 'VIEW RUN' : 'REVIEW GENERATION',
      shortLabel: selected ? 'RUN' : 'REVIEW',
      statusLine: readyCount >= totalSlots ? `REVIEW · ${totalSlots} READY` : `REVIEW · ${readyCount}/${totalSlots} READY`,
      testId: 'hero-generation-console-review',
      disabled: false,
    };
  }

  return {
    label: 'GENERATE',
    shortLabel: 'GENERATE',
    statusLine: null,
    testId: 'hero-generation-console-generate',
    disabled: false,
  };
}
