/**
 * P0.SITE00.WORKSPACE-EXPERIENCE-BRAIN.CANONICAL-SCHEMA-AIO-PROOF1 — Workspace Experience Brain: canonical schema.
 *
 * The EXPERIENCE layer of the Studio OS production stack. It bridges STRUCTURE (what exists — product graph,
 * routes, data contracts, Capability Genome) and EXPRESSION (how it looks — Experience Compiler archetypes and
 * authorities, Experience Engine V0 fidelity proofs). It does NOT replace any of them: contracts reference them.
 *
 * Portable by design: nothing here knows about a specific project. Project facts (palette, brand voice, routes,
 * role projections) live in a project's ProjectExperienceDna + contracts under ./projects/<project>/.
 *
 * Naming: "Experience Engine" is already taken in this repo (shared/site00-experience-engine — the V0 route-reference
 * / pixel-fidelity engine). The brain keeps the founder's working name WORKSPACE EXPERIENCE BRAIN and its system
 * role is EXPERIENCE_CONTRACT_LAYER; it feeds the Experience Compiler and Experience Engine V0, it does not rename them.
 */

export const EXPERIENCE_BRAIN_SCHEMA_VERSION = '1.0.0' as const;
export const EXPERIENCE_BRAIN_SPRINT = 'P0.SITE00.WORKSPACE-EXPERIENCE-BRAIN.CANONICAL-SCHEMA-AIO-PROOF1' as const;

/* ─────────────────────────────── production stack ─────────────────────────────── */

export type ProductionLayer = 'STRUCTURE' | 'EXPERIENCE' | 'EXPRESSION' | 'IMPLEMENTATION';

export const PRODUCTION_LAYERS: readonly {
  layer: ProductionLayer;
  question: string;
  owns: string[];
  existing_systems: string[];
  experience_brain_relationship: string;
}[] = [
  {
    layer: 'STRUCTURE',
    question: 'What exists?',
    owns: ['product ontology / families', 'routes / node types', 'data contracts', 'state enums', 'dependencies', 'capabilities'],
    existing_systems: ['project canonical product graph (e.g. AIO_CANONICAL_PRODUCT_GRAPH.json)', 'docs/site00/capability-genome', 'route registries'],
    experience_brain_relationship: 'Contracts REFERENCE structure (structure_refs); the brain never redefines routes, data or families.',
  },
  {
    layer: 'EXPERIENCE',
    question: 'How is it lived — by every actor, on every surface, in every state?',
    owns: ['experience contracts', 'four-actor perspectives', 'state → visual relationships', 'artifacts / events / cross-feature effects', 'experience E2E contracts', 'experience completion'],
    existing_systems: ['shared/studioos-experience-brain (this layer)'],
    experience_brain_relationship: 'This layer.',
  },
  {
    layer: 'EXPRESSION',
    question: 'How does it look and feel?',
    owns: ['page archetypes', 'visual authorities', 'brand canon', 'screen families', 'fidelity proofs'],
    existing_systems: ['shared/studioos-experience-compiler + docs/studioos/experience-compiler (page archetype taxonomy, authority registry)', 'shared/site00-experience-engine (Experience Engine V0 — fidelity)', 'brand lore / project skin'],
    experience_brain_relationship: 'Expression CONSUMES experience briefs (queryExperience) — archetype, primary object, composition, must/quiet/never.',
  },
  {
    layer: 'IMPLEMENTATION',
    question: 'How does it run?',
    owns: ['code', 'persistence', 'workflow engines', 'tests', 'deployment'],
    existing_systems: ['project source repositories', 'E2E suites'],
    experience_brain_relationship: 'Implementation is measured against experience E2E contracts; functional completion stays a separate axis.',
  },
];

/* ─────────────────────────────── actors / viewports / states ─────────────────────────────── */

export type ExperienceActor = 'PUBLIC' | 'CLIENT' | 'FOUNDER_STAFF' | 'SYSTEM';
export const EXPERIENCE_ACTORS: readonly ExperienceActor[] = ['PUBLIC', 'CLIENT', 'FOUNDER_STAFF', 'SYSTEM'];

export type Viewport = 'MOBILE' | 'TABLET' | 'DESKTOP';
export const VIEWPORTS: readonly Viewport[] = ['MOBILE', 'TABLET', 'DESKTOP'];

