/**
 * Page / tab / state tree — step 07A of the Visual Authority Development Gate.
 *
 * Founder decision: TABS ARE FIRST-CLASS AUTHORITY-DESIGN NODES. The Brain models
 *   PROJECT → FEATURE FAMILY → ACTOR MODE → PAGE FAMILY → TAB FAMILY → CHILD PAGE / DRAWER / MODAL / STATE → COMPONENT → INTERACTION
 * and every material node carries a node contract, an authority binding per viewport and a readiness record.
 * SHARED DESIGN ≠ SHARED LOGIC: tabs share the family shell; each tab owns its data, components, interactions and states.
 *
 * Project-agnostic: projects supply nodes, registries and reconciliation as data.
 */
import type { Viewport } from '../studioos-experience-brain/schema.js';

export const TREE_NODE_TYPES = [
  'PROJECT', 'FEATURE_FAMILY', 'ACTOR_MODE', 'PAGE_FAMILY', 'PAGE', 'SECTION', 'TAB', 'CHILD_PAGE', 'DRAWER', 'MODAL', 'FLOW', 'STATE_VIEW',
] as const;
export type TreeNodeType = (typeof TREE_NODE_TYPES)[number];

/** Nodes that render experience and must carry the full node contract + readiness. */
export const MATERIAL_NODE_TYPES: readonly TreeNodeType[] = ['PAGE', 'SECTION', 'TAB', 'CHILD_PAGE', 'DRAWER', 'MODAL', 'FLOW', 'STATE_VIEW'];
export const ALL_VIEWPORTS: readonly Viewport[] = ['MOBILE', 'TABLET', 'DESKTOP'];

/** The node contract (every material node carries every field). */
export const NODE_CONTRACT_FIELDS = [
  'node_id', 'project_id', 'feature_id', 'actor', 'page_family', 'tab_id', 'parent_node', 'node_type', 'purpose', 'primary_object',
  'primary_task', 'data_domains', 'read_contracts', 'write_contracts', 'components', 'interactions', 'states', 'children', 'drawers',
  'modals', 'responsive_modes', 'authority_refs', 'asset_refs', 'permissions', 'cross_feature_dependencies', 'vault_relationship',
  'inbox_relationship', 'activity_relationship', 'success_condition', 'blocked_condition',
] as const;

/* ─────────────────────────────── authority binding ─────────────────────────────── */

/**
 * A node without a dedicated reference may DERIVE from the approved parent authority when the family composition,
 * component contract, tab logic and asset family are all clear. Otherwise the binding is MISSING — never invented.
 */
export type DerivationConditions = {
  family_composition_clear: boolean;
  component_contract_clear: boolean;
  tab_logic_clear: boolean;
  asset_family_clear: boolean;
};
export const DERIVATION_CONDITIONS: readonly (keyof DerivationConditions)[] = ['family_composition_clear', 'component_contract_clear', 'tab_logic_clear', 'asset_family_clear'];

export type AuthorityBindingKind = 'DIRECT' | 'DERIVED' | 'MISSING';

export type NodeAuthorityBinding = {
  viewport: Viewport;
  binding: AuthorityBindingKind;
  /** Reference ids from the project's authority package (never a legacy surface). */
  refs: string[];
  derivation?: DerivationConditions;
  note?: string;
};

export const derivationClear = (d: DerivationConditions | undefined): boolean => !!d && DERIVATION_CONDITIONS.every((k) => d[k]);
export const bindingUsable = (b: NodeAuthorityBinding): boolean =>
  b.refs.length > 0 && (b.binding === 'DIRECT' || (b.binding === 'DERIVED' && derivationClear(b.derivation)));

/* ─────────────────────────────── node ─────────────────────────────── */

export type NodeRight = 'VIEW' | 'CREATE' | 'EDIT' | 'VERIFY' | 'APPROVE' | 'OVERRIDE' | 'FILE' | 'DOWNLOAD' | 'SHARE' | 'MESSAGE' | 'CONFIGURE';
export type NodePermission = { actor: string; rights: NodeRight[]; scope: string };

