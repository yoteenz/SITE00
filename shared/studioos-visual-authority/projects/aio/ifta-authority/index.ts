/**
 * AIO IFTA — Brain ingest of the authority bundle → page / tab / state tree proof
 * (P0.AIO.IFTA.AUTHORITY-BUNDLE-INGEST-AND-PAGE-TREE-PROOF1), rebased under AIO OFFICE / CLIENT OFFICE with the founder
 * decisions locked (P0.AIO.OFFICE-WORKSPACE-ARCHITECTURE-AND-IFTA-TREE-FOUNDER-LOCK1). NO PAGE IMPLEMENTATION · NO PAID GENERATION.
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
  type NodeContextMeta,
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
import { AIO_IFTA_SECONDARY_TAB_CONTRACTS, AIO_IFTA_TAB_CONTRACTS, AIO_IFTA_TREE_SPECS, type TreeNodeSpec } from './tree-specs.js';

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
  const tabKnown = spec.tab_id === null || spec.actor === 'PUBLIC' || spec.tab_id === 'OVERVIEW' || AIO_IFTA_TAB_CONTRACTS.some((t) => t.tab_id === spec.tab_id) || AIO_IFTA_SECONDARY_TAB_CONTRACTS.some((t) => t.tab_id === spec.tab_id && (t.actors as readonly string[]).includes(spec.actor));
  return {
    family_composition_clear: !!parent && checkAuthorityLock(parent).locked,
    component_contract_clear: components.length > 0 && components.every((c) => !!c && c.authority_status !== 'MISSING_AUTHORITY'),
    tab_logic_clear: spec.tab_class !== 'SECONDARY_CANDIDATE' && !!spec.purpose && !!spec.primary_task && interactions.length > 0 && interactions.every((x) => !!x && x.status !== 'CANDIDATE_FOUNDER_DECISION' && x.status !== 'ILLEGIBLE_IN_AUTHORITY' && x.status !== 'IDENTITY_RESOLVED_BEHAVIOR_PARTIAL') && tabKnown,
    asset_family_clear: components.every((c) => !!c && c.asset_refs.every((a) => AIO_IFTA_TREE_CONTEXT.asset_ids.has(a))),
  };
}

/** Operating-environment context per node: authored where the node is a context boundary, otherwise from its actor + position. */
const SPEC_BY_ID = new Map(AIO_IFTA_TREE_SPECS.map((s) => [s.node_id, s]));
const ENV_BY_ACTOR: Record<TreeNodeSpec['actor'], string | null> = { FOUNDER_STAFF: 'AIO.OFFICE', CLIENT: 'AIO.CLIENT_OFFICE', PUBLIC: 'AIO.PUBLIC_SITE', AIO: null };
function contextFor(spec: TreeNodeSpec): NodeContextMeta | undefined {
  if (spec.context) return spec.context;
  const environment_id = ENV_BY_ACTOR[spec.actor];
  if (!environment_id) return undefined;
  if (['OPERATING_ENVIRONMENT', 'HUB'].includes(spec.node_type) || spec.node_id === 'AIO.OFFICE.CLIENT_OVERVIEW') {
    const client_scope = spec.actor === 'PUBLIC' ? 'NONE' : spec.actor === 'CLIENT' ? 'FIXED' : spec.node_id === 'AIO.OFFICE.CLIENT_OVERVIEW' ? 'SWITCHABLE' : 'CROSS_CLIENT';
    return { environment_id, workspace_id: null, client_scope, case_type: null, subcontext_type: null };
  }
  if (spec.actor === 'PUBLIC') return { environment_id, workspace_id: 'IFTA', client_scope: 'NONE', case_type: null, subcontext_type: null };
  // Inside a client-quarter (client: under the quarter selector · staff: under the client context) the canonical case applies.
  let cur: TreeNodeSpec | undefined = spec;
  let inCase = false;
  while (cur) {
    if (cur.node_id === 'AIO.IFTA.CLIENT.QUARTER_CONTEXT' || cur.node_id === 'AIO.IFTA.STAFF.CLIENT_CONTEXT') inCase = true;
    cur = cur.parent_node ? SPEC_BY_ID.get(cur.parent_node) : undefined;
  }
  const client_scope = spec.actor === 'CLIENT' ? 'FIXED' : inCase ? 'SWITCHABLE' : 'CROSS_CLIENT';
  return { environment_id, workspace_id: 'IFTA', client_scope, case_type: inCase ? 'IFTA_QUARTER' : null, subcontext_type: inCase ? 'QUARTER' : null };
}