/** Canonical classes every feature-specific state maps onto (composition emphasis is defined per class + state). */
export type StateClass = 'EMPTY' | 'ACTIVE' | 'BLOCKED' | 'REVIEW' | 'APPROVAL' | 'COMPLETE' | 'ARCHIVED' | 'ERROR';
export const STATE_CLASSES: readonly StateClass[] = ['EMPTY', 'ACTIVE', 'BLOCKED', 'REVIEW', 'APPROVAL', 'COMPLETE', 'ARCHIVED', 'ERROR'];

/** Experience completion ladder — separate from functional completion (a route existing proves nothing here). */
export type ExperienceCompletion =
  | 'UNMAPPED'
  | 'STRUCTURED'
  | 'EXPERIENCE_DRAFTED'
  | 'EXPERIENCE_COMPLETE'
  | 'VISUALIZED'
  | 'IMPLEMENTED'
  | 'E2E_PROVEN'
  | 'APPROVED';
export const EXPERIENCE_COMPLETION_LADDER: readonly ExperienceCompletion[] = [
  'UNMAPPED',
  'STRUCTURED',
  'EXPERIENCE_DRAFTED',
  'EXPERIENCE_COMPLETE',
  'VISUALIZED',
  'IMPLEMENTED',
  'E2E_PROVEN',
  'APPROVED',
];

/* ─────────────────────────────── visual vocabulary (portable) ─────────────────────────────── */

export type VisualArchetype =
  | 'WORKBENCH'
  | 'CHECKLIST'
  | 'TIMELINE'
  | 'ARCHIVE'
  | 'LEDGER'
  | 'ROUTE'
  | 'QUEUE'
  | 'DECISION_WINDOW'
  | 'CABINET'
  | 'PACKET_BUILDER'
  | 'MATCHING_BOARD'
  | 'CASE_FILE'
  | 'CONTROL_ROOM'
  | 'PIPELINE'
  | 'DOCUMENT_TABLE'
  | 'THRESHOLD'
  | 'HORIZON'
  | 'MAP'
  | 'INDEX'
  | 'SHOWCASE'
  | 'ATELIER'
  | 'CONSULTATION'
  | 'GALLERY';

export const VISUAL_ARCHETYPES: Record<VisualArchetype, { spatial_model: string; primary_object_rule: string; reads_as: string }> = {
  WORKBENCH: { spatial_model: 'one object on the bench, tools and inputs around it', primary_object_rule: 'the object being worked on is always centred', reads_as: 'I am working on this one thing' },
  CHECKLIST: { spatial_model: 'ordered requirements with state per line', primary_object_rule: 'the next unmet item leads', reads_as: 'what is left' },
  TIMELINE: { spatial_model: 'events on a time axis', primary_object_rule: 'now marker + next event', reads_as: 'what happened, what is next' },
  ARCHIVE: { spatial_model: 'filed, immutable records grouped by period / type', primary_object_rule: 'the record, not the folder', reads_as: 'it is safe and findable' },
  LEDGER: { spatial_model: 'rows of amounts with running totals', primary_object_rule: 'the balance / total', reads_as: 'the numbers reconcile' },
  ROUTE: { spatial_model: 'stops along a path', primary_object_rule: 'current position on the path', reads_as: 'where I am on the way' },
  QUEUE: { spatial_model: 'prioritised items waiting for an actor', primary_object_rule: 'the top item and why it is top', reads_as: 'what to handle next' },
  DECISION_WINDOW: { spatial_model: 'one decision framed with its evidence and consequences', primary_object_rule: 'the decision and its two outcomes', reads_as: 'I can decide this now' },
  CABINET: { spatial_model: 'labelled drawers of related records', primary_object_rule: 'drawer state (complete / missing)', reads_as: 'everything has a place' },
  PACKET_BUILDER: { spatial_model: 'a packet assembled from required parts', primary_object_rule: 'the packet with filled / missing parts', reads_as: 'the packet is almost complete' },
  MATCHING_BOARD: { spatial_model: 'two sides matched by fit', primary_object_rule: 'the best current match', reads_as: 'who fits whom' },
  CASE_FILE: { spatial_model: 'one case with history, evidence and owner', primary_object_rule: 'the case status and its next step', reads_as: 'this case is handled' },
  CONTROL_ROOM: { spatial_model: 'many live systems at a glance with exceptions raised', primary_object_rule: 'exceptions over normal state', reads_as: 'nothing is on fire, or exactly this is' },
  PIPELINE: { spatial_model: 'stages left-to-right with items flowing', primary_object_rule: 'stage counts + stuck items', reads_as: 'how work is moving' },
  DOCUMENT_TABLE: { spatial_model: 'documents with type, status, owner, date', primary_object_rule: 'the document needing action', reads_as: 'documents are in order' },
  THRESHOLD: { spatial_model: 'a single gate between before and after', primary_object_rule: 'the threshold value / decision', reads_as: 'am I over or under' },
  HORIZON: { spatial_model: 'forward-looking runway of future events', primary_object_rule: 'the next horizon point', reads_as: 'what is coming' },
  MAP: { spatial_model: 'geography / jurisdictions as space', primary_object_rule: 'where activity happened', reads_as: 'where things are' },
  INDEX: { spatial_model: 'searchable index of records', primary_object_rule: 'the query + best matches', reads_as: 'I can find anything' },
  SHOWCASE: { spatial_model: 'curated discovery of offerings', primary_object_rule: 'the hero offering and fit', reads_as: 'this is for me' },
  ATELIER: { spatial_model: 'a crafted object under construction', primary_object_rule: 'the object as it is being made', reads_as: 'it is being made for me' },
  CONSULTATION: { spatial_model: 'diagnostic questions to a recommendation', primary_object_rule: 'the diagnosis / recommendation', reads_as: 'I understand what I need' },
  GALLERY: { spatial_model: 'performance / social media grid', primary_object_rule: 'the featured piece', reads_as: 'look at what was made' },
};

