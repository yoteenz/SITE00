/**
 * Auto-sync validation assets into brand-scoped creative lineage.
 * Founder judgments update lineage without deleting storage blobs.
 */

import type { CanonicalCarouselExpansionRun } from '../../../../shared/site00-brand-lore/canonicalCarouselExpansionTypes.js';
import type {
  CarouselDirectionCarousel,
  CarouselSlideRecord,
} from '../../../../shared/site00-brand-lore/canonicalCarouselExpansionTypes.js';
import type { CanonicalCreativeRangeRun } from '../../../../shared/site00-brand-lore/canonicalCreativeRangeTypes.js';
import {
  applyFounderJudgmentToAsset,
  defaultBrandLineageFields,
  type FounderSlideJudgment,
} from '../../../../shared/site00-brand-lore/creativeLineage/founderJudgmentLineage.js';
import type { CreativeAssetRecord, CreativeFamily, LaunchSeedSet } from '../../../../shared/site00-brand-lore/creativeLineage/types.js';
import { computePublishingReadiness } from '../../../../shared/site00-brand-lore/creativeLineage/canonVersioning.js';
import { createDefaultBrandCanonState } from '../../../../shared/site00-brand-lore/creativeLineage/canonVersioning.js';
import { NDXBOOK_ORG_ID } from '../creativeDirection/creativeIntelligence/founderComparisonSet.js';
import {
  buildCarouselSlideAssetRecord,
  buildRangeHeroAssetRecord,
  resolveCarouselSlideAssetId,
} from './assetRecordBuilders.js';
import * as store from './storeAdapter.js';

const BRAND_SLUG = 'ndxbook';

function nowIso(): string {
  return new Date().toISOString();
}

function mapRangeJudgment(j: string | null | undefined): FounderSlideJudgment {
  if (j === 'LOVE_IT' || j === 'PROMISING_REFINE' || j === 'REVISE' || j === 'NOT_FOR_ME') return j;
  if (j === 'NOT_NDXBOOK') return 'NOT_FOR_ME';
  return null;
}

async function ensureBrandCanonVersion(): Promise<number> {
  let canonState = await store.getBrandCanonState(BRAND_SLUG);
  if (!canonState) {
    canonState = await store.saveBrandCanonState(createDefaultBrandCanonState(BRAND_SLUG, NDXBOOK_ORG_ID));
  }
  return canonState.brandCanonVersion;
}

async function upsertAssetWithReadiness(asset: CreativeAssetRecord): Promise<CreativeAssetRecord> {
  const withReadiness: CreativeAssetRecord = {
    ...asset,
    publishingReadiness: computePublishingReadiness(asset),
  };
  return store.upsertCreativeAsset(withReadiness);
}

async function upsertFamilyMember(params: {
  asset: CreativeAssetRecord;
  topicId: string;
  topicName: string;
  familyNameSuffix: string;
}): Promise<void> {
  const { asset } = params;
  const fid = asset.creativeFamilyId;
  if (!fid) return;

  const existing = (await store.listCreativeFamilies(BRAND_SLUG)).find((f) => f.familyId === fid);
  const ts = nowIso();
  const memberIds = existing
    ? [...new Set([...existing.memberAssetIds, asset.assetId])]
    : [asset.assetId];

  const family: CreativeFamily = existing ?? {
    familyId: fid,
    brandSlug: BRAND_SLUG,
    orgId: NDXBOOK_ORG_ID,
    topicId: params.topicId,
    directionId: asset.directionLineage.directionId,
    directionName: asset.directionLineage.directionName,
    worldId: asset.directionLineage.worldId,
    name: `${params.topicName} / ${asset.directionLineage.directionName} / ${params.familyNameSuffix}`,
    primaryAssetId: asset.assetType === 'HERO' ? asset.assetId : null,
    memberAssetIds: memberIds,
    memberConceptIds: [],
    memberFranchiseIds: [],
    status: 'ACTIVE',
    createdAt: ts,
    updatedAt: ts,
  };

  await store.upsertCreativeFamily({
    ...family,
    memberAssetIds: memberIds,
    primaryAssetId: family.primaryAssetId ?? (asset.assetType === 'HERO' ? asset.assetId : memberIds[0] ?? null),
    updatedAt: ts,
  });
}