export type NodeResponsiveMode = {
  viewport: Viewport;
  /** Id of the actor × viewport responsive authority the node follows. */
  rule_ref: string;
  /** What changes for this node at this viewport (not a scale transform). */
  node_rule: string;
};

export type ExperienceTreeNode = {
  node_id: string;
  project_id: string;
  feature_id: string;
  actor: string;
  page_family: string;
  tab_id: string | null;
  parent_node: string | null;
  node_type: TreeNodeType;
  title: string;
  purpose: string;
  primary_object: string;
  primary_task: string;
  data_domains: string[];
  read_contracts: string[];
  write_contracts: string[];
  components: string[];
  interactions: string[];
  states: string[];
  children: string[];
  drawers: string[];
  modals: string[];
  responsive_modes: NodeResponsiveMode[];
  authority_refs: NodeAuthorityBinding[];
  asset_refs: string[];
  permissions: NodePermission[];
  cross_feature_dependencies: string[];
  vault_relationship: string;
  inbox_relationship: string;
  activity_relationship: string;
  success_condition: string;
  blocked_condition: string;
  /** Anchors into the experience contract (e.g. `states.COLLECTING`, `perspectives.client.primary_task`). */
  experience_refs: string[];
  /** PRIMARY tab of the family, or a SECONDARY_CANDIDATE that needs a founder decision. */
  tab_class?: 'PRIMARY' | 'SECONDARY_CANDIDATE';
  /** Open decision ids (project decision registry) that block this node's authority. */
  open_decisions?: string[];
  /** What this node overrides from its family (inheritance is declared once per family). */
  overrides?: string[];
  notes?: string[];
};

export type ExperienceTreeNodeInput = Omit<ExperienceTreeNode, 'children' | 'drawers' | 'modals'>;

/** Fill children / drawers / modals from parent links (single source: parent_node). */
export function buildExperienceTree(inputs: ExperienceTreeNodeInput[]): ExperienceTreeNode[] {
  const nodes: ExperienceTreeNode[] = inputs.map((n) => ({ ...n, children: [], drawers: [], modals: [] }));
  const byId = new Map(nodes.map((n) => [n.node_id, n]));
  for (const n of nodes) {
    if (!n.parent_node) continue;
    const p = byId.get(n.parent_node);
    if (!p) continue;
    if (n.node_type === 'DRAWER') p.drawers.push(n.node_id);
    else if (n.node_type === 'MODAL') p.modals.push(n.node_id);
    else p.children.push(n.node_id);
  }
  return nodes;
}

/* ─────────────────────────────── registries ─────────────────────────────── */

export type RegistryAuthorityStatus = 'DEFINED_IN_AUTHORITY' | 'DERIVED_FROM_FAMILY' | 'MISSING_AUTHORITY';

export type ComponentContract = {
  component_id: string;
  name: string;
  family_role: 'SHELL' | 'IDENTITY' | 'DATA' | 'ACTION' | 'STATUS' | 'BRAND' | 'FEEDBACK' | 'INPUT';
  purpose: string;
  actors: string[];
  authority_refs: string[];
  authority_status: RegistryAuthorityStatus;
  asset_refs: string[];
  ui_states: string[];
  data_domains: string[];
  interactions: string[];
  responsive: Partial<Record<Viewport, string>>;
  rules?: string[];
};

export type InteractionStatus = 'DEFINED' | 'ROADMAP_NOT_SUPPORTED' | 'ILLEGIBLE_IN_AUTHORITY' | 'CANDIDATE_FOUNDER_DECISION';

export type InteractionContract = {
  interaction_id: string;
  label: string;
  actor: string;
  trigger: string;
  target: string;
  data_effect: string;
  ui_effect: string;
  success: string;
  failure: string;
  permission: string;
  analytics_event: string | null;
  /** Data contract id the interaction writes (null = navigation / read only). */
  write_contract: string | null;
  state_transition: { from: string; to: string } | null;
  contract_refs: string[];
  authority_refs: string[];
  status: InteractionStatus;
  note?: string;
};

