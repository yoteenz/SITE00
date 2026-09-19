/**
 * Brand Presentation Direction Development — constants (Experiment G successor layer).
 */

export const BRAND_PRESENTATION_DIRECTION_TERRITORY_V1 = 'BRAND_PRESENTATION_DIRECTION_TERRITORY_V1' as const;

export const BRAND_PRESENTATION_DIRECTION_CLASSIFICATION = 'BRAND_PRESENTATION_DIRECTION_FORMATION' as const;

export const BRAND_PRESENTATION_DIRECTION_RUN_ID = 'ndxbook-brand-presentation-direction-formation';

export const BRAND_PRESENTATION_DIRECTION_DB_ID = 'c4e1a2b3-0007-4000-8000-000000000001';

export const DIRECTIONS_PER_PARENT_CONCEPT = 3;

export const SELECTED_PARENT_CONCEPT_COUNT = 3;

export const TOTAL_DIRECTION_CANDIDATES = 9;

/** Founder-selected Experiment G parent concepts eligible for direction development. */
export const ELIGIBLE_PARENT_CONCEPT_NAMES = [
  'THE COLLECTOR WHO CONNECTS',
  'THE ROOM THAT KNOWS',
  'THE THING THAT KEEPS NOTICING',
] as const;

export type EligibleParentConceptName = (typeof ELIGIBLE_PARENT_CONCEPT_NAMES)[number];

export const EXPERIMENT_G_DIRECTION_JUDGMENTS = [
  'LOVE_THE_DIRECTION',
  'PROMISING_DEVELOP',
  'TOO_CLOSE_TO_SIBLING',
  'DRIFTS_FROM_CONCEPT',
  'TOO_CONTENT_SPECIFIC',
  'TOO_FORMAT_SPECIFIC',
  'TOO_STYLE_DEPENDENT',
  'NOT_NDXBOOK',
] as const;

export type ExperimentGDirectionJudgment = (typeof EXPERIMENT_G_DIRECTION_JUDGMENTS)[number] | null;

export const TOPIC_SUBSTITUTION_TOPICS = [
  'personal finance',
  'technology',
  'cultural behavior',
  'design',
  'business systems',
] as const;

export const TOPIC_SUBSTITUTION_RESULTS = [
  'BRAND_PRESENTATION_DIRECTION_TOPIC_INDEPENDENT',
  'CONTENT_DIRECTION_COLLAPSE',
  'CAMPAIGN_DIRECTION_COLLAPSE',
  'FORMAT_DIRECTION_COLLAPSE',
  'TOPIC_DEPENDENT_DIRECTION',
] as const;

export const RECURRENCE_DIRECTION_RESULTS = [
  'PASS',
  'ONE_JOKE',
  'ONE_FORMAT',
  'ONE_CAMPAIGN',
  'ONE_METAPHOR',
  'FINITE_CONTENT_ENGINE',
  'VISUAL_GIMMICK_DEPENDENCE',
  'NOT_EVALUATED',
] as const;

export const PARENT_FIDELITY_RESULTS = ['PASS', 'PARENT_CONCEPT_DRIFT', 'NOT_EVALUATED'] as const;

export const SIBLING_DISTINCTIVENESS_RESULTS = [
  'PASS',
  'STYLE_ONLY_DIFFERENTIATION',
  'FORMAT_ONLY_DIFFERENTIATION',
  'SINGLE_METAPHOR_DIRECTION',
  'STYLE_DEPENDENT_DIRECTION',
  'NEEDS_FOUNDER_REVIEW',
  'NOT_EVALUATED',
] as const;

export const CROSS_PARENT_AUDIT_RESULTS = [
  'PASS',
  'CONCEPTUAL_LEAKAGE',
  'CROSS_PARENT_DUPLICATION',
  'ARTIFICIAL_DIVERSITY',
  'NEEDS_FOUNDER_REVIEW',
  'SEMANTIC_AUDIT_NOT_EVALUATED',
] as const;

export const MIN_EXPRESSION_SEEDS_REQUIRED = 3;

export const DIRECTION_FORMATION_OUTPUT_BLOCKLIST = [
  'CREDIT UTILIZATION',
  'credit utilization',
  'THE CREDIT THRESHOLD',
  'MARKED-UP COPY',
  'COUNTDOWN ROOM',
  'Frontal Slayer',
  'site00/projects',
  'Project Workspace',
  'Host Visual Memory',
  'Burn Book',
  'burn book',
] as const;
