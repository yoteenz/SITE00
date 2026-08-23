/**
 * Three independent lifecycle dimensions — creative value, brand disposition, production destiny.
 * A single judgment must not collapse all three into one boolean.
 */

import type {
  CreativeAssetRecord,
  CreativeValue,
  LaunchSeedSet,
  ProductionDestiny,
  ProductionState,
  ReviewState,
  ReuseState,
} from './types.js';

export type { CreativeValue, ProductionDestiny } from './types.js';

export const CREATIVE_VALUES = [
  'UNREVIEWED',
  'LOVE_IT',
  'PROMISING_REFINE',
  'REVISE',
  'NOT_FOR_ME',
] as const;

export const PRODUCTION_DESTINIES = [
  'UNDECIDED',
  'PRODUCTION_CANDIDATE',
  'LAUNCH_CANDIDATE',
  'LAUNCH_SELECTED',
  'LAUNCH_SEED_REVIEW_REQUIRED',
  'REUSE_AS_IS',
  'TRANSLATE_TO_WINNING_WORLD',
  'IDEA_ONLY',
  'FRANCHISE_CANDIDATE',
  'COPY_SALVAGE',
  'MOTION_SALVAGE',
  'VISUAL_DEVICE_SALVAGE',
  'RETIRED',
  'ARCHIVED',
] as const;

export type LaunchSeedAssetProvenance = LaunchSeedSet['assetProvenance'][string];

export type AssetLifecycleDimensions = {
  creativeValue: CreativeValue;
  brandDisposition: import('./founderCreativeJudgmentTypes.js').BrandAssetDisposition | 'EXCLUDED_FROM_BRAND' | 'ACTIVE';
  productionDestiny: ProductionDestiny;
  launchSelected: boolean;
  launchSeedReviewRequired: boolean;
  ideaPortabilityEligible: boolean;
  exactAssetCrossBrandReuse: boolean;
};

export function resolveCreativeValueFromReviewState(reviewState: ReviewState): CreativeValue {
  if (reviewState === 'LOVE_IT') return 'LOVE_IT';
  if (reviewState === 'PROMISING_REFINE') return 'PROMISING_REFINE';
  if (reviewState === 'REVISE') return 'REVISE';
  if (reviewState === 'NOT_FOR_ME') return 'NOT_FOR_ME';
  return 'UNREVIEWED';
}

export function resolveCreativeValueFromJudgment(
  judgment: CreativeValue | ReviewState | 'NOT_NDXBOOK' | null | undefined,
): CreativeValue {
  if (!judgment) return 'UNREVIEWED';
  if (judgment === 'NOT_NDXBOOK' || judgment === 'NOT_FOR_ME') return 'NOT_FOR_ME';
  if (judgment === 'LOVE_IT' || judgment === 'PROMISING_REFINE' || judgment === 'REVISE') return judgment;
  if (judgment === 'UNREVIEWED') return 'UNREVIEWED';
  return 'UNREVIEWED';
}

export function isRevisionWorkflowEligible(creativeValue: CreativeValue): boolean {
  return creativeValue === 'PROMISING_REFINE' || creativeValue === 'REVISE';
}

export function reviewStateForCreativeValue(value: CreativeValue): ReviewState {
  if (value === 'LOVE_IT') return 'LOVE_IT';
  if (value === 'PROMISING_REFINE') return 'PROMISING_REFINE';
  if (value === 'REVISE') return 'REVISE';
  if (value === 'NOT_FOR_ME') return 'NOT_FOR_ME';
  return 'UNREVIEWED';
}

export function productionDestinyFromReuseState(reuseState: ReuseState): ProductionDestiny | null {
  switch (reuseState) {
    case 'REUSABLE_AS_IS':
      return 'REUSE_AS_IS';
    case 'IDEA_ONLY':
      return 'IDEA_ONLY';
    case 'CONTENT_FRANCHISE_ONLY':
      return 'FRANCHISE_CANDIDATE';
    case 'COPY_MECHANIC_ONLY':
      return 'COPY_SALVAGE';
    case 'MOTION_MECHANIC_ONLY':
      return 'MOTION_SALVAGE';
    case 'VISUAL_DEVICE_ONLY':
      return 'VISUAL_DEVICE_SALVAGE';
    case 'RETIRED':
      return 'RETIRED';
    default:
      return null;
  }
}

