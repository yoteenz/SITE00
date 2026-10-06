/**
 * Visual Authority Development Gate — Studio OS production methodology
 * (P0.SITE00.PRODUCTION-METHODOLOGY.VISUAL-AUTHORITY-DEVELOPMENT-GATE1).
 *
 * Doctrine: UPSTREAM DEFINES INTENT. DOWNSTREAM INCREASES FIDELITY.
 *
 * Why it exists: implementation consumed the Workspace Experience Brain directly and coded new content onto old legacy
 * page geometry (AIO IFTA: OLD PAGE + NEW CONTENT). EXPERIENCE CONTRACT ≠ VISUAL AUTHORITY. This gate sits between the
 * experience contract and implementation for every MATERIAL page family. It consumes the Experience Brain, Brand DNA,
 * product ontology and the expression workspaces; it replaces none of them.
 *
 * Core is project-agnostic: projects supply brand context, legacy surfaces, territories and authorities as data.
 */
import type { ExperienceActor, ExperienceContract, Viewport } from '../studioos-experience-brain/schema.js';

export const VISUAL_AUTHORITY_SCHEMA_VERSION = '1.0.0' as const;
export const VISUAL_AUTHORITY_SPRINT = 'P0.SITE00.PRODUCTION-METHODOLOGY.VISUAL-AUTHORITY-DEVELOPMENT-GATE1' as const;
export const VISUAL_AUTHORITY_DOCTRINE = 'UPSTREAM DEFINES INTENT. DOWNSTREAM INCREASES FIDELITY.' as const;

/* ─────────────────────────────── production stack + canonical sequence ─────────────────────────────── */

export const AUTHORITY_PRODUCTION_STACK = [
  'PRODUCT / BUSINESS TRUTH',
  'PRODUCT TREE / FAMILY LOCK',
  'EXPERIENCE CONTRACT',
  'VISUAL AUTHORITY DEVELOPMENT',
  'IMPLEMENTATION',
  'IMPLEMENTATION REFINEMENT',
  'FINAL LIVE AUTHORITY',
] as const;

export const AUTHORITY_DEVELOPMENT_SEQUENCE: readonly { step: string; id: string; does: string; produces: string }[] = [
  { step: '01', id: 'LOAD_BRAND_DNA', does: 'Load positioning, audience, voice, color, materials, typography, logo rules, mood, references, architecture, avoid list, history, approved decisions.', produces: 'BrandContext (checked by checkBrandContext)' },
  { step: '02', id: 'LOAD_EXPERIENCE_CONTRACT', does: 'Load the Workspace Experience Brain contract (purpose, promise, actor, task, states, mirror, metaphor, archetype, hierarchy, E2E).', produces: 'ExperienceIngest (checked by validateExperienceContract)' },
  { step: '03', id: 'EXCLUDE_LEGACY_VISUALS', does: 'Classify every existing surface; non-approved legacy may inform function, never layout.', produces: 'LegacySurface[] (LEGACY_VISUAL_AUTHORITY_POLICY)' },
  { step: '04', id: 'CREATE_3_COMPOSITION_TERRITORIES', does: 'Author three territories that differ in spatial logic, primary zone, hierarchy, interaction emphasis, density and media relationship.', produces: 'CompositionTerritory[3] (checked by checkTerritoryDistinctness)' },
  { step: '05', id: 'GENERATE_OR_ASSEMBLE_REFERENCE_AUTHORITIES', does: 'One reference authority per territory that shows real composition, hierarchy, zones, media relationship, interaction emphasis and actor intent.', produces: 'ReferenceAuthority per territory' },
  { step: '06', id: 'FOUNDER_CHOOSES_OR_REVISES', does: 'Founder: LOVE_IT · REVISE · REJECT · COMBINE · REQUEST_FOURTH_TERRITORY.', produces: 'FounderAuthorityDecision' },
  { step: '07', id: 'LOCK_PAGE_FAMILY_AUTHORITY', does: 'Lock approved page logic: core logic locks + flexible implementation areas + lineage.', produces: 'PageFamilyAuthority (PAGE_FAMILY_AUTHORITY level)' },
  { step: '08', id: 'IMPLEMENT', does: 'Implementation consumes authority + experience contract + brand DNA + state / interaction / responsive contracts.', produces: 'Implementation (AUTHORITY_IMPLEMENTATION_CONTRACT)' },
  { step: '09', id: 'INCREASE_FIDELITY_WITHOUT_VIOLATING_CORE_LOGIC', does: 'Raise responsiveness, interactivity, state completeness, accessibility, material realism, content fidelity and integration; material deviation → founder review.', produces: 'LIVE_AUTHORITY after founder approval (lineage kept)' },
];