/** Semantic emphasis roles — a project's DNA maps them to its own palette (never hard-code colours in contracts). */
export type EmphasisRole = 'NEUTRAL' | 'PROGRESS' | 'ATTENTION' | 'BLOCKER' | 'REVIEW' | 'DECISION' | 'SUCCESS' | 'ARCHIVED' | 'ERROR';
export type DensityTarget = 'SPARSE' | 'BALANCED' | 'DENSE';
export type ArtifactVisibility = 'HIDDEN' | 'PREVIEW' | 'PROMINENT' | 'ARCHIVED';

/* ─────────────────────────────── contract building blocks ─────────────────────────────── */

export type NotApplicable = { applicable: false; reason: string };
export const isNotApplicable = (v: unknown): v is NotApplicable => typeof v === 'object' && v !== null && (v as NotApplicable).applicable === false;

export type ExperienceEntry = { surface: string; route: string | null; trigger: string };

export type ExperienceState = {
  id: string;
  label: string;
  state_class: StateClass;
  /** Actor-facing meaning of the state (the client label may differ from the raw state). */
  meaning: Partial<Record<ExperienceActor, string>>;
  /** Raw structure-layer states this experience state covers (traceability, not redefinition). */
  structure_states?: string[];
};

export type StateTransition = { from: string; to: string; trigger: string; actor: ExperienceActor };

export type ExperienceInput = { id: string; label: string; methods: string[]; required_for: string; quality_signal?: string };
export type SystemDerivation = { id: string; derives: string; from: string[]; rule: string };
export type ReviewPoint = { id: string; actor: ExperienceActor; at_state: string; decision: string; outcomes: string[] };

export type ExperienceArtifact = {
  id: string;
  name: string;
  type: 'DOCUMENT' | 'RECORD' | 'RETURN' | 'CONFIRMATION' | 'RECEIPT' | 'REPORT' | 'INVOICE' | 'CERTIFICATE' | 'PACKET' | 'MESSAGE' | 'MEDIA';
  owner: string;
  source: string;
  status_lifecycle: string[];
  visible_to: string[];
  editable_by: string[];
  vault_destination: string | null;
  retention: string;
  supersession: string;
  view_behavior: string;
};

export type ExperienceEvent = {
  id: string;
  channel: 'INBOX' | 'ACTIVITY' | 'NOTIFICATION' | 'SYSTEM' | 'HUMAN_TASK';
  trigger: string;
  audience: string[];
  summary: string;
  resolves?: string;
};

export type ExperienceAutomation = { id: string; trigger: string; does: string; human_fallback: string };

