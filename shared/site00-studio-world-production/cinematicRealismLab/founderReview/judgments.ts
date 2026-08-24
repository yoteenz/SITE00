/**
 * Founder review judgment helpers.
 */

import type { RealismFounderJudgment, RealismLaneRun } from '../types.js';
import { applyFounderJudgmentToEvaluation } from '../realismEvaluation/evaluation.js';

export const FOUNDER_JUDGMENT_LABELS: Record<RealismFounderJudgment, string> = {
  THIS_FEELS_REAL: 'THIS FEELS REAL',
  CLOSE_BUT_OFF: 'CLOSE BUT OFF',
  TOO_AI: 'TOO AI',
  BEST_IN_CLASS: 'BEST IN CLASS',
  BEST_FACE: 'BEST FACE',
  BEST_MOTION: 'BEST MOTION',
  BEST_LIGHTING: 'BEST LIGHTING',
  BEST_SCENE: 'BEST SCENE',
  KEEP_AS_BENCHMARK: 'KEEP AS BENCHMARK',
  REJECT: 'REJECT',
};

export function applyJudgmentToLaneRun(run: RealismLaneRun, assetId: string, judgment: RealismFounderJudgment): RealismLaneRun {
  const evaluation = run.evaluation ?? {
    evaluationId: `eval-${assetId}`,
    assetId,
    scores: {},
    failures: [],
    systemNotes: [],
    evaluatedAt: new Date().toISOString(),
    founderJudgment: null,
  };
  return {
    ...run,
    evaluation: applyFounderJudgmentToEvaluation(evaluation, judgment),
    founderJudgments: [...run.founderJudgments, { judgment, assetId, at: new Date().toISOString() }],
    updatedAt: new Date().toISOString(),
  };
}

export function summarizeLaneJudgments(runs: RealismLaneRun[]): Record<RealismFounderJudgment, number> {
  const counts = Object.fromEntries(
    (Object.keys(FOUNDER_JUDGMENT_LABELS) as RealismFounderJudgment[]).map((j) => [j, 0]),
  ) as Record<RealismFounderJudgment, number>;
  for (const run of runs) {
    for (const j of run.founderJudgments) {
      counts[j.judgment] += 1;
    }
  }
  return counts;
}
