/**
 * AIO OFFICE / CLIENT OFFICE — the operating-environment layer for ALL IN ONE ENTERPRISES INC
 * (P0.AIO.OFFICE-WORKSPACE-ARCHITECTURE-AND-IFTA-TREE-FOUNDER-LOCK1).
 *
 * Founder decision: AIO services are WORKSPACES inside a connected business office.
 *   AIO OFFICE (founder / staff)  = CLIENT × WORKSPACE × SUBCONTEXT — client and workspace switch independently.
 *   CLIENT OFFICE (client)        = FIXED CLIENT × WORKSPACE × SUBCONTEXT — no client switcher.
 *   CASE = PROJECT + CLIENT + WORKSPACE + CASE TYPE + SUBCONTEXT — founder and client views project ONE case.
 *
 * Every workspace, entitlement source, route and signal below comes from the read-only forensic audit of
 * yoteenz/fsbw · all-in-one-enterprises @ AIO_OFFICE_AUDIT_SHA (refs are path:line). Nothing in AIO was changed.
 * Client records are the AIO DEMO SEED (proof fixtures only — never rendered as client data, never a fallback).
 */
import {
  ContextError,
  canonicalCaseKey,
  checkCaseUniqueness,
  enterFromClient,
  enterFromWorkspaceQueue,
  evaluateExpansion,
  openClientOffice,
  resolveContext,
  scopeRecords,
  switchClient,
  switchSubcontext,
  switchWorkspace,
  workspaceSwitcherOptions,
  type CaseRecord,
  type ClientRecord,
  type EntitlementSource,
  type ExpansionRule,
  type OfficeData,
  type OperatingEnvironment,
  type SwitcherContract,
  type WorkspaceDefinition,
  type WorkspaceState,
} from '../../operating-environment.js';

export const AIO_OFFICE_SPRINT = 'P0.AIO.OFFICE-WORKSPACE-ARCHITECTURE-AND-IFTA-TREE-FOUNDER-LOCK1';
export const AIO_OFFICE_AUDIT_SHA = '20438a24c7e0f8d48782684315e4f73e82d48111';
const SRC = 'all-in-one-enterprises/src';
const MIG = 'all-in-one-enterprises/supabase/migrations';

/* ─────────────────────────────── environments ─────────────────────────────── */

const SW_CLIENT: SwitcherContract = {
  switcher_id: 'AIO.SWITCHER.CLIENT', dimension: 'CLIENT', label: 'CLIENT', preserves: ['WORKSPACE'], re_resolves: ['CLIENT', 'SUBCONTEXT'],
  semantics: 'Switch client, keep the workspace. Inactive workspace for the new client → WORKSPACE NOT ACTIVE FOR THIS CLIENT; another client is never selected silently. The subcontext is kept only when the new client has that case.',
};
const SW_WORKSPACE: SwitcherContract = {
  switcher_id: 'AIO.SWITCHER.WORKSPACE', dimension: 'WORKSPACE', label: 'WORKSPACE', preserves: ['CLIENT'], re_resolves: ['WORKSPACE', 'SUBCONTEXT'],
  semantics: 'Switch workspace, keep the client. Lists ACTIVE, IN PROGRESS and (client office) relevant AVAILABLE workspaces; NOT_APPLICABLE workspaces are never listed to the client.',
};
const SW_SUBCONTEXT: SwitcherContract = {
  switcher_id: 'AIO.SWITCHER.SUBCONTEXT', dimension: 'SUBCONTEXT', label: 'SUBCONTEXT (IFTA: QUARTER)', preserves: ['CLIENT', 'WORKSPACE'], re_resolves: ['SUBCONTEXT'],
  semantics: 'Switch the subcontext inside one client × workspace (IFTA quarter; insurance policy; registration year …).',
};

export const AIO_OFFICE_HUB_RESPONSIBILITIES = ['ALL CLIENTS', 'NEEDS ATTENTION', 'DUE / UPCOMING', 'BLOCKED', 'WAITING ON CLIENT', 'WAITING ON AIO', 'RECENT ACTIVITY', 'ACTIVE WORKSPACES', 'SERVICE HEALTH', 'GLOBAL SEARCH / CLIENT LOOKUP'] as const;
export const AIO_CLIENT_OFFICE_HUB_RESPONSIBILITIES = ['ACTIVE WORKSPACES', 'CURRENT ACTIONS', 'UPCOMING DEADLINES', 'DOCUMENT REQUESTS', 'MESSAGES', 'RECENT ACTIVITY', 'AVAILABLE RELEVANT WORKSPACES'] as const;

export const AIO_ENVIRONMENTS: OperatingEnvironment[] = [
  {
    environment_id: 'AIO.OFFICE', name: 'AIO OFFICE', kind: 'INTERNAL_OFFICE', actor: 'FOUNDER_STAFF',
    client: 'SWITCHABLE', workspace: 'SWITCHABLE', subcontext: 'SWITCHABLE',
    hub: { hub_id: 'AIO.OFFICE.HUB', name: 'AIO OFFICE HUB', scope: 'CROSS_CLIENT_CROSS_WORKSPACE', responsibilities: [...AIO_OFFICE_HUB_RESPONSIBILITIES], feature_ref: 'AIO.OFFICE_OPERATIONS' },
    workspace_landing: 'CROSS_CLIENT_QUEUE', switchers: [SW_CLIENT, SW_WORKSPACE, SW_SUBCONTEXT], route_root: '/office',
  },
  {
    environment_id: 'AIO.CLIENT_OFFICE', name: 'CLIENT OFFICE', kind: 'CLIENT_OFFICE', actor: 'CLIENT',
    client: 'FIXED', workspace: 'SWITCHABLE', subcontext: 'SWITCHABLE',
    hub: { hub_id: 'AIO.CLIENT_OFFICE.HUB', name: 'CLIENT OFFICE HUB (MY OFFICE)', scope: 'ONE_CLIENT_CROSS_WORKSPACE', responsibilities: [...AIO_CLIENT_OFFICE_HUB_RESPONSIBILITIES], feature_ref: 'AIO.MY_OFFICE' },
    workspace_landing: 'CLIENT_WORKSPACE', switchers: [SW_WORKSPACE, SW_SUBCONTEXT], route_root: '/portal',
  },
  {
    environment_id: 'AIO.PUBLIC_SITE', name: 'PUBLIC SITE', kind: 'PUBLIC_SITE', actor: 'PUBLIC',
    client: 'NONE', workspace: 'NONE', subcontext: 'NONE', hub: null, workspace_landing: 'SERVICE_PAGE', switchers: [], route_root: '/',
  },
];

/** Hub responsibilities → existing AIO truth (what a hub can render today; MISSING is never faked). */
export const AIO_HUB_SOURCES: { hub_id: string; responsibility: string; status: EntitlementSource['status']; source: string; note: string }[] = [
  { hub_id: 'AIO.OFFICE.HUB', responsibility: 'ALL CLIENTS', status: 'EXISTING', source: `${SRC}/office/pages/ClientsListPage.tsx:13 (store.clients)`, note: 'Flat client table; no workspace columns.' },
  { hub_id: 'AIO.OFFICE.HUB', responsibility: 'NEEDS ATTENTION', status: 'PARTIAL', source: `${SRC}/office-core/officeAttentionEngine.ts:78`, note: 'No IFTA, bookkeeping, FleetCare or DriverLink candidates.' },
  { hub_id: 'AIO.OFFICE.HUB', responsibility: 'DUE / UPCOMING', status: 'EXISTING', source: `${SRC}/demo/demoTypes.ts:389 Deadline (deadlineType incl. ifta_filing)`, note: '' },
  { hub_id: 'AIO.OFFICE.HUB', responsibility: 'BLOCKED', status: 'PARTIAL', source: `${SRC}/office-core/officeWorkTypes.ts:111 OfficeWorkItem · ${SRC}/ifta/iftaDerive.ts:528 staffBucket BLOCKED`, note: 'No IFTA OfficeWorkItem domain.' },
  { hub_id: 'AIO.OFFICE.HUB', responsibility: 'WAITING ON CLIENT', status: 'PARTIAL', source: `${SRC}/office-core/client360Service.ts:29 customerWaitingOn · iftaDerive.ts staffBucket AWAITING_CLIENT`, note: 'Per client only; no cross-client rollup.' },
  { hub_id: 'AIO.OFFICE.HUB', responsibility: 'WAITING ON AIO', status: 'PARTIAL', source: `${SRC}/office-core/client360Service.ts:29 allInOneWaitingOn · iftaDerive.ts staffBucket NEEDS_REVIEW`, note: 'Per client only.' },
  { hub_id: 'AIO.OFFICE.HUB', responsibility: 'RECENT ACTIVITY', status: 'PARTIAL', source: `${SRC}/office/pages/OfficeDashboardPage.tsx:16`, note: '' },
  { hub_id: 'AIO.OFFICE.HUB', responsibility: 'ACTIVE WORKSPACES', status: 'CONFLICT', source: `${SRC}/office-core/client360Service.ts:29 activeServices (5 heuristics) vs ${SRC}/portal/clientCommandCenterService.ts:524 buildActiveServices`, note: 'Two disagreeing derivations; neither covers IFTA, bookkeeping, FleetCare, DriverLink. The workspace resolver here is the canonical replacement (not implemented in AIO).' },
  { hub_id: 'AIO.OFFICE.HUB', responsibility: 'SERVICE HEALTH', status: 'PARTIAL', source: `${SRC}/management/managementQueryLayer.ts:388 getBusinessHealthAreas`, note: 'Company-level areas, not per workspace.' },
  { hub_id: 'AIO.OFFICE.HUB', responsibility: 'GLOBAL SEARCH / CLIENT LOOKUP', status: 'EXISTING', source: `${SRC}/office/layouts/AIOOfficeLayout.tsx:148 (topbar search → /office/clients/:id)`, note: '' },
  { hub_id: 'AIO.CLIENT_OFFICE.HUB', responsibility: 'ACTIVE WORKSPACES', status: 'CONFLICT', source: `${SRC}/portal/clientCommandCenterService.ts:524 buildActiveServices`, note: 'Five hard-coded entries; permitting always ACTIVE (line 534). Replace with the workspace resolver.' },
  { hub_id: 'AIO.CLIENT_OFFICE.HUB', responsibility: 'CURRENT ACTIONS', status: 'EXISTING', source: `${SRC}/portal/clientCommandCenterService.ts:613 (nextAction + attentionItems)`, note: '' },
  { hub_id: 'AIO.CLIENT_OFFICE.HUB', responsibility: 'UPCOMING DEADLINES', status: 'EXISTING', source: `${SRC}/portal/clientCommandCenterService.ts:613 (today / upcoming)`, note: '' },
  { hub_id: 'AIO.CLIENT_OFFICE.HUB', responsibility: 'DOCUMENT REQUESTS', status: 'EXISTING', source: `${SRC}/portal/clientCommandCenterService.ts:613 (documents)`, note: '' },
  { hub_id: 'AIO.CLIENT_OFFICE.HUB', responsibility: 'MESSAGES', status: 'EXISTING', source: `${SRC}/portal/clientCommandCenterService.ts:613 (communication)`, note: '' },
  { hub_id: 'AIO.CLIENT_OFFICE.HUB', responsibility: 'RECENT ACTIVITY', status: 'CONFLICT', source: `${SRC}/portal/clientCommandCenterService.ts:716 activityPreview`, note: 'Shows org-scoped events of any visibility (pre-existing privacy finding G-ACTIVITY-PRIVACY).' },
  { hub_id: 'AIO.CLIENT_OFFICE.HUB', responsibility: 'AVAILABLE RELEVANT WORKSPACES', status: 'MISSING', source: 'none', note: 'Supplied by the workspace expansion contract (this model); crossSellRecommendations exists but is unused.' },
];

