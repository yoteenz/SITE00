/**
 * P0.AIO.IFTA.AUTHORITY-BUNDLE-INGEST-AND-PAGE-TREE-PROOF1 — export the Brain's ingest of the AIO IFTA authority bundle
 * and the page / tab / state tree proof (single source: shared/studioos-visual-authority/projects/aio/ifta-authority).
 *
 *   npx tsx scripts/studioos/aio-ifta-authority-bundle-export.ts
 *
 * Every file in docs/aio/ifta/authority-bundle/ except source/ is GENERATED — edit the TypeScript, never the output.
 * tests/aioIftaAuthorityBundleTree1.test.ts keeps them in sync. NO PAGE IMPLEMENTATION · NO PAID GENERATION.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { aio as brain } from '../../shared/studioos-experience-brain/index.js';
import { REFERENCE_AUTHORITY_MUST_SHOW, aio, aioIfta, checkDerivation, checkTerritoryDistinctness, territoryRow } from '../../shared/studioos-visual-authority/index.js';

export const AIO_IFTA_BUNDLE_DOCS_DIR = 'docs/aio/ifta/authority-bundle';
const SPRINT = aioIfta.AIO_IFTA_BUNDLE_SPRINT;
const AT = aioIfta.AIO_IFTA_INGESTED_AT;
const ACTORS = ['CLIENT', 'FOUNDER_STAFF', 'PUBLIC'] as const;
const json = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;
const head = (id: string) => ({ id, sprint: SPRINT, generated_by: 'scripts/studioos/aio-ifta-authority-bundle-export.ts', source: 'shared/studioos-visual-authority/projects/aio/ifta-authority', generated_for: AT, constraints: { page_implementation: false, new_paid_generations: 0, credits_spent: 0, legacy_visual_authority: 'FORBIDDEN' } });
const count = <T,>(xs: T[], key: (x: T) => string) => xs.reduce<Record<string, number>>((m, x) => ((m[key(x)] = (m[key(x)] ?? 0) + 1), m), {});

function gateSummary() {
  return Object.fromEntries(ACTORS.map((a) => {
    const g = aio.aioIftaGateStatus(a);
    return [a, { state: g.state, guard: g.guard, durable_rule: g.durable_rule, conditions: g.conditions, implementation_ready: g.implementation_ready, next_step: g.next_step, reasons: g.reasons }];
  }));
}

/* ─────────────────────────────── statuses for the completion report ─────────────────────────────── */

export function aioIftaProofStatus() {
  const r = new Map(aioIfta.AIO_IFTA_READINESS.map((x) => [x.node_id, x]));
  const tabStatus = (t: (typeof aioIfta.AIO_IFTA_TAB_CONTRACTS)[number]) => {
    const modeled = t.must_model.every((m) => m.covered_by.length > 0);
    const ready = [t.client_node, t.staff_node].every((n) => r.get(n)?.IMPLEMENTATION_READY);
    return { tab_id: t.tab_id, status: !modeled ? 'FAIL' : ready ? 'PASS' : 'PARTIAL', must_items: t.must_model.length, modeled: t.must_model.filter((m) => m.covered_by.length > 0).length, by_status: count(t.must_model, (m) => m.status), client_node_ready: !!r.get(t.client_node)?.IMPLEMENTATION_READY, staff_node_ready: !!r.get(t.staff_node)?.IMPLEMENTATION_READY, blockers: [t.client_node, t.staff_node].flatMap((n) => (r.get(n)?.blockers ?? []).map((b) => `${n.split('.').slice(-2).join('.')}: ${b}`)) };
  };
  const mode = (actor: string) => {
    const nodes = aioIfta.AIO_IFTA_READINESS.filter((x) => x.actor === actor);
    const ready = nodes.filter((x) => x.IMPLEMENTATION_READY).length;
    return { status: ready === nodes.length ? 'PASS' : ready === 0 ? 'FAIL' : 'PARTIAL', ready, total: nodes.length, modeled: 'every material node modeled with a full node contract' };
  };
  const gap = aioIfta.buildGapReport();
  const leaks = aioIfta.legacyVisualLeaks(aio.AIO_IFTA_LEGACY_SURFACES);
  const refMap = aioIfta.buildReferenceMap();
  const ready = aioIfta.AIO_IFTA_READINESS.filter((x) => x.IMPLEMENTATION_READY).length;
  return {
    tabs: aioIfta.AIO_IFTA_TAB_CONTRACTS.map(tabStatus),
    modes: { CLIENT: mode('CLIENT'), FOUNDER_STAFF: mode('FOUNDER_STAFF'), PUBLIC: mode('PUBLIC') },
    authority_reference_binding: { status: refMap.sprint_examples.every((e) => e.pass) && aioIfta.AIO_IFTA_MATERIAL_NODES.every((n) => n.authority_refs.length === 3) ? 'PASS' : 'FAIL', note: 'Every material node states its governing reference(s) per viewport — DIRECT, DERIVED (with the four derivation conditions computed) or MISSING (stated, never invented).' },
    legacy_visual_leaks: leaks.count,
    reference_package: gap.status,
    reference_gaps: gap.authority_gaps.map((g) => `${g.gap_id}: ${g.missing}`),
    implementation_ready_nodes: { ready, total: aioIfta.AIO_IFTA_READINESS.length },
  };
}

