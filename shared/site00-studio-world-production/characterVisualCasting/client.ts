/** Browser-safe visual casting exports (no node:crypto consumers in UI bundle). */

import type { CharacterVisualCastingState } from './types.js';

export {
  CASTING_PRIMARY_JUDGMENTS,
  CASTING_DEEPER_JUDGMENTS,
  DEFAULT_CASTING_CANDIDATE_COUNT,
  CHARACTER_VISUAL_CASTING_VERSION,
} from './constants.js';
export { FOUNDER_CASTING_REFERENCE_ROLES, CHARACTER_BIBLE_REVIEW_TABS } from './constants.js';
export type {
  CharacterPipelineState,
  CharacterVisualCastingState,
  CharacterCastingCandidate,
  CharacterCastingRound,
  CastingPrimaryJudgment,
  VisualCastingReadinessEvaluation,
  FounderCharacterRecognitionConfirmed,
  FounderCastingReference,
  FounderCastingReferenceRole,
  CharacterReferenceDecomposition,
  CharacterBibleReviewTab,
  CharacterBibleAssetPack,
  ActiveCastingReferenceAuthority,
} from './types.js';

export function discoveryShouldShowRecognizedNotCalibration(state: CharacterVisualCastingState): boolean {
  return state.founderIKnowHerConfirmed && !state.reopenCalibrationAcknowledged;
}

export function isCastingPlaceholderPreviewUrl(previewUrl: string | null | undefined): boolean {
  if (!previewUrl) return false;
  return previewUrl.includes('/api/placeholder/');
}

/** True when every candidate in the round still has a placeholder (or missing) preview URL. */
export function castingRoundNeedsFalRetry(state: CharacterVisualCastingState, roundId?: string): boolean {
  const round = roundId ? state.rounds.find((entry) => entry.roundId === roundId) : state.rounds.at(-1);
  if (!round) return false;
  const candidates = state.candidates.filter((entry) => entry.roundId === round.roundId);
  if (candidates.length === 0) return false;
  return candidates.every((entry) => !entry.previewUrl || isCastingPlaceholderPreviewUrl(entry.previewUrl));
}

export function castingFalGenerationInProgress(state: CharacterVisualCastingState): boolean {
  return Boolean(
    state.falGenerationTracking?.status === 'RUNNING' ||
      (!state.castingCandidatesReady && state.rounds.some((entry) => entry.status === 'GENERATING')),
  );
}

export function castingFalGenerationFailed(state: CharacterVisualCastingState): boolean {
  return state.falGenerationTracking?.status === 'FAILED';
}
