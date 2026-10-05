import { describe, it, expect, beforeEach } from 'vitest';
import {
  bootstrapNdxbookExpressionProof,
  dispatchBlockedByConceptCollapse,
  evaluateEntryProductionReadiness,
  oneEntryOwnsMultipleFormats,
  registerEntryGeneration,
  resolveEntry,
  runFormatNativeQAForAdaptation,
} from '../api/_lib/site00ExpressionEngine/expressionEngineService.js';
import {
  reelVsCarouselDistinct,
  storyResizeOnlyFails,
  tiktokReelDuplicateFails,
} from '../api/_lib/site00ExpressionEngine/formatNativeQA.js';
import {
  entry001LegacySummary,
  reconstructEntry001,
  buildEntry001Artifact,
} from '../api/_lib/site00ExpressionEngine/entry001Forensic.js';
import {
  compileEntry002Handoff,
  entry002HasNoGeneratedAssets,
} from '../api/_lib/site00ExpressionEngine/entry002Handoff.js';
import {
  notForMeCannotBecomeCanon,
  orphanAssetCannotReachProductionReady,
  recordFounderJudgmentOnReceipt,
  registerGeneration,
  resetLineageStore,
} from '../api/_lib/site00ExpressionEngine/lineageRegistration.js';
import {
  assertNoGenericNdxbookFallback,
  genericEngineHasNoNdxbookDefault,
  resetExpressionEngineMemoryStore,
  resolveBrandContext,
} from '../api/_lib/site00ExpressionEngine/projectScope.js';
import { routingIsBrandAgnostic } from '../api/_lib/site00ExpressionEngine/productionRouting.js';
import { runBlockingSequenceQA } from '../api/_lib/site00ExpressionEngine/sequenceQAGate.js';
import { resetExpressionEntryStore } from '../api/_lib/site00ExpressionEngine/entryStore.js';
import type { CarouselSlideRecord } from '../shared/site00-brand-lore/canonicalCarouselExpansionTypes.js';
import type { SequenceCreativeSystem } from '../shared/site00-brand-lore/sequenceCreative/types.js';
import type { CreativeConceptTerritoryV2 } from '../shared/site00-brand-lore/conceptTerritoryV2/types.js';

process.env.EXPRESSION_ENGINE_MEMORY_STORE = '1';

function sampleSlide(n: number, compositionMode: CarouselSlideRecord['compositionMode']): CarouselSlideRecord {
  return {
    slideNumber: n,
    slideRole: 'ARGUMENT',
    slidePurpose: 'test',
    readerQuestion: 'q',
    readerTakeaway: 't',
    whyThisSlideExists: 'why',
    relationshipToPreviousSlide: 'prev',
    relationshipToNextSlide: 'next',
    compositionMode,
    copy: { headline: `Headline ${n}`, subhead: null, body: null, annotation: null, metadata: null },
    typography: { fontRole: 'DISPLAY', scale: 'L', weight: 'BOLD', case: 'UPPER', alignment: 'LEFT' },
    colorLogic: 'sparse lime accent',
    worldSignals: [],
    visualBrief: null,
    asset: null,
    generationReceipt: null,
    preserved: false,
    idempotencyKey: `slide-${n}`,
    founderJudgment: null,
  };
}

