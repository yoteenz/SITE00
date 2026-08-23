/**
 * Founder judgment → brand-scoped lineage tests.
 */

import { describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  applyFounderJudgmentToAsset,
  defaultBrandLineageFields,
  isActiveInBrandLineage,
} from './founderJudgmentLineage.js';
import type { CreativeAssetRecord } from './types.js';

function sampleAsset(overrides: Partial<CreativeAssetRecord> = {}): CreativeAssetRecord {
  const ts = new Date().toISOString();
  return {
    assetId: randomUUID(),
    orgId: 'org',
    projectId: 'ndxbook',
    brandSlug: 'ndxbook',
    brandDisplayName: 'NDXBOOK',
    assetType: 'CAROUSEL_SLIDE',
    sourceType: 'GENERATED',
    creativeStage: 'VALIDATION',
    directionLineage: {
      directionId: 'dir-1',
      directionName: 'THE MARKED-UP COPY',
      formationId: null,
      formationVersion: 1,
      canonicalAtCreation: true,
      worldId: 'world-1',
      worldVersion: 'v1',
      experimentClassification: 'CANONICAL_SAME_TOPIC_CAROUSEL_EXPANSION',
    },
    contentLineage: {
      topicId: 'credit-utilization',
      topicName: 'CREDIT UTILIZATION',
      contentFranchiseId: null,
      episodeId: null,
      carouselId: 'carousel-1',
      slideNumber: 2,
      format: 'CAROUSEL_SEQUENCE',
      nativeFormatReason: null,
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
      promptHash: null,
    },
    generationLineage: {
      provider: 'openai/gpt-image-2',
      model: 'openai/gpt-image-2',
      requestId: null,
      generationVersion: 'v1',
      parentAssetIds: [],
      referenceAssetIds: [],
      imageConditioningUsed: false,
      promptVersion: null,
      generatedAt: ts,
      generationCostUsd: 0,
      storagePath: 'site00/validation/ndxbook/test.webp',
    },
    reviewState: 'UNREVIEWED',
    productionState: 'EXPERIMENTAL',
    reuseState: 'REUSABLE_WITH_ADAPTATION',
    canonStatus: 'DIRECTION_CANON',
    relationship: { parentAssetId: null, derivedAssetIds: [], adaptationType: null },
    creativeFamilyId: 'family-1',
    brandCanonVersionAtGeneration: 0,
    contentCanonVersionAtGeneration: 0,
    founderNotes: null,
    internalNotes: null,
    salvageClassification: null,
    publishingReadiness: null,
    historicalSourceRef: 'test:ref',
    immutable: true,
    ...defaultBrandLineageFields(),
    createdAt: ts,
    updatedAt: ts,
    ...overrides,
  };
}

describe('founderJudgmentLineage', () => {
  it('LOVE_IT marks production candidate without requiring winner', () => {
    const result = applyFounderJudgmentToAsset(sampleAsset(), 'LOVE_IT');
    expect(result.productionState).toBe('PRODUCTION_CANDIDATE');
    expect(result.reuseState).toBe('REUSABLE_WITH_ADAPTATION');
    expect(result.brandLineageMembership).toBe('ACTIVE');
    expect(isActiveInBrandLineage(result)).toBe(true);
  });

  it('NOT_FOR_ME excludes from brand lineage but preserves storage path', () => {
    const asset = sampleAsset();
    const result = applyFounderJudgmentToAsset(asset, 'NOT_FOR_ME');
    expect(result.brandLineageMembership).toBe('EXCLUDED');
    expect(result.crossBrandPortable).toBe(false);
    expect(result.ideaPortabilityEligible).toBe(true);
    expect(result.exactAssetCrossBrandReuse).toBe(false);
    expect(result.productionState).toBe('RETIRED');
    expect(result.generationLineage.storagePath).toBe(asset.generationLineage.storagePath);
    expect(isActiveInBrandLineage(result)).toBe(false);
    expect(result.excludedFromBrandAt).toBeTruthy();
  });

  it('REVISE flags revision pending without retiring asset', () => {
    const result = applyFounderJudgmentToAsset(sampleAsset(), 'REVISE');
    expect(result.revisionPending).toBe(true);
    expect(result.reviewState).toBe('REVISE');
    expect(result.brandDisposition).toBe('REVISION_PENDING');
    expect(result.productionState).toBe('EXPERIMENTAL');
    expect(result.brandLineageMembership).toBe('ACTIVE');
  });

  it('PROMISING_REFINE legacy alias preserves creative value', () => {
    const result = applyFounderJudgmentToAsset(sampleAsset(), 'PROMISING_REFINE');
    expect(result.revisionPending).toBe(true);
    expect(result.reviewState).toBe('PROMISING_REFINE');
    expect(result.creativeValue).toBe('PROMISING_REFINE');
  });
});
