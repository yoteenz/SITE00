/**
 * Canonical six same-topic carousel world expansion — Experiment C.
 */

import { CANONICAL_NDXBOOK_DIRECTION_NAMES } from './canonicalCreativeRangeConstants.js';

export const CANONICAL_CAROUSEL_EXPANSION_EXPERIMENT = 'CANONICAL_SAME_TOPIC_CAROUSEL_EXPANSION' as const;

export const NDXBOOK_CANONICAL_CAROUSEL_EXPANSION_RUN_ID = 'ndxbook-canonical-carousel-expansion';

/** Fixed Supabase row id for methodology_validation_runs persistence. */
export const NDXBOOK_CANONICAL_CAROUSEL_EXPANSION_DB_ID = 'c4e1a2b3-0002-4000-8000-000000000001';

export const CAROUSEL_EXPERIMENT_VERSION = 'carousel-v1-credit-utilization';

export const CAROUSEL_TOTAL_SLIDES = 6;

export const CAROUSEL_NEW_SLIDES_PER_DIRECTION = 5;

export const CAROUSEL_EXPECTED_NEW_GENERATIONS = 30;

export const CAROUSEL_SHARED_TOPIC_ID = 'credit-utilization';

export const CAROUSEL_SHARED_TOPIC_NAME = 'CREDIT UTILIZATION';

export { CANONICAL_NDXBOOK_DIRECTION_NAMES };

export const COVER_INFLUENCE_CONTRACT = {
  allowed: [
    'palette',
    'texture',
    'typographic attitude',
    'graphic grammar',
    'material language',
    'world tone',
    'visual density',
    'recurring identity devices',
  ],
  forbidden: [
    'exact composition',
    'exact text placement',
    'exact crop',
    'exact proportions',
    'exact object layout',
    'exact page structure',
  ],
} as const;

export const COMPOSITION_MODES = [
  'TYPE_DOMINANT',
  'IMAGE_DOMINANT',
  'DATA_DOMINANT',
  'ARTIFACT_DOMINANT',
  'ANNOTATION_DOMINANT',
  'SPATIAL_ENVIRONMENTAL',
  'MINIMAL_QUIET',
  'DENSE_REFERENCE',
] as const;

export type CarouselCompositionMode = (typeof COMPOSITION_MODES)[number];
