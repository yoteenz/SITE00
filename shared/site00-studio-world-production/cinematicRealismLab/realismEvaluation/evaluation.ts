/**
 * Cinematic realism evaluation system.
 */

import { REALISM_EVALUATION_CATEGORIES } from '../constants.js';
import type { RealismEvaluation, RealismFailureCode, RealismFounderJudgment } from '../types.js';

export function createEmptyEvaluation(assetId: string): RealismEvaluation {
  const scores = Object.fromEntries(REALISM_EVALUATION_CATEGORIES.map((c) => [c, 0])) as Record<string, number>;
  return {
    evaluationId: `eval-${assetId}`,
    assetId,
    scores,
    failures: [],
    systemNotes: ['Awaiting founder perceptual judgment or provider output analysis.'],
    evaluatedAt: new Date().toISOString(),
    founderJudgment: null,
  };
}

export function applyFounderJudgmentToEvaluation(
  evaluation: RealismEvaluation,
  judgment: RealismFounderJudgment,
): RealismEvaluation {
  const failureBoost: RealismFailureCode[] =
    judgment === 'TOO_AI'
      ? ['FAIL_AI_GLOSS_OVERLOAD', 'FAIL_TOO_PERFECT_TO_BE_REAL']
      : judgment === 'CLOSE_BUT_OFF'
        ? ['FAIL_MOTION_RUBBERINESS']
        : [];

  const scoreBoost =
    judgment === 'THIS_FEELS_REAL' || judgment === 'BEST_IN_CLASS'
      ? 0.85
      : judgment === 'CLOSE_BUT_OFF'
        ? 0.65
        : judgment === 'TOO_AI'
          ? 0.25
          : 0.5;

  const scores = { ...evaluation.scores };
  for (const key of REALISM_EVALUATION_CATEGORIES) {
    scores[key] = Math.max(scores[key] ?? 0, scoreBoost);
  }
  if (judgment === 'BEST_FACE') scores.facePlausibility = 0.95;
  if (judgment === 'BEST_MOTION') scores.motionRealism = 0.95;
  if (judgment === 'BEST_LIGHTING') scores.lightingRealism = 0.95;
  if (judgment === 'BEST_SCENE') scores.environmentRealism = 0.95;

  return {
    ...evaluation,
    scores,
    failures: [...new Set([...evaluation.failures, ...failureBoost])],
    founderJudgment: judgment,
    evaluatedAt: new Date().toISOString(),
  };
}

export function aggregateProviderScore(evaluations: RealismEvaluation[]): number {
  if (!evaluations.length) return 0;
  const totals = evaluations.map((e) => {
    const vals = Object.values(e.scores);
    return vals.reduce((a, b) => a + b, 0) / Math.max(vals.length, 1);
  });
  return totals.reduce((a, b) => a + b, 0) / totals.length;
}

export function rankProvidersByCategory(
  runs: Array<{ providerId: string; evaluation: RealismEvaluation | null }>,
  category: keyof RealismEvaluation['scores'],
): string | null {
  let best: { providerId: string; score: number } | null = null;
  for (const run of runs) {
    const score = run.evaluation?.scores[category] ?? 0;
    if (!best || score > best.score) best = { providerId: run.providerId, score };
  }
  return best?.providerId ?? null;
}

export function detectSystemFailuresFromNotes(notes: string[]): RealismFailureCode[] {
  const failures: RealismFailureCode[] = [];
  const text = notes.join(' ').toLowerCase();
  if (text.includes('hand')) failures.push('FAIL_FLOATING_HANDS');
  if (text.includes('skin') || text.includes('plastic')) failures.push('FAIL_PLASTIC_SKIN');
  if (text.includes('eye')) failures.push('FAIL_DEAD_EYES');
  if (text.includes('motion') || text.includes('rubber')) failures.push('FAIL_MOTION_RUBBERINESS');
  return failures;
}
