/**
 * P0.AIO.OFFICE-IA.FOUNDER-WORK-TREE-AND-CLIENT-OFFICE-CANONICALIZATION1 — the founder WORK tree and the CLIENT OFFICE
 * tree as source truth: the founder's trees verbatim, the quality gate, the staff / client firewall, the validator
 * (including what it rejects), references into the Brain and the IFTA authority tree, and export sync.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CLIENT_LIFECYCLE_STATES,
  EXPANSION_SUPPRESSION_REASONS,
  aio as brain,
  iaChildren,
  iaDescendants,
  iaNode,
  iaPath,
  iaRootNav,
  iaVisibleTo,
  validateOfficeInformationArchitecture,
  type IaNode,
  type OfficeInformationArchitecture,
} from '../shared/studioos-experience-brain/index';
import { aioIfta } from '../shared/studioos-visual-authority/index';
import { AIO_OFFICE_IA_DOCS_DIR, aioOfficeIaQualityGate, buildAioOfficeIaExports, serviceCrosswalk } from '../scripts/studioos/aio-office-ia-export';

const ROOT = path.resolve(__dirname, '..');
const IA = brain.AIO_OFFICE_IA;
const G = brain.AIO_OFFICE_IA_QUALITY_GATE;
const labels = (id: string) => iaChildren(IA, id).map((n) => n.label);
const clone = (): OfficeInformationArchitecture => structuredClone(IA);

/** The founder's trees, verbatim from the sprint (the test is the spec; the data must match it). */
const FOUNDER_TREE: Record<string, string[] | Record<string, string[]>> = {
  HOME: ['Needs Attention', 'Deadlines', 'Blockers', 'Work Across AIO', 'Clients in Motion', 'Recent Activity', 'Quick Actions'],
  INTAKE: ['Existing Client File', 'New Client File', 'Bulk Batch Migration', 'Migration Status', 'Extraction / Classification', 'Match / Reconcile', 'Founder Review', 'Prebuilt Client', 'Activation Invite', 'Migration History'],
  WORK: {
    'Permitting & Authorities': ['Tags / Registration', 'Fuel / Road Tax Permits', 'Operating Authorities', 'BOC-3', 'LLC / Inc', 'Other Permits'],
    'Filing & Fuel Taxes': ['IFTA', 'Filing Queue', 'Client Approval', 'Submitted / Filed', 'Filing History'],
    Compliance: ['DOT / Safety', 'Expirations', 'Audit / Corrective Work', 'Compliance Cases'],
    'Vehicles & Fleet': [], // founder decision 2026-10-08 (D-VEHICLES-FLEET-LANE)
    Dispatch: ['Active Clients', 'Trucks', 'Loads', 'Status / Exceptions', 'My Loads / My Trucks'],
    Brokerage: ['Quotes', 'Shipments', 'Carrier Offers', 'Stops / Status', 'Load Financials'],
    Insurance: ['Intake', 'Quotes', 'Policies', 'Renewals'],
    Factoring: [],
    Bookkeeping: ['Monthly Clients', 'Annual Clients', 'Reconciliation', 'Deliverables'],
    'Drivers & Carriers': ['Matching', 'Credentials', 'Approvals'],
    'Mechanic / Maintenance': ['Tickets', 'Referrals', 'Providers', 'Maintenance Status'],
    'Road Ready': [],
  },
  REPORTS: ['Overview', 'Clients', 'Services', 'Financial / Revenue', 'Filing History', 'Compliance', 'Dispatch / Brokerage', 'Bookkeeping', 'Migration', 'Exports'],
  MORE: ['Clients', 'Documents & Vault', 'Growth / CRM', 'Billing', 'Team & Staff', 'Service Catalog', 'Mechanic Network', 'Messages', 'System Settings', 'Help & Support', 'Account'],
};
const CLIENT_TREE: Record<string, string[]> = {
  'MY BUSINESS': ['Company Profile', 'Owners / Contacts', 'Drivers', 'Vehicles', 'Authorities / Registrations', 'Business Details'],
  OPERATIONS: ['Compliance', 'Permitting / Authorities', 'Filing / IFTA', 'Dispatch', 'Brokerage', 'Driver Management', 'Vehicle Management', 'Maintenance', 'Road Ready'],
  FINANCES: ['Bookkeeping', 'Factoring', 'Insurance', 'Filing / Tax Summaries', 'Fees / Payments', 'Financial Documents'],
  VAULT: ['Current Documents', 'Historical Documents', 'Uploads', 'Generated Documents', 'Filing / Compliance Records'],
  INBOX: ['Messages from AIO', 'Requests', 'Approvals Needed', 'Notifications', 'Activity Updates'],
  SERVICES: ['Active Services', 'Available Services', 'Recommended / Contextual Services', 'Request a Service', 'Road Ready'],
  ACCOUNT: ['Profile', 'Users / Access', 'Notifications', 'Security', 'Preferences', 'Help', 'Sign Out'],
};

