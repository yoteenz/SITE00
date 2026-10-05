/**
 * NDXBOOK creative asset lineage service — normalization, promotion, salvage, library.
 */

import { randomUUID } from 'node:crypto';
import type {
  BrandCanonTrait,
  CreativeAssetRecord,
  CreativeLineageLibraryFilters,
  CreativeLineageLibraryPayload,
  GoverningCreativeWorld,
  LaunchSeedSet,
  ProductionState,
  ReuseState,
  ReviewState,
  SalvageReviewProgress,
  WinningWorldPromotionPlan,
} from '../../../../shared/site00-brand-lore/creativeLineage/types.js';
import { buildForensicAuditReport } from '../../../../shared/site00-brand-lore/creativeLineage/forensicAudit.js';
import {
  createDefaultBrandCanonState,
  incrementBrandCanonVersion,
  markAssetsStaleForBrandCanonChange,
  computePublishingReadiness,
} from '../../../../shared/site00-brand-lore/creativeLineage/canonVersioning.js';
import { buildSalvageReviewItems } from '../../../../shared/site00-brand-lore/creativeLineage/salvageClassification.js';
import { translateConceptIntoWinningWorld } from '../../../../shared/site00-brand-lore/creativeLineage/worldTranslationEngine.js';
import {
  applyLaunchSeedReviewFlagsToAssets,
  createEmptyLaunchSeedSet,
  reconcileLaunchSeedSemantics,
} from './launchSeedSemanticsService.js';
import { getCanonicalCarouselExpansionRun } from '../creativeDirection/canonicalCarouselExpansion/canonicalCarouselExpansionService.js';
import { getCanonicalCreativeRangeRun } from '../creativeDirection/canonicalCreativeRange/canonicalCreativeRangeService.js';
import { NDXBOOK_ORG_ID } from '../creativeDirection/creativeIntelligence/founderComparisonSet.js';
import { normalizeFromValidationRuns, persistNormalization } from './assetNormalizer.js';
import * as store from './storeAdapter.js';

function nowIso(): string {
  return new Date().toISOString();
}

export async function runNdxbookForensicAudit(): Promise<ReturnType<typeof buildForensicAuditReport>> {
  const assets = await store.listCreativeAssets('ndxbook');
  const concepts = await store.listCreativeConcepts('ndxbook');
  const rangeRun = await getCanonicalCreativeRangeRun();
  const carouselRun = await getCanonicalCarouselExpansionRun();

  const report = buildForensicAuditReport({
    brandSlug: 'ndxbook',
    assetCount: assets.length,
    conceptCount: concepts.length,
    experimentCounts: {
      canonicalRangeHeroes: rangeRun?.directions.filter((d) => d.heroAsset).length ?? 0,
      carouselSlides: carouselRun?.directions.flatMap((d) => d.slides.filter((s) => s.asset)).length ?? 0,
    },
  });
  await store.saveForensicAudit(report);
  return report;
}

export async function normalizeNdxbookCreativeLineage(): Promise<{
  report: ReturnType<typeof buildForensicAuditReport>;
  normalized: Awaited<ReturnType<typeof persistNormalization>>;
}> {
  let canonState = await store.getBrandCanonState('ndxbook');
  if (!canonState) {
    canonState = await store.saveBrandCanonState(createDefaultBrandCanonState('ndxbook', NDXBOOK_ORG_ID));
  }

  const rangeRun = await getCanonicalCreativeRangeRun();
  const carouselRun = await getCanonicalCarouselExpansionRun();
  const data = normalizeFromValidationRuns({
    rangeRun,
    carouselRun,
    brandCanonVersion: canonState.brandCanonVersion,
  });

  for (const asset of data.assets) {
    asset.publishingReadiness = computePublishingReadiness(asset);
  }

  const normalized = await persistNormalization(data, store);
  const report = await runNdxbookForensicAudit();

  const assets = await store.listCreativeAssets('ndxbook');
  const seedSet = await store.getLaunchSeedSet('ndxbook');
  const reconcile = reconcileLaunchSeedSemantics(seedSet, assets);
  if (reconcile.launchSeedSet) {
    await store.upsertLaunchSeedSet(reconcile.launchSeedSet);
    const flagged = applyLaunchSeedReviewFlagsToAssets(assets, reconcile.launchSeedSet);
    for (const asset of flagged) {
      if (asset.launchSeedReviewRequired || asset.productionDestiny === 'LAUNCH_SEED_REVIEW_REQUIRED') {
        await store.upsertCreativeAsset(asset);
      }
    }
  }

  return { report, normalized, launchSeedReconcile: reconcile };
}

