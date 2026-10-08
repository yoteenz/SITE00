/**
 * Office root contracts — what each internal-office root OWNS, PROJECTS, READS and MAY MUTATE, what is staff-only or
 * founder-only, what belongs elsewhere, and what the surface does when source truth is partial or absent
 * (P0.AIO.OFFICE-IA.FOUNDER-HOME-WORK-REPORTS-MORE.AUTHORITY-CONTRACTS1).
 *
 * office-information-architecture.ts says WHERE things live (the trees). This layer says HOW each root behaves, as the
 * semantic contract visual authorities and implementation are built on. It is architecture, not UI: every source is
 * evidence-cited and every surface declares an honest state — nothing is shown as data that source truth cannot back.
 */
import type { IaActor, IaNode, OfficeInformationArchitecture } from './office-information-architecture.js';
import { iaChildren, iaNode } from './office-information-architecture.js';

/* ─────────────────────────────── vocabularies ─────────────────────────────── */

/**
 * The honest state a surface (region, section, metric, action) is in. A surface that is not AVAILABLE says so —
 * it never fills the space with illustrative content.
 * AVAILABLE — backed by source truth today · PARTIAL — backed for part of its scope, or by the demo store only ·
 * NOT_IMPLEMENTED — architecture only · NO_DATA — implemented, nothing to show for this context · NO_ACCESS — the actor
 * lacks the grant · BLOCKED — a dependency (missing state, role, table) prevents it · COMING_LATER — deliberately
 * deferred to a named later sprint.
 */
export const SURFACE_STATES = ['AVAILABLE', 'PARTIAL', 'NOT_IMPLEMENTED', 'NO_DATA', 'NO_ACCESS', 'BLOCKED', 'COMING_LATER'] as const;
export type SurfaceState = (typeof SURFACE_STATES)[number];

/**
 * How a metric is sourced. REAL_DATA — read directly from source truth · PARTIAL_DATA — the source covers part of the
 * scope · NOT_IMPLEMENTED — no source · DERIVED_SUPPORTED — computed only from fields source truth holds ·
 * DERIVED_UNSUPPORTED — would need data source truth does not hold (never shown as a number).
 */
export const METRIC_SOURCE_CLASSES = ['REAL_DATA', 'PARTIAL_DATA', 'NOT_IMPLEMENTED', 'DERIVED_SUPPORTED', 'DERIVED_UNSUPPORTED'] as const;
export type MetricSourceClass = (typeof METRIC_SOURCE_CLASSES)[number];

/** Where the data physically comes from today. DEMO_STORE data is shown only as demo, never as production truth. */
export const DATA_BACKINGS = ['PRODUCTION', 'DEMO_STORE', 'NONE'] as const;
export type DataBacking = (typeof DATA_BACKINGS)[number];

/** Contract actors: the IA actors plus external service providers (FleetCare providers, drivers, shippers). */
export const CONTRACT_ACTORS = ['FOUNDER', 'STAFF', 'CLIENT', 'SERVICE_PROVIDER'] as const;
export type ContractActor = (typeof CONTRACT_ACTORS)[number];

/** Access an actor has to a root or source. */
export const CONTRACT_ACCESS = ['FULL', 'BY_GRANT', 'CLIENT_SAFE_PROJECTION', 'OWN_RECORDS_ONLY', 'NONE'] as const;
export type ContractAccess = (typeof CONTRACT_ACCESS)[number];

/** What a root is for. Each root has exactly one stance; roots never borrow another root's stance. */
export const ROOT_STANCES = ['PROJECTION', 'ENTRY', 'PRODUCTION', 'OVERSIGHT', 'ADMINISTRATION'] as const;
export type RootStance = (typeof ROOT_STANCES)[number];

/**
 * What an action does. ROUTE — takes the actor to the owner (the only kind HOME has) · EXECUTE — changes production
 * state in its owning root · REVIEW — reads / exports history · ADMINISTER — changes supporting business systems.
 */