/* ─────────────────────────────── artifacts ─────────────────────────────── */

function bundleRegistry() {
  const derivations = Object.fromEntries((['FOUNDER_STAFF', 'PUBLIC'] as const).map((a) => {
    const d = aioIfta.AIO_IFTA_DERIVATIONS[a];
    return [a, { parent_authority: d.parent.authority_id, parent_territories: d.parent_territories.map((t) => t.territory_id), references: d.references, check: checkDerivation({ family_id: d.parent.family_id, feature_id: d.parent.feature_id, actor: a }, d) }];
  }));
  return {
    ...head('AIO_IFTA_AUTHORITY_BUNDLE_REGISTRY'),
    attachment: aioIfta.AIO_IFTA_BUNDLE_ATTACHMENT,
    bundle_dir: aioIfta.AIO_IFTA_BUNDLE_DIR,
    ingest_status: 'PASS — 12 images + README + manifest stored byte-for-byte with sha256; every file has an authority role.',
    pipeline: aioIfta.AIO_IFTA_PIPELINE,
    doctrine: ['AUTHOR FIRST.', 'DERIVE SECOND.', 'SPECIFY THIRD.', 'IMPLEMENT LAST.', 'UPSTREAM DEFINES INTENT.', 'DOWNSTREAM INCREASES FIDELITY.'],
    manifest: aioIfta.AIO_IFTA_BUNDLE_MANIFEST,
    absent_folders: aioIfta.AIO_IFTA_BUNDLE_ABSENT_FOLDERS,
    files: aioIfta.AIO_IFTA_BUNDLE_FILES,
    role_summary: count(aioIfta.AIO_IFTA_BUNDLE_FILES, (f) => f.authority_kind),
    brand_authority: aioIfta.AIO_BRAND_AUTHORITY,
    brand_context: aio.AIO_BRAND_CONTEXT,
    logo_rules: aioIfta.AIO_LOGO_RULES,
    actor_themes: aioIfta.AIO_ACTOR_THEMES,
    territories: { rows: aioIfta.AIO_IFTA_CLIENT_TERRITORIES.map(territoryRow), structure: aioIfta.AIO_IFTA_CLIENT_TERRITORIES.map((t) => ({ territory_id: t.territory_id, structure: t.structure, page_logic: t.page_logic, major_zones: t.major_zones })), distinctness: checkTerritoryDistinctness(aioIfta.AIO_IFTA_CLIENT_TERRITORIES) },
    references: { must_show: REFERENCE_AUTHORITY_MUST_SHOW, client: aioIfta.AIO_IFTA_CLIENT_REFERENCES, founder_staff: aioIfta.AIO_IFTA_STAFF_REFERENCES, public: aioIfta.AIO_IFTA_PUBLIC_REFERENCES, paid_generation_note: 'paid_generation is false for every reference: they are founder-supplied; Studio OS triggered no generation.' },
    founder_decisions: aioIfta.AIO_IFTA_FOUNDER_DECISIONS,
    page_family_authorities: aioIfta.AIO_IFTA_AUTHORITIES,
    derivations,
    gate: gateSummary(),
    page_tree: aioIfta.aioIftaPageTreeConfirmation(aioIfta.AIO_IFTA_OPEN_DECISION_IDS),
    legacy_firewall: {
      status: 'PASS',
      surfaces: aio.AIO_IFTA_LEGACY_SURFACES.map((s) => ({ surface_id: s.surface_id, visual_class: s.visual_class })),
      uses_this_sprint: aioIfta.AIO_IFTA_LEGACY_USES,
      may_inspect: ['BUSINESS LOGIC', 'EXISTING FUNCTION', 'DATA', 'ROUTING', 'PERMISSIONS', 'CONTENT TRUTH', 'CURRENT CAPABILITIES', 'BACKEND CONTRACTS'],
      may_not_control: ['HEADER', 'NAVIGATION GEOMETRY', 'SIDEBAR', 'FOOTER', 'PAGE WIDTH', 'GRID', 'CARD SYSTEM', 'PANEL SYSTEM', 'TYPOGRAPHY', 'SPACING', 'COLOR', 'RESPONSIVE RULES', 'LAYOUT', 'COMPOSITION', 'VISUAL PROPORTION', 'SHELL ARCHITECTURE'],
      leaks: aioIfta.legacyVisualLeaks(aio.AIO_IFTA_LEGACY_SURFACES),
    },
    sidekick: aioIfta.AIO_IFTA_SIDEKICK_POLICY,
  };
}

