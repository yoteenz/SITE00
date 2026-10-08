/**
 * AIO — office information architecture: the founder / staff WORK tree and the CLIENT OFFICE tree
 * (P0.AIO.OFFICE-IA.FOUNDER-WORK-TREE-AND-CLIENT-OFFICE-CANONICALIZATION1).
 *
 * Founder decision: the AIO OFFICE root is HOME · INTAKE · WORK · REPORTS · MORE. FILING is no longer a root item; it is
 * the FILING & FUEL TAXES lane inside WORK. CLIENT OFFICE is MY BUSINESS · OPERATIONS · FINANCES · VAULT · INBOX ·
 * SERVICES · ACCOUNT. INTAKE is staff / founder only.
 *
 * Founder decisions of 2026-10-08 (AIO_IA_DECISIONS) settle the six open questions: the client HUB / OVERVIEW is the
 * shell landing (not a root tab); COMPLIANCE stays one lane; WORK gains VEHICLES & FLEET (12 lanes); FOUNDER is a
 * privileged actor class, never a hard-coded person; GROWTH / CRM and BILLING live in MORE; ROAD READY sits in SERVICES
 * while available and in OPERATIONS while active.
 *
 * Architecture only: no page, nav, route, schema or lifecycle changes. Implementation status comes from a read-only
 * audit of fsbw @ AIO_OFFICE_IA_AUDIT_SHA; every node cites its evidence. office.ts (workspaces, environments,
 * switchers, expansion) and the IFTA authority tree are reused, not changed.
 */
import type {
  ArchitectureStatus,
  ClientResolution,
  IaActor,
  IaActorDefinition,
  IaCandidate,
  IaDecision,
  IaFirewallItem,
  IaLegacyReference,
  IaNode,
  IaNodeKind,
  IaOpenQuestion,
  IaRole,
  IaRouteRef,
  IaService,
  IaShell,
  IaSupersession,
  IaVisibility,
  ImplementationDepth,
  ImplementationStatus,
  OfficeInformationArchitecture,
  ReportDataStatus,
} from '../../office-information-architecture.js';

export const AIO_OFFICE_IA_SPRINT = 'P0.AIO.OFFICE-IA.FOUNDER-WORK-TREE-AND-CLIENT-OFFICE-CANONICALIZATION1';
export const AIO_OFFICE_IA_LINEAGE_ID = 'SUPERSEDED_BY_AIO_OFFICE_WORK_TREE1';
export const AIO_OFFICE_IA_AUDIT_SHA = '750b12466845ff8acd5e53909d6da2dc3df124b9';
export const AIO_OFFICE_IA_NEXT_SPRINT = 'P0.AIO.OFFICE-IA.FOUNDER-HOME-WORK-REPORTS-MORE.AUTHORITY-CONTRACTS1';

const SRC = 'all-in-one-enterprises/src';
const OR = (l: string) => `${SRC}/office/routes/OfficeRoutes.tsx:${l}`;
const CR = (l: string) => `${SRC}/routes/AioCoreRoutes.tsx:${l}`;
const ex = (path: string, evidence: string): IaRouteRef => ({ path, status: 'EXISTING', evidence });
const pr = (path: string, evidence: string): IaRouteRef => ({ path, status: 'PROPOSED', evidence });
const hu = (path: string, evidence: string): IaRouteRef => ({ path, status: 'HELPER_UNROUTED', evidence });

type Impl = [ImplementationStatus, ImplementationDepth];
const PARTIAL_DEMO: Impl = ['IMPLEMENTATION_PARTIAL', 'FUNCTIONAL_DEMO'];
const PARTIAL_READ: Impl = ['IMPLEMENTATION_PARTIAL', 'READ_ONLY'];
const PARTIAL_GENERIC: Impl = ['IMPLEMENTATION_PARTIAL', 'GENERIC_PIPELINE'];
const PARTIAL_BACKED: Impl = ['IMPLEMENTATION_PARTIAL', 'PRODUCTION_BACKED'];
const NOT_STARTED: Impl = ['IMPLEMENTATION_NOT_STARTED', 'NONE'];

const STAFF_SHELL_VIS: Record<IaActor, IaVisibility> = { FOUNDER: 'FULL', STAFF: 'FULL', CLIENT: 'HIDDEN' };
const STAFF_BY_GRANT_VIS: Record<IaActor, IaVisibility> = { FOUNDER: 'FULL', STAFF: 'BY_GRANT', CLIENT: 'HIDDEN' };
const CLIENT_SHELL_VIS: Record<IaActor, IaVisibility> = { FOUNDER: 'VIA_AIO_OFFICE', STAFF: 'VIA_AIO_OFFICE', CLIENT: 'FULL' };

type Spec = {
  label: string;
  kind: IaNodeKind;
  role: IaRole;
  semantics?: string;
  impl: Impl;
  evidence?: string[];
  routes?: IaRouteRef[];
  services?: string[];
  workspaces?: string[];
  features?: string[];
  authorities?: string[];
  client?: ClientResolution;
  projection?: string;
  gate?: string;
  projects?: string[];
  aggregates?: string[];
  data?: ReportDataStatus;
  architecture?: ArchitectureStatus;
  notes?: string;
  /** Staff see it only with an explicit grant (founder-class visibility is never inherited). */
  byGrant?: boolean;
  /** The act reserved to the FOUNDER actor class. */
  founder?: string;
  /** STATE nodes: when the node is shown. */
  shownWhen?: string;
  /** Founder-named potential children (not nodes yet). */
  potential?: string[];
};

const NODES: IaNode[] = [];
const orderOf = new Map<string, number>();
/** Node ids encode the tree: the parent is the id without its last segment; the shell is the first segment. */
function node(id: string, s: Spec): void {
  const parts = id.split('.');
  const parent = parts.length > 1 ? parts.slice(0, -1).join('.') : null;
  const order = orderOf.get(parent ?? '') ?? 0;
  orderOf.set(parent ?? '', order + 1);
  const shell_id = parts[0];
  NODES.push({
    node_id: id,
    shell_id,
    parent,
    order,
    label: s.label,
    kind: s.kind,
    role: s.role,
    semantics: s.semantics ?? '',
    visibility: shell_id === 'CLIENT_OFFICE' ? CLIENT_SHELL_VIS : s.byGrant ? STAFF_BY_GRANT_VIS : STAFF_SHELL_VIS,
    staff_gate: s.gate ?? null,
    founder_authority: s.founder ?? null,
    client_projection: s.projection ?? null,
    architecture: s.architecture ?? 'ARCHITECTURALLY_CANONICAL',
    implementation: s.impl[0],
    depth: s.impl[1],
    evidence: s.evidence ?? [],
    routes: s.routes ?? [],
    service_ids: s.services ?? [],
    workspace_ids: s.workspaces ?? [],
    feature_refs: s.features ?? [],
    authority_refs: s.authorities ?? [],
    client_resolution: shell_id === 'CLIENT_OFFICE' && s.kind !== 'SHELL' ? s.client ?? 'ALWAYS' : null,
    shown_when: s.shownWhen ?? null,
    potential_children: s.potential ?? [],
    projects: s.projects ?? [],
    aggregates: s.aggregates ?? [],
    data_status: s.data ?? null,
    notes: s.notes ?? '',
  });
}

/* ════════════════════════════════ AIO OFFICE (founder / staff) ════════════════════════════════ */

const LANES = [
  'AIO_OFFICE.WORK.PERMITTING_AUTHORITIES',
  'AIO_OFFICE.WORK.FILING_FUEL_TAXES',
  'AIO_OFFICE.WORK.COMPLIANCE',
  'AIO_OFFICE.WORK.VEHICLES_FLEET',
  'AIO_OFFICE.WORK.DISPATCH',
  'AIO_OFFICE.WORK.BROKERAGE',
  'AIO_OFFICE.WORK.INSURANCE',
  'AIO_OFFICE.WORK.FACTORING',
  'AIO_OFFICE.WORK.BOOKKEEPING',
  'AIO_OFFICE.WORK.DRIVERS_CARRIERS',
  'AIO_OFFICE.WORK.MECHANIC_MAINTENANCE',
  'AIO_OFFICE.WORK.ROAD_READY',
];

node('AIO_OFFICE', {
  label: 'AIO OFFICE', kind: 'SHELL', role: 'LANDING', impl: PARTIAL_DEMO,
  semantics: 'The internal operational office for founder and staff. Operates across ALL clients and ALL services. Opens on HOME.',
  routes: [ex('/office', OR('198'))], features: ['AIO.OFFICE', 'AIO.OFFICE_OPERATIONS'],
});

/* ── HOME: cross-business command center (projection, never production) ── */
node('AIO_OFFICE.HOME', {
  label: 'HOME', kind: 'ROOT_DESTINATION', role: 'COMMAND', impl: PARTIAL_DEMO,
  semantics: 'Cross-business command center: what needs attention across AIO now. Projects INTAKE and WORK; owns no production state.',
  routes: [ex('/office', `${OR('198')} OfficeDashboardPage (useOfficeCommandCenter)`)],
  evidence: [`${SRC}/office/pages/OfficeDashboardPage.tsx:16`, `${SRC}/office-core/officeAttentionEngine.ts:78`],
  projects: ['AIO_OFFICE.INTAKE', 'AIO_OFFICE.WORK'], features: ['AIO.OFFICE_OPERATIONS'],
});
node('AIO_OFFICE.HOME.NEEDS_ATTENTION', {
  label: 'Needs Attention', kind: 'REGION', role: 'PROJECTION', impl: PARTIAL_DEMO,
  semantics: 'Items across every client and service that need the office now. Each item opens its owning INTAKE / WORK case.',
  evidence: [`${SRC}/office-core/officeAttentionEngine.ts:78`], projects: ['AIO_OFFICE.INTAKE', ...LANES, 'AIO_OFFICE.MORE.GROWTH_CRM'],
  notes: 'The attention engine has no IFTA, bookkeeping, FleetCare or DriverLink candidates yet. May show CRM follow-ups due and opportunities needing attention (D-GROWTH-BILLING); HOME owns no CRM state.',
});
node('AIO_OFFICE.HOME.DEADLINES', {
  label: 'Deadlines', kind: 'REGION', role: 'PROJECTION', impl: PARTIAL_DEMO,
  semantics: 'Due and upcoming dates across services (filings, renewals, expirations, permits).',
  routes: [ex('/office/deadlines', `${OR('279')} DeadlinesPage (Deadline Center)`)],
  evidence: [`${SRC}/demo/demoTypes.ts:408 Deadline (deadlineType incl. ifta_filing)`, `${SRC}/office/pages/OperationsPages.tsx:47-113`],
  projects: ['AIO_OFFICE.WORK.FILING_FUEL_TAXES', 'AIO_OFFICE.WORK.COMPLIANCE.EXPIRATIONS', 'AIO_OFFICE.WORK.PERMITTING_AUTHORITIES', 'AIO_OFFICE.WORK.INSURANCE.RENEWALS'],
});
node('AIO_OFFICE.HOME.BLOCKERS', {
  label: 'Blockers', kind: 'REGION', role: 'PROJECTION', impl: PARTIAL_DEMO,
  semantics: 'Work that cannot move, and why (waiting on client, missing data, failed check).',
  evidence: [`${SRC}/office-core/officeWorkTypes.ts:111 OfficeWorkItem`, `${SRC}/ifta/iftaDerive.ts:528 staffBucket BLOCKED`, `${SRC}/office-core/client360Service.ts:42-43 customerWaitingOn / allInOneWaitingOn`],
  projects: [...LANES, 'AIO_OFFICE.INTAKE'],
  notes: 'No IFTA OfficeWorkItem domain; waiting-on is per client only (no cross-client rollup).',
});
node('AIO_OFFICE.HOME.WORK_ACROSS_AIO', {
  label: 'Work Across AIO', kind: 'REGION', role: 'PROJECTION', impl: PARTIAL_DEMO,
  semantics: 'One line per WORK lane: open, due, blocked — each opens the lane.',
  routes: [ex('/office/work', `${OR('199')} My Work`), ex('/office/queues', `${OR('200')} Queues`)],
  evidence: [`${SRC}/office-core/client360Service.ts:52-71 activeServices (heuristics)`, `${SRC}/management/managementQueryLayer.ts:388 getBusinessHealthAreas`],
  projects: LANES,
  notes: 'Today’s /office/work lists staff work items across lanes; no per-lane rollup exists.',
});
node('AIO_OFFICE.HOME.CLIENTS_IN_MOTION', {
  label: 'Clients in Motion', kind: 'REGION', role: 'PROJECTION', impl: PARTIAL_DEMO,
  semantics: 'Clients changing state: migrating, PREBUILT, invited, confirming, newly ACTIVE, paused. PREBUILT is never counted ACTIVE.',
  evidence: [`${SRC}/client-migration/lifecycle.ts:54 founderSegmentForLifecycle`, `${SRC}/client-migration/activeClientMetrics.ts:11 filterClientsByFounderSegment`],
  projects: ['AIO_OFFICE.INTAKE', 'AIO_OFFICE.MORE.CLIENTS'],
});
node('AIO_OFFICE.HOME.RECENT_ACTIVITY', {
  label: 'Recent Activity', kind: 'REGION', role: 'PROJECTION', impl: PARTIAL_DEMO,
  semantics: 'Recent production events across clients and services (staff-only feed).',
  routes: [ex('/office/activity', `${OR('208')} internal activity feed`)],
  evidence: [`${SRC}/office/pages/OfficeDashboardPage.tsx:16`], projects: ['AIO_OFFICE.INTAKE', 'AIO_OFFICE.WORK', 'AIO_OFFICE.MORE.GROWTH_CRM'],
  notes: 'May include new leads and conversions from GROWTH / CRM (D-GROWTH-BILLING).',
});
node('AIO_OFFICE.HOME.QUICK_ACTIONS', {
  label: 'Quick Actions', kind: 'REGION', role: 'PROJECTION', impl: PARTIAL_DEMO,
  semantics: 'Fast entry into a client or a workspace (open client, start intake, open a lane). Launches; owns nothing.',
  evidence: [`${SRC}/office/layouts/AIOOfficeLayout.tsx:241-253 quick create`, `${SRC}/office/layouts/AIOOfficeLayout.tsx:263-276 command palette`, `${SRC}/office/layouts/AIOOfficeLayout.tsx:148 topbar client search`],
  projects: ['AIO_OFFICE.INTAKE.EXISTING_CLIENT_FILE', 'AIO_OFFICE.INTAKE.NEW_CLIENT_FILE', 'AIO_OFFICE.MORE.CLIENTS', 'AIO_OFFICE.WORK'],
});

node('AIO_OFFICE.HOME.BUSINESS_PULSE', {
  label: 'Business Pulse', kind: 'REGION', role: 'PROJECTION', impl: PARTIAL_DEMO, byGrant: true,
  semantics: 'OPTIONAL executive snapshot: renders only metrics that REPORTS can back with production source truth (REAL_DATA or DERIVED_SUPPORTED, production-backed). Absent — never zero — when unsupported.',
  evidence: [`${SRC}/office/pages/OfficeDashboardPage.tsx:34 ManagerSummary`, `${SRC}/management/managementQueryLayer.ts:90-108 getExecutiveSnapshot`],
  projects: ['AIO_OFFICE.REPORTS.OVERVIEW', 'AIO_OFFICE.REPORTS.FINANCIAL_REVENUE'],
  gate: 'management.dashboard.read · management.financial.read for money figures (ROLE_PERMISSIONS)',
  notes: 'Added by the HOME authority contract as the optional eighth region. Every figure today comes from the demo store, so in production the region stays absent until a metric is production-backed.',
});

/* ── INTAKE: staff-only entry / migration / onboarding ── */
const MIG = (screen: string) => ex(`/office/migration/${screen}`, `${OR('196')} MigrationStudioPage :screen`);
node('AIO_OFFICE.INTAKE', {
  label: 'INTAKE', kind: 'ROOT_DESTINATION', role: 'ENTRY', impl: PARTIAL_BACKED,
  semantics: 'Bring clients and records into the digital AIO system: migration, extraction, matching, review, PREBUILT creation, activation invite. Staff / founder only — never in the client shell.',
  routes: [ex('/office/migration', `${OR('195')} MigrationStudioPage (outside AIOOfficeLayout, inside OfficeRouteGuard)`)],
  evidence: [`${SRC}/client-migration/services/migrationIntakeService.ts`, `${SRC}/client-migration/server/supabaseApproveMigration.ts`, `${SRC}/client-migration/repositories`],
  services: ['CLIENT_MIGRATION_INTAKE'], features: ['AIO.CLIENT_MIGRATION', 'AIO.MIGRATION_INTAKE', 'AIO.MIGRATION_REVIEW'],
  authorities: ['AIO-MIG-ROOT-001'],
  notes: 'Approved migration visual authorities (AIO_CLIENT_MIGRATION_AUTHORITY) are re-associated here — not regenerated. Lifecycle unchanged: KNOWN_UNMIGRATED … PREBUILT … ACTIVE; PREBUILT is not ACTIVE.',
});
node('AIO_OFFICE.INTAKE.EXISTING_CLIENT_FILE', { label: 'Existing Client File', kind: 'SECTION', role: 'ENTRY', impl: PARTIAL_BACKED, routes: [MIG('existing'), MIG('upload'), MIG('received')], authorities: ['AIO-MIG-EXISTING-SELECT-001', 'AIO-MIG-EXISTING-UPLOAD-001', 'AIO-MIG-EXISTING-RECEIVED-001'], services: ['CLIENT_MIGRATION_INTAKE'] });
node('AIO_OFFICE.INTAKE.NEW_CLIENT_FILE', { label: 'New Client File', kind: 'SECTION', role: 'ENTRY', impl: PARTIAL_BACKED, routes: [MIG('new'), MIG('new-received'), MIG('new-identity'), MIG('new-records')], authorities: ['AIO-MIG-NEW-FILE-001', 'AIO-MIG-NEW-RECEIVED-001', 'AIO-MIG-NEW-IDENTITY-001', 'AIO-MIG-NEW-RECORDS-001'], services: ['CLIENT_MIGRATION_INTAKE'] });
node('AIO_OFFICE.INTAKE.BULK_BATCH_MIGRATION', { label: 'Bulk Batch Migration', kind: 'SECTION', role: 'ENTRY', impl: PARTIAL_DEMO, routes: [MIG('batch'), MIG('batch-received'), MIG('batch-summary'), MIG('batch-queue'), MIG('batch-client'), MIG('batch-complete')], authorities: ['AIO-MIG-BULK-001', 'AIO-MIG-BATCH-RECEIVED-001', 'AIO-MIG-BATCH-SUMMARY-001', 'AIO-MIG-BATCH-QUEUE-001', 'AIO-MIG-BATCH-CLIENT-001', 'AIO-MIG-BATCH-COMPLETE-001'], services: ['CLIENT_MIGRATION_INTAKE'] });
node('AIO_OFFICE.INTAKE.MIGRATION_STATUS', { label: 'Migration Status', kind: 'SECTION', role: 'ENTRY', impl: PARTIAL_DEMO, routes: [ex('/office/migration', OR('195'))], services: ['CLIENT_MIGRATION_INTAKE'], notes: 'Shown on the INTAKE root screen (AIO-MIG-ROOT-001, associated with INTAKE).', semantics: 'Where each file stands in the pipeline (upload → extract → classify → validate → review → complete).' });
node('AIO_OFFICE.INTAKE.EXTRACTION_CLASSIFICATION', { label: 'Extraction / Classification', kind: 'SECTION', role: 'ENTRY', impl: PARTIAL_BACKED, routes: [MIG('extract'), MIG('new-extract'), MIG('batch-processing')], authorities: ['AIO-MIG-EXISTING-EXTRACT-001', 'AIO-MIG-NEW-EXTRACT-001', 'AIO-MIG-BATCH-PROCESSING-001'], services: ['CLIENT_MIGRATION_INTAKE'] });
node('AIO_OFFICE.INTAKE.MATCH_RECONCILE', { label: 'Match / Reconcile', kind: 'SECTION', role: 'ENTRY', impl: PARTIAL_BACKED, routes: [MIG('match'), MIG('conflicts'), MIG('batch-conflicts')], authorities: ['AIO-MIG-EXISTING-MATCH-001', 'AIO-MIG-EXISTING-CONFLICTS-001', 'AIO-MIG-BATCH-CONFLICTS-001'], services: ['CLIENT_MIGRATION_INTAKE'], notes: 'Open gap (prototype): the match decision is kept in the open page only.' });
node('AIO_OFFICE.INTAKE.FOUNDER_REVIEW', { label: 'Founder Review', kind: 'SECTION', role: 'ENTRY', impl: PARTIAL_BACKED, founder: 'Founder review of the migrated profile (staff prepare it; they do not inherit the review)', routes: [MIG('review'), MIG('new-review')], authorities: ['AIO-MIG-EXISTING-REVIEW-001', 'AIO-MIG-NEW-REVIEW-001'], services: ['CLIENT_MIGRATION_INTAKE'] });
node('AIO_OFFICE.INTAKE.PREBUILT_CLIENT', { label: 'Prebuilt Client', kind: 'SECTION', role: 'ENTRY', impl: PARTIAL_BACKED, founder: 'PREBUILT review / approval (APPROVE MIGRATION)', routes: [MIG('approval'), MIG('prebuilt'), MIG('new-approval'), MIG('new-prebuilt'), MIG('batch-approval'), MIG('batch-run')], authorities: ['AIO-MIG-EXISTING-APPROVAL-001', 'AIO-MIG-EXISTING-PREBUILT-001', 'AIO-MIG-NEW-APPROVAL-001', 'AIO-MIG-NEW-PREBUILT-001', 'AIO-MIG-BATCH-APPROVAL-001', 'AIO-MIG-BATCH-RUN-001'], services: ['CLIENT_MIGRATION_INTAKE'], semantics: 'APPROVE MIGRATION creates a PREBUILT client office. PREBUILT is not ACTIVE.' });
node('AIO_OFFICE.INTAKE.ACTIVATION_INVITE', { label: 'Activation Invite', kind: 'SECTION', role: 'ENTRY', impl: PARTIAL_BACKED, founder: 'Activation authority (sending the activation invite); client confirmation stays the gate before ACTIVE', routes: [MIG('invite'), MIG('invited'), MIG('new-invite'), MIG('new-confirm')], authorities: ['AIO-MIG-EXISTING-INVITE-001', 'AIO-MIG-EXISTING-INVITED-001', 'AIO-MIG-NEW-INVITE-001', 'AIO-MIG-NEW-CONFIRM-001'], services: ['CLIENT_MIGRATION_INTAKE'], evidence: [`${SRC}/client-migration/services/activationInviteService.ts`] });
node('AIO_OFFICE.INTAKE.MIGRATION_HISTORY', {
  label: 'Migration History', kind: 'SECTION', role: 'ENTRY', impl: PARTIAL_READ, services: ['CLIENT_MIGRATION_INTAKE'],
  routes: [ex('/office/archive-migration', `${OR('283-285')} archive migration batches (same archiveMigrationBatches slice)`)],
  notes: 'Batches are listed today under ARCHIVE MIGRATION; a client-migration history view does not exist.',
});