/* ─────────────────────────────── workspace registry ─────────────────────────────── */

const REQ: WorkspaceState[] = ['ACTIVE', 'AVAILABLE_NOT_ACTIVATED', 'NOT_APPLICABLE'];
const STAFF_WORK = ['clients.read', 'work.read', 'work.manage'];
const CLIENT_MEMBER = 'organisation member (CustomerRouteGuard; own organisation only)';
const SERVICE_REQUEST_SOURCE: EntitlementSource = { source: 'ServiceRequest (demo store.requests) / aio_service_requests', field: 'clientId | organization_id + services[].slug + status', ref: `${SRC}/demo/demoTypes.ts:359 ; ${MIG}/20260815110000_aio_business_data_rls.sql:47`, status: 'PARTIAL', note: 'A non-terminal request = an open case; no standing service record.' };
const FREE_TEXT_SERVICES: EntitlementSource = { source: 'Client.services (demo)', field: 'services: string[] (free-text titles)', ref: `${SRC}/demo/demoTypes.ts:333`, status: 'CONFLICT', note: 'Unreliable (appended only on request submit) — never used to resolve a workspace state.' };

const TRUCKS = { signal: 'operates_trucks', op: 'truthy' } as const;

/** Expansion rules — each follows a real operational relationship (brain cross-feature relationship or AIO dependency). */
const R = (r: ExpansionRule) => r;
export const AIO_EXPANSION_RULES: ExpansionRule[] = [
  R({
    rule_id: 'X.TAGS.FROM_IFTA.DEADLINES', target_workspace_id: 'TAGS_REGISTRATION', when_active_any: ['IFTA'],
    requires: [{ signal: 'ifta_vehicles', op: 'gte', value: 1 }, { signal: 'registration_deadlines_open', op: 'gte', value: 1 }], relevance: 'HIGH',
    reasons: ['{ifta_vehicles} vehicles already filed through AIO IFTA', '{registration_deadlines_open} registration / IRP deadline(s) open on file'],
    message_key: 'expansion.tags.from_ifta.deadlines', headline: 'YOU’RE ALREADY MANAGING {ifta_vehicles} VEHICLES WITH AIO.', body: 'BRING REGISTRATION INTO THE SAME OFFICE — {registration_deadlines_open} REGISTRATION DEADLINE(S) ARE OPEN.',
    cta: { label: 'EXPLORE TAGS', action: 'I.EXPLORE_WORKSPACE' }, placements: ['WORKSPACE_SWITCHER_AVAILABLE', 'CLIENT_OFFICE_HUB', 'INSIGHT_MODULE', 'AFTER_RELATED_COMPLETION', 'AFTER_ACTIVATION'],
    grounded_in: `Same fleet units: IFTA quarter vehicles + Deadline registration_renewal / IRP (${SRC}/demo/vaultSeed.ts:220); AIO.ROAD_READY related AIO.IFTA + registration; crossSellRecommendations irp→ifta+tags (${SRC}/services/catalog/serviceNeedRecommendation.ts:28)`,
  }),
  R({
    rule_id: 'X.TAGS.FROM_IFTA', target_workspace_id: 'TAGS_REGISTRATION', when_active_any: ['IFTA'],
    requires: [{ signal: 'ifta_vehicles', op: 'gte', value: 1 }], relevance: 'MEDIUM',
    reasons: ['{ifta_vehicles} vehicles already filed through AIO IFTA'],
    message_key: 'expansion.tags.from_ifta', headline: 'YOU’RE ALREADY MANAGING {ifta_vehicles} VEHICLES WITH AIO.', body: 'BRING REGISTRATION INTO THE SAME OFFICE.',
    cta: { label: 'EXPLORE TAGS', action: 'I.EXPLORE_WORKSPACE' }, placements: ['WORKSPACE_SWITCHER_AVAILABLE', 'CLIENT_OFFICE_HUB', 'AFTER_RELATED_COMPLETION', 'AFTER_ACTIVATION'],
    grounded_in: 'Same fleet units across IFTA and registration (IFTA quarter vehicles ↔ IRP / plates).',
  }),
  R({
    rule_id: 'X.IFTA.FROM_DISPATCH', target_workspace_id: 'IFTA', when_active_any: ['DISPATCH'],
    requires: [TRUCKS, { signal: 'interstate_dispatch_loads', op: 'gte', value: 1 }], relevance: 'HIGH',
    reasons: ['{interstate_dispatch_loads} interstate load(s) dispatched through AIO', 'IFTA account on file: {ifta_account_reported}'],
    message_key: 'expansion.ifta.from_dispatch', headline: 'YOUR DISPATCHED LOADS ALREADY CROSS STATE LINES.', body: 'AIO CAN HANDLE THE QUARTERLY IFTA FILING IN THE SAME OFFICE.',
    cta: { label: 'REQUEST FILING', action: 'I.SET_UP_FILING' }, placements: ['WORKSPACE_SWITCHER_AVAILABLE', 'CLIENT_OFFICE_HUB', 'AFTER_RELATED_COMPLETION', 'AFTER_ACTIVATION'],
    grounded_in: `AIO.DISPATCH_OPERATIONS related AIO.IFTA; IFTA mileage source LOAD_DERIVED_ESTIMATE from dispatch loads (${SRC}/ifta/iftaSeed.ts:122); interstate load (${SRC}/demo/dispatchSeed.ts:221)`,
  }),
  R({
    rule_id: 'X.IFTA.FROM_BOOKKEEPING', target_workspace_id: 'IFTA', when_active_any: ['BOOKKEEPING'],
    requires: [TRUCKS, { signal: 'fuel_transactions_in_books', op: 'gte', value: 1 }], relevance: 'MEDIUM',
    reasons: ['{fuel_transactions_in_books} fuel transactions already categorised in your books'],
    message_key: 'expansion.ifta.from_bookkeeping', headline: 'YOUR FUEL AND MILEAGE RECORDS ALREADY FEED YOUR BOOKS.', body: 'AIO CAN HANDLE THE QUARTERLY FILING TOO.',
    cta: { label: 'REQUEST FILING', action: 'I.SET_UP_FILING' }, placements: ['WORKSPACE_SWITCHER_AVAILABLE', 'CLIENT_OFFICE_HUB', 'INSIGHT_MODULE', 'AFTER_ACTIVATION'],
    grounded_in: 'AIO.BOOKKEEPING related AIO.IFTA. Signal source for fuel transactions in books is not exposed per org today → REQUIRED_DATA_MISSING until it is.',
  }),
  R({
    rule_id: 'X.FLEETCARE.FROM_DISPATCH', target_workspace_id: 'FLEETCARE', when_active_any: ['DISPATCH'],
    requires: [{ signal: 'power_units', op: 'gte', value: 1 }], relevance: 'MEDIUM',
    reasons: ['{power_units} truck(s) dispatched through AIO'],
    message_key: 'expansion.fleetcare.from_dispatch', headline: 'KEEP OPERATIONS AND MAINTENANCE CONNECTED.', body: 'A TRUCK IN REPAIR SHOWS UNAVAILABLE IN DISPATCH AUTOMATICALLY.',
    cta: { label: 'EXPLORE FLEETCARE', action: 'I.EXPLORE_WORKSPACE' }, placements: ['WORKSPACE_SWITCHER_AVAILABLE', 'CLIENT_OFFICE_HUB', 'AFTER_ACTIVATION'],
    grounded_in: 'AIO.FLEETCARE relationship IN_REPAIR → AIO.DISPATCH_OPERATIONS (truck unavailable on the board).',
  }),
  R({
    rule_id: 'X.INSURANCE.FROM_TAGS', target_workspace_id: 'INSURANCE', when_active_any: ['TAGS_REGISTRATION'],
    requires: [TRUCKS, { signal: 'vehicles_without_coverage', op: 'gte', value: 1 }], relevance: 'HIGH',
    reasons: ['{vehicles_without_coverage} registered unit(s) not on an AIO-tracked policy'],
    message_key: 'expansion.insurance.from_tags', headline: 'REGISTRATION NEEDS PROOF OF COVERAGE.', body: 'AIO CAN COORDINATE COVERAGE FOR THE UNITS IT REGISTERS.',
    cta: { label: 'EXPLORE INSURANCE', action: 'I.EXPLORE_WORKSPACE' }, placements: ['WORKSPACE_SWITCHER_AVAILABLE', 'WORKFLOW_BOUNDARY', 'AFTER_ACTIVATION'],
    grounded_in: `Only where legitimately relevant: insurance policy vehicles vs power units (${SRC}/demo/insuranceSeed.ts:148); AIO.INSURANCE related AIO.ROAD_READY / AIO.RENEWALS.`,
  }),
  R({
    rule_id: 'X.FACTORING.FROM_DISPATCH', target_workspace_id: 'FACTORING', when_active_any: ['DISPATCH'],
    requires: [TRUCKS, { signal: 'factoring_ready_loads', op: 'gte', value: 1 }], relevance: 'MEDIUM',
    reasons: ['{factoring_ready_loads} delivered load(s) ready to invoice'],
    message_key: 'expansion.factoring.from_dispatch', headline: 'YOUR DELIVERED LOADS ARE READY TO INVOICE.', body: 'AIO CAN HAND THEM TO A FACTORING PARTNER.',
    cta: { label: 'EXPLORE FACTORING', action: 'I.EXPLORE_WORKSPACE' }, placements: ['AFTER_RELATED_COMPLETION', 'WORKSPACE_SWITCHER_AVAILABLE', 'AFTER_ACTIVATION'],
    grounded_in: `Load.factoringHandoffStatus "ready" (${SRC}/portal/clientCommandCenterService.ts:445); crossSellRecommendations dispatch→factoring.`,
  }),
  R({
    rule_id: 'X.BOOKKEEPING.FROM_FACTORING', target_workspace_id: 'BOOKKEEPING', when_active_any: ['FACTORING'],
    requires: [{ signal: 'factoring_active', op: 'truthy' }], relevance: 'MEDIUM',
    reasons: ['Factoring is active with AIO — funding fees land in your monthly close'],
    message_key: 'expansion.bookkeeping.from_factoring', headline: 'YOUR FACTORING FEES ALREADY RUN THROUGH AIO.', body: 'KEEP THE BOOKS IN THE SAME OFFICE.',
    cta: { label: 'EXPLORE BOOKKEEPING', action: 'I.EXPLORE_WORKSPACE' }, placements: ['WORKSPACE_SWITCHER_AVAILABLE', 'CLIENT_OFFICE_HUB', 'AFTER_ACTIVATION'],
    grounded_in: `AIO.FACTORING relationship FUNDED → AIO.BOOKKEEPING (factoring fee line); bookkeeping lead reason “You use factoring” (${SRC}/demo/bookkeepingSeed.ts:155).`,
  }),
];
const rulesFor = (id: string) => AIO_EXPANSION_RULES.filter((r) => r.target_workspace_id === id);