export type CrossFeatureRelationship = {
  id: string;
  from_feature: string;
  from_state: string;
  to_feature: string;
  relationship: 'DEPENDS_ON' | 'FEEDS' | 'UNLOCKS' | 'RESOLVES' | 'ARCHIVES_TO' | 'OPENS' | 'UPDATES_STATUS' | 'HANDS_OFF_TO';
  /** What each actor experiences when this happens — the experience relationship, not just the dependency. */
  actor_effects: Partial<Record<ExperienceActor, string>>;
  /** What each connected surface does (VAULT receives …, INBOX resolves …). */
  surface_effects: Record<string, string>;
  visual_transition: string;
};

export type InformationHierarchy = {
  primary_question: string;
  primary_status: string;
  primary_task: string;
  secondary_status: string;
  blocker: string;
  next_action: string;
  completion_proof: string;
};

export type InteractionVerb = { verb: string; actor: ExperienceActor; meaning: string; moves_to?: string };

/** Visual relationship of ONE state: how the experience changes when the feature enters it. First-class data. */
export type StateVisualRelationship = {
  state: string;
  composition_emphasis: string;
  emphasis_role: EmphasisRole;
  panel_density: DensityTarget;
  primary_cta: Partial<Record<ExperienceActor, string>>;
  artifact_visibility: ArtifactVisibility;
  nav_emphasis: string;
  status_treatment: string;
  quiet: string[];
};

export type ViewportBehavior = { task_model: string; layout: string; primary_object_treatment: string; input_treatment: string };

/* ─────────────────────────────── four-actor perspectives ─────────────────────────────── */

export type PublicPerspective = {
  route: string | null;
  discovery: string[];
  must_understand: string[];
  who_its_for: string;
  what_we_handle: string[];
  what_client_provides: string[];
  how_it_works: string[];
  outcome: string;
  timing: string;
  pricing_relationship: string;
  cta: string;
  /** How the public page prepares the client for the real workspace (public / client continuity). */
  workspace_continuity: string;
};

export type ClientPerspective = {
  entry_point: string;
  primary_task: string;
  sees_first: string;
  must_provide: string[];
  input_methods: string[];
  system_already_knows: string[];
  ready_signals: string[];
  needs_you: string[];
  under_review: string[];
  approves: string[];
  completion_looks_like: string;
  artifacts_received: string[];
  what_happens_next: string;
  /** Client project room consumption (status / needs you / next / decisions / files / messages / approvals / progress). */
  project_room: Record<'status' | 'needs_you' | 'next' | 'decisions' | 'files' | 'messages' | 'approvals' | 'service_progress', string>;
};

export type FounderHubBucket =
  | 'NEEDS_REVIEW'
  | 'BLOCKED'
  | 'AWAITING_CLIENT'
  | 'AWAITING_PROVIDER'
  | 'READY_TO_FILE'
  | 'READY_TO_SEND'
  | 'READY_TO_LAUNCH'
  | 'COMPLETE';

export type FounderStaffPerspective = {
  client_context: string[];
  work_queue: string;
  status_model: string[];
  blockers: string[];
  missing_inputs: string[];
  system_flags: string[];
  human_review: string[];
  corrections: string[];
  approval: string[];
  overrides: string[];
  operational_actions: string[];
  communication: string[];
  artifact_generation: string[];
  completion: string;
  audit_history: string[];
  /** Founder hub consumption: which feature states land in which hub bucket. */
  hub_buckets: Partial<Record<FounderHubBucket, string[]>>;
  /** How this view differs from the client UI (mirror, never a copy). */
  mirror_not_copy: string;
};

export type SystemPerspective = {
  ingestion: string[];
  parsing: string[];
  validation: string[];
  derivation: string[];
  state_transitions: string[];
  event_creation: string[];
  notifications: string[];
  vault_movement: string[];
  inbox_movement: string[];
  activity_events: string[];
  next_cycle_creation: string;
  reminders: string[];
  background_processing: string[];
  failure_handling: string[];
};

/* ─────────────────────────────── E2E ─────────────────────────────── */

export type E2EPhase =
  | 'PUBLIC_DISCOVERY'
  | 'CLIENT_ENTRY'
  | 'CLIENT_ACTION'
  | 'SYSTEM_PROCESSING'
  | 'STAFF_REVIEW'
  | 'CLIENT_APPROVAL'
  | 'ARTIFACT_CREATION'
  | 'DOWNSTREAM_MOVEMENT'
  | 'COMPLETION'
  | 'ARCHIVE'
  | 'NEXT_STEP';