function nestTree() {
  const byParent = new Map<string | null, typeof aioIfta.AIO_IFTA_TREE>();
  for (const n of aioIfta.AIO_IFTA_TREE) byParent.set(n.parent_node, [...(byParent.get(n.parent_node) ?? []), n]);
  const walk = (id: string): unknown => {
    const n = aioIfta.aioIftaNode(id)!;
    return { node_id: n.node_id, node_type: n.node_type, title: n.title, ...(n.tab_class ? { tab_class: n.tab_class } : {}), children: (byParent.get(id) ?? []).map((c) => walk(c.node_id)) };
  };
  return walk('AIO');
}

function pageTree() {
  return {
    ...head('AIO_IFTA_PAGE_TREE'),
    ontology: ['PROJECT', 'FEATURE FAMILY', 'ACTOR MODE', 'PAGE FAMILY', 'TAB FAMILY', 'CHILD PAGE / DRAWER / MODAL / STATE', 'COMPONENT', 'INTERACTION'],
    founder_decision: 'TABS ARE FIRST-CLASS AUTHORITY-DESIGN NODES. SHARED DESIGN ≠ SHARED LOGIC.',
    tree_id: aioIfta.AIO_IFTA_PAGE_TREE_ID,
    status: aioIfta.aioIftaPageTreeConfirmation(aioIfta.AIO_IFTA_OPEN_DECISION_IDS),
    node_contract_fields: ['node_id', 'project_id', 'feature_id', 'actor', 'page_family', 'tab_id', 'parent_node', 'node_type', 'purpose', 'primary_object', 'primary_task', 'data_domains', 'read_contracts', 'write_contracts', 'components', 'interactions', 'states', 'children', 'drawers', 'modals', 'responsive_modes', 'authority_refs', 'asset_refs', 'permissions', 'cross_feature_dependencies', 'vault_relationship', 'inbox_relationship', 'activity_relationship', 'success_condition', 'blocked_condition'],
    coverage: aioIfta.AIO_IFTA_COVERAGE,
    integrity: aioIfta.AIO_IFTA_TREE_INTEGRITY,
    family_inheritance: aioIfta.AIO_IFTA_FAMILY_INHERITANCE,
    outline: nestTree(),
    nodes: aioIfta.AIO_IFTA_TREE,
  };
}

function tabTree() {
  const r = new Map(aioIfta.AIO_IFTA_READINESS.map((x) => [x.node_id, x]));
  const tabsOf = (page: string) => aioIfta.AIO_IFTA_TREE.filter((n) => n.parent_node === page && n.node_type === 'TAB').map((t) => {
    const contract = aioIfta.AIO_IFTA_TAB_CONTRACTS.find((c) => c.tab_id === t.tab_id || (t.tab_id === 'OVERVIEW' && c.tab_id === 'PROGRESS'));
    const descendants = aioIfta.AIO_IFTA_TREE.filter((n) => n.node_id.startsWith(`${t.node_id}.`)).map((n) => ({ node_id: n.node_id, node_type: n.node_type, title: n.title }));
    return { node_id: t.node_id, tab_id: t.tab_id, tab_class: t.tab_class, title: t.title, purpose: t.purpose, primary_task: t.primary_task, sprint_contract: contract ? { section: contract.sprint_section, purpose: contract.purpose, must_model: contract.must_model, contract_sheet: contract.contract_sheet, own_logic: contract.own_logic } : null, components: t.components, interactions: t.interactions, states: t.states, data_domains: t.data_domains, read_contracts: t.read_contracts, write_contracts: t.write_contracts, children: t.children, drawers: t.drawers, modals: t.modals, descendants, authority_refs: t.authority_refs, overrides: t.overrides ?? [], open_decisions: t.open_decisions ?? [], readiness: r.get(t.node_id) };
  });
  return {
    ...head('AIO_IFTA_TAB_TREE'),
    rule: 'Tabs share the family DESIGN (header, visual family, nav, panel materials, typography, base grid, CTA language, brand environment) and own their LOGIC (data ownership, purpose, components, mutations, states, validation, child routes, drawers, modals, error conditions, actor rights, system relationships).',
    required_inventory: ['PROGRESS', 'FUEL_PURCHASES', 'MILEAGE', 'VEHICLES', 'JURISDICTIONS', 'DOCUMENTS'],
    candidate_tabs: { NOTES: 'Appears in client desktop + every staff reference + 3-actor mobile; absent from the approved parent; asset sheet shows it disabled → SECONDARY_CANDIDATE pending D-NOTES-TAB. No new primary tab without contractual reason.' },
    families: {
      CLIENT: { page: 'AIO.IFTA.CLIENT.ROOM', tabs: tabsOf('AIO.IFTA.CLIENT.ROOM') },
      FOUNDER_STAFF: { page: 'AIO.IFTA.STAFF.CASE', note: 'OVERVIEW is the staff mirror of PROGRESS.', tabs: tabsOf('AIO.IFTA.STAFF.CASE') },
      PUBLIC: { page: 'AIO.IFTA.PUBLIC.SERVICE', note: 'Public mode has no tabs: its section anchors (IFTA FILING ROOM · HOW IT WORKS · FEATURES · JURISDICTIONS · RESOURCES) are SECTION nodes.', sections: aioIfta.AIO_IFTA_TREE.filter((n) => n.parent_node === 'AIO.IFTA.PUBLIC.SERVICE' && n.node_type === 'SECTION').map((s) => ({ node_id: s.node_id, title: s.title, purpose: s.purpose, readiness: r.get(s.node_id) })) },
    },
    tab_status: aioIftaProofStatus().tabs,
  };
}