type AioWorkspace = WorkspaceDefinition & {
  /** required_permissions are the office (staff) permissions; the client side is organisation membership only. */
  client_permission: string;
  route_status: 'EXISTING' | 'PROPOSED';
  catalog_slugs: string[];
  launch_refs: string[];
};
const W = (w: Omit<AioWorkspace, 'expansion_rules' | 'client_permission'>): AioWorkspace => ({ ...w, client_permission: CLIENT_MEMBER, expansion_rules: rulesFor(w.workspace_id) });

export const AIO_WORKSPACES: AioWorkspace[] = [
  W({
    workspace_id: 'IFTA', name: 'IFTA / FUEL TAX', category: 'TAX & FUEL',
    availability: 'REQUEST / QUOTE (D-IFTA-AVAILABILITY) — sources disagree: catalog ifta-filing PREPARING · launch fuel-tax INTERNAL_ONLY · public CTA falls back to GO',
    availability_truth: 'CONFLICT', client_can_request: true, staff_can_start: false,
    feature_refs: ['AIO.IFTA'], client_eligibility_rule: { kind: 'SIGNALS', match: 'ALL', conditions: [TRUCKS, { signal: 'interstate', op: 'truthy' }], explanation: 'Interstate motor carriers file IFTA quarterly; shippers never do.' },
    founder_route: '/office/workspaces/ifta', client_route: '/portal/workspaces/ifta', route_status: 'PROPOSED',
    active_case_types: ['IFTA_QUARTER'], subcontext_types: ['QUARTER (YYYY-Qn)'], required_permissions: STAFF_WORK,
    shared_dependencies: ['VAULT (quarter packet)', 'INBOX (quarter thread)', 'FLEET REGISTRY (vehicles)', 'IFTA_REGISTRATION (account prerequisite)'],
    adjacent_workspaces: ['TAGS_REGISTRATION', 'DISPATCH', 'BOOKKEEPING', 'COMPLIANCE'],
    supported_states: REQ,
    entitlement_sources: [
      { source: 'DemoStore.iftaQuarters', field: 'IftaQuarterCase.organizationId (+ state)', ref: `${SRC}/demo/demoTypes.ts:565 ; ${SRC}/ifta/iftaTypes.ts:143`, status: 'PARTIAL', note: 'Org is IFTA-active iff it has quarter cases (demo store only; no Supabase IFTA table).' },
      { source: 'IFTA experience contract', field: 'IftaStateId NOT_ENROLLED', ref: `${SRC}/ifta/experience/iftaExperience.ts:14`, status: 'EXISTING', note: 'Native AVAILABLE_NOT_ACTIVATED vocabulary; no code derives it yet.' },
      { source: 'RoadReadyProfile.taxFuel.ifta', field: 'self-reported IFTA account', ref: `${SRC}/road-ready/roadReadyTypes.ts:91`, status: 'PARTIAL', note: 'Customer fact (signal), not an AIO entitlement.' },
      FREE_TEXT_SERVICES,
    ],
    workspace_state: 'TREE_PROVEN', catalog_slugs: ['ifta-fuel-tax-assistance', 'ifta-filing'], launch_refs: [`${SRC}/launch/serviceActivationLaunch.ts:56`, `${SRC}/services/catalog/serviceCatalog.ts:356`],
    capabilities: ['cross-client fuel tax queue', 'client-quarter case', 'quarter selector', 'request filing (quote)'],
  }),
  W({
    workspace_id: 'TAGS_REGISTRATION', name: 'TAGS / REGISTRATION', category: 'REGISTRATION',
    availability: 'IRP LIMITED_PILOT · tag services HOLD · title / UCR PREPARING (request model)', availability_truth: 'CONSISTENT', client_can_request: true, staff_can_start: false,
    feature_refs: ['AIO.TAGS_REGISTRATION'], client_eligibility_rule: { kind: 'SIGNALS', match: 'ALL', conditions: [TRUCKS, { signal: 'power_units', op: 'gte', value: 1 }], explanation: 'Registers the client’s own power units.' },
    founder_route: '/office/permitting', client_route: '/portal/renewals', route_status: 'EXISTING',
    active_case_types: ['SERVICE_REQUEST'], subcontext_types: ['REGISTRATION YEAR', 'VEHICLE'], required_permissions: STAFF_WORK,
    shared_dependencies: ['FLEET REGISTRY', 'RENEWALS / DEADLINES', 'VAULT (cab cards)'], adjacent_workspaces: ['IFTA', 'INSURANCE', 'COMPLIANCE'],
    supported_states: REQ,
    entitlement_sources: [SERVICE_REQUEST_SOURCE, { source: 'RenewalRecord / Deadline', field: 'renewalType registration | irp | ucr', ref: `${SRC}/renewals/renewalTypes.ts:3`, status: 'PARTIAL', note: 'Deadlines are signals, not entitlements.' }, FREE_TEXT_SERVICES],
    workspace_state: 'CONTRACT_ONLY', catalog_slugs: ['irp-apportioned-registration', 'tag-services', 'title-services', 'ucr-registration', 'ucr-renewal'], launch_refs: [`${SRC}/launch/serviceActivationLaunch.ts:39`],
    capabilities: ['service requests', 'renewals'],
  }),
  W({
    workspace_id: 'PERMITTING', name: 'PERMITTING', category: 'PERMITS',
    availability: 'LIMITED_PILOT (trip permits) · PREPARING (temporary permits)', availability_truth: 'CONSISTENT', client_can_request: true, staff_can_start: false,
    feature_refs: ['AIO.PERMITTING'], client_eligibility_rule: { kind: 'SIGNALS', match: 'ALL', conditions: [TRUCKS], explanation: 'Trip / temporary permits are for operating trucks.' },
    founder_route: '/office/permitting', client_route: null, route_status: 'EXISTING',
    active_case_types: ['SERVICE_REQUEST'], subcontext_types: ['PERMIT'], required_permissions: STAFF_WORK,
    shared_dependencies: ['FLEET REGISTRY', 'DEADLINES'], adjacent_workspaces: ['TAGS_REGISTRATION', 'COMPLIANCE'], supported_states: REQ,
    entitlement_sources: [SERVICE_REQUEST_SOURCE, { source: 'Portal buildActiveServices', field: '"permitting" entry', ref: `${SRC}/portal/clientCommandCenterService.ts:534`, status: 'CONFLICT', note: 'Hard-coded ACTIVE for every client — not used.' }],
    workspace_state: 'CONTRACT_ONLY', catalog_slugs: ['trip-permits', 'temporary-permits'], launch_refs: [`${SRC}/launch/serviceActivationLaunch.ts:22`], capabilities: ['service requests'],
  }),
  W({
    workspace_id: 'COMPLIANCE', name: 'COMPLIANCE (AUTHORITY · BOC-3 · SAFETY)', category: 'COMPLIANCE',
    availability: 'authorities LIMITED_PILOT · BOC-3 BLOCKED · MCS-150 COMING_SOON · safety PREPARING', availability_truth: 'CONSISTENT', client_can_request: true, staff_can_start: false,
    feature_refs: ['AIO.AUTHORITIES', 'AIO.BOC3', 'AIO.COMPLIANCE_SAFETY'], client_eligibility_rule: { kind: 'SIGNALS', match: 'ALL', conditions: [TRUCKS], explanation: 'Operating authority and safety compliance apply to motor carriers.' },
    founder_route: '/office/permitting', client_route: '/portal/road-ready', route_status: 'EXISTING',
    active_case_types: ['SERVICE_REQUEST'], subcontext_types: ['FILING (USDOT · MC · BOC-3 · MCS-150)'], required_permissions: STAFF_WORK,
    shared_dependencies: ['ROAD READY (readiness layer)', 'RENEWALS'], adjacent_workspaces: ['IFTA', 'TAGS_REGISTRATION', 'INSURANCE'], supported_states: REQ,
    entitlement_sources: [SERVICE_REQUEST_SOURCE, { source: 'RoadReadyProfile.authority', field: 'usdot | mc | boc3', ref: `${SRC}/road-ready/roadReadyTypes.ts:75`, status: 'PARTIAL', note: 'Readiness facts (signals).' }, FREE_TEXT_SERVICES],
    workspace_state: 'CONTRACT_ONLY', catalog_slugs: ['usdot-registration', 'operating-authority-assistance', 'boc-3-assistance', 'mcs-150-biennial-update', 'compliance-support'], launch_refs: [`${SRC}/launch/serviceActivationLaunch.ts:89`], capabilities: ['service requests', 'Road Ready review'],
  }),
  W({
    workspace_id: 'INSURANCE', name: 'INSURANCE', category: 'MONEY & RISK',
    availability: 'HOLD (launch) · PARTNER_PENDING (infra) · LIMITED_PILOT (catalog, partner-provided)', availability_truth: 'CONFLICT', client_can_request: true, staff_can_start: false,
    feature_refs: ['AIO.INSURANCE'], client_eligibility_rule: { kind: 'SIGNALS', match: 'ALL', conditions: [TRUCKS], explanation: 'Commercial auto / cargo coverage for operating trucks.' },
    founder_route: '/office/insurance', client_route: '/portal/insurance', route_status: 'EXISTING',
    active_case_types: ['POLICY', 'INSURANCE_REQUEST'], subcontext_types: ['POLICY'], required_permissions: STAFF_WORK,
    shared_dependencies: ['FLEET REGISTRY', 'VAULT (COIs)', 'RENEWALS'], adjacent_workspaces: ['TAGS_REGISTRATION', 'COMPLIANCE'], supported_states: [...REQ, 'PENDING_SETUP'],
    entitlement_sources: [
      { source: 'InsurancePolicy (demo)', field: 'organizationId + status active | expiring_soon | …', ref: `${SRC}/insurance/insuranceTypes.ts:30`, status: 'EXISTING', note: 'Active / expiring policy → ACTIVE.' },
      { source: 'InsuranceRequest (demo)', field: 'organizationId + status draft … policy_setup', ref: `${SRC}/insurance/insuranceTypes.ts:109`, status: 'EXISTING', note: 'Open request without a policy → PENDING_SETUP.' },
    ],
    workspace_state: 'CONTRACT_ONLY', catalog_slugs: ['commercial-auto-liability', 'cargo-coverage', 'physical-damage'], launch_refs: [`${SRC}/launch/serviceActivationLaunch.ts:191`], capabilities: ['requests', 'policies', 'certificates'],
  }),
  W({
    workspace_id: 'BOOKKEEPING', name: 'BOOKKEEPING', category: 'MONEY',
    availability: 'LIMITED_PILOT (launch + catalog)', availability_truth: 'CONSISTENT', client_can_request: true, staff_can_start: false,
    feature_refs: ['AIO.BOOKKEEPING'], client_eligibility_rule: { kind: 'ALL_CLIENTS', explanation: 'Every business keeps books.' },
    founder_route: '/office/bookkeeping', client_route: '/portal/bookkeeping', route_status: 'EXISTING',
    active_case_types: ['SUBSCRIPTION', 'MONTHLY_CLOSE'], subcontext_types: ['MONTH'], required_permissions: [...STAFF_WORK, 'billing.read'],
    shared_dependencies: ['VAULT (month folders)', 'BILLING'], adjacent_workspaces: ['FACTORING', 'IFTA', 'DISPATCH'], supported_states: [...REQ, 'PENDING_SETUP', 'PAUSED', 'ENDED'],
    entitlement_sources: [
      { source: 'BookkeepingSubscription (demo)', field: 'organizationId + status recommended | quoted | pending | onboarding | active | paused | cancelled', ref: `${SRC}/bookkeeping/bookkeepingTypes.ts:94`, status: 'EXISTING', note: '' },
      { source: 'aio_bookkeeping_subscriptions', field: 'organization_id + status', ref: `${MIG}/20260816170000_aio_bookkeeping.sql:4`, status: 'EXISTING', note: '' },
    ],
    workspace_state: 'CONTRACT_ONLY', catalog_slugs: ['bookkeeping-essentials', 'bookkeeping-plus', 'all-in-one-bookkeeping', 'books-rescue'], launch_refs: [`${SRC}/launch/serviceActivationLaunch.ts:208`], capabilities: ['subscription', 'monthly close', 'books rescue'],
  }),
  W({
    workspace_id: 'FACTORING', name: 'FACTORING', category: 'MONEY',
    availability: 'HOLD (launch) · PARTNER_PENDING (infra) · LIMITED_PILOT (catalog)', availability_truth: 'CONFLICT', client_can_request: true, staff_can_start: false,
    feature_refs: ['AIO.FACTORING'], client_eligibility_rule: { kind: 'SIGNALS', match: 'ALL', conditions: [TRUCKS], explanation: 'Carrier invoice factoring.' },
    founder_route: '/office/factoring', client_route: '/portal/factoring', route_status: 'EXISTING',
    active_case_types: ['SUBMISSION'], subcontext_types: ['SUBMISSION'], required_permissions: [...STAFF_WORK, 'factoring_finance.read'],
    shared_dependencies: ['DISPATCH (delivered loads)', 'BILLING'], adjacent_workspaces: ['DISPATCH', 'BOOKKEEPING'], supported_states: [...REQ, 'PENDING_SETUP'],
    entitlement_sources: [{ source: 'FactoringProfile (demo)', field: 'organizationId + enrollmentStatus not_enrolled | interested | application_started | … | active', ref: `${SRC}/factoring/factoringTypes.ts:87`, status: 'EXISTING', note: '' }, FREE_TEXT_SERVICES],
    workspace_state: 'CONTRACT_ONLY', catalog_slugs: ['factoring-consultation', 'invoice-factoring'], launch_refs: [`${SRC}/launch/serviceActivationLaunch.ts:174`], capabilities: ['submissions', 'invoices'],
  }),
  W({
    workspace_id: 'DISPATCH', name: 'DISPATCH', category: 'OPERATIONS',
    availability: 'GO (launch) · ACTIVE (infra + catalog)', availability_truth: 'CONSISTENT', client_can_request: true, staff_can_start: false,
    feature_refs: ['AIO.DISPATCH_OPERATIONS'], client_eligibility_rule: { kind: 'SIGNALS', match: 'ALL', conditions: [TRUCKS, { signal: 'power_units', op: 'gte', value: 1 }], explanation: 'Dispatch for the client’s own trucks.' },
    founder_route: '/office/dispatch', client_route: '/portal/dispatch', route_status: 'EXISTING',
    active_case_types: ['LOAD'], subcontext_types: ['LOAD'], required_permissions: [...STAFF_WORK, 'management.dispatch.read'],
    shared_dependencies: ['FLEET REGISTRY', 'VAULT (rate cons / PODs)'], adjacent_workspaces: ['IFTA', 'FACTORING', 'FLEETCARE'], supported_states: [...REQ, 'PENDING_SETUP', 'PAUSED', 'ENDED'],
    entitlement_sources: [{ source: 'DispatchEnrollment (demo)', field: 'organizationId + status interested | onboarding | active | paused | suspended | ended', ref: `${SRC}/dispatch/dispatchTypes.ts:115`, status: 'EXISTING', note: '' }, FREE_TEXT_SERVICES],
    workspace_state: 'CONTRACT_ONLY', catalog_slugs: ['carrier-dispatch-support', 'load-coordination'], launch_refs: [`${SRC}/launch/serviceActivationLaunch.ts:140`], capabilities: ['loads', 'enrollment'],
  }),
  W({
    workspace_id: 'BROKERAGE', name: 'BROKERAGE / AIO FREIGHT', category: 'OPERATIONS',
    availability: 'BLOCKED (launch) · PAUSED (infra) · COMING_SOON (catalog)', availability_truth: 'CONSISTENT', client_can_request: false, staff_can_start: false,
    feature_refs: ['AIO.BROKERAGE'], client_eligibility_rule: { kind: 'ALL_CLIENTS', explanation: 'Shippers book freight; carriers join the network.' },
    founder_route: '/office/brokerage', client_route: '/portal/brokerage', route_status: 'EXISTING',
    active_case_types: ['SHIPMENT'], subcontext_types: ['SHIPMENT'], required_permissions: [...STAFF_WORK, 'brokerage_finance.read'],
    shared_dependencies: ['LOAD BOARD', 'BILLING'], adjacent_workspaces: ['DISPATCH'], supported_states: [...REQ, 'PENDING_SETUP', 'PAUSED'],
    entitlement_sources: [
      { source: 'ShipperProfile (demo)', field: 'organizationId + status lead | onboarding | active | paused | inactive', ref: `${SRC}/brokerage/brokerageTypes.ts:25`, status: 'EXISTING', note: '' },
      { source: 'CarrierNetworkProfile (demo)', field: 'organizationId + status prospect | onboarding | approved_internal | active | hold', ref: `${SRC}/brokerage/brokerageTypes.ts:229`, status: 'EXISTING', note: '' },
    ],
    workspace_state: 'CONTRACT_ONLY', catalog_slugs: ['freight-quote', 'shipment-coordination'], launch_refs: [`${SRC}/launch/serviceActivationLaunch.ts:157`], capabilities: ['shipments', 'carrier network'],
  }),
  W({
    workspace_id: 'FLEETCARE', name: 'FLEETCARE', category: 'OPERATIONS',
    availability: 'no launch / catalog entry (nav slug only)', availability_truth: 'CONFLICT', client_can_request: true, staff_can_start: false,
    feature_refs: ['AIO.FLEETCARE'], client_eligibility_rule: { kind: 'SIGNALS', match: 'ALL', conditions: [{ signal: 'power_units', op: 'gte', value: 1 }], explanation: 'Maintenance for the client’s own units.' },
    founder_route: '/office/fleetcare', client_route: '/portal/fleetcare', route_status: 'EXISTING',
    active_case_types: ['MAINTENANCE_TICKET'], subcontext_types: ['TICKET', 'VEHICLE'], required_permissions: STAFF_WORK,
    shared_dependencies: ['FLEET REGISTRY', 'DISPATCH (truck availability)'], adjacent_workspaces: ['DISPATCH'], supported_states: REQ,
    entitlement_sources: [
      { source: 'MaintenanceTicket (demo)', field: 'clientOrganizationId + status', ref: `${SRC}/fleetcare/fleetcareTypes.ts:148`, status: 'PARTIAL', note: 'Ticket existence → ACTIVE (no subscription record read by the app).' },
      { source: 'aio_fleetcare_client_subscriptions', field: 'organization_id + status', ref: `${MIG}/20260817190000_aio_fleetcare_network.sql:224`, status: 'PARTIAL', note: 'Schema only, unused by app code.' },
    ],
    workspace_state: 'CONTRACT_ONLY', catalog_slugs: [], launch_refs: [], capabilities: ['tickets', 'providers'],
  }),
  W({
    workspace_id: 'DRIVERLINK', name: 'DRIVERLINK', category: 'PEOPLE',
    availability: 'no launch / catalog entry (nav slug only)', availability_truth: 'CONFLICT', client_can_request: true, staff_can_start: false,
    feature_refs: ['AIO.DRIVERLINK'], client_eligibility_rule: { kind: 'SIGNALS', match: 'ALL', conditions: [TRUCKS], explanation: 'Driver hiring for carriers.' },
    founder_route: '/office/driverlink', client_route: '/portal/driverlink', route_status: 'EXISTING',
    active_case_types: ['JOB_OPPORTUNITY'], subcontext_types: ['JOB'], required_permissions: STAFF_WORK,
    shared_dependencies: ['COMPLIANCE (DQ files)'], adjacent_workspaces: ['COMPLIANCE'], supported_states: REQ,
    entitlement_sources: [
      { source: 'JobOpportunity (demo)', field: 'organizationId + status', ref: `${SRC}/driverlink/driverlinkTypes.ts:116`, status: 'PARTIAL', note: 'Published opportunity → ACTIVE.' },
      { source: 'aio_driverlink_company_subscriptions', field: 'organization_id + status', ref: `${MIG}/20260817200000_aio_driverlink.sql:154`, status: 'PARTIAL', note: 'Schema only, unused by app code.' },
    ],
    workspace_state: 'CONTRACT_ONLY', catalog_slugs: [], launch_refs: [], capabilities: ['jobs', 'candidates'],
  }),
  W({
    workspace_id: 'BUSINESS_FORMATION', name: 'START YOUR BUSINESS (FORMATION)', category: 'BUSINESS',
    availability: 'LIMITED_PILOT (launch + catalog)', availability_truth: 'CONSISTENT', client_can_request: true, staff_can_start: false,
    feature_refs: ['AIO.BUSINESS_FORMATION'], client_eligibility_rule: { kind: 'SIGNALS', match: 'ALL', conditions: [{ signal: 'new_entrant', op: 'truthy' }], explanation: 'Formation applies to businesses that are not yet operating.' },
    founder_route: '/office/business-formation', client_route: '/portal/roadmap', route_status: 'EXISTING',
    active_case_types: ['SERVICE_REQUEST'], subcontext_types: ['ENTITY'], required_permissions: STAFF_WORK,
    shared_dependencies: ['ROAD READY'], adjacent_workspaces: ['COMPLIANCE'], supported_states: REQ,
    entitlement_sources: [SERVICE_REQUEST_SOURCE, FREE_TEXT_SERVICES],
    workspace_state: 'CONTRACT_ONLY', catalog_slugs: ['llc-formation-assistance', 'ein-assistance'], launch_refs: [`${SRC}/launch/serviceActivationLaunch.ts:123`], capabilities: ['service requests'],
  }),
];

