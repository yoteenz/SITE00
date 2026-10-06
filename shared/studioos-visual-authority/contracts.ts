/**
 * Machine-readable contracts of the Visual Authority Development Gate (exported to docs/studioos/visual-authority-development).
 */
import {
  APPROVING_VERDICTS,
  AUTHORITY_DEVELOPMENT_SEQUENCE,
  AUTHORITY_FIDELITY_LEVELS,
  AUTHORITY_GUARD_STATUSES,
  AUTHORITY_PIPELINE_DOCTRINE,
  AUTHORITY_PRODUCTION_STACK,
  AUTHORITY_PRODUCTION_STATES,
  CORE_LOGIC_LOCK_KINDS,
  DEFAULT_LEGACY_VISUAL_CLASS,
  DEFAULT_TERRITORY_COUNT,
  DURABLE_GATE_CONDITIONS,
  FLEXIBLE_IMPLEMENTATION_AREAS,
  FOUNDER_AUTHORITY_VERDICTS,
  LEGACY_FUNCTIONAL_DIMENSIONS,
  LEGACY_VISUAL_CLASSES,
  LEGACY_VISUAL_DIMENSIONS,
  MIN_DISTINCT_STRUCTURAL_DIMENSIONS,
  PORTABLE_PROJECTS,
  RECOMMENDED_BRAND_FIELDS,
  REFERENCE_AUTHORITY_MUST_SHOW,
  REQUIRED_BRAND_FIELDS,
  REQUIRED_CORE_LOCKS,
  REQUIRED_EXPERIENCE_INGEST_FIELDS,
  SUPERSEDED_METHODOLOGY,
  SUPERSEDED_PIPELINE,
  TERRITORY_COSMETIC_LEVERS,
  TERRITORY_STRUCTURAL_DIMENSIONS,
  VISUAL_AUTHORITY_DOCTRINE,
  VISUAL_AUTHORITY_SCHEMA_VERSION,
  VISUAL_AUTHORITY_SPRINT,
  type AuthorityProductionState,
} from './schema.js';

const head = (id: string) => ({ id, schema_version: VISUAL_AUTHORITY_SCHEMA_VERSION, sprint: VISUAL_AUTHORITY_SPRINT, doctrine: VISUAL_AUTHORITY_DOCTRINE, source: 'shared/studioos-visual-authority' });

const str = { type: 'string' } as const;
const strs = { type: 'array', items: str } as const;
const en = (v: readonly string[]) => ({ type: 'string', enum: [...v] });

