/**
 * C1.8 — Cross-brand voice contamination QA.
 */

import type { BrandLanguageIdentity, BrandLanguageFailureClass } from '../../../shared/site00-expression-engine/brand-language/types.js';
import { MULTI_BRAND_BLIND_FIXTURES } from './multiBrandBlindFixtures.js';

const NDX_LEAK_PATTERNS = [
  /\breceipt\b/i,
  /\byou called\b/i,
  /\bthe .+ already told you\b/i,
  /\bcompetence theater\b/i,
  /\bcultural (indictment|receipt)\b/i,
  /\bhot take:\b/i,
  /\bconfession\b/i,
  /\bdiagnostic\b/i,
];

const GENERIC_LUXURY_CLICHES = [
  'timeless elegance',
  'elevate your experience',
  'indulge in luxury',
  'where sophistication meets',
];

export type CrossBrandVoiceContaminationQA = {
  passed: boolean;
  failureClasses: BrandLanguageFailureClass[];
  ndxbookVoiceLeak: boolean;
  couldBelongToAnyBrand: boolean;
  soundsLikeOtherBrand: boolean;
  brandSpecificityScore: number;
};

export function detectNdxbookVoiceLeak(caption: string, brandId: string): boolean {
  if (brandId === 'ndxbook') return false;
  return NDX_LEAK_PATTERNS.some((p) => p.test(caption));
}

export function detectGenericLuxuryCopy(caption: string): boolean {
  const lower = caption.toLowerCase();
  return GENERIC_LUXURY_CLICHES.some((c) => lower.includes(c));
}

export function captionCouldBelongToAnyBrand(caption: string, brandName: string): boolean {
  const stripped = caption.replace(new RegExp(brandName, 'gi'), '').trim();
  const genericSignals = [
    /^discover\b/i,
    /^shop now\b/i,
    /^new (collection|drop|launch)\b/i,
    /^introducing\b/i,
    /^we are excited\b/i,
  ];
  if (stripped.length < 20) return false;
  return genericSignals.some((p) => p.test(stripped)) && !/\b(tonight|velvet|jargon|sorry not sorry|consultation)\b/i.test(stripped);
}

export function evaluateCrossBrandVoiceContamination(
  caption: string,
  identity: BrandLanguageIdentity,
): CrossBrandVoiceContaminationQA {
  const failures: BrandLanguageFailureClass[] = [];
  const ndx = detectNdxbookVoiceLeak(caption, identity.brandId);
  if (ndx) failures.push('NDXBOOK_VOICE_LEAK');

  const anyBrand = captionCouldBelongToAnyBrand(caption, identity.brandName);
  if (anyBrand) failures.push('COPY_COULD_BELONG_TO_ANY_BRAND');

  let soundsLikeOther = false;
  for (const other of MULTI_BRAND_BLIND_FIXTURES) {
    if (other.brandId === identity.brandId) continue;
    const overlap = other.signatureLanguage.some((sig) =>
      caption.toLowerCase().includes(sig.toLowerCase().slice(0, 6)),
    );
    const antiHit = other.examplesOfInVoiceLanguage.some((ex) =>
      caption.toLowerCase().includes(ex.toLowerCase().slice(0, 12)),
    );
    if (overlap || antiHit) {
      soundsLikeOther = true;
      failures.push('COPY_SOUNDS_LIKE_OTHER_BRAND');
      failures.push('CROSS_BRAND_VOICE_CONTAMINATION');
      break;
    }
  }

  if (identity.luxuryLevel === 'high' && detectGenericLuxuryCopy(caption)) {
    failures.push('GENERIC_LUXURY_COPY');
  }

  if (identity.mysteryLevel === 'high' && caption.split(/\s+/).length > 25) {
    failures.push('OVEREXPLAINED_COOL_BRAND');
  }

  const specificity = Math.max(0, 100 - failures.length * 20);

  return {
    passed: failures.length === 0,
    failureClasses: failures,
    ndxbookVoiceLeak: ndx,
    couldBelongToAnyBrand: anyBrand,
    soundsLikeOtherBrand: soundsLikeOther,
    brandSpecificityScore: specificity,
  };
}

export function evaluateCrossBrandVoiceDistance(
  captionsByBrand: Record<string, string>,
): { passed: boolean; distances: Array<{ brandA: string; brandB: string; similarityScore: number; tooSimilar: boolean }>; failureClasses: BrandLanguageFailureClass[] } {
  const brands = Object.keys(captionsByBrand);
  const distances: Array<{ brandA: string; brandB: string; similarityScore: number; tooSimilar: boolean }> = [];
  const failures: BrandLanguageFailureClass[] = [];

  for (let i = 0; i < brands.length; i++) {
    for (let j = i + 1; j < brands.length; j++) {
      const a = captionsByBrand[brands[i]!]!.toLowerCase();
      const b = captionsByBrand[brands[j]!]!.toLowerCase();
      const wordsA = new Set(a.split(/\s+/).filter((w) => w.length > 4));
      const wordsB = b.split(/\s+/).filter((w) => w.length > 4);
      const overlap = wordsB.filter((w) => wordsA.has(w)).length;
      const similarity = overlap / Math.max(wordsA.size, wordsB.size, 1);
      const tooSimilar = similarity > 0.45;
      distances.push({ brandA: brands[i]!, brandB: brands[j]!, similarityScore: similarity, tooSimilar });
      if (tooSimilar) failures.push('BRAND_VOICE_COLLAPSE');
    }
  }

  return { passed: failures.length === 0, distances, failureClasses: [...new Set(failures)] };
}