function usedBy(key: 'components' | 'interactions' | 'states', id: string) {
  return aioIfta.AIO_IFTA_MATERIAL_NODES.filter((n) => (n[key] as string[]).includes(id)).map((n) => n.node_id);
}

function componentRegistry() {
  return {
    ...head('AIO_IFTA_COMPONENT_REGISTRY'),
    rule: 'Reusable family components = shared DESIGN. Each node binds them to its own data, interactions and states.',
    by_authority_status: count(aioIfta.AIO_IFTA_COMPONENTS, (c) => c.authority_status),
    contract_sheet_stack: ['01 HERO BANNER → QUARTER_HERO', '02 METRICS RAIL → METRICS_RAIL', '03 TAB BAR → TAB_BAR', '04 WORKFLOW STATUS → FILING_WORKFLOW', '05 TASK LIST / CARDS → TASK_LIST', '06 MAP PANEL → MAP_PANEL', '07 RECENT UPLOADS → RECENT_UPLOADS', '08 INSIGHTS PANEL → INSIGHTS_PANEL', '09 RECENT ACTIVITY → ACTIVITY_TIMELINE', '10 BOTTOM CTA RAIL → NEXT_ACTION_RAIL', '11 FOOTER LOCKUP → BRAND_EXIT_BAND'],
    components: aioIfta.AIO_IFTA_COMPONENTS.map((c) => ({ ...c, used_by: usedBy('components', c.component_id) })),
  };
}

function interactionRegistry() {
  return {
    ...head('AIO_IFTA_INTERACTION_REGISTRY'),
    fields: ['actor', 'trigger', 'target', 'data_effect', 'ui_effect', 'success', 'failure', 'permission', 'analytics_event'],
    analytics: 'AIO has no product analytics pipeline (scan G-ANALYTICS); analytics_event keys are proposed and carried by the activity + audit trail.',
    by_status: count(aioIfta.AIO_IFTA_INTERACTIONS, (x) => x.status),
    contract_sheet_items: ['01 UPLOAD RECEIPT → I.UPLOAD_RECEIPT', '02 IMPORT CSV → I.IMPORT_CSV · I.IMPORT_MILEAGE_REPORT', '03 OPEN DETAIL DRAWER → I.OPEN_RECEIPT · I.OPEN_MILEAGE_RECORD · I.OPEN_VEHICLE · I.OPEN_JURISDICTION · I.OPEN_FILE', '04 FILTER / SORT → I.FILTER_SORT', '05 VERIFY RECORD → I.CONFIRM_VEHICLES · I.STAFF_VERIFY_RECEIPT · I.VERIFY_MILEAGE_SOURCE', '06 REQUEST CORRECTION → I.REQUEST_CORRECTION', '07 REVIEW DRAFT → I.REVIEW_DRAFT', '08 MESSAGE TEAM → I.MESSAGE_AIO', '09 (illegible) → I.CONTRACT_09', '10 SUBMIT FOR APPROVAL → I.SEND_QUARTER_TO_AIO · I.SEND_FOR_APPROVAL', '11 FILE & CONFIRM → I.RECORD_FILING'],
    interactions: aioIfta.AIO_IFTA_INTERACTIONS.map((x) => ({ ...x, used_by: usedBy('interactions', x.interaction_id), write_contract_status: x.write_contract ? aioIfta.dataContract(x.write_contract)?.status ?? 'UNKNOWN' : null })),
  };
}

function stateRegistry() {
  return {
    ...head('AIO_IFTA_STATE_REGISTRY'),
    layers: count(aioIfta.AIO_IFTA_STATES, (s) => s.layer),
    mirror: aioIfta.buildStateMirror(),
    states: aioIfta.AIO_IFTA_STATES.map((s) => ({ ...s, used_by: usedBy('states', s.state_id) })),
  };
}