export const VISUAL_AUTHORITY_DEVELOPMENT_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  ...head('VISUAL_AUTHORITY_DEVELOPMENT_SCHEMA'),
  title: 'Visual Authority Development Gate input (one actor page family)',
  production_stack: AUTHORITY_PRODUCTION_STACK,
  sequence: AUTHORITY_DEVELOPMENT_SEQUENCE,
  supersedes_methodology: SUPERSEDED_METHODOLOGY,
  pipeline_doctrine: AUTHORITY_PIPELINE_DOCTRINE,
  supersedes_pipeline: SUPERSEDED_PIPELINE,
  gate_inputs: ['brand DNA', 'product ontology', 'family contract', 'feature experience contract', 'actor model', 'state model', 'visual archetype', 'approved assets / references', 'legacy visual status', 'viewport targets'],
  type: 'object',
  required: ['project_id', 'family_id', 'feature_id', 'actor', 'material', 'family_locked'],
  properties: {
    project_id: str, family_id: str, feature_id: str,
    actor: en(['PUBLIC', 'CLIENT', 'FOUNDER_STAFF', 'SYSTEM']),
    material: { type: 'boolean' }, family_locked: { type: 'boolean' },
    experience_contract: { $ref: '../experience-brain/WORKSPACE_EXPERIENCE_BRAIN_SCHEMA.json' },
    brand_context: { $ref: '#/$defs/BrandContext' },
    legacy_surfaces: { type: 'array', items: { $ref: '#/$defs/LegacySurface' } },
    legacy_uses: { type: 'array', items: { type: 'object', required: ['surface_id', 'uses'], properties: { surface_id: str, uses: { type: 'array', items: en([...LEGACY_FUNCTIONAL_DIMENSIONS, ...LEGACY_VISUAL_DIMENSIONS]) } } } },
    territories: { type: 'array', items: { $ref: 'COMPOSITION_TERRITORY_SCHEMA.json' } },
    references: { type: 'array', items: { $ref: '#/$defs/ReferenceAuthority' } },
    founder_decision: { $ref: '#/$defs/FounderAuthorityDecision' },
    authority: { $ref: '#/$defs/PageFamilyAuthority' },
    derivation: { $ref: '#/$defs/AuthorityDerivation' },
    page_tree: { $ref: '#/$defs/PageTreeConfirmation' },
    implementation: { $ref: 'AUTHORITY_IMPLEMENTATION_CONTRACT.json#/report_schema' },
  },
  $defs: {
    BrandContext: {
      type: 'object',
      required: ['brand_context_id', 'project_id', ...REQUIRED_BRAND_FIELDS],
      properties: { brand_context_id: str, project_id: str, positioning: str, audience: str, voice: strs, color: strs, materials: strs, typography: str, logo_rules: str, mood: str, references: strs, architectural_language: str, avoid_list: strs, history: strs, approved_decisions: strs, open_brand_questions: strs },
      recommended: RECOMMENDED_BRAND_FIELDS,
      on_missing: 'BRAND_CONTEXT_REQUIRED',
    },
    ExperienceIngest: { required: REQUIRED_EXPERIENCE_INGEST_FIELDS, projected_by: 'experienceIngest(contract, actor)', on_missing: 'EXPERIENCE_REQUIRED' },
    LegacySurface: {
      type: 'object',
      required: ['surface_id', 'project_id', 'actor', 'route', 'source', 'functional_value'],
      properties: { surface_id: str, project_id: str, actor: str, route: str, source: str, visual_class: en(Object.keys(LEGACY_VISUAL_CLASSES)), promoted_dimensions: { type: 'array', items: en(LEGACY_VISUAL_DIMENSIONS) }, founder_decision: { type: ['string', 'null'] }, functional_value: strs, note: str },
      default_visual_class: DEFAULT_LEGACY_VISUAL_CLASS,
    },
    ReferenceAuthority: {
      type: 'object',
      required: ['reference_id', 'territory_id', 'format', 'reference_paths', 'viewport', 'states_shown', 'shows', 'role', 'paid_generation'],
      properties: {
        reference_id: str, territory_id: str,
        format: en(['GENERATED_FULL_PAGE_REFERENCE', 'COMPOSED_BOARD', 'EXISTING_APPROVED_PAGE', 'HYBRID', 'WIREFRAME_PLUS_BRAND_RENDER', 'OTHER_APPROVED_PROOF']),
        reference_paths: strs, viewport: en(['MOBILE', 'TABLET', 'DESKTOP']), states_shown: strs,
        shows: { type: 'array', items: en(REFERENCE_AUTHORITY_MUST_SHOW) },
        role: { const: 'PAGE_LOGIC_COMPOSITION_DIRECTION_CONTRACT' }, paid_generation: { type: 'boolean' },
      },
      must_show_all: REFERENCE_AUTHORITY_MUST_SHOW,
    },
    FounderAuthorityDecision: {
      type: 'object', required: ['verdict', 'territory_ids', 'notes', 'decided_at'],
      properties: { verdict: en(FOUNDER_AUTHORITY_VERDICTS), territory_ids: strs, combination: { type: 'object', additionalProperties: str }, notes: str, decided_at: str },
      approving: APPROVING_VERDICTS,
    },
    PageFamilyAuthority: {
      type: 'object',
      required: ['authority_id', 'project_id', 'family_id', 'feature_id', 'actor', 'viewports', 'state_coverage', 'territory_source', 'founder_status', 'authority_level', 'core_logic_locks', 'flexible_implementation_areas', 'supersedes', 'lineage'],
      properties: {
        authority_id: str, project_id: str, family_id: str, feature_id: str, actor: str,
        viewports: { type: 'array', items: en(['MOBILE', 'TABLET', 'DESKTOP']) }, scales_to: { type: 'array', items: en(['MOBILE', 'TABLET', 'DESKTOP']) },
        state_coverage: strs, territory_source: strs,
        founder_status: en(['PENDING', 'APPROVED', 'REVISE', 'REJECTED']), authority_level: en(AUTHORITY_FIDELITY_LEVELS),
        core_logic_locks: { type: 'array', items: { type: 'object', required: ['kind', 'value'], properties: { kind: en(CORE_LOGIC_LOCK_KINDS), value: str } } },
        flexible_implementation_areas: { type: 'array', items: en(FLEXIBLE_IMPLEMENTATION_AREAS) },
        reference_paths: strs, brand_context_id: str, experience_contract_id: str, supersedes: { type: ['string', 'null'] },
        lineage: { type: 'object', required: ['created', 'territory_lineage', 'founder_decisions', 'superseded_by'], properties: { created: str, territory_lineage: strs, founder_decisions: strs, superseded_by: { type: ['string', 'null'] }, reason: str } },
      },
      required_core_locks: REQUIRED_CORE_LOCKS,
      is_not: 'the final design — it locks page logic, composition, spatial relationship, visual direction, primary metaphor, information hierarchy, zone relationship and experience emphasis.',
    },
    AuthorityDerivation: {
      type: 'object', required: ['parent', 'parent_territories', 'references'],
      properties: { parent: { $ref: '#/$defs/PageFamilyAuthority' }, parent_territories: { type: 'array', items: { $ref: 'COMPOSITION_TERRITORY_SCHEMA.json' } }, references: { type: 'array', items: { $ref: '#/$defs/ReferenceAuthority' } } },
      rule: 'Parent authority precedes actor / viewport derivation. A derived actor inherits the territory step from a LOCKED parent of the same family (another actor) whose territories are distinct; its own references trace to a parent source territory and show all six proofs; it still needs its own founder approval and lock.',
      evaluator: 'checkDerivation(input, derivation)',
    },
    PageTreeConfirmation: {
      type: 'object', required: ['tree_id', 'status', 'produced_at', 'confirmed_at', 'founder_decision'],
      properties: { tree_id: str, status: en(['NOT_PRODUCED', 'PRODUCED', 'FOUNDER_CONFIRMED']), produced_at: { type: ['string', 'null'] }, confirmed_at: { type: ['string', 'null'] }, founder_decision: { type: ['string', 'null'] }, open_decisions: strs },
      rule: 'The Brain produces the page / tab / state tree (tabs are first-class nodes) from the locked authority package; implementation may begin only after FOUNDER_CONFIRMED.',
      on_missing: 'PAGE_TREE_CONFIRMATION_REQUIRED',
    },
  },
};

