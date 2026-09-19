/**
 * C1.9R1 — Category cliché QA for fragrance / luxury copy.
 */

import type { BrandLanguageFailureClass } from '../../../shared/site00-expression-engine/brand-language/types.js';

const FRAGRANCE_LUXURY_CLICHES = [
  'ritual',
  'dusk',
  'threshold',
  'golden hour',
  'memory',
  'desire',
  'private',
  'sensual',
  'architecture',
  'room',
  'skin',
  'velvet',
  'after dark',
  'timeless elegance',
  'elevate your',
  'indulge',
  'luxury redefined',
] as const;

export type CategoryClicheQA = {
  passed: boolean;
  failureClasses: BrandLanguageFailureClass[];
  clicheHits: string[];
  interchangeableShorthandCount: number;
  explanation: string;
};

function countClicheHits(text: string): string[] {
  const lower = text.toLowerCase();
  return FRAGRANCE_LUXURY_CLICHES.filter((word) => {
    const re = new RegExp(`\\b${word.replace(/\s+/g, '\\s+')}\\b`, 'i');
    return re.test(lower);
  });
}

export function evaluateCategoryClicheRisk(
  captions: string[],
  brandEarnedTerms: string[] = [],
): CategoryClicheQA {
  const hits = new Set<string>();
  for (const caption of captions) {
    for (const hit of countClicheHits(caption)) hits.add(hit);
  }

  const earned = new Set(brandEarnedTerms.map((t) => t.toLowerCase()));
  const unearned = [...hits].filter((h) => !earned.has(h.toLowerCase()));
  const interchangeable = unearned.length;

  const failureClasses: BrandLanguageFailureClass[] = [];
  if (interchangeable >= 4) {
    failureClasses.push('GENERIC_LUXURY_COPY');
  }

  return {
    passed: failureClasses.length === 0,
    failureClasses,
    clicheHits: [...hits],
    interchangeableShorthandCount: interchangeable,
    explanation:
      interchangeable >= 4
        ? 'Multiple luxury/fragrance shorthand terms function as interchangeable category language'
        : hits.size
          ? 'Some category terms present — evaluate whether uniquely earned for this brand'
          : 'No dominant category cliché cluster detected',
  };
}
