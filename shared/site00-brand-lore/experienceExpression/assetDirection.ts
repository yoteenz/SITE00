/**
 * ExperienceAssetDirection — determines what visual material must exist for an experience.
 */

import type { ExperienceSurfaceType } from './constants.js';
import type { ProjectProductionScope } from './productionScope.js';
import type { SurfaceExperienceArtDirection } from './surfaceArtDirection.js';
import type {
  ClientExperienceCanon,
  ExperienceBible,
  ExperienceConcept,
  ExperienceFunctionalCanon,
} from './types.js';
import { deriveAllSurfaceArtDirections } from './surfaceArtDirection.js';

export type ExperienceAssetDirection = {
  assetDirectionId: string;
  projectId: string;
  experienceConceptId: string;
  experienceBibleId: string;
  revisedDirectionLabel: string | null;
  centralThesis: string;
  assetCommissioningPrinciple: string;
  interactionMetaphor: string;
  structuralSophistication: string;
  literalImageryBlocked: string[];
  surfaceArtDirections: SurfaceExperienceArtDirection[];
  capabilitySpace: string[];
  derivedAssetFamilies: string[];
  scopeId: string;
  compiledAt: string;
};

export const EXPERIENCE_ASSET_CAPABILITY_SPACE = [
  'environment_plates',
  'environmental_backgrounds',
  'hero_compositions',
  'editorial_artwork',
  'photography',
  'generated_photography',
  'illustrations',
  'diagrams',
  'visual_specimens',
  'concept_fragments',
  'textures',
  'material_surfaces',
  'overlays',
  'annotation_systems',
  'masks',
  'iconography',
  'symbolic_objects',
  'ui_integrated_artwork',
  'typography_artwork',
  'custom_lettering',
  'information_graphics',
  'visual_evidence',
  'comparison_specimens',
  'artifact_fragments',
  'product_imagery',
  'spatial_objects',
  'transition_imagery',
  'motion_keyframes',
  'ambient_visual_loops',
  'decorative_assets',
  'responsive_crops',
  'mobile_specific_compositions',
  'desktop_specific_compositions',
] as const;

export const LITERAL_WORKBENCH_IMAGERY_BLOCKED = [
  'wooden desk',
  'physical hammer',
  'screwdriver',
  'workshop lamp',
  'generic maker-space photography',
  'literal carpentry scene',
  'carpentry tools',
] as const;

export function isActiveWorkbenchConcept(concept: ExperienceConcept): boolean {
  return concept.name === 'THE ACTIVE WORKBENCH';
}

export function compileExperienceAssetDirection(params: {
  projectId: string;
  concept: ExperienceConcept;
  bible: ExperienceBible;
  functionalCanon: ExperienceFunctionalCanon;
  client: ClientExperienceCanon;
  scope: ProjectProductionScope;
  surfaces: ExperienceSurfaceType[];
  revisedWorkbenchDossier?: boolean;
}): ExperienceAssetDirection {
  const revised = params.revisedWorkbenchDossier ?? isActiveWorkbenchConcept(params.concept);
  const surfaceArtDirections = deriveAllSurfaceArtDirections({
    concept: params.concept,
    bible: params.bible,
    surfaces: params.surfaces,
    functionalCanon: params.functionalCanon,
    client: params.client,
    revisedWorkbenchDossier: revised,
  });

  const derivedFamilies = [
    ...new Set(surfaceArtDirections.flatMap((s) => s.requiredAssetFamilies)),
  ];

  const structuralSophistication =
    revised && isActiveWorkbenchConcept(params.concept)
      ? 'Dossier-level information hierarchy: varied weight, layered evidence, asymmetrical composition, deliberate focal areas, depth, artifact presence — within workbench interaction metaphor'
      : params.concept.compositionBehavior;

  const revisedLabel =
    revised && isActiveWorkbenchConcept(params.concept)
      ? 'ACTIVE WORKBENCH + DOSSIER STRUCTURAL SOPHISTICATION'
      : null;

  return {
    assetDirectionId: `asset-dir-${params.concept.experienceConceptId}`,
    projectId: params.projectId,
    experienceConceptId: params.concept.experienceConceptId,
    experienceBibleId: params.bible.experienceBibleId,
    revisedDirectionLabel: revisedLabel,
    centralThesis: params.concept.centralThesis,
    assetCommissioningPrinciple:
      'SITE 00 commissions client-native visual material required to realize the experience — not only the container',
    interactionMetaphor: params.concept.experienceMetaphor,
    structuralSophistication,
    literalImageryBlocked: revised ? [...LITERAL_WORKBENCH_IMAGERY_BLOCKED] : [],
    surfaceArtDirections,
    capabilitySpace: [...EXPERIENCE_ASSET_CAPABILITY_SPACE],
    derivedAssetFamilies: derivedFamilies,
    scopeId: params.scope.scopeId,
    compiledAt: new Date().toISOString(),
  };
}

export function literalWorkshopImageryBlocked(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  return LITERAL_WORKBENCH_IMAGERY_BLOCKED.some((term) => lower.includes(term));
}
