/**
 * AIO IFTA — data contract reconciliation (sprint §37–38). Maps the existing AIO functional truth (tables, services,
 * routes, mutations, RLS, files, requests — read-only scan in data-evidence.ts) onto the experience tree.
 * DO NOT CHANGE THEM: this module only classifies. Visual status and data status stay separate (node readiness).
 *
 * Contract-ref status rule:
 *   EXISTING — the function exists and behaves per the experience contract in AIO's current runtime (the demo store,
 *              AIO's default data mode). Persistence is reported separately.
 *   PARTIAL  — exists with a material gap (stand-in parser, missing writer, metadata only, missing fields).
 *   MISSING  — nothing implements it.   CONFLICT — existing truth contradicts the contract.
 */
import type { DataContractRef, DataDomainContract, DataReconciliationStatus } from '../../../tree.js';
import { AIO_SCANNED_DOMAINS, type ScannedDomain } from './data-evidence.js';

const DOMAIN_META: Record<string, { label: string; owner: string; readers: string[]; writers: string[]; experience_refs: string[] }> = {
  QUARTER_CASE: { label: 'Quarter case (state machine, period, due date, enrollment)', owner: 'CLIENT (record) · AIO (process)', readers: ['CLIENT', 'FOUNDER_STAFF'], writers: ['CLIENT', 'FOUNDER_STAFF', 'SYSTEM'], experience_refs: ['states', 'transitions', 'primary_visual_object'] },
  FUEL_RECEIPTS: { label: 'Fuel receipts', owner: 'CLIENT', readers: ['CLIENT', 'FOUNDER_STAFF'], writers: ['CLIENT', 'FOUNDER_STAFF', 'SYSTEM'], experience_refs: ['required_inputs.FUEL_RECEIPTS', 'output_artifacts.FUEL_RECEIPT'] },
  MILEAGE: { label: 'Miles by jurisdiction per truck', owner: 'CLIENT', readers: ['CLIENT', 'FOUNDER_STAFF'], writers: ['CLIENT', 'FOUNDER_STAFF'], experience_refs: ['required_inputs.JURISDICTION_MILEAGE', 'output_artifacts.JURISDICTION_MILEAGE_RECORD'] },
  VEHICLES: { label: 'Quarter vehicles (participation)', owner: 'CLIENT', readers: ['CLIENT', 'FOUNDER_STAFF'], writers: ['CLIENT', 'FOUNDER_STAFF'], experience_refs: ['required_inputs.QUARTER_VEHICLES'] },
  JURISDICTIONS: { label: 'Jurisdictions (distribution, allocation, tax relationship)', owner: 'AIO', readers: ['CLIENT', 'FOUNDER_STAFF'], writers: ['FOUNDER_STAFF'], experience_refs: ['system_derivations.JURISDICTION_CLASSIFY'] },
  RETURN_SUMMARY: { label: 'Return summary / tax figures', owner: 'AIO', readers: ['CLIENT', 'FOUNDER_STAFF'], writers: ['FOUNDER_STAFF'], experience_refs: ['output_artifacts.RETURN_SUMMARY', 'system_derivations.RETURN_SUMMARY'] },
  FILING: { label: 'Filing record + confirmation', owner: 'CLIENT (record) · AIO (action)', readers: ['CLIENT', 'FOUNDER_STAFF'], writers: ['FOUNDER_STAFF'], experience_refs: ['output_artifacts.FILED_RETURN', 'output_artifacts.FILING_CONFIRMATION'] },
  PAYMENT: { label: 'Carrier tax payment status (+ AIO fee, separate)', owner: 'CLIENT', readers: ['CLIENT', 'FOUNDER_STAFF'], writers: ['FOUNDER_STAFF'], experience_refs: ['perspectives.founder_staff.completion'] },
  DOCUMENTS_VAULT: { label: 'Documents + Vault packet', owner: 'CLIENT', readers: ['CLIENT', 'FOUNDER_STAFF'], writers: ['CLIENT', 'FOUNDER_STAFF', 'SYSTEM'], experience_refs: ['vault_destination', 'output_artifacts.QUARTER_PACKET'] },
  MESSAGES: { label: 'Quarter request thread', owner: 'SHARED', readers: ['CLIENT', 'FOUNDER_STAFF'], writers: ['CLIENT', 'FOUNDER_STAFF'], experience_refs: ['inbox_events', 'perspectives.client.project_room.messages'] },
  NOTIFICATIONS_INBOX: { label: 'Notifications + inbox events', owner: 'SYSTEM', readers: ['CLIENT', 'FOUNDER_STAFF'], writers: ['SYSTEM'], experience_refs: ['inbox_events', 'notifications'] },
  ACTIVITY: { label: 'Activity events', owner: 'SYSTEM', readers: ['CLIENT', 'FOUNDER_STAFF'], writers: ['SYSTEM'], experience_refs: ['activity_events'] },
  STAFF_WORK_QUEUE: { label: 'Fuel tax work queue', owner: 'AIO', readers: ['FOUNDER_STAFF'], writers: ['SYSTEM', 'FOUNDER_STAFF'], experience_refs: ['perspectives.founder_staff.work_queue', 'human_tasks'] },
  SERVICE_ENROLLMENT_REQUESTS: { label: 'Service enrollment / request', owner: 'AIO', readers: ['PUBLIC', 'CLIENT', 'FOUNDER_STAFF'], writers: ['PUBLIC', 'CLIENT', 'FOUNDER_STAFF'], experience_refs: ['transitions NOT_ENROLLED → QUARTER_OPEN', 'public_cta'] },
  PERMISSIONS_ROLES: { label: 'Actor permissions', owner: 'AIO', readers: ['SYSTEM'], writers: ['FOUNDER_STAFF'], experience_refs: ['primary_actors'] },
  PUBLIC_CONTENT: { label: 'Public service content + availability', owner: 'AIO', readers: ['PUBLIC'], writers: ['FOUNDER_STAFF'], experience_refs: ['perspectives.public'] },
  CORRECTION_REQUESTS: { label: 'Corrections + discrepancies', owner: 'AIO', readers: ['CLIENT', 'FOUNDER_STAFF'], writers: ['FOUNDER_STAFF'], experience_refs: ['perspectives.founder_staff.corrections', 'output_artifacts.DISCREPANCY_LOG'] },
  AUDIT_TRAIL: { label: 'Audit trail', owner: 'AIO', readers: ['FOUNDER_STAFF'], writers: ['SYSTEM'], experience_refs: ['perspectives.founder_staff.audit_history'] },
  NOTES: { label: 'Notes (client notes for AIO · staff internal notes)', owner: 'SHARED', readers: ['CLIENT', 'FOUNDER_STAFF'], writers: ['CLIENT', 'FOUNDER_STAFF'], experience_refs: ['optional_inputs.NOTES_FOR_AIO'] },
  CLIENT_HEALTH_RISK: { label: 'Client health / risk', owner: 'AIO', readers: ['FOUNDER_STAFF'], writers: ['SYSTEM'], experience_refs: ['perspectives.founder_staff.blockers'] },
  ANALYTICS_EVENTS: { label: 'Product analytics events', owner: 'AIO', readers: ['FOUNDER_STAFF'], writers: ['SYSTEM'], experience_refs: [] },
  OFFICE_CONTEXT: { label: 'Office context (clients · workspace states · canonical case index · expansion signals)', owner: 'AIO', readers: ['CLIENT', 'FOUNDER_STAFF'], writers: ['SYSTEM'], experience_refs: ['AIO_OFFICE_CONTEXT_MODEL', 'AIO_OFFICE_WORKSPACE_REGISTRY'] },
};

