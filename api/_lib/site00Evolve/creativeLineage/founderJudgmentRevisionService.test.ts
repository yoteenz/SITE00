/**
 * Founder judgment + revision service integration (memory store).
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import * as assetStore from './storeAdapter.js';
import { resetFounderJudgmentRevisionMemory } from './founderJudgmentRevisionStoreAdapter.js';
import { defaultBrandLineageFields } from '../../../../shared/site00-brand-lore/creativeLineage/founderJudgmentLineage.js';
import type { CreativeAssetRecord } from '../../../../shared/site00-brand-lore/creativeLineage/types.js';
import {
  recordFounderCreativeJudgment,
  createRevisionSpecDraft,
  compileRevisionSpec,
  getRevisionHistory,
  attemptGenerateRevision,
} from './founderJudgmentRevisionService.js';

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
    historicalSourceRef: 'test',
    immutable: true,
    ...defaultBrandLineageFields(),
    rootAssetId: assetId,
    createdAt: ts,
    updatedAt: ts,
  };
}

describe('founderJudgmentRevisionService', () => {
  beforeEach(() => {
    assetStore.resetCreativeLineageMemory();
    resetFounderJudgmentRevisionMemory();
  });

  it('records durable judgment with history', async () => {
    const asset = seedAsset();
    await assetStore.upsertCreativeAsset(asset);
    const first = await recordFounderCreativeJudgment({ assetId: asset.assetId, founderAction: 'LOVE_IT' });
    const second = await recordFounderCreativeJudgment({ assetId: asset.assetId, founderAction: 'REVISE' });
    expect(second.judgment.judgmentHistory.length).toBeGreaterThanOrEqual(2);
    expect(second.judgment.previousJudgment).toBe('LOVE_IT');
    expect(second.asset.revisionPending).toBe(true);
  });

  it('creates revision spec and compiles delta brief', async () => {
    const asset = seedAsset();
    await assetStore.upsertCreativeAsset(asset);
    const spec = await createRevisionSpecDraft({
      parentAssetId: asset.assetId,
      founderOriginalNote: 'Push typography',
      categoryNotes: { typography: 'Stronger hierarchy' },
      lockedElements: ['COPY'],
      mutableElements: ['TYPOGRAPHY'],
    });
    const compiled = await compileRevisionSpec(spec.revisionId);
    expect(compiled.brief.deltaPrompt).toContain('TYPOGRAPHY');
    expect(compiled.generationGate.approved).toBe(false);
  });

  it('returns revision history for root asset', async () => {
    const asset = seedAsset();
    await assetStore.upsertCreativeAsset(asset);
    await createRevisionSpecDraft({ parentAssetId: asset.assetId });
    const history = await getRevisionHistory(asset.assetId);
    expect(history.revisions).toHaveLength(1);
  });

  it('blocks live revision generation with UNREVIEWED child defaults', async () => {
    const asset = seedAsset();
    await assetStore.upsertCreativeAsset(asset);
    const spec = await createRevisionSpecDraft({ parentAssetId: asset.assetId });
    const gate = await attemptGenerateRevision(spec.revisionId);
    expect(gate.allowed).toBe(false);
    expect(gate.childDefaults?.creativeValue).toBe('UNREVIEWED');
  });
});
