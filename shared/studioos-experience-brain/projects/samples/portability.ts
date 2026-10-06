/**
 * Portability proof (sprint §50–52): the same schema maps JURNL and FRONTAL SLAYER features WITHOUT any AIO
 * assumption. These are NON-IMPLEMENTED sample mappings — schema proofs only. They are declared STRUCTURED, are
 * never material, and must not be used as build instructions (no JURNL rebuild, no Frontal Slayer implementation).
 */
import { EXPERIENCE_BRAIN_SCHEMA_VERSION, type ExperienceContract, type ProjectExperienceDna, type StateClass, type VisualArchetype } from '../../schema.js';

const NA = (why: string) => ({ applicable: false as const, reason: why });

function sample(o: {
  project: string;
  id: string;
  name: string;
  family: string;
  metaphor: string;
  archetype: VisualArchetype[];
  object: string;
  route: string;
  states: [string, StateClass, string][];
  emotion: string;
  note: string;
}): ExperienceContract {
  const vb = { task_model: 'sample — not authored', layout: 'sample — not authored', primary_object_treatment: `${o.object} leads`, input_treatment: 'sample — not authored' };
  return {
    schema_version: EXPERIENCE_BRAIN_SCHEMA_VERSION,
    project_id: o.project,
    feature_id: o.id,
    feature_name: o.name,
    family_id: o.family,
    material: false,
    sample: true,
    purpose: o.note,
    business_promise: 'sample mapping',
    user_value: 'sample mapping',
    primary_actors: ['CLIENT', 'SYSTEM'],
    secondary_actors: [],
    public_entry: NA('sample'),
    client_entry: { surface: o.name, route: o.route, trigger: 'sample' },
    founder_staff_entry: NA('sample'),
    system_entry: { surface: 'sample', route: null, trigger: 'sample' },
    states: o.states.map(([id, cls, label]) => ({ id, label, state_class: cls, meaning: { CLIENT: label } })),
    transitions: o.states.slice(1).map(([id], i) => ({ from: o.states[i]![0], to: id, trigger: 'sample', actor: 'CLIENT' as const })),
    start_state: o.states[0]![0],
    success_state: o.states.find((s) => s[1] === 'COMPLETE')?.[0] ?? o.states.at(-1)![0],
    blocked_state: o.states.find((s) => s[1] === 'BLOCKED')?.[0] ?? '',
    error_states: [],
    empty_state: o.states.find((s) => s[1] === 'EMPTY')?.[0] ?? o.states[0]![0],
    complete_state: o.states.at(-1)![0],
    required_inputs: [],
    optional_inputs: [],
    system_derivations: [],
    human_review_points: [],
    client_approval_points: [],
    founder_override_points: [],
    output_artifacts: [],
    vault_destination: null,
    inbox_events: [],
    activity_events: [],
    notifications: [],
    human_tasks: [],
    next_step: 'sample',
    upstream_systems: [],
    downstream_systems: [],
    cross_feature_relationships: [],
    automations: [],
    perspectives: {
      public: NA('sample — not authored'),
      client: NA('sample — not authored'),
      founder_staff: NA('sample — not authored'),
      system: { ingestion: [], parsing: [], validation: [], derivation: [], state_transitions: [], event_creation: [], notifications: [], vault_movement: [], inbox_movement: [], activity_events: [], next_cycle_creation: '', reminders: [], background_processing: [], failure_handling: [] },
    },
    primary_metaphor: o.metaphor,
    secondary_metaphor: '',
    visual_archetype: o.archetype,
    primary_visual_object: o.object,
    secondary_visual_objects: [],
    composition_rules: [],
    information_hierarchy: {},
    interaction_grammar: [],
    emotional_target: { CLIENT: o.emotion },
    density_target: 'BALANCED',
    mobile_behavior: vb,
    tablet_behavior: vb,
    desktop_behavior: vb,
    public_cta: null,
    client_cta: null,
    staff_cta: null,
    avoid_list: [],
    visual_relationships: [],
    e2e_proof_contract: { journey: 'sample', not_applicable: {}, steps: [] },
    structure_refs: { routes: [{ actor: 'CLIENT', route: o.route }], data_contracts: [], source_evidence: [o.note] },
    expression_refs: { page_archetypes: o.archetype, authority_status: 'NONE', notes: 'sample' },
    implementation_refs: { functional_completion_pct: null, activation_state: 'NOT IMPLEMENTED — sample mapping', code: [] },
    lineage: { created: '2026-10-06 (portability proof)', revised: [], approved: null, superseded_by: null, source_project_context: [o.project], founder_decision: 'sprint §51–52 sample mappings — no implementation', related_features: [], related_authorities: [] },
    declared_completion: 'STRUCTURED',
  };
}

