/**
 * Founder Creative Appetite — methodology constants.
 */

export const FOUNDER_CREATIVE_APPETITE_PROFILE_VERSION = 'CREATIVE_APPETITE_V1' as const;

export const CREATIVE_APPETITE_AVAILABILITY = {
  AVAILABLE_FUTURE: 'AVAILABLE_FUTURE',
  EXCLUDED_CURRENT_EXPERIMENT: 'EXCLUDED_CURRENT_EXPERIMENT',
  INCLUDED: 'INCLUDED',
} as const;

export type CreativeAppetiteAvailability =
  (typeof CREATIVE_APPETITE_AVAILABILITY)[keyof typeof CREATIVE_APPETITE_AVAILABILITY];

/** Frozen NDXBOOK experiments — appetite must never enter their serialized payloads. */
export const FROZEN_NDXBOOK_EXPERIMENT_IDS = [
  'ndxbook-canonical-creative-range',
  'ndxbook-canonical-carousel-expansion',
  'ndxbook-six-concept-hero-range',
  'CONCEPT_ORTHOGONALITY_EXPERIMENT',
  'CANONICAL_SAME_TOPIC_CAROUSEL_EXPANSION',
  'CANONICAL_CREATIVE_RANGE_VALIDATION',
] as const;

export const NDXBOOK_CONCEPT_EXPERIMENT_SNAPSHOT_VERSION = 1;

export const CREATIVE_APPETITE_AVAILABLE_FROM_CANON_VERSION = 2;

export const TOLERANCE_BANDS = [
  'CONSERVATIVE',
  'CONTROLLED',
  'OPEN',
  'ADVENTUROUS',
  'HIGH_EXPERIMENTATION',
] as const;

export type ToleranceBand = (typeof TOLERANCE_BANDS)[number];

export const APPETITE_DOMAIN_IDS = [
  'creative-risk',
  'abstraction',
  'visual-experimentation',
  'cultural-specificity',
  'wit-risk',
  'polarization',
  'polish-vs-rawness',
  'density-vs-restraint',
  'format-experimentation',
  'creative-surprise',
  'founder-control',
  'hard-boundaries',
] as const;

export type AppetiteDomainId = (typeof APPETITE_DOMAIN_IDS)[number];