/* ── WORK: the cross-service production hub ── */
node('AIO_OFFICE.WORK', {
  label: 'WORK', kind: 'ROOT_DESTINATION', role: 'PRODUCTION', impl: PARTIAL_DEMO,
  semantics: 'The central production workspace across ALL AIO service lines. Service lane navigation, cross-client filtering, client drill-down, active case access, status, blockers, deadlines, assignments where supported, and a route to the canonical client × workspace case. Replaces the old root FILING.',
  routes: [ex('/office/work', `${OR('199')} My Work (staff work items)`), ex('/office/services', `${OR('204')} universal service-request queue`), pr('/office/work/:lane', 'none — lane navigation inside WORK (next sprint)')],
  evidence: [`${SRC}/office-core/officeWorkTypes.ts:111 OfficeWorkItem`, `${SRC}/office/pages/OfficeWorkPages.tsx:260-326 OfficeServicesPage`],
  features: ['AIO.OFFICE_OPERATIONS'],
  notes: 'Lanes resolve to the Brain workspaces (office.ts AIO_WORKSPACES) through the client switcher; a case keeps its canonical identity PROJECT + CLIENT + WORKSPACE + CASE TYPE + SUBCONTEXT.',
});

const lane = (id: string, s: Omit<Spec, 'kind' | 'role'>) => node(`AIO_OFFICE.WORK.${id}`, { kind: 'SERVICE_LANE', role: 'PRODUCTION', ...s });
const section = (id: string, s: Omit<Spec, 'kind' | 'role'>) => node(`AIO_OFFICE.WORK.${id}`, { kind: 'LANE_SECTION', role: 'PRODUCTION', ...s });

lane('PERMITTING_AUTHORITIES', {
  label: 'Permitting & Authorities', impl: PARTIAL_GENERIC, services: ['PERMITTING_AUTHORITIES'],
  workspaces: ['TAGS_REGISTRATION', 'PERMITTING', 'COMPLIANCE', 'BUSINESS_FORMATION'],
  features: ['AIO.PERMITTING', 'AIO.TAGS_REGISTRATION', 'AIO.AUTHORITIES', 'AIO.BOC3', 'AIO.BUSINESS_FORMATION', 'AIO.ROAD_TAX'],
  routes: [ex('/office/permitting', `${OR('288')} DivisionQueuePage division="permitting"`), ex('/office/business-formation', `${OR('289')} (not in nav)`), ex('/office/business-name-review', OR('201')), ex('/office/requests/:requestId', `${OR('277')} OfficeRequestDetailPage`)],
  evidence: [`${SRC}/office/pages/DivisionOpsPages.tsx:14-31`, `${SRC}/demo/demoTypes.ts:378 ServiceRequest`],
  projection: 'CLIENT_OFFICE.OPERATIONS.PERMITTING_AUTHORITIES',
  notes: 'Generic service-request pipeline only: no permit / authority / tag / BOC-3 / formation case model. OfficeDivision "permitting_compliance" vs request division "permitting" drift.',
});
section('PERMITTING_AUTHORITIES.TAGS_REGISTRATION', { label: 'Tags / Registration', impl: PARTIAL_GENERIC, workspaces: ['TAGS_REGISTRATION'], features: ['AIO.TAGS_REGISTRATION'], services: ['PERMITTING_AUTHORITIES'], evidence: [`${SRC}/services/catalog/serviceCatalog.ts:299 irp`, `${SRC}/services/catalog/serviceCatalog.ts:420 tag-services (PREPARING)`] });
section('PERMITTING_AUTHORITIES.FUEL_ROAD_TAX_PERMITS', { label: 'Fuel / Road Tax Permits', impl: PARTIAL_GENERIC, workspaces: ['PERMITTING'], features: ['AIO.PERMITTING', 'AIO.ROAD_TAX'], services: ['PERMITTING_AUTHORITIES'], evidence: [`${SRC}/services/catalog/serviceCatalog.ts:572 trip-permits`], notes: 'ROAD_TAX as its own workspace is an open founder question (office.ts AIO_NOT_WORKSPACES).' });
section('PERMITTING_AUTHORITIES.OPERATING_AUTHORITIES', { label: 'Operating Authorities', impl: PARTIAL_GENERIC, workspaces: ['COMPLIANCE'], features: ['AIO.AUTHORITIES'], services: ['PERMITTING_AUTHORITIES'], evidence: [`${SRC}/services/catalog/serviceCatalog.ts:125 usdot`, `${SRC}/services/catalog/serviceCatalog.ts:150 operating authority`], notes: 'Lane ≠ workspace: authority work is entitled through the one COMPLIANCE workspace (AUTHORITY · BOC-3 · SAFETY), which stays unsplit (D-COMPLIANCE-ONE-LANE).' });
section('PERMITTING_AUTHORITIES.BOC3', { label: 'BOC-3', impl: NOT_STARTED, workspaces: ['COMPLIANCE'], features: ['AIO.BOC3'], services: ['PERMITTING_AUTHORITIES'], evidence: [`${SRC}/services/catalog/serviceCatalog.ts:200 boc-3-assistance (COMING_SOON)`] });
section('PERMITTING_AUTHORITIES.LLC_INC', { label: 'LLC / Inc', impl: PARTIAL_GENERIC, workspaces: ['BUSINESS_FORMATION'], features: ['AIO.BUSINESS_FORMATION'], services: ['PERMITTING_AUTHORITIES'], routes: [ex('/office/business-formation', OR('289')), ex('/office/business-name-review', OR('201'))], evidence: [`${SRC}/services/catalog/serviceCatalog.ts:8 llc`, `${SRC}/services/catalog/serviceCatalog.ts:33 corp`] });
section('PERMITTING_AUTHORITIES.OTHER_PERMITS', { label: 'Other Permits', impl: PARTIAL_GENERIC, workspaces: ['PERMITTING'], features: ['AIO.PERMITTING'], services: ['PERMITTING_AUTHORITIES'] });

lane('FILING_FUEL_TAXES', {
  label: 'Filing & Fuel Taxes', impl: PARTIAL_DEMO, services: ['IFTA_FUEL_TAX'], workspaces: ['IFTA'], features: ['AIO.IFTA', 'AIO.IFTA_REGISTRATION'],
  routes: [ex('/office/workspaces/ifta', `${OR('189-192')} IftaStaffShell (outside AIOOfficeLayout)`)],
  evidence: [`${SRC}/ifta/iftaActions.ts`, `${SRC}/ifta/iftaDerive.ts`],
  projection: 'CLIENT_OFFICE.OPERATIONS.FILING_IFTA',
  semantics: 'The old root FILING, rehomed. Filing production across clients; IFTA is its first canonical case family.',
  notes: 'Rehomed from the root FILING dock item (SUPERSEDED_BY_AIO_OFFICE_WORK_TREE1). Demo-store only (no IFTA tables); not reachable from either nav yet.',
});
section('FILING_FUEL_TAXES.IFTA', {
  label: 'IFTA', impl: PARTIAL_DEMO, workspaces: ['IFTA'], features: ['AIO.IFTA'], services: ['IFTA_FUEL_TAX'],
  routes: [ex('/office/workspaces/ifta', OR('189')), ex('/office/workspaces/ifta/:clientId/:quarterKey', `${OR('190-192')} IftaStaffCasePage`), hu('/office/clients/:clientId/ifta/:quarter', `${SRC}/utils/paths.ts:231-232 (no route)`)],
  authorities: ['AIO.OFFICE.WS.IFTA', 'AIO.IFTA.STAFF.QUEUE'],
  semantics: 'The approved IFTA case architecture, unchanged: canonical case AIO:{client}:IFTA:IFTA_QUARTER:{YYYY-Qn}. Only its office location moves (WORK → FILING & FUEL TAXES → IFTA).',
  notes: 'IFTA visual authorities and the IFTA page tree keep their node ids (AIO.OFFICE.WS.IFTA …); re-parenting the authority tree is MIGRATE_LATER and changes no case identity.',
});
section('FILING_FUEL_TAXES.FILING_QUEUE', { label: 'Filing Queue', impl: PARTIAL_DEMO, workspaces: ['IFTA'], services: ['IFTA_FUEL_TAX'], routes: [ex('/office/workspaces/ifta', `${OR('189-190')} IftaStaffQueuePage (cross-client FUEL TAX QUEUE)`)], evidence: [`${SRC}/ifta/ui/IftaStaffQueuePage.tsx:33-37`], authorities: ['AIO.IFTA.STAFF.QUEUE'] });
section('FILING_FUEL_TAXES.CLIENT_APPROVAL', { label: 'Client Approval', impl: PARTIAL_DEMO, workspaces: ['IFTA'], services: ['IFTA_FUEL_TAX'], evidence: [`${SRC}/ifta/iftaActions.ts:548 sendForApproval`, `${SRC}/ifta/iftaActions.ts:351 approveReturn (client)`] });
section('FILING_FUEL_TAXES.SUBMITTED_FILED', { label: 'Submitted / Filed', impl: PARTIAL_DEMO, workspaces: ['IFTA'], services: ['IFTA_FUEL_TAX'], evidence: [`${SRC}/ifta/iftaActions.ts:564 recordFiling`, `${SRC}/ifta/iftaActions.ts:591 recordPayment`] });
section('FILING_FUEL_TAXES.FILING_HISTORY', { label: 'Filing History', impl: PARTIAL_READ, workspaces: ['IFTA'], services: ['IFTA_FUEL_TAX'], evidence: [`${SRC}/ifta/iftaDerive.ts:64 FILED · ARCHIVED states`], notes: 'Quarters reach FILED / ARCHIVED in the case model; no cross-quarter history surface yet.' });

lane('COMPLIANCE', {
  label: 'Compliance', impl: PARTIAL_DEMO, services: ['COMPLIANCE'], workspaces: ['COMPLIANCE'], features: ['AIO.COMPLIANCE_SAFETY', 'AIO.RENEWALS'],
  routes: [ex('/office/deadlines', OR('279')), ex('/office/renewals', `${OR('286')} read-only`), ex('/office/documents', `${OR('280')} legacy expiring / expired queue`)],
  projection: 'CLIENT_OFFICE.OPERATIONS.COMPLIANCE',
  semantics: 'One canonical compliance lane: these functions share client, vehicle, driver, document, deadline and case context. Split only if operational volume proves a separate lane is needed (D-COMPLIANCE-ONE-LANE).',
  notes: 'Expiration / deadline / renewal tracking exists; DOT-safety audits, corrective work and compliance cases do not.',
});
section('COMPLIANCE.DOT_SAFETY', { label: 'DOT / Safety', impl: NOT_STARTED, workspaces: ['COMPLIANCE'], services: ['COMPLIANCE'], evidence: [`${SRC}/services/catalog/serviceCatalog.ts:661-759 (DOT, DQ file, audit, safety: PREPARING)`] });
section('COMPLIANCE.EXPIRATIONS', { label: 'Expirations', impl: PARTIAL_DEMO, workspaces: ['COMPLIANCE'], services: ['COMPLIANCE'], routes: [ex('/office/deadlines', OR('279')), ex('/office/renewals', OR('286'))], evidence: [`${SRC}/layouts/AIOPortalLayout.tsx:34-37 runExpirationEvaluation`] });
section('COMPLIANCE.AUDIT_CORRECTIVE_WORK', { label: 'Audit / Corrective Work', impl: NOT_STARTED, workspaces: ['COMPLIANCE'], services: ['COMPLIANCE'], notes: 'No audit / corrective-action type or route (grep complianceCase|corrective → none).' });
section('COMPLIANCE.COMPLIANCE_CASES', { label: 'Compliance Cases', impl: NOT_STARTED, workspaces: ['COMPLIANCE'], services: ['COMPLIANCE'] });

lane('VEHICLES_FLEET', {
  label: 'Vehicles & Fleet', impl: NOT_STARTED, services: ['VEHICLE_MANAGEMENT'],
  semantics: 'The operational vehicle backbone (D-VEHICLES-FLEET-LANE): the vehicle record and a vehicle-centred view of everything about it. Owns the roster, profiles and availability; shows registration, documents, driver, insurance, IFTA, compliance and maintenance state by cross-link to the lane that owns each (AIO_VEHICLES_FLEET_SCOPE) — never a second copy.',
  evidence: [`${SRC}/office/pages/ClientDetailPage.tsx:184-186 (Client 360 fleet tab: placeholder text)`, `${SRC}/road-ready/roadReadyTypes.ts:113 PowerUnit`, `${SRC}/road-ready/roadReadyTypes.ts:129 Trailer`],
  projection: 'CLIENT_OFFICE.OPERATIONS.VEHICLE_MANAGEMENT',
  notes: 'Not a workspace (the fleet registry is a shared capability, office.ts AIO_NOT_WORKSPACES). No staff fleet surface exists yet; vehicle data lives in the Road Ready profile and the demo store (Supabase aio_fleet_vehicles is written by migration approve only).',
});

lane('DISPATCH', {
  label: 'Dispatch', impl: PARTIAL_DEMO, services: ['DISPATCH'], workspaces: ['DISPATCH'], features: ['AIO.DISPATCH_OPERATIONS', 'AIO.LOAD_BOARD'],
  routes: [ex('/office/dispatch', `${OR('298-304')} command center · loads · new load · load detail · clients · client detail · brokers`)],
  evidence: [`${SRC}/office/pages/DispatchPages.tsx:23`, `${SRC}/dispatch/dispatchTypes.ts:130 TruckDispatchProfile`],
  projection: 'CLIENT_OFFICE.OPERATIONS.DISPATCH',
  notes: 'activateDispatchEnrollment (dispatchActions.ts:142) has no UI; freight is partly Supabase-backed.',
});
section('DISPATCH.ACTIVE_CLIENTS', { label: 'Active Clients', impl: PARTIAL_DEMO, workspaces: ['DISPATCH'], services: ['DISPATCH'], routes: [ex('/office/dispatch/clients', OR('298-304'))] });
section('DISPATCH.TRUCKS', { label: 'Trucks', impl: PARTIAL_READ, workspaces: ['DISPATCH'], services: ['DISPATCH', 'VEHICLE_MANAGEMENT'], evidence: [`${SRC}/office/pages/DispatchPages.tsx:23 store.truckProfiles`], notes: 'Trucks appear inside the board; no trucks view.' });
section('DISPATCH.LOADS', { label: 'Loads', impl: PARTIAL_DEMO, workspaces: ['DISPATCH'], services: ['DISPATCH'], routes: [ex('/office/dispatch/loads', OR('298-304'))] });
section('DISPATCH.STATUS_EXCEPTIONS', { label: 'Status / Exceptions', impl: PARTIAL_READ, workspaces: ['DISPATCH'], services: ['DISPATCH'], evidence: [`${SRC}/office/pages/DispatchLoadDetailPage.tsx:25-32,126 FreightAutopilotPanel`], notes: 'Exceptions only inside load detail; no exceptions queue.' });
section('DISPATCH.MY_LOADS_MY_TRUCKS', { label: 'My Loads / My Trucks', impl: NOT_STARTED, workspaces: ['DISPATCH'], services: ['DISPATCH'], notes: 'No dispatcher-assigned view in the office. The client load board has my-loads / fleet (AioCoreRoutes.tsx:325-326).' });

lane('BROKERAGE', {
  label: 'Brokerage', impl: PARTIAL_BACKED, services: ['BROKERAGE'], workspaces: ['BROKERAGE'], features: ['AIO.BROKERAGE', 'AIO.LOAD_BOARD'],
  routes: [ex('/office/brokerage', `${OR('324-335')} command center · readiness · requests · shippers · loads · coverage · carriers · finance`)],
  evidence: [`${SRC}/brokerage/brokerageWorkflow.ts`, `${SRC}/freight/supabaseFreightRepository.ts`, `${SRC}/infrastructure/serviceActivation.ts:29 PAUSED`],
  projection: 'CLIENT_OFFICE.OPERATIONS.BROKERAGE',
  notes: 'The most Supabase-wired domain; the business line is PAUSED.',
});
section('BROKERAGE.QUOTES', { label: 'Quotes', impl: PARTIAL_BACKED, workspaces: ['BROKERAGE'], services: ['BROKERAGE'], evidence: [`${SRC}/office/pages/BrokerageRequestPages.tsx:9-19 createQuoteFromRequest · sendBrokerageQuoteWorkflow`] });
section('BROKERAGE.SHIPMENTS', { label: 'Shipments', impl: PARTIAL_DEMO, workspaces: ['BROKERAGE'], services: ['BROKERAGE'], routes: [hu('/office/brokerage/shipments/:id', `${SRC}/utils/paths.ts:243 (dead link from DivisionOpsPages.tsx:52)`)] });
section('BROKERAGE.CARRIER_OFFERS', { label: 'Carrier Offers', impl: PARTIAL_DEMO, workspaces: ['BROKERAGE'], services: ['BROKERAGE', 'DRIVERS_CARRIERS'], routes: [ex('/office/brokerage/carriers', OR('333-334'))] });
section('BROKERAGE.STOPS_STATUS', { label: 'Stops / Status', impl: PARTIAL_BACKED, workspaces: ['BROKERAGE'], services: ['BROKERAGE'], evidence: ['all-in-one-enterprises/supabase/migrations/20260815160000 (aio_load_stops · aio_load_status_history)'] });
section('BROKERAGE.LOAD_FINANCIALS', { label: 'Load Financials', impl: PARTIAL_DEMO, workspaces: ['BROKERAGE'], services: ['BROKERAGE'], routes: [ex('/office/brokerage/finance', OR('335'))], byGrant: true, gate: 'brokerage_finance.read (ROLE_PERMISSIONS)', notes: 'Internal margin / carrier pay — staff only (firewall), and only with a brokerage finance grant (internal financial visibility is founder-class).' });

lane('INSURANCE', {
  label: 'Insurance', impl: PARTIAL_DEMO, services: ['INSURANCE'], workspaces: ['INSURANCE'], features: ['AIO.INSURANCE'],
  routes: [ex('/office/insurance', `${OR('290-297')} command center · requests · policies · partners · certificates · renewals · readiness`)],
  evidence: [`${SRC}/demo/insuranceActions.ts`], projection: 'CLIENT_OFFICE.FINANCES.INSURANCE',
  notes: 'Referral model; Supabase aio_insurance_* tables exist but are not queried. Launch PARTNER_PENDING.',
});
section('INSURANCE.INTAKE', { label: 'Intake', impl: PARTIAL_DEMO, workspaces: ['INSURANCE'], services: ['INSURANCE'], evidence: [`${SRC}/demo/insuranceActions.ts:82 submit`], notes: 'Insurance intake (a service request), unrelated to the INTAKE root destination.' });
section('INSURANCE.QUOTES', { label: 'Quotes', impl: PARTIAL_DEMO, workspaces: ['INSURANCE'], services: ['INSURANCE'], evidence: [`${SRC}/office/pages/InsurancePages.tsx:106 recordInsuranceQuote`] });
section('INSURANCE.POLICIES', { label: 'Policies', impl: PARTIAL_DEMO, workspaces: ['INSURANCE'], services: ['INSURANCE'], evidence: [`${SRC}/office/pages/InsurancePages.tsx:148 activatePolicyFromEvidence`] });
section('INSURANCE.RENEWALS', { label: 'Renewals', impl: PARTIAL_DEMO, workspaces: ['INSURANCE'], services: ['INSURANCE'], routes: [ex('/office/insurance/renewals', OR('290-297'))] });

