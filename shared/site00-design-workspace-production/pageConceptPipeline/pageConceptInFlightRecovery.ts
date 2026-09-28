/**
 * Recover stale in-flight generation UI when no founder run session is active.
 */

import { pageConceptGenerationStateHasReadyMobileArtifacts } from './pageConceptGalleryHydration.js';
import { pageConceptReviewReady } from './pageConceptGeneratorBinding.js';
import { rehydrateViewportAuthorityFamilyFromPipelineSignals } from './pageConceptViewportAuthorityFamilyPersistence.js';
import { ensureGpt2MobileConceptCatalog } from './pageConceptGpt2MobileConceptCatalog.js';
import type { PageConceptGenerationState } from './types.js';

export function isPageConceptGenerationStatusInFlight(
  status: PageConceptGenerationState['generationStatus'],
): boolean {
  return (
    status === 'CGPT_RUNNING' ||
    status === 'CGPT_RATE_LIMITED' ||
    status === 'GPT2_RUNNING' ||
    status === 'NBP_RUNNING'
  );
}

export function recoverStalePageConceptInFlightGenerationState(
  state: PageConceptGenerationState,
  hasFounderRunSession: boolean,
): PageConceptGenerationState {
  if (hasFounderRunSession) return state;
  if (!isPageConceptGenerationStatusInFlight(state.generationStatus)) {
    return rehydrateViewportAuthorityFamilyFromPipelineSignals(ensureGpt2MobileConceptCatalog(state));
  }

  const mobileReady = pageConceptGenerationStateHasReadyMobileArtifacts(state);
  const hasInjection = Boolean(state.pipelineSet?.creativeInjection);
  const generationStatus =
    mobileReady && hasInjection ? 'GPT2_MOBILE_AWAITING_SELECTION'
    : pageConceptReviewReady(state.generationStatus) ? state.generationStatus
    : hasInjection && state.generationJobs.length > 0 ? 'READY_FOR_FOUNDER_REVIEW'
    : state.lastFailure ? 'FAILED'
    : state.generationStatus === 'PLANNED' ? 'PLANNED'
    : 'IDLE';

  return rehydrateViewportAuthorityFamilyFromPipelineSignals(
    ensureGpt2MobileConceptCatalog({
      ...state,
      generationStatus,
      activeGenerationStage: null,
      activeGenerationRunId: mobileReady ? state.activeGenerationRunId : null,
      activeGenerationRunStartedAt: null,
      liveProgress: null,
      cgptSubsteps: null,
    }),
  );
}