/** Candidates the audit found that are NOT registered as workspaces (no tree inflation). */
export const AIO_NOT_WORKSPACES = [
  { id: 'ROAD_READY', reason: 'Universal readiness / onboarding layer for every carrier (feeds signals to every workspace); not a sold service.' },
  { id: 'ROAD_TAX', reason: 'Open founder question: road-tax / HVUT slugs sit beside IFTA in the catalog — inside IFTA or its own workspace.' },
  { id: 'LOAD_BOARD', reason: 'Open founder question: carrier-side network shared by DISPATCH and BROKERAGE.' },
  { id: 'SAFETY_DRIVER_COMPLIANCE', reason: 'Folded into COMPLIANCE (all slugs COMING_SOON / PREPARING).' },
  { id: 'PAYROLL_TAX', reason: 'Future (COMING_SOON) with no source record — not registered.' },
  { id: 'VAULT · INBOX · BILLING · RENEWALS · FLEET REGISTRY', reason: 'Shared capabilities across workspaces, not workspaces.' },
] as const;

/* ─────────────────────────────── routes (reconciled with current route truth) ─────────────────────────────── */

export type AioOfficeRoute = { route: string; environment_id: string; view: string; status: 'EXISTING' | 'PROPOSED' | 'HELPER_UNROUTED'; ref: string; note: string };