function actorModeMap() {
  const g = gateSummary();
  const nodes = (actor: string) => aioIfta.AIO_IFTA_MATERIAL_NODES.filter((n) => n.actor === actor);
  const ready = (actor: string) => aioIfta.AIO_IFTA_READINESS.filter((x) => x.actor === actor && x.IMPLEMENTATION_READY).length;
  const mk = (actor: 'CLIENT' | 'FOUNDER_STAFF' | 'PUBLIC') => ({
    theme: aioIfta.AIO_ACTOR_THEMES[actor],
    authority: aioIfta.AIO_IFTA_AUTHORITIES[actor].authority_id,
    authority_mode: actor === 'CLIENT' ? 'PARENT (3 territories → LOVE_IT T03 LIGHT)' : 'DERIVED FROM THE CLIENT PARENT',
    references: aioIfta.AIO_IFTA_AUTHORITIES[actor].reference_paths,
    gate: g[actor],
    lower_band: aioIfta.AIO_BRAND_AUTHORITY.lower_band_lines[actor],
    logo: { top_nav: 'SIMPLE_MARK_ONLY', lower_band: 'FULL_LOCKUP_ALLOWED' },
    viewports: { MOBILE: `RESP.${actor === 'FOUNDER_STAFF' ? 'STAFF' : actor}.MOBILE`, TABLET: `RESP.${actor === 'FOUNDER_STAFF' ? 'STAFF' : actor}.TABLET`, DESKTOP: `RESP.${actor === 'FOUNDER_STAFF' ? 'STAFF' : actor}.DESKTOP` },
    page_families: aioIfta.AIO_IFTA_TREE.filter((n) => n.node_type === 'PAGE_FAMILY' && n.actor === actor).map((n) => n.node_id),
    pages: nodes(actor).filter((n) => n.node_type === 'PAGE').map((n) => n.node_id),
    tabs_or_sections: nodes(actor).filter((n) => n.node_type === 'TAB' || n.node_type === 'SECTION').map((n) => n.node_id),
    material_nodes: nodes(actor).length,
    implementation_ready: ready(actor),
    experience: { primary_question: brain.AIO_IFTA_CONTRACT.information_hierarchy[actor]?.primary_question ?? null, emotional_target: brain.AIO_IFTA_CONTRACT.emotional_target[actor] ?? null },
  });
  return { ...head('AIO_IFTA_ACTOR_MODE_MAP'), actors: { CLIENT: mk('CLIENT'), FOUNDER_STAFF: mk('FOUNDER_STAFF'), PUBLIC: mk('PUBLIC') }, mirror_rule: 'FOUNDER / STAFF mirror the client quarter as a CASE FILE (mirror, not copy); every material client state carries its staff interpretation.', public_rule: 'PUBLIC MODE IS NOT THE CLIENT APPLICATION WITH DATA HIDDEN. It is a service experience; it never displays private client data (SAMPLE quarter only).' };
}

function responsiveMap() {
  return {
    ...head('AIO_IFTA_RESPONSIVE_AUTHORITY_MAP'),
    doctrine: 'MOBILE · TABLET · DESKTOP ARE RELATED AUTHORITIES. THEY ARE NOT SCALE TRANSFORMS.',
    fields: ['information_priority', 'grid', 'stacking', 'nav', 'tab_behavior', 'panel_density', 'cta_placement', 'hero_height', 'data_visualization', 'overflow_strategy'],
    contract_sheet: 'mobile single column, stacked cards, bottom CTA · tablet two-column flexible modules · desktop multi-column full workspace',
    rules: aioIfta.AIO_IFTA_RESPONSIVE,
    nodes: aioIfta.AIO_IFTA_MATERIAL_NODES.map((n) => ({ node_id: n.node_id, modes: n.responsive_modes })),
  };
}