export const INTERACTION_REQUIRED_FIELDS: readonly (keyof InteractionContract)[] = ['actor', 'trigger', 'target', 'data_effect', 'ui_effect', 'success', 'failure', 'permission'];

export type StateLayer = 'QUARTER' | 'UI' | 'RECORD';

export type StateContract = {
  state_id: string;
  layer: StateLayer;
  label: string;
  meaning: string;
  /** Contract state(s) this state maps to (QUARTER layer) or the record / UI rule it follows. */
  maps_to: string[];
  derivation: string;
  client_label?: string;
  staff_mirror?: string;
  material?: boolean;
  applicability?: string;
  data_status?: DataReconciliationStatus;
  authority_refs: string[];
};

export type DataReconciliationStatus = 'EXISTING' | 'PARTIAL' | 'MISSING' | 'LEGACY_DUPLICATE' | 'CONFLICT' | 'NOT_APPLICABLE';
export const DATA_EVIDENCE_KINDS = ['TABLES', 'SERVICES', 'ROUTES', 'MUTATIONS', 'RLS', 'FILES', 'REQUESTS'] as const;
export type DataEvidenceKind = (typeof DATA_EVIDENCE_KINDS)[number];
export type DataEvidence = { status: DataReconciliationStatus; refs: string[]; note: string };

export type DataDomainContract = {
  domain_id: string;
  label: string;
  owner: string;
  readers: string[];
  writers: string[];
  experience_refs: string[];
  status: DataReconciliationStatus;
  evidence: Record<DataEvidenceKind, DataEvidence>;
  fields_present: string[];
  fields_missing: string[];
  conflicts: string[];
  legacy_duplicates: string[];
};

/** One read or write contract a node binds to (resolved against the existing functional truth — never changed). */
export type DataContractRef = {
  contract_id: string;
  kind: 'READ' | 'WRITE';
  domain_id: string;
  implementation: string;
  status: DataReconciliationStatus;
  note?: string;
};

export type ResponsiveAuthority = {
  rule_id: string;
  actor: string;
  viewport: Viewport;
  authority_refs: string[];
  binding: AuthorityBindingKind;
  information_priority: string[];
  grid: string;
  stacking: string;
  nav: string;
  tab_behavior: string;
  panel_density: string;
  cta_placement: string;
  hero_height: string;
  data_visualization: string;
  overflow_strategy: string;
};
export const RESPONSIVE_RULE_FIELDS: readonly (keyof ResponsiveAuthority)[] = ['information_priority', 'grid', 'stacking', 'nav', 'tab_behavior', 'panel_density', 'cta_placement', 'hero_height', 'data_visualization', 'overflow_strategy'];

export type OpenDecision = {
  decision_id: string;
  kind: 'AUTHORITY' | 'BRAND_TOKEN' | 'CONTENT_TRUTH' | 'DATA' | 'SCOPE';
  scope: 'GLOBAL' | 'NODE';
  question: string;
  options: string[];
  recommendation: string;
  blocks_nodes: string[];
  status: 'OPEN' | 'DECIDED';
  evidence: string[];
};

/* ─────────────────────────────── readiness ─────────────────────────────── */

export type NodeReadiness = {
  node_id: string;
  node_type: TreeNodeType;
  actor: string;
  EXPERIENCE_READY: boolean;
  AUTHORITY_READY: boolean;
  DATA_READY: boolean;
  INTERACTION_READY: boolean;
  PERMISSIONS_KNOWN: boolean;
  RESPONSIVE_RULE_EXISTS: boolean;
  IMPLEMENTATION_READY: boolean;
  /** §38 — visual and data status are separate. */
  visual_status: 'VISUALLY_DEFINED' | 'VISUALLY_DERIVED' | 'VISUALLY_MISSING';
  functional_status: 'FUNCTIONALLY_COMPLETE' | 'FUNCTIONALLY_PARTIAL' | 'FUNCTIONALLY_MISSING';
  blockers: string[];
};

