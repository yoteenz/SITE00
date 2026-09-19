/**
 * Established NDXBOOK six-direction creative range — Experiment B roster.
 */

export const CANONICAL_CREATIVE_RANGE_EXPERIMENT = 'CANONICAL_CREATIVE_RANGE_VALIDATION' as const;
export const BLIND_FORMATION_CONSISTENCY_EXPERIMENT = 'BLIND_FORMATION_CONSISTENCY_VALIDATION' as const;

export const CANONICAL_NDXBOOK_DIRECTION_NAMES = [
  'THE MARKED-UP COPY',
  'THE COUNTDOWN ROOM',
  'THE PERSONAL ARCHIVE',
  'THE ANNOTATED COPY',
  'THE ROOM WHERE IT HAPPENS',
  'THE INDEX',
] as const;

export type CanonicalNdxbookDirectionName = (typeof CANONICAL_NDXBOOK_DIRECTION_NAMES)[number];

export type CanonicalDirectionSpec = {
  comparisonIndex: number;
  canonicalName: CanonicalNdxbookDirectionName;
  formationVersion: 1 | 2;
};

export const CANONICAL_SIX_DIRECTION_SPEC: CanonicalDirectionSpec[] = [
  { comparisonIndex: 1, canonicalName: 'THE MARKED-UP COPY', formationVersion: 1 },
  { comparisonIndex: 2, canonicalName: 'THE COUNTDOWN ROOM', formationVersion: 1 },
  { comparisonIndex: 3, canonicalName: 'THE PERSONAL ARCHIVE', formationVersion: 1 },
  { comparisonIndex: 4, canonicalName: 'THE ANNOTATED COPY', formationVersion: 2 },
  { comparisonIndex: 5, canonicalName: 'THE ROOM WHERE IT HAPPENS', formationVersion: 2 },
  { comparisonIndex: 6, canonicalName: 'THE INDEX', formationVersion: 2 },
];

/** Near-miss names that must never substitute for canonical directions. */
export const NEAR_MISS_DIRECTION_NAMES = [
  'THE MARKED COPY',
  'THE MARK DOWN',
  'MARKED COPY',
  'MARKED-UP COPY',
  'THE ANNOTATED DOCUMENT',
  'THE ARCHIVE',
  'PERSONAL ARCHIVE',
  'COUNTDOWN',
  'THE ROOM',
  'INDEX SIGNAL',
] as const;

export const NDXBOOK_CANONICAL_CREATIVE_RANGE_RUN_ID = 'ndxbook-canonical-creative-range';

/** Fixed Supabase row id for methodology_validation_runs persistence. */
export const NDXBOOK_CANONICAL_CREATIVE_RANGE_DB_ID = 'c4e1a2b3-0001-4000-8000-000000000001';
