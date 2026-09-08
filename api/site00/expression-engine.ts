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
  bootstrapB44,
  bootstrapB45,
  bootstrapB46,
  bootstrapB46FollowUp,
  bootstrapB47,
  bootstrapB48,
  bootstrapB49,
  recordFinalStoryboardFounderJudgment,
  recordPreStoryboardAuthorityJudgment,
  bootstrapNdxbookExpressionProof,
  evaluateEntryProductionReadiness,
  getChapter01Snapshot,
  listEntriesForChapter,
  resolveEntry,
  validateEntryByNumber,
  importFounderSuppliedStoryboardForEntry002,
} from '../_lib/site00ExpressionEngine/expressionEngineService.js';
import { getChapterByNumber, getChapterGrammarForChapter } from '../_lib/site00ExpressionEngine/chapterStore.js';
import { runChapterRepetitionQA } from '../_lib/site00ExpressionEngine/chapterRepetitionQA.js';
import { CHAPTER_01_ID } from '../_lib/site00ExpressionEngine/chapter01Canon.js';
import { closeEntry001Phase1 } from '../_lib/site00ExpressionEngine/entry001Close.js';
import { compileEntry002LockedEntry } from '../_lib/site00ExpressionEngine/entry002Blueprint.js';
import { saveEntry } from '../_lib/site00ExpressionEngine/entryStore.js';
import type { PreStoryboardFounderJudgment } from '../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import type { FinalStoryboardFounderJudgment } from '../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import type { PreStoryboardAuthorityKey } from '../_lib/site00ExpressionEngine/preStoryboardAuthorityGate.js';
import { assertNoGetDispatch } from '../_lib/site00ExpressionEngine/storyboardGenerationCostGuard.js';

function assertNoGetDispatchOnRead(): void {
  assertNoGetDispatch();
}

function serializePreStoryboardAuthorityResponse(
  result: Awaited<ReturnType<typeof bootstrapB47>> | Awaited<ReturnType<typeof bootstrapB48>>,
) {
  const b48 = 'productionEligibility' in result ? result : null;
  return {
    engine: 'EXPRESSION_ENGINE_V0',
    sprint: result.sprint,
    productionOrder: result.productionOrder,
    roleCorrection: result.roleCorrection,
    treatment: result.treatment,
    preStoryboardAuthorityPack: {
      packId: result.preStoryboardAuthorityPack.packId,
      authorities: result.preStoryboardAuthorityPack.authorities.map((a) => ({
        boardNumber: a.boardNumber,
        boardId: a.boardId,
        boardTitle: a.boardTitle,
        role: a.role,
        purpose: a.purpose,
        continuityRules: a.continuityRules,
        requiredVisualElements: a.requiredVisualElements,
        forbiddenElements: a.forbiddenElements,
        visualDescription: a.visualDescription,
        founderJudgment: a.founderJudgment,
        previewUrl: a.previewUrl,
        storagePath: a.storagePath,
        record: a.record,
      })),
      approvalState: result.preStoryboardAuthorityPack.approvalState,
      canonState: result.preStoryboardAuthorityPack.canonState,
    },
    founderReviewSlots: result.founderReviewSlots,
    pipelineState: result.pipelineState,
    founderGates: result.founderGates,
    gateSatisfaction: result.gateSatisfaction,
    finalStoryboardEligibility: result.finalStoryboardEligibility,
    productionEligibility: b48?.productionEligibility ?? {
      preStoryboardAuthorityGate: result.gateSatisfaction.satisfied ? 'SATISFIED' : 'AWAITING_FOUNDER_APPROVAL',
      requiredAuthorityCount: 5,
      approvedAuthorityCount: result.gateSatisfaction.loveItCount,
      finalStoryboardEligibility: result.finalStoryboardEligibility.status,
      keyframeEligibility: 'BLOCKED',
      videoEligibility: 'BLOCKED',
      founderStoryboardApproval: 'BLOCKED_PENDING_STORYBOARD',
    },
    finalStoryboardRecord: b48?.finalStoryboardRecord ?? null,
    authorityVersion: b48?.authorityVersion ?? '001',
    storyboardCompilationContract: {
      readyForCompilation: result.storyboardCompilationContract.readyForCompilation,
      characterSeparation: result.storyboardCompilationContract.characterSeparation,
      nailSeparation: result.storyboardCompilationContract.nailSeparation,
      authoritiesResolved: {
        ndxPresence: Boolean(result.storyboardCompilationContract.authorities.ndxPresenceAuthority),
        subjectDualEra: Boolean(result.storyboardCompilationContract.authorities.subjectDualEraAuthority),
        ndxHands: Boolean(result.storyboardCompilationContract.authorities.ndxHandsAuthority),
        subjectFashion: Boolean(result.storyboardCompilationContract.authorities.subjectFashionAuthority),
        phoneGlitch: Boolean(result.storyboardCompilationContract.authorities.phoneGlitchAuthority),
      },
    },
    authorityRecords: result.authorityRecords,
    cinematicSequence: {
      ...result.cinematicSequence,
      referenceOnly: true,
      active: false,
    },
    finalStoryboard: result.finalStoryboard,
    keyframes: result.keyframes,
    video: result.video,
    preStoryboardGate: result.preStoryboardGate,
    qa: result.qa,
    nextAction: result.nextAction,
    telemetryNote: result.telemetryNote,
  };
}

