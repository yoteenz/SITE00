/**
 * Apply founder slide/direction judgments to brand-scoped creative asset lineage.
 * NOT FOR ME excludes from this brand's active library — storage and record preserved.
 */

import type { CreativeAssetRecord, ReviewState } from './types.js';

export type FounderSlideJudgment = 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME' | null;

export function defaultBrandLineageFields(): Pick<
  CreativeAssetRecord,
  'brandLineageMembership' | 'excludedFromBrandAt' | 'crossBrandPortable' | 'revisionPending'
> {
  return {
    brandLineageMembership: 'ACTIVE',
    excludedFromBrandAt: null,
    crossBrandPortable: false,
    revisionPending: false,
  };
}

export function normalizeBrandLineageFields(asset: CreativeAssetRecord): CreativeAssetRecord {
  return {
    ...asset,
    brandLineageMembership: asset.brandLineageMembership ?? 'ACTIVE',
    excludedFromBrandAt: asset.excludedFromBrandAt ?? null,
    crossBrandPortable: asset.crossBrandPortable ?? false,
    revisionPending: asset.revisionPending ?? false,
  };
}

export function isActiveInBrandLineage(asset: CreativeAssetRecord): boolean {
  return normalizeBrandLineageFields(asset).brandLineageMembership === 'ACTIVE';
}

export function applyFounderJudgmentToAsset(
  asset: CreativeAssetRecord,
  judgment: FounderSlideJudgment,
  nowIso: string = new Date().toISOString(),
): CreativeAssetRecord {
  const base = normalizeBrandLineageFields(asset);

  if (!judgment) {
    return {
      ...base,
      reviewState: 'UNREVIEWED',
      productionState: 'EXPERIMENTAL',
      reuseState: base.assetType === 'HERO' ? 'ORIGINAL_USE_ONLY' : 'REUSABLE_WITH_ADAPTATION',
      brandLineageMembership: 'ACTIVE',
      excludedFromBrandAt: null,
      crossBrandPortable: false,
      revisionPending: false,
      updatedAt: nowIso,
    };
  }

  if (judgment === 'LOVE_IT') {
    return {
      ...base,
      reviewState: 'LOVE_IT',
      productionState: 'PRODUCTION_CANDIDATE',
      reuseState: 'REUSABLE_AS_IS',
      brandLineageMembership: 'ACTIVE',
      excludedFromBrandAt: null,
      crossBrandPortable: false,
      revisionPending: false,
      internalNotes: base.internalNotes ?? 'Founder LOVE IT — production candidate for this brand (winner not required)',
      updatedAt: nowIso,
    };
  }

  if (judgment === 'PROMISING_REFINE') {
    return {
      ...base,
      reviewState: 'PROMISING_REFINE',
      productionState: 'EXPERIMENTAL',
      reuseState: 'REUSABLE_WITH_ADAPTATION',
      brandLineageMembership: 'ACTIVE',
      excludedFromBrandAt: null,
      crossBrandPortable: false,
      revisionPending: true,
      internalNotes:
        base.internalNotes ??
        'Revision pending — detailed typography/color/composition notes and regeneration wired in a future sprint',
      updatedAt: nowIso,
    };
  }

  // NOT_FOR_ME — excluded from this brand's active lineage; blob preserved for cross-brand reuse
  return {
    ...base,
    reviewState: 'NOT_FOR_ME',
    productionState: 'RETIRED',
    reuseState: 'RETIRED',
    brandLineageMembership: 'EXCLUDED',
    excludedFromBrandAt: nowIso,
    crossBrandPortable: true,
    revisionPending: false,
    internalNotes:
      base.internalNotes ??
      'Excluded from NDXBOOK brand lineage by founder — storage preserved; may be portable to another brand',
    updatedAt: nowIso,
  };
}

export function mapFounderJudgmentToReviewState(judgment: FounderSlideJudgment): ReviewState {
  if (judgment === 'LOVE_IT') return 'LOVE_IT';
  if (judgment === 'PROMISING_REFINE') return 'PROMISING_REFINE';
  if (judgment === 'NOT_FOR_ME') return 'NOT_FOR_ME';
  return 'UNREVIEWED';
}
