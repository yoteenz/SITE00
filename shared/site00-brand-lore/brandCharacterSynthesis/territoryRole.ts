/**
 * Territory role reclassification — discoveries, not mutually exclusive personalities.
 */

import type { BrandCharacterTerritory } from '../brandCharacterTerritory/types.js';
import {
  NDXBOOK_SYNTHESIS_SOURCE_TERRITORY_NAMES,
} from './constants.js';
import type { CharacterTerritoryRole } from './types.js';

function normalizeTerritoryName(name: string): string {
  return name.trim().toLowerCase().replace(/^the\s+/, '');
}

export function isNdxbookSynthesisSourceTerritory(name: string): boolean {
  const n = normalizeTerritoryName(name);
  return NDXBOOK_SYNTHESIS_SOURCE_TERRITORY_NAMES.some(
    (src) => normalizeTerritoryName(src) === n,
  );
}

export function resolveTerritoryRole(params: {
  territory: BrandCharacterTerritory;
  founderJudgment?: BrandCharacterTerritory['founderJudgment'];
}): CharacterTerritoryRole {
  const judgment = params.founderJudgment ?? params.territory.founderJudgment;
  if (judgment === 'REFORM_SET') return 'REJECTED';
  if (judgment === 'NOT_NDXBOOK' || judgment === 'TOO_GENERIC') return 'REJECTED';

  const name = params.territory.name ?? '';
  if (isNdxbookSynthesisSourceTerritory(name)) return 'CHARACTER_COMPONENT';

  if (judgment === 'LOVE_THE_CHARACTER' || judgment === 'PROMISING_DEVELOP') {
    return 'WHOLE_CHARACTER_CANDIDATE';
  }
  if (judgment === 'TOO_CLOSE_TO_ANOTHER') return 'CHARACTER_TENSION_SOURCE';
  if (judgment === 'CULTURALLY_HOLLOW') return 'DEFERRED';
  return 'DEFERRED';
}

export function resolveNdxbookSynthesisSourceTerritories(
  characters: BrandCharacterTerritory[],
): BrandCharacterTerritory[] {
  const sources: BrandCharacterTerritory[] = [];
  for (const targetName of NDXBOOK_SYNTHESIS_SOURCE_TERRITORY_NAMES) {
    const target = normalizeTerritoryName(targetName);
    const match = characters.find((c) => normalizeTerritoryName(c.name ?? '') === target);
    if (match) sources.push(match);
  }
  return sources;
}

export function buildTerritoryRoleMap(
  characters: BrandCharacterTerritory[],
): Record<string, CharacterTerritoryRole> {
  const map: Record<string, CharacterTerritoryRole> = {};
  for (const t of characters) {
    if (t.id) map[t.id] = resolveTerritoryRole({ territory: t });
  }
  return map;
}

export function facultyHypothesisForTerritory(name: string): string {
  const n = normalizeTerritoryName(name);
  if (n.includes('cultural accomplice')) return 'SOCIAL + CULTURAL INSTINCT';
  if (n.includes('committed contrarian')) return 'JUDGMENT + CONVICTION';
  if (n.includes('relentless synthesizer')) return 'INTELLECT + CONNECTION';
  return 'PARTIAL CHARACTER DISCOVERY';
}

export function territoriesReclassifiedAsDiscoveries(): true {
  return true;
}