function filterAssets(assets: CreativeAssetRecord[], filters: CreativeLineageLibraryFilters): CreativeAssetRecord[] {
  return assets.filter((a) => {
    if (filters.section === 'EXCLUDED_FROM_BRAND' || filters.section === 'REJECTED_FOR_BRAND') {
      return a.brandDisposition === 'REJECTED_FOR_BRAND' || a.brandLineageMembership === 'EXCLUDED';
    }
    if (
      filters.section !== 'RETIRED' &&
      filters.section !== 'EXCLUDED_FROM_BRAND' &&
      filters.section !== 'REJECTED_FOR_BRAND' &&
      (a.brandLineageMembership === 'EXCLUDED' || a.brandDisposition === 'REJECTED_FOR_BRAND')
    ) {
      return false;
    }
    if (filters.section === 'LOVED') {
      return a.brandDisposition === 'LOVED' || a.reviewState === 'LOVE_IT';
    }
    if (filters.section === 'REVISION_PENDING') {
      return a.brandDisposition === 'REVISION_PENDING' || a.revisionPending === true;
    }
    if (filters.section === 'REVISED') {
      return (a.revisionNumber ?? 0) > 0 || Boolean(a.relationship.parentAssetId);
    }
    if (filters.section === 'CANON_REVIEW') {
      return a.brandDisposition === 'CANON_CANDIDATE' || a.canonStatus === 'BRAND_CANON_CANDIDATE';
    }
    if (filters.directionId && a.directionLineage.directionId !== filters.directionId) return false;
    if (filters.worldId && a.directionLineage.worldId !== filters.worldId) return false;
    if (filters.topicId && a.contentLineage.topicId !== filters.topicId) return false;
    if (filters.productionState && a.productionState !== filters.productionState) return false;
    if (filters.reuseState && a.reuseState !== filters.reuseState) return false;
    if (filters.canonStatus && a.canonStatus !== filters.canonStatus) return false;
    if (filters.reviewState && a.reviewState !== filters.reviewState) return false;
    if (filters.section === 'CANONICAL' && a.canonStatus === 'NON_CANON') return false;
    if (filters.section === 'PRODUCTION_CANDIDATES' && a.productionState !== 'PRODUCTION_CANDIDATE') return false;
    if (filters.section === 'CAROUSELS' && a.assetType !== 'CAROUSEL_SLIDE' && a.contentLineage.carouselId === null)
      return false;
    if (filters.section === 'ADAPTABLE' && a.reuseState !== 'REUSABLE_WITH_ADAPTATION') return false;
    if (filters.section === 'RETIRED' && a.productionState !== 'RETIRED' && a.brandLineageMembership !== 'EXCLUDED')
      return false;
    return true;
  });
}

export async function getCreativeLineageLibrary(
  filters: CreativeLineageLibraryFilters = {},
): Promise<CreativeLineageLibraryPayload> {
  const brandSlug = 'ndxbook';
  const [assets, concepts, franchises, families, editorialIdeas, brandCanonState, promotionPlan, launchSeedSet, salvageReviews, forensicAudit] =
    await Promise.all([
      store.listCreativeAssets(brandSlug),
      store.listCreativeConcepts(brandSlug),
      store.listContentFranchises(brandSlug),
      store.listCreativeFamilies(brandSlug),
      store.listEditorialIdeas(brandSlug),
      store.getBrandCanonState(brandSlug),
      store.getPromotionPlan(brandSlug),
      store.getLaunchSeedSet(brandSlug),
      store.listSalvageReviews(brandSlug),
      store.getForensicAudit(),
    ]);

  return {
    assets: filterAssets(applyLaunchSeedReviewFlagsToAssets(assets, launchSeedSet), filters),
    concepts,
    franchises,
    families,
    editorialIdeas,
    brandCanonState,
    launchSeedSet,
    promotionPlan,
    salvageReviews,
    forensicAudit,
  };
}