export const AIO_OFFICE_ROUTES: AioOfficeRoute[] = [
  { route: '/office', environment_id: 'AIO.OFFICE', view: 'HUB', status: 'EXISTING', ref: `${SRC}/office/routes/OfficeRoutes.tsx:185 OfficeDashboardPage`, note: 'Route + function reused; legacy visuals carry zero authority.' },
  { route: '/office/clients', environment_id: 'AIO.OFFICE', view: 'HUB (ALL CLIENTS)', status: 'EXISTING', ref: `${SRC}/office/routes/OfficeRoutes.tsx:258`, note: '' },
  { route: '/office/clients/:clientId', environment_id: 'AIO.OFFICE', view: 'CLIENT_OVERVIEW', status: 'EXISTING', ref: `${SRC}/office/routes/OfficeRoutes.tsx:261 Client 360`, note: 'Client-centric entry.' },
  { route: '/office/workspaces/ifta', environment_id: 'AIO.OFFICE', view: 'WORKSPACE_LANDING (FUEL TAX QUEUE)', status: 'PROPOSED', ref: 'none — no /office/workspaces/* route exists (no collision)', note: 'Static route inside OfficeRouteGuard.' },
  { route: '/office/workspaces/ifta/:clientId/:quarter', environment_id: 'AIO.OFFICE', view: 'CASE', status: 'PROPOSED', ref: 'none', note: 'Queue entry → canonical case AIO:{clientId}:IFTA:IFTA_QUARTER:{quarter}.' },
  { route: '/office/clients/:clientId/ifta/:quarter', environment_id: 'AIO.OFFICE', view: 'CASE', status: 'PROPOSED', ref: `${SRC}/office/routes/OfficeRoutes.tsx:259 (existing /office/clients/:clientId/<x> pattern)`, note: 'Client entry → the SAME canonical case.' },
  { route: '/office/permitting/fuel-tax(/:caseId)', environment_id: 'AIO.OFFICE', view: '—', status: 'HELPER_UNROUTED', ref: `${SRC}/utils/paths.ts:217-218`, note: 'Superseded: redirect to /office/workspaces/ifta(/:clientId/:quarter); :caseId resolves through the record id to the canonical client + quarter.' },
  { route: '/portal', environment_id: 'AIO.CLIENT_OFFICE', view: 'HUB (MY OFFICE)', status: 'EXISTING', ref: `${SRC}/pages/PortalPage.tsx:20`, note: 'Route + function reused; legacy visuals carry zero authority.' },
  { route: '/portal/workspaces/ifta', environment_id: 'AIO.CLIENT_OFFICE', view: 'CASE (current quarter) · WORKSPACE_EXPANSION · WORKSPACE_HIDDEN', status: 'PROPOSED', ref: 'none — no /portal/workspaces/* route exists (no collision)', note: 'Static route inside CustomerRouteGuard; the session organisation is the only client.' },
  { route: '/portal/workspaces/ifta/:quarter', environment_id: 'AIO.CLIENT_OFFICE', view: 'CASE', status: 'PROPOSED', ref: 'none', note: 'Quarter selector (subcontext).' },
  { route: '/portal/services/ifta(?quarter=)', environment_id: 'AIO.CLIENT_OFFICE', view: '—', status: 'HELPER_UNROUTED', ref: `${SRC}/utils/paths.ts:151-154 (swallowed by services/:serviceRequestId, routes/AioCoreRoutes.tsx:337)`, note: 'Superseded by /portal/workspaces/ifta.' },
  { route: '/services/ifta-filing', environment_id: 'AIO.PUBLIC_SITE', view: 'SERVICE_PAGE', status: 'EXISTING', ref: `${SRC}/routes/AioCoreRoutes.tsx:228 /services/:serviceSlug`, note: 'Public service page (new authority family; no private data).' },
];

