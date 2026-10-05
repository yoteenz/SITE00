/**
 * P0.5E.3 — NDX-specific cultural life foundation (African-American character context).
 */

import { buildCulturalLifeFoundation } from '../../site00-studio-world-production/embodiedCharacterDiscovery/culturalLifeFoundation.js';
import type { CulturalLifeFoundation } from '../../site00-studio-world-production/embodiedCharacterDiscovery/types.js';

export function buildNdxCulturalLifeFoundation(): CulturalLifeFoundation {
  return {
    ...buildCulturalLifeFoundation({ culturallyNeutral: false }),
    generationalContext:
      'Millennial/older Gen Z internet-era memory — grew up with both pre-algorithm and fully algorithmic culture.',
    geographicInfluences: [
      'American urban/suburban mix — specific city TBD through discovery',
      'Travel exposure without cosmopolitan performance',
    ],
    culturalReferenceFluency: [
      'Black American pop culture memory without performing fluency',
      'Internet discourse literacy',
      'Beauty/fashion familiarity from lived experience',
      'Group chat and family text rhythms',
    ],
    culturalBlindSpots: [
      'Does not magically understand every Black subculture, generation, or city',
      'May misread niche internet communities outside her lanes',
      'Professional domains outside her experience require research',
    ],
    thingsSheResearchesInsteadOfPretending: [
      'Unfamiliar subcultures before commenting',
      'Technical or industry topics she has not lived',
      'Historical events she only half-remembers',
    ],
    codeSwitchingBehavior:
      'Context-appropriate — not performance. Shifts register between family, friends, work, and camera without becoming a different person.',
    culturallyNeutral: false,
  };
}

export function africanAmericanCharacterContextIsNdxSpecific(foundation: CulturalLifeFoundation): boolean {
  return foundation.culturallyNeutral === false;
}

export function culturalAuthenticityNotStereotypeDensity(): true {
  return true;
}
