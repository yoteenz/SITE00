/**
 * Office information architecture — the root navigation trees of a project's offices, as product relationships
 * (P0.AIO.OFFICE-IA.FOUNDER-WORK-TREE-AND-CLIENT-OFFICE-CANONICALIZATION1).
 *
 * operating-environment.ts says WHAT an office is (client × workspace × subcontext, switchers, hub, entitlements).
 * This layer says HOW each office is organised for its actors: the root destinations, what lives under each, which
 * actor may see what, which services and workspaces a destination carries, which destinations only project or
 * aggregate the production that lives elsewhere, and which older structures they supersede.
 *
 * It is architecture, not UI: labels are the founder's words, routes are evidence (EXISTING / PROPOSED / NONE), and
 * implementation status is reported truthfully per node. A destination may be ARCHITECTURALLY_CANONICAL while its
 * implementation is PARTIAL or NOT_STARTED — the architecture reflects the business, the status reflects the code.
 */
import type { ExperienceActor } from './schema.js';
import type { OperatingEnvironmentKind } from './operating-environment.js';

/* ─────────────────────────────── vocabularies ─────────────────────────────── */

/** IA actors. FOUNDER and STAFF share the internal office (ExperienceActor FOUNDER_STAFF) but are kept apart here. */
export const IA_ACTORS = ['FOUNDER', 'STAFF', 'CLIENT'] as const;
export type IaActor = (typeof IA_ACTORS)[number];
export const IA_ACTOR_TO_EXPERIENCE_ACTOR: Record<IaActor, ExperienceActor> = { FOUNDER: 'FOUNDER_STAFF', STAFF: 'FOUNDER_STAFF', CLIENT: 'CLIENT' };

export const IA_NODE_KINDS = [
  'SHELL', // the office itself (AIO OFFICE · CLIENT OFFICE)
  'ROOT_DESTINATION', // one root navigation destination
  'REGION', // a required region of a destination (HOME: NEEDS ATTENTION …)
  'SERVICE_LANE', // a production lane under WORK
  'LANE_SECTION', // a section inside a lane
  'SECTION', // a section of a non-production destination
  'REPORT_DOMAIN', // an oversight domain under REPORTS
  'DIRECTORY_ENTRY', // a secondary directory / admin entry under MORE
  'LANDING', // where the office opens; not a root destination
  'GATE', // a step an actor passes before the office (client confirmation before ACTIVE)
] as const;
export type IaNodeKind = (typeof IA_NODE_KINDS)[number];

/** What a node is FOR. PROJECTION never owns production state; PRODUCTION lives in one place only. */
export const IA_ROLES = [
  'COMMAND', // root: cross-business command center (projects production)
  'PROJECTION', // summary of state owned elsewhere — always points at the owner
  'ENTRY', // bring clients / records into the system (INTAKE)
  'PRODUCTION', // where the work is actually done
  'OVERSIGHT', // history, analytics, exports (aggregates production)
  'SECONDARY', // directory, admin, lower-frequency tools
  'CLIENT_RECORD', // the client's own company record
  'CLIENT_WORKSPACE', // a client-safe service workspace
  'RECORDS', // documents and records
  'COMMUNICATION', // messages, requests, approvals, notifications
  'DISCOVERY', // active + available + contextual services
  'ACCOUNT', // profile, access, security, preferences
  'GATE',
  'LANDING',
] as const;
export type IaRole = (typeof IA_ROLES)[number];

/**
 * Who sees a node.
 * FULL — the actor works in it · CLIENT_SAFE_PROJECTION — the actor sees an approved client-safe projection of it ·
 * VIA_AIO_OFFICE — staff reach the same client data through AIO OFFICE (client context), never by entering the client
 * shell · HIDDEN — never shown to that actor.
 */
export const IA_VISIBILITY = ['FULL', 'CLIENT_SAFE_PROJECTION', 'VIA_AIO_OFFICE', 'HIDDEN'] as const;
export type IaVisibility = (typeof IA_VISIBILITY)[number];

export const ARCHITECTURE_STATUSES = ['ARCHITECTURALLY_CANONICAL', 'CANDIDATE_UNRESOLVED', 'SUPERSEDED'] as const;
export type ArchitectureStatus = (typeof ARCHITECTURE_STATUSES)[number];