describe('A. Root navigation — the founder decision', () => {
  it('AIO OFFICE is HOME · INTAKE · WORK · REPORTS · MORE and CLIENT OFFICE is the seven client roots', () => {
    expect(iaRootNav(IA, 'AIO_OFFICE')).toEqual(['HOME', 'INTAKE', 'WORK', 'REPORTS', 'MORE']);
    expect(iaRootNav(IA, 'CLIENT_OFFICE')).toEqual(['MY BUSINESS', 'OPERATIONS', 'FINANCES', 'VAULT', 'INBOX', 'SERVICES', 'ACCOUNT']);
    expect([...G.FOUNDER_ROOT_NAV]).toEqual(iaRootNav(IA, 'AIO_OFFICE'));
    expect([...G.CLIENT_ROOT_NAV]).toEqual(iaRootNav(IA, 'CLIENT_OFFICE'));
  });
  it('FILING is not a root item; the office names are unchanged', () => {
    expect(iaRootNav(IA, 'AIO_OFFICE')).not.toContain('FILING');
    expect(IA.shells.map((s) => s.name)).toEqual(['AIO OFFICE', 'CLIENT OFFICE']);
    expect(IA.shells.map((s) => s.environment_id)).toEqual(['AIO.OFFICE', 'AIO.CLIENT_OFFICE']);
    for (const s of IA.shells) expect(brain.AIO_ENVIRONMENTS.some((e) => e.environment_id === s.environment_id)).toBe(true);
  });
});

describe('B. The founder trees, verbatim', () => {
  it('AIO OFFICE: HOME 7 · INTAKE 10 · WORK 12 lanes with their sections · REPORTS 10 · MORE 11', () => {
    expect(labels('AIO_OFFICE.HOME')).toEqual(FOUNDER_TREE.HOME);
    expect(labels('AIO_OFFICE.INTAKE')).toEqual(FOUNDER_TREE.INTAKE);
    const work = FOUNDER_TREE.WORK as Record<string, string[]>;
    expect(labels('AIO_OFFICE.WORK')).toEqual(Object.keys(work));
    for (const lane of iaChildren(IA, 'AIO_OFFICE.WORK')) expect(labels(lane.node_id), lane.label).toEqual(work[lane.label]);
    expect(labels('AIO_OFFICE.REPORTS')).toEqual(FOUNDER_TREE.REPORTS);
    expect(labels('AIO_OFFICE.MORE')).toEqual(FOUNDER_TREE.MORE);
  });
  it('CLIENT OFFICE: the seven roots with their children (the landing and the activation gate are not roots)', () => {
    for (const root of IA.shells[1].root_nav.map((id) => iaNode(IA, id)!)) expect(labels(root.node_id), root.label).toEqual(CLIENT_TREE[root.label]);
    expect(iaChildren(IA, 'CLIENT_OFFICE').filter((n) => n.kind !== 'ROOT_DESTINATION').map((n) => n.kind)).toEqual(['LANDING', 'GATE']);
  });
});

describe('C. FILING superseded and rehomed under WORK', () => {
  it('FILING lives at AIO OFFICE → WORK → FILING & FUEL TAXES and IFTA beneath it', () => {
    expect(iaPath(IA, 'AIO_OFFICE.WORK.FILING_FUEL_TAXES')).toEqual([...G.NEW_FILING_LOCATION]);
    expect(iaPath(IA, 'AIO_OFFICE.WORK.FILING_FUEL_TAXES.IFTA')).toEqual([...G.NEW_IFTA_LOCATION]);
    expect(iaNode(IA, 'AIO_OFFICE.WORK.FILING_FUEL_TAXES')!.role).toBe('PRODUCTION');
  });
  it('every old dock item carries the lineage mark; root FILING is SUPERSEDED, its production REHOMED', () => {
    expect(IA.lineage_id).toBe('SUPERSEDED_BY_AIO_OFFICE_WORK_TREE1');
    const dock = IA.supersessions.filter((s) => s.old_structure.startsWith('Staff / founder root dock'));
    for (const item of ['HOME', 'INTAKE', 'REPORTS', 'MORE']) expect(dock.some((s) => s.old_item === item)).toBe(true);
    expect(dock.find((s) => s.old_item === 'FILING (root)')).toMatchObject({ disposition: 'SUPERSEDED', new_node_ids: ['AIO_OFFICE.WORK'] });
    expect(dock.find((s) => s.old_item === 'FILING (production)')?.disposition).toBe('REHOMED');
    expect(IA.supersessions.every((s) => s.lineage_id === IA.lineage_id)).toBe(true);
  });
  it('moving FILING changes no case identity', () => {
    for (const c of brain.AIO_IFTA_CASES) expect(c.case_key).toMatch(/^AIO:[^:]+:IFTA:IFTA_QUARTER:\d{4}-Q[1-4]$/);
    expect(Object.keys(iaNode(IA, 'AIO_OFFICE.WORK.FILING_FUEL_TAXES.IFTA')!)).not.toContain('case_key');
  });
});

