/**
 * P0.5E.3 — Cultural life foundation — generic, culturally neutral infrastructure.
 */

import { randomId } from './id.js';
import type { CulturalLifeFoundation } from './types.js';

export function buildCulturalLifeFoundation(
  overrides: Partial<CulturalLifeFoundation> = {},
): CulturalLifeFoundation {
  return {
    foundationId: randomId('cul'),
    generationalContext: overrides.generationalContext ?? 'TBD — client adapter',
    geographicInfluences: overrides.geographicInfluences ?? [],
    culturalReferenceFluency: overrides.culturalReferenceFluency ?? [],
    culturalBlindSpots: overrides.culturalBlindSpots ?? [],
    thingsSheResearchesInsteadOfPretending: overrides.thingsSheResearchesInsteadOfPretending ?? [],
    codeSwitchingBehavior: overrides.codeSwitchingBehavior ?? 'TBD — discovery',
    culturallyNeutral: overrides.culturallyNeutral ?? true,
  };
}

export function genericStudioWorldCulturallyNeutral(foundation: CulturalLifeFoundation): boolean {
  return foundation.culturallyNeutral === true;
}
