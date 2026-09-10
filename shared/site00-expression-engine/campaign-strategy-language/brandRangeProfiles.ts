/**
 * P0.CSI.1 — Brand-specific campaign range profiles.
 */

import type { BrandCampaignRange, CampaignExpressionLanguage, CampaignStrategyType } from './types.js';

const ALL_STRATEGIES: CampaignStrategyType[] = [
  'LIVED_IN_ENVIRONMENTAL',
  'HERO_PRODUCT_REVEAL',
  'CHARACTER_LED',
  'OBJECT_AS_CHARACTER',
  'PROCESS_ACCESS',
  'RECEIPT_PROOF',
  'CULTURAL_CALLBACK',
  'SOCIAL_OBSERVATION',
  'MICRO_NARRATIVE_SERIES',
  'ONE_LOCATION_STUDY',
  'VISUAL_GAME',
  'INTIMATE_DOCUMENTARY',
  'HIGH_CONCEPT_EDITORIAL',
  'EVERYDAY_LUXURY',
  'EVENTIZED_DROP',
  'FOUND_OBJECT_DISCOVERY',
  'TESTIMONIAL_AS_STORY',
  'TRANSFORMATION_ARC',
  'WORLD_BUILDING',
  'ANTI_CAMPAIGN_DEADPAN',
];

function range(
  brandSlug: string,
  displayName: string,
  safe: CampaignStrategyType[],
  stretch: CampaignStrategyType[],
  experimental: CampaignStrategyType[],
  offBrand: CampaignStrategyType[],
  langs: CampaignExpressionLanguage[],
): BrandCampaignRange {
  return {
    brandSlug,
    displayName,
    safeRange: safe,
    stretchRange: stretch,
    experimentalRange: experimental,
    offBrandRange: offBrand,
    preferredExpressionLanguages: langs,
  };
}