/** Implementation truth. IMPLEMENTED is reserved for production-backed behaviour; demo-store-only work is PARTIAL. */
export const IMPLEMENTATION_STATUSES = ['IMPLEMENTED', 'IMPLEMENTATION_PARTIAL', 'IMPLEMENTATION_NOT_STARTED'] as const;
export type ImplementationStatus = (typeof IMPLEMENTATION_STATUSES)[number];
/** How far a PARTIAL node goes — so PARTIAL is never vague. */
export const IMPLEMENTATION_DEPTHS = ['PRODUCTION_BACKED', 'FUNCTIONAL_DEMO', 'READ_ONLY', 'GENERIC_PIPELINE', 'NONE'] as const;
export type ImplementationDepth = (typeof IMPLEMENTATION_DEPTHS)[number];

export const REPORT_DATA_STATUSES = ['REAL_DATA', 'PARTIAL_DATA', 'NOT_YET_IMPLEMENTED'] as const;
export type ReportDataStatus = (typeof REPORT_DATA_STATUSES)[number];

/**
 * How a CLIENT OFFICE node resolves for one client.
 * ALWAYS — every client · APPLICABILITY — only where the client's type makes it real (a shipper has no trucks) ·
 * ENTITLEMENT — through the workspace resolver: ACTIVE → shown in its destination; AVAILABLE_NOT_ACTIVATED → SERVICES and
 * approved contextual placements only; NOT_APPLICABLE → never promoted · STATE — only while a lifecycle state holds.
 */
export const CLIENT_RESOLUTIONS = ['ALWAYS', 'APPLICABILITY', 'ENTITLEMENT', 'STATE'] as const;
export type ClientResolution = (typeof CLIENT_RESOLUTIONS)[number];

export const ROUTE_EVIDENCE_STATUSES = ['EXISTING', 'PROPOSED', 'HELPER_UNROUTED', 'NONE'] as const;
export type IaRouteRef = { path: string; status: (typeof ROUTE_EVIDENCE_STATUSES)[number]; evidence: string };

export const LEGACY_CLASSIFICATIONS = ['KEEP', 'REMAP', 'SUPERSEDE', 'MIGRATE_LATER', 'REMOVE_WHEN_IMPLEMENTED'] as const;
export type LegacyClassification = (typeof LEGACY_CLASSIFICATIONS)[number];

/* ─────────────────────────────── shapes ─────────────────────────────── */

export interface IaShell {
  shell_id: string;
  name: string;
  /** operating-environment id this shell organises (AIO.OFFICE · AIO.CLIENT_OFFICE). */
  environment_id: string;
  kind: OperatingEnvironmentKind;
  actors: IaActor[];
  scope: 'ALL_CLIENTS_ALL_SERVICES' | 'ONE_CLIENT_APPLICABLE_WORKSPACES';
  /** Root destinations in order — must equal the shell's ROOT_DESTINATION children. */
  root_nav: string[];
  route_root: string;
  semantics: string;
}

export interface IaNode {
  node_id: string;
  shell_id: string;
  parent: string | null;
  order: number;
  /** The founder's label (rendered uppercase by AIO's uppercase law). */
  label: string;
  kind: IaNodeKind;
  role: IaRole;
  semantics: string;
  visibility: Record<IaActor, IaVisibility>;
  /** Existing office permission that already gates this node (never broadened here). */
  staff_gate: string | null;
  /** For a staff node: the client-shell node that is its approved client-safe projection (if any). */
  client_projection: string | null;
  architecture: ArchitectureStatus;
  implementation: ImplementationStatus;
  depth: ImplementationDepth;
  evidence: string[];
  routes: IaRouteRef[];
  service_ids: string[];
  /** Brain workspaces (entitlement units) this node carries — operating-environment WorkspaceDefinition ids. */
  workspace_ids: string[];
  /** Brain ids this node renders: experience contracts, operating environments or screen families (AIO.*). */
  feature_refs: string[];
  /** Approved visual authorities associated here (re-association, never regeneration). */
  authority_refs: string[];
  /** CLIENT OFFICE only. */
  client_resolution: ClientResolution | null;
  /** PROJECTION / COMMAND nodes: the nodes whose state they summarise (never themselves projections). */
  projects: string[];
  /** OVERSIGHT nodes: the nodes whose history they aggregate. */
  aggregates: string[];
  data_status: ReportDataStatus | null;
  notes: string;
}

export interface IaService {
  service_id: string;
  name: string;
  staff_nodes: string[];
  client_nodes: string[];
  client_visibility: 'ENTITLEMENT' | 'ALWAYS' | 'APPLICABILITY' | 'STAFF_ONLY';
  client_visibility_note: string;
  workspace_ids: string[];
  feature_refs: string[];
  architecture: ArchitectureStatus;
  implementation: ImplementationStatus;
  implementation_detail: string;
  canonical_data_source: string;
  evidence: string[];
  notes: string;
}