/** The methodology this gate supersedes. */
export const SUPERSEDED_METHODOLOGY = 'FAMILY LOCK → IMPLEMENTATION without experience + visual authority development.' as const;

/* ─────────────────────────────── production states ─────────────────────────────── */

export type AuthorityProductionState =
  | 'FAMILY_LOCKED'
  | 'EXPERIENCE_REQUIRED'
  | 'EXPERIENCE_COMPLETE'
  | 'BRAND_CONTEXT_REQUIRED'
  | 'AUTHORITY_TERRITORIES_REQUIRED'
  | 'AUTHORITY_IN_REVIEW'
  | 'AUTHORITY_APPROVED'
  | 'IMPLEMENTATION_READY'
  | 'IMPLEMENTING'
  | 'LIVE_REVIEW'
  | 'LIVE_AUTHORITY';

export const AUTHORITY_PRODUCTION_STATES: readonly AuthorityProductionState[] = [
  'FAMILY_LOCKED', 'EXPERIENCE_REQUIRED', 'EXPERIENCE_COMPLETE', 'BRAND_CONTEXT_REQUIRED', 'AUTHORITY_TERRITORIES_REQUIRED',
  'AUTHORITY_IN_REVIEW', 'AUTHORITY_APPROVED', 'IMPLEMENTATION_READY', 'IMPLEMENTING', 'LIVE_REVIEW', 'LIVE_AUTHORITY',
];

/** Guard outcomes that stop the line regardless of the production state reached. */
export type AuthorityGuardStatus =
  | 'FAMILY_LOCK_REQUIRED'
  | 'VISUAL_AUTHORITY_REQUIRED'
  | 'LEGACY_VISUAL_LEAK'
  | 'TERRITORY_DISTINCTNESS_FAILURE'
  | 'REFERENCE_AUTHORITY_REQUIRED'
  | 'FOUNDER_REVIEW_REQUIRED'
  | 'RESPONSIVE_AUTHORITY_REQUIRED'
  | 'AUTHORITY_AS_RUNTIME_ASSET';

export const AUTHORITY_GUARD_STATUSES: readonly AuthorityGuardStatus[] = [
  'FAMILY_LOCK_REQUIRED', 'VISUAL_AUTHORITY_REQUIRED', 'LEGACY_VISUAL_LEAK', 'TERRITORY_DISTINCTNESS_FAILURE',
  'REFERENCE_AUTHORITY_REQUIRED', 'FOUNDER_REVIEW_REQUIRED', 'RESPONSIVE_AUTHORITY_REQUIRED', 'AUTHORITY_AS_RUNTIME_ASSET',
];

/** The durable rule (motherboard): all seven must hold before a material page family moves to implementation. */
export const DURABLE_GATE_CONDITIONS = [
  'BRAND_CONTEXT_LOADED',
  'EXPERIENCE_CONTRACT_LOADED',
  'LEGACY_VISUAL_STATUS_KNOWN',
  'COMPOSITION_TERRITORIES_EXIST',
  'REFERENCE_AUTHORITY_EXISTS',
  'FOUNDER_APPROVAL_EXISTS',
  'PAGE_FAMILY_AUTHORITY_LOCKED',
] as const;
export type DurableGateCondition = (typeof DURABLE_GATE_CONDITIONS)[number];

/* ─────────────────────────────── 01 brand DNA ingest ─────────────────────────────── */