export async function updateCreativeAssetProduction(params: {
  assetId: string;
  productionState?: ProductionState;
  reuseState?: ReuseState;
  reviewState?: ReviewState;
  founderNotes?: string | null;
}): Promise<CreativeAssetRecord> {
  const assets = await store.listCreativeAssets('ndxbook');
  const asset = assets.find((a) => a.assetId === params.assetId);
  if (!asset) throw new Error('Asset not found');

  const updated: CreativeAssetRecord = {
    ...asset,
    productionState: params.productionState ?? asset.productionState,
    reuseState: params.reuseState ?? asset.reuseState,
    reviewState: params.reviewState ?? asset.reviewState,
    founderNotes: params.founderNotes ?? asset.founderNotes,
    publishingReadiness: computePublishingReadiness({
      ...asset,
      productionState: params.productionState ?? asset.productionState,
      reviewState: params.reviewState ?? asset.reviewState,
    }),
    updatedAt: nowIso(),
  };
  return store.upsertCreativeAsset(updated);
}

export async function selectAssetForLaunchSeed(assetId: string): Promise<{
  asset: CreativeAssetRecord;
  launchSeedSet: LaunchSeedSet;
}> {
  const assets = await store.listCreativeAssets('ndxbook');
  const asset = assets.find((a) => a.assetId === assetId);
  if (!asset) throw new Error('Asset not found');

  let seedSet = await store.getLaunchSeedSet('ndxbook');
  if (!seedSet) {
    seedSet = createEmptyLaunchSeedSet({ brandSlug: 'ndxbook', orgId: NDXBOOK_ORG_ID });
  }

  const { addAssetToLaunchSeedSet } = await import('./launchSeedSemanticsService.js');
  const updatedSeed = addAssetToLaunchSeedSet(seedSet, assetId, 'FOUNDER_SELECTED');
  await store.upsertLaunchSeedSet(updatedSeed);

  const updatedAsset: CreativeAssetRecord = {
    ...asset,
    productionDestiny: 'LAUNCH_SELECTED',
    launchSeedReviewRequired: false,
    updatedAt: nowIso(),
  };
  await store.upsertCreativeAsset(updatedAsset);

  const { appendAssetLifecycleEvent } = await import('./assetLifecycleEventStore.js');
  const { randomUUID } = await import('node:crypto');
  await appendAssetLifecycleEvent({
    eventId: `event-${randomUUID()}`,
    assetId,
    brandSlug: 'ndxbook',
    kind: 'ASSET_SELECTED_FOR_LAUNCH',
    creativeValue: updatedAsset.creativeValue,
    productionDestiny: 'LAUNCH_SELECTED',
    detail: 'Founder explicitly selected asset for Launch Seed Set',
    createdAt: nowIso(),
  });

  return { asset: updatedAsset, launchSeedSet: updatedSeed };
}

export async function reconcileNdxbookLaunchSeedSemantics(): Promise<
  Awaited<ReturnType<typeof reconcileLaunchSeedSemantics>>
> {
  const assets = await store.listCreativeAssets('ndxbook');
  const seedSet = await store.getLaunchSeedSet('ndxbook');
  const result = reconcileLaunchSeedSemantics(seedSet, assets);
  if (result.launchSeedSet) {
    await store.upsertLaunchSeedSet(result.launchSeedSet);
    const flagged = applyLaunchSeedReviewFlagsToAssets(assets, result.launchSeedSet);
    for (const asset of flagged) {
      if (
        asset.launchSeedReviewRequired !==
          assets.find((a) => a.assetId === asset.assetId)?.launchSeedReviewRequired ||
        asset.productionDestiny !== assets.find((a) => a.assetId === asset.assetId)?.productionDestiny
      ) {
        await store.upsertCreativeAsset(asset);
      }
    }
  }
  return result;
}