export const ACTION_KINDS = ['ROUTE', 'EXECUTE', 'REVIEW', 'ADMINISTER'] as const;
export type ActionKind = (typeof ACTION_KINDS)[number];

/** The minimum shell every WORK lane exposes before its service-specific sections. */
export const LANE_SHELL_SECTIONS = ['SERVICE_OVERVIEW', 'ACTIVE_WORK', 'NEEDS_ATTENTION', 'DUE_SOON', 'BLOCKED', 'RECENTLY_COMPLETED'] as const;
export type LaneShellSection = (typeof LANE_SHELL_SECTIONS)[number];

/** How a responsive priority names a lane-shell section of the open lane (production roots only). */
export const laneShellRef = (section: LaneShellSection) => `LANE.${section}`;

export const CONTRACT_VIEWPORTS = ['MOBILE', 'TABLET', 'DESKTOP'] as const;
export type ContractViewport = (typeof CONTRACT_VIEWPORTS)[number];

/** The action-ownership rule every root obeys (validateOfficeRootContracts enforces the structural part). */
export const ACTION_OWNERSHIP_RULE = [
  'An action changes state only in the root that owns that state: production roots execute, entry roots onboard, administration roots administer supporting systems.',
  'A projection root only ROUTES to the owner; an oversight root only REVIEWS or ROUTES. Neither executes.',
  'An action shown away from its owner is a link to the owner’s action, never a second copy of it.',
  'Every action names the existing permission or privileged act that gates it; a contract never broadens a permission.',
  'No root silently mutates another root’s canonical state: an action that changes state is declared by the root that owns it.',
] as const;

/** How staff records reach a client. Applies to every client-safe projection. */
export const CLIENT_SAFE_PROJECTION_RULE = [
  'A client sees a staff record only through an approved projection, and only for its own organisation.',
  'Only customer-visible fields and events cross: never internal notes, staff names, buckets or assignments, audit actions, margin, commission, cost or referral fees.',
  'Drafts and in-review material stay internal until delivered or approved.',
  'A client surface never links into the internal office; staff reach client data from the internal office, never by entering the client shell.',
  'The projection is enforced where the data is read (database policy or server-side view), not only by hiding it in the page.',
] as const;

/* ─────────────────────────────── shapes ─────────────────────────────── */

/** One feed into a region / section: where it comes from, who owns it, where it routes, who may see it. */
export interface ContractSource {
  source_id: string;
  label: string;
  /** Ownership-matrix domain this source belongs to. */
  domain: string;
  /** IA node that owns the state — the route target. Never a projection. */
  owner_node: string;
  route: string | null;
  data_source: string;
  backing: DataBacking;
  state: SurfaceState;
  priority_rule: string | null;
  due_rule: string | null;
  visibility: Record<ContractActor, ContractAccess>;
  evidence: string[];
  note: string;
}

export interface RegionContract {
  region_id: string;
  label: string;
  question: string;
  /** REQUIRED regions always render (with an honest state); OPTIONAL ones render only when source truth exists. */
  presence: 'REQUIRED' | 'OPTIONAL';
  item_fields: string[];
  sources: ContractSource[];
  state: SurfaceState;
  rules: string[];
}

export interface ActionContract {
  action_id: string;
  label: string;
  tier: 'PRIMARY' | 'SECONDARY';
  kind: ActionKind;
  owner_node: string;
  route: string | null;
  state: SurfaceState;
  /** Existing permission / founder act that gates it (never broadened here). */
  requires: string | null;
  evidence: string[];
}

export interface StateCopy {
  state: SurfaceState | 'ERROR';
  when: string;
  shows: string;
}

/** The semantic contract a visual authority is built on. */
export interface RootContract {
  root_id: string;
  stance: RootStance;
  purpose: string;
  primary_question: string;
  answers: string[];
  owns: string[];
  projects: string[];
  reads: { domain: string; via: string }[];
  may_mutate: string[];
  must_not: string[];
  staff_only: string[];
  founder_only: string[];
  belongs_elsewhere: { item: string; belongs_in: string }[];
  partial_truth_rule: string;
  hierarchy: string[];
  regions: RegionContract[];
  actions: ActionContract[];
  states: StateCopy[];
}

