/**
 * Translate world/social behavior into interactive experience behavior.
 */

import type { CreativeConceptTerritory, WorldExpressionSystem } from '../conceptTerritory/conceptTerritoryTypes.js';
import type {
  ExperienceBehaviorTranslation,
  ExperienceConcept,
  ExperienceFunctionalCanon,
  HostExperienceCanon,
} from './types.js';
import type { CrossMediumConceptEvidence } from './crossMediumConceptEvidence.js';

export function translateWorldBehaviorIntoExperienceBehavior(params: {
  territory: CreativeConceptTerritory | null;
  world: WorldExpressionSystem | null;
  concept: ExperienceConcept;
  functionalCanon: ExperienceFunctionalCanon;
  hostCanon: HostExperienceCanon;
  crossMediumEvidence?: CrossMediumConceptEvidence[];
}): ExperienceBehaviorTranslation {
  const { territory, world, concept, functionalCanon, crossMediumEvidence = [] } = params;
  const translations: ExperienceBehaviorTranslation['translations'] = [];

  const promoted = crossMediumEvidence.find((e) => e.classification === 'EXPLICITLY_PROMOTED_CROSS_MEDIUM');

  if (territory) {
    translations.push({
      worldBehavior: territory.primaryVisualMechanism,
      experienceBehavior: concept.informationBehavior,
      rationale: `Primary visual mechanism becomes ${concept.experienceMetaphor} information delivery — not social layout paste`,
    });
  } else if (promoted) {
    translations.push({
      worldBehavior: promoted.primaryVisualMechanism,
      experienceBehavior: concept.informationBehavior,
      rationale: `Cross-medium evidence ${promoted.directionName} behavior translated — not copied as page layout`,
    });
  } else {
    translations.push({
      worldBehavior: 'Brand intelligence behavioral signals',
      experienceBehavior: concept.informationBehavior,
      rationale: 'Experience behavior derived from snapshot — no social layout copying',
    });
  }

  if (world?.motionSystem) {
    translations.push({
      worldBehavior: world.motionSystem,
      experienceBehavior: concept.motionPhilosophy,
      rationale: 'Social motion sequence → interactive state/reveal behavior',
    });
  }

  if (world?.socialBehavior) {
    translations.push({
      worldBehavior: world.socialBehavior,
      experienceBehavior: concept.interactionGrammar,
      rationale: 'Feed-native behavior translated to founder interaction grammar inside SITE 00 shell',
    });
  }

  for (const route of functionalCanon.routes.slice(0, 3)) {
    translations.push({
      worldBehavior: territory?.contentBehavior ?? 'Functional route requirement',
      experienceBehavior: `Navigate to ${route} via ${concept.navigationBehavior}`,
      rationale: 'Functional route preserved; presentation follows experience concept',
    });
  }

  return {
    territoryId: territory?.territoryId ?? promoted?.territoryId ?? 'snapshot-derived',
    worldExpressionSystemId: world?.expressionSystemId ?? promoted?.worldExpressionSystemId ?? 'none',
    experienceConceptId: concept.experienceConceptId,
    translations,
    socialLayoutCopyingBlocked: true,
  };
}
