/**
 * Carousel expansion service integration — VITEST stub slides, no FAL.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { CANONICAL_NDXBOOK_DIRECTION_NAMES } from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeConstants.js';
import type { CanonicalCreativeRangeRun } from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeTypes.js';
import { CAROUSEL_EXPECTED_NEW_GENERATIONS } from '../../../../../shared/site00-brand-lore/canonicalCarouselExpansionConstants.js';

vi.mock('../canonicalCreativeRange/canonicalCreativeRangeService.js', () => ({
  getCanonicalCreativeRangeRun: vi.fn(),
}));

vi.mock('../creativeIntelligence/gptImage2VisualProviderAdapter.js', () => ({
  generateIdentityNativeImageFromBrief: vi.fn(),
}));

vi.mock('../../../site00Assts/storage.js', () => ({
  downloadUrlToBuffer: vi.fn(),
  uploadSite00AssetBuffer: vi.fn(),
}));

import { getCanonicalCreativeRangeRun } from '../canonicalCreativeRange/canonicalCreativeRangeService.js';
import { generateIdentityNativeImageFromBrief } from '../creativeIntelligence/gptImage2VisualProviderAdapter.js';
import { downloadUrlToBuffer, uploadSite00AssetBuffer } from '../../../site00Assts/storage.js';
import {
  executeCanonicalCarouselExpansion,
  getCarouselExpansionPreflight,
  getCanonicalCarouselExpansionRun,
} from './canonicalCarouselExpansionService.js';
import * as carouselStore from './storeAdapter.js';

function mockRangeRun(): CanonicalCreativeRangeRun {
  const directions = CANONICAL_NDXBOOK_DIRECTION_NAMES.map((name, i) => ({
    comparisonIndex: i + 1,
    directionId: randomUUID(),
    canonicalName: name,
    sourceFormationId: randomUUID(),
    sourceFormationVersion: i < 3 ? 1 : 2,
    provenance: {
      directionId: randomUUID(),
      canonicalName: name,
      sourceRecord: 'test',
      sourceVersion: 1,
      sourceFormationId: randomUUID(),
      approvalState: 'APPROVED',
      coreDirectionAvailable: true,
      directionExpressionAvailable: true,
      creativeExpressionAvailable: true,
      identityArtDirectionAvailable: true,
      visualBriefAvailable: true,
      formatLineageAvailable: true,
      personalityLineageAvailable: true,
      missingLayers: [],
    },
    dnaEnvelope: null,
    formatSelection: {
      nativeFormat: 'CAROUSEL_COVER',
      nativeFormatReason: 'native',
      alternativeFormatsConsidered: [],
      whyAlternativesWereWeaker: [],
      formatSelectionEvidence: [],
      formatSelectionDerivedFromDirection: true,
      formatAssignmentContaminationTest: { passed: true, notes: [] },
    },
    directionExpression: null,
    identityArtDirection: null,
    creativeExpression: null,
    heroConcept: null,
    heroBrief: null,
    heroAsset: {
      assetId: `hero-${i + 1}`,
      storagePath: `site00/validation/ndxbook/canonical-creative-range/${String(i + 1).padStart(2, '0')}/hero.webp`,
      topic: 'credit utilization',
      provider: 'openai/gpt-image-2' as const,
      generatedAt: new Date().toISOString(),
    },
    generationReceipt: {
      firstGenerationResult: 'SUCCESS' as const,
      creativeAttemptCount: 1,
      firstGenerationPromptHash: 'abc',
      firstGenerationModel: 'openai/gpt-image-2',
      firstGenerationCostUsd: 0,
      failureReason: null,
      generatedAt: new Date().toISOString(),
    },
    contaminationTest: { passed: true, siblingHeroReferenced: false, siblingPromptReferenced: false, notes: [] },
    firstPassStatus: 'STRONG' as const,
    founderJudgment: null,
  }));
  return {
    experimentClassification: 'CANONICAL_CREATIVE_RANGE_VALIDATION',
    runId: 'test',
    organizationId: 'org',
    projectId: 'ndxbook',
    status: 'COMPLETE',
    currentDirectionIndex: null,
    rosterTest: null,
    provenanceReports: [],
    distinctivenessPairs: [],
    directions,
    observedFormatDiversity: null,
    audit: null,
    accounting: { anthropicRequests: 0, falRequests: 6, estimatedCostUsd: 0 },
    error: null,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
}

describe('canonical carousel expansion service', () => {
  beforeEach(() => {
    carouselStore.resetCanonicalCarouselExpansionMemory();
    vi.mocked(getCanonicalCreativeRangeRun).mockResolvedValue(mockRangeRun());
    vi.mocked(generateIdentityNativeImageFromBrief).mockReset();
    vi.mocked(downloadUrlToBuffer).mockReset();
    vi.mocked(uploadSite00AssetBuffer).mockReset();
  });

  it('preflight ready when 6 covers exist', async () => {
    const preflight = await getCarouselExpansionPreflight();
    expect(preflight.carouselExpansionReady).toBe(true);
    expect(preflight.coversResolved).toBe(6);
  });

  it('initialize builds world bibles and preserved covers', async () => {
    const run = await executeCanonicalCarouselExpansion({ mode: 'INITIALIZE' });
    expect(run.directions.length).toBe(6);
    expect(run.sharedTopic?.topicName).toBe('CREDIT UTILIZATION');
    for (const dir of run.directions) {
      expect(dir.worldBible).toBeTruthy();
      expect(dir.slides[0]?.preserved).toBe(true);
      expect(dir.slides[0]?.slideRole).toBe('CANONICAL_CAROUSEL_COVER');
    }
  });

  it('generates all 30 new slides in ALL_REMAINING mode', async () => {
    const run = await executeCanonicalCarouselExpansion({ mode: 'ALL_REMAINING' });
    expect(run.status).toBe('COMPLETE');
    let newSlides = 0;
    for (const dir of run.directions) {
      newSlides += dir.slides.filter((s) => s.slideNumber > 1 && s.asset).length;
      expect(dir.slides.length).toBe(6);
    }
    expect(newSlides).toBe(CAROUSEL_EXPECTED_NEW_GENERATIONS);
    expect(run.crossDirectionPairs.length).toBe(15);
    expect(run.emergentDna).toBeTruthy();
  });

  it('NEXT_SLIDE generates one slide at a time', async () => {
    await executeCanonicalCarouselExpansion({ mode: 'INITIALIZE' });
    const afterOne = await executeCanonicalCarouselExpansion({ mode: 'NEXT_SLIDE' });
    const generated = afterOne.directions.flatMap((d) => d.slides.filter((s) => s.slideNumber > 1 && s.asset));
    expect(generated.length).toBe(1);
  });

  it('get returns persisted run', async () => {
    await executeCanonicalCarouselExpansion({ mode: 'INITIALIZE' });
    const run = await getCanonicalCarouselExpansionRun();
    expect(run?.directions.length).toBe(6);
  });

  it('FAL path receives compiled V2 brief with compiledPrompt (not merged wrapper)', async () => {
    vi.stubEnv('VITEST', '');
    vi.stubEnv('FAL_KEY', 'test-fal-key');
    vi.mocked(generateIdentityNativeImageFromBrief).mockResolvedValue({
      url: 'https://example.com/carousel-slide.webp',
      model: 'openai/gpt-image-2',
      costEstimateUsd: 0.045,
    });
    vi.mocked(downloadUrlToBuffer).mockResolvedValue(Buffer.from('webp'));
    vi.mocked(uploadSite00AssetBuffer).mockResolvedValue(undefined);

    await executeCanonicalCarouselExpansion({ mode: 'INITIALIZE' });
    await executeCanonicalCarouselExpansion({ mode: 'NEXT_SLIDE' });

    expect(generateIdentityNativeImageFromBrief).toHaveBeenCalledTimes(1);
    const call = vi.mocked(generateIdentityNativeImageFromBrief).mock.calls[0]![0];
    expect(call.brief.compiledPrompt).toBeTruthy();
    expect(call.brief.compiledPrompt).toContain('CREATIVE EXPRESSION LAYER');
    expect((call.brief as { compiled?: unknown }).compiled).toBeUndefined();

    vi.unstubAllEnvs();
  });
});