export const E2E_PHASES: readonly E2EPhase[] = [
  'PUBLIC_DISCOVERY',
  'CLIENT_ENTRY',
  'CLIENT_ACTION',
  'SYSTEM_PROCESSING',
  'STAFF_REVIEW',
  'CLIENT_APPROVAL',
  'ARTIFACT_CREATION',
  'DOWNSTREAM_MOVEMENT',
  'COMPLETION',
  'ARCHIVE',
  'NEXT_STEP',
];

export type E2EProofStep = {
  phase: E2EPhase;
  actor: ExperienceActor;
  surface: string;
  action: string;
  /** Experience-level assertions (what the actor must SEE / RECEIVE), not only "route opens". */
  expect: string[];
  state_after?: string;
};

export type E2EProofContract = {
  journey: string;
  /** Phases that do not apply to this feature, each with a reason (anything else is required). */
  not_applicable: Partial<Record<E2EPhase, string>>;
  steps: E2EProofStep[];
};

/* ─────────────────────────────── lineage / refs ─────────────────────────────── */

export type ExperienceLineage = {
  created: string;
  revised: string[];
  approved: string | null;
  superseded_by: string | null;
  source_project_context: string[];
  founder_decision: string;
  related_features: string[];
  related_authorities: string[];
};

export type StructureRefs = { routes: { actor: ExperienceActor | string; route: string }[]; data_contracts: string[]; source_evidence: string[] };
export type ExpressionRefs = { page_archetypes: string[]; authority_status: 'NONE' | 'PARTIAL' | 'APPROVED'; notes: string };
export type ImplementationRefs = { functional_completion_pct: number | null; activation_state: string; code: string[] };

/* ─────────────────────────────── the experience contract unit ─────────────────────────────── */

export type ExperienceContract = {
  schema_version: typeof EXPERIENCE_BRAIN_SCHEMA_VERSION;
  project_id: string;
  feature_id: string;
  feature_name: string;
  family_id: string;
  /** Material features must reach EXPERIENCE_COMPLETE before screen families are generated for them. */
  material: boolean;
  /** Portability samples are schema proofs only (never implementation instructions). */
  sample?: boolean;

  purpose: string;
  business_promise: string;
  user_value: string;
  primary_actors: ExperienceActor[];
  secondary_actors: string[];

  public_entry: ExperienceEntry | NotApplicable;
  client_entry: ExperienceEntry | NotApplicable;
  founder_staff_entry: ExperienceEntry | NotApplicable;
  system_entry: ExperienceEntry | NotApplicable;

  states: ExperienceState[];
  transitions: StateTransition[];
  start_state: string;
  success_state: string;
  blocked_state: string;
  error_states: string[];
  empty_state: string;
  complete_state: string;

  required_inputs: ExperienceInput[];
  optional_inputs: ExperienceInput[];
  system_derivations: SystemDerivation[];
  human_review_points: ReviewPoint[];
  client_approval_points: ReviewPoint[];
  founder_override_points: ReviewPoint[];

  output_artifacts: ExperienceArtifact[];
  vault_destination: string | null;
  inbox_events: ExperienceEvent[];
  activity_events: ExperienceEvent[];
  notifications: ExperienceEvent[];
  human_tasks: ExperienceEvent[];
  next_step: string;

  upstream_systems: string[];
  downstream_systems: string[];
  cross_feature_relationships: CrossFeatureRelationship[];
  automations: ExperienceAutomation[];

  perspectives: {
    public: PublicPerspective | NotApplicable;
    client: ClientPerspective | NotApplicable;
    founder_staff: FounderStaffPerspective | NotApplicable;
    system: SystemPerspective;
  };

  primary_metaphor: string;
  secondary_metaphor: string;
  visual_archetype: VisualArchetype[];
  primary_visual_object: string;
  secondary_visual_objects: string[];
  composition_rules: string[];
  information_hierarchy: Partial<Record<ExperienceActor, InformationHierarchy>>;
  interaction_grammar: InteractionVerb[];
  emotional_target: Partial<Record<ExperienceActor, string>>;
  density_target: DensityTarget;
  mobile_behavior: ViewportBehavior;
  tablet_behavior: ViewportBehavior;
  desktop_behavior: ViewportBehavior;
  public_cta: string | null;
  client_cta: string | null;
  staff_cta: string | null;
  avoid_list: string[];
  visual_relationships: StateVisualRelationship[];
  /** Optional per-actor, per-state section lists; otherwise SECTION_GRAMMAR derives them. */
  section_overrides?: Partial<Record<ExperienceActor, Record<string, string[]>>>;

  e2e_proof_contract: E2EProofContract;

  structure_refs: StructureRefs;
  expression_refs: ExpressionRefs;
  implementation_refs: ImplementationRefs;
  lineage: ExperienceLineage;
  /** Experience facts the sources do not settle yet. Each one is a reported gap and blocks EXPERIENCE_COMPLETE. */
  open_experience_questions?: string[];
  /** Highest rung the AUTHOR claims; the validator derives the rung the contract actually earns. */
  declared_completion: ExperienceCompletion;
};

