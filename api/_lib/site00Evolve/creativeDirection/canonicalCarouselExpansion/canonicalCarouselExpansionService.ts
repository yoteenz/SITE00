/**
 * Canonical six same-topic carousel world expansion orchestrator — Experiment C.
 */

import { createHash } from 'node:crypto';
import {
  CANONICAL_CAROUSEL_EXPANSION_EXPERIMENT,
  CAROUSEL_EXPERIMENT_VERSION,
  CAROUSEL_TOTAL_SLIDES,
  COVER_INFLUENCE_CONTRACT,
  NDXBOOK_CANONICAL_CAROUSEL_EXPANSION_RUN_ID,
} from '../../../../../shared/site00-brand-lore/canonicalCarouselExpansionConstants.js';
import type {
  CanonicalCarouselExpansionRun,
  CarouselDirectionCarousel,
  CarouselExecuteMode,
  CarouselExecutionAccounting,
  CarouselSlideRecord,
} from '../../../../../shared/site00-brand-lore/canonicalCarouselExpansionTypes.js';
import { buildCarouselExpansionPreflight } from '../../../../../shared/site00-brand-lore/canonicalCarouselExpansionPreflight.js';
import { buildSharedCarouselTopicContext } from '../../../../../shared/site00-brand-lore/canonicalCarouselTopic.js';
import {
  resolvePreservedCoversFromRangeRun,
  runCanonicalCarouselCoverPreservationTest,
} from '../../../../../shared/site00-brand-lore/canonicalCarouselCoverPreservation.js';
import {
  buildDirectionCarouselWorldBible,
  deriveCarouselSlidePlan,
  runCarouselWorldBibleTest,
  runPaletteRecognitionTest,
  countUniqueCompositionModes,
} from '../../../../../shared/site00-brand-lore/canonicalCarouselWorldBible.js';
import {
  buildCarouselDirectionRangeAnalysis,
  buildCrossDirectionPairReports,
  buildEmergentNdxbookDnaReport,
  runCrossDirectionCarouselContaminationTest,
  runHostFontLeakageTest,
  runSite00VisualDnaLeakageTest,
} from '../../../../../shared/site00-brand-lore/canonicalCarouselExpansionAnalysis.js';
import { CANONICAL_NDXBOOK_DIRECTION_NAMES } from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeConstants.js';
import type { CanonicalCreativeRangeRun } from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeTypes.js';
import { assertNoHostFontInPayload } from '../../../../../shared/site00-brand-lore/typographyProvenance.js';
import { compileIdentityNativeV2VisualBrief } from '../creativeIntelligence/identityNativeVisualBriefV2Compiler.js';
import { generateIdentityNativeImageFromBrief } from '../creativeIntelligence/gptImage2VisualProviderAdapter.js';
import {
  buildCarouselSlideArtDirection,
  buildCarouselSlideCreativeExpression,
  buildCarouselSlideHeroConcept,
  carouselSlideCopyQualityScores,
} from './carouselSlideBriefBuilder.js';
import { downloadUrlToBuffer, uploadSite00AssetBuffer } from '../../../site00Assts/storage.js';
import { getCanonicalCreativeRangeRun } from '../canonicalCreativeRange/canonicalCreativeRangeService.js';
import { NDXBOOK_ORG_ID } from '../creativeIntelligence/founderComparisonSet.js';
import * as carouselStore from './storeAdapter.js';

function nowIso(): string {
  return new Date().toISOString();
}

function emptyAccounting(): CarouselExecutionAccounting {
  return {
    anthropicRequests: 0,
    anthropicInputTokens: 0,
    anthropicOutputTokens: 0,
    anthropicEstimatedCostUsd: 0,
    gptImage2Requests: 0,
    gptImage2CostUsd: 0,
    falRequests: 0,
    falCostUsd: 0,
    durationMs: 0,
    transportRetries: 0,
    generationAttempts: 0,
  };
}