export type BrandContext = {
  brand_context_id: string;
  project_id: string;
  positioning: string;
  audience: string;
  voice: string[];
  color: string[];
  materials: string[];
  typography: string;
  logo_rules: string;
  mood: string;
  references: string[];
  architectural_language: string;
  avoid_list: string[];
  history: string[];
  approved_decisions: string[];
  /** Facts the brand sources do not settle yet (reported, never invented). */
  open_brand_questions?: string[];
};

/** Brand fields that must be present for territories to be brand-true; missing any → BRAND_CONTEXT_REQUIRED. */
export const REQUIRED_BRAND_FIELDS: readonly (keyof BrandContext)[] = [
  'positioning', 'audience', 'voice', 'color', 'materials', 'typography', 'mood', 'architectural_language', 'avoid_list',
];
export const RECOMMENDED_BRAND_FIELDS: readonly (keyof BrandContext)[] = ['logo_rules', 'references', 'history', 'approved_decisions'];

/* ─────────────────────────────── 02 experience contract ingest ─────────────────────────────── */

/** Minimum experience facts the gate needs; projected from an ExperienceContract (see experienceIngest). */
export type ExperienceIngest = {
  experience_contract_id: string;
  purpose: string;
  promise: string;
  primary_actor: ExperienceActor;
  primary_task: string;
  start_state: string;
  success_state: string;
  blocked_state: string;
  system_relationships: string[];
  client_founder_mirror: string;
  metaphor: string;
  archetype: string[];
  information_hierarchy: Record<string, string> | null;
  e2e_path: string[];
};

export const REQUIRED_EXPERIENCE_INGEST_FIELDS: readonly (keyof ExperienceIngest)[] = [
  'purpose', 'promise', 'primary_actor', 'primary_task', 'start_state', 'success_state', 'blocked_state',
  'system_relationships', 'client_founder_mirror', 'metaphor', 'archetype', 'information_hierarchy', 'e2e_path',
];

/* ─────────────────────────────── 03 legacy visual status + firewall ─────────────────────────────── */

export type LegacyVisualClass =
  | 'APPROVED_AUTHORITY'
  | 'PARTIAL_AUTHORITY'
  | 'FUNCTIONAL_REFERENCE_ONLY'
  | 'VISUALLY_SUPERSEDED'
  | 'FORBIDDEN_VISUAL_SOURCE';

export const LEGACY_VISUAL_CLASSES: Record<LegacyVisualClass, { meaning: string; may_control_visuals: 'ALL' | 'PROMOTED_DIMENSIONS_ONLY' | 'NONE'; may_inform_function: boolean }> = {
  APPROVED_AUTHORITY: { meaning: 'Founder-approved visual authority (promoted). May control visuals for its approved scope.', may_control_visuals: 'ALL', may_inform_function: true },
  PARTIAL_AUTHORITY: { meaning: 'Founder promoted specific visual dimensions only (e.g. nav visuals); everything else is functional reference.', may_control_visuals: 'PROMOTED_DIMENSIONS_ONLY', may_inform_function: true },
  FUNCTIONAL_REFERENCE_ONLY: { meaning: 'DEFAULT for pre-experience-brain legacy. Read for function / data / routing / permissions / content truth / state / interaction / capabilities. Never visual structure.', may_control_visuals: 'NONE', may_inform_function: true },
  VISUALLY_SUPERSEDED: { meaning: 'A newer authority replaced its visuals. Functional reference only; its geometry is history.', may_control_visuals: 'NONE', may_inform_function: true },
  FORBIDDEN_VISUAL_SOURCE: { meaning: 'Must not be used visually at all (wrong brand, another project, rejected direction).', may_control_visuals: 'NONE', may_inform_function: true },
};

export const DEFAULT_LEGACY_VISUAL_CLASS: LegacyVisualClass = 'FUNCTIONAL_REFERENCE_ONLY';

