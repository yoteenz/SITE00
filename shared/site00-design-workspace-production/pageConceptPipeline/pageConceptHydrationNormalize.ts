/**
 * P0.VR.PAGE-CONCEPT-FOUNDER-START-AND-PROGRESS-EVENTS1 — panel open must not inherit stale RUNNING.
 */

import type { PageConceptGenerationState } from './types.js';
import { pageConceptReviewReady } from './pageConceptGeneratorBinding.js';

export function normalizePageConceptStateOnPanelMount(
  state: PageConceptGenerationState,
  hasFounderRunSession: boolean,
): PageConceptGenerationState {
  if (hasFounderRunSession) return state;

  const inFlight =
    state.generationStatus === 'CGPT_RUNNING' ||
    state.generationStatus === 'CGPT_RATE_LIMITED' ||
    state.generationStatus === 'GPT2_RUNNING' ||
    state.generationStatus === 'NBP_RUNNING';

  if (!inFlight) return state;

  const generationStatus =
    pageConceptReviewReady(state.generationStatus) ? state.generationStatus
    : state.pipelineSet?.creativeInjection && state.generationJobs.length > 0 ?
      'READY_FOR_FOUNDER_REVIEW'
    : state.lastFailure ? 'FAILED'
    : state.generationStatus === 'PLANNED' ? 'PLANNED'
    : 'IDLE';

  return {
    ...state,
    generationStatus,
    activeGenerationStage: null,
    activeGenerationRunId: null,
    activeGenerationRunStartedAt: null,
    liveProgress: null,
    cgptSubsteps: null,
  };
}
