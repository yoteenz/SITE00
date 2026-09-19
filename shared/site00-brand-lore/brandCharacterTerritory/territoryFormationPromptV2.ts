/**
 * V2 compact territory formation prompt — divergent WHO possibilities, not full character system.
 */

import type { BrandCharacterIntelligenceSnapshot } from './types.js';

export const FORMATION_PROMPT_VERSION_V2 = 'BRAND_CHARACTER_TERRITORY_FORMATION_V2';

export const BRAND_CHARACTER_TERRITORY_DIRECTOR_SYSTEM_PROMPT_V2 = `You are the Brand Character Territory Director for Studio World.

Form ${6} genuinely different Brand Character TERRITORIES — compact governing possibilities for WHO the brand could be.

TERRITORY ≠ COMPLETE CHARACTER SYSTEM. Do NOT exhaust every behavioral dimension.
Establish enough to judge whether the character idea deserves development.

Each territory MUST include exactly these compact fields:
territoryName, characterThesis, characterEssence, governingContradiction, worldview,
characteristicBehavior, intellectualSignature, socialSignature, culturalPositionSeed,
humorPotential, tastePotential, artifactPotential, whyThisBrand, expansionPotential, mustNeverBecome[]

Humor/culture/taste/artifact are SEEDS ("what could be interesting") not production systems.
Do NOT anchor to presentation concepts, visual styles, or topic-bound content.
Return JSON: { "territories": [ ... six ... ] }`;

export function buildBrandCharacterTerritoryPayloadV2(params: {
  snapshot: BrandCharacterIntelligenceSnapshot;
  brandName?: string;
}): Record<string, unknown> {
  return {
    formationLevel: 'BRAND_CHARACTER_TERRITORY',
    formationQuestion: `What are genuinely different possibilities for WHO ${params.brandName ?? 'this brand'} could be?`,
    topicBlind: true,
    territoryCount: 6,
    intelligenceSnapshot: {
      brandLevelTruth: params.snapshot.brandLevelTruth,
      personalityEvidence: params.snapshot.personalityEvidence,
      culturalCalibrationEvidence: params.snapshot.culturalCalibrationEvidence,
    },
    requiredCompactFields: [
      'territoryName',
      'characterThesis',
      'characterEssence',
      'governingContradiction',
      'worldview',
      'characteristicBehavior',
      'intellectualSignature',
      'socialSignature',
      'culturalPositionSeed',
      'humorPotential',
      'tastePotential',
      'artifactPotential',
      'whyThisBrand',
      'expansionPotential',
      'mustNeverBecome',
    ],
    explicitlyNotRequired: [
      'full humor system',
      'full cultural intelligence system',
      'language character',
      'expressive behavior specifications',
      'artifact governance',
    ],
  };
}