const NEXT: Record<AuthorityProductionState, AuthorityProductionState[]> = {
  FAMILY_LOCKED: ['EXPERIENCE_REQUIRED', 'EXPERIENCE_COMPLETE'],
  EXPERIENCE_REQUIRED: ['EXPERIENCE_COMPLETE'],
  EXPERIENCE_COMPLETE: ['BRAND_CONTEXT_REQUIRED', 'AUTHORITY_TERRITORIES_REQUIRED'],
  BRAND_CONTEXT_REQUIRED: ['AUTHORITY_TERRITORIES_REQUIRED'],
  AUTHORITY_TERRITORIES_REQUIRED: ['AUTHORITY_IN_REVIEW'],
  AUTHORITY_IN_REVIEW: ['AUTHORITY_TERRITORIES_REQUIRED', 'AUTHORITY_APPROVED'],
  AUTHORITY_APPROVED: ['IMPLEMENTATION_READY'],
  IMPLEMENTATION_READY: ['IMPLEMENTING'],
  IMPLEMENTING: ['LIVE_REVIEW'],
  LIVE_REVIEW: ['IMPLEMENTING', 'LIVE_AUTHORITY'],
  LIVE_AUTHORITY: ['AUTHORITY_TERRITORIES_REQUIRED'],
};

