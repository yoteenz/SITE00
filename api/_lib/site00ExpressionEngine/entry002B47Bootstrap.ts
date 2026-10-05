/**
 * Sprint B4.7 — Entry 002 B4.7 pre-storyboard authority approval bootstrap.
 */

import type { Entry002PreStoryboardAuthorityBootstrapResult } from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import { PRE_STORYBOARD_VISUAL_PRODUCTION_ORDER } from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import { ENTRY_002_CINEMATIC_SEQUENCE_001 } from '../../../shared/site00-expression-engine/entry002CinematicSequenceIds.js';
import { seedChapter01Canon } from './chapterStore.js';
import { bootstrapB31FounderCreativeOverride } from './entry002B31Bootstrap.js';
import { compileEntry002LockedEntry } from './entry002Blueprint.js';
import { saveEntry } from './entryStore.js';
import { buildEntry002ReelTreatmentAuthority } from './entry002ReelTreatment.js';
import { buildEntry002PreStoryboardVisualAuthorities } from './entry002PreStoryboardVisualAuthorities.js';
import { buildEntry002PreStoryboardVisualAuthorityPack } from './entry002PreStoryboardAuthorityRecord.js';
import { runPreStoryboardAuthorityQA } from './preStoryboardAuthorityQA.js';
import { buildPreStoryboardApprovalState } from './preStoryboardAuthorityGate.js';
import { buildEntry002PipelineReconciliationState, resolveEntry002NextAction } from './entry002PipelineState.js';
import { buildEntry002FounderReviewGatesForPipeline, buildEntry002PreStoryboardAuthorityGate } from './entry002ReelProductionGates.js';
import {
  applyStoredPreStoryboardJudgments,
  buildPreStoryboardFounderReviewSlots,
} from './preStoryboardFounderJudgment.js';
import {
  attachEntry002PreStoryboardFounderAssets,
} from './entry002PreStoryboardAuthorityAssets.js';
import {
  attachPreStoryboardAuthorityRecords,
  summarizePreStoryboardAuthorityRecords,
} from './entry002PreStoryboardAuthorityRecordBuilder.js';
import {
  resolveFinalStoryboardCompilationContract,
} from './entry002FinalStoryboardCompilationContract.js';
import { buildPreStoryboardGateSatisfaction } from './preStoryboardAuthorityGate.js';

export async function bootstrapB47PreStoryboardAuthorityApproval(): Promise<
  Entry002PreStoryboardAuthorityBootstrapResult & {
    sprint: 'B4.7_PRE_STORYBOARD_AUTHORITY_APPROVAL';
    preStoryboardGate: ReturnType<typeof buildEntry002PreStoryboardAuthorityGate>;
    gateSatisfaction: ReturnType<typeof buildPreStoryboardGateSatisfaction>;
    founderReviewSlots: ReturnType<typeof buildPreStoryboardFounderReviewSlots>;
    pipelineState: ReturnType<typeof buildEntry002PipelineReconciliationState>;
    founderGates: ReturnType<typeof buildEntry002FounderReviewGatesForPipeline>;
    finalStoryboardEligibility: ReturnType<typeof buildEntry002PipelineReconciliationState>['finalStoryboard'];
    storyboardCompilationContract: ReturnType<typeof resolveFinalStoryboardCompilationContract>;
    authorityRecords: ReturnType<typeof summarizePreStoryboardAuthorityRecords>;
    telemetryNote: string;
  }
> {
  process.env.EXPRESSION_ENGINE_MEMORY_STORE = process.env.EXPRESSION_ENGINE_MEMORY_STORE ?? '1';
  seedChapter01Canon();
  await bootstrapB31FounderCreativeOverride();
  saveEntry(compileEntry002LockedEntry());

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
    throw new Error(`B4.7 pre-storyboard QA failed: ${qa.blockers.join('; ')}`);
  }

  const approvalState = buildPreStoryboardApprovalState(authorities);
  const gateSatisfaction = buildPreStoryboardGateSatisfaction(authorities);
  const preStoryboardGate = buildEntry002PreStoryboardAuthorityGate(approvalState);
  const pipelineState = buildEntry002PipelineReconciliationState({ preStoryboardApproval: approvalState });
  const founderGates = buildEntry002FounderReviewGatesForPipeline(approvalState);
  const founderReviewSlots = buildPreStoryboardFounderReviewSlots(authorities);
  const storyboardCompilationContract = resolveFinalStoryboardCompilationContract(preStoryboardAuthorityPack);
  const authorityRecords = summarizePreStoryboardAuthorityRecords(authorities);
  const nextAction = resolveEntry002NextAction({ preStoryboardApproval: approvalState });

  return {
    sprint: 'B4.7_PRE_STORYBOARD_AUTHORITY_APPROVAL',
    productionOrder: PRE_STORYBOARD_VISUAL_PRODUCTION_ORDER,
    roleCorrection: {
      ndx: treatment.characterRoles.ndx,
      subjectWoman: treatment.characterRoles.subjectWoman,
      collapsedIdentityFixed: true,
      deprecatedStatement:
        'REMOVED — "face: Black woman, medium-brown skin — same NDXBOOK woman every frame" is NOT canon',
    },
    treatment,
    preStoryboardAuthorityPack,
    cinematicSequence: {
      sequenceId: ENTRY_002_CINEMATIC_SEQUENCE_001,
      status: 'PRE_AUTHORITY_EXPERIMENT',
      canonState: 'NON_CANON',
      founderJudgment: 'UNREVIEWED',
      visualAuthority: false,
    },
    finalStoryboard: {
      status: pipelineState.finalStoryboard.status,
      gateId: 'GATE_0C_STRUCTURAL_STORYBOARD',
    },
    keyframes: 'BLOCKED',
    video: 'BLOCKED',
    qa,
    nextAction,
    preStoryboardGate,
    gateSatisfaction,
    founderReviewSlots,
    pipelineState,
    founderGates,
    finalStoryboardEligibility: pipelineState.finalStoryboard,
    storyboardCompilationContract,
    authorityRecords,
    telemetryNote:
      'Authority ingestion and founder review reconciliation — no provider dispatch recorded (COMPILED ≠ DISPATCHED)',
  };
}

export { bootstrapB47PreStoryboardAuthorityApproval as bootstrapB47 };
