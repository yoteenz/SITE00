/**
 * Sprint B4.6 follow-up — Pre-storyboard visual authority pack bootstrap.
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
import {
  dispatchAllEntry002PreStoryboardAuthorities,
  mergePreStoryboardRasterResults,
} from './preStoryboardAuthorityDispatch.js';
import { buildPreStoryboardApprovalState } from './preStoryboardAuthorityGate.js';
import { buildEntry002PipelineReconciliationState } from './entry002PipelineState.js';
import { buildEntry002FounderReviewGatesForPipeline, buildEntry002PreStoryboardAuthorityGate } from './entry002ReelProductionGates.js';

export async function bootstrapB46FollowUpPreStoryboardAuthority(options?: {
  dispatchFal?: boolean;
  forceDispatch?: boolean;
}): Promise<
  Entry002PreStoryboardAuthorityBootstrapResult & {
    preStoryboardGate: ReturnType<typeof buildEntry002PreStoryboardAuthorityGate>;
    authorityVisuals: Awaited<ReturnType<typeof dispatchAllEntry002PreStoryboardAuthorities>>;
    founderReviewSlots: Array<{
      authorityKey: string;
      boardNumber: number;
      boardTitle: string;
      founderJudgment: string;
    }>;
    pipelineState: ReturnType<typeof buildEntry002PipelineReconciliationState>;
    founderGates: ReturnType<typeof buildEntry002FounderReviewGatesForPipeline>;
  }
> {
  process.env.EXPRESSION_ENGINE_MEMORY_STORE = process.env.EXPRESSION_ENGINE_MEMORY_STORE ?? '1';
  seedChapter01Canon();
  await bootstrapB31FounderCreativeOverride();
  saveEntry(compileEntry002LockedEntry());

  const dispatchFal = options?.dispatchFal ?? Boolean(process.env.FAL_KEY?.trim());
  const treatment = buildEntry002ReelTreatmentAuthority();
  const baseAuthorities = buildEntry002PreStoryboardVisualAuthorities();
  const authorityResults = await dispatchAllEntry002PreStoryboardAuthorities(baseAuthorities, {
    dispatchFal,
    forceDispatch: options?.forceDispatch,
  });
  const authorities = mergePreStoryboardRasterResults(baseAuthorities, authorityResults);
  const preStoryboardAuthorityPack = buildEntry002PreStoryboardVisualAuthorityPack(authorities);
  const qa = runPreStoryboardAuthorityQA(preStoryboardAuthorityPack);

  if (!qa.passed) {
    throw new Error(`B4.6 follow-up pre-storyboard QA failed: ${qa.blockers.join('; ')}`);
  }

  const approvalState = buildPreStoryboardApprovalState(authorities);
  const preStoryboardGate = buildEntry002PreStoryboardAuthorityGate(approvalState);
  const pipelineState = buildEntry002PipelineReconciliationState(approvalState);
  const founderGates = buildEntry002FounderReviewGatesForPipeline(approvalState);
  const founderReviewSlots = authorities.map((a) => ({
    authorityKey: `AUTHORITY_${String(a.boardNumber).padStart(2, '0')}`,
    boardNumber: a.boardNumber,
    boardTitle: a.boardTitle,
    founderJudgment: a.founderJudgment,
  }));

  return {
    sprint: 'B4.6_FOLLOWUP_PRE_STORYBOARD_VISUAL_AUTHORITY_PACK',
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
      status: 'BLOCKED_PENDING_PRE_STORYBOARD_AUTHORITY_APPROVAL',
      gateId: 'GATE_0C_STRUCTURAL_STORYBOARD',
    },
    keyframes: 'BLOCKED',
    video: 'BLOCKED',
    qa,
    nextAction: 'FOUNDER REVIEW OF FIVE PRE-STORYBOARD VISUAL AUTHORITIES',
    preStoryboardGate,
    authorityVisuals: authorityResults,
    founderReviewSlots,
    pipelineState,
    founderGates,
  };
}

export { bootstrapB46FollowUpPreStoryboardAuthority as bootstrapB46FollowUp };
