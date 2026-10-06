/**
 * P0.AIO.IFTA.AUTHORITY-BUNDLE-INGEST-AND-PAGE-TREE-PROOF1 — the Brain ingests the AIO IFTA authority bundle and
 * produces the page / tab / state tree. These tests are the success criteria (sprint §43) as code.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { aio as brain } from '../shared/studioos-experience-brain/index';
import { ALL_VIEWPORTS, MATERIAL_NODE_TYPES, NODE_CONTRACT_FIELDS, aio, aioIfta, bindingUsable, checkLegacyUse, evaluateNodeReadiness } from '../shared/studioos-visual-authority/index';
import { AIO_IFTA_BUNDLE_DOCS_DIR, aioIftaProofStatus, buildAioIftaAuthorityBundleExports } from '../scripts/studioos/aio-ifta-authority-bundle-export';

const ROOT = path.resolve(__dirname, '..');
const abs = (p: string) => path.join(ROOT, p);
const node = (id: string) => aioIfta.aioIftaNode(id)!;
const readiness = new Map(aioIfta.AIO_IFTA_READINESS.map((r) => [r.node_id, r]));
const CLIENT_TABS = ['PROGRESS', 'FUEL_PURCHASES', 'MILEAGE', 'VEHICLES', 'JURISDICTIONS', 'DOCUMENTS'];

describe('1–4 · bundle ingest, brand, logo', () => {
  it('every package file is stored byte-for-byte (sha256 + size) and has an authority role', () => {
    for (const f of aioIfta.AIO_IFTA_BUNDLE_FILES) {
      const buf = readFileSync(abs(f.path));
      expect(createHash('sha256').update(buf).digest('hex'), f.ref_id).toBe(f.sha256);
      expect(buf.length, f.ref_id).toBe(f.bytes);
      expect(f.role.length, f.ref_id).toBeGreaterThan(20);
      expect(f.runtime_asset).toBe(false);
    }
    const manifest = JSON.parse(readFileSync(abs(`${aioIfta.AIO_IFTA_BUNDLE_DIR}/manifest.json`), 'utf8'));
    for (const [k, v] of Object.entries(aioIfta.AIO_IFTA_BUNDLE_MANIFEST)) expect(manifest[k], k).toBe(v);
    expect([...manifest.files].sort()).toEqual(aioIfta.AIO_IFTA_BUNDLE_FILES.filter((f) => f.ref_id !== 'BUNDLE_MANIFEST').map((f) => f.bundle_path).sort());
    const onDisk = (d: string): string[] => readdirSync(d).flatMap((x) => (statSync(path.join(d, x)).isDirectory() ? onDisk(path.join(d, x)) : [path.join(d, x)]));
    expect(onDisk(abs(aioIfta.AIO_IFTA_BUNDLE_DIR))).toHaveLength(aioIfta.AIO_IFTA_BUNDLE_FILES.length);
    expect(existsSync(abs(`${aioIfta.AIO_IFTA_BUNDLE_DIR}/05_CONTRACTS`))).toBe(false);
  });

  it('brand authority: positioning, uppercase typography, actor themes; token + typography conflicts are surfaced, not resolved silently', () => {
    const b = aioIfta.AIO_BRAND_AUTHORITY;
    expect([b.master_tagline, b.positioning, b.product_promise, b.secondary_line]).toEqual(['WHERE BUSINESS MEETS THE ROAD.', 'THE BUSINESS OFFICE BEHIND THE TRUCK.', 'FROM STARTUP TO EVERY MILE AFTER.', 'ONE OFFICE. THE WHOLE ROAD AHEAD.']);
    expect(b.voice).toEqual(['CLEAR', 'CAPABLE', 'CONNECTED', 'HUMAN']);
    expect(b.typography.rule).toBe('UPPERCASE_PRIMARY');
    expect(aioIfta.AIO_ACTOR_THEMES.PUBLIC.theme).toBe('DARK_PRIMARY');
    expect(aioIfta.AIO_ACTOR_THEMES.CLIENT.theme).toBe('LIGHT_PRIMARY');
    expect(aioIfta.AIO_ACTOR_THEMES.FOUNDER_STAFF.theme).toBe('LIGHT_PRIMARY + DARK_OPERATIONAL_ACCENTS');
    const open = aioIfta.AIO_IFTA_DECISIONS.filter((d) => d.status === 'OPEN').map((d) => d.decision_id);
    expect(open).toEqual(expect.arrayContaining(['D-BRAND-TOKENS', 'D-TYPOGRAPHY']));
    expect(aio.AIO_BRAND_CONTEXT.brand_context_id).toBe(aioIfta.AIO_BRAND_CONTEXT_ID);
    expect(aio.AIO_BRAND_CONTEXT.typography).toMatch(/UPPERCASE PRIMARY/);
  });

  it('top-nav simple-mark rule and lower-band full-lockup rule are LOCKED and enforced by the component registry', () => {
    expect(aioIfta.AIO_LOGO_RULES.status).toBe('LOCKED');
    expect(aioIfta.AIO_LOGO_RULES.top_nav.rule).toBe('SIMPLE_MARK_ONLY');
    expect(aioIfta.AIO_LOGO_RULES.lower_band.rule).toBe('FULL_LOCKUP_ALLOWED');
    expect(aio.AIO_BRAND_CONTEXT.logo_rules).toMatch(/SIMPLE AIO MARK ONLY.*FULL LOCKUP only/);
    const comp = (id: string) => aioIfta.AIO_IFTA_COMPONENTS.find((c) => c.component_id === id)!;
    expect(comp('TOP_NAV').asset_refs).toContain('BRAND.SIMPLE_MARK');
    expect(comp('TOP_NAV').asset_refs).not.toContain('BRAND.FULL_LOCKUP');
    const lockupUsers = aioIfta.AIO_IFTA_COMPONENTS.filter((c) => c.asset_refs.includes('BRAND.FULL_LOCKUP')).map((c) => c.component_id);
    expect(lockupUsers).toEqual(['BRAND_EXIT_BAND']);
  });
});

describe('5–10 · actors, viewports, tabs, children, states', () => {
  const material = aioIfta.AIO_IFTA_MATERIAL_NODES;

  it('3 actor modes and 3 viewport modes; every material node has a responsive rule + authority binding per viewport', () => {
    expect(aioIfta.AIO_IFTA_TREE.filter((n) => n.node_type === 'ACTOR_MODE').map((n) => n.actor).sort()).toEqual(['CLIENT', 'FOUNDER_STAFF', 'PUBLIC']);
    expect(aioIfta.AIO_IFTA_COVERAGE.viewport_modes).toBe(3);
    for (const n of material) {
      expect(n.responsive_modes.map((m) => m.viewport), n.node_id).toEqual([...ALL_VIEWPORTS]);
      expect(n.authority_refs.map((b) => b.viewport), n.node_id).toEqual([...ALL_VIEWPORTS]);
    }
  });

  it('every material node carries the full node contract; tree integrity holds', () => {
    expect(aioIfta.AIO_IFTA_TREE_INTEGRITY.ok).toBe(true);
    for (const n of material) for (const f of NODE_CONTRACT_FIELDS) expect(n[f as keyof typeof n], `${n.node_id}.${f}`).not.toBeUndefined();
    expect(material.every((n) => MATERIAL_NODE_TYPES.includes(n.node_type))).toBe(true);
  });

  it('all six client tabs are first-class TAB nodes with a staff mirror; NOTES is a candidate, not a seventh primary tab', () => {
    const clientTabs = aioIfta.AIO_IFTA_TREE.filter((n) => n.parent_node === 'AIO.IFTA.CLIENT.ROOM' && n.node_type === 'TAB');
    expect(clientTabs.filter((t) => t.tab_class === 'PRIMARY').map((t) => t.tab_id)).toEqual(CLIENT_TABS);
    expect(clientTabs.filter((t) => t.tab_class === 'SECONDARY_CANDIDATE').map((t) => t.tab_id)).toEqual(['NOTES']);
    const staffTabs = aioIfta.AIO_IFTA_TREE.filter((n) => n.parent_node === 'AIO.IFTA.STAFF.CASE' && n.node_type === 'TAB' && n.tab_class === 'PRIMARY').map((t) => t.tab_id);
    expect(staffTabs).toEqual(['OVERVIEW', ...CLIENT_TABS.slice(1)]);
    expect(aioIfta.AIO_IFTA_DECISIONS.find((d) => d.decision_id === 'D-NOTES-TAB')!.status).toBe('OPEN');
  });

  it('tabs have individual logic / data / interaction contracts (shared design ≠ shared logic) and cover every sprint MUST item', () => {
    const tabs = CLIENT_TABS.map((t) => node(`AIO.IFTA.CLIENT.ROOM.${t}`));
    const sig = (n: (typeof tabs)[number]) => JSON.stringify([n.read_contracts, n.write_contracts, n.interactions]);
    expect(new Set(tabs.map(sig)).size).toBe(tabs.length);
    for (const t of tabs) {
      expect(t.overrides?.length, t.tab_id!).toBeGreaterThan(0);
      expect(t.interactions.length, t.tab_id!).toBeGreaterThan(0);
    }
    for (const c of aioIfta.AIO_IFTA_TAB_CONTRACTS) {
      expect(c.must_model.length, c.tab_id).toBeGreaterThan(0);
      for (const m of c.must_model) expect(m.covered_by.length, `${c.tab_id} ${m.item}`).toBeGreaterThan(0);
      expect(node(c.client_node).node_type).toBe('TAB');
      expect(node(c.staff_node).node_type).toBe('TAB');
    }
    // Fuel purchases must model all five sprint statuses.
    const fuel = aioIfta.AIO_IFTA_TAB_CONTRACTS.find((c) => c.tab_id === 'FUEL_PURCHASES')!.must_model.map((m) => m.item);
    expect(fuel).toEqual(expect.arrayContaining(['PROCESSED', 'NEEDS REVIEW', 'MISSING DETAILS', 'DUPLICATE', 'UNREADABLE', 'STATE']));
  });

  it('the tree models more than tabs: root, children, drawers, modals, upload / correction flows, detail views, and filed / archived / next-quarter / failure states', () => {
    const c = aioIfta.AIO_IFTA_COVERAGE;
    expect(c.pages).toBeGreaterThanOrEqual(4);
    expect(c.children).toBeGreaterThan(0);
    expect(c.drawers).toBeGreaterThan(0);
    expect(c.modals).toBeGreaterThan(0);
    for (const id of ['AIO.IFTA.CLIENT.ROOM', 'AIO.IFTA.CLIENT.ROOM.FUEL_PURCHASES.UPLOAD', 'AIO.IFTA.CLIENT.ROOM.PROGRESS.CORRECTION_FLOW', 'AIO.IFTA.CLIENT.ROOM.FUEL_PURCHASES.RECEIPT_DETAIL', 'AIO.IFTA.CLIENT.ROOM.FILED', 'AIO.IFTA.CLIENT.ROOM.ARCHIVED', 'AIO.IFTA.CLIENT.ROOM.NEXT_QUARTER_OPEN', 'AIO.IFTA.CLIENT.ROOM.RETURNED', 'AIO.IFTA.STAFF.CASE.AMENDMENT']) expect(node(id), id).toBeDefined();
    const uiStates = new Set(aioIfta.AIO_IFTA_MATERIAL_NODES.flatMap((n) => n.states));
    for (const s of ['UI.EMPTY', 'UI.LOADING', 'UI.SUCCESS', 'UI.ERROR', 'UI.BLOCKED', 'UI.WARNING']) expect(uiStates.has(s), s).toBe(true);
  });

  it('every contract state and every sprint client state is mapped; every material client state has a staff mirror; founder examples are exact', () => {
    const m = aioIfta.buildStateMirror();
    for (const c of m.contract_state_coverage) expect(c.covered_by.length, c.contract_state).toBeGreaterThan(0);
    expect(m.sprint_client_state_family.map((s) => s.state_id)).toEqual([...aioIfta.AIO_IFTA_SPRINT_CLIENT_STATES]);
    for (const s of aioIfta.AIO_IFTA_STATES.filter((x) => x.layer === 'QUARTER')) {
      expect(s.client_label, s.state_id).toBeTruthy();
      expect(s.staff_mirror, s.state_id).toBeTruthy();
    }
    expect(m.founder_examples.every((e) => e.pass)).toBe(true);
    // Contract states stay in the brain contract unchanged.
    expect(brain.AIO_IFTA_CONTRACT.states.map((s) => s.id)).toEqual([...aioIfta.AIO_IFTA_CONTRACT_STATE_IDS]);
  });
});

describe('11–16 · components, interactions, authority binding, inheritance, assets, sidekick', () => {
  it('component registry carries the sprint examples', () => {
    const ids = new Set(aioIfta.AIO_IFTA_COMPONENTS.map((c) => c.component_id));
    for (const c of ['QUARTER_HERO', 'METRICS_RAIL', 'TAB_BAR', 'FILING_WORKFLOW', 'TASK_LIST', 'RECEIPT_ROW', 'UPLOAD_ZONE', 'MAP_PANEL', 'JURISDICTION_TABLE', 'ACTIVITY_TIMELINE', 'INSIGHTS_PANEL', 'STATUS_CHIP', 'FILE_ROW', 'VEHICLE_ROW', 'RISK_FLAG_PANEL', 'NEXT_ACTION_RAIL', 'BRAND_EXIT_BAND']) expect(ids.has(c), c).toBe(true);
  });

  it('interaction registry: every defined interaction has actor, trigger, target, data / UI effect, success, failure, permission; sprint examples present; the illegible item is not bound', () => {
    for (const x of aioIfta.AIO_IFTA_INTERACTIONS.filter((i) => i.status === 'DEFINED')) {
      for (const f of ['actor', 'trigger', 'target', 'data_effect', 'ui_effect', 'success', 'failure', 'permission'] as const) expect(x[f].length, `${x.interaction_id}.${f}`).toBeGreaterThan(0);
      if (x.write_contract) expect(aioIfta.dataContract(x.write_contract), x.interaction_id).toBeDefined();
    }
    const ids = new Set(aioIfta.AIO_IFTA_INTERACTIONS.map((x) => x.interaction_id));
    for (const x of ['I.UPLOAD_RECEIPT', 'I.IMPORT_CSV', 'I.OPEN_RECEIPT', 'I.EDIT_RECEIPT', 'I.STAFF_VERIFY_RECEIPT', 'I.REQUEST_CORRECTION', 'I.REVIEW_DRAFT', 'I.APPROVE_RETURN', 'I.MESSAGE_AIO', 'I.OPEN_JURISDICTION', 'I.DOWNLOAD_FILE', 'I.OPEN_VAULT_RECORD']) expect(ids.has(x), x).toBe(true);
    expect(aioIfta.AIO_IFTA_MATERIAL_NODES.some((n) => n.interactions.includes('I.CONTRACT_09'))).toBe(false);
  });

  it('authority reference binding: sprint examples pass; references are bundle files only; derived bindings carry computed conditions', () => {
    const map = aioIfta.buildReferenceMap();
    expect(map.sprint_examples.every((e) => e.pass)).toBe(true);
    for (const n of aioIfta.AIO_IFTA_MATERIAL_NODES) for (const b of n.authority_refs) {
      for (const r of b.refs) expect(aioIfta.AIO_IFTA_BUNDLE_REF_IDS, `${n.node_id}/${b.viewport}`).toContain(r);
      if (b.binding === 'DERIVED') expect(b.derivation, n.node_id).toBeDefined();
    }
    // The queue has no authority and is never treated as derivable.
    expect(node('AIO.IFTA.STAFF.QUEUE').authority_refs.every((b) => b.binding === 'MISSING' && !bindingUsable(b))).toBe(true);
  });

  it('family inheritance rule exists (inherit shell · typography · material · color · hero · tab logic · band · icons; override task · data · modules · actions · states)', () => {
    const i = aioIfta.AIO_IFTA_FAMILY_INHERITANCE;
    for (const k of ['SHELL', 'TYPOGRAPHY', 'MATERIAL', 'COLOR_LANGUAGE', 'HERO_LOGIC', 'TAB_LOGIC', 'LOWER_BRAND_BAND', 'ICON_FAMILY']) expect(i.inherit, k).toContain(k);
    for (const k of ['PRIMARY_TASK', 'PRIMARY_DATA', 'CONTENT_MODULES', 'ACTIONS', 'STATES']) expect(i.override, k).toContain(k);
    expect(i.child_proof_rule).toMatch(/not a template/);
  });

  it('icon / asset contract covers all twelve classes; strictness forbids substitutes; sidekick is fallback only and was not used', () => {
    const classes = new Set(aioIfta.AIO_IFTA_ASSETS.map((a) => a.asset_class));
    for (const c of aioIfta.ASSET_CLASSES) expect(classes.has(c), c).toBe(true);
    expect(aioIfta.AIO_IFTA_ASSET_STRICTNESS.forbidden).toEqual(expect.arrayContaining(['GENERIC EMOJI', 'DIFFERENT ICON FAMILIES', 'RANDOM COLORS']));
    expect(aioIfta.AIO_IFTA_SIDEKICK_POLICY).toMatchObject({ status: 'SIDEKICK_FALLBACK_ONLY', invoked_this_sprint: false, new_paid_generations: 0, credits_spent: 0 });
    for (const n of aioIfta.AIO_IFTA_MATERIAL_NODES) for (const a of n.asset_refs) expect(aioIfta.AIO_IFTA_ASSETS.some((x) => x.asset_id === a), a).toBe(true);
  });
});

describe('17–22 · legacy firewall, data, readiness, package, no implementation', () => {
  it('LEGACY_VISUAL_LEAK = 0; any visual dimension taken from a legacy surface would be caught', () => {
    expect(aioIfta.legacyVisualLeaks(aio.AIO_IFTA_LEGACY_SURFACES).count).toBe(0);
    expect(checkLegacyUse(aio.AIO_IFTA_LEGACY_SURFACES, [{ surface_id: 'AIO.LEGACY.CLIENT.PORTAL_SHELL', uses: ['LAYOUT'] }]).status).toBe('LEGACY_VISUAL_LEAK');
    expect(aio.AIO_IFTA_LEGACY_SURFACES.every((s) => s.visual_class === 'FUNCTIONAL_REFERENCE_ONLY')).toBe(true);
  });

  it('data reconciliation: 21 domains × 7 evidence kinds, valid statuses, every node contract resolves; IFTA has no Supabase table and no tax computation', () => {
    const kinds = ['TABLES', 'SERVICES', 'ROUTES', 'MUTATIONS', 'RLS', 'FILES', 'REQUESTS'];
    const ok = ['EXISTING', 'PARTIAL', 'MISSING', 'LEGACY_DUPLICATE', 'CONFLICT', 'NOT_APPLICABLE'];
    expect(aioIfta.AIO_IFTA_DATA_DOMAINS).toHaveLength(21);
    for (const d of aioIfta.AIO_IFTA_DATA_DOMAINS) {
      expect(Object.keys(d.evidence).sort(), d.domain_id).toEqual([...kinds].sort());
      for (const k of kinds) expect(ok, `${d.domain_id}.${k}`).toContain(d.evidence[k as keyof typeof d.evidence].status);
    }
    for (const n of aioIfta.AIO_IFTA_MATERIAL_NODES) for (const c of [...n.read_contracts, ...n.write_contracts]) expect(aioIfta.dataContract(c), `${n.node_id} → ${c}`).toBeDefined();
    expect(aioIfta.AIO_MIGRATIONS.some((m) => m.tables.some((t: string) => /ifta|fuel/i.test(t)))).toBe(false);
    expect(aioIfta.AIO_TAX_COMPUTATION.status).toBe('MISSING');
  });

  it('public mode never binds private client data', () => {
    for (const n of aioIfta.AIO_IFTA_MATERIAL_NODES.filter((x) => x.actor === 'PUBLIC')) {
      for (const c of [...n.read_contracts, ...n.write_contracts]) expect(c, n.node_id).toMatch(/^(PUBLIC|ENROLL)\./);
    }
    expect(aioIfta.AIO_IFTA_DECISIONS.find((d) => d.decision_id === 'D-PUBLIC-SAMPLE-DATA')!.status).toBe('DECIDED');
  });

  it('every material node has a readiness record; IMPLEMENTATION_READY never without all six conditions (no false readiness)', () => {
    expect(aioIfta.AIO_IFTA_READINESS).toHaveLength(aioIfta.AIO_IFTA_MATERIAL_NODES.length);
    for (const r of aioIfta.AIO_IFTA_READINESS) {
      const all = r.EXPERIENCE_READY && r.AUTHORITY_READY && r.DATA_READY && r.INTERACTION_READY && r.PERMISSIONS_KNOWN && r.RESPONSIVE_RULE_EXISTS;
      expect(r.IMPLEMENTATION_READY, r.node_id).toBe(all);
      if (!r.IMPLEMENTATION_READY) expect(r.blockers.length, r.node_id).toBeGreaterThan(0);
    }
    // Nodes writing a MISSING contract, bound to an open node decision, or without authority are never ready.
    for (const n of aioIfta.AIO_IFTA_MATERIAL_NODES) {
      const writesMissing = n.write_contracts.some((c) => aioIfta.dataContract(c)!.status === 'MISSING');
      if (writesMissing || (n.open_decisions ?? []).length || n.authority_refs.some((b) => !bindingUsable(b))) expect(readiness.get(n.node_id)!.IMPLEMENTATION_READY, n.node_id).toBe(false);
    }
    expect(readiness.get('AIO.IFTA.STAFF.QUEUE')!.IMPLEMENTATION_READY).toBe(false);
    // Readiness is recomputed, not stored: removing a component's authority flips the node.
    const ctx = { ...aioIfta.AIO_IFTA_TREE_CONTEXT, components: new Map([...aioIfta.AIO_IFTA_TREE_CONTEXT.components].map(([k, v]) => [k, k === 'MILEAGE_ROW' ? { ...v, authority_status: 'MISSING_AUTHORITY' as const } : v])) };
    expect(evaluateNodeReadiness(node('AIO.IFTA.CLIENT.ROOM.MILEAGE'), ctx).AUTHORITY_READY).toBe(false);
    // Visual and data status are separate fields.
    expect(new Set(aioIfta.AIO_IFTA_READINESS.map((r) => `${r.visual_status}/${r.functional_status}`)).size).toBeGreaterThan(2);
  });

  it('reference package completeness is reported honestly: INCOMPLETE with the staff queue authority named; nothing invented', () => {
    const gap = aioIfta.buildGapReport();
    expect(gap.status).toBe('REFERENCE_PACKAGE_INCOMPLETE');
    expect(gap.authority_gaps.map((g) => g.gap_id)).toEqual(['G-STAFF-QUEUE', 'G-INTERACTION-09']);
    expect(gap.authority_gaps[0].nodes).toEqual(['AIO.IFTA.STAFF.QUEUE']);
    expect(aioIfta.AIO_IFTA_COMPONENTS.find((c) => c.component_id === 'QUEUE_TABLE')!.authority_status).toBe('MISSING_AUTHORITY');
  });

  it('no page implementation, no paid generation: the gate holds every actor at PAGE_TREE_CONFIRMATION_REQUIRED', () => {
    for (const a of ['CLIENT', 'FOUNDER_STAFF', 'PUBLIC'] as const) {
      const g = aio.aioIftaGateStatus(a);
      expect(g.implementation_ready, a).toBe(false);
      expect(g.guard, a).toBe('PAGE_TREE_CONFIRMATION_REQUIRED');
    }
    const files = buildAioIftaAuthorityBundleExports();
    const registry = JSON.parse(files['AIO_IFTA_AUTHORITY_BUNDLE_REGISTRY.json']);
    expect(registry.constraints).toEqual({ page_implementation: false, new_paid_generations: 0, credits_spent: 0, legacy_visual_authority: 'FORBIDDEN' });
    expect(aioIfta.AIO_IFTA_BUNDLE_FILES.every((f) => f.runtime_asset === false)).toBe(true);
    expect(JSON.parse(files['AIO_IFTA_IMPLEMENTATION_READINESS.json']).implementation_may_begin).toBe(false);
  });
});

describe('exports stay generated from the TypeScript source', () => {
  it('the 13 required artifacts on disk match the generator', () => {
    const files = buildAioIftaAuthorityBundleExports();
    expect(Object.keys(files).sort()).toEqual([
      'AIO_IFTA_ACTOR_MODE_MAP.json', 'AIO_IFTA_AUTHORITY_BUNDLE_REGISTRY.json', 'AIO_IFTA_AUTHORITY_REFERENCE_MAP.json', 'AIO_IFTA_COMPONENT_REGISTRY.json',
      'AIO_IFTA_DATA_CONTRACT_RECONCILIATION.json', 'AIO_IFTA_IMPLEMENTATION_READINESS.json', 'AIO_IFTA_INTERACTION_REGISTRY.json', 'AIO_IFTA_PAGE_TREE.json',
      'AIO_IFTA_PAGE_TREE_PROOF.md', 'AIO_IFTA_REFERENCE_PACKAGE_GAP_REPORT.json', 'AIO_IFTA_RESPONSIVE_AUTHORITY_MAP.json', 'AIO_IFTA_STATE_REGISTRY.json', 'AIO_IFTA_TAB_TREE.json',
    ]);
    for (const [name, body] of Object.entries(files)) expect(readFileSync(abs(`${AIO_IFTA_BUNDLE_DOCS_DIR}/${name}`), 'utf8'), name).toBe(body);
    const s = aioIftaProofStatus();
    expect(files['AIO_IFTA_PAGE_TREE_PROOF.md']).toContain(`| Implementation-ready nodes | ${s.implementation_ready_nodes.ready} / ${s.implementation_ready_nodes.total} |`);
  });
});