export const VISUAL_AUTHORITY_STATE_MODEL = {
  ...head('VISUAL_AUTHORITY_STATE_MODEL'),
  states: AUTHORITY_PRODUCTION_STATES.map((s) => ({ state: s, next: NEXT[s] })),
  entry_conditions: {
    FAMILY_LOCKED: 'Product tree / family lock exists (otherwise guard FAMILY_LOCK_REQUIRED).',
    EXPERIENCE_REQUIRED: 'Experience contract missing or not experience-ready (validateExperienceContract) or ingest fields missing.',
    EXPERIENCE_COMPLETE: 'Experience contract experience-ready and ingest complete.',
    BRAND_CONTEXT_REQUIRED: 'Brand DNA missing or a required brand field is empty (too thin).',
    AUTHORITY_TERRITORIES_REQUIRED: 'Brand + experience loaded, legacy classified; fewer than 3 live territories, territories not distinct, or reference authorities missing — or, for a derived actor, the parent authority is not locked / derived references are missing.',
    AUTHORITY_IN_REVIEW: '3 distinct territories each with a reference authority; founder verdict absent or REVISE / REJECT / REQUEST_FOURTH_TERRITORY.',
    AUTHORITY_APPROVED: 'Founder verdict LOVE_IT or COMBINE; page-family authority not yet fully locked — or locked while the page / tab / state tree is not founder-confirmed (guard PAGE_TREE_CONFIRMATION_REQUIRED).',
    IMPLEMENTATION_READY: 'Authority locked (founder APPROVED, ≥ PAGE_FAMILY_AUTHORITY, required core locks, flexible areas, viewports, state coverage, lineage) AND the page / tab / state tree is founder-confirmed.',
    IMPLEMENTING: 'Implementation in progress against the locked authority.',
    LIVE_REVIEW: 'Implementation complete; founder reviewing live.',
    LIVE_AUTHORITY: 'Founder approved the live implementation; it becomes the authority with lineage retained.',
    'LIVE_AUTHORITY → AUTHORITY_TERRITORIES_REQUIRED': 'Reconceptualisation: a NEW authority version (supersedes + reason + founder decision).',
  },
  guards: Object.fromEntries(AUTHORITY_GUARD_STATUSES.map((g) => [g, ({
    FAMILY_LOCK_REQUIRED: 'Family not locked — nothing downstream may start.',
    VISUAL_AUTHORITY_REQUIRED: 'Durable rule unmet for a material family — implementation / generation blocked.',
    LEGACY_VISUAL_LEAK: 'A non-approved legacy surface supplied a visual dimension (layout, geometry, panels, nav visuals, spacing, typography, color, material, composition, responsive).',
    TERRITORY_DISTINCTNESS_FAILURE: 'Territories differ only cosmetically or lack page logic.',
    REFERENCE_AUTHORITY_REQUIRED: 'A territory has no reference authority, or the reference does not show composition / hierarchy / zones / media / interaction / actor intent.',
    FOUNDER_REVIEW_REQUIRED: 'Implementation changed a core logic lock (material deviation).',
    RESPONSIVE_AUTHORITY_REQUIRED: 'Requested viewport not covered and the composition is not declared to scale — do not shrink desktop into mobile.',
    AUTHORITY_AS_RUNTIME_ASSET: 'A reference authority image was shipped as a runtime asset. AUTHORITY ≠ RUNTIME ASSET.',
    PAGE_TREE_CONFIRMATION_REQUIRED: 'Authority locked but the page / tab / state tree is not produced or not founder-confirmed — implementation may not begin.',
  } as Record<string, string>)[g]])),
  durable_rule: {
    statement: 'No material page family moves from experience contract to implementation unless all eight conditions hold (authority package + founder-confirmed page / tab / state tree); otherwise STATUS: VISUAL_AUTHORITY_REQUIRED or PAGE_TREE_CONFIRMATION_REQUIRED.',
    conditions: DURABLE_GATE_CONDITIONS,
    implementation_blocker: 'material && AUTHORITY_APPROVED != true → IMPLEMENTATION_READY = false',
  },
  evaluator: 'evaluateAuthorityGate(input) → { state, guard, durable_rule, conditions, implementation_ready, next_step, reasons }',
};

