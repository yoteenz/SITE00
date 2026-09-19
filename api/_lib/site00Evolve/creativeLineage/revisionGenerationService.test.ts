/**
 * Revision generation service integration (mocked — no FAL spend).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import * as assetStore from './storeAdapter.js';
import { resetFounderJudgmentRevisionMemory } from './founderJudgmentRevisionStoreAdapter.js';
import { defaultBrandLineageFields } from '../../../../shared/site00-brand-lore/creativeLineage/founderJudgmentLineage.js';
import type { CreativeAssetRecord } from '../../../../shared/site00-brand-lore/creativeLineage/types.js';
import {
  createRevisionSpecDraft,
  compileRevisionSpec,
  approveRevisionSpecForGeneration,
  attemptGenerateRevision,
} from './founderJudgmentRevisionService.js';
import { setRevisionImageGeneratorForTests } from './revisionGenerationService.js';

vi.mock('../../site00Assts/storage.js', () => ({
  downloadUrlToBuffer: vi.fn(async () => Buffer.from('fake-webp')),
  uploadSite00AssetBuffer: vi.fn(async (path: string) => ({
    publicUrl: `https://example.com/${path}`,
    storagePath: path,
  })),
  site00StorageObjectExists: vi.fn(async () => true),
}));

function seedAsset(): CreativeAssetRecord {
  const ts = new Date().toISOString();
  const assetId = randomUUID();
  return {
    assetId,
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
      promptHash: 'hash-1',
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
      storagePath: 'site00/test.webp',
    },
    reviewState: 'REVISE',
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
    historicalSourceRef: 'test',
    immutable: true,
    ...defaultBrandLineageFields(),
    rootAssetId: assetId,
    createdAt: ts,
    updatedAt: ts,
  };
}

describe('revisionGenerationService', () => {
  beforeEach(() => {
    assetStore.resetCreativeLineageMemory();
    resetFounderJudgmentRevisionMemory();
    setRevisionImageGeneratorForTests(async () => ({
      url: 'https://fal.example/fake.webp',
      model: 'openai/gpt-image-2/edit',
      costEstimateUsd: 0.045,
    }));
  });

  it('blocks generation without approval', async () => {
    const asset = seedAsset();
    await assetStore.upsertCreativeAsset(asset);
    const spec = await createRevisionSpecDraft({
      parentAssetId: asset.assetId,
      categoryNotes: { color: 'yellow to lime' },
      lockedElements: ['COPY', 'COMPOSITION'],
      mutableElements: ['COLOR'],
    });
    await compileRevisionSpec(spec.revisionId);
    const result = await attemptGenerateRevision(spec.revisionId);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('APPROVED_FOR_GENERATION');
  });

  it('generates one child after explicit approval (mocked provider)', async () => {
    const asset = seedAsset();
    await assetStore.upsertCreativeAsset(asset);
    const spec = await createRevisionSpecDraft({
      parentAssetId: asset.assetId,
      categoryNotes: { color: 'yellow to lime' },
      lockedElements: ['COPY', 'COMPOSITION', 'TYPOGRAPHY'],
      mutableElements: ['COLOR'],
      severity: 'MICRO',
    });
    await compileRevisionSpec(spec.revisionId);
    await approveRevisionSpecForGeneration(spec.revisionId);
    const result = await attemptGenerateRevision(spec.revisionId);
    expect(result.allowed).toBe(true);
    expect(result.child?.creativeValue).toBe('UNREVIEWED');
    expect(result.spec?.status).toBe('COMPARISON_READY');
    expect(result.receipt?.storagePath).toContain('revisions/');

    const parentAfter = (await assetStore.listCreativeAssets('ndxbook')).find((a) => a.assetId === asset.assetId);
    expect(parentAfter?.relationship.derivedAssetIds.length).toBe(1);
    expect(parentAfter?.assetId).toBe(asset.assetId);
  });

  it('idempotent return when comparison already ready', async () => {
    const asset = seedAsset();
    await assetStore.upsertCreativeAsset(asset);
    const spec = await createRevisionSpecDraft({
      parentAssetId: asset.assetId,
      mutableElements: ['COLOR'],
      categoryNotes: { color: 'lime' },
    });
    await compileRevisionSpec(spec.revisionId);
    await approveRevisionSpecForGeneration(spec.revisionId);
    const first = await attemptGenerateRevision(spec.revisionId);
    const second = await attemptGenerateRevision(spec.revisionId);
    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(second.child?.assetId).toBe(first.child?.assetId);
  });
});