export type TreeContext = {
  states: Map<string, StateContract>;
  components: Map<string, ComponentContract>;
  interactions: Map<string, InteractionContract>;
  data_contracts: Map<string, DataContractRef>;
  domains: Map<string, DataDomainContract>;
  responsive: Map<string, ResponsiveAuthority>;
  reference_ids: Set<string>;
  asset_ids: Set<string>;
  decisions: Map<string, OpenDecision>;
  resolveExperienceRef: (ref: string) => boolean;
};

const filled = (v: unknown) => v !== undefined && v !== null && !(typeof v === 'string' && v.trim() === '') && !(Array.isArray(v) && v.length === 0);
const DATA_USABLE: readonly DataReconciliationStatus[] = ['EXISTING', 'PARTIAL'];

/**
 * No false readiness: IMPLEMENTATION_READY only when the experience contract, authority binding, required data
 * contracts, interactions, actor permissions and responsive rules all exist.
 */
export function evaluateNodeReadiness(n: ExperienceTreeNode, ctx: TreeContext): NodeReadiness {
  const blockers: string[] = [];

  // EXPERIENCE — purpose, task, states and contract anchors resolve.
  const missingStates = n.states.filter((s) => !ctx.states.has(s));
  const badRefs = n.experience_refs.filter((r) => !ctx.resolveExperienceRef(r));
  const EXPERIENCE_READY = filled(n.purpose) && filled(n.primary_task) && filled(n.states) && !missingStates.length && filled(n.experience_refs) && !badRefs.length;
  if (!EXPERIENCE_READY) blockers.push(`experience: ${[...missingStates.map((s) => `state ${s}`), ...badRefs.map((r) => `ref ${r}`)].join(', ') || 'purpose / task / states / refs missing'}`);

  // AUTHORITY — every viewport bound (direct, or derived with all four conditions), components authored, no open authority decision.
  const unbound = ALL_VIEWPORTS.filter((v) => !n.authority_refs.some((b) => b.viewport === v && bindingUsable(b)));
  const unknownRefs = n.authority_refs.flatMap((b) => b.refs).filter((r) => !ctx.reference_ids.has(r));
  const missingComponents = n.components.filter((c) => !ctx.components.has(c) || ctx.components.get(c)!.authority_status === 'MISSING_AUTHORITY');
  const openAuthority = (n.open_decisions ?? []).filter((d) => ctx.decisions.get(d)?.status === 'OPEN' && ['AUTHORITY', 'SCOPE'].includes(ctx.decisions.get(d)!.kind));
  const AUTHORITY_READY = !unbound.length && !unknownRefs.length && !missingComponents.length && !openAuthority.length && filled(n.components);
  if (unbound.length) blockers.push(`authority: no usable binding for ${unbound.join(', ')}`);
  if (unknownRefs.length) blockers.push(`authority: unknown refs ${unknownRefs.join(', ')}`);
  if (missingComponents.length) blockers.push(`authority: components without authority ${missingComponents.join(', ')}`);
  if (openAuthority.length) blockers.push(`authority: open decision ${openAuthority.join(', ')}`);

  // DATA — every read / write contract resolves to existing (or partial) functional truth; domains known.
  const contracts = [...n.read_contracts, ...n.write_contracts];
  const unknownContracts = contracts.filter((c) => !ctx.data_contracts.has(c));
  const unusable = contracts.filter((c) => ctx.data_contracts.has(c) && !DATA_USABLE.includes(ctx.data_contracts.get(c)!.status));
  const unknownDomains = n.data_domains.filter((d) => !ctx.domains.has(d));
  const openData = (n.open_decisions ?? []).filter((d) => ctx.decisions.get(d)?.status === 'OPEN' && ['DATA', 'CONTENT_TRUTH'].includes(ctx.decisions.get(d)!.kind));
  const DATA_READY = filled(n.data_domains) && filled(n.read_contracts) && !unknownContracts.length && !unusable.length && !unknownDomains.length && !openData.length;
  if (!DATA_READY) blockers.push(`data: ${[...unknownContracts.map((c) => `unknown ${c}`), ...unusable.map((c) => `${c} ${ctx.data_contracts.get(c)!.status}`), ...unknownDomains.map((d) => `domain ${d}`), ...openData.map((d) => `decision ${d}`)].join(', ') || 'no data binding'}`);

  // INTERACTION — every interaction defined with all required fields and a known write contract.
  const interactionGaps = n.interactions.flatMap((id) => {
    const x = ctx.interactions.get(id);
    if (!x) return [`${id} undefined`];
    // ROADMAP_NOT_SUPPORTED is a defined interaction that renders its unsupported state + fallback; illegible or
    // candidate interactions are not defined.
    if (x.status === 'ILLEGIBLE_IN_AUTHORITY' || x.status === 'CANDIDATE_FOUNDER_DECISION') return [`${id} ${x.status}`];
    const miss = INTERACTION_REQUIRED_FIELDS.filter((f) => !filled(x[f]));
    if (miss.length) return [`${id} missing ${miss.join(', ')}`];
    if (x.write_contract && !n.write_contracts.includes(x.write_contract)) return [`${id} writes ${x.write_contract} not bound on node`];
    return [];
  });
  const INTERACTION_READY = filled(n.interactions) && !interactionGaps.length;
  if (!INTERACTION_READY) blockers.push(`interaction: ${interactionGaps.join(', ') || 'none defined'}`);

  // PERMISSIONS — the node's actor has explicit rights.
  const PERMISSIONS_KNOWN = n.permissions.some((p) => (p.actor === n.actor || p.actor === 'ALL') && p.rights.length > 0) && n.permissions.every((p) => filled(p.scope));
  if (!PERMISSIONS_KNOWN) blockers.push('permissions: actor rights unknown');

  // RESPONSIVE — a rule per viewport that resolves to an actor × viewport responsive authority with every field.
  const respMissing = ALL_VIEWPORTS.filter((v) => {
    const m = n.responsive_modes.find((r) => r.viewport === v);
    const rule = m ? ctx.responsive.get(m.rule_ref) : undefined;
    return !m || !rule || !filled(m.node_rule) || RESPONSIVE_RULE_FIELDS.some((f) => !filled(rule[f]));
  });
  const RESPONSIVE_RULE_EXISTS = !respMissing.length;
  if (!RESPONSIVE_RULE_EXISTS) blockers.push(`responsive: ${respMissing.join(', ')}`);

  const IMPLEMENTATION_READY = EXPERIENCE_READY && AUTHORITY_READY && DATA_READY && INTERACTION_READY && PERMISSIONS_KNOWN && RESPONSIVE_RULE_EXISTS;

  const kinds = n.authority_refs.map((b) => (bindingUsable(b) ? b.binding : 'MISSING'));
  const visual_status = kinds.includes('MISSING') || unbound.length ? 'VISUALLY_MISSING' : kinds.every((k) => k === 'DIRECT') ? 'VISUALLY_DEFINED' : 'VISUALLY_DERIVED';
  const statuses = contracts.map((c) => ctx.data_contracts.get(c)?.status ?? 'MISSING');
  const functional_status = statuses.length && statuses.every((s) => s === 'EXISTING') ? 'FUNCTIONALLY_COMPLETE' : statuses.length && statuses.every((s) => !DATA_USABLE.includes(s)) ? 'FUNCTIONALLY_MISSING' : statuses.length ? 'FUNCTIONALLY_PARTIAL' : 'FUNCTIONALLY_MISSING';

  return { node_id: n.node_id, node_type: n.node_type, actor: n.actor, EXPERIENCE_READY, AUTHORITY_READY, DATA_READY, INTERACTION_READY, PERMISSIONS_KNOWN, RESPONSIVE_RULE_EXISTS, IMPLEMENTATION_READY, visual_status, functional_status, blockers };
}