/** Project-level DNA a generator receives with every query (portable: each project supplies its own). */
export type ProjectExperienceDna = {
  project_id: string;
  project_name: string;
  brand: { tagline: string; positioning: string; promise: string; voice: string[] };
  visual_language: { register: string; palette: string[]; emphasis_map: Record<EmphasisRole, string>; imagery: string; forbidden: string[] };
  actors: Record<ExperienceActor, string>;
  role_projections: { id: string; label: string; actor: ExperienceActor; route_prefix: string; note: string }[];
  shared_surfaces: { vault: string; inbox: string; activity: string; founder_hub: string; client_home: string };
  source_repositories: string[];
};

/** Required top-level contract fields (sprint §2) — validation fails EXPERIENCE_COMPLETE if any is empty. */
export const REQUIRED_CONTRACT_FIELDS = [
  'feature_id', 'feature_name', 'family_id', 'purpose', 'business_promise', 'user_value', 'primary_actors', 'secondary_actors',
  'public_entry', 'client_entry', 'founder_staff_entry', 'system_entry',
  'start_state', 'success_state', 'blocked_state', 'error_states', 'empty_state', 'complete_state',
  'required_inputs', 'optional_inputs', 'system_derivations', 'human_review_points', 'client_approval_points', 'founder_override_points',
  'output_artifacts', 'vault_destination', 'inbox_events', 'activity_events', 'notifications', 'next_step',
  'upstream_systems', 'downstream_systems', 'cross_feature_relationships', 'automations',
  'primary_metaphor', 'visual_archetype', 'primary_visual_object', 'secondary_visual_objects', 'composition_rules', 'information_hierarchy',
  'interaction_grammar', 'emotional_target', 'density_target', 'mobile_behavior', 'tablet_behavior', 'desktop_behavior',
  'public_cta', 'client_cta', 'staff_cta', 'avoid_list', 'e2e_proof_contract',
] as const satisfies readonly (keyof ExperienceContract)[];

/** Fields that may legitimately be empty / null for a feature, as long as the reason is the feature's nature. */
export const NULLABLE_WHEN_NOT_APPLICABLE = ['public_entry', 'public_cta', 'client_approval_points', 'founder_override_points', 'optional_inputs', 'vault_destination', 'secondary_actors', 'automations'] as const;

/** Per-actor perspective keys that must be non-empty for the perspective to count as DEFINED. */
export const PERSPECTIVE_REQUIRED_KEYS: Record<ExperienceActor, readonly string[]> = {
  PUBLIC: ['discovery', 'must_understand', 'who_its_for', 'what_we_handle', 'what_client_provides', 'how_it_works', 'outcome', 'pricing_relationship', 'cta', 'workspace_continuity'],
  CLIENT: ['entry_point', 'primary_task', 'sees_first', 'must_provide', 'input_methods', 'system_already_knows', 'needs_you', 'under_review', 'completion_looks_like', 'artifacts_received', 'what_happens_next', 'project_room'],
  FOUNDER_STAFF: ['client_context', 'work_queue', 'status_model', 'blockers', 'missing_inputs', 'system_flags', 'human_review', 'corrections', 'approval', 'overrides', 'operational_actions', 'communication', 'artifact_generation', 'completion', 'audit_history', 'hub_buckets', 'mirror_not_copy'],
  SYSTEM: ['ingestion', 'validation', 'derivation', 'state_transitions', 'event_creation', 'notifications', 'vault_movement', 'inbox_movement', 'activity_events', 'next_cycle_creation', 'reminders', 'failure_handling'],
};

/**
 * Default section grammar per actor × state class. A generator lays out these sections (in order) unless the
 * contract overrides them for a specific state. Section ids are portable; projects style them.
 */
