/**
 * P0.5E.4 — Uneven intelligence map.
 */

import { INTELLIGENCE_DIMENSIONS } from './constants.js';
import type { CharacterIntelligenceMap, IntelligenceDimension } from './types.js';

export function intelligenceCannotDefaultUniversallyHigh(map: CharacterIntelligenceMap): boolean {
  const values = INTELLIGENCE_DIMENSIONS.map((d) => map.dimensions[d]).filter((v) => v !== 'UNSET');
  if (values.length === 0) return true;
  const allStrong = values.every((v) => v === 'STRONG');
  return !allStrong;
}

export function intelligenceHasShape(map: CharacterIntelligenceMap): boolean {
  const hasStrong = INTELLIGENCE_DIMENSIONS.some((d) => map.dimensions[d] === 'STRONG');
  const hasWeak = INTELLIGENCE_DIMENSIONS.some((d) => map.dimensions[d] === 'WEAK');
  return hasStrong && hasWeak;
}

export function buildDefaultIntelligenceMap(): CharacterIntelligenceMap {
  const dimensions = {} as Record<IntelligenceDimension, 'STRONG' | 'AVERAGE' | 'WEAK' | 'UNSET'>;
  for (const d of INTELLIGENCE_DIMENSIONS) dimensions[d] = 'UNSET';
  return {
    mapId: 'intelligence-map-default',
    dimensions,
    embarrassinglyBadAt: [],
    falseConfidenceAreas: [],
    researchesInsteadOfPretending: [],
    couldTalkForHours: [],
    admitsNotKnowingEnough: [],
  };
}
