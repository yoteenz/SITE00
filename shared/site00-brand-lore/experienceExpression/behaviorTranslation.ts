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

export function translateWorldBehaviorIntoExperienceBehavior(params: {
  territory: CreativeConceptTerritory;
  world: WorldExpressionSystem;
  concept: ExperienceConcept;
  functionalCanon: ExperienceFunctionalCanon;
  hostCanon: HostExperienceCanon;
}): ExperienceBehaviorTranslation {
  const { territory, world, concept, functionalCanon } = params;
  const translations: ExperienceBehaviorTranslation['translations'] = [];

  translations.push({
    worldBehavior: territory.primaryVisualMechanism,
    experienceBehavior: concept.informationBehavior,
    rationale: `Primary visual mechanism becomes ${concept.experienceMetaphor} information delivery — not social layout paste`,
  });

  if (world.motionSystem) {
    translations.push({
      worldBehavior: world.motionSystem,
      experienceBehavior: concept.motionPhilosophy,
      rationale: 'Social motion sequence → interactive state/reveal behavior',
    });
  }

  if (world.socialBehavior) {
    translations.push({
      worldBehavior: world.socialBehavior,
      experienceBehavior: concept.interactionGrammar,
      rationale: 'Feed-native behavior translated to founder interaction grammar inside SITE 00 shell',
    });
  }

  for (const route of functionalCanon.routes.slice(0, 3)) {
    translations.push({
      worldBehavior: territory.contentBehavior,
      experienceBehavior: `Navigate to ${route} via ${concept.navigationBehavior}`,
      rationale: 'Functional route preserved; presentation follows experience concept',
    });
  }

  return {
    territoryId: territory.territoryId,
    worldExpressionSystemId: world.expressionSystemId,
    experienceConceptId: concept.experienceConceptId,
    translations,
    socialLayoutCopyingBlocked: true,
  };
}
