/**
 * AIO IFTA — Brain ingest of the authority bundle → page / tab / state tree proof
 * (P0.AIO.IFTA.AUTHORITY-BUNDLE-INGEST-AND-PAGE-TREE-PROOF1). NO PAGE IMPLEMENTATION · NO PAID GENERATION.
 *
 * Completes every node contract from single sources, evaluates readiness per node (no false readiness), proves
 * coverage, binds authority references per node × viewport, and reports reference-package gaps honestly.
 */
import { aio as brain } from '../../../../studioos-experience-brain/index.js';
import type { Viewport } from '../../../../studioos-experience-brain/schema.js';
import { checkAuthorityLock, checkLegacyUse } from '../../../gate.js';
import type { LegacyUse } from '../../../schema.js';
import {
  ALL_VIEWPORTS,
  MATERIAL_NODE_TYPES,
  bindingUsable,
  buildExperienceTree,
  checkTreeIntegrity,
  evaluateNodeReadiness,
  treeCoverage,
  type DerivationConditions,
  type ExperienceTreeNode,
  type ExperienceTreeNodeInput,
  type NodeReadiness,
  type TreeContext,
} from '../../../tree.js';
import { AIO_IFTA_ASSETS } from './assets.js';
import { AIO_IFTA_AUTHORITIES } from './authorities.js';
import { AIO_IFTA_BUNDLE_FILES, AIO_IFTA_BUNDLE_REF_IDS } from './bundle.js';
import { AIO_IFTA_COMPONENTS } from './components.js';
import { AIO_IFTA_DATA_CONTRACTS, AIO_IFTA_DATA_DOMAINS } from './data.js';
import { AIO_IFTA_DECISIONS } from './decisions.js';
import { AIO_IFTA_INTERACTIONS } from './interactions.js';
import { AIO_IFTA_RESPONSIVE, respRule } from './responsive.js';
import { AIO_IFTA_CONTRACT_STATE_IDS, AIO_IFTA_SPRINT_CLIENT_STATES, AIO_IFTA_STATES } from './states.js';
import { AIO_IFTA_TAB_CONTRACTS, AIO_IFTA_TREE_SPECS, type TreeNodeSpec } from './tree-specs.js';

export * from './bundle.js';
export * from './authorities.js';
export * from './assets.js';
export * from './components.js';
export * from './data.js';
export * from './data-evidence.js';
export * from './decisions.js';
export * from './interactions.js';
export * from './responsive.js';
export * from './states.js';
export * from './tree-specs.js';

const contract = brain.AIO_IFTA_CONTRACT;

/* ─────────────────────────────── experience-contract anchors ─────────────────────────────── */