lane('FACTORING', {
  label: 'Factoring', impl: PARTIAL_DEMO, services: ['FACTORING'], workspaces: ['FACTORING'], features: ['AIO.FACTORING'],
  routes: [ex('/office/factoring', `${OR('305-310')} command center · submissions · clients · providers`)],
  evidence: [`${SRC}/factoring/factoringRules.ts`, `${SRC}/demo/factoringActions.ts`], projection: 'CLIENT_OFFICE.FINANCES.FACTORING',
  notes: 'No real provider integration; Client 360 and portal disagree on "active" (active vs active|approved).',
});

lane('BOOKKEEPING', {
  label: 'Bookkeeping', impl: PARTIAL_READ, services: ['BOOKKEEPING'], workspaces: ['BOOKKEEPING'], features: ['AIO.BOOKKEEPING'],
  routes: [ex('/office/bookkeeping', `${OR('311-315')} command center · autopilot · subscriptions · books rescue · leads`)],
  evidence: [`${SRC}/office/pages/BookkeepingAutopilotPage.tsx:32-113 (dashboards, no handlers)`], projection: 'CLIENT_OFFICE.FINANCES.BOOKKEEPING',
});
section('BOOKKEEPING.MONTHLY_CLIENTS', { label: 'Monthly Clients', impl: PARTIAL_READ, workspaces: ['BOOKKEEPING'], services: ['BOOKKEEPING'], evidence: [`${SRC}/bookkeeping/bookkeepingTypes.ts:5 BookkeepingBillingInterval MONTHLY`] });
section('BOOKKEEPING.ANNUAL_CLIENTS', { label: 'Annual Clients', impl: PARTIAL_READ, workspaces: ['BOOKKEEPING'], services: ['BOOKKEEPING'], evidence: [`${SRC}/bookkeeping/bookkeepingTypes.ts:5 BookkeepingBillingInterval ANNUAL`] });
section('BOOKKEEPING.RECONCILIATION', { label: 'Reconciliation', impl: NOT_STARTED, workspaces: ['BOOKKEEPING'], services: ['BOOKKEEPING'] });
section('BOOKKEEPING.DELIVERABLES', { label: 'Deliverables', impl: NOT_STARTED, workspaces: ['BOOKKEEPING'], services: ['BOOKKEEPING'] });

lane('DRIVERS_CARRIERS', {
  label: 'Drivers & Carriers', impl: PARTIAL_READ, services: ['DRIVERS_CARRIERS'], workspaces: ['DRIVERLINK'], features: ['AIO.DRIVERLINK'],
  routes: [ex('/office/driverlink', `${OR('320-323')} overview · drivers · jobs · applications (read-only)`), ex('/office/brokerage/carriers', OR('333-334'))],
  evidence: [`${SRC}/pages/office/DriverLinkOfficePages.tsx:7-76`], projection: 'CLIENT_OFFICE.OPERATIONS.DRIVER_MANAGEMENT',
});
section('DRIVERS_CARRIERS.MATCHING', { label: 'Matching', impl: PARTIAL_READ, workspaces: ['DRIVERLINK'], services: ['DRIVERS_CARRIERS'], evidence: [`${SRC}/driverlink/matchingService.ts:56 computeMatch`, `${SRC}/driverlink/matchingService.ts:101 matchDriversToOpportunity`] });
section('DRIVERS_CARRIERS.CREDENTIALS', { label: 'Credentials', impl: NOT_STARTED, workspaces: ['DRIVERLINK'], services: ['DRIVERS_CARRIERS'], evidence: [`${SRC}/pages/office/DriverLinkOfficePages.tsx:15 (counts pending; no review action)`] });
section('DRIVERS_CARRIERS.APPROVALS', { label: 'Approvals', impl: NOT_STARTED, workspaces: ['DRIVERLINK'], services: ['DRIVERS_CARRIERS'] });

lane('MECHANIC_MAINTENANCE', {
  label: 'Mechanic / Maintenance', impl: PARTIAL_READ, services: ['MECHANIC_MAINTENANCE'], workspaces: ['FLEETCARE'], features: ['AIO.FLEETCARE'],
  routes: [ex('/office/fleetcare', `${OR('316-319')} overview · tickets · providers · referrals (read-only)`)],
  evidence: [`${SRC}/pages/office/FleetCareOfficePages.tsx:7-122`], projection: 'CLIENT_OFFICE.OPERATIONS.MAINTENANCE',
});
section('MECHANIC_MAINTENANCE.TICKETS', { label: 'Tickets', impl: PARTIAL_READ, workspaces: ['FLEETCARE'], services: ['MECHANIC_MAINTENANCE'] });
section('MECHANIC_MAINTENANCE.REFERRALS', { label: 'Referrals', impl: PARTIAL_READ, workspaces: ['FLEETCARE'], services: ['MECHANIC_MAINTENANCE'], evidence: [`${SRC}/fleetcare/referralService.ts:43 calculateReferralFee`] });
section('MECHANIC_MAINTENANCE.PROVIDERS', { label: 'Providers', impl: PARTIAL_READ, workspaces: ['FLEETCARE'], services: ['MECHANIC_MAINTENANCE'], notes: 'Provider production (matching, acceptance) here; the provider directory as an admin list is MORE → MECHANIC NETWORK.' });
section('MECHANIC_MAINTENANCE.MAINTENANCE_STATUS', { label: 'Maintenance Status', impl: PARTIAL_READ, workspaces: ['FLEETCARE'], services: ['MECHANIC_MAINTENANCE', 'VEHICLE_MANAGEMENT'], notes: 'Ticket status only; no per-vehicle maintenance view for staff.' });

lane('ROAD_READY', {
  label: 'Road Ready', impl: PARTIAL_DEMO, services: ['ROAD_READY'], features: ['AIO.ROAD_READY'],
  routes: [ex('/office/road-ready', `${OR('275')} OfficeRoadReadyQueuePage`), ex('/office/clients/:clientId/road-ready', `${OR('272')} ClientRoadReadyReviewPage`)],
  evidence: [`${SRC}/road-ready/useRoadReady.ts`, `${SRC}/demo/roadReadyActions.ts`],
  notes: 'Not a workspace (office.ts AIO_NOT_WORKSPACES ROAD_READY: universal readiness layer). Client destination unresolved (C-CLIENT-ROAD-READY).',
});

/* ── REPORTS: oversight, history, analytics, exports ── */
node('AIO_OFFICE.REPORTS', {
  label: 'REPORTS', kind: 'ROOT_DESTINATION', role: 'OVERSIGHT', impl: PARTIAL_DEMO,
  semantics: 'Internal oversight + history + exports: what happened, how work is performing, what can be reviewed / exported. Aggregates WORK and INTAKE; never replaces active production.',
  routes: [ex('/office/reports', `${OR('262')} Reporting Center`), ex('/office/management', `${OR('245-257')} KPI command centers`)],
  aggregates: ['AIO_OFFICE.WORK', 'AIO_OFFICE.INTAKE'], byGrant: true,
  gate: `reports.read · management.*.read (ROLE_PERMISSIONS; ${SRC}/office/pages/ManagementPages.tsx:643 ManagementGate)`,
  founder: 'Reporting (founder-class; staff only by grant)',
});
const report = (id: string, s: Omit<Spec, 'kind' | 'role'>) => node(`AIO_OFFICE.REPORTS.${id}`, { kind: 'REPORT_DOMAIN', role: 'OVERSIGHT', byGrant: true, ...s });
const MGMT = (sub: string) => ex(`/office/management/${sub}`, OR('245-257'));
report('OVERVIEW', { label: 'Overview', impl: PARTIAL_DEMO, data: 'PARTIAL_DATA', routes: [ex('/office/management', OR('245'))], aggregates: ['AIO_OFFICE.WORK', 'AIO_OFFICE.INTAKE'] });
report('CLIENTS', { label: 'Clients', impl: PARTIAL_DEMO, data: 'PARTIAL_DATA', routes: [MGMT('customers')], aggregates: ['AIO_OFFICE.MORE.CLIENTS', 'AIO_OFFICE.INTAKE'], notes: 'Active-client counts must use the founder ACTIVE rule (PREBUILT not counted).' });
report('SERVICES', { label: 'Services', impl: PARTIAL_DEMO, data: 'PARTIAL_DATA', routes: [MGMT('services')], aggregates: LANES });
report('FINANCIAL_REVENUE', { label: 'Financial / Revenue', impl: PARTIAL_DEMO, data: 'PARTIAL_DATA', routes: [MGMT('financial')], aggregates: ['AIO_OFFICE.MORE.BILLING', 'AIO_OFFICE.WORK.BROKERAGE.LOAD_FINANCIALS', 'AIO_OFFICE.WORK.FACTORING', 'AIO_OFFICE.WORK.BOOKKEEPING'], gate: `management.financial.read (${SRC}/office/pages/ManagementPages.tsx:98,158,199 ManagementGate)`, founder: 'Internal financial visibility', notes: 'Aggregates billing for oversight; owns no invoice or payment production (MORE → BILLING, D-GROWTH-BILLING).' });
report('FILING_HISTORY', { label: 'Filing History', impl: NOT_STARTED, data: 'NOT_YET_IMPLEMENTED', aggregates: ['AIO_OFFICE.WORK.FILING_FUEL_TAXES'], notes: 'No filing reports; only a per-case IFTA CSV export (IftaStaffCasePage.tsx:130).' });
report('COMPLIANCE', { label: 'Compliance', impl: PARTIAL_DEMO, data: 'PARTIAL_DATA', routes: [MGMT('deadlines')], aggregates: ['AIO_OFFICE.WORK.COMPLIANCE'] });
report('DISPATCH_BROKERAGE', { label: 'Dispatch / Brokerage', impl: PARTIAL_DEMO, data: 'PARTIAL_DATA', routes: [MGMT('dispatch'), MGMT('brokerage')], aggregates: ['AIO_OFFICE.WORK.DISPATCH', 'AIO_OFFICE.WORK.BROKERAGE'] });
report('BOOKKEEPING', { label: 'Bookkeeping', impl: NOT_STARTED, data: 'NOT_YET_IMPLEMENTED', aggregates: ['AIO_OFFICE.WORK.BOOKKEEPING'], notes: 'No management view for bookkeeping (management subpages cover financial, sales, services, customers, dispatch, brokerage, factoring, insurance, communications, team, deadlines, data quality).' });
report('MIGRATION', { label: 'Migration', impl: PARTIAL_DEMO, data: 'PARTIAL_DATA', aggregates: ['AIO_OFFICE.INTAKE'], evidence: [`${SRC}/client-migration/activeClientMetrics.ts:11`, OR('283-285')] });
report('EXPORTS', { label: 'Exports', impl: NOT_STARTED, data: 'NOT_YET_IMPLEMENTED', notes: 'No report export surface; the only export is the per-case IFTA CSV.' });

/* ── MORE: secondary directory / admin ── */
node('AIO_OFFICE.MORE', {
  label: 'MORE', kind: 'ROOT_DESTINATION', role: 'SECONDARY', impl: NOT_STARTED,
  semantics: 'Secondary directory, administration and lower-frequency tools. Never the home of core service production.',
  routes: [pr('/office/more', 'none — the old dock MORE pointed at /office (AioMigrationKit.tsx:249)')],
  notes: 'The MORE directory surface does not exist; its entries exist as separate routes.',
});
const more = (id: string, s: Omit<Spec, 'kind' | 'role'>) => node(`AIO_OFFICE.MORE.${id}`, { kind: 'DIRECTORY_ENTRY', role: 'SECONDARY', ...s });
more('CLIENTS', { label: 'Clients', impl: PARTIAL_DEMO, routes: [ex('/office/clients', OR('271')), ex('/office/clients/:clientId', `${OR('274')} Client 360`)], evidence: [`${SRC}/office/pages/ClientsListPage.tsx:13`], notes: 'Directory + Client 360 (client overview: every workspace for one client).' });
more('DOCUMENTS_VAULT', { label: 'Documents & Vault', impl: PARTIAL_DEMO, routes: [ex('/office/documents/vault', OR('281-282')), ex('/office/clients/:clientId/documents', OR('273')), ex('/office/documents/review', OR('205'))], evidence: [`${SRC}/vault/vaultStorage.ts:26-31 (backend storage not configured)`] });
more('GROWTH_CRM', {
  label: 'Growth / CRM', impl: PARTIAL_DEMO, byGrant: true,
  semantics: 'Internal growth and sales: leads to clients. Not client-service production, so not in WORK (D-GROWTH-BILLING). HOME may project new leads, follow-ups due, conversions and opportunities needing attention; HOME owns no CRM state.',
  routes: [ex('/office/crm', OR('263')), ex('/office/crm/leads', OR('264')), ex('/office/crm/leads/:leadId', OR('265')), ex('/office/crm/pipeline', OR('266')), ex('/office/crm/opportunities/:opportunityId', OR('267')), ex('/office/crm/calendar', OR('268')), ex('/office/crm/reports', OR('269')), ex('/office/settings/crm', OR('270'))],
  evidence: [`${SRC}/office/pages/CrmPages.tsx`, `${SRC}/office-core/officeContext.ts:58 CRM_FULL permissions`],
  gate: 'crm.* (ROLE_PERMISSIONS CRM_FULL / CRM_SALES)',
  potential: ['Leads', 'Prospects', 'Pipeline', 'Follow-ups', 'Referrals', 'Sales Activity', 'Service Opportunities'],
  notes: 'Root-nav status is reconsidered only from usage data.',
});
more('BILLING', {
  label: 'Billing', impl: PARTIAL_DEMO, byGrant: true,
  semantics: 'Billing operations: what clients are charged and what they paid. REPORTS → FINANCIAL / REVENUE aggregates it for oversight but owns no invoice or payment production (D-GROWTH-BILLING).',
  routes: [ex('/office/billing', OR('339')), ex('/office/invoices', OR('336')), ex('/office/invoices/:invoiceId', OR('337')), ex('/office/payments', OR('338')), ex('/office/quotes', OR('340')), ex('/office/quotes/:quoteId', OR('341'))],
  evidence: [`${SRC}/office/pages/BillingPages.tsx`, `${SRC}/office/pages/ClientDetailPage.tsx:177 billing tab gated by billing.read`],
  gate: 'billing.read · billing.manage (ROLE_PERMISSIONS)',
  projection: 'CLIENT_OFFICE.FINANCES.FEES_PAYMENTS',
  potential: ['Client Billing', 'Invoices', 'Payments', 'Balances', 'Service Charges', 'Subscriptions / Recurring Services', 'Credits / Adjustments'],
  notes: 'Clients see only client-safe billing in FINANCES → FEES / PAYMENTS — never internal margin, commission, profitability or staff-only financial data. Quotes sit here until the MORE authority contract places them.',
});
more('TEAM_STAFF', { label: 'Team & Staff', impl: PARTIAL_READ, routes: [ex('/office/team', OR('343')), ex('/office/workload', OR('207'))], gate: 'workload.read · team.manage (ROLE_PERMISSIONS)', founder: 'Staff / permission administration (roles and grants)' });
more('SERVICE_CATALOG', { label: 'Service Catalog', impl: PARTIAL_READ, founder: 'Service configuration (activation, pricing)', routes: [ex('/office/management/launch/services', `${OR('259')} Service Activation Center`), ex('/office/settings/pricing', OR('342'))], evidence: [`${SRC}/services/catalog/serviceCatalog.ts`, `${SRC}/launch/serviceActivationLaunch.ts:8-223`] });
more('MECHANIC_NETWORK', { label: 'Mechanic Network', impl: PARTIAL_READ, routes: [ex('/office/fleetcare/providers', OR('316-319'))], notes: 'Provider directory / network administration. Ticket production stays in WORK → MECHANIC / MAINTENANCE.' });
more('MESSAGES', { label: 'Messages', impl: PARTIAL_DEMO, routes: [ex('/office/communications', OR('217-219')), ex('/office/appointments', OR('220-221'))], evidence: [`${SRC}/communications`], notes: 'Two message models (comm* and legacy messages); backend not started.' });
more('SYSTEM_SETTINGS', { label: 'System Settings', impl: PARTIAL_DEMO, byGrant: true, founder: 'System configuration', routes: [ex('/office/settings/*', OR('210-230')), ex('/office/security', OR('231-234')), ex('/office/system/*', OR('235-242'))], gate: 'canStaffAccessSystemAdmin (auth/routeAccess.ts:63-65) where enforced' });
more('HELP_SUPPORT', { label: 'Help & Support', impl: PARTIAL_READ, routes: [ex('/office/training', OR('260')), ex('/office/training/sops', OR('261'))] });
more('ACCOUNT', { label: 'Account', impl: NOT_STARTED, evidence: [`${SRC}/office/layouts/AIOOfficeLayout.tsx:181-189 (demo staff selector only)`], notes: 'No staff account / profile page.' });

/* ════════════════════════════════ CLIENT OFFICE ════════════════════════════════ */

node('CLIENT_OFFICE', {
  label: 'CLIENT OFFICE', kind: 'SHELL', role: 'LANDING', impl: PARTIAL_DEMO,
  semantics: 'The authenticated client environment: one fixed client (the signed-in organisation) and that client’s applicable workspaces. No client switcher; never INTAKE.',
  routes: [ex('/portal', `${CR('275')} AIOPortalLayout`)], features: ['AIO.CLIENT_OFFICE'],
});
const HUB_ROOTS = ['CLIENT_OFFICE.MY_BUSINESS', 'CLIENT_OFFICE.OPERATIONS', 'CLIENT_OFFICE.FINANCES', 'CLIENT_OFFICE.VAULT', 'CLIENT_OFFICE.INBOX', 'CLIENT_OFFICE.SERVICES', 'CLIENT_OFFICE.ACCOUNT'];
node('CLIENT_OFFICE.HUB', {
  label: 'Hub / Overview', kind: 'LANDING', role: 'PROJECTION', impl: PARTIAL_DEMO, client: 'ALWAYS',
  semantics: 'The shell-level landing of CLIENT OFFICE: the client enters here. Projection and orientation across the seven destinations, which are the actual workspaces. Not a persistent root-nav tab (D-CLIENT-HUB).',
  routes: [ex('/portal', `${SRC}/pages/PortalPage.tsx:20`)], features: ['AIO.MY_OFFICE', 'AIO.CLIENT_OFFICE_HUB'],
  projects: HUB_ROOTS,
  notes: 'Today’s MY OFFICE command center. Added to the root nav only if future UX testing proves it necessary. MY BUSINESS stays a root destination and is not the dashboard.',
});
const hub = (id: string, s: Omit<Spec, 'kind' | 'role' | 'impl'> & { impl?: Impl }) => node(`CLIENT_OFFICE.HUB.${id}`, { kind: 'REGION', role: 'PROJECTION', impl: PARTIAL_DEMO, client: 'ALWAYS', ...s });
const PP = (l: string) => `${SRC}/pages/PortalPage.tsx:${l}`;
const CCS = (l: string) => `${SRC}/portal/clientCommandCenterService.ts:${l}`;
hub('BUSINESS_STATUS', { label: 'Business Status', projects: ['CLIENT_OFFICE.MY_BUSINESS'], evidence: [`${CCS('693')} businessStatus`, `${PP('56')} BusinessHealthGrid`] });
hub('WORK_IN_PROGRESS', { label: 'Work in Progress', projects: ['CLIENT_OFFICE.OPERATIONS', 'CLIENT_OFFICE.FINANCES'], evidence: [`${PP('54')} ActiveJourneysPanel`, `${PP('57')} CurrentLoadHero`] });
hub('ITEMS_NEEDING_APPROVAL', { label: 'Items Needing Approval', projects: ['CLIENT_OFFICE.INBOX.APPROVALS_NEEDED'], evidence: [`${PP('50')} AttentionCenter`], notes: 'Attention items mix every kind of action; there is no approvals-only view yet.' });
hub('UPCOMING_DEADLINES', { label: 'Upcoming Deadlines', projects: ['CLIENT_OFFICE.OPERATIONS.COMPLIANCE', 'CLIENT_OFFICE.OPERATIONS.FILING_IFTA'], evidence: [`${PP('85')} UpcomingList`] });
hub('RECENT_MESSAGES', { label: 'Recent Messages', projects: ['CLIENT_OFFICE.INBOX.MESSAGES_FROM_AIO'], evidence: [`${PP('47')} NotificationDigest (unread counts only)`] });
hub('ACTIVE_SERVICES', { label: 'Active Services', projects: ['CLIENT_OFFICE.SERVICES.ACTIVE_SERVICES'], evidence: [`${CCS('707')} activeServices (heuristic)`], notes: 'Reads the heuristic builder today; the canonical workspace resolver replaces it.' });
hub('RECENT_DOCUMENTS', { label: 'Recent Documents', projects: ['CLIENT_OFFICE.VAULT.CURRENT_DOCUMENTS'], evidence: [`${PP('88')} Documents panel`] });
hub('CONTEXTUAL_NEXT_ACTION', { label: 'Contextual Next Action', projects: ['CLIENT_OFFICE.INBOX.REQUESTS', 'CLIENT_OFFICE.INBOX.APPROVALS_NEEDED', 'CLIENT_OFFICE.SERVICES.RECOMMENDED_CONTEXTUAL'], evidence: [`${PP('48')} NextActionHero`, `${CCS('626')} selectNextAction`], notes: 'A service suggestion appears only under the expansion rules (suppressed while urgent work is open).' });
node('CLIENT_OFFICE.ACTIVATION', {
  label: 'Client Activation', kind: 'GATE', role: 'GATE', impl: PARTIAL_BACKED, client: 'STATE', shownWhen: 'Lifecycle INVITED or CLIENT_CONFIRMATION_REQUIRED',
  semantics: 'Confirmation before ACTIVE: the invited client sets a password, reviews what AIO knows and confirms. Shown only while INVITED / CLIENT_CONFIRMATION_REQUIRED. PREBUILT is not ACTIVE; client confirmation remains the gate.',
  routes: [ex('/office-activation/:token', `${CR('257')} OfficeActivationPage (public layout)`), ex('/portal/activation/review', `${CR('272')} ClientOfficeReviewPage (no staff nav)`)],
  authorities: ['AIO-MIG-ACTIVATION-WELCOME-001', 'AIO-MIG-ACTIVATION-COMPANY-001', 'AIO-MIG-ACTIVATION-PEOPLE-001', 'AIO-MIG-ACTIVATION-VEHICLES-001', 'AIO-MIG-ACTIVATION-SERVICES-001', 'AIO-MIG-ACTIVATION-DOCUMENTS-001', 'AIO-MIG-ACTIVATION-CHANGED-001', 'AIO-MIG-ACTIVATION-CONFIRM-001', 'AIO-MIG-ACTIVATION-COMPLETE-002'],
  features: ['AIO.CLIENT_ACTIVATION', 'AIO.CLIENT_OFFICE_ACTIVATION', 'AIO.EXISTING_CLIENT_WELCOME', 'AIO.WHAT_CHANGED'],
  evidence: [`${SRC}/auth/guards/ClientPortalLifecycleGuard.tsx:22-40`],
  notes: 'The arrival plate COMPLETE-002 is FOUNDER_REVIEW_REQUIRED; COMPLETE-001 is its superseded draft (lineage only, not associated).',
});

