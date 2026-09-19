/**
 * P0.CBI.1 — Source authority model + canonical brand slug normalization.
 */

import type { BrandContextSourceType } from './types.js';

/** Lower number = higher authority (Part II priority order). */
export const SOURCE_AUTHORITY_LEVEL: Record<BrandContextSourceType, number> = {
  PROJECT_IDENTITY: 1,
  PROJECT_BIBLE: 2,
  PARENT_EXPERIENCE: 3,
  PRODUCT_SERVICE: 4,
  APPROVED_CREATIVE: 5,
  CAMPAIGN_HISTORY: 6,
  FOUNDER_JUDGMENT: 7,
  APPROVED_REFERENCE: 8,
  PROJECT_LORE: 9,
  CAMPAIGN_INPUT: 10,
  CONTENT_BRAIN: 5,
  FOUNDER_OVERRIDE: 2,
  BRAND_FAMILY: 4,
  PROJECT_REGISTRY: 3,
};

export const KNOWN_BRAND_IDS = [
  'frontal-slayer',
  'ndxbook',
  'site-00',
  'aio',
  'all-in-one-enterprises',
  'astral-world',
] as const;

export type KnownBrandId = (typeof KNOWN_BRAND_IDS)[number];

/** Normalize project slug → canonical brandId for campaign context firewall. */
export function normalizeBrandId(slug: string): string {
  const key = slug.toLowerCase().trim();
  const map: Record<string, string> = {
    'frontal-slayer': 'frontal-slayer',
    fs: 'frontal-slayer',
    fsbw: 'frontal-slayer',
    ndxbook: 'ndxbook',
    'site-00': 'site-00',
    site00: 'site-00',
    aio: 'aio',
    'all-in-one-enterprises': 'aio',
    'astral-world': 'astral-world',
  };
  return map[key] ?? key;
}

export function projectIdForBrand(brandId: string): string {
  const map: Record<string, string> = {
    'frontal-slayer': 'frontal-slayer',
    ndxbook: 'ndxbook',
    'site-00': 'site00',
    aio: 'all-in-one-enterprises',
    'astral-world': 'astral-world',
  };
  return map[normalizeBrandId(brandId)] ?? brandId;
}

export const GENERIC_BRAND_PHRASES = [
  'luxury hair brand',
  'premium beauty for modern women',
  'premium beauty brand',
  'modern women',
  'confidence and beauty',
  'hair is about confidence',
  'generic luxury',
  'elevated beauty experience',
  'for the modern woman',
  'premium hair company',
] as const;
