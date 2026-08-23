/**
 * Founder-facing presentation rules for replay methodology comparison scores.
 */

import type { ReplayConvergenceReport, ReplayConvergenceScoreValue } from './personalityReplayTypes.js';

export function isLegacyInvalidComparisonReport(report: ReplayConvergenceReport): boolean {
  if (report.legacyInvalidComparison === true) return true;
  const s = report.scores;
  if (
    s.creativeConvergence === 'NOT_EVALUATED' ||
    s.identityConvergence === 'NOT_EVALUATED' ||
    s.heroConvergence === 'NOT_EVALUATED'
  ) {
    return false;
  }
  return s.creativeConvergence === 0 && s.identityConvergence === 0 && s.heroConvergence === 0;
}

export function formatConvergenceScore(value: ReplayConvergenceScoreValue | undefined): string {
  if (value === 'NOT_EVALUATED') return 'NOT EVALUATED';
  if (value === 'NEEDS_HUMAN_REVIEW') return 'NEEDS HUMAN REVIEW';
  if (typeof value === 'number') return `${value}/5`;
  return 'NOT EVALUATED';
}

export function methodologyVerdictFromReport(report: ReplayConvergenceReport | null | undefined): string | null {
  if (!report) return null;
  if (isLegacyInvalidComparisonReport(report)) {
    return 'LEGACY INVALID COMPARISON — stub scorers produced 0/5; not an authoritative methodology judgment';
  }
  const personality = report.scores.personalityConvergence;
  if (personality === 'NOT_EVALUATED' || personality === 'NEEDS_HUMAN_REVIEW') {
    return 'METHODOLOGY COMPARISON INCOMPLETE — awaiting semantic evaluation';
  }
  if (typeof personality !== 'number') return null;
  if (personality >= 4) return 'PIPELINE VALIDATED';
  if (personality >= 2.5) return 'PARTIAL — REVIEW DIVERGENCE';
  return 'DIVERGENCE DETECTED — review personality domains';
}
