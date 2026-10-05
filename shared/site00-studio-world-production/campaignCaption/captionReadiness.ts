/**
 * Caption readiness — do not synthesize before sequence is sufficiently locked.
 */

import { randomUUID } from 'node:crypto';
import type { CaptionReadinessEvaluation, CaptionReadinessState } from './types.js';

export function evaluateCaptionReadiness(params: {
  contentPieceId: string;
  lockedSlideCount: number;
  requiredSlideCount: number;
  generatedSlideCount?: number;
  contentIntelligenceApproved?: boolean;
}): CaptionReadinessEvaluation {
  let state: CaptionReadinessState = 'NOT_READY';
  let reason: string | null = null;
  const generated = params.generatedSlideCount ?? params.lockedSlideCount;

  if (params.lockedSlideCount >= params.requiredSlideCount) {
    state = 'FINAL_CAPTION_READY';
  } else if (generated >= 1 && params.contentIntelligenceApproved !== false) {
    state = generated >= params.requiredSlideCount ? 'FINAL_CAPTION_READY' : 'DRAFT_ELIGIBLE';
    reason =
      params.lockedSlideCount >= params.requiredSlideCount
        ? null
        : 'Slides generated — draft caption allowed; lock sequence for final caption';
  } else {
    reason = 'Sequence not sufficiently ready for caption synthesis';
  }

  return {
    evaluationId: randomUUID(),
    contentPieceId: params.contentPieceId,
    state,
    lockedSlideCount: params.lockedSlideCount,
    requiredSlideCount: params.requiredSlideCount,
    reason,
  };
}

export function captionCannotFinalizeBeforeSequenceReadiness(state: CaptionReadinessState): boolean {
  return state === 'NOT_READY';
}

export function captionCanDraftAfterDraftEligible(state: CaptionReadinessState): boolean {
  return state === 'DRAFT_ELIGIBLE' || state === 'FINAL_CAPTION_READY';
}

export function visualOnlyRevisionNeedNotStaleCaption(revisionReason: string): boolean {
  return revisionReason === 'VISUAL_ONLY';
}

export function meaningfulSlideRevisionStalesCaption(revisionReason: string): boolean {
  return revisionReason === 'MEANING_CHANGE' || revisionReason === 'STALE_CONTEXT';
}
