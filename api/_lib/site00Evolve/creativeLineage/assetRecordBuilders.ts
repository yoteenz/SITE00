/**
 * Build single CreativeAssetRecord instances from validation run outputs.
 */

import type {
  CanonicalCarouselExpansionRun,
  CarouselDirectionCarousel,
  CarouselSlideRecord,
} from '../../../../shared/site00-brand-lore/canonicalCarouselExpansionTypes.js';
import type { CanonicalCreativeRangeDirection } from '../../../../shared/site00-brand-lore/canonicalCreativeRangeTypes.js';
import {
  applyFounderJudgmentToAsset,
  defaultBrandLineageFields,
  mapFounderJudgmentToReviewState,
} from '../../../../shared/site00-brand-lore/creativeLineage/founderJudgmentLineage.js';
import type { CreativeAssetRecord } from '../../../../shared/site00-brand-lore/creativeLineage/types.js';
import { NDXBOOK_ORG_ID } from '../creativeDirection/creativeIntelligence/founderComparisonSet.js';

const TOPIC_ID = 'credit-utilization';
const TOPIC_NAME = 'CREDIT UTILIZATION';

function familyId(topicId: string, directionId: string): string {
  return `family-${topicId}-${directionId}`;
}

export function resolveCarouselSlideAssetId(dir: CarouselDirectionCarousel, slide: CarouselSlideRecord): string {
  return (
    slide.asset?.assetId ??
    `NDX-CAROUSEL-${String(dir.comparisonIndex).padStart(2, '0')}-S${String(slide.slideNumber).padStart(2, '0')}`
  );
}

export function resolveRangeHeroAssetId(dir: CanonicalCreativeRangeDirection): string {
  return dir.heroAsset?.assetId ?? `NDX-RANGE-HERO-${String(dir.comparisonIndex).padStart(2, '0')}`;
}

function mapReviewState(j: string | null | undefined): CreativeAssetRecord['reviewState'] {
  return mapFounderJudgmentToReviewState(
    j === 'LOVE_IT' || j === 'PROMISING_REFINE' || j === 'NOT_FOR_ME'
      ? j
      : j === 'NOT_NDXBOOK'
        ? 'NOT_FOR_ME'
        : j === 'APPROVED'
          ? 'APPROVED'
          : null,
  );
}

export function finalizeAssetRecord(
  asset: CreativeAssetRecord,
  founderJudgment: string | null | undefined,
  ts: string,
): CreativeAssetRecord {
  const withDefaults: CreativeAssetRecord = { ...asset, ...defaultBrandLineageFields() };
  if (
    founderJudgment === 'LOVE_IT' ||
    founderJudgment === 'PROMISING_REFINE' ||
    founderJudgment === 'NOT_FOR_ME'
  ) {
    return applyFounderJudgmentToAsset(withDefaults, founderJudgment, ts);
  }
  if (founderJudgment === 'NOT_NDXBOOK') {
    return applyFounderJudgmentToAsset(withDefaults, 'NOT_FOR_ME', ts);
  }
  return { ...withDefaults, updatedAt: ts };
}

export function buildRangeHeroAssetRecord(params: {
  dir: CanonicalCreativeRangeDirection;
  canonVersion: number;
  ts: string;
}): CreativeAssetRecord {
  const { dir, canonVersion, ts } = params;
  const worldId = `world-${dir.directionId}`;
  const fid = familyId(TOPIC_ID, dir.directionId);
  const assetId = resolveRangeHeroAssetId(dir);

  return finalizeAssetRecord(
    {
      assetId,
      orgId: NDXBOOK_ORG_ID,
      projectId: 'ndxbook',
      brandSlug: 'ndxbook',
      brandDisplayName: 'NDXBOOK',
      assetType: 'HERO',
      sourceType: 'GENERATED',
      creativeStage: 'VALIDATION',
      directionLineage: {
        directionId: dir.directionId,
        directionName: dir.canonicalName,
        formationId: dir.sourceFormationId,
        formationVersion: dir.sourceFormationVersion,
        canonicalAtCreation: true,
        worldId,
        worldVersion: 'v1',
        experimentClassification: 'CANONICAL_CREATIVE_RANGE_VALIDATION',
      },
      contentLineage: {
        topicId: TOPIC_ID,
        topicName: TOPIC_NAME,
        contentFranchiseId: null,
        episodeId: null,
        carouselId: null,
        slideNumber: null,
        format: dir.formatSelection?.nativeFormat ?? 'CAROUSEL_COVER',
        nativeFormatReason: dir.formatSelection?.nativeFormatReason ?? null,
      },
      intelligenceLineage: {
        brandLoreVersion: null,
        brandLoreFingerprint: null,
        personalityFingerprint: null,
        expressionContext: 'SOCIAL_FIRST_EDITORIAL',
        directionExpressionSystemId: null,
        creativeExpressionSystemId: null,
        identityArtDirectionId: null,
        visualBriefId: null,
        promptHash: dir.generationReceipt?.firstGenerationPromptHash ?? null,
      },
      generationLineage: {
        provider: dir.heroAsset!.provider,
        model: dir.generationReceipt?.firstGenerationModel ?? 'openai/gpt-image-2',
        requestId: null,
        generationVersion: 'canonical-range-v1',
        parentAssetIds: [],
        referenceAssetIds: [],
        imageConditioningUsed: false,
        promptVersion: null,
        generatedAt: dir.heroAsset!.generatedAt,
        generationCostUsd: dir.generationReceipt?.firstGenerationCostUsd ?? null,
        storagePath: dir.heroAsset!.storagePath,
      },
      reviewState: 'UNREVIEWED',
      productionState: 'EXPERIMENTAL',
      reuseState: 'ORIGINAL_USE_ONLY',
      canonStatus: 'DIRECTION_CANON',
      relationship: { parentAssetId: null, derivedAssetIds: [], adaptationType: null },
      creativeFamilyId: fid,
      brandCanonVersionAtGeneration: canonVersion,
      contentCanonVersionAtGeneration: canonVersion,
      founderNotes: null,
      internalNotes: null,
      salvageClassification: null,
      publishingReadiness: null,
      historicalSourceRef: `site00_methodology_validation_runs:CANONICAL_CREATIVE_RANGE:${dir.comparisonIndex}`,
      immutable: true,
      createdAt: ts,
      updatedAt: ts,
      ...defaultBrandLineageFields(),
    },
    dir.founderJudgment,
    ts,
  );
}