export interface ShellSectionSupport {
  state: SurfaceState;
  source: string;
  note: string;
}

/** A WORK lane: the common shell, its service sections, its record model as it exists, and its links to other work. */
export interface LaneContract {
  lane_id: string;
  shell: Record<LaneShellSection, ShellSectionSupport>;
  records: { record: string; evidence: string }[];
  statuses: string[];
  assignment: string | null;
  due: string | null;
  blocker: string | null;
  client_safe: string;
  related: { node_id: string; relation: string }[];
  gaps: string[];
}

export interface MetricContract {
  metric_id: string;
  domain_node: string;
  label: string;
  classification: MetricSourceClass;
  backing: DataBacking;
  source: string;
  derivation: string | null;
  state: SurfaceState;
  visibility: Record<ContractActor, ContractAccess>;
  evidence: string[];
  note: string;
}

export interface MoreEntryContract {
  entry_id: string;
  is_for: string;
  owns: string[];
  not_for: string[];
  distinguishes: string[];
  state: SurfaceState;
  evidence: string[];
}

export interface DomainOwnership {
  domain_id: string;
  label: string;
  canonical_owner: string;
  home_projection: string | null;
  work_production: string | null;
  reports_aggregation: string | null;
  more_admin: string | null;
  client_safe_projection: string | null;
  founder_only: string | null;
  staff_access: ContractAccess;
  note: string;
}

export interface DataSourceRow {
  subject_id: string;
  root: string;
  data_source: string;
  backing: DataBacking;
  state: SurfaceState;
  write_owner: string;
  readers: string[];
  visibility: Record<ContractActor, ContractAccess>;
  missing_contracts: string[];
  missing_tables_services: string[];
  missing_routes: string[];
  evidence: string[];
}

export interface PermissionRow {
  scope: string;
  access: Record<ContractActor, ContractAccess>;
  enforced_by: string;
  note: string;
}

export interface ClientSafeProjection {
  staff_node: string;
  client_node: string;
  client_sees: string;
  client_never_sees: string;
  state: SurfaceState;
  evidence: string[];
}

export interface ResponsivePriority {
  root_id: string;
  order: Record<ContractViewport, string[]>;
  rule: string;
}

export interface ImplementationGap {
  gap_id: string;
  root: string;
  gap: string;
  /** DEFERRED — a deliberate business pause or later sprint, not a defect. */
  kind: 'MISSING_STATE' | 'MISSING_ROLE' | 'MISSING_SURFACE' | 'MISSING_TABLE_OR_SERVICE' | 'MISSING_ROUTE' | 'MISSING_CONTRACT' | 'PRIVACY' | 'DEMO_ONLY' | 'DEFERRED';
  origin: 'IA' | 'DECISION' | 'AUDIT';
  evidence: string[];
  blocks: string;
}

/** A founder vocabulary term mapped onto the vocabulary the code already has (never a second model). */
export interface VocabularyMapping {
  term: string;
  existing: string[];
  status: 'MAPPED' | 'PARTIAL' | 'NOT_IN_SOURCE';
  note: string;
}

/** One privileged act, with how the code gates it today. */
export interface PrivilegedAct {
  act: string;
  node_ids: string[];
  today: string;
  state: SurfaceState;
  evidence: string[];
}

/** A privileged internal role (e.g. FOUNDER): a role granted to people, never an identity in code. */
export interface PrivilegedRoleContract {
  role: ContractActor;
  definition: string;
  identity_rule: string;
  multiplicity: 'ONE_OR_MORE' | 'MANY';
  /** How the role is granted, held and revoked. */
  assignment: string[];
  never: string[];
  acts: PrivilegedAct[];
  code_today: string;
  gaps: string[];
}

