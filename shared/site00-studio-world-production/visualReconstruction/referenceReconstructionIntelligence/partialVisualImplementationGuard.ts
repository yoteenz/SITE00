/**
 * Partial visual implementation guard — detects subset-only fixes.
 * P0.VR.6R6
 */

import type { RriFailureCode } from './types.js';

export const PARTIAL_VISUAL_FAILURE_CODE = 'REFERENCE_PARTIAL_VISUAL_IMPLEMENTATION' as const;

export function evaluatePartialVisualImplementationGuard(input: {
  totalSignificantMismatches: number;
  resolvedMismatches: number;
  claimsConvergenceComplete: boolean;
  minimumResolutionRatio?: number;
}): {
  pass: boolean;
  failureCode: RriFailureCode | null;
  resolutionRatio: number;
} {
  const minRatio = input.minimumResolutionRatio ?? 0.8;
  if (input.totalSignificantMismatches === 0) {
    return { pass: true, failureCode: null, resolutionRatio: 1 };
  }

  const resolutionRatio = input.resolvedMismatches / input.totalSignificantMismatches;

  if (input.claimsConvergenceComplete && resolutionRatio < minRatio) {
    return { pass: false, failureCode: PARTIAL_VISUAL_FAILURE_CODE, resolutionRatio };
  }

  if (input.totalSignificantMismatches >= 3 && input.resolvedMismatches === 1 && input.claimsConvergenceComplete) {
    return { pass: false, failureCode: PARTIAL_VISUAL_FAILURE_CODE, resolutionRatio };
  }

  return { pass: true, failureCode: null, resolutionRatio };
}