/** One old structure → where it lives now (lineage is kept, never deleted). */
export interface IaSupersession {
  lineage_id: string;
  old_structure: string;
  old_item: string;
  old_target: string;
  disposition: 'KEPT' | 'REHOMED' | 'REMAPPED' | 'RENAMED' | 'SUPERSEDED';
  new_node_ids: string[];
  note: string;
}

export interface IaLegacyReference {
  ref: string;
  repo: string;
  what: string;
  classification: LegacyClassification;
  target_node_ids: string[];
  note: string;
}

/** Something the source truth shows that the founder tree does not name — recorded, never discarded silently. */
export interface IaCandidate {
  candidate_id: string;
  label: string;
  observed: string[];
  recommended_node: string | null;
  rationale: string;
  status: 'CANDIDATE_UNRESOLVED';
}

export interface IaFirewallItem {
  item: string;
  node_ids: string[];
  reason: string;
}

export interface IaOpenQuestion {
  question_id: string;
  question: string;
  recommendation: string;
  blocks: string;
}

export interface OfficeInformationArchitecture {
  project_id: string;
  sprint: string;
  lineage_id: string;
  shells: IaShell[];
  nodes: IaNode[];
  services: IaService[];
  supersessions: IaSupersession[];
  legacy: IaLegacyReference[];
  candidates: IaCandidate[];
  firewall: IaFirewallItem[];
  /** MORE: what may and may not live there. */
  more_rules: { container_node: string; may_contain_roles: IaRole[]; must_not_contain_roles: IaRole[]; rule: string; exclusions: { item: string; belongs_in: string; reason: string }[] };
  open_questions: IaOpenQuestion[];
}

/* ─────────────────────────────── helpers ─────────────────────────────── */

export const iaNode = (ia: OfficeInformationArchitecture, id: string): IaNode | undefined => ia.nodes.find((n) => n.node_id === id);
export const iaChildren = (ia: OfficeInformationArchitecture, id: string): IaNode[] => ia.nodes.filter((n) => n.parent === id).sort((a, b) => a.order - b.order);
export const iaDescendants = (ia: OfficeInformationArchitecture, id: string): IaNode[] => iaChildren(ia, id).flatMap((c) => [c, ...iaDescendants(ia, c.node_id)]);
export function iaPath(ia: OfficeInformationArchitecture, id: string): string[] {
  const out: string[] = [];
  for (let n = iaNode(ia, id); n; n = n.parent ? iaNode(ia, n.parent) : undefined) out.unshift(n.label);
  return out;
}
/** The root navigation of a shell, as labels in order. */
export const iaRootNav = (ia: OfficeInformationArchitecture, shellId: string): string[] =>
  (ia.shells.find((s) => s.shell_id === shellId)?.root_nav ?? []).map((id) => iaNode(ia, id)?.label ?? id);
/** Every node an actor may see in a shell (HIDDEN and VIA_AIO_OFFICE are excluded). */
export const iaVisibleTo = (ia: OfficeInformationArchitecture, shellId: string, actor: IaActor): IaNode[] =>
  ia.nodes.filter((n) => n.shell_id === shellId && (n.visibility[actor] === 'FULL' || n.visibility[actor] === 'CLIENT_SAFE_PROJECTION'));

/* ─────────────────────────────── validation ─────────────────────────────── */

const isInternalRoute = (path: string) => path === '/office' || path.startsWith('/office/');

/**
 * Structural + firewall + semantic invariants. Returns every violation (empty = valid).
 * The rules are generic; a project's own gate (exact root labels) lives in its tests.
 */