export function buildCarouselSlideAssetRecord(params: {
  dir: CarouselDirectionCarousel;
  slide: CarouselSlideRecord;
  carouselExperimentVersion: CanonicalCarouselExpansionRun['carouselExperimentVersion'];
  canonVersion: number;
  hero: CreativeAssetRecord | null;
  ts: string;
}): CreativeAssetRecord {
  const { dir, slide, carouselExperimentVersion, canonVersion, hero, ts } = params;
  const worldId = `world-${dir.directionId}`;
  const fid = familyId(TOPIC_ID, dir.directionId);
  const assetId = resolveCarouselSlideAssetId(dir, slide);

  const parentId =
    slide.slideNumber === 1 && hero
      ? null
      : slide.slideNumber > 1 && hero
        ? hero.assetId
        : null;

  return finalizeAssetRecord(
    {
      assetId,
      orgId: NDXBOOK_ORG_ID,
      projectId: 'ndxbook',
      brandSlug: 'ndxbook',
      brandDisplayName: 'NDXBOOK',
      assetType: slide.slideNumber === 1 ? 'HERO' : 'CAROUSEL_SLIDE',
      sourceType: slide.preserved ? 'REFERENCE' : 'GENERATED',
      creativeStage: 'VALIDATION',
      directionLineage: {
        directionId: dir.directionId,
        directionName: dir.directionName,
        formationId: null,
        formationVersion: null,
        canonicalAtCreation: true,
        worldId,
        worldVersion: 'carousel-v1',
        experimentClassification: 'CANONICAL_SAME_TOPIC_CAROUSEL_EXPANSION',
      },
      contentLineage: {
        topicId: TOPIC_ID,
        topicName: TOPIC_NAME,
        contentFranchiseId: null,
        episodeId: null,
        carouselId: `carousel-${dir.directionId}-${TOPIC_ID}`,
        slideNumber: slide.slideNumber,
        format: 'CAROUSEL_SEQUENCE',
        nativeFormatReason: slide.slideRole,
      },
      intelligenceLineage: {
        brandLoreVersion: null,
        brandLoreFingerprint: null,
        personalityFingerprint: null,
        expressionContext: 'SOCIAL_FIRST_EDITORIAL',
        directionExpressionSystemId: null,
        creativeExpressionSystemId: null,
        identityArtDirectionId: null,
        visualBriefId: null,
        promptHash: slide.generationReceipt?.firstGenerationPromptHash ?? null,
      },
      generationLineage: {
        provider: slide.asset!.provider,
        model: slide.generationReceipt?.firstGenerationModel ?? 'openai/gpt-image-2',
        requestId: null,
        generationVersion: carouselExperimentVersion,
        parentAssetIds: parentId ? [parentId] : [],
        referenceAssetIds: slide.preserved && hero ? [hero.assetId] : [],
        imageConditioningUsed: false,
        promptVersion: null,
        generatedAt: slide.asset!.generatedAt,
        generationCostUsd: slide.generationReceipt?.firstGenerationCostUsd ?? null,
        storagePath: slide.asset!.storagePath,
      },
      reviewState: mapReviewState(slide.founderJudgment),
      productionState: 'EXPERIMENTAL',
      reuseState: slide.preserved ? 'ORIGINAL_USE_ONLY' : 'REUSABLE_WITH_ADAPTATION',
      canonStatus: 'DIRECTION_CANON',
      relationship: {
        parentAssetId: parentId,
        derivedAssetIds: [],
        adaptationType: slide.preserved ? 'CANONICAL_CAROUSEL_COVER' : 'CAROUSEL_CONTINUATION',
      },
      creativeFamilyId: fid,
      brandCanonVersionAtGeneration: canonVersion,
      contentCanonVersionAtGeneration: canonVersion,
      founderNotes: null,
      internalNotes: slide.preserved ? 'Preserved Experiment B cover — not regenerated' : null,
      salvageClassification: null,
      publishingReadiness: null,
      historicalSourceRef: `site00_methodology_validation_runs:CAROUSEL_EXPANSION:${dir.comparisonIndex}:slide${slide.slideNumber}`,
      immutable: true,
      createdAt: ts,
      updatedAt: ts,
      ...defaultBrandLineageFields(),
    },
    slide.founderJudgment,
    ts,
  );
}
