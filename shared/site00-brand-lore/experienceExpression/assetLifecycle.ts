/**
 * Visual development vs production asset lifecycle.
 */

import type { ExperienceAssetRequirement } from './assetManifest.js';

export const ASSET_PROVENANCE_CLASSES = [
  'BRAND_CANON',
  'FOUNDER_PREFERENCE',
  'FOUNDER_PROPOSED_CONCEPT',
  'EXPERIMENTAL',
  'MEDIUM_SPECIFIC',
  'EXPLICITLY_PROMOTED_CROSS_MEDIUM',
  'HOST_CANON',
  'FUNCTIONAL_CANON',
  'VISUAL_DEVELOPMENT',
  'PRODUCTION_ASSET',
] as const;

export type AssetProvenanceClass = (typeof ASSET_PROVENANCE_CLASSES)[number];

export type ExperienceProductionAsset = {
  assetId: string;
  requirementId: string;
  assetMedium: 'EXPERIENCE_VISUAL_DEVELOPMENT' | 'EXPERIENCE_PRODUCTION_ASSET';
  provenanceClass: AssetProvenanceClass;
  canonStatus: 'EXPERIMENTAL' | 'FOUNDER_PREFERRED' | 'PRODUCTION' | 'BRAND_CANON';
  productionState: 'VISUAL_DEVELOPMENT' | 'IN_REVIEW' | 'APPROVED_VISUAL_DEVELOPMENT' | 'PROMOTED_TO_PRODUCTION' | 'REJECTED';
  storagePath: string | null;
  vaultAssetId: string | null;
  parentAssetId: string | null;
  lineageKey: string;
  founderJudgment: 'LOVE_IT' | 'REVISE' | 'NOT_FOR_ME' | 'PREFERRED' | null;
  promotedAt: string | null;
  promotedBy: string | null;
  generationReceipt: {
    provider: string;
    model: string;
    requestId: string | null;
    costUsd: number | null;
    promptHash: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export function visualDevelopmentNotProductionByDefault(asset: ExperienceProductionAsset): boolean {
  return asset.productionState === 'VISUAL_DEVELOPMENT' && asset.provenanceClass === 'VISUAL_DEVELOPMENT';
}

export function canPromoteToProduction(asset: ExperienceProductionAsset): boolean {
  return (
    asset.productionState === 'APPROVED_VISUAL_DEVELOPMENT' ||
    asset.productionState === 'IN_REVIEW'
  );
}

export function promoteAssetToProduction(
  asset: ExperienceProductionAsset,
  params: { promotedBy: string },
): ExperienceProductionAsset {
  if (!canPromoteToProduction(asset)) {
    throw new Error('Asset not eligible for production promotion');
  }
  return {
    ...asset,
    assetMedium: 'EXPERIENCE_PRODUCTION_ASSET',
    productionState: 'PROMOTED_TO_PRODUCTION',
    provenanceClass: 'PRODUCTION_ASSET',
    canonStatus: 'PRODUCTION',
    promotedAt: new Date().toISOString(),
    promotedBy: params.promotedBy,
    updatedAt: new Date().toISOString(),
  };
}

export function productionPromotionDoesNotCreateBrandCanon(asset: ExperienceProductionAsset): boolean {
  return asset.canonStatus !== 'BRAND_CANON';
}

export function approveDoesNotCreateBrandCanon(asset: ExperienceProductionAsset): boolean {
  return asset.canonStatus !== 'BRAND_CANON';
}

export function preferredDoesNotCreateBrandCanon(asset: ExperienceProductionAsset): boolean {
  return asset.canonStatus !== 'BRAND_CANON';
}

export function updateRequirementForPromotion(
  requirement: ExperienceAssetRequirement,
): ExperienceAssetRequirement {
  return {
    ...requirement,
    status: 'PROMOTED_TO_PRODUCTION',
    productionEligibility: 'PRODUCTION_ELIGIBLE',
    generationBudgetClass: 'PRODUCTION',
    updatedAt: new Date().toISOString(),
  };
}

export function reviseAssetWithLineage(
  parent: ExperienceProductionAsset,
  revision: Partial<ExperienceProductionAsset>,
): ExperienceProductionAsset {
  return {
    ...parent,
    ...revision,
    assetId: `${parent.assetId}-rev-${Date.now()}`,
    parentAssetId: parent.assetId,
    lineageKey: parent.lineageKey,
    productionState: 'VISUAL_DEVELOPMENT',
    provenanceClass: 'VISUAL_DEVELOPMENT',
    updatedAt: new Date().toISOString(),
  };
}

export function hostAssetCannotBecomeClientCanon(provenance: AssetProvenanceClass): boolean {
  return provenance !== 'HOST_CANON';
}

export function clientAssetCannotMutateHostCanon(provenance: AssetProvenanceClass): boolean {
  return provenance !== 'HOST_CANON';
}
