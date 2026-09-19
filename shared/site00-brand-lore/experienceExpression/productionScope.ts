/**
 * ProjectProductionScope — configurable generation budget and asset limits.
 */

import type { ExperienceSurfaceType } from './constants.js';

export type ProjectExperienceClass = 'SITE' | 'APPLICATION' | 'IMMERSIVE' | 'WORLD' | 'CUSTOM_BUILD';

export type ProjectProductionScope = {
  scopeId: string;
  projectId: string;
  experienceClass: ProjectExperienceClass;
  serviceTier: 'STANDARD' | 'CUSTOM' | 'WORLD_CLASS';
  customArtDirectionLevel: 'MINIMAL' | 'MODERATE' | 'DEEP';
  maximumVisualDevelopmentFrames: number;
  maximumProductionAssetFamilies: number;
  maximumGeneratedAssets: number;
  responsiveVariantPolicy: 'DESKTOP_MOBILE_REQUIRED' | 'DESKTOP_ONLY' | 'ADAPTIVE';
  motionAllowance: 'NONE' | 'SUBTLE' | 'MODERATE' | 'FULL';
  revisionAllowance: number;
  generationBudgetUsd: number;
  providerBudgetUsd: number;
  customPhotographyAllowance: number;
  customIllustrationAllowance: number;
  environmentGenerationAllowance: number;
  worldAssetAllowance: number;
  manualApprovalRequirements: string[];
  compiledAt: string;
};

export function defaultNdxbookProductionScope(projectId: string): ProjectProductionScope {
  return {
    scopeId: `scope-${projectId}-experiment-e`,
    projectId,
    experienceClass: 'SITE',
    serviceTier: 'WORLD_CLASS',
    customArtDirectionLevel: 'DEEP',
    maximumVisualDevelopmentFrames: 64,
    maximumProductionAssetFamilies: 16,
    maximumGeneratedAssets: 96,
    responsiveVariantPolicy: 'DESKTOP_MOBILE_REQUIRED',
    motionAllowance: 'SUBTLE',
    revisionAllowance: 3,
    generationBudgetUsd: 5,
    providerBudgetUsd: 5,
    customPhotographyAllowance: 4,
    customIllustrationAllowance: 8,
    environmentGenerationAllowance: 4,
    worldAssetAllowance: 0,
    manualApprovalRequirements: ['VISUAL_DEVELOPMENT', 'PRODUCTION_PROMOTION'],
    compiledAt: new Date().toISOString(),
  };
}

export function scopeAllowsAssetFamily(
  scope: ProjectProductionScope,
  params: { assetFamily: string; currentFamilyCount: number; currentAssetCount: number },
): { allowed: boolean; reason: string | null } {
  if (params.currentAssetCount >= scope.maximumGeneratedAssets) {
    return { allowed: false, reason: 'MAX_GENERATED_ASSETS' };
  }
  if (params.currentFamilyCount >= scope.maximumProductionAssetFamilies) {
    return { allowed: false, reason: 'MAX_ASSET_FAMILIES' };
  }
  if (scope.worldAssetAllowance === 0 && params.assetFamily.startsWith('WORLD_')) {
    return { allowed: false, reason: 'WORLD_ASSETS_NOT_IN_SCOPE' };
  }
  return { allowed: true, reason: null };
}

export function scopeAllowsGeneration(
  scope: ProjectProductionScope,
  params: { estimatedCostUsd: number; spentUsd: number; frameCount: number },
): { allowed: boolean; reason: string | null } {
  if (params.frameCount > scope.maximumVisualDevelopmentFrames) {
    return { allowed: false, reason: 'MAX_VISUAL_DEVELOPMENT_FRAMES' };
  }
  if (params.spentUsd + params.estimatedCostUsd > scope.generationBudgetUsd) {
    return { allowed: false, reason: 'GENERATION_BUDGET_EXCEEDED' };
  }
  return { allowed: true, reason: null };
}

export function surfacesForResponsivePolicy(
  scope: ProjectProductionScope,
): ('MOBILE' | 'DESKTOP' | 'TABLET')[] {
  switch (scope.responsiveVariantPolicy) {
    case 'DESKTOP_ONLY':
      return ['DESKTOP'];
    case 'ADAPTIVE':
      return ['MOBILE', 'DESKTOP'];
    default:
      return ['MOBILE', 'DESKTOP'];
  }
}

export function surfaceCountForScope(scope: ProjectProductionScope, surfaces: ExperienceSurfaceType[]): number {
  const devices = surfacesForResponsivePolicy(scope);
  return surfaces.length * devices.length;
}
