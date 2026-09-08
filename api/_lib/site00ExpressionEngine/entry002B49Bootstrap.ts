/**
 * Sprint B4.9 — Entry 002 final cinematic storyboard generation + founder review gate.
 */

import type { FinalCinematicStoryboardRecord } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import { ENTRY_002_CINEMATIC_SEQUENCE_001 } from '../../../shared/site00-expression-engine/entry002CinematicSequenceIds.js';
import { PRE_STORYBOARD_VISUAL_PRODUCTION_ORDER } from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import { ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_ID } from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';
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
  ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION,
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
  buildEntry002FinalCinematicStoryboardGeneratedRecord,
  buildEntry002FinalCinematicStoryboardPlaceholderRecord,
  toEntry002FinalCinematicStoryboardSummaryRecord,
  applyFinalStoryboardFounderJudgmentToRecord,
} from './entry002FinalStoryboardRecord.js';
import {
  compileEntry002FinalCinematicStoryboardBrief,
} from './entry002FinalCinematicStoryboardBrief.js';
import { runFinalCinematicStoryboardQA } from './entry002FinalCinematicStoryboardQA.js';
import { renderEntry002FinalCinematicStoryboardStrip } from './entry002FinalCinematicStoryboardDispatch.js';
import {
  getFinalCinematicStoryboardRecord,
  hasGeneratedFinalCinematicStoryboard,
  resetFinalCinematicStoryboardStore,
  saveFinalCinematicStoryboardRecord,
} from './finalCinematicStoryboardStore.js';
import {
  getFinalCinematicStoryboardJudgment,
  recordFinalCinematicStoryboardJudgment,
  resolveFinalStoryboardFounderJudgment,
  resetFinalCinematicStoryboardJudgmentStore,
} from './finalCinematicStoryboardJudgmentStore.js';

