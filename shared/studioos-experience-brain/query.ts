/**
 * Page / authority generation consumption contract (sprint §17, §18, §41, §42).
 *
 *   queryExperience({ contract, dna, actor: 'CLIENT', state: 'COLLECTING', viewport: 'MOBILE' })
 *
 * returns the brief a generator needs BEFORE it creates a page: what the screen communicates, its primary object
 * and task, required sections, composition, visual rules, inputs, blockers, next action, downstream effects, and
 * what must be visible / quiet / never appear. A material feature without an experience-complete contract returns
 * EXPERIENCE_REQUIRED — the generator must not silently invent the experience.
 */
import {
  SECTION_GRAMMAR,
  VISUAL_ARCHETYPES,
  isNotApplicable,
  type ExperienceActor,
  type ExperienceContract,
  type ProjectExperienceDna,
  type StateClass,
  type Viewport,
} from './schema.js';
import { validateExperienceContract } from './validate.js';

export type ExperienceQuery = {
  contract: ExperienceContract | null | undefined;
  dna: ProjectExperienceDna;
  actor: ExperienceActor;
  state: string;
  viewport: Viewport;
  surface?: string;
  /** Optional live data shape the page will bind (passed through so the generator can map sections to data). */
  data_shape?: Record<string, unknown>;
  available_assets?: string[];
};

export type ExperienceRequired = { status: 'EXPERIENCE_REQUIRED'; feature_id: string | null; reason: string; gaps: string[] };

export type ExperienceBrief = {
  status: 'READY';
  project: { id: string; name: string; tagline: string; voice: string[] };
  feature: { id: string; name: string; family: string };
  actor: ExperienceActor;
  state: { id: string; label: string; class: StateClass; meaning: string };
  viewport: Viewport;
  surface: string;
  communicates: string;
  emotional_target: string;
  primary_object: string;
  secondary_objects: string[];
  primary_task: string;
  current_status: string;
  required_sections: string[];
  recommended_composition: {
    archetype: string;
    archetype_model: string;
    metaphor: string;
    emphasis: string;
    viewport: { task_model: string; layout: string; primary_object_treatment: string; input_treatment: string };
    rules: string[];
  };
  visual_rules: {
    emphasis_role: string;
    emphasis_token: string;
    density: string;
    artifact_visibility: string;
    nav_emphasis: string;
    status_treatment: string;
    register: string;
    palette: string[];
    imagery: string;
  };
  input_types: { id: string; label: string; methods: string[] }[];
  blockers: string[];
  next_action: string;
  primary_cta: string | null;
  interactions: { verb: string; meaning: string }[];
  artifacts_visible: string[];
  downstream: { to_feature: string; relationship: string; effect: string }[];
  must_be_visible: string[];
  should_be_quiet: string[];
  must_not_appear: string[];
  data_shape?: Record<string, unknown>;
  available_assets?: string[];
};

const PERSPECTIVE = { PUBLIC: 'public', CLIENT: 'client', FOUNDER_STAFF: 'founder_staff', SYSTEM: 'system' } as const;

