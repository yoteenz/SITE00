/** Browser-safe visual casting exports (no node:crypto consumers in UI bundle). */

import type { CharacterVisualCastingState } from './types.js';

export {
  CASTING_PRIMARY_JUDGMENTS,
  CASTING_DEEPER_JUDGMENTS,
  DEFAULT_CASTING_CANDIDATE_COUNT,
  CHARACTER_VISUAL_CASTING_VERSION,
} from './constants.js';
export type {
  CharacterPipelineState,
  CharacterVisualCastingState,
  CharacterCastingCandidate,
  CharacterCastingRound,
  CastingPrimaryJudgment,
  VisualCastingReadinessEvaluation,
  FounderCharacterRecognitionConfirmed,
} from './types.js';

export function discoveryShouldShowRecognizedNotCalibration(state: CharacterVisualCastingState): boolean {
  return state.founderIKnowHerConfirmed && !state.reopenCalibrationAcknowledged;
}