function completeNode(spec: TreeNodeSpec): ExperienceTreeNodeInput {
  const material = MATERIAL_NODE_TYPES.includes(spec.node_type);
  const write_contracts = uniq(spec.interactions.map((i) => AIO_IFTA_TREE_CONTEXT.interactions.get(i)?.write_contract).filter((x): x is string => !!x));
  const data_domains = uniq([...spec.read_contracts, ...write_contracts].map((c) => AIO_IFTA_TREE_CONTEXT.data_contracts.get(c)?.domain_id).filter((x): x is string => !!x));
  const asset_refs = uniq(spec.components.flatMap((c) => AIO_IFTA_TREE_CONTEXT.components.get(c)?.asset_refs ?? []));
  // Only OPEN decisions block a node; decided ones stay traceable in the decision registry (blocks_nodes).
  const open_decisions = AIO_IFTA_DECISIONS.filter((d) => d.status === 'OPEN' && d.blocks_nodes.includes(spec.node_id)).map((d) => d.decision_id);
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
    ...(contextFor(spec) ? { context: contextFor(spec) } : {}),
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
  const partial = AIO_IFTA_INTERACTIONS.filter((x) => x.status === 'IDENTITY_RESOLVED_BEHAVIOR_PARTIAL');
  const runtime = AIO_IFTA_ASSETS.filter((a) => a.runtime === 'RUNTIME_ASSET_MISSING').map((a) => ({ asset_id: a.asset_id, asset_class: a.asset_class, note: a.note ?? '' }));
  const queue = aioIftaNode('AIO.IFTA.STAFF.QUEUE')!;
  // Gaps are computed from the registries: a node viewport with no usable binding, a component without authority, an unreadable contract item.
  const authorityGaps = [
    ...(missingBindings.length ? [{ gap_id: 'G-UNBOUND-NODES', kind: 'MISSING_AUTHORITY', missing: 'Node viewports without a usable authority binding', nodes: uniq(missingBindings.map((m) => m.node_id)), components: [] as string[], interactions: [] as string[] }] : []),
    ...(missingComponents.length ? [{ gap_id: 'G-COMPONENTS', kind: 'MISSING_AUTHORITY', missing: 'Components without authority', nodes: [] as string[], components: missingComponents, interactions: [] as string[] }] : []),
    ...(illegible.length ? [{ gap_id: 'G-ILLEGIBLE', kind: 'ILLEGIBLE_CONTRACT_ITEM', missing: 'Unreadable contract items', nodes: [] as string[], components: [] as string[], interactions: illegible }] : []),
  ];
  return {
    status: authorityGaps.length ? 'REFERENCE_PACKAGE_INCOMPLETE' : 'REFERENCE_PACKAGE_COMPLETE',
    rule: 'IF INCOMPLETE: DO NOT INVENT VISUAL DESIGN. RETURN EXACTLY WHICH AUTHORITY IS MISSING.',
    authority_vocabulary: { DEDICATED_REFERENCE: 'a bundle image governs the node × viewport directly', DERIVED_AUTHORITY: 'derived from the approved family with all four derivation conditions (or by explicit founder authorisation)', MISSING_AUTHORITY: 'no usable authority — never invented' },
    authority_gaps: authorityGaps,
    missing_bindings: missingBindings,
    resolved_gaps: [
      {
        gap_id: 'G-STAFF-QUEUE', previous_status: 'MISSING_AUTHORITY', status: queue.authority_refs.every(bindingUsable) ? 'DERIVED_AUTHORITY' : 'MISSING_AUTHORITY',
        resolution: 'DERIVATION AUTHORIZED BY FOUNDER — designed as the IFTA workspace cross-client landing state (MULTI-CLIENT FILING QUEUE), not a duplicate of the case page.',
        decision: 'D-STAFF-QUEUE-AUTHORITY', nodes: [queue.node_id], components: ['QUEUE_TABLE'], contract: 'docs/aio/ifta/authority-bundle/AIO_IFTA_QUEUE_DERIVATION_CONTRACT.json',
      },
      {
        gap_id: 'G-INTERACTION-09', previous_status: 'ILLEGIBLE_CONTRACT_ITEM', status: 'IDENTITY_RESOLVED / BEHAVIOR_DESCRIPTION_PARTIAL',
        resolution: 'Label “09 RUN FAQS” supplied by the founder (clearer image); sequence MESSAGE TEAM → RUN FAQS → SUBMIT FOR APPROVAL preserved. Behaviour description is not legible — never invented.',
        decision: 'D-INTERACTION-09', interactions: partial.map((x) => x.interaction_id),
        blocking: AIO_IFTA_MATERIAL_NODES.some((n) => partial.some((x) => n.interactions.includes(x.interaction_id))) ? 'BLOCKS_MATERIAL_NODES' : 'NON_BLOCKING — bound to the page families only, no material node',
      },
    ],
    contract_clarifications: partial.map((x) => ({ interaction_id: x.interaction_id, label: x.label, needs: 'Behaviour description: actor, target surface, data effect, success / failure — the founder supplies it; until then the interaction is registered but bound to no material node.' })),
    environment_authority_gaps: {
      note: 'Outside the IFTA reference package: the AIO OFFICE / CLIENT OFFICE environment pages have no authority yet. They are environment-level nodes (non-material in the IFTA tree) and block no IFTA node.',
      nodes: AIO_IFTA_TREE.filter((n) => n.node_type === 'HUB' || n.node_id === 'AIO.OFFICE.CLIENT_OVERVIEW').map((n) => ({ node_id: n.node_id, title: n.title, status: 'MISSING_AUTHORITY' as const })),
    },
    derived_not_gaps: {
      rule: 'A tab / child without a dedicated image derives from the approved parent when family composition, component contract, tab logic and asset family are clear (sprint §36). These are not gaps.',
      nodes: AIO_IFTA_MATERIAL_NODES.filter((n) => n.authority_refs.some((b) => b.binding === 'DERIVED' && bindingUsable(b))).map((n) => n.node_id),
      founder_spot_check_recommended: ['AIO.IFTA.STAFF.QUEUE (founder-authorised derivation — first page with no dedicated reference)', 'AIO.IFTA.CLIENT.ROOM.PROGRESS.RETURN_REVIEW (highest-stakes client decision window)', 'AIO.IFTA.CLIENT.ROOM.FILED (sealed quarter — no dedicated seal asset)', 'WORKSPACE_SWITCHER · CLIENT_SWITCHER placement in the TOP_NAV (proposal)'],
    },
    blocked_by_founder_decision: AIO_IFTA_DECISIONS.filter((d) => d.status === 'OPEN' && (d.kind === 'AUTHORITY' || d.kind === 'SCOPE')).map((d) => ({ decision_id: d.decision_id, question: d.question, blocks_nodes: d.blocks_nodes })),
    runtime_asset_gaps: {
      note: 'Not authority gaps: the package directs composition; these production files are absent. SIDEKICK_FALLBACK_ONLY candidates (TRUE MISSING RUNTIME ASSET) — nothing generated.',
      assets: runtime,
      fonts: 'INTER TIGHT + INTER (open licence) for client / staff UI (D-TYPOGRAPHY). MONUMENT EXTENDED only for PUBLIC / HERO if licensed and approved; the runtime never depends on it.',
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