/**
 * Office-context domain (P0.AIO.OFFICE-WORKSPACE-ARCHITECTURE-AND-IFTA-TREE-FOUNDER-LOCK1) — from the read-only office /
 * portal / identity / entitlement audit of fsbw @ 20438a2 (IFTA code unchanged since the 48d463f scan).
 */
const OFFICE_SCANNED_DOMAINS: ScannedDomain[] = [{
  domain_id: 'OFFICE_CONTEXT', summary_status: 'PARTIAL',
  evidence: {
    TABLES: { status: 'PARTIAL', refs: ['all-in-one-enterprises/src/demo/demoTypes.ts:321', 'all-in-one-enterprises/src/demo/demoTypes.ts:565', 'all-in-one-enterprises/supabase/migrations/20260815100000_aio_identity_foundation.sql:59'], note: 'Client (= organisation id in demo) + per-domain entitlement records (iftaQuarters, DispatchEnrollment, FactoringProfile, BookkeepingSubscription, InsurancePolicy …); aio_organizations in Supabase. No workspace-state table.' },
    SERVICES: { status: 'CONFLICT', refs: ['all-in-one-enterprises/src/portal/clientCommandCenterService.ts:524', 'all-in-one-enterprises/src/office-core/client360Service.ts:29'], note: 'Two disagreeing “active services” heuristics (portal hard-codes permitting ACTIVE); neither covers IFTA. The Brain workspace resolver is the canonical replacement.' },
    ROUTES: { status: 'PARTIAL', refs: ['all-in-one-enterprises/src/office/routes/OfficeRoutes.tsx:261', 'all-in-one-enterprises/src/utils/paths.ts:217'], note: 'Client context only via the :clientId route param; no workspace routes; IFTA helpers unrouted.' },
    MUTATIONS: { status: 'NOT_APPLICABLE', refs: [], note: 'Context is resolved, never written.' },
    RLS: { status: 'PARTIAL', refs: ['all-in-one-enterprises/supabase/migrations/20260815100000_aio_identity_foundation.sql:144', 'all-in-one-enterprises/src/auth/guards/RouteGuards.tsx:69'], note: 'aio_user_org_ids() is multi-org capable; office guard passes everyone in demo mode; every office role reads every client.' },
    FILES: { status: 'NOT_APPLICABLE', refs: [], note: '' },
    REQUESTS: { status: 'PARTIAL', refs: ['all-in-one-enterprises/src/demo/demoTypes.ts:359'], note: 'Request-only services (tags, permitting, compliance, formation) have no standing service record — an open request is the case.' },
  },
  fields_present: ['client id / name / type', 'IFTA quarter case per organisation-quarter', 'per-domain enrollment statuses', 'Road Ready operating facts (interstate, fleet size, accounts)', 'deadlines / renewals', 'dispatch loads (origin / destination states)'],
  fields_missing: ['canonical client × workspace state resolver', 'office-wide client context / switcher', 'workspace switcher', 'fuel transactions per org in books (expansion signal)', 'founder role mapping'],
  conflicts: ['Client.services free text disagrees with domain records', 'fleet size vs power units (client-b 4 vs 1, client-c 8 vs 3)', 'shipper client-e has active factoring + dispatch enrollment', 'session takes the first org membership only'],
  legacy_duplicates: ['portal buildActiveServices', 'Client 360 activeServices'],
}];

