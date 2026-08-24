import { describe, expect, it } from 'vitest';
import {
  countCurrentVoiceLabItems,
  countPriorVoiceLabItems,
  filterVoiceLabRounds,
  listSupersededClipsFromLatestRound,
  resolveLatestNeuralRoundId,
  canGenerateNextNeuralRound,
  nextNeuralRoundUnlockHint,
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

  it('unlocks next round on CLOSE/YES without judging all voices', () => {
    const neuralRounds = [
      { roundId: 'r1', roundNumber: 1, isNeuralRound: true, status: 'READY_FOR_JUDGMENT' as const },
    ];
    const params = {
      rounds: neuralRounds as never,
      latestNeuralRoundId: 'r1',
      neuralCandidates: [{ founderStatus: 'CLOSE' as const }],
    };
    expect(canGenerateNextNeuralRound(params as never)).toBe(true);
    expect(nextNeuralRoundUnlockHint(params as never)).toBeNull();
  });

  it('unlocks next round when latest neural round is JUDGMENTS_COMPLETE', () => {
    const params = {
      rounds: [{ roundId: 'r1', roundNumber: 1, isNeuralRound: true, status: 'JUDGMENTS_COMPLETE' as const }],
      latestNeuralRoundId: 'r1',
      neuralCandidates: [{ founderStatus: 'UNTESTED' as const }],
    };
    expect(canGenerateNextNeuralRound(params as never)).toBe(true);
  });

  it('shows hint when round incomplete and no CLOSE/YES', () => {
    const params = {
      rounds: [{ roundId: 'r1', roundNumber: 1, isNeuralRound: true, status: 'READY_FOR_JUDGMENT' as const }],
      latestNeuralRoundId: 'r1',
      neuralCandidates: [{ founderStatus: 'UNTESTED' as const }],
    };
    expect(canGenerateNextNeuralRound(params as never)).toBe(false);
    expect(nextNeuralRoundUnlockHint(params as never)).toContain('CLOSE');
  });
});