export interface OfficeRootContracts {
  project_id: string;
  sprint: string;
  roots: RootContract[];
  lanes: LaneContract[];
  metrics: MetricContract[];
  more_entries: MoreEntryContract[];
  ownership: DomainOwnership[];
  data_sources: DataSourceRow[];
  permissions: PermissionRow[];
  client_safe: ClientSafeProjection[];
  responsive: ResponsivePriority[];
  gaps: ImplementationGap[];
  vocabularies: { name: string; mappings: VocabularyMapping[] }[];
  privileged_roles: PrivilegedRoleContract[];
}

/* ─────────────────────────────── validation ─────────────────────────────── */

const STANCE_ROLE: Record<RootStance, string[]> = {
  PROJECTION: ['COMMAND'],
  ENTRY: ['ENTRY'],
  PRODUCTION: ['PRODUCTION'],
  OVERSIGHT: ['OVERSIGHT'],
  ADMINISTRATION: ['SECONDARY'],
};
const SHOWN_AS_DATA = new Set<SurfaceState>(['AVAILABLE', 'PARTIAL']);
const under = (id: string, root: string) => id === root || id.startsWith(`${root}.`);

/**
 * Contract invariants against the IA. Returns every violation (empty = valid).
 * Generic rules only — a project's exact counts and labels live in its tests.
 */
