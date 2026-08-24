import { describe, expect, it } from 'vitest';
import {
  countCurrentVoiceLabItems,
  countPriorVoiceLabItems,
  filterVoiceLabRounds,
  listSupersededClipsFromLatestRound,
  resolveLatestNeuralRoundId,
} from './voiceLabTabs';

const rounds = [
  { roundId: 'r1', roundNumber: 1, isNeuralRound: true, castingMode: 'NEURAL' as const },
  { roundId: 'r2', roundNumber: 2, isNeuralRound: true, castingMode: 'NEURAL' as const },
  { roundId: 'p1', roundNumber: 1, isNeuralRound: false, castingMode: 'DEV_PLACEHOLDER' as const },
];

describe('voiceLabTabs', () => {
  it('resolves latest neural round', () => {
    expect(resolveLatestNeuralRoundId(rounds as never)).toBe('r2');
  });

  it('filters current vs prior rounds', () => {
    expect(
      filterVoiceLabRounds({ rounds: rounds as never, tab: 'CURRENT', latestNeuralRoundId: 'r2' }).map(
        (r) => r.roundId,
      ),
    ).toEqual(['r2']);
    expect(
      filterVoiceLabRounds({ rounds: rounds as never, tab: 'PRIOR', latestNeuralRoundId: 'r2' }).map(
        (r) => r.roundId,
      ),
    ).toEqual(['r1', 'p1']);
  });

  it('counts prior items including superseded revision clips', () => {
    const hypotheses = [
      { id: 'h1', roundId: 'r1', hypothesisLabel: 'A' },
      {
        id: 'h2',
        roundId: 'r2',
        hypothesisLabel: 'B',
        generationAssets: [
          { assetId: 'a1', audioUrl: 'u1', promptSnapshotId: 's1', lineageClassification: 'HISTORICAL' as const, createdAt: 't1' },
          { assetId: 'a2', audioUrl: 'u2', promptSnapshotId: 's2', lineageClassification: 'CURRENT' as const, createdAt: 't2' },
        ],
      },
    ];
    expect(
      countPriorVoiceLabItems({ rounds: rounds as never, hypotheses: hypotheses as never, latestNeuralRoundId: 'r2' }),
    ).toBe(2);
    expect(
      countCurrentVoiceLabItems({ rounds: rounds as never, hypotheses: hypotheses as never, latestNeuralRoundId: 'r2' }),
    ).toBe(1);
    expect(
      listSupersededClipsFromLatestRound({ hypotheses: hypotheses as never, latestNeuralRoundId: 'r2' }),
    ).toHaveLength(1);
  });
});
