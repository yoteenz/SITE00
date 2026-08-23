/**
 * Apply founder slide/direction judgments to brand-scoped creative asset lineage.
 * NOT FOR ME excludes from this brand's active library — storage and record preserved.
 * REVISE opens surgical revision workflow — no live regeneration this sprint.
 */

import type { CreativeAssetRecord, ReviewState } from './types.js';
import type { FounderCreativeAction } from './founderCreativeJudgmentTypes.js';
import { dispositionForAction, crossBrandEligibilityForAction, normalizeFounderAction } from './founderCreativeJudgmentTypes.js';

export type FounderSlideJudgment = FounderCreativeAction | 'PROMISING_REFINE' | null;

export function defaultBrandLineageFields(): Pick<
  CreativeAssetRecord,
  | 'brandLineageMembership'
  | 'excludedFromBrandAt'
  | 'crossBrandPortable'
  | 'revisionPending'
  | 'brandDisposition'
  | 'crossBrandReuseEligibility'
  | 'rootAssetId'
  | 'revisionNumber'
  | 'currentRevisionId'
> {
  return {
    brandLineageMembership: 'ACTIVE',
    excludedFromBrandAt: null,
    crossBrandPortable: false,
    revisionPending: false,
    brandDisposition: 'ACTIVE',
    crossBrandReuseEligibility: 'NOT_EVALUATED',
    rootAssetId: null,
    revisionNumber: 0,
    currentRevisionId: null,
  };
}

export function normalizeBrandLineageFields(asset: CreativeAssetRecord): CreativeAssetRecord {
  return {
    ...asset,
    ...defaultBrandLineageFields(),
    brandLineageMembership: asset.brandLineageMembership ?? 'ACTIVE',
    excludedFromBrandAt: asset.excludedFromBrandAt ?? null,
    crossBrandPortable: asset.crossBrandPortable ?? false,
    revisionPending: asset.revisionPending ?? false,
    brandDisposition: asset.brandDisposition ?? 'ACTIVE',
    crossBrandReuseEligibility: asset.crossBrandReuseEligibility ?? 'NOT_EVALUATED',
    rootAssetId: asset.rootAssetId ?? asset.assetId,
    revisionNumber: asset.revisionNumber ?? 0,
    currentRevisionId: asset.currentRevisionId ?? null,
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

export function applyFounderJudgmentToAsset(
  asset: CreativeAssetRecord,
  judgment: FounderSlideJudgment,
  nowIso: string = new Date().toISOString(),
): CreativeAssetRecord {
  const base = normalizeBrandLineageFields(asset);
  const action = normalizeFounderAction(judgment);

  if (!action) {
    return {
      ...base,
      reviewState: 'UNREVIEWED',
      productionState: 'EXPERIMENTAL',
      reuseState: base.assetType === 'HERO' ? 'ORIGINAL_USE_ONLY' : 'REUSABLE_WITH_ADAPTATION',
      brandLineageMembership: 'ACTIVE',
      brandDisposition: 'ACTIVE',
      excludedFromBrandAt: null,
      crossBrandPortable: false,
      crossBrandReuseEligibility: 'NOT_EVALUATED',
      revisionPending: false,
      currentRevisionId: null,
      updatedAt: nowIso,
    };
  }

  if (action === 'LOVE_IT') {
    return {
      ...base,
      reviewState: 'LOVE_IT',
      productionState: 'PRODUCTION_CANDIDATE',
      reuseState: base.reuseState === 'RETIRED' ? 'REUSABLE_AS_IS' : base.reuseState,
      brandLineageMembership: 'ACTIVE',
      brandDisposition: 'LOVED',
      excludedFromBrandAt: null,
      crossBrandPortable: false,
      crossBrandReuseEligibility: 'NOT_EVALUATED',
      revisionPending: false,
      currentRevisionId: null,
      internalNotes:
        base.internalNotes ??
        'Founder LOVE IT — production candidate for this brand (not canon, not winner, not auto launch seed)',
      updatedAt: nowIso,
    };
  }

  if (action === 'REVISE') {
    return {
      ...base,
      reviewState: 'REVISE',
      productionState: 'EXPERIMENTAL',
      reuseState: 'REUSABLE_WITH_ADAPTATION',
      brandLineageMembership: 'ACTIVE',
      brandDisposition: 'REVISION_PENDING',
      excludedFromBrandAt: null,
      crossBrandPortable: false,
      crossBrandReuseEligibility: 'NOT_EVALUATED',
      revisionPending: true,
      internalNotes:
        base.internalNotes ?? 'Revision pending — open Revision Studio for structured surgical spec',
      updatedAt: nowIso,
    };
  }

  return {
    ...base,
    reviewState: 'NOT_FOR_ME',
    productionState: 'RETIRED',
    reuseState: 'RETIRED',
    brandLineageMembership: 'EXCLUDED',
    brandDisposition: dispositionForAction(action),
    crossBrandReuseEligibility: crossBrandEligibilityForAction(action),
    excludedFromBrandAt: nowIso,
    crossBrandPortable: true,
    revisionPending: false,
    currentRevisionId: null,
    internalNotes:
      base.internalNotes ??
      'Excluded from NDXBOOK brand lineage by founder — storage preserved; Studio World archive only',
    updatedAt: nowIso,
  };
}

export function mapFounderJudgmentToReviewState(judgment: FounderSlideJudgment): ReviewState {
  const action = normalizeFounderAction(judgment);
  if (action === 'LOVE_IT') return 'LOVE_IT';
  if (action === 'REVISE') return 'REVISE';
  if (action === 'NOT_FOR_ME') return 'NOT_FOR_ME';
  return 'UNREVIEWED';
}