export const COMPOSITION_TERRITORY_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  ...head('COMPOSITION_TERRITORY_SCHEMA'),
  title: 'Composition territory',
  default_count: DEFAULT_TERRITORY_COUNT,
  type: 'object',
  required: ['territory_id', 'project_id', 'family_id', 'feature_id', 'actor', 'name', 'concept', 'core_idea', 'metaphor', 'primary_object', 'page_logic', 'major_zones', 'structure', 'composition_logic', 'actor_fit', 'state_fit', 'mobile_logic', 'desktop_logic', 'visual_language', 'risks', 'brand_fit', 'experience_fit', 'status', 'founder_decision'],
  properties: {
    territory_id: str, project_id: str, family_id: str, feature_id: str, actor: str, name: str, concept: str, core_idea: str, metaphor: str, primary_object: str,
    page_logic: str, major_zones: strs,
    structure: { type: 'object', required: [...TERRITORY_STRUCTURAL_DIMENSIONS], properties: Object.fromEntries(TERRITORY_STRUCTURAL_DIMENSIONS.map((d) => [d, str])) },
    composition_logic: str, actor_fit: str, state_fit: str, mobile_logic: str, desktop_logic: str, visual_language: str, risks: strs, brand_fit: str, experience_fit: str,
    cosmetic: { type: 'object', properties: Object.fromEntries(TERRITORY_COSMETIC_LEVERS.map((d) => [d, str])) },
    status: en(['DRAFT', 'IN_REVIEW', 'SELECTED', 'COMBINED', 'REVISE', 'REJECTED', 'SUPERSEDED']),
    founder_decision: { type: ['string', 'null'] },
  },
  distinctness: {
    must_differ_on: TERRITORY_STRUCTURAL_DIMENSIONS,
    min_differing_dimensions_per_pair: MIN_DISTINCT_STRUCTURAL_DIMENSIONS,
    anchor: 'Each pair must differ on spatial_logic or primary_zone.',
    never_sufficient: TERRITORY_COSMETIC_LEVERS,
    page_logic_required: 'page_logic, major_zones, primary_object and all six structure dimensions must be filled — otherwise the territory is purely aesthetic.',
    failure: 'TERRITORY_DISTINCTNESS_FAILURE',
    quality_test: 'If territories could be produced by swapping hero images, swapping colors or moving one card → failure.',
    evaluator: 'checkTerritoryDistinctness(territories)',
  },
};

export const LEGACY_VISUAL_AUTHORITY_POLICY = {
  ...head('LEGACY_VISUAL_AUTHORITY_POLICY'),
  classes: LEGACY_VISUAL_CLASSES,
  default_class: DEFAULT_LEGACY_VISUAL_CLASS,
  default_rule: 'Pre-experience-brain legacy surfaces are FUNCTIONAL_REFERENCE_ONLY unless the founder promotes them. A class of APPROVED / PARTIAL without a founder decision falls back to the default.',
  firewall: {
    may_inform: LEGACY_FUNCTIONAL_DIMENSIONS,
    may_not_control: LEGACY_VISUAL_DIMENSIONS,
    statement: 'A non-approved legacy surface may be read for function, data, routing, permissions, content truth, state, interaction and capabilities. It may NOT control layout, geometry, panel system, nav visuals, spacing, typography, color, material, composition or responsive design.',
  },
  promotion: 'Only a founder decision promotes a legacy surface (APPROVED_AUTHORITY, or PARTIAL_AUTHORITY with promoted_dimensions).',
  guard: { status: 'LEGACY_VISUAL_LEAK', evaluator: 'checkLegacyUse(surfaces, uses)', trigger: 'Any visual dimension taken from a surface whose class does not allow it.' },
  known_failure: 'AIO IFTA: OLD PAGE + NEW CONTENT — new experience content placed on legacy page geometry.',
};

