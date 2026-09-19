/**
 * P0.FILM.1 — Environment bible.
 */

import type { BrandEnvironmentBible, EnvironmentDefinition, NdxEnvironmentId } from '../types.js';

export function buildEnvironmentDefinition(params: Partial<EnvironmentDefinition> & { environmentId: NdxEnvironmentId }): EnvironmentDefinition {
  return {
    environmentId: params.environmentId,
    visualGrammar: params.visualGrammar ?? ['lived-in', 'real'],
    lighting: params.lighting ?? ['natural window light'],
    cameraPossibilities: params.cameraPossibilities ?? ['table-level', 'over-shoulder', 'medium profile'],
    props: params.props ?? [],
    backgroundDensity: params.backgroundDensity ?? 'moderate',
    realismRisks: params.realismRisks ?? ['fake signage', 'warped patrons'],
    socialContext: params.socialContext ?? 'public casual',
    bestShotClasses: params.bestShotClasses ?? ['OBSERVATIONAL_WIDE', 'TABLE_LEVEL_LIVED_IN'],
    timeOfDayOptions: params.timeOfDayOptions ?? ['morning', 'afternoon'],
    wardrobeCompatibility: params.wardrobeCompatibility ?? ['EVERYDAY_FITTED', 'CITY_DAY'],
  };
}

export function buildBrandEnvironmentBible(params: {
  brandId: string;
  environments: EnvironmentDefinition[];
}): BrandEnvironmentBible {
  return { brandId: params.brandId, environments: params.environments };
}

export function resolveEnvironment(
  bible: BrandEnvironmentBible,
  environmentId: NdxEnvironmentId,
): EnvironmentDefinition | null {
  return bible.environments.find((e) => e.environmentId === environmentId) ?? null;
}