const dest = (id: string, s: Omit<Spec, 'kind'>) => node(`CLIENT_OFFICE.${id}`, { kind: 'ROOT_DESTINATION', ...s });
const csec = (id: string, s: Omit<Spec, 'kind'>) => node(`CLIENT_OFFICE.${id}`, { kind: 'SECTION', ...s });

dest('MY_BUSINESS', { label: 'MY BUSINESS', role: 'CLIENT_RECORD', impl: PARTIAL_DEMO, client: 'ALWAYS', semantics: 'The client’s company record and business identity — a destination, not the client dashboard (the HUB orients).', routes: [ex('/portal/business', CR('277')), ex('/portal/business/summary', CR('278'))] });
csec('MY_BUSINESS.COMPANY_PROFILE', { label: 'Company Profile', role: 'CLIENT_RECORD', impl: PARTIAL_DEMO, client: 'ALWAYS', routes: [ex('/portal/business', CR('277'))] });
csec('MY_BUSINESS.OWNERS_CONTACTS', { label: 'Owners / Contacts', role: 'CLIENT_RECORD', impl: PARTIAL_READ, client: 'ALWAYS', routes: [ex('/portal/business/summary', CR('278'))], notes: 'Reviewed during activation (PEOPLE); no dedicated page.' });
csec('MY_BUSINESS.DRIVERS', { label: 'Drivers', role: 'CLIENT_RECORD', impl: PARTIAL_READ, client: 'APPLICABILITY', services: ['DRIVERS_CARRIERS'], evidence: [`${SRC}/road-ready/roadReadyTypes.ts:141 DriverPlaceholder`], notes: 'Captured in Road Ready onboarding; no driver record page. Carriers only.' });
csec('MY_BUSINESS.VEHICLES', { label: 'Vehicles', role: 'CLIENT_RECORD', impl: PARTIAL_READ, client: 'APPLICABILITY', services: ['VEHICLE_MANAGEMENT'], routes: [ex('/portal/fleet', CR('302')), ex('/portal/fleet/vehicles/:vehicleId', CR('303'))], notes: 'Carriers only (a shipper has no trucks).' });
csec('MY_BUSINESS.AUTHORITIES_REGISTRATIONS', { label: 'Authorities / Registrations', role: 'CLIENT_RECORD', impl: PARTIAL_READ, client: 'APPLICABILITY', services: ['PERMITTING_AUTHORITIES'], routes: [ex('/portal/road-ready', CR('301')), ex('/portal/renewals', CR('307'))] });
csec('MY_BUSINESS.BUSINESS_DETAILS', { label: 'Business Details', role: 'CLIENT_RECORD', impl: PARTIAL_READ, client: 'ALWAYS', routes: [ex('/portal/business/summary', CR('278'))] });

dest('OPERATIONS', { label: 'OPERATIONS', role: 'CLIENT_WORKSPACE', impl: PARTIAL_DEMO, client: 'ENTITLEMENT', semantics: 'Operational service workspaces that are active or relevant for this client.', routes: [ex('/portal/operations', CR('279'))] });
csec('OPERATIONS.COMPLIANCE', { label: 'Compliance', role: 'CLIENT_WORKSPACE', impl: PARTIAL_DEMO, client: 'ENTITLEMENT', workspaces: ['COMPLIANCE'], services: ['COMPLIANCE'], routes: [ex('/portal/calendar', CR('306')), ex('/portal/renewals', CR('307'))], notes: 'Client-safe subsections only; internal audits, corrective work and compliance cases stay in AIO OFFICE.' });
csec('OPERATIONS.PERMITTING_AUTHORITIES', { label: 'Permitting / Authorities', role: 'CLIENT_WORKSPACE', impl: PARTIAL_GENERIC, client: 'ENTITLEMENT', workspaces: ['PERMITTING', 'TAGS_REGISTRATION', 'COMPLIANCE', 'BUSINESS_FORMATION'], services: ['PERMITTING_AUTHORITIES'], routes: [ex('/portal/requests', CR('295')), ex('/portal/services/:serviceRequestId', CR('358')), ex('/portal/roadmap', CR('359'))], notes: 'No /portal/permitting; generic request tracking.' });
csec('OPERATIONS.FILING_IFTA', { label: 'Filing / IFTA', role: 'CLIENT_WORKSPACE', impl: PARTIAL_DEMO, client: 'ENTITLEMENT', workspaces: ['IFTA'], services: ['IFTA_FUEL_TAX'], features: ['AIO.IFTA'], routes: [ex('/portal/workspaces/ifta', `${CR('268-271')} IftaClientShell + IftaClientFilingRoomPage`)], authorities: ['AIO.CLIENT_OFFICE.WS.IFTA'], notes: 'The approved IFTA filing room, unchanged; NOT ACTIVE YET expansion state when AVAILABLE_NOT_ACTIVATED; hidden when NOT_APPLICABLE.' });
csec('OPERATIONS.DISPATCH', { label: 'Dispatch', role: 'CLIENT_WORKSPACE', impl: PARTIAL_DEMO, client: 'ENTITLEMENT', workspaces: ['DISPATCH'], services: ['DISPATCH'], routes: [ex('/portal/dispatch', CR('316-320')), ex('/portal/load-board', CR('321-329'))], notes: '"Message Dispatcher" links to the staff route /office/messages (DispatchHomePage.tsx:142) — firewall finding.' });
csec('OPERATIONS.BROKERAGE', { label: 'Brokerage', role: 'CLIENT_WORKSPACE', impl: PARTIAL_BACKED, client: 'ENTITLEMENT', workspaces: ['BROKERAGE'], services: ['BROKERAGE'], routes: [ex('/portal/brokerage', CR('353-356'))], notes: 'Carrier side (AIO Freight). Shippers use the shipper portal (/shipper/*, a separate role projection).' });
csec('OPERATIONS.DRIVER_MANAGEMENT', { label: 'Driver Management', role: 'CLIENT_WORKSPACE', impl: PARTIAL_DEMO, client: 'ENTITLEMENT', workspaces: ['DRIVERLINK'], services: ['DRIVERS_CARRIERS'], routes: [ex('/portal/driverlink', CR('341-345'))] });
csec('OPERATIONS.VEHICLE_MANAGEMENT', { label: 'Vehicle Management', role: 'CLIENT_WORKSPACE', impl: PARTIAL_READ, client: 'APPLICABILITY', services: ['VEHICLE_MANAGEMENT'], routes: [ex('/portal/fleet', CR('302'))], notes: 'Fleet registry is a shared capability, not a workspace (office.ts AIO_NOT_WORKSPACES). Staff counterpart: WORK → VEHICLES & FLEET.' });
csec('OPERATIONS.MAINTENANCE', { label: 'Maintenance', role: 'CLIENT_WORKSPACE', impl: PARTIAL_DEMO, client: 'ENTITLEMENT', workspaces: ['FLEETCARE'], services: ['MECHANIC_MAINTENANCE'], routes: [ex('/portal/fleetcare', CR('337-340'))] });
csec('OPERATIONS.ROAD_READY', {
  label: 'Road Ready', role: 'CLIENT_WORKSPACE', impl: PARTIAL_DEMO, client: 'STATE', shownWhen: 'Road Ready engagement ACTIVE', services: ['ROAD_READY'], features: ['AIO.ROAD_READY'],
  semantics: 'The active Road Ready engagement workspace (D-ROAD-READY-PLACEMENT). On completion its records move into MY BUSINESS, VAULT, OPERATIONS and FINANCES; the engagement stays reachable through service history.',
  routes: [ex('/portal/road-ready', CR('301')), ex('/portal/onboarding', `${CR('300')} RoadReadyOnboardingPage`)],
  evidence: [`${SRC}/road-ready/roadReadyTypes.ts:12 RoadReadyItemStatus`],
  potential: ['Business Setup', 'Authorities', 'Compliance', 'Documents', 'Insurance', 'Vehicle / Driver Readiness', 'Filing / Tax Readiness', 'Launch Readiness'],
  notes: 'Today the page renders for every carrier (graph nav MY BUSINESS) whatever the state: there is no per-client engagement state (AVAILABLE / ACTIVE / COMPLETED) yet, only per-item statuses. Stages follow the later Road Ready product definition.',
});

dest('FINANCES', { label: 'FINANCES', role: 'CLIENT_WORKSPACE', impl: PARTIAL_DEMO, client: 'ENTITLEMENT', semantics: 'Financial service workspaces and client-safe financial summaries.', routes: [ex('/portal/money', CR('280'))] });
csec('FINANCES.BOOKKEEPING', { label: 'Bookkeeping', role: 'CLIENT_WORKSPACE', impl: PARTIAL_READ, client: 'ENTITLEMENT', workspaces: ['BOOKKEEPING'], services: ['BOOKKEEPING'], routes: [ex('/portal/bookkeeping', CR('336'))] });
csec('FINANCES.FACTORING', { label: 'Factoring', role: 'CLIENT_WORKSPACE', impl: PARTIAL_DEMO, client: 'ENTITLEMENT', workspaces: ['FACTORING'], services: ['FACTORING'], routes: [ex('/portal/factoring', CR('330-335'))], notes: '"Message Specialist" links to /office/messages (FactoringPortalPages.tsx:107) — firewall finding.' });
csec('FINANCES.INSURANCE', { label: 'Insurance', role: 'CLIENT_WORKSPACE', impl: PARTIAL_DEMO, client: 'ENTITLEMENT', workspaces: ['INSURANCE'], services: ['INSURANCE'], routes: [ex('/portal/insurance', CR('346-352'))], notes: 'Product graph family F12 Insurance is navigated under MY BUSINESS today → REMAP to FINANCES.' });
csec('FINANCES.FILING_TAX_SUMMARIES', { label: 'Filing / Tax Summaries', role: 'CLIENT_WORKSPACE', impl: NOT_STARTED, client: 'ENTITLEMENT', workspaces: ['IFTA'], services: ['IFTA_FUEL_TAX'], notes: 'Filed returns are visible inside the IFTA room; no cross-quarter summary.' });
csec('FINANCES.FEES_PAYMENTS', { label: 'Fees / Payments', role: 'CLIENT_WORKSPACE', impl: PARTIAL_DEMO, client: 'ALWAYS', semantics: 'Fees and payments, where supported (founder tree: “Fees / Payments where supported”).', routes: [ex('/portal/billing', CR('312-315')), ex('/portal/quotes', CR('310-311'))], notes: 'Client-safe billing projected from MORE → BILLING. Never internal margin, commission, profitability or staff-only financial data.' });
csec('FINANCES.FINANCIAL_DOCUMENTS', { label: 'Financial Documents', role: 'CLIENT_WORKSPACE', impl: NOT_STARTED, client: 'ALWAYS', services: ['DOCUMENTS_VAULT'], notes: 'Financial documents sit in VAULT today; no FINANCES view.' });

dest('VAULT', { label: 'VAULT', role: 'RECORDS', impl: PARTIAL_DEMO, client: 'ALWAYS', semantics: 'Documents and records.', services: ['DOCUMENTS_VAULT'], routes: [ex('/portal/vault', CR('304-305')), ex('/portal/documents', CR('281'))] });
csec('VAULT.CURRENT_DOCUMENTS', { label: 'Current Documents', role: 'RECORDS', impl: PARTIAL_DEMO, client: 'ALWAYS', services: ['DOCUMENTS_VAULT'] });
csec('VAULT.HISTORICAL_DOCUMENTS', { label: 'Historical Documents', role: 'RECORDS', impl: PARTIAL_READ, client: 'ALWAYS', services: ['DOCUMENTS_VAULT'], notes: 'Lineage statuses (CURRENT · SUPERSEDED · HISTORICAL) exist in the Brain vault model.' });
csec('VAULT.UPLOADS', { label: 'Uploads', role: 'RECORDS', impl: PARTIAL_DEMO, client: 'ALWAYS', services: ['DOCUMENTS_VAULT'], evidence: [`${SRC}/vault/vaultStorage.ts:26-31`] });
csec('VAULT.GENERATED_DOCUMENTS', { label: 'Generated Documents', role: 'RECORDS', impl: NOT_STARTED, client: 'ALWAYS', services: ['DOCUMENTS_VAULT'], notes: 'Per-service artifacts exist (COI requests, factoring invoice print); no VAULT section.' });
csec('VAULT.FILING_COMPLIANCE_RECORDS', { label: 'Filing / Compliance Records', role: 'RECORDS', impl: PARTIAL_READ, client: 'ALWAYS', services: ['DOCUMENTS_VAULT', 'IFTA_FUEL_TAX', 'COMPLIANCE'], notes: 'IFTA quarter packet → VAULT (VIEW IN VAULT).' });

dest('INBOX', { label: 'INBOX', role: 'COMMUNICATION', impl: PARTIAL_DEMO, client: 'ALWAYS', semantics: 'Communication, requests, approvals and notifications.', services: ['MESSAGING'], routes: [ex('/portal/inbox', CR('283-290'))] });
csec('INBOX.MESSAGES_FROM_AIO', { label: 'Messages from AIO', role: 'COMMUNICATION', impl: PARTIAL_DEMO, client: 'ALWAYS', services: ['MESSAGING'], routes: [ex('/portal/inbox/messages', CR('285-286'))] });
csec('INBOX.REQUESTS', { label: 'Requests', role: 'COMMUNICATION', impl: PARTIAL_DEMO, client: 'ALWAYS', routes: [ex('/portal/requests', CR('295')), ex('/portal/requests/:requestId', CR('357'))] });
csec('INBOX.APPROVALS_NEEDED', { label: 'Approvals Needed', role: 'COMMUNICATION', impl: PARTIAL_DEMO, client: 'ALWAYS', notes: 'Approvals exist inside services (IFTA YOUR REVIEW & APPROVAL); no INBOX approvals view.' });
csec('INBOX.NOTIFICATIONS', { label: 'Notifications', role: 'COMMUNICATION', impl: PARTIAL_DEMO, client: 'ALWAYS', routes: [ex('/portal/notifications', CR('287'))] });
csec('INBOX.ACTIVITY_UPDATES', { label: 'Activity Updates', role: 'COMMUNICATION', impl: PARTIAL_DEMO, client: 'ALWAYS', routes: [ex('/portal/activity', CR('297'))], notes: 'Pre-existing privacy finding: activityPreview shows org events of any visibility (clientCommandCenterService.ts:716). Client-safe projection required.' });

dest('SERVICES', { label: 'SERVICES', role: 'DISCOVERY', impl: PARTIAL_DEMO, client: 'ALWAYS', semantics: 'Active + available + contextually relevant service discovery, resolved per client (ACTIVE · AVAILABLE_NOT_ACTIVATED · NOT_APPLICABLE).', routes: [ex('/portal/services', CR('296'))] });
csec('SERVICES.ACTIVE_SERVICES', { label: 'Active Services', role: 'DISCOVERY', impl: PARTIAL_DEMO, client: 'ALWAYS', evidence: [`${SRC}/portal/clientCommandCenterService.ts:524-576 buildActiveServices (heuristics)`], notes: 'Replace the three disagreeing derivations with the canonical workspace resolver.' });
csec('SERVICES.AVAILABLE_SERVICES', { label: 'Available Services', role: 'DISCOVERY', impl: PARTIAL_DEMO, client: 'ALWAYS', notes: 'Only AVAILABLE_NOT_ACTIVATED workspaces; the five legacy generic AVAILABLE fallbacks are not to be reused (office.ts AIO_LEGACY_GENERIC_FALLBACKS).' });
csec('SERVICES.RECOMMENDED_CONTEXTUAL', { label: 'Recommended / Contextual Services', role: 'DISCOVERY', impl: NOT_STARTED, client: 'ALWAYS', notes: 'Expansion rules exist in the Brain (office.ts AIO_EXPANSION_RULES); crossSellRecommendations is unused in AIO.' });
csec('SERVICES.REQUEST_A_SERVICE', { label: 'Request a Service', role: 'DISCOVERY', impl: PARTIAL_DEMO, client: 'ALWAYS', routes: [ex('/portal/requests', CR('295'))] });
csec('SERVICES.ROAD_READY', {
  label: 'Road Ready', role: 'DISCOVERY', impl: NOT_STARTED, client: 'STATE', shownWhen: 'Road Ready AVAILABLE and not active · after completion: ROAD READY · COMPLETED (status only)', services: ['ROAD_READY'],
  semantics: 'Road Ready as a service the client can start. After completion SERVICES may show ROAD READY · COMPLETED but never holds the completed records (D-ROAD-READY-PLACEMENT).',
  evidence: [`${SRC}/pages/portal/ClientPortalPages.tsx:266 ServicesCenterPage (no Road Ready entry)`],
});

dest('ACCOUNT', { label: 'ACCOUNT', role: 'ACCOUNT', impl: PARTIAL_DEMO, client: 'ALWAYS', semantics: 'Profile, access, security, preferences, help.', routes: [ex('/portal/settings', CR('360'))] });
csec('ACCOUNT.PROFILE', { label: 'Profile', role: 'ACCOUNT', impl: PARTIAL_DEMO, client: 'ALWAYS', routes: [ex('/portal/settings', CR('360'))] });
csec('ACCOUNT.USERS_ACCESS', { label: 'Users / Access', role: 'ACCOUNT', impl: PARTIAL_DEMO, client: 'ALWAYS', routes: [ex('/portal/team', CR('298'))] });
csec('ACCOUNT.NOTIFICATIONS', { label: 'Notifications', role: 'ACCOUNT', impl: PARTIAL_DEMO, client: 'ALWAYS', routes: [ex('/portal/settings/notifications', CR('309'))] });
csec('ACCOUNT.SECURITY', { label: 'Security', role: 'ACCOUNT', impl: PARTIAL_DEMO, client: 'ALWAYS', routes: [ex('/portal/settings/security', CR('362'))] });
csec('ACCOUNT.PREFERENCES', { label: 'Preferences', role: 'ACCOUNT', impl: PARTIAL_DEMO, client: 'ALWAYS', routes: [ex('/portal/settings/connections', CR('361'))], notes: 'Connections live here today; no general preferences page.' });
csec('ACCOUNT.HELP', { label: 'Help', role: 'ACCOUNT', impl: NOT_STARTED, client: 'ALWAYS', notes: 'Only the public client-portal info page exists (AioCoreRoutes.tsx:258).' });
csec('ACCOUNT.SIGN_OUT', { label: 'Sign Out', role: 'ACCOUNT', impl: ['IMPLEMENTED', 'PRODUCTION_BACKED'], client: 'ALWAYS', evidence: [`${SRC}/pages/portal/PortalSettingsPage.tsx:64 signOut`] });

/* ════════════════════════════════ shells ════════════════════════════════ */

export const AIO_IA_SHELLS: IaShell[] = [
  {
    shell_id: 'AIO_OFFICE', name: 'AIO OFFICE', environment_id: 'AIO.OFFICE', kind: 'INTERNAL_OFFICE', actors: ['FOUNDER', 'STAFF'], scope: 'ALL_CLIENTS_ALL_SERVICES',
    root_nav: ['AIO_OFFICE.HOME', 'AIO_OFFICE.INTAKE', 'AIO_OFFICE.WORK', 'AIO_OFFICE.REPORTS', 'AIO_OFFICE.MORE'], route_root: '/office',
    semantics: 'Internal operational office for founder / staff: operates across all clients and all services. Related to CLIENT OFFICE but not symmetrical.',
  },
  {
    shell_id: 'CLIENT_OFFICE', name: 'CLIENT OFFICE', environment_id: 'AIO.CLIENT_OFFICE', kind: 'CLIENT_OFFICE', actors: ['CLIENT'], scope: 'ONE_CLIENT_APPLICABLE_WORKSPACES',
    root_nav: ['CLIENT_OFFICE.MY_BUSINESS', 'CLIENT_OFFICE.OPERATIONS', 'CLIENT_OFFICE.FINANCES', 'CLIENT_OFFICE.VAULT', 'CLIENT_OFFICE.INBOX', 'CLIENT_OFFICE.SERVICES', 'CLIENT_OFFICE.ACCOUNT'], route_root: '/portal',
    semantics: 'Authenticated client environment scoped to one client and that client’s applicable workspaces. Workspace-aware: services resolve ACTIVE · AVAILABLE_NOT_ACTIVATED · NOT_APPLICABLE.',
  },
];

