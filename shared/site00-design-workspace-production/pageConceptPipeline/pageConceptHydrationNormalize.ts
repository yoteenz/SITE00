/**
 * P0.VR.PAGE-CONCEPT-FOUNDER-START-AND-PROGRESS-EVENTS1 — panel open must not inherit stale RUNNING.
 */

import type { PageConceptGenerationState } from './types.js';
import { recoverStalePageConceptInFlightGenerationState } from './pageConceptInFlightRecovery.js';

export function normalizePageConceptStateOnPanelMount(
  state: PageConceptGenerationState,
  hasFounderRunSession: boolean,
): PageConceptGenerationState {
  return recoverStalePageConceptInFlightGenerationState(state, hasFounderRunSession);
}
