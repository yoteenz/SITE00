/**
 * Browser-safe Reel slot labels for Daily Plan / Campaign Board UI.
 */

import type { SecondReelEligibilityEvaluation } from './types.js';

export function formatSecondReelSlotLabel(evaluation: SecondReelEligibilityEvaluation | undefined): {
  reel01: string;
  reel02: string;
} {
  const reel01 = 'REEL 01 — DAILY TARGET';
  if (!evaluation) {
    return { reel01, reel02: 'REEL 02 — OPTIONAL — OPPORTUNITY TRIGGERED' };
  }
  if (evaluation.decision === 'SECOND_REEL_APPROVED') {
    return { reel01, reel02: `REEL 02 — APPROVED (${evaluation.opportunityReason ?? evaluation.eligibility})` };
  }
  if (evaluation.holdSlotEmpty || evaluation.eligibility === 'NOT_JUSTIFIED') {
    return { reel01, reel02: 'REEL 02 — HELD — NO STRONG OPPORTUNITY' };
  }
  return { reel01, reel02: 'REEL 02 — OPTIONAL — OPPORTUNITY TRIGGERED' };
}
