/**
 * Expression Engine V0 API — entry resolution + readiness + chapter grammar (B2).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  bootstrapB1Phase1,
  bootstrapB1Phase2,
  bootstrapB2ChapterSystem,
  bootstrapB3CreativeAnchor,
  bootstrapB31,
  bootstrapB32,
  bootstrapB4,
  bootstrapB41,
  bootstrapB42,
  bootstrapB43,
  bootstrapNdxbookExpressionProof,
  evaluateEntryProductionReadiness,
  getChapter01Snapshot,
  listEntriesForChapter,
  resolveEntry,
  validateEntryByNumber,
} from '../_lib/site00ExpressionEngine/expressionEngineService.js';
import { getChapterByNumber, getChapterGrammarForChapter } from '../_lib/site00ExpressionEngine/chapterStore.js';
import { runChapterRepetitionQA } from '../_lib/site00ExpressionEngine/chapterRepetitionQA.js';
import { CHAPTER_01_ID } from '../_lib/site00ExpressionEngine/chapter01Canon.js';
import { closeEntry001Phase1 } from '../_lib/site00ExpressionEngine/entry001Close.js';
import { compileEntry002LockedEntry } from '../_lib/site00ExpressionEngine/entry002Blueprint.js';
import { saveEntry } from '../_lib/site00ExpressionEngine/entryStore.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    const brandIdParam = req.query.brandId ?? body.brandId;
    const brandId = brandIdParam ? String(brandIdParam) : 'ndxbook';
    const projectId = String(req.query.projectId ?? body.projectId ?? brandId);
    const entryNumber = Number(req.query.entryNumber ?? body.entryNumber ?? 0);
    const chapterNumber = Number(req.query.chapterNumber ?? body.chapterNumber ?? 1);

    const phase = String(req.query.phase ?? body.phase ?? '');
    const action = String(req.query.action ?? body.action ?? '');
    const hasEntryQuery = Boolean(brandIdParam && entryNumber);

    if (req.method === 'GET' && (phase === 'B43' || phase === 'B4.3' || phase === 'B4P3' || phase === 'GATE1')) {
      const b43 = await bootstrapB43();
      return res.status(200).json({
        engine: 'EXPRESSION_ENGINE_V0',
        sprint: 'B4.3_ENTRY_002_REEL_KEYFRAME_PROVENANCE_AND_REVIEW',
        provenanceStatus: b43.provenanceStatus,
        relationshipSummary: b43.relationshipSummary,
        provenance: b43.provenance.map((p) => ({
          role: p.role,
          assetId: p.assetId,
          planningReceiptId: p.planningReceiptId,
          generationReceiptId: p.generationReceiptId,
          providerRequestId: p.providerRequestId,
          provider: p.provider,
          requestedModel: p.requestedModel,
          executedModel: p.executedModel,
          fallbackUsed: p.fallbackUsed,
          supersededExecutions: p.supersededExecutions,
          lineageCorrected: p.lineageCorrected,
        })),
        reviewFrames: b43.reviewFrames,
        continuity: b43.continuity,
        founderGates: b43.founderGates,
        qaAdvisory: b43.qaAdvisory,
        motionBlocked: b43.motionBlocked,
        klingBlocked: b43.klingBlocked,
        roughCutBlocked: b43.roughCutBlocked,
        downstreamBlocked: b43.downstreamBlocked,
        nextAction: 'FOUNDER VISUAL JUDGMENT REQUIRED',
      });
    }

    if (req.method === 'GET' && (phase === 'B42' || phase === 'B4.2' || phase === 'B4P2')) {
      const dispatchFal = req.query.dispatchFal !== '0' && (req.query.dispatchFal === '1' || body.dispatchFal !== false);
      const forceDispatch = req.query.forceDispatch === '1' || body.forceDispatch === true;
      const b42 = await bootstrapB42({ dispatchFal, forceDispatch });
      return res.status(200).json({
        engine: 'EXPRESSION_ENGINE_V0',
        sprint: 'B4.2_ENTRY_002_REEL_KEYFRAME_EXECUTION',
        entry002: {
          title: 'OH, NOW IT WAS FUN?',
          subject: b42.fashionDirection.subject,
          chapter: 'WHICH ONE IS IT?',
          territory: 'THE NOSTALGIA EDIT SUITE',
          world: 'SURREAL PHYSICAL EDITING SUITE',
          status: 'IN_PRODUCTION',
        },
        reel: {
          reelId: b42.reelId,
          keyframeExecutions: b42.keyframeExecutions,
          motionAuthority: 'REEL',
          founderJudgment: 'UNREVIEWED',
          canonState: 'NON_CANON',
        },
        phone: b42.phoneRole,
        fashion: b42.fashionDirection,
        editSuite: b42.editSuiteBehavior,
        audio: b42.audioPlan,
        providerRouting: b42.providerRouting,
        founderGates: b42.founderGates,
        qa: b42.qa,
        telemetrySemantics: b42.telemetrySemantics,
        lineage: b42.lineage,
        downstreamHold: b42.downstreamHold,
        actualProviderDispatches: b42.actualProviderDispatches,
        actualRasterResults: b42.actualRasterResults,
        videoDispatched: b42.videoDispatched,
        klingBlocked: b42.klingBlocked,
        roughCutBlocked: b42.roughCutBlocked,
        nextAction: 'FOUNDER KEYFRAME VISUAL REVIEW REQUIRED',
      });
    }

    if (req.method === 'GET' && (phase === 'B41' || phase === 'B4.1' || phase === 'B4P1')) {
      const dispatchFal = req.query.dispatchFal === '1' || body.dispatchFal === true;
      const b41 = await bootstrapB41({ dispatchFal });
      return res.status(200).json({
        engine: 'EXPRESSION_ENGINE_V0',
        sprint: 'B4.1_ENTRY_002_REEL_KEYFRAME_RASTERIZATION',
        entry002: {
          title: 'OH, NOW IT WAS FUN?',
          subject: b41.fashionDirection.subject,
          chapter: 'WHICH ONE IS IT?',
          territory: 'THE NOSTALGIA EDIT SUITE',
          world: 'SURREAL PHYSICAL EDITING SUITE',
          status: 'IN_PRODUCTION',
        },
        reel: {
          reelId: b41.reelId,
          runtimeTargetSec: b41.runtimeTargetSec,
          keyframeRasters: b41.keyframeRasters,
          motionAuthority: 'REEL',
          founderJudgment: 'UNREVIEWED',
          canonState: 'NON_CANON',
        },
        phone: b41.phoneRole,
        fashion: b41.fashionDirection,
        editSuite: b41.editSuiteBehavior,
        audio: b41.audioPlan,
        providerRouting: b41.providerRouting,
        founderGates: b41.founderGates,
        qa: b41.qa,
        lineage: b41.lineage,
        downstreamHold: b41.downstreamHold,
        telemetry: b41.telemetry,
        videoDispatched: b41.videoDispatched,
        klingBlocked: b41.klingBlocked,
        roughCutBlocked: b41.roughCutBlocked,
        assetsGenerated: b41.assetsGenerated,
        nextAction: 'FOUNDER KEYFRAME VISUAL REVIEW REQUIRED',
      });
    }

    if (req.method === 'GET' && (phase === 'B4' || phase === 'B4P0')) {
      const b4 = await bootstrapB4();
      return res.status(200).json({
        engine: 'EXPRESSION_ENGINE_V0',
        sprint: 'B4_ENTRY_002_REEL_PRODUCTION',
        entry002: {
          title: 'OH, NOW IT WAS FUN?',
          subject: b4.fashionDirection.subject,
          chapter: 'WHICH ONE IS IT?',
          territory: 'THE NOSTALGIA EDIT SUITE',
          world: 'SURREAL PHYSICAL EDITING SUITE',
          status: 'IN_PRODUCTION',
        },
        reel: {
          reelId: b4.reelId,
          runtimeTargetSec: b4.runtimeTargetSec,
          argumentArc: b4.argumentArc,
          shotPlan: b4.shotPlan,
          keyframes: b4.keyframes,
          motionPlan: b4.motionPlan,
          motionAuthority: 'REEL',
          founderJudgment: 'UNREVIEWED',
          canonState: 'NON_CANON',
        },
        phone: b4.phoneRole,
        fashion: b4.fashionDirection,
        editSuite: b4.editSuiteBehavior,
        audio: b4.audioPlan,
        providerRouting: b4.providerRouting,
        founderGates: b4.founderGates,
        qa: b4.qa,
        downstreamHold: b4.downstreamHold,
        telemetry: b4.telemetry,
        videoDispatched: b4.videoDispatched,
        assetsGenerated: b4.assetsGenerated,
        nextAction: 'FOUNDER KEYFRAME REVIEW REQUIRED',
      });
    }

    if (req.method === 'GET' && (phase === 'B32' || phase === 'B3P2' || phase === 'B3.2')) {
      const b32 = await bootstrapB32();
      return res.status(200).json({
        engine: 'EXPRESSION_ENGINE_V0',
        sprint: 'B3.2_COVER_ANNOTATION_VARIATION',
        annotationSystem: b32.annotationSystem,
        chapter01Plans: b32.chapter01Plans,
        annotationHistory: b32.annotationHistory,
        entry003Example: b32.entry003Example,
        variationQA: b32.variationQA,
        chapter01RepetitionStatus: b32.chapter01RepetitionStatus,
        assetsGeneratedThisSprint: b32.assetsGeneratedThisSprint,
      });
    }

    if (req.method === 'GET' && (phase === 'B31' || phase === 'B3P1' || phase === 'B3.1')) {
      const b31 = await bootstrapB31();
      return res.status(200).json({
        engine: 'EXPRESSION_ENGINE_V0',
        sprint: 'B3.1_FOUNDER_CREATIVE_OVERRIDE',
        b3PreservedAnchor: b31.b3PreservedAnchor,
        founderAuthority: b31.founderAuthority,
        coverGrammar: b31.coverGrammar,
        entryCovers: b31.entryCovers,
        creativeLearning: b31.creativeLearning,
        coverCohesionQA: b31.coverCohesionQA,
        downstreamUnlocked: b31.downstreamUnlocked,
        assetsGeneratedThisSprint: b31.assetsGeneratedThisSprint,
      });
    }

    if (req.method === 'GET' && phase === 'B3') {
      const dispatchFal = req.query.dispatchFal === '1' || body.dispatchFal === true;
      const b3 = await bootstrapB3CreativeAnchor({ dispatchFal });
      return res.status(200).json({
        engine: 'EXPRESSION_ENGINE_V0',
        sprint: 'B3_CREATIVE_ANCHOR',
        entry002: {
          id: b3.entry.id,
          title: b3.entry.title,
          subject: b3.entry.subject,
          status: b3.entry.status,
          assetsGenerated: b3.entry.generationReceipts.length,
        },
        anchor: {
          format: b3.anchor.format,
          taskId: b3.anchor.taskId,
          selectedRoute: b3.anchor.selectedRoute,
          compositionRoutes: b3.anchor.compositionRoutes,
          assetId: b3.anchor.assetId,
          previewUrl: b3.anchor.previewUrl,
          storagePath: b3.anchor.storagePath,
          generationReceipt: b3.anchor.generationReceipt,
          provider: b3.anchor.provider,
          model: b3.anchor.model,
          canonState: b3.anchor.canonState,
          founderJudgment: b3.anchor.founderJudgment,
          productionDispatch: b3.anchor.productionDispatch,
          downstreamBlocked: b3.anchor.downstreamBlocked,
          preAnchorQA: b3.anchor.preAnchorQA,
          anchorQA: b3.anchor.anchorQA,
        },
      });
    }

    if (req.method === 'GET' && phase === 'B2') {
      const b2 = await bootstrapB2ChapterSystem();
      return res.status(200).json({
        engine: 'EXPRESSION_ENGINE_V0',
        sprint: 'B2_CHAPTER_ARGUMENT_GRAMMAR',
        chapter: b2.chapter,
        grammar: b2.grammar,
        hierarchy: b2.hierarchy,
        entry001: {
          id: b2.entries.entry001.entry.id,
          title: b2.entries.entry001.entry.title,
          mapping: b2.entries.entry001.mapping,
          validation: b2.entries.entry001.validation,
        },
        entry002: {
          id: b2.entries.entry002.entry.id,
          title: b2.entries.entry002.entry.title,
          mapping: b2.entries.entry002.mapping,
          validation: b2.entries.entry002.validation,
          assetsGenerated: b2.assetsGeneratedEntry002,
        },
        repetitionQA: b2.repetitionQA,
        pairSummary: b2.pairSummary,
        formatTranslation: b2.formatTranslation,
      });
    }

    if (req.method === 'GET' && action === 'chapter') {
      getChapter01Snapshot();
      const chapter =
        getChapterByNumber(brandId, projectId, chapterNumber) ??
        getChapterByNumber('ndxbook', 'ndxbook', chapterNumber);
      if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
      return res.status(200).json({ chapter });
    }

    if (req.method === 'GET' && action === 'grammar') {
      getChapter01Snapshot();
      const chapter =
        getChapterByNumber(brandId, projectId, chapterNumber) ??
        getChapterByNumber('ndxbook', 'ndxbook', chapterNumber);
      if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
      const grammar = getChapterGrammarForChapter(chapter.chapterId);
      if (!grammar) return res.status(404).json({ error: 'Grammar not found' });
      return res.status(200).json({ grammar });
    }

    if (req.method === 'GET' && action === 'entries-by-chapter') {
      getChapter01Snapshot();
      const chapter =
        getChapterByNumber(brandId, projectId, chapterNumber) ??
        getChapterByNumber('ndxbook', 'ndxbook', chapterNumber);
      if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
      return res.status(200).json({
        chapterId: chapter.chapterId,
        entries: listEntriesForChapter(chapter.chapterId),
      });
    }

    if (req.method === 'GET' && action === 'validate-entry') {
      if (!entryNumber) return res.status(400).json({ error: 'entryNumber required' });
      getChapter01Snapshot();
      const grammar = getChapterGrammarForChapter(CHAPTER_01_ID)!;
      const allMappings = listEntriesForChapter(CHAPTER_01_ID);
      const entry =
        entryNumber === 1
          ? saveEntry(closeEntry001Phase1().entry)
          : entryNumber === 2
            ? saveEntry(compileEntry002LockedEntry())
            : await resolveEntry({ brandId, projectId, entryNumber });
      if (!entry) return res.status(404).json({ error: 'Entry not found' });
      const validation = validateEntryByNumber(entryNumber, entry, grammar, allMappings);
      return res.status(200).json({ entryNumber, validation });
    }

    if (req.method === 'GET' && action === 'repetition-qa') {
      getChapter01Snapshot();
      const mappings = listEntriesForChapter(CHAPTER_01_ID);
      return res.status(200).json(runChapterRepetitionQA({ chapterId: CHAPTER_01_ID, mappings }));
    }

    if (req.method === 'GET' && phase === 'B1P2') {
      const b2 = await bootstrapB1Phase2();
      return res.status(200).json({
        engine: 'EXPRESSION_ENGINE_V0',
        sprint: 'B1_PHASE_2',
        entry002: {
          id: b2.entry002.id,
          title: b2.entry002.title,
          status: b2.entry002.status,
          territoryId: b2.entry002.territoryId,
          worldExpressionId: b2.entry002.worldExpressionId,
          assetsGenerated: b2.entry002.generationReceipts.length,
        },
        blueprint: b2.blueprint,
        readiness002: b2.entry002Readiness,
      });
    }

    if (req.method === 'GET' && phase === 'B1') {
      const b1 = await bootstrapB1Phase1();
      return res.status(200).json({
        engine: 'EXPRESSION_ENGINE_V0',
        sprint: 'B1_PHASE_1',
        entry001: {
          id: b1.entry001.id,
          title: b1.entry001.title,
          status: b1.entry001.status,
          tiktokPlan: b1.tiktokPlan,
          xExpression: b1.xExpression,
          founderJudgmentReadiness: b1.founderJudgmentReadiness,
        },
        entry002: {
          id: b1.entry002.id,
          title: b1.entry002.title,
          status: b1.entry002.status,
          territoryBrief: b1.entry002TerritoryBrief,
          assetsGenerated: b1.entry002.generationReceipts.length,
        },
        readiness001: b1.entry001Readiness,
      });
    }

    if (req.method === 'GET' && !phase && !action && !hasEntryQuery) {
      const proof = await bootstrapNdxbookExpressionProof();
      return res.status(200).json({
        engine: 'EXPRESSION_ENGINE_V0',
        entry001: {
          id: proof.entry001.id,
          title: proof.entry001.title,
          status: proof.entry001.status,
          formatCount: proof.entry001.formatExpressions.length,
        },
        entry002: {
          id: proof.entry002.id,
          title: proof.entry002.title,
          status: proof.entry002.status,
          assetsGenerated: proof.entry002.generationReceipts.length,
        },
        readiness001: evaluateEntryProductionReadiness(proof.entry001),
      });
    }

    if (!hasEntryQuery) {
      return res.status(400).json({ error: 'brandId and entryNumber required' });
    }

    const entry = await resolveEntry({
      brandId,
      projectId,
      entryNumber,
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found', brandId, entryNumber });
    }

    return res.status(200).json({
      entry,
      readiness: evaluateEntryProductionReadiness(entry),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Expression Engine error';
    return res.status(500).json({ error: message });
  }
}