describe('D. INTAKE is staff / founder only — the firewall', () => {
  it('no client can see anything in AIO OFFICE, and nothing in CLIENT OFFICE is entry work', () => {
    expect(iaVisibleTo(IA, 'AIO_OFFICE', 'CLIENT')).toEqual([]);
    expect(IA.nodes.filter((n) => n.shell_id === 'CLIENT_OFFICE' && n.role === 'ENTRY')).toEqual([]);
    expect(IA.nodes.filter((n) => n.shell_id === 'CLIENT_OFFICE').flatMap((n) => n.routes).filter((r) => r.path === '/office' || r.path.startsWith('/office/'))).toEqual([]);
    expect(iaVisibleTo(IA, 'CLIENT_OFFICE', 'STAFF')).toEqual([]);
  });
  it('the founder firewall list is covered and every item is CLIENT = HIDDEN', () => {
    const items = IA.firewall.map((f) => f.item).join(' | ');
    for (const w of ['INTAKE', 'extraction', 'matching', 'Founder review', 'queue states', 'load financials', 'case management', 'Cross-client', 'operations metrics', 'notes']) expect(items).toContain(w);
    for (const id of IA.firewall.flatMap((f) => f.node_ids)) expect(iaNode(IA, id)!.visibility.CLIENT).toBe('HIDDEN');
  });
  it('staff reach client data from AIO OFFICE, never by entering the client shell', () => {
    for (const n of IA.nodes.filter((x) => x.shell_id === 'CLIENT_OFFICE')) expect([n.visibility.FOUNDER, n.visibility.STAFF]).toEqual(['VIA_AIO_OFFICE', 'VIA_AIO_OFFICE']);
  });
});

describe('E. HOME = projection · WORK = production · REPORTS = oversight · MORE = secondary', () => {
  it('HOME regions project owners and own no production', () => {
    expect(iaNode(IA, 'AIO_OFFICE.HOME')!.role).toBe('COMMAND');
    for (const r of iaChildren(IA, 'AIO_OFFICE.HOME')) {
      expect(r.role).toBe('PROJECTION');
      expect(r.projects.length).toBeGreaterThan(0);
      for (const p of r.projects) expect(['PRODUCTION', 'ENTRY', 'SECONDARY']).toContain(iaNode(IA, p)!.role);
    }
    for (const req of brain.AIO_HOME_REQUIREMENTS) for (const id of req.regions) expect(iaNode(IA, id)?.parent).toBe('AIO_OFFICE.HOME');
  });
  it('the founder examples open their owner, which sits inside what the surface projects / aggregates', () => {
    const within = (owner: string, roots: string[]) => roots.some((r) => owner === r || owner.startsWith(`${r}.`));
    for (const e of brain.AIO_PROJECTION_EXAMPLES) {
      const surface = iaNode(IA, e.region)!;
      expect(['PRODUCTION', 'SECONDARY']).toContain(iaNode(IA, e.owner)!.role);
      expect(within(e.owner, e.surface === 'HOME' ? surface.projects : surface.aggregates), e.says).toBe(true);
    }
  });
  it('WORK and everything under it is production; the capability contract is truthful', () => {
    expect(iaDescendants(IA, 'AIO_OFFICE.WORK').every((n) => n.role === 'PRODUCTION')).toBe(true);
    expect(brain.AIO_WORK_CAPABILITIES.map((c) => c.capability)).toEqual(['Service lane navigation', 'Cross-client filtering', 'Client-specific drilldown', 'Active case / work item access', 'Status', 'Blockers', 'Deadlines', 'Assignments (where supported)', 'Route to the canonical client × workspace case']);
    expect(brain.AIO_WORK_CAPABILITIES.some((c) => c.implementation === 'IMPLEMENTED')).toBe(false);
    for (const c of brain.AIO_WORK_CAPABILITIES) expect(c.evidence.length).toBeGreaterThan(0);
  });
  it('REPORTS domains declare their data truth and aggregate production', () => {
    const domains = iaChildren(IA, 'AIO_OFFICE.REPORTS');
    for (const d of domains) {
      expect(d.role).toBe('OVERSIGHT');
      expect(['REAL_DATA', 'PARTIAL_DATA', 'NOT_YET_IMPLEMENTED']).toContain(d.data_status);
      if (d.data_status !== 'NOT_YET_IMPLEMENTED') expect(d.aggregates.length).toBeGreaterThan(0);
      if (d.data_status === 'NOT_YET_IMPLEMENTED') expect(d.implementation).toBe('IMPLEMENTATION_NOT_STARTED');
    }
    expect(domains.filter((d) => d.data_status === 'REAL_DATA')).toEqual([]); // no dashboard is faked
  });
  it('MORE holds no production, and what drives daily production is excluded to WORK / INTAKE', () => {
    for (const e of iaDescendants(IA, 'AIO_OFFICE.MORE')) expect(e.role).toBe('SECONDARY');
    for (const x of IA.more_rules.exclusions) expect(x.belongs_in.startsWith('AIO_OFFICE.WORK') || x.belongs_in === 'AIO_OFFICE.INTAKE').toBe(true);
  });
});

