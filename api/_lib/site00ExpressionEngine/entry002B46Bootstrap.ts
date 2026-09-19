/**
 * Sprint B4.6 — Entry 002 storyboard gate + reel treatment authority bootstrap.
 */

import type { Entry002StoryboardGateBootstrapResult } from '../../../shared/site00-expression-engine/storyboardGateTypes.js';
import { STORYBOARD_GATED_PRODUCTION_ORDER } from '../../../shared/site00-expression-engine/storyboardGateTypes.js';
import { seedChapter01Canon } from './chapterStore.js';
import { bootstrapB31FounderCreativeOverride } from './entry002B31Bootstrap.js';
import { compileEntry002LockedEntry } from './entry002Blueprint.js';
import { saveEntry } from './entryStore.js';
import { buildEntry002BlockingStoryboardRetirement } from './entry002BlockingStoryboardRetirement.js';
import { buildEntry002PreStoryboardKeyframeStatuses } from './entry002PreStoryboardKeyframes.js';
import { buildEntry002ReelTreatmentAuthority } from './entry002ReelTreatment.js';
import { buildEntry002ReelStoryboardAuthorityRecord } from './entry002StoryboardAuthority.js';
import { runStoryboardAuthorityQA } from './storyboardAuthorityQA.js';
import {
  dispatchAllEntry002StructuralStoryboardBoards,
  mergeBoardRasterResults,
} from './storyboardAuthorityDispatch.js';
import { buildEntry002StructuralStoryboardBoards } from './storyboardBoardPlanner.js';
import {
  buildFounderBoardReviewSlots,
  summarizeFounderStoryboardReview,
} from './storyboardFounderJudgment.js';
import { buildEntry002PreStoryboardVisualAuthorities } from './entry002PreStoryboardVisualAuthorities.js';
import { buildEntry002PreStoryboardVisualAuthorityPack } from './entry002PreStoryboardAuthorityRecord.js';
import { buildEntry002PipelineReconciliationState, ENTRY_002_ACTIVE_NEXT_ACTION } from './entry002PipelineState.js';
import { buildEntry002FounderReviewGatesForPipeline, buildEntry002PreStoryboardAuthorityGate, buildEntry002StructuralStoryboardGate } from './entry002ReelProductionGates.js';
import { previewKeyframeCompilationBlocked } from './storyboardToKeyframeCompiler.js';
import { listGenerationReceiptsForEntry } from './lineageRegistration.js';
import { STRUCTURAL_STORYBOARD_STAGE_LABEL } from './storyboardAuthorityDispatch.js';

