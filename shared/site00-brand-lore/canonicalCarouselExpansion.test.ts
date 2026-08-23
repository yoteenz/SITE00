/**
 * Canonical carousel expansion — shared validation tests.
 */

import { describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  CANONICAL_CAROUSEL_EXPANSION_EXPERIMENT,
  CAROUSEL_EXPECTED_NEW_GENERATIONS,
} from './canonicalCarouselExpansionConstants.js';
import { CANONICAL_NDXBOOK_DIRECTION_NAMES } from './canonicalCreativeRangeConstants.js';
import type { CanonicalCreativeRangeRun } from './canonicalCreativeRangeTypes.js';
import { buildCarouselExpansionPreflight } from './canonicalCarouselExpansionPreflight.js';
import { buildSharedCarouselTopicContext, runSharedTopicLockTest, runSixDirectionsSameTopicTest } from './canonicalCarouselTopic.js';
import {
  resolvePreservedCoversFromRangeRun,
  runCanonicalCarouselCoverPreservationTest,
  runNoCoverRegenerationTest,
  runCoverWorldInfluenceNotLayoutCloneTest,
} from './canonicalCarouselCoverPreservation.js';
import {
  buildDirectionCarouselWorldBible,
  deriveCarouselSlidePlan,
  runCarouselWorldBibleTest,
  runSlideRoleDirectionDerivationTest,
  runNoUniversalCarouselTemplateTest,
  runCompositionModeRangeTest,
  runTypographySystemContinuityTest,
  runTypographyCompositionVariationTest,
  runWithinDirectionContinuityTest,
} from './canonicalCarouselWorldBible.js';
import {
  runCrossDirectionCarouselContaminationTest,
  runFirstPassOnlyTest,
  runIdempotentSlideGenerationTest,
  runHostFontLeakageTest,
  runSite00VisualDnaLeakageTest,
  runCanonicalNdxbookNamingTest,
  runMobileSocialReadabilityTest,
  runExpectedGenerationCountTest,
  buildCrossDirectionPairReports,
  buildEmergentNdxbookDnaReport,
} from './canonicalCarouselExpansionAnalysis.js';

function mockRangeRun(heroCount: number): CanonicalCreativeRangeRun {
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
    dnaEnvelope: {
      directionId: randomUUID(),
      canonicalName: name,
      comparisonIndex: i + 1,
      centralThesis: `${name} thesis on utilization`,
      creativePremise: 'premise',
      personalityTranslation: 'voice',
      emotionalTerritory: 'territory',
      socialBehavior: 'social',
      contentBehavior: 'content',
      visualWorld: 'world',
      visualGrammar: 'grammar',
      compositionLogic: 'composition',
      typographicAttitude: 'UPPERCASE EDITORIAL',
      typographyRoleBehavior: 'display',
      typographySelectionSource: 'direction',
      typographySelectionReason: 'native',
      typographyDerivedFromDirection: true,
      hostTypographyExcluded: true as const,
      palette: 'ink paper accent',
      dominantColor: 'INK',
      supportingColors: 'PAPER',
      accentColors: 'ACCENT',
      colorHierarchy: 'dominant secondary accent',
      colorBehavior: 'direction palette',
      paletteSource: 'direction',
      paletteReason: 'native',
      paletteDerivedFromDirection: true,
      materialLanguage: 'paper',
      imageLanguage: 'editorial',
      annotationLanguage: 'margin',
      motionLanguage: 'swipe',
      nativeFormat: 'CAROUSEL_COVER',
      nativeFormatBehavior: 'cover',
      signatureDevices: ['device'],
      antiPatterns: [],
      mustNotResemble: [],
      personalityLineage: [],
      formatLineage: [],
      directionLineage: [],
    },
    formatSelection: {
      nativeFormat: 'CAROUSEL_COVER',
      nativeFormatReason: 'direction native',
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
    heroAsset:
      i < heroCount
        ? {
            assetId: `hero-${i + 1}`,
            storagePath: `site00/validation/ndxbook/canonical-creative-range/${String(i + 1).padStart(2, '0')}/hero.webp`,
            topic: 'credit utilization',
            provider: 'openai/gpt-image-2' as const,
            generatedAt: new Date().toISOString(),
          }
        : null,
    generationReceipt:
      i < heroCount
        ? {
            firstGenerationResult: 'SUCCESS' as const,
            creativeAttemptCount: 1,
            firstGenerationPromptHash: 'abc',
            firstGenerationModel: 'openai/gpt-image-2',
            firstGenerationCostUsd: 0,
            failureReason: null,
            generatedAt: new Date().toISOString(),
          }
        : null,
    contaminationTest: { passed: true, siblingHeroReferenced: false, siblingPromptReferenced: false, notes: [] },
    firstPassStatus: i < heroCount ? ('STRONG' as const) : ('PENDING' as const),
    founderJudgment: null,
  }));
  return {
    experimentClassification: 'CANONICAL_CREATIVE_RANGE_VALIDATION',
    runId: 'test',
    organizationId: 'org',
    projectId: 'ndxbook',
    status: heroCount === 6 ? 'COMPLETE' : 'GENERATING_DIRECTION',
    currentDirectionIndex: null,
    rosterTest: null,
    provenanceReports: [],
    distinctivenessPairs: [],
    directions,
    observedFormatDiversity: null,
    audit: null,
    accounting: { anthropicRequests: 0, falRequests: 0, estimatedCostUsd: 0 },
    error: null,
    startedAt: new Date().toISOString(),
    completedAt: heroCount === 6 ? new Date().toISOString() : null,
  };
}