async function syncLaunchSeedSetForAsset(asset: CreativeAssetRecord): Promise<LaunchSeedSet | null> {
  const seedSet = await store.getLaunchSeedSet(BRAND_SLUG);
  if (!seedSet) return null;

  let selectedAssets = [...seedSet.selectedAssets];
  const isExcluded = asset.brandLineageMembership === 'EXCLUDED';

  if (isExcluded) {
    selectedAssets = selectedAssets.filter((id) => id !== asset.assetId);
  }
  // LOVE IT / production candidate does NOT auto-add to launch seed set

  if (selectedAssets.length === seedSet.selectedAssets.length && selectedAssets.every((id, i) => id === seedSet.selectedAssets[i])) {
    return seedSet;
  }

  const updated: LaunchSeedSet = { ...seedSet, selectedAssets, updatedAt: nowIso() };
  return store.upsertLaunchSeedSet(updated);
}

export type LineageSyncResult = {
  assetId: string;
  synced: boolean;
  brandLineageMembership: CreativeAssetRecord['brandLineageMembership'];
  productionState: CreativeAssetRecord['productionState'];
  reviewState: CreativeAssetRecord['reviewState'];
  message: string;
};

export async function syncRangeHeroToLineage(params: {
  rangeRun: CanonicalCreativeRangeRun;
  comparisonIndex: number;
}): Promise<LineageSyncResult | null> {
  const dir = params.rangeRun.directions.find((d) => d.comparisonIndex === params.comparisonIndex);
  if (!dir?.heroAsset?.storagePath) return null;

  const canonVersion = await ensureBrandCanonVersion();
  const ts = nowIso();
  const asset = buildRangeHeroAssetRecord({ dir, canonVersion, ts });
  const judgment = mapRangeJudgment(dir.founderJudgment);
  const finalized = judgment ? applyFounderJudgmentToAsset({ ...asset, ...defaultBrandLineageFields() }, judgment, ts) : asset;

  await upsertAssetWithReadiness(finalized);
  await upsertFamilyMember({
    asset: finalized,
    topicId: 'credit-utilization',
    topicName: 'CREDIT UTILIZATION',
    familyNameSuffix: 'HERO FAMILY',
  });
  await syncLaunchSeedSetForAsset(finalized);

  return {
    assetId: finalized.assetId,
    synced: true,
    brandLineageMembership: finalized.brandLineageMembership,
    productionState: finalized.productionState,
    reviewState: finalized.reviewState,
    message: lineageSyncMessage(finalized),
  };
}

export async function syncCarouselSlideToLineage(params: {
  carouselRun: CanonicalCarouselExpansionRun;
  comparisonIndex: number;
  slideNumber: number;
  heroAsset?: CreativeAssetRecord | null;
}): Promise<LineageSyncResult | null> {
  const dir = params.carouselRun.directions.find((d) => d.comparisonIndex === params.comparisonIndex);
  const slide = dir?.slides.find((s) => s.slideNumber === params.slideNumber);
  if (!dir || !slide?.asset?.storagePath) return null;

  if (slide.preserved && slide.slideNumber === 1) {
    return syncPreservedCoverSlide({ dir, slide, carouselRun: params.carouselRun, heroAsset: params.heroAsset });
  }

  const canonVersion = await ensureBrandCanonVersion();
  const ts = nowIso();
  const hero =
    params.heroAsset ??
    (await store.getCreativeAssetById(
      BRAND_SLUG,
      resolveCarouselSlideAssetId(dir, dir.slides.find((s) => s.slideNumber === 1) ?? slide),
    )) ??
    null;

  const asset = buildCarouselSlideAssetRecord({
    dir,
    slide,
    carouselExperimentVersion: params.carouselRun.carouselExperimentVersion,
    canonVersion,
    hero,
    ts,
  });

  const finalized = slide.founderJudgment
    ? applyFounderJudgmentToAsset({ ...asset, ...defaultBrandLineageFields() }, slide.founderJudgment, ts)
    : asset;

  await upsertAssetWithReadiness(finalized);
  await upsertFamilyMember({
    asset: finalized,
    topicId: params.carouselRun.sharedTopic?.topicId ?? 'credit-utilization',
    topicName: params.carouselRun.sharedTopic?.topicName ?? 'CREDIT UTILIZATION',
    familyNameSuffix: 'CAROUSEL FAMILY',
  });
  await syncLaunchSeedSetForAsset(finalized);

  return {
    assetId: finalized.assetId,
    synced: true,
    brandLineageMembership: finalized.brandLineageMembership,
    productionState: finalized.productionState,
    reviewState: finalized.reviewState,
    message: lineageSyncMessage(finalized),
  };
}

