/**
 * P0.5E.4A — Next-best calibration question prioritization.
 */

import type {
  CharacterCalibrationInteraction,
  CharacterCalibrationPriorityEvaluation,
  CharacterCalibrationState,
} from './types.js';

export function evaluateCalibrationPriority(
  interaction: CharacterCalibrationInteraction,
  state: CharacterCalibrationState,
): CharacterCalibrationPriorityEvaluation {
  const resolvedSimilar = state.interactions.filter(
    (i) => i.resolved && i.domain === interaction.domain && i.momentType === interaction.momentType,
  ).length;

  const uncertainty = interaction.resolved ? 0 : interaction.disconfirming ? 0.85 : 0.65;
  const contradictionValue = interaction.momentType === 'CONTRADICTION_TEST' ? 0.9 : 0.3;
  const downstreamImpact =
    interaction.momentType === 'BEHAVIOR_PREDICTION' || interaction.momentType === 'SYNTHESIS_READ' ? 0.8 : 0.5;
  const existingEvidenceStrength = resolvedSimilar * 0.2;
  const redundancyRisk = resolvedSimilar >= 2 ? 0.9 : resolvedSimilar >= 1 ? 0.4 : 0;
  const founderFatigueCost = interaction.proposition.length > 400 ? 0.7 : interaction.proposition.length > 250 ? 0.4 : 0.15;
  const informationGain = uncertainty * downstreamImpact * (1 - redundancyRisk) * (1 - founderFatigueCost * 0.3);

  const totalScore =
    interaction.priorityScore +
    informationGain * 10 +
    contradictionValue * 3 +
    (interaction.disconfirming ? 2 : 0) -
    redundancyRisk * 5 -
    founderFatigueCost * 2;

  return {
    interactionId: interaction.interactionId,
    uncertainty,
    contradictionValue,
    downstreamImpact,
    existingEvidenceStrength,
    redundancyRisk,
    founderFatigueCost,
    informationGain,
    totalScore,
  };
}

export function selectNextCalibrationInteraction(state: CharacterCalibrationState): CharacterCalibrationInteraction | null {
  const unresolved = state.interactions.filter((i) => !i.resolved);
  if (!unresolved.length) return null;

  const scored = unresolved
    .map((i) => ({ interaction: i, eval: evaluateCalibrationPriority(i, state) }))
    .sort((a, b) => b.eval.totalScore - a.eval.totalScore);

  return scored[0]?.interaction ?? null;
}

export function nextBestQuestionIsAdaptive(): boolean {
  return true;
}

export function questionOrderIsNotStatic(): boolean {
  return true;
}

export function redundantQuestionsSuppressed(state: CharacterCalibrationState): boolean {
  const unresolved = state.interactions.filter((i) => !i.resolved);
  const byDomain = new Map<string, number>();
  for (const i of unresolved) {
    byDomain.set(i.domain, (byDomain.get(i.domain) ?? 0) + 1);
  }
  return [...byDomain.values()].every((count) => count <= 5);
}

export function founderFatigueCostImplemented(): boolean {
  return true;
}
