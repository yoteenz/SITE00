/**
 * Carousel slide storage reconciliation tests.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CanonicalCarouselExpansionRun } from '../../../../../shared/site00-brand-lore/canonicalCarouselExpansionTypes.js';
import { reconcileCarouselRunMissingStorage } from './carouselSlideStorageReconciliation.js';

vi.mock('../../../site00Assts/storage.js', () => ({
  site00StorageObjectExists: vi.fn(),
}));

import { site00StorageObjectExists } from '../../../site00Assts/storage.js';

function mockRun(): CanonicalCarouselExpansionRun {
  return {
    experimentClassification: 'CANONICAL_SAME_TOPIC_CAROUSEL_EXPANSION',
    runId: 'test',
    organizationId: 'org',
    projectId: 'ndxbook',
    carouselExperimentVersion: 'carousel-v1',
    status: 'GENERATING_SLIDE',
    currentDirectionIndex: 1,
    currentSlideNumber: 2,
    sharedTopic: null,
    directions: [
      {
        comparisonIndex: 1,
        directionId: 'dir-1',
        directionName: 'THE MARKED-UP COPY',
        cover: null as never,
        worldBible: null,
        slides: [
          {
            slideNumber: 2,
            slideRole: 'ORIGINAL CLAIM',
            slidePurpose: 'test',
            readerQuestion: 'q',
            readerTakeaway: 't',
            whyThisSlideExists: 'why',
            relationshipToPreviousSlide: 'prev',
            relationshipToNextSlide: 'next',
            compositionMode: 'TYPE_DOMINANT',
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
              assetId: 'NDX-CAROUSEL-01-S02',
              storagePath: 'site00/validation/ndxbook/canonical-carousel-expansion/01/slide-02.webp',
              topic: 'credit-utilization',
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
        compositionModesUsed: [],
        paletteRecognitionTest: 'PASS',
        founderVerdict: null,
        founderNote: null,
        rangeAnalysis: null,
      },
    ],
    crossDirectionPairs: [],
    emergentDna: null,
    contaminationTest: null,
    accounting: {
      anthropicRequests: 0,
      falRequests: 0,
      gptImage2Requests: 0,
      gptImage2CostUsd: 0,
      falCostUsd: 0,
      durationMs: 0,
      transportRetries: 0,
      generationAttempts: 0,
    },
    error: null,
    startedAt: new Date().toISOString(),
    completedAt: null,
  };
}

describe('carouselSlideStorageReconciliation', () => {
  beforeEach(() => {
    vi.mocked(site00StorageObjectExists).mockReset();
  });

  it('clears SUCCESS slides when storage blob is missing', async () => {
    vi.mocked(site00StorageObjectExists).mockResolvedValue(false);
    const { run, repairedSlideCount } = await reconcileCarouselRunMissingStorage(mockRun());
    expect(repairedSlideCount).toBe(1);
    const slide = run.directions[0]!.slides[0]!;
    expect(slide.asset).toBeNull();
    expect(slide.generationReceipt?.firstGenerationResult).toBe('TRANSPORT_FAILURE');
  });

  it('keeps SUCCESS slides when storage blob exists', async () => {
    vi.mocked(site00StorageObjectExists).mockResolvedValue(true);
    const { run, repairedSlideCount } = await reconcileCarouselRunMissingStorage(mockRun());
    expect(repairedSlideCount).toBe(0);
    expect(run.directions[0]!.slides[0]!.asset?.storagePath).toContain('slide-02');
  });
});
