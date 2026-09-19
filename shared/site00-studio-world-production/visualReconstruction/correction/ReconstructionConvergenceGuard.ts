/**
 * Detect plateau, regression, oscillation in reconstruction loop.
 */

import type { ConvergenceTrend, RenderedReferenceComparison } from '../types.js';

export type ConvergenceHistory = {
  scores: number[];
  iterations: number[];
};

export function evaluateConvergence(history: ConvergenceHistory): ConvergenceTrend {
  const { scores } = history;
  if (scores.length < 2) return 'improving';

  const last = scores[scores.length - 1]!;
  const prev = scores[scores.length - 2]!;
  const delta = last - prev;

  if (delta < -0.01) return 'regression';

  if (scores.length >= 4) {
    const a = scores[scores.length - 3]!;
    const b = scores[scores.length - 2]!;
    const c = scores[scores.length - 1]!;
    if ((b > a && c < b) || (b < a && c > b)) return 'oscillation';
  }

  if (Math.abs(delta) < 0.002) return 'plateau';
  return 'improving';
}

export function shouldStopForPlateau(
  trend: ConvergenceTrend,
  iteration: number,
  minIterations = 3,
): boolean {
  return iteration >= minIterations && (trend === 'plateau' || trend === 'oscillation');
}

export function scoreFromComparison(comparison: RenderedReferenceComparison): number {
  return comparison.structuralSimilarity;
}
