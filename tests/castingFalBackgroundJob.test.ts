/**
 * CAST NDX — orphaned FAL background job resume tests.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildEmptyVisualCastingState } from '../shared/site00-studio-world-production/characterVisualCasting/stateMachine.js';
import type { NdxFounderCharacterDiscoveryRun } from '../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/types.js';

const dispatchMock = vi.fn(async () => {
  const { buildEmptyVisualCastingState: empty } = await import(
    '../shared/site00-studio-world-production/characterVisualCasting/stateMachine.js'
  );
  const state = empty('ndxbook');
  return {
    ...state,
    visualCastingReady: true,
    castingCandidatesReady: true,
    falGenerationTracking: null,
    rounds: [{ roundId: 'round-1', roundNumber: 1, status: 'REVIEW_READY' } as never],
  };
});

vi.mock('../api/_lib/site00Evolve/characterVisualCasting/castingFalDispatch.js', () => ({
  dispatchCastingRoundFal: (...args: unknown[]) => dispatchMock(...args),
}));

vi.mock('../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryStoreAdapter.js', () => {
  let saved: NdxFounderCharacterDiscoveryRun | null = null;
  return {
    saveFounderCharacterDiscoveryRun: vi.fn(async (run: NdxFounderCharacterDiscoveryRun) => {
      saved = run;
      return run;
    }),
    __getSaved: () => saved,
    __setSaved: (run: NdxFounderCharacterDiscoveryRun | null) => {
      saved = run;
    },
  };
});

vi.mock('../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryService.js', () => ({
  getFounderCharacterDiscoveryState: vi.fn(async () => {
    const store = await import('../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryStoreAdapter.js');
    return (store as { __getSaved: () => NdxFounderCharacterDiscoveryRun | null }).__getSaved();
  }),
}));

describe('casting FAL background job orphan resume', () => {
  beforeEach(async () => {
    dispatchMock.mockClear();
    const store = await import('../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryStoreAdapter.js');
    const base = buildEmptyVisualCastingState('ndxbook');
    const run: NdxFounderCharacterDiscoveryRun = {
      projectId: 'ndxbook',
      visualCastingState: {
        ...base,
        visualCastingReady: true,
        castingCandidatesReady: false,
        falGenerationTracking: {
          attemptId: 'orphan-attempt',
          roundId: 'round-1',
          startedAt: new Date().toISOString(),
          status: 'RUNNING',
          errorMessage: null,
        },
        rounds: [
          {
            roundId: 'round-1',
            roundNumber: 1,
            characterId: 'ndx',
            characterTruthSnapshotId: base.activeTruthSnapshotId,
            candidateIds: [],
            generationContractId: null,
            provider: 'fal',
            model: 'test',
            costUsd: 0,
            createdAt: new Date().toISOString(),
            status: 'GENERATING',
            retainedTraits: [],
            variedTraits: [],
            rejectedTraits: [],
            basedOnPriorTruthSnapshotId: null,
          },
        ],
        candidates: [],
      },
    } as NdxFounderCharacterDiscoveryRun;
    (store as { __setSaved: (r: NdxFounderCharacterDiscoveryRun | null) => void }).__setSaved(run);
  });

  it('resumes orphaned RUNNING state on hydrate without waiting 45s', async () => {
    const { getVisualCastingState } = await import(
      '../api/_lib/site00Evolve/characterVisualCasting/characterVisualCastingService.js'
    );
    const result = await getVisualCastingState({ projectId: 'ndxbook' });
    expect(dispatchMock).toHaveBeenCalled();
    expect(result.visualCastingState?.falGenerationTracking).toBeNull();
  });
});
