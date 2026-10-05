/**
 * Founder perceptual QA — human taste calibration signal (does not mutate canon).
 */

import type { FounderPerceptualEvaluation, FounderPerceptualJudgment } from '../types.js';

export function createFounderPerceptualEvaluation(
  judgment: FounderPerceptualJudgment | null = null,
): FounderPerceptualEvaluation {
  return {
    judgment,
    reasons: [],
    notes: null,
    recordedAt: judgment ? new Date().toISOString() : null,
  };
}

export function recordFounderPerceptualEvaluation(
  current: FounderPerceptualEvaluation,
  input: {
    judgment: FounderPerceptualJudgment;
    reasons?: FounderPerceptualEvaluation['reasons'];
    notes?: string;
  },
): FounderPerceptualEvaluation {
  return {
    judgment: input.judgment,
    reasons: input.reasons ?? current.reasons,
    notes: input.notes ?? current.notes,
    recordedAt: new Date().toISOString(),
  };
}
