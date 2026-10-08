/**
 * P0.AIO.OFFICE-IA.FOUNDER-HOME-WORK-REPORTS-MORE.AUTHORITY-CONTRACTS1 — the HOME / WORK / REPORTS / MORE authority
 * contracts held to the founder's brief: regions, lanes, domains and entries verbatim; projection / production /
 * oversight / administration kept distinct; every metric classified; the founder role defined but not implemented;
 * known gaps preserved; the validator (including what it rejects); and export sync.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CONTRACT_VIEWPORTS,
  LANE_SHELL_SECTIONS,
  METRIC_SOURCE_CLASSES,
  aio as brain,
  iaChildren,
  iaNode,
  laneShellRef,
  validateOfficeRootContracts,
  type OfficeInformationArchitecture,
  type OfficeRootContracts,
} from '../shared/studioos-experience-brain/index';
import { AIO_OFFICE_CONTRACTS_DOCS_DIR, aioOfficeContractsQualityGate, buildAioOfficeContractsExports } from '../scripts/studioos/aio-office-contracts-export';

const ROOT = path.resolve(__dirname, '..');
const C = brain.AIO_OFFICE_CONTRACTS;
const IA = brain.AIO_OFFICE_IA;
const [HOME, WORK, REPORTS, MORE] = C.roots;
const H = 'AIO_OFFICE.HOME';
const W = 'AIO_OFFICE.WORK';
const R = 'AIO_OFFICE.REPORTS';
const M = 'AIO_OFFICE.MORE';
const under = (id: string, root: string) => id === root || id.startsWith(`${root}.`);
const region = (id: string) => C.roots.flatMap((r) => r.regions).find((x) => x.region_id === id)!;
const lane = (id: string) => C.lanes.find((l) => l.lane_id === `${W}.${id}`)!;
const own = (d: string) => C.ownership.find((o) => o.domain_id === d)!;
const shownAsData = (s: string) => s === 'AVAILABLE' || s === 'PARTIAL';
const clone = (): OfficeRootContracts => structuredClone(C);
const cloneIa = (): OfficeInformationArchitecture => structuredClone(IA);

describe('Root stances stay distinct', () => {
  it('HOME projects, WORK produces, REPORTS oversees, MORE administers', () => {
    expect(C.roots.map((r) => [r.root_id, r.stance])).toEqual([[H, 'PROJECTION'], [W, 'PRODUCTION'], [R, 'OVERSIGHT'], [M, 'ADMINISTRATION']]);
    expect(validateOfficeRootContracts(C, IA)).toEqual([]);
  });

  it('only the owning root changes state: HOME routes, REPORTS reviews, WORK executes, MORE administers', () => {
    expect(new Set(HOME.actions.map((a) => a.kind))).toEqual(new Set(['ROUTE']));
    expect(REPORTS.actions.every((a) => a.kind === 'REVIEW' || a.kind === 'ROUTE')).toBe(true);
    for (const r of C.roots) for (const a of r.actions.filter((x) => x.kind === 'EXECUTE' || x.kind === 'ADMINISTER')) expect(under(a.owner_node, r.root_id), a.action_id).toBe(true);
    expect(WORK.actions.some((a) => a.kind === 'EXECUTE')).toBe(true);
    expect(MORE.actions.some((a) => a.kind === 'ADMINISTER')).toBe(true);
  });
});

describe('HOME — projection-only command center', () => {
  it('has the founder’s regions in order; only Business Pulse is optional', () => {
    expect(HOME.regions.map((r) => r.label)).toEqual(['Needs Attention', 'Deadlines', 'Blockers', 'Work Across AIO', 'Clients in Motion', 'Recent Activity', 'Quick Actions', 'Business Pulse']);
    expect(HOME.regions.map((r) => r.region_id)).toEqual(iaChildren(IA, H).map((n) => n.node_id));
    expect(HOME.regions.filter((r) => r.presence === 'OPTIONAL').map((r) => r.label)).toEqual(['Business Pulse']);
    expect(HOME.answers).toEqual(['What needs attention now?', 'What is due?', 'What is blocked?', 'What is moving?', 'Which clients need us?', 'What changed recently?', 'Where should staff go next?']);
  });

  it('owns and mutates nothing; every source resolves to an owner outside HOME', () => {
    expect(HOME.owns).toEqual([]);
    expect(HOME.may_mutate).toEqual([]);
    for (const r of HOME.regions) for (const s of r.sources) {
      expect(iaNode(IA, s.owner_node), s.source_id).toBeDefined();
      expect(under(s.owner_node, H), s.source_id).toBe(false);
    }
  });

  it('NEEDS ATTENTION covers every domain the founder listed, each item routing to its owner', () => {
    const na = region(`${H}.NEEDS_ATTENTION`);
    const domains = new Set(na.sources.map((s) => s.domain));
    for (const d of ['MIGRATION', 'IFTA', 'COMPLIANCE', 'DISPATCH', 'BROKERAGE', 'BOOKKEEPING', 'INSURANCE', 'MAINTENANCE', 'ROAD_READY', 'CRM', 'BILLING', 'DOCUMENTS']) expect(domains.has(d), d).toBe(true);
    for (const id of ['client-approvals-quotes', 'client-approvals-activation', 'ifta-review-approval', 'documents-incomplete', 'migration-blocked', 'compliance-exceptions', 'dispatch-exceptions', 'brokerage-exceptions', 'overdue-reconciliation', 'expiring-insurance', 'expiring-registration-credentials', 'maintenance-warnings', 'road-ready-blockers', 'crm-follow-ups', 'billing-overdue-failed']) expect(na.sources.some((s) => s.source_id === id), id).toBe(true);
  });

  it('DEADLINES: every source states its priority, due state, route target and actor visibility', () => {
    const d = region(`${H}.DEADLINES`);
    expect(d.sources).toHaveLength(10);
    for (const s of d.sources) {
      expect(s.priority_rule, s.source_id).toBeTruthy();
      expect(s.due_rule, s.source_id).toBeTruthy();
      expect(s.visibility.CLIENT, s.source_id).toBe('NONE');
    }
    expect(d.rules.join(' ')).toMatch(/never the stored severity/);
  });

  it('BLOCKERS map the founder’s groups onto existing literals — no new enum', () => {
    expect(brain.AIO_HOME_BLOCKER_GROUPS.map((g) => g.term)).toEqual(['WAITING_ON_CLIENT', 'WAITING_ON_STAFF', 'WAITING_ON_PROVIDER', 'MISSING_DOCUMENT', 'FAILED_VALIDATION', 'APPROVAL_REQUIRED', 'PAYMENT_REQUIRED', 'EXTERNAL_DEPENDENCY', 'SYSTEM_ERROR']);
    for (const g of brain.AIO_HOME_BLOCKER_GROUPS) expect(g.existing.length, g.term).toBeGreaterThan(0);
    expect(region(`${H}.BLOCKERS`).rules.join(' ')).toMatch(/never a new stored enum/);
  });

  it('WORK ACROSS AIO has one line per lane, all twelve, in order', () => {
    expect(region(`${H}.WORK_ACROSS_AIO`).sources.map((s) => s.owner_node)).toEqual(C.lanes.map((l) => l.lane_id));
  });

  it('RECENT ACTIVITY maps the founder’s verbs onto the existing event vocabulary', () => {
    expect(brain.AIO_HOME_EVENT_VERBS.map((v) => v.term)).toEqual(['CREATED', 'UPDATED', 'APPROVED', 'REVISED', 'SUBMITTED', 'FILED', 'ACTIVATED', 'PAUSED', 'COMPLETED', 'DOCUMENT_RECEIVED', 'PAYMENT_RECEIVED', 'ASSIGNED', 'BLOCKED', 'RESOLVED']);
    expect(brain.AIO_HOME_EVENT_VERBS.find((v) => v.term === 'PAUSED')).toMatchObject({ existing: [], status: 'NOT_IN_SOURCE' });
  });

  it('QUICK ACTIONS: the founder’s list, route-only; unsupported ones say so and route nowhere', () => {
    const ids = HOME.actions.map((a) => a.action_id);
    for (const a of ['CREATE_CLIENT', 'START_MIGRATION', 'OPEN_WORK', 'CREATE_CASE', 'UPLOAD_DOCUMENT', 'VIEW_DEADLINES', 'OPEN_CRM', 'CREATE_INVOICE', 'ASSIGN_WORK']) expect(ids, a).toContain(`HOME.${a}`);
    for (const a of HOME.actions.filter((x) => x.state === 'NOT_IMPLEMENTED')) expect(a.route, a.action_id).toBeNull();
    expect(HOME.actions.filter((a) => a.state === 'NOT_IMPLEMENTED').map((a) => a.action_id)).toEqual(['HOME.CREATE_CASE', 'HOME.UPLOAD_DOCUMENT']);
  });

  it('BUSINESS PULSE renders only production-backed metrics — none exist, so it is absent in production', () => {
    expect(region(`${H}.BUSINESS_PULSE`).presence).toBe('OPTIONAL');
    expect(C.metrics.filter((m) => m.backing === 'PRODUCTION')).toEqual([]);
    expect(region(`${H}.BUSINESS_PULSE`).rules[0]).toMatch(/absent/);
  });

  it('CRM and billing are projected, never owned', () => {
    const na = region(`${H}.NEEDS_ATTENTION`).sources;
    for (const s of na.filter((x) => x.domain === 'CRM')) expect(s.owner_node).toBe(`${M}.GROWTH_CRM`);
    for (const s of na.filter((x) => x.domain === 'BILLING')) expect(s.owner_node).toBe(`${M}.BILLING`);
    for (const s of na.filter((x) => x.domain === 'CRM' || x.domain === 'BILLING')) expect(s.visibility.STAFF, s.source_id).toBe('BY_GRANT');
  });
});

describe('WORK — production', () => {
  it('has the fifteen root capabilities with today’s truth', () => {
    expect(brain.AIO_WORK_ROOT_CAPABILITIES.map((c) => c.capability)).toEqual(['Service lane navigation', 'Cross-client search', 'Filtering', 'Sorting', 'Staff assignment (where supported)', 'Client drilldown', 'Work item / case drilldown', 'Due dates', 'Blockers', 'Statuses', 'Priority', 'Activity', 'Documents', 'Next action', 'Related work']);
  });

  it('represents all twelve lanes in the IA order, each with the full common shell', () => {
    const iaLanes = iaChildren(IA, W).filter((n) => n.kind === 'SERVICE_LANE');
    expect(C.lanes.map((l) => l.lane_id)).toEqual(iaLanes.map((n) => n.node_id));
    expect(iaLanes.map((n) => n.label)).toEqual(['Permitting & Authorities', 'Filing & Fuel Taxes', 'Compliance', 'Vehicles & Fleet', 'Dispatch', 'Brokerage', 'Insurance', 'Factoring', 'Bookkeeping', 'Drivers & Carriers', 'Mechanic / Maintenance', 'Road Ready']);
    expect(C.lanes.map((l) => l.lane_id.split('.').pop())).toEqual([...brain.AIO_WORK_LANE_ORDER]);
    for (const l of C.lanes) expect(Object.keys(l.shell), l.lane_id).toEqual([...LANE_SHELL_SECTIONS]);
  });

  it('preserves IFTA (canonical quarter states) and keeps one compliance lane', () => {
    for (const st of ['QUARTER_OPEN', 'AWAITING_APPROVAL', 'FILING', 'FILED', 'ARCHIVED', 'FILING_REJECTED']) expect(lane('FILING_FUEL_TAXES').statuses).toContain(st);
    expect(C.lanes.filter((l) => /COMPLIANCE/.test(l.lane_id))).toHaveLength(1);
  });

  it('VEHICLES & FLEET: owns roster, profile and registration state; cross-links the nine domains; no staff screen yet', () => {
    const vf = lane('VEHICLES_FLEET');
    const owns = brain.AIO_VEHICLES_FLEET_SCOPE.filter((x) => x.relation === 'OWNS').map((x) => x.item);
    for (const x of ['Vehicle roster', 'Vehicle profiles', 'Registration state']) expect(owns).toContain(x);
    for (const t of [`${W}.DISPATCH`, `${W}.COMPLIANCE`, `${W}.FILING_FUEL_TAXES`, `${W}.INSURANCE`, `${W}.MECHANIC_MAINTENANCE`, `${W}.DRIVERS_CARRIERS`, `${M}.DOCUMENTS_VAULT`, `${M}.BILLING`, R]) expect(vf.related.some((r) => under(r.node_id, t)), t).toBe(true);
    expect(Object.values(vf.shell).every((s) => s.state === 'NOT_IMPLEMENTED')).toBe(true);
    expect(vf.gaps).toContain('G-VEHICLES-NO-STAFF-SCREEN');
    expect(own('VEHICLES').canonical_owner).toBe(vf.lane_id);
  });

  it('ROAD READY: no engagement state invented — recorded as missing, completion BLOCKED', () => {
    const rr = lane('ROAD_READY');
    expect(rr.statuses).toContain('engagement state (AVAILABLE · ACTIVE · COMPLETED): none');
    expect(rr.shell.RECENTLY_COMPLETED.state).toBe('BLOCKED');
    expect(rr.gaps).toContain('G-ROAD-READY-NO-ENGAGEMENT-STATE');
  });

  it('cross-service relationships link to the hub record, never copy it', () => {
    expect(brain.AIO_WORK_RELATIONSHIPS.map((r) => r.label)).toEqual(['VEHICLE', 'CLIENT', 'DRIVER']);
    for (const r of brain.AIO_WORK_RELATIONSHIPS) {
      expect(iaNode(IA, r.hub), r.hub).toBeDefined();
      for (const s of r.spokes) expect(iaNode(IA, s), s).toBeDefined();
      const hubLane = C.lanes.find((l) => l.lane_id === r.hub);
      if (hubLane) for (const s of r.spokes) expect(hubLane.related.some((x) => under(x.node_id, s) || under(s, x.node_id)) || under(s, r.hub), `${r.label} → ${s}`).toBe(true);
    }
    for (const l of C.lanes) for (const x of l.related) expect(x.node_id, l.lane_id).not.toBe(l.lane_id);
  });

  it('internal load financials stay founder-class (staff by grant), never client-facing', () => {
    expect(C.permissions.find((p) => p.scope === `${W}.BROKERAGE.LOAD_FINANCIALS`)!.access).toEqual({ FOUNDER: 'FULL', STAFF: 'BY_GRANT', CLIENT: 'NONE', SERVICE_PROVIDER: 'NONE' });
  });
});

describe('REPORTS — oversight, no fake data', () => {
  it('has the ten domains and mutates nothing', () => {
    expect(REPORTS.regions.map((r) => r.region_id)).toEqual(iaChildren(IA, R).map((n) => n.node_id));
    expect(REPORTS.regions.map((r) => r.label)).toEqual(['Overview', 'Clients', 'Services', 'Financial / Revenue', 'Filing History', 'Compliance', 'Dispatch / Brokerage', 'Bookkeeping', 'Migration', 'Exports']);
    expect(REPORTS.may_mutate).toEqual([]);
  });

  it('classifies every metric; nothing unsupported is shown as data; profitability is never shown', () => {
    for (const m of C.metrics) {
      expect(METRIC_SOURCE_CLASSES, m.metric_id).toContain(m.classification);
      if (m.classification === 'NOT_IMPLEMENTED' || m.classification === 'DERIVED_UNSUPPORTED') expect(shownAsData(m.state), m.metric_id).toBe(false);
      if (m.classification === 'DERIVED_SUPPORTED') expect(m.derivation, m.metric_id).toBeTruthy();
      expect(m.visibility.CLIENT, m.metric_id).toBe('NONE');
      expect(m.backing === 'PRODUCTION', m.metric_id).toBe(false);
    }
    expect(C.metrics.filter((m) => m.classification === 'REAL_DATA')).toEqual([]);
    expect(C.metrics.find((m) => m.metric_id === 'financial.profitability')).toMatchObject({ classification: 'DERIVED_UNSUPPORTED', state: 'NOT_IMPLEMENTED' });
  });

  it('keeps FILING HISTORY, BOOKKEEPING and EXPORTS as NOT STARTED — contract only', () => {
    for (const id of ['FILING_HISTORY', 'BOOKKEEPING', 'EXPORTS']) {
      expect(region(`${R}.${id}`).state, id).toBe('NOT_IMPLEMENTED');
      expect(region(`${R}.${id}`).sources, id).toEqual([]);
    }
    expect(brain.AIO_EXPORT_RULES.length).toBeGreaterThan(0);
    expect(C.metrics.filter((m) => m.domain_node === `${R}.BOOKKEEPING`).every((m) => m.state === 'NOT_IMPLEMENTED')).toBe(true);
  });

  it('records the derivation defects instead of hiding them', () => {
    expect(C.gaps.find((g) => g.gap_id === 'G-REPORTS-DERIVATION-DEFECTS')!.gap).toMatch(/payment-date basis/);
    expect(C.metrics.find((m) => m.metric_id === 'financial.invoiced')!.classification).toBe('PARTIAL_DATA');
  });
});

describe('MORE — administration, not a junk drawer', () => {
  it('has the eleven entries, each with one purpose; ACCOUNT is NOT STARTED', () => {
    expect(C.more_entries.map((e) => e.entry_id)).toEqual(iaChildren(IA, M).map((n) => n.node_id));
    expect(iaChildren(IA, M).map((n) => n.label)).toEqual(['Clients', 'Documents & Vault', 'Growth / CRM', 'Billing', 'Team & Staff', 'Service Catalog', 'Mechanic Network', 'Messages', 'System Settings', 'Help & Support', 'Account']);
    for (const e of C.more_entries) expect(e.is_for.length, e.entry_id).toBeGreaterThan(10);
    expect(C.more_entries.find((e) => e.entry_id === `${M}.ACCOUNT`)!.state).toBe('NOT_IMPLEMENTED');
  });

  it('draws the founder’s distinctions', () => {
    const e = (id: string) => C.more_entries.find((x) => x.entry_id === `${M}.${id}`)!;
    expect(e('DOCUMENTS_VAULT').distinguishes).toHaveLength(4);
    expect(e('MESSAGES').distinguishes).toHaveLength(3);
    expect(e('MECHANIC_NETWORK').not_for.join(' ')).toMatch(/MECHANIC \/ MAINTENANCE/);
    expect(e('MESSAGES').not_for.join(' ')).toMatch(/INBOX/);
  });
});

describe('Ownership, permissions, client-safe projections', () => {
  it('names one canonical owner for every required domain — never HOME or REPORTS', () => {
    for (const d of brain.AIO_REQUIRED_OWNERSHIP_DOMAINS) expect(C.ownership.some((o) => o.domain_id === d), d).toBe(true);
    expect(C.ownership.length).toBeGreaterThanOrEqual(20);
    for (const o of C.ownership) expect(under(o.canonical_owner, H) || under(o.canonical_owner, R), o.domain_id).toBe(false);
  });

  it('locks CRM and BILLING in MORE', () => {
    expect(own('CRM')).toMatchObject({ canonical_owner: `${M}.GROWTH_CRM`, client_safe_projection: null, staff_access: 'BY_GRANT' });
    expect(own('BILLING')).toMatchObject({ canonical_owner: `${M}.BILLING`, reports_aggregation: `${R}.FINANCIAL_REVENUE`, client_safe_projection: 'CLIENT_OFFICE.FINANCES.FEES_PAYMENTS' });
  });

  it('keeps clients and providers out of AIO OFFICE', () => {
    for (const p of C.permissions.filter((x) => under(x.scope, 'AIO_OFFICE'))) {
      expect(p.access.CLIENT, p.scope).toBe('NONE');
      expect(p.access.SERVICE_PROVIDER, p.scope).toBe('NONE');
      expect(p.access.FOUNDER, p.scope).toBe('FULL');
    }
  });

  it('every domain with a client side has a client-safe projection, staff → client', () => {
    const clientNodes = new Set(C.client_safe.map((x) => x.client_node));
    for (const o of C.ownership.filter((x) => x.client_safe_projection)) expect(clientNodes.has(o.client_safe_projection!), o.domain_id).toBe(true);
    for (const x of C.client_safe) {
      expect(iaNode(IA, x.staff_node)?.shell_id, x.staff_node).toBe('AIO_OFFICE');
      expect(iaNode(IA, x.client_node)?.shell_id, x.client_node).toBe('CLIENT_OFFICE');
    }
  });

  it('records the verified privacy gaps — not fixed here', () => {
    const p = C.gaps.filter((g) => g.kind === 'PRIVACY');
    expect(p).toHaveLength(12);
    for (const g of p) expect(g.evidence.length, g.gap_id).toBeGreaterThan(0);
    expect(p.map((g) => g.gap_id)).toContain('P-CLIENT-LIFECYCLE-SELF-UPDATE');
  });
});

describe('FOUNDER role — defined, not implemented', () => {
  const F = brain.AIO_FOUNDER_ROLE;
  it('is a role for one or more people, never an identity; staff never inherit it; no self-elevation', () => {
    expect(F).toMatchObject({ role: 'FOUNDER', multiplicity: 'ONE_OR_MORE' });
    expect(JSON.stringify(C)).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
    for (const a of IA.actors.filter((x) => x.actor !== 'FOUNDER')) expect(a.inherits, a.actor).not.toContain('FOUNDER');
    expect(IA.actors.every((a) => a.can_self_elevate === false)).toBe(true);
    expect(F.never.join(' ')).toMatch(/self-elevation/);
  });

  it('records that the role and its gates do not exist in code yet', () => {
    for (const g of ['G-FOUNDER-ROLE-NOT-IMPLEMENTED', 'G-FOUNDER-ACTS-STAFF-GATED']) expect(F.gaps).toContain(g);
    expect(F.code_today).toMatch(/No FOUNDER role in code/);
    expect(F.acts.find((a) => a.act === 'High-risk overrides')).toMatchObject({ node_ids: [], state: 'NOT_IMPLEMENTED' });
  });
});

describe('Responsive priorities follow the brief', () => {
  const order = (root: string) => C.responsive.find((r) => r.root_id === root)!.order;
  it('mobile keeps what the founder named, in order', () => {
    expect(order(H).MOBILE).toEqual([`${H}.NEEDS_ATTENTION`, `${H}.DEADLINES`, `${H}.WORK_ACROSS_AIO`, `${H}.CLIENTS_IN_MOTION`, `${H}.RECENT_ACTIVITY`]);
    expect(order(W).MOBILE).toEqual(['WORK.LANE_SWITCHER', laneShellRef('NEEDS_ATTENTION'), laneShellRef('ACTIVE_WORK'), 'WORK.CASE_DETAIL']);
    expect(order(R).MOBILE.slice(0, 2)).toEqual([`${R}.OVERVIEW`, 'REPORTS.SET_PERIOD']);
    expect(order(R).MOBILE.at(-1)).toBe('REPORTS.DRILL_DOWN');
    expect(order(M).MOBILE).toEqual(['MORE.DIRECTORY', 'MORE.SEARCH', 'MORE.OPEN_ENTRY']);
  });
  it('every root has all three viewports, desktop at least as rich as mobile', () => {
    for (const r of C.roots) for (const vp of CONTRACT_VIEWPORTS) expect(order(r.root_id)[vp].length, `${r.root_id} ${vp}`).toBeGreaterThan(0);
    for (const r of C.roots) for (const id of order(r.root_id).MOBILE) expect(order(r.root_id).DESKTOP, `${r.root_id} ${id}`).toContain(id);
  });
});

describe('Known gaps and NOT STARTED sections are preserved', () => {
  it('keeps the founder’s three known gaps', () => {
    for (const g of brain.AIO_KNOWN_GAPS) expect(C.gaps.some((x) => x.gap_id === g), g).toBe(true);
  });
  it('never claims data for a surface the IA records as NOT STARTED', () => {
    const notStarted = new Set(IA.nodes.filter((n) => n.implementation === 'IMPLEMENTATION_NOT_STARTED').map((n) => n.node_id));
    for (const r of C.roots) for (const reg of r.regions) if (notStarted.has(reg.region_id)) expect(shownAsData(reg.state), reg.region_id).toBe(false);
    for (const e of C.more_entries) if (notStarted.has(e.entry_id)) expect(shownAsData(e.state), e.entry_id).toBe(false);
    for (const l of C.lanes) if (notStarted.has(l.lane_id)) expect(Object.values(l.shell).some((s) => shownAsData(s.state)), l.lane_id).toBe(false);
  });
  it('every data-source row with no backing is not shown as data; every gap and shown source carries evidence', () => {
    for (const d of C.data_sources) if (d.backing === 'NONE') expect(shownAsData(d.state), d.subject_id).toBe(false);
    for (const g of C.gaps) expect(g.evidence.length, g.gap_id).toBeGreaterThan(0);
    const cite = /^(all-in-one-enterprises\/|api\/)[\w/.-]+\.(tsx?|sql|json)(:\d+(-\d+)?)?( .+)?$/;
    const all = [...C.roots.flatMap((r) => [...r.regions.flatMap((x) => x.sources.flatMap((s) => s.evidence)), ...r.actions.flatMap((a) => a.evidence)]), ...C.lanes.flatMap((l) => l.records.map((x) => x.evidence)), ...C.metrics.flatMap((m) => m.evidence), ...C.gaps.flatMap((g) => g.evidence), ...C.client_safe.flatMap((x) => x.evidence), ...C.more_entries.flatMap((e) => e.evidence)];
    for (const e of all) expect(e, e).toMatch(cite);
  });
});

describe('Validator rejects what the contracts forbid', () => {
  const v = (c: OfficeRootContracts, ia: OfficeInformationArchitecture = IA) => validateOfficeRootContracts(c, ia).join('\n');
  it('HOME executing, owning, or holding a CLIENT-visible source', () => {
    const a = clone(); a.roots[0].actions[0].kind = 'EXECUTE';
    expect(v(a)).toMatch(/a projection root only routes/);
    const b = clone(); b.roots[0].owns = ['tasks'];
    expect(v(b)).toMatch(/projection root owns or mutates/);
    const c = clone(); c.roots[0].regions[0].sources[0].visibility.CLIENT = 'CLIENT_SAFE_PROJECTION';
    expect(v(c)).toMatch(/visible to CLIENT inside the internal office/);
  });
  it('a root changing state another root owns', () => {
    const c = clone(); c.roots[1].actions.push({ ...c.roots[3].actions[1] });
    expect(v(c)).toMatch(/changes state owned by AIO_OFFICE\.MORE\.TEAM_STAFF/);
  });
  it('fake metrics', () => {
    const a = clone(); a.metrics.find((m) => m.metric_id === 'financial.profitability')!.state = 'PARTIAL';
    expect(v(a)).toMatch(/DERIVED_UNSUPPORTED shown as data/);
    const b = clone(); b.metrics[0].classification = 'REAL_DATA';
    expect(v(b)).toMatch(/REAL_DATA must be production-backed/);
    const c = clone(); c.metrics[0].visibility.CLIENT = 'CLIENT_SAFE_PROJECTION';
    expect(v(c)).toMatch(/internal metric visible to CLIENT/);
  });
  it('a missing lane or shell section', () => {
    const a = clone(); a.lanes = a.lanes.filter((l) => !l.lane_id.endsWith('VEHICLES_FLEET'));
    expect(v(a)).toMatch(/VEHICLES_FLEET: no lane contract/);
    const b = clone(); delete (b.lanes[0].shell as Partial<typeof b.lanes[0]['shell']>).BLOCKED;
    expect(v(b)).toMatch(/shell section BLOCKED missing/);
  });
  it('REPORTS as a canonical owner, clients inside AIO OFFICE, internal client-safe targets', () => {
    const a = clone(); a.ownership[0].canonical_owner = R;
    expect(v(a)).toMatch(/is a projection \/ oversight root/);
    const b = clone(); b.permissions.find((p) => p.scope === W)!.access.CLIENT = 'FULL';
    expect(v(b)).toMatch(/CLIENT has FULL/);
    const c = clone(); c.client_safe[0].client_node = `${W}.COMPLIANCE`;
    expect(v(c)).toMatch(/not in the client office/);
  });
  it('a hard-coded or inherited founder', () => {
    const a = clone(); a.privileged_roles[0].identity_rule = 'founder@example.com';
    expect(v(a)).toMatch(/identity rule names an identity/);
    const ia = cloneIa(); ia.actors.find((x) => x.actor === 'STAFF')!.inherits.push('FOUNDER');
    expect(v(C, ia)).toMatch(/inherited by STAFF/);
  });
  it('unknown responsive ids and unevidenced gaps', () => {
    const a = clone(); a.responsive[0].order.MOBILE.push('AIO_OFFICE.HOME.NOPE');
    expect(v(a)).toMatch(/names unknown AIO_OFFICE\.HOME\.NOPE/);
    const b = clone(); b.gaps[0].evidence = [];
    expect(v(b)).toMatch(/no evidence/);
  });
});

describe('Quality gate and export sync', () => {
  it('passes the sprint gate', () => {
    const g = aioOfficeContractsQualityGate();
    expect(g.violations).toEqual([]);
    expect(Object.fromEntries(g.checks.map((c) => [c.key, c.value]))).toEqual({
      HOME_PURPOSE_LOCKED: 'YES',
      HOME_PROJECTION_ONLY: 'YES',
      WORK_PURPOSE_LOCKED: 'YES',
      WORK_12_LANES_REPRESENTED: 'YES',
      VEHICLES_FLEET_CONTRACT_DEFINED: 'YES',
      REPORTS_PURPOSE_LOCKED: 'YES',
      REPORTS_FAKE_DATA_PROHIBITED: 'YES',
      MORE_PURPOSE_LOCKED: 'YES',
      CRM_LOCATION_LOCKED: 'YES',
      BILLING_LOCATION_LOCKED: 'YES',
      FOUNDER_ROLE_ARCHITECTURE_DEFINED: 'YES',
      FOUNDER_ROLE_IMPLEMENTATION_CHANGED: 'NO',
      ROAD_READY_STATE_INVENTED: 'NO',
      CLIENT_SAFE_PROJECTIONS_DEFINED: 'YES',
      ROOT_OWNERSHIP_MATRIX: 'COMPLETE',
      DATA_SOURCE_MATRIX: 'COMPLETE',
      RESPONSIVE_PRIORITY_MATRIX: 'COMPLETE',
      PRIVACY_GAPS_RECORDED: '12',
      VISUAL_REDESIGN_PERFORMED: 'NO',
      LIVE_IMPLEMENTATION_CHANGED: 'NO',
      READY_FOR_FOUNDER_CONTRACT_REVIEW: 'YES',
    });
    expect(g.report).toEqual({
      WORK_SERVICE_LANES: 12,
      MORE_ENTRIES: 11,
      HOME_REGIONS: '8 (7 required + 1 optional)',
      REPORT_DOMAINS: 10,
      FOUNDER_ROLE_IMPLEMENTED: 'NO',
      ROAD_READY_ENGAGEMENT_STATE_EXISTS: 'NO',
      VEHICLES_FLEET_STAFF_SCREEN_EXISTS: 'NO',
      FAKE_METRICS_INTRODUCED: 'NO',
    });
  });

  it('docs/aio/office-contracts is in sync with the source', () => {
    const files = buildAioOfficeContractsExports();
    expect(Object.keys(files).filter((f) => /^\d\d_/.test(f))).toEqual(['01_HOME_AUTHORITY_CONTRACT.md', '02_WORK_AUTHORITY_CONTRACT.md', '03_REPORTS_AUTHORITY_CONTRACT.md', '04_MORE_AUTHORITY_CONTRACT.md', '05_ROOT_OWNERSHIP_MATRIX.md', '06_DATA_SOURCE_MATRIX.md', '07_PERMISSION_MATRIX.md', '08_CLIENT_SAFE_PROJECTION_MATRIX.md', '09_RESPONSIVE_PRIORITY_MATRIX.md', '10_IMPLEMENTATION_GAPS.md']);
    expect(Object.keys(files)).toHaveLength(19);
    for (const [name, body] of Object.entries(files)) expect(readFileSync(path.join(ROOT, `${AIO_OFFICE_CONTRACTS_DOCS_DIR}/${name}`), 'utf8'), name).toBe(body);
  });
});
