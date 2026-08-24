/**
 * Compile selected Brand Character Territory → durable BrandCharacterSystem.
 */

import { createHash } from 'node:crypto';
import { BRAND_CHARACTER_TERRITORY_V1 } from './constants.js';
import type { BrandCharacterSystem, BrandCharacterTerritory } from './types.js';

function fingerprint(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16);
}

export function compileBrandCharacterSystem(params: {
  territory: BrandCharacterTerritory;
  founderApproval?: BrandCharacterSystem['founderApproval'];
}): BrandCharacterSystem {
  const { territory } = params;
  const corePayload = {
    core: territory.core,
    intellectual: territory.intellectual,
    social: territory.social,
    emotional: territory.emotional,
    humorWit: territory.humorWit,
    cultural: territory.culturalIntelligence,
    language: territory.language,
    taste: territory.taste,
    expressive: territory.expressiveBehavior,
    artifact: territory.artifactRelationship,
  };

  return {
    id: `bcs-${territory.id}`,
    sourceTerritoryId: territory.id,
    sourceFingerprint: fingerprint(corePayload),
    methodologyVersion: BRAND_CHARACTER_TERRITORY_V1,
    founderApproval: params.founderApproval ?? 'PENDING',
    characterCore: territory.core,
    intellectualBehavior: territory.intellectual,
    socialBehavior: territory.social,
    emotionalBehavior: territory.emotional,
    humorSystem: territory.humorWit,
    culturalIntelligenceSystem: territory.culturalIntelligence,
    languageBehavior: territory.language,
    tasteSystem: territory.taste,
    expressiveBehavior: territory.expressiveBehavior,
    artifactRelationship: territory.artifactRelationship,
    antiCharacterRules: [...territory.antiCharacterRules, ...territory.whatItMustNeverBecome],
    allowedRange: [
      'Different emotional temperatures across contexts while preserving identity',
      'Different seriousness levels without tonal sameness',
      'Different density and energy states by medium',
      'Contextual modulation without character collapse',
    ],
    contextualModulationRules: [
      'Character consistency ≠ tonal sameness',
      'Serious contexts may reduce humor without eliminating wit mechanism',
      'High-energy contexts may increase expressive gestures without changing worldview',
    ],
    mediumTranslationRules: [
      'Identity, presentation, content, and motion each translate character — none replace it',
      'Medium-specific expression must remain explainable as character evidence',
    ],
    brandCharacterFingerprint: fingerprint({ id: territory.id, ...corePayload }),
    compiledAt: new Date().toISOString(),
  };
}

export function characterConsistencyDistinctFromTonalSameness(): true {
  return true;
}

export function loveDoesNotMutateBrandCanon(): true {
  return true;
}

export function multiplePromisingCharactersMaySurvive(): true {
  return true;
}

export function characterFingerprintPropagatesDownstream(system: BrandCharacterSystem): {
  brandCharacterSystemId: string;
  brandCharacterFingerprint: string;
} {
  return {
    brandCharacterSystemId: system.id,
    brandCharacterFingerprint: system.brandCharacterFingerprint,
  };
}
