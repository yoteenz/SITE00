import { applyCastingGenerationFailure, applyCastingGenerationResults } from './castingEngine.js';
import {
  hydrateImageReferenceAssetsFromGeneration,
  hydrateImageReferenceAssetsFromGenerationFailure,
  syncCanonicalAnchorFromCharacterIsolate,
} from './imageReferenceCasting.js';
import { syncPipelineState } from './stateMachine.js';
import type { CharacterVisualCastingState } from './types.js';

function hasRealPreview(url: string | null | undefined): boolean {
  return Boolean(url && !url.includes('/api/placeholder/'));
}

/**
 * Recover casting state when rounds/isolates are stuck in GENERATING without an active FAL job.
 */
export function reconcileOrphanedCastingGenerationState(state: CharacterVisualCastingState): CharacterVisualCastingState {
  if (state.falGenerationTracking?.status === 'RUNNING') return state;

  const generatingRound = [...state.rounds].reverse().find((round) => round.status === 'GENERATING');
  if (generatingRound) {
    const candidates = state.candidates.filter((candidate) => candidate.roundId === generatingRound.roundId);
    const results = candidates
      .filter((candidate) => hasRealPreview(candidate.previewUrl))
      .map((candidate) => ({
        candidateId: candidate.candidateId,
        previewUrl: candidate.previewUrl!,
        outputAssetId: candidate.outputAssetId ?? candidate.previewUrl!,
      }));

    if (results.length > 0) {
      return applyCastingGenerationResults({
        state,
        roundId: generatingRound.roundId,
        results,
        model: generatingRound.model,
      });
    }

    return applyCastingGenerationFailure({
      state,
      roundId: generatingRound.roundId,
      errorMessage: 'Generation did not complete — tap retry to run FAL again.',
    });
  }

  const isolate = state.characterIsolate;
  if (isolate?.status === 'GENERATING' && !hasRealPreview(isolate.previewUrl)) {
    const candidate = state.candidates.find((entry) => entry.candidateId === isolate.candidateId);
    if (candidate && hasRealPreview(candidate.previewUrl)) {
      return syncCanonicalAnchorFromCharacterIsolate(
        hydrateImageReferenceAssetsFromGeneration({ state, roundId: isolate.roundId }),
      );
    }

    if (state.rounds.some((round) => round.roundId === isolate.roundId)) {
      return syncCanonicalAnchorFromCharacterIsolate(
        hydrateImageReferenceAssetsFromGenerationFailure({ state, roundId: isolate.roundId }),
      );
    }

    return syncCanonicalAnchorFromCharacterIsolate(
      syncPipelineState({
        ...state,
        characterIsolate: {
          ...isolate,
          status: 'REVIEW',
        },
      }),
    );
  }

  return state;
}
