/**
 * AIO authoring kit — expands a compact, feature-specific spec into a full ExperienceContract.
 *
 * The kit only contributes what is genuinely SHARED across AIO (office work items, the notification / communication
 * engine, activity log, vault storage, state-class visual defaults, E2E step assembly). Every feature-specific fact
 * (states, inputs, perspectives, archetype, metaphor, relationships, assertions) is authored in the spec. The
 * validator still judges every expanded contract — the kit cannot make a thin spec "complete".
 */
import {
  EXPERIENCE_BRAIN_SCHEMA_VERSION,
  type ArtifactVisibility,
  type ClientPerspective,
  type CrossFeatureRelationship,
  type DensityTarget,
  type E2EPhase,
  type E2EProofStep,
  type EmphasisRole,
  type ExperienceActor,
  type ExperienceArtifact,
  type ExperienceCompletion,
  type ExperienceContract,
  type ExperienceEvent,
  type FounderStaffPerspective,
  type InformationHierarchy,
  type NotApplicable,
  type PublicPerspective,
  type ReviewPoint,
  type StateClass,
  type SystemPerspective,
  type VisualArchetype,
} from '../../schema.js';
import { AIO_SOURCE_REPO } from './dna.js';

type StateSpec = [id: string, label: string, cls: StateClass, client: string, staff: string, cta?: { CLIENT?: string; FOUNDER_STAFF?: string; PUBLIC?: string }];
type TransitionSpec = [from: string, to: string, trigger: string, actor: ExperienceActor];
type InputSpec = [id: string, label: string, methods: string[], required_for: string];
type ArtifactSpec = [id: string, name: string, type: ExperienceArtifact['type'], source: string, vault: string | null, visible?: string[]];
type EventSpec = [trigger: string, summary: string];
type PointSpec = [id: string, at_state: string, decision: string, outcomes: string[]];
type RelSpec = [to_feature: string, from_state: string, relationship: CrossFeatureRelationship['relationship'], client: string, staff: string, surface: Record<string, string>, visual: string];
type Viewports = { mobile: [string, string]; tablet: [string, string]; desktop: [string, string] };

export type AioFeatureSpec = {
  id: string;
  name: string;
  family: string;
  purpose: string;
  promise: string;
  value: string;
  actors: ExperienceActor[];
  secondary: string[];
  entries: { public: [string, string | null, string] | NotApplicable; client: [string, string, string]; staff: [string, string, string]; system: [string, string] };
  states: StateSpec[];
  transitions: TransitionSpec[];
  anchors: { start: string; success: string; blocked: string; errors: string[]; empty: string; complete: string };
  inputs: InputSpec[];
  optional?: InputSpec[];
  derivations: [id: string, derives: string, from: string[], rule: string][];
  reviews: PointSpec[];
  approvals?: PointSpec[];
  overrides?: PointSpec[];
  artifacts: ArtifactSpec[];
  vault: string | null;
  inbox: EventSpec[];
  activity: EventSpec[];
  notify: EventSpec[];
  tasks: EventSpec[];
  next: string;
  upstream: string[];
  downstream: string[];
  relationships: RelSpec[];
  automations?: [id: string, trigger: string, does: string, fallback: string][];
  public: Omit<PublicPerspective, 'route'> | NotApplicable;
  client: Omit<ClientPerspective, 'project_room'> & { project_room?: ClientPerspective['project_room'] };
  staff: Omit<FounderStaffPerspective, 'communication' | 'audit_history'> & { communication?: string[]; audit_history?: string[] };
  system: Pick<SystemPerspective, 'ingestion' | 'validation' | 'derivation' | 'state_transitions' | 'next_cycle_creation' | 'failure_handling'> & Partial<SystemPerspective>;
  metaphor: string;
  metaphor2: string;
  archetype: VisualArchetype[];
  object: string;
  objects: string[];
  composition: string[];
  hierarchy: { CLIENT: InformationHierarchy; FOUNDER_STAFF: InformationHierarchy; PUBLIC?: InformationHierarchy };
  grammar: [verb: string, actor: ExperienceActor, meaning: string, moves_to?: string][];
  emotion: Partial<Record<ExperienceActor, string>>;
  density: DensityTarget;
  viewports: Viewports;
  ctas: { public: string | null; client: string | null; staff: string | null };
  avoid: string[];
  e2e: { journey: string; not_applicable?: Partial<Record<E2EPhase, string>>; expect: Partial<Record<E2EPhase, [actor: ExperienceActor, surface: string, action: string, expect: string[]]>> };
  structure: { routes: [ExperienceActor | string, string][]; data: string[]; evidence: string[] };
  functional_pct: number | null;
  activation: string;
  code: string[];
  declared: ExperienceCompletion;
  related: string[];
  open_questions?: string[];
};

