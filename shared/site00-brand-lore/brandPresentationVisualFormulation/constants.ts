/**
 * Brand Presentation Visual Formulation — exploration policies.
 */

export const BRAND_PRESENTATION_VISUAL_FORMULATION_V1 = 'BRAND_PRESENTATION_VISUAL_FORMULATION_V1' as const;

export const BRAND_PRESENTATION_VISUAL_FORMULATION_V2 =
  'BRAND_PRESENTATION_VISUAL_FORMULATION_V2_PARENT_SCAN' as const;

export const BRAND_PRESENTATION_VISUAL_FORMULATION_CLASSIFICATION =
  'BRAND_PRESENTATION_VISUAL_FORMULATION' as const;

export const BRAND_PRESENTATION_VISUAL_FORMULATION_RUN_ID =
  'ndxbook-brand-presentation-visual-formulation';

export const BRAND_PRESENTATION_VISUAL_FORMULATION_DB_ID =
  'c4e1a2b3-0008-4000-8000-000000000001';

export const EXPLORATION_MODES = {
  DIRECTION_FINALIST_DEEP_DIVE: 'DIRECTION_FINALIST_DEEP_DIVE',
  PARENT_FINALIST_DIRECTION_SCAN: 'PARENT_FINALIST_DIRECTION_SCAN',
} as const;

export type ExplorationMode = (typeof EXPLORATION_MODES)[keyof typeof EXPLORATION_MODES];

/** Legacy: 2 direction finalists × 3 expressions */
export const NDXBOOK_DIRECTION_DEEP_DIVE_POLICY = {
  mode: EXPLORATION_MODES.DIRECTION_FINALIST_DEEP_DIVE,
  finalistCount: 2,
  expressionsPerFinalist: 3,
  totalInitialVisuals: 6,
} as const;

/** NDXBOOK current: 2 parent finalists × 3 directions × 1 benchmark */
export const NDXBOOK_PARENT_FINALIST_SCAN_POLICY = {
  mode: EXPLORATION_MODES.PARENT_FINALIST_DIRECTION_SCAN,
  parentFinalistCount: 2,
  directionsPerParent: 3,
  benchmarksPerDirection: 1,
  totalInitialVisuals: 6,
  selectedParentNames: ['THE ROOM THAT KNOWS', 'THE THING THAT KEEPS NOTICING'] as const,
  deferredParentNames: ['THE COLLECTOR WHO CONNECTS'] as const,
} as const;

export const NDXBOOK_VISUAL_EXPLORATION_POLICY = NDXBOOK_PARENT_FINALIST_SCAN_POLICY;

export type BrandPresentationVisualExplorationPolicy =
  | typeof NDXBOOK_DIRECTION_DEEP_DIVE_POLICY
  | typeof NDXBOOK_PARENT_FINALIST_SCAN_POLICY;

export const PARENT_DEFERRED_STATUSES = [
  'FOUNDER_DEFERRED_VISUALIZATION',
  'SALVAGE_ELIGIBLE',
] as const;

export type ParentDeferredStatus = (typeof PARENT_DEFERRED_STATUSES)[number];

export const FINALIST_SELECTION_STATUSES = ['SELECTED', 'SUPERSEDED', 'WITHDRAWN'] as const;

export type FinalistSelectionStatus = (typeof FINALIST_SELECTION_STATUSES)[number];

export const DIRECTION_BENCHMARK_JUDGMENTS = [
  'LOVE_THIS_DIRECTION',
  'PROMISING_REVISE',
  'NOT_THIS_DIRECTION',
  'MISREPRESENTS_THE_DIRECTION',
  'TOO_GENERIC',
  'TOO_LITERAL',
  'VISUAL_DOES_NOT_HELP_ME_JUDGE',
] as const;

export type DirectionBenchmarkJudgment = (typeof DIRECTION_BENCHMARK_JUDGMENTS)[number] | null;

export const VISUAL_EXPRESSION_JUDGMENTS = [
  'LOVE_THIS_EXPRESSION',
  'PROMISING_REVISE',
  'NOT_THIS_EXPRESSION',
  'MISREPRESENTS_DIRECTION',
  'TOO_GENERIC',
  'TOO_LITERAL',
  'TOO_STYLE_DEPENDENT',
] as const;

export type VisualExpressionJudgment = (typeof VISUAL_EXPRESSION_JUDGMENTS)[number] | null;

export const VISUAL_FORMULATION_STATUSES = [
  'NOT_STARTED',
  'FINALISTS_INCOMPLETE',
  'FINALISTS_READY',
  'FORMULATING_BENCHMARKS',
  'BENCHMARKS_READY',
  'FORMULATING_EXPRESSIONS',
  'EXPRESSIONS_READY',
  'GENERATING_VISUALS',
  'VISUALS_READY',
  'FOUNDER_REVIEW',
  'WINNER_SELECTED',
  'FAILED',
] as const;

export type VisualFormulationStatus = (typeof VISUAL_FORMULATION_STATUSES)[number];

export const REFERENCE_CLASSES = [
  'BRAND_CANON_VISUAL',
  'FOUNDER_REFERENCE_EVIDENCE',
  'APPROVED_IDENTITY_REFERENCE',
  'APPROVED_NDXBOOK_ASSET',
  'NEGATIVE_REFERENCE',
  'MEDIUM_REFERENCE',
  'EXPRESSION_CALIBRATION_REFERENCE',
] as const;

export const EXCLUDED_REFERENCE_SOURCES = [
  'SITE00_HOST_VISUAL_MEMORY',
  'PROJECTS_UX',
  'PROJECT_WORKSPACE_UI',
  'EXPERIMENT_D_VISUAL',
  'EXPERIMENT_F_VISUAL',
  'FRONTAL_SLAYER_WORKBENCH',
  'REJECTED_WORKBENCH',
  'DOSSIER_IMAGERY',
] as const;

export const DIRECTION_DRIFT_RESULTS = ['PASS', 'DIRECTION_DRIFT', 'NOT_EVALUATED'] as const;

export const VISUAL_DISTINCTIVENESS_RESULTS = [
  'PASS',
  'STYLE_ONLY_DIFFERENTIATION',
  'VISUAL_RANGE_TOO_NARROW',
  'SIBLING_VISUAL_COLLAPSE',
  'NOT_EVALUATED',
] as const;

export const VISION_QA_RESULTS = ['PASS', 'FAIL', 'NOT_EVALUATED'] as const;

export const FAL_COST_ESTIMATE_USD = 0.08;

export const DIRECTION_BENCHMARK_SUMMARIES: Record<string, string> = {
  'THE AMBIENT AUTHORITY DIRECTION': 'NDXBOOK already knows.',
  'THE SOCIAL TEMPERATURE DIRECTION': 'NDXBOOK has weather.',
  'THE CONTINUOUS INTERIOR DIRECTION': 'You entered mid-conversation.',
  'THE SINGLE CATCH DIRECTION': 'NDXBOOK saw this.',
  'THE PATTERN NOTICING DIRECTION': 'These separate things are actually the same structure.',
  'THE SLOW OBSERVATION DIRECTION': 'NDXBOOK kept looking after everyone else moved on.',
};

export const PARENT_CONCEPT_METAPHOR_GUARDS: Record<string, string[]> = {
  'THE ROOM THAT KNOWS': [
    'literal room',
    'interior architecture',
    'library',
    'lounge',
    'salon',
    'office',
    'study',
  ],
  'THE THING THAT KEEPS NOTICING': [
    'eyeball',
    'surveillance',
    'binoculars',
    'magnifying glass',
    'detective wall',
    'radar',
    'monitoring equipment',
  ],
};
