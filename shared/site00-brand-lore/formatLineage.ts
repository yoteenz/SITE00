/**
 * Format lineage — trace downstream format choices to upstream expression context + personality.
 */

import type { BrandExpressionContext } from './types.js';
import type { BrandPersonalityProfile } from './personalityTypes.js';
import type { FormatNativeExpressionProfile } from './formatNativeExpression.js';

export type FormatLineageEntry = {
  upstreamSource: string;
  upstreamValue: string;
  derivedFormatBehavior: string;
  targetFormat: string;
};

export function buildFormatLineage(params: {
  context: BrandExpressionContext;
  formatProfile: FormatNativeExpressionProfile;
  personality?: BrandPersonalityProfile | null;
}): FormatLineageEntry[] {
  const entries: FormatLineageEntry[] = [
    {
      upstreamSource: 'PrimaryExpressionContext',
      upstreamValue: params.context,
      derivedFormatBehavior: params.formatProfile.entryFormat,
      targetFormat: 'PRIMARY_ENTRY',
    },
    {
      upstreamSource: 'FormatNativeExpressionProfile',
      upstreamValue: params.formatProfile.primaryFormats.join(', '),
      derivedFormatBehavior: params.formatProfile.sequenceBehavior,
      targetFormat: 'SEQUENCE',
    },
  ];

  const wit = params.personality?.witBehavior.value;
  const correction = params.personality?.selfCorrectionBehavior.value;
  if (params.context === 'SOCIAL_FIRST_EDITORIAL' && wit) {
    entries.push({
      upstreamSource: 'witBehavior',
      upstreamValue: Array.isArray(wit) ? wit.join(', ') : String(wit),
      derivedFormatBehavior: 'carousel: statement → strike → replacement → evidence',
      targetFormat: 'CAROUSEL_SEQUENCE',
    });
  }
  if (params.context === 'SOCIAL_FIRST_EDITORIAL' && correction) {
    entries.push({
      upstreamSource: 'selfCorrectionBehavior',
      upstreamValue: Array.isArray(correction) ? correction.join(', ') : String(correction),
      derivedFormatBehavior: 'reel: clean statement → edit action → corrected truth',
      targetFormat: 'REEL_HOOK',
    });
  }

  return entries;
}
