/**
 * Sprint B4.8 — Entry 002 pre-storyboard gate satisfaction + final storyboard activation.
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
import { buildPreStoryboardApprovalState, buildPreStoryboardGateSatisfaction } from './preStoryboardAuthorityGate.js';
import {
  buildEntry002PipelineReconciliationState,
  resolveEntry002NextAction,
  resolveEntry002ProductionEligibility,
} from './entry002PipelineState.js';
import { buildEntry002FounderReviewGatesForPipeline, buildEntry002PreStoryboardAuthorityGate } from './entry002ReelProductionGates.js';
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
import { buildEntry002FinalCinematicStoryboardRecord } from './entry002FinalStoryboardRecord.js';

export async function bootstrapB48PreStoryboardGateSatisfaction(): Promise<
  Entry002PreStoryboardAuthorityBootstrapResult & {
    sprint: 'B4.8_PRE_STORYBOARD_GATE_SATISFACTION';
    preStoryboardGate: ReturnType<typeof buildEntry002PreStoryboardAuthorityGate>;
    gateSatisfaction: ReturnType<typeof buildPreStoryboardGateSatisfaction>;
    founderReviewSlots: ReturnType<typeof buildPreStoryboardFounderReviewSlots>;
    pipelineState: ReturnType<typeof buildEntry002PipelineReconciliationState>;
    founderGates: ReturnType<typeof buildEntry002FounderReviewGatesForPipeline>;
    finalStoryboardEligibility: ReturnType<typeof buildEntry002PipelineReconciliationState>['finalStoryboard'];
    finalStoryboardRecord: ReturnType<typeof buildEntry002FinalCinematicStoryboardRecord>;
    storyboardCompilationContract: ReturnType<typeof resolveFinalStoryboardCompilationContract>;
    authorityRecords: ReturnType<typeof summarizePreStoryboardAuthorityRecords>;
    productionEligibility: ReturnType<typeof resolveEntry002ProductionEligibility>;
    founderApprovalsPersisted: typeof ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS;
    authorityVersion: typeof ENTRY_002_PRE_STORYBOARD_AUTHORITY_VERSION;
    telemetryNote: string;
  }
> {
  process.env.EXPRESSION_ENGINE_MEMORY_STORE = process.env.EXPRESSION_ENGINE_MEMORY_STORE ?? '1';
  seedChapter01Canon();
  await bootstrapB31FounderCreativeOverride();
  saveEntry(compileEntry002LockedEntry());

  const approvalPersistence = persistEntry002PreStoryboardFounderApprovals();
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
    throw new Error(`B4.8 pre-storyboard QA failed: ${qa.blockers.join('; ')}`);
  }

  const approvalState = buildPreStoryboardApprovalState(authorities);
  if (!approvalState.allAuthoritiesLoveIt) {
    throw new Error('B4.8 gate satisfaction failed — not all five authorities are LOVE_IT');
  }

  const gateSatisfaction = buildPreStoryboardGateSatisfaction(authorities);
  const preStoryboardGate = buildEntry002PreStoryboardAuthorityGate(approvalState);
  const pipelineState = buildEntry002PipelineReconciliationState(approvalState);
  const productionEligibility = resolveEntry002ProductionEligibility(approvalState);
  const founderGates = buildEntry002FounderReviewGatesForPipeline(approvalState);
  const founderReviewSlots = buildPreStoryboardFounderReviewSlots(authorities);
  const storyboardCompilationContract = resolveFinalStoryboardCompilationContract(preStoryboardAuthorityPack);
  assertStoryboardCompilationFailClosed(storyboardCompilationContract);
  const authorityRecords = summarizePreStoryboardAuthorityRecords(authorities);
  const finalStoryboardRecord = buildEntry002FinalCinematicStoryboardRecord(
    pipelineState.finalStoryboard.status,
  );
  const nextAction = resolveEntry002NextAction(approvalState);

  return {
    sprint: 'B4.8_PRE_STORYBOARD_GATE_SATISFACTION',
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
    finalStoryboardRecord,
    storyboardCompilationContract,
    authorityRecords,
    productionEligibility,
    founderApprovalsPersisted: ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS,
    authorityVersion: ENTRY_002_PRE_STORYBOARD_AUTHORITY_VERSION,
    telemetryNote:
      'B4.8 founder approval persistence and gate resolution — no provider dispatch (COMPILED ≠ DISPATCHED)',
  };
}

export { bootstrapB48PreStoryboardGateSatisfaction as bootstrapB48 };