export function validateOfficeInformationArchitecture(ia: OfficeInformationArchitecture): string[] {
  const v: string[] = [];
  const ids = new Set<string>();
  for (const n of ia.nodes) {
    if (ids.has(n.node_id)) v.push(`duplicate node ${n.node_id}`);
    ids.add(n.node_id);
  }
  const shellIds = new Set(ia.shells.map((s) => s.shell_id));
  for (const n of ia.nodes) {
    if (!shellIds.has(n.shell_id)) v.push(`${n.node_id}: unknown shell ${n.shell_id}`);
    if (n.kind === 'SHELL') {
      if (n.parent !== null) v.push(`${n.node_id}: a shell has no parent`);
      continue;
    }
    const parent = n.parent ? iaNode(ia, n.parent) : undefined;
    if (!parent) v.push(`${n.node_id}: missing parent ${n.parent}`);
    else if (parent.shell_id !== n.shell_id) v.push(`${n.node_id}: parent ${parent.node_id} is in another shell`);
    for (const ref of [...n.projects, ...n.aggregates]) if (!ids.has(ref)) v.push(`${n.node_id}: references unknown node ${ref}`);
    if (n.client_projection && iaNode(ia, n.client_projection)?.shell_id === n.shell_id) v.push(`${n.node_id}: a client projection must live in the client shell`);
    if (n.client_projection && !ids.has(n.client_projection)) v.push(`${n.node_id}: unknown client projection ${n.client_projection}`);
  }

  for (const s of ia.shells) {
    const shellNode = iaNode(ia, s.shell_id);
    if (!shellNode || shellNode.kind !== 'SHELL') v.push(`${s.shell_id}: shell node missing`);
    const roots = iaChildren(ia, s.shell_id).filter((c) => c.kind === 'ROOT_DESTINATION').map((c) => c.node_id);
    if (roots.join('|') !== s.root_nav.join('|')) v.push(`${s.shell_id}: root_nav ${s.root_nav.join(',')} ≠ root destinations ${roots.join(',')}`);
    const internal = s.actors.every((a) => a !== 'CLIENT');
    for (const n of ia.nodes.filter((x) => x.shell_id === s.shell_id)) {
      // the internal office is never shown to a client — clients see approved projections in their own shell
      if (internal && n.visibility.CLIENT !== 'HIDDEN') v.push(`${n.node_id}: internal-office node visible to CLIENT`);
      if (!internal) {
        if (n.client_resolution === null && n.kind !== 'SHELL') v.push(`${n.node_id}: client node without client_resolution`);
        for (const r of n.routes) if (isInternalRoute(r.path)) v.push(`${n.node_id}: client node routes into the internal office (${r.path})`);
        if (n.role === 'ENTRY') v.push(`${n.node_id}: INTAKE / entry work in the client shell`);
      }
    }
  }

  // firewall items are never client-visible
  for (const f of ia.firewall) for (const id of f.node_ids) {
    const n = iaNode(ia, id);
    if (!n) v.push(`firewall ${f.item}: unknown node ${id}`);
    else if (n.visibility.CLIENT !== 'HIDDEN') v.push(`firewall ${f.item}: ${id} visible to CLIENT`);
  }

  // projections and aggregations point at owners
  for (const n of ia.nodes) {
    if (n.role === 'PROJECTION') {
      if (!n.projects.length) v.push(`${n.node_id}: a projection must name what it projects`);
      for (const p of n.projects) {
        const t = iaNode(ia, p);
        if (t && (t.role === 'PROJECTION' || t.role === 'COMMAND')) v.push(`${n.node_id}: projects another projection (${p})`);
      }
    }
    if (n.kind === 'REPORT_DOMAIN') {
      if (!n.data_status) v.push(`${n.node_id}: report domain without data status`);
      if (!n.aggregates.length && n.data_status !== 'NOT_YET_IMPLEMENTED') v.push(`${n.node_id}: report domain aggregates nothing`);
    }
  }

  // MORE never holds production
  const more = ia.more_rules;
  for (const d of iaDescendants(ia, more.container_node)) {
    if (more.must_not_contain_roles.includes(d.role)) v.push(`${d.node_id}: ${d.role} under ${more.container_node}`);
  }

  // services map to real nodes in the right shells
  const staffShells = new Set(ia.shells.filter((s) => !s.actors.includes('CLIENT')).map((s) => s.shell_id));
  for (const s of ia.services) {
    if (!s.staff_nodes.length) v.push(`service ${s.service_id}: no staff location`);
    for (const id of s.staff_nodes) if (!staffShells.has(iaNode(ia, id)?.shell_id ?? '')) v.push(`service ${s.service_id}: staff node ${id} is not in an internal office`);
    for (const id of s.client_nodes) if (staffShells.has(iaNode(ia, id)?.shell_id ?? '') || !ids.has(id)) v.push(`service ${s.service_id}: client node ${id} is not in a client office`);
    if (s.client_visibility === 'STAFF_ONLY' && s.client_nodes.length) v.push(`service ${s.service_id}: staff-only service has client nodes`);
  }

  for (const s of ia.supersessions) {
    if (s.lineage_id !== ia.lineage_id) v.push(`supersession ${s.old_item}: wrong lineage id`);
    for (const id of s.new_node_ids) if (!ids.has(id)) v.push(`supersession ${s.old_item}: unknown node ${id}`);
  }
  for (const l of ia.legacy) for (const id of l.target_node_ids) if (!ids.has(id)) v.push(`legacy ${l.ref}: unknown node ${id}`);
  for (const c of ia.candidates) if (c.recommended_node && !ids.has(c.recommended_node)) v.push(`candidate ${c.candidate_id}: unknown node ${c.recommended_node}`);
  return v;
}