function sampleSequenceSystem(): SequenceCreativeSystem {
  return {
    sequenceCreativeSystemId: 'scs-test',
    sequenceId: 'seq-test',
    sequenceType: 'CAROUSEL',
    sequenceVersion: 1,
    territoryId: null,
    worldExpressionSystemId: null,
    topicId: 'topic-1',
    topicName: 'Britney',
    anchorAssetId: 'anchor-1',
    anchorFrameIndex: 1,
    allowedPalette: ['BLACK', 'CREAM', 'LIME'],
    paletteUsageHierarchy: [{ color: 'LIME', role: 'ACCENT', proportionalGuidance: 'sparse', narrativePurpose: 'accent' }],
    typographySystem: {
      displayFamily: 'NDX Display',
      supportFamily: 'NDX Support',
      metadataFamily: 'NDX Meta',
      annotationFamily: null,
      displayBehavior: 'condensed',
      weightRelationships: 'display heavy',
      caseBehavior: 'upper',
      scaleRatios: '1.5',
      trackingBehavior: 'tight',
      alignmentBehavior: 'left',
      allowedExceptions: [],
    },
    graphicGrammar: {
      primaryGraphicDevices: ['underline'],
      secondaryGraphicDevices: [],
      deviceFrequency: 'moderate',
      lineBehavior: 'sharp',
      frameBehavior: 'none',
      annotationBehavior: 'margin',
      shapeLanguage: 'editorial',
      imageMaskBehavior: 'rect',
      textureRules: 'paper',
    },
    imageTreatment: 'editorial',
    materialTreatment: 'paper',
    textureBehavior: 'grain',
    spacingRhythm: 'tight',
    densityProfile: 'dense',
    gridBehavior: 'modular',
    edgeBehavior: 'bleed',
    recurringDevices: ['arrow'],
    accentFrequency: 'sparse',
    plannedDeviations: [],
    referenceStrategy: 'ANCHOR_FIDELITY',
    cohesionGateThresholds: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function collapsingConcepts(): CreativeConceptTerritoryV2[] {
  const base = {
    worldPremiseSeed: '',
    viewerRole: '',
    audienceRelationship: '',
    contentMechanism: 'document annotate archive',
    informationBehavior: 'marked-up copy',
    emotionalTension: '',
    participationLogic: '',
    spatialTemporalLogic: '',
    artifactLogic: 'document',
    narrativeLogic: 'archive index',
    whyThisIsNdxbook: '',
    whyThisIsAConceptNotDirection: '',
    possibleDirectionRange: [],
    possibleNativeFormats: [],
    antiCollapseRules: [],
    provenance: 'test',
    formationReceipt: null,
    conceptVsDirection: null,
    founderJudgment: 'UNREVIEWED' as const,
    judgmentNote: null,
    methodologyVersion: '2',
    createdAt: new Date().toISOString(),
  };
  return [1, 2, 3].map((i) => ({
    ...base,
    id: `c-${i}`,
    conceptName: `Document Concept ${i}`,
    conceptThesis: 'document thesis',
    coreCreativeIdea: 'document archive annotate',
  }));
}

describe('Expression Engine Sprint B', () => {
  beforeEach(() => {
    resetExpressionEngineMemoryStore();
    resetExpressionEntryStore();
    resetLineageStore();
  });

  it('resolves brand context with explicit NDXBOOK ownership — no generic fallback', async () => {
    const ctx = await resolveBrandContext({ brandId: 'ndxbook', projectId: 'ndxbook' });
    expect(ctx.brandId).toBe('ndxbook');
    expect(genericEngineHasNoNdxbookDefault()).toBe(true);
    expect(() => assertNoGenericNdxbookFallback(undefined)).toThrow();
  });

  it('one ENTRY owns multiple format expressions', async () => {
    const { entry001 } = await bootstrapNdxbookExpressionProof();
    expect(oneEntryOwnsMultipleFormats(entry001)).toBe(true);
    expect(entry001.formatExpressions.length).toBe(8);
    const formats = entry001.formatExpressions.map((f) => f.format);
    expect(formats).toContain('REEL');
    expect(formats).toContain('CAROUSEL');
    expect(formats).toContain('TIKTOK');
    expect(formats).toContain('X');
  });

  it('Reel != Carousel — native adaptation passes, resize fails', () => {
    const { reel, carousel } = reelVsCarouselDistinct();
    expect(reel.passed).toBe(true);
    expect(carousel.passed).toBe(true);

    const resizeFail = runFormatNativeQAForAdaptation('REEL', 'CAROUSEL', 'RESIZE');
    expect(resizeFail.passed).toBe(false);
    expect(resizeFail.blocking).toBe(true);
  });

  it('Story resize-only fails FORMAT_NATIVE_QA', () => {
    const result = storyResizeOnlyFails();
    expect(result.passed).toBe(false);
    expect(result.failures.some((f) => f.includes('STORY'))).toBe(true);
  });

  it('TikTok automatic Reel duplicate fails when native translation required', () => {
    const result = tiktokReelDuplicateFails();
    expect(result.passed).toBe(false);
    expect(result.failures.some((f) => f.includes('TIKTOK'))).toBe(true);
  });

  it('concept-collapse FAIL blocks dispatch', () => {
    expect(dispatchBlockedByConceptCollapse(collapsingConcepts())).toBe(true);
    expect(dispatchBlockedByConceptCollapse([])).toBe(false);
  });

  it('GenerationReceipt auto-registers lineage on registerEntryGeneration', async () => {
    const { entry001 } = await bootstrapNdxbookExpressionProof();
    const before = entry001.generationReceipts.length;
    const { receipt, entry } = registerEntryGeneration(entry001, {
      format: 'REEL',
      provider: 'fal-kling',
      model: 'kling-v1',
      promptLineage: ['test prompt'],
    });
    expect(receipt.trackingState).toBe('TRACKED');
    expect(entry.generationReceipts.length).toBe(before + 1);
    expect(entry.assetIds).toContain(receipt.assetId);
  });

  it('orphan asset cannot reach production-ready', () => {
    expect(orphanAssetCannotReachProductionReady(null)).toBe(true);
    const orphan = registerGeneration({
      projectId: 'ndxbook',
      brandId: 'ndxbook',
      entryId: '',
      format: 'REEL',
      provider: 'test',
      model: 'test',
    });
    orphan.status = 'ORPHAN';
    expect(orphanAssetCannotReachProductionReady(orphan)).toBe(true);
  });

  it('AudioPlan is required for Reel when audioRequired=true', () => {
    const entry = reconstructEntry001();
    const reel = entry.formatExpressions.find((f) => f.format === 'REEL');
    expect(reel?.audioRequired).toBe(true);
    expect(entry.audioPlan?.layers.length).toBeGreaterThan(0);
  });

  it('continuity graph spans multiple formats', () => {
    const graph = reconstructEntry001().continuityGraph!;
    expect(graph.nodes.length).toBeGreaterThanOrEqual(8);
    const crossFormat = graph.nodes.filter((n) => n.formatRefs.length > 1);
    expect(crossFormat.length).toBeGreaterThan(0);
    expect(graph.edges.length).toBeGreaterThan(0);
  });

  it('NOT FOR ME cannot silently become canon', () => {
    const receipt = registerGeneration({
      projectId: 'ndxbook',
      brandId: 'ndxbook',
      entryId: 'entry-001',
      format: 'CAROUSEL',
      provider: 'fal',
      model: 'flux',
    });
    recordFounderJudgmentOnReceipt(receipt.receiptId, 'NOT_FOR_ME');
    const updated = recordFounderJudgmentOnReceipt(receipt.receiptId, 'NOT_FOR_ME')!;
    expect(notForMeCannotBecomeCanon(updated)).toBe(true);
    expect(updated.canonState).toBe('NON_CANON');
  });

  it('EntryArtifact remains entry-specific', () => {
    const artifact = buildEntry001Artifact();
    expect(artifact.entrySpecific).toBe(true);
    expect(artifact.type).toBe('VINTAGE_BOX_TELEVISION');
    expect(artifact.symbolicRole).toContain('spectatorship');
  });

  it('platform translation preserves thesis but may change execution', () => {
    const entry = reconstructEntry001();
    for (const t of entry.platformTranslations) {
      expect(t.thesisPreserved).toBe(true);
      expect(['REUSE', 'REFRAME', 'REEDIT', 'REWRITE', 'REGENERATE', 'IDEA_ONLY']).toContain(t.mode);
    }
  });

  it('generic Expression Engine has no NDXBOOK default in routing', () => {
    expect(routingIsBrandAgnostic('ndxbook')).toBe(true);
  });

  it('ENTRY 002 plan compiles without asset generation', async () => {
    const handoff = compileEntry002Handoff();
    expect(entry002HasNoGeneratedAssets()).toBe(true);
    expect(handoff.productionPlan?.tasks.length).toBe(8);
    expect(handoff.status).toBe('DRAFT');
    expect(handoff.territoryId).toBeNull();

    const resolved = await resolveEntry({ brandId: 'ndxbook', projectId: 'ndxbook', entryNumber: 2 });
    expect(resolved?.generationReceipts.length).toBe(0);
  });

  it('readiness evaluator reports exact blockers for ENTRY 001', async () => {
    const { entry001 } = await bootstrapNdxbookExpressionProof();
    const readiness = evaluateEntryProductionReadiness(entry001);
    expect(readiness.ready).toBe(false);
    expect(readiness.blockers.length).toBeGreaterThan(0);
    expect(readiness.blockers.some((b) => b.includes('platform translations'))).toBe(true);
    expect(readiness.checks.every((c) => typeof c.passed === 'boolean')).toBe(true);
  });

  it('sequence QA blocks resize-only sameness', () => {
    const slides = [sampleSlide(1, 'FULL_BLEED_HERO'), sampleSlide(2, 'FULL_BLEED_HERO'), sampleSlide(3, 'FULL_BLEED_HERO')];
    const result = runBlockingSequenceQA({
      sequenceSystem: sampleSequenceSystem(),
      slides,
      repairLoopsUsed: 2,
    });
    expect(result.sameness).toBe('FAIL');
    expect(result.blocking).toBe(true);
  });

  it('ENTRY 001 legacy tracked vs untracked summary', () => {
    const summary = entry001LegacySummary();
    expect(summary.untracked.length).toBeGreaterThan(0);
    expect(summary.untracked).toContain('legacy-reel-001-manual');
  });
});