describe('F. Full AIO service scope — the crosswalk', () => {
  it('maps the fourteen founder services (plus staff-only migration intake) to staff and client locations', () => {
    for (const id of G.REQUIRED_SERVICES) {
      const s = IA.services.find((x) => x.service_id === id)!;
      expect(s, id).toBeDefined();
      expect(s.staff_nodes.length, id).toBeGreaterThan(0);
    }
    expect(IA.services.find((s) => s.service_id === 'CLIENT_MIGRATION_INTAKE')).toMatchObject({ client_visibility: 'STAFF_ONLY', client_nodes: [] });
    expect(IA.services.filter((s) => s.client_visibility !== 'STAFF_ONLY').every((s) => s.client_nodes.length > 0)).toBe(true);
  });
  it('every service is ARCHITECTURALLY_CANONICAL and honest about implementation', () => {
    for (const s of IA.services) {
      expect(s.architecture).toBe('ARCHITECTURALLY_CANONICAL');
      expect(['IMPLEMENTATION_PARTIAL', 'IMPLEMENTATION_NOT_STARTED']).toContain(s.implementation);
      expect(s.canonical_data_source.length).toBeGreaterThan(0);
    }
  });
  it('the crosswalk carries exactly the founder columns', () => {
    for (const row of serviceCrosswalk()) for (const col of ['SERVICE', 'STAFF LOCATION', 'CLIENT LOCATION', 'CLIENT VISIBILITY', 'CURRENT IMPLEMENTATION STATUS', 'CANONICAL DATA SOURCE', 'NOTES']) expect(row).toHaveProperty(col);
  });
});

describe('G. Client entitlement + contextual expansion preserved', () => {
  it('client workspace destinations resolve through real Brain workspaces', () => {
    const ws = new Set(brain.AIO_WORKSPACES.map((w) => w.workspace_id));
    for (const n of IA.nodes.filter((x) => x.workspace_ids.length)) for (const w of n.workspace_ids) expect(ws.has(w), `${n.node_id} → ${w}`).toBe(true);
    for (const n of IA.nodes.filter((x) => x.shell_id === 'CLIENT_OFFICE' && x.role === 'CLIENT_WORKSPACE' && x.workspace_ids.length)) expect(['ENTITLEMENT', 'APPLICABILITY']).toContain(n.client_resolution);
  });
  it('the founder expansion rule maps onto real suppression reasons', () => {
    const reasons = new Set<string>(EXPANSION_SUPPRESSION_REASONS);
    const named = brain.AIO_EXPANSION_CRITERIA.flatMap((c) => c.brain_mechanism.match(/\b[A-Z][A-Z_]{5,}\b/g) ?? []);
    expect(named.length).toBeGreaterThan(5);
    for (const r of named) expect(reasons.has(r), r).toBe(true);
    expect(brain.AIO_EXPANSION_CRITERIA.filter((c) => c.kind === 'SUPPRESS_WHEN').map((c) => c.founder_rule)).toEqual(['already active', 'unavailable', 'not applicable', 'source truth is insufficient', 'would distract from urgent work']);
  });
});

describe('H. Lifecycle — PREBUILT is not ACTIVE', () => {
  it('the ten lifecycle states are unchanged and only ACTIVE counts as active', () => {
    expect([...CLIENT_LIFECYCLE_STATES]).toEqual(['KNOWN_UNMIGRATED', 'MIGRATION_IN_PROGRESS', 'MIGRATION_REVIEW_REQUIRED', 'INTAKE_IN_PROGRESS', 'PREBUILT', 'INVITED', 'CLIENT_CONFIRMATION_REQUIRED', 'ACTIVE', 'PAUSED', 'ENDED']);
    expect(brain.AIO_LIFECYCLE_MAPPING.filter((m) => m.counted_active).map((m) => m.state)).toEqual(['ACTIVE']);
    expect(iaNode(IA, 'CLIENT_OFFICE.ACTIVATION')).toMatchObject({ kind: 'GATE', client_resolution: 'STATE' });
  });
});

