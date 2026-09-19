/**
 * Sprint B4.9R2 — Single-artifact cinematic storyboard recovery.
 * ONE provider dispatch → ONE multi-panel storyboard image. NO panel fan-out.
 */

import type { FinalCinematicStoryboardRecord } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
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
  buildEntry002FinalCinematicStoryboard003Record,
  toEntry002FinalCinematicStoryboardSummaryRecord,
  applyFinalStoryboardFounderJudgmentToRecord,
} from './entry002FinalStoryboardRecord.js';
import { compileEntry002FinalCinematicStoryboardBrief } from './entry002FinalCinematicStoryboardBrief.js';
import { compileEntry002FinalCinematicStoryboardPanelManifest } from './entry002FinalCinematicStoryboardPanelManifest.js';
import { runStoryboardContinuityDomainQA } from './entry002FinalCinematicStoryboardContinuityDomainQA.js';
import {
  dispatchSingleMultiPanelStoryboardArtifact,
  type SingleStoryboardArtifactResult,
} from './entry002FinalCinematicStoryboardSingleArtifact.js';
import { runSingleStoryboardArtifactQA } from './entry002FinalCinematicStoryboardSingleArtifactQA.js';
import { runStoryboardRenderModeQA } from './entry002FinalCinematicStoryboardRenderModeQA.js';
import { compileSingleMultiPanelStoryboardPrompt } from './entry002FinalCinematicStoryboardSingleArtifactPrompt.js';
import {
  buildStoryboard001HistoricalFailureRecord,
  buildStoryboard002HistoricalFailureRecord,
} from './entry002FinalCinematicStoryboardHistory.js';
import {
  getFinalCinematicStoryboardRecord,
  getStoryboard001HistoricalRecord,
  getStoryboard002HistoricalRecord,
  hasValidFinalCinematicStoryboard,
  resetFinalCinematicStoryboardStore,
  saveFinalCinematicStoryboardRecord,
  saveStoryboard001HistoricalRecord,
  saveStoryboard002HistoricalRecord,
} from './finalCinematicStoryboardStore.js';
import {
  recordFinalCinematicStoryboardJudgment,
  resolveFinalStoryboardFounderJudgment,
  resetFinalCinematicStoryboardJudgmentStore,
  getFinalCinematicStoryboardJudgment,
} from './finalCinematicStoryboardJudgmentStore.js';