export const BRAND_CAMPAIGN_RANGES: Record<string, BrandCampaignRange> = {
  'frontal-slayer': range(
    'frontal-slayer',
    'FRONTAL SLAYER',
    ['EVERYDAY_LUXURY', 'LIVED_IN_ENVIRONMENTAL', 'INTIMATE_DOCUMENTARY'],
    ['WORLD_BUILDING', 'HIGH_CONCEPT_EDITORIAL', 'TRANSFORMATION_ARC', 'EVENTIZED_DROP'],
    ['OBJECT_AS_CHARACTER', 'VISUAL_GAME', 'FOUND_OBJECT_DISCOVERY'],
    ['RECEIPT_PROOF'],
    ['LUXURIOUS', 'CINEMATIC', 'ORGANIC', 'WITTY', 'INTIMATE', 'ENVIRONMENTAL'],
  ),

  ndxbook: range(
    'ndxbook',
    'NDXBOOK',
    ['SOCIAL_OBSERVATION', 'RECEIPT_PROOF', 'MICRO_NARRATIVE_SERIES'],
    ['CULTURAL_CALLBACK', 'HIGH_CONCEPT_EDITORIAL', 'WORLD_BUILDING', 'ANTI_CAMPAIGN_DEADPAN'],
    ['VISUAL_GAME', 'OBJECT_AS_CHARACTER'],
    ['HERO_PRODUCT_REVEAL'],
    ['WITTY', 'OBSERVATIONAL', 'INTELLECTUAL', 'DEADPAN', 'EDITORIAL'],
  ),

  'site-00': range(
    'site-00',
    'SITE 00',
    ['PROCESS_ACCESS', 'HIGH_CONCEPT_EDITORIAL', 'WORLD_BUILDING'],
    ['OBJECT_AS_CHARACTER', 'FOUND_OBJECT_DISCOVERY'],
    ['VISUAL_GAME', 'ANTI_CAMPAIGN_DEADPAN'],
    ['TESTIMONIAL_AS_STORY'],
    ['FUTURISTIC', 'EDITORIAL', 'INSIDER', 'CONTROLLED'],
  ),

  site00: range(
    'site00',
    'SITE 00',
    ['PROCESS_ACCESS', 'HIGH_CONCEPT_EDITORIAL', 'WORLD_BUILDING'],
    ['OBJECT_AS_CHARACTER', 'FOUND_OBJECT_DISCOVERY'],
    ['VISUAL_GAME', 'ANTI_CAMPAIGN_DEADPAN'],
    ['TESTIMONIAL_AS_STORY'],
    ['FUTURISTIC', 'EDITORIAL', 'INSIDER', 'CONTROLLED'],
  ),

  aio: range(
    'aio',
    'ALL IN ONE ENTERPRISES',
    ['PROCESS_ACCESS', 'RECEIPT_PROOF', 'CHARACTER_LED'],
    ['TRANSFORMATION_ARC', 'EVENTIZED_DROP', 'TESTIMONIAL_AS_STORY'],
    ['SOCIAL_OBSERVATION'],
    ['HIGH_CONCEPT_EDITORIAL'],
    ['RELATABLE', 'DOCUMENTARY', 'WARM', 'OBSERVATIONAL'],
  ),

  'all-in-one-enterprises': range(
    'all-in-one-enterprises',
    'ALL IN ONE ENTERPRISES',
    ['PROCESS_ACCESS', 'RECEIPT_PROOF', 'CHARACTER_LED'],
    ['TRANSFORMATION_ARC', 'EVENTIZED_DROP', 'TESTIMONIAL_AS_STORY'],
    ['SOCIAL_OBSERVATION'],
    ['HIGH_CONCEPT_EDITORIAL'],
    ['RELATABLE', 'DOCUMENTARY', 'WARM', 'OBSERVATIONAL'],
  ),

  'astral-world': range(
    'astral-world',
    'ASTRAL WORLD',
    ['WORLD_BUILDING', 'CHARACTER_LED', 'INTIMATE_DOCUMENTARY'],
    ['MICRO_NARRATIVE_SERIES', 'FOUND_OBJECT_DISCOVERY'],
    ['HIGH_CONCEPT_EDITORIAL', 'CULTURAL_CALLBACK'],
    ['RECEIPT_PROOF', 'SOCIAL_OBSERVATION'],
    ['MYSTERIOUS', 'INTIMATE', 'CINEMATIC', 'ART_HOUSE'],
  ),
};

export function getBrandCampaignRange(brandSlug: string): BrandCampaignRange {
  const normalized = brandSlug.toLowerCase().replace(/\s+/g, '-');
  return (
    BRAND_CAMPAIGN_RANGES[normalized] ??
    range(
      normalized,
      brandSlug.toUpperCase(),
      ['LIVED_IN_ENVIRONMENTAL', 'EVERYDAY_LUXURY', 'CHARACTER_LED'],
      ['HIGH_CONCEPT_EDITORIAL', 'MICRO_NARRATIVE_SERIES'],
      ['OBJECT_AS_CHARACTER'],
      [],
      ['ORGANIC', 'WARM', 'RELATABLE'],
    )
  );
}

export function isStrategyInBrandRange(
  brandSlug: string,
  strategy: CampaignStrategyType,
  tier: 'safe' | 'stretch' | 'experimental' = 'stretch',
): boolean {
  const profile = getBrandCampaignRange(brandSlug);
  if (profile.offBrandRange.includes(strategy)) return false;
  if (tier === 'safe') return profile.safeRange.includes(strategy);
  if (tier === 'experimental') return profile.experimentalRange.includes(strategy);
  return (
    profile.safeRange.includes(strategy) ||
    profile.stretchRange.includes(strategy) ||
    profile.experimentalRange.includes(strategy)
  );
}

export function allBrandSlugs(): string[] {
  return [...new Set(Object.values(BRAND_CAMPAIGN_RANGES).map((b) => b.brandSlug))];
}

export { ALL_STRATEGIES };
