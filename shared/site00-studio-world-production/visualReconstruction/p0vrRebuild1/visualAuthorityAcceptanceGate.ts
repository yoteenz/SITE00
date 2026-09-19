/**
 * P0.VR.REBUILD.1 — Promotion blocked until visual authority accepted.
 */

import type {
  AuthorityCompositionCoverage,
  LegacyStructureRetentionCheck,
  VisualAuthorityAcceptanceGate,
  VisualAuthorityStatus,
} from './types.js';

export function evaluateVisualAuthorityAcceptanceGate(input: {
  visualAuthorityStatus: VisualAuthorityStatus;
  compositionCoverage: AuthorityCompositionCoverage;
  legacyCheck: LegacyStructureRetentionCheck;
  functionQaPass: boolean;
  founderApproved: boolean;
}): VisualAuthorityAcceptanceGate {
  const blockingReasons: string[] = [];

  if (
    input.visualAuthorityStatus === 'FAILED_VISUAL_AUTHORITY' ||
    input.visualAuthorityStatus === 'VISUAL_AUTHORITY_FAILED'
  ) {
    blockingReasons.push('VISUAL_AUTHORITY_FAILED');
  }
  if (input.compositionCoverage.status === 'FAIL') {
    blockingReasons.push(...input.compositionCoverage.flags);
  }
  if (input.legacyCheck.legacyDominates) {
    blockingReasons.push('LEGACY_COMPOSITION_RETAINED');
  }
  if (!input.functionQaPass) blockingReasons.push('FUNCTION_QA_FAILED');
  if (!input.founderApproved) blockingReasons.push('FOUNDER_VISUAL_APPROVAL_REQUIRED');

  const promotionAllowed =
    blockingReasons.length === 0 &&
    input.visualAuthorityStatus === 'AUTHORITY_FIRST_BUILT' &&
    input.compositionCoverage.status !== 'FAIL';

  return {
    compositionCoverage: input.compositionCoverage,
    legacyCheck: input.legacyCheck,
    functionQaPass: input.functionQaPass,
    founderApproved: input.founderApproved,
    promotionAllowed,
    blockingReasons,
  };
}