export async function bootstrapB46Entry002StoryboardGate(options?: {
  dispatchFal?: boolean;
  forceDispatch?: boolean;
}): Promise<Entry002StoryboardGateBootstrapResult & {
  founderReviewSlots: ReturnType<typeof buildFounderBoardReviewSlots>;
  founderReviewSummary: ReturnType<typeof summarizeFounderStoryboardReview>;
  structuralStoryboardGate: ReturnType<typeof buildEntry002StructuralStoryboardGate>;
  founderGates: ReturnType<typeof buildEntry002FounderReviewGatesForPipeline>;
  boardVisuals: Awaited<ReturnType<typeof dispatchAllEntry002StructuralStoryboardBoards>>;
  keyframeCompilationBlocked: ReturnType<typeof previewKeyframeCompilationBlocked>;
  pipelineState: ReturnType<typeof buildEntry002PipelineReconciliationState>;
  preStoryboardAuthorityPack: ReturnType<typeof buildEntry002PreStoryboardVisualAuthorityPack>;
  preStoryboardGate: ReturnType<typeof buildEntry002PreStoryboardAuthorityGate>;
}> {
  process.env.EXPRESSION_ENGINE_MEMORY_STORE = process.env.EXPRESSION_ENGINE_MEMORY_STORE ?? '1';
  seedChapter01Canon();
  await bootstrapB31FounderCreativeOverride();
  saveEntry(compileEntry002LockedEntry());

  const dispatchFal = options?.dispatchFal ?? Boolean(process.env.FAL_KEY?.trim());
  const treatment = buildEntry002ReelTreatmentAuthority();
  const preStoryboardAuthorities = buildEntry002PreStoryboardVisualAuthorities();
  const preStoryboardAuthorityPack = buildEntry002PreStoryboardVisualAuthorityPack(preStoryboardAuthorities);
  const baseBoards = buildEntry002StructuralStoryboardBoards();
  const boardResults = await dispatchAllEntry002StructuralStoryboardBoards(baseBoards, {
    dispatchFal,
    forceDispatch: options?.forceDispatch,
  });
  const boards = mergeBoardRasterResults(baseBoards, boardResults);
  const storyboardAuthority = buildEntry002ReelStoryboardAuthorityRecord(boards);
  const qa = runStoryboardAuthorityQA(treatment, storyboardAuthority);

  if (!qa.passed) {
    throw new Error(`B4.6 structural storyboard QA failed: ${qa.blockers.join('; ')}`);
  }

  const preStoryboardKeyframes = buildEntry002PreStoryboardKeyframeStatuses();
  const blockingStoryboardRetirement = buildEntry002BlockingStoryboardRetirement();
  const founderReviewSlots = buildFounderBoardReviewSlots(boards);
  const founderReviewSummary = summarizeFounderStoryboardReview(boards);
  const preStoryboardGate = buildEntry002PreStoryboardAuthorityGate(preStoryboardAuthorityPack.approvalState);
  const pipelineState = buildEntry002PipelineReconciliationState({
    preStoryboardApproval: preStoryboardAuthorityPack.approvalState,
  });
  const founderGates = buildEntry002FounderReviewGatesForPipeline(preStoryboardAuthorityPack.approvalState);
  const structuralStoryboardGate = buildEntry002StructuralStoryboardGate(
    storyboardAuthority.approvalState,
    preStoryboardAuthorityPack.approvalState,
  );
  const keyframeCompilationBlocked = previewKeyframeCompilationBlocked(storyboardAuthority.approvalState);

  const receipts = listGenerationReceiptsForEntry('entry-002');
  const structuralBoardGenerations =
    receipts.filter((r) => r.promptLineage.includes(STRUCTURAL_STORYBOARD_STAGE_LABEL)).length ||
    boardResults.filter((b) => b.status === 'DISPATCHED' || b.status === 'CACHED').length;

  return {
    sprint: 'B4.6_ENTRY_002_STORYBOARD_GATE_REEL_TREATMENT',
    productionOrder: STORYBOARD_GATED_PRODUCTION_ORDER,
    currentStateAudit: {
      coverAnchorApproved: true,
      preStoryboardKeyframes: 'NON_CANON',
      b44SketchStoryboard: 'REFERENCE_ONLY',
      b45CinematicSequence: 'PRE_AUTHORITY_EXPERIMENT',
      preStoryboardVisualAuthorities: 'ACTIVE',
      structuralStoryboardAuthority: 'BLOCKED_PENDING_PRE_STORYBOARD_AUTHORITY_APPROVAL',
    },
    storyCorrection: {
      coreStory: treatment.coreStory,
      sameWomanRule: treatment.characterRoles.subjectWoman,
      ndxRole: treatment.characterRoles.ndx,
    },
    treatment,
    storyboardAuthority,
    qa,
    blockingRules: {
      keyframeGeneration: 'BLOCKED_PENDING_PRE_STORYBOARD_AND_STORYBOARD_APPROVAL',
      motionGeneration: 'BLOCKED',
      kling: 'BLOCKED',
      roughCut: 'BLOCKED',
      videoDispatch: 'BLOCKED',
    },
    nextAction: ENTRY_002_ACTIVE_NEXT_ACTION,
    preStoryboardAuthorityPack,
    preStoryboardGate,
    pipelineState,
    founderReviewSlots,
    founderReviewSummary,
    structuralStoryboardGate,
    founderGates,
    boardVisuals: boardResults,
    keyframeCompilationBlocked,
    telemetry: {
      structuralBoardGenerations,
      preStoryboardKeyframeCount: preStoryboardKeyframes.length,
      b44Retired: blockingStoryboardRetirement.status,
    },
  };
}

export { bootstrapB46Entry002StoryboardGate as bootstrapB46 };
