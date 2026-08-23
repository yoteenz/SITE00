/**
 * Experience Visual Development prompt compiler — blocks generic dashboard language.
 */

import { createHash } from 'node:crypto';
import { FORBIDDEN_GENERIC_PROMPT_PHRASES } from './constants.js';
import type {
  DeviceClass,
  ExperienceSurfaceType,
} from './constants.js';
import type {
  ExperienceBible,
  ExperienceConcept,
  ExperienceFunctionalCanon,
  ExperienceVisualDevelopmentBrief,
  HostExperienceCanon,
} from './types.js';
import type { CreativeConceptTerritory, WorldExpressionSystem } from '../conceptTerritory/conceptTerritoryTypes.js';
import type { ClientExperienceCanon } from './types.js';

export function assertNoGenericDashboardPrompt(text: string): void {
  const lower = text.toLowerCase();
  for (const phrase of FORBIDDEN_GENERIC_PROMPT_PHRASES) {
    if (lower.includes(phrase)) {
      throw new Error(`GENERIC_DASHBOARD_PROMPT_BLOCK: forbidden phrase "${phrase}"`);
    }
  }
}

function hashPrompt(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function surfaceLabel(surface: ExperienceSurfaceType): string {
  return surface.replace(/_/g, ' ');
}

export function compileExperienceVisualPrompt(params: {
  concept: ExperienceConcept;
  bible: ExperienceBible;
  territory: CreativeConceptTerritory;
  world: WorldExpressionSystem;
  host: HostExperienceCanon;
  client: ClientExperienceCanon;
  functionalCanon: ExperienceFunctionalCanon;
  surfaceType: ExperienceSurfaceType;
  deviceClass: DeviceClass;
}): ExperienceVisualDevelopmentBrief {
  const { concept, bible, territory, world, host, client, functionalCanon, surfaceType, deviceClass } = params;

  const environmentBrief = [
    `Digital place: ${concept.experienceMetaphor} inside SITE 00 project location for NDXBOOK.`,
    `Founder is ${concept.viewerRole}.`,
    `Territory: ${territory.directionName} — ${territory.centralConcept}.`,
    `Surface: ${surfaceLabel(surfaceType)}.`,
    `Device: ${deviceClass}.`,
    `The user is actively ${concept.projectRelationship}.`,
    `Spatial dominance: ${concept.spatialBehavior}.`,
    `Information active: ${concept.informationBehavior}.`,
    `Hierarchy communicated through ${concept.hierarchyBehavior}.`,
    `SITE 00 host remains visible: ${host.hostNavigation[0] ?? 'global shell'}.`,
    `NDXBOOK enters through ${world.paletteSystem} and ${world.materialSystem}.`,
    `Responsive: ${deviceClass === 'MOBILE' ? concept.responsivePhilosophy.split(';')[0] : concept.responsivePhilosophy.split(';').slice(-1)[0] ?? concept.responsivePhilosophy}.`,
  ].join(' ');

  const compiledPrompt = [
    'VISUAL DEVELOPMENT / PRODUCTION DESIGN — not functional architecture source.',
    environmentBrief,
    `World expression: ${world.typographySystem}; ${world.compositionSystem}.`,
    `Host elements: ${host.hostPersistentControls.join(', ')}.`,
    `Client expression: ${client.territorySummary ?? territory.centralConcept}.`,
    `Interaction state shown: ${concept.interactionGrammar}.`,
    'Forbidden: generic SaaS dashboard, card grid default, social post layout pasted on software.',
  ].join('\n');

  assertNoGenericDashboardPrompt(compiledPrompt);

  const briefId = `brief-${concept.experienceConceptId}-${surfaceType.toLowerCase()}-${deviceClass.toLowerCase()}`;

  return {
    briefId,
    experienceConceptId: concept.experienceConceptId,
    experienceBibleId: bible.experienceBibleId,
    surfaceType,
    deviceClass,
    functionalElementsRequired: functionalCanon.actions.slice(0, 4),
    functionalStatesShown: functionalCanon.states.slice(0, 5),
    environmentBrief,
    spatialComposition: concept.spatialBehavior,
    hierarchy: concept.hierarchyBehavior,
    hostElements: host.hostPersistentControls,
    clientExpressionElements: client.traits.slice(0, 4).map((t) => t.trait),
    typographyRoles: [
      bible.typographyBehavior.hostUiTypography,
      bible.typographyBehavior.clientExpressiveTypography,
    ],
    colorRoles: [
      bible.colorBehavior.hostWayfinding,
      bible.colorBehavior.clientWorldColor,
    ],
    materialRules: [world.materialSystem, host.hostMaterialBehavior[0] ?? ''],
    lightingRules: [bible.colorBehavior.backgroundEnvironment],
    motionImplication: concept.motionPhilosophy,
    informationBehaviorShown: concept.informationBehavior,
    interactionStateShown: concept.interactionGrammar,
    genericTemplateProhibitions: [
      'No modern dashboard',
      'No equal-weight KPI tiles',
      'No card-based layout default',
    ],
    hostContaminationProhibitions: ['Do not use Martian Mono as client brand typography'],
    clientContaminationProhibitions: ['Do not recolor SITE 00 host navigation semantics'],
    imageModelRole: 'VISUAL_DEVELOPMENT',
    compiledPrompt,
    promptHash: hashPrompt(compiledPrompt),
  };
}

export function buildResponsiveExperienceTranslation(concept: ExperienceConcept): import('./types.js').ResponsiveExperienceTranslation {
  const parts = concept.responsivePhilosophy.split(';').map((s) => s.trim());
  return {
    experienceConceptId: concept.experienceConceptId,
    sharedConcept: concept.experienceMetaphor,
    mobileBehavior: parts[0] ?? concept.responsivePhilosophy,
    desktopBehavior: parts[1] ?? parts[0] ?? concept.responsivePhilosophy,
    preservedRecognitionSignals: [concept.experienceMetaphor, concept.viewerRole],
    changedInteractionPatterns: ['Mobile: tighter pacing and single-focus reveal', 'Desktop: wider spatial context'],
    changedCompositionLogic: ['Mobile avoids stacked desktop modules', 'Desktop uses environmental scale'],
    whyTranslationStillMatchesConcept: `Same ${concept.experienceMetaphor} — device changes pacing and scale, not concept`,
  };
}