export function queryExperience(q: ExperienceQuery): ExperienceBrief | ExperienceRequired {
  const c = q.contract;
  if (!c) return { status: 'EXPERIENCE_REQUIRED', feature_id: null, reason: 'No experience contract exists for this feature.', gaps: ['contract'] };
  const v = validateExperienceContract(c);
  if (c.material && !v.experience_ready && !c.sample) {
    return { status: 'EXPERIENCE_REQUIRED', feature_id: c.feature_id, reason: `Material feature is ${v.earned_completion}; screen generation requires EXPERIENCE_COMPLETE.`, gaps: v.gaps };
  }
  const st = c.states.find((s) => s.id === q.state);
  if (!st) return { status: 'EXPERIENCE_REQUIRED', feature_id: c.feature_id, reason: `State ${q.state} is not defined in the contract.`, gaps: [`state: ${q.state}`] };
  const perspective = c.perspectives[PERSPECTIVE[q.actor]];
  if (isNotApplicable(perspective)) {
    return { status: 'EXPERIENCE_REQUIRED', feature_id: c.feature_id, reason: `${q.actor} has no surface for this feature: ${perspective.reason}`, gaps: [] };
  }
  const vr = c.visual_relationships.find((r) => r.state === st.id)!;
  const vb = q.viewport === 'MOBILE' ? c.mobile_behavior : q.viewport === 'TABLET' ? c.tablet_behavior : c.desktop_behavior;
  const ih = c.information_hierarchy[q.actor] ?? c.information_hierarchy.CLIENT!;
  const archetype = c.visual_archetype[0]!;

  const sections =
    c.section_overrides?.[q.actor]?.[st.id] ?? (q.actor === 'SYSTEM' ? ['EVENT_LOG'] : SECTION_GRAMMAR[q.actor][st.state_class]);

  const client = !isNotApplicable(c.perspectives.client) ? c.perspectives.client : null;
  const staff = !isNotApplicable(c.perspectives.founder_staff) ? c.perspectives.founder_staff : null;
  const pub = !isNotApplicable(c.perspectives.public) ? c.perspectives.public : null;

  const inputs =
    q.actor === 'CLIENT' && ['EMPTY', 'ACTIVE', 'BLOCKED'].includes(st.state_class) ? c.required_inputs.concat(c.optional_inputs).map((i) => ({ id: i.id, label: i.label, methods: i.methods })) : [];
  const blockers =
    st.state_class === 'BLOCKED' || st.state_class === 'ACTIVE' ?
      q.actor === 'FOUNDER_STAFF' ? (staff?.blockers ?? [])
      : q.actor === 'CLIENT' ? (client?.needs_you ?? [])
      : []
    : [];
  const downstream = c.cross_feature_relationships
    .filter((r) => r.from_state === st.id || r.from_state === '*')
    .map((r) => ({ to_feature: r.to_feature, relationship: r.relationship, effect: r.actor_effects[q.actor] ?? Object.values(r.surface_effects)[0] ?? r.visual_transition }));

  const actorAvoid = q.actor === 'CLIENT' ? ['raw internal workflow states', 'staff-only flags and margins'] : q.actor === 'PUBLIC' ? ['workspace data', 'internal states'] : [];

  return {
    status: 'READY',
    project: { id: q.dna.project_id, name: q.dna.project_name, tagline: q.dna.brand.tagline, voice: q.dna.brand.voice },
    feature: { id: c.feature_id, name: c.feature_name, family: c.family_id },
    actor: q.actor,
    state: { id: st.id, label: st.label, class: st.state_class, meaning: st.meaning[q.actor] ?? st.label },
    viewport: q.viewport,
    surface: q.surface ?? (q.actor === 'PUBLIC' ? (pub?.route ?? 'public') : q.actor === 'CLIENT' ? (client?.entry_point ?? 'client') : (staff?.work_queue ?? 'office')),
    communicates: ih.primary_question,
    emotional_target: c.emotional_target[q.actor] ?? '',
    primary_object: c.primary_visual_object,
    secondary_objects: c.secondary_visual_objects,
    primary_task: ih.primary_task,
    current_status: vr.status_treatment,
    required_sections: sections,
    recommended_composition: {
      archetype,
      archetype_model: VISUAL_ARCHETYPES[archetype].spatial_model,
      metaphor: c.primary_metaphor,
      emphasis: vr.composition_emphasis,
      viewport: vb,
      rules: c.composition_rules,
    },
    visual_rules: {
      emphasis_role: vr.emphasis_role,
      emphasis_token: q.dna.visual_language.emphasis_map[vr.emphasis_role],
      density: vr.panel_density,
      artifact_visibility: vr.artifact_visibility,
      nav_emphasis: vr.nav_emphasis,
      status_treatment: vr.status_treatment,
      register: q.dna.visual_language.register,
      palette: q.dna.visual_language.palette,
      imagery: q.dna.visual_language.imagery,
    },
    input_types: inputs,
    blockers,
    next_action: ih.next_action,
    primary_cta: vr.primary_cta[q.actor] ?? null,
    interactions: c.interaction_grammar.filter((i) => i.actor === q.actor).map((i) => ({ verb: i.verb, meaning: i.meaning })),
    artifacts_visible: vr.artifact_visibility === 'HIDDEN' ? [] : c.output_artifacts.filter((a) => a.visible_to.some((x) => x === q.actor || (q.actor === 'FOUNDER_STAFF' && x === 'STAFF'))).map((a) => a.name),
    downstream,
    must_be_visible: [c.primary_visual_object, ih.primary_status, ih.next_action, ...(st.state_class === 'BLOCKED' ? [ih.blocker] : []), ...(st.state_class === 'COMPLETE' ? [ih.completion_proof] : [])],
    should_be_quiet: vr.quiet,
    must_not_appear: [...c.avoid_list, ...actorAvoid, ...q.dna.visual_language.forbidden],
    data_shape: q.data_shape,
    available_assets: q.available_assets,
  };
}

/** Screen-family gate (§42): list every material feature a generator must NOT generate yet. */
export function screenFamilyGate(contracts: ExperienceContract[]): { feature_id: string; status: 'GENERATE' | 'EXPERIENCE_REQUIRED'; reason: string }[] {
  return contracts.map((c) => {
    const v = validateExperienceContract(c);
    return c.material && !v.experience_ready ?
        { feature_id: c.feature_id, status: 'EXPERIENCE_REQUIRED', reason: `${v.earned_completion}: ${v.gate_failures.join(', ') || v.gaps.slice(0, 3).join('; ')}` }
      : { feature_id: c.feature_id, status: 'GENERATE', reason: v.earned_completion };
  });
}
