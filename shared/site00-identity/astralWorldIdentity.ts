/**
 * Astral World initial identity territories — strategic exploration, non-canonical.
 */

import type { IdentityTerritoryPayload } from './types.js';

export type AstralIdentityTerritorySeed = {
  territoryKey: string;
  workingLabel: string;
  strategicPremise: string;
  payload: IdentityTerritoryPayload;
  creativeHypotheses: string[];
};

export const ASTRAL_WORLD_MASTER_BRAND = 'Astral World';
export const ASTRAL_WORLD_FLAGSHIP_DISTRICT = 'Astréa';

export const ASTRAL_WORLD_HIERARCHY_SEED = {
  world: { slug: 'astral-world', displayName: 'Astral World', role: 'MASTER_PRODUCT_UNIVERSE' as const },
  district: { slug: 'astrea', displayName: 'Astréa', role: 'FLAGSHIP_DISTRICT' as const },
  destinations: [
    { slug: 'tarot-suite', displayName: 'Tarot Suite' },
    { slug: 'astral-mall', displayName: 'Astral Mall' },
    { slug: 'coffee-shop', displayName: 'Coffee Shop' },
  ],
} as const;

export const ASTRAL_WORLD_IDENTITY_TERRITORY_SEEDS: readonly AstralIdentityTerritorySeed[] = [
  {
    territoryKey: 'celestial-gateway',
    workingLabel: 'Celestial Gateway',
    strategicPremise:
      'Astral World reads as a luminous threshold universe — mystical but navigable. Astréa inherits the master glow while expressing intimate district warmth.',
    payload: {
      positioning: 'Master universe as welcoming cosmic portal for seekers and readers',
      personality: 'Guiding, luminous, calm confidence — not theatrical mysticism',
      tone: 'Warm invitation with quiet authority',
      masterBrandDirection: 'Expansive celestial navigation — stars, paths, portals as wayfinding metaphor only',
      districtIdentityDirection: 'Astréa as the first illuminated district — softer, more personal scale within the universe',
      typographyDirection: 'Distinct master wordmark hierarchy; district sub-brand may soften weight — unresolved execution',
      paletteDirection: 'Deep cosmic base with controlled accent warmth — not SITE 00 red',
      symbolicLanguage: 'Threshold, path, constellation as navigation — not tarot deck literalism',
      differentiation: 'Universe feels like a place you enter, not a single reading room',
      risks: ['Over-mystification', 'Generic space aesthetic'],
      districtRelationship: 'Shared celestial DNA; Astréa adds human intimacy',
      futureDistrictModel: 'Future districts share navigation grammar, not color clone',
    },
    creativeHypotheses: [
      'Master brand may use horizontal lockup: ASTRAL WORLD with district badges below',
      'Astréa could carry a subtle encoded R/A motif — CREATIVE HYPOTHESIS only',
    ],
  },
  {
    territoryKey: 'social-sanctuary',
    workingLabel: 'Social Sanctuary',
    strategicPremise:
      'Astral World emphasizes community and belonging — readers and clients gather. Astréa is the social heart where Coffee Shop energy meets reading culture.',
    payload: {
      positioning: 'A universe for connection between readers, clients, and shared ritual',
      personality: 'Social, welcoming, emotionally intelligent — Sims-like warmth without gamification literalism',
      tone: 'Conversational, inclusive, gently playful',
      masterBrandDirection: 'Community-first universe identity — gathering places as brand metaphor',
      districtIdentityDirection: 'Astréa foregrounds social presence; destinations feel like rooms in a shared world',
      typographyDirection: 'Humanist warmth at district level; master brand may stay more structured — hypothesis',
      paletteDirection: 'Warm neutrals with district accent zones — Coffee Shop may skew cozier',
      symbolicLanguage: 'Gathering, hearth, shared table — reference meaning not reference appearance',
      differentiation: 'Platform feels alive with people, not empty environments',
      risks: ['Feeling too casual for premium readings', 'Social metaphor without depth'],
      districtRelationship: 'Astréa owns social warmth; master brand holds the umbrella trust',
      futureDistrictModel: 'Each future district may tune social intensity independently',
    },
    creativeHypotheses: [
      'Coffee Shop destination may inherit the most social visual accent within Astréa',
      'Membership badges could be district-scoped — hypothesis only',
    ],
  },
  {
    territoryKey: 'arcane-marketplace',
    workingLabel: 'Arcane Marketplace',
    strategicPremise:
      'Astral World balances mysticism with commerce and discovery — readers operate as guides in a structured marketplace of experiences. Astréa is the flagship bazaar district.',
    payload: {
      positioning: 'A discoverable universe of reading experiences with clear paths to readers and destinations',
      personality: 'Curious, structured, trustworthy guide — marketplace without hustle',
      tone: 'Clear, respectful, subtly magical',
      masterBrandDirection: 'Navigation and discovery as master brand behavior — maps, routes, reader listings',
      districtIdentityDirection: 'Astréa as curated district — Tarot Suite, Mall, Coffee Shop as distinct stalls/rooms',
      typographyDirection: 'Strong wayfinding typography at master level; destination-specific accents allowed',
      paletteDirection: 'Structured contrast for navigation clarity — Mall may allow more visual energy',
      symbolicLanguage: 'Wayfinding, portals, reader badges — not medieval market literalism',
      differentiation: 'Reader-first OR environment-first routing reflected in identity structure',
      risks: ['Feeling transactional', 'Market metaphor too literal'],
      districtRelationship: 'Master brand owns routing clarity; destinations own mood',
      futureDistrictModel: 'New districts plug into same discovery grammar',
    },
    creativeHypotheses: [
      'Astral Mall destination may carry the strongest discovery/commerce visual accent',
      'Reader profiles may use district-scoped environment badges — hypothesis',
    ],
  },
] as const;

/** Founder-directed hierarchy truth — stored as CLIENT_FOUNDER_TRUTH, not creative exploration */
export const ASTRAL_WORLD_FOUNDER_HIERARCHY_TRUTH = {
  masterBrand: ASTRAL_WORLD_MASTER_BRAND,
  masterRole: 'MASTER_PRODUCT_UNIVERSE',
  flagshipDistrict: ASTRAL_WORLD_FLAGSHIP_DISTRICT,
  districtRole: 'FLAGSHIP_DISTRICT',
  astréaNamingNote:
    'Astréa carries personal significance (client name Rea). Encoded ASTRAL+REA relationship — founder-directed, not visual canon.',
  expansionModel: 'Future districts may be added beneath Astral World without creating new projects',
} as const;