export const SECTION_GRAMMAR: Record<Exclude<ExperienceActor, 'SYSTEM'>, Record<StateClass, string[]>> = {
  PUBLIC: {
    EMPTY: ['WHAT_IT_IS', 'WHO_ITS_FOR', 'WHAT_WE_HANDLE', 'WHAT_YOU_PROVIDE', 'HOW_IT_WORKS', 'OUTCOME', 'TIMING', 'PRICING_RELATIONSHIP', 'CTA'],
    ACTIVE: ['WHAT_IT_IS', 'HOW_IT_WORKS', 'CTA'],
    BLOCKED: ['WHAT_IT_IS', 'AVAILABILITY_NOTICE', 'CTA'],
    REVIEW: ['WHAT_IT_IS', 'HOW_IT_WORKS', 'CTA'],
    APPROVAL: ['WHAT_IT_IS', 'HOW_IT_WORKS', 'CTA'],
    COMPLETE: ['WHAT_IT_IS', 'OUTCOME', 'CTA'],
    ARCHIVED: ['WHAT_IT_IS', 'CTA'],
    ERROR: ['AVAILABILITY_NOTICE', 'CONTACT'],
  },
  CLIENT: {
    EMPTY: ['PRIMARY_OBJECT', 'WHAT_THIS_IS', 'START'],
    ACTIVE: ['PRIMARY_OBJECT', 'STATUS', 'NEEDS_YOU', 'INPUTS', 'READY', 'NEXT'],
    BLOCKED: ['PRIMARY_OBJECT', 'BLOCKER', 'RESOLVE', 'NEXT'],
    REVIEW: ['PRIMARY_OBJECT', 'UNDER_REVIEW', 'WHAT_HAPPENS_NEXT', 'MESSAGES'],
    APPROVAL: ['PRIMARY_OBJECT', 'DECISION', 'EVIDENCE', 'APPROVE_OR_QUESTION'],
    COMPLETE: ['PRIMARY_OBJECT', 'CONFIRMATION', 'ARTIFACTS', 'NEXT'],
    ARCHIVED: ['PRIMARY_OBJECT', 'ARTIFACTS', 'HISTORY', 'NEXT_CYCLE'],
    ERROR: ['PRIMARY_OBJECT', 'WHAT_WENT_WRONG', 'RECOVERY', 'CONTACT'],
  },
  FOUNDER_STAFF: {
    EMPTY: ['CLIENT_CONTEXT', 'SETUP_STATUS', 'START_WORK'],
    ACTIVE: ['CLIENT_CONTEXT', 'WORK_STATUS', 'MISSING_INPUTS', 'SYSTEM_FLAGS', 'ACTIONS', 'COMMUNICATION'],
    BLOCKED: ['CLIENT_CONTEXT', 'BLOCKERS', 'WAITING_ON', 'ESCALATE', 'COMMUNICATION'],
    REVIEW: ['CLIENT_CONTEXT', 'REVIEW_SURFACE', 'DISCREPANCIES', 'CORRECTIONS', 'APPROVE_OR_RETURN'],
    APPROVAL: ['CLIENT_CONTEXT', 'AWAITING_CLIENT', 'REMINDERS', 'OVERRIDE'],
    COMPLETE: ['CLIENT_CONTEXT', 'COMPLETION', 'ARTIFACTS', 'FINANCIAL_STATUS', 'AUDIT_HISTORY'],
    ARCHIVED: ['CLIENT_CONTEXT', 'AUDIT_HISTORY', 'NEXT_CYCLE'],
    ERROR: ['CLIENT_CONTEXT', 'FAILURE', 'RECOVERY_ACTIONS', 'AUDIT_HISTORY'],
  },
};

/** Founder hub / client project room surfaces the brain feeds (sprint §43–44). */
export const FOUNDER_HUB_BUCKETS: readonly FounderHubBucket[] = ['NEEDS_REVIEW', 'BLOCKED', 'AWAITING_CLIENT', 'AWAITING_PROVIDER', 'READY_TO_FILE', 'READY_TO_SEND', 'READY_TO_LAUNCH', 'COMPLETE'];
export const CLIENT_PROJECT_ROOM_SLOTS = ['status', 'needs_you', 'next', 'decisions', 'files', 'messages', 'approvals', 'service_progress'] as const;