export function validateOfficeRootContracts(c: OfficeRootContracts, ia: OfficeInformationArchitecture): string[] {
  const v: string[] = [];
  const node = (id: string) => iaNode(ia, id);
  const internal = new Set(ia.shells.filter((s) => !s.actors.includes('CLIENT')).map((s) => s.shell_id));
  const isInternal = (id: string) => internal.has(node(id)?.shell_id ?? '');
  const projectionRoots = c.roots.filter((r) => r.stance === 'PROJECTION').map((r) => r.root_id);
  const oversightRoots = c.roots.filter((r) => r.stance === 'OVERSIGHT').map((r) => r.root_id);

  for (const r of c.roots) {
    const n = node(r.root_id);
    if (!n) { v.push(`root ${r.root_id}: not in the IA`); continue; }
    if (!STANCE_ROLE[r.stance].includes(n.role)) v.push(`root ${r.root_id}: stance ${r.stance} does not match IA role ${n.role}`);
    if (r.stance === 'PROJECTION' && (r.owns.length || r.may_mutate.length)) v.push(`root ${r.root_id}: a projection root owns or mutates state`);
    if (r.stance === 'OVERSIGHT' && r.may_mutate.length) v.push(`root ${r.root_id}: an oversight root mutates state`);
    for (const a of r.actions) {
      if (!node(a.owner_node)) v.push(`root ${r.root_id}: action ${a.action_id} owner ${a.owner_node} not in the IA`);
      if (r.stance === 'PROJECTION' && a.kind !== 'ROUTE') v.push(`root ${r.root_id}: action ${a.action_id} is ${a.kind} — a projection root only routes`);
      if (r.stance === 'OVERSIGHT' && a.kind !== 'REVIEW' && a.kind !== 'ROUTE') v.push(`root ${r.root_id}: action ${a.action_id} is ${a.kind} on an oversight root`);
      if (a.kind === 'EXECUTE' && projectionRoots.concat(oversightRoots).some((p) => under(a.owner_node, p))) v.push(`root ${r.root_id}: action ${a.action_id} executes inside a projection / oversight root`);
      if ((a.kind === 'EXECUTE' || a.kind === 'ADMINISTER') && !under(a.owner_node, r.root_id)) v.push(`root ${r.root_id}: action ${a.action_id} changes state owned by ${a.owner_node} (another root)`);
    }
    for (const b of r.belongs_elsewhere) if (!node(b.belongs_in)) v.push(`root ${r.root_id}: belongs_elsewhere target ${b.belongs_in} not in the IA`);
    for (const reg of r.regions) {
      if (!reg.sources.length && reg.state === 'AVAILABLE') v.push(`region ${reg.region_id}: AVAILABLE without a source`);
      for (const s of reg.sources) {
        const owner = node(s.owner_node);
        if (!owner) v.push(`region ${reg.region_id}: source ${s.source_id} owner ${s.owner_node} not in the IA`);
        else if (projectionRoots.some((p) => under(s.owner_node, p))) v.push(`region ${reg.region_id}: source ${s.source_id} is owned by a projection root`);
        if (SHOWN_AS_DATA.has(s.state) && !s.evidence.length) v.push(`region ${reg.region_id}: source ${s.source_id} shown without evidence`);
        if (s.backing === 'NONE' && SHOWN_AS_DATA.has(s.state)) v.push(`region ${reg.region_id}: source ${s.source_id} shown with no backing`);
        if (s.visibility.CLIENT !== 'NONE' && isInternal(r.root_id)) v.push(`region ${reg.region_id}: source ${s.source_id} visible to CLIENT inside the internal office`);
        if (s.visibility.SERVICE_PROVIDER !== 'NONE' && isInternal(r.root_id)) v.push(`region ${reg.region_id}: source ${s.source_id} visible to a service provider inside the internal office`);
      }
    }
  }

  // every lane of every PRODUCTION root has a lane contract with the full shell
  for (const r of c.roots.filter((x) => x.stance === 'PRODUCTION')) {
    for (const lane of iaChildren(ia, r.root_id).filter((n) => n.kind === 'SERVICE_LANE')) {
      const lc = c.lanes.find((l) => l.lane_id === lane.node_id);
      if (!lc) { v.push(`lane ${lane.node_id}: no lane contract`); continue; }
      for (const s of LANE_SHELL_SECTIONS) if (!lc.shell[s]) v.push(`lane ${lane.node_id}: shell section ${s} missing`);
      for (const rel of lc.related) if (!node(rel.node_id)) v.push(`lane ${lane.node_id}: related ${rel.node_id} not in the IA`);
    }
  }
  for (const l of c.lanes) if (node(l.lane_id)?.kind !== 'SERVICE_LANE') v.push(`lane contract ${l.lane_id}: not a service lane`);

  // metrics: never shown as data without a supporting source
  for (const m of c.metrics) {
    if (!node(m.domain_node)) v.push(`metric ${m.metric_id}: domain ${m.domain_node} not in the IA`);
    if ((m.classification === 'NOT_IMPLEMENTED' || m.classification === 'DERIVED_UNSUPPORTED') && SHOWN_AS_DATA.has(m.state)) v.push(`metric ${m.metric_id}: ${m.classification} shown as data`);
    if (m.classification === 'DERIVED_SUPPORTED' && !m.derivation) v.push(`metric ${m.metric_id}: derived without a derivation`);
    if (m.classification === 'REAL_DATA' && m.backing !== 'PRODUCTION') v.push(`metric ${m.metric_id}: REAL_DATA must be production-backed`);
    if (SHOWN_AS_DATA.has(m.state) && !m.evidence.length) v.push(`metric ${m.metric_id}: shown without evidence`);
    if (m.visibility.CLIENT !== 'NONE') v.push(`metric ${m.metric_id}: internal metric visible to CLIENT`);
  }

  // MORE entries: administration, never client-service production
  for (const e of c.more_entries) {
    const n = node(e.entry_id);
    if (!n) v.push(`more entry ${e.entry_id}: not in the IA`);
    else if (n.role !== 'SECONDARY') v.push(`more entry ${e.entry_id}: role ${n.role}`);
  }

  // ownership: projections and oversight never own canonical state
  for (const o of c.ownership) {
    for (const [k, id] of Object.entries({ canonical_owner: o.canonical_owner, home_projection: o.home_projection, work_production: o.work_production, reports_aggregation: o.reports_aggregation, more_admin: o.more_admin, client_safe_projection: o.client_safe_projection })) if (id && !node(id)) v.push(`ownership ${o.domain_id}: ${k} ${id} not in the IA`);
    if (projectionRoots.concat(oversightRoots).some((p) => under(o.canonical_owner, p))) v.push(`ownership ${o.domain_id}: canonical owner ${o.canonical_owner} is a projection / oversight root`);
    if (o.client_safe_projection && isInternal(o.client_safe_projection)) v.push(`ownership ${o.domain_id}: client-safe projection inside the internal office`);
  }

  // permissions: clients and service providers never reach the internal office
  for (const p of c.permissions) if (node(p.scope) && isInternal(p.scope)) {
    if (p.access.CLIENT !== 'NONE') v.push(`permission ${p.scope}: CLIENT has ${p.access.CLIENT}`);
    if (p.access.SERVICE_PROVIDER !== 'NONE') v.push(`permission ${p.scope}: SERVICE_PROVIDER has ${p.access.SERVICE_PROVIDER}`);
    if (p.access.FOUNDER !== 'FULL') v.push(`permission ${p.scope}: FOUNDER has ${p.access.FOUNDER}`);
  }

  // client-safe projections run staff office → client office
  for (const cs of c.client_safe) {
    if (!isInternal(cs.staff_node)) v.push(`client-safe ${cs.staff_node}: staff side not in the internal office`);
    if (!node(cs.client_node) || isInternal(cs.client_node)) v.push(`client-safe ${cs.staff_node}: client side ${cs.client_node} not in the client office`);
  }

  // responsive priorities name real regions / sections of their root
  for (const rp of c.responsive) {
    const root = c.roots.find((r) => r.root_id === rp.root_id);
    if (!root) { v.push(`responsive ${rp.root_id}: no root contract`); continue; }
    const known = new Set([...root.regions.map((x) => x.region_id), ...root.actions.map((x) => x.action_id), ...iaChildren(ia, rp.root_id).map((n: IaNode) => n.node_id), ...(root.stance === 'PRODUCTION' ? LANE_SHELL_SECTIONS.map(laneShellRef) : [])]);
    for (const vp of CONTRACT_VIEWPORTS) {
      if (!rp.order[vp]?.length) v.push(`responsive ${rp.root_id}: ${vp} empty`);
      for (const id of rp.order[vp] ?? []) if (!known.has(id)) v.push(`responsive ${rp.root_id}: ${vp} names unknown ${id}`);
    }
  }

  // privileged roles: a role, never an identity; nobody inherits it; nobody grants it to themselves
  const gapIds = new Set(c.gaps.map((g) => g.gap_id));
  for (const pr of c.privileged_roles) {
    const def = ia.actors.find((a) => CONTRACT_ACTOR_FROM_IA[a.actor] === pr.role);
    if (!def) v.push(`role ${pr.role}: no IA actor definition`);
    else {
      if (def.multiplicity !== pr.multiplicity) v.push(`role ${pr.role}: multiplicity ${pr.multiplicity} differs from the IA (${def.multiplicity})`);
      for (const other of ia.actors) if (other.actor !== def.actor && other.inherits.includes(def.actor)) v.push(`role ${pr.role}: inherited by ${other.actor}`);
      if (def.can_self_elevate !== false) v.push(`role ${pr.role}: self-elevation allowed`);
    }
    if (/@|\buser[_-]?id\b/i.test(pr.identity_rule)) v.push(`role ${pr.role}: identity rule names an identity`);
    for (const a of pr.acts) for (const id of a.node_ids) if (!node(id) || !isInternal(id)) v.push(`role ${pr.role}: act ${a.act} names ${id}, not an internal-office node`);
    for (const g of pr.gaps) if (!gapIds.has(g)) v.push(`role ${pr.role}: gap ${g} not recorded`);
  }

  for (const d of c.data_sources) if (!d.evidence.length && SHOWN_AS_DATA.has(d.state)) v.push(`data source ${d.subject_id}: shown without evidence`);
  for (const g of c.gaps) if (!g.evidence.length) v.push(`gap ${g.gap_id}: no evidence`);
  return v;
}

/** Actors an IA actor maps to in contracts (SERVICE_PROVIDER has no IA shell: it never enters either office). */
export const CONTRACT_ACTOR_FROM_IA: Record<IaActor, ContractActor> = { FOUNDER: 'FOUNDER', STAFF: 'STAFF', CLIENT: 'CLIENT' };
