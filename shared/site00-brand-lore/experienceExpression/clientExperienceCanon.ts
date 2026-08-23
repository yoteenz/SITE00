/**
 * NDXBOOK Client Experience Canon — provenance-aware medium compiler.
 */

import type { BrandLoreProfile } from '../types.js';
import type { CreativeConceptTerritory, WorldExpressionSystem } from '../conceptTerritory/conceptTerritoryTypes.js';
import { summarizeCreativeAppetiteForFormation } from '../founderCreativeAppetite/synthesis.js';
import type { CrossMediumConceptEvidence } from './crossMediumConceptEvidence.js';
import type { ClientExperienceCanon, ClientExperienceCanonTrait } from './types.js';

export function buildClientExperienceCanon(params: {
  profile: BrandLoreProfile | null;
  territory: CreativeConceptTerritory | null;
  world: WorldExpressionSystem | null;
  crossMediumEvidence?: CrossMediumConceptEvidence[];
}): ClientExperienceCanon {
  const { profile, territory, world, crossMediumEvidence = [] } = params;
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

  for (const ev of crossMediumEvidence) {
    if (ev.classification === 'EXPLICITLY_PROMOTED_CROSS_MEDIUM') {
      traits.push({
        trait: ev.centralConcept,
        provenance: 'CONCEPT_TERRITORY',
        source: `${ev.territoryId}:EXPLICITLY_PROMOTED_CROSS_MEDIUM`,
      });
    } else if (ev.classification === 'MEDIUM_SPECIFIC') {
      traits.push({
        trait: `${ev.directionName} (medium-specific evidence)`,
        provenance: 'EXPERIMENTAL_ASSET',
        source: ev.territoryId,
      });
    }
  }

  if (territory && !crossMediumEvidence.some((e) => e.territoryId === territory.territoryId)) {
    traits.push({
      trait: territory.centralConcept,
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
    'Martian Mono as client expressive typography',
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

  const promotedSummary = crossMediumEvidence
    .filter((e) => e.classification === 'EXPLICITLY_PROMOTED_CROSS_MEDIUM')
    .map((e) => e.directionName)
    .join(', ');

  return {
    version: 1,
    traits,
    brandLoreSummary: profile?.brandWorld?.value ? String(profile.brandWorld.value) : null,
    personalitySummary: profile?.brandPersonality ? 'Brand personality captured' : null,
    expressionContext: profile?.contextClassification ?? null,
    appetiteSummary,
    territorySummary: promotedSummary || territory?.centralConcept || 'Cross-medium evidence available — no territory required',
    worldExpressionSummary: world?.typographySystem ?? null,
    experimentalTraitsExcluded: experimentalExcluded,
    extractedAt: new Date().toISOString(),
  };
}

export function experimentalAssetNotCanon(canon: ClientExperienceCanon): boolean {
  return canon.experimentalTraitsExcluded.length > 0;
}