describe('I. Approved authorities preserved and re-associated', () => {
  it('IFTA tree nodes are unchanged and associated with WORK → FILING & FUEL TAXES → IFTA and OPERATIONS → FILING / IFTA', () => {
    const tree = (id: string) => aioIfta.AIO_IFTA_TREE.find((n) => n.node_id === id)!;
    expect(tree('AIO.OFFICE.WS.IFTA').parent_node).toBe('AIO.OFFICE');
    expect(tree('AIO.CLIENT_OFFICE.WS.IFTA').parent_node).toBe('AIO.CLIENT_OFFICE');
    expect(tree('AIO.IFTA.STAFF.QUEUE')).toBeDefined();
    expect(iaNode(IA, 'AIO_OFFICE.WORK.FILING_FUEL_TAXES.IFTA')!.authority_refs).toEqual(['AIO.OFFICE.WS.IFTA', 'AIO.IFTA.STAFF.QUEUE']);
    expect(iaNode(IA, 'CLIENT_OFFICE.OPERATIONS.FILING_IFTA')!.authority_refs).toEqual(['AIO.CLIENT_OFFICE.WS.IFTA']);
  });
  it('every current migration authority is re-associated once — staff screens under INTAKE, client screens on the activation gate', () => {
    const MAS = brain.AIO_MIGRATION_AUTHORITY_SET;
    const refs = IA.nodes.flatMap((n) => n.authority_refs.filter((a) => a.startsWith('AIO-MIG-')).map((a) => [a, n.node_id] as const));
    expect(MAS.approved + MAS.founder_review_required.length + MAS.superseded.length).toBe(MAS.total);
    expect(new Set(refs.map(([a]) => a)).size).toBe(41);
    expect(refs.length).toBe(41);
    for (const x of MAS.superseded) expect(refs.some(([a]) => a === x.authority_id), x.authority_id).toBe(false); // lineage only
    for (const id of MAS.founder_review_required) expect(refs.find(([a]) => a === id)?.[1]).toBe('CLIENT_OFFICE.ACTIVATION');
    for (const [a, id] of refs) expect(a.startsWith('AIO-MIG-ACTIVATION-') ? id === 'CLIENT_OFFICE.ACTIVATION' : id.startsWith('AIO_OFFICE.INTAKE'), `${a} → ${id}`).toBe(true);
  });
});

describe('J. References resolve into the Brain', () => {
  it('feature refs are experience contracts, environments or screen families', () => {
    const known = new Set<string>([...brain.AIO_EXPERIENCE_CONTRACTS.map((c) => c.feature_id), ...brain.AIO_ENVIRONMENTS.map((e) => e.environment_id), ...brain.AIO_FUTURE_AUTHORITY_FAMILIES.map((f) => f.family_id)]);
    for (const f of [...IA.nodes.flatMap((n) => n.feature_refs), ...IA.services.flatMap((s) => s.feature_refs)]) expect(known.has(f), f).toBe(true);
  });
  it('product graph map, candidates, legacy targets and examples name real nodes', () => {
    const ok = (id: string | null) => id === null || !!iaNode(IA, id);
    const pg = brain.AIO_IA_PRODUCT_GRAPH_MAP;
    expect(pg.containers.map((c) => c.container)).toEqual(['MY_OFFICE', 'MY_BUSINESS', 'OPERATIONS', 'FINANCES', 'VAULT', 'INBOX', 'SERVICES', 'ACCOUNT']);
    expect(pg.families.map((f) => f.family)).toEqual(Array.from({ length: 18 }, (_, i) => `F${String(i + 1).padStart(2, '0')}`));
    for (const x of [...pg.containers.map((c) => c.ia_node), ...pg.families.flatMap((f) => [f.client_node, f.staff_node]), ...pg.role_projections.map((p) => p.ia_node)]) expect(ok(x), String(x)).toBe(true);
    expect(pg.families.find((f) => f.family === 'F12')).toMatchObject({ graph_nav: 'MY BUSINESS', client_node: 'CLIENT_OFFICE.FINANCES.INSURANCE' });
  });
  it('every legacy reference is classified with one of the five classes', () => {
    expect(new Set(IA.legacy.map((l) => l.classification))).toEqual(new Set(['KEEP', 'REMAP', 'SUPERSEDE', 'MIGRATE_LATER', 'REMOVE_WHEN_IMPLEMENTED']));
    expect(IA.legacy.find((l) => l.what.startsWith('STAFF_NAV'))?.classification).toBe('MIGRATE_LATER'); // live nav is not changed here
  });
});