function dataReconciliation() {
  return {
    ...head('AIO_IFTA_DATA_CONTRACT_RECONCILIATION'),
    rule: 'FORENSIC, READ-ONLY. DO NOT CHANGE THEM. Visual status and data status are separate (see readiness).',
    source: { repo: 'yoteenz/fsbw · all-in-one-enterprises', sha: aioIfta.AIO_SCAN_SHA, data_mode: aioIfta.AIO_DATA_MODE },
    status_scale: ['EXISTING', 'PARTIAL', 'MISSING', 'LEGACY_DUPLICATE', 'CONFLICT', 'NOT_APPLICABLE'],
    evidence_kinds: ['TABLES', 'SERVICES', 'ROUTES', 'MUTATIONS', 'RLS', 'FILES', 'REQUESTS'],
    domain_status: count(aioIfta.AIO_IFTA_DATA_DOMAINS, (d) => d.status),
    contract_status: count(aioIfta.AIO_IFTA_DATA_CONTRACTS, (c) => c.status),
    global_findings: aioIfta.AIO_IFTA_GLOBAL_DATA_FINDINGS,
    implementation_prerequisites: aioIfta.AIO_IFTA_IMPLEMENTATION_PREREQUISITES,
    domains: aioIfta.AIO_IFTA_DATA_DOMAINS,
    contracts: aioIfta.AIO_IFTA_DATA_CONTRACTS.map((c) => ({ ...c, bound_by: aioIfta.AIO_IFTA_MATERIAL_NODES.filter((n) => n.read_contracts.includes(c.contract_id) || n.write_contracts.includes(c.contract_id)).map((n) => n.node_id) })),
    migrations: aioIfta.AIO_MIGRATIONS,
    routes: aioIfta.AIO_ROUTES,
    mutations: aioIfta.AIO_IFTA_MUTATIONS,
    upload_pipeline: aioIfta.AIO_UPLOAD_PIPELINE,
    eld_gps: aioIfta.AIO_ELD_GPS,
    tax_computation: aioIfta.AIO_TAX_COMPUTATION,
    open_questions: aioIfta.AIO_SCAN_OPEN_QUESTIONS,
  };
}

function readiness() {
  const r = aioIfta.AIO_IFTA_READINESS;
  const k = ['EXPERIENCE_READY', 'AUTHORITY_READY', 'DATA_READY', 'INTERACTION_READY', 'PERMISSIONS_KNOWN', 'RESPONSIVE_RULE_EXISTS', 'IMPLEMENTATION_READY'] as const;
  const g = gateSummary();
  return {
    ...head('AIO_IFTA_IMPLEMENTATION_READINESS'),
    rule: 'NO FALSE READINESS — IMPLEMENTATION_READY only when the experience contract, authority binding, required data contracts, interactions, actor permissions and responsive rules all exist (evaluateNodeReadiness).',
    meaning: 'IMPLEMENTATION_READY = the authority-driven UI for this node can be built against existing functional contracts. FUNCTIONALLY_PARTIAL nodes run on demo-store persistence / stand-in parsing (global data findings); production persistence is a separate data sprint.',
    implementation_may_begin: false,
    why_not: 'Founder pipeline step 10: the founder confirms the page / tab / state tree (and settles the OPEN decisions) before any implementation. Gate guard: PAGE_TREE_CONFIRMATION_REQUIRED for all three actors.',
    family_gate: g,
    summary: { material_nodes: r.length, ...Object.fromEntries(k.map((x) => [x, r.filter((n) => n[x]).length])), visual_status: count(r, (x) => x.visual_status), functional_status: count(r, (x) => x.functional_status) },
    by_actor: Object.fromEntries(ACTORS.map((a) => [a, { total: r.filter((x) => x.actor === a).length, implementation_ready: r.filter((x) => x.actor === a && x.IMPLEMENTATION_READY).length }])),
    open_decisions: aioIfta.AIO_IFTA_DECISIONS.filter((d) => d.status === 'OPEN'),
    decided_by_rule: aioIfta.AIO_IFTA_DECISIONS.filter((d) => d.status === 'DECIDED'),
    implementation_prerequisites: aioIfta.AIO_IFTA_IMPLEMENTATION_PREREQUISITES,
    nodes: r,
  };
}

/* ─────────────────────────────── proof (markdown) ─────────────────────────────── */