export const LEGACY_FUNCTIONAL_DIMENSIONS = [
  'FUNCTION', 'DATA', 'ROUTING', 'PERMISSIONS', 'CONTENT_TRUTH', 'STATE', 'INTERACTION', 'CAPABILITIES',
] as const;
export const LEGACY_VISUAL_DIMENSIONS = [
  'LAYOUT', 'GEOMETRY', 'PANEL_SYSTEM', 'NAV_VISUALS', 'SPACING', 'TYPOGRAPHY', 'COLOR', 'MATERIAL', 'COMPOSITION', 'RESPONSIVE_DESIGN',
] as const;
export type LegacyFunctionalDimension = (typeof LEGACY_FUNCTIONAL_DIMENSIONS)[number];
export type LegacyVisualDimension = (typeof LEGACY_VISUAL_DIMENSIONS)[number];
export type LegacyUseDimension = LegacyFunctionalDimension | LegacyVisualDimension;

export type LegacySurface = {
  surface_id: string;
  project_id: string;
  actor: ExperienceActor | string;
  route: string;
  source: string;
  /** Omitted → DEFAULT_LEGACY_VISUAL_CLASS. Only a founder decision can set APPROVED / PARTIAL. */
  visual_class?: LegacyVisualClass;
  promoted_dimensions?: LegacyVisualDimension[];
  founder_decision?: string | null;
  functional_value: string[];
  note?: string;
};

/** A consumer (generator, implementer, territory author) declaring what it takes from a legacy surface. */
export type LegacyUse = { surface_id: string; uses: LegacyUseDimension[] };

/* ─────────────────────────────── 04 composition territories ─────────────────────────────── */

/** The six structural dimensions territories must differ on (not color / image / background / typeface). */
export const TERRITORY_STRUCTURAL_DIMENSIONS = [
  'spatial_logic', 'primary_zone', 'visual_hierarchy', 'interaction_emphasis', 'information_density', 'media_relationship',
] as const;
export type TerritoryStructuralDimension = (typeof TERRITORY_STRUCTURAL_DIMENSIONS)[number];

/** Cosmetic levers that never make two territories distinct on their own. */
export const TERRITORY_COSMETIC_LEVERS = ['color', 'hero_image', 'background', 'typeface', 'single_card_position'] as const;

export const DEFAULT_TERRITORY_COUNT = 3;
/** Minimum structural dimensions any two territories must differ on; spatial_logic or primary_zone must be among them. */
export const MIN_DISTINCT_STRUCTURAL_DIMENSIONS = 3;

export type TerritoryStatus = 'DRAFT' | 'IN_REVIEW' | 'SELECTED' | 'COMBINED' | 'REVISE' | 'REJECTED' | 'SUPERSEDED';

export type CompositionTerritory = {
  territory_id: string;
  project_id: string;
  family_id: string;
  feature_id: string;
  actor: ExperienceActor;
  name: string;
  concept: string;
  core_idea: string;
  metaphor: string;
  primary_object: string;
  /** Page logic — what the page IS (why a territory can never be purely aesthetic). */
  page_logic: string;
  major_zones: string[];
  structure: Record<TerritoryStructuralDimension, string>;
  composition_logic: string;
  actor_fit: string;
  state_fit: string;
  mobile_logic: string;
  desktop_logic: string;
  visual_language: string;
  risks: string[];
  brand_fit: string;
  experience_fit: string;
  cosmetic?: Partial<Record<(typeof TERRITORY_COSMETIC_LEVERS)[number], string>>;
  status: TerritoryStatus;
  founder_decision: string | null;
};

/* ─────────────────────────────── 05 reference authorities ─────────────────────────────── */

export type ReferenceAuthorityFormat =
  | 'GENERATED_FULL_PAGE_REFERENCE'
  | 'COMPOSED_BOARD'
  | 'EXISTING_APPROVED_PAGE'
  | 'HYBRID'
  | 'WIREFRAME_PLUS_BRAND_RENDER'
  | 'OTHER_APPROVED_PROOF';

/** What a reference authority must show. A mood collage, decorative art or a generic hero shows none of these. */
export const REFERENCE_AUTHORITY_MUST_SHOW = [
  'composition', 'hierarchy', 'zones', 'media_relationship', 'interaction_emphasis', 'actor_intent',
] as const;
export type ReferenceAuthorityProof = (typeof REFERENCE_AUTHORITY_MUST_SHOW)[number];