/* ════════════════════════════════ services (crosswalk) ════════════════════════════════ */

const ENT_NOTE = 'ACTIVE → shown in its destination · AVAILABLE_NOT_ACTIVATED → SERVICES and approved contextual placements (expansion rules) · NOT_APPLICABLE → never promoted';
export const AIO_IA_SERVICES: IaService[] = [
  { service_id: 'PERMITTING_AUTHORITIES', name: 'Permitting & Authorities', staff_nodes: ['AIO_OFFICE.WORK.PERMITTING_AUTHORITIES'], client_nodes: ['CLIENT_OFFICE.OPERATIONS.PERMITTING_AUTHORITIES', 'CLIENT_OFFICE.MY_BUSINESS.AUTHORITIES_REGISTRATIONS'], client_visibility: 'ENTITLEMENT', client_visibility_note: ENT_NOTE, workspace_ids: ['TAGS_REGISTRATION', 'PERMITTING', 'COMPLIANCE', 'BUSINESS_FORMATION'], feature_refs: ['AIO.PERMITTING', 'AIO.TAGS_REGISTRATION', 'AIO.AUTHORITIES', 'AIO.BOC3', 'AIO.BUSINESS_FORMATION', 'AIO.ROAD_TAX'], architecture: 'ARCHITECTURALLY_CANONICAL', implementation: 'IMPLEMENTATION_PARTIAL', implementation_detail: 'Generic service-request pipeline (division queue + request detail); no permit / authority / tag / BOC-3 / formation case model; BOC-3 COMING_SOON.', canonical_data_source: `ServiceRequest (${SRC}/demo/demoTypes.ts:378) · Supabase aio_service_requests · catalog slugs (${SRC}/services/catalog/serviceCatalog.ts)`, evidence: [OR('288'), OR('289'), CR('295')], notes: 'Portal shows Permitting as ACTIVE for every carrier (hard-coded, clientCommandCenterService.ts:534). Road Ready / catalog slug drift (boc-3-filing vs boc-3-assistance …).' },
  { service_id: 'IFTA_FUEL_TAX', name: 'IFTA / Fuel Tax', staff_nodes: ['AIO_OFFICE.WORK.FILING_FUEL_TAXES', 'AIO_OFFICE.WORK.FILING_FUEL_TAXES.IFTA'], client_nodes: ['CLIENT_OFFICE.OPERATIONS.FILING_IFTA', 'CLIENT_OFFICE.FINANCES.FILING_TAX_SUMMARIES'], client_visibility: 'ENTITLEMENT', client_visibility_note: `${ENT_NOTE}. Shippers never see IFTA.`, workspace_ids: ['IFTA'], feature_refs: ['AIO.IFTA', 'AIO.IFTA_REGISTRATION'], architecture: 'ARCHITECTURALLY_CANONICAL', implementation: 'IMPLEMENTATION_PARTIAL', implementation_detail: 'Full quarterly lifecycle on both sides (functional demo); no IFTA tables; not in either nav; entitlement = "has a quarter row".', canonical_data_source: `IftaQuarterCase (${SRC}/ifta/iftaTypes.ts) · DemoStore.iftaQuarters (${SRC}/demo/demoTypes.ts:584)`, evidence: [OR('189-192'), CR('268-271')], notes: 'IFTA authority and canonical case identity preserved; only its office location moved under WORK.' },
  { service_id: 'COMPLIANCE', name: 'Compliance', staff_nodes: ['AIO_OFFICE.WORK.COMPLIANCE'], client_nodes: ['CLIENT_OFFICE.OPERATIONS.COMPLIANCE'], client_visibility: 'ENTITLEMENT', client_visibility_note: ENT_NOTE, workspace_ids: ['COMPLIANCE'], feature_refs: ['AIO.COMPLIANCE_SAFETY', 'AIO.RENEWALS'], architecture: 'ARCHITECTURALLY_CANONICAL', implementation: 'IMPLEMENTATION_PARTIAL', implementation_detail: 'Expirations / deadlines / renewals tracked; DOT-safety, audits, corrective work and compliance cases not started.', canonical_data_source: `store.deadlines · store.renewals · Road Ready slices (${SRC}/demo/demoTypes.ts:676-679)`, evidence: [OR('279'), OR('286'), CR('306-307')], notes: 'Supabase aio_deadlines exists but is not queried.' },
  { service_id: 'DISPATCH', name: 'Dispatch', staff_nodes: ['AIO_OFFICE.WORK.DISPATCH'], client_nodes: ['CLIENT_OFFICE.OPERATIONS.DISPATCH'], client_visibility: 'ENTITLEMENT', client_visibility_note: ENT_NOTE, workspace_ids: ['DISPATCH'], feature_refs: ['AIO.DISPATCH_OPERATIONS', 'AIO.LOAD_BOARD'], architecture: 'ARCHITECTURALLY_CANONICAL', implementation: 'IMPLEMENTATION_PARTIAL', implementation_detail: 'Functional demo (freight partly Supabase); no enrollment-activation UI, no exceptions queue, no dispatcher view.', canonical_data_source: `store.loads · truckProfiles · dispatchEnrollments (${SRC}/dispatch/dispatchTypes.ts) · Supabase aio_dispatch_loads`, evidence: [OR('298-304'), CR('316-329')], notes: 'Client "Message Dispatcher" links into /office/messages (firewall finding).' },
  { service_id: 'BROKERAGE', name: 'Brokerage', staff_nodes: ['AIO_OFFICE.WORK.BROKERAGE'], client_nodes: ['CLIENT_OFFICE.OPERATIONS.BROKERAGE'], client_visibility: 'ENTITLEMENT', client_visibility_note: `${ENT_NOTE}. Load financials (margin, carrier pay) are staff only.`, workspace_ids: ['BROKERAGE'], feature_refs: ['AIO.BROKERAGE', 'AIO.LOAD_BOARD'], architecture: 'ARCHITECTURALLY_CANONICAL', implementation: 'IMPLEMENTATION_PARTIAL', implementation_detail: 'Most mature and most Supabase-wired domain; business line PAUSED; shipments detail route missing.', canonical_data_source: `${SRC}/brokerage/* · Supabase load / stop / status tables`, evidence: [OR('324-335'), CR('353-356')], notes: 'Shipper portal (/shipper/*) is a separate role projection, not CLIENT OFFICE.' },
  { service_id: 'INSURANCE', name: 'Insurance', staff_nodes: ['AIO_OFFICE.WORK.INSURANCE'], client_nodes: ['CLIENT_OFFICE.FINANCES.INSURANCE'], client_visibility: 'ENTITLEMENT', client_visibility_note: ENT_NOTE, workspace_ids: ['INSURANCE'], feature_refs: ['AIO.INSURANCE'], architecture: 'ARCHITECTURALLY_CANONICAL', implementation: 'IMPLEMENTATION_PARTIAL', implementation_detail: 'Functional demo (referral model); Supabase tables unqueried; launch PARTNER_PENDING.', canonical_data_source: `${SRC}/insurance/insuranceTypes.ts · ${SRC}/demo/insuranceActions.ts`, evidence: [OR('290-297'), CR('346-352')], notes: 'Client location moves from MY BUSINESS (product graph F12) to FINANCES.' },
  { service_id: 'FACTORING', name: 'Factoring', staff_nodes: ['AIO_OFFICE.WORK.FACTORING'], client_nodes: ['CLIENT_OFFICE.FINANCES.FACTORING'], client_visibility: 'ENTITLEMENT', client_visibility_note: ENT_NOTE, workspace_ids: ['FACTORING'], feature_refs: ['AIO.FACTORING'], architecture: 'ARCHITECTURALLY_CANONICAL', implementation: 'IMPLEMENTATION_PARTIAL', implementation_detail: 'Functional demo; no provider integration; two disagreeing "active" rules.', canonical_data_source: `${SRC}/factoring/factoringTypes.ts · FactoringProfile.enrollmentStatus`, evidence: [OR('305-310'), CR('330-335')], notes: 'Client "Message Specialist" links into /office/messages (firewall finding).' },
  { service_id: 'BOOKKEEPING', name: 'Bookkeeping', staff_nodes: ['AIO_OFFICE.WORK.BOOKKEEPING'], client_nodes: ['CLIENT_OFFICE.FINANCES.BOOKKEEPING'], client_visibility: 'ENTITLEMENT', client_visibility_note: ENT_NOTE, workspace_ids: ['BOOKKEEPING'], feature_refs: ['AIO.BOOKKEEPING'], architecture: 'ARCHITECTURALLY_CANONICAL', implementation: 'IMPLEMENTATION_PARTIAL', implementation_detail: 'Dashboards only (read-only); reconciliation and deliverables not started.', canonical_data_source: `${SRC}/bookkeeping/bookkeepingTypes.ts · getBookkeepingSubscription`, evidence: [OR('311-315'), CR('336')], notes: 'Absent from both active-services builders.' },
  { service_id: 'DRIVERS_CARRIERS', name: 'Drivers & Carriers', staff_nodes: ['AIO_OFFICE.WORK.DRIVERS_CARRIERS'], client_nodes: ['CLIENT_OFFICE.OPERATIONS.DRIVER_MANAGEMENT', 'CLIENT_OFFICE.MY_BUSINESS.DRIVERS'], client_visibility: 'ENTITLEMENT', client_visibility_note: ENT_NOTE, workspace_ids: ['DRIVERLINK'], feature_refs: ['AIO.DRIVERLINK'], architecture: 'ARCHITECTURALLY_CANONICAL', implementation: 'IMPLEMENTATION_PARTIAL', implementation_detail: 'Client / driver marketplace works in demo; staff views read-only; credential review and approvals not started.', canonical_data_source: `${SRC}/driverlink/driverlinkTypes.ts · matchingService.ts`, evidence: [OR('320-323'), CR('341-345')], notes: 'Driver portal (/driver/driverlink/*) is a separate role projection. No entitlement gating.' },
  { service_id: 'VEHICLE_MANAGEMENT', name: 'Vehicle Management', staff_nodes: ['AIO_OFFICE.WORK.VEHICLES_FLEET'], client_nodes: ['CLIENT_OFFICE.OPERATIONS.VEHICLE_MANAGEMENT', 'CLIENT_OFFICE.MY_BUSINESS.VEHICLES'], client_visibility: 'APPLICABILITY', client_visibility_note: 'Carriers only; not a workspace (fleet registry is a shared capability).', workspace_ids: [], feature_refs: [], architecture: 'ARCHITECTURALLY_CANONICAL', implementation: 'IMPLEMENTATION_PARTIAL', implementation_detail: 'Client fleet pages read-mostly; the staff lane WORK → VEHICLES & FLEET is not started (no /office fleet surface; Client 360 fleet tab is placeholder text).', canonical_data_source: `PowerUnit · Trailer (${SRC}/road-ready/roadReadyTypes.ts:113,129) · store.powerUnits · Supabase aio_fleet_vehicles (written by migration approve only)`, evidence: [CR('302-303'), `${SRC}/office/pages/ClientDetailPage.tsx:184-186`], notes: 'Staff lane by founder decision (D-VEHICLES-FLEET-LANE). It owns the vehicle record and cross-links registration, documents, driver, insurance, IFTA, compliance and maintenance to their owning lanes (AIO_VEHICLES_FLEET_SCOPE).' },
  { service_id: 'MECHANIC_MAINTENANCE', name: 'Mechanic / Maintenance', staff_nodes: ['AIO_OFFICE.WORK.MECHANIC_MAINTENANCE', 'AIO_OFFICE.MORE.MECHANIC_NETWORK'], client_nodes: ['CLIENT_OFFICE.OPERATIONS.MAINTENANCE'], client_visibility: 'ENTITLEMENT', client_visibility_note: ENT_NOTE, workspace_ids: ['FLEETCARE'], feature_refs: ['AIO.FLEETCARE'], architecture: 'ARCHITECTURALLY_CANONICAL', implementation: 'IMPLEMENTATION_PARTIAL', implementation_detail: 'Client and provider flows work in demo; staff views read-only.', canonical_data_source: `${SRC}/fleetcare/fleetcareTypes.ts · ${SRC}/demo/fleetcareActions.ts`, evidence: [OR('316-319'), CR('337-340')], notes: 'Provider portal (/provider/fleetcare/*) is a separate role projection. ~28 Supabase tables unqueried.' },
  { service_id: 'ROAD_READY', name: 'Road Ready', staff_nodes: ['AIO_OFFICE.WORK.ROAD_READY'], client_nodes: ['CLIENT_OFFICE.OPERATIONS.ROAD_READY', 'CLIENT_OFFICE.SERVICES.ROAD_READY'], client_visibility: 'STATE', client_visibility_note: 'Placement follows the engagement (D-ROAD-READY-PLACEMENT): SERVICES while available, OPERATIONS while active; once completed its records live in MY BUSINESS, VAULT, OPERATIONS and FINANCES.', state_placements: [
    { state: 'AVAILABLE_NOT_ACTIVATED', client_nodes: ['CLIENT_OFFICE.SERVICES.ROAD_READY'], note: 'Offered as a service.' },
    { state: 'ACTIVE', client_nodes: ['CLIENT_OFFICE.OPERATIONS.ROAD_READY'], note: 'OPERATIONS holds the actual engagement workspace.' },
    { state: 'COMPLETED', client_nodes: ['CLIENT_OFFICE.SERVICES.ROAD_READY', 'CLIENT_OFFICE.MY_BUSINESS', 'CLIENT_OFFICE.VAULT', 'CLIENT_OFFICE.OPERATIONS', 'CLIENT_OFFICE.FINANCES'], note: 'SERVICES may show ROAD READY · COMPLETED (status only) and is never the permanent container; resulting records are distributed to MY BUSINESS, VAULT, OPERATIONS and FINANCES; the engagement stays in service history.' },
    { state: 'NOT_APPLICABLE', client_nodes: [], note: 'Not promoted.' },
  ], workspace_ids: [], feature_refs: ['AIO.ROAD_READY'], architecture: 'ARCHITECTURALLY_CANONICAL', implementation: 'IMPLEMENTATION_PARTIAL', implementation_detail: 'Functional demo on both sides; Supabase aio_road_ready_* unqueried (roadmaps / intake sessions are used). No per-client engagement state (AVAILABLE / ACTIVE / COMPLETED) yet, so the placement rule waits on it; SERVICES lists no Road Ready entry.', canonical_data_source: `${SRC}/road-ready/* · ${SRC}/demo/roadReadyActions.ts`, evidence: [OR('272'), OR('275'), CR('300-301')], notes: 'Not a sold workspace in the Brain registry; it feeds signals to every workspace. Exact program structure follows its later product definition.' },
  { service_id: 'DOCUMENTS_VAULT', name: 'Documents / Vault', staff_nodes: ['AIO_OFFICE.MORE.DOCUMENTS_VAULT'], client_nodes: ['CLIENT_OFFICE.VAULT', 'CLIENT_OFFICE.FINANCES.FINANCIAL_DOCUMENTS'], client_visibility: 'ALWAYS', client_visibility_note: 'Every client; only customer-visible records (internal scans never reach the client).', workspace_ids: [], feature_refs: ['AIO.VAULT'], architecture: 'ARCHITECTURALLY_CANONICAL', implementation: 'IMPLEMENTATION_PARTIAL', implementation_detail: 'UI functional in demo; backend file storage not started ("Secure storage not configured").', canonical_data_source: `${SRC}/vault/* · store.documents (${SRC}/demo/demoTypes.ts:600)`, evidence: [OR('281-282'), CR('304-305')], notes: 'A shared capability across workspaces, not a workspace.' },
  { service_id: 'MESSAGING', name: 'Messaging', staff_nodes: ['AIO_OFFICE.MORE.MESSAGES'], client_nodes: ['CLIENT_OFFICE.INBOX', 'CLIENT_OFFICE.INBOX.MESSAGES_FROM_AIO'], client_visibility: 'ALWAYS', client_visibility_note: 'Every client; client sees only its own threads (staff notes never).', workspace_ids: [], feature_refs: ['AIO.INBOX'], architecture: 'ARCHITECTURALLY_CANONICAL', implementation: 'IMPLEMENTATION_PARTIAL', implementation_detail: 'Functional demo with two parallel models (comm* and legacy messages); backend not started.', canonical_data_source: `${SRC}/communications/* · store comm* slices (${SRC}/demo/demoTypes.ts:712-733)`, evidence: [OR('217-219'), CR('283-290')], notes: 'Supabase aio_conversations / aio_messages exist but are not queried.' },
  { service_id: 'CLIENT_MIGRATION_INTAKE', name: 'Client Migration / Intake', staff_nodes: ['AIO_OFFICE.INTAKE'], client_nodes: [], client_visibility: 'STAFF_ONLY', client_visibility_note: 'Never in the client shell. The client meets only the activation gate (CLIENT_OFFICE.ACTIVATION), which renders without staff navigation.', workspace_ids: [], feature_refs: ['AIO.CLIENT_MIGRATION', 'AIO.MIGRATION_INTAKE', 'AIO.MIGRATION_REVIEW'], architecture: 'ARCHITECTURALLY_CANONICAL', implementation: 'IMPLEMENTATION_PARTIAL', implementation_detail: 'All 41 migration screens built to the approved authority; Supabase-wired services; open gaps listed in the flow prototype (match decision not saved, failed file blocks extraction, no migration history).', canonical_data_source: `${SRC}/client-migration/* · Supabase migrations 20261006210000 / 230000 / 240000`, evidence: [OR('195-196')], notes: 'Lifecycle truth unchanged; PREBUILT is not ACTIVE.' },
];

/* ════════════════════════════════ supersession (lineage kept) ════════════════════════════════ */

