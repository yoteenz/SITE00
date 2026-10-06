/**
 * P0.AIO.OFFICE-WORKSPACE-ARCHITECTURE-AND-IFTA-TREE-FOUNDER-LOCK1 — AIO OFFICE / CLIENT OFFICE architecture, workspace
 * switching, truthful workspace states, contextual expansion, and the rebased IFTA tree (sprint §35 tests A–J as code).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ContextError,
  EXPANSION_PLACEMENTS,
  aio as brain,
  canonicalCaseKey,
  checkCaseUniqueness,
  enterFromClient,
  enterFromWorkspaceQueue,
  evaluateExpansion,
  openClientOffice,
  resolveContext,
  resolveWorkspaceState,
  scopeRecords,
  switchClient,
  switchWorkspace,
  workspaceSwitcherOptions,
  type OfficeData,
  type WorkspaceDefinition,
} from '../shared/studioos-experience-brain/index';
import { aioIfta, authorityStatusOf } from '../shared/studioos-visual-authority/index';
import { AIO_OFFICE_DOCS_DIR, buildAioOfficeExports } from '../scripts/studioos/aio-office-export';
import { buildAioIftaAuthorityBundleExports } from '../scripts/studioos/aio-ifta-authority-bundle-export';

const ROOT = path.resolve(__dirname, '..');
const D = brain.AIO_OFFICE_DATA;
const ws = (id: string) => brain.AIO_WORKSPACES.find((w) => w.workspace_id === id)!;
const client = (id: string) => brain.AIO_OFFICE_DEMO_CLIENTS.find((c) => c.client_id === id)!;
const node = (id: string) => aioIfta.aioIftaNode(id)!;
const SC = brain.aioOfficeProofScenarios();
const HUB = { placement: 'CLIENT_OFFICE_HUB', current_workspace_id: null, critical_state: false, error_recovery: false } as const;

describe('environments and controls', () => {
  it('AIO OFFICE = CLIENT × WORKSPACE × SUBCONTEXT; CLIENT OFFICE = FIXED CLIENT × WORKSPACE × SUBCONTEXT; hubs and switchers stay distinct', () => {
    const office = brain.AIO_ENVIRONMENTS.find((e) => e.environment_id === 'AIO.OFFICE')!;
    const portal = brain.AIO_ENVIRONMENTS.find((e) => e.environment_id === 'AIO.CLIENT_OFFICE')!;
    expect([office.client, office.workspace, office.subcontext]).toEqual(['SWITCHABLE', 'SWITCHABLE', 'SWITCHABLE']);
    expect([portal.client, portal.workspace, portal.subcontext]).toEqual(['FIXED', 'SWITCHABLE', 'SWITCHABLE']);
    expect(office.switchers.map((s) => s.dimension)).toEqual(['CLIENT', 'WORKSPACE', 'SUBCONTEXT']);
    expect(portal.switchers.map((s) => s.dimension)).toEqual(['WORKSPACE', 'SUBCONTEXT']);
    // CLIENT and WORKSPACE are never one selector.
    for (const s of office.switchers) expect(s.preserves).not.toContain(s.dimension);
    expect(office.hub!.scope).toBe('CROSS_CLIENT_CROSS_WORKSPACE');
    expect(portal.hub!.scope).toBe('ONE_CLIENT_CROSS_WORKSPACE');
    expect(office.hub!.responsibilities).toEqual(['ALL CLIENTS', 'NEEDS ATTENTION', 'DUE / UPCOMING', 'BLOCKED', 'WAITING ON CLIENT', 'WAITING ON AIO', 'RECENT ACTIVITY', 'ACTIVE WORKSPACES', 'SERVICE HEALTH', 'GLOBAL SEARCH / CLIENT LOOKUP']);
    expect(portal.hub!.responsibilities).toEqual(['ACTIVE WORKSPACES', 'CURRENT ACTIONS', 'UPCOMING DEADLINES', 'DOCUMENT REQUESTS', 'MESSAGES', 'RECENT ACTIVITY', 'AVAILABLE RELEVANT WORKSPACES']);
    expect([office.workspace_landing, portal.workspace_landing]).toEqual(['CROSS_CLIENT_QUEUE', 'CLIENT_WORKSPACE']);
  });

  it('the workspace registry carries every required field and registers only services AIO has', () => {
    const fields = ['workspace_id', 'name', 'category', 'availability', 'client_eligibility_rule', 'founder_route', 'client_route', 'active_case_types', 'subcontext_types', 'required_permissions', 'shared_dependencies', 'adjacent_workspaces', 'expansion_rules', 'workspace_state', 'capabilities'] as const;
    for (const w of brain.AIO_WORKSPACES) {
      for (const f of fields) expect(w[f], `${w.workspace_id}.${f}`).not.toBeUndefined();
      expect(w.supported_states).toEqual(expect.arrayContaining(['ACTIVE', 'AVAILABLE_NOT_ACTIVATED', 'NOT_APPLICABLE']));
      expect(w.entitlement_sources.length, w.workspace_id).toBeGreaterThan(0);
      expect(w.feature_refs.every((f) => brain.AIO_EXPERIENCE_CONTRACTS.some((c) => c.feature_id === f)), w.workspace_id).toBe(true);
    }
    expect(brain.AIO_WORKSPACES.filter((w) => w.workspace_state === 'TREE_PROVEN').map((w) => w.workspace_id)).toEqual(['IFTA']);
    expect(brain.AIO_WORKSPACES.map((w) => w.workspace_id)).not.toContain('PAYROLL_TAX');
  });

  it('the generic model stays project-agnostic: a non-AIO project resolves the same way', () => {
    const w = (id: string, rule: WorkspaceDefinition['client_eligibility_rule']): WorkspaceDefinition => ({ workspace_id: id, name: id, category: 'X', availability: 'OPEN', availability_truth: 'CONSISTENT', client_can_request: true, staff_can_start: true, feature_refs: [], client_eligibility_rule: rule, founder_route: null, client_route: null, active_case_types: ['MATTER'], subcontext_types: ['YEAR'], required_permissions: [], shared_dependencies: [], adjacent_workspaces: [], expansion_rules: [], supported_states: ['ACTIVE', 'AVAILABLE_NOT_ACTIVATED', 'NOT_APPLICABLE'], entitlement_sources: [], workspace_state: 'REGISTERED', capabilities: [] });
    const firm: OfficeData = {
      project_id: 'FIRM', workspaces: [w('TAX', { kind: 'ALL_CLIENTS', explanation: 'all' }), w('PAYROLL', { kind: 'SIGNALS', match: 'ALL', conditions: [{ signal: 'employees', op: 'gte', value: 1 }], explanation: 'employers' })],
      environments: [{ ...brain.AIO_ENVIRONMENTS[0], environment_id: 'FIRM.OFFICE' }], clients: [{ client_id: 'c1', name: 'c1', entitlements: { TAX: { state: 'ACTIVE', source: 'x' } }, signals: { employees: 0 } }],
      cases: [], defaultCaseType: () => 'MATTER', defaultSubcontext: () => '2026', internalCanAccess: () => true,
    };
    expect(resolveContext(firm, { environment_id: 'FIRM.OFFICE', client_id: 'c1', workspace_id: 'PAYROLL', subcontext: null }).view).toBe('WORKSPACE_INACTIVE');
    expect(resolveWorkspaceState(firm.workspaces[1], firm.clients[0]).state).toBe('NOT_APPLICABLE');
  });
});

describe('§35 A–H · switching, workspace states, case identity', () => {
  it('A · founder client switch keeps the workspace; an inactive workspace shows truthfully and never another client', () => {
    const a = SC.A_FOUNDER_CLIENT_SWITCH;
    expect(a.workspace_preserved && a.subcontext_preserved_when_case_exists && a.never_another_client).toBe(true);
    expect(a.to_client_with_case).toMatchObject({ client_id: 'client-b', workspace_id: 'IFTA', view: 'CASE', record_id: 'ifta-client-b-2026-q3' });
    expect(a.to_client_without_workspace).toMatchObject({ client_id: 'client-a', workspace_id: 'IFTA', view: 'WORKSPACE_INACTIVE', case_key: null, record_id: null });
    // Subcontext is dropped (re-resolved) when the new client has no such case.
    const q4c = enterFromWorkspaceQueue(D, 'AIO.OFFICE', 'IFTA', 'client-c', '2026-Q4');
    expect(switchClient(D, q4c, 'client-d').subcontext).toBe('2026-Q4');
    expect(() => switchClient(D, q4c, 'client-zz')).toThrow(ContextError);
  });

  it('B · founder workspace switch keeps the client; the subcontext re-resolves', () => {
    const b = SC.B_FOUNDER_WORKSPACE_SWITCH;
    expect(b.client_preserved).toBe(true);
    expect(b.to_active).toMatchObject({ client_id: 'client-c', workspace_id: 'DISPATCH', view: 'CLIENT_WORKSPACE', subcontext: null });
    expect(b.to_inactive).toMatchObject({ client_id: 'client-c', workspace_id: 'TAGS_REGISTRATION', view: 'WORKSPACE_INACTIVE' });
    expect(b.subcontext_switch).toMatchObject({ client_id: 'client-c', workspace_id: 'IFTA', view: 'CASE', record_id: 'ifta-client-c-2026-q4' });
  });

  it('C · client workspace switch keeps the fixed client', () => {
    const c = SC.C_CLIENT_WORKSPACE_SWITCH;
    expect(c.client_fixed).toBe(true);
    expect([c.from.view, c.to_active.view, c.to_available.view]).toEqual(['CASE', 'CLIENT_WORKSPACE', 'WORKSPACE_EXPANSION']);
  });

  it('D · the client has no client switcher', () => {
    const d = SC.D_CLIENT_HAS_NO_CLIENT_SWITCHER;
    expect(d.switchers).not.toContain('CLIENT');
    expect(d.switch_client_error).toBe('NO_CLIENT_SWITCHER');
    expect(d.foreign_client_error).toBe('CLIENT_FIXED');
    expect(d.context_switchers.client).toBe(false);
    expect(() => resolveContext(D, { environment_id: 'AIO.CLIENT_OFFICE', client_id: null, workspace_id: 'IFTA', subcontext: null })).toThrow(ContextError);
    // No client-office node offers a client switcher.
    for (const n of aioIfta.AIO_IFTA_TREE.filter((x) => x.actor === 'CLIENT')) {
      expect(n.components, n.node_id).not.toContain('CLIENT_SWITCHER');
      expect(n.interactions, n.node_id).not.toContain('I.SWITCH_CLIENT');
    }
  });

  it('E · inactive founder workspace: WORKSPACE NOT ACTIVE FOR THIS CLIENT with supported actions only', () => {
    const e = SC.E_INACTIVE_FOUNDER_WORKSPACE;
    expect(e.context).toMatchObject({ client_id: 'client-a', view: 'WORKSPACE_INACTIVE', record_id: null });
    expect(ws('IFTA').staff_can_start).toBe(false);
    const n = node('AIO.IFTA.STAFF.WORKSPACE_INACTIVE');
    expect(n.title).toBe('WORKSPACE NOT ACTIVE FOR THIS CLIENT');
    expect(n.interactions).toEqual(expect.arrayContaining(['I.OPEN_CLIENT_OVERVIEW', 'I.RETURN_TO_QUEUE', 'I.VIEW_ELIGIBILITY']));
    expect(aioIfta.AIO_IFTA_INTERACTIONS.some((x) => /START_SERVICE/.test(x.interaction_id))).toBe(false);
    expect(n.read_contracts.some((c) => /^(QUARTER|FUEL|MILEAGE|RETURN|FILING)\./.test(c))).toBe(false);
  });

  it('F · inactive client workspace → relevant, explainable expansion; suppressed in critical / error states', () => {
    const f = SC.F_INACTIVE_CLIENT_WORKSPACE_EXPANSION;
    expect(f.context.view).toBe('WORKSPACE_EXPANSION');
    expect(f.expansion).toMatchObject({ suppressed: false, relevance_class: 'HIGH', rule_id: 'X.TAGS.FROM_IFTA.DEADLINES', headline: 'YOU’RE ALREADY MANAGING 3 VEHICLES WITH AIO.', current_related_workspaces: ['IFTA'] });
    expect(f.expansion.reasons).toEqual(['3 vehicles already filed through AIO IFTA', '2 registration / IRP deadline(s) open on file']);
    expect(f.expansion.cta).toEqual({ label: 'EXPLORE TAGS', action: 'I.EXPLORE_WORKSPACE' });
    expect(f.during_critical_state.suppressed_by).toContain('CRITICAL_STATE');
    expect(evaluateExpansion(ws('TAGS_REGISTRATION'), client('client-c'), brain.AIO_WORKSPACES, { ...HUB, error_recovery: true }).suppressed_by).toContain('ERROR_RECOVERY');
    // The client NOT ACTIVE YET node keeps the founder's structure.
    expect(node('AIO.IFTA.CLIENT.NOT_ENROLLED').purpose).toMatch(/WORKSPACE NAME · NOT ACTIVE YET · WHY IT MAY MATTER .* WHAT AIO HANDLES · WHAT YOU PROVIDE · REQUEST FILING/);
  });

  it('G · NOT_APPLICABLE is never aggressive', () => {
    const g = SC.G_NOT_APPLICABLE_NOT_AGGRESSIVE;
    expect(g.context.view).toBe('WORKSPACE_HIDDEN');
    expect(g.switcher.hidden).toContain('IFTA');
    expect(g.switcher.available).not.toContain('IFTA');
    expect(g.expansion.suppressed_by).toContain('NOT_APPLICABLE');
    for (const c of D.clients) {
      const o = workspaceSwitcherOptions(D, c.client_id);
      for (const id of o.available) expect(resolveWorkspaceState(ws(id), c).state, `${c.client_id}/${id}`).toBe('AVAILABLE_NOT_ACTIVATED');
      for (const w of D.workspaces) if (resolveWorkspaceState(w, c).state === 'NOT_APPLICABLE') expect(o.available, `${c.client_id}/${w.workspace_id}`).not.toContain(w.workspace_id);
    }
  });

  it('H · the same case from two entry paths — one canonical identity, one record, founder and client projections', () => {
    const h = SC.H_SAME_CASE_TWO_ENTRY_PATHS;
    expect(h.same_case && h.same_record_for_client).toBe(true);
    expect(h.from_queue.case_key).toBe('AIO:client-c:IFTA:IFTA_QUARTER:2026-Q3');
    expect(h.uniqueness.ok).toBe(true);
    for (const c of D.cases) expect(c.case_key).toBe(canonicalCaseKey(c.identity));
    const dup = checkCaseUniqueness([...D.cases, { ...D.cases[0], record_id: 'staff-copy-of-q2' }]);
    expect(dup.ok).toBe(false);
    expect(dup.duplicates[0].record_ids).toEqual([D.cases[0].record_id, 'staff-copy-of-q2']);
  });

  it('stale state: a context switch re-resolves every scoped domain and never shows another client’s records', () => {
    const s = SC.STALE_STATE;
    expect(s.before).toEqual(['client-c Q3 receipt']);
    expect(s.after_client_switch).toEqual(['client-b Q3 receipt']);
    expect(s.after_inactive_switch).toEqual(['client-a dispatch load']);
    expect(s.scope_keys_differ).toBe(true);
    expect(s.re_resolves).toEqual(['ACTIVE_CASE', 'TABS', 'COUNTS', 'ALERTS', 'TASKS', 'DOCUMENTS', 'MESSAGES', 'ACTIVITY', 'DEADLINES', 'AVAILABLE_ACTIONS', 'EXPANSION_SUGGESTIONS', 'PERMISSIONS', 'SUBCONTEXT_SELECTOR']);
    const portal = openClientOffice(D, 'AIO.CLIENT_OFFICE', 'client-c', 'IFTA');
    expect(scopeRecords(switchWorkspace(D, portal, 'BOOKKEEPING'), [{ client_id: 'client-b', case_key: null }])).toEqual([]);
  });

  it('a queue entry and a client-route entry agree for every seeded case', () => {
    for (const c of D.cases) {
      const q = enterFromWorkspaceQueue(D, 'AIO.OFFICE', 'IFTA', c.identity.client_id, c.identity.subcontext);
      const r = enterFromClient(D, 'AIO.OFFICE', c.identity.client_id, 'IFTA', c.identity.subcontext);
      expect([q.case_key, q.record_id]).toEqual([c.case_key, c.record_id]);
      expect(r.scope_key).toBe(q.scope_key);
    }
  });
});

describe('expansion contract', () => {
  const matrix = D.clients.flatMap((c) => D.workspaces.flatMap((w) => EXPANSION_PLACEMENTS.map((p) => evaluateExpansion(w, c, D.workspaces, { ...HUB, placement: p }))));

  it('every shown suggestion names its rule, real reasons and an active related workspace — no generic fallback', () => {
    const shown = matrix.filter((m) => !m.suppressed);
    expect(shown.length).toBeGreaterThan(0);
    for (const m of shown) {
      expect(m.rule_id).toBeTruthy();
      expect(m.reasons.length).toBeGreaterThan(0);
      expect(m.reasons.join(' ')).not.toMatch(/\{|\}|undefined|null/);
      expect(m.current_related_workspaces.length).toBeGreaterThan(0);
      expect(ws(m.workspace_id).availability_truth).toBe('CONSISTENT');
      expect(resolveWorkspaceState(ws(m.workspace_id), client(m.client_id)).state).toBe('AVAILABLE_NOT_ACTIVATED');
    }
    for (const m of matrix.filter((x) => x.suppressed)) expect(m.suppressed_by.length).toBeGreaterThan(0);
  });

  it('truth guards: conflicting availability, conflicting records, unknown eligibility and missing signals suppress', () => {
    const at = (w: string, c: string) => evaluateExpansion(ws(w), client(c), D.workspaces, HUB);
    expect(at('IFTA', 'client-a').suppressed_by).toContain('MISLEADING'); // IFTA availability sources disagree
    expect(at('BOOKKEEPING', 'client-e').suppressed_by).toContain('CONFLICTING_SERVICE_STATE'); // shipper “active factoring”
    expect(at('TAGS_REGISTRATION', 'client-f').suppressed_by).toContain('ELIGIBILITY_UNKNOWN'); // fleet registry vs IFTA vehicles
    const books = evaluateExpansion(ws('IFTA'), { ...client('client-a'), entitlements: { BOOKKEEPING: { state: 'ACTIVE', source: 'fixture' } } }, D.workspaces, HUB);
    expect(books.suppressed_by).toEqual(expect.arrayContaining(['MISLEADING']));
    expect(brain.AIO_EXPANSION_SIGNALS.find((s) => s.signal === 'fuel_transactions_in_books')!.status).toBe('MISSING');
  });

  it('signals are record-based only; the pre-existing generic fallbacks in AIO are reported, not reused', () => {
    for (const r of brain.AIO_EXPANSION_RULES) for (const c of r.requires) expect(brain.AIO_EXPANSION_SIGNALS.map((s) => s.signal), r.rule_id).toContain(c.signal);
    expect(brain.AIO_EXPANSION_SIGNALS.map((s) => s.signal).join(' ')).not.toMatch(/click|view|visit|session|browse/i);
    expect(brain.AIO_LEGACY_GENERIC_FALLBACKS.length).toBe(5);
  });
});

describe('routes, permissions, tree context', () => {
  it('routes are reconciled with AIO route truth: proposed workspace routes do not collide; superseded helpers are named', () => {
    const r = brain.AIO_OFFICE_ROUTES;
    expect(r.filter((x) => x.status === 'PROPOSED').map((x) => x.route)).toEqual(['/office/workspaces/ifta', '/office/workspaces/ifta/:clientId/:quarter', '/office/clients/:clientId/ifta/:quarter', '/portal/workspaces/ifta', '/portal/workspaces/ifta/:quarter']);
    expect(r.filter((x) => x.status === 'HELPER_UNROUTED').map((x) => x.route)).toEqual(['/office/permitting/fuel-tax(/:caseId)', '/portal/services/ifta(?quarter=)']);
    expect(ws('IFTA')).toMatchObject({ founder_route: '/office/workspaces/ifta', client_route: '/portal/workspaces/ifta', route_status: 'PROPOSED' });
  });

  it('permissions are not broadened: staff use existing office permissions; clients only ever see their own organisation', () => {
    const known = ['clients.read', 'work.read', 'work.manage', 'billing.read', 'factoring_finance.read', 'brokerage_finance.read', 'management.dispatch.read'];
    for (const w of brain.AIO_WORKSPACES) for (const p of w.required_permissions) expect(known, `${w.workspace_id}: ${p}`).toContain(p);
    expect(D.internalCanAccess('client-c')).toBe(true);
    expect(D.internalCanAccess('client-unknown')).toBe(false);
  });

  it('every IFTA tree node carries its operating-environment context; client nodes FIXED, queue CROSS_CLIENT, case SWITCHABLE', () => {
    for (const n of aioIfta.AIO_IFTA_TREE.filter((x) => x.actor !== 'AIO')) expect(n.context, n.node_id).toBeDefined();
    for (const n of aioIfta.AIO_IFTA_MATERIAL_NODES.filter((x) => x.actor === 'CLIENT')) expect(n.context!.client_scope, n.node_id).toBe('FIXED');
    expect(node('AIO.IFTA.STAFF.QUEUE').context!.client_scope).toBe('CROSS_CLIENT');
    expect(node('AIO.IFTA.STAFF.CASE').context).toMatchObject({ environment_id: 'AIO.OFFICE', workspace_id: 'IFTA', client_scope: 'SWITCHABLE', case_type: 'IFTA_QUARTER', subcontext_type: 'QUARTER' });
    expect(node('AIO.IFTA.CLIENT.ROOM').context).toMatchObject({ environment_id: 'AIO.CLIENT_OFFICE', client_scope: 'FIXED', case_type: 'IFTA_QUARTER' });
    expect(node('AIO.IFTA.PUBLIC.SERVICE').context!.client_scope).toBe('NONE');
  });
});

describe('IFTA tree rebased under AIO OFFICE / CLIENT OFFICE', () => {
  it('founder tree: AIO OFFICE → WORKSPACE IFTA → FUEL TAX QUEUE → CLIENT CONTEXT → CLIENT-QUARTER CASE', () => {
    const chain = (id: string): string[] => { const n = node(id); return n.parent_node ? [...chain(n.parent_node), id] : [id]; };
    expect(chain('AIO.IFTA.STAFF.CASE')).toEqual(['AIO', 'AIO.OFFICE', 'AIO.OFFICE.WS.IFTA', 'AIO.IFTA.STAFF', 'AIO.IFTA.STAFF.FUEL_TAX_OFFICE', 'AIO.IFTA.STAFF.QUEUE', 'AIO.IFTA.STAFF.CLIENT_CONTEXT', 'AIO.IFTA.STAFF.CASE']);
    expect(chain('AIO.IFTA.CLIENT.ROOM.PROGRESS')).toEqual(['AIO', 'AIO.CLIENT_OFFICE', 'AIO.CLIENT_OFFICE.WS.IFTA', 'AIO.IFTA.CLIENT', 'AIO.IFTA.CLIENT.FILING_ROOM', 'AIO.IFTA.CLIENT.QUARTER_CONTEXT', 'AIO.IFTA.CLIENT.ROOM', 'AIO.IFTA.CLIENT.ROOM.PROGRESS']);
    const caseKids = aioIfta.AIO_IFTA_TREE.filter((n) => n.parent_node === 'AIO.IFTA.STAFF.CASE').map((n) => n.title);
    for (const t of ['OVERVIEW', 'FUEL PURCHASES', 'MILEAGE', 'VEHICLES', 'JURISDICTIONS', 'DOCUMENTS', 'RETURN DRAFT', 'REQUEST CORRECTION', 'FILE & CONFIRM', 'RECORD PAYMENT STATUS', 'AUDIT TRAIL', 'CLIENT THREAD', 'REOPEN QUARTER']) expect(caseKids.some((k) => k.startsWith(t)), t).toBe(true);
    expect(aioIfta.AIO_IFTA_COVERAGE).toMatchObject({ operating_environments: 3, hubs: 2, workspaces: 2, material_nodes: 64 });
  });

  it('client tree keeps the approved family: six tabs and every preserved child / state node', () => {
    for (const id of ['PROGRESS.NEEDS_YOU', 'PROGRESS.CORRECTION_FLOW', 'PROGRESS.SEND_CONFIRM', 'PROGRESS.RETURN_REVIEW', 'FUEL_PURCHASES.UPLOAD', 'FUEL_PURCHASES.CSV_IMPORT', 'FUEL_PURCHASES.IMPORT_VAULT', 'FUEL_PURCHASES.RECEIPT_DETAIL', 'MILEAGE.SOURCE_PICKER', 'VEHICLES.CONFIRM_FLEET', 'JURISDICTIONS.STATE_DETAIL', 'DOCUMENTS.FILE_PREVIEW', 'FILED', 'ARCHIVED', 'NEXT_QUARTER_OPEN', 'RETURNED', 'MESSAGES']) expect(node(`AIO.IFTA.CLIENT.ROOM.${id}`), id).toBeDefined();
    expect(node('AIO.IFTA.CLIENT.NOT_ENROLLED').title).toMatch(/^SET UP IFTA FILING/);
    expect(aioIfta.aioIftaNode('AIO.IFTA.CLIENT.ROOM.NOTES')).toBeUndefined();
  });

  it('the tree is revised, decisions are locked, PAGE_TREE_CONFIRMED is NOT marked', () => {
    const rev = aioIfta.AIO_IFTA_PAGE_TREE_REVISION;
    expect(rev.status_flags).toEqual(['TREE_REVISED', 'FOUNDER_DECISIONS_LOCKED', 'AIO_OFFICE_MODEL_DEFINED', 'CLIENT_OFFICE_MODEL_DEFINED', 'IFTA_TREE_REBASED', 'AWAITING_FINAL_FOUNDER_CONFIRMATION']);
    const t = aioIfta.aioIftaPageTreeConfirmation(aioIfta.AIO_IFTA_OPEN_DECISION_IDS);
    expect(t.status).toBe('PRODUCED');
    expect(t.confirmed_at).toBeNull();
    expect(t.open_decisions).toEqual([]);
    const locked = aioIfta.AIO_IFTA_DECISIONS.filter((d) => d.founder_decision).map((d) => d.decision_id).sort();
    expect(locked).toEqual(['D-BRAND-TOKENS', 'D-CLIENT-DESKTOP-STAFF-MODULES', 'D-IFTA-AVAILABILITY', 'D-INTERACTION-09', 'D-NOTES-TAB', 'D-PUBLIC-COPY-TRUTH', 'D-ROUTES-SHELL', 'D-STAFF-QUEUE-AUTHORITY', 'D-TAX-FIGURES', 'D-TYPOGRAPHY']);
  });

  it('I · staff queue derivation: DERIVED_AUTHORITY from the staff case authority, designed as the cross-client landing — not the case page', () => {
    const q = node('AIO.IFTA.STAFF.QUEUE');
    expect(q.authority_refs.map(authorityStatusOf)).toEqual(['DERIVED_AUTHORITY', 'DERIVED_AUTHORITY', 'DERIVED_AUTHORITY']);
    expect(q.primary_object).toBe('MULTI-CLIENT FILING QUEUE (CLIENT-QUARTERS)');
    const contract = JSON.parse(buildAioIftaAuthorityBundleExports()['AIO_IFTA_QUEUE_DERIVATION_CONTRACT.json']);
    expect(contract.authority_status).toMatchObject({ previous: 'MISSING_AUTHORITY', now: 'DERIVED_AUTHORITY' });
    expect(contract.inherits).toEqual(expect.arrayContaining(['LIGHT BODY', 'DARK OPERATIONAL ACCENTS', 'STATUS CHIPS', 'RISK LANGUAGE', 'DENSE TABLE (row family)']));
    expect(contract.information_model.questions).toHaveLength(9);
    expect(contract.information_model.fields.map((f: { field: string }) => f.field)).toEqual(['CLIENT', 'ACCOUNT', 'QUARTER', 'DUE DATE', 'READINESS', 'CURRENT STATE', 'NEEDS YOU', 'BLOCKER', 'RISK', 'ASSIGNEE', 'LAST CLIENT ACTIVITY', 'NEXT ACTION']);
    expect(brain.AIO_IFTA_QUEUE_QUESTIONS.find((x) => x.question === 'WHAT WAS RETURNED / REJECTED')!.status).toBe('MISSING');
    expect(contract.readiness.IMPLEMENTATION_READY).toBe(true);
  });

  it('J · interaction 09 RUN FAQS is in the registry with its real label; no behaviour is invented; it blocks no node', () => {
    const x = aioIfta.AIO_IFTA_INTERACTIONS.find((i) => i.interaction_id === 'I.RUN_FAQS')!;
    expect(x.label).toBe('Run FAQs');
    expect(x.authority_refs).toEqual(['PAGE_COMPONENT_INTERACTION_CONTRACT #09']);
    for (const f of ['data_effect', 'ui_effect', 'success', 'failure', 'permission'] as const) expect(x[f]).toBe('NEEDS_CLARIFICATION');
    expect(x.write_contract).toBeNull();
    expect(aioIfta.AIO_IFTA_MATERIAL_NODES.some((n) => n.interactions.includes('I.RUN_FAQS'))).toBe(false);
    expect(aioIfta.AIO_IFTA_READINESS.some((r) => r.blockers.join(' ').includes('RUN_FAQS'))).toBe(false);
    expect(aioIfta.AIO_IFTA_CONTRACT_INTERACTION_SEQUENCE.find((s) => s.item === '09')).toMatchObject({ label: 'RUN FAQS', interactions: ['I.RUN_FAQS'] });
  });
});

describe('exports stay generated from the TypeScript source', () => {
  it('the 10 docs/aio/office artifacts match the generator', () => {
    const files = buildAioOfficeExports();
    expect(Object.keys(files).sort()).toEqual(['AIO_OFFICE_ARCHITECTURE.md', 'AIO_OFFICE_CONTEXT_MODEL.json', 'AIO_OFFICE_WORKSPACE_REGISTRY.json', 'CLIENT_OFFICE_ARCHITECTURE.md', 'CLIENT_OFFICE_WORKSPACE_MODEL.json', 'CLIENT_WORKSPACE_SWITCHING.md', 'STAFF_CLIENT_WORKSPACE_SWITCHING.md', 'WORKSPACE_AVAILABILITY_MODEL.json', 'WORKSPACE_EXPANSION_CONTRACT.json', 'WORKSPACE_EXPANSION_RULES.md']);
    for (const [name, body] of Object.entries(files)) expect(readFileSync(path.join(ROOT, `${AIO_OFFICE_DOCS_DIR}/${name}`), 'utf8'), name).toBe(body);
    expect(JSON.parse(files['AIO_OFFICE_CONTEXT_MODEL.json']).constraints).toEqual({ page_implementation: false, new_paid_generations: 0, openart_accessed: false, legacy_visual_authority: 'FORBIDDEN', permissions_broadened: false });
  });
});
