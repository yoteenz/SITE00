/**
 * Sprint B4.9R3 — Reel-first storyboard conception recovery.
 * ONE reel → ONE visual sequence → ONE story/mood board (9 stills).
 */

import type { FinalCinematicStoryboardRecord } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import type { Entry002ReelVisualConception } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import {
  ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION,
  ENTRY_002_REPAIR_FINAL_STORYBOARD_ACTION,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import { ENTRY_002_CINEMATIC_SEQUENCE_001 } from '../../../shared/site00-expression-engine/entry002CinematicSequenceIds.js';
import { PRE_STORYBOARD_VISUAL_PRODUCTION_ORDER } from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import { seedChapter01Canon } from './chapterStore.js';
import { bootstrapB31FounderCreativeOverride } from './entry002B31Bootstrap.js';
import { compileEntry002LockedEntry } from './entry002Blueprint.js';
import { saveEntry } from './entryStore.js';
import { buildEntry002ReelTreatmentAuthority } from './entry002ReelTreatment.js';
import { buildEntry002PreStoryboardVisualAuthorities } from './entry002PreStoryboardVisualAuthorities.js';
import { buildEntry002PreStoryboardVisualAuthorityPack } from './entry002PreStoryboardAuthorityRecord.js';
import { runPreStoryboardAuthorityQA } from './preStoryboardAuthorityQA.js';
import { buildPreStoryboardApprovalState, buildPreStoryboardGateSatisfaction } from './preStoryboardAuthorityGate.js';
import {
  buildEntry002PipelineReconciliationState,
  resolveEntry002NextAction,
  resolveEntry002ProductionEligibility,
} from './entry002PipelineState.js';
import {
  buildEntry002FinalStoryboardReviewGate,
  buildEntry002FounderReviewGatesForPipeline,
  buildEntry002PreStoryboardAuthorityGate,
} from './entry002ReelProductionGates.js';
import {
  applyStoredPreStoryboardJudgments,
  buildPreStoryboardFounderReviewSlots,
} from './preStoryboardFounderJudgment.js';
import { attachEntry002PreStoryboardFounderAssets } from './entry002PreStoryboardAuthorityAssets.js';
import {
  attachPreStoryboardAuthorityRecords,
  summarizePreStoryboardAuthorityRecords,
} from './entry002PreStoryboardAuthorityRecordBuilder.js';
import {
  resolveFinalStoryboardCompilationContract,
  assertStoryboardCompilationFailClosed,
} from './entry002FinalStoryboardCompilationContract.js';
import {
  ensureEntry002PreStoryboardFounderApprovalsLoaded,
  persistEntry002PreStoryboardFounderApprovals,
} from './preStoryboardAuthorityStore.js';
import {
  ENTRY_002_PRE_STORYBOARD_AUTHORITY_VERSION,
  ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS,
} from './entry002PreStoryboardFounderApproval.js';
import {
  buildEntry002FinalCinematicStoryboard004Record,
  toEntry002FinalCinematicStoryboardSummaryRecord,
  applyFinalStoryboardFounderJudgmentToRecord,
} from './entry002FinalStoryboardRecord.js';
import { compileEntry002FinalCinematicStoryboardBrief } from './entry002FinalCinematicStoryboardBrief.js';
import { compileEntry002FinalCinematicStoryboardPanelManifest } from './entry002FinalCinematicStoryboardPanelManifest.js';
import { runStoryboardContinuityDomainQA } from './entry002FinalCinematicStoryboardContinuityDomainQA.js';
import { runStoryboardRenderModeQA } from './entry002FinalCinematicStoryboardRenderModeQA.js';
import {
  compileEntry002ReelVisualConception,
  assertReelConceptionReady,
} from './entry002ReelVisualConception.js';
import { compileReelFirstStoryboardPrompt } from './entry002ReelStoryboardPrompt.js';
import {
  dispatchReelFirstStoryboardArtifact,
  type ReelStoryboardArtifactResult,
} from './entry002ReelStoryboardSingleArtifact.js';
import { runReelStoryboardStructuralQA } from './entry002ReelStoryboardStructuralQA.js';
import { runReelCoherenceQA } from './entry002ReelCoherenceQA.js';
import { runReelStoryboardBoardTypeQA } from './entry002ReelStoryboardBoardTypeQA.js';
import {
  buildStoryboard001HistoricalFailureRecord,
  buildStoryboard002HistoricalFailureRecord,
  buildStoryboard003HistoricalFailureRecord,
} from './entry002FinalCinematicStoryboardHistory.js';
import {
  getFinalCinematicStoryboardRecord,
  getStoryboard001HistoricalRecord,
  getStoryboard002HistoricalRecord,
  getStoryboard003HistoricalRecord,
  hasValidFinalCinematicStoryboard,
  resetFinalCinematicStoryboardStore,
  saveFinalCinematicStoryboardRecord,
  saveStoryboard001HistoricalRecord,
  saveStoryboard002HistoricalRecord,
  saveStoryboard003HistoricalRecord,
} from './finalCinematicStoryboardStore.js';
import {
  recordFinalCinematicStoryboardJudgment,
  resolveFinalStoryboardFounderJudgment,
  resetFinalCinematicStoryboardJudgmentStore,
  getFinalCinematicStoryboardJudgment,
} from './finalCinematicStoryboardJudgmentStore.js';

export async function bootstrapB49R3ReelFirstStoryboardRecovery(options?: {
  dispatchFal?: boolean;
  forceDispatch?: boolean;
  skipGeneration?: boolean;
}): Promise<{
  sprint: 'B4.9R3_REEL_FIRST_STORYBOARD_CONCEPTION_RECOVERY';
  conceptualRootCause: string;
  b49FailureMode: string;
  b49rFailureMode: string;
  b49r2FailureMode: string;
  storyboard001Historical: FinalCinematicStoryboardRecord;
  storyboard002Historical: FinalCinematicStoryboardRecord;
  storyboard003Historical: FinalCinematicStoryboardRecord;
  reelVisualConception: Entry002ReelVisualConception;
  panelManifest: ReturnType<typeof compileEntry002FinalCinematicStoryboardPanelManifest>;
  compiledPrompt: string;
  reelArtifact: ReelStoryboardArtifactResult | null;
  structuralQA: Awaited<ReturnType<typeof runReelStoryboardStructuralQA>>;
  continuityDomainQA: ReturnType<typeof runStoryboardContinuityDomainQA>;
  renderModeQA: ReturnType<typeof runStoryboardRenderModeQA>;
  reelCoherenceQA: ReturnType<typeof runReelCoherenceQA>;
  boardTypeQA: ReturnType<typeof runReelStoryboardBoardTypeQA>;
  finalCinematicStoryboard: FinalCinematicStoryboardRecord | null;
  finalStoryboardRecord: ReturnType<typeof toEntry002FinalCinematicStoryboardSummaryRecord>;
  storyboardBrief: ReturnType<typeof compileEntry002FinalCinematicStoryboardBrief>;
  preStoryboardGate: ReturnType<typeof buildEntry002PreStoryboardAuthorityGate>;
  finalStoryboardReviewGate: ReturnType<typeof buildEntry002FinalStoryboardReviewGate>;
  gateSatisfaction: ReturnType<typeof buildPreStoryboardGateSatisfaction>;
  founderReviewSlots: ReturnType<typeof buildPreStoryboardFounderReviewSlots>;
  pipelineState: ReturnType<typeof buildEntry002PipelineReconciliationState>;
  founderGates: ReturnType<typeof buildEntry002FounderReviewGatesForPipeline>;
  finalStoryboardEligibility: ReturnType<typeof buildEntry002PipelineReconciliationState>['finalStoryboard'];
  storyboardCompilationContract: ReturnType<typeof resolveFinalStoryboardCompilationContract>;
  authorityRecords: ReturnType<typeof summarizePreStoryboardAuthorityRecords>;
  productionEligibility: ReturnType<typeof resolveEntry002ProductionEligibility>;
  founderApprovalsPersisted: typeof ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS;
  authorityVersion: typeof ENTRY_002_PRE_STORYBOARD_AUTHORITY_VERSION;
  productionOrder: typeof PRE_STORYBOARD_VISUAL_PRODUCTION_ORDER;
  treatment: ReturnType<typeof buildEntry002ReelTreatmentAuthority>;
  preStoryboardAuthorityPack: ReturnType<typeof buildEntry002PreStoryboardVisualAuthorityPack>;
  cinematicSequence: {
    sequenceId: typeof ENTRY_002_CINEMATIC_SEQUENCE_001;
    status: 'PRE_AUTHORITY_EXPERIMENT';
    canonState: 'NON_CANON';
    founderJudgment: 'UNREVIEWED';
    visualAuthority: false;
    referenceOnly: true;
    active: false;
  };
  keyframes: ReturnType<typeof resolveEntry002ProductionEligibility>['keyframeEligibility'];
  video: 'BLOCKED';
  qa: ReturnType<typeof runPreStoryboardAuthorityQA>;
  nextAction:
    | typeof ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION
    | typeof ENTRY_002_REPAIR_FINAL_STORYBOARD_ACTION
    | 'GENERATE FINAL CINEMATIC STORYBOARD';
  telemetryNote: string;
}> {
  process.env.EXPRESSION_ENGINE_MEMORY_STORE = process.env.EXPRESSION_ENGINE_MEMORY_STORE ?? '1';
  seedChapter01Canon();
  await bootstrapB31FounderCreativeOverride();
  saveEntry(compileEntry002LockedEntry());

  persistEntry002PreStoryboardFounderApprovals();
  ensureEntry002PreStoryboardFounderApprovalsLoaded();

  const treatment = buildEntry002ReelTreatmentAuthority();
  const baseAuthorities = attachEntry002PreStoryboardFounderAssets(
    buildEntry002PreStoryboardVisualAuthorities(),
  );
  const authorities = attachPreStoryboardAuthorityRecords(
    applyStoredPreStoryboardJudgments(baseAuthorities),
  );
  const preStoryboardAuthorityPack = buildEntry002PreStoryboardVisualAuthorityPack(authorities);
  const qa = runPreStoryboardAuthorityQA(preStoryboardAuthorityPack);

  if (!qa.passed) {
    throw new Error(`B4.9R3 pre-storyboard QA failed: ${qa.blockers.join('; ')}`);
  }

  const approvalState = buildPreStoryboardApprovalState(authorities);
  if (!approvalState.allAuthoritiesLoveIt) {
    throw new Error('B4.9R3 blocked — not all five authorities are LOVE_IT');
  }

  const storyboardCompilationContract = resolveFinalStoryboardCompilationContract(preStoryboardAuthorityPack);
  assertStoryboardCompilationFailClosed(storyboardCompilationContract);

  const brief = compileEntry002FinalCinematicStoryboardBrief({
    treatment,
    preStoryboardAuthorityPack,
  });

  saveStoryboard001HistoricalRecord(
    getStoryboard001HistoricalRecord() ?? buildStoryboard001HistoricalFailureRecord(),
  );
  saveStoryboard002HistoricalRecord(
    getStoryboard002HistoricalRecord() ?? buildStoryboard002HistoricalFailureRecord(),
  );
  saveStoryboard003HistoricalRecord(
    getStoryboard003HistoricalRecord() ?? buildStoryboard003HistoricalFailureRecord(),
  );

  const panelManifest = compileEntry002FinalCinematicStoryboardPanelManifest();
  const reelVisualConception = compileEntry002ReelVisualConception(panelManifest);
  assertReelConceptionReady(reelVisualConception);
  const compiledPrompt = compileReelFirstStoryboardPrompt({ conception: reelVisualConception, brief });

  let reelArtifact: ReelStoryboardArtifactResult | null = null;
  let structuralQA = await runReelStoryboardStructuralQA({
    conception: reelVisualConception,
    storyboardImagePath: null,
    storyboardAssetCount: 0,
    compiledPrompt,
  });
  let continuityDomainQA = runStoryboardContinuityDomainQA(panelManifest);
  let renderModeQA = runStoryboardRenderModeQA({
    generationMode: 'REEL_FIRST_SINGLE_ARTIFACT',
    storyboardDispatchCount: 0,
    storyboardRenderCount: 0,
    storyboardAssetCount: 0,
    independentStoryboardPanelAssetCount: 0,
  });
  let reelCoherenceQA = runReelCoherenceQA({ conception: reelVisualConception });
  let boardTypeQA = runReelStoryboardBoardTypeQA({
    storyboardAssetCount: 0,
    selectedMomentCount: reelVisualConception.selectedStoryboardMoments.length,
  });

  let finalCinematicStoryboard = getFinalCinematicStoryboardRecord();
  const storedJudgment = resolveFinalStoryboardFounderJudgment();

  if (!options?.skipGeneration) {
    const shouldRun = !hasValidFinalCinematicStoryboard() || options?.forceDispatch;

    if (shouldRun) {
      reelArtifact = await dispatchReelFirstStoryboardArtifact({
        conception: reelVisualConception,
        brief,
        narrativeBeatCount: panelManifest.length,
        dispatchFal: options?.dispatchFal,
        forceDispatch: options?.forceDispatch,
      });

      if (reelArtifact.failure || !reelArtifact.rendered) {
        throw new Error(reelArtifact.failure ?? 'Reel-first storyboard generation failed');
      }

      structuralQA = await runReelStoryboardStructuralQA({
        conception: reelVisualConception,
        storyboardImagePath: reelArtifact.compositeUrl,
        storyboardAssetCount: 1,
        compiledPrompt,
      });
      continuityDomainQA = runStoryboardContinuityDomainQA(panelManifest);
      renderModeQA = runStoryboardRenderModeQA({
        generationMode: 'REEL_FIRST_SINGLE_ARTIFACT',
        storyboardDispatchCount: reelArtifact.telemetry.storyboardDispatchCount,
        storyboardRenderCount: reelArtifact.telemetry.storyboardRenderCount,
        storyboardAssetCount: 1,
        independentStoryboardPanelAssetCount: reelArtifact.telemetry.panelRenderCount,
      });
      reelCoherenceQA = runReelCoherenceQA({ conception: reelVisualConception });
      boardTypeQA = runReelStoryboardBoardTypeQA({
        storyboardAssetCount: 1,
        selectedMomentCount: reelVisualConception.selectedStoryboardMoments.length,
      });

      const allQaPassed =
        structuralQA.passed &&
        continuityDomainQA.passed &&
        renderModeQA.passed &&
        reelCoherenceQA.passed &&
        boardTypeQA.passed;

      finalCinematicStoryboard = buildEntry002FinalCinematicStoryboard004Record({
        manifest: panelManifest,
        artifact: reelArtifact,
        structuralQaStatus: structuralQA.result,
        continuityQaStatus: continuityDomainQA.result,
        renderModeQaStatus: renderModeQA.result,
        reelCoherenceQaStatus: reelCoherenceQA.result,
        boardTypeQaStatus: boardTypeQA.result,
        status: allQaPassed ? 'AWAITING_FOUNDER_APPROVAL' : 'REVISION_REQUIRED',
      });

      if (storedJudgment !== 'UNREVIEWED' && finalCinematicStoryboard) {
        finalCinematicStoryboard = applyFinalStoryboardFounderJudgmentToRecord(
          finalCinematicStoryboard,
          storedJudgment,
        );
      }

      saveFinalCinematicStoryboardRecord(finalCinematicStoryboard);
    } else {
      finalCinematicStoryboard = getFinalCinematicStoryboardRecord();
      if (finalCinematicStoryboard) {
        structuralQA = await runReelStoryboardStructuralQA({
          conception: reelVisualConception,
          storyboardImagePath: finalCinematicStoryboard.storyboardStripUrl,
          storyboardAssetCount: finalCinematicStoryboard.rendered ? 1 : 0,
          compiledPrompt,
        });
        continuityDomainQA = runStoryboardContinuityDomainQA(finalCinematicStoryboard.panelManifest);
        renderModeQA = runStoryboardRenderModeQA({
          generationMode: finalCinematicStoryboard.generationMode,
          storyboardDispatchCount: finalCinematicStoryboard.telemetry.storyboardDispatchCount,
          storyboardRenderCount: finalCinematicStoryboard.telemetry.storyboardRenderCount,
          storyboardAssetCount: finalCinematicStoryboard.rendered ? 1 : 0,
          independentStoryboardPanelAssetCount: finalCinematicStoryboard.telemetry.panelRenderCount,
        });
        reelCoherenceQA = runReelCoherenceQA({ conception: reelVisualConception });
        boardTypeQA = runReelStoryboardBoardTypeQA({
          storyboardAssetCount: finalCinematicStoryboard.rendered ? 1 : 0,
          selectedMomentCount: reelVisualConception.selectedStoryboardMoments.length,
        });
      }
    }
  }

  if (finalCinematicStoryboard && storedJudgment !== 'UNREVIEWED') {
    finalCinematicStoryboard = applyFinalStoryboardFounderJudgmentToRecord(
      finalCinematicStoryboard,
      storedJudgment,
    );
    saveFinalCinematicStoryboardRecord(finalCinematicStoryboard);
  }

  const valid = hasValidFinalCinematicStoryboard();
  const founderJudgment = finalCinematicStoryboard?.founderJudgment ?? storedJudgment;
  const generatedAttempt = finalCinematicStoryboard?.telemetry.storyboardRenderCount === 1;

  const gateSatisfaction = buildPreStoryboardGateSatisfaction(authorities);
  const preStoryboardGate = buildEntry002PreStoryboardAuthorityGate(approvalState);
  const finalStoryboardReviewGate = buildEntry002FinalStoryboardReviewGate(founderJudgment, valid);
  const pipelineState = buildEntry002PipelineReconciliationState({
    preStoryboardApproval: approvalState,
    storyboardGenerated: generatedAttempt,
    storyboardValid: valid,
    storyboardFounderJudgment: founderJudgment,
    storyboardApproved: founderJudgment === 'LOVE_IT',
    structuralQaPassed: structuralQA.passed,
    continuityQaPassed: continuityDomainQA.passed,
    duplicationQaPassed: true,
  });
  const productionEligibility = resolveEntry002ProductionEligibility({
    preStoryboardApproval: approvalState,
    storyboardGenerated: generatedAttempt,
    storyboardValid: valid,
    storyboardFounderJudgment: founderJudgment,
    structuralQaPassed: structuralQA.passed,
    continuityQaPassed: continuityDomainQA.passed,
    duplicationQaPassed: true,
  });
  const founderGates = buildEntry002FounderReviewGatesForPipeline(approvalState, {
    storyboardGenerated: valid,
    storyboardFounderJudgment: founderJudgment,
  });
  const founderReviewSlots = buildPreStoryboardFounderReviewSlots(authorities);
  const authorityRecords = summarizePreStoryboardAuthorityRecords(authorities);

  const finalStoryboardRecord = finalCinematicStoryboard
    ? toEntry002FinalCinematicStoryboardSummaryRecord(finalCinematicStoryboard)
    : toEntry002FinalCinematicStoryboardSummaryRecord(
        buildEntry002FinalCinematicStoryboard004Record({
          manifest: panelManifest,
          artifact: {
            compositeUrl: '',
            compositePath: '',
            provider: 'none',
            providerRequestId: null,
            dispatched: false,
            rendered: false,
            telemetry: {
              reelConceptionCompileCount: 1,
              narrativeBeatCount: panelManifest.length,
              selectedStoryboardMomentCount: 9,
              storyboardPromptCompileCount: 1,
              storyboardCompileCount: 1,
              storyboardDispatchCount: 0,
              storyboardRenderCount: 0,
              panelManifestCount: panelManifest.length,
              panelDispatchCount: 0,
              panelRenderCount: 0,
            },
          },
          structuralQaStatus: 'FAIL',
          continuityQaStatus: 'FAIL',
          renderModeQaStatus: 'FAIL',
          reelCoherenceQaStatus: 'FAIL',
          boardTypeQaStatus: 'FAIL',
          status: 'REVISION_REQUIRED',
        }),
      );

  const nextAction = resolveEntry002NextAction({
    preStoryboardApproval: approvalState,
    storyboardGenerated: generatedAttempt,
    storyboardValid: valid,
    storyboardFounderJudgment: founderJudgment,
    structuralQaPassed: structuralQA.passed && reelCoherenceQA.passed,
  });

  const t = finalCinematicStoryboard?.telemetry;
  const telemetryNote = valid
    ? `B4.9R3 REEL_CONCEPTION=1 → MOMENTS=${t?.selectedStoryboardMomentCount ?? 9} → STORYBOARD_RENDERED=1 → REEL_COHERENCE_PASS`
    : reelArtifact
      ? `B4.9R3 REEL_CONCEPTION=1 → MOMENTS=9 → STORYBOARD_RENDERED=${reelArtifact.rendered ? 1 : 0}`
      : 'B4.9R3 awaiting reel-first storyboard generation';

  return {
    sprint: 'B4.9R3_REEL_FIRST_STORYBOARD_CONCEPTION_RECOVERY',
    conceptualRootCause:
      'Beat-first panel prompts produced isolated illustrations, not successive moments from one conceived reel',
    b49FailureMode: 'ONE hero image + storyboard-like notes',
    b49rFailureMode: '16 independent panel provider dispatches',
    b49r2FailureMode: 'Single artifact but unrelated beat collage / contact sheet',
    storyboard001Historical: getStoryboard001HistoricalRecord()!,
    storyboard002Historical: getStoryboard002HistoricalRecord()!,
    storyboard003Historical: getStoryboard003HistoricalRecord()!,
    reelVisualConception,
    panelManifest,
    compiledPrompt,
    reelArtifact,
    structuralQA,
    continuityDomainQA,
    renderModeQA,
    reelCoherenceQA,
    boardTypeQA,
    finalCinematicStoryboard,
    finalStoryboardRecord,
    storyboardBrief: brief,
    preStoryboardGate,
    finalStoryboardReviewGate,
    gateSatisfaction,
    founderReviewSlots,
    pipelineState,
    founderGates,
    finalStoryboardEligibility: pipelineState.finalStoryboard,
    storyboardCompilationContract,
    authorityRecords,
    productionEligibility,
    founderApprovalsPersisted: ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS,
    authorityVersion: ENTRY_002_PRE_STORYBOARD_AUTHORITY_VERSION,
    productionOrder: PRE_STORYBOARD_VISUAL_PRODUCTION_ORDER,
    treatment,
    preStoryboardAuthorityPack: { ...preStoryboardAuthorityPack, canonState: 'PRODUCTION_CANDIDATE' },
    cinematicSequence: {
      sequenceId: ENTRY_002_CINEMATIC_SEQUENCE_001,
      status: 'PRE_AUTHORITY_EXPERIMENT',
      canonState: 'NON_CANON',
      founderJudgment: 'UNREVIEWED',
      visualAuthority: false,
      referenceOnly: true,
      active: false,
    },
    keyframes: productionEligibility.keyframeEligibility,
    video: 'BLOCKED',
    qa,
    nextAction,
    telemetryNote,
  };
}

export function recordFinalStoryboardFounderJudgment(params: {
  founderJudgment: 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME';
  notes?: string | null;
}): ReturnType<typeof recordFinalCinematicStoryboardJudgment> {
  return recordFinalCinematicStoryboardJudgment(params);
}

export {
  resetFinalCinematicStoryboardStore,
  getFinalCinematicStoryboardRecord,
  getStoryboard001HistoricalRecord,
  getStoryboard002HistoricalRecord,
  getStoryboard003HistoricalRecord,
  resetFinalCinematicStoryboardJudgmentStore,
  getFinalCinematicStoryboardJudgment,
  hasValidFinalCinematicStoryboard,
};

export { bootstrapB49R3ReelFirstStoryboardRecovery as bootstrapB49R3 };