/* ─────────────────────────────── expansion signals (record-based, never behavioural) ─────────────────────────────── */

/** Every signal a rule may read, with its record source. No click / browsing / behavioural tracking is used. */
export const AIO_EXPANSION_SIGNALS: { signal: string; source: string; status: EntitlementSource['status']; note: string }[] = [
  { signal: 'operates_trucks', source: `Client.clientType ∈ owner_operator | carrier | fleet (${SRC}/demo/demoTypes.ts:205)`, status: 'EXISTING', note: 'Shippers are false. Three vocabularies exist (clientType · Road Ready operationType · aio_org_type).' },
  { signal: 'interstate', source: `RoadReadyProfile.operating.scope (${SRC}/road-ready/roadReadyTypes.ts:67)`, status: 'PARTIAL', note: 'Road Ready profiles exist for client-a…d only; others unknown.' },
  { signal: 'new_entrant', source: `RoadReadyProfile.operating.currentlyOperating (${SRC}/road-ready/roadReadyTypes.ts:67)`, status: 'PARTIAL', note: '' },
  { signal: 'power_units', source: `DemoStore.powerUnits by organizationId (${SRC}/road-ready/roadReadyTypes.ts:111)`, status: 'CONFLICT', note: 'Disagrees with Road Ready fleet size and with IFTA vehicles for client-f / client-g → unknown there.' },
  { signal: 'ifta_vehicles', source: `IftaQuarterCase.vehicles (${SRC}/ifta/iftaTypes.ts:57)`, status: 'EXISTING', note: 'Vehicles AIO already files for.' },
  { signal: 'interstate_dispatch_loads', source: `Load origin / destination state (${SRC}/demo/dispatchSeed.ts:221)`, status: 'EXISTING', note: 'Counted only where audited (client-a).' },
  { signal: 'ifta_account_reported', source: `RoadReadyProfile.taxFuel.ifta (${SRC}/road-ready/roadReadyTypes.ts:91)`, status: 'PARTIAL', note: 'Self-reported yes / no / not_sure.' },
  { signal: 'registration_deadlines_open', source: `Deadline registration_renewal / IRP (${SRC}/demo/vaultSeed.ts:220)`, status: 'EXISTING', note: '' },
  { signal: 'vehicles_without_coverage', source: `insurance policy vehicles vs power units (${SRC}/demo/insuranceSeed.ts:148)`, status: 'PARTIAL', note: '' },
  { signal: 'factoring_ready_loads', source: `Load.factoringHandoffStatus === "ready" (${SRC}/portal/clientCommandCenterService.ts:445)`, status: 'EXISTING', note: 'Not counted per client in this proof → null (rule suppressed REQUIRED_DATA_MISSING).' },
  { signal: 'factoring_active', source: `FactoringProfile.enrollmentStatus active (${SRC}/factoring/factoringTypes.ts:87)`, status: 'EXISTING', note: '' },
  { signal: 'fuel_transactions_in_books', source: 'none — bookkeeping transactions are not exposed per org by category', status: 'MISSING', note: 'BOOKKEEPING → IFTA stays suppressed until a source exists.' },
];

/** Pre-existing generic availability fallbacks in AIO (not carried into the model — reported for the founder). */
export const AIO_LEGACY_GENERIC_FALLBACKS = [
  { surface: 'portal buildActiveServices — Dispatch', ref: `${SRC}/portal/clientCommandCenterService.ts:541`, behaviour: 'AVAILABLE for every carrier without an active enrollment (no eligibility, no relevance).' },
  { surface: 'portal buildActiveServices — Insurance', ref: `${SRC}/portal/clientCommandCenterService.ts:549`, behaviour: 'AVAILABLE when no policy / request, although insurance launch is HOLD.' },
  { surface: 'portal buildActiveServices — Factoring', ref: `${SRC}/portal/clientCommandCenterService.ts:557`, behaviour: 'AVAILABLE when no profile, although factoring launch is HOLD.' },
  { surface: 'portal buildActiveServices — Brokerage carrier network', ref: `${SRC}/portal/clientCommandCenterService.ts:566`, behaviour: 'AVAILABLE when no network profile, although brokerage launch is BLOCKED.' },
  { surface: 'portal buildActiveServices — Permitting & Compliance', ref: `${SRC}/portal/clientCommandCenterService.ts:534`, behaviour: 'Hard-coded ACTIVE for every carrier.' },
] as const;

/* ─────────────────────────────── demo seed truth (proof fixtures) ─────────────────────────────── */

type AioClient = ClientRecord & { client_type: string; conflicts: string[] };
const ent = (state: WorkspaceState, source: string) => ({ state, source });