export async function createWinningWorldPromotionPlan(params: {
  winningDirectionId: string;
  winningDirectionName: string;
  winningWorldId: string;
  founderDecisionId?: string | null;
  governingWorld?: Partial<GoverningCreativeWorld>;
}): Promise<WinningWorldPromotionPlan> {
  const gw = params.governingWorld ?? {};
  const governingCreativeWorld: GoverningCreativeWorld = {
    canonicalDirectionId: params.winningDirectionId,
    canonicalDirectionName: params.winningDirectionName,
    canonicalWorldId: params.winningWorldId,
    canonicalTypographySystem: gw.canonicalTypographySystem ?? 'Direction-native typography',
    canonicalColorSystem: gw.canonicalColorSystem ?? 'Direction-native palette',
    canonicalCompositionSystem: gw.canonicalCompositionSystem ?? 'Direction-native composition',
    canonicalPhotographySystem: gw.canonicalPhotographySystem ?? 'Editorial documentary',
    canonicalGraphicGrammar: gw.canonicalGraphicGrammar ?? 'Direction-native devices',
    canonicalArtifactLanguage: gw.canonicalArtifactLanguage ?? 'Direction-native artifacts',
    canonicalMotionLanguage: gw.canonicalMotionLanguage ?? 'Social-native motion',
    canonicalVoiceBehavior: gw.canonicalVoiceBehavior ?? 'NDXBOOK editorial voice',
    canonicalSocialBehavior: gw.canonicalSocialBehavior ?? 'Carousel-first editorial',
    canonicalFormatBehavior: gw.canonicalFormatBehavior ?? 'Format-native expression',
  };

  const ts = nowIso();
  const plan: WinningWorldPromotionPlan = {
    planId: `promotion-${randomUUID()}`,
    brandSlug: 'ndxbook',
    orgId: NDXBOOK_ORG_ID,
    winningDirectionId: params.winningDirectionId,
    winningWorldId: params.winningWorldId,
    winningDirectionName: params.winningDirectionName,
    founderDecisionId: params.founderDecisionId ?? null,
    promotionTimestamp: null,
    status: 'DRAFT',
    governingCreativeWorld,
    autoTriggered: false,
    createdAt: ts,
    updatedAt: ts,
  };
  return store.upsertPromotionPlan(plan);
}

/** Founder-triggered only — never auto-called. */
export async function promoteWinningWorld(planId: string): Promise<{
  plan: WinningWorldPromotionPlan;
  launchSeedSet: LaunchSeedSet;
  salvageReviews: SalvageReviewProgress[];
}> {
  const plan = await store.getPromotionPlanById(planId);
  if (!plan) throw new Error('Promotion plan not found');

  const promoted: WinningWorldPromotionPlan = {
    ...plan,
    status: 'PROMOTED',
    promotionTimestamp: nowIso(),
    updatedAt: nowIso(),
  };
  await store.upsertPromotionPlan(promoted);

  let canonState = (await store.getBrandCanonState('ndxbook')) ?? createDefaultBrandCanonState('ndxbook', NDXBOOK_ORG_ID);
  canonState = incrementBrandCanonVersion({
    ...canonState,
    governingWorldId: plan.winningWorldId,
    winningDirectionId: plan.winningDirectionId,
    winningDirectionName: plan.winningDirectionName,
  });
  await store.saveBrandCanonState(canonState);

  const assets = await store.listCreativeAssets('ndxbook');
  const concepts = await store.listCreativeConcepts('ndxbook');
  const franchises = await store.listContentFranchises('ndxbook');

  const staleAssets = markAssetsStaleForBrandCanonChange(assets, canonState.brandCanonVersion);
  for (const asset of staleAssets) {
    if (asset.directionLineage.directionId === plan.winningDirectionId && asset.reviewState === 'LOVE_IT') {
      asset.productionState = 'PRODUCTION_CANDIDATE';
    }
    await store.upsertCreativeAsset(asset);
  }

  const launchSeedSet = createEmptyLaunchSeedSet({
    brandSlug: 'ndxbook',
    orgId: NDXBOOK_ORG_ID,
    winningDirectionId: plan.winningDirectionId,
    notes: 'Empty launch seed set — founder selects contents explicitly after promotion',
  });
  await store.upsertLaunchSeedSet(launchSeedSet);

  const losingDirections = [...new Set(assets.map((a) => a.directionLineage.directionId))].filter(
    (id) => id !== plan.winningDirectionId,
  );
  const salvageReviews: SalvageReviewProgress[] = [];
  for (const losingId of losingDirections) {
    const losingName =
      assets.find((a) => a.directionLineage.directionId === losingId)?.directionLineage.directionName ?? losingId;
    const review: SalvageReviewProgress = {
      brandSlug: 'ndxbook',
      winningDirectionId: plan.winningDirectionId,
      losingDirectionId: losingId,
      losingDirectionName: losingName,
      items: buildSalvageReviewItems({
        losingDirectionId: losingId,
        losingDirectionName: losingName,
        assets,
        concepts,
        franchises,
      }),
      completed: false,
    };
    await store.saveSalvageReview(review);
    salvageReviews.push(review);
  }

  return { plan: promoted, launchSeedSet, salvageReviews };
}

