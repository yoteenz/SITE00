/**
 * Creative Concept Territory methodology — version constants.
 */

export const CONCEPT_TERRITORY_METHODOLOGY_VERSION = 'CONCEPT_TERRITORY_V1' as const;

export const PRE_CONCEPT_TERRITORY_METHODOLOGY = 'PRE_CONCEPT_TERRITORY_METHODOLOGY' as const;

export const EXPERIMENT_D_CLASSIFICATION = 'CONCEPT_ORTHOGONALITY_EXPERIMENT' as const;

export const EXPERIMENT_D_RUN_ID = 'ndxbook-six-concept-hero-range';

export const EXPERIMENT_D_DB_ID = 'c4e1a2b3-0003-4000-8000-000000000001';

export const EXPERIMENT_D_TOPIC_ID = 'credit-utilization';

export const EXPERIMENT_D_TOPIC_NAME = 'CREDIT UTILIZATION';

export const EXPERIMENT_D_MAX_HEROES = 6;

export const EXPERIMENT_D_HERO_COST_ESTIMATE_USD = 0.045;

export const COUSIN_PAIRS = [
  ['THE MARKED-UP COPY', 'THE ANNOTATED COPY'],
  ['THE COUNTDOWN ROOM', 'THE ROOM WHERE IT HAPPENS'],
  ['THE PERSONAL ARCHIVE', 'THE INDEX'],
] as const;

export const TRAIT_PROVENANCE_VALUES = [
  'BRAND_CANON',
  'PERSONALITY_DERIVED',
  'EXPRESSION_CONTEXT_DERIVED',
  'CONCEPT_DERIVED',
  'DIRECTION_DERIVED',
  'FORMAT_DERIVED',
  'HISTORICAL_OUTPUT',
  'EXPERIMENTAL_ACCIDENT',
  'UNKNOWN',
] as const;

export type TraitProvenance = (typeof TRAIT_PROVENANCE_VALUES)[number];

export const ORTHOGONALITY_RESULTS = ['PASS', 'COUSIN_BUT_DISTINCT', 'CONCEPT_COLLISION'] as const;
export type ConceptOrthogonalityResult = (typeof ORTHOGONALITY_RESULTS)[number];

export const VISUAL_ORTHOGONALITY_RESULTS = ['PASS', 'TOO_CLOSE', 'CLONE_RISK'] as const;
export type VisualOrthogonalityResult = (typeof VISUAL_ORTHOGONALITY_RESULTS)[number];
