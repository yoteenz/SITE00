/**
 * P0.VR.DIAG.1R5B — Founder-facing structure failure copy (technical codes in details only).
 */

import type { EvidenceRecoveryFailureCode } from './types.js';

export function founderMessageForFailureCode(
  code: EvidenceRecoveryFailureCode,
  regionName: string,
): { headline: string; action: string; detailCode: EvidenceRecoveryFailureCode } {
  const upper = regionName.toUpperCase();
  switch (code) {
    case 'DOM_CHILDREN_UNRESOLVED':
      if (upper.includes('ACTIVITY') || upper.includes('FOCUS')) {
        return {
          headline: 'We found the activity region, but could not identify its rows.',
          action: 'ANALYZE STRUCTURE',
          detailCode: code,
        };
      }
      if (upper.includes('NAV')) {
        return {
          headline: 'We found the section nav, but its individual items have not been resolved.',
          action: 'ANALYZE STRUCTURE',
          detailCode: code,
        };
      }
      return {
        headline: 'We found the region container, but internal layout units are still unresolved.',
        action: 'ANALYZE STRUCTURE',
        detailCode: code,
      };
    case 'REGION_TYPE_AMBIGUOUS':
      return {
        headline: 'We found the metric region, but its internal type is ambiguous.',
        action: 'REVIEW STRUCTURE TYPE',
        detailCode: code,
      };
    case 'AUTHORITY_ANCHORS_UNRESOLVED':
      return {
        headline: 'Current structure resolved, but authority internal anchors are still missing.',
        action: 'AUTHORITY CV ANCHORS REQUIRED',
        detailCode: code,
      };
    case 'CAPTURE_SCOPE_INSUFFICIENT':
      return {
        headline: 'This region is outside the current capture scope.',
        action: 'RECAPTURE WITH FULL PAGE HEIGHT',
        detailCode: code,
      };
    default:
      return {
        headline: 'Internal structure could not be fully resolved from available evidence.',
        action: 'ANALYZE STRUCTURE',
        detailCode: code,
      };
  }
}

export function founderMessageForProgressBand(): string {
  return 'We found the progress band, but its track / phase internals are incomplete.';
}
