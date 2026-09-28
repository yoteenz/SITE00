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
  const cataloged = ensureGpt2MobileConceptCatalog(state);
  if (!isPageConceptGenerationStatusInFlight(cataloged.generationStatus)) {
    const mobileReadyIdle = pageConceptGenerationStateHasReadyMobileArtifacts(cataloged);
    const hasInjection = Boolean(cataloged.pipelineSet?.creativeInjection);
    if (mobileReadyIdle && hasInjection) {
      return rehydrateViewportAuthorityFamilyFromPipelineSignals({
        ...cataloged,
        generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
        activeGenerationStage: null,
        activeGenerationRunStartedAt: null,
        liveProgress: null,
        cgptSubsteps: null,
      });
    }
    return rehydrateViewportAuthorityFamilyFromPipelineSignals(cataloged);
  }

  const mobileReady = pageConceptGenerationStateHasReadyMobileArtifacts(cataloged);
  const hasInjection = Boolean(cataloged.pipelineSet?.creativeInjection);
  const generationStatus =
    mobileReady && hasInjection ? 'GPT2_MOBILE_AWAITING_SELECTION'
    : pageConceptReviewReady(state.generationStatus) ? state.generationStatus
    : hasInjection && state.generationJobs.length > 0 ? 'READY_FOR_FOUNDER_REVIEW'
    : state.lastFailure ? 'FAILED'
    : state.generationStatus === 'PLANNED' ? 'PLANNED'
    : 'IDLE';

  return rehydrateViewportAuthorityFamilyFromPipelineSignals({
    ...cataloged,
    generationStatus,
    activeGenerationStage: null,
    activeGenerationRunId: mobileReady ? cataloged.activeGenerationRunId : null,
    activeGenerationRunStartedAt: null,
    liveProgress: null,
    cgptSubsteps: null,
  });
}