const DOCK = 'Staff / founder root dock HOME · INTAKE · FILING · REPORTS · MORE (migration family, AioMigrationKit STAFF_NAV)';
const L = AIO_OFFICE_IA_LINEAGE_ID;
export const AIO_IA_SUPERSESSIONS: IaSupersession[] = [
  { lineage_id: L, old_structure: DOCK, old_item: 'HOME', old_target: '/office', disposition: 'KEPT', new_node_ids: ['AIO_OFFICE.HOME'], note: 'Same position; now defined as a projection of INTAKE and WORK.' },
  { lineage_id: L, old_structure: DOCK, old_item: 'INTAKE', old_target: '/office/migration', disposition: 'KEPT', new_node_ids: ['AIO_OFFICE.INTAKE'], note: 'Same position; staff / founder only; migration authorities re-associated.' },
  { lineage_id: L, old_structure: DOCK, old_item: 'FILING (root)', old_target: '/office/documents (legacy document review / expiry queue)', disposition: 'SUPERSEDED', new_node_ids: ['AIO_OFFICE.WORK'], note: 'The root position is now WORK, the cross-service production hub. FILING is no longer a root item.' },
  { lineage_id: L, old_structure: DOCK, old_item: 'FILING (production)', old_target: 'filing work', disposition: 'REHOMED', new_node_ids: ['AIO_OFFICE.WORK.FILING_FUEL_TAXES', 'AIO_OFFICE.WORK.FILING_FUEL_TAXES.IFTA'], note: 'Filing production lives in WORK → FILING & FUEL TAXES; IFTA at WORK → FILING & FUEL TAXES → IFTA with its case identity unchanged.' },
  { lineage_id: L, old_structure: DOCK, old_item: 'FILING (dock target /office/documents)', old_target: '/office/documents', disposition: 'REMAPPED', new_node_ids: ['AIO_OFFICE.WORK.COMPLIANCE.EXPIRATIONS', 'AIO_OFFICE.MORE.DOCUMENTS_VAULT'], note: 'The page the old FILING item opened is a legacy expiring-document queue: expiry work → COMPLIANCE → EXPIRATIONS; documents → MORE → DOCUMENTS & VAULT.' },
  { lineage_id: L, old_structure: DOCK, old_item: 'REPORTS', old_target: '/office/archive-migration', disposition: 'REMAPPED', new_node_ids: ['AIO_OFFICE.REPORTS', 'AIO_OFFICE.REPORTS.MIGRATION', 'AIO_OFFICE.INTAKE.MIGRATION_HISTORY'], note: 'Same position; the old target (archive migration batches) maps to REPORTS → MIGRATION and INTAKE → MIGRATION HISTORY.' },
  { lineage_id: L, old_structure: DOCK, old_item: 'MORE', old_target: '/office', disposition: 'KEPT', new_node_ids: ['AIO_OFFICE.MORE'], note: 'Same position; becomes a real secondary directory (no production).' },
  { lineage_id: L, old_structure: 'AIO OFFICE HUB responsibilities (office.ts AIO_OFFICE_HUB_RESPONSIBILITIES)', old_item: 'ALL CLIENTS', old_target: '/office/clients', disposition: 'REMAPPED', new_node_ids: ['AIO_OFFICE.MORE.CLIENTS', 'AIO_OFFICE.HOME.CLIENTS_IN_MOTION'], note: 'Directory → MORE; clients changing state → HOME.' },
  { lineage_id: L, old_structure: 'AIO OFFICE HUB responsibilities (office.ts AIO_OFFICE_HUB_RESPONSIBILITIES)', old_item: 'NEEDS ATTENTION', old_target: 'hub', disposition: 'KEPT', new_node_ids: ['AIO_OFFICE.HOME.NEEDS_ATTENTION'], note: '' },
  { lineage_id: L, old_structure: 'AIO OFFICE HUB responsibilities (office.ts AIO_OFFICE_HUB_RESPONSIBILITIES)', old_item: 'DUE / UPCOMING', old_target: 'hub', disposition: 'RENAMED', new_node_ids: ['AIO_OFFICE.HOME.DEADLINES'], note: '' },
  { lineage_id: L, old_structure: 'AIO OFFICE HUB responsibilities (office.ts AIO_OFFICE_HUB_RESPONSIBILITIES)', old_item: 'BLOCKED · WAITING ON CLIENT · WAITING ON AIO', old_target: 'hub', disposition: 'REMAPPED', new_node_ids: ['AIO_OFFICE.HOME.BLOCKERS'], note: 'Waiting-on states are blocker reasons.' },
  { lineage_id: L, old_structure: 'AIO OFFICE HUB responsibilities (office.ts AIO_OFFICE_HUB_RESPONSIBILITIES)', old_item: 'ACTIVE WORKSPACES · SERVICE HEALTH', old_target: 'hub', disposition: 'REMAPPED', new_node_ids: ['AIO_OFFICE.HOME.WORK_ACROSS_AIO', 'AIO_OFFICE.REPORTS.SERVICES'], note: 'Live lane state → HOME; performance over time → REPORTS.' },
  { lineage_id: L, old_structure: 'AIO OFFICE HUB responsibilities (office.ts AIO_OFFICE_HUB_RESPONSIBILITIES)', old_item: 'RECENT ACTIVITY', old_target: 'hub', disposition: 'KEPT', new_node_ids: ['AIO_OFFICE.HOME.RECENT_ACTIVITY'], note: '' },
  { lineage_id: L, old_structure: 'AIO OFFICE HUB responsibilities (office.ts AIO_OFFICE_HUB_RESPONSIBILITIES)', old_item: 'GLOBAL SEARCH / CLIENT LOOKUP', old_target: 'topbar search', disposition: 'REMAPPED', new_node_ids: ['AIO_OFFICE.HOME.QUICK_ACTIONS'], note: 'The header search stays; quick entry is a HOME region.' },
  { lineage_id: L, old_structure: 'Customer containers (product graph runtimeProductGraph containers)', old_item: 'MY OFFICE', old_target: '/portal', disposition: 'REMAPPED', new_node_ids: ['CLIENT_OFFICE.HUB'], note: 'The CLIENT OFFICE HUB / OVERVIEW: the shell landing, not one of the seven root destinations (D-CLIENT-HUB).' },
  ...([
    ['ACTIVE WORKSPACES', 'RENAMED', ['CLIENT_OFFICE.HUB.ACTIVE_SERVICES'], ''],
    ['CURRENT ACTIONS', 'REMAPPED', ['CLIENT_OFFICE.HUB.CONTEXTUAL_NEXT_ACTION', 'CLIENT_OFFICE.HUB.ITEMS_NEEDING_APPROVAL'], 'Split into the next action and the approvals waiting on the client.'],
    ['UPCOMING DEADLINES', 'KEPT', ['CLIENT_OFFICE.HUB.UPCOMING_DEADLINES'], ''],
    ['DOCUMENT REQUESTS', 'REMAPPED', ['CLIENT_OFFICE.HUB.CONTEXTUAL_NEXT_ACTION'], 'A document request is a next action; the request itself is owned by INBOX → REQUESTS.'],
    ['MESSAGES', 'RENAMED', ['CLIENT_OFFICE.HUB.RECENT_MESSAGES'], ''],
    ['RECENT ACTIVITY', 'REMAPPED', ['CLIENT_OFFICE.HUB.WORK_IN_PROGRESS'], 'The hub shows work in progress; the activity feed is INBOX → ACTIVITY UPDATES.'],
    ['AVAILABLE RELEVANT WORKSPACES', 'REMAPPED', ['CLIENT_OFFICE.HUB.CONTEXTUAL_NEXT_ACTION'], 'Only under the expansion rules.'],
  ] as const).map(([item, disposition, ids, note]) => ({ lineage_id: L, old_structure: 'CLIENT OFFICE hub responsibilities (office.ts AIO_CLIENT_OFFICE_HUB_RESPONSIBILITIES)', old_item: item, old_target: 'hub', disposition, new_node_ids: [...ids], note })),
  { lineage_id: L, old_structure: 'Customer containers (product graph families)', old_item: 'F12 INSURANCE under MY BUSINESS', old_target: '/portal/insurance', disposition: 'REMAPPED', new_node_ids: ['CLIENT_OFFICE.FINANCES.INSURANCE'], note: 'The founder tree places Insurance in FINANCES.' },
];

/* ════════════════════════════════ legacy reconciliation (audit of fsbw + SITE00) ════════════════════════════════ */

const FS = 'yoteenz/fsbw';
export const AIO_IA_LEGACY: IaLegacyReference[] = [
  { repo: FS, ref: `${SRC}/client-migration/visual/AioMigrationKit.tsx:243-250`, what: 'STAFF_NAV array (desktop sidebar + phone/tablet dock) HOME · INTAKE · FILING · REPORTS · MORE', classification: 'MIGRATE_LATER', target_node_ids: ['AIO_OFFICE.HOME', 'AIO_OFFICE.INTAKE', 'AIO_OFFICE.WORK', 'AIO_OFFICE.REPORTS', 'AIO_OFFICE.MORE'], note: 'Live nav is not changed in this sprint. Implementation sprint: FILING → WORK (/office/work), REPORTS → /office/reports, MORE → the MORE directory; render from the IA root_nav instead of a hard-coded array.' },
  { repo: FS, ref: 'AIO_CLIENT_MIGRATION_RESPONSIVE_BLUEPRINT/nav-rules.json:3-29', what: 'Blueprint nav rule text "STAFF_NAV: HOME · INTAKE (current) · FILING · REPORTS · MORE"', classification: 'SUPERSEDE', target_node_ids: ['AIO_OFFICE.WORK'], note: `Marked ${L} in place (lineage kept).` },
  { repo: FS, ref: 'AIO_CLIENT_MIGRATION_RESPONSIVE_BLUEPRINT/responsive-blueprint.json:51,60', what: 'Blueprint mentions of the FILING dock item', classification: 'SUPERSEDE', target_node_ids: ['AIO_OFFICE.WORK'], note: 'Covered by the nav-rules supersession note.' },
  { repo: FS, ref: 'AIO_CLIENT_MIGRATION_AUTHORITY/authority-manifest.json:600 (AIO-MIG-ACTIVATION-COMPLETE-002 client_office_destinations)', what: 'Arrival plate records five client destinations (My Business · Operations · Finances · Vault · Inbox) and client_nav_authority_missing: true', classification: 'KEEP', target_node_ids: ['CLIENT_OFFICE.MY_BUSINESS', 'CLIENT_OFFICE.OPERATIONS', 'CLIENT_OFFICE.FINANCES', 'CLIENT_OFFICE.VAULT', 'CLIENT_OFFICE.INBOX', 'CLIENT_OFFICE.SERVICES', 'CLIENT_OFFICE.ACCOUNT'], note: 'Authority untouched. The missing client nav authority, when made, follows the seven client roots (adds SERVICES and ACCOUNT).' },
  { repo: FS, ref: 'AIO_CLIENT_MIGRATION_AUTHORITY/authority-manifest.json:133,162,297,761', what: 'Approved migration authority images draw the dock with FILING', classification: 'KEEP', target_node_ids: ['AIO_OFFICE.INTAKE'], note: 'Authority stays untouched (historical lineage). The dock label follows the IA when the live dock is migrated; the screens’ approved content is unaffected.' },
  { repo: FS, ref: 'all-in-one-enterprises/docs/AIO_CLIENT_MIGRATION_AUTHORITY_RECOVERY.md (dock references)', what: 'Recovery doc describes the FILING dock', classification: 'SUPERSEDE', target_node_ids: ['AIO_OFFICE.WORK'], note: 'Supersession pointer added; historical text kept.' },
  { repo: FS, ref: `${SRC}/office/layouts/AIOOfficeLayout.tsx:13-118`, what: 'Desktop office sidebar navGroups (Home · Work · Growth · Clients · Services · Operations · Finance · Communication · Management)', classification: 'MIGRATE_LATER', target_node_ids: ['AIO_OFFICE.HOME', 'AIO_OFFICE.WORK', 'AIO_OFFICE.REPORTS', 'AIO_OFFICE.MORE'], note: 'Regroup into the five roots in the implementation sprint: Growth (CRM) → MORE → GROWTH / CRM, the Finance group’s billing desk → MORE → BILLING; items without a founder-tree home stay candidates.' },
  { repo: FS, ref: `${SRC}/office-core/officeWorkTypes.ts:4-16 OfficeStaffRole · ${SRC}/office-core/officeContext.ts:74 ROLE_PERMISSIONS · all-in-one-enterprises/supabase/migrations/20260815100000_aio_identity_foundation.sql:28-29 aio_internal_role`, what: 'Staff roles (owner, admin, …) and Supabase internal roles (super_admin, administrator, …); no FOUNDER role', classification: 'MIGRATE_LATER', target_node_ids: [], note: 'Map the FOUNDER actor class onto a role in the permissions sprint (D-FOUNDER-ROLE). No founder identity is hard-coded today (no name or email checks found); keep it that way.' },
  { repo: FS, ref: `${SRC}/product-graph/portalNavFromMeta.ts:7-33`, what: 'Carrier portal nav (sections MY OFFICE · MY BUSINESS · OPERATIONS · FINANCES · VAULT · INBOX · ACCOUNT)', classification: 'REMAP', target_node_ids: ['CLIENT_OFFICE.HUB', 'CLIENT_OFFICE.FINANCES.INSURANCE', 'CLIENT_OFFICE.SERVICES'], note: 'Already container-aligned. Remap Insurance to FINANCES, add SERVICES as a root, MY OFFICE → the HUB / OVERVIEW landing (not a nav section), Road Ready out of MY BUSINESS (SERVICES while available, OPERATIONS while active). MIGRATE with the client nav sprint.' },
  { repo: FS, ref: `${SRC}/layouts/AIOPortalLayout.tsx:13-19`, what: 'Portal mobile bottom dock (carrier only)', classification: 'MIGRATE_LATER', target_node_ids: ['CLIENT_OFFICE.MY_BUSINESS', 'CLIENT_OFFICE.OPERATIONS', 'CLIENT_OFFICE.FINANCES', 'CLIENT_OFFICE.VAULT', 'CLIENT_OFFICE.INBOX', 'CLIENT_OFFICE.SERVICES', 'CLIENT_OFFICE.ACCOUNT'], note: 'Mobile dock contract follows the seven client roots (selection for a 5-slot dock is a design decision for the authority sprint).' },
  { repo: FS, ref: `${SRC}/product-graph/generated/runtimeProductGraph.json families[F12].nav = "MY BUSINESS"`, what: 'Insurance family navigated under MY BUSINESS', classification: 'REMAP', target_node_ids: ['CLIENT_OFFICE.FINANCES.INSURANCE'], note: 'Generated file not edited; the IA overlay records the canonical location.' },
  { repo: FS, ref: `${SRC}/product-graph/generated/routeMetaRegistry.json`, what: 'No entries for /office/migration or the /workspaces/ifta routes', classification: 'MIGRATE_LATER', target_node_ids: ['AIO_OFFICE.INTAKE', 'AIO_OFFICE.WORK.FILING_FUEL_TAXES.IFTA', 'CLIENT_OFFICE.OPERATIONS.FILING_IFTA'], note: 'The route meta registry is stale relative to the routes; regenerate in the graph sprint.' },
  { repo: FS, ref: `${SRC}/utils/paths.ts:226-227 officeFuelTax · officeFuelTaxCase · ${SRC}/office/routes/OfficeRoutes.tsx:193-194 OfficeFuelTaxLegacyRedirect`, what: 'Old staff fuel-tax paths (point at /office/workspaces/ifta) and the permitting/fuel-tax redirect routes', classification: 'KEEP', target_node_ids: ['AIO_OFFICE.WORK.FILING_FUEL_TAXES.IFTA'], note: 'Already superseded by the office architecture sprint; redirect stays.' },
  { repo: FS, ref: `${SRC}/portal/clientCommandCenterService.ts:524-576 buildActiveServices`, what: 'Heuristic active services incl. hard-coded Permitting ACTIVE and five generic AVAILABLE fallbacks', classification: 'REMOVE_WHEN_IMPLEMENTED', target_node_ids: ['CLIENT_OFFICE.SERVICES.ACTIVE_SERVICES', 'CLIENT_OFFICE.SERVICES.AVAILABLE_SERVICES'], note: 'Replace with the canonical workspace resolver (one per client × workspace).' },
  { repo: FS, ref: `${SRC}/office-core/client360Service.ts:52-71 activeServices`, what: 'Second active-services heuristic (staff Client 360)', classification: 'REMOVE_WHEN_IMPLEMENTED', target_node_ids: ['AIO_OFFICE.MORE.CLIENTS'], note: 'Same resolver replaces it.' },
  { repo: FS, ref: `${SRC}/pages/portal/dispatch/DispatchHomePage.tsx:142 · DispatchLoadDetailPage.tsx:86,188 · factoring/FactoringPortalPages.tsx:107`, what: 'Client pages link to the staff route /office/messages', classification: 'REMOVE_WHEN_IMPLEMENTED', target_node_ids: ['CLIENT_OFFICE.INBOX.MESSAGES_FROM_AIO'], note: 'Firewall finding: route client messaging to INBOX.' },
  { repo: FS, ref: `${SRC}/ifta/iftaDerive.ts:64 · ${SRC}/ifta/experience/AIO_IFTA_FUEL_TAX_EXPERIENCE_CONTRACT.json (state FILING)`, what: 'IFTA case state FILING (the return is being submitted)', classification: 'KEEP', target_node_ids: ['AIO_OFFICE.WORK.FILING_FUEL_TAXES.SUBMITTED_FILED'], note: 'A case lifecycle state, not navigation; unaffected by the root change (approved IFTA architecture).' },
  { repo: FS, ref: `${SRC}/routes/AioCoreRoutes.tsx:262-264 SmartIntakeLayout /get-started`, what: 'Public "smart intake" for prospects (F02 Get Started)', classification: 'KEEP', target_node_ids: [], note: 'Public site, outside both offices — not client INTAKE and not the staff INTAKE root (name collision only). The client office exposes no intake.' },
  { repo: FS, ref: `${SRC}/ifta/ui/IftaClientShell.tsx:15-19 · IftaStaffShell.tsx:10,45`, what: 'Hard-coded workspace switcher lists', classification: 'MIGRATE_LATER', target_node_ids: ['CLIENT_OFFICE.OPERATIONS.FILING_IFTA', 'AIO_OFFICE.WORK.FILING_FUEL_TAXES.IFTA'], note: 'Resolve from the workspace registry when entitlements are wired.' },
  { repo: 'yoteenz/SITE00', ref: 'shared/studioos-experience-brain/projects/aio/office.ts:59 AIO_OFFICE_HUB_RESPONSIBILITIES', what: 'Hub responsibilities of the office architecture sprint', classification: 'REMAP', target_node_ids: ['AIO_OFFICE.HOME'], note: 'Kept as-is; crosswalked to the HOME regions (supersessions).' },
  { repo: 'yoteenz/SITE00', ref: 'shared/studioos-visual-authority/projects/aio/ifta-authority/tree-specs.ts:110-119 AIO.OFFICE.WS.IFTA · AIO.CLIENT_OFFICE.WS.IFTA', what: 'IFTA page tree parents (workspace directly under the environment)', classification: 'MIGRATE_LATER', target_node_ids: ['AIO_OFFICE.WORK.FILING_FUEL_TAXES.IFTA', 'CLIENT_OFFICE.OPERATIONS.FILING_IFTA'], note: 'Approved IFTA tree unchanged; re-parenting under WORK / OPERATIONS is a later tree revision and changes no case identity.' },
];

/* ════════════════════════════════ candidates (source truth the founder tree does not name) ════════════════════════════════ */

export const AIO_IA_CANDIDATES: IaCandidate[] = [
  { candidate_id: 'C-WORK-QUEUES', label: 'My Work · Queues · Approvals · Escalations', observed: [OR('199-203'), `${SRC}/office/layouts/AIOOfficeLayout.tsx:18-26`], recommended_node: 'AIO_OFFICE.WORK', rationale: 'Cross-lane staff work views: production → WORK (cross-client filters), surfaced on HOME as projections.', status: 'CANDIDATE_UNRESOLVED', resolution: null },
  { candidate_id: 'C-SERVICE-REQUESTS', label: 'Service Operations · Requests · Tasks', observed: [OR('204'), OR('276-278')], recommended_node: 'AIO_OFFICE.WORK', rationale: 'The universal service-request queue is production for lanes without a case model.', status: 'CANDIDATE_UNRESOLVED', resolution: null },
  { candidate_id: 'C-CRM-GROWTH', label: 'Growth (CRM · Leads · Pipeline · CRM Calendar · CRM Reports)', observed: [OR('263-270')], recommended_node: 'AIO_OFFICE.MORE.GROWTH_CRM', rationale: 'Sales / growth is daily work for some staff but not a client service lane.', status: 'RESOLVED', resolution: 'D-GROWTH-BILLING: MORE → GROWTH / CRM; HOME may project it.' },
  { candidate_id: 'C-BILLING-DESK', label: 'Billing Desk (Quotes · Invoices · Payments · Pricing)', observed: [OR('336-342')], recommended_node: 'AIO_OFFICE.MORE.BILLING', rationale: 'Billing operations are invoicing production and a revenue source.', status: 'RESOLVED', resolution: 'D-GROWTH-BILLING: MORE → BILLING for operations; REPORTS → FINANCIAL / REVENUE aggregates it.' },
  { candidate_id: 'C-WORKFLOWS-AUTOMATION', label: 'Workflows · Workflow Health · Automation Exceptions · Workflow / Automation settings', observed: [OR('210-216')], recommended_node: 'AIO_OFFICE.MORE.SYSTEM_SETTINGS', rationale: 'Templates and rules are administration (MORE); automation exceptions are production blockers (HOME → BLOCKERS).', status: 'CANDIDATE_UNRESOLVED', resolution: null },
  { candidate_id: 'C-MANAGEMENT', label: 'Management command centers (12 KPI pages) · Launch Control · Service Activation Center', observed: [OR('245-259')], recommended_node: 'AIO_OFFICE.REPORTS', rationale: 'Oversight → REPORTS; launch / activation administration → MORE.', status: 'CANDIDATE_UNRESOLVED', resolution: null },
  { candidate_id: 'C-SECURITY-SYSTEM', label: 'Security · Privacy · Production readiness / config · System data / QA · Integrations', observed: [OR('225-244')], recommended_node: 'AIO_OFFICE.MORE.SYSTEM_SETTINGS', rationale: 'Administration and lower-frequency tools.', status: 'CANDIDATE_UNRESOLVED', resolution: null },
  { candidate_id: 'C-OVERSIGHT-AUDIT', label: 'Workload · Activity · Audit', observed: [OR('207-209')], recommended_node: 'AIO_OFFICE.REPORTS', rationale: 'Oversight; recent activity also feeds HOME.', status: 'CANDIDATE_UNRESOLVED', resolution: null },
  { candidate_id: 'C-DOCUMENT-REVIEW', label: 'Document Review queue', observed: [OR('205')], recommended_node: 'AIO_OFFICE.MORE.DOCUMENTS_VAULT', rationale: 'Review of uploaded documents is production per lane; until lanes own their document checks it sits with DOCUMENTS & VAULT.', status: 'CANDIDATE_UNRESOLVED', resolution: null },
  { candidate_id: 'C-RENEWALS-DEADLINES', label: 'Renewals · Compliance Calendar', observed: [OR('279'), OR('286')], recommended_node: 'AIO_OFFICE.WORK.COMPLIANCE.EXPIRATIONS', rationale: 'Production lives in COMPLIANCE → EXPIRATIONS; HOME → DEADLINES projects it.', status: 'CANDIDATE_UNRESOLVED', resolution: null },
  { candidate_id: 'C-LEGACY-INBOX-DOCS', label: 'Legacy Inbox · Legacy Documents', observed: [OR('206'), OR('280'), OR('287')], recommended_node: 'AIO_OFFICE.MORE.MESSAGES', rationale: 'Legacy surfaces superseded by Communications and the Document Vault; retire when lanes absorb them.', status: 'CANDIDATE_UNRESOLVED', resolution: null },
  { candidate_id: 'C-APPOINTMENTS', label: 'Appointments', observed: [OR('220-221')], recommended_node: 'AIO_OFFICE.MORE.MESSAGES', rationale: 'Client scheduling sits with communication.', status: 'CANDIDATE_UNRESOLVED', resolution: null },
  { candidate_id: 'C-CLIENT-ROAD-READY', label: 'Client Road Ready / onboarding', observed: [CR('300-301'), `${SRC}/product-graph/generated/runtimeProductGraph.json families F04 nav MY BUSINESS`], recommended_node: 'CLIENT_OFFICE.OPERATIONS.ROAD_READY', rationale: 'Road Ready is an engagement with a state, not a permanent record.', status: 'RESOLVED', resolution: 'D-ROAD-READY-PLACEMENT: SERVICES → ROAD READY while available, OPERATIONS → ROAD READY while active; completed records go to MY BUSINESS, VAULT, OPERATIONS, FINANCES.' },
  { candidate_id: 'C-CLIENT-START-BUSINESS', label: 'Start Your Business (formation journey)', observed: [CR('252-256')], recommended_node: 'CLIENT_OFFICE.SERVICES.REQUEST_A_SERVICE', rationale: 'Public / pre-client journey; inside the client office it is a requestable service.', status: 'CANDIDATE_UNRESOLVED', resolution: null },
  { candidate_id: 'C-CLIENT-CALENDAR', label: 'Client Calendar · Renewals', observed: [CR('306-307')], recommended_node: 'CLIENT_OFFICE.OPERATIONS.COMPLIANCE', rationale: 'Dates are compliance work for the client; notifications live in INBOX.', status: 'CANDIDATE_UNRESOLVED', resolution: null },
  { candidate_id: 'C-SHIPPER-DRIVER-PROVIDER', label: 'Shipper · Driver · FleetCare provider portals', observed: [CR('365-406')], recommended_node: null, rationale: 'Separate role projections (product graph role_projections), not CLIENT OFFICE destinations.', status: 'CANDIDATE_UNRESOLVED', resolution: null },
];