export const AIO_IFTA_DATA_DOMAINS: DataDomainContract[] = [...AIO_SCANNED_DOMAINS, ...OFFICE_SCANNED_DOMAINS].map((d) => {
  const meta = DOMAIN_META[d.domain_id];
  if (!meta) throw new Error(`no domain meta for ${d.domain_id}`);
  return { domain_id: d.domain_id, ...meta, status: d.summary_status, evidence: d.evidence, fields_present: d.fields_present, fields_missing: d.fields_missing, conflicts: d.conflicts, legacy_duplicates: d.legacy_duplicates };
});

/* ─────────────────────────────── read / write contracts the tree binds to ─────────────────────────────── */

const SRC = 'all-in-one-enterprises/src';
type Persist = 'DEMO_STORE' | 'SUPABASE_AND_DEMO' | 'PURE_DERIVATION' | 'STATIC_CONTENT' | 'NONE';
export type AioDataContractRef = DataContractRef & { persistence: Persist };
const C = (contract_id: string, kind: 'READ' | 'WRITE', domain_id: string, implementation: string, status: DataReconciliationStatus, persistence: Persist, note?: string): AioDataContractRef => ({ contract_id, kind, domain_id, implementation, status, persistence, ...(note ? { note } : {}) });

export const AIO_IFTA_DATA_CONTRACTS: AioDataContractRef[] = [
  /* READ */
  C('QUARTER.read.case', 'READ', 'QUARTER_CASE', `${SRC}/ifta/iftaActions.ts:52 findQuarter · DemoStore.iftaQuarters (demo/demoTypes.ts:565)`, 'EXISTING', 'DEMO_STORE', 'No route registered yet (see implementation prerequisites).'),
  C('QUARTER.read.derived', 'READ', 'QUARTER_CASE', `${SRC}/ifta/iftaDerive.ts:328 effectiveState · :345 canSendToAio · :367 quarterStages · :256 packetCompleteness · :287 clientOpenItems · :469 nextItemLine`, 'EXISTING', 'PURE_DERIVATION'),
  C('QUARTER.read.history', 'READ', 'QUARTER_CASE', `${SRC}/ifta/iftaSeed.ts (archived Q2 + successor Q4) · iftaQuarters by organizationId`, 'EXISTING', 'DEMO_STORE'),
  C('FUEL.read.receipts', 'READ', 'FUEL_RECEIPTS', `${SRC}/ifta/iftaTypes.ts:20 IftaReceipt · iftaDerive.ts:101 receiptCounts · :114 receiptTotals`, 'EXISTING', 'DEMO_STORE', 'Missing fields: fuel type, price per gallon, tax-paid split, file hash.'),
  C('MILEAGE.read.records', 'READ', 'MILEAGE', `${SRC}/ifta/iftaDerive.ts:137 activeMileage · :184 vehicleReadiness (assessIftaReadiness unchanged)`, 'EXISTING', 'DEMO_STORE', 'No trip records (origin / destination / odometer).'),
  C('VEHICLES.read.quarter', 'READ', 'VEHICLES', `${SRC}/ifta/iftaTypes.ts:57 IftaVehicle · iftaDerive.ts:232 fleetReadiness`, 'PARTIAL', 'DEMO_STORE', 'IFTA vehicle copies — LEGACY_DUPLICATE of powerUnits / aio_fleet_vehicles; no fleet id reference.'),
  C('VEHICLES.read.fleet', 'READ', 'VEHICLES', `${SRC}/road-ready powerUnits · supabase aio_fleet_vehicles (20260817190000_aio_fleetcare_network.sql:86)`, 'EXISTING', 'SUPABASE_AND_DEMO', 'Fleet profile (cross-feature owner of units).'),
  C('JURIS.read.breakdown', 'READ', 'JURISDICTIONS', `${SRC}/ifta/iftaDerive.ts:620 milesWithoutFuel · iftaSeed.ts:312 returnSummaryFrom per-jurisdiction sums · iftaJurisdictions.ts:3`, 'PARTIAL', 'PURE_DERIVATION', 'Names for 13 US states only; no Canadian provinces / metric units; no pre-summary per-jurisdiction rollup function.'),
  C('JURIS.read.tax', 'READ', 'RETURN_SUMMARY', `${SRC}/ifta/iftaTypes.ts:69 IftaReturnLine.netTax (staff-entered)`, 'PARTIAL', 'DEMO_STORE', 'No rate table, no tax computation; net tax exists only after the staff-prepared return summary.'),
  C('RETURN.read.summary', 'READ', 'RETURN_SUMMARY', `${SRC}/ifta/iftaTypes.ts:77 IftaReturnSummary`, 'EXISTING', 'DEMO_STORE'),
  C('FILING.read.record', 'READ', 'FILING', `${SRC}/ifta/iftaTypes.ts:91 IftaFiling`, 'EXISTING', 'DEMO_STORE'),
  C('PAYMENT.read.record', 'READ', 'PAYMENT', `${SRC}/ifta/iftaTypes.ts:98 IftaPayment`, 'EXISTING', 'DEMO_STORE'),
  C('DOCS.read.packet', 'READ', 'DOCUMENTS_VAULT', `${SRC}/ifta/iftaEvents.ts:183 sealPacketToVault (metadata-only VaultDocument)`, 'PARTIAL', 'DEMO_STORE', 'Individual receipts / reports / summary / filed return / confirmation are not stored as documents.'),
  C('DOCS.read.vault', 'READ', 'DOCUMENTS_VAULT', `${SRC}/vault · supabase aio_documents (+ versions)`, 'EXISTING', 'SUPABASE_AND_DEMO'),
  C('DOCS.read.download', 'READ', 'DOCUMENTS_VAULT', `${SRC}/vault/vaultStorage.ts:7 (data URLs in localStorage; backend “secure storage not configured”)`, 'PARTIAL', 'DEMO_STORE'),
  C('MSG.read.thread', 'READ', 'MESSAGES', `${SRC}/ifta/iftaEvents.ts:175 threadMessages`, 'EXISTING', 'DEMO_STORE'),
  C('ACTIVITY.read.ifta_client', 'READ', 'ACTIVITY', `${SRC}/ifta/iftaEvents.ts:34 emitActivity (org-scoped, visibility customer, IFTA kinds)`, 'EXISTING', 'DEMO_STORE', 'Bind to IFTA kinds with visibility customer. The generic client ActivityTimelinePage shows org-scoped internal events (privacy CONFLICT, ClientPortalPages.tsx:321) — do not reuse that filter.'),
  C('NOTIF.read', 'READ', 'NOTIFICATIONS_INBOX', `${SRC}/notifications/notificationTypes.ts (6 IFTA event types, tax_fuel)`, 'EXISTING', 'DEMO_STORE', 'Notice links point at unregistered routes until the IFTA routes exist.'),
  C('STAFF.read.queue', 'READ', 'STAFF_WORK_QUEUE', `${SRC}/ifta/iftaDerive.ts:528 staffBucket · :596 sortStaffQueue`, 'PARTIAL', 'PURE_DERIVATION', 'No OfficeWorkItem per client-quarter; no queue route.'),
  C('STAFF.read.health', 'READ', 'CLIENT_HEALTH_RISK', `${SRC}/ifta/iftaDerive.ts:256 packetCompleteness · receiptCounts · fleetReadiness`, 'PARTIAL', 'PURE_DERIVATION', 'Completeness / receipts / jurisdictions / readiness derivable; RISK TIER (LOW RISK) has no backing model.'),
  C('STAFF.read.tasks', 'READ', 'STAFF_WORK_QUEUE', `${SRC}/ifta/iftaDerive.ts:581 staffNextAction (derived from state)`, 'PARTIAL', 'PURE_DERIVATION', 'Per-task assignee + due date (authority QUARTER TASKS) have no model; tasks derivable from state + discrepancies.'),
  C('STAFF.read.dates', 'READ', 'QUARTER_CASE', `${SRC}/ifta/iftaDates.ts (period, due date)`, 'PARTIAL', 'PURE_DERIVATION', 'Draft target / client review target dates (IMPORTANT DATES) have no model.'),
  C('STAFF.read.audit', 'READ', 'AUDIT_TRAIL', `${SRC}/ifta/iftaTypes.ts:134 IftaAuditEvent (q.audit)`, 'EXISTING', 'DEMO_STORE'),
  C('STAFF.read.discrepancies', 'READ', 'CORRECTION_REQUESTS', `${SRC}/ifta/iftaTypes.ts:114 IftaDiscrepancy · :124 IftaCorrectionRequest`, 'EXISTING', 'DEMO_STORE'),
  C('STAFF.read.prior_quarter', 'READ', 'QUARTER_CASE', `${SRC}/ifta/iftaSeed.ts archived prior quarter (metric deltas vs prior quarter)`, 'EXISTING', 'DEMO_STORE'),
  C('PUBLIC.read.contract_copy', 'READ', 'PUBLIC_CONTENT', `${SRC}/ifta/experience/iftaExperience.ts:72 (vendored perspectives.public)`, 'EXISTING', 'STATIC_CONTENT'),
  C('PUBLIC.read.availability', 'READ', 'SERVICE_ENROLLMENT_REQUESTS', `${SRC}/services/catalog/serviceCatalog.ts:356 (ifta-filing PREPARING) · launch/serviceActivationLaunch.ts:56 (fuel-tax INTERNAL_ONLY) · :291 getPublicServiceCta → GO`, 'CONFLICT', 'STATIC_CONTENT', 'PREPARING vs INTERNAL_ONLY vs GO (SLUG_MAP lacks ifta-filing).'),
  C('NOTES.read', 'READ', 'NOTES', `${SRC}/demo/demoTypes.ts:409 InternalNote (generic, no IFTA entity) · no client note model`, 'MISSING', 'NONE'),
  /* WRITE */
  C('FUEL.write.captureReceipts', 'WRITE', 'FUEL_RECEIPTS', `${SRC}/ifta/iftaActions.ts:130 captureReceipts`, 'PARTIAL', 'DEMO_STORE', 'Takes file names only; parsing is a seeded stand-in (no OCR); no bytes / Vault write.'),
  C('FUEL.write.resolveReceipt', 'WRITE', 'FUEL_RECEIPTS', `${SRC}/ifta/iftaActions.ts:180 resolveReceipt (TRUCK_FUEL · REEFER_FUEL · RETAKE · ADD_RECEIPT · NO_FUEL_PURCHASED · REMOVE_DUPLICATE · KEEP_BOTH)`, 'EXISTING', 'DEMO_STORE'),
  C('FUEL.write.importCsv', 'WRITE', 'FUEL_RECEIPTS', 'none (no CSV parser; Vault FILE_POLICY forbids CSV / XLSX)', 'MISSING', 'NONE'),
  C('MILEAGE.write.addMileage', 'WRITE', 'MILEAGE', `${SRC}/ifta/iftaActions.ts:256 addMileage`, 'PARTIAL', 'DEMO_STORE', 'MANUAL_STATE_ENTRY real; ELD report / spreadsheet miles fabricated (no file parsed); ELD / GPS rejected (not live).'),
  C('VEHICLES.write.confirmVehicles', 'WRITE', 'VEHICLES', `${SRC}/ifta/iftaActions.ts:316 confirmVehicles`, 'EXISTING', 'DEMO_STORE'),
  C('QUARTER.write.sendQuarterToAio', 'WRITE', 'QUARTER_CASE', `${SRC}/ifta/iftaActions.ts:329 sendQuarterToAio`, 'EXISTING', 'DEMO_STORE'),
  C('RETURN.write.approveReturn', 'WRITE', 'RETURN_SUMMARY', `${SRC}/ifta/iftaActions.ts:351 approveReturn`, 'EXISTING', 'DEMO_STORE'),
  C('RETURN.write.askQuestion', 'WRITE', 'RETURN_SUMMARY', `${SRC}/ifta/iftaActions.ts:373 askQuestion`, 'EXISTING', 'DEMO_STORE'),
  C('MSG.write.postThread', 'WRITE', 'MESSAGES', `${SRC}/ifta/iftaEvents.ts:133 postThread · demo/communicationActions.ts:202 sendCustomerPortalReply`, 'EXISTING', 'DEMO_STORE'),
  C('DOCS.write.share', 'WRITE', 'DOCUMENTS_VAULT', 'supabase aio_document_sharing_events (RLS on, no policy) · demo download grants only', 'PARTIAL', 'NONE', 'No share flow for IFTA documents.'),
  C('STAFF.write.startReconciliation', 'WRITE', 'QUARTER_CASE', `${SRC}/ifta/iftaActions.ts:415`, 'EXISTING', 'DEMO_STORE'),
  C('STAFF.write.requestCorrection', 'WRITE', 'CORRECTION_REQUESTS', `${SRC}/ifta/iftaActions.ts:428`, 'EXISTING', 'DEMO_STORE', 'vehicleIds always [] in practice.'),
  C('STAFF.write.nudgeClient', 'WRITE', 'NOTIFICATIONS_INBOX', `${SRC}/ifta/iftaActions.ts:478`, 'EXISTING', 'DEMO_STORE'),
  C('STAFF.write.verifyReceipt', 'WRITE', 'FUEL_RECEIPTS', `${SRC}/ifta/iftaActions.ts:490`, 'EXISTING', 'DEMO_STORE'),
  C('STAFF.write.verifyMileage', 'WRITE', 'MILEAGE', `${SRC}/ifta/iftaActions.ts:502`, 'EXISTING', 'DEMO_STORE'),
  C('STAFF.write.resolveDiscrepancy', 'WRITE', 'CORRECTION_REQUESTS', `${SRC}/ifta/iftaActions.ts:521`, 'EXISTING', 'DEMO_STORE'),
  C('STAFF.write.reclassifyReceipt', 'WRITE', 'FUEL_RECEIPTS', 'none (only verifyReceipt UNDER_AIO_REVIEW → READY)', 'MISSING', 'NONE'),
  C('STAFF.write.markNotOperated', 'WRITE', 'VEHICLES', 'none (IftaVehicle.notOperatedNote is never written)', 'MISSING', 'NONE'),
  C('STAFF.write.worksheet', 'WRITE', 'RETURN_SUMMARY', 'none (staffWorksheet set only by the seed; deleted by openNextQuarter iftaActions.ts:635)', 'MISSING', 'NONE'),
  C('STAFF.write.prepareReturnSummary', 'WRITE', 'RETURN_SUMMARY', `${SRC}/ifta/iftaActions.ts:533`, 'PARTIAL', 'DEMO_STORE', 'Requires staffWorksheet, which no reducer writes — cannot succeed on a non-seeded quarter.'),
  C('STAFF.write.sendForApproval', 'WRITE', 'RETURN_SUMMARY', `${SRC}/ifta/iftaActions.ts:548`, 'EXISTING', 'DEMO_STORE'),
  C('STAFF.write.recordFiling', 'WRITE', 'FILING', `${SRC}/ifta/iftaActions.ts:564`, 'EXISTING', 'DEMO_STORE', 'Records confirmation; filed-return / confirmation files are not uploaded.'),
  C('STAFF.write.recordPayment', 'WRITE', 'PAYMENT', `${SRC}/ifta/iftaActions.ts:591`, 'EXISTING', 'DEMO_STORE'),
  C('STAFF.write.escalate', 'WRITE', 'STAFF_WORK_QUEUE', 'none', 'MISSING', 'NONE'),
  C('STAFF.write.recordRejection', 'WRITE', 'FILING', 'none (no FILING_REJECTED writer)', 'MISSING', 'NONE'),
  C('STAFF.write.reopenQuarter', 'WRITE', 'QUARTER_CASE', 'none', 'MISSING', 'NONE'),
  C('STAFF.write.exportReport', 'WRITE', 'DOCUMENTS_VAULT', 'none', 'MISSING', 'NONE'),
  C('SYSTEM.write.openNextQuarter', 'WRITE', 'QUARTER_CASE', `${SRC}/ifta/iftaActions.ts:609`, 'EXISTING', 'DEMO_STORE', 'Copies vehicles from the previous quarter, not the fleet profile.'),
  C('SYSTEM.write.sealPacket', 'WRITE', 'DOCUMENTS_VAULT', `${SRC}/ifta/iftaEvents.ts:183`, 'PARTIAL', 'DEMO_STORE', 'Metadata only.'),
  C('ENROLL.write.requestService', 'WRITE', 'SERVICE_ENROLLMENT_REQUESTS', `${SRC}/demo/demoActions.ts:113 submitServiceRequest`, 'CONFLICT', 'DEMO_STORE', 'Creates a generic ServiceRequest; never creates a quarter; availability truth conflicts (PREPARING / INTERNAL_ONLY / GO).'),
  C('NOTES.write', 'WRITE', 'NOTES', 'none (no client note model; staff InternalNote takes no IFTA entity)', 'MISSING', 'NONE'),
  /* OFFICE CONTEXT (AIO OFFICE / CLIENT OFFICE) */
  C('OFFICE.read.clients', 'READ', 'OFFICE_CONTEXT', `${SRC}/demo/demoTypes.ts:321 Client (store.clients) · office/pages/ClientsListPage.tsx:13 · office/routes/OfficeRoutes.tsx:261 (Client 360)`, 'EXISTING', 'DEMO_STORE', 'Client id is the organisation id in demo (security/authorizationGuard.ts:39). Every office role holds clients.read over every client (not broadened here).'),
  C('OFFICE.read.workspace_states', 'READ', 'OFFICE_CONTEXT', `${SRC}/demo/demoTypes.ts:565 iftaQuarters by organizationId (IFTA) · dispatch/dispatchTypes.ts:115 · factoring/factoringTypes.ts:87 · bookkeeping/bookkeepingTypes.ts:94 · insurance/insuranceTypes.ts:30`, 'PARTIAL', 'PURE_DERIVATION', 'Per-domain entitlement records exist; the canonical resolver is the Brain operating-environment model (AIO has two disagreeing heuristics and none for IFTA).'),
  C('OFFICE.read.case_index', 'READ', 'OFFICE_CONTEXT', `${SRC}/ifta/iftaSeed.ts:145 one IftaQuarterCase per organisation-quarter (id ifta-{org}-{year}-q{n}) · ifta/iftaActions.ts:52 findQuarter`, 'EXISTING', 'DEMO_STORE', 'Canonical case AIO:{client}:IFTA:IFTA_QUARTER:{YYYY-Qn} ↔ one record; founder and client read the same record.'),
  C('OFFICE.read.expansion_signals', 'READ', 'OFFICE_CONTEXT', `${SRC}/road-ready/roadReadyTypes.ts:66-103 · road-ready/roadReadyTypes.ts:111 powerUnits · demo/dispatchSeed.ts:221 loads · demo/vaultSeed.ts:220 deadlines`, 'PARTIAL', 'DEMO_STORE', 'Some signals missing (fuel transactions in books) or conflicting (fleet size vs power units) → those rules stay suppressed.'),
];