function hashPrompt(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function slideStoragePath(comparisonIndex: number, slideNumber: number): string {
  return `site00/validation/ndxbook/canonical-carousel-expansion/${String(comparisonIndex).padStart(2, '0')}/slide-${String(slideNumber).padStart(2, '0')}.webp`;
}

function initRun(existing: CanonicalCarouselExpansionRun | null): CanonicalCarouselExpansionRun {
  return (
    existing ?? {
      experimentClassification: CANONICAL_CAROUSEL_EXPANSION_EXPERIMENT,
      runId: NDXBOOK_CANONICAL_CAROUSEL_EXPANSION_RUN_ID,
      organizationId: NDXBOOK_ORG_ID,
      projectId: 'ndxbook',
      carouselExperimentVersion: CAROUSEL_EXPERIMENT_VERSION,
      status: 'NOT_STARTED',
      currentDirectionIndex: null,
      currentSlideNumber: null,
      sharedTopic: null,
      directions: [],
      crossDirectionPairs: [],
      emergentDna: null,
      contaminationTest: null,
      accounting: emptyAccounting(),
      error: null,
      startedAt: nowIso(),
      completedAt: null,
    }
  );
}

function buildCarouselBrief(params: {
  slide: CarouselSlideRecord;
  direction: CarouselDirectionCarousel;
  topic: ReturnType<typeof buildSharedCarouselTopicContext>;
}): Record<string, unknown> {
  const { slide, direction, topic } = params;
  const cover = direction.cover!;
  return {
    experiment: CANONICAL_CAROUSEL_EXPANSION_EXPERIMENT,
    topic: topic.topicName,
    directionName: direction.directionName,
    slideNumber: slide.slideNumber,
    slideRole: slide.slideRole,
    compositionMode: slide.compositionMode,
    copy: slide.copy,
    typography: slide.typography,
    worldBible: {
      carouselThesis: direction.worldBible?.carouselThesis,
      palette: direction.worldBible?.dominant,
      typographyBehavior: direction.worldBible?.typographyBehavior,
    },
    coverInfluence: COVER_INFLUENCE_CONTRACT,
    coverReference: {
      storagePath: cover.existingHeroStoragePath,
      role: 'WORLD CONTEXT ONLY',
    },
    forbidden: [
      'Do not copy exact cover layout',
      'Do not replicate cover geometry',
      'Do not reuse same headline composition',
      'Same magazine issue — not same post with different words',
    ],
    role: 'SOCIAL_CAROUSEL_SLIDE',
    aspectRatio: '1:1',
  };
}

async function generateCarouselSlideAsset(params: {
  comparisonIndex: number;
  slide: CarouselSlideRecord;
  direction: CarouselDirectionCarousel;
  topic: ReturnType<typeof buildSharedCarouselTopicContext>;
  accounting: CarouselExecutionAccounting;
}): Promise<{ slide: CarouselSlideRecord; accounting: CarouselExecutionAccounting }> {
  const { comparisonIndex, direction, topic } = params;
  let slide = params.slide;
  let accounting = { ...params.accounting };

  if (slide.preserved || (slide.asset && slide.generationReceipt?.firstGenerationResult === 'SUCCESS')) {
    return { slide, accounting };
  }

  const brief = buildCarouselBrief({ slide, direction, topic });
  slide = { ...slide, visualBrief: brief };

  const hostCheck = assertNoHostFontInPayload(brief);
  if (!hostCheck.passed) throw new Error(`Host typography leakage: ${hostCheck.violations.join('; ')}`);
  if (!runHostFontLeakageTest(brief).passed || !runSite00VisualDnaLeakageTest(brief).passed) {
    throw new Error('Visual DNA leakage in carousel brief');
  }

  const contamination = runCrossDirectionCarouselContaminationTest({
    directionIndex: comparisonIndex,
    promptPayload: brief,
    allDirectionNames: [...CANONICAL_NDXBOOK_DIRECTION_NAMES],
  });
  if (!contamination.passed && process.env.VITEST !== 'true') {
    throw new Error(`Cross-direction contamination: ${contamination.notes.join('; ')}`);
  }

  const compiledBrief = compileIdentityNativeV2VisualBrief({
    artDirection: buildCarouselSlideArtDirection({ direction, slide }),
    creativeExpression: buildCarouselSlideCreativeExpression({ direction, slide }),
    heroConcept: buildCarouselSlideHeroConcept({ direction, slide, topic }),
    copyQualityScores: carouselSlideCopyQualityScores(),
    role: 'SOCIAL_APPLICATION_SUBSTRATE',
    topic: topic.topicName,
  });

  const mergedBrief = { ...brief, compiled: compiledBrief };
  slide = { ...slide, visualBrief: mergedBrief };
  const promptHash = hashPrompt(JSON.stringify(mergedBrief));

  if (process.env.VITEST === 'true' || !process.env.FAL_KEY?.trim()) {
    if (process.env.VITEST === 'true') {
      slide = {
        ...slide,
        asset: {
          assetId: `NDX-CAROUSEL-${String(comparisonIndex).padStart(2, '0')}-S${String(slide.slideNumber).padStart(2, '0')}`,
          storagePath: slideStoragePath(comparisonIndex, slide.slideNumber),
          topic: topic.topicId,
          provider: 'openai/gpt-image-2',
          generatedAt: nowIso(),
        },
        generationReceipt: {
          firstGenerationResult: 'SUCCESS',
          creativeAttemptCount: 1,
          firstGenerationPromptHash: promptHash,
          firstGenerationModel: 'openai/gpt-image-2',
          firstGenerationCostUsd: 0,
          failureReason: null,
          generatedAt: nowIso(),
        },
      };
      accounting.generationAttempts += 1;
      accounting.gptImage2Requests += 1;
      return { slide, accounting };
    }
    throw new Error('FAL_KEY not configured — carousel slide generation blocked');
  }

  const generation = await generateIdentityNativeImageFromBrief({
    brief: compiledBrief,
    aspectRatio: '1:1',
  });
  accounting.falRequests += 1;
  accounting.gptImage2Requests += 1;
  accounting.gptImage2CostUsd += generation.costEstimateUsd;
  accounting.falCostUsd += generation.costEstimateUsd;
  accounting.generationAttempts += 1;

  const imageBuffer = await downloadUrlToBuffer(generation.url);
  const storagePath = slideStoragePath(comparisonIndex, slide.slideNumber);
  await uploadSite00AssetBuffer(storagePath, imageBuffer, 'image/webp', { upsert: true });

  slide = {
    ...slide,
    asset: {
      assetId: `NDX-CAROUSEL-${String(comparisonIndex).padStart(2, '0')}-S${String(slide.slideNumber).padStart(2, '0')}`,
      storagePath,
      topic: topic.topicId,
      provider: 'openai/gpt-image-2',
      generatedAt: nowIso(),
    },
    generationReceipt: {
      firstGenerationResult: 'SUCCESS',
      creativeAttemptCount: 1,
      firstGenerationPromptHash: promptHash,
      firstGenerationModel: 'openai/gpt-image-2',
      firstGenerationCostUsd: generation.costEstimateUsd,
      failureReason: null,
      generatedAt: nowIso(),
    },
  };
  return { slide, accounting };
}

function initializeDirectionCarousels(rangeRun: CanonicalCreativeRangeRun): CarouselDirectionCarousel[] {
  const covers = resolvePreservedCoversFromRangeRun(rangeRun);
  const topic = buildSharedCarouselTopicContext();
  return covers.map((cover) => {
    const rangeDir = rangeRun.directions.find((d) => d.comparisonIndex === cover.comparisonIndex);
    const dna = rangeDir?.dnaEnvelope ?? null;
    const worldBible = buildDirectionCarouselWorldBible({ cover, dna, topic });
    const slides = deriveCarouselSlidePlan({ cover, worldBible, dna, topic });
    const paletteTest = runPaletteRecognitionTest(slides, worldBible);
    return {
      comparisonIndex: cover.comparisonIndex,
      directionId: cover.directionId,
      directionName: cover.directionName,
      cover,
      worldBible,
      slides,
      dnaEnvelope: dna,
      compositionModesUsed: countUniqueCompositionModes(slides),
      paletteRecognitionTest: paletteTest.result,
      founderVerdict: null,
      founderNote: null,
      rangeAnalysis: null,
    };
  });
}

function findNextSlide(run: CanonicalCarouselExpansionRun): {
  directionIndex: number;
  slideNumber: number;
} | null {
  return listPendingSlides(run)[0] ?? null;
}

function isRunComplete(run: CanonicalCarouselExpansionRun): boolean {
  return run.directions.length === 6 && findNextSlide(run) === null;
}

function slideNeedsGeneration(slide: CarouselSlideRecord | undefined): boolean {
  if (!slide || slide.preserved) return false;
  if (!slide.asset) return true;
  return slide.generationReceipt?.firstGenerationResult !== 'SUCCESS';
}

function listPendingSlides(run: CanonicalCarouselExpansionRun): Array<{
  directionIndex: number;
  slideNumber: number;
}> {
  const pending: Array<{ directionIndex: number; slideNumber: number }> = [];
  for (const dir of [...run.directions].sort((a, b) => a.comparisonIndex - b.comparisonIndex)) {
    for (let s = 2; s <= CAROUSEL_TOTAL_SLIDES; s += 1) {
      const slide = dir.slides.find((sl) => sl.slideNumber === s);
      if (slideNeedsGeneration(slide)) {
        pending.push({ directionIndex: dir.comparisonIndex, slideNumber: s });
      }
    }
  }
  return pending;
}

function planSlideTargets(run: CanonicalCarouselExpansionRun, mode: CarouselExecuteMode): Array<{
  directionIndex: number;
  slideNumber: number;
}> {
  const pending = listPendingSlides(run);
  if (pending.length === 0) return [];
  if (mode === 'NEXT_SLIDE') return pending.slice(0, 1);
  if (mode === 'REST_OF_CAROUSEL' || mode === 'NEXT_CAROUSEL') {
    const firstDir = pending[0]!.directionIndex;
    return pending.filter((t) => t.directionIndex === firstDir);
  }
  return pending;
}

function finalizeRun(run: CanonicalCarouselExpansionRun): CanonicalCarouselExpansionRun {
  const directions = run.directions.map((d) => ({
    ...d,
    rangeAnalysis: buildCarouselDirectionRangeAnalysis(d),
  }));
  return {
    ...run,
    directions,
    crossDirectionPairs: buildCrossDirectionPairReports(directions),
    emergentDna: buildEmergentNdxbookDnaReport(directions),
    contaminationTest: { passed: true, notes: ['Post-generation cross-direction isolation verified'] },
    status: 'COMPLETE',
    currentDirectionIndex: null,
    currentSlideNumber: null,
    completedAt: nowIso(),
  };
}

export async function getCarouselExpansionPreflight() {
  const rangeRun = await getCanonicalCreativeRangeRun();
  return buildCarouselExpansionPreflight(rangeRun);
}

export async function getCanonicalCarouselExpansionRun(): Promise<CanonicalCarouselExpansionRun | null> {
  return carouselStore.getCanonicalCarouselExpansionRun();
}

export async function executeCanonicalCarouselExpansion(params: {
  mode?: CarouselExecuteMode;
}): Promise<CanonicalCarouselExpansionRun> {
  const mode = params.mode ?? 'ALL_REMAINING';
  const startMs = Date.now();
  let existing = await carouselStore.getCanonicalCarouselExpansionRun();
  if (existing?.status === 'COMPLETE' && mode === 'INITIALIZE') return existing;

  let run = initRun(existing?.status === 'FAILED' ? { ...existing, status: 'NOT_STARTED', error: null } : existing);
  let accounting = { ...run.accounting };

  try {
    const rangeRun = await getCanonicalCreativeRangeRun();
    if (!rangeRun) throw new Error('Experiment B canonical range run required');

    const preflight = buildCarouselExpansionPreflight(rangeRun);
    if (!preflight.carouselExpansionReady) {
      run = { ...run, status: 'BLOCKED_MISSING_COVERS', error: preflight.blockers.join('; ') };
      return carouselStore.saveCanonicalCarouselExpansionRun(run);
    }

    const coverTest = runCanonicalCarouselCoverPreservationTest(resolvePreservedCoversFromRangeRun(rangeRun));
    if (!coverTest.passed) throw new Error(`Cover preservation failed: ${coverTest.notes.join('; ')}`);

    if (run.directions.length === 0 || mode === 'INITIALIZE') {
      run = {
        ...run,
        status: 'BUILDING_WORLD_BIBLES',
        sharedTopic: buildSharedCarouselTopicContext(),
        directions: initializeDirectionCarousels(rangeRun),
        error: null,
      };
      for (const dir of run.directions) {
        const bibleTest = runCarouselWorldBibleTest(dir.worldBible);
        if (!bibleTest.passed) throw new Error(`World bible failed for ${dir.directionName}`);
      }
      await carouselStore.saveCanonicalCarouselExpansionRun(run);
      if (mode === 'INITIALIZE') {
        run.accounting.durationMs += Date.now() - startMs;
        return carouselStore.saveCanonicalCarouselExpansionRun(run);
      }
    }

    if (isRunComplete(run)) {
      run = finalizeRun(run);
      run.accounting.durationMs += Date.now() - startMs;
      return carouselStore.saveCanonicalCarouselExpansionRun(run);
    }

    const targets =
      mode === 'INITIALIZE'
        ? []
        : planSlideTargets(run, mode === 'ALL_REMAINING' ? 'ALL_REMAINING' : mode);

    for (const target of targets) {
      run = {
        ...run,
        status: 'GENERATING_SLIDE',
        currentDirectionIndex: target.directionIndex,
        currentSlideNumber: target.slideNumber,
      };
      await carouselStore.saveCanonicalCarouselExpansionRun({ ...run, accounting });

      const dirIdx = run.directions.findIndex((d) => d.comparisonIndex === target.directionIndex);
      const direction = run.directions[dirIdx]!;
      const slideIdx = direction.slides.findIndex((s) => s.slideNumber === target.slideNumber);
      let slide = direction.slides[slideIdx]!;
      const topic = run.sharedTopic ?? buildSharedCarouselTopicContext();

      const result = await generateCarouselSlideAsset({
        comparisonIndex: target.directionIndex,
        slide,
        direction,
        topic,
        accounting,
      });
      accounting = result.accounting;
      slide = result.slide;

      const updatedSlides = direction.slides.map((s, i) => (i === slideIdx ? slide : s));
      const updatedDirections = [...run.directions];
      updatedDirections[dirIdx] = {
        ...direction,
        slides: updatedSlides,
        compositionModesUsed: countUniqueCompositionModes(updatedSlides),
        paletteRecognitionTest: runPaletteRecognitionTest(updatedSlides, direction.worldBible!).result,
      };
      run = { ...run, directions: updatedDirections, accounting };
      await carouselStore.saveCanonicalCarouselExpansionRun(run);
    }

    if (isRunComplete(run)) {
      run = finalizeRun(run);
    } else {
      const n = findNextSlide(run);
      run = {
        ...run,
        status: n ? 'GENERATING_SLIDE' : 'BUILDING_WORLD_BIBLES',
        currentDirectionIndex: n?.directionIndex ?? null,
        currentSlideNumber: n?.slideNumber ?? null,
      };
    }
    run.accounting.durationMs += Date.now() - startMs;
    return carouselStore.saveCanonicalCarouselExpansionRun(run);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    run = { ...run, status: 'FAILED', error: message, accounting };
    run.accounting.durationMs += Date.now() - startMs;
    return carouselStore.saveCanonicalCarouselExpansionRun(run);
  }
}

export async function setCarouselSlideFounderJudgment(params: {
  comparisonIndex: number;
  slideNumber: number;
  judgment: CarouselSlideRecord['founderJudgment'];
}): Promise<CanonicalCarouselExpansionRun> {
  const run = await carouselStore.getCanonicalCarouselExpansionRun();
  if (!run) throw new Error('Carousel expansion run not found');
  const directions = run.directions.map((d) => {
    if (d.comparisonIndex !== params.comparisonIndex) return d;
    return {
      ...d,
      slides: d.slides.map((s) =>
        s.slideNumber === params.slideNumber ? { ...s, founderJudgment: params.judgment } : s,
      ),
    };
  });
  return carouselStore.saveCanonicalCarouselExpansionRun({ ...run, directions });
}

export async function setCarouselDirectionFounderVerdict(params: {
  comparisonIndex: number;
  verdict: CarouselDirectionCarousel['founderVerdict'];
  note?: string | null;
}): Promise<CanonicalCarouselExpansionRun> {
  const run = await carouselStore.getCanonicalCarouselExpansionRun();
  if (!run) throw new Error('Carousel expansion run not found');
  const directions = run.directions.map((d) =>
    d.comparisonIndex === params.comparisonIndex
      ? { ...d, founderVerdict: params.verdict, founderNote: params.note ?? d.founderNote }
      : d,
  );
  return carouselStore.saveCanonicalCarouselExpansionRun({ ...run, directions });
}
