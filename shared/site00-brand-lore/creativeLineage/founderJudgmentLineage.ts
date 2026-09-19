/**
 * Apply founder slide/direction judgments to brand-scoped creative asset lineage.
 * Three dimensions: creative value, brand disposition, production destiny — kept independent.
 */

import type { CreativeAssetRecord, CreativeValue, ProductionDestiny, ReviewState } from './types.js';
import {
  applyCreativeValueToAssetFields,
  isRevisionWorkflowEligible,
  resolveCreativeValueFromJudgment,
  reviewStateForCreativeValue,
} from './assetLifecycleDimensions.js';
import { dispositionForAction, crossBrandEligibilityForAction } from './founderCreativeJudgmentTypes.js';

export type FounderSlideJudgment = CreativeValue | 'NOT_NDXBOOK' | null;

export function defaultBrandLineageFields(): Pick<
  CreativeAssetRecord,
  | 'brandLineageMembership'
  | 'excludedFromBrandAt'
  | 'crossBrandPortable'
  | 'ideaPortabilityEligible'
  | 'exactAssetCrossBrandReuse'
  | 'launchSeedReviewRequired'
  | 'revisionPending'
  | 'brandDisposition'
  | 'crossBrandReuseEligibility'
  | 'rootAssetId'
  | 'revisionNumber'
  | 'currentRevisionId'
  | 'creativeValue'
  | 'productionDestiny'
> {
  return {
    brandLineageMembership: 'ACTIVE',
    excludedFromBrandAt: null,
    crossBrandPortable: false,
    ideaPortabilityEligible: false,
    exactAssetCrossBrandReuse: false,
    launchSeedReviewRequired: false,
    revisionPending: false,
    brandDisposition: 'ACTIVE',
    crossBrandReuseEligibility: 'NOT_EVALUATED',
    rootAssetId: null,
    revisionNumber: 0,
    currentRevisionId: null,
    creativeValue: 'UNREVIEWED',
    productionDestiny: 'UNDECIDED',
  };
}

export function normalizeBrandLineageFields(asset: CreativeAssetRecord): CreativeAssetRecord {
  const defaults = defaultBrandLineageFields();
  const creativeValue =
    asset.creativeValue ?? resolveCreativeValueFromJudgment(asset.reviewState);
  return {
    ...asset,
    ...defaults,
    brandLineageMembership: asset.brandLineageMembership ?? 'ACTIVE',
    excludedFromBrandAt: asset.excludedFromBrandAt ?? null,
    crossBrandPortable: asset.crossBrandPortable ?? false,
    ideaPortabilityEligible: asset.ideaPortabilityEligible ?? false,
    exactAssetCrossBrandReuse: asset.exactAssetCrossBrandReuse ?? false,
    launchSeedReviewRequired: asset.launchSeedReviewRequired ?? false,
    revisionPending: asset.revisionPending ?? isRevisionWorkflowEligible(creativeValue),
    brandDisposition: asset.brandDisposition ?? 'ACTIVE',
    crossBrandReuseEligibility: asset.crossBrandReuseEligibility ?? 'NOT_EVALUATED',
    rootAssetId: asset.rootAssetId ?? asset.assetId,
    revisionNumber: asset.revisionNumber ?? 0,
    currentRevisionId: asset.currentRevisionId ?? null,
    creativeValue,
    productionDestiny: asset.productionDestiny ?? 'UNDECIDED',
  };
}

export function isActiveInBrandLineage(asset: CreativeAssetRecord): boolean {
  const normalized = normalizeBrandLineageFields(asset);
  return (
    normalized.brandLineageMembership === 'ACTIVE' &&
    normalized.brandDisposition !== 'REJECTED_FOR_BRAND' &&
    normalized.brandDisposition !== 'RETIRED_FOR_BRAND'
  );
}

function productionDestinyForCreativeValue(value: CreativeValue): ProductionDestiny {
  if (value === 'LOVE_IT') return 'PRODUCTION_CANDIDATE';
  if (value === 'NOT_FOR_ME') return 'RETIRED';
  if (isRevisionWorkflowEligible(value)) return 'UNDECIDED';
  return 'UNDECIDED';
}