describe('K. The validator', () => {
  it('accepts the AIO architecture', () => {
    expect(validateOfficeInformationArchitecture(IA)).toEqual([]);
  });
  const broken: [string, (ia: OfficeInformationArchitecture) => void, RegExp][] = [
    ['an INTAKE section in the client shell', (ia) => ia.nodes.push({ ...(structuredClone(iaNode(ia, 'CLIENT_OFFICE.INBOX.REQUESTS')) as IaNode), node_id: 'CLIENT_OFFICE.INBOX.INTAKE', label: 'Intake', role: 'ENTRY' }), /INTAKE \/ entry work in the client shell/],
    ['a staff node shown to a client', (ia) => { iaNode(ia, 'AIO_OFFICE.WORK.BROKERAGE.LOAD_FINANCIALS')!.visibility.CLIENT = 'CLIENT_SAFE_PROJECTION'; }, /visible to CLIENT/],
    ['a client node routed into the office', (ia) => { iaNode(ia, 'CLIENT_OFFICE.OPERATIONS.DISPATCH')!.routes.push({ path: '/office/messages', status: 'EXISTING', evidence: 'x' }); }, /routes into the internal office/],
    ['production collapsed into MORE', (ia) => { iaNode(ia, 'AIO_OFFICE.MORE.MECHANIC_NETWORK')!.role = 'PRODUCTION'; }, /PRODUCTION under AIO_OFFICE\.MORE/],
    ['FILING back at the root', (ia) => { ia.shells[0].root_nav = ['AIO_OFFICE.HOME', 'AIO_OFFICE.INTAKE', 'AIO_OFFICE.WORK.FILING_FUEL_TAXES', 'AIO_OFFICE.REPORTS', 'AIO_OFFICE.MORE']; }, /root_nav/],
    ['a projection that owns nothing', (ia) => { iaNode(ia, 'AIO_OFFICE.HOME.DEADLINES')!.projects = []; }, /must name what it projects/],
    ['a report domain without data truth', (ia) => { iaNode(ia, 'AIO_OFFICE.REPORTS.CLIENTS')!.data_status = null; }, /without data status/],
    ['lineage dropped', (ia) => { ia.supersessions[0].lineage_id = 'NONE'; }, /wrong lineage id/],
    ['a node the founder cannot see', (ia) => { iaNode(ia, 'AIO_OFFICE.MORE.BILLING')!.visibility.FOUNDER = 'BY_GRANT'; }, /FOUNDER must see every internal-office node/],
    ['staff inheriting founder authority', (ia) => { ia.actors.find((a) => a.actor === 'STAFF')!.inherits.push('FOUNDER'); }, /STAFF: inherits FOUNDER/],
    ['a founder hard-coded by email', (ia) => { ia.actors.find((a) => a.actor === 'FOUNDER')!.identity_rule = 'the owner at founder@example.com'; }, /identity names an email/],
    ['a single-founder class', (ia) => { ia.actors.find((a) => a.actor === 'FOUNDER')!.multiplicity = 'MANY'; ia.actors.find((a) => a.actor === 'FOUNDER')!.actor_class = 'INTERNAL'; }, /privileged class that allows more than one principal/],
    ['a founder act in the client office', (ia) => { iaNode(ia, 'CLIENT_OFFICE.FINANCES.FEES_PAYMENTS')!.founder_authority = 'x'; }, /founder authority outside the internal office/],
    ['a state node with no condition', (ia) => { iaNode(ia, 'CLIENT_OFFICE.OPERATIONS.ROAD_READY')!.shown_when = null; }, /STATE node without shown_when/],
    ['a decided question with no decision', (ia) => { ia.decisions = ia.decisions.filter((d) => d.decision_id !== 'D-CLIENT-HUB'); }, /Q-CLIENT-HUB: decided without a decision/],
  ];
  for (const [name, mutate, expected] of broken) {
    it(`rejects ${name}`, () => {
      const ia = clone();
      mutate(ia);
      expect(validateOfficeInformationArchitecture(ia).join('\n')).toMatch(expected);
    });
  }
});