export async function bootstrapB49FinalCinematicStoryboardGeneration(options?: {
  dispatchFal?: boolean;
  forceDispatch?: boolean;
  skipGeneration?: boolean;
}): Promise<{
  sprint: 'B4.9_FINAL_CINEMATIC_STORYBOARD_GENERATION';
  productionOrder: typeof PRE_STORYBOARD_VISUAL_PRODUCTION_ORDER;
  roleCorrection: ReturnType<typeof buildEntry002ReelTreatmentAuthority> extends infer T
    ? {
        ndx: string;
        subjectWoman: string;
        collapsedIdentityFixed: true;
        deprecatedStatement: string;
      }
    : never;
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
  finalStoryboard: {
    status: FinalCinematicStoryboardRecord['status'];
    gateId: 'GATE_0D_FOUNDER_FINAL_STORYBOARD_REVIEW';
  };
  finalCinematicStoryboard: FinalCinematicStoryboardRecord | null;
  finalStoryboardRecord: ReturnType<typeof toEntry002FinalCinematicStoryboardSummaryRecord>;
  storyboardBrief: ReturnType<typeof compileEntry002FinalCinematicStoryboardBrief>;
  continuityQA: ReturnType<typeof runFinalCinematicStoryboardQA>;
  renderResult: Awaited<ReturnType<typeof renderEntry002FinalCinematicStoryboardStrip>> | null;
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
  nextAction: typeof ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION | 'GENERATE FINAL CINEMATIC STORYBOARD';
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
    throw new Error(`B4.9 pre-storyboard QA failed: ${qa.blockers.join('; ')}`);
  }

  const approvalState = buildPreStoryboardApprovalState(authorities);
  if (!approvalState.allAuthoritiesLoveIt) {
    throw new Error('B4.9 final storyboard generation blocked — not all five authorities are LOVE_IT');
  }

  const storyboardCompilationContract = resolveFinalStoryboardCompilationContract(preStoryboardAuthorityPack);
  assertStoryboardCompilationFailClosed(storyboardCompilationContract);

  const brief = compileEntry002FinalCinematicStoryboardBrief({
    treatment,
    preStoryboardAuthorityPack,
  });
  const continuityQA = runFinalCinematicStoryboardQA(brief);

  if (!continuityQA.passed) {
    throw new Error(`B4.9 continuity QA failed: ${continuityQA.blockers.join('; ')}`);
  }

  let renderResult: Awaited<ReturnType<typeof renderEntry002FinalCinematicStoryboardStrip>> | null = null;
  let finalCinematicStoryboard = getFinalCinematicStoryboardRecord();
  const storedJudgment = resolveFinalStoryboardFounderJudgment();

  if (!options?.skipGeneration) {
    if (!hasGeneratedFinalCinematicStoryboard() || options?.forceDispatch) {
      renderResult = await renderEntry002FinalCinematicStoryboardStrip(brief, {
        dispatchFal: options?.dispatchFal,
        forceDispatch: options?.forceDispatch,
      });

      if (!renderResult.rendered || !renderResult.actualFileExists) {
        throw new Error(
          renderResult.failure ?? 'Final cinematic storyboard render failed — no artifact persisted',
        );
      }

      finalCinematicStoryboard = buildEntry002FinalCinematicStoryboardGeneratedRecord({
        renderResult,
        panels: brief.panels,
        continuityQaStatus: continuityQA.result,
        assetId: ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_ID,
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
    }
  }

  if (finalCinematicStoryboard && storedJudgment !== 'UNREVIEWED') {
    finalCinematicStoryboard = applyFinalStoryboardFounderJudgmentToRecord(
      finalCinematicStoryboard,
      storedJudgment,
    );
    saveFinalCinematicStoryboardRecord(finalCinematicStoryboard);
  }

  const generated = hasGeneratedFinalCinematicStoryboard();
  const founderJudgment = finalCinematicStoryboard?.founderJudgment ?? storedJudgment;
  const gateSatisfaction = buildPreStoryboardGateSatisfaction(authorities);
  const preStoryboardGate = buildEntry002PreStoryboardAuthorityGate(approvalState);
  const finalStoryboardReviewGate = buildEntry002FinalStoryboardReviewGate(founderJudgment, generated);
  const pipelineState = buildEntry002PipelineReconciliationState({
    preStoryboardApproval: approvalState,
    storyboardGenerated: generated,
    storyboardFounderJudgment: founderJudgment,
    storyboardApproved: founderJudgment === 'LOVE_IT',
    continuityQaPassed: continuityQA.passed,
  });
  const productionEligibility = resolveEntry002ProductionEligibility({
    preStoryboardApproval: approvalState,
    storyboardGenerated: generated,
    storyboardFounderJudgment: founderJudgment,
    continuityQaPassed: continuityQA.passed,
  });
  const founderGates = buildEntry002FounderReviewGatesForPipeline(approvalState, {
    storyboardGenerated: generated,
    storyboardFounderJudgment: founderJudgment,
  });
  const founderReviewSlots = buildPreStoryboardFounderReviewSlots(authorities);
  const authorityRecords = summarizePreStoryboardAuthorityRecords(authorities);

  const finalStoryboardRecord = finalCinematicStoryboard
    ? toEntry002FinalCinematicStoryboardSummaryRecord(finalCinematicStoryboard)
    : buildEntry002FinalCinematicStoryboardPlaceholderRecord(pipelineState.finalStoryboard.status);

  const nextAction = resolveEntry002NextAction({
    preStoryboardApproval: approvalState,
    storyboardGenerated: generated,
    storyboardFounderJudgment: founderJudgment,
  });

  const telemetryNote = renderResult?.dispatched
    ? 'B4.9 final storyboard COMPILED → DISPATCHED → RENDERED (FAL provider)'
    : generated
      ? 'B4.9 final storyboard COMPILED → RENDERED (local composite; no provider dispatch)'
      : 'B4.9 final storyboard COMPILED only — generation skipped';

  return {
    sprint: 'B4.9_FINAL_CINEMATIC_STORYBOARD_GENERATION',
    productionOrder: PRE_STORYBOARD_VISUAL_PRODUCTION_ORDER,
    roleCorrection: {
      ndx: treatment.characterRoles.ndx,
      subjectWoman: treatment.characterRoles.subjectWoman,
      collapsedIdentityFixed: true,
      deprecatedStatement:
        'REMOVED — "face: Black woman, medium-brown skin — same NDXBOOK woman every frame" is NOT canon',
    },
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
    finalStoryboard: {
      status: pipelineState.finalStoryboard.status as FinalCinematicStoryboardRecord['status'],
      gateId: 'GATE_0D_FOUNDER_FINAL_STORYBOARD_REVIEW',
    },
    finalCinematicStoryboard,
    finalStoryboardRecord,
    storyboardBrief: brief,
    continuityQA,
    renderResult,
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
  resetFinalCinematicStoryboardJudgmentStore,
  getFinalCinematicStoryboardJudgment,
};

export { bootstrapB49FinalCinematicStoryboardGeneration as bootstrapB49 };