export type ReferenceAuthority = {
  reference_id: string;
  territory_id: string;
  format: ReferenceAuthorityFormat;
  reference_paths: string[];
  viewport: Viewport;
  states_shown: string[];
  shows: ReferenceAuthorityProof[];
  /** Role is the page-logic / composition / direction contract — never a final screenshot. */
  role: 'PAGE_LOGIC_COMPOSITION_DIRECTION_CONTRACT';
  paid_generation: boolean;
};

/* ─────────────────────────────── 06 founder review ─────────────────────────────── */

export type FounderAuthorityVerdict = 'LOVE_IT' | 'REVISE' | 'REJECT' | 'COMBINE' | 'REQUEST_FOURTH_TERRITORY';
export const FOUNDER_AUTHORITY_VERDICTS: readonly FounderAuthorityVerdict[] = ['LOVE_IT', 'REVISE', 'REJECT', 'COMBINE', 'REQUEST_FOURTH_TERRITORY'];
/** Verdicts that approve a direction (COMBINE = hybrid, e.g. A structure + C material). */
export const APPROVING_VERDICTS: readonly FounderAuthorityVerdict[] = ['LOVE_IT', 'COMBINE'];

export type FounderAuthorityDecision = {
  verdict: FounderAuthorityVerdict;
  territory_ids: string[];
  /** For COMBINE: which territory supplies which aspect (e.g. { STRUCTURE: 'A', MATERIAL: 'C' }). */
  combination?: Record<string, string>;
  notes: string;
  decided_at: string;
};

/* ─────────────────────────────── 07 page-family authority ─────────────────────────────── */

export type AuthorityFidelityLevel = 'CONCEPT_AUTHORITY' | 'COMPOSITION_AUTHORITY' | 'PAGE_FAMILY_AUTHORITY' | 'LIVE_AUTHORITY';
export const AUTHORITY_FIDELITY_LEVELS: readonly AuthorityFidelityLevel[] = ['CONCEPT_AUTHORITY', 'COMPOSITION_AUTHORITY', 'PAGE_FAMILY_AUTHORITY', 'LIVE_AUTHORITY'];

/** What implementation MAY NOT casually change (each lock carries the approved value). */
export const CORE_LOGIC_LOCK_KINDS = [
  'PRIMARY_COMPOSITION', 'PRIMARY_OBJECT', 'PRIMARY_AXIS', 'METAPHOR', 'SPATIAL_LOGIC', 'CORE_HIERARCHY', 'MAJOR_ZONES',
  'ZONE_RELATIONSHIP', 'CTA_HIERARCHY', 'MEDIA_RELATIONSHIP', 'STATE_TRANSITION_LOGIC', 'ACTOR_INTENT', 'CLIENT_STAFF_DISTINCTION',
  'APPROVED_TERRITORY', 'CORE_EXPERIENCE_LOGIC',
] as const;
export type CoreLogicLockKind = (typeof CORE_LOGIC_LOCK_KINDS)[number];

/** What implementation MAY improve (the authority is not a ceiling). */
export const FLEXIBLE_IMPLEMENTATION_AREAS = [
  'SPACING', 'MARGINS', 'MICRO_SPACING', 'RESPONSIVE_BEHAVIOR', 'BREAKPOINTS', 'MATERIAL_REALISM', 'MATERIAL_DEPTH',
  'MICRO_INTERACTIONS', 'MOTION', 'TRANSITIONS', 'ACCESSIBILITY', 'PANEL_PROPORTIONS', 'IMAGE_TREATMENT', 'MEDIA_FRAMING',
  'DENSITY', 'CONTROL_DENSITY', 'STATE_CLARITY', 'CONTROL_PLACEMENT', 'TYPOGRAPHIC_OPTICS', 'SMALL_TYPOGRAPHY_ADJUSTMENTS',
] as const;
export type FlexibleImplementationArea = (typeof FLEXIBLE_IMPLEMENTATION_AREAS)[number];