describe('M. Founder decisions of 2026-10-08', () => {
  const lanesOf = () => iaChildren(IA, 'AIO_OFFICE.WORK');
  it('every open question is decided and each decision is recorded', () => {
    expect(IA.open_questions.map((q) => [q.question_id, q.status, q.decision_id])).toEqual([
      ['Q-CLIENT-HUB', 'DECIDED', 'D-CLIENT-HUB'],
      ['Q-COMPLIANCE-SPLIT', 'DECIDED', 'D-COMPLIANCE-ONE-LANE'],
      ['Q-STAFF-VEHICLES', 'DECIDED', 'D-VEHICLES-FLEET-LANE'],
      ['Q-FOUNDER-ROLE', 'DECIDED', 'D-FOUNDER-ROLE'],
      ['Q-GROWTH-BILLING', 'DECIDED', 'D-GROWTH-BILLING'],
      ['Q-CLIENT-ROAD-READY', 'DECIDED', 'D-ROAD-READY-PLACEMENT'],
    ]);
    for (const d of IA.decisions) expect(d.decided_on).toBe('2026-10-08');
  });

  it('1 · the client HUB / OVERVIEW is the shell landing, projects the seven destinations, and is not a root tab', () => {
    const hub = iaNode(IA, 'CLIENT_OFFICE.HUB')!;
    expect(hub).toMatchObject({ kind: 'LANDING', role: 'PROJECTION', architecture: 'ARCHITECTURALLY_CANONICAL', parent: 'CLIENT_OFFICE' });
    expect(IA.shells[1].root_nav).not.toContain('CLIENT_OFFICE.HUB');
    expect(hub.projects).toEqual(IA.shells[1].root_nav);
    expect(labels('CLIENT_OFFICE.HUB')).toEqual([...G.CLIENT_HUB_REGIONS]);
    for (const r of iaChildren(IA, 'CLIENT_OFFICE.HUB')) {
      expect(r.role).toBe('PROJECTION');
      for (const p of r.projects) expect(iaNode(IA, p)!.shell_id, `${r.label} → ${p}`).toBe('CLIENT_OFFICE');
    }
    expect(iaNode(IA, 'CLIENT_OFFICE.MY_BUSINESS')!.kind).toBe('ROOT_DESTINATION');
  });

  it('2 · compliance stays one lane with its four sections', () => {
    expect(lanesOf().filter((l) => /compliance/i.test(l.label)).map((l) => l.label)).toEqual(['Compliance']);
    expect(labels('AIO_OFFICE.WORK.COMPLIANCE')).toEqual(['DOT / Safety', 'Expirations', 'Audit / Corrective Work', 'Compliance Cases']);
    expect(brain.AIO_WORKSPACES.filter((w) => /COMPLIANCE/.test(w.workspace_id)).map((w) => w.workspace_id)).toEqual(['COMPLIANCE']);
  });

  it('3 · VEHICLES & FLEET is the twelfth lane; it owns the vehicle record and cross-links the rest without duplicating source truth', () => {
    expect(lanesOf().map((l) => l.label)).toEqual([...G.WORK_LANES]);
    expect(lanesOf()).toHaveLength(12);
    const lane = iaNode(IA, 'AIO_OFFICE.WORK.VEHICLES_FLEET')!;
    expect(lane).toMatchObject({ kind: 'SERVICE_LANE', role: 'PRODUCTION', client_projection: 'CLIENT_OFFICE.OPERATIONS.VEHICLE_MANAGEMENT', implementation: 'IMPLEMENTATION_NOT_STARTED' });
    expect(IA.services.find((s) => s.service_id === 'VEHICLE_MANAGEMENT')!.staff_nodes).toEqual(['AIO_OFFICE.WORK.VEHICLES_FLEET']);
    const scope = brain.AIO_VEHICLES_FLEET_SCOPE;
    expect(scope).toHaveLength(12);
    for (const x of scope.filter((y) => y.relation === 'CROSS_LINK')) {
      expect(x.source_of_truth, x.item).not.toBe('AIO_OFFICE.WORK.VEHICLES_FLEET');
      expect(iaNode(IA, x.source_of_truth)?.shell_id, x.item).toBe('AIO_OFFICE');
    }
    for (const owner of ['DISPATCH', 'COMPLIANCE', 'FILING_FUEL_TAXES', 'INSURANCE', 'MECHANIC_MAINTENANCE', 'DRIVERS_CARRIERS']) expect(scope.some((x) => x.source_of_truth.startsWith(`AIO_OFFICE.WORK.${owner}`) || (owner === 'DISPATCH' && x.note.includes('Dispatch'))), owner).toBe(true);
  });

  it('4 · FOUNDER is a privileged role, not a person; staff never inherit it or self-elevate', () => {
    const founder = IA.actors.find((a) => a.actor === 'FOUNDER')!;
    expect(founder).toMatchObject({ actor_class: 'PRIVILEGED_INTERNAL', multiplicity: 'ONE_OR_MORE', can_self_elevate: false });
    expect(founder.identity_rule).toMatch(/never a hard-coded person, name or email/);
    expect(IA.actors.find((a) => a.actor === 'STAFF')).toMatchObject({ inherits: [], can_self_elevate: false });
    expect(founder.privileges.map((p) => p.privilege)).toEqual(['All-client visibility', 'All-service visibility', 'Founder review', 'PREBUILT review / activation authority', 'High-risk overrides', 'Internal financial visibility', 'Reporting', 'Staff / permission administration', 'System configuration', 'Service configuration', 'Founder-only approvals where defined']);
    for (const n of IA.nodes.filter((x) => x.shell_id === 'AIO_OFFICE')) expect(n.visibility.FOUNDER, n.node_id).toBe('FULL');
    expect(iaNode(IA, 'AIO_OFFICE.INTAKE.FOUNDER_REVIEW')!.founder_authority).toMatch(/Founder review/);
    expect(iaNode(IA, 'AIO_OFFICE.REPORTS.FINANCIAL_REVENUE')!.visibility.STAFF).toBe('BY_GRANT');
    expect(iaVisibleTo(IA, 'AIO_OFFICE', 'STAFF').some((n) => n.node_id === 'AIO_OFFICE.REPORTS')).toBe(false);
    expect(iaVisibleTo(IA, 'AIO_OFFICE', 'STAFF', true).some((n) => n.node_id === 'AIO_OFFICE.REPORTS')).toBe(true);
  });

  it('5 · GROWTH / CRM and BILLING live in MORE; HOME projects CRM, REPORTS aggregates billing, clients see client-safe billing only', () => {
    for (const id of ['AIO_OFFICE.MORE.GROWTH_CRM', 'AIO_OFFICE.MORE.BILLING']) expect(iaNode(IA, id)).toMatchObject({ parent: 'AIO_OFFICE.MORE', role: 'SECONDARY' });
    expect(iaDescendants(IA, 'AIO_OFFICE.WORK').some((n) => /crm|billing/i.test(n.label))).toBe(false);
    expect(iaNode(IA, 'AIO_OFFICE.HOME.NEEDS_ATTENTION')!.projects).toContain('AIO_OFFICE.MORE.GROWTH_CRM');
    expect(iaNode(IA, 'AIO_OFFICE.REPORTS.FINANCIAL_REVENUE')!.aggregates).toContain('AIO_OFFICE.MORE.BILLING');
    expect(iaNode(IA, 'AIO_OFFICE.MORE.BILLING')!.client_projection).toBe('CLIENT_OFFICE.FINANCES.FEES_PAYMENTS');
    expect(iaNode(IA, 'AIO_OFFICE.MORE.GROWTH_CRM')!.potential_children).toEqual(['Leads', 'Prospects', 'Pipeline', 'Follow-ups', 'Referrals', 'Sales Activity', 'Service Opportunities']);
    expect(iaNode(IA, 'AIO_OFFICE.MORE.BILLING')!.potential_children).toEqual(['Client Billing', 'Invoices', 'Payments', 'Balances', 'Service Charges', 'Subscriptions / Recurring Services', 'Credits / Adjustments']);
    expect(IA.firewall.some((f) => /margin, commission, profitability/.test(f.item))).toBe(true);
    for (const id of ['C-CRM-GROWTH', 'C-BILLING-DESK']) expect(IA.candidates.find((c) => c.candidate_id === id)?.status).toBe('RESOLVED');
  });

  it('6 · Road Ready sits in SERVICES while available, in OPERATIONS while active, and its records are distributed on completion', () => {
    const rr = IA.services.find((s) => s.service_id === 'ROAD_READY')!;
    const at = (state: string) => rr.state_placements!.find((p) => p.state === state)!.client_nodes;
    expect(rr.client_visibility).toBe('STATE');
    expect(at('AVAILABLE_NOT_ACTIVATED')).toEqual(['CLIENT_OFFICE.SERVICES.ROAD_READY']);
    expect(at('ACTIVE')).toEqual(['CLIENT_OFFICE.OPERATIONS.ROAD_READY']);
    expect(at('COMPLETED')).toEqual(['CLIENT_OFFICE.SERVICES.ROAD_READY', 'CLIENT_OFFICE.MY_BUSINESS', 'CLIENT_OFFICE.VAULT', 'CLIENT_OFFICE.OPERATIONS', 'CLIENT_OFFICE.FINANCES']);
    for (const id of ['CLIENT_OFFICE.OPERATIONS.ROAD_READY', 'CLIENT_OFFICE.SERVICES.ROAD_READY']) expect(iaNode(IA, id)).toMatchObject({ client_resolution: 'STATE' });
    expect(iaNode(IA, 'CLIENT_OFFICE.OPERATIONS.ROAD_READY')!.shown_when).toBe('Road Ready engagement ACTIVE');
    expect(iaNode(IA, 'CLIENT_OFFICE.MY_BUSINESS')!.service_ids).not.toContain('ROAD_READY');
  });
});

