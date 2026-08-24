/**
 * Voice Lab tab filtering — separate current neural auditions from prior rounds/clips.
 */

import type {
  CharacterVoiceCalibrationRound,
  CharacterVoiceHypothesis,
} from '../../../shared/site00-studio-world-production/embodiedCharacterVoice/types.js';

export type VoiceLabTabId = 'CURRENT' | 'PRIOR';

export function resolveLatestNeuralRoundId(
  rounds: CharacterVoiceCalibrationRound[],
): string | null {
  const neural = rounds.filter((r) => r.isNeuralRound);
  if (!neural.length) return null;
  return neural.reduce((best, r) => (r.roundNumber > best.roundNumber ? r : best)).roundId;
}

export function filterVoiceLabRounds(params: {
  rounds: CharacterVoiceCalibrationRound[];
  tab: VoiceLabTabId;
  latestNeuralRoundId: string | null;
}): CharacterVoiceCalibrationRound[] {
  const { rounds, tab, latestNeuralRoundId } = params;
  if (!latestNeuralRoundId) {
    return tab === 'PRIOR' ? rounds : [];
  }
  if (tab === 'CURRENT') {
    return rounds.filter((r) => r.roundId === latestNeuralRoundId);
  }
  return rounds.filter((r) => r.roundId !== latestNeuralRoundId);
}

export function countPriorVoiceLabItems(params: {
  rounds: CharacterVoiceCalibrationRound[];
  hypotheses: CharacterVoiceHypothesis[];
  latestNeuralRoundId: string | null;
}): number {
  const priorRoundIds = new Set(
    filterVoiceLabRounds({
      rounds: params.rounds,
      tab: 'PRIOR',
      latestNeuralRoundId: params.latestNeuralRoundId,
    }).map((r) => r.roundId),
  );
  const priorHypotheses = params.hypotheses.filter((h) => priorRoundIds.has(h.roundId)).length;
  const supersededClips = params.latestNeuralRoundId
    ? params.hypotheses
        .filter((h) => h.roundId === params.latestNeuralRoundId)
        .reduce(
          (sum, h) =>
            sum + (h.generationAssets ?? []).filter((a) => a.lineageClassification === 'HISTORICAL').length,
          0,
        )
    : 0;
  return priorHypotheses + supersededClips;
}

export function countCurrentVoiceLabItems(params: {
  rounds: CharacterVoiceCalibrationRound[];
  hypotheses: CharacterVoiceHypothesis[];
  latestNeuralRoundId: string | null;
}): number {
  if (!params.latestNeuralRoundId) return 0;
  return params.hypotheses.filter((h) => h.roundId === params.latestNeuralRoundId).length;
}

export function listSupersededClipsFromLatestRound(params: {
  hypotheses: CharacterVoiceHypothesis[];
  latestNeuralRoundId: string | null;
}): Array<{
  hypothesisId: string;
  hypothesisLabel: string;
  assetId: string;
  audioUrl: string;
  createdAt: string;
}> {
  if (!params.latestNeuralRoundId) return [];
  const out: Array<{
    hypothesisId: string;
    hypothesisLabel: string;
    assetId: string;
    audioUrl: string;
    createdAt: string;
  }> = [];
  for (const hypo of params.hypotheses) {
    if (hypo.roundId !== params.latestNeuralRoundId) continue;
    for (const asset of hypo.generationAssets ?? []) {
      if (asset.lineageClassification !== 'HISTORICAL') continue;
      out.push({
        hypothesisId: hypo.id,
        hypothesisLabel: hypo.hypothesisLabel,
        assetId: asset.assetId,
        audioUrl: asset.audioUrl,
        createdAt: asset.createdAt,
      });
    }
  }
  return out;
}