function serializeFinalCinematicStoryboardResponse(
  result: Awaited<ReturnType<typeof bootstrapB49>>,
) {
  return {
    engine: 'EXPRESSION_ENGINE_V0',
    sprint: result.sprint,
    conceptualRootCause: 'conceptualRootCause' in result ? result.conceptualRootCause : undefined,
    b49FailureMode: result.b49FailureMode,
    b49rFailureMode: result.b49rFailureMode,
    b49r2FailureMode: 'b49r2FailureMode' in result ? result.b49r2FailureMode : undefined,
    productionOrder: result.productionOrder,
    treatment: {
      treatmentId: result.treatment.treatmentId,
      entryTitle: result.treatment.entryTitle,
    },
    preStoryboardAuthorityPack: {
      packId: result.preStoryboardAuthorityPack.packId,
      authorityCount: result.preStoryboardAuthorityPack.authorities.length,
      approvalState: result.preStoryboardAuthorityPack.approvalState,
    },
    storyboard001Historical: {
      storyboardId: result.storyboard001Historical.storyboardId,
      status: result.storyboard001Historical.status,
      referenceOnly: result.storyboard001Historical.referenceOnly,
      failureReason: result.storyboard001Historical.failureReason,
    },
    storyboard002Historical: {
      storyboardId: result.storyboard002Historical.storyboardId,
      status: result.storyboard002Historical.status,
      referenceOnly: result.storyboard002Historical.referenceOnly,
      failureReason: result.storyboard002Historical.failureReason,
    },
    storyboard003Historical:
      'storyboard003Historical' in result
        ? {
            storyboardId: result.storyboard003Historical.storyboardId,
            status: result.storyboard003Historical.status,
            referenceOnly: result.storyboard003Historical.referenceOnly,
            failureReason: result.storyboard003Historical.failureReason,
          }
        : undefined,
    storyboard004Historical:
      'storyboard004Historical' in result
        ? {
            storyboardId: result.storyboard004Historical.storyboardId,
            status: result.storyboard004Historical.status,
            referenceOnly: result.storyboard004Historical.referenceOnly,
            failureReason: result.storyboard004Historical.failureReason,
          }
        : undefined,
    visualAuthorityManifest:
      'visualAuthorityManifest' in result
        ? {
            requiredAuthorityImageCount: result.visualAuthorityManifest.requiredAuthorityImageCount,
            resolvedAuthorityImageCount: result.visualAuthorityManifest.resolvedAuthorityImageCount,
            validated: result.visualAuthorityManifest.validated,
            entries: result.visualAuthorityManifest.entries.map((e) => ({
              authorityId: e.authorityId,
              assetId: e.assetId,
              assetPath: e.assetPath,
              publicAssetPath: e.publicAssetPath,
              version: e.version,
              referenceRole: e.referenceRole,
              assetReadable: e.assetReadable,
            })),
          }
        : undefined,
    reelVisualConception:
      'reelVisualConception' in result
        ? {
            reelId: result.reelVisualConception.reelId,
            selectedMomentCount: result.reelVisualConception.selectedStoryboardMoments.length,
            narrativeBeatCount: result.panelManifest.length,
            excludeAuthorityBoardLayouts: result.reelVisualConception.excludeAuthorityBoardLayouts,
          }
        : undefined,
    finalCinematicStoryboard: result.finalCinematicStoryboard
      ? {
          storyboardId: result.finalCinematicStoryboard.storyboardId,
          version: result.finalCinematicStoryboard.version,
          status: result.finalCinematicStoryboard.status,
          generationMode: result.finalCinematicStoryboard.generationMode,
          founderJudgment: result.finalCinematicStoryboard.founderJudgment,
          canon: result.finalCinematicStoryboard.canon,
          visualAuthority: result.finalCinematicStoryboard.visualAuthority,
          panelCount: result.finalCinematicStoryboard.panelCount,
          storyboardStripUrl: result.finalCinematicStoryboard.storyboardStripUrl,
          structuralQaStatus: result.finalCinematicStoryboard.structuralQaStatus,
          continuityQaStatus: result.finalCinematicStoryboard.continuityQaStatus,
          renderModeQaStatus: result.finalCinematicStoryboard.renderModeQaStatus,
          reelCoherenceQaStatus: result.finalCinematicStoryboard.reelCoherenceQaStatus,
          boardTypeQaStatus: result.finalCinematicStoryboard.boardTypeQaStatus,
          visualAuthorityFidelityQaStatus: result.finalCinematicStoryboard.visualAuthorityFidelityQaStatus,
          readinessState: result.finalCinematicStoryboard.readinessState,
          authorityIds: result.finalCinematicStoryboard.authorityIds,
          compiled: result.finalCinematicStoryboard.compiled,
          dispatched: result.finalCinematicStoryboard.dispatched,
          rendered: result.finalCinematicStoryboard.rendered,
          provider: result.finalCinematicStoryboard.provider,
          telemetry: result.finalCinematicStoryboard.telemetry,
          storyboardSource: result.finalCinematicStoryboard.storyboardSource ?? 'GENERATED',
          sourceArtifactOrigin: result.finalCinematicStoryboard.sourceArtifactOrigin ?? 'PROVIDER_GENERATED',
        }
      : null,
    storyboardCostGuard: 'storyboardCostGuard' in result ? result.storyboardCostGuard : undefined,
    storyboard005Historical:
      'storyboard005Historical' in result && result.storyboard005Historical
        ? {
            storyboardId: result.storyboard005Historical.storyboardId,
            status: result.storyboard005Historical.status,
            referenceOnly: result.storyboard005Historical.referenceOnly,
            failureReason: result.storyboard005Historical.failureReason,
          }
        : undefined,
    finalStoryboardRecord: result.finalStoryboardRecord,
    structuralQA: result.structuralQA,
    continuityDomainQA: result.continuityDomainQA,
    renderModeQA: result.renderModeQA,
    reelCoherenceQA: 'reelCoherenceQA' in result ? result.reelCoherenceQA : undefined,
    boardTypeQA: 'boardTypeQA' in result ? result.boardTypeQA : undefined,
    visualAuthorityFidelityQA:
      'visualAuthorityFidelityQA' in result ? result.visualAuthorityFidelityQA : undefined,
    visualAuthorityRootCause:
      'visualAuthorityRootCause' in result ? result.visualAuthorityRootCause : undefined,
    compiledPrompt: result.compiledPrompt,
    reelArtifact:
      'reelArtifact' in result && result.reelArtifact
        ? {
            generationMode: result.reelArtifact.generationMode,
            compositeUrl: result.reelArtifact.compositeUrl,
            provider: result.reelArtifact.provider,
            telemetry: result.reelArtifact.telemetry,
          }
        : 'singleArtifact' in result && result.singleArtifact
          ? {
              generationMode: result.singleArtifact.generationMode,
              compositeUrl: result.singleArtifact.compositeUrl,
              provider: result.singleArtifact.provider,
              telemetry: result.singleArtifact.telemetry,
            }
          : null,
    panelManifestCount: result.panelManifest.length,
    pipelineState: result.pipelineState,
    productionEligibility: result.productionEligibility,
    finalStoryboardReviewGate: result.finalStoryboardReviewGate,
    founderGates: result.founderGates,
    storyboardBrief: {
      storyboardId: result.storyboardBrief.storyboardId,
      authorityIds: result.storyboardBrief.authorityIds,
      mandatoryInterjection: result.storyboardBrief.mandatoryInterjection,
      characterFirewall: result.storyboardBrief.characterFirewall,
      phoneContentRules: result.storyboardBrief.phoneContentRules,
      panelCount: result.storyboardBrief.panels.length,
    },
    cinematicSequence: result.cinematicSequence,
    keyframes: result.keyframes,
    video: result.video,
    nextAction: result.nextAction,
    telemetryNote: result.telemetryNote,
  };
}

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

    if (
      req.method === 'POST' &&
      action === 'SET_PRE_STORYBOARD_AUTHORITY_JUDGMENT'
    ) {
      const authorityKey = String(body.authorityKey ?? '') as PreStoryboardAuthorityKey;
      const founderJudgment = String(body.founderJudgment ?? '') as PreStoryboardFounderJudgment;
      const authorityId = String(body.authorityId ?? '');

      if (!authorityKey || !founderJudgment) {
        return res.status(400).json({ error: 'authorityKey and founderJudgment required' });
      }

      recordPreStoryboardAuthorityJudgment({
        authorityKey,
        authorityId,
        founderJudgment,
        notes: body.notes ? String(body.notes) : null,
      });

      const b48 = await bootstrapB48();
      return res.status(200).json(serializePreStoryboardAuthorityResponse(b48));
    }

    if (
      req.method === 'POST' &&
      action === 'GENERATE_FINAL_STORYBOARD'
    ) {
      const b49 = await bootstrapB49({
        dispatchFal: true,
        explicitFounderAction: true,
        skipGeneration: false,
      });
      return res.status(200).json(serializeFinalCinematicStoryboardResponse(b49));
    }

    if (
      req.method === 'POST' &&
      action === 'IMPORT_FOUNDER_STORYBOARD'
    ) {
      const variant = String(body.variant ?? 'A').toUpperCase() === 'B' ? 'B' : 'A';
      const b49 = await importFounderSuppliedStoryboardForEntry002(variant);
      return res.status(200).json(serializeFinalCinematicStoryboardResponse(b49));
    }

    if (
      req.method === 'POST' &&
      action === 'SET_FINAL_CINEMATIC_STORYBOARD_JUDGMENT'
    ) {
      const founderJudgment = String(body.founderJudgment ?? '') as Exclude<
        FinalStoryboardFounderJudgment,
        'UNREVIEWED'
      >;

      if (!founderJudgment) {
        return res.status(400).json({ error: 'founderJudgment required (LOVE_IT | PROMISING_REFINE | NOT_FOR_ME)' });
      }

      recordFinalStoryboardFounderJudgment({
        founderJudgment,
        notes: body.notes ? String(body.notes) : null,
      });

      const b49 = await bootstrapB49();
      return res.status(200).json(serializeFinalCinematicStoryboardResponse(b49));
    }

    if (
      req.method === 'GET' &&
      (phase === 'B49' ||
        phase === 'B49R' ||
        phase === 'B49R2' ||
        phase === 'B49R3' ||
        phase === 'B49R4' ||
        phase === 'B4.9' ||
        phase === 'B4.9R' ||
        phase === 'B4.9R2' ||
        phase === 'B4.9R3' ||
        phase === 'B4.9R4' ||
        phase === 'FINAL_CINEMATIC_STORYBOARD' ||
        phase === 'FINAL_STORYBOARD')
    ) {
      const dispatchFal = false;
      const forceDispatch = false;
      const skipGeneration = true;
      assertNoGetDispatchOnRead();
      const b49 = await bootstrapB49({ dispatchFal, forceDispatch, skipGeneration });
      return res.status(200).json(serializeFinalCinematicStoryboardResponse(b49));
    }

    if (
      req.method === 'GET' &&
      (phase === 'B48' ||
        phase === 'B4.8' ||
        phase === 'B47' ||
        phase === 'B4.7' ||
        phase === 'B46P1' ||
        phase === 'B46-FOLLOWUP' ||
        phase === 'PRE_STORYBOARD_AUTHORITY' ||
        phase === 'PRE_STORYBOARD')
    ) {
      const b48 = await bootstrapB48();
      return res.status(200).json(serializePreStoryboardAuthorityResponse(b48));
    }

    if (req.method === 'GET' && (phase === 'B46' || phase === 'B4.6' || phase === 'B4P6' || phase === 'STORYBOARD_AUTHORITY')) {
      const dispatchFal = req.query.dispatchFal !== '0' && (req.query.dispatchFal === '1' || body.dispatchFal !== false);
      const forceDispatch = req.query.forceDispatch === '1' || body.forceDispatch === true;
      const b46 = await bootstrapB46({ dispatchFal, forceDispatch });
      return res.status(200).json({
        engine: 'EXPRESSION_ENGINE_V0',
        sprint: 'B4.6_ENTRY_002_STORYBOARD_GATE_REEL_TREATMENT',
        productionOrder: b46.productionOrder,
        currentStateAudit: b46.currentStateAudit,
        storyCorrection: b46.storyCorrection,
        treatment: b46.treatment,
        preStoryboardAuthorityPack: b46.preStoryboardAuthorityPack,
        preStoryboardGate: b46.preStoryboardGate,
        pipelineState: b46.pipelineState,
        storyboardAuthority: {
          role: 'PLANNING_NARRATIVE_STRUCTURE',
          status: 'NOT_FINAL_VISUAL_AUTHORITY',
          activeGate: false,
          authorityId: b46.storyboardAuthority.authorityId,
          beatCount: b46.storyboardAuthority.beatOutline.length,
          beatOutline: b46.storyboardAuthority.beatOutline,
          boardCount: b46.storyboardAuthority.boards.length,
          boards: b46.storyboardAuthority.boards.map((b) => ({
            boardNumber: b.boardNumber,
            boardId: b.boardId,
            boardTitle: b.boardTitle,
            storyFunction: b.storyFunction,
            argumentGrammarRole: b.argumentGrammarRole,
            visualDescription: b.visualDescription,
            continuityNotes: b.continuityNotes,
            requiredVisualElements: b.requiredVisualElements,
            transitionIn: b.transitionIn,
            transitionOut: b.transitionOut,
            ndxPresence: b.ndxPresence,
            subjectWomanPresence: b.subjectWomanPresence,
            keyframeExtractionRole: b.keyframeExtractionRole,
            founderJudgment: b.founderJudgment,
            previewUrl: b.previewUrl,
            storagePath: b.storagePath,
          })),
          characterAuthority: b46.storyboardAuthority.characterAuthority,
          approvalState: b46.storyboardAuthority.approvalState,
          keyframePrerequisite: b46.storyboardAuthority.keyframePrerequisite,
          canonState: b46.storyboardAuthority.canonState,
        },
        founderReviewSlots: b46.founderReviewSlots,
        founderReviewSummary: b46.founderReviewSummary,
        qa: b46.qa,
        blockingRules: b46.blockingRules,
        structuralStoryboardGate: b46.structuralStoryboardGate,
        founderGates: b46.founderGates,
        keyframeCompilationBlocked: b46.keyframeCompilationBlocked,
        boardVisuals: b46.boardVisuals,
        nextAction: b46.nextAction,
      });
    }

    if (req.method === 'GET' && (phase === 'B45' || phase === 'B4.5' || phase === 'B4P5' || phase === 'CINEMATIC_SEQUENCE')) {
      const dispatchFal = req.query.dispatchFal !== '0' && (req.query.dispatchFal === '1' || body.dispatchFal !== false);
      const forceDispatch = req.query.forceDispatch === '1' || body.forceDispatch === true;
      const skipContactSheet = req.query.skipContactSheet === '1' || body.skipContactSheet === true;
      const b45 = await bootstrapB45({ dispatchFal, forceDispatch, skipContactSheet });
      return res.status(200).json({
        engine: 'EXPRESSION_ENGINE_V0',
        sprint: 'B4.5_ENTRY_002_CINEMATIC_VISUAL_SEQUENCE',
        productionOrder: b45.productionOrder,
        blockingStoryboard: b45.blockingStoryboard,
        cinematicSequence: {
          sequenceId: b45.cinematicSequence.sequenceId,
          frameCount: b45.cinematicSequence.frameCount,
          visualStyle: b45.cinematicSequence.visualStyle,
          contactSheetUrl: b45.cinematicSequence.contactSheetUrl,
          frames: b45.cinematicSequence.frames.map((f) => ({
            frameNumber: f.frameNumber,
            frameId: f.frameId,
            argumentBeat: f.argumentBeat,
            shotPurpose: f.shotPurpose,
            previewUrl: f.previewUrl,
            storagePath: f.storagePath,
            keyframeExtractionCandidate: f.keyframeExtractionCandidate,
          })),
          characterVisualCanon: b45.cinematicSequence.characterVisualCanon,
          continuityReferences: b45.cinematicSequence.continuityReferences,
          keyframeExtractionMap: b45.cinematicSequence.keyframeExtractionMap,
          founderJudgment: b45.cinematicSequence.founderJudgment,
          canonState: b45.cinematicSequence.canonState,
          authorityExperimentStatus: b45.cinematicSequence.authorityExperimentStatus,
          visualAuthority: b45.cinematicSequence.visualAuthority,
          gateId: b45.cinematicSequence.gateId,
        },
        qa: b45.qa,
        telemetry: b45.telemetry,
        founderGates: b45.founderGates,
        cinematicSequenceGate: b45.cinematicSequenceGate,
        keyframeGenerationBlocked: b45.keyframeGenerationBlocked,
        videoGenerationBlocked: b45.videoGenerationBlocked,
        nextAction: b45.nextAction,
      });
    }

    if (req.method === 'GET' && (phase === 'B44' || phase === 'B4.4' || phase === 'B4P4' || phase === 'STORYBOARD')) {
      const dispatchFal = req.query.dispatchFal !== '0' && (req.query.dispatchFal === '1' || body.dispatchFal !== false);
      const forceDispatch = req.query.forceDispatch === '1' || body.forceDispatch === true;
      const panelsOnly = req.query.panelsOnly === '1' || body.panelsOnly === true;
      const b44 = await bootstrapB44({ dispatchFal, forceDispatch, panelsOnly });
      return res.status(200).json({
        engine: 'EXPRESSION_ENGINE_V0',
        sprint: 'B4.4_ENTRY_002_REEL_STORYBOARD_AUTHORITY',
        productionOrder: b44.productionOrder,
        storyboard: {
          storyboardId: b44.storyboard.storyboardId,
          entryId: b44.storyboard.entryId,
          chapterId: b44.storyboard.chapterId,
          formatId: b44.storyboard.formatId,
          runtimeTarget: b44.storyboard.runtimeTarget,
          argumentArc: b44.storyboard.argumentArc,
          panelCount: b44.storyboard.panels.length,
          panels: b44.storyboard.panels.map((p) => ({
            panelNumber: p.panelNumber,
            panelId: p.panelId,
            argumentBeat: p.argumentBeat,
            shotPurpose: p.shotPurpose,
            visualDescription: p.visualDescription,
            previewUrl: p.previewUrl,
            storagePath: p.storagePath,
            keyframeExtractionCandidate: p.keyframeExtractionCandidate,
          })),
          storyboardStripUrl: b44.storyboard.storyboardStripUrl,
          storyboardStripPath: b44.storyboard.storyboardStripPath,
          keyframeExtractionMap: b44.storyboard.keyframeExtractionMap,
          founderJudgment: b44.storyboard.founderJudgment,
          canonState: b44.storyboard.canonState,
          gateId: b44.storyboard.gateId,
          continuityAuthority: b44.storyboard.continuityAuthority,
        },
        qa: b44.qa,
        telemetry: b44.telemetry,
        preStoryboardKeyframes: b44.preStoryboardKeyframes,
        founderGates: b44.founderGates,
        storyboardGate: b44.storyboardGate,
        keyframeGenerationBlocked: b44.keyframeGenerationBlocked,
        videoGenerationBlocked: b44.videoGenerationBlocked,
        klingBlocked: b44.klingBlocked,
        roughCutBlocked: b44.roughCutBlocked,
        downstreamBlocked: b44.downstreamBlocked,
        nextAction: b44.nextAction,
      });
    }

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
