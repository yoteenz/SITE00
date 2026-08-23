/**
 * NDXBOOK Client Experience Canon — derived from brand intelligence with provenance.
 */

import type { BrandLoreProfile } from '../types.js';
import type { CreativeConceptTerritory, WorldExpressionSystem } from '../conceptTerritory/conceptTerritoryTypes.js';
import { summarizeCreativeAppetiteForFormation } from '../founderCreativeAppetite/synthesis.js';
import type { ClientExperienceCanon, ClientExperienceCanonTrait } from './types.js';

export function buildClientExperienceCanon(params: {
  profile: BrandLoreProfile | null;
  territory: CreativeConceptTerritory | null;
  world: WorldExpressionSystem | null;
}): ClientExperienceCanon {
  const { profile, territory, world } = params;
  const traits: ClientExperienceCanonTrait[] = [];

  if (profile?.brandWorld?.value) {
    traits.push({ trait: String(profile.brandWorld.value), provenance: 'BRAND_CANON', source: 'brandWorld' });
  }
  if (profile?.contextClassification) {
    traits.push({
      trait: profile.contextClassification,
      provenance: 'BRAND_CANON',
      source: 'contextClassification',
    });
  }
  if (territory) {
    traits.push({
      trait: territory.centralConcept,
      provenance: 'CONCEPT_TERRITORY',
      source: territory.territoryId,
    });
    traits.push({
      trait: territory.primaryVisualMechanism,
      provenance: 'CONCEPT_TERRITORY',
      source: territory.territoryId,
    });
  }
  if (world) {
    traits.push({
      trait: world.typographySystem,
      provenance: 'WORLD_EXPRESSION',
      source: world.expressionSystemId,
    });
    traits.push({
      trait: world.paletteSystem,
      provenance: 'WORLD_EXPRESSION',
      source: world.expressionSystemId,
    });
  }

  const experimentalExcluded = [
    'lime as universal accent',
    'paper texture as default UI chrome',
    'condensed type as host typography',
    'carousel slide layout as page grid',
  ];

  const appetite = profile?.founderCreativeAppetite;
  const appetiteSummary =
    appetite &&
    Object.keys(appetite.rawAnswers ?? {}).length > 0 &&
    Array.isArray(appetite.domainTolerances)
      ? summarizeCreativeAppetiteForFormation(appetite)
      : appetite && Object.keys(appetite.rawAnswers ?? {}).length > 0
        ? 'PARTIAL_APPETITE_CONTEXT'
        : null;

  return {
    version: 1,
    traits,
    brandLoreSummary: profile?.brandWorld?.value ? String(profile.brandWorld.value) : null,
    personalitySummary: profile?.brandPersonality ? 'Brand personality captured' : null,
    expressionContext: profile?.contextClassification ?? null,
    appetiteSummary,
    territorySummary: territory?.centralConcept ?? null,
    worldExpressionSummary: world?.typographySystem ?? null,
    experimentalTraitsExcluded: experimentalExcluded,
    extractedAt: new Date().toISOString(),
  };
}

export function experimentalAssetNotCanon(canon: ClientExperienceCanon): boolean {
  return canon.experimentalTraitsExcluded.length > 0;
}