export type CoreLogicLock = { kind: CoreLogicLockKind; value: string };

export type AuthorityLineage = {
  created: string;
  territory_lineage: string[];
  founder_decisions: string[];
  superseded_by: string | null;
  reason?: string;
};

export type PageFamilyAuthority = {
  authority_id: string;
  project_id: string;
  family_id: string;
  feature_id: string;
  actor: ExperienceActor;
  viewports: Viewport[];
  /** Viewports this authority may be adapted to without its own authority (only when the composition genuinely scales). */
  scales_to?: Viewport[];
  state_coverage: string[];
  territory_source: string[];
  founder_status: 'PENDING' | 'APPROVED' | 'REVISE' | 'REJECTED';
  authority_level: AuthorityFidelityLevel;
  core_logic_locks: CoreLogicLock[];
  flexible_implementation_areas: FlexibleImplementationArea[];
  reference_paths: string[];
  brand_context_id: string;
  experience_contract_id: string;
  supersedes: string | null;
  lineage: AuthorityLineage;
};

/** Minimum core locks a PAGE_FAMILY_AUTHORITY must carry to be implementation-ready. */
export const REQUIRED_CORE_LOCKS: readonly CoreLogicLockKind[] = ['PRIMARY_OBJECT', 'PRIMARY_COMPOSITION', 'MAJOR_ZONES', 'CORE_HIERARCHY', 'CTA_HIERARCHY'];

/* ─────────────────────────────── 08–09 implementation ─────────────────────────────── */

export type ImplementationChange = {
  area: CoreLogicLockKind | FlexibleImplementationArea;
  description: string;
  explanation?: string;
};

export type ImplementationReport = {
  status: 'NOT_STARTED' | 'IMPLEMENTING' | 'COMPLETE';
  changes: ImplementationChange[];
  /** What the implementation actually ships for locked kinds (compared to the authority's lock values). */
  observed?: Partial<Record<CoreLogicLockKind, string>>;
  legacy_uses?: LegacyUse[];
  live_founder_approved?: boolean;
};

/* ─────────────────────────────── gate input / registries ─────────────────────────────── */

export type AuthorityGateInput = {
  project_id: string;
  family_id: string;
  feature_id: string;
  actor: ExperienceActor;
  material: boolean;
  family_locked: boolean;
  experience_contract?: ExperienceContract | null;
  brand_context?: BrandContext | null;
  legacy_surfaces?: LegacySurface[] | null;
  legacy_uses?: LegacyUse[];
  territories?: CompositionTerritory[];
  references?: ReferenceAuthority[];
  founder_decision?: FounderAuthorityDecision | null;
  authority?: PageFamilyAuthority | null;
  implementation?: ImplementationReport | null;
};

export type VisualAuthorityRegistryRow = {
  project_id: string;
  family_id: string;
  feature_id: string;
  actor: ExperienceActor;
  authority_id: string | null;
  authority_level: AuthorityFidelityLevel | null;
  status: AuthorityProductionState;
  guard: AuthorityGuardStatus | null;
  reference_paths: string[];
  brand_context_id: string | null;
  experience_contract_id: string | null;
  territory_id: string | null;
  core_logic_locks: CoreLogicLock[];
  flexible_areas: FlexibleImplementationArea[];
  founder_decision: string | null;
  created_at: string;
  updated_at: string;
  supersedes: string | null;
};

export type CompositionTerritoryRegistryRow = Pick<
  CompositionTerritory,
  'territory_id' | 'project_id' | 'family_id' | 'feature_id' | 'actor' | 'name' | 'concept' | 'metaphor' | 'primary_object' |
  'composition_logic' | 'mobile_logic' | 'desktop_logic' | 'brand_fit' | 'experience_fit' | 'status' | 'founder_decision'
>;

/** Projects this methodology must serve (portability is tested against samples for each). */
export const PORTABLE_PROJECTS = ['SITE00', 'JURNL', 'AIO', 'FRONTAL_SLAYER', 'ASTRAL_WORLD', 'FUTURE_CLIENT_PROJECT'] as const;