/* ─────────────────────────────── integrity + coverage ─────────────────────────────── */

export type TreeIntegrity = { ok: boolean; problems: string[]; missing_contract_fields: { node_id: string; fields: string[] }[] };

export function checkTreeIntegrity(nodes: ExperienceTreeNode[], ctx: TreeContext): TreeIntegrity {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const n of nodes) {
    if (ids.has(n.node_id)) problems.push(`duplicate node ${n.node_id}`);
    ids.add(n.node_id);
  }
  const missing_contract_fields: TreeIntegrity['missing_contract_fields'] = [];
  for (const n of nodes) {
    if (n.parent_node && !ids.has(n.parent_node)) problems.push(`${n.node_id}: parent ${n.parent_node} missing`);
    for (const c of n.components) if (!ctx.components.has(c)) problems.push(`${n.node_id}: component ${c} not registered`);
    for (const x of n.interactions) if (!ctx.interactions.has(x)) problems.push(`${n.node_id}: interaction ${x} not registered`);
    for (const s of n.states) if (!ctx.states.has(s)) problems.push(`${n.node_id}: state ${s} not registered`);
    for (const a of n.asset_refs) if (!ctx.asset_ids.has(a)) problems.push(`${n.node_id}: asset ${a} not in the asset contract`);
    for (const d of n.open_decisions ?? []) if (!ctx.decisions.has(d)) problems.push(`${n.node_id}: decision ${d} not registered`);
    if (MATERIAL_NODE_TYPES.includes(n.node_type)) {
      const record = n as unknown as Record<string, unknown>;
      const miss = NODE_CONTRACT_FIELDS.filter((f) => !(f in record) || record[f] === undefined);
      if (miss.length) missing_contract_fields.push({ node_id: n.node_id, fields: miss });
    }
  }
  return { ok: !problems.length && !missing_contract_fields.length, problems, missing_contract_fields };
}