export function applyFounderJudgmentToAsset(
  asset: CreativeAssetRecord,
  judgment: FounderSlideJudgment,
  nowIso: string = new Date().toISOString(),
): CreativeAssetRecord {
  const base = normalizeBrandLineageFields(asset);
  const creativeValue = resolveCreativeValueFromJudgment(judgment);

  if (creativeValue === 'UNREVIEWED') {
    return {
      ...base,
      ...applyCreativeValueToAssetFields(base, 'UNREVIEWED', nowIso),
      reviewState: 'UNREVIEWED',
      productionState: 'EXPERIMENTAL',
      productionDestiny: 'UNDECIDED',
      reuseState: base.assetType === 'HERO' ? 'ORIGINAL_USE_ONLY' : 'REUSABLE_WITH_ADAPTATION',
      brandLineageMembership: 'ACTIVE',
      brandDisposition: 'ACTIVE',
      excludedFromBrandAt: null,
      crossBrandReuseEligibility: 'NOT_EVALUATED',
      revisionPending: false,
      currentRevisionId: null,
      updatedAt: nowIso,
    };
  }

  if (creativeValue === 'LOVE_IT') {
    return {
      ...base,
      creativeValue: 'LOVE_IT',
      reviewState: 'LOVE_IT',
      productionState: 'PRODUCTION_CANDIDATE',
      productionDestiny: 'PRODUCTION_CANDIDATE',
      reuseState: base.reuseState === 'RETIRED' ? 'REUSABLE_AS_IS' : base.reuseState,
      brandLineageMembership: 'ACTIVE',
      brandDisposition: 'LOVED',
      excludedFromBrandAt: null,
      crossBrandPortable: false,
      ideaPortabilityEligible: false,
      exactAssetCrossBrandReuse: false,
      crossBrandReuseEligibility: 'NOT_EVALUATED',
      revisionPending: false,
      launchSeedReviewRequired: base.launchSeedReviewRequired,
      currentRevisionId: null,
      internalNotes:
        base.internalNotes ??
        'Founder LOVE IT — production candidate only (not launch seed, not canon, not winner)',
      updatedAt: nowIso,
    };
  }

  if (isRevisionWorkflowEligible(creativeValue)) {
    return {
      ...base,
      ...applyCreativeValueToAssetFields(base, creativeValue, nowIso),
      reviewState: reviewStateForCreativeValue(creativeValue),
      productionState: 'EXPERIMENTAL',
      productionDestiny: 'UNDECIDED',
      reuseState: 'REUSABLE_WITH_ADAPTATION',
      brandLineageMembership: 'ACTIVE',
      brandDisposition: 'REVISION_PENDING',
      excludedFromBrandAt: null,
      crossBrandReuseEligibility: 'NOT_EVALUATED',
      internalNotes:
        base.internalNotes ??
        'Revision pending — open Revision Studio; generation requires explicit approval',
      updatedAt: nowIso,
    };
  }

  return {
    ...base,
    creativeValue: 'NOT_FOR_ME',
    reviewState: 'NOT_FOR_ME',
    productionState: 'RETIRED',
    productionDestiny: 'RETIRED',
    reuseState: 'RETIRED',
    brandLineageMembership: 'EXCLUDED',
    brandDisposition: dispositionForAction('NOT_FOR_ME'),
    crossBrandReuseEligibility: crossBrandEligibilityForAction('NOT_FOR_ME'),
    excludedFromBrandAt: nowIso,
    crossBrandPortable: false,
    ideaPortabilityEligible: true,
    exactAssetCrossBrandReuse: false,
    revisionPending: false,
    currentRevisionId: null,
    internalNotes:
      base.internalNotes ??
      'Excluded from NDXBOOK active library — global lineage preserved; idea portability evaluated separately',
    updatedAt: nowIso,
  };
}

export function mapFounderJudgmentToReviewState(judgment: FounderSlideJudgment): ReviewState {
  return reviewStateForCreativeValue(resolveCreativeValueFromJudgment(judgment));
}

/** Revision child assets start UNREVIEWED — never inherit parent judgment. */
export function buildRevisionChildAssetDefaults(
  parent: CreativeAssetRecord,
  childAssetId: string,
  revisionNumber: number,
  nowIso: string = new Date().toISOString(),
): Pick<
  CreativeAssetRecord,
  | 'assetId'
  | 'reviewState'
  | 'creativeValue'
  | 'productionState'
  | 'productionDestiny'
  | 'reuseState'
  | 'revisionPending'
  | 'brandDisposition'
  | 'relationship'
  | 'rootAssetId'
  | 'revisionNumber'
  | 'createdAt'
  | 'updatedAt'
> {
  return {
    assetId: childAssetId,
    reviewState: 'UNREVIEWED',
    creativeValue: 'UNREVIEWED',
    productionState: 'EXPERIMENTAL',
    productionDestiny: 'UNDECIDED',
    reuseState: 'REUSABLE_WITH_ADAPTATION',
    revisionPending: false,
    brandDisposition: 'ACTIVE',
    relationship: {
      parentAssetId: parent.assetId,
      derivedAssetIds: [],
      adaptationType: 'SURGICAL_REVISION',
    },
    rootAssetId: parent.rootAssetId ?? parent.assetId,
    revisionNumber,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export { productionDestinyForCreativeValue };