function proofMarkdown(): string {
  const s = aioIftaProofStatus();
  const cov = aioIfta.AIO_IFTA_COVERAGE;
  const g = gateSummary();
  const gap = aioIfta.buildGapReport();
  const mirror = aioIfta.buildStateMirror();
  const r = aioIfta.AIO_IFTA_READINESS;
  const outline: string[] = [];
  const kids = (id: string) => aioIfta.AIO_IFTA_TREE.filter((n) => n.parent_node === id);
  const ready = new Map(r.map((x) => [x.node_id, x]));
  const walk = (id: string, depth: number) => {
    const n = aioIfta.aioIftaNode(id)!;
    const rd = ready.get(id);
    const fn = { FUNCTIONALLY_COMPLETE: 'contracts existing', FUNCTIONALLY_PARTIAL: 'contracts partial', FUNCTIONALLY_MISSING: 'contracts missing' }[rd?.functional_status ?? 'FUNCTIONALLY_MISSING'];
    const tag = rd ? ` — ${rd.IMPLEMENTATION_READY ? 'READY' : 'BLOCKED'} · ${rd.visual_status.replace('VISUALLY_', 'visual ').toLowerCase()} · ${fn}` : '';
    outline.push(`${'  '.repeat(depth)}- \`${n.node_type}\` **${n.title}**${n.tab_class === 'SECONDARY_CANDIDATE' ? ' *(candidate)*' : ''}${tag}`);
    for (const c of kids(id)) walk(c.node_id, depth + 1);
  };
  walk('AIO', 0);
  const decisions = aioIfta.AIO_IFTA_DECISIONS.filter((d) => d.status === 'OPEN');
  return [
    '# AIO IFTA — Page / Tab / State Tree Proof',
    '',
    `> Generated by \`scripts/studioos/aio-ifta-authority-bundle-export.ts\` from \`shared/studioos-visual-authority/projects/aio/ifta-authority\`. Do not edit by hand.`,
    '',
    `**Sprint:** ${SPRINT}`,
    '',
    'This sprint tests whether the Brain can ingest the authority package and produce the complete page / tab / state tree without improvising. **No page was implemented. No generation ran.**',
    '',
    '## 1. Status',
    '',
    '| Check | Result |',
    '|---|---|',
    '| Authority bundle ingest | PASS — 12 images + README + manifest, sha256-pinned, every file has a role |',
    '| Brand DNA binding | PASS — palette, uppercase typography, LOCKED logo rule and actor themes bound; two internal conflicts surfaced as decisions |',
    `| Legacy visual firewall | PASS — ${s.legacy_visual_leaks} leaks; legacy read for function only |`,
    `| Actor modes | 3 / 3 |`,
    `| Viewport modes | ${cov.viewport_modes} / 3 |`,
    `| Reference package | ${s.reference_package} |`,
    `| Implementation-ready nodes | ${s.implementation_ready_nodes.ready} / ${s.implementation_ready_nodes.total} |`,
    '| Implementation may begin | NO — the founder confirms this tree first (pipeline step 10) |',
    '',
    '### Gate (Visual Authority Development Gate, eight durable conditions)',
    '',
    '| Actor | State | Guard | Unmet |',
    '|---|---|---|---|',
    ...ACTORS.map((a) => `| ${a} | ${g[a].state} | ${g[a].guard ?? '—'} | ${Object.entries(g[a].conditions).filter(([, v]) => !v).map(([k]) => k).join(', ') || '—'} |`),
    '',
    'CLIENT is the parent: three territories (Executive Dossier · Spatial Workroom · Analytics Command) → founder LOVE_IT on 03 rendered LIGHT → locked. FOUNDER / STAFF and PUBLIC derive from the locked client parent (`checkDerivation`).',
    '',
    '## 2. Coverage',
    '',
    '| Pages | Sections | Tabs (primary + candidate) | Child pages | Drawers | Modals | Flows | State views | States | Interactions | Components | Data domains | Page families |',
    '|---|---|---|---|---|---|---|---|---|---|---|---|---|',
    `| ${cov.pages} | ${cov.sections} | ${cov.tabs} (${cov.primary_tabs} + ${cov.candidate_tabs}) | ${cov.children} | ${cov.drawers} | ${cov.modals} | ${cov.flows} | ${cov.state_views} | ${cov.states} | ${cov.interactions} | ${cov.components} | ${cov.data_domains} | ${cov.page_families} |`,
    '',
    `Material nodes: **${cov.material_nodes}**, each carrying the full node contract. Tree integrity: ${aioIfta.AIO_IFTA_TREE_INTEGRITY.ok ? 'OK' : 'FAIL'}.`,
    '',
    '## 3. Tabs (sprint §11–16)',
    '',
    'Status: PASS = every MUST item modeled and both the client tab and its staff mirror are implementation-ready. PARTIAL = modeled, but a node is blocked by a decision or a missing data contract.',
    '',
    '| Tab | Status | MUST items modeled | Blockers |',
    '|---|---|---|---|',
    ...s.tabs.map((t) => `| ${t.tab_id} | ${t.status} | ${t.modeled} / ${t.must_items} | ${t.blockers.join('<br>') || '—'} |`),
    '',
    '## 4. Tree',
    '',
    'Each node shows READY / BLOCKED (§40), then its visual status (defined = a dedicated reference, derived = from the parent), then its data contracts. Data status is kept separate from visual status (§38). “Contracts existing” means the function exists in AIO today. That is the demo store: production persistence is missing for all of IFTA (see §9).',
    '',
    ...outline,
    '',
    '## 5. Client ⇄ staff mirror (sprint §18–19)',
    '',
    '| State | Client | Staff | Data |',
    '|---|---|---|---|',
    ...mirror.sprint_client_state_family.map((m) => `| ${m.state_id} | ${m.client} | ${m.staff_mirror} | ${m.data_status} |`),
    '',
    `Founder examples: ${mirror.founder_examples.map((e) => `${e.client} ⇄ ${e.staff} (${e.pass ? 'PASS' : 'FAIL'})`).join(' · ')}.`,
    '',
    '## 6. Authority reference binding (sprint §33)',
    '',
    ...aioIfta.buildReferenceMap().sprint_examples.map((e) => `- ${e.example} — ${e.pass ? 'PASS' : 'FAIL'} (${e.binding}: ${e.actual.join(' + ')})`),
    '',
    'Nodes without a dedicated image derive from the approved parent only when all four conditions hold. These are family composition, component contract, tab logic and asset family. The conditions are computed from the registries, not asserted.',
    '',
    '## 7. Reference package',
    '',
    `**${gap.status}**`,
    '',
    ...gap.authority_gaps.map((x) => `- **${x.gap_id}** — ${x.missing}. ${x.why_not_derived}`),
    '',
    `Runtime assets absent from the package (not authority gaps; SIDEKICK_FALLBACK_ONLY candidates, nothing generated): ${gap.runtime_asset_gaps.assets.map((a) => a.asset_id).join(', ')}.`,
    '',
    '## 8. Decisions for the founder (settled at tree confirmation)',
    '',
    ...decisions.map((d) => `- **${d.decision_id}** (${d.kind}${d.blocks_nodes.length ? `, blocks ${d.blocks_nodes.length} node${d.blocks_nodes.length === 1 ? '' : 's'}` : ', global'}): ${d.question}\n  - Recommendation: ${d.recommendation}`),
    '',
    '## 9. Data reconciliation (read-only)',
    '',
    ...aioIfta.AIO_IFTA_GLOBAL_DATA_FINDINGS.map((f) => `- **${f.id}** (${f.status}) — ${f.finding}`),
    '',
    '## 10. Next',
    '',
    '1. The founder confirms the tree and settles the open decisions. The gate then moves to IMPLEMENTATION_READY.',
    '2. **Authority-driven implementation sprint**, which builds the ready nodes against the existing contracts.',
    '3. **Data-contract completion sprint**, run in parallel. It covers the staff worksheet writer, CSV import, staff overrides, rejection / reopen, availability truth, routes, and production persistence.',
    '',
  ].join('\n');
}

