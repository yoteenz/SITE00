/**
 * Experiment E — Experience Expression methodology constants.
 */

export const EXPERIENCE_EXPRESSION_METHODOLOGY_VERSION = 'EXPERIENCE_EXPRESSION_V1' as const;

export const EXPERIMENT_E_CLASSIFICATION = 'EXPERIENCE_EXPRESSION_EXPERIMENT' as const;

export const EXPERIMENT_E_RUN_ID = 'ndxbook-experience-expression';

export const EXPERIMENT_E_DB_ID = 'c4e1a2b3-0004-4000-8000-000000000001';

/** Experiment E begins after appetite layer — distinct from frozen Experiment D snapshot. */
export const EXPERIENCE_E_INTELLIGENCE_SNAPSHOT_VERSION = 2;

export const EXPERIMENT_D_FROZEN_SNAPSHOT_VERSION = 1;

export const EXPERIENCE_SURFACE_TYPES = [
  'PROJECT_ENTRY',
  'PROJECT_HOME',
  'CONCEPT_FORMATION',
  'FOUNDER_REVIEW',
  'CONTENT_LIBRARY',
  'CANON',
  'SYSTEM_INSPECTOR',
] as const;

export type ExperienceSurfaceType = (typeof EXPERIENCE_SURFACE_TYPES)[number];

export const EXPERIENCE_E_INITIAL_SURFACES: ExperienceSurfaceType[] = [
  'PROJECT_ENTRY',
  'PROJECT_HOME',
  'CONCEPT_FORMATION',
  'FOUNDER_REVIEW',
];

export const DEVICE_CLASSES = ['MOBILE', 'DESKTOP'] as const;
export type DeviceClass = (typeof DEVICE_CLASSES)[number];

export const EXPERIENCE_CONCEPT_COUNT = 3;

export const EXPERIENCE_FRAMES_PER_CONCEPT =
  EXPERIENCE_E_INITIAL_SURFACES.length * DEVICE_CLASSES.length;

export const EXPERIENCE_VISUAL_COST_ESTIMATE_USD = 0.045;

export const EXPERIENCE_READINESS_STATES = [
  'NOT_READY',
  'WAITING_FOR_SNAPSHOT',
  'WAITING_FOR_CONCEPT_SELECTION',
  'READY_FOR_EXPERIENCE_FORMATION',
  'BLOCKED_FUNCTIONAL_CANON',
  'BLOCKED_HOST_CANON',
] as const;

export type ExperienceExpressionReadinessState = (typeof EXPERIENCE_READINESS_STATES)[number];

export const EXPERIENCE_CONCEPT_JUDGMENTS = [
  'LOVE_THE_EXPERIENCE',
  'PROMISING_EXPLORE',
  'NOT_FOR_THIS_PROJECT',
  'TOO_TEMPLATE_LIKE',
  'TOO_CLOSE_TO_ANOTHER',
] as const;

export type ExperienceConceptJudgment = (typeof EXPERIENCE_CONCEPT_JUDGMENTS)[number] | null;

export const EXPERIENCE_DISTINCTIVENESS_RESULTS = ['PASS', 'COUSIN_BUT_DISTINCT', 'CONCEPTUAL_COLLAPSE'] as const;
export type ExperienceDistinctivenessResult = (typeof EXPERIENCE_DISTINCTIVENESS_RESULTS)[number];

export const CANON_ITEM_CLASSIFICATIONS = [
  'REQUIRED_FUNCTION',
  'REQUIRED_INFORMATION',
  'REQUIRED_NAVIGATION',
  'OPTIONAL_PRESENTATION',
  'LEGACY_PRESENTATION',
  'DECORATIVE',
] as const;

export type CanonItemClassification = (typeof CANON_ITEM_CLASSIFICATIONS)[number];

export const EXPERIENCE_PROVENANCE = [
  'HOST',
  'CLIENT',
  'FUNCTIONAL',
  'DERIVED_EXPERIENCE',
  'DERIVED_INTERACTION',
  'BRAND_CANON',
  'CONCEPT_TERRITORY',
  'WORLD_EXPRESSION',
  'FOUNDER_PREFERENCE',
  'EXPERIMENTAL_ASSET',
  'HISTORICAL_OUTPUT',
] as const;

export type ExperienceProvenance = (typeof EXPERIENCE_PROVENANCE)[number];

export const FORBIDDEN_GENERIC_PROMPT_PHRASES = [
  'modern dashboard',
  'clean dashboard',
  'saas ui',
  'professional dashboard',
  'analytics dashboard',
  'web app interface',
  'card-based layout',
  'modern website',
  'clean website',
] as const;

export const FORBIDDEN_EXPERIENCE_LEAKAGE_TERMS = [
  'frontal slayer mansion',
  'tarot world',
  'tarot-world',
  'project chamber',
  'live case file',
  'formation floor',
  'crystal ball',
  "sister's tent",
] as const;

export const EXPERIENCE_TERRITORY_SELECTION_PURPOSE = 'EXPERIMENT_E_ONLY' as const;
