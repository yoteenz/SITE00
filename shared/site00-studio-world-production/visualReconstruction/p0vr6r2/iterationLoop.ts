/**
 * P0.VR.6R2 — Iterative convergence loop with max iteration policy.
 */

import {
  applyCorrectionIteration,
  buildVisualCorrectionPlan,
  evaluateConvergence,
  measureReferenceDelta,
  recaptureLiveTarget,
  runConvergenceComparison,
} from './convergenceEngine.js';
import { appendSessionHistory, getComparisonSession, patchComparisonSession } from './sessionStore.js';
import type { DesignReferenceComparisonSession } from './types.js';

export type ConvergenceLoopResult = {
  session: DesignReferenceComparisonSession;
  stoppedReason: 'CONVERGED' | 'MAX_ITERATIONS' | 'ASSET_CORRECTION_REQUIRED' | 'FOUNDER_REVIEW';
  iterationsRun: number;
};

export function runAutomaticConvergenceLoop(input: {
  sessionId: string;
  referencePath: string;
  livePath: string;
  liveWidth: number;
  liveHeight: number;
  liveGeometryHints?: Parameters<typeof measureReferenceDelta>[1];
  applyCorrectionFn?: (plan: NonNullable<DesignReferenceComparisonSession['latestCorrectionPlan']>) => void;
}): ConvergenceLoopResult | null {
  let session = getComparisonSession(input.sessionId);
  if (!session) return null;

  let iterationsRun = 0;

  while (iterationsRun < session.maxAutomaticIterations) {
    session = runConvergenceComparison({
      session,
      referencePath: input.referencePath,
      livePath: input.livePath,
      liveWidth: input.liveWidth,
      liveHeight: input.liveHeight,
      liveGeometryHints: input.liveGeometryHints,
    });
    iterationsRun += 1;

    const evaluation = evaluateConvergence(session);
    if (evaluation.canAutoVerify) {
      return { session, stoppedReason: 'CONVERGED', iterationsRun };
    }

    const plan = session.latestCorrectionPlan;
    if (!plan || plan.corrections.length === 0) {
      if (evaluation.maxIterationsReached) {
        appendSessionHistory(session.sessionId, 'DRIFT_DETECTED', 'VISUAL_MAX_ITERATIONS_REACHED');
        return { session, stoppedReason: 'MAX_ITERATIONS', iterationsRun };
      }
      break;
    }

    const applied = applyCorrectionIteration(session, plan);
    session = applied.session;

    if (applied.assetCorrectionRequired) {
      return { session, stoppedReason: 'ASSET_CORRECTION_REQUIRED', iterationsRun };
    }

    if (input.applyCorrectionFn && plan.status !== 'BLOCKED') {
      input.applyCorrectionFn(plan);
    }

    session = recaptureLiveTarget(session, input.livePath);
  }

  const finalEval = evaluateConvergence(session);
  if (finalEval.maxIterationsReached) {
    session = patchComparisonSession(session.sessionId, { status: 'FOUNDER_REVIEW_REQUIRED' })!;
    return { session, stoppedReason: 'MAX_ITERATIONS', iterationsRun };
  }

  if (session.latestCorrectionPlan?.requiresFounderInput) {
    return { session, stoppedReason: 'FOUNDER_REVIEW', iterationsRun };
  }

  return { session, stoppedReason: 'FOUNDER_REVIEW', iterationsRun };
}

export function recompareAfterCorrection(input: {
  sessionId: string;
  referencePath: string;
  livePath: string;
  liveWidth: number;
  liveHeight: number;
  liveGeometryHints?: Parameters<typeof measureReferenceDelta>[1];
}): DesignReferenceComparisonSession | null {
  const session = getComparisonSession(input.sessionId);
  if (!session) return null;

  const deltas = measureReferenceDelta(session, input.liveGeometryHints);
  const plan = buildVisualCorrectionPlan({ session, deltas });
  const evaluation = evaluateConvergence({ ...session, latestDeltas: deltas });

  return patchComparisonSession(session.sessionId, {
    latestDeltas: deltas,
    latestCorrectionPlan: plan,
    status: evaluation.status,
  });
}