const EMPHASIS: Record<StateClass, EmphasisRole> = { EMPTY: 'NEUTRAL', ACTIVE: 'PROGRESS', BLOCKED: 'BLOCKER', REVIEW: 'REVIEW', APPROVAL: 'DECISION', COMPLETE: 'SUCCESS', ARCHIVED: 'ARCHIVED', ERROR: 'ERROR' };
const DENSITY: Record<StateClass, DensityTarget> = { EMPTY: 'SPARSE', ACTIVE: 'BALANCED', BLOCKED: 'BALANCED', REVIEW: 'SPARSE', APPROVAL: 'BALANCED', COMPLETE: 'SPARSE', ARCHIVED: 'SPARSE', ERROR: 'BALANCED' };
const ARTIFACTS: Record<StateClass, ArtifactVisibility> = { EMPTY: 'HIDDEN', ACTIVE: 'PREVIEW', BLOCKED: 'PREVIEW', REVIEW: 'PREVIEW', APPROVAL: 'PROMINENT', COMPLETE: 'PROMINENT', ARCHIVED: 'ARCHIVED', ERROR: 'PROMINENT' };
const COMPOSITION: Record<StateClass, (o: string) => string> = {
  EMPTY: (o) => `threshold: what ${o} is and the single way to start`,
  ACTIVE: (o) => `${o} in progress — the next item leads, inputs beside it`,
  BLOCKED: (o) => `blocker leads over a dimmed ${o}; the fix is inline`,
  REVIEW: (o) => `${o} locked; who is working on it and what happens next foregrounded`,
  APPROVAL: (o) => `decision window: ${o} framed with evidence and the two outcomes`,
  COMPLETE: (o) => `${o} sealed / confirmed; artifacts prominent; next step offered`,
  ARCHIVED: (o) => `${o} filed into history; the next cycle becomes the object`,
  ERROR: (o) => `what went wrong with ${o}, what AIO is doing, how to recover`,
};
const QUIET: Record<StateClass, string[]> = {
  EMPTY: ['history', 'flags'],
  ACTIVE: ['history'],
  BLOCKED: ['completed items', 'history'],
  REVIEW: ['input tools'],
  APPROVAL: ['input tools', 'raw detail'],
  COMPLETE: ['flags', 'input tools'],
  ARCHIVED: ['everything except the next cycle'],
  ERROR: ['input tools'],
};
const NAV: Record<StateClass, string> = { EMPTY: 'Services / Get Started', ACTIVE: 'My Office attention', BLOCKED: 'My Office NEEDS YOU + Inbox', REVIEW: 'none (no client action)', APPROVAL: 'Inbox + My Office NEEDS YOU', COMPLETE: 'Vault', ARCHIVED: 'none', ERROR: 'Inbox' };

const ev = (channel: ExperienceEvent['channel'], audience: string[], prefix: string) => (e: EventSpec, i: number): ExperienceEvent => ({ id: `${prefix}_${i + 1}`, channel, trigger: e[0], audience, summary: e[1] });
const pt = (actor: ExperienceActor) => (p: PointSpec): ReviewPoint => ({ id: p[0], actor, at_state: p[1], decision: p[2], outcomes: p[3] });