describe('L. Quality gate + generated docs', () => {
  it('the computed gate is the founder gate', () => {
    const gate = Object.fromEntries(aioOfficeIaQualityGate().checks.map((c) => [c.key, c.value]));
    expect(gate).toEqual({
      FOUNDER_ROOT_NAV: 'HOME · INTAKE · WORK · REPORTS · MORE',
      CLIENT_ROOT_NAV: 'MY BUSINESS · OPERATIONS · FINANCES · VAULT · INBOX · SERVICES · ACCOUNT',
      ROOT_FILING_SUPERSEDED: 'YES',
      FILING_REHOMED_UNDER_WORK: 'YES',
      INTAKE_STAFF_ONLY: 'YES',
      CLIENT_INTAKE_EXPOSURE: 'NO',
      FULL_AIO_SERVICE_SCOPE_REPRESENTED: 'YES',
      HOME_DEFINED_AS_PROJECTION: 'YES',
      WORK_DEFINED_AS_PRODUCTION: 'YES',
      REPORTS_DEFINED_AS_OVERSIGHT: 'YES',
      MORE_DEFINED_AS_SECONDARY: 'YES',
      CLIENT_SERVICE_ENTITLEMENT_MODEL_PRESERVED: 'YES',
      PREBUILT_NOT_ACTIVE: 'YES',
      IFTA_AUTHORITY_PRESERVED: 'YES',
      MIGRATION_AUTHORITY_PRESERVED: 'YES',
      EXPERIENCE_BRAIN_UPDATED: 'YES',
      PRODUCT_GRAPH_UPDATED: 'YES',
      STAFF_SERVICE_LANES: '12',
      CLIENT_HUB_IS_LANDING_NOT_ROOT: 'YES',
      COMPLIANCE_SINGLE_LANE: 'YES',
      VEHICLES_FLEET_LANE: 'YES',
      FOUNDER_IS_ROLE_NOT_IDENTITY: 'YES',
      GROWTH_CRM_AND_BILLING_IN_MORE: 'YES',
      ROAD_READY_STATE_PLACEMENT: 'YES',
      OPEN_QUESTIONS_DECIDED: '6 of 6',
      VISUAL_REDESIGN_PERFORMED: 'NO',
      LIVE_IMPLEMENTATION_CHANGED: 'NO',
    });
  });
  it('docs/aio/office-ia is in sync with the source', () => {
    const files = buildAioOfficeIaExports();
    expect(Object.keys(files).length).toBe(25);
    for (const [name, body] of Object.entries(files)) expect(readFileSync(path.join(ROOT, `${AIO_OFFICE_IA_DOCS_DIR}/${name}`), 'utf8'), name).toBe(body);
  });
});
