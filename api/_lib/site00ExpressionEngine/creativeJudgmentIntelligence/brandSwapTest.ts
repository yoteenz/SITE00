/**
 * BrandSwapTest — logo/color/name swap genericity gate.
 */

import type {
  BrandSwapTestResult,
  CreativeJudgmentInput,
} from '../../../../shared/site00-expression-engine/creative-judgment-intelligence/types.js';

const SWAPPABLE_BRANDS = ['ndxbook', 'astral-world', 'frontal-slayer', 'aio', 'studio-world', 'verdant-row'];

export function runBrandSwapTest(input: CreativeJudgmentInput): BrandSwapTestResult {
  const t = input.territory;
  const combined = `${t.conceptName} ${t.oneSentenceIdea} ${t.argument} ${t.visualWorld}`.toLowerCase();

  const swappable: string[] = [];
  for (const brand of SWAPPABLE_BRANDS) {
    if (brand === input.brandId) continue;
    const brandSpecific =
      (brand === 'ndxbook' && (combined.includes('door') || combined.includes('culture') || combined.includes('camera'))) ||
      (brand === 'verdant-row' && (combined.includes('leaf') || combined.includes('plant') || combined.includes('confession'))) ||
      (brand === 'astral-world' && combined.includes('mystic'));
    if (!brandSpecific) swappable.push(brand);
  }

  const passed = swappable.length < SWAPPABLE_BRANDS.length - 2;
  return {
    passed,
    swappableBrands: swappable,
    failureClass: passed ? null : 'BRAND_GENERICITY',
    rationale: passed
      ? 'Campaign mechanism/world tied to source brand'
      : 'Campaign could swap brand name/logo/color only',
  };
}