export const JURNL_DNA_SAMPLE: ProjectExperienceDna = {
  project_id: 'JURNL',
  project_name: 'JURNL',
  brand: { tagline: '(JURNL canon — not restated here)', positioning: 'personal money clarity', promise: '(JURNL canon)', voice: ['(JURNL canon)'] },
  visual_language: { register: '(JURNL canon)', palette: [], emphasis_map: { NEUTRAL: 'n', PROGRESS: 'p', ATTENTION: 'a', BLOCKER: 'b', REVIEW: 'r', DECISION: 'd', SUCCESS: 's', ARCHIVED: 'ar', ERROR: 'e' }, imagery: '(JURNL canon)', forbidden: [] },
  actors: { PUBLIC: 'prospective user', CLIENT: 'JURNL user', FOUNDER_STAFF: 'founder', SYSTEM: 'JURNL repository + projections' },
  role_projections: [],
  shared_surfaces: { vault: 'F16 RECORDS', inbox: 'n/a', activity: 'ledger', founder_hub: 'n/a', client_home: 'TODAY' },
  source_repositories: ['yoteenz/SITE00 (src/projects/jurnl)'],
};

export const FRONTAL_SLAYER_DNA_SAMPLE: ProjectExperienceDna = {
  project_id: 'FRONTAL_SLAYER',
  project_name: 'FRONTAL SLAYER',
  brand: { tagline: '(Frontal Slayer canon)', positioning: 'custom wig atelier', promise: '(Frontal Slayer canon)', voice: ['(Frontal Slayer canon)'] },
  visual_language: { register: '(Frontal Slayer canon)', palette: [], emphasis_map: { NEUTRAL: 'n', PROGRESS: 'p', ATTENTION: 'a', BLOCKER: 'b', REVIEW: 'r', DECISION: 'd', SUCCESS: 's', ARCHIVED: 'ar', ERROR: 'e' }, imagery: '(Frontal Slayer canon)', forbidden: [] },
  actors: { PUBLIC: 'shopper', CLIENT: 'customer', FOUNDER_STAFF: 'atelier staff', SYSTEM: 'commerce + build pipeline' },
  role_projections: [],
  shared_surfaces: { vault: 'order history', inbox: 'messages', activity: 'orders', founder_hub: 'atelier queue', client_home: 'account' },
  source_repositories: ['yoteenz/fsbw (Frontal Slayer)'],
};