export type TreeCoverage = {
  pages: number;
  sections: number;
  tabs: number;
  primary_tabs: number;
  candidate_tabs: number;
  children: number;
  drawers: number;
  modals: number;
  flows: number;
  state_views: number;
  material_nodes: number;
  states: number;
  interactions: number;
  components: number;
  data_domains: number;
  actor_modes: number;
  viewport_modes: number;
  page_families: number;
};

export function treeCoverage(nodes: ExperienceTreeNode[], ctx: TreeContext): TreeCoverage {
  const count = (t: TreeNodeType) => nodes.filter((n) => n.node_type === t).length;
  const material = nodes.filter((n) => MATERIAL_NODE_TYPES.includes(n.node_type));
  const viewports = new Set(material.flatMap((n) => n.responsive_modes.map((r) => r.viewport)));
  return {
    pages: count('PAGE'),
    sections: count('SECTION'),
    tabs: count('TAB'),
    primary_tabs: nodes.filter((n) => n.node_type === 'TAB' && n.tab_class !== 'SECONDARY_CANDIDATE').length,
    candidate_tabs: nodes.filter((n) => n.node_type === 'TAB' && n.tab_class === 'SECONDARY_CANDIDATE').length,
    children: count('CHILD_PAGE'),
    drawers: count('DRAWER'),
    modals: count('MODAL'),
    flows: count('FLOW'),
    state_views: count('STATE_VIEW'),
    material_nodes: material.length,
    states: ctx.states.size,
    interactions: ctx.interactions.size,
    components: ctx.components.size,
    data_domains: ctx.domains.size,
    actor_modes: count('ACTOR_MODE'),
    viewport_modes: viewports.size,
    page_families: count('PAGE_FAMILY'),
  };
}
