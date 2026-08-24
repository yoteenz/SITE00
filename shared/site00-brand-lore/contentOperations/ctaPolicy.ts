/**
 * CTA policy — sometimes NONE is most NDX.
 */

import type { ContentCTAPolicy, CtaOption } from './types.js';
import type { ContentFormat } from './types.js';

export function buildContentCTA(params: {
  packageId: string;
  format: ContentFormat;
  resolution: string;
}): ContentCTAPolicy {
  let cta: CtaOption = 'NONE';
  const reasoning: string[] = [];

  if (params.format === 'CAROUSEL') {
    cta = 'SWIPE';
    reasoning.push('Carousel — swipe to investigate');
  } else if (params.resolution === 'QUESTION_OPEN') {
    cta = 'QUESTION';
    reasoning.push('Open question — invite response without generic "what do you think?"');
  } else if (params.resolution === 'INVESTIGATION_IN_PROGRESS') {
    cta = 'COME_BACK_FOR_PART_2';
    reasoning.push('Investigation ongoing — callback CTA');
  } else if (params.resolution === 'CALLBACK') {
    cta = 'TELL_US_IF_YOU_REMEMBER';
    reasoning.push('Receipt/callback behavior');
  } else {
    reasoning.push('No CTA — first slide does the work');
  }

  return { packageId: params.packageId, cta, reasoning: reasoning.join(' ') };
}

export function ctaMayBeNone(cta: CtaOption): boolean {
  return cta === 'NONE';
}