export const AUTHORITY_IMPLEMENTATION_CONTRACT = {
  ...head('AUTHORITY_IMPLEMENTATION_CONTRACT'),
  consumes: ['PAGE_FAMILY_AUTHORITY', 'EXPERIENCE_CONTRACT', 'BRAND_DNA', 'STATE_CONTRACT', 'INTERACTION_CONTRACT', 'RESPONSIVE_CONTRACT'],
  authority_is_not_a_ceiling: 'Implementation may improve the authority. It must explain any material deviation.',
  may_improve: FLEXIBLE_IMPLEMENTATION_AREAS,
  may_not_casually_change: CORE_LOGIC_LOCK_KINDS,
  material_deviation: {
    examples: ['primary layout change', 'zone removal', 'primary object change', 'metaphor change', 'hierarchy change', 'actor experience change'],
    outcome: 'FOUNDER_REVIEW_REQUIRED',
    evaluator: 'classifyDeviation(authority, report) — declared core-lock changes and observed lock drift are both material.',
    resolution: 'Founder approves (new authority version, supersedes the old, lineage kept) or implementation reverts.',
  },
  fidelity_escalation_increases: ['responsiveness', 'interactivity', 'state completeness', 'accessibility', 'material realism', 'content fidelity', 'system integration'],
  implementation_blocker: 'Material page family with AUTHORITY_APPROVED != true → IMPLEMENTATION_READY = false.',
  report_schema: {
    type: 'object', required: ['status', 'changes'],
    properties: {
      status: en(['NOT_STARTED', 'IMPLEMENTING', 'COMPLETE']),
      changes: { type: 'array', items: { type: 'object', required: ['area', 'description'], properties: { area: en([...CORE_LOGIC_LOCK_KINDS, ...FLEXIBLE_IMPLEMENTATION_AREAS]), description: str, explanation: str } } },
      observed: { type: 'object', properties: Object.fromEntries(CORE_LOGIC_LOCK_KINDS.map((k) => [k, str])) },
      legacy_uses: { type: 'array' },
      live_founder_approved: { type: 'boolean' },
    },
  },
};

export const AUTHORITY_FIDELITY_MODEL = {
  ...head('AUTHORITY_FIDELITY_MODEL'),
  levels: [
    { level: 'CONCEPT_AUTHORITY', proves: 'territory idea, metaphor, primary object', locks: ['APPROVED_TERRITORY', 'METAPHOR'], typical_format: 'composed board / concept frame' },
    { level: 'COMPOSITION_AUTHORITY', proves: 'zones, hierarchy, spatial logic, media relationship for key states', locks: ['PRIMARY_COMPOSITION', 'MAJOR_ZONES', 'SPATIAL_LOGIC', 'MEDIA_RELATIONSHIP'], typical_format: 'wireframe + brand render / generated full-page reference' },
    { level: 'PAGE_FAMILY_AUTHORITY', proves: 'approved page logic across the family’s states and viewports; core logic locks + flexible areas', locks: REQUIRED_CORE_LOCKS, typical_format: 'locked authority record + reference set' },
    { level: 'LIVE_AUTHORITY', proves: 'the founder-approved live implementation', locks: 'inherits page-family locks; lineage kept', typical_format: 'live page + capture' },
  ],
  order: AUTHORITY_FIDELITY_LEVELS,
  implementation_minimum: 'PAGE_FAMILY_AUTHORITY',
  live_authority: 'After implementation + founder approval the live implementation becomes LIVE_AUTHORITY without erasing lineage (territories, references, decisions stay).',
  regeneration: 'Reconceptualisation never edits an authority in place: it creates a NEW version with supersedes, reason and founder decision.',
  responsive_authority: 'Mobile / tablet / desktop get independent authorities when the composition cannot scale; scales_to declares the viewports one authority may adapt to. Never shrink desktop into mobile.',
  authority_vs_runtime: 'AUTHORITY ≠ RUNTIME ASSET — reference images direct composition; they are never shipped as page assets.',
};