describe('canonical carousel expansion validation', () => {
  const topic = buildSharedCarouselTopicContext();
  const rangeRun = mockRangeRun(6);
  const covers = resolvePreservedCoversFromRangeRun(rangeRun);

  it('CANONICAL_CAROUSEL_COVER_PRESERVATION_TEST', () => {
    const test = runCanonicalCarouselCoverPreservationTest(covers);
    expect(test.passed).toBe(true);
    expect(test.resolved).toBe(6);
  });

  it('SHARED_TOPIC_LOCK_TEST', () => {
    expect(runSharedTopicLockTest(topic).passed).toBe(true);
  });

  it('SIX_DIRECTIONS_SAME_TOPIC_TEST', () => {
    const dirs = covers.map((c) => {
      const bible = buildDirectionCarouselWorldBible({ cover: c, dna: null, topic });
      return { slides: deriveCarouselSlidePlan({ cover: c, worldBible: bible, dna: null, topic }) };
    });
    expect(runSixDirectionsSameTopicTest(dirs).passed).toBe(true);
  });

  it('NO_COVER_REGENERATION_TEST', () => {
    const cover = covers[0]!;
    const bible = buildDirectionCarouselWorldBible({ cover, dna: null, topic });
    const slides = deriveCarouselSlidePlan({ cover, worldBible: bible, dna: null, topic });
    expect(runNoCoverRegenerationTest(slides).passed).toBe(true);
  });

  it('COVER_WORLD_INFLUENCE_NOT_LAYOUT_CLONE_TEST', () => {
    const brief = { forbidden: ['Do not copy exact cover layout'], coverInfluence: { allowed: ['palette'] } };
    expect(runCoverWorldInfluenceNotLayoutCloneTest(brief).passed).toBe(true);
  });

  it('CAROUSEL_WORLD_BIBLE_TEST', () => {
    const bible = buildDirectionCarouselWorldBible({ cover: covers[0]!, dna: null, topic });
    expect(runCarouselWorldBibleTest(bible).passed).toBe(true);
  });

  it('SLIDE_ROLE_DIRECTION_DERIVATION_TEST', () => {
    for (const cover of covers) {
      const bible = buildDirectionCarouselWorldBible({ cover, dna: null, topic });
      const slides = deriveCarouselSlidePlan({ cover, worldBible: bible, dna: null, topic });
      expect(runSlideRoleDirectionDerivationTest(slides).passed).toBe(true);
    }
  });

  it('NO_UNIVERSAL_CAROUSEL_TEMPLATE_TEST', () => {
    const cover = covers[0]!;
    const bible = buildDirectionCarouselWorldBible({ cover, dna: null, topic });
    expect(runNoUniversalCarouselTemplateTest(deriveCarouselSlidePlan({ cover, worldBible: bible, dna: null, topic })).passed).toBe(true);
  });

  it('CROSS_DIRECTION_CAROUSEL_CONTAMINATION_TEST', () => {
    const result = runCrossDirectionCarouselContaminationTest({
      directionIndex: 1,
      promptPayload: { directionName: 'THE MARKED-UP COPY', topic: 'CREDIT UTILIZATION' },
      allDirectionNames: [...CANONICAL_NDXBOOK_DIRECTION_NAMES],
    });
    expect(result.passed).toBe(true);
  });

  it('WITHIN_DIRECTION_CONTINUITY_TEST', () => {
    const cover = covers[0]!;
    const bible = buildDirectionCarouselWorldBible({ cover, dna: null, topic });
    expect(runWithinDirectionContinuityTest(deriveCarouselSlidePlan({ cover, worldBible: bible, dna: null, topic })).passed).toBe(true);
  });

  it('TYPOGRAPHY_SYSTEM_CONTINUITY_TEST', () => {
    const cover = covers[0]!;
    const bible = buildDirectionCarouselWorldBible({ cover, dna: null, topic });
    expect(runTypographySystemContinuityTest(deriveCarouselSlidePlan({ cover, worldBible: bible, dna: null, topic })).passed).toBe(true);
  });

  it('TYPOGRAPHY_COMPOSITION_VARIATION_TEST', () => {
    const cover = covers[0]!;
    const bible = buildDirectionCarouselWorldBible({ cover, dna: null, topic });
    expect(runTypographyCompositionVariationTest(deriveCarouselSlidePlan({ cover, worldBible: bible, dna: null, topic })).passed).toBe(true);
  });

  it('COMPOSITION_MODE_RANGE_TEST', () => {
    for (const cover of covers) {
      const bible = buildDirectionCarouselWorldBible({ cover, dna: null, topic });
      expect(runCompositionModeRangeTest(deriveCarouselSlidePlan({ cover, worldBible: bible, dna: null, topic })).passed).toBe(true);
    }
  });

  it('MOBILE_SOCIAL_READABILITY_TEST', () => {
    const cover = covers[0]!;
    const bible = buildDirectionCarouselWorldBible({ cover, dna: null, topic });
    expect(runMobileSocialReadabilityTest(deriveCarouselSlidePlan({ cover, worldBible: bible, dna: null, topic }))).toMatchObject({ passed: true });
  });

  it('FIRST_PASS_ONLY_TEST', () => {
    expect(runFirstPassOnlyTest({ creativeAttemptCount: 1 }).passed).toBe(true);
  });

  it('IDEMPOTENT_SLIDE_GENERATION_TEST', () => {
    expect(runIdempotentSlideGenerationTest({ existingKey: 'a', requestedKey: 'a', hasAsset: true }).shouldSkip).toBe(true);
  });

  it('HOST_FONT_LEAKAGE_TEST', () => {
    expect(runHostFontLeakageTest({ typography: 'editorial sans' }).passed).toBe(true);
  });

  it('SITE00_VISUAL_DNA_LEAKAGE_TEST', () => {
    expect(runSite00VisualDnaLeakageTest({ brand: 'ndxbook' }).passed).toBe(true);
  });

  it('CANONICAL_NDXBOOK_NAMING_TEST', () => {
    expect(runCanonicalNdxbookNamingTest([...CANONICAL_NDXBOOK_DIRECTION_NAMES]).passed).toBe(true);
  });

  it('preflight blocks when covers missing', () => {
    const preflight = buildCarouselExpansionPreflight(mockRangeRun(3));
    expect(preflight.carouselExpansionReady).toBe(false);
    expect(preflight.coversResolved).toBe(3);
  });

  it('preflight ready with 6 covers', () => {
    const preflight = buildCarouselExpansionPreflight(rangeRun);
    expect(preflight.carouselExpansionReady).toBe(true);
    expect(preflight.experimentClassification).toBe(CANONICAL_CAROUSEL_EXPANSION_EXPERIMENT);
  });

  it('cross-direction pair reports — 15 pairs', () => {
    const dirs = covers.map((cover) => {
      const bible = buildDirectionCarouselWorldBible({ cover, dna: null, topic });
      return {
        comparisonIndex: cover.comparisonIndex,
        directionId: cover.directionId,
        directionName: cover.directionName,
        cover,
        worldBible: bible,
        slides: deriveCarouselSlidePlan({ cover, worldBible: bible, dna: null, topic }),
        dnaEnvelope: null,
        compositionModesUsed: [],
        paletteRecognitionTest: 'NOT_EVALUATED' as const,
        founderVerdict: null,
        founderNote: null,
        rangeAnalysis: null,
      };
    });
    expect(buildCrossDirectionPairReports(dirs).length).toBe(15);
    expect(buildEmergentNdxbookDnaReport(dirs).typographyDna).toBeTruthy();
  });

  it('expected generation count when complete', () => {
    const dirs = covers.map((cover) => {
      const bible = buildDirectionCarouselWorldBible({ cover, dna: null, topic });
      const slides = deriveCarouselSlidePlan({ cover, worldBible: bible, dna: null, topic }).map((s) =>
        s.slideNumber > 1
          ? {
              ...s,
              asset: {
                assetId: 'x',
                storagePath: 'path',
                topic: 'credit-utilization',
                provider: 'openai/gpt-image-2' as const,
                generatedAt: new Date().toISOString(),
              },
            }
          : s,
      );
      return {
        comparisonIndex: cover.comparisonIndex,
        directionId: cover.directionId,
        directionName: cover.directionName,
        cover,
        worldBible: bible,
        slides,
        dnaEnvelope: null,
        compositionModesUsed: [],
        paletteRecognitionTest: 'NOT_EVALUATED' as const,
        founderVerdict: null,
        founderNote: null,
        rangeAnalysis: null,
      };
    });
    const test = runExpectedGenerationCountTest(dirs);
    expect(test.actual).toBe(CAROUSEL_EXPECTED_NEW_GENERATIONS);
  });
});
