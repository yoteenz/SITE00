/**
 * Lineage auto-sync + judgment integration tests.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import type { CanonicalCarouselExpansionRun } from '../../../../shared/site00-brand-lore/canonicalCarouselExpansionTypes.js';
import type { LaunchSeedSet } from '../../../../shared/site00-brand-lore/creativeLineage/types.js';
import { defaultBrandLineageFields } from '../../../../shared/site00-brand-lore/creativeLineage/founderJudgmentLineage.js';
import * as store from './storeAdapter.js';
import { syncCarouselSlideToLineage, applyFounderJudgmentToLineage } from './lineageAssetSync.js';
import { buildCarouselSlideAssetRecord } from './assetRecordBuilders.js';

function mockCarouselRun(): CanonicalCarouselExpansionRun {
  const directionId = randomUUID();
  return {
    experimentClassification: 'CANONICAL_SAME_TOPIC_CAROUSEL_EXPANSION',
    runId: 'test',
    organizationId: 'org',
    projectId: 'ndxbook',
    carouselExperimentVersion: 'carousel-v1',
    status: 'GENERATING_SLIDE',
    currentDirectionIndex: 1,
    currentSlideNumber: 2,
    sharedTopic: {
      topicId: 'credit-utilization',
      topicName: 'CREDIT UTILIZATION',
      topicSummary: 'test',
      coreClaim: 'test',
      challengedClaim: 'test',
      knownEvidence: [],
      openQuestions: [],
      possibleMisconceptions: [],
      usefulContext: [],
      audienceTakeaway: 'test',
      sourceBehavior: 'test',
      editorialRisk: 'test',
      factAccuracyRequirements: [],
    },
    directions: [
      {
        comparisonIndex: 1,
        directionId,
        directionName: 'THE MARKED-UP COPY',
        cover: null as never,
        worldBible: null,
        slides: [
          {
            slideNumber: 2,
            slideRole: 'EVIDENCE',
            slidePurpose: 'test',
            readerQuestion: 'q',
            readerTakeaway: 't',
            whyThisSlideExists: 'why',
            relationshipToPreviousSlide: 'prev',
            relationshipToNextSlide: 'next',
            compositionMode: 'FULL_BLEED',
            copy: {
              headline: 'h',
              supportingCopy: 's',
              microcopy: 'm',
              annotationCopy: 'a',
              metadataCopy: 'meta',
              sourceCopy: 'src',
              visualPunchline: 'p',
              copyPurpose: 'cp',
            },
            typography: {
              fontRole: 'headline',
              typeScaleRole: 'large',
              hierarchyRole: 'primary',
              typographyDevice: 'none',
              whyThisTypographyHere: 'why',
            },
            colorLogic: 'test',
            worldSignals: [],
            visualBrief: null,
            asset: {
              assetId: 'slide-asset-2',
              storagePath: 'site00/validation/ndxbook/carousel/01/s02.webp',
              topic: 'credit utilization',
              provider: 'openai/gpt-image-2',
              generatedAt: new Date().toISOString(),
            },
            generationReceipt: {
              firstGenerationResult: 'SUCCESS',
              creativeAttemptCount: 1,
              firstGenerationPromptHash: 'hash',
              firstGenerationModel: 'openai/gpt-image-2',
              firstGenerationCostUsd: 0,
              failureReason: null,
              generatedAt: new Date().toISOString(),
            },
            preserved: false,
            idempotencyKey: 'key',
            founderJudgment: null,
          },
        ],
        dnaEnvelope: null,
        compositionModesUsed: ['FULL_BLEED'],
        paletteRecognitionTest: 'PASS',
        founderVerdict: null,
        founderNote: null,
        rangeAnalysis: null,
      },
    ],
    crossDirectionPairs: [],
    emergentDna: null,
    contaminationTest: null,
    accounting: { anthropicRequests: 0, falRequests: 1, estimatedCostUsd: 0, durationMs: 0 },
    error: null,
    startedAt: new Date().toISOString(),
    completedAt: null,
  };
}

describe('lineageAssetSync', () => {
  beforeEach(() => {
    store.resetCreativeLineageMemory();
  });

  it('auto-syncs carousel slide to brand lineage on generation', async () => {
    const result = await syncCarouselSlideToLineage({
      carouselRun: mockCarouselRun(),
      comparisonIndex: 1,
      slideNumber: 2,
    });
    expect(result?.synced).toBe(true);
    const assets = await store.listCreativeAssets('ndxbook');
    expect(assets).toHaveLength(1);
    expect(assets[0]!.brandLineageMembership).toBe('ACTIVE');
  });

  it('NOT_FOR_ME removes asset from launch seed set without deleting record', async () => {
    const run = mockCarouselRun();
    await syncCarouselSlideToLineage({ carouselRun: run, comparisonIndex: 1, slideNumber: 2 });
    const asset = (await store.listCreativeAssets('ndxbook'))[0]!;

    const seedSet: LaunchSeedSet = {
      launchSeedSetId: 'seed-1',
      brandSlug: 'ndxbook',
      orgId: 'org',
      winningDirectionId: null,
      selectedAssets: [asset.assetId],
      selectedConcepts: [],
      selectedFranchises: [],
      launchOrder: [],
      assetProvenance: {},
      reviewRequiredAssetIds: [],
      notes: null,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await store.upsertLaunchSeedSet(seedSet);

    const excluded = await applyFounderJudgmentToLineage({ assetId: asset.assetId, judgment: 'NOT_FOR_ME' });
    expect(excluded.brandLineageMembership).toBe('EXCLUDED');

    const stored = await store.getCreativeAssetById('ndxbook', asset.assetId);
    expect(stored?.generationLineage.storagePath).toBeTruthy();

    const updatedSeed = await store.getLaunchSeedSet('ndxbook');
    expect(updatedSeed?.selectedAssets).not.toContain(asset.assetId);
  });

  it('LOVE_IT marks production candidate without auto launch seed add', async () => {
    const run = mockCarouselRun();
    await syncCarouselSlideToLineage({ carouselRun: run, comparisonIndex: 1, slideNumber: 2 });
    const asset = (await store.listCreativeAssets('ndxbook'))[0]!;

    await store.upsertLaunchSeedSet({
      launchSeedSetId: 'seed-1',
      brandSlug: 'ndxbook',
      orgId: 'org',
      winningDirectionId: null,
      selectedAssets: [],
      selectedConcepts: [],
      selectedFranchises: [],
      launchOrder: [],
      assetProvenance: {},
      reviewRequiredAssetIds: [],
      notes: null,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await applyFounderJudgmentToLineage({ assetId: asset.assetId, judgment: 'LOVE_IT' });
    const updatedSeed = await store.getLaunchSeedSet('ndxbook');
    expect(updatedSeed?.selectedAssets).not.toContain(asset.assetId);
    const updated = await store.getCreativeAssetById('ndxbook', asset.assetId);
    expect(updated?.productionState).toBe('PRODUCTION_CANDIDATE');
  });
});

describe('assetRecordBuilders', () => {
  it('includes brand lineage fields on built records', () => {
    const ts = new Date().toISOString();
    const run = mockCarouselRun();
    const dir = run.directions[0]!;
    const slide = dir.slides[0]!;
    const asset = buildCarouselSlideAssetRecord({
      dir,
      slide,
      carouselExperimentVersion: run.carouselExperimentVersion,
      canonVersion: 0,
      hero: null,
      ts,
    });
    expect(asset.brandLineageMembership).toBe('ACTIVE');
    expect(asset).toMatchObject(defaultBrandLineageFields());
  });
});