export const AUTHORITY_REVIEW_CONTRACT = {
  ...head('AUTHORITY_REVIEW_CONTRACT'),
  verdicts: {
    LOVE_IT: 'Approve one territory → lock it.',
    REVISE: 'Keep the territory, change named aspects → stays AUTHORITY_IN_REVIEW.',
    REJECT: 'Territory removed from consideration (status REJECTED); if fewer than 3 remain → AUTHORITY_TERRITORIES_REQUIRED.',
    COMBINE: 'Hybrid authority (e.g. A structure + C material) — combination map required → approval.',
    REQUEST_FOURTH_TERRITORY: 'Author an additional territory → stays AUTHORITY_IN_REVIEW.',
  },
  approving_verdicts: APPROVING_VERDICTS,
  no_lock_without: 'founder approval',
  review_packet: ['brand DNA summary', 'experience contract summary (actor, task, states, metaphor, hierarchy)', 'legacy status table', '3 territories (each with page logic + structure dimensions)', 'distinctness report', 'one reference authority per territory', 'risks per territory'],
  lock_record_fields: ['AUTHORITY_ID', 'PROJECT_ID', 'FAMILY_ID', 'FEATURE_ID', 'ACTOR', 'VIEWPORT', 'STATE_COVERAGE', 'TERRITORY_SOURCE', 'FOUNDER_STATUS', 'CORE_LOGIC_LOCKS', 'FLEXIBLE_IMPLEMENTATION_AREAS', 'SUPERSEDES', 'LINEAGE'],
  core_logic_lock_examples: ['primary object', 'primary axis', 'major zones', 'CTA hierarchy', 'media relationship', 'state transition logic', 'client / staff distinction'],
  flexible_area_examples: ['margins', 'micro-spacing', 'breakpoints', 'control density', 'material depth', 'small typography adjustments', 'motion', 'accessibility', 'media framing'],
  review_ui: {
    target_workspaces: ['DESIGN', 'EXPERIENCE', 'EXPRESSION', 'REVIEWS'],
    status: 'DATA_CONTRACT_ONLY',
    note: 'Methodology + data contract first. No Studio OS UI was changed in this sprint; the review workspace consumes the registries when built.',
  },
};

export const AUTHORITY_PAGE_GENERATION_GUARD = {
  ...head('AUTHORITY_PAGE_GENERATION_GUARD'),
  rule: 'Generators receive BRAND DNA + EXPERIENCE CONTRACT + PAGE-FAMILY AUTHORITY + CONFIRMED PAGE TREE + STATE + VIEWPORT — never route + copy only.',
  evaluator: 'guardPageGeneration(request)',
  order: [
    'EXPERIENCE_REQUIRED — experience contract missing / not ready',
    'BRAND_CONTEXT_REQUIRED — brand DNA missing / thin',
    'LEGACY_VISUAL_LEAK — legacy visual dimension requested from a non-approved surface',
    'VISUAL_AUTHORITY_REQUIRED — material family without a locked page-family authority, or state not covered',
    'PAGE_TREE_CONFIRMATION_REQUIRED — page / tab / state tree not founder-confirmed',
    'RESPONSIVE_AUTHORITY_REQUIRED — viewport not covered and not declared scalable',
    'AUTHORITY_AS_RUNTIME_ASSET — reference path shipped as a runtime asset',
    'GENERATE',
  ],
  route_and_copy_only: 'A request carrying only route + copy fails at the first missing input.',
  paid_generation: 'This guard never triggers generation itself; paid generation stays a founder-approved action.',
};

export const VISUAL_AUTHORITY_PORTABILITY = { projects: PORTABLE_PROJECTS };