export function aioFeature(s: AioFeatureSpec): ExperienceContract {
  const sid = s.id.replace(/^AIO\./, '');
  const vb = (v: [string, string]) => ({ task_model: v[0], layout: v[1], primary_object_treatment: `${s.object} leads`, input_treatment: s.inputs.length ? s.inputs.map((i) => i[2][0]).join(' · ') : 'none (review / decision surface)' });
  const pub: PublicPerspective | NotApplicable = 'applicable' in s.public ? s.public : { ...s.public, route: 'applicable' in s.entries.public ? null : s.entries.public[1] };
  const client: ClientPerspective = {
    ...s.client,
    project_room: s.client.project_room ?? {
      status: s.hierarchy.CLIENT.primary_status,
      needs_you: s.client.needs_you.join(' · '),
      next: s.hierarchy.CLIENT.next_action,
      decisions: s.client.approves.join(' · ') || 'none',
      files: s.client.artifacts_received.join(' · '),
      messages: `${s.name} request thread`,
      approvals: s.client.approves.join(' · ') || 'none',
      service_progress: s.states.filter((x) => x[2] !== 'ERROR').map((x) => x[1]).join(' → '),
    },
  };
  const staff: FounderStaffPerspective = {
    ...s.staff,
    status_model: s.staff.status_model.length ? s.staff.status_model : s.states.map((x) => x[0]),
    communication: s.staff.communication ?? [`${s.name} request thread (client)`, 'communication engine templates', 'call / note log'],
    audit_history: s.staff.audit_history ?? ['every status change with staff id + timestamp', 'overrides with required note', 'client approvals / declines', 'artifact versions'],
  };
  const system: SystemPerspective = {
    parsing: s.system.parsing ?? ['structured intake fields; uploaded documents typed via vault taxonomy'],
    event_creation: s.system.event_creation ?? ['OfficeWorkItem in the owning division queue', `${s.name} inbox thread`, 'activity events per milestone'],
    notifications: s.system.notifications ?? s.notify.map((n) => n[1]),
    vault_movement: s.system.vault_movement ?? (s.vault ? [`artifacts stored under ${s.vault}`] : ['no vault artifacts (records live in the feature)']),
    inbox_movement: s.system.inbox_movement ?? s.inbox.map((n) => `${n[0]}: ${n[1]}`),
    activity_events: s.system.activity_events ?? s.activity.map((n) => n[1]),
    reminders: s.system.reminders ?? ['waiting-on-client nudges after 3 days', 'internal follow-up dueAt on the office work item'],
    background_processing: s.system.background_processing ?? ['attention engine recompute (My Office)', 'readiness / status recompute on record change'],
    ...s.system,
  };
  const e2eSteps: E2EProofStep[] = Object.entries(s.e2e.expect).map(([phase, v]) => ({ phase: phase as E2EPhase, actor: v![0], surface: v![1], action: v![2], expect: v![3] }));

  return {
    schema_version: EXPERIENCE_BRAIN_SCHEMA_VERSION,
    project_id: 'AIO',
    feature_id: s.id,
    feature_name: s.name,
    family_id: s.family,
    material: true,
    purpose: s.purpose,
    business_promise: s.promise,
    user_value: s.value,
    primary_actors: s.actors,
    secondary_actors: s.secondary,
    public_entry: 'applicable' in s.entries.public ? s.entries.public : { surface: s.entries.public[0], route: s.entries.public[1], trigger: s.entries.public[2] },
    client_entry: { surface: s.entries.client[0], route: s.entries.client[1], trigger: s.entries.client[2] },
    founder_staff_entry: { surface: s.entries.staff[0], route: s.entries.staff[1], trigger: s.entries.staff[2] },
    system_entry: { surface: s.entries.system[0], route: null, trigger: s.entries.system[1] },
    states: s.states.map(([id, label, cls, c, f]) => ({ id, label, state_class: cls, meaning: { CLIENT: c, FOUNDER_STAFF: f } })),
    transitions: s.transitions.map(([from, to, trigger, actor]) => ({ from, to, trigger, actor })),
    start_state: s.anchors.start,
    success_state: s.anchors.success,
    blocked_state: s.anchors.blocked,
    error_states: s.anchors.errors,
    empty_state: s.anchors.empty,
    complete_state: s.anchors.complete,
    required_inputs: s.inputs.map(([id, label, methods, required_for]) => ({ id, label, methods, required_for })),
    optional_inputs: (s.optional ?? []).map(([id, label, methods, required_for]) => ({ id, label, methods, required_for })),
    system_derivations: s.derivations.map(([id, derives, from, rule]) => ({ id, derives, from, rule })),
    human_review_points: s.reviews.map(pt('FOUNDER_STAFF')),
    client_approval_points: (s.approvals ?? []).map(pt('CLIENT')),
    founder_override_points: (s.overrides ?? []).map(pt('FOUNDER_STAFF')),
    output_artifacts: s.artifacts.map(([id, name, type, source, vault, visible]) => ({
      id,
      name,
      type,
      owner: 'CLIENT organization',
      source,
      status_lifecycle: ['DRAFT', 'PENDING REVIEW', 'VERIFIED / ISSUED'],
      visible_to: visible ?? ['CLIENT', 'FOUNDER_STAFF'],
      editable_by: ['STAFF (before issue)'],
      vault_destination: vault,
      retention: 'AIO vault retention policy for the document category',
      supersession: 'newer verified version supersedes; prior versions kept in history (vault supersede action)',
      view_behavior: 'inline preview; download from the Vault',
    })),
    vault_destination: s.vault,
    inbox_events: s.inbox.map(ev('INBOX', ['CLIENT'], `${sid}_INBOX`)),
    activity_events: s.activity.map(ev('ACTIVITY', ['CLIENT', 'FOUNDER_STAFF'], `${sid}_ACT`)),
    notifications: s.notify.map(ev('NOTIFICATION', ['CLIENT'], `${sid}_NTF`)),
    human_tasks: s.tasks.map(ev('HUMAN_TASK', ['FOUNDER_STAFF'], `${sid}_TASK`)),
    next_step: s.next,
    upstream_systems: s.upstream,
    downstream_systems: s.downstream,
    cross_feature_relationships: s.relationships.map(([to, from_state, rel, c, f, surface, visual], i) => ({
      id: `${sid}_REL_${i + 1}`,
      from_feature: s.id,
      from_state,
      to_feature: to,
      relationship: rel,
      actor_effects: { CLIENT: c, FOUNDER_STAFF: f },
      surface_effects: surface,
      visual_transition: visual,
    })),
    automations: (s.automations ?? []).map(([id, trigger, does, human_fallback]) => ({ id, trigger, does, human_fallback })),
    perspectives: { public: pub, client, founder_staff: staff, system },
    primary_metaphor: s.metaphor,
    secondary_metaphor: s.metaphor2,
    visual_archetype: s.archetype,
    primary_visual_object: s.object,
    secondary_visual_objects: s.objects,
    composition_rules: s.composition,
    information_hierarchy: s.hierarchy,
    interaction_grammar: s.grammar.map(([verb, actor, meaning, moves_to]) => ({ verb, actor, meaning, moves_to })),
    emotional_target: s.emotion,
    density_target: s.density,
    mobile_behavior: vb(s.viewports.mobile),
    tablet_behavior: vb(s.viewports.tablet),
    desktop_behavior: vb(s.viewports.desktop),
    public_cta: s.ctas.public,
    client_cta: s.ctas.client,
    staff_cta: s.ctas.staff,
    avoid_list: s.avoid,
    visual_relationships: s.states.map(([id, label, cls, , , cta]) => ({
      state: id,
      composition_emphasis: COMPOSITION[cls](s.object.split(' (')[0]!.toLowerCase()),
      emphasis_role: EMPHASIS[cls],
      panel_density: cls === 'ACTIVE' ? s.density : DENSITY[cls],
      primary_cta: cta ?? { CLIENT: s.ctas.client ?? undefined, FOUNDER_STAFF: s.ctas.staff ?? undefined },
      artifact_visibility: ARTIFACTS[cls],
      nav_emphasis: NAV[cls],
      status_treatment: label,
      quiet: QUIET[cls],
    })),
    e2e_proof_contract: { journey: s.e2e.journey, not_applicable: s.e2e.not_applicable ?? {}, steps: e2eSteps },
    structure_refs: { routes: s.structure.routes.map(([actor, route]) => ({ actor, route })), data_contracts: s.structure.data, source_evidence: s.structure.evidence.map((e) => `${AIO_SOURCE_REPO} ${e}`) },
    expression_refs: { page_archetypes: s.archetype, authority_status: 'NONE', notes: 'No visual authority yet; experience-driven page refinement consumes this contract.' },
    implementation_refs: { functional_completion_pct: s.functional_pct, activation_state: s.activation, code: s.code },
    lineage: {
      created: '2026-10-06 (P0.SITE00.WORKSPACE-EXPERIENCE-BRAIN.CANONICAL-SCHEMA-AIO-PROOF1)',
      revised: [],
      approved: null,
      superseded_by: null,
      source_project_context: ['AIO canonical product graph F01–F18', ...s.structure.evidence.slice(0, 2)],
      founder_decision: 'Workspace Experience Brain — every material AIO feature gets one canonical experience contract.',
      related_features: s.related,
      related_authorities: [],
    },
    open_experience_questions: s.open_questions ?? [],
    declared_completion: s.declared,
  };
}

/** Compact information hierarchy. */
export const ih = (primary_question: string, primary_status: string, primary_task: string, secondary_status: string, blocker: string, next_action: string, completion_proof: string): InformationHierarchy => ({
  primary_question,
  primary_status,
  primary_task,
  secondary_status,
  blocker,
  next_action,
  completion_proof,
});
