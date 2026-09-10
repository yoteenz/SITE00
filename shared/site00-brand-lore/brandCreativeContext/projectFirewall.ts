/**
 * P0.CBI.1 — Project firewall — no cross-brand context leakage.
 */

import { normalizeBrandId } from './constants.js';
import type { BrandCreativeContext } from './types.js';

const CROSS_BRAND_FORBIDDEN: Record<string, string[]> = {
  'frontal-slayer': ['ndxbook cultural grammar', 'site-00 host expression', 'aio operational grammar'],
  ndxbook: ['frontal-slayer hair/beauty', 'luxury hair brand', 'salon-at-home', 'mansion hair'],
  'site-00': ['client brand canon as host', 'ndxbook editorial as host'],
  aio: ['ndxbook editorial', 'frontal slayer beauty', 'astral magical'],
  'astral-world': ['frontal slayer', 'trucking', 'ndxbook receipt logic'],
};

export function assertProjectFirewall(
  context: BrandCreativeContext,
  targetBrandId: string,
): { pass: boolean; violations: string[] } {
  const expected = normalizeBrandId(targetBrandId);
  const actual = normalizeBrandId(context.brandId);
  const violations: string[] = [];

  if (actual !== expected) {
    violations.push(`Context brand ${actual} does not match target ${expected}`);
  }

  const forbidden = CROSS_BRAND_FORBIDDEN[expected] ?? [];
  const blob = JSON.stringify(context).toLowerCase();
  for (const phrase of forbidden) {
    if (blob.includes(phrase.toLowerCase())) {
      violations.push(`Cross-brand leakage detected: "${phrase}"`);
    }
  }

  return { pass: violations.length === 0, violations };
}

export function filterOffersForBrand(
  context: BrandCreativeContext,
  selectedOfferIds: string[],
): BrandCreativeContext['offers'] {
  return context.offers.filter(
    (o) =>
      selectedOfferIds.includes(o.offerId) &&
      o.campaignEligible &&
      o.status !== 'DISCONTINUED' &&
      o.status !== 'DEFERRED',
  );
}