/** AIO demo seed organisations (audit @ AIO_OFFICE_AUDIT_SHA). Signals are null where no source states them — never guessed. */
export const AIO_OFFICE_DEMO_CLIENTS: AioClient[] = [
  {
    client_id: 'client-a', name: 'Summit Ridge Hauling LLC', client_type: 'owner_operator',
    entitlements: {
      DISPATCH: ent('ACTIVE', 'DispatchEnrollment active (dispatchSeed.ts:56)'),
      FACTORING: ent('PENDING_SETUP', 'FactoringProfile interested (factoringSeed.ts:50)'),
      BOOKKEEPING: ent('PENDING_SETUP', 'BookkeepingSubscription ESSENTIALS onboarding (bookkeepingSeed.ts:63)'),
      INSURANCE: ent('PENDING_SETUP', 'InsuranceRequest submitted, no policy (insuranceSeed.ts:158)'),
      COMPLIANCE: ent('ACTIVE', 'ServiceRequest req-1 Authority + BOC-3 new_request (demoSeed.ts:50)'),
      FLEETCARE: ent('ACTIVE', 'MaintenanceTicket ×2 (fleetcareSeed.ts:92,111)'),
      DRIVERLINK: ent('ACTIVE', 'JobOpportunity published (driverlinkSeed.ts:103)'),
    },
    signals: { operates_trucks: true, interstate: true, new_entrant: true, power_units: 1, ifta_vehicles: 0, interstate_dispatch_loads: 1, ifta_account_reported: 'not_sure', registration_deadlines_open: null, vehicles_without_coverage: null, factoring_ready_loads: null, factoring_active: false, fuel_transactions_in_books: null },
    conflicts: ['Client.services omits Dispatch though the enrollment is active', 'Client 360 labels a new-coverage insurance request RENEWAL IN PROGRESS'],
  },
  {
    client_id: 'client-b', name: 'Heartland Freight Co.', client_type: 'carrier',
    entitlements: {
      IFTA: ent('ACTIVE', 'iftaQuarters (iftaSeed.ts:548)'),
      TAGS_REGISTRATION: ent('ACTIVE', 'ServiceRequest req-2 IRP documents_needed (demoSeed.ts:51)'),
      DISPATCH: ent('ACTIVE', 'DispatchEnrollment active (dispatchSeed.ts:77)'),
      FACTORING: ent('ACTIVE', 'FactoringProfile active (factoringSeed.ts:57)'),
      BOOKKEEPING: ent('ACTIVE', 'BookkeepingSubscription PLUS active (bookkeepingSeed.ts:22)'),
      INSURANCE: ent('ACTIVE', 'InsurancePolicy expiring_soon (insuranceSeed.ts:68)'),
      BROKERAGE: ent('ACTIVE', 'CarrierNetworkProfile active (brokerageSeed.ts:240)'),
      FLEETCARE: ent('ACTIVE', 'MaintenanceTicket (fleetcareSeed.ts:130)'),
      DRIVERLINK: ent('ACTIVE', 'JobOpportunity published (driverlinkSeed.ts:127)'),
    },
    signals: { operates_trucks: true, interstate: true, new_entrant: false, power_units: 1, ifta_vehicles: 1, interstate_dispatch_loads: null, ifta_account_reported: 'yes', registration_deadlines_open: null, vehicles_without_coverage: 0, factoring_ready_loads: null, factoring_active: true, fuel_transactions_in_books: null },
    conflicts: ['Fleet size 4 (Road Ready) vs 1 power unit / 1 IFTA vehicle', 'Carrier brokerage portal falls back to client-b for other orgs (brokerageActions.ts:38)'],
  },
  {
    client_id: 'client-c', name: 'Pioneer Fleet Services', client_type: 'fleet',
    entitlements: {
      IFTA: ent('ACTIVE', 'iftaQuarters (iftaSeed.ts:458)'),
      DISPATCH: ent('ACTIVE', 'DispatchEnrollment active (dispatchSeed.ts:94)'),
      FACTORING: ent('ACTIVE', 'FactoringProfile active (factoringSeed.ts:70)'),
      BOOKKEEPING: ent('ACTIVE', 'BookkeepingSubscription ALL_IN_ONE active (bookkeepingSeed.ts:43)'),
      INSURANCE: ent('ACTIVE', 'InsurancePolicy active (insuranceSeed.ts:86)'),
      BROKERAGE: ent('ACTIVE', 'CarrierNetworkProfile active (brokerageSeed.ts:255)'),
    },
    signals: { operates_trucks: true, interstate: true, new_entrant: false, power_units: 3, ifta_vehicles: 3, interstate_dispatch_loads: null, ifta_account_reported: 'yes', registration_deadlines_open: 2, vehicles_without_coverage: 0, factoring_ready_loads: null, factoring_active: true, fuel_transactions_in_books: null },
    conflicts: ['Fleet size 8 (Road Ready) vs 3 power units'],
  },
  {
    client_id: 'client-d', name: 'BlueLine Transport', client_type: 'carrier',
    entitlements: {
      IFTA: ent('ACTIVE', 'iftaQuarters (iftaSeed.ts:585)'),
      DISPATCH: ent('ACTIVE', 'DispatchEnrollment active (dispatchSeed.ts:105)'),
      FACTORING: ent('ACTIVE', 'FactoringProfile active (factoringSeed.ts:80)'),
      INSURANCE: ent('PENDING_SETUP', 'InsuranceRequest information_needed (insuranceSeed.ts:172)'),
      BROKERAGE: ent('ACTIVE', 'CarrierNetworkProfile active (brokerageSeed.ts:284)'),
    },
    signals: { operates_trucks: true, interstate: true, new_entrant: false, power_units: 2, ifta_vehicles: 2, interstate_dispatch_loads: null, ifta_account_reported: 'yes', registration_deadlines_open: null, vehicles_without_coverage: null, factoring_ready_loads: null, factoring_active: true, fuel_transactions_in_books: null },
    conflicts: ['Truck profiles 1 vs power units 2'],
  },
  {
    client_id: 'client-e', name: 'NorthStar Manufacturing', client_type: 'shipper',
    entitlements: {
      BROKERAGE: ent('ACTIVE', 'ShipperProfile active (brokerageSeed.ts:94)'),
      DISPATCH: ent('PENDING_SETUP', 'DispatchEnrollment interested (dispatchSeed.ts:116) — CONFLICT for a shipper'),
      FACTORING: ent('ACTIVE', 'FactoringProfile active (factoringSeed.ts:90) — CONFLICT for a shipper'),
    },
    signals: { operates_trucks: false, interstate: null, new_entrant: false, power_units: 0, ifta_vehicles: 0, interstate_dispatch_loads: null, ifta_account_reported: null, registration_deadlines_open: null, vehicles_without_coverage: null, factoring_ready_loads: null, factoring_active: true, fuel_transactions_in_books: null },
    conflicts: ['Shipper with an active factoring profile and a dispatch enrollment', 'Overdue permit deadline for a shipper (vaultSeed.ts:222)'],
  },
  {
    client_id: 'shipper-demo-b', name: 'Lakeview Distribution Co.', client_type: 'shipper',
    entitlements: { BROKERAGE: ent('PENDING_SETUP', 'ShipperProfile onboarding (brokerageSeed.ts:107)') },
    signals: { operates_trucks: false, interstate: null, new_entrant: null, power_units: 0, ifta_vehicles: 0, interstate_dispatch_loads: null, ifta_account_reported: null, registration_deadlines_open: null, vehicles_without_coverage: null, factoring_ready_loads: null, factoring_active: false, fuel_transactions_in_books: null },
    conflicts: ['Not selectable in the demo banner (AIODebugBanner.tsx:16)'],
  },
  {
    client_id: 'client-f', name: 'Delta Haul LLC', client_type: 'owner_operator',
    entitlements: {
      IFTA: ent('ACTIVE', 'iftaQuarters (iftaSeed.ts:603)'),
      FACTORING: ent('ACTIVE', 'FactoringProfile active (factoringSeed.ts:100)'),
      INSURANCE: ent('PENDING_SETUP', 'InsuranceRequest partner_review (insuranceSeed.ts:187)'),
    },
    signals: { operates_trucks: true, interstate: null, new_entrant: null, power_units: null, ifta_vehicles: 1, interstate_dispatch_loads: null, ifta_account_reported: null, registration_deadlines_open: null, vehicles_without_coverage: null, factoring_ready_loads: null, factoring_active: true, fuel_transactions_in_books: null },
    conflicts: ['Client.services says Dispatch but no enrollment exists', 'IFTA vehicle ifta-f-v1 not in powerUnits (fleet registry 0 vs IFTA 1 → power_units unknown); no Road Ready profile'],
  },
  {
    client_id: 'client-g', name: 'RidgeLine Carriers', client_type: 'carrier',
    entitlements: {
      IFTA: ent('ACTIVE', 'iftaQuarters (iftaSeed.ts:618)'),
      FACTORING: ent('ACTIVE', 'FactoringProfile active (factoringSeed.ts:110)'),
      INSURANCE: ent('PENDING_SETUP', 'InsuranceRequest renewal_help customer_review (insuranceSeed.ts:203)'),
    },
    signals: { operates_trucks: true, interstate: null, new_entrant: null, power_units: null, ifta_vehicles: 2, interstate_dispatch_loads: null, ifta_account_reported: null, registration_deadlines_open: null, vehicles_without_coverage: null, factoring_ready_loads: null, factoring_active: true, fuel_transactions_in_books: null },
    conflicts: ['IFTA vehicles RL-11 / RL-14 not in powerUnits (fleet registry 0 vs IFTA 2 → power_units unknown); no Road Ready profile'],
  },
];

/* ─────────────────────────────── canonical IFTA cases ─────────────────────────────── */

/** Reference date for the date-relative IFTA seed (createIftaSeed(now)): filing quarter = last ended quarter. */
export const AIO_OFFICE_REFERENCE_DATE = '2026-10-06';
const IFTA_SEED_QUARTERS: Record<string, [string, string][]> = {
  'client-c': [['2026-Q2', 'ARCHIVED'], ['2026-Q3', 'NEEDS_CLIENT'], ['2026-Q4', 'COLLECTING']],
  'client-b': [['2026-Q2', 'ARCHIVED'], ['2026-Q3', 'NEEDS_CLIENT'], ['2026-Q4', 'COLLECTING']],
  'client-d': [['2026-Q2', 'ARCHIVED'], ['2026-Q3', 'RECONCILING'], ['2026-Q4', 'QUARTER_OPEN']],
  'client-f': [['2026-Q2', 'ARCHIVED'], ['2026-Q3', 'FILING'], ['2026-Q4', 'QUARTER_OPEN']],
  'client-g': [['2026-Q2', 'ARCHIVED'], ['2026-Q3', 'FILED'], ['2026-Q4', 'QUARTER_OPEN']],
};

/** One IftaQuarterCase per organisation-quarter (record id `ifta-{org}-{year}-q{n}`, iftaSeed.ts:145) = one canonical case. */
export const AIO_IFTA_CASES: CaseRecord[] = Object.entries(IFTA_SEED_QUARTERS).flatMap(([client_id, qs]) => qs.map(([q, status]) => {
  const identity = { project_id: 'AIO', client_id, workspace_id: 'IFTA', case_type: 'IFTA_QUARTER', subcontext: q };
  const [year, n] = q.split('-Q');
  return { case_key: canonicalCaseKey(identity), identity, record_id: `ifta-${client_id}-${year}-q${n}`, status };
}));

export const AIO_OFFICE_DATA: OfficeData = {
  project_id: 'AIO',
  environments: AIO_ENVIRONMENTS,
  workspaces: AIO_WORKSPACES,
  clients: AIO_OFFICE_DEMO_CLIENTS,
  cases: AIO_IFTA_CASES,
  defaultCaseType: (ws) => (ws === 'IFTA' ? 'IFTA_QUARTER' : null),
  // The quarter that still needs work (filing quarter until archived), else the current open quarter.
  defaultSubcontext: (ws, client_id) => {
    if (ws !== 'IFTA') return null;
    const mine = AIO_IFTA_CASES.filter((c) => c.identity.client_id === client_id && c.status !== 'ARCHIVED');
    return mine.length ? mine[0].identity.subcontext : null;
  },
  // Every office role holds clients.read over every client today (officeContext.ts:75-166) — not broadened, not narrowed.
  internalCanAccess: (client_id) => AIO_OFFICE_DEMO_CLIENTS.some((c) => c.client_id === client_id),
};

/* ─────────────────────────────── queue derivation (IFTA workspace landing) ─────────────────────────────── */

/** §17 queue questions → the existing derivation that answers them (fsbw src/ifta). */
export const AIO_IFTA_QUEUE_QUESTIONS = [
  { question: 'WHICH CLIENT-QUARTERS NEED ATTENTION', answer: 'bucket BLOCKED + NEEDS_REVIEW + effective state OVERDUE_RISK', source: `${SRC}/ifta/iftaDerive.ts:528 staffBucket · :328 effectiveState`, status: 'EXISTING' },
  { question: 'WHAT IS DUE NEXT', answer: 'sort by due date × bucket priority × readiness', source: `${SRC}/ifta/iftaDerive.ts:596 sortStaffQueue`, status: 'EXISTING' },
  { question: 'WHAT IS BLOCKED', answer: 'bucket BLOCKED (contract hub_buckets: OVERDUE_RISK · FILING_REJECTED)', source: `${SRC}/ifta/iftaDerive.ts:528 · ${SRC}/ifta/experience/iftaExperience.ts:355 staffHubBucketFor`, status: 'EXISTING' },
  { question: 'WHAT WAITS ON THE CLIENT', answer: 'bucket AWAITING_CLIENT (QUARTER_OPEN · COLLECTING · NEEDS_CLIENT · AWAITING_APPROVAL)', source: `${SRC}/ifta/iftaDerive.ts:528`, status: 'EXISTING' },
  { question: 'WHAT WAITS ON AIO', answer: 'bucket NEEDS_REVIEW (AIO_REVIEW · RECONCILING)', source: `${SRC}/ifta/iftaDerive.ts:528`, status: 'EXISTING' },
  { question: 'WHAT IS READY FOR PREPARATION', answer: 'state AIO_REVIEW (client sent the quarter; reconciliation not started)', source: `${SRC}/ifta/iftaTypes.ts:154 state`, status: 'EXISTING' },
  { question: 'WHAT IS AWAITING APPROVAL', answer: 'state AWAITING_APPROVAL', source: `${SRC}/ifta/iftaTypes.ts:154 state`, status: 'EXISTING' },
  { question: 'WHAT IS READY TO FILE', answer: 'bucket READY_TO_FILE (approved, FILING)', source: `${SRC}/ifta/iftaDerive.ts:528`, status: 'EXISTING' },
  { question: 'WHAT WAS RETURNED / REJECTED', answer: 'state FILING_REJECTED (inside bucket BLOCKED)', source: 'no FILING_REJECTED writer (STAFF.write.recordRejection MISSING) — the bucket can never populate until it exists', status: 'MISSING' },
] as const;

