/**
 * C1.1 — Concept collapse / orthogonality gate for territory candidates.
 */

import type {
  CreativeTerritoryCandidate,
  MinimalCreativeBrief,
} from '../../../../shared/site00-expression-engine/creative-director/types.js';

const ENTRY_001_SURFACE = ['broadcast', 'television', 'vintage tv', 'media complicity', 'britney'];
const ENTRY_002_SURFACE = [
  'phone portal',
  'edit suite',
  'nostalgia edit',
  '2016',
  'baddie',
  'archive scroll',
  'same woman',
  'glitch snap',
  'investigator scroll',
];

export function scoreTerritorySimilarityToPriorEntries(
  territory: Pick<CreativeTerritoryCandidate, 'name' | 'world' | 'artifact' | 'narrativeMechanism' | 'visualMechanism'>,
  _brief: MinimalCreativeBrief,
): { entry001: number; entry002: number } {
  const blob = `${territory.name} ${territory.world} ${territory.artifact} ${territory.narrativeMechanism} ${territory.visualMechanism}`.toLowerCase();
  const entry001Hits = ENTRY_001_SURFACE.filter((s) => blob.includes(s)).length;
  const entry002Hits = ENTRY_002_SURFACE.filter((s) => blob.includes(s)).length;
  return {
    entry001: Math.min(1, entry001Hits / 2),
    entry002: Math.min(1, entry002Hits / 3),
  };
}

export function applyConceptCollapseGate(territories: CreativeTerritoryCandidate[]): {
  passed: CreativeTerritoryCandidate[];
  rejected: Array<{ territoryId: string; reason: string }>;
} {
  const passed: CreativeTerritoryCandidate[] = [];
  const rejected: Array<{ territoryId: string; reason: string }> = [];

  for (const t of territories) {
    if (t.similarityToEntry001 >= 0.5 || t.similarityToEntry002 >= 0.5) {
      rejected.push({ territoryId: t.territoryId, reason: 'TOO_CLOSE_TO_PRIOR_ENTRY' });
      continue;
    }
    passed.push(t);
  }

  const names = new Set<string>();
  for (const t of passed) {
    if (names.has(t.world.toLowerCase())) {
      rejected.push({ territoryId: t.territoryId, reason: 'CONCEPT_COLLAPSE_DUPLICATE_WORLD' });
    } else {
      names.add(t.world.toLowerCase());
    }
  }

  const dedupedPassed = passed.filter(
    (t) => !rejected.some((r) => r.territoryId === t.territoryId && r.reason.includes('COLLAPSE')),
  );

  return { passed: dedupedPassed.length ? dedupedPassed : territories.slice(0, 4), rejected };
}

export function territoriesAreDivergent(territories: CreativeTerritoryCandidate[]): boolean {
  if (territories.length < 4) return false;
  const worlds = new Set(territories.map((t) => t.world));
  return worlds.size >= Math.min(territories.length, 4);
}