/** Resolve `field[.key…]` anchors against the IFTA experience contract (arrays match id / verb / state / phase). */
export function resolveExperienceRef(ref: string): boolean {
  if (!ref) return false;
  const dot = ref.indexOf('.');
  const root = dot < 0 ? ref : ref.slice(0, dot);
  const rest = dot < 0 ? null : ref.slice(dot + 1);
  const value = (contract as unknown as Record<string, unknown>)[root];
  if (value === undefined || value === null) return false;
  if (rest === null) return Array.isArray(value) ? value.length > 0 : value !== '';
  if (Array.isArray(value)) {
    return value.some((el) => typeof el === 'object' && el !== null && ['id', 'verb', 'state', 'phase'].some((k) => (el as Record<string, unknown>)[k] === rest));
  }
  let cur: unknown = value;
  for (const seg of rest.split('.')) {
    if (typeof cur !== 'object' || cur === null || !(seg in (cur as object))) return false;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return cur !== undefined && cur !== null && cur !== '';
}

/* ─────────────────────────────── context ─────────────────────────────── */

export const AIO_IFTA_TREE_CONTEXT: TreeContext = {
  states: new Map(AIO_IFTA_STATES.map((s) => [s.state_id, s])),
  components: new Map(AIO_IFTA_COMPONENTS.map((c) => [c.component_id, c])),
  interactions: new Map(AIO_IFTA_INTERACTIONS.map((x) => [x.interaction_id, x])),
  data_contracts: new Map(AIO_IFTA_DATA_CONTRACTS.map((c) => [c.contract_id, c])),
  domains: new Map(AIO_IFTA_DATA_DOMAINS.map((d) => [d.domain_id, d])),
  responsive: new Map(AIO_IFTA_RESPONSIVE.map((r) => [r.rule_id, r])),
  reference_ids: new Set(AIO_IFTA_BUNDLE_REF_IDS),
  asset_ids: new Set(AIO_IFTA_ASSETS.map((a) => a.asset_id)),
  decisions: new Map(AIO_IFTA_DECISIONS.map((d) => [d.decision_id, d])),
  resolveExperienceRef,
};

const uniq = <T,>(xs: T[]) => [...new Set(xs)];
const DEFAULT_RESP: Partial<Record<string, [string, string, string]>> = {
  DRAWER: ['full-height sheet over the tab', 'side drawer over the two-column body', 'side drawer over the three-column body'],
  MODAL: ['bottom sheet', 'centred modal', 'centred modal'],
  FLOW: ['full-screen step flow inside the tab', 'inline flow in the tab body', 'inline flow in the tab body'],
  STATE_VIEW: ['parent shell in this state (stacked)', 'parent shell in this state (two columns)', 'parent shell in this state (three columns)'],
  CHILD_PAGE: ['child page in the family shell (stacked)', 'child page (two columns)', 'child page (three columns)'],
  SECTION: ['stacked section', 'stacked section (wider tiles)', 'section in the wide canvas'],
  TAB: ['tab body stacked', 'tab body two columns', 'tab body three columns'],
  PAGE: ['family shell (mobile)', 'family shell (tablet)', 'family shell (desktop)'],
};

/** Derivation conditions are computed from the registries — never asserted by hand. */
function derivationFor(spec: TreeNodeSpec): DerivationConditions {
  const actor = spec.actor === 'AIO' ? null : spec.actor;
  const parent = actor ? AIO_IFTA_AUTHORITIES[actor] : null;
  const components = spec.components.map((c) => AIO_IFTA_TREE_CONTEXT.components.get(c));
  const interactions = spec.interactions.map((i) => AIO_IFTA_TREE_CONTEXT.interactions.get(i));
  const tabKnown = spec.tab_id === null || spec.actor === 'PUBLIC' || spec.tab_id === 'OVERVIEW' || AIO_IFTA_TAB_CONTRACTS.some((t) => t.tab_id === spec.tab_id);
  return {
    family_composition_clear: !!parent && checkAuthorityLock(parent).locked,
    component_contract_clear: components.length > 0 && components.every((c) => !!c && c.authority_status !== 'MISSING_AUTHORITY'),
    tab_logic_clear: spec.tab_class !== 'SECONDARY_CANDIDATE' && !!spec.purpose && !!spec.primary_task && interactions.length > 0 && interactions.every((x) => !!x && x.status !== 'CANDIDATE_FOUNDER_DECISION' && x.status !== 'ILLEGIBLE_IN_AUTHORITY') && tabKnown,
    asset_family_clear: components.every((c) => !!c && c.asset_refs.every((a) => AIO_IFTA_TREE_CONTEXT.asset_ids.has(a))),
  };
}

function completeNode(spec: TreeNodeSpec): ExperienceTreeNodeInput {
  const material = MATERIAL_NODE_TYPES.includes(spec.node_type);
  const write_contracts = uniq(spec.interactions.map((i) => AIO_IFTA_TREE_CONTEXT.interactions.get(i)?.write_contract).filter((x): x is string => !!x));
  const data_domains = uniq([...spec.read_contracts, ...write_contracts].map((c) => AIO_IFTA_TREE_CONTEXT.data_contracts.get(c)?.domain_id).filter((x): x is string => !!x));
  const asset_refs = uniq(spec.components.flatMap((c) => AIO_IFTA_TREE_CONTEXT.components.get(c)?.asset_refs ?? []));
  const open_decisions = AIO_IFTA_DECISIONS.filter((d) => d.blocks_nodes.includes(spec.node_id)).map((d) => d.decision_id);
  const actorKey = spec.actor === 'AIO' ? null : spec.actor;
  const rules = actorKey ? respRule(actorKey) : null;
  const resp = spec.resp ?? DEFAULT_RESP[spec.node_type] ?? ['—', '—', '—'];
  return {
    node_id: spec.node_id, project_id: 'AIO', feature_id: contract.feature_id, actor: spec.actor, page_family: spec.page_family, tab_id: spec.tab_id,
    parent_node: spec.parent_node, node_type: spec.node_type, title: spec.title, purpose: spec.purpose, primary_object: spec.primary_object,
    primary_task: spec.primary_task, data_domains, read_contracts: spec.read_contracts, write_contracts, components: spec.components,
    interactions: spec.interactions, states: spec.states,
    responsive_modes: material && rules ? ALL_VIEWPORTS.map((v, i) => ({ viewport: v, rule_ref: rules[v], node_rule: resp[i] })) : [],
    authority_refs: material && spec.bindings ? ALL_VIEWPORTS.map((v, i) => {
      const b = spec.bindings![i];
      return { viewport: v, binding: b.binding, refs: [...b.refs], ...(b.binding === 'DERIVED' ? { derivation: derivationFor(spec) } : {}), ...(b.note ? { note: b.note } : {}) };
    }) : [],
    asset_refs, permissions: spec.permissions ?? [], cross_feature_dependencies: spec.cross_feature_dependencies ?? [],
    vault_relationship: spec.vault_relationship ?? '—', inbox_relationship: spec.inbox_relationship ?? '—', activity_relationship: spec.activity_relationship ?? '—',
    success_condition: spec.success_condition, blocked_condition: spec.blocked_condition, experience_refs: spec.experience_refs,
    ...(spec.tab_class ? { tab_class: spec.tab_class } : {}),
    ...(open_decisions.length ? { open_decisions } : {}),
    ...(spec.overrides ? { overrides: spec.overrides } : {}),
    ...(spec.notes ? { notes: spec.notes } : {}),
  };
}

export const AIO_IFTA_TREE: ExperienceTreeNode[] = buildExperienceTree(AIO_IFTA_TREE_SPECS.map(completeNode));
export const AIO_IFTA_MATERIAL_NODES = AIO_IFTA_TREE.filter((n) => MATERIAL_NODE_TYPES.includes(n.node_type));
export const aioIftaNode = (id: string) => AIO_IFTA_TREE.find((n) => n.node_id === id);

/* ─────────────────────────────── readiness, integrity, coverage ─────────────────────────────── */

export const AIO_IFTA_READINESS: NodeReadiness[] = AIO_IFTA_MATERIAL_NODES.map((n) => evaluateNodeReadiness(n, AIO_IFTA_TREE_CONTEXT));
export const AIO_IFTA_TREE_INTEGRITY = checkTreeIntegrity(AIO_IFTA_TREE, AIO_IFTA_TREE_CONTEXT);
export const AIO_IFTA_COVERAGE = treeCoverage(AIO_IFTA_TREE, AIO_IFTA_TREE_CONTEXT);

/* ─────────────────────────────── legacy firewall ─────────────────────────────── */

/** What this sprint read from legacy AIO: function only. A visual dimension here would be a LEGACY_VISUAL_LEAK. */
export const AIO_IFTA_LEGACY_USES: LegacyUse[] = [
  { surface_id: 'AIO.LEGACY.PUBLIC.SERVICE_DETAIL', uses: ['CONTENT_TRUTH', 'CAPABILITIES'] },
  { surface_id: 'AIO.LEGACY.CLIENT.PORTAL_SHELL', uses: ['PERMISSIONS', 'ROUTING'] },
  { surface_id: 'AIO.LEGACY.CLIENT.SERVICES_CENTER', uses: ['ROUTING', 'DATA'] },
  { surface_id: 'AIO.LEGACY.CLIENT.REQUESTS_CENTER', uses: ['FUNCTION', 'DATA'] },
  { surface_id: 'AIO.LEGACY.CLIENT.VAULT', uses: ['DATA', 'FUNCTION'] },
  { surface_id: 'AIO.LEGACY.CLIENT.ROAD_READY', uses: ['DATA', 'ROUTING'] },
  { surface_id: 'AIO.LEGACY.CLIENT.IFTA_READINESS_ENGINE', uses: ['FUNCTION', 'STATE'] },
  { surface_id: 'AIO.LEGACY.STAFF.OFFICE_COMMAND_CENTER', uses: ['DATA', 'PERMISSIONS', 'ROUTING'] },
  { surface_id: 'AIO.LEGACY.STAFF.OFFICE_DOCUMENTS', uses: ['FUNCTION'] },
  { surface_id: 'AIO.LEGACY.SHARED.NAV', uses: ['ROUTING'] },
];

/** Every authority reference a node binds must be a bundle file — never a legacy surface or screenshot. */
export function legacyVisualLeaks(surfaces: Parameters<typeof checkLegacyUse>[0]): { count: number; leaks: string[] } {
  const leaks: string[] = [];
  for (const n of AIO_IFTA_TREE) for (const b of n.authority_refs) for (const r of b.refs) if (!AIO_IFTA_TREE_CONTEXT.reference_ids.has(r)) leaks.push(`${n.node_id}/${b.viewport}: ${r}`);
  for (const c of AIO_IFTA_COMPONENTS) for (const r of c.authority_refs) if (!AIO_IFTA_TREE_CONTEXT.reference_ids.has(r)) leaks.push(`component ${c.component_id}: ${r}`);
  const legacy = checkLegacyUse(surfaces, AIO_IFTA_LEGACY_USES);
  leaks.push(...legacy.leaks.map((l) => `${l.surface_id}: ${l.leaked_dimensions.join(', ')}`));
  return { count: leaks.length, leaks };
}

/* ─────────────────────────────── authority reference map ─────────────────────────────── */

export function buildReferenceMap() {
  const byNode = AIO_IFTA_MATERIAL_NODES.map((n) => ({
    node_id: n.node_id, actor: n.actor, node_type: n.node_type, tab_id: n.tab_id,
    viewports: Object.fromEntries(n.authority_refs.map((b) => [b.viewport, { binding: b.binding, usable: bindingUsable(b), refs: b.refs, ...(b.derivation ? { derivation: b.derivation } : {}), ...(b.note ? { note: b.note } : {}) }])),
  }));
  const byReference = AIO_IFTA_BUNDLE_REF_IDS.map((ref) => ({
    ref_id: ref,
    governs_direct: byNode.flatMap((n) => Object.entries(n.viewports).filter(([, b]) => b.binding === 'DIRECT' && b.refs.includes(ref)).map(([v]) => `${n.node_id}/${v}`)),
    informs_derived: byNode.flatMap((n) => Object.entries(n.viewports).filter(([, b]) => b.binding === 'DERIVED' && b.refs.includes(ref)).map(([v]) => `${n.node_id}/${v}`)),
  }));
  const at = (id: string, v: Viewport) => aioIftaNode(id)?.authority_refs.find((b) => b.viewport === v);
  const examples = [
    { example: 'CLIENT / PROGRESS / MOBILE → CLIENT_MOBILE_PARENT_AUTHORITY', node: 'AIO.IFTA.CLIENT.ROOM.PROGRESS', viewport: 'MOBILE' as Viewport, expect: ['CLIENT_MOBILE_PARENT_AUTHORITY'] },
    { example: 'CLIENT / FUEL_PURCHASES / MOBILE → CLIENT_MOBILE_PARENT_AUTHORITY + FUEL_PURCHASES_CHILD_PROOF', node: 'AIO.IFTA.CLIENT.ROOM.FUEL_PURCHASES', viewport: 'MOBILE' as Viewport, expect: ['CLIENT_MOBILE_PARENT_AUTHORITY', 'FUEL_PURCHASES_CHILD_PROOF'] },
    { example: 'CLIENT / PROGRESS / DESKTOP → CLIENT_TABLET_DESKTOP', node: 'AIO.IFTA.CLIENT.ROOM.PROGRESS', viewport: 'DESKTOP' as Viewport, expect: ['CLIENT_TABLET_DESKTOP'] },
    { example: 'FOUNDER / PROGRESS (OVERVIEW) / DESKTOP → FOUNDER_STAFF_TABLET_DESKTOP', node: 'AIO.IFTA.STAFF.CASE.OVERVIEW', viewport: 'DESKTOP' as Viewport, expect: ['FOUNDER_STAFF_TABLET_DESKTOP'] },
    { example: 'PUBLIC / ROOT / DESKTOP → PUBLIC_TABLET_DESKTOP', node: 'AIO.IFTA.PUBLIC.SERVICE', viewport: 'DESKTOP' as Viewport, expect: ['PUBLIC_TABLET_DESKTOP'] },
  ].map((e) => { const b = at(e.node, e.viewport); return { ...e, actual: b?.refs ?? [], binding: b?.binding ?? 'MISSING', pass: !!b && b.binding === 'DIRECT' && e.expect.every((r) => b.refs.includes(r as never)) }; });
  return { by_node: byNode, by_reference: byReference, sprint_examples: examples };
}

/* ─────────────────────────────── reference package completeness ─────────────────────────────── */

export function buildGapReport() {
  const missingBindings = AIO_IFTA_MATERIAL_NODES.flatMap((n) => n.authority_refs.filter((b) => !bindingUsable(b)).map((b) => ({ node_id: n.node_id, viewport: b.viewport, binding: b.binding, note: b.note ?? null, derivation: b.derivation ?? null })));
  const missingComponents = AIO_IFTA_COMPONENTS.filter((c) => c.authority_status === 'MISSING_AUTHORITY').map((c) => c.component_id);
  const illegible = AIO_IFTA_INTERACTIONS.filter((x) => x.status === 'ILLEGIBLE_IN_AUTHORITY').map((x) => x.interaction_id);
  const runtime = AIO_IFTA_ASSETS.filter((a) => a.runtime === 'RUNTIME_ASSET_MISSING').map((a) => ({ asset_id: a.asset_id, asset_class: a.asset_class, note: a.note ?? '' }));
  const authorityGaps = [
    { gap_id: 'G-STAFF-QUEUE', kind: 'MISSING_AUTHORITY', missing: 'FOUNDER / STAFF fuel tax QUEUE page (multi-client, due date × readiness, hub buckets) — MOBILE · TABLET · DESKTOP', nodes: uniq(missingBindings.filter((m) => m.binding === 'MISSING').map((m) => m.node_id)), components: missingComponents, decision: 'D-STAFF-QUEUE-AUTHORITY', why_not_derived: 'The package shows one client-quarter only; the queue’s primary object (many client-quarters) and its composition are not in any reference. Deriving it would invent composition.' },
    { gap_id: 'G-INTERACTION-09', kind: 'ILLEGIBLE_CONTRACT_ITEM', missing: 'Page / component / interaction contract §05 item 09 label (“…FAQS”)', nodes: [], components: [], interactions: illegible, decision: 'D-INTERACTION-09', why_not_derived: 'Unreadable — never guessed.' },
  ];
  return {
    status: authorityGaps.length ? 'REFERENCE_PACKAGE_INCOMPLETE' : 'REFERENCE_PACKAGE_COMPLETE',
    rule: 'IF INCOMPLETE: DO NOT INVENT VISUAL DESIGN. RETURN EXACTLY WHICH AUTHORITY IS MISSING.',
    authority_gaps: authorityGaps,
    missing_bindings: missingBindings,
    pending_scope_decision: {
      note: 'Bindings unusable only because the node itself is a founder SCOPE decision (tab label in references, no content composition). Not counted as a reference gap; resolved by D-NOTES-TAB.',
      nodes: uniq(missingBindings.filter((m) => m.binding === 'DERIVED').map((m) => m.node_id)),
    },
    derived_not_gaps: {
      rule: 'A tab / child without a dedicated image derives from the approved parent when family composition, component contract, tab logic and asset family are clear (sprint §36). These are not gaps.',
      nodes: AIO_IFTA_MATERIAL_NODES.filter((n) => n.authority_refs.some((b) => b.binding === 'DERIVED' && bindingUsable(b))).map((n) => n.node_id),
      founder_spot_check_recommended: ['AIO.IFTA.CLIENT.ROOM.PROGRESS.RETURN_REVIEW (highest-stakes client decision window)', 'AIO.IFTA.CLIENT.ROOM.FILED (sealed quarter — no dedicated seal asset)'],
    },
    blocked_by_founder_decision: AIO_IFTA_DECISIONS.filter((d) => d.status === 'OPEN' && (d.kind === 'AUTHORITY' || d.kind === 'SCOPE')).map((d) => ({ decision_id: d.decision_id, question: d.question, blocks_nodes: d.blocks_nodes })),
    runtime_asset_gaps: {
      note: 'Not authority gaps: the package directs composition; these production files are absent. SIDEKICK_FALLBACK_ONLY candidates (TRUE MISSING RUNTIME ASSET) — nothing generated.',
      assets: runtime,
      fonts: 'MONUMENT EXTENDED requires a commercial licence if chosen (D-TYPOGRAPHY).',
    },
    reference_defects: AIO_IFTA_BUNDLE_FILES.filter((f) => f.defects.length).map((f) => ({ ref_id: f.ref_id, defects: f.defects })),
  };
}

/* ─────────────────────────────── state registry views ─────────────────────────────── */

export function buildStateMirror() {
  const q = AIO_IFTA_STATES.filter((s) => s.layer === 'QUARTER');
  return {
    sprint_client_state_family: AIO_IFTA_SPRINT_CLIENT_STATES.map((id) => { const s = q.find((x) => x.state_id === id)!; return { state_id: id, maps_to_contract: s.maps_to, client: s.client_label, staff_mirror: s.staff_mirror, applicability: s.applicability ?? 'ALWAYS', data_status: s.data_status }; }),
    contract_state_coverage: AIO_IFTA_CONTRACT_STATE_IDS.map((cs) => ({ contract_state: cs, covered_by: q.filter((s) => s.maps_to.includes(cs)).map((s) => s.state_id) })),
    founder_examples: [
      { client: 'NEEDS YOU — 2 RECEIPTS', staff: 'AWAITING CLIENT — 2 RECEIPT CORRECTIONS', state_id: 'NEEDS_YOU' },
      { client: 'AIO REVIEWING', staff: 'ACTIVE REVIEW', state_id: 'AIO_REVIEWING' },
      { client: 'READY FOR YOUR REVIEW', staff: 'AWAITING CLIENT APPROVAL', state_id: 'READY_FOR_CLIENT_REVIEW' },
    ].map((e) => { const s = q.find((x) => x.state_id === e.state_id)!; return { ...e, registry_client: s.client_label, registry_staff: s.staff_mirror, pass: s.client_label!.replace('{n}', '2') === e.client && s.staff_mirror!.replace('{n}', '2') === e.staff }; }),
  };
}