/** Family-wide data facts that no single node can fix (reported, not changed). */
export const AIO_IFTA_GLOBAL_DATA_FINDINGS = [
  { id: 'G-DATA-PERSISTENCE', status: 'MISSING', finding: 'IFTA persists only in the localStorage demo store. No Supabase IFTA table exists in the 18 migrations, and production builds reject demo mode — in production, IFTA data would not be shared between client and staff.', evidence: ['all-in-one-enterprises/src/ifta/iftaActions.ts:650', 'all-in-one-enterprises/src/infrastructure/environmentModel.ts:53', 'all-in-one-enterprises/src/config/env.ts:24'] },
  { id: 'G-DATA-AUTHZ', status: 'MISSING', finding: 'IFTA reducers check state only — no actor, permission or organisation check (findQuarter by id). Office guards pass everything in demo mode.', evidence: ['all-in-one-enterprises/src/ifta/iftaActions.ts:52', 'all-in-one-enterprises/src/auth/guards/RouteGuards.tsx:12'] },
  { id: 'G-ROUTES', status: 'CONFLICT', finding: '/portal/services/ifta is caught by services/:serviceRequestId (“Service not found”); /office/permitting/fuel-tax(/:caseId) helpers are unrouted; notification links dead-end.', evidence: ['all-in-one-enterprises/src/routes/AioCoreRoutes.tsx:337', 'all-in-one-enterprises/src/utils/paths.ts:151', 'all-in-one-enterprises/src/utils/paths.ts:217'] },
  { id: 'G-AVAILABILITY', status: 'CONFLICT', finding: 'ifta-filing PREPARING (catalog) vs fuel-tax INTERNAL_ONLY (launch) vs GO (public CTA fallback); Road Ready / journey link to a non-existent ifta-setup slug.', evidence: ['all-in-one-enterprises/src/services/catalog/serviceCatalog.ts:356', 'all-in-one-enterprises/src/launch/serviceActivationLaunch.ts:56', 'all-in-one-enterprises/src/launch/serviceActivationLaunch.ts:291', 'all-in-one-enterprises/src/road-ready/roadReadyConfig.ts:62'] },
  { id: 'G-PARSING', status: 'MISSING', finding: 'No OCR, CSV or ELD-report parsing: receipt and mileage “parsers” are seeded stand-ins; ELD / GPS integration is a vehicle-position interface only.', evidence: ['all-in-one-enterprises/src/ifta/iftaActions.ts:130', 'all-in-one-enterprises/src/ifta/iftaActions.ts:256'] },
  { id: 'G-TAX', status: 'MISSING', finding: 'No tax rates or tax computation anywhere (by design); the staff worksheet that feeds net tax has no writer and is deleted when the next quarter opens.', evidence: ['all-in-one-enterprises/src/ifta/iftaTypes.ts:69', 'all-in-one-enterprises/src/ifta/iftaActions.ts:542', 'all-in-one-enterprises/src/ifta/iftaActions.ts:635'] },
  { id: 'G-ACTIVITY-PRIVACY', status: 'CONFLICT', finding: 'The generic client activity page and command-center preview show org-scoped events of any visibility (e.g. “Internal note added”). Pre-existing; the IFTA room must read IFTA kinds with visibility customer only.', evidence: ['all-in-one-enterprises/src/pages/portal/ClientPortalPages.tsx:321', 'all-in-one-enterprises/src/portal/clientCommandCenterService.ts:716', 'all-in-one-enterprises/src/demo/demoActions.ts:337'] },
  { id: 'G-SUPABASE-EXPOSURE', status: 'CONFLICT', finding: 'Three Supabase views lack security_invoker and anon has select grants — fix before any public IFTA surface relies on Supabase.', evidence: ['all-in-one-enterprises/supabase/migrations/20260815170000_aio_indexes_views.sql:19', 'all-in-one-enterprises/supabase/migrations/20260827001621_aio_api_role_grants.sql'] },
  { id: 'G-ANALYTICS', status: 'MISSING', finding: 'No product analytics pipeline (classified DEFERRED); interaction analytics events are proposed keys carried by activity + audit.', evidence: ['all-in-one-enterprises/src/infrastructure/infrastructureInventory.ts:36'] },
] as const;

/** What an authority-driven implementation sprint needs first (sequenced; none of it is done here). */
export const AIO_IFTA_IMPLEMENTATION_PREREQUISITES = [
  'Founder confirms the page / tab / state tree and settles the OPEN decisions (pipeline step 10).',
  'Register the IFTA routes (static portal/services/ifta/* outranks services/:serviceRequestId; office/permitting/fuel-tax/*) inside the existing auth / permission guards, rendering the authority family shell — never the legacy portal / office chrome (decision D-ROUTES-SHELL).',
  'Settle availability truth (catalog / launch matrix / public CTA / ifta-setup slug) before the public page ships (decision D-IFTA-AVAILABILITY).',
  'Add the staff worksheet writer before RETURN DRAFT can work on a non-seeded quarter (data sprint).',
  'Read client activity as IFTA kinds with visibility customer (do not reuse the generic timeline filter).',
  'Production persistence (Supabase tables + RLS + org-scoped authorisation) is a separate data sprint; UI implementation can proceed against the demo-store contract.',
];

export const dataContract = (id: string) => AIO_IFTA_DATA_CONTRACTS.find((c) => c.contract_id === id);