async function syncPreservedCoverSlide(params: {
  dir: CarouselDirectionCarousel;
  slide: CarouselSlideRecord;
  carouselRun: CanonicalCarouselExpansionRun;
  heroAsset?: CreativeAssetRecord | null;
}): Promise<LineageSyncResult | null> {
  const existingHero =
    params.heroAsset ??
    (await store.getCreativeAssetById(
      BRAND_SLUG,
      params.slide.asset?.assetId ?? `NDX-RANGE-HERO-${String(params.dir.comparisonIndex).padStart(2, '0')}`,
    ));

  if (existingHero) {
    const ts = nowIso();
    const judgment = params.slide.founderJudgment;
    const finalized = judgment
      ? applyFounderJudgmentToAsset({ ...existingHero, ...defaultBrandLineageFields() }, judgment, ts)
      : existingHero;
    await upsertAssetWithReadiness(finalized);
    await syncLaunchSeedSetForAsset(finalized);
    return {
      assetId: finalized.assetId,
      synced: true,
      brandLineageMembership: finalized.brandLineageMembership,
      productionState: finalized.productionState,
      reviewState: finalized.reviewState,
      message: lineageSyncMessage(finalized),
    };
  }

  return syncCarouselSlideToLineage({
    carouselRun: params.carouselRun,
    comparisonIndex: params.dir.comparisonIndex,
    slideNumber: 1,
    heroAsset: null,
  });
}

export async function applyFounderJudgmentToLineage(params: {
  assetId: string;
  judgment: FounderSlideJudgment;
}): Promise<LineageSyncResult> {
  const existing = await store.getCreativeAssetById(BRAND_SLUG, params.assetId);
  if (!existing) {
    throw new Error(`Lineage asset not found: ${params.assetId}`);
  }

  const ts = nowIso();
  const updated = applyFounderJudgmentToAsset({ ...existing, ...defaultBrandLineageFields() }, params.judgment, ts);
  updated.publishingReadiness = computePublishingReadiness(updated);
  await store.upsertCreativeAsset(updated);
  await syncLaunchSeedSetForAsset(updated);

  return {
    assetId: updated.assetId,
    synced: true,
    brandLineageMembership: updated.brandLineageMembership,
    productionState: updated.productionState,
    reviewState: updated.reviewState,
    message: lineageSyncMessage(updated),
  };
}

export function lineageSyncMessage(asset: CreativeAssetRecord): string {
  if (asset.brandLineageMembership === 'EXCLUDED') {
    return 'Excluded from NDXBOOK active library — global lineage preserved; idea portability evaluated separately';
  }
  if (asset.productionState === 'PRODUCTION_CANDIDATE') {
    return 'Production candidate — eligible for future launch consideration (not auto launch seed)';
  }
  if (asset.revisionPending) {
    return 'Revision pending — open Revision Studio for structured surgical spec';
  }
  return 'Synced to NDXBOOK brand lineage';
}

export async function syncAllCarouselAssetsFromRun(
  carouselRun: CanonicalCarouselExpansionRun,
): Promise<LineageSyncResult[]> {
  const results: LineageSyncResult[] = [];
  for (const dir of carouselRun.directions) {
    for (const slide of dir.slides) {
      if (!slide.asset?.storagePath) continue;
      const result = await syncCarouselSlideToLineage({
        carouselRun,
        comparisonIndex: dir.comparisonIndex,
        slideNumber: slide.slideNumber,
      });
      if (result) results.push(result);
    }
  }
  return results;
}
