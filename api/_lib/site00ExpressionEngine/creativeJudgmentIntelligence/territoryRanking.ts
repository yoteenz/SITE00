/**
 * Autonomous Creative Director — territory ranking + kill logic.
 */

import type {
  TerritoryCandidate,
  TerritoryRanking,
} from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';

function scoreTerritory(t: TerritoryCandidate): number {
  let s = 50;
  if (t.mechanism.includes('→')) s += 15;
  if (t.visualWorld.length > 15) s += 10;
  if (!t.conceptName.toLowerCase().includes('variant')) s += 10;
  if (t.oneSentenceIdea.includes('confession') || t.oneSentenceIdea.includes('classified')) s += 10;
  if (t.conceptName.toLowerCase().includes('shelf') || t.conceptName.toLowerCase().includes('cool')) s -= 20;
  return s;
}

export function rankTerritories(territories: TerritoryCandidate[]): TerritoryRanking {
  const scored = territories.map((t) => ({ t, score: scoreTerritory(t) }));
  scored.sort((a, b) => b.score - a.score);
  const strongest = scored[0]!.t;
  const weakest = scored[scored.length - 1]!.t;
  const safest = [...scored].sort((a, b) => (a.t.conceptName.includes('VARIANT') ? 1 : 0) - (b.t.conceptName.includes('VARIANT') ? 1 : 0))[0]!.t;
  const mostObvious = territories.find((t) => t.conceptName.toLowerCase().includes('shelf')) ?? weakest;
  const mostRisky = territories.find((t) => t.emotionalArc.includes('ACCOUNTABILITY')) ?? strongest;

  return {
    strongestTerritoryId: strongest.territoryId,
    safestTerritoryId: safest.territoryId,
    mostObviousTerritoryId: mostObvious.territoryId,
    mostBrandSpecificTerritoryId: strongest.territoryId,
    mostRiskyTerritoryId: mostRisky.territoryId,
    killFirstTerritoryId: weakest.territoryId,
    reasons: {
      [strongest.territoryId]: 'Highest mechanism + world integration',
      [weakest.territoryId]: 'Weakest mechanism or obvious first answer',
      [mostObvious.territoryId]: 'Polished but predictable territory',
    },
  };
}