/* ════════════════════════════════ firewall · MORE rules · open questions ════════════════════════════════ */

export const AIO_IA_FIREWALL: IaFirewallItem[] = [
  { item: 'INTAKE', node_ids: ['AIO_OFFICE.INTAKE'], reason: 'Staff / founder only; the client shell never shows INTAKE.' },
  { item: 'Migration extraction · classification confidence', node_ids: ['AIO_OFFICE.INTAKE.EXTRACTION_CLASSIFICATION'], reason: 'Internal pipeline state.' },
  { item: 'Client matching tools', node_ids: ['AIO_OFFICE.INTAKE.MATCH_RECONCILE'], reason: 'Cross-client identity decisions.' },
  { item: 'Founder review', node_ids: ['AIO_OFFICE.INTAKE.FOUNDER_REVIEW'], reason: 'Internal approval.' },
  { item: 'Internal queue states · production blockers', node_ids: ['AIO_OFFICE.WORK', 'AIO_OFFICE.HOME.BLOCKERS', 'AIO_OFFICE.WORK.FILING_FUEL_TAXES.FILING_QUEUE'], reason: 'Staff buckets (NEEDS REVIEW, BLOCKED …) are projected to clients only as client-safe states.' },
  { item: 'Internal brokerage / load financials', node_ids: ['AIO_OFFICE.WORK.BROKERAGE.LOAD_FINANCIALS'], reason: 'Margin and carrier pay.' },
  { item: 'Internal case management · compliance cases', node_ids: ['AIO_OFFICE.WORK.COMPLIANCE.COMPLIANCE_CASES', 'AIO_OFFICE.WORK.COMPLIANCE.AUDIT_CORRECTIVE_WORK'], reason: 'Internal handling.' },
  { item: 'Cross-client views', node_ids: ['AIO_OFFICE.HOME', 'AIO_OFFICE.MORE.CLIENTS', 'AIO_OFFICE.REPORTS.CLIENTS'], reason: 'A client sees only itself.' },
  { item: 'Staff operations metrics', node_ids: ['AIO_OFFICE.REPORTS', 'AIO_OFFICE.MORE.TEAM_STAFF'], reason: 'Internal performance.' },
  { item: 'Staff notes', node_ids: ['AIO_OFFICE.WORK.FILING_FUEL_TAXES.IFTA'], reason: 'IFTA NOTES is a staff tab; clients write through MESSAGE AIO.' },
  { item: 'Internal margin, commission, profitability, staff-only financial data', node_ids: ['AIO_OFFICE.REPORTS.FINANCIAL_REVENUE'], reason: 'Clients see only client-safe billing in FINANCES → FEES / PAYMENTS (D-GROWTH-BILLING).' },
  { item: 'Growth / CRM (leads, pipeline, sales activity)', node_ids: ['AIO_OFFICE.MORE.GROWTH_CRM'], reason: 'Internal sales data.' },
];

export const AIO_IA_MORE_RULES: OfficeInformationArchitecture['more_rules'] = {
  container_node: 'AIO_OFFICE.MORE',
  may_contain_roles: ['SECONDARY'],
  must_not_contain_roles: ['PRODUCTION', 'ENTRY', 'COMMAND', 'PROJECTION'],
  rule: 'If an item drives daily client-service production it belongs in WORK. If it is administration, a directory, a tool, settings or lower-frequency, it may live in MORE. Internal business operations that are not client-service production — GROWTH / CRM and BILLING — live in MORE by founder decision (HOME may project them, REPORTS may aggregate them; root status only from usage data). Root-nav space is never a reason to move client-service production into MORE.',
  exclusions: [
    { item: 'Mechanic / maintenance tickets', belongs_in: 'AIO_OFFICE.WORK.MECHANIC_MAINTENANCE', reason: 'Production. MORE keeps only the provider directory (MECHANIC NETWORK).' },
    { item: 'Filing / IFTA work', belongs_in: 'AIO_OFFICE.WORK.FILING_FUEL_TAXES', reason: 'Production (the old root FILING).' },
    { item: 'Dispatch loads · brokerage shipments', belongs_in: 'AIO_OFFICE.WORK', reason: 'Production.' },
    { item: 'Migration intake', belongs_in: 'AIO_OFFICE.INTAKE', reason: 'Entry work has its own root.' },
    { item: 'Client document review per service', belongs_in: 'AIO_OFFICE.WORK', reason: 'Production of the owning lane; the vault directory stays in MORE.' },
  ],
};

export const AIO_IA_OPEN_QUESTIONS: IaOpenQuestion[] = [
  { question_id: 'Q-CLIENT-HUB', question: 'Is the client hub (today MY OFFICE at /portal) the CLIENT OFFICE landing outside the seven roots, or should a hub be a destination?', recommendation: 'Landing outside the roots (recorded as CLIENT_OFFICE.HUB, CANDIDATE_UNRESOLVED).', blocks: 'client nav implementation' , status: 'DECIDED', decision_id: 'D-CLIENT-HUB' },
  { question_id: 'Q-COMPLIANCE-SPLIT', question: 'The Brain COMPLIANCE workspace bundles operating authority + BOC-3 + safety, but the founder tree puts authority and BOC-3 under PERMITTING & AUTHORITIES. Split the workspace?', recommendation: 'Split into AUTHORITIES (authority · BOC-3) and COMPLIANCE (safety) in the data sprint; until then the lane maps to the COMPLIANCE workspace.', blocks: 'entitlement resolution for the PERMITTING & AUTHORITIES lane' , status: 'DECIDED', decision_id: 'D-COMPLIANCE-ONE-LANE' },
  { question_id: 'Q-STAFF-VEHICLES', question: 'Vehicle management has a client destination but no staff lane. Keep it distributed (Dispatch → Trucks, Mechanic → Maintenance Status, Client 360) or add a lane?', recommendation: 'Keep distributed; add a client-record fleet tab in Client 360.', blocks: 'nothing in this sprint' , status: 'DECIDED', decision_id: 'D-VEHICLES-FLEET-LANE' },
  { question_id: 'Q-FOUNDER-ROLE', question: 'No founder role exists. Founder = OfficeStaffRole owner / Supabase super_admin?', recommendation: 'Founder = owner (open since the office architecture sprint).', blocks: 'founder-only visibility (none is asserted in this IA; founder and staff see the same tree)' , status: 'DECIDED', decision_id: 'D-FOUNDER-ROLE' },
  { question_id: 'Q-GROWTH-BILLING', question: 'Where do Growth (CRM) and the Billing Desk live: WORK lanes, MORE entries or REPORTS sources?', recommendation: 'Billing operations and CRM as WORK lanes if they drive daily production; revenue in REPORTS.', blocks: 'desktop sidebar regrouping' , status: 'DECIDED', decision_id: 'D-GROWTH-BILLING' },
  { question_id: 'Q-CLIENT-ROAD-READY', question: 'Where does Road Ready live in the client office?', recommendation: 'MY BUSINESS (readiness of the business record).', blocks: 'client nav implementation' , status: 'DECIDED', decision_id: 'D-ROAD-READY-PLACEMENT' },
];

/* ════════════════════════════════ founder decisions (2026-10-08) ════════════════════════════════ */

const DECIDED = '2026-10-08';
export const AIO_IA_DECISIONS: IaDecision[] = [
  {
    decision_id: 'D-CLIENT-HUB', question_id: 'Q-CLIENT-HUB', decided_on: DECIDED,
    decision: 'The CLIENT HUB / OVERVIEW is the shell-level landing of CLIENT OFFICE, not an eighth root tab. The client enters through it; it projects the seven destinations (business status, work in progress, items needing approval, upcoming deadlines, recent messages, active services, recent documents, contextual next action). MY BUSINESS stays a root destination and is not the dashboard. HUB = projection / orientation; destinations = workspaces.',
    consequences: ['CLIENT_OFFICE.HUB is ARCHITECTURALLY_CANONICAL (LANDING, role PROJECTION) with eight regions', 'Client root nav unchanged: seven destinations', 'Added to the root nav only if future UX testing proves it necessary'],
    node_ids: ['CLIENT_OFFICE.HUB', 'CLIENT_OFFICE.MY_BUSINESS'],
  },
  {
    decision_id: 'D-COMPLIANCE-ONE-LANE', question_id: 'Q-COMPLIANCE-SPLIT', decided_on: DECIDED,
    decision: 'No split: one canonical COMPLIANCE lane (DOT / Safety · Expirations · Audit / Corrective Work · Compliance Cases), because these functions share client, vehicle, driver, document, deadline and case context. Split later only if operational volume proves a separate lane is needed. CLIENT OFFICE → OPERATIONS → COMPLIANCE shows client-safe subsections only.',
    consequences: ['One COMPLIANCE lane and one COMPLIANCE workspace; the authority / BOC-3 sections in PERMITTING & AUTHORITIES keep entitling through it'],
    node_ids: ['AIO_OFFICE.WORK.COMPLIANCE', 'CLIENT_OFFICE.OPERATIONS.COMPLIANCE', 'AIO_OFFICE.WORK.PERMITTING_AUTHORITIES.OPERATING_AUTHORITIES'],
  },
  {
    decision_id: 'D-VEHICLES-FLEET-LANE', question_id: 'Q-STAFF-VEHICLES', decided_on: DECIDED,
    decision: 'Yes: WORK → VEHICLES & FLEET is a canonical staff lane — the operational vehicle backbone, not a subsection of Dispatch or Compliance. It cross-links rather than duplicates source truth with DISPATCH, COMPLIANCE, IFTA / FUEL TAX, INSURANCE, MECHANIC / MAINTENANCE and DRIVERS & CARRIERS. Staff service lanes go from 11 to 12. Client equivalent stays OPERATIONS → VEHICLE MANAGEMENT.',
    consequences: ['New lane AIO_OFFICE.WORK.VEHICLES_FLEET (implementation not started)', 'Vehicle Management service now has a staff home', 'AIO_VEHICLES_FLEET_SCOPE: what the lane owns vs shows by cross-link'],
    node_ids: ['AIO_OFFICE.WORK.VEHICLES_FLEET', 'CLIENT_OFFICE.OPERATIONS.VEHICLE_MANAGEMENT'],
  },
  {
    decision_id: 'D-FOUNDER-ROLE', question_id: 'Q-FOUNDER-ROLE', decided_on: DECIDED,
    decision: 'FOUNDER is an explicit privileged internal actor class — an explicitly authorized company principal with company-wide authority across AIO OFFICE — never a hard-coded person, name or email. STAFF does not inherit FOUNDER authority and cannot self-elevate. More than one founder / principal must be possible without redesigning permissions.',
    consequences: ['AIO_IA_ACTORS defines FOUNDER / STAFF / CLIENT', 'Founder-only acts recorded per node (founder_authority)', 'Founder-class visibility (reporting, internal financials, system settings) is BY_GRANT for staff'],
    node_ids: ['AIO_OFFICE.INTAKE.FOUNDER_REVIEW', 'AIO_OFFICE.INTAKE.PREBUILT_CLIENT', 'AIO_OFFICE.INTAKE.ACTIVATION_INVITE', 'AIO_OFFICE.REPORTS', 'AIO_OFFICE.REPORTS.FINANCIAL_REVENUE', 'AIO_OFFICE.MORE.TEAM_STAFF', 'AIO_OFFICE.MORE.SYSTEM_SETTINGS', 'AIO_OFFICE.MORE.SERVICE_CATALOG'],
  },
  {
    decision_id: 'D-GROWTH-BILLING', question_id: 'Q-GROWTH-BILLING', decided_on: DECIDED,
    decision: 'Neither is a client-service production lane. GROWTH / CRM lives at MORE → GROWTH / CRM (HOME may project new leads, follow-ups due, conversions, opportunities; HOME owns no CRM state). BILLING lives at MORE → BILLING; REPORTS → FINANCIAL / REVENUE may aggregate it but owns no invoice or payment production. Client-facing billing, when supported, is FINANCES with client-safe information only — never internal margin, commission, profitability or staff-only financial data.',
    consequences: ['MORE gains GROWTH / CRM and BILLING (11 entries)', 'Candidates C-CRM-GROWTH and C-BILLING-DESK resolved', 'Root-nav status reconsidered only from usage data'],
    node_ids: ['AIO_OFFICE.MORE.GROWTH_CRM', 'AIO_OFFICE.MORE.BILLING', 'AIO_OFFICE.REPORTS.FINANCIAL_REVENUE', 'CLIENT_OFFICE.FINANCES.FEES_PAYMENTS'],
  },
  {
    decision_id: 'D-ROAD-READY-PLACEMENT', question_id: 'Q-CLIENT-ROAD-READY', decided_on: DECIDED,
    decision: 'Road Ready placement depends on state. Available but not active: SERVICES → ROAD READY. Active: OPERATIONS → ROAD READY (the actual workspace). Completed: historically accessible through service history, with resulting records distributed into MY BUSINESS, VAULT, OPERATIONS and FINANCES; SERVICES may show ROAD READY · COMPLETED but is never the permanent container.',
    consequences: ['New client nodes OPERATIONS.ROAD_READY and SERVICES.ROAD_READY (STATE)', 'Road Ready service state placements', 'Candidate C-CLIENT-ROAD-READY resolved'],
    node_ids: ['CLIENT_OFFICE.OPERATIONS.ROAD_READY', 'CLIENT_OFFICE.SERVICES.ROAD_READY'],
  },
];

/** The actor classes (D-FOUNDER-ROLE). */
export const AIO_IA_ACTORS: IaActorDefinition[] = [
  {
    actor: 'FOUNDER', actor_class: 'PRIVILEGED_INTERNAL', multiplicity: 'ONE_OR_MORE', inherits: ['STAFF'], can_self_elevate: false,
    definition: 'An explicitly authorized company principal with company-wide authority across AIO OFFICE.',
    identity_rule: 'A role / actor class granted explicitly — never a hard-coded person, name or email. More than one founder / principal is possible without redesigning permissions.',
    privileges: [
      { privilege: 'All-client visibility', node_ids: ['AIO_OFFICE.MORE.CLIENTS', 'AIO_OFFICE.HOME'], note: '' },
      { privilege: 'All-service visibility', node_ids: ['AIO_OFFICE.WORK'], note: '' },
      { privilege: 'Founder review', node_ids: ['AIO_OFFICE.INTAKE.FOUNDER_REVIEW'], note: '' },
      { privilege: 'PREBUILT review / activation authority', node_ids: ['AIO_OFFICE.INTAKE.PREBUILT_CLIENT', 'AIO_OFFICE.INTAKE.ACTIVATION_INVITE'], note: 'Client confirmation remains the gate before ACTIVE.' },
      { privilege: 'High-risk overrides', node_ids: [], note: 'Defined per action in the authority-contract sprint.' },
      { privilege: 'Internal financial visibility', node_ids: ['AIO_OFFICE.REPORTS.FINANCIAL_REVENUE', 'AIO_OFFICE.MORE.BILLING', 'AIO_OFFICE.WORK.BROKERAGE.LOAD_FINANCIALS'], note: 'Staff only by grant.' },
      { privilege: 'Reporting', node_ids: ['AIO_OFFICE.REPORTS'], note: 'Staff only by grant.' },
      { privilege: 'Staff / permission administration', node_ids: ['AIO_OFFICE.MORE.TEAM_STAFF'], note: '' },
      { privilege: 'System configuration', node_ids: ['AIO_OFFICE.MORE.SYSTEM_SETTINGS'], note: '' },
      { privilege: 'Service configuration', node_ids: ['AIO_OFFICE.MORE.SERVICE_CATALOG'], note: '' },
      { privilege: 'Founder-only approvals where defined', node_ids: [], note: 'Defined per action in the authority-contract sprint.' },
    ],
    current_code_mapping: `No FOUNDER role in code yet. Nearest today: OfficeStaffRole owner (${SRC}/office-core/officeWorkTypes.ts:4-16; ROLE_PERMISSIONS ${SRC}/office-core/officeContext.ts:74) and Supabase aio_internal_role super_admin (all-in-one-enterprises/supabase/migrations/20260815100000_aio_identity_foundation.sql:28-29). No founder identity is hard-coded.`,
  },
  {
    actor: 'STAFF', actor_class: 'INTERNAL', multiplicity: 'MANY', inherits: [], can_self_elevate: false,
    definition: 'AIO team members working in AIO OFFICE within the permissions granted to them.',
    identity_rule: 'Staff role plus explicit permission grants. Never inherits FOUNDER authority; BY_GRANT nodes need a grant.',
    privileges: [],
    current_code_mapping: `OfficeStaffRole + ROLE_PERMISSIONS (${SRC}/office-core/officeContext.ts:74) · Supabase aio_internal_role.`,
  },
  {
    actor: 'CLIENT', actor_class: 'CLIENT', multiplicity: 'MANY', inherits: [], can_self_elevate: false,
    definition: 'Users of one client organisation, inside CLIENT OFFICE only.',
    identity_rule: 'Authenticated membership of the client organisation (the session organisation is the only client).',
    privileges: [],
    current_code_mapping: `CustomerRouteGuard + ClientPortalLifecycleGuard (${SRC}/auth/guards/ClientPortalLifecycleGuard.tsx:22-40).`,
  },
];

/** VEHICLES & FLEET (D-VEHICLES-FLEET-LANE): what the lane owns and what it shows by cross-link to the owning lane. */
export const AIO_VEHICLES_FLEET_SCOPE: { item: string; relation: 'OWNS' | 'CROSS_LINK'; source_of_truth: string; note: string }[] = [
  { item: 'Vehicle roster', relation: 'OWNS', source_of_truth: 'AIO_OFFICE.WORK.VEHICLES_FLEET', note: 'PowerUnit / Trailer records.' },
  { item: 'Vehicle profiles', relation: 'OWNS', source_of_truth: 'AIO_OFFICE.WORK.VEHICLES_FLEET', note: 'VIN, plate, GVWR, ownership.' },
  { item: 'Availability / out-of-service state', relation: 'OWNS', source_of_truth: 'AIO_OFFICE.WORK.VEHICLES_FLEET', note: 'PowerUnit.status active / inactive / sold (roadReadyTypes.ts:125); Dispatch reads it; out-of-service orders come from COMPLIANCE → DOT / SAFETY.' },
  { item: 'Registration state', relation: 'OWNS', source_of_truth: 'AIO_OFFICE.WORK.VEHICLES_FLEET', note: 'A vehicle attribute (plate, plate state, registration expiry). The registration work (IRP / tags requests) is PERMITTING → TAGS / REGISTRATION. Today no vehicle record holds a registration expiry — it is derived from vault documents.' },
  { item: 'Credentials / documents', relation: 'CROSS_LINK', source_of_truth: 'AIO_OFFICE.MORE.DOCUMENTS_VAULT', note: '' },
  { item: 'Assigned driver', relation: 'CROSS_LINK', source_of_truth: 'AIO_OFFICE.WORK.DRIVERS_CARRIERS', note: '' },
  { item: 'Insurance state', relation: 'CROSS_LINK', source_of_truth: 'AIO_OFFICE.WORK.INSURANCE.POLICIES', note: '' },
  { item: 'IFTA relevance', relation: 'CROSS_LINK', source_of_truth: 'AIO_OFFICE.WORK.FILING_FUEL_TAXES.IFTA', note: '' },
  { item: 'Compliance status', relation: 'CROSS_LINK', source_of_truth: 'AIO_OFFICE.WORK.COMPLIANCE', note: '' },
  { item: 'Maintenance state', relation: 'CROSS_LINK', source_of_truth: 'AIO_OFFICE.WORK.MECHANIC_MAINTENANCE.MAINTENANCE_STATUS', note: '' },
  { item: 'Service history', relation: 'CROSS_LINK', source_of_truth: 'AIO_OFFICE.WORK.MECHANIC_MAINTENANCE.TICKETS', note: '' },
  { item: 'Warnings / expirations', relation: 'CROSS_LINK', source_of_truth: 'AIO_OFFICE.WORK.COMPLIANCE.EXPIRATIONS', note: '' },
];

