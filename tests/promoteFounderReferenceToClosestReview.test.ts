/**
 * Promote founder reference to WHO FEELS CLOSEST review.
 */

import { describe, expect, it } from 'vitest';
import { buildCharacterTruthSnapshot } from '../shared/site00-studio-world-production/characterVisualCasting/characterTruthSnapshot.js';
import {
  decomposeFounderCastingReference,
  uploadFounderCastingReference,
} from '../shared/site00-studio-world-production/characterVisualCasting/founderReferenceIngestion.js';
import {
  isFounderReferenceReviewRound,
  promoteFounderReferenceToClosestReview,
} from '../shared/site00-studio-world-production/characterVisualCasting/promoteFounderReferenceToClosestReview.js';
import { applyCastingJudgment } from '../shared/site00-studio-world-production/characterVisualCasting/castingEngine.js';
import { buildEmptyVisualCastingState } from '../shared/site00-studio-world-production/characterVisualCasting/stateMachine.js';
import { buildNdxFounderCharacterDiscoveryRun } from '../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxFounderDiscoveryRun.js';

describe('promote founder reference to WHO FEELS CLOSEST', () => {
  function readyState() {
    const snapshot = buildCharacterTruthSnapshot({
      run: buildNdxFounderCharacterDiscoveryRun(),
      version: 1,
      lockedForCasting: true,
    });
    return {
      ...buildEmptyVisualCastingState(),
      visualCastingReady: true,
      truthSnapshots: [snapshot],
      activeTruthSnapshotId: snapshot.snapshotId,
    };
  }

  it('creates founder reference review round with uploaded preview as candidate', () => {
    let state = readyState();
    state = uploadFounderCastingReference(state, {
      previewUrl: 'https://example.test/lime-green-sneakers.webp',
      storagePath: 'site00/character-casting-references/ndxbook/lime.webp',
      role: 'FULL_LOOK',
      label: '9D425E27-F092-4058-9934-CBB4BD7CCDD6.PNG',
    });
    const referenceId = state.founderReferences[0]!.referenceId;
    state = decomposeFounderCastingReference(state, referenceId);
    state = promoteFounderReferenceToClosestReview(state, referenceId);

    const round = state.rounds.at(-1)!;
    expect(isFounderReferenceReviewRound(round)).toBe(true);
    expect(state.castingCandidatesReady).toBe(true);
    expect(state.activeReferenceAuthority?.referenceId).toBe(referenceId);

    const candidate = state.candidates.find((entry) => entry.roundId === round.roundId);
    expect(candidate?.previewUrl).toBe('https://example.test/lime-green-sneakers.webp');
    expect(candidate?.generationMode).toBe('FOUNDER_REFERENCE_REVIEW');
  });

  it('THATS HER on promoted reference locks selection and authority', () => {
    let state = readyState();
    state = uploadFounderCastingReference(state, {
      previewUrl: 'https://example.test/lime-green-sneakers.webp',
      storagePath: 'site00/character-casting-references/ndxbook/lime.webp',
      role: 'FULL_LOOK',
      label: 'lime sneakers',
    });
    const referenceId = state.founderReferences[0]!.referenceId;
    state = decomposeFounderCastingReference(state, referenceId);
    state = promoteFounderReferenceToClosestReview(state, referenceId);
    const candidateId = state.candidates.at(-1)!.candidateId;

    state = applyCastingJudgment({ state, candidateId, judgment: 'THATS_HER' });
    expect(state.selectedCandidateId).toBe(candidateId);
    expect(state.activeReferenceAuthority?.referenceId).toBe(referenceId);
  });
});