export function productionDestinyFromProductionState(state: ProductionState): ProductionDestiny | null {
  if (state === 'PRODUCTION_CANDIDATE') return 'PRODUCTION_CANDIDATE';
  if (state === 'RETIRED') return 'RETIRED';
  if (state === 'CANON_REVIEW_REQUIRED') return 'LAUNCH_CANDIDATE';
  return null;
}

export function resolveProductionDestiny(
  asset: CreativeAssetRecord,
  launchSeedSet?: LaunchSeedSet | null,
): ProductionDestiny {
  if (asset.productionDestiny) return asset.productionDestiny;
  if (asset.launchSeedReviewRequired) return 'LAUNCH_SEED_REVIEW_REQUIRED';
  const inLaunch = launchSeedSet?.selectedAssets.includes(asset.assetId) ?? false;
  if (inLaunch) {
    const provenance = launchSeedSet?.assetProvenance?.[asset.assetId];
    if (provenance?.source === 'UNKNOWN' || provenance?.source === 'AUTO_LOVE_IT_LEGACY') {
      return 'LAUNCH_SEED_REVIEW_REQUIRED';
    }
    return 'LAUNCH_SELECTED';
  }
  const fromReuse = productionDestinyFromReuseState(asset.reuseState);
  if (fromReuse && fromReuse !== 'UNDECIDED') return fromReuse;
  const fromProduction = productionDestinyFromProductionState(asset.productionState);
  if (fromProduction) return fromProduction;
  if (asset.creativeValue === 'LOVE_IT' || asset.reviewState === 'LOVE_IT') return 'PRODUCTION_CANDIDATE';
  return 'UNDECIDED';
}

export function resolveBrandDispositionLabel(asset: CreativeAssetRecord): AssetLifecycleDimensions['brandDisposition'] {
  if (asset.brandLineageMembership === 'EXCLUDED') return 'EXCLUDED_FROM_BRAND';
  if (asset.brandDisposition === 'REVISION_PENDING' || asset.revisionPending) return 'REVISION_PENDING';
  if (asset.brandDisposition === 'LOVED') return 'LOVED';
  if (asset.brandDisposition === 'REJECTED_FOR_BRAND') return 'EXCLUDED_FROM_BRAND';
  if (asset.productionState === 'PRODUCTION_CANDIDATE') return 'ACTIVE';
  return asset.brandDisposition ?? 'ACTIVE';
}

export function resolveAssetLifecycleDimensions(
  asset: CreativeAssetRecord,
  launchSeedSet?: LaunchSeedSet | null,
): AssetLifecycleDimensions {
  const creativeValue =
    asset.creativeValue ?? resolveCreativeValueFromReviewState(asset.reviewState);
  const productionDestiny = resolveProductionDestiny(asset, launchSeedSet);
  const launchSelected = productionDestiny === 'LAUNCH_SELECTED';
  const launchSeedReviewRequired =
    asset.launchSeedReviewRequired === true || productionDestiny === 'LAUNCH_SEED_REVIEW_REQUIRED';

  return {
    creativeValue,
    brandDisposition: resolveBrandDispositionLabel(asset),
    productionDestiny,
    launchSelected,
    launchSeedReviewRequired,
    ideaPortabilityEligible: asset.ideaPortabilityEligible ?? asset.crossBrandReuseEligibility !== 'NOT_REUSABLE',
    exactAssetCrossBrandReuse: asset.exactAssetCrossBrandReuse ?? false,
  };
}

export function applyCreativeValueToAssetFields(
  _asset: CreativeAssetRecord,
  creativeValue: CreativeValue,
  nowIso: string,
): Pick<
  CreativeAssetRecord,
  | 'creativeValue'
  | 'reviewState'
  | 'revisionPending'
  | 'ideaPortabilityEligible'
  | 'exactAssetCrossBrandReuse'
  | 'crossBrandPortable'
  | 'updatedAt'
> {
  return {
    creativeValue,
    reviewState: reviewStateForCreativeValue(creativeValue),
    revisionPending: isRevisionWorkflowEligible(creativeValue),
    ideaPortabilityEligible: creativeValue === 'NOT_FOR_ME',
    exactAssetCrossBrandReuse: false,
    crossBrandPortable: false,
    updatedAt: nowIso,
  };
}