/** Candidate queue fields → contract truth. A field without truth renders absent, never invented. */
export const AIO_IFTA_QUEUE_FIELDS = [
  { field: 'CLIENT', source: `IftaQuarterCase.organizationId → Client.companyName (${SRC}/demo/demoTypes.ts:321)`, status: 'EXISTING' },
  { field: 'ACCOUNT', source: `IftaQuarterCase.iftaAccount + baseJurisdiction (${SRC}/ifta/iftaTypes.ts:151-153)`, status: 'EXISTING' },
  { field: 'QUARTER', source: `IftaQuarterCase.year + quarter (${SRC}/ifta/iftaTypes.ts:146-147)`, status: 'EXISTING' },
  { field: 'DUE DATE', source: `IftaQuarterCase.dueDate (${SRC}/ifta/iftaTypes.ts:150)`, status: 'EXISTING' },
  { field: 'READINESS', source: `packetCompleteness().pct (${SRC}/ifta/iftaDerive.ts:256)`, status: 'EXISTING' },
  { field: 'CURRENT STATE', source: `effectiveState() + staffStatusLine() (${SRC}/ifta/iftaDerive.ts:328 · :537)`, status: 'EXISTING' },
  { field: 'NEEDS YOU', source: `clientOpenItems().length (${SRC}/ifta/iftaDerive.ts:287)`, status: 'EXISTING' },
  { field: 'BLOCKER', source: `blocking items + open discrepancies / corrections (${SRC}/ifta/iftaDerive.ts:333 · iftaTypes.ts:163-164)`, status: 'PARTIAL' },
  { field: 'RISK', source: 'effective state OVERDUE_RISK (deadline risk only)', status: 'PARTIAL', note: 'No risk-tier model (LOW / MEDIUM / HIGH RISK has no backing).' },
  { field: 'ASSIGNEE', source: `IftaQuarterCase.assignedStaffId → StaffMember.name (${SRC}/ifta/iftaTypes.ts:155)`, status: 'EXISTING', note: 'Case-level assignee; per-task assignees have no model.' },
  { field: 'LAST CLIENT ACTIVITY', source: `max(audit[].at where actor = CLIENT) (${SRC}/ifta/iftaTypes.ts:134-141)`, status: 'EXISTING' },
  { field: 'NEXT ACTION', source: `staffNextAction() (${SRC}/ifta/iftaDerive.ts:581)`, status: 'EXISTING' },
] as const;

/* ─────────────────────────────── proof scenarios (sprint §35 A–H) ─────────────────────────────── */

const pick = (c: ReturnType<typeof resolveContext>) => ({ environment_id: c.environment_id, client_id: c.client_id, workspace_id: c.workspace_id, subcontext: c.subcontext, view: c.view, workspace_state: c.workspace_state, case_key: c.case_key, record_id: c.record_id, scope_key: c.scope_key });
const errorCode = (f: () => unknown) => { try { f(); return null; } catch (e) { return e instanceof ContextError ? e.code : String(e); } };
const ws = (id: string) => AIO_WORKSPACES.find((w) => w.workspace_id === id)!;
const client = (id: string) => AIO_OFFICE_DEMO_CLIENTS.find((c) => c.client_id === id)!;
const HUB_TRIGGER = { placement: 'CLIENT_OFFICE_HUB', current_workspace_id: null, critical_state: false, error_recovery: false } as const;

/** Executable switching proofs over the demo seed (also asserted by tests/aioOfficeWorkspaceArchitecture1.test.ts). */
export function aioOfficeProofScenarios() {
  const D = AIO_OFFICE_DATA;
  const caseC = enterFromWorkspaceQueue(D, 'AIO.OFFICE', 'IFTA', 'client-c', '2026-Q3');
  const viaClient = enterFromClient(D, 'AIO.OFFICE', 'client-c', 'IFTA', '2026-Q3');
  const toB = switchClient(D, caseC, 'client-b');
  const toA = switchClient(D, caseC, 'client-a');
  const toDispatch = switchWorkspace(D, caseC, 'DISPATCH');
  const toTags = switchWorkspace(D, caseC, 'TAGS_REGISTRATION');
  const q4 = switchSubcontext(D, caseC, '2026-Q4');
  const portalC = openClientOffice(D, 'AIO.CLIENT_OFFICE', 'client-c', 'IFTA');
  const portalBooks = switchWorkspace(D, portalC, 'BOOKKEEPING');
  const portalTags = switchWorkspace(D, portalC, 'TAGS_REGISTRATION');
  const portalE = openClientOffice(D, 'AIO.CLIENT_OFFICE', 'client-e', 'IFTA');
  const records = [
    { client_id: 'client-c', case_key: caseC.case_key, label: 'client-c Q3 receipt' },
    { client_id: 'client-b', case_key: toB.case_key, label: 'client-b Q3 receipt' },
    { client_id: 'client-a', case_key: null, label: 'client-a dispatch load' },
  ];
  return {
    A_FOUNDER_CLIENT_SWITCH: {
      from: pick(caseC), to_client_with_case: pick(toB), to_client_without_workspace: pick(toA),
      workspace_preserved: toB.workspace_id === caseC.workspace_id && toA.workspace_id === caseC.workspace_id,
      subcontext_preserved_when_case_exists: toB.subcontext === caseC.subcontext,
      never_another_client: toA.client_id === 'client-a' && toA.view === 'WORKSPACE_INACTIVE' && toA.record_id === null,
    },
    B_FOUNDER_WORKSPACE_SWITCH: { from: pick(caseC), to_active: pick(toDispatch), to_inactive: pick(toTags), client_preserved: toDispatch.client_id === 'client-c' && toTags.client_id === 'client-c', subcontext_switch: pick(q4) },
    C_CLIENT_WORKSPACE_SWITCH: { from: pick(portalC), to_active: pick(portalBooks), to_available: pick(portalTags), client_fixed: [portalC, portalBooks, portalTags].every((c) => c.client_fixed && c.client_id === 'client-c') },
    D_CLIENT_HAS_NO_CLIENT_SWITCHER: {
      switchers: AIO_ENVIRONMENTS.find((e) => e.environment_id === 'AIO.CLIENT_OFFICE')!.switchers.map((s) => s.dimension),
      switch_client_error: errorCode(() => switchClient(D, portalC, 'client-b')),
      foreign_client_error: errorCode(() => resolveContext(D, { environment_id: 'AIO.CLIENT_OFFICE', client_id: 'client-b', workspace_id: 'IFTA', subcontext: null }, 'client-c')),
      context_switchers: portalC.switchers,
    },
    E_INACTIVE_FOUNDER_WORKSPACE: { context: pick(enterFromClient(D, 'AIO.OFFICE', 'client-a', 'IFTA', null)), supported_actions: ['VIEW CLIENT OVERVIEW', 'RETURN TO WORKSPACE QUEUE', 'VIEW ELIGIBILITY'], not_offered: { 'START SERVICE': ws('IFTA').staff_can_start ? null : 'no staff activation writer for IFTA' } },
    F_INACTIVE_CLIENT_WORKSPACE_EXPANSION: { context: pick(portalTags), expansion: evaluateExpansion(ws('TAGS_REGISTRATION'), client('client-c'), AIO_WORKSPACES, { ...HUB_TRIGGER, placement: 'WORKSPACE_SWITCHER_AVAILABLE', current_workspace_id: 'IFTA' }), during_critical_state: evaluateExpansion(ws('TAGS_REGISTRATION'), client('client-c'), AIO_WORKSPACES, { ...HUB_TRIGGER, critical_state: true }) },
    G_NOT_APPLICABLE_NOT_AGGRESSIVE: { context: pick(portalE), switcher: workspaceSwitcherOptions(D, 'client-e'), expansion: evaluateExpansion(ws('IFTA'), client('client-e'), AIO_WORKSPACES, HUB_TRIGGER) },
    H_SAME_CASE_TWO_ENTRY_PATHS: { from_queue: pick(caseC), from_client: pick(viaClient), same_case: caseC.case_key === viaClient.case_key && caseC.record_id === viaClient.record_id, client_projection: pick(portalC), same_record_for_client: portalC.record_id === caseC.record_id, uniqueness: checkCaseUniqueness(D.cases) },
    STALE_STATE: { before: scopeRecords(caseC, records).map((r) => r.label), after_client_switch: scopeRecords(toB, records).map((r) => r.label), after_inactive_switch: scopeRecords(toA, records).map((r) => r.label), scope_keys_differ: new Set([caseC.scope_key, toB.scope_key, toA.scope_key, toDispatch.scope_key]).size === 4, re_resolves: caseC.re_resolves },
  };
}
