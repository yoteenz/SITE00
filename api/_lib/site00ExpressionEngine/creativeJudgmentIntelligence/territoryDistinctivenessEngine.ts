/**
 * TerritoryDistinctivenessEngine — cousin / duplicate detection.
 */

import type {
  TerritoryCandidate,
  TerritoryDistinctivenessResult,
} from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function similarity(a: string, b: string): number {
  const aw = new Set(normalize(a).split(/\s+/));
  const bw = new Set(normalize(b).split(/\s+/));
  let overlap = 0;
  for (const w of aw) if (bw.has(w)) overlap++;
  return overlap / Math.max(aw.size, bw.size, 1);
}

export function compareTerritoryDistinctiveness(territories: TerritoryCandidate[]): TerritoryDistinctivenessResult {
  const cousinPairs: TerritoryDistinctivenessResult['cousinPairs'] = [];
  const duplicateGroups: string[][] = [];

  for (let i = 0; i < territories.length; i++) {
    for (let j = i + 1; j < territories.length; j++) {
      const a = territories[i]!;
      const b = territories[j]!;
      const mechSim = similarity(a.mechanism, b.mechanism);
      const arcSim = similarity(a.emotionalArc, b.emotionalArc);
      const worldSim = similarity(a.visualWorld, b.visualWorld);
      const argSim = similarity(a.argument, b.argument);
      const titleSim = similarity(a.conceptName, b.conceptName);
      const channelSame = a.channelTreatmentHash === b.channelTreatmentHash;

      if (mechSim > 0.75 && arcSim > 0.6) {
        cousinPairs.push({ a: a.territoryId, b: b.territoryId, reason: 'SAME MECHANISM + EMOTIONAL ARC' });
      } else if (argSim > 0.8 && titleSim < 0.4) {
        cousinPairs.push({ a: a.territoryId, b: b.territoryId, reason: 'SAME ARGUMENT WITH DIFFERENT TITLE' });
      } else if (worldSim > 0.85 && channelSame) {
        cousinPairs.push({ a: a.territoryId, b: b.territoryId, reason: 'SAME VISUAL WORLD + CHANNEL TREATMENT' });
      }

      if (mechSim > 0.9 && worldSim > 0.85 && argSim > 0.85) {
        duplicateGroups.push([a.territoryId, b.territoryId]);
      }
    }
  }

  const cousinRate = cousinPairs.length / Math.max(territories.length, 1);
  let outcome: TerritoryDistinctivenessResult['outcome'] = 'DISTINCT';
  let recommendation = 'Territories sufficiently distinct';

  if (duplicateGroups.length > 0 || cousinRate >= 0.6) {
    outcome = 'NEEDS_REGENERATION';
    recommendation = 'REGENERATE TERRITORY ARCHITECTURE — do not rewrite titles only';
  } else if (cousinPairs.length >= 2) {
    outcome = 'COUSINS';
    recommendation = 'Too many cousin territories — rebuild territory architecture';
  } else if (cousinPairs.length === 1) {
    outcome = 'COUSINS';
    recommendation = 'Review cousin pair before advancing both';
  }

  return { outcome, cousinPairs, duplicateGroups, recommendation };
}

export function buildFiveCousinTerritories(base: TerritoryCandidate): TerritoryCandidate[] {
  return Array.from({ length: 5 }, (_, i) => ({
    ...base,
    territoryId: `${base.territoryId}-cousin-${i + 1}`,
    conceptName: `${base.conceptName} VARIANT ${i + 1}`,
  }));
}