export async function bootstrapB49R2SingleStoryboardArtifactRecovery(options?: {
  dispatchFal?: boolean;
  forceDispatch?: boolean;
  skipGeneration?: boolean;
}): Promise<{
  sprint: 'B4.9R2_SINGLE_ARTIFACT_CINEMATIC_STORYBOARD_RECOVERY';
  b49FailureMode: string;
  b49rFailureMode: string;
  storyboard001Historical: FinalCinematicStoryboardRecord;
  storyboard002Historical: FinalCinematicStoryboardRecord;
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
  panelManifest: ReturnType<typeof compileEntry002FinalCinematicStoryboardPanelManifest>;
  compiledPrompt: string;
  singleArtifact: SingleStoryboardArtifactResult | null;
  structuralQA: Awaited<ReturnType<typeof runSingleStoryboardArtifactQA>>;
  continuityDomainQA: ReturnType<typeof runStoryboardContinuityDomainQA>;
  renderModeQA: ReturnType<typeof runStoryboardRenderModeQA>;
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
    throw new Error(`B4.9R2 pre-storyboard QA failed: ${qa.blockers.join('; ')}`);
  }

  const approvalState = buildPreStoryboardApprovalState(authorities);
  if (!approvalState.allAuthoritiesLoveIt) {
    throw new Error('B4.9R2 blocked — not all five authorities are LOVE_IT');
  }

  const storyboardCompilationContract = resolveFinalStoryboardCompilationContract(preStoryboardAuthorityPack);
  assertStoryboardCompilationFailClosed(storyboardCompilationContract);

  const brief = compileEntry002FinalCinematicStoryboardBrief({
    treatment,
    preStoryboardAuthorityPack,
  });

  const storyboard001Historical =
    getStoryboard001HistoricalRecord() ?? buildStoryboard001HistoricalFailureRecord();
  saveStoryboard001HistoricalRecord(storyboard001Historical);

  const storyboard002Historical =
    getStoryboard002HistoricalRecord() ?? buildStoryboard002HistoricalFailureRecord();
  saveStoryboard002HistoricalRecord(storyboard002Historical);

  const panelManifest = compileEntry002FinalCinematicStoryboardPanelManifest();
  const compiledPrompt = compileSingleMultiPanelStoryboardPrompt({ manifest: panelManifest, brief });

  let singleArtifact: SingleStoryboardArtifactResult | null = null;
  let structuralQA = await runSingleStoryboardArtifactQA({
    manifest: panelManifest,
    storyboardImagePath: null,
    generationMode: 'SINGLE_MULTI_PANEL_ARTIFACT',
    storyboardAssetCount: 0,
  });
  let continuityDomainQA = runStoryboardContinuityDomainQA(panelManifest);
  let renderModeQA = runStoryboardRenderModeQA({
    generationMode: 'SINGLE_MULTI_PANEL_ARTIFACT',
    storyboardDispatchCount: 0,
    storyboardRenderCount: 0,
    storyboardAssetCount: 0,
    independentStoryboardPanelAssetCount: 0,
  });

  let finalCinematicStoryboard = getFinalCinematicStoryboardRecord();
  const storedJudgment = resolveFinalStoryboardFounderJudgment();

  if (!options?.skipGeneration) {
    const shouldRun = !hasValidFinalCinematicStoryboard() || options?.forceDispatch;

    if (shouldRun) {
      singleArtifact = await dispatchSingleMultiPanelStoryboardArtifact({
        manifest: panelManifest,
        brief,
        dispatchFal: options?.dispatchFal,
        forceDispatch: options?.forceDispatch,
      });

      if (singleArtifact.failure || !singleArtifact.rendered) {
        throw new Error(singleArtifact.failure ?? 'Single storyboard artifact generation failed');
      }

      structuralQA = await runSingleStoryboardArtifactQA({
        manifest: panelManifest,
        storyboardImagePath: singleArtifact.compositeUrl,
        generationMode: 'SINGLE_MULTI_PANEL_ARTIFACT',
        storyboardAssetCount: 1,
      });
      continuityDomainQA = runStoryboardContinuityDomainQA(panelManifest);
      renderModeQA = runStoryboardRenderModeQA({
        generationMode: 'SINGLE_MULTI_PANEL_ARTIFACT',
        storyboardDispatchCount: singleArtifact.telemetry.storyboardDispatchCount,
        storyboardRenderCount: singleArtifact.telemetry.storyboardRenderCount,
        storyboardAssetCount: 1,
        independentStoryboardPanelAssetCount: singleArtifact.telemetry.panelRenderCount,
      });

      const allQaPassed =
        structuralQA.passed && continuityDomainQA.passed && renderModeQA.passed;

      finalCinematicStoryboard = buildEntry002FinalCinematicStoryboard003Record({
        manifest: panelManifest,
        artifact: singleArtifact,
        structuralQaStatus: structuralQA.result,
        continuityQaStatus: continuityDomainQA.result,
        renderModeQaStatus: renderModeQA.result,
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
        structuralQA = await runSingleStoryboardArtifactQA({
          manifest: finalCinematicStoryboard.panelManifest,
          storyboardImagePath: finalCinematicStoryboard.storyboardStripUrl,
          generationMode: 'SINGLE_MULTI_PANEL_ARTIFACT',
          storyboardAssetCount: finalCinematicStoryboard.rendered ? 1 : 0,
        });
        continuityDomainQA = runStoryboardContinuityDomainQA(finalCinematicStoryboard.panelManifest);
        renderModeQA = runStoryboardRenderModeQA({
          generationMode: finalCinematicStoryboard.generationMode,
          storyboardDispatchCount: finalCinematicStoryboard.telemetry.storyboardDispatchCount,
          storyboardRenderCount: finalCinematicStoryboard.telemetry.storyboardRenderCount,
          storyboardAssetCount: finalCinematicStoryboard.rendered ? 1 : 0,
          independentStoryboardPanelAssetCount: finalCinematicStoryboard.telemetry.panelRenderCount,
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
  const panelsFullyRendered = finalCinematicStoryboard?.telemetry.storyboardRenderCount === 1;
  const generatedAttempt = panelsFullyRendered;

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
        buildEntry002FinalCinematicStoryboard003Record({
          manifest: panelManifest,
          artifact: {
            compositeUrl: '',
            compositePath: '',
            provider: 'none',
            providerRequestId: null,
            dispatched: false,
            rendered: false,
            telemetry: {
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
          status: 'REVISION_REQUIRED',
        }),
      );

  const nextAction = resolveEntry002NextAction({
    preStoryboardApproval: approvalState,
    storyboardGenerated: generatedAttempt,
    storyboardValid: valid,
    storyboardFounderJudgment: founderJudgment,
    structuralQaPassed: structuralQA.passed,
  });

  const t = finalCinematicStoryboard?.telemetry;
  const telemetryNote = valid
    ? `B4.9R2 MANIFEST=${t?.panelManifestCount ?? 16} → STORYBOARD_DISPATCHED=${t?.storyboardDispatchCount ?? 0} → STORYBOARD_RENDERED=1 → QA_PASSED`
    : singleArtifact
      ? `B4.9R2 MANIFEST=${panelManifest.length} → STORYBOARD_RENDERED=${singleArtifact.rendered ? 1 : 0} → panelRenderCount=0`
      : 'B4.9R2 awaiting single-artifact storyboard generation';

  return {
    sprint: 'B4.9R2_SINGLE_ARTIFACT_CINEMATIC_STORYBOARD_RECOVERY',
    b49FailureMode: 'ONE hero image + storyboard-like notes (local-sharp-composite)',
    b49rFailureMode: '16 independent panel provider dispatches assembled afterward (panel fan-out)',
    storyboard001Historical,
    storyboard002Historical,
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
    panelManifest,
    compiledPrompt,
    singleArtifact,
    structuralQA,
    continuityDomainQA,
    renderModeQA,
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
  resetFinalCinematicStoryboardJudgmentStore,
  getFinalCinematicStoryboardJudgment,
  hasValidFinalCinematicStoryboard,
};

export { bootstrapB49R2SingleStoryboardArtifactRecovery as bootstrapB49R2 };