/* ════════════════════════════════ approved migration authorities (re-associated, never regenerated) ════════════════════════════════ */

/** The migration authority set as its manifest states it; fsbw tests hold this record to the manifest. */
export const AIO_MIGRATION_AUTHORITY_SET = {
  manifest: `${FS} AIO_CLIENT_MIGRATION_AUTHORITY/authority-manifest.json`,
  total: 42,
  approved: 40,
  founder_review_required: ['AIO-MIG-ACTIVATION-COMPLETE-002'],
  superseded: [{ authority_id: 'AIO-MIG-ACTIVATION-COMPLETE-001', superseded_by: 'AIO-MIG-ACTIVATION-COMPLETE-002', note: 'Old arrival plate (it drew the staff dock on a client screen). Kept on disk as lineage; associated with no node.' }],
  rule: 'Staff screens are re-associated under AIO OFFICE → INTAKE (their section); client activation screens under the CLIENT OFFICE activation gate. Each current authority sits on exactly one node.',
} as const;

/* ════════════════════════════════ HOME / WORK / REPORTS contracts (truth, never invented) ════════════════════════════════ */

/** What the founder requires HOME to support → the region that carries it. */
export const AIO_HOME_REQUIREMENTS: { requirement: string; regions: string[] }[] = [
  { requirement: 'Cross-client status', regions: ['AIO_OFFICE.HOME.NEEDS_ATTENTION', 'AIO_OFFICE.HOME.CLIENTS_IN_MOTION'] },
  { requirement: 'Cross-service status', regions: ['AIO_OFFICE.HOME.WORK_ACROSS_AIO'] },
  { requirement: 'Urgent actions', regions: ['AIO_OFFICE.HOME.NEEDS_ATTENTION'] },
  { requirement: 'Deadlines', regions: ['AIO_OFFICE.HOME.DEADLINES'] },
  { requirement: 'Blockers', regions: ['AIO_OFFICE.HOME.BLOCKERS'] },
  { requirement: 'Recent production activity', regions: ['AIO_OFFICE.HOME.RECENT_ACTIVITY'] },
  { requirement: 'Quick entry into a client or workspace', regions: ['AIO_OFFICE.HOME.QUICK_ACTIONS'] },
];

/** The founder's own examples of projection vs ownership (illustrative counts, not data). */
export const AIO_PROJECTION_EXAMPLES: { surface: string; says: string; region: string; owner: string }[] = [
  { surface: 'HOME', says: '4 IFTA cases need attention', region: 'AIO_OFFICE.HOME.NEEDS_ATTENTION', owner: 'AIO_OFFICE.WORK.FILING_FUEL_TAXES.FILING_QUEUE' },
  { surface: 'HOME', says: '3 dispatch exceptions', region: 'AIO_OFFICE.HOME.BLOCKERS', owner: 'AIO_OFFICE.WORK.DISPATCH.STATUS_EXCEPTIONS' },
  { surface: 'HOME', says: '2 bookkeeping clients waiting on reconciliation', region: 'AIO_OFFICE.HOME.BLOCKERS', owner: 'AIO_OFFICE.WORK.BOOKKEEPING.RECONCILIATION' },
  { surface: 'HOME', says: 'Follow-ups due', region: 'AIO_OFFICE.HOME.NEEDS_ATTENTION', owner: 'AIO_OFFICE.MORE.GROWTH_CRM' },
  { surface: 'REPORTS', says: 'Brokerage historical performance / volume / exports', region: 'AIO_OFFICE.REPORTS.DISPATCH_BROKERAGE', owner: 'AIO_OFFICE.WORK.BROKERAGE.SHIPMENTS' },
  { surface: 'REPORTS', says: 'Revenue from billing over time', region: 'AIO_OFFICE.REPORTS.FINANCIAL_REVENUE', owner: 'AIO_OFFICE.MORE.BILLING' },
];

/** WORK authority contract: the capabilities the founder requires, each with today's implementation truth. */
export const AIO_WORK_CAPABILITIES: { capability: string; implementation: ImplementationStatus; depth: ImplementationDepth; evidence: string[]; note: string }[] = [
  { capability: 'Service lane navigation', implementation: 'IMPLEMENTATION_PARTIAL', depth: 'FUNCTIONAL_DEMO', evidence: [`${SRC}/office/layouts/AIOOfficeLayout.tsx:13-118 (sidebar groups)`], note: 'Each lane has its own /office routes in the desktop sidebar (VEHICLES & FLEET has none yet); nothing groups the twelve lanes under WORK.' },
  { capability: 'Cross-client filtering', implementation: 'IMPLEMENTATION_PARTIAL', depth: 'FUNCTIONAL_DEMO', evidence: [`${SRC}/ifta/ui/IftaStaffQueuePage.tsx:17 QUEUE_TABS`, `${SRC}/office/pages/DivisionOpsPages.tsx:14-31 (all clients, no filter)`], note: 'Lists span all clients; only the IFTA queue filters (by bucket).' },
  { capability: 'Client-specific drilldown', implementation: 'IMPLEMENTATION_PARTIAL', depth: 'FUNCTIONAL_DEMO', evidence: [OR('274'), OR('190-192')], note: 'Client 360 and the IFTA client case.' },
  { capability: 'Active case / work item access', implementation: 'IMPLEMENTATION_PARTIAL', depth: 'FUNCTIONAL_DEMO', evidence: [OR('190-192'), OR('277'), OR('298-304')], note: 'IFTA case, generic request detail, dispatch load detail.' },
  { capability: 'Status', implementation: 'IMPLEMENTATION_PARTIAL', depth: 'FUNCTIONAL_DEMO', evidence: [`${SRC}/ifta/iftaDerive.ts:528 staffBucket`, `${SRC}/office-core/officeWorkTypes.ts:123-124 status · statusLabel`], note: 'Per domain; no shared lane status.' },
  { capability: 'Blockers', implementation: 'IMPLEMENTATION_PARTIAL', depth: 'FUNCTIONAL_DEMO', evidence: [`${SRC}/ifta/iftaDerive.ts:520 BLOCKED bucket`, `${SRC}/office-core/officeWorkTypes.ts:128 waitingOn`], note: 'No cross-lane blocker model.' },
  { capability: 'Deadlines', implementation: 'IMPLEMENTATION_PARTIAL', depth: 'FUNCTIONAL_DEMO', evidence: [OR('279'), `${SRC}/demo/demoTypes.ts:408 Deadline`], note: 'Deadline Center spans services (incl. ifta_filing).' },
  { capability: 'Assignments (where supported)', implementation: 'IMPLEMENTATION_PARTIAL', depth: 'FUNCTIONAL_DEMO', evidence: [`${SRC}/office-core/officeWorkTypes.ts:125-126 assignedUserId · assignedTeamId`, `${SRC}/ifta/iftaTypes.ts:155 assignedStaffId`], note: 'Work items and IFTA quarters carry an assignee; no assignment surface per lane.' },
  { capability: 'Route to the canonical client × workspace case', implementation: 'IMPLEMENTATION_PARTIAL', depth: 'FUNCTIONAL_DEMO', evidence: [OR('190-192')], note: 'Only IFTA has a canonical case route (AIO:{client}:IFTA:IFTA_QUARTER:{YYYY-Qn}); other lanes open generic request ids.' },
];

/** The founder's contextual expansion rule → the Brain mechanism that already enforces it (operating-environment.ts). */
export const AIO_EXPANSION_CRITERIA: { founder_rule: string; kind: 'SUGGEST_ONLY_WHEN' | 'SUPPRESS_WHEN'; brain_mechanism: string }[] = [
  { founder_rule: 'relevant', kind: 'SUGGEST_ONLY_WHEN', brain_mechanism: 'ExpansionRule when_active_any + requires (signal conditions) must match the client; NO_MATCHING_RULE otherwise' },
  { founder_rule: 'timely', kind: 'SUGGEST_ONLY_WHEN', brain_mechanism: 'placement + current workspace in the ExpansionTrigger' },
  { founder_rule: 'explainable', kind: 'SUGGEST_ONLY_WHEN', brain_mechanism: 'ExpansionRule.reasons + grounded_in; every evaluation carries reasons and its rule id' },
  { founder_rule: 'non-intrusive', kind: 'SUGGEST_ONLY_WHEN', brain_mechanism: 'PLACEMENT_NOT_ALLOWED — only approved placements' },
  { founder_rule: 'actionable', kind: 'SUGGEST_ONLY_WHEN', brain_mechanism: 'ExpansionRule.cta (label + action)' },
  { founder_rule: 'truthful', kind: 'SUGGEST_ONLY_WHEN', brain_mechanism: 'MISLEADING · CONFLICTING_SERVICE_STATE suppress' },
  { founder_rule: 'already active', kind: 'SUPPRESS_WHEN', brain_mechanism: 'ALREADY_OWNED' },
  { founder_rule: 'unavailable', kind: 'SUPPRESS_WHEN', brain_mechanism: 'SERVICE_UNAVAILABLE' },
  { founder_rule: 'not applicable', kind: 'SUPPRESS_WHEN', brain_mechanism: 'NOT_APPLICABLE' },
  { founder_rule: 'source truth is insufficient', kind: 'SUPPRESS_WHEN', brain_mechanism: 'ELIGIBILITY_UNKNOWN · REQUIRED_DATA_MISSING' },
  { founder_rule: 'would distract from urgent work', kind: 'SUPPRESS_WHEN', brain_mechanism: 'CRITICAL_STATE · ERROR_RECOVERY' },
];

/* ════════════════════════════════ product graph crosswalk (fsbw runtime graph → IA) ════════════════════════════════ */

/**
 * How the fsbw runtime product graph (families F01–F18, customer containers, role projections) lands in the IA. The graph
 * itself is generated and is not edited; fsbw vendors the IA as an overlay and its tests hold this map to the graph.
 */
export const AIO_IA_PRODUCT_GRAPH_MAP = {
  source: `${FS} all-in-one-enterprises/src/product-graph/generated/runtimeProductGraph.json (meta.sprint P0.AIO.WAVE-0-CANONICAL-GRAPH-AND-ROUTE-META)`,
  containers: [
    { container: 'MY_OFFICE', ia_node: 'CLIENT_OFFICE.HUB', disposition: 'REMAPPED', note: 'The HUB / OVERVIEW: shell landing, not a root destination (D-CLIENT-HUB).' },
    { container: 'MY_BUSINESS', ia_node: 'CLIENT_OFFICE.MY_BUSINESS', disposition: 'KEPT', note: 'Loses F12 Insurance to FINANCES.' },
    { container: 'OPERATIONS', ia_node: 'CLIENT_OFFICE.OPERATIONS', disposition: 'KEPT', note: '' },
    { container: 'FINANCES', ia_node: 'CLIENT_OFFICE.FINANCES', disposition: 'KEPT', note: 'Gains F12 Insurance.' },
    { container: 'VAULT', ia_node: 'CLIENT_OFFICE.VAULT', disposition: 'KEPT', note: '' },
    { container: 'INBOX', ia_node: 'CLIENT_OFFICE.INBOX', disposition: 'KEPT', note: '' },
    { container: 'SERVICES', ia_node: 'CLIENT_OFFICE.SERVICES', disposition: 'KEPT', note: 'A client root destination (the carrier portal nav has no SERVICES section today).' },
    { container: 'ACCOUNT', ia_node: 'CLIENT_OFFICE.ACCOUNT', disposition: 'KEPT', note: '' },
  ],
  /** graph_nav is the family's nav container in the graph today; client_node / staff_node are where it lives in the IA. */
  families: [
    { family: 'F01', name: 'Entry', graph_nav: null, client_node: null, staff_node: null, note: 'Public site (AIO.PUBLIC_SITE) — outside both offices.' },
    { family: 'F02', name: 'Get Started', graph_nav: null, client_node: null, staff_node: null, note: 'Public site (AIO.PUBLIC_SITE) — outside both offices.' },
    { family: 'F03', name: 'Start Your Business', graph_nav: 'MY BUSINESS', client_node: 'CLIENT_OFFICE.SERVICES.REQUEST_A_SERVICE', staff_node: 'AIO_OFFICE.WORK.PERMITTING_AUTHORITIES.LLC_INC', note: 'Candidate placement (C-CLIENT-START-BUSINESS).' },
    { family: 'F04', name: 'Road Ready', graph_nav: 'MY BUSINESS', client_node: 'CLIENT_OFFICE.OPERATIONS.ROAD_READY', staff_node: 'AIO_OFFICE.WORK.ROAD_READY', note: 'REMAPPED out of MY BUSINESS: OPERATIONS while active, SERVICES while available (D-ROAD-READY-PLACEMENT).' },
    { family: 'F05', name: 'My Office', graph_nav: 'MY OFFICE', client_node: 'CLIENT_OFFICE.HUB', staff_node: null, note: 'The HUB / OVERVIEW landing, not a root destination (D-CLIENT-HUB).' },
    { family: 'F06', name: 'Services', graph_nav: 'SERVICES', client_node: 'CLIENT_OFFICE.SERVICES', staff_node: 'AIO_OFFICE.WORK.PERMITTING_AUTHORITIES', note: 'F06 also carries IFTA (WORK → FILING & FUEL TAXES) and compliance (WORK → COMPLIANCE).' },
    { family: 'F07', name: 'Operations', graph_nav: 'OPERATIONS', client_node: 'CLIENT_OFFICE.OPERATIONS.DISPATCH', staff_node: 'AIO_OFFICE.WORK.DISPATCH', note: '' },
    { family: 'F08', name: 'Load Board', graph_nav: 'OPERATIONS', client_node: 'CLIENT_OFFICE.OPERATIONS.DISPATCH', staff_node: 'AIO_OFFICE.WORK.DISPATCH', note: '' },
    { family: 'F09', name: 'Brokerage', graph_nav: 'OPERATIONS', client_node: 'CLIENT_OFFICE.OPERATIONS.BROKERAGE', staff_node: 'AIO_OFFICE.WORK.BROKERAGE', note: '' },
    { family: 'F10', name: 'Finances', graph_nav: 'FINANCES', client_node: 'CLIENT_OFFICE.FINANCES', staff_node: 'AIO_OFFICE.REPORTS.FINANCIAL_REVENUE', note: '' },
    { family: 'F11', name: 'Factoring', graph_nav: 'FINANCES', client_node: 'CLIENT_OFFICE.FINANCES.FACTORING', staff_node: 'AIO_OFFICE.WORK.FACTORING', note: '' },
    { family: 'F12', name: 'Insurance', graph_nav: 'MY BUSINESS', client_node: 'CLIENT_OFFICE.FINANCES.INSURANCE', staff_node: 'AIO_OFFICE.WORK.INSURANCE', note: 'REMAPPED: MY BUSINESS → FINANCES.' },
    { family: 'F13', name: 'Bookkeeping', graph_nav: 'FINANCES', client_node: 'CLIENT_OFFICE.FINANCES.BOOKKEEPING', staff_node: 'AIO_OFFICE.WORK.BOOKKEEPING', note: '' },
    { family: 'F14', name: 'FleetCare', graph_nav: 'OPERATIONS', client_node: 'CLIENT_OFFICE.OPERATIONS.MAINTENANCE', staff_node: 'AIO_OFFICE.WORK.MECHANIC_MAINTENANCE', note: '' },
    { family: 'F15', name: 'DriverLink', graph_nav: 'OPERATIONS', client_node: 'CLIENT_OFFICE.OPERATIONS.DRIVER_MANAGEMENT', staff_node: 'AIO_OFFICE.WORK.DRIVERS_CARRIERS', note: '' },
    { family: 'F16', name: 'Vault', graph_nav: 'VAULT', client_node: 'CLIENT_OFFICE.VAULT', staff_node: 'AIO_OFFICE.MORE.DOCUMENTS_VAULT', note: '' },
    { family: 'F17', name: 'Inbox', graph_nav: 'INBOX', client_node: 'CLIENT_OFFICE.INBOX', staff_node: 'AIO_OFFICE.MORE.MESSAGES', note: '' },
    { family: 'F18', name: 'Account', graph_nav: 'ACCOUNT', client_node: 'CLIENT_OFFICE.ACCOUNT', staff_node: null, note: 'Client account; staff account is MORE → ACCOUNT (no page yet).' },
  ],
  role_projections: [
    { projection: 'AIO_OFFICE', ia_node: 'AIO_OFFICE', note: 'Graph office nodes carry role_projection AIO_OFFICE and no container: one flat set. The IA adds the five roots, eleven lanes and their sections.' },
    { projection: 'SHIPPER', ia_node: null, note: 'Separate role portal, outside both offices (C-SHIPPER-DRIVER-PROVIDER).' },
    { projection: 'DRIVER', ia_node: null, note: 'Separate role portal, outside both offices (C-SHIPPER-DRIVER-PROVIDER).' },
    { projection: 'FLEETCARE_PROVIDER', ia_node: null, note: 'Separate role portal, outside both offices (C-SHIPPER-DRIVER-PROVIDER).' },
  ],
  /** Routes the IA cites as EXISTING that the generated graph predates (regenerate in the graph sprint — MIGRATE_LATER). */
  route_gaps: [
    { prefix: '/office/migration', reason: 'Migration studio routes were added after the graph was generated.' },
    { prefix: '/office/workspaces/ifta', reason: 'IFTA staff workspace routes were added after the graph was generated.' },
    { prefix: '/portal/workspaces/ifta', reason: 'IFTA client workspace routes were added after the graph was generated.' },
    { prefix: '/portal/activation', reason: 'Activation review route was added after the graph was generated.' },
    { prefix: '/office-activation', reason: 'Activation entry route was added after the graph was generated.' },
    { prefix: '/office/settings/*', reason: 'Route group cited as one entry; the graph lists each settings page.' },
    { prefix: '/office/system/*', reason: 'Route group cited as one entry; the graph lists each system page.' },
    { prefix: '/office', reason: 'The office index route is recorded in the graph by component, not as "/office".', exact: true },
    { prefix: '/portal/inbox/messages', reason: 'Present in the route meta registry only.', exact: true },
  ],
} as const;

/* ════════════════════════════════ the architecture ════════════════════════════════ */

export const AIO_OFFICE_IA: OfficeInformationArchitecture = {
  project_id: 'AIO',
  sprint: AIO_OFFICE_IA_SPRINT,
  lineage_id: AIO_OFFICE_IA_LINEAGE_ID,
  shells: AIO_IA_SHELLS,
  nodes: NODES,
  services: AIO_IA_SERVICES,
  supersessions: AIO_IA_SUPERSESSIONS,
  legacy: AIO_IA_LEGACY,
  candidates: AIO_IA_CANDIDATES,
  firewall: AIO_IA_FIREWALL,
  more_rules: AIO_IA_MORE_RULES,
  open_questions: AIO_IA_OPEN_QUESTIONS,
  actors: AIO_IA_ACTORS,
  decisions: AIO_IA_DECISIONS,
};

/** The founder's gate, as data (tests assert the tree against it). */
export const AIO_OFFICE_IA_QUALITY_GATE = {
  FOUNDER_ROOT_NAV: ['HOME', 'INTAKE', 'WORK', 'REPORTS', 'MORE'],
  CLIENT_ROOT_NAV: ['MY BUSINESS', 'OPERATIONS', 'FINANCES', 'VAULT', 'INBOX', 'SERVICES', 'ACCOUNT'],
  NEW_FILING_LOCATION: ['AIO OFFICE', 'WORK', 'Filing & Fuel Taxes'],
  NEW_IFTA_LOCATION: ['AIO OFFICE', 'WORK', 'Filing & Fuel Taxes', 'IFTA'],
  HOME_REGIONS: ['Needs Attention', 'Deadlines', 'Blockers', 'Work Across AIO', 'Clients in Motion', 'Recent Activity', 'Quick Actions', 'Business Pulse'],
  WORK_LANES: ['Permitting & Authorities', 'Filing & Fuel Taxes', 'Compliance', 'Vehicles & Fleet', 'Dispatch', 'Brokerage', 'Insurance', 'Factoring', 'Bookkeeping', 'Drivers & Carriers', 'Mechanic / Maintenance', 'Road Ready'],
  MORE_ENTRIES: ['Clients', 'Documents & Vault', 'Growth / CRM', 'Billing', 'Team & Staff', 'Service Catalog', 'Mechanic Network', 'Messages', 'System Settings', 'Help & Support', 'Account'],
  CLIENT_HUB_REGIONS: ['Business Status', 'Work in Progress', 'Items Needing Approval', 'Upcoming Deadlines', 'Recent Messages', 'Active Services', 'Recent Documents', 'Contextual Next Action'],
  REQUIRED_SERVICES: ['PERMITTING_AUTHORITIES', 'IFTA_FUEL_TAX', 'COMPLIANCE', 'DISPATCH', 'BROKERAGE', 'INSURANCE', 'FACTORING', 'BOOKKEEPING', 'DRIVERS_CARRIERS', 'VEHICLE_MANAGEMENT', 'MECHANIC_MAINTENANCE', 'ROAD_READY', 'DOCUMENTS_VAULT', 'MESSAGING'],
} as const;