export async function promoteBrandCanonTrait(params: {
  traitType: BrandCanonTrait['traitType'];
  sourceDirectionId: string;
  sourceWorldId: string;
  description: string;
  rationale: string;
  founderApproved: boolean;
}): Promise<BrandCanonTrait> {
  const ts = nowIso();
  const trait: BrandCanonTrait = {
    traitId: `trait-${randomUUID()}`,
    brandSlug: 'ndxbook',
    orgId: NDXBOOK_ORG_ID,
    traitType: params.traitType,
    sourceDirectionId: params.sourceDirectionId,
    sourceWorldId: params.sourceWorldId,
    description: params.description,
    rationale: params.rationale,
    founderApproved: params.founderApproved,
    promotedAt: params.founderApproved ? ts : null,
    status: params.founderApproved ? 'APPROVED' : 'PROPOSED',
    createdAt: ts,
    updatedAt: ts,
  };
  if (params.founderApproved) {
    let canonState = (await store.getBrandCanonState('ndxbook')) ?? createDefaultBrandCanonState('ndxbook', '');
    canonState = incrementBrandCanonVersion(canonState);
    await store.saveBrandCanonState(canonState);
  }
  return store.upsertBrandCanonTrait(trait);
}

export async function previewSalvageTranslation(params: {
  conceptId: string;
  winningDirectionName: string;
  governingWorld: GoverningCreativeWorld;
}) {
  const concepts = await store.listCreativeConcepts('ndxbook');
  const concept = concepts.find((c) => c.conceptId === params.conceptId);
  if (!concept) throw new Error('Concept not found');
  return translateConceptIntoWinningWorld({
    concept,
    originDirectionName: concept.originDirectionName,
    winningWorld: params.governingWorld,
    targetFormat: 'CAROUSEL',
    targetTopic: 'CREDIT UTILIZATION',
  });
}

export async function saveSalvageReviewAction(params: {
  winningDirectionId: string;
  losingDirectionId: string;
  itemId: string;
  action: SalvageReviewProgress['items'][0]['founderAction'];
}): Promise<SalvageReviewProgress> {
  const reviews = await store.listSalvageReviews('ndxbook');
  const review = reviews.find(
    (r) => r.winningDirectionId === params.winningDirectionId && r.losingDirectionId === params.losingDirectionId,
  );
  if (!review) throw new Error('Salvage review not found');

  const items = review.items.map((item) =>
    item.itemId === params.itemId ? { ...item, founderAction: params.action } : item,
  );
  const updated = { ...review, items, completed: items.every((i) => i.founderAction !== null) };
  return store.saveSalvageReview(updated);
}
