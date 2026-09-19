/**
 * CreativeSelfRevisionLoop — generate → judge → revise → re-score.
 */

import type {
  CreativeJudgmentInput,
  CreativeSelfRevisionResult,
  CreativeJudgmentFailureClass,
} from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';
import { REVISION_TARGETS_BY_FAILURE } from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/failureClasses.js';
import { runCreativeJudgmentIntelligence } from './creativeJudgmentIntelligenceEngine.js';

export const DEFAULT_MAX_AUTONOMOUS_REVISIONS = 2;

export function runCreativeSelfRevisionLoop(
  input: CreativeJudgmentInput,
  maxPasses = DEFAULT_MAX_AUTONOMOUS_REVISIONS,
): CreativeSelfRevisionResult {
  const passes: CreativeSelfRevisionResult['passes'] = [];
  let currentInput = { ...input };
  let lastJudgment = runCreativeJudgmentIntelligence(currentInput);
  let stopped = false;
  let stopReason: string | null = null;
  const seenWeaknesses = new Set<string>();

  for (let pass = 1; pass <= maxPasses; pass++) {
    if (lastJudgment.decision === 'ADVANCE' || lastJudgment.decision === 'ESCALATE_TO_FOUNDER') {
      stopped = true;
      stopReason = lastJudgment.decision === 'ADVANCE' ? 'SCORE THRESHOLD PASSED' : 'FOUNDER REVIEW REQUIRED';
      break;
    }
    if (lastJudgment.decision === 'KILL') {
      stopped = true;
      stopReason = 'TERRITORY KILLED';
      break;
    }

    const primaryFailure = lastJudgment.failureClasses[0] as CreativeJudgmentFailureClass | undefined;
    if (!primaryFailure) break;

    if (seenWeaknesses.has(primaryFailure)) {
      stopped = true;
      stopReason = 'SAME WEAKNESS REPEATS TWICE';
      break;
    }
    seenWeaknesses.add(primaryFailure);

    const beforeScore = lastJudgment.overallScore;
    currentInput = applyRevisionTarget(currentInput, primaryFailure);
    const nextJudgment = runCreativeJudgmentIntelligence(currentInput);

    passes.push({
      passNumber: pass,
      failureClasses: lastJudgment.failureClasses,
      revisionTarget: REVISION_TARGETS_BY_FAILURE[primaryFailure] ?? 'TARGETED_REVISION',
      beforeScore,
      afterScore: nextJudgment.overallScore,
      stoppedReason: null,
    });

    if (nextJudgment.brandFidelityScore < lastJudgment.brandFidelityScore - 5) {
      stopped = true;
      stopReason = 'BRAND FIDELITY DECREASED';
      lastJudgment = nextJudgment;
      break;
    }

    lastJudgment = nextJudgment;
  }

  if (!stopped && passes.length >= maxPasses) {
    stopped = true;
    stopReason = 'MAX AUTONOMOUS REVISIONS REACHED';
  }

  return {
    revisionId: `revision-${Date.now()}`,
    passes,
    finalJudgment: lastJudgment,
    stopped,
    stopReason,
  };
}

function applyRevisionTarget(input: CreativeJudgmentInput, failure: CreativeJudgmentFailureClass): CreativeJudgmentInput {
  const t = { ...input.territory };
  if (failure === 'TOO_SAFE' || failure === 'OBVIOUS_FIRST_ANSWER') {
    t.mechanism = `${t.mechanism} → sharpened non-obvious turn`;
    t.oneSentenceIdea = `${t.oneSentenceIdea} — with accountable twist`;
  } else if (failure === 'WRONG_MECHANISM' || failure === 'WEAK_MECHANISM' || failure === 'TOO_GENERIC') {
    t.mechanism = 'REBUILT: tension → behavior → receipt';
    t.argument = `${t.argument} — mechanism rebuilt`;
  } else if (failure === 'CHANNEL_DUPLICATION' || failure === 'RESIZE_ONLY_THINKING') {
    t.channelTreatmentHash = 'reel-hook|carousel-evidence|story-intimacy|email-persuasion|distinct';
  } else if (failure === 'NDX_LEAK' || failure === 'BRAND_DRIFT') {
    t.oneSentenceIdea = t.oneSentenceIdea.replace(/cultural|editorial|camera/gi, '').trim();
  }
  return { ...input, territory: t };
}
