/**
 * C1.1 — Evaluate territories for story potential (Pass 05) and select winner (Pass 06).
 */

import type {
  CreativeTerritoryCandidate,
  MinimalCreativeBrief,
  TerritoryEvaluation,
  WinningCreativeDirection,
} from '../../../../shared/site00-expression-engine/creative-director/types.js';

function scoreTerritory(t: CreativeTerritoryCandidate, brief: MinimalCreativeBrief): TerritoryEvaluation {
  const priorDiff = 1 - Math.max(t.similarityToEntry001, t.similarityToEntry002);
  const causalStoryPotential = t.turnPotential.includes('receipt') || t.revealPotential.includes('contradict') ? 0.85 : 0.7;
  const revealPotential = t.revealPotential.length > 20 ? 0.8 : 0.55;
  const emotionalEscalation = t.emotionalTemperature.includes('→') ? 0.82 : 0.65;
  const turningPointPotential = t.turnPotential.length > 15 ? 0.88 : 0.6;
  const artifactUsefulness = t.artifactFunction.length > 20 ? 0.86 : 0.55;
  const characterRoleOpportunity = t.ndxRoleCandidate && t.subjectRoleCandidate ? 0.84 : 0.5;
  const worldFunction = t.worldFunction.length > 25 ? 0.87 : 0.58;
  const interjectionPotential = t.interjectionPotential.length > 10 ? 0.83 : 0.6;
  const payoffStrength = t.payoffPotential.length > 15 ? 0.85 : 0.62;
  const originality = priorDiff;
  const brandTruthFit = brief.brandTruth.toLowerCase().includes('receipt') ? 0.9 : 0.75;

  const weights = [
    causalStoryPotential,
    revealPotential,
    emotionalEscalation,
    turningPointPotential,
    artifactUsefulness,
    characterRoleOpportunity,
    worldFunction,
    interjectionPotential,
    payoffStrength,
    originality,
    brandTruthFit,
    priorDiff,
  ];
  const totalScore = weights.reduce((a, b) => a + b, 0) / weights.length;

  return {
    territoryId: t.territoryId,
    causalStoryPotential,
    revealPotential,
    emotionalEscalation,
    turningPointPotential,
    artifactUsefulness,
    characterRoleOpportunity,
    worldFunction,
    interjectionPotential,
    payoffStrength,
    originality,
    brandTruthFit,
    priorEntryDifference: priorDiff,
    totalScore,
    qualitativeReasoning: `${t.name} wins on story causality (${t.narrativeMechanism}) and prior-entry distance (${priorDiff.toFixed(2)}). World performs argument via ${t.worldFunction.slice(0, 60)}…`,
  };
}

export function evaluateCreativeTerritories(
  territories: CreativeTerritoryCandidate[],
  brief: MinimalCreativeBrief,
): TerritoryEvaluation[] {
  return territories
    .map((t) => scoreTerritory(t, brief))
    .sort((a, b) => b.totalScore - a.totalScore);
}

export function selectWinningCreativeDirection(
  territories: CreativeTerritoryCandidate[],
  evaluations: TerritoryEvaluation[],
  obviousSummary: string,
): { winner: CreativeTerritoryCandidate; direction: WinningCreativeDirection } {
  const ranked = evaluations.map((e) => ({
    eval: e,
    territory: territories.find((t) => t.territoryId === e.territoryId)!,
  }));
  const top = ranked[0]!;
  const runnerUps = ranked.slice(1, 4);

  return {
    winner: top.territory,
    direction: {
      territoryId: top.territory.territoryId,
      territoryName: top.territory.name,
      whyItWins: top.eval.qualitativeReasoning,
      whyOthersLost: runnerUps.map(
        (r) =>
          `${r.territory.name}: lower story/reveal score (${r.eval.totalScore.toFixed(2)}) — ${r.territory.whyItIsDistinct}`,
      ),
      deeperMeaning: top.territory.coreIdea,
      creativeRisk: top.eval.originality > 0.7 ? 'Moderate — distinct metaphor, requires receipt clarity' : 'Lower — watch for generic wellness critique',
      brandTruthFit: 'Receipt-first contradiction aligned with NDXBOOK chapter grammar',
      priorEntryDifference: `Distance from Entry 001 (${top.territory.similarityToEntry001}) and Entry 002 (${top.territory.similarityToEntry002}) surfaces`,
      whyNotObviousVersion: `Escapes obvious execution (${obviousSummary.slice(0, 80)}…) via ${top.territory.world}.`,
    },
  };
}
