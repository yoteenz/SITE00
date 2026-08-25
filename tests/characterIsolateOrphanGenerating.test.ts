/**
 * Orphan GENERATING state recovery for character casting / isolate.
 */

import { describe, expect, it } from 'vitest';
import { buildNdxFounderCharacterDiscoveryRun } from '../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxFounderDiscoveryRun.js';
import { buildCharacterTruthSnapshot } from '../shared/site00-studio-world-production/characterVisualCasting/characterTruthSnapshot.js';
import {
  decomposeFounderCastingReference,
  uploadFounderCastingReference,
} from '../shared/site00-studio-world-production/characterVisualCasting/founderReferenceIngestion.js';
import { generateCharacterIsolateRound } from '../shared/site00-studio-world-production/characterVisualCasting/imageReferenceCasting.js';
import { reconcileOrphanedCastingGenerationState } from '../shared/site00-studio-world-production/characterVisualCasting/orphanGenerationReconcile.js';
import { castingFalGenerationInProgress } from '../shared/site00-studio-world-production/characterVisualCasting/client.js';
import { buildEmptyVisualCastingState } from '../shared/site00-studio-world-production/characterVisualCasting/stateMachine.js';

function seedWithReference() {
  let state = buildEmptyVisualCastingState();
  const snapshot = buildCharacterTruthSnapshot({
    run: buildNdxFounderCharacterDiscoveryRun(),
    version: 1,
    lockedForCasting: true,
  });
  state = {
    ...state,
    visualCastingReady: true,
    founderIKnowHerConfirmed: true,
    characterTruthLockedForCasting: true,
    truthSnapshots: [snapshot],
    activeTruthSnapshotId: snapshot.snapshotId,
  };
  state = uploadFounderCastingReference(state, {
    previewUrl: 'https://storage.example.test/full-look.webp',
    storagePath: 'site00/character-casting-references/ndxbook/full-look.webp',
    role: 'FULL_LOOK',
    label: 'Founder preferred NDX',
  });
  state = decomposeFounderCastingReference(state, state.founderReferences[0]!.referenceId);
  return { state };
}

describe('orphan casting generation reconcile', () => {
  it('clears orphan GENERATING round when no FAL tracking is active', () => {
    const { state } = seedWithReference();
    const withIsolate = generateCharacterIsolateRound({ state, falConfigured: true, dispatchFal: true });
    expect(withIsolate.rounds.at(-1)?.status).toBe('GENERATING');
    expect(withIsolate.characterIsolate?.status).toBe('GENERATING');
    expect(castingFalGenerationInProgress(withIsolate)).toBe(false);

    const reconciled = reconcileOrphanedCastingGenerationState(withIsolate);
    expect(reconciled.rounds.at(-1)?.status).toBe('REVIEW_READY');
    expect(reconciled.characterIsolate?.status).toBe('REVIEW');
    expect(reconciled.falGenerationTracking?.status).toBe('FAILED');
  });

  it('does not reconcile while falGenerationTracking is RUNNING', () => {
    const { state } = seedWithReference();
    const withIsolate = generateCharacterIsolateRound({ state, falConfigured: true, dispatchFal: true });
    const running = {
      ...withIsolate,
      falGenerationTracking: {
        attemptId: 'attempt-1',
        roundId: withIsolate.rounds.at(-1)!.roundId,
        startedAt: new Date().toISOString(),
        status: 'RUNNING' as const,
        errorMessage: null,
      },
    };
    expect(reconcileOrphanedCastingGenerationState(running)).toBe(running);
  });
});
