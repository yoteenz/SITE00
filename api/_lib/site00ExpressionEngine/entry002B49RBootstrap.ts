/**
 * Sprint B4.9R — Final cinematic storyboard structure recovery.
 * ASSEMBLY ≠ GENERATION — distinct panel assets required before founder review.
 */

import type { FinalCinematicStoryboardRecord } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import {
  ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION,
  ENTRY_002_REPAIR_FINAL_STORYBOARD_ACTION,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import { ENTRY_002_CINEMATIC_SEQUENCE_001 } from '../../../shared/site00-expression-engine/entry002CinematicSequenceIds.js';
import { PRE_STORYBOARD_VISUAL_PRODUCTION_ORDER } from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import {
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_002_ID,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';
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
  buildEntry002FinalCinematicStoryboard002Record,
  toEntry002FinalCinematicStoryboardSummaryRecord,
  applyFinalStoryboardFounderJudgmentToRecord,
} from './entry002FinalStoryboardRecord.js';
import { compileEntry002FinalCinematicStoryboardBrief } from './entry002FinalCinematicStoryboardBrief.js';
import { compileEntry002FinalCinematicStoryboardPanelManifest } from './entry002FinalCinematicStoryboardPanelManifest.js';
import { runStoryboardStructureQA } from './entry002FinalCinematicStoryboardStructureQA.js';
import { runStoryboardContinuityDomainQA } from './entry002FinalCinematicStoryboardContinuityDomainQA.js';
import { runStoryboardDuplicationQA } from './entry002FinalCinematicStoryboardDuplicationQA.js';
import {
  runFinalCinematicStoryboardPanelPipeline,
  type PanelPipelineResult,
} from './entry002FinalCinematicStoryboardPanelPipeline.js';
import {
  buildStoryboard001HistoricalFailureRecord,
} from './entry002FinalCinematicStoryboardHistory.js';
import {
  getFinalCinematicStoryboardRecord,
  getStoryboard001HistoricalRecord,
  hasValidFinalCinematicStoryboard,
  resetFinalCinematicStoryboardStore,
  saveFinalCinematicStoryboardRecord,
  saveStoryboard001HistoricalRecord,
} from './finalCinematicStoryboardStore.js';
import {
  getFinalCinematicStoryboardJudgment,
  recordFinalCinematicStoryboardJudgment,
  resolveFinalStoryboardFounderJudgment,
  resetFinalCinematicStoryboardJudgmentStore,
} from './finalCinematicStoryboardJudgmentStore.js';

export async function bootstrapB49RStoryboardStructureRecovery(options?: {
  dispatchFal?: boolean;
  forceDispatch?: boolean;
  skipGeneration?: boolean;
  repairPanelNumbers?: number[];
}): Promise<{
  sprint: 'B4.9R_FINAL_CINEMATIC_STORYBOARD_STRUCTURE_RECOVERY';
  rootCause: string;
  storyboard001Historical: FinalCinematicStoryboardRecord;
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
  panelPipeline: PanelPipelineResult | null;
  structuralQA: Awaited<ReturnType<typeof runStoryboardStructureQA>>;
  continuityDomainQA: ReturnType<typeof runStoryboardContinuityDomainQA>;
  duplicationQA: ReturnType<typeof runStoryboardDuplicationQA>;
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
    throw new Error(`B4.9R pre-storyboard QA failed: ${qa.blockers.join('; ')}`);
  }

  const approvalState = buildPreStoryboardApprovalState(authorities);
  if (!approvalState.allAuthoritiesLoveIt) {
    throw new Error('B4.9R blocked — not all five authorities are LOVE_IT');
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

  const panelManifest = compileEntry002FinalCinematicStoryboardPanelManifest();
  let panelPipeline: PanelPipelineResult | null = null;
  let structuralQA = await runStoryboardStructureQA({
    manifest: panelManifest,
    compositeExists: false,
    panelOnlyCompositeWithoutDistinctPanels: true,
  });
  let continuityDomainQA = runStoryboardContinuityDomainQA(panelManifest);
  let duplicationQA = runStoryboardDuplicationQA(panelManifest);

  let finalCinematicStoryboard = getFinalCinematicStoryboardRecord();
  const storedJudgment = resolveFinalStoryboardFounderJudgment();

  if (!options?.skipGeneration) {
    const shouldRun =
      !hasValidFinalCinematicStoryboard() ||
      options?.forceDispatch ||
      Boolean(options?.repairPanelNumbers?.length);

    if (shouldRun) {
      panelPipeline = await runFinalCinematicStoryboardPanelPipeline({
        dispatchFal: options?.dispatchFal,
        repairPanelNumbers: options?.repairPanelNumbers,
      });

      structuralQA = await runStoryboardStructureQA({
        manifest: panelPipeline.manifest,
        compositeExists: panelPipeline.assembled,
        panelOnlyCompositeWithoutDistinctPanels: false,
      });
      continuityDomainQA = runStoryboardContinuityDomainQA(panelPipeline.manifest);
      duplicationQA = runStoryboardDuplicationQA(panelPipeline.manifest);

      const allQaPassed =
        structuralQA.passed && continuityDomainQA.passed && duplicationQA.passed;

      finalCinematicStoryboard = buildEntry002FinalCinematicStoryboard002Record({
        manifest: panelPipeline.manifest,
        telemetry: panelPipeline.telemetry,
        structuralQaStatus: structuralQA.result,
        continuityQaStatus: continuityDomainQA.result,
        duplicationQaStatus: duplicationQA.result,
        compositeUrl: panelPipeline.compositeUrl,
        compositePath: panelPipeline.compositePath,
        assembled: panelPipeline.assembled,
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
        structuralQA = await runStoryboardStructureQA({
          manifest: finalCinematicStoryboard.panelManifest,
          compositeExists: finalCinematicStoryboard.assembled,
          panelOnlyCompositeWithoutDistinctPanels: false,
        });
        continuityDomainQA = runStoryboardContinuityDomainQA(finalCinematicStoryboard.panelManifest);
        duplicationQA = runStoryboardDuplicationQA(finalCinematicStoryboard.panelManifest);
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
  const qaPassed =
    structuralQA.passed && continuityDomainQA.passed && duplicationQA.passed;
  const panelsFullyRendered =
    (finalCinematicStoryboard?.telemetry.panelRenderCount ?? 0) >=
    (finalCinematicStoryboard?.panelCount ?? panelManifest.length) &&
    (finalCinematicStoryboard?.telemetry.panelRenderCount ?? 0) > 0;
  const generatedAttempt = panelsFullyRendered;

  const gateSatisfaction = buildPreStoryboardGateSatisfaction(authorities);
  const preStoryboardGate = buildEntry002PreStoryboardAuthorityGate(approvalState);
  const finalStoryboardReviewGate = buildEntry002FinalStoryboardReviewGate(
    founderJudgment,
    valid,
  );
  const pipelineState = buildEntry002PipelineReconciliationState({
    preStoryboardApproval: approvalState,
    storyboardGenerated: generatedAttempt,
    storyboardValid: valid,
    storyboardFounderJudgment: founderJudgment,
    storyboardApproved: founderJudgment === 'LOVE_IT',
    structuralQaPassed: structuralQA.passed,
    continuityQaPassed: continuityDomainQA.passed,
    duplicationQaPassed: duplicationQA.passed,
  });
  const productionEligibility = resolveEntry002ProductionEligibility({
    preStoryboardApproval: approvalState,
    storyboardGenerated: generatedAttempt,
    storyboardValid: valid,
    storyboardFounderJudgment: founderJudgment,
    structuralQaPassed: structuralQA.passed,
    continuityQaPassed: continuityDomainQA.passed,
    duplicationQaPassed: duplicationQA.passed,
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
        buildEntry002FinalCinematicStoryboard002Record({
          manifest: panelManifest,
          telemetry: {
            panelCompileCount: panelManifest.length,
            panelDispatchCount: 0,
            panelRenderCount: 0,
            panelFailureCount: 0,
            panelRepairCount: 0,
          },
          structuralQaStatus: 'FAIL',
          continuityQaStatus: 'FAIL',
          duplicationQaStatus: 'FAIL',
          compositeUrl: null,
          compositePath: null,
          assembled: false,
          status: 'REVISION_REQUIRED',
        }),
      );

  const nextAction = resolveEntry002NextAction({
    preStoryboardApproval: approvalState,
    storyboardGenerated: valid,
    storyboardValid: valid,
    storyboardFounderJudgment: founderJudgment,
    structuralQaPassed: structuralQA.passed,
  });

  const telemetry = finalCinematicStoryboard?.telemetry;
  const telemetryNote = valid
    ? `B4.9R COMPILED → PANELS_GENERATED (${telemetry?.panelRenderCount ?? 0}/${panelManifest.length}) → ASSEMBLED → QA_PASSED`
    : panelPipeline
      ? `B4.9R COMPILED → PANELS_GENERATED (${panelPipeline.telemetry.panelRenderCount}/${panelManifest.length}) → ASSEMBLED=${panelPipeline.assembled} → QA=${qaPassed ? 'PASS' : 'FAIL'}`
      : 'B4.9R storyboard 001 invalidated — awaiting panel generation';

  return {
    sprint: 'B4.9R_FINAL_CINEMATIC_STORYBOARD_STRUCTURE_RECOVERY',
    rootCause:
      'B4.9 allowed local-sharp-composite to satisfy FINAL_CINEMATIC_STORYBOARD RENDERED without distinct generated panel assets',
    storyboard001Historical,
    productionOrder: PRE_STORYBOARD_VISUAL_PRODUCTION_ORDER,
    treatment,
    preStoryboardAuthorityPack: {
      ...preStoryboardAuthorityPack,
      canonState: 'PRODUCTION_CANDIDATE',
    },
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
    panelPipeline,
    structuralQA,
    continuityDomainQA,
    duplicationQA,
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
  resetFinalCinematicStoryboardJudgmentStore,
  getFinalCinematicStoryboardJudgment,
  hasValidFinalCinematicStoryboard,
};

export { bootstrapB49RStoryboardStructureRecovery as bootstrapB49R };
