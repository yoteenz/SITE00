/**
 * Experience Bible builder — one bible per experience concept.
 */

import type { CreativeConceptTerritory, WorldExpressionSystem } from '../conceptTerritory/conceptTerritoryTypes.js';
import type { HostExperienceCanon } from './types.js';
import type { ClientExperienceCanon } from './types.js';
import type { ExperienceBible, ExperienceConcept } from './types.js';

export function buildExperienceBible(params: {
  concept: ExperienceConcept;
  territory: CreativeConceptTerritory;
  world: WorldExpressionSystem;
  host: HostExperienceCanon;
  client: ClientExperienceCanon;
}): ExperienceBible {
  const { concept, territory, world, host, client } = params;
  const bibleId = `bible-${concept.experienceConceptId}`;

  return {
    experienceBibleId: bibleId,
    experienceConceptId: concept.experienceConceptId,
    experienceThesis: concept.centralThesis,
    viewerFounderRole: concept.viewerRole,
    structuralMetaphor: concept.experienceMetaphor,
    informationBehavior: concept.informationBehavior,
    interactionGrammar: concept.interactionGrammar,
    hierarchyGrammar: concept.hierarchyBehavior,
    spatialCompositionGrammar: concept.spatialBehavior,
    materialBehavior: `${host.hostMaterialBehavior[0] ?? 'Host glass surfaces'} × ${world.materialSystem} × ${concept.compositionBehavior}`,
    typographyBehavior: {
      hostUiTypography: host.hostUiTypography,
      clientExpressiveTypography: world.typographySystem,
      environmentalType: `Territory-scale type from ${territory.directionName} world expression`,
      metadataType: 'Host stack for system metadata — Martian Mono roles',
      actionType: 'Host red wayfinding for global actions; client accent for project-native actions',
      statusType: 'Distinct status typography — never host font as client canon',
    },
    colorBehavior: {
      hostWayfinding: host.hostColorBehavior[0] ?? 'Red host accent',
      clientWorldColor: world.paletteSystem,
      statusColor: 'Semantic status colors independent of brand palette',
      attentionColor: 'Founder attention queue — derived from concept urgency grammar',
      interactiveStateColor: 'Selection/hover states follow experience interaction grammar',
      backgroundEnvironment: `${host.hostSpatialBehavior[0] ?? 'SITE 00 white architectural field'} with ${territory.directionName} client lighting`,
    },
    motionBehavior: concept.motionPhilosophy,
    responsivePhilosophy: concept.responsivePhilosophy,
    accessibilityUsability: [
      'Touch targets ≥ 44px on mobile founder actions',
      'Keyboard navigation for all critical routes preserved',
      'Loading and error states remain legible',
      'Contrast sufficient for status and attention signals',
      host.hostAccessibilityRules.join('; '),
    ],
    progressiveDisclosure: {
      primaryExperienceRepresentation: [
        'CURRENT PROJECT STATE interpreted from lifecycle + command queue',
        'WHAT NEEDS YOU from founder tasks',
        'WHAT IS FORMING from generation statuses',
        'WHERE TO GO NEXT from experience navigation grammar',
      ],
      deepInspectorRepresentation: client.traits.map((t) => `${t.trait} (${t.provenance})`),
    },
    createdAt: new Date().toISOString(),
  };
}

export function experienceBibleCompletenessTest(bible: ExperienceBible): boolean {
  return Boolean(
    bible.experienceThesis &&
      bible.interactionGrammar &&
      bible.hierarchyGrammar &&
      bible.typographyBehavior.hostUiTypography &&
      bible.typographyBehavior.clientExpressiveTypography &&
      bible.progressiveDisclosure.primaryExperienceRepresentation.length > 0,
  );
}
