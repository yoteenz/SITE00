/**
 * Asset completeness gate — blocks HIGH_MATCH / VERIFIED when assets wrong.
 * P0.VR.6R6
 */

import type { RriFailureCode } from './types.js';

export type ReferenceAssetCompletenessGate = {
  requiredAssetMismatchCount: number;
  acceptedAsIsCount: number;
  blocked: boolean;
  failureCode: RriFailureCode | null;
};

export function evaluateAssetCompletenessGate(input: {
  requiredAssetMismatchCount: number;
  acceptedAsIsSlots?: string[];
  acceptAsIsCount?: number;
}): ReferenceAssetCompletenessGate {
  const accepted = input.acceptAsIsCount ?? input.acceptedAsIsSlots?.length ?? 0;
  const remaining = Math.max(0, input.requiredAssetMismatchCount - accepted);

  if (remaining > 0) {
    return {
      requiredAssetMismatchCount: remaining,
      acceptedAsIsCount: accepted,
      blocked: true,
      failureCode: 'REFERENCE_ASSET_COMPLETENESS_FAILED',
    };
  }

  return {
    requiredAssetMismatchCount: 0,
    acceptedAsIsCount: accepted,
    blocked: false,
    failureCode: null,
  };
}