export const PORTABILITY_SAMPLES: ExperienceContract[] = [
  sample({ project: 'JURNL', id: 'JURNL.SAFE_TO_SPEND', name: 'Safe to Spend', family: 'F09', metaphor: 'DECISION THRESHOLD', archetype: ['THRESHOLD'], object: 'THE SAFE-TO-SPEND NUMBER', route: 'safe', states: [['NO_SETUP', 'EMPTY', 'Set up'], ['CALCULATED', 'ACTIVE', 'Safe to spend'], ['PARTIAL', 'BLOCKED', 'Partial — obligations missing amounts'], ['UNDER', 'COMPLETE', 'Under the threshold']], emotion: 'I know what I can spend without guessing.', note: 'JURNL F09 — computeSafeToSpend; sample only (no rebuild)' }),
  sample({ project: 'JURNL', id: 'JURNL.PURCHASES', name: 'Purchases', family: 'F10', metaphor: 'OBJECT UNDER CONSIDERATION', archetype: ['DECISION_WINDOW'], object: 'THE PURCHASE BEING CONSIDERED', route: 'purchases', states: [['NONE', 'EMPTY', 'Nothing considered'], ['CONSIDERING', 'APPROVAL', 'Considering'], ['RESERVED', 'ACTIVE', 'Reserved'], ['BOUGHT', 'COMPLETE', 'Bought']], emotion: 'I can decide calmly with the numbers in front of me.', note: 'JURNL F10 purchases (Wave 4); sample only' }),
  sample({ project: 'JURNL', id: 'JURNL.AHEAD', name: 'Ahead', family: 'F15', metaphor: 'FORWARD HORIZON', archetype: ['HORIZON'], object: 'THE NEXT HORIZON POINT', route: 'ahead', states: [['EMPTY', 'EMPTY', 'Nothing ahead'], ['PROJECTED', 'ACTIVE', 'Projected'], ['ARRIVED', 'COMPLETE', 'Arrived']], emotion: 'I can see what is coming.', note: 'JURNL F15 aheadProjection.ts (derived-only); sample only' }),
  sample({ project: 'JURNL', id: 'JURNL.RECORDS', name: 'Records', family: 'F16', metaphor: 'ARCHIVE / INDEX', archetype: ['ARCHIVE', 'INDEX'], object: 'THE RECORD', route: 'records', states: [['EMPTY', 'EMPTY', 'No records'], ['INDEXED', 'ACTIVE', 'Indexed'], ['FILED', 'ARCHIVED', 'Filed']], emotion: 'Everything is findable.', note: 'JURNL F16 records (metadata-only); sample only' }),
  sample({ project: 'FRONTAL_SLAYER', id: 'FS.BUILD_A_WIG', name: 'Build-A-Wig', family: 'BUILD', metaphor: 'ATELIER / CONSTRUCTION', archetype: ['ATELIER'], object: 'THE WIG BEING BUILT', route: 'build-a-wig', states: [['START', 'EMPTY', 'Start a build'], ['BUILDING', 'ACTIVE', 'Building'], ['REVIEW', 'APPROVAL', 'Review your build'], ['ORDERED', 'COMPLETE', 'Ordered']], emotion: 'It is being made for me.', note: 'Frontal Slayer Build-A-Wig; sample only — no implementation' }),
  sample({ project: 'FRONTAL_SLAYER', id: 'FS.HAIR_ANALYSIS', name: 'Hair Analysis', family: 'ANALYSIS', metaphor: 'CONSULTATION / DIAGNOSTIC', archetype: ['CONSULTATION'], object: 'THE DIAGNOSIS', route: 'hair-analysis', states: [['START', 'EMPTY', 'Start'], ['ANSWERING', 'ACTIVE', 'Answering'], ['RESULT', 'COMPLETE', 'Your result']], emotion: 'I understand what I need.', note: 'sample only' }),
  sample({ project: 'FRONTAL_SLAYER', id: 'FS.SHOWROOM', name: 'Showroom', family: 'SHOP', metaphor: 'DISCOVERY', archetype: ['SHOWCASE'], object: 'THE FEATURED PIECE', route: 'showroom', states: [['BROWSE', 'ACTIVE', 'Browse'], ['SELECTED', 'COMPLETE', 'Selected']], emotion: 'This is for me.', note: 'sample only' }),
  sample({ project: 'FRONTAL_SLAYER', id: 'FS.SLAY_CAM', name: 'Slay Cam', family: 'SOCIAL', metaphor: 'SOCIAL PERFORMANCE / GALLERY', archetype: ['GALLERY'], object: 'THE FEATURED LOOK', route: 'slay-cam', states: [['EMPTY', 'EMPTY', 'No posts'], ['POSTED', 'ACTIVE', 'Posted'], ['FEATURED', 'COMPLETE', 'Featured']], emotion: 'Look at what was made.', note: 'sample only' }),
];