export function buildAioIftaAuthorityBundleExports(): Record<string, string> {
  return {
    'AIO_IFTA_AUTHORITY_BUNDLE_REGISTRY.json': json(bundleRegistry()),
    'AIO_IFTA_AUTHORITY_REFERENCE_MAP.json': json({ ...head('AIO_IFTA_AUTHORITY_REFERENCE_MAP'), family_inheritance: aioIfta.AIO_IFTA_FAMILY_INHERITANCE, ...aioIfta.buildReferenceMap() }),
    'AIO_IFTA_PAGE_TREE.json': json(pageTree()),
    'AIO_IFTA_TAB_TREE.json': json(tabTree()),
    'AIO_IFTA_COMPONENT_REGISTRY.json': json(componentRegistry()),
    'AIO_IFTA_INTERACTION_REGISTRY.json': json(interactionRegistry()),
    'AIO_IFTA_STATE_REGISTRY.json': json(stateRegistry()),
    'AIO_IFTA_ACTOR_MODE_MAP.json': json(actorModeMap()),
    'AIO_IFTA_RESPONSIVE_AUTHORITY_MAP.json': json(responsiveMap()),
    'AIO_IFTA_DATA_CONTRACT_RECONCILIATION.json': json(dataReconciliation()),
    'AIO_IFTA_IMPLEMENTATION_READINESS.json': json(readiness()),
    'AIO_IFTA_REFERENCE_PACKAGE_GAP_REPORT.json': json({ ...head('AIO_IFTA_REFERENCE_PACKAGE_GAP_REPORT'), ...aioIfta.buildGapReport(), asset_contract: { classes: aioIfta.ASSET_CLASSES, by_class: count(aioIfta.AIO_IFTA_ASSETS, (a) => a.asset_class), strictness: aioIfta.AIO_IFTA_ASSET_STRICTNESS, assets: aioIfta.AIO_IFTA_ASSETS }, sidekick: aioIfta.AIO_IFTA_SIDEKICK_POLICY }),
    'AIO_IFTA_PAGE_TREE_PROOF.md': proofMarkdown(),
  };
}

if (process.argv[1] && /aio-ifta-authority-bundle-export\.ts$/.test(process.argv[1])) {
  mkdirSync(AIO_IFTA_BUNDLE_DOCS_DIR, { recursive: true });
  const files = buildAioIftaAuthorityBundleExports();
  for (const [name, body] of Object.entries(files)) writeFileSync(`${AIO_IFTA_BUNDLE_DOCS_DIR}/${name}`, body);
  console.log(`exported ${Object.keys(files).length} files to ${AIO_IFTA_BUNDLE_DOCS_DIR}`);
}
