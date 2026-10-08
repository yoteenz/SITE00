/**
 * AIO OFFICE — root authority contracts for HOME · WORK · REPORTS · MORE
 * (P0.AIO.OFFICE-IA.FOUNDER-HOME-WORK-REPORTS-MORE.AUTHORITY-CONTRACTS1).
 *
 * What each root owns, projects, reads and may mutate; what is staff-only or founder-only; what belongs elsewhere; and
 * the honest state of every feed today. Built on the canonical IA (office-ia.ts) and a read-only source-truth audit of
 * fsbw @ AIO_OFFICE_CONTRACTS_AUDIT_SHA. Contract only: no page, nav, route, schema, auth or lifecycle change, no
 * metric invented. Where source truth is partial or absent the contract says so and names the dependency.
 */
import type {
  ActionContract,
  ClientSafeProjection,
  ContractAccess,
  ContractActor,
  ContractSource,
  DataBacking,
  DataSourceRow,
  DomainOwnership,
  ImplementationGap,
  LaneContract,
  LaneShellSection,
  MetricContract,
  MetricSourceClass,
  MoreEntryContract,
  OfficeRootContracts,
  PermissionRow,
  PrivilegedRoleContract,
  RegionContract,
  ResponsivePriority,
  RootContract,
  ShellSectionSupport,
  StateCopy,
  SurfaceState,
  VocabularyMapping,
} from '../../office-root-contracts.js';
import { laneShellRef as LS } from '../../office-root-contracts.js';
import { iaNode } from '../../office-information-architecture.js';
import { AIO_OFFICE_IA } from './office-ia.js';

export const AIO_OFFICE_CONTRACTS_SPRINT = 'P0.AIO.OFFICE-IA.FOUNDER-HOME-WORK-REPORTS-MORE.AUTHORITY-CONTRACTS1';
export const AIO_OFFICE_CONTRACTS_AUDIT_SHA = '3c060ac02a6660e0c821541d0826ff1c41d289b8';
export const AIO_OFFICE_CONTRACTS_NEXT_SPRINT = 'P0.AIO.OFFICE.FOUNDER-HOME-WORK-REPORTS-MORE.VISUAL-AUTHORITY1';

const SRC = 'all-in-one-enterprises/src';
const SQL = 'all-in-one-enterprises/supabase/migrations';
const OR = (l: string) => `${SRC}/office/routes/OfficeRoutes.tsx:${l}`;
const ATT = (l: string) => `${SRC}/office-core/officeAttentionEngine.ts:${l}`;

type Vis = Record<ContractActor, ContractAccess>;
const V_STAFF: Vis = { FOUNDER: 'FULL', STAFF: 'FULL', CLIENT: 'NONE', SERVICE_PROVIDER: 'NONE' };
const V_GRANT: Vis = { FOUNDER: 'FULL', STAFF: 'BY_GRANT', CLIENT: 'NONE', SERVICE_PROVIDER: 'NONE' };

type SourceSpec = Omit<ContractSource, 'visibility' | 'priority_rule' | 'due_rule' | 'note'> & { visibility?: Vis; priority_rule?: string; due_rule?: string; note?: string };
const src = (s: SourceSpec): ContractSource => ({ visibility: V_STAFF, priority_rule: null, due_rule: null, note: '', ...s });
const act = (a: Omit<ActionContract, 'requires' | 'evidence'> & { requires?: string; evidence?: string[] }): ActionContract => ({ requires: null, evidence: [], ...a });

/** Display states every root uses, with what the surface shows (never filler). */
const COMMON_STATES: StateCopy[] = [
  { state: 'AVAILABLE', when: 'every source of the region is backed', shows: 'the items, newest / most urgent first' },
  { state: 'PARTIAL', when: 'some sources are connected, others are not', shows: 'the connected items plus a short “not connected yet” line naming each missing source — never a zero for an unconnected source' },
  { state: 'NO_DATA', when: 'connected and genuinely empty', shows: 'a plain “nothing here” line with when it was last checked' },
  { state: 'NO_ACCESS', when: 'the actor lacks the grant for a source', shows: 'nothing from that source and no count that would reveal it' },
  { state: 'NOT_IMPLEMENTED', when: 'architecture only', shows: 'the capability named as not built yet (founder / admin views), hidden from routine staff views' },
  { state: 'BLOCKED', when: 'a dependency is missing (state, role, model, table)', shows: 'the dependency by name, linked to its gap' },
  { state: 'COMING_LATER', when: 'deliberately deferred to a named sprint', shows: 'the sprint it waits on' },
  { state: 'ERROR', when: 'a source failed to load', shows: 'which source failed and a retry; other regions keep working' },
];

/* ════════════════════════════════ 1 · HOME ════════════════════════════════ */

const H = 'AIO_OFFICE.HOME';

const needsAttention: RegionContract = {
  region_id: `${H}.NEEDS_ATTENTION`, label: 'Needs Attention', presence: 'REQUIRED',
  question: 'What needs attention now?',
  item_fields: ['owner lane / section', 'client', 'what is wrong', 'priority', 'waiting on', 'age', 'route to owner'],
  state: 'PARTIAL',
  rules: [
    'Every item resolves to its canonical owner route; HOME never stores or edits the item.',
    'Dedupe by owner key; the higher priority wins (existing aggregation rule).',
    'Priority order urgent > high > normal > low (existing OfficeWorkItem / candidate priority). Sources without a priority use the owner lane’s rule, never a HOME-only score.',
    'Expired items surface as overdue — never silently dropped.',
    'Billing: overdue invoices and failed payments surface here (by grant); payment received appears in RECENT ACTIVITY; billing setup has no source state today.',
  ],
  sources: [
    src({ source_id: 'work-items', label: 'Open office work items', domain: 'WORK_ITEMS', owner_node: 'AIO_OFFICE.WORK', route: '/office/work', data_source: 'store.officeWorkItems → collectOfficeAttentionCandidates work:*', backing: 'DEMO_STORE', state: 'PARTIAL', priority_rule: 'OfficeWorkItem.priority', evidence: [ATT('82-104'), `${SRC}/office-core/officeWorkTypes.ts:111-135`] }),
    src({ source_id: 'workflow-waiting', label: 'Workflow steps waiting on the client, blocked or ready for review', domain: 'WORK_ITEMS', owner_node: 'AIO_OFFICE.WORK', route: '/office/workflows/:workflowId', data_source: 'store.workflowInstances (waiting_on_customer · waiting_external · blocked · ready_for_review)', backing: 'DEMO_STORE', state: 'PARTIAL', priority_rule: 'blocked = urgent · ready_for_review = high · others normal', evidence: [ATT('199-222'), `${SRC}/workflow/workflowTypes.ts:30-41`], note: 'failed / waiting_internal / paused are not surfaced today.' }),
    src({ source_id: 'ifta-review-approval', label: 'IFTA quarters needing review or awaiting client approval', domain: 'IFTA', owner_node: 'AIO_OFFICE.WORK.FILING_FUEL_TAXES.FILING_QUEUE', route: '/office/workspaces/ifta', data_source: 'store.iftaQuarters → staffBucket NEEDS_REVIEW · AWAITING_CLIENT', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/ifta/iftaDerive.ts:515-528`], note: 'Source exists; not fed into the office attention engine.' }),
    src({ source_id: 'client-approvals-quotes', label: 'Quotes waiting on the client’s acceptance', domain: 'BILLING', owner_node: 'AIO_OFFICE.MORE.BILLING', route: '/office/quotes/:quoteId', data_source: 'Quote status sent · viewed; ServiceRequest billingStatus awaiting_quote_acceptance', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', visibility: V_GRANT, evidence: [`${SRC}/billing/billingTypes.ts:16-25`, `${SRC}/billing/billingTypes.ts:45-53`] }),
    src({ source_id: 'client-approvals-activation', label: 'Clients invited / awaiting their confirmation', domain: 'MIGRATION', owner_node: 'AIO_OFFICE.INTAKE.ACTIVATION_INVITE', route: '/office/migration', data_source: 'ClientLifecycleState INVITED · CLIENT_CONFIRMATION_REQUIRED', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/client-migration/types.ts:3-13`], note: 'Client confirmation remains the gate before ACTIVE; PREBUILT is never ACTIVE.' }),
    src({ source_id: 'documents-incomplete', label: 'Documents requested, rejected or expired', domain: 'DOCUMENTS', owner_node: 'AIO_OFFICE.MORE.DOCUMENTS_VAULT', route: '/office/documents', data_source: 'store.documents status requested · rejected · expired', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/vault/vaultTypes.ts:56-63`], note: 'Not fed into the office attention engine (it reads uploaded / under_review only).' }),
    src({ source_id: 'document-review', label: 'Documents uploaded / under review', domain: 'DOCUMENTS', owner_node: 'AIO_OFFICE.MORE.DOCUMENTS_VAULT', route: '/office/documents/review', data_source: 'store.documents status uploaded · under_review', backing: 'DEMO_STORE', state: 'PARTIAL', priority_rule: 'always high', evidence: [ATT('133-153')] }),
    src({ source_id: 'migration-blocked', label: 'Blocked migration files / batches', domain: 'MIGRATION', owner_node: 'AIO_OFFICE.INTAKE.MIGRATION_STATUS', route: '/office/migration', data_source: 'MigrationFileQueueState FAILED · UNSUPPORTED · DUPLICATE; MigrationBatchState needs_attention · failed', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/client-migration/migrationFileQueueTypes.ts:1-12`, `${SRC}/vault/archiveMigrationTypes.ts:3-11`] }),
    src({ source_id: 'compliance-exceptions', label: 'Compliance exceptions', domain: 'COMPLIANCE', owner_node: 'AIO_OFFICE.WORK.COMPLIANCE.COMPLIANCE_CASES', route: null, data_source: 'none — no compliance case / exception model', backing: 'NONE', state: 'BLOCKED', evidence: [`${SRC}/services/catalog/serviceCatalog.ts:709-743 (DOT audit services are catalog entries only)`] }),
    src({ source_id: 'dispatch-exceptions', label: 'Dispatch / freight exceptions', domain: 'DISPATCH', owner_node: 'AIO_OFFICE.WORK.DISPATCH.STATUS_EXCEPTIONS', route: '/office/dispatch/loads', data_source: 'FreightException (open · acknowledged); Supabase aio_freight_exceptions (autopilot)', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/freight/autopilot/freightExceptionTypes.ts:1-36`, `${SRC}/freight/autopilot/supabaseFreightAutopilotRead.ts:183`], note: 'Shown only inside load detail today.' }),
    src({ source_id: 'brokerage-exceptions', label: 'Brokerage issues / loads needing coverage', domain: 'BROKERAGE', owner_node: 'AIO_OFFICE.WORK.BROKERAGE.STOPS_STATUS', route: '/office/brokerage', data_source: 'BrokerageIssue · coverage needs_coverage · BrokerageInfoRequest', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/brokerage/brokerageTypes.ts:306-313`, `${SRC}/brokerage/brokerageTypes.ts:132-141`] }),
    src({ source_id: 'overdue-reconciliation', label: 'Overdue bookkeeping reconciliation', domain: 'BOOKKEEPING', owner_node: 'AIO_OFFICE.WORK.BOOKKEEPING.RECONCILIATION', route: null, data_source: 'BookkeepingPeriod.reconciliationStatus (seed only, no writer)', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/bookkeeping/autopilot/autopilotTypes.ts:36-43`] }),
    src({ source_id: 'expiring-insurance', label: 'Insurance policies expiring (0–30 days)', domain: 'INSURANCE', owner_node: 'AIO_OFFICE.WORK.INSURANCE.RENEWALS', route: '/office/insurance', data_source: 'store.insurancePolicies.expirationDate', backing: 'DEMO_STORE', state: 'PARTIAL', priority_rule: '≤7 days urgent · ≤18 high · else normal', evidence: [ATT('106-131')], note: 'Expired policies (days < 0) are dropped today; the contract requires them as overdue.' }),
    src({ source_id: 'expiring-registration-credentials', label: 'Expiring registrations, permits and driver credentials', domain: 'COMPLIANCE', owner_node: 'AIO_OFFICE.WORK.COMPLIANCE.EXPIRATIONS', route: '/office/deadlines', data_source: 'Deadline (registration_renewal · permit_expiration · document_expiration …) · DriverCredential.expirationDate', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/demo/demoTypes.ts:408-426`, `${SRC}/calendar/calendarTypes.ts:1-20`, `${SRC}/driverlink/driverlinkTypes.ts:98-107`], note: 'Deadlines are not in the attention engine; credentials are not synced to deadlines.' }),
    src({ source_id: 'maintenance-warnings', label: 'Maintenance holds / out-of-service trucks', domain: 'MAINTENANCE', owner_node: 'AIO_OFFICE.WORK.MECHANIC_MAINTENANCE.MAINTENANCE_STATUS', route: '/office/fleetcare', data_source: 'TruckDispatchProfile maintenanceHold · outOfService; MaintenanceAttentionSeverity', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/dispatch/dispatchTypes.ts:130-154`, `${SRC}/freight/freightTypes.ts:174`] }),
    src({ source_id: 'road-ready-blockers', label: 'Road Ready items needing action / review', domain: 'ROAD_READY', owner_node: 'AIO_OFFICE.WORK.ROAD_READY', route: '/office/road-ready', data_source: 'RoadReadyItem action_needed · needs_review; profile mode attention_required', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/road-ready/roadReadyTypes.ts:12-19`, `${SRC}/road-ready/roadReadyTypes.ts:37-42`] }),
    src({ source_id: 'crm-follow-ups', label: 'CRM follow-ups due', domain: 'CRM', owner_node: 'AIO_OFFICE.MORE.GROWTH_CRM', route: '/office/crm', data_source: 'CrmFollowUp.scheduledFor (≤ now + 24h) · OfficeWorkItem queue crm_follow_up', backing: 'DEMO_STORE', state: 'PARTIAL', visibility: V_GRANT, evidence: [`${SRC}/crm/crmTypes.ts:207-220`, `${SRC}/demo/crmActions.ts:523-548`], note: 'Follow-up statuses never advance to due / overdue; the queue adds both counts (double counting). HOME projects; CRM owns.' }),
    src({ source_id: 'crm-new-leads', label: 'New leads not yet contacted', domain: 'CRM', owner_node: 'AIO_OFFICE.MORE.GROWTH_CRM', route: '/office/crm/leads', data_source: 'CrmLead status new', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', visibility: V_GRANT, evidence: [`${SRC}/crm/crmTypes.ts:13-23`] }),
    src({ source_id: 'crm-pipeline', label: 'Open opportunities past their expected close date', domain: 'CRM', owner_node: 'AIO_OFFICE.MORE.GROWTH_CRM', route: '/office/crm/pipeline', data_source: 'CrmOpportunity status open · expectedCloseDate', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', visibility: V_GRANT, evidence: [`${SRC}/crm/crmTypes.ts:172-192`], note: 'Opportunities have no next-action field; “needing action” is limited to what the record holds.' }),
    src({ source_id: 'billing-overdue-failed', label: 'Overdue invoices / failed payments', domain: 'BILLING', owner_node: 'AIO_OFFICE.MORE.BILLING', route: '/office/invoices', data_source: 'BillingInvoice past_due · PaymentRecord failed · ServiceRequest billingStatus payment_failed', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', visibility: V_GRANT, evidence: [`${SRC}/billing/billingTypes.ts:26-43`, `${SRC}/demo/billingActions.ts:399-439`, `${SRC}/management/managementAttentionEngine.ts:43-49`], note: 'Only the management engine surfaces past_due; failed payments reach no office surface.' }),
    src({ source_id: 'billing-setup-needed', label: 'Billing setup needed', domain: 'BILLING', owner_node: 'AIO_OFFICE.MORE.BILLING', route: null, data_source: 'none — no billing profile or payment-method record in source', backing: 'NONE', state: 'NOT_IMPLEMENTED', visibility: V_GRANT, evidence: [`${SRC}/billing/billingTypes.ts:45-53`], note: 'BillingStatus has no setup state. Recorded, not invented.' }),
    src({ source_id: 'conversations-needing-reply', label: 'Conversations waiting on staff', domain: 'MESSAGING', owner_node: 'AIO_OFFICE.MORE.MESSAGES', route: '/office/communications/:conversationId', data_source: 'store.commConversations waiting_on_staff / responsibility staff', backing: 'DEMO_STORE', state: 'PARTIAL', priority_rule: 'urgent conversation = urgent, else high', evidence: [ATT('155-176'), `${SRC}/communications/communicationEngine.ts:18-20`] }),
    src({ source_id: 'unread-customer-messages', label: 'Unread customer messages (legacy model)', domain: 'MESSAGING', owner_node: 'AIO_OFFICE.MORE.MESSAGES', route: '/office/inbox', data_source: 'store.messages from customer, unread', backing: 'DEMO_STORE', state: 'PARTIAL', evidence: [ATT('178-197')], note: 'Legacy model — retires with C-LEGACY-INBOX-DOCS.' }),
  ],
};

const DUE_PRIORITY = 'by due state: overdue > due today > due soon > upcoming; ties by nearest date';
const DUE_STATE = 'computed at read time: overdue (< 0 days) · due today (0) · due soon (≤ 7) · upcoming';
const dl = (s: SourceSpec) => src({ priority_rule: DUE_PRIORITY, due_rule: DUE_STATE, ...s });

const deadlines: RegionContract = {
  region_id: `${H}.DEADLINES`, label: 'Deadlines', presence: 'REQUIRED', question: 'What is due?',
  item_fields: ['what', 'client', 'due date', 'due state', 'source', 'owner lane', 'route'],
  state: 'PARTIAL',
  rules: [
    'Due state is computed at read time from the due date: overdue (< 0 days) · due today (0) · due soon (≤ 7) · upcoming — never the stored severity, which is set once and never recalculated.',
    'Order: overdue, due today, due soon, upcoming; ties by nearest date.',
    'Each deadline routes to the lane that owns the work, not to the Deadline Center.',
  ],
  sources: [
    dl({ source_id: 'deadline-store', label: 'Deadlines (19 deadline types)', domain: 'COMPLIANCE', owner_node: 'AIO_OFFICE.WORK.COMPLIANCE.EXPIRATIONS', route: '/office/deadlines', data_source: 'store.deadlines (DeadlineType · DeadlineSource · severity)', backing: 'DEMO_STORE', state: 'PARTIAL', due_rule: 'computeDeadlineState: overdue < 0 · due_today 0 · due_soon ≤ 7', evidence: [`${SRC}/demo/demoTypes.ts:408-426`, `${SRC}/calendar/calendarService.ts:19-27`, `${SRC}/office/pages/OperationsPages.tsx:47-113`], note: 'The Deadlines page shows the stored severity; its overdue filter also catches items due today (UTC parse).' }),
    dl({ source_id: 'renewals', label: 'Renewals', domain: 'COMPLIANCE', owner_node: 'AIO_OFFICE.WORK.COMPLIANCE.EXPIRATIONS', route: '/office/renewals', data_source: 'store.renewals expirationDate · RenewalStatus (13)', backing: 'DEMO_STORE', state: 'PARTIAL', evidence: [`${SRC}/renewals/renewalTypes.ts:18-53`, `${SRC}/office/pages/OfficeRenewalsPage.tsx:17-22`] }),
    dl({ source_id: 'ifta-due', label: 'IFTA quarter due dates', domain: 'IFTA', owner_node: 'AIO_OFFICE.WORK.FILING_FUEL_TAXES.FILING_QUEUE', route: '/office/workspaces/ifta', data_source: 'IftaQuarterCase.dueDate', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/ifta/iftaTypes.ts:150`], note: 'Shown in the IFTA queue; not projected to HOME.' }),
    dl({ source_id: 'insurance-renewal', label: 'Insurance policy expirations', domain: 'INSURANCE', owner_node: 'AIO_OFFICE.WORK.INSURANCE.RENEWALS', route: '/office/insurance/renewals', data_source: 'InsurancePolicy.expirationDate', backing: 'DEMO_STORE', state: 'PARTIAL', evidence: [`${SRC}/insurance/insuranceTypes.ts:57-78`] }),
    dl({ source_id: 'driver-credentials', label: 'Driver credential expirations', domain: 'DRIVERS', owner_node: 'AIO_OFFICE.WORK.DRIVERS_CARRIERS.CREDENTIALS', route: '/office/driverlink/drivers', data_source: 'DriverCredential.expirationDate', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/driverlink/driverlinkTypes.ts:98-107`] }),
    dl({ source_id: 'vehicle-registration', label: 'Vehicle registration dates', domain: 'VEHICLES', owner_node: 'AIO_OFFICE.WORK.VEHICLES_FLEET', route: null, data_source: 'vault documents related to a vehicle with expiresAt (no vehicle record holds a registration expiry)', backing: 'DEMO_STORE', state: 'PARTIAL', evidence: [`${SRC}/vault/vaultTypes.ts:93-106`, `${SRC}/pages/portal/FleetPage.tsx:11-27`] }),
    dl({ source_id: 'client-request-due', label: 'Client request target dates', domain: 'PERMITTING', owner_node: 'AIO_OFFICE.WORK.PERMITTING_AUTHORITIES', route: '/office/requests/:requestId', data_source: 'ServiceRequest.targetDate', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/demo/demoTypes.ts:390`] }),
    dl({ source_id: 'bookkeeping-close', label: 'Bookkeeping close / review dates', domain: 'BOOKKEEPING', owner_node: 'AIO_OFFICE.WORK.BOOKKEEPING.MONTHLY_CLIENTS', route: '/office/bookkeeping', data_source: 'BookkeepingCycle.dueDate (seed only)', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/bookkeeping/bookkeepingTypes.ts:120-126`] }),
    dl({ source_id: 'road-ready-milestones', label: 'Road Ready item expirations', domain: 'ROAD_READY', owner_node: 'AIO_OFFICE.WORK.ROAD_READY', route: '/office/road-ready', data_source: 'RoadReadyItem.expiresAt → syncExpirationDeadlines', backing: 'DEMO_STORE', state: 'PARTIAL', evidence: [`${SRC}/demo/roadReadyActions.ts:261-283`] }),
    dl({ source_id: 'crm-follow-up-dates', label: 'CRM follow-up dates', domain: 'CRM', owner_node: 'AIO_OFFICE.MORE.GROWTH_CRM', route: '/office/crm/calendar', data_source: 'CrmFollowUp.scheduledFor', backing: 'DEMO_STORE', state: 'PARTIAL', visibility: V_GRANT, evidence: [`${SRC}/crm/crmTypes.ts:207-220`] }),
  ],
};

const blockers: RegionContract = {
  region_id: `${H}.BLOCKERS`, label: 'Blockers', presence: 'REQUIRED', question: 'What is blocked, and on whom?',
  item_fields: ['blocker group', 'owner’s own status / reason', 'client', 'since', 'owner lane', 'route'],
  state: 'PARTIAL',
  rules: [
    'Blocker groups are a display mapping over each owner’s existing status / waiting literals (AIO_HOME_BLOCKER_GROUPS) — never a new stored enum.',
    'The owner’s own reason text is shown; HOME never rewrites it.',
  ],
  sources: [
    src({ source_id: 'work-waiting', label: 'Work items waiting', domain: 'WORK_ITEMS', owner_node: 'AIO_OFFICE.WORK', route: '/office/work', data_source: 'OfficeWorkItem.waitingOn ≠ none · status waiting_*', backing: 'DEMO_STORE', state: 'PARTIAL', evidence: [`${SRC}/office-core/officeWorkTypes.ts:29-50`] }),
    src({ source_id: 'workflow-blocked', label: 'Workflow steps blocked / waiting', domain: 'WORK_ITEMS', owner_node: 'AIO_OFFICE.WORK', route: '/office/workflows/:workflowId', data_source: 'WorkflowStepInstance waitingOn · blockedReason', backing: 'DEMO_STORE', state: 'PARTIAL', evidence: [`${SRC}/workflow/workflowTypes.ts:202-220`] }),
    src({ source_id: 'ifta-blocked', label: 'IFTA quarters blocked / awaiting client', domain: 'IFTA', owner_node: 'AIO_OFFICE.WORK.FILING_FUEL_TAXES.FILING_QUEUE', route: '/office/workspaces/ifta', data_source: 'staffBucket BLOCKED · AWAITING_CLIENT', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/ifta/iftaDerive.ts:515-528`] }),
    src({ source_id: 'request-waiting', label: 'Service requests waiting', domain: 'PERMITTING', owner_node: 'AIO_OFFICE.WORK.PERMITTING_AUTHORITIES', route: '/office/requests/:requestId', data_source: 'RequestStatus information_needed · documents_needed · awaiting_agency', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/demo/demoTypes.ts:366-376`] }),
    src({ source_id: 'freight-exceptions', label: 'Freight exceptions', domain: 'DISPATCH', owner_node: 'AIO_OFFICE.WORK.DISPATCH.STATUS_EXCEPTIONS', route: '/office/dispatch/loads', data_source: 'FreightException', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/freight/autopilot/freightExceptionTypes.ts:1-36`] }),
    src({ source_id: 'migration-exceptions', label: 'Migration exceptions', domain: 'MIGRATION', owner_node: 'AIO_OFFICE.INTAKE.EXTRACTION_CLASSIFICATION', route: '/office/migration', data_source: 'MigrationExceptionCode', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/client-migration/migrationPipeline/types.ts:16-23`] }),
    src({ source_id: 'insurance-issues', label: 'Insurance issues waiting on client / partner', domain: 'INSURANCE', owner_node: 'AIO_OFFICE.WORK.INSURANCE', route: '/office/insurance', data_source: 'InsuranceIssue', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/insurance/insuranceTypes.ts:266-268`] }),
    src({ source_id: 'factoring-issues', label: 'Factoring issues', domain: 'FACTORING', owner_node: 'AIO_OFFICE.WORK.FACTORING', route: '/office/factoring', data_source: 'FactoringIssue (customerActionRequired)', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/factoring/factoringTypes.ts:180-193`] }),
    src({ source_id: 'maintenance-holds', label: 'Maintenance tickets on hold', domain: 'MAINTENANCE', owner_node: 'AIO_OFFICE.WORK.MECHANIC_MAINTENANCE.TICKETS', route: '/office/fleetcare/tickets', data_source: 'MaintenanceTicket on_hold · awaiting_parts · disputed', backing: 'DEMO_STORE', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/fleetcare/fleetcareTypes.ts:6-26`] }),
  ],
};

/** The twelve WORK lanes in canonical order (WORK ACROSS AIO renders one line per lane, from the lane contracts). */
export const AIO_WORK_LANE_ORDER = ['PERMITTING_AUTHORITIES', 'FILING_FUEL_TAXES', 'COMPLIANCE', 'VEHICLES_FLEET', 'DISPATCH', 'BROKERAGE', 'INSURANCE', 'FACTORING', 'BOOKKEEPING', 'DRIVERS_CARRIERS', 'MECHANIC_MAINTENANCE', 'ROAD_READY'] as const;

const clientsInMotion: RegionContract = {
  region_id: `${H}.CLIENTS_IN_MOTION`, label: 'Clients in Motion', presence: 'REQUIRED', question: 'Which clients are changing state or need us?',
  item_fields: ['client identity', 'lifecycle segment', 'active services', 'recent activity', 'needs-attention count', 'next deadline', 'blocking condition', 'last update'],
  state: 'PARTIAL',
  rules: [
    'Segments come from the canonical lifecycle (KNOWN_UNMIGRATED … ACTIVE · PAUSED · ENDED); PREBUILT is never counted or labelled ACTIVE (isCountedActiveClient).',
    'Active services come from the canonical workspace resolver — not the heuristic builders.',
    'Staff-only detail (internal notes, staff names, buckets) never reaches any client surface.',
  ],
  sources: [
    src({ source_id: 'client-lifecycle', label: 'Client lifecycle', domain: 'CLIENTS', owner_node: 'AIO_OFFICE.INTAKE', route: '/office/clients/:clientId', data_source: 'ClientLifecycleState · isCountedActiveClient (demo); aio_organizations.client_lifecycle (Supabase)', backing: 'DEMO_STORE', state: 'PARTIAL', evidence: [`${SRC}/client-migration/types.ts:3-13`, `${SRC}/client-migration/activeClientRule.ts:5-14`], note: 'Two segment vocabularies disagree: founderSegmentForLifecycle (no runtime callers) vs filterClientsByFounderSegment.' }),
    src({ source_id: 'client-360', label: 'Client 360 summary', domain: 'CLIENTS', owner_node: 'AIO_OFFICE.MORE.CLIENTS', route: '/office/clients/:clientId', data_source: 'getClient360View (waiting-on counts, active services heuristic, upcoming deadlines, billing status)', backing: 'DEMO_STORE', state: 'PARTIAL', evidence: [`${SRC}/office-core/client360Service.ts:42-43`, `${SRC}/office-core/client360Service.ts:52-71`, `${SRC}/office-core/client360Service.ts:123-129`], note: 'Upcoming deadlines are the first five, unsorted.' }),
  ],
};

const recentActivity: RegionContract = {
  region_id: `${H}.RECENT_ACTIVITY`, label: 'Recent Activity', presence: 'REQUIRED', question: 'What changed recently?',
  item_fields: ['event (existing ActivityKind)', 'client', 'actor', 'when', 'route to owner'],
  state: 'PARTIAL',
  rules: [
    'Projects the existing event vocabulary (ActivityKind, ClientLifecycleEvent) — no second event model (AIO_HOME_EVENT_VERBS maps the founder’s verbs).',
    'The staff feed shows internal and customer-visible events alike; the client feed shows customer-visible events only.',
  ],
  sources: [
    src({ source_id: 'activity-events', label: 'Activity events', domain: 'WORK_ITEMS', owner_node: 'AIO_OFFICE.WORK', route: '/office/activity', data_source: 'store.activity (ActivityEvent, ~98 ActivityKind values; visibility internal | customer)', backing: 'DEMO_STORE', state: 'PARTIAL', evidence: [`${SRC}/demo/demoTypes.ts:472-482`, `${SRC}/office/pages/OfficeWorkPages.tsx:424-436`], note: 'The office feed shows internal events only, so customer-visible production events (all IFTA events, document uploads, failed payments) never reach staff.' }),
    src({ source_id: 'lifecycle-events', label: 'Client lifecycle events', domain: 'MIGRATION', owner_node: 'AIO_OFFICE.INTAKE', route: '/office/migration', data_source: 'ClientLifecycleEvent → Supabase aio_client_lifecycle_events (insert only, never read)', backing: 'PRODUCTION', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/client-migration/types.ts:121-131`, `${SRC}/client-migration/repositories/supabaseMigrationRepository.ts:196`] }),
    src({ source_id: 'ifta-audit', label: 'IFTA case audit trail', domain: 'IFTA', owner_node: 'AIO_OFFICE.WORK.FILING_FUEL_TAXES.IFTA', route: '/office/workspaces/ifta/:clientId/:quarterKey', data_source: 'IftaQuarterCase.audit', backing: 'DEMO_STORE', state: 'PARTIAL', evidence: [`${SRC}/ifta/iftaTypes.ts:134-141`], note: 'Case page only.' }),
    src({ source_id: 'load-status-history', label: 'Load status history', domain: 'DISPATCH', owner_node: 'AIO_OFFICE.WORK.DISPATCH.LOADS', route: '/office/dispatch/loads', data_source: 'Load.timeline (demo) · Supabase aio_load_status_history', backing: 'PRODUCTION', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/freight/freightStatusHistory.ts:14`] }),
  ],
};

const quickActionsRegion: RegionContract = {
  region_id: `${H}.QUICK_ACTIONS`, label: 'Quick Actions', presence: 'REQUIRED', question: 'Where should I go next?',
  item_fields: ['action', 'owner', 'requires'],
  state: 'PARTIAL',
  rules: [
    'Every quick action ROUTES to the owner’s surface — HOME executes nothing.',
    'Shown only when the owner route exists and the actor holds the permission (role-aware). Today the “+ New” menu checks no permission.',
  ],
  sources: [
    src({ source_id: 'new-menu', label: '“+ New” menu and command palette', domain: 'WORK_ITEMS', owner_node: 'AIO_OFFICE.WORK', route: null, data_source: 'AIOOfficeLayout quick-create menu + command palette', backing: 'DEMO_STORE', state: 'PARTIAL', evidence: [`${SRC}/office/layouts/AIOOfficeLayout.tsx:242-252`, `${SRC}/office/layouts/AIOOfficeLayout.tsx:263-277`] }),
  ],
};

const businessPulse: RegionContract = {
  region_id: `${H}.BUSINESS_PULSE`, label: 'Business Pulse', presence: 'OPTIONAL', question: 'How is the business doing, in a glance?',
  item_fields: ['metric (a REPORTS metric contract)', 'value', 'period', 'link to REPORTS domain'],
  state: 'PARTIAL',
  rules: [
    'Renders only REPORTS metrics classified REAL_DATA or DERIVED_SUPPORTED with PRODUCTION backing. Today every figure is demo-store backed, so in production the region is absent (a demo run shows it labelled “demo”).',
    'Money figures need the internal-financial grant; without it they are omitted, not masked.',
  ],
  sources: [
    src({ source_id: 'executive-snapshot', label: 'Executive snapshot', domain: 'BILLING', owner_node: 'AIO_OFFICE.REPORTS.OVERVIEW', route: '/office/management', data_source: 'getExecutiveSnapshot (active customers · active requests · open opportunities · active loads · collected revenue · outstanding)', backing: 'DEMO_STORE', state: 'PARTIAL', visibility: V_GRANT, evidence: [`${SRC}/management/managementQueryLayer.ts:90-108`, `${SRC}/office/pages/OfficeDashboardPage.tsx:34`] }),
  ],
};

const HOME_CONTRACT: RootContract = {
  root_id: H, stance: 'PROJECTION',
  purpose: 'Cross-business orientation: what needs attention across every client and service, and where staff should go next.',
  primary_question: 'What needs attention across AIO right now?',
  answers: ['What needs attention now?', 'What is due?', 'What is blocked?', 'What is moving?', 'Which clients need us?', 'What changed recently?', 'Where should staff go next?'],
  owns: [],
  projects: ['INTAKE (migration, PREBUILT, invites)', 'all twelve WORK lanes', 'MORE → GROWTH / CRM (follow-ups, opportunities)', 'MORE → BILLING (overdue, failed — when supported)', 'MORE → MESSAGES (conversations waiting on staff)', 'REPORTS (Business Pulse metrics only)'],
  reads: [
    { domain: 'WORK_ITEMS', via: 'officeWorkItems · workflowInstances (attention engine)' },
    { domain: 'IFTA · DISPATCH · BROKERAGE · INSURANCE · FACTORING · BOOKKEEPING · DRIVERS · MAINTENANCE · ROAD_READY · PERMITTING · COMPLIANCE · VEHICLES', via: 'each lane’s summary (lane contracts)' },
    { domain: 'MIGRATION · CLIENTS', via: 'lifecycle + Client 360' },
    { domain: 'CRM · BILLING · MESSAGING · DOCUMENTS', via: 'their MORE owners' },
  ],
  may_mutate: [],
  must_not: ['create, edit or close any case, task, invoice, lead, message or document', 'keep its own queue, count store or priority score', 'count PREBUILT as ACTIVE', 'show any staff detail to a client or service provider', 'fill an unconnected source with a zero or an example'],
  staff_only: ['the whole root (clients and providers never reach AIO OFFICE)'],
  founder_only: ['money figures in Business Pulse and billing items (internal financial visibility — staff by grant)', 'CRM items (staff by crm.* grant)'],
  belongs_elsewhere: [
    { item: 'Working a queue or a case', belongs_in: 'AIO_OFFICE.WORK' },
    { item: 'History, trends, exports', belongs_in: 'AIO_OFFICE.REPORTS' },
    { item: 'CRM pipeline work', belongs_in: 'AIO_OFFICE.MORE.GROWTH_CRM' },
    { item: 'Invoice and payment operations', belongs_in: 'AIO_OFFICE.MORE.BILLING' },
    { item: 'The client directory', belongs_in: 'AIO_OFFICE.MORE.CLIENTS' },
    { item: 'Migration and onboarding work', belongs_in: 'AIO_OFFICE.INTAKE' },
  ],
  partial_truth_rule: 'Each region lists its sources and their state. A source that is NOT_IMPLEMENTED or BLOCKED appears as a named “not connected yet” line (founder / admin) — never as zero, never as an example. Demo-store sources are labelled demo outside demo mode.',
  hierarchy: ['Needs Attention', 'Deadlines', 'Blockers', 'Work Across AIO', 'Clients in Motion', 'Recent Activity', 'Quick Actions', 'Business Pulse (optional)'],
  regions: [needsAttention, deadlines, blockers, /* WORK_ACROSS_AIO added after lanes */ clientsInMotion, recentActivity, quickActionsRegion, businessPulse],
  actions: [
    act({ action_id: 'HOME.OPEN_WORK', label: 'Open WORK', tier: 'PRIMARY', kind: 'ROUTE', owner_node: 'AIO_OFFICE.WORK', route: '/office/work', state: 'PARTIAL', requires: 'work.read', evidence: [OR('199')] }),
    act({ action_id: 'HOME.VIEW_DEADLINES', label: 'View deadlines', tier: 'PRIMARY', kind: 'ROUTE', owner_node: 'AIO_OFFICE.WORK.COMPLIANCE.EXPIRATIONS', route: '/office/deadlines', state: 'PARTIAL', evidence: [OR('279')] }),
    act({ action_id: 'HOME.START_MIGRATION', label: 'Start migration', tier: 'PRIMARY', kind: 'ROUTE', owner_node: 'AIO_OFFICE.INTAKE.EXISTING_CLIENT_FILE', route: '/office/migration', state: 'PARTIAL', evidence: [OR('195')] }),
    act({ action_id: 'HOME.CREATE_CLIENT', label: 'Create client (new client file)', tier: 'PRIMARY', kind: 'ROUTE', owner_node: 'AIO_OFFICE.INTAKE.NEW_CLIENT_FILE', route: '/office/migration/new', state: 'PARTIAL', evidence: [OR('196')], requires: 'staff (no permission check today)' }),
    act({ action_id: 'HOME.ASSIGN_WORK', label: 'Assign work', tier: 'SECONDARY', kind: 'ROUTE', owner_node: 'AIO_OFFICE.WORK', route: '/office/work', state: 'PARTIAL', requires: 'work.assign', evidence: [`${SRC}/office/pages/OfficeWorkPages.tsx:100`, `${SRC}/office/pages/OfficeWorkPages.tsx:161`] }),
    act({ action_id: 'HOME.OPEN_CRM', label: 'Open CRM', tier: 'SECONDARY', kind: 'ROUTE', owner_node: 'AIO_OFFICE.MORE.GROWTH_CRM', route: '/office/crm', state: 'PARTIAL', requires: 'crm.read', evidence: [OR('263')] }),
    act({ action_id: 'HOME.NEW_LEAD', label: 'New lead', tier: 'SECONDARY', kind: 'ROUTE', owner_node: 'AIO_OFFICE.MORE.GROWTH_CRM', route: '/office/crm/leads', state: 'PARTIAL', requires: 'crm.leads.manage (not checked today)', evidence: [`${SRC}/office/layouts/AIOOfficeLayout.tsx:245`] }),
    act({ action_id: 'HOME.CREATE_INVOICE', label: 'Create invoice (from an accepted quote)', tier: 'SECONDARY', kind: 'ROUTE', owner_node: 'AIO_OFFICE.MORE.BILLING', route: '/office/quotes/:quoteId', state: 'PARTIAL', requires: 'billing.manage', evidence: [`${SRC}/office/pages/BillingPages.tsx:141`] }),
    act({ action_id: 'HOME.MESSAGE', label: 'Message a client', tier: 'SECONDARY', kind: 'ROUTE', owner_node: 'AIO_OFFICE.MORE.MESSAGES', route: '/office/communications', state: 'PARTIAL', requires: 'comm.read', evidence: [OR('217')] }),
    act({ action_id: 'HOME.CREATE_CASE', label: 'Create case', tier: 'SECONDARY', kind: 'ROUTE', owner_node: 'AIO_OFFICE.WORK', route: null, state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/office/layouts/AIOOfficeLayout.tsx:251`] }),
    act({ action_id: 'HOME.UPLOAD_DOCUMENT', label: 'Upload document', tier: 'SECONDARY', kind: 'ROUTE', owner_node: 'AIO_OFFICE.MORE.DOCUMENTS_VAULT', route: null, state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/demo/vaultActions.ts:75 uploadVaultDocument (client portal only)`] }),
  ],
  states: COMMON_STATES,
};

/* ════════════════════════════════ 2 · WORK ════════════════════════════════ */

const W = 'AIO_OFFICE.WORK';
const shell = (o: Partial<Record<LaneShellSection, [SurfaceState, string, string?]>>): Record<LaneShellSection, ShellSectionSupport> => {
  const out = {} as Record<LaneShellSection, ShellSectionSupport>;
  for (const k of ['SERVICE_OVERVIEW', 'ACTIVE_WORK', 'NEEDS_ATTENTION', 'DUE_SOON', 'BLOCKED', 'RECENTLY_COMPLETED'] as const) {
    const v = o[k] ?? ['NOT_IMPLEMENTED', 'none'];
    out[k] = { state: v[0], source: v[1], note: v[2] ?? '' };
  }
  return out;
};
const rel = (node_id: string, relation: string) => ({ node_id, relation });

export const AIO_WORK_LANES: LaneContract[] = [
  {
    lane_id: `${W}.PERMITTING_AUTHORITIES`,
    shell: shell({ SERVICE_OVERVIEW: ['PARTIAL', 'DivisionQueuePage division=permitting'], ACTIVE_WORK: ['PARTIAL', 'ServiceRequest not completed / cancelled'], NEEDS_ATTENTION: ['PARTIAL', 'office work items from requests'], DUE_SOON: ['NOT_IMPLEMENTED', 'ServiceRequest.targetDate (not surfaced)'], BLOCKED: ['PARTIAL', 'RequestStatus information_needed · documents_needed · awaiting_agency'], RECENTLY_COMPLETED: ['NOT_IMPLEMENTED', 'none'] }),
    records: [{ record: 'ServiceRequest (store.requests)', evidence: `${SRC}/demo/demoTypes.ts:378-403` }, { record: 'Supabase aio_service_requests (client create path only)', evidence: `${SRC}/data/repositories/supabaseRepositories.ts:247-360` }],
    statuses: ['new_request', 'information_needed', 'documents_needed', 'under_review', 'in_progress', 'submitted', 'awaiting_agency', 'approved', 'completed', 'cancelled', '+ per-division workflow step ids (ready_to_submit · name_review · filing_preparation · awaiting_state) cast into status'],
    assignment: 'ServiceRequest.assignedStaffId', due: 'ServiceRequest.targetDate', blocker: 'status only (workflow steps carry waitingOn / blockedReason)',
    client_safe: 'customerNotes · nextStep · timeline (client); InternalNote stays internal',
    related: [rel(`${W}.VEHICLES_FLEET`, 'registration work updates the vehicle’s registration state'), rel(`${W}.COMPLIANCE`, 'authority / BOC-3 entitlement (one COMPLIANCE workspace)'), rel('AIO_OFFICE.MORE.DOCUMENTS_VAULT', 'filings and certificates'), rel('AIO_OFFICE.MORE.BILLING', 'service fees')],
    gaps: ['G-PERMITTING-CASE-MODEL', 'G-REQUEST-STATUS-CAST'],
  },
  {
    lane_id: `${W}.FILING_FUEL_TAXES`,
    shell: shell({ SERVICE_OVERVIEW: ['PARTIAL', 'IftaStaffQueuePage (queue health)'], ACTIVE_WORK: ['PARTIAL', 'quarters not FILED / ARCHIVED'], NEEDS_ATTENTION: ['PARTIAL', 'staffBucket NEEDS_REVIEW'], DUE_SOON: ['PARTIAL', 'queueDeadlines (dueDate)'], BLOCKED: ['PARTIAL', 'staffBucket BLOCKED · AWAITING_CLIENT'], RECENTLY_COMPLETED: ['PARTIAL', 'FILED · COMPLETE tabs'] }),
    records: [{ record: 'IftaQuarterCase (store.iftaQuarters)', evidence: `${SRC}/ifta/iftaTypes.ts:143-174` }],
    statuses: ['NOT_ENROLLED', 'QUARTER_OPEN', 'COLLECTING', 'NEEDS_CLIENT', 'OVERDUE_RISK', 'AIO_REVIEW', 'RECONCILING', 'AWAITING_APPROVAL', 'FILING', 'FILED', 'ARCHIVED', 'FILING_REJECTED', '(staff buckets: NEEDS_REVIEW · BLOCKED · AWAITING_CLIENT · READY_TO_FILE · FILED · PAYMENT_PENDING · COMPLETE)'],
    assignment: 'IftaQuarterCase.assignedStaffId', due: 'IftaQuarterCase.dueDate', blocker: 'discrepancies · corrections · receipt flags · clientQuestion',
    client_safe: 'Client filing-room view model (status, approval action); staffWorksheet and discrepancy resolutions stay internal',
    related: [rel(`${W}.VEHICLES_FLEET`, 'IFTA vehicles (embedded copies today)'), rel(`${W}.DISPATCH`, 'mileage'), rel(`${W}.BOOKKEEPING`, 'fuel receipts'), rel(`${W}.COMPLIANCE`, 'IFTA registration'), rel('AIO_OFFICE.MORE.DOCUMENTS_VAULT', 'quarter packet')],
    gaps: ['G-IFTA-NO-TABLES', 'G-IFTA-VEHICLE-COPIES', 'G-IFTA-NOTES-HARDCODED', 'P-IFTA-CLIENT-AUDIT-ACTIONS', 'G-FILING-HISTORY'],
  },
  {
    lane_id: `${W}.COMPLIANCE`,
    shell: shell({ SERVICE_OVERVIEW: ['PARTIAL', 'Deadline Center · renewals'], ACTIVE_WORK: ['BLOCKED', 'no compliance case model'], NEEDS_ATTENTION: ['PARTIAL', 'expiring documents / renewals'], DUE_SOON: ['PARTIAL', 'deadline windows (stored severity)'], BLOCKED: ['PARTIAL', 'RenewalStatus customer_action_needed · documents_needed · awaiting_external_action'], RECENTLY_COMPLETED: ['PARTIAL', 'renewals completed'] }),
    records: [{ record: 'Deadline', evidence: `${SRC}/demo/demoTypes.ts:408-426` }, { record: 'RenewalRecord', evidence: `${SRC}/renewals/renewalTypes.ts:33-53` }, { record: 'CalendarEvent', evidence: `${SRC}/calendar/calendarTypes.ts:37-58` }],
    statuses: ['Deadline severity: upcoming · due_soon · due_today · overdue · complete', 'RenewalStatus: upcoming · available · customer_action_needed · requested · documents_needed · under_review · in_progress · submitted · awaiting_external_action · completed · declined · self_managed · not_applicable'],
    assignment: null, due: 'Deadline.dueDate · RenewalRecord.expirationDate', blocker: 'renewal status',
    client_safe: 'Client calendar and renewals (status + action); internal audits, corrective work and cases stay in AIO OFFICE',
    related: [rel(`${W}.VEHICLES_FLEET`, 'vehicle compliance status'), rel(`${W}.DRIVERS_CARRIERS.CREDENTIALS`, 'driver credentials'), rel(`${W}.INSURANCE`, 'coverage requirements'), rel(`${W}.PERMITTING_AUTHORITIES.OPERATING_AUTHORITIES`, 'authority maintenance')],
    gaps: ['G-COMPLIANCE-CASE-MODEL', 'G-DEADLINE-SEVERITY-STALE', 'G-DEADLINES-UNQUERIED'],
  },
  {
    lane_id: `${W}.VEHICLES_FLEET`,
    shell: shell({ SERVICE_OVERVIEW: ['NOT_IMPLEMENTED', 'no staff screen'], ACTIVE_WORK: ['NOT_IMPLEMENTED', 'no staff screen'], NEEDS_ATTENTION: ['NOT_IMPLEMENTED', 'no staff screen'], DUE_SOON: ['NOT_IMPLEMENTED', 'no registration-expiry field on any vehicle record'], BLOCKED: ['NOT_IMPLEMENTED', 'TruckDispatchProfile outOfService / maintenanceHold exist, unsurfaced'], RECENTLY_COMPLETED: ['NOT_IMPLEMENTED', 'none'] }),
    records: [
      { record: 'PowerUnit / Trailer (store.powerUnits / trailers) — the record most references point to', evidence: `${SRC}/road-ready/roadReadyTypes.ts:113-139` },
      { record: 'Supabase aio_fleet_vehicles (written by migration approve only, read by nothing)', evidence: `${SQL}/20260817190000_aio_fleetcare_network.sql:86-101` },
      { record: 'TruckDispatchProfile (operational overlay keyed by powerUnitId)', evidence: `${SRC}/dispatch/dispatchTypes.ts:130-154` },
      { record: 'IftaVehicle (embedded copy inside each IFTA quarter)', evidence: `${SRC}/ifta/iftaTypes.ts:57-65` },
    ],
    statuses: ['PowerUnit.status: active · inactive · sold', 'TruckAvailabilityStatus (dispatch overlay)'],
    assignment: null, due: null, blocker: 'TruckDispatchProfile outOfService · maintenanceHold (overlay)',
    client_safe: 'CLIENT OFFICE → OPERATIONS → VEHICLE MANAGEMENT (/portal/fleet): the client’s own vehicles and their approved statuses',
    related: [
      rel(`${W}.DISPATCH.TRUCKS`, 'availability / out-of-service; dispatch overlay'),
      rel(`${W}.COMPLIANCE`, 'compliance status · expirations'),
      rel(`${W}.FILING_FUEL_TAXES.IFTA`, 'IFTA relevance (vehicles in a quarter)'),
      rel(`${W}.INSURANCE.POLICIES`, 'insured vehicles'),
      rel(`${W}.MECHANIC_MAINTENANCE`, 'maintenance state · service history'),
      rel(`${W}.DRIVERS_CARRIERS`, 'assigned driver'),
      rel('AIO_OFFICE.MORE.DOCUMENTS_VAULT', 'credentials / documents'),
      rel('AIO_OFFICE.MORE.BILLING', 'vehicle-related charges where relevant'),
      rel('AIO_OFFICE.REPORTS', 'fleet reporting'),
      rel(`${W}.PERMITTING_AUTHORITIES.TAGS_REGISTRATION`, 'registration work (IRP / tags) that updates the registration state this lane owns'),
    ],
    gaps: ['G-VEHICLES-NO-STAFF-SCREEN', 'G-VEHICLES-THREE-STORES', 'G-VEHICLES-NO-REGISTRATION-FIELD', 'G-VEHICLES-STALE-TABLE-NAME'],
  },
  {
    lane_id: `${W}.DISPATCH`,
    shell: shell({ SERVICE_OVERVIEW: ['PARTIAL', 'DispatchCommandCenterPage'], ACTIVE_WORK: ['PARTIAL', 'loads booked … in_transit'], NEEDS_ATTENTION: ['PARTIAL', 'exceptions inside load detail only'], DUE_SOON: ['PARTIAL', 'pickupDate · deliveryDate'], BLOCKED: ['PARTIAL', 'issue · pod_needed · FreightException'], RECENTLY_COMPLETED: ['PARTIAL', 'delivered · complete'] }),
    records: [{ record: 'Load (demo store; Supabase aio_dispatch_loads for freight / autopilot / shipper)', evidence: `${SRC}/dispatch/dispatchTypes.ts:239-319` }, { record: 'DispatchEnrollment', evidence: `${SRC}/dispatch/dispatchTypes.ts:115-128` }, { record: 'TruckDispatchProfile', evidence: `${SRC}/dispatch/dispatchTypes.ts:130-154` }, { record: 'FreightException (also Supabase aio_freight_exceptions)', evidence: `${SRC}/freight/autopilot/freightExceptionTypes.ts:24-36` }],
    statuses: ['opportunity', 'booking_in_progress', 'booked', 'dispatched', 'en_route_pickup', 'at_pickup', 'loaded', 'in_transit', 'at_delivery', 'delivered', 'pod_needed', 'complete', 'cancelled', 'issue'],
    assignment: 'Load.assignedDispatcherStaffId', due: 'Load.pickupDate · deliveryDate', blocker: 'FreightException (17 types; open · acknowledged) · issue / pod_needed',
    client_safe: 'Client sees customerNotes and customer-visible timeline events; internalNotes stay internal',
    related: [rel(`${W}.VEHICLES_FLEET`, 'trucks'), rel(`${W}.DRIVERS_CARRIERS`, 'drivers'), rel(`${W}.BROKERAGE`, 'brokered loads'), rel(`${W}.FACTORING`, 'factoring handoff'), rel(`${W}.FILING_FUEL_TAXES.IFTA`, 'mileage'), rel(`${W}.COMPLIANCE`, 'driver / vehicle compliance holds that block dispatch'), rel('AIO_OFFICE.MORE.BILLING', 'dispatch fees')],
    gaps: ['G-DISPATCH-MY-LOADS', 'G-DISPATCH-ENROLLMENT-UI', 'G-OFFICE-DEMO-ONLY'],
  },
  {
    lane_id: `${W}.BROKERAGE`,
    shell: shell({ SERVICE_OVERVIEW: ['PARTIAL', 'BrokerageCommandCenterPage'], ACTIVE_WORK: ['PARTIAL', 'requests · quotes · loads'], NEEDS_ATTENTION: ['PARTIAL', 'coverage needs_coverage'], DUE_SOON: ['PARTIAL', 'quote expiresAt · invoice dueDate'], BLOCKED: ['PARTIAL', 'BrokerageIssue · BrokerageInfoRequest'], RECENTLY_COMPLETED: ['PARTIAL', 'delivered loads'] }),
    records: [{ record: 'ShipmentRequest · BrokerageFreightQuote · CarrierOffer', evidence: `${SRC}/brokerage/brokerageTypes.ts:68-289` }, { record: 'BrokerageLoadFinancials (staff only; Supabase view aio_brokerage_load_financials_internal)', evidence: `${SRC}/brokerage/brokerageTypes.ts:326-338` }, { record: 'CarrierPayable · BrokerageShipperInvoice', evidence: `${SRC}/brokerage/brokerageTypes.ts:371-423` }],
    statuses: ['request / quote / offer / coverage / payable / invoice status sets (brokerageTypes.ts)'],
    assignment: 'assignedBrokerStaffId', due: 'quote expiresAt · shipper invoice dueDate', blocker: 'BrokerageIssue · BrokerageInfoRequest · coverage needs_coverage',
    client_safe: 'Shipper sees quotes and shipment status; carrier sees its offer and carrier rate; margin and carrier pay stay staff-only',
    related: [rel(`${W}.DISPATCH.LOADS`, 'brokered loads are canonical Loads'), rel(`${W}.DRIVERS_CARRIERS`, 'carrier offers'), rel(`${W}.FACTORING`, 'carrier factoring'), rel(`${W}.BOOKKEEPING`, 'bookkeeping handoff'), rel('AIO_OFFICE.MORE.BILLING', 'shipper invoices')],
    gaps: ['G-BROKERAGE-PAUSED', 'G-OFFICE-DEMO-ONLY', 'P-SHIPPER-VIEW-INTERNAL-NOTES', 'P-SHIPPER-READS-AUDIT'],
  },
  {
    lane_id: `${W}.INSURANCE`,
    shell: shell({ SERVICE_OVERVIEW: ['PARTIAL', 'InsuranceCommandCenterPage'], ACTIVE_WORK: ['PARTIAL', 'requests · quotes'], NEEDS_ATTENTION: ['PARTIAL', 'policies expiring 0–30 days'], DUE_SOON: ['PARTIAL', 'policy expirationDate'], BLOCKED: ['PARTIAL', 'InsuranceIssue waiting_on_customer · waiting_on_partner'], RECENTLY_COMPLETED: ['PARTIAL', 'policies activated'] }),
    records: [{ record: 'InsuranceRequest · InsuranceQuoteRecord · InsurancePolicy · InsuranceCertificate · InsurancePolicyVehicle', evidence: `${SRC}/insurance/insuranceTypes.ts:57-251` }],
    statuses: ['request / policy / quote / certificate status sets (insuranceTypes.ts)'],
    assignment: 'assignedCoordinatorStaffId', due: 'policy / quote expirationDate', blocker: 'InsuranceIssue',
    client_safe: 'customerVisibleNotes and policy status; internalNotes / operationsNotes stay internal',
    related: [rel(`${W}.VEHICLES_FLEET`, 'insured vehicles'), rel(`${W}.COMPLIANCE`, 'coverage requirements'), rel('AIO_OFFICE.MORE.BILLING', 'premium / fees')],
    gaps: ['G-INSURANCE-TABLES-UNQUERIED', 'G-INSURANCE-EXPIRED-DROPPED'],
  },
  {
    lane_id: `${W}.FACTORING`,
    shell: shell({ SERVICE_OVERVIEW: ['PARTIAL', 'FactoringCommandCenterPage'], ACTIVE_WORK: ['PARTIAL', 'submissions'], NEEDS_ATTENTION: ['PARTIAL', 'FactoringIssue'], DUE_SOON: ['PARTIAL', 'freight invoice dueDate'], BLOCKED: ['PARTIAL', 'issueReason · customerActionRequired'], RECENTLY_COMPLETED: ['PARTIAL', 'funded submissions'] }),
    records: [{ record: 'FactoringProfile · FactoringSubmission · FactoringProvider · FreightInvoice', evidence: `${SRC}/factoring/factoringTypes.ts:71-193` }, { record: 'Second model used by portal components + mocks', evidence: `${SRC}/services/factoring/factoringTypes.ts` }],
    statuses: ['enrollment / submission / provider status sets (factoringTypes.ts)'],
    assignment: 'primarySpecialistStaffId · assignedSpecialistStaffId', due: 'FreightInvoice.dueDate', blocker: 'FactoringIssue',
    client_safe: 'Client sees submissions and customer-visible timeline; provider / debtor internal notes stay internal',
    related: [rel(`${W}.DISPATCH`, 'load handoff'), rel(`${W}.BROKERAGE`, 'carrier factoring'), rel(`${W}.BOOKKEEPING`, 'receivables'), rel('AIO_OFFICE.MORE.BILLING', 'fees')],
    gaps: ['G-FACTORING-NO-PROVIDER', 'G-FACTORING-TWO-MODELS'],
  },
  {
    lane_id: `${W}.BOOKKEEPING`,
    shell: shell({ SERVICE_OVERVIEW: ['PARTIAL', 'BookkeepingCommandCenterPage (read-only dashboards)'], ACTIVE_WORK: ['PARTIAL', 'subscriptions (seed)'], NEEDS_ATTENTION: ['NOT_IMPLEMENTED', 'BookkeepingException (seed only)'], DUE_SOON: ['NOT_IMPLEMENTED', 'BookkeepingCycle.dueDate (seed only)'], BLOCKED: ['PARTIAL', 'subscription blocked · past_due'], RECENTLY_COMPLETED: ['NOT_IMPLEMENTED', 'reports (seed only)'] }),
    records: [{ record: 'BookkeepingSubscription · BookkeepingCycle · BookkeepingReport · BooksRescueEngagement', evidence: `${SRC}/bookkeeping/bookkeepingTypes.ts:94-144` }, { record: 'Autopilot periods (reconciliationStatus) · exceptions', evidence: `${SRC}/bookkeeping/autopilot/autopilotTypes.ts:36-166` }],
    statuses: ['subscription / cycle status sets (bookkeepingTypes.ts:15-40)'],
    assignment: 'assignedStaffId · reviewerStaffId', due: 'cycle dueDate · renewalDate', blocker: 'subscription blocked / past_due · BookkeepingException',
    client_safe: 'customerStatusLabel; reports only once delivered (drafts are shown today)',
    related: [rel(`${W}.FACTORING`, 'receivables'), rel(`${W}.BROKERAGE`, 'bookkeeping handoff'), rel(`${W}.FILING_FUEL_TAXES.IFTA`, 'fuel'), rel('AIO_OFFICE.MORE.BILLING', 'subscription billing')],
    gaps: ['G-BOOKKEEPING-SEED-ONLY', 'P-BOOKKEEPING-DRAFT-REPORTS'],
  },
  {
    lane_id: `${W}.DRIVERS_CARRIERS`,
    shell: shell({ SERVICE_OVERVIEW: ['PARTIAL', 'DriverLinkOfficeOverviewPage (read-only)'], ACTIVE_WORK: ['PARTIAL', 'applications · jobs'], NEEDS_ATTENTION: ['NOT_IMPLEMENTED', 'none'], DUE_SOON: ['NOT_IMPLEMENTED', 'credential expirationDate (unsurfaced)'], BLOCKED: ['PARTIAL', 'statuses documents_needed · employer_action_required'], RECENTLY_COMPLETED: ['PARTIAL', 'hired applicants'] }),
    records: [{ record: 'DriverProfile · JobOpportunity · DriverApplication · DriverCredential · DriverJobMatch', evidence: `${SRC}/driverlink/driverlinkTypes.ts:70-163` }],
    statuses: ['DriverLink status sets (driverlinkTypes.ts:6-52)'],
    assignment: null, due: 'DriverCredential.expirationDate · JobOpportunity.expiresAt', blocker: 'status values only',
    client_safe: 'Employer sees applicants per consent / employerAccessLevel; internalNotes stay internal',
    related: [rel(`${W}.VEHICLES_FLEET`, 'assigned vehicles'), rel(`${W}.DISPATCH`, 'drivers on loads'), rel(`${W}.COMPLIANCE`, 'credential compliance'), rel(`${W}.BROKERAGE.CARRIER_OFFERS`, 'carriers')],
    gaps: ['G-DRIVERS-READ-ONLY'],
  },
  {
    lane_id: `${W}.MECHANIC_MAINTENANCE`,
    shell: shell({ SERVICE_OVERVIEW: ['PARTIAL', 'FleetCareOfficeOverviewPage (read-only)'], ACTIVE_WORK: ['PARTIAL', 'tickets'], NEEDS_ATTENTION: ['NOT_IMPLEMENTED', 'none'], DUE_SOON: ['NOT_IMPLEMENTED', 'no ticket due date'], BLOCKED: ['PARTIAL', 'on_hold · awaiting_parts · disputed'], RECENTLY_COMPLETED: ['PARTIAL', 'completed tickets'] }),
    records: [{ record: 'MaintenanceTicket · ReferralTransaction · ServiceProvider · RepairRecord', evidence: `${SRC}/fleetcare/fleetcareTypes.ts:67-264` }],
    statuses: ['20 ticket statuses (fleetcareTypes.ts:6-26; mirrored in SQL)'],
    assignment: 'provider (no staff assignee)', due: null, blocker: 'ticket status',
    client_safe: 'Client sees its ticket status; provider identity only once contact is released; referral fees stay internal',
    related: [rel(`${W}.VEHICLES_FLEET`, 'vehicle maintenance state'), rel('AIO_OFFICE.MORE.MECHANIC_NETWORK', 'providers (network administration)'), rel('AIO_OFFICE.MORE.BILLING', 'referral fees')],
    gaps: ['G-FLEETCARE-READ-ONLY', 'P-FLEETCARE-TICKET-NO-ORG-CHECK', 'P-FLEETCARE-REFERRAL-FEES-CLIENT'],
  },
  {
    lane_id: `${W}.ROAD_READY`,
    shell: shell({ SERVICE_OVERVIEW: ['PARTIAL', 'OfficeRoadReadyQueuePage'], ACTIVE_WORK: ['PARTIAL', 'profiles with open items'], NEEDS_ATTENTION: ['PARTIAL', 'items action_needed · needs_review'], DUE_SOON: ['PARTIAL', 'item expiresAt'], BLOCKED: ['PARTIAL', 'profile mode attention_required'], RECENTLY_COMPLETED: ['BLOCKED', 'no engagement completion state'] }),
    records: [{ record: 'RoadReadyProfile · RoadReadyItem', evidence: `${SRC}/road-ready/roadReadyTypes.ts:151-193` }, { record: 'Roadmaps / intake sessions (Supabase, queried)', evidence: `${SRC}/data/repositories/supabaseRepositories.ts:34-142` }],
    statuses: ['item: not_started · action_needed · in_progress · needs_review · completed · optional · not_applicable', 'profile mode: onboarding · active · attention_required · review_required · monitoring', 'engagement state (AVAILABLE · ACTIVE · COMPLETED): none'],
    assignment: 'item verifiedByStaffId only', due: 'RoadReadyItem.expiresAt', blocker: 'item status / profile mode',
    client_safe: 'Client sees readiness items and progress; staff verification notes stay internal',
    related: [rel(`${W}.PERMITTING_AUTHORITIES`, 'authorities / registrations'), rel(`${W}.COMPLIANCE`, 'compliance readiness'), rel(`${W}.INSURANCE`, 'coverage'), rel(`${W}.VEHICLES_FLEET`, 'vehicle readiness'), rel(`${W}.DRIVERS_CARRIERS`, 'driver readiness'), rel('AIO_OFFICE.MORE.DOCUMENTS_VAULT', 'documents')],
    gaps: ['G-ROAD-READY-NO-ENGAGEMENT-STATE', 'G-ROAD-READY-TABLES-UNQUERIED'],
  },
];

/** The founder's cross-service relationships: each hub links its spokes; records are linked, never duplicated. */
export const AIO_WORK_RELATIONSHIPS: { hub: string; label: string; spokes: string[]; via: string }[] = [
  { hub: `${W}.VEHICLES_FLEET`, label: 'VEHICLE', spokes: [`${W}.COMPLIANCE`, `${W}.INSURANCE`, `${W}.FILING_FUEL_TAXES.IFTA`, `${W}.MECHANIC_MAINTENANCE`, `${W}.DISPATCH`], via: 'the vehicle record (VEHICLES & FLEET) — each lane links to it, none copies it (IFTA’s embedded copies are a recorded gap)' },
  { hub: 'AIO_OFFICE.MORE.CLIENTS', label: 'CLIENT', spokes: [`${W}.BOOKKEEPING`, `${W}.FACTORING`, 'AIO_OFFICE.MORE.BILLING'], via: 'the client / organisation id every record carries; Client 360 links the client’s work across lanes' },
  { hub: `${W}.DRIVERS_CARRIERS`, label: 'DRIVER', spokes: [`${W}.DRIVERS_CARRIERS.CREDENTIALS`, `${W}.COMPLIANCE`, `${W}.DISPATCH`], via: 'the driver profile (DRIVERS & CARRIERS) and its credentials' },
];

/** The fifteen WORK root capabilities the founder requires, each with today's truth. */
export const AIO_WORK_ROOT_CAPABILITIES: { capability: string; state: SurfaceState; evidence: string[]; note: string }[] = [
  { capability: 'Service lane navigation', state: 'PARTIAL', evidence: [`${SRC}/office/layouts/AIOOfficeLayout.tsx:13-118`], note: 'Sidebar groups per division; no WORK lane switcher; VEHICLES & FLEET has no route.' },
  { capability: 'Cross-client search', state: 'PARTIAL', evidence: [`${SRC}/office/layouts/AIOOfficeLayout.tsx:142-169`], note: 'Command palette jumps by request number, client, lead, document, renewal, load, quote / invoice; no work search.' },
  { capability: 'Filtering', state: 'PARTIAL', evidence: [`${SRC}/ifta/ui/IftaStaffQueuePage.tsx:17`], note: 'IFTA queue tabs; queues by id; no cross-lane filter.' },
  { capability: 'Sorting', state: 'PARTIAL', evidence: [`${SRC}/office-core/officeAttentionEngine.ts:34-76`], note: 'Priority weight only; no user sorting.' },
  { capability: 'Staff assignment (where supported)', state: 'PARTIAL', evidence: [`${SRC}/office/pages/OfficeWorkPages.tsx:100`, `${SRC}/office-core/officeWorkTypes.ts:125-126`], note: 'Work items and IFTA quarters carry assignees; FleetCare and DriverLink have none.' },
  { capability: 'Client drilldown', state: 'PARTIAL', evidence: [OR('274')], note: 'Client 360; five of its tabs are placeholders.' },
  { capability: 'Work item / case drilldown', state: 'PARTIAL', evidence: [OR('190-192'), OR('277')], note: 'IFTA case, request detail, load detail.' },
  { capability: 'Due dates', state: 'PARTIAL', evidence: [`${SRC}/office-core/officeWorkEngine.ts:20-23`], note: 'Work item dueAt; lane due fields vary (see lanes).' },
  { capability: 'Blockers', state: 'PARTIAL', evidence: [`${SRC}/office-core/officeWorkTypes.ts:40-50`], note: 'waitingOn on work items; lanes use their own statuses.' },
  { capability: 'Statuses', state: 'PARTIAL', evidence: [`${SRC}/office-core/officeWorkTypes.ts:29-38`], note: 'Per domain; no shared lane status.' },
  { capability: 'Priority', state: 'PARTIAL', evidence: [`${SRC}/demo/demoTypes.ts:217`], note: 'urgent · high · normal · low on work items only.' },
  { capability: 'Activity', state: 'PARTIAL', evidence: [`${SRC}/demo/demoTypes.ts:472-482`], note: 'ActivityEvent per client / request; the office feed hides customer-visible events.' },
  { capability: 'Documents', state: 'PARTIAL', evidence: [`${SRC}/office/pages/OfficeWorkPages.tsx:328-358`], note: 'Document review list is read-only; no staff upload.' },
  { capability: 'Next action', state: 'PARTIAL', evidence: [`${SRC}/office-core/officeNextActionEngine.ts:22-138`], note: 'Office next-action engine (overdue → review → due today …).' },
  { capability: 'Related work', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/office/pages/ClientDetailPage.tsx:184-191`], note: 'No cross-lane links; lane contracts define them (related).' },
];

const workAcrossAio: RegionContract = {
  region_id: `${H}.WORK_ACROSS_AIO`, label: 'Work Across AIO', presence: 'REQUIRED', question: 'What is moving in each service?',
  item_fields: ['lane', 'active count', 'needs attention', 'due soon', 'blocked', 'recently completed', 'route to lane'],
  state: 'PARTIAL',
  rules: ['One line per WORK lane (all twelve). Each figure renders only when that lane’s shell section is AVAILABLE or PARTIAL; otherwise the line names it “not connected”.', 'HOME reads the lane summary; it never recounts lane records itself.'],
  sources: AIO_WORK_LANES.map((l) => src({ source_id: `lane-${l.lane_id.split('.').pop()!.toLowerCase()}`, label: l.lane_id.split('.').pop()!, domain: 'WORK_ITEMS', owner_node: l.lane_id, route: null, data_source: l.shell.SERVICE_OVERVIEW.source, backing: l.shell.SERVICE_OVERVIEW.state === 'NOT_IMPLEMENTED' ? 'NONE' : 'DEMO_STORE', state: l.shell.SERVICE_OVERVIEW.state, evidence: l.records.map((r) => r.evidence) })),
};
HOME_CONTRACT.regions.splice(3, 0, workAcrossAio);

const WORK_CONTRACT: RootContract = {
  root_id: W, stance: 'PRODUCTION',
  purpose: 'Active service production across all twelve lanes: what AIO is doing, for which client, in which service, who owns it, its state, what blocks it and what happens next.',
  primary_question: 'What is AIO actively doing, and what happens next?',
  answers: ['What is AIO actively doing?', 'For which client?', 'In which service?', 'Who owns it?', 'What state is it in?', 'What is blocking it?', 'What happens next?'],
  owns: ['service requests', 'IFTA quarter cases', 'compliance work', 'vehicle records (roster, profile, availability, registration state)', 'loads and dispatch', 'brokerage requests, quotes, offers, load financials', 'insurance requests, quotes, policies', 'factoring submissions', 'bookkeeping cycles', 'driver applications and credentials review', 'maintenance tickets', 'Road Ready items', 'office work items and workflows'],
  projects: [],
  reads: [{ domain: 'CLIENTS', via: 'client identity / lifecycle (INTAKE, MORE → CLIENTS)' }, { domain: 'DOCUMENTS', via: 'MORE → DOCUMENTS & VAULT' }, { domain: 'MESSAGING', via: 'MORE → MESSAGES' }, { domain: 'SERVICE_CATALOG', via: 'MORE → SERVICE CATALOG (what is offered)' }],
  may_mutate: ['its own lane records through lane actions (status, assignment, notes, filing, payment records)', 'documents and messages only through their owners’ actions'],
  must_not: ['aggregate history or trends (REPORTS)', 'administer catalog, pricing, staff or settings (MORE)', 'mirror a staff workspace into the client office (client-safe projection only)', 'duplicate a canonical record another lane owns (cross-link instead)'],
  staff_only: ['every lane (clients see client-safe projections in CLIENT OFFICE)'],
  founder_only: ['internal load financials (staff by brokerage_finance grant)', 'high-risk overrides — defined per action'],
  belongs_elsewhere: [
    { item: 'Historical performance and exports', belongs_in: 'AIO_OFFICE.REPORTS' },
    { item: 'CRM pipeline', belongs_in: 'AIO_OFFICE.MORE.GROWTH_CRM' },
    { item: 'Invoicing and payments', belongs_in: 'AIO_OFFICE.MORE.BILLING' },
    { item: 'Provider network administration', belongs_in: 'AIO_OFFICE.MORE.MECHANIC_NETWORK' },
    { item: 'Migration and onboarding', belongs_in: 'AIO_OFFICE.INTAKE' },
  ],
  partial_truth_rule: 'Every lane exposes the same six-part shell. A shell section without source truth renders its honest state (NOT_IMPLEMENTED / BLOCKED with the dependency) — lanes never invent workflow depth.',
  hierarchy: ['Lane switcher', 'Needs attention', 'Active work', 'Due soon', 'Blocked', 'Recently completed', 'Case / work item', 'Related work'],
  regions: [
    { region_id: 'WORK.LANE_SWITCHER', label: 'Lane switcher', presence: 'REQUIRED', question: 'Which service am I in?', item_fields: ['lane', 'needs-attention count'], state: 'PARTIAL', rules: ['All twelve lanes, in the canonical order; VEHICLES & FLEET shows its NOT_IMPLEMENTED state.'], sources: [src({ source_id: 'sidebar-groups', label: 'Office sidebar groups', domain: 'WORK_ITEMS', owner_node: W, route: '/office/work', data_source: 'AIOOfficeLayout navGroups', backing: 'DEMO_STORE', state: 'PARTIAL', evidence: [`${SRC}/office/layouts/AIOOfficeLayout.tsx:13-118`] })] },
    { region_id: 'WORK.MY_WORK', label: 'My work', presence: 'REQUIRED', question: 'What is assigned to me?', item_fields: ['item', 'client', 'lane', 'status', 'due', 'waiting on'], state: 'PARTIAL', rules: ['Assignment fields as each lane holds them; lanes without assignees show “unassigned”, never a fake owner.'], sources: [src({ source_id: 'my-work', label: 'Office work items assigned to me', domain: 'WORK_ITEMS', owner_node: W, route: '/office/work', data_source: 'OfficeWorkItem.assignedUserId', backing: 'DEMO_STORE', state: 'PARTIAL', evidence: [OR('199'), `${SRC}/office-core/officeWorkTypes.ts:125-126`] })] },
    { region_id: 'WORK.CROSS_CLIENT_QUEUE', label: 'Cross-client queue', presence: 'REQUIRED', question: 'What is open across clients in this lane?', item_fields: ['client', 'item', 'status', 'priority', 'due', 'blocker', 'assignee'], state: 'PARTIAL', rules: ['Search, filter and sort within the lane; every row opens the canonical client × workspace case.'], sources: [src({ source_id: 'queues', label: 'Office queues', domain: 'WORK_ITEMS', owner_node: W, route: '/office/queues', data_source: 'QUEUE_DEFS · countByQueue', backing: 'DEMO_STORE', state: 'PARTIAL', evidence: [OR('200'), `${SRC}/office-core/officeCommandCenterService.ts:25-84`] })] },
    { region_id: 'WORK.CASE_DETAIL', label: 'Case / work item', presence: 'REQUIRED', question: 'What is the state of this case and what happens next?', item_fields: ['client', 'lane', 'status', 'next action', 'documents', 'messages', 'activity', 'related work'], state: 'PARTIAL', rules: ['A case keeps its canonical identity (PROJECT + CLIENT + WORKSPACE + CASE TYPE + SUBCONTEXT).'], sources: [src({ source_id: 'case-pages', label: 'IFTA case · request detail · load detail', domain: 'WORK_ITEMS', owner_node: W, route: null, data_source: 'lane case pages', backing: 'DEMO_STORE', state: 'PARTIAL', evidence: [OR('190-192'), OR('277')] })] },
    { region_id: 'WORK.RELATED_WORK', label: 'Related work', presence: 'REQUIRED', question: 'What else is connected to this?', item_fields: ['related lane', 'relation', 'item', 'route'], state: 'NOT_IMPLEMENTED', rules: ['Links follow the lane contracts’ related list; records are linked, never copied.'], sources: [] },
  ],
  actions: [
    act({ action_id: 'WORK.OPEN_LANE', label: 'Open lane', tier: 'PRIMARY', kind: 'ROUTE', owner_node: W, route: '/office/work', state: 'PARTIAL', evidence: [OR('199')] }),
    act({ action_id: 'WORK.OPEN_CASE', label: 'Open case', tier: 'PRIMARY', kind: 'ROUTE', owner_node: W, route: null, state: 'PARTIAL', evidence: [OR('190-192')] }),
    act({ action_id: 'WORK.UPDATE_STATUS', label: 'Update status', tier: 'PRIMARY', kind: 'EXECUTE', owner_node: W, route: null, state: 'PARTIAL', requires: 'work.manage', evidence: [`${SRC}/demo/demoActions.ts:183`] }),
    act({ action_id: 'WORK.ASSIGN', label: 'Assign', tier: 'SECONDARY', kind: 'EXECUTE', owner_node: W, route: null, state: 'PARTIAL', requires: 'work.assign', evidence: [`${SRC}/demo/demoActions.ts:203`] }),
    act({ action_id: 'WORK.REQUEST_DOCUMENTS', label: 'Request documents from the client', tier: 'SECONDARY', kind: 'EXECUTE', owner_node: W, route: null, state: 'PARTIAL', requires: 'work.manage', evidence: [`${SRC}/demo/demoActions.ts:220`] }),
    act({ action_id: 'WORK.ADD_INTERNAL_NOTE', label: 'Add internal note', tier: 'SECONDARY', kind: 'EXECUTE', owner_node: W, route: null, state: 'PARTIAL', requires: 'internal_notes.create', evidence: [`${SRC}/demo/demoActions.ts:324-339`] }),
    act({ action_id: 'WORK.OPEN_RELATED', label: 'Open related work', tier: 'SECONDARY', kind: 'ROUTE', owner_node: W, route: null, state: 'NOT_IMPLEMENTED' }),
  ],
  states: COMMON_STATES,
};

/* ════════════════════════════════ 3 · REPORTS ════════════════════════════════ */

const R = 'AIO_OFFICE.REPORTS';
const QL = (l: string) => `${SRC}/management/managementQueryLayer.ts:${l}`;
type MetricSpec = [id: string, domain: string, label: string, cls: MetricSourceClass, backing: DataBacking, source: string, derivation: string | null, state: SurfaceState, evidence: string[], note?: string, vis?: Vis];
const metric = ([id, domain, label, cls, backing, source, derivation, state, evidence, note, vis]: MetricSpec): MetricContract => ({ metric_id: id, domain_node: `${R}.${domain}`, label, classification: cls, backing, source, derivation, state, visibility: vis ?? V_GRANT, evidence, note: note ?? '' });
const DEMO = 'DEMO_STORE' as const;

export const AIO_REPORT_METRICS: MetricContract[] = ([
  ['overview.active-clients', 'OVERVIEW', 'Active clients', 'DERIVED_SUPPORTED', DEMO, 'store.clients lifecycle', 'countActiveClientsCanonical — lifecycle ACTIVE and all activation conditions (PREBUILT never counts)', 'PARTIAL', [QL('90-108'), `${SRC}/client-migration/activeClientRule.ts:5-14`]],
  ['overview.active-work', 'OVERVIEW', 'Active work items', 'DERIVED_SUPPORTED', DEMO, 'store.officeWorkItems', 'status not completed / cancelled', 'PARTIAL', [`${SRC}/office-core/officeWorkTypes.ts:29-38`]],
  ['overview.completed-work', 'OVERVIEW', 'Completed work (period)', 'DERIVED_SUPPORTED', DEMO, 'store.officeWorkItems completedAt', 'completedAt within period', 'NOT_IMPLEMENTED', [`${SRC}/office-core/officeWorkTypes.ts:111-135`]],
  ['overview.blocked-work', 'OVERVIEW', 'Blocked work', 'DERIVED_SUPPORTED', DEMO, 'store.officeWorkItems waitingOn / status', 'waiting_* or waitingOn ≠ none', 'NOT_IMPLEMENTED', [`${SRC}/office-core/officeWorkTypes.ts:40-50`]],
  ['overview.active-requests', 'OVERVIEW', 'Active service requests', 'PARTIAL_DATA', DEMO, 'store.requests', 'not completed / cancelled — two “active” definitions disagree (QL 92 vs 221)', 'PARTIAL', [QL('92'), QL('221')]],
  ['overview.deadlines', 'OVERVIEW', 'Deadlines by window', 'PARTIAL_DATA', DEMO, 'store.deadlines + store.renewals', 'getDeadlineWindows — on the stored severity, which is never recalculated', 'PARTIAL', [QL('268-297')]],
  ['overview.filing-throughput', 'OVERVIEW', 'Filing throughput (quarters filed per period)', 'DERIVED_SUPPORTED', DEMO, 'IftaQuarterCase.filing.filedAt', 'count of quarters with filing.filedAt in the period', 'NOT_IMPLEMENTED', [`${SRC}/ifta/iftaActions.ts:570-571`, `${SRC}/ifta/iftaTypes.ts:92`], 'Supported by data; no report surface.'],
  ['overview.migration-throughput', 'OVERVIEW', 'Migration throughput over time', 'DERIVED_UNSUPPORTED', 'NONE', 'none — no readable migration stage timestamps', null, 'NOT_IMPLEMENTED', [`${SRC}/vault/archiveMigrationTypes.ts:3-11`]],
  ['overview.client-growth', 'OVERVIEW', 'Client growth', 'DERIVED_UNSUPPORTED', 'NONE', 'none — activation timestamps live only in insert-only Supabase lifecycle events', null, 'NOT_IMPLEMENTED', [`${SRC}/client-migration/repositories/supabaseMigrationRepository.ts:196`]],
  ['clients.lifecycle-mix', 'CLIENTS', 'Clients by lifecycle (active · paused · ended · prebuilt · invited …)', 'DERIVED_SUPPORTED', DEMO, 'store.clients lifecycle', 'count per ClientLifecycleState', 'PARTIAL', [QL('311-327'), `${SRC}/client-migration/types.ts:3-13`]],
  ['clients.new', 'CLIENTS', 'New clients (period)', 'DERIVED_UNSUPPORTED', 'NONE', 'none — no readable activation timestamp', null, 'NOT_IMPLEMENTED', [`${SRC}/client-migration/types.ts:121-131`]],
  ['clients.service-mix', 'CLIENTS', 'Service mix per client', 'DERIVED_UNSUPPORTED', 'NONE', 'canonical workspace resolver not wired; three heuristic builders disagree', null, 'NOT_IMPLEMENTED', [`${SRC}/office-core/client360Service.ts:52-71`]],
  ['clients.activity', 'CLIENTS', 'Client activity', 'PARTIAL_DATA', DEMO, 'store.activity per client', 'events per client in the period — the office feed hides customer-visible events', 'NOT_IMPLEMENTED', [`${SRC}/demo/demoTypes.ts:472-482`]],
  ['services.volume', 'SERVICES', 'Service volume by division', 'PARTIAL_DATA', DEMO, 'store.requests', 'getServiceVolume; submitted counted as waiting on AIO and waiting external', 'PARTIAL', [QL('217-227'), QL('314')]],
  ['services.workflow-performance', 'SERVICES', 'Workflow performance', 'PARTIAL_DATA', DEMO, 'store.workflowInstances', 'getWorkflowPerformance', 'PARTIAL', [QL('229-241')]],
  ['services.trends', 'SERVICES', 'Service trends over time', 'DERIVED_UNSUPPORTED', 'NONE', 'status history is insert-only in Supabase, absent in the demo store', null, 'NOT_IMPLEMENTED', [`${SRC}/data/repositories/supabaseRepositories.ts:295`]],
  ['financial.collected', 'FINANCIAL_REVENUE', 'Collected service revenue', 'DERIVED_SUPPORTED', DEMO, 'store.payments succeeded', 'getFinancialSummary', 'PARTIAL', [`${SRC}/management/managementFinancial.ts:39-96`]],
  ['financial.invoiced', 'FINANCIAL_REVENUE', 'Service fees invoiced', 'PARTIAL_DATA', DEMO, 'store.invoices', 'labelled “invoice date” but computed on the payment-date basis (paidAt ?? issuedAt)', 'PARTIAL', [`${SRC}/office/pages/ManagementPages.tsx:176`, `${SRC}/management/managementFinancial.ts:42-46`], 'Derivation defect: label and basis disagree.'],
  ['financial.outstanding', 'FINANCIAL_REVENUE', 'Outstanding balances / aging', 'DERIVED_SUPPORTED', DEMO, 'store.invoices balanceDue', 'getReceivablesAging', 'PARTIAL', [`${SRC}/management/managementFinancial.ts:123-142`]],
  ['financial.credits', 'FINANCIAL_REVENUE', 'Credits applied', 'PARTIAL_DATA', DEMO, 'store.credits (sum only)', 'sum of CreditRecord', 'PARTIAL', [`${SRC}/office/pages/BillingPages.tsx:61`]],
  ['financial.adjustments', 'FINANCIAL_REVENUE', 'Adjustments', 'NOT_IMPLEMENTED', 'NONE', 'no adjustment record type', null, 'NOT_IMPLEMENTED', [`${SRC}/billing/billingTypes.ts:178-186`]],
  ['financial.revenue-share', 'FINANCIAL_REVENUE', 'Platform / revenue-share fees', 'NOT_IMPLEMENTED', 'NONE', 'FleetCare referral fees and factoring reported fees exist as fields; no revenue-share ledger', null, 'COMING_LATER', [`${SQL}/20260817190000_aio_fleetcare_network.sql:410-417`]],
  ['financial.profitability', 'FINANCIAL_REVENUE', 'Company profitability / margin', 'DERIVED_UNSUPPORTED', 'NONE', 'no cost data outside brokerage loads', null, 'NOT_IMPLEMENTED', [`${SRC}/brokerage/brokerageTypes.ts:326-338`], 'Never shown. Brokerage load margin is supported but internal (see dispatch-brokerage.margin).'],
  ['filing.quarters-filed', 'FILING_HISTORY', 'IFTA quarters filed (period)', 'DERIVED_SUPPORTED', DEMO, 'store.iftaQuarters FILED / ARCHIVED', 'count by quarter', 'NOT_IMPLEMENTED', [`${SRC}/ifta/iftaTypes.ts:143-174`], 'Supported by data; no report surface.'],
  ['filing.on-time', 'FILING_HISTORY', 'Filed on time', 'DERIVED_SUPPORTED', DEMO, 'IftaQuarterCase.dueDate · filing.filedAt (written by recordFiling)', 'filing.filedAt ≤ dueDate', 'NOT_IMPLEMENTED', [`${SRC}/ifta/iftaActions.ts:570-571`, `${SRC}/ifta/iftaTypes.ts:150`], 'Supported by data; no report surface.'],
  ['compliance.expirations', 'COMPLIANCE', 'Expirations by window', 'PARTIAL_DATA', DEMO, 'store.deadlines + store.renewals', 'getDeadlineWindows (stored severity)', 'PARTIAL', [QL('268-297')]],
  ['compliance.open-items', 'COMPLIANCE', 'Open / resolved compliance items', 'NOT_IMPLEMENTED', 'NONE', 'no compliance case model', null, 'BLOCKED', [`${SRC}/services/catalog/serviceCatalog.ts:709-743`]],
  ['compliance.corrective', 'COMPLIANCE', 'Corrective actions', 'NOT_IMPLEMENTED', 'NONE', 'no corrective-action model', null, 'BLOCKED', [`${SRC}/services/catalog/serviceCatalog.ts:709-743`]],
  ['compliance.trends', 'COMPLIANCE', 'Compliance trends', 'DERIVED_UNSUPPORTED', 'NONE', 'none — no compliance case history', null, 'NOT_IMPLEMENTED', [`${SRC}/services/catalog/serviceCatalog.ts:709-743`]],
  ['dispatch-brokerage.load-volume', 'DISPATCH_BROKERAGE', 'Load volume / status distribution', 'DERIVED_SUPPORTED', DEMO, 'store.loads (Supabase aio_dispatch_loads for autopilot)', 'getDispatchSummary', 'PARTIAL', [QL('170-187')]],
  ['dispatch-brokerage.margin', 'DISPATCH_BROKERAGE', 'Brokerage load economics (margin)', 'PARTIAL_DATA', DEMO, 'loads + brokerageLoadFinancials', 'getBrokerageEconomics — revenue is date-filtered, completed loads are not', 'PARTIAL', [QL('146-168')], 'Internal financial visibility: founder-class, staff by brokerage_finance grant.'],
  ['dispatch-brokerage.shipment-volume', 'DISPATCH_BROKERAGE', 'Shipment request volume', 'DERIVED_SUPPORTED', DEMO, 'ShipmentRequest', 'count by status and period', 'NOT_IMPLEMENTED', [`${SRC}/brokerage/brokerageTypes.ts:68-121`]],
  ['dispatch-brokerage.trends', 'DISPATCH_BROKERAGE', 'Operational trends (load status over time)', 'DERIVED_SUPPORTED', DEMO, 'Load.timeline (status events with timestamps)', 'status transitions per period from the load timeline', 'NOT_IMPLEMENTED', [`${SRC}/dispatch/dispatchTypes.ts:313`]],
  ['dispatch-brokerage.carrier-activity', 'DISPATCH_BROKERAGE', 'Carrier activity (offers)', 'DERIVED_SUPPORTED', DEMO, 'carrier offers', 'offers sent / accepted / declined', 'NOT_IMPLEMENTED', [`${SRC}/brokerage/brokerageTypes.ts:253-289`]],
  ['dispatch-brokerage.factoring', 'DISPATCH_BROKERAGE', 'Factoring summary', 'PARTIAL_DATA', DEMO, 'store.factoringSubmissions', 'getFactoringSummary — no date range; “service fees” sums the provider-reported fee', 'PARTIAL', [QL('189-198')], 'Derivation defect: fee label likely wrong.'],
  ['bookkeeping.subscriptions', 'BOOKKEEPING', 'Bookkeeping subscriptions', 'NOT_IMPLEMENTED', DEMO, 'BookkeepingSubscription (seed)', null, 'NOT_IMPLEMENTED', [`${SRC}/bookkeeping/bookkeepingTypes.ts:94-118`], 'Domain not started: contract only.'],
  ['bookkeeping.cycles-on-time', 'BOOKKEEPING', 'Cycles closed on time', 'NOT_IMPLEMENTED', DEMO, 'BookkeepingCycle (seed only, no writer)', null, 'NOT_IMPLEMENTED', [`${SRC}/bookkeeping/bookkeepingTypes.ts:120-130`]],
  ['migration.counts', 'MIGRATION', 'Migration batches / clients digitized', 'PARTIAL_DATA', DEMO, 'batches (Supabase in backend mode) — metrics read the demo store', 'computeMigrationDashboardMetrics', 'PARTIAL', [`${SRC}/vault/documentVaultMetrics.ts:53-89`], 'Metrics read the demo store even when the batch list comes from Supabase.'],
  ['migration.review-required', 'MIGRATION', 'Review required / blocked', 'PARTIAL_DATA', DEMO, 'MigrationBatchState ready_for_review · needs_attention · failed', 'count by state', 'PARTIAL', [`${SRC}/vault/documentVaultMetrics.ts:65-77`]],
  ['migration.status-distribution', 'MIGRATION', 'Batch status distribution', 'DERIVED_SUPPORTED', DEMO, 'MigrationBatchState', 'count per batch state', 'NOT_IMPLEMENTED', [`${SRC}/vault/archiveMigrationTypes.ts:3-11`], 'The dashboard counts only review-required and failed today.'],
  ['migration.activated', 'MIGRATION', 'Clients activated', 'DERIVED_SUPPORTED', DEMO, 'lifecycle ACTIVE (canonical rule)', 'isCountedActiveClient', 'PARTIAL', [`${SRC}/client-migration/activeClientRule.ts:5-14`]],
  ['migration.completion-time', 'MIGRATION', 'Migration completion time', 'DERIVED_UNSUPPORTED', 'NONE', 'no readable stage timestamps', null, 'NOT_IMPLEMENTED', [`${SRC}/vault/archiveMigrationTypes.ts:3-11`]],
] as MetricSpec[]).map(metric);

export const AIO_REPORT_EXPORTS: { export_id: string; label: string; state: SurfaceState; evidence: string[]; note: string }[] = [
  { export_id: 'receivables-aging-csv', label: 'Receivables aging (CSV)', state: 'PARTIAL', evidence: [`${SRC}/office/pages/ManagementPages.tsx:180-196`, `${SRC}/management/managementExport.ts:5-14`], note: 'Neutralises formula injection; no reports.export check and no audit entry.' },
  { export_id: 'ifta-case-csv', label: 'IFTA case report (CSV)', state: 'PARTIAL', evidence: [`${SRC}/ifta/ui/IftaStaffCasePage.tsx:116-136`], note: 'Escapes quotes only — no formula-injection guard; no permission check.' },
  { export_id: 'pdf', label: 'PDF reports', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/office/pages/ManagementPages.tsx:647`], note: 'No PDF library; the Reports Center says “foundation only”.' },
  { export_id: 'period-client-service-reports', label: 'Period / client / service reports', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/management/managementReports.ts:4-25`], note: 'The 20 standard reports are links to command-center pages; ?report= is never read.' },
  { export_id: 'saved-reports', label: 'Saved reports', state: 'PARTIAL', evidence: [`${SRC}/office/pages/ManagementPages.tsx:674-676`], note: 'Write-only: saves a fixed report; nothing reads saved reports.' },
];

/** The export contract every future export follows (EXPORTS is NOT STARTED: contract only). */
export const AIO_EXPORT_RULES = [
  'Formats: CSV first; PDF when a PDF renderer exists; period, client and service reports as parameterised exports of the same report definitions.',
  'Every export checks reports.export (and the internal-financial grant for money columns) on the server, not only in the page.',
  'Every export writes an audit entry: who, what, which period, which clients.',
  'CSV cells are neutralised against formula injection (the receivables export does this today; the IFTA case CSV does not).',
  'An export carries the classification of every metric in it; DERIVED_UNSUPPORTED and NOT_IMPLEMENTED metrics are never exported as numbers.',
  'Client reports contain only the client-safe projection of that client’s records.',
] as const;

const reportRegion = (id: string, question: string, fn: string, evidence: string[], state: SurfaceState): RegionContract => ({
  region_id: `${R}.${id}`, label: iaNode(AIO_OFFICE_IA, `${R}.${id}`)?.label ?? id, presence: 'REQUIRED', question, item_fields: ['metric', 'value', 'period', 'classification', 'drilldown to owner'], state,
  rules: ['Only metrics classified REAL_DATA / DERIVED_SUPPORTED (or PARTIAL_DATA, labelled) render; DERIVED_UNSUPPORTED and NOT_IMPLEMENTED never render as numbers.', 'DEMO_STORE-backed metrics render only in demo mode, labelled demo.'],
  sources: fn ? [src({ source_id: `reports-${id.toLowerCase()}`, label: fn, domain: 'WORK_ITEMS', owner_node: `${R}.${id}`, route: null, data_source: fn, backing: 'DEMO_STORE', state, evidence, visibility: V_GRANT })] : [],
});

const REPORTS_CONTRACT: RootContract = {
  root_id: R, stance: 'OVERSIGHT',
  purpose: 'Internal oversight, history, analysis and export: what happened, how much work exists, how the business is performing — never active production.',
  primary_question: 'What happened, and how is the business performing?',
  answers: ['What happened?', 'How much work exists?', 'What has changed?', 'How is the business performing?', 'What can be reviewed or exported?'],
  owns: ['report definitions and export jobs (future) — never operational state'],
  projects: [],
  reads: [{ domain: 'every WORK lane', via: 'lane records (read-only)' }, { domain: 'MIGRATION · CLIENTS', via: 'INTAKE / lifecycle' }, { domain: 'BILLING', via: 'MORE → BILLING (aggregated, never mutated)' }, { domain: 'CRM', via: 'MORE → GROWTH / CRM' }],
  may_mutate: [],
  must_not: ['own or change active work', 'issue, edit or void invoices or payments (BILLING owns them)', 'show a metric source truth cannot back', 'show illustrative numbers in production', 'expose profitability / margin beyond what is supported'],
  staff_only: ['the whole root'],
  founder_only: ['Reporting is founder-class: staff only by reports.read / management.*.read grants', 'Financial / Revenue: internal financial visibility'],
  belongs_elsewhere: [
    { item: 'Working an item a report surfaces', belongs_in: 'AIO_OFFICE.WORK' },
    { item: 'Invoice / payment operations', belongs_in: 'AIO_OFFICE.MORE.BILLING' },
    { item: 'CRM pipeline work', belongs_in: 'AIO_OFFICE.MORE.GROWTH_CRM' },
  ],
  partial_truth_rule: 'Every metric carries its classification and backing. NOT_IMPLEMENTED and DERIVED_UNSUPPORTED metrics appear only as named gaps; PARTIAL_DATA metrics carry a “partial” label; nothing is illustrative.',
  hierarchy: ['Period control', 'Key summary (Overview)', 'Domain reports', 'Drilldown to the owning WORK / MORE item', 'Export'],
  regions: [
    reportRegion('OVERVIEW', 'How is AIO doing overall?', 'getExecutiveSnapshot', [QL('90-108')], 'PARTIAL'),
    reportRegion('CLIENTS', 'How are clients moving?', 'getCustomerSummary', [QL('311-327')], 'PARTIAL'),
    reportRegion('SERVICES', 'How much service work, in what state?', 'getServiceVolume · getWorkflowPerformance', [QL('217-241')], 'PARTIAL'),
    reportRegion('FINANCIAL_REVENUE', 'What was billed, collected and outstanding?', 'getFinancialSummary · getReceivablesAging', [`${SRC}/management/managementFinancial.ts:39-142`], 'PARTIAL'),
    reportRegion('FILING_HISTORY', 'What was filed, and on time?', '', [], 'NOT_IMPLEMENTED'),
    reportRegion('COMPLIANCE', 'What is expiring, open or resolved?', 'getDeadlineWindows', [QL('268-297')], 'PARTIAL'),
    reportRegion('DISPATCH_BROKERAGE', 'How much freight moved, and how?', 'getDispatchSummary · getBrokerageEconomics · getFactoringSummary', [QL('146-198')], 'PARTIAL'),
    reportRegion('BOOKKEEPING', 'Are bookkeeping clients closed on time?', '', [], 'NOT_IMPLEMENTED'),
    reportRegion('MIGRATION', 'How is migration progressing?', 'computeMigrationDashboardMetrics', [`${SRC}/vault/documentVaultMetrics.ts:53-89`], 'PARTIAL'),
    reportRegion('EXPORTS', 'What can I export?', '', [], 'NOT_IMPLEMENTED'),
  ],
  actions: [
    act({ action_id: 'REPORTS.SET_PERIOD', label: 'Set period', tier: 'PRIMARY', kind: 'REVIEW', owner_node: R, route: null, state: 'PARTIAL', evidence: [`${SRC}/office/pages/ManagementPages.tsx:176`] }),
    act({ action_id: 'REPORTS.OPEN_DOMAIN', label: 'Open a report domain', tier: 'PRIMARY', kind: 'ROUTE', owner_node: R, route: '/office/reports', state: 'PARTIAL', requires: 'reports.read', evidence: [OR('262')] }),
    act({ action_id: 'REPORTS.DRILL_DOWN', label: 'Drill down to the owner', tier: 'PRIMARY', kind: 'ROUTE', owner_node: 'AIO_OFFICE.WORK', route: null, state: 'PARTIAL' }),
    act({ action_id: 'REPORTS.EXPORT_CSV', label: 'Export CSV', tier: 'SECONDARY', kind: 'REVIEW', owner_node: `${R}.EXPORTS`, route: null, state: 'PARTIAL', requires: 'reports.export (not checked today)', evidence: [`${SRC}/management/managementExport.ts:5-14`] }),
    act({ action_id: 'REPORTS.EXPORT_PDF', label: 'Export PDF', tier: 'SECONDARY', kind: 'REVIEW', owner_node: `${R}.EXPORTS`, route: null, state: 'NOT_IMPLEMENTED' }),
    act({ action_id: 'REPORTS.SAVE_REPORT', label: 'Save report', tier: 'SECONDARY', kind: 'REVIEW', owner_node: R, route: null, state: 'PARTIAL', requires: 'reports.save', evidence: [`${SRC}/office/pages/ManagementPages.tsx:674-676`] }),
  ],
  states: COMMON_STATES,
};

/* ════════════════════════════════ 4 · MORE ════════════════════════════════ */

const M = 'AIO_OFFICE.MORE';
export const AIO_MORE_ENTRIES: MoreEntryContract[] = [
  { entry_id: `${M}.CLIENTS`, is_for: 'The cross-client directory and Client 360 — routes into each client’s record and context.', owns: ['client directory view'], not_for: ['client work state (each WORK lane owns it)', 'lifecycle transitions (INTAKE)'], distinguishes: ['lifecycle segment', 'PREBUILT ≠ ACTIVE'], state: 'PARTIAL', evidence: [`${SRC}/office/pages/ClientsListPage.tsx:14-85`, `${SRC}/office-core/client360Service.ts:96-102`] },
  { entry_id: `${M}.DOCUMENTS_VAULT`, is_for: 'The internal cross-client document directory.', owns: ['document records and their visibility'], not_for: ['per-service document checks (the owning lane)'], distinguishes: ['staff-only (visibility internal)', 'client-visible (visibility customer)', 'generated (source service_generated / system_generated)', 'historical / superseded (isCurrent · recordLifecycle · supersededBy)'], state: 'PARTIAL', evidence: [`${SRC}/vault/vaultTypes.ts:86-148`, `${SRC}/vault/vaultStorage.ts:26-32`] },
  { entry_id: `${M}.GROWTH_CRM`, is_for: 'The canonical CRM home: leads, opportunities, pipeline, follow-ups, referrals.', owns: ['CRM state'], not_for: ['client-service production (WORK)'], distinguishes: ['carrier vs shipper pipelines'], state: 'PARTIAL', evidence: [`${SRC}/crm/crmTypes.ts:13-230`, `${SRC}/office/pages/CrmPages.tsx:332-354`] },
  { entry_id: `${M}.BILLING`, is_for: 'Billing operations: quotes, invoices, payments, receipts, credits.', owns: ['invoice / payment / quote / credit operations'], not_for: ['revenue analysis (REPORTS aggregates it)'], distinguishes: ['client-safe billing (FINANCES → FEES / PAYMENTS)', 'internal margin / commission / profitability (never client-facing)'], state: 'PARTIAL', evidence: [`${SRC}/billing/billingTypes.ts:16-186`, `${SRC}/office/pages/BillingPages.tsx:27-38`] },
  { entry_id: `${M}.TEAM_STAFF`, is_for: 'Internal people and roles.', owns: ['staff records, role and permission assignment (future)'], not_for: ['founder identity (FOUNDER is a role, never a name or email)'], distinguishes: ['FOUNDER (privileged role, one or more)', 'STAFF (granted permissions)'], state: 'PARTIAL', evidence: [`${SRC}/office-core/officeContext.ts:74`, `${SRC}/office-core/officeContext.ts:171-177`] },
  { entry_id: `${M}.SERVICE_CATALOG`, is_for: 'What AIO offers: service definitions, eligibility, availability, client visibility, staff ownership.', owns: ['catalog and launch states'], not_for: ['pricing invented without source truth (pricing today is fictional demo data)'], distinguishes: ['ServiceActivationStatus', 'launch state'], state: 'PARTIAL', evidence: [`${SRC}/services/catalog/serviceCatalogTypes.ts:14-103`, `${SRC}/launch/serviceActivationLaunch.ts:8-224`, `${SRC}/billing/servicePricingConfig.ts:4-5`] },
  { entry_id: `${M}.MECHANIC_NETWORK`, is_for: 'Provider network administration (onboarding, verification, directory).', owns: ['provider records'], not_for: ['maintenance tickets (WORK → MECHANIC / MAINTENANCE)'], distinguishes: ['verification and application status'], state: 'PARTIAL', evidence: [`${SRC}/pages/office/FleetCareOfficePages.tsx:73-89`] },
  { entry_id: `${M}.MESSAGES`, is_for: 'Staff communication: staff-to-client conversations, internal notes, system notifications.', owns: ['conversations and messages (staff side)'], not_for: ['the client’s INBOX logic (client side reads client-visible messages only)'], distinguishes: ['staff-to-client (customer_visible)', 'internal staff (internal_only)', 'system notifications'], state: 'PARTIAL', evidence: [`${SRC}/communications/communicationTypes.ts:84-147`] },
  { entry_id: `${M}.SYSTEM_SETTINGS`, is_for: 'Configuration: workflows, automations, communications, integrations, security, data, QA.', owns: ['system configuration'], not_for: ['service production'], distinguishes: ['founder-only / privileged areas (system configuration)'], state: 'PARTIAL', evidence: [OR('210-242')] },
  { entry_id: `${M}.HELP_SUPPORT`, is_for: 'Internal help, training and SOPs.', owns: ['training and SOP content'], not_for: ['client help (CLIENT OFFICE → ACCOUNT → HELP)'], distinguishes: [], state: 'PARTIAL', evidence: [OR('260-261'), `${SRC}/launch/staffTraining.ts:45-63`] },
  { entry_id: `${M}.ACCOUNT`, is_for: 'The signed-in staff member’s own profile, security and preferences.', owns: ['own profile'], not_for: ['other staff (TEAM & STAFF)'], distinguishes: [], state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/office/layouts/AIOOfficeLayout.tsx:180-188 (demo identity switcher only)`] },
];

const MORE_CONTRACT: RootContract = {
  root_id: M, stance: 'ADMINISTRATION',
  purpose: 'The internal business-operations directory: cross-cutting, administrative, directory-like and lower-frequency tools — never client-service production.',
  primary_question: 'Where do I find or administer a supporting system?',
  answers: ['Where is a client, document, lead or invoice?', 'Who is on the team and what can they do?', 'What does AIO offer?', 'How is the system configured?'],
  owns: ['client directory view', 'documents & vault', 'CRM', 'billing operations', 'team & roles', 'service catalog', 'provider network', 'messages', 'system settings', 'help & training', 'own account'],
  projects: [],
  reads: [{ domain: 'CLIENTS', via: 'client records' }, { domain: 'WORK lanes', via: 'links only (no production)' }],
  may_mutate: ['the supporting systems it owns (administer)'],
  must_not: ['hold daily client-service production (it belongs in WORK)', 'become a junk drawer: every entry has a stated purpose and owner', 'duplicate the client INBOX logic', 'expose staff-only documents or financial data to clients'],
  staff_only: ['the whole root'],
  founder_only: ['system configuration', 'service configuration', 'staff / permission administration', 'billing and CRM visibility for staff is by grant'],
  belongs_elsewhere: [
    { item: 'Maintenance tickets', belongs_in: 'AIO_OFFICE.WORK.MECHANIC_MAINTENANCE' },
    { item: 'Per-service document review', belongs_in: 'AIO_OFFICE.WORK' },
    { item: 'Revenue analysis', belongs_in: 'AIO_OFFICE.REPORTS.FINANCIAL_REVENUE' },
    { item: 'Migration intake', belongs_in: 'AIO_OFFICE.INTAKE' },
  ],
  partial_truth_rule: 'Every entry states its own state; an entry without a surface (ACCOUNT) shows NOT_IMPLEMENTED, never a placeholder page.',
  hierarchy: ['Directory of entries (role-aware)', 'Search', 'Entry'],
  regions: [
    { region_id: 'MORE.DIRECTORY', label: 'Directory', presence: 'REQUIRED', question: 'What supporting systems can I reach?', item_fields: ['entry', 'purpose', 'state', 'requires'], state: 'NOT_IMPLEMENTED', rules: ['Role-aware: entries the actor cannot use are omitted; grant-only entries need their grant.'], sources: [] },
    { region_id: 'MORE.SEARCH', label: 'Search', presence: 'OPTIONAL', question: 'Find a client, document, lead or invoice', item_fields: ['result', 'type', 'route'], state: 'PARTIAL', rules: ['Results route to their owner.'], sources: [src({ source_id: 'command-palette', label: 'Command palette search', domain: 'CLIENTS', owner_node: `${M}.CLIENTS`, route: null, data_source: 'AIOOfficeLayout onSearch', backing: 'DEMO_STORE', state: 'PARTIAL', evidence: [`${SRC}/office/layouts/AIOOfficeLayout.tsx:142-169`] })] },
  ],
  actions: [
    act({ action_id: 'MORE.OPEN_ENTRY', label: 'Open entry (role-aware)', tier: 'PRIMARY', kind: 'ROUTE', owner_node: M, route: null, state: 'PARTIAL' }),
    act({ action_id: 'MORE.MANAGE_ROLES', label: 'Manage staff roles', tier: 'SECONDARY', kind: 'ADMINISTER', owner_node: `${M}.TEAM_STAFF`, route: null, state: 'NOT_IMPLEMENTED', requires: 'founder: staff / permission administration', evidence: [`${SRC}/office-core/officeContext.ts:214`] }),
    act({ action_id: 'MORE.CONFIGURE_SERVICE', label: 'Configure service / pricing', tier: 'SECONDARY', kind: 'ADMINISTER', owner_node: `${M}.SERVICE_CATALOG`, route: '/office/settings/pricing', state: 'PARTIAL', requires: 'founder: service configuration', evidence: [`${SRC}/office/pages/BillingPages.tsx:242-283`] }),
    act({ action_id: 'MORE.CONFIGURE_SYSTEM', label: 'Configure system', tier: 'SECONDARY', kind: 'ADMINISTER', owner_node: `${M}.SYSTEM_SETTINGS`, route: '/office/settings/workflows', state: 'PARTIAL', requires: 'founder: system configuration', evidence: [OR('210-216')] }),
    act({ action_id: 'MORE.ISSUE_INVOICE', label: 'Issue invoice', tier: 'SECONDARY', kind: 'ADMINISTER', owner_node: `${M}.BILLING`, route: null, state: 'PARTIAL', requires: 'billing.manage', evidence: [`${SRC}/demo/billingActions.ts:302`] }),
  ],
  states: COMMON_STATES,
};

/* ════════════════════════════════ 6 · ownership matrix ════════════════════════════════ */

const own = (domain_id: string, label: string, canonical_owner: string, o: Partial<Omit<DomainOwnership, 'domain_id' | 'label' | 'canonical_owner'>>): DomainOwnership => ({ domain_id, label, canonical_owner, home_projection: null, work_production: null, reports_aggregation: null, more_admin: null, client_safe_projection: null, founder_only: null, staff_access: 'FULL', note: '', ...o });
const HN = 'AIO_OFFICE.HOME.NEEDS_ATTENTION';
const HD = 'AIO_OFFICE.HOME.DEADLINES';
export const AIO_ROOT_OWNERSHIP: DomainOwnership[] = [
  own('CLIENTS', 'Clients', `${M}.CLIENTS`, { home_projection: 'AIO_OFFICE.HOME.CLIENTS_IN_MOTION', reports_aggregation: `${R}.CLIENTS`, more_admin: `${M}.CLIENTS`, client_safe_projection: 'CLIENT_OFFICE.MY_BUSINESS', note: 'Lifecycle transitions belong to INTAKE and the client activation gate.' }),
  own('MIGRATION', 'Migration', 'AIO_OFFICE.INTAKE', { home_projection: HN, reports_aggregation: `${R}.MIGRATION`, client_safe_projection: 'CLIENT_OFFICE.ACTIVATION', founder_only: 'founder review · PREBUILT approval · activation invite', note: 'PREBUILT is never ACTIVE; client confirmation remains the gate.' }),
  own('PERMITTING', 'Permitting & Authorities', `${W}.PERMITTING_AUTHORITIES`, { home_projection: HN, work_production: `${W}.PERMITTING_AUTHORITIES`, reports_aggregation: `${R}.SERVICES`, client_safe_projection: 'CLIENT_OFFICE.OPERATIONS.PERMITTING_AUTHORITIES' }),
  own('IFTA', 'IFTA / Fuel Tax', `${W}.FILING_FUEL_TAXES.IFTA`, { home_projection: HN, work_production: `${W}.FILING_FUEL_TAXES`, reports_aggregation: `${R}.FILING_HISTORY`, client_safe_projection: 'CLIENT_OFFICE.OPERATIONS.FILING_IFTA' }),
  own('COMPLIANCE', 'Compliance', `${W}.COMPLIANCE`, { home_projection: HD, work_production: `${W}.COMPLIANCE`, reports_aggregation: `${R}.COMPLIANCE`, client_safe_projection: 'CLIENT_OFFICE.OPERATIONS.COMPLIANCE' }),
  own('VEHICLES', 'Vehicles & Fleet', `${W}.VEHICLES_FLEET`, { home_projection: HD, work_production: `${W}.VEHICLES_FLEET`, reports_aggregation: R, client_safe_projection: 'CLIENT_OFFICE.OPERATIONS.VEHICLE_MANAGEMENT', note: 'Owns roster, profile, availability, registration state; no staff screen yet.' }),
  own('DISPATCH', 'Dispatch', `${W}.DISPATCH`, { home_projection: HN, work_production: `${W}.DISPATCH`, reports_aggregation: `${R}.DISPATCH_BROKERAGE`, client_safe_projection: 'CLIENT_OFFICE.OPERATIONS.DISPATCH' }),
  own('BROKERAGE', 'Brokerage', `${W}.BROKERAGE`, { home_projection: HN, work_production: `${W}.BROKERAGE`, reports_aggregation: `${R}.DISPATCH_BROKERAGE`, client_safe_projection: 'CLIENT_OFFICE.OPERATIONS.BROKERAGE', founder_only: 'internal load financials (margin, carrier pay)', staff_access: 'FULL', note: 'Load financials: staff by brokerage_finance grant.' }),
  own('INSURANCE', 'Insurance', `${W}.INSURANCE`, { home_projection: HN, work_production: `${W}.INSURANCE`, client_safe_projection: 'CLIENT_OFFICE.FINANCES.INSURANCE' }),
  own('FACTORING', 'Factoring', `${W}.FACTORING`, { home_projection: 'AIO_OFFICE.HOME.BLOCKERS', work_production: `${W}.FACTORING`, reports_aggregation: `${R}.DISPATCH_BROKERAGE`, client_safe_projection: 'CLIENT_OFFICE.FINANCES.FACTORING' }),
  own('BOOKKEEPING', 'Bookkeeping', `${W}.BOOKKEEPING`, { home_projection: HN, work_production: `${W}.BOOKKEEPING`, reports_aggregation: `${R}.BOOKKEEPING`, client_safe_projection: 'CLIENT_OFFICE.FINANCES.BOOKKEEPING' }),
  own('DRIVERS', 'Drivers & Carriers', `${W}.DRIVERS_CARRIERS`, { home_projection: HD, work_production: `${W}.DRIVERS_CARRIERS`, client_safe_projection: 'CLIENT_OFFICE.OPERATIONS.DRIVER_MANAGEMENT' }),
  own('MAINTENANCE', 'Mechanic / Maintenance', `${W}.MECHANIC_MAINTENANCE`, { home_projection: HN, work_production: `${W}.MECHANIC_MAINTENANCE`, more_admin: `${M}.MECHANIC_NETWORK`, client_safe_projection: 'CLIENT_OFFICE.OPERATIONS.MAINTENANCE' }),
  own('ROAD_READY', 'Road Ready', `${W}.ROAD_READY`, { home_projection: HN, work_production: `${W}.ROAD_READY`, client_safe_projection: 'CLIENT_OFFICE.OPERATIONS.ROAD_READY', note: 'Client placement follows the engagement state (no engagement state exists yet).' }),
  own('CRM', 'Growth / CRM', `${M}.GROWTH_CRM`, { home_projection: HN, reports_aggregation: `${R}.OVERVIEW`, more_admin: `${M}.GROWTH_CRM`, staff_access: 'BY_GRANT', note: 'Never client-visible.' }),
  own('BILLING', 'Billing', `${M}.BILLING`, { home_projection: HN, reports_aggregation: `${R}.FINANCIAL_REVENUE`, more_admin: `${M}.BILLING`, client_safe_projection: 'CLIENT_OFFICE.FINANCES.FEES_PAYMENTS', founder_only: 'internal financial visibility', staff_access: 'BY_GRANT' }),
  own('DOCUMENTS', 'Documents / Vault', `${M}.DOCUMENTS_VAULT`, { home_projection: HN, more_admin: `${M}.DOCUMENTS_VAULT`, client_safe_projection: 'CLIENT_OFFICE.VAULT' }),
  own('MESSAGING', 'Messaging', `${M}.MESSAGES`, { home_projection: HN, more_admin: `${M}.MESSAGES`, client_safe_projection: 'CLIENT_OFFICE.INBOX.MESSAGES_FROM_AIO' }),
  own('STAFF', 'Team & Staff', `${M}.TEAM_STAFF`, { more_admin: `${M}.TEAM_STAFF`, founder_only: 'staff / permission administration', note: 'FOUNDER is a role; no founder role in code yet.' }),
  own('SERVICE_CATALOG', 'Service Catalog', `${M}.SERVICE_CATALOG`, { more_admin: `${M}.SERVICE_CATALOG`, client_safe_projection: 'CLIENT_OFFICE.SERVICES', founder_only: 'service configuration (activation, pricing)' }),
  own('WORK_ITEMS', 'Office work items & workflows', W, { home_projection: HN, work_production: W, reports_aggregation: `${R}.SERVICES`, note: 'The cross-lane work queue that HOME reads most.' }),
];

/* ════════════════════════════════ 7 · permissions ════════════════════════════════ */

const perm = (scope: string, a: Vis, enforced_by: string, note = ''): PermissionRow => ({ scope, access: a, enforced_by, note });
const NONE_EXT = { CLIENT: 'NONE', SERVICE_PROVIDER: 'NONE' } as const;
const ENFORCED_OFFICE = 'OfficeRouteGuard: backend mode requires an active aio_internal_staff row; demo mode lets everyone in. In-office permissions are resolved client-side from the demo store (role defaults to manager) — not enforced server-side.';
export const AIO_PERMISSIONS: PermissionRow[] = [
  perm('AIO_OFFICE', { FOUNDER: 'FULL', STAFF: 'FULL', ...NONE_EXT }, ENFORCED_OFFICE, 'Clients and providers never enter AIO OFFICE (a provider reaches it only if also internal staff).'),
  perm(H, { FOUNDER: 'FULL', STAFF: 'FULL', ...NONE_EXT }, ENFORCED_OFFICE, 'Money and CRM items within HOME need their grants.'),
  perm('AIO_OFFICE.INTAKE', { FOUNDER: 'FULL', STAFF: 'FULL', ...NONE_EXT }, ENFORCED_OFFICE, 'Founder review, PREBUILT approval and the activation invite are founder acts (staff prepare; they do not inherit).'),
  perm(W, { FOUNDER: 'FULL', STAFF: 'FULL', ...NONE_EXT }, ENFORCED_OFFICE),
  perm(`${W}.BROKERAGE.LOAD_FINANCIALS`, { FOUNDER: 'FULL', STAFF: 'BY_GRANT', ...NONE_EXT }, 'brokerage_finance.read (ROLE_PERMISSIONS); DB view aio_brokerage_load_financials_internal is security_invoker'),
  perm(R, { FOUNDER: 'FULL', STAFF: 'BY_GRANT', ...NONE_EXT }, 'reports.read · management.*.read via ManagementGate (client-side)'),
  perm(`${R}.FINANCIAL_REVENUE`, { FOUNDER: 'FULL', STAFF: 'BY_GRANT', ...NONE_EXT }, 'management.financial.read via ManagementGate (client-side)'),
  perm(M, { FOUNDER: 'FULL', STAFF: 'FULL', ...NONE_EXT }, ENFORCED_OFFICE, 'Entries below carry their own grants.'),
  perm(`${M}.GROWTH_CRM`, { FOUNDER: 'FULL', STAFF: 'BY_GRANT', ...NONE_EXT }, 'crm.* (ROLE_PERMISSIONS) — crm.reports.read is never checked'),
  perm(`${M}.BILLING`, { FOUNDER: 'FULL', STAFF: 'BY_GRANT', ...NONE_EXT }, 'billing.read · billing.manage (Client 360 tab only; /office/billing routes are not gated)'),
  perm(`${M}.TEAM_STAFF`, { FOUNDER: 'FULL', STAFF: 'FULL', ...NONE_EXT }, 'team page ungated; team.manage is never enforced', 'Role / permission administration is a founder act; no role-assignment UI exists.'),
  perm(`${M}.SYSTEM_SETTINGS`, { FOUNDER: 'FULL', STAFF: 'BY_GRANT', ...NONE_EXT }, 'SecurityGate / IntegrationGate / DataGate / QaGate on some pages; canStaffAccessSystemAdmin is unused in production'),
  perm('CLIENT_OFFICE', { FOUNDER: 'NONE', STAFF: 'NONE', CLIENT: 'OWN_RECORDS_ONLY', SERVICE_PROVIDER: 'NONE' }, 'CustomerRouteGuard (authentication only) + ClientPortalLifecycleGuard (only ACTIVE reaches the portal)', 'Staff reach the same client data from AIO OFFICE. A provider can reach /portal because CustomerRouteGuard checks authentication only (gap).'),
  perm('PROVIDER_PORTAL', { FOUNDER: 'NONE', STAFF: 'NONE', CLIENT: 'NONE', SERVICE_PROVIDER: 'OWN_RECORDS_ONLY' }, 'ProviderRouteGuard (fleetcareProviderId); provider pages use a demo provider id and fetch tickets without an ownership check', 'Outside both offices: providers never gain staff visibility.'),
];

/* ════════════════════════════════ 8 · client-safe projections ════════════════════════════════ */

const cs = (staff_node: string, client_node: string, client_sees: string, client_never_sees: string, state: SurfaceState, evidence: string[]): ClientSafeProjection => ({ staff_node, client_node, client_sees, client_never_sees, state, evidence });
export const AIO_CLIENT_SAFE: ClientSafeProjection[] = [
  cs(`${W}.COMPLIANCE`, 'CLIENT_OFFICE.OPERATIONS.COMPLIANCE', 'approved compliance status, renewals and the requests that need the client', 'internal audits, corrective work, compliance cases, staff notes', 'PARTIAL', [`${SRC}/pages/portal/RenewalsPage.tsx:64-96`]),
  cs(`${W}.FILING_FUEL_TAXES.IFTA`, 'CLIENT_OFFICE.OPERATIONS.FILING_IFTA', 'filing status, what is needed from the client, the approval action, filed returns', 'staff worksheet, staff buckets, staff notes, discrepancy resolutions — and staff audit actions (shown today: leak)', 'PARTIAL', [`${SRC}/ifta/ui/iftaViewModel.ts:562-576`, `${SRC}/ifta/ui/IftaClientFilingRoomPage.tsx:216`]),
  cs(`${W}.MECHANIC_MAINTENANCE`, 'CLIENT_OFFICE.OPERATIONS.MAINTENANCE', 'approved vehicle-maintenance status of its own tickets; provider identity once released', 'other clients’ tickets (no org check today: leak), referral fees (DB-readable today: leak)', 'PARTIAL', [`${SRC}/pages/portal/fleetcare/FleetCarePortalPages.tsx:154`, `${SQL}/20260817190000_aio_fleetcare_network.sql:530-535`]),
  cs(`${W}.INSURANCE`, 'CLIENT_OFFICE.FINANCES.INSURANCE', 'policy status, customer-visible notes, certificates', 'internalNotes, operationsNotes, coordinator assignment', 'PARTIAL', [`${SRC}/insurance/insuranceTypes.ts:139-141`]),
  cs(`${W}.DISPATCH`, 'CLIENT_OFFICE.OPERATIONS.DISPATCH', 'its loads, customer notes, customer-visible timeline', 'internal notes; links into /office (present today: leak)', 'PARTIAL', [`${SRC}/pages/portal/dispatch/DispatchLoadDetailPage.tsx:42`, `${SRC}/pages/portal/dispatch/DispatchHomePage.tsx:142`]),
  cs(`${W}.BROKERAGE`, 'CLIENT_OFFICE.OPERATIONS.BROKERAGE', 'carrier: its offers and carrier rate; shipper: quotes and shipment status', 'margin, carrier pay to shippers, internal notes (exposed in the shipper view today: leak), staff audit payloads (shipper-readable today: leak)', 'PARTIAL', [`${SQL}/20260819150000_aio_shipper_rls_bookkeeping_handoff.sql:143`, `${SRC}/brokerage/brokerageRules.ts:13-23`]),
  cs(`${W}.FACTORING`, 'CLIENT_OFFICE.FINANCES.FACTORING', 'its submissions and customer-visible timeline', 'provider / debtor internal notes; links into /office (present today: leak)', 'PARTIAL', [`${SRC}/pages/portal/factoring/FactoringPortalPages.tsx:202`, `${SRC}/pages/portal/factoring/FactoringPortalPages.tsx:107`]),
  cs(`${W}.BOOKKEEPING`, 'CLIENT_OFFICE.FINANCES.BOOKKEEPING', 'subscription status (customerStatusLabel) and delivered reports', 'draft reports (shown today: leak), reviewer notes', 'PARTIAL', [`${SRC}/pages/portal/bookkeeping/BookkeepingPortalPages.tsx:157`]),
  cs(`${W}.DRIVERS_CARRIERS`, 'CLIENT_OFFICE.OPERATIONS.DRIVER_MANAGEMENT', 'applicants per consent and access level', 'application internal notes', 'PARTIAL', [`${SRC}/driverlink/driverlinkTypes.ts:61-66`]),
  cs(`${W}.VEHICLES_FLEET`, 'CLIENT_OFFICE.OPERATIONS.VEHICLE_MANAGEMENT', 'its own vehicles and approved statuses', 'dispatch overlay internals, other clients’ vehicles', 'PARTIAL', [`${SRC}/pages/portal/FleetPage.tsx:11-27`]),
  cs(`${W}.PERMITTING_AUTHORITIES`, 'CLIENT_OFFICE.OPERATIONS.PERMITTING_AUTHORITIES', 'request status, next step, customer notes, timeline', 'internal notes, staff assignment', 'PARTIAL', [`${SRC}/demo/demoTypes.ts:378-403`]),
  cs(`${W}.ROAD_READY`, 'CLIENT_OFFICE.OPERATIONS.ROAD_READY', 'readiness items and progress (placement by engagement state)', 'staff verification notes', 'BLOCKED', [`${SRC}/road-ready/roadReadyTypes.ts:170-193`]),
  cs(`${M}.CLIENTS`, 'CLIENT_OFFICE.MY_BUSINESS', 'its own company record, owners / contacts, vehicles and authorities, scoped to its organisation', 'lifecycle segment, internal client notes, staff assignment, migration confidence, other clients', 'PARTIAL', [`${SRC}/pages/portal/ClientPortalPages.tsx:25-28`]),
  cs(`${M}.SERVICE_CATALOG`, 'CLIENT_OFFICE.SERVICES', 'its active services and services available to it (ACTIVE · AVAILABLE_NOT_ACTIVATED), resolved per client', 'launch-state reasons, staff ownership, internal pricing configuration; today the list comes from a heuristic builder, not the canonical resolver', 'PARTIAL', [`${SRC}/pages/portal/ClientPortalPages.tsx:266-275`]),
  cs(`${M}.BILLING`, 'CLIENT_OFFICE.FINANCES.FEES_PAYMENTS', 'its invoices, payments, receipts, balances', 'margin, commission, profitability, staff-only financial data', 'PARTIAL', [`${SRC}/billing/billingTypes.ts:122-176`]),
  cs(`${M}.DOCUMENTS_VAULT`, 'CLIENT_OFFICE.VAULT', 'customer-visible current and historical documents', 'internal documents (openable by direct link and calendar today; migrated scans customer-readable in the DB: leak)', 'PARTIAL', [`${SRC}/demo/vaultActions.ts:32-34`, `${SRC}/client-migration/server/supabaseApproveMigration.ts:160-170`]),
  cs(`${M}.MESSAGES`, 'CLIENT_OFFICE.INBOX.MESSAGES_FROM_AIO', 'customer-visible messages in its conversations', 'internal notes (filtered in the UI; the DB messages policy does not filter visibility: leak)', 'PARTIAL', [`${SRC}/communications/communicationEngine.ts:10-12`, `${SQL}/20260815110000_aio_business_data_rls.sql:363-368`]),
  cs('AIO_OFFICE.INTAKE', 'CLIENT_OFFICE.ACTIVATION', 'what AIO already knows about it, to review and confirm', 'extraction confidence, matching, founder review, staff notes', 'PARTIAL', [`${SRC}/auth/guards/ClientPortalLifecycleGuard.tsx:22-40`]),
  cs('AIO_OFFICE.HOME.RECENT_ACTIVITY', 'CLIENT_OFFICE.INBOX.ACTIVITY_UPDATES', 'customer-visible activity for its own organisation', 'internal activity (shown today when the event carries the client id: leak)', 'PARTIAL', [`${SRC}/portal/clientCommandCenterService.ts:715-718`]),
];

/* ════════════════════════════════ 9 · responsive priorities ════════════════════════════════ */

export const AIO_RESPONSIVE: ResponsivePriority[] = [
  { root_id: H, rule: 'Attention, deadlines, the work summary, clients in motion and recent activity survive first on mobile; tablet adds blockers and quick actions; desktop adds the optional Business Pulse as parallel context.', order: {
    MOBILE: [`${H}.NEEDS_ATTENTION`, `${H}.DEADLINES`, `${H}.WORK_ACROSS_AIO`, `${H}.CLIENTS_IN_MOTION`, `${H}.RECENT_ACTIVITY`],
    TABLET: [`${H}.NEEDS_ATTENTION`, `${H}.DEADLINES`, `${H}.BLOCKERS`, `${H}.WORK_ACROSS_AIO`, `${H}.CLIENTS_IN_MOTION`, `${H}.RECENT_ACTIVITY`, `${H}.QUICK_ACTIONS`],
    DESKTOP: [`${H}.NEEDS_ATTENTION`, `${H}.DEADLINES`, `${H}.BLOCKERS`, `${H}.WORK_ACROSS_AIO`, `${H}.CLIENTS_IN_MOTION`, `${H}.RECENT_ACTIVITY`, `${H}.QUICK_ACTIONS`, `${H}.BUSINESS_PULSE`],
  } },
  { root_id: W, rule: 'Service switching first, then what needs attention and the active work of the open lane, then the case. Desktop adds the full lane shell, the cross-client queue and related work side by side.', order: {
    MOBILE: ['WORK.LANE_SWITCHER', LS('NEEDS_ATTENTION'), LS('ACTIVE_WORK'), 'WORK.CASE_DETAIL'],
    TABLET: ['WORK.LANE_SWITCHER', LS('NEEDS_ATTENTION'), LS('ACTIVE_WORK'), LS('DUE_SOON'), LS('BLOCKED'), 'WORK.CASE_DETAIL', 'WORK.MY_WORK'],
    DESKTOP: ['WORK.LANE_SWITCHER', LS('SERVICE_OVERVIEW'), LS('NEEDS_ATTENTION'), LS('ACTIVE_WORK'), LS('DUE_SOON'), LS('BLOCKED'), LS('RECENTLY_COMPLETED'), 'WORK.CROSS_CLIENT_QUEUE', 'WORK.CASE_DETAIL', 'WORK.RELATED_WORK', 'WORK.MY_WORK'],
  } },
  { root_id: R, rule: 'Key summary first, then period control, the high-priority reports (Financial / Revenue by grant, Services) and drilldown. Desktop adds every domain and export.', order: {
    MOBILE: [`${R}.OVERVIEW`, 'REPORTS.SET_PERIOD', `${R}.FINANCIAL_REVENUE`, `${R}.SERVICES`, 'REPORTS.DRILL_DOWN'],
    TABLET: [`${R}.OVERVIEW`, 'REPORTS.SET_PERIOD', `${R}.FINANCIAL_REVENUE`, `${R}.SERVICES`, `${R}.CLIENTS`, `${R}.MIGRATION`, 'REPORTS.DRILL_DOWN'],
    DESKTOP: [`${R}.OVERVIEW`, 'REPORTS.SET_PERIOD', `${R}.FINANCIAL_REVENUE`, `${R}.SERVICES`, `${R}.CLIENTS`, `${R}.MIGRATION`, `${R}.COMPLIANCE`, `${R}.DISPATCH_BROKERAGE`, `${R}.FILING_HISTORY`, `${R}.BOOKKEEPING`, 'REPORTS.DRILL_DOWN', `${R}.EXPORTS`],
  } },
  { root_id: M, rule: 'A clear directory first, search where useful, and only the entries the actor’s role can use (role-aware). Desktop shows the directory and search side by side.', order: {
    MOBILE: ['MORE.DIRECTORY', 'MORE.SEARCH', 'MORE.OPEN_ENTRY'],
    TABLET: ['MORE.DIRECTORY', 'MORE.SEARCH', 'MORE.OPEN_ENTRY'],
    DESKTOP: ['MORE.DIRECTORY', 'MORE.SEARCH', 'MORE.OPEN_ENTRY'],
  } },
];

/* ════════════════════════════════ vocabularies (mapped, never new models) ════════════════════════════════ */

const vm = (term: string, existing: string[], status: VocabularyMapping['status'], note = ''): VocabularyMapping => ({ term, existing, status, note });
export const AIO_HOME_BLOCKER_GROUPS: VocabularyMapping[] = [
  vm('WAITING_ON_CLIENT', ['OfficeWaitingOn customer', 'OfficeWorkStatus waiting_on_customer', 'IFTA AWAITING_CLIENT', 'RequestStatus information_needed', 'RenewalStatus customer_action_needed', 'workflow waiting_on_customer', 'InsuranceIssue waiting_on_customer'], 'MAPPED'),
  vm('WAITING_ON_STAFF', ['OfficeWaitingOn all_in_one', 'OfficeWorkStatus waiting_internal', 'conversation waiting_on_staff', 'workflow waiting_internal'], 'MAPPED', 'workflow waiting_internal is not surfaced today.'),
  vm('WAITING_ON_PROVIDER', ['OfficeWaitingOn external_provider · insurance_partner · factoring_provider · carrier · shipper', 'InsuranceIssue waiting_on_partner', 'workflow waiting_external', 'FleetCare awaiting_parts'], 'MAPPED'),
  vm('MISSING_DOCUMENT', ['RequestStatus documents_needed', 'RenewalStatus documents_needed', 'LoadOperationalStatus pod_needed', 'BillingPackageStatus missing_documents', 'RateConfirmationStatus missing', 'DriverLink documents_needed'], 'MAPPED'),
  vm('FAILED_VALIDATION', ['MigrationExceptionCode UNREADABLE_DOCUMENT · EXTRACTION_FAILED · AMBIGUOUS_CLIENT_MATCH', 'MigrationFileQueueState FAILED · UNSUPPORTED · DUPLICATE', 'IFTA discrepancy OPEN'], 'PARTIAL', 'No general validation-failure state outside migration and IFTA.'),
  vm('APPROVAL_REQUIRED', ['OfficeWorkStatus ready_for_review', 'workflow ready_for_review', 'IFTA AWAITING_APPROVAL · NEEDS_REVIEW', 'ClientReviewState REQUIRED'], 'MAPPED'),
  vm('PAYMENT_REQUIRED', ['InvoiceStatus past_due', 'BillingStatus payment_failed', 'PaymentStatus failed', 'IFTA PAYMENT_PENDING'], 'MAPPED'),
  vm('EXTERNAL_DEPENDENCY', ['OfficeWaitingOn government', 'RequestStatus awaiting_agency', 'RenewalStatus awaiting_external_action', 'OfficeWorkStatus waiting_externally'], 'MAPPED'),
  vm('SYSTEM_ERROR', ['FreightException', 'workflow failed', 'MigrationExceptionCode PROCESSING_FAILED · PROVIDER_UNAVAILABLE', 'management automation-failed'], 'PARTIAL', 'workflow failed is not surfaced today.'),
];
export const AIO_HOME_EVENT_VERBS: VocabularyMapping[] = [
  vm('CREATED', ['REQUEST_CREATED', 'TASK_CREATED', 'QUOTE_CREATED', 'INVOICE_CREATED', 'LOAD_CREATED', 'RENEWAL_CREATED', 'INSURANCE_POLICY_CREATED', 'FACTORING_SUBMISSION_CREATED', 'MIGRATION_BATCH_CREATED (lifecycle)'], 'MAPPED'),
  vm('UPDATED', ['REQUEST_STATUS_CHANGED', 'LOAD_STATUS_CHANGED', 'INSURANCE_POLICY_UPDATED', 'FACTORING_PROFILE_UPDATED', 'ROAD_READY_UPDATED', 'TRUCK_AVAILABILITY_CHANGED'], 'MAPPED'),
  vm('APPROVED', ['IFTA_CLIENT_APPROVED', 'QUOTE_ACCEPTED', 'FACTORING_APPROVED', 'MIGRATION_APPROVED (lifecycle)', 'CLIENT_CONFIRMED (lifecycle)'], 'MAPPED'),
  vm('REVISED', ['QUOTE_REVISED', 'LOAD_RATE_REVISED', 'IFTA_CORRECTION_REQUESTED'], 'MAPPED'),
  vm('SUBMITTED', ['IFTA_QUARTER_SUBMITTED', 'INSURANCE_REQUEST_SUBMITTED', 'FACTORING_SUBMITTED', 'SHIPMENT_REQUEST_SUBMITTED'], 'MAPPED'),
  vm('FILED', ['IFTA_RETURN_FILED'], 'MAPPED'),
  vm('ACTIVATED', ['DISPATCH_ENROLLMENT_ACTIVATED', 'CLIENT_ACTIVATED (lifecycle)'], 'MAPPED'),
  vm('PAUSED', [], 'NOT_IN_SOURCE', 'No pause event; lifecycle PAUSED is a state without an emitted event.'),
  vm('COMPLETED', ['TASK_COMPLETED', 'LOAD_COMPLETED', 'RENEWAL_COMPLETED', 'FACTORING_PACKAGE_COMPLETED'], 'MAPPED'),
  vm('DOCUMENT_RECEIVED', ['DOCUMENT_RECEIVED', 'DOCUMENT_UPLOADED', 'LOAD_DOCUMENT_UPLOADED', 'BROKERAGE_POD_RECEIVED'], 'MAPPED'),
  vm('PAYMENT_RECEIVED', ['PAYMENT_SUCCEEDED', 'IFTA_PAYMENT_RECORDED', 'FACTORING_FUNDING_REPORTED'], 'MAPPED'),
  vm('ASSIGNED', ['REQUEST_ASSIGNED'], 'PARTIAL', 'Only service requests emit an assignment event.'),
  vm('BLOCKED', ['BROKERAGE_LOAD_NEEDS_COVERAGE', 'FACTORING_ISSUE_CREATED'], 'PARTIAL', 'No general blocked event.'),
  vm('RESOLVED', ['IFTA_ITEMS_RESOLVED', 'FACTORING_ISSUE_RESOLVED'], 'PARTIAL'),
];

/* ════════════════════════════════ 10 · implementation gaps ════════════════════════════════ */

const gap = (gap_id: string, root: string, kind: ImplementationGap['kind'], origin: ImplementationGap['origin'], g: string, evidence: string[], blocks: string): ImplementationGap => ({ gap_id, root, gap: g, kind, origin, evidence, blocks });
export const AIO_IMPLEMENTATION_GAPS: ImplementationGap[] = [
  // the three known gaps (founder record)
  gap('G-ROAD-READY-NO-ENGAGEMENT-STATE', W, 'MISSING_STATE', 'DECISION', 'No per-client Road Ready engagement state (AVAILABLE · ACTIVE · COMPLETED). Only item statuses and profile mode exist; OfficeWorkspaceEntitlement does not provision road_ready.', [`${SRC}/road-ready/roadReadyTypes.ts:37-42`, `${SRC}/client-migration/types.ts:49-54`], 'D-ROAD-READY-PLACEMENT; WORK → ROAD READY recently completed'),
  gap('G-FOUNDER-ROLE-NOT-IMPLEMENTED', 'AIO_OFFICE', 'MISSING_ROLE', 'DECISION', 'No FOUNDER role in code. Nearest: OfficeStaffRole owner (demo-store role) and Supabase aio_internal_role super_admin; the two role sets do not map to each other.', [`${SRC}/office-core/officeWorkTypes.ts:4-16`, `${SQL}/20260815100000_aio_identity_foundation.sql:28-29`], 'every founder-only act and grant-only view'),
  gap('G-VEHICLES-NO-STAFF-SCREEN', W, 'MISSING_SURFACE', 'DECISION', 'No staff VEHICLES & FLEET screen or route; Client 360 fleet tab is placeholder text.', [`${SRC}/office/pages/ClientDetailPage.tsx:184-186`], 'WORK → VEHICLES & FLEET shell'),
  // permission / enforcement
  gap('G-PERMISSIONS-CLIENT-SIDE', 'AIO_OFFICE', 'MISSING_ROLE', 'AUDIT', 'Office permissions resolve from the demo store (role defaults to manager); Supabase internal roles never reach them; RLS treats every internal user the same.', [`${SRC}/office-core/officeContext.ts:171-177`, `${SRC}/auth/guards/RouteGuards.tsx:69-92`], 'BY_GRANT views, founder-only acts, staff never inheriting founder authority'),
  gap('G-PERMISSIONS-UNCHECKED', 'AIO_OFFICE', 'MISSING_CONTRACT', 'AUDIT', 'Defined but never enforced: team.manage, clients.manage, escalations.manage, internal_notes.read, reports.export (pages), crm.reports.read; “+ New” quick actions check nothing.', [`${SRC}/office-core/officeWorkTypes.ts:251-348`, `${SRC}/office/layouts/AIOOfficeLayout.tsx:242-252`], 'role-aware HOME quick actions, MORE directory'),
  gap('G-FOUNDER-ACTS-STAFF-GATED', 'AIO_OFFICE', 'MISSING_ROLE', 'AUDIT', 'Acts the founder contract reserves are gated today by “any internal staff” or not at all: the migration approve-batch API admits any active aio_internal_staff row; pricing settings and the Service Activation Center check no permission (pricing.manage appears only in a page note).', ['api/aio/client-migration/approve-batch.ts:38-45', `${SRC}/office/pages/BillingPages.tsx:252`, `${SRC}/office/pages/LaunchPages.tsx:157-169`], 'founder review, PREBUILT approval, service configuration'),
  // HOME feeds
  gap('G-HOME-FEEDS-MISSING', H, 'MISSING_CONTRACT', 'AUDIT', 'The office attention engine has no IFTA, migration, dispatch/brokerage exception, deadline, credential, maintenance, Road Ready, reconciliation or failed-payment candidates.', [ATT('78')], 'HOME → NEEDS ATTENTION / BLOCKERS'),
  gap('G-DEADLINE-SEVERITY-STALE', H, 'MISSING_CONTRACT', 'AUDIT', 'Deadline.severity is set once and never recalculated; the Deadlines page shows it; expiration evaluation discards its deadline updates.', [`${SRC}/demo/demoTypes.ts:408-426`, `${SRC}/notifications/notificationScheduler.ts:53`], 'HOME → DEADLINES due state'),
  gap('G-INSURANCE-EXPIRED-DROPPED', H, 'MISSING_CONTRACT', 'AUDIT', 'Expired insurance policies (days < 0) are excluded from attention.', [ATT('111')], 'HOME → NEEDS ATTENTION'),
  gap('G-ACTIVITY-STAFF-FEED', H, 'MISSING_CONTRACT', 'AUDIT', 'The office activity feed shows internal events only, hiding customer-visible production events from staff.', [`${SRC}/office/pages/OfficeWorkPages.tsx:424-436`], 'HOME → RECENT ACTIVITY'),
  gap('G-SEGMENT-VOCABULARIES', H, 'MISSING_CONTRACT', 'AUDIT', 'Two founder-segment vocabularies disagree (founderSegmentForLifecycle unused vs filterClientsByFounderSegment).', [`${SRC}/client-migration/lifecycle.ts:54-77`, `${SRC}/client-migration/activeClientMetrics.ts:11-31`], 'HOME → CLIENTS IN MOTION'),
  gap('G-ACTIVE-SERVICES-HEURISTIC', H, 'MISSING_CONTRACT', 'IA', 'Active services come from heuristic builders that disagree; the canonical workspace resolver is not wired.', [`${SRC}/office-core/client360Service.ts:52-71`, `${SRC}/portal/clientCommandCenterService.ts:524-576`], 'CLIENTS IN MOTION, client SERVICES, REPORTS service mix'),
  gap('G-QUICK-ACTION-TARGETS', H, 'MISSING_ROUTE', 'AUDIT', 'No generic create-case or staff upload-document surface; “+ New → Service Request” routes to the public /get-started; “Internal Task” writes store.tasks, not office work items.', [`${SRC}/office/layouts/AIOOfficeLayout.tsx:248-251`], 'HOME → QUICK ACTIONS'),
  // WORK lanes
  gap('G-WORK-LANE-NAV', W, 'MISSING_ROUTE', 'IA', 'No WORK lane switcher or /office/work/:lane route; lanes live in separate sidebar groups.', [`${SRC}/office/layouts/AIOOfficeLayout.tsx:13-118`], 'WORK lane navigation'),
  gap('G-OFFICE-DEMO-ONLY', W, 'DEMO_ONLY', 'AUDIT', 'Office pages read and write the browser-local demo store; Supabase is queried only for client request creation, freight / shipper / autopilot, pretrip and migration approve.', [`${SRC}/demo/demoStore.ts:19`], 'every production claim'),
  gap('G-PERMITTING-CASE-MODEL', W, 'MISSING_TABLE_OR_SERVICE', 'IA', 'No permit / authority / tag / BOC-3 / formation case model — generic service requests only.', [`${SRC}/office/pages/DivisionOpsPages.tsx:14-31`], 'PERMITTING & AUTHORITIES sections'),
  gap('G-REQUEST-STATUS-CAST', W, 'MISSING_CONTRACT', 'AUDIT', 'Workflow step ids are cast into RequestStatus, so stored statuses fall outside the type.', [`${SRC}/demo/demoActions.ts:133`, `${SRC}/demo/demoActions.ts:188`], 'status-based shell sections'),
  gap('G-IFTA-NO-TABLES', W, 'MISSING_TABLE_OR_SERVICE', 'IA', 'IFTA has no Supabase tables (demo store only).', [`${SRC}/demo/demoTypes.ts:584`], 'production IFTA'),
  gap('G-IFTA-VEHICLE-COPIES', W, 'MISSING_CONTRACT', 'AUDIT', 'IFTA quarters embed their own vehicle copies (IftaVehicle), carried forward from the prior quarter rather than read from the fleet record.', [`${SRC}/ifta/iftaTypes.ts:57-65`, `${SRC}/ifta/iftaActions.ts:614-619`], 'VEHICLES & FLEET single source of truth'),
  gap('G-IFTA-NOTES-HARDCODED', W, 'MISSING_TABLE_OR_SERVICE', 'AUDIT', 'The IFTA staff NOTES tab renders a hard-coded note; no staff-notes model.', [`${SRC}/ifta/ui/IftaStaffCasePage.tsx:395-399`], 'IFTA staff notes'),
  gap('G-FILING-HISTORY', W, 'MISSING_SURFACE', 'IA', 'No cross-quarter filing history view (data exists in quarter states).', [`${SRC}/ifta/iftaDerive.ts:64`], 'FILING HISTORY section, REPORTS → FILING HISTORY'),
  gap('G-COMPLIANCE-CASE-MODEL', W, 'MISSING_TABLE_OR_SERVICE', 'IA', 'No compliance case / audit / corrective-action model.', [`${SRC}/services/catalog/serviceCatalog.ts:709-743`], 'COMPLIANCE active work, REPORTS → COMPLIANCE open items'),
  gap('G-DEADLINES-UNQUERIED', W, 'MISSING_TABLE_OR_SERVICE', 'AUDIT', 'Supabase aio_deadlines exists but is never queried; there is no renewals table.', [`${SQL}/20260815110000_aio_business_data_rls.sql:97`], 'production deadlines'),
  gap('G-VEHICLES-THREE-STORES', W, 'MISSING_CONTRACT', 'AUDIT', 'Three vehicle stores: demo PowerUnit (the anchor most references use), Supabase aio_fleet_vehicles (unread), IFTA embedded copies; TruckDispatchProfile is an overlay. The lane must anchor on one record and project the rest.', [`${SRC}/road-ready/roadReadyTypes.ts:113-139`, `${SQL}/20260817190000_aio_fleetcare_network.sql:86-101`], 'VEHICLES & FLEET'),
  gap('G-VEHICLES-NO-REGISTRATION-FIELD', W, 'MISSING_CONTRACT', 'AUDIT', 'No vehicle record holds a registration expiry; it is derived from vault documents.', [`${SRC}/vault/vaultTypes.ts:93-106`], 'registration state the lane owns'),
  gap('G-VEHICLES-STALE-TABLE-NAME', W, 'MISSING_CONTRACT', 'AUDIT', 'persistenceInventory names a canonical aio_vehicles table that does not exist.', [`${SRC}/data/persistenceInventory.ts:109`], 'persistence planning'),
  gap('G-DISPATCH-MY-LOADS', W, 'MISSING_SURFACE', 'IA', 'No dispatcher-assigned view in the office.', [`${SRC}/dispatch/dispatchTypes.ts:247`], 'MY LOADS / MY TRUCKS'),
  gap('G-DISPATCH-ENROLLMENT-UI', W, 'MISSING_SURFACE', 'IA', 'activateDispatchEnrollment has no UI.', [`${SRC}/demo/dispatchActions.ts:142`], 'dispatch onboarding'),
  gap('G-BROKERAGE-PAUSED', W, 'DEFERRED', 'IA', 'The brokerage business line is PAUSED (a business decision, not a defect); its lane contract stands for when it resumes.', [`${SRC}/infrastructure/serviceActivation.ts:29`], 'brokerage production'),
  gap('G-INSURANCE-TABLES-UNQUERIED', W, 'MISSING_TABLE_OR_SERVICE', 'IA', 'Supabase insurance tables exist but are not queried.', [`${SQL}/20260815160000_aio_rls_extensions.sql:5-20`], 'production insurance'),
  gap('G-FACTORING-NO-PROVIDER', W, 'MISSING_TABLE_OR_SERVICE', 'IA', 'No factoring provider integration; aio_factoring_cases unqueried.', [`${SRC}/demo/factoringActions.ts:67-308`], 'production factoring'),
  gap('G-FACTORING-TWO-MODELS', W, 'MISSING_CONTRACT', 'AUDIT', 'A second factoring model backs portal components and mocks.', [`${SRC}/services/factoring/factoringTypes.ts`], 'one factoring source of truth'),
  gap('G-BOOKKEEPING-SEED-ONLY', W, 'MISSING_TABLE_OR_SERVICE', 'AUDIT', 'Bookkeeping cycles, reports, autopilot periods and exceptions exist as models but are seeded only: the bookkeeping and autopilot actions read them and nothing writes them (only subscriptions have a writer). RECONCILIATION and DELIVERABLES stay NOT STARTED.', [`${SRC}/demo/demoSeed.ts:396-397`, `${SRC}/demo/bookkeepingActions.ts:19-32`, `${SRC}/demo/autopilotActions.ts:7-63`], 'BOOKKEEPING lane, REPORTS → BOOKKEEPING'),
  gap('G-DRIVERS-READ-ONLY', W, 'MISSING_SURFACE', 'IA', 'Staff DriverLink views are read-only; credential review and approvals not started.', [`${SRC}/pages/office/DriverLinkOfficePages.tsx:7-76`], 'CREDENTIALS, APPROVALS'),
  gap('G-FLEETCARE-READ-ONLY', W, 'MISSING_SURFACE', 'IA', 'Staff FleetCare views are read-only; ~22 FleetCare tables unqueried.', [`${SRC}/pages/office/FleetCareOfficePages.tsx:7-122`], 'MECHANIC / MAINTENANCE production'),
  gap('G-ROAD-READY-TABLES-UNQUERIED', W, 'MISSING_TABLE_OR_SERVICE', 'IA', 'aio_road_ready_* tables exist but are not queried.', [`${SQL}/20260815120000_aio_identity_roles_contacts.sql:110-134`], 'production Road Ready'),
  // REPORTS
  gap('G-REPORTS-DEMO-METRICS', R, 'DEMO_ONLY', 'AUDIT', 'Every management metric is computed from the demo store; none is production-backed, so none qualifies for production Business Pulse.', [QL('1-16')], 'REPORTS in production, HOME Business Pulse'),
  gap('G-REPORTS-DERIVATION-DEFECTS', R, 'MISSING_CONTRACT', 'AUDIT', 'Derivation defects: invoice-date label vs payment-date basis; funnel counts lost leads as qualified / contacted and ignores the shipper pipeline; brokerage completed loads not date-filtered; factoring “service fees” sums provider-reported fees; “service fees” on the billing dashboard includes draft and void invoices.', [`${SRC}/office/pages/ManagementPages.tsx:176`, QL('114-133'), QL('166'), QL('196'), `${SRC}/office/pages/BillingPages.tsx:37`], 'REPORTS metric correctness'),
  gap('G-REPORTS-EXPORTS', R, 'MISSING_SURFACE', 'IA', 'No PDF / period / client / service exports; saved reports are write-only; reports.export is not checked; the IFTA CSV lacks a formula-injection guard.', [`${SRC}/office/pages/ManagementPages.tsx:647`, `${SRC}/ifta/ui/IftaStaffCasePage.tsx:116-136`], 'REPORTS → EXPORTS'),
  // MORE
  gap('G-MORE-DIRECTORY', M, 'MISSING_SURFACE', 'IA', 'The MORE directory surface does not exist; entries are separate routes.', [`${SRC}/client-migration/visual/AioMigrationKit.tsx:249`], 'MORE'),
  gap('G-STAFF-ACCOUNT', M, 'MISSING_SURFACE', 'IA', 'No staff account / profile page.', [`${SRC}/office/layouts/AIOOfficeLayout.tsx:180-188`], 'MORE → ACCOUNT'),
  gap('G-ROLE-ASSIGNMENT-UI', M, 'MISSING_SURFACE', 'AUDIT', 'No role-assignment UI; setOfficeStaffRole and revokeStaffPermission have no page callers.', [`${SRC}/office-core/officeContext.ts:214`], 'TEAM & STAFF administration'),
  gap('G-PRICING-FICTIONAL', M, 'DEMO_ONLY', 'AUDIT', 'Service pricing is fictional demo data.', [`${SRC}/billing/servicePricingConfig.ts:4-5`], 'SERVICE CATALOG pricing'),
  gap('G-BILLING-UNQUERIED', M, 'MISSING_TABLE_OR_SERVICE', 'AUDIT', 'Billing and CRM Supabase tables exist but are not queried.', [`${SQL}/20260815130000_aio_crm_workflow_billing.sql:84-116`], 'production BILLING / CRM'),
  gap('G-CRM-FOLLOWUP-STATUS', M, 'MISSING_CONTRACT', 'AUDIT', 'CRM follow-up statuses never advance to due / overdue; referrals have no UI.', [`${SRC}/demo/crmActions.ts:523-548`], 'HOME CRM projection'),
  // privacy (live)
  gap('P-PORTAL-VIEWS-CROSS-ORG', 'CLIENT_OFFICE', 'PRIVACY', 'AUDIT', 'aio_portal_service_request_view and aio_portal_invoice_view select every organisation’s rows, are not security_invoker, and anon has SELECT on all tables — as written, they expose cross-org request and invoice data. aio_management_service_ops_view has the same shape.', [`${SQL}/20260815160000_aio_rls_extensions.sql:85-106`, `${SQL}/20260815170000_aio_indexes_views.sql:17-20`, `${SQL}/20260827001621_aio_api_role_grants.sql:12`], 'any client-safe projection over these views'),
  gap('P-SHIPPER-VIEW-INTERNAL-NOTES', 'CLIENT_OFFICE', 'PRIVACY', 'AUDIT', 'The shipper-safe view aio_shipper_freight_shipments exposes internal_notes, and shippers can read every column of their aio_dispatch_loads rows.', [`${SQL}/20260819150000_aio_shipper_rls_bookkeeping_handoff.sql:143`, `${SQL}/20260819150000_aio_shipper_rls_bookkeeping_handoff.sql:243-246`], 'brokerage client-safe projection'),
  gap('P-SHIPPER-READS-AUDIT', 'CLIENT_OFFICE', 'PRIVACY', 'AUDIT', 'Shippers can read staff brokerage audit rows including note and payload (target carrier rate).', [`${SQL}/20260819150000_aio_shipper_rls_bookkeeping_handoff.sql:212-223`, `${SRC}/brokerage/brokerageWorkflow.ts:271-274`], 'brokerage client-safe projection'),
  gap('P-CLIENT-LIFECYCLE-SELF-UPDATE', 'CLIENT_OFFICE', 'PRIVACY', 'AUDIT', 'Organisation owners / admins may UPDATE their own organisation row with no column restriction, and client_lifecycle lives on that row — a client could set itself ACTIVE, bypassing activation.', [`${SQL}/20260815100000_aio_identity_foundation.sql:212-220`, `${SQL}/20261006210000_aio_client_migration_activation.sql:5`], 'PREBUILT ≠ ACTIVE; client confirmation as the gate'),
  gap('P-DOCUMENTS-INTERNAL-EXPOSED', 'CLIENT_OFFICE', 'PRIVACY', 'AUDIT', 'Internal documents open by direct link and via the calendar (no visibility check); migration-approve inserts set visibility_scope internal but leave visibility = customer, so migrated scans are customer-readable under RLS.', [`${SRC}/demo/vaultActions.ts:32-34`, `${SRC}/demo/vaultActions.ts:41`, `${SRC}/client-migration/server/supabaseApproveMigration.ts:160-170`, `${SQL}/20260815110000_aio_business_data_rls.sql:118`, `${SQL}/20260815110000_aio_business_data_rls.sql:341-344`], 'VAULT client-safe projection'),
  gap('P-ACTIVITY-INTERNAL-TO-CLIENT', 'CLIENT_OFFICE', 'PRIVACY', 'AUDIT', 'Client activity shows internal events whenever the event carries the client id (titles such as staff assignments, internal notes, CRM conversion).', [`${SRC}/portal/clientCommandCenterService.ts:715-718`], 'client activity, HUB'),
  gap('P-MESSAGES-RLS-VISIBILITY', 'CLIENT_OFFICE', 'PRIVACY', 'AUDIT', 'The aio_messages RLS policy does not filter on visibility (internal notes would be client-readable once messages are stored in Supabase).', [`${SQL}/20260815110000_aio_business_data_rls.sql:363-368`], 'INBOX client-safe projection'),
  gap('P-FLEETCARE-TICKET-NO-ORG-CHECK', 'CLIENT_OFFICE', 'PRIVACY', 'AUDIT', 'The client FleetCare ticket detail and vehicle history pages have no organisation check.', [`${SRC}/pages/portal/fleetcare/FleetCarePortalPages.tsx:154`], 'MAINTENANCE client-safe projection'),
  gap('P-FLEETCARE-REFERRAL-FEES-CLIENT', 'CLIENT_OFFICE', 'PRIVACY', 'AUDIT', 'Client organisations can read FleetCare referral transactions including AIO’s fee amounts.', [`${SQL}/20260817190000_aio_fleetcare_network.sql:530-535`, `${SQL}/20260817190000_aio_fleetcare_network.sql:410-417`], 'MAINTENANCE client-safe projection'),
  gap('P-IFTA-CLIENT-AUDIT-ACTIONS', 'CLIENT_OFFICE', 'PRIVACY', 'AUDIT', 'The IFTA client filing room lists every audit action, including staff actions and names.', [`${SRC}/ifta/ui/iftaViewModel.ts:562-576`], 'IFTA client-safe projection'),
  gap('P-CLIENT-LINKS-TO-OFFICE', 'CLIENT_OFFICE', 'PRIVACY', 'IA', 'Client dispatch and factoring pages link to /office/messages (in demo mode the office guard lets anyone in).', [`${SRC}/pages/portal/dispatch/DispatchHomePage.tsx:142`, `${SRC}/pages/portal/factoring/FactoringPortalPages.tsx:107`], 'staff / client firewall'),
  gap('P-BOOKKEEPING-DRAFT-REPORTS', 'CLIENT_OFFICE', 'PRIVACY', 'AUDIT', 'Client bookkeeping pages show draft reports (no status filter).', [`${SRC}/pages/portal/bookkeeping/BookkeepingPortalPages.tsx:157`], 'BOOKKEEPING client-safe projection'),
];

/* ════════════════════════════════ 6b · data-source matrix ════════════════════════════════ */

const ds = (subject_id: string, root: string, d: Omit<DataSourceRow, 'subject_id' | 'root' | 'visibility'> & { visibility?: Vis }): DataSourceRow => ({ subject_id, root, visibility: V_STAFF, ...d });
const fromRegion = (root: string, r: RegionContract, write_owner: string, missing: Partial<Pick<DataSourceRow, 'missing_contracts' | 'missing_tables_services' | 'missing_routes'>> = {}): DataSourceRow => ds(r.region_id, root, {
  data_source: r.sources.map((s) => s.data_source).join(' · ') || 'none',
  backing: r.sources.some((s) => s.backing === 'PRODUCTION') ? 'PRODUCTION' : r.sources.some((s) => s.backing === 'DEMO_STORE') ? 'DEMO_STORE' : 'NONE',
  state: r.state, write_owner, readers: [r.region_id],
  missing_contracts: missing.missing_contracts ?? [], missing_tables_services: missing.missing_tables_services ?? [], missing_routes: missing.missing_routes ?? [],
  evidence: [...new Set(r.sources.flatMap((s) => s.evidence))].slice(0, 6),
  visibility: r.sources.some((s) => s.visibility.STAFF === 'BY_GRANT') && r.sources.every((s) => s.visibility.STAFF === 'BY_GRANT') ? V_GRANT : V_STAFF,
});

const GAP_BY_ID = new Map(AIO_IMPLEMENTATION_GAPS.map((g) => [g.gap_id, g]));
/** A lane's gaps of the given kinds, as "id — gap" lines (the matrix names the dependency, not a guess). */
const laneGaps = (l: LaneContract, kinds: ImplementationGap['kind'][]) => l.gaps.flatMap((id) => GAP_BY_ID.get(id) ?? []).filter((g) => kinds.includes(g.kind)).map((g) => g.gap_id);

export const AIO_DATA_SOURCES: DataSourceRow[] = [
  fromRegion(H, needsAttention, 'each owning lane / INTAKE / MORE entry (HOME writes nothing)', { missing_contracts: ['attention candidates for IFTA, migration, freight / brokerage exceptions, deadlines, credentials, maintenance, Road Ready, reconciliation, failed payments'], missing_tables_services: ['compliance case model'] }),
  fromRegion(H, deadlines, 'Deadline writers (vault / Road Ready sync), renewals, each lane', { missing_contracts: ['read-time due state (stored severity is stale)', 'IFTA / credentials / request target dates / bookkeeping cycles into one deadline feed'], missing_tables_services: ['aio_deadlines unqueried; no renewals table'] }),
  fromRegion(H, blockers, 'each owning lane', { missing_contracts: ['blocker-group mapping implemented over existing literals (AIO_HOME_BLOCKER_GROUPS)'] }),
  fromRegion(H, workAcrossAio, 'each WORK lane', { missing_contracts: ['a per-lane summary read model'], missing_routes: ['/office/work/:lane'] }),
  fromRegion(H, clientsInMotion, 'INTAKE (lifecycle) · each lane (activity, deadlines)', { missing_contracts: ['one founder-segment vocabulary', 'canonical active-services resolver'] }),
  fromRegion(H, recentActivity, 'each owning domain via logActivity / emitActivity', { missing_contracts: ['staff feed including customer-visible events'], missing_tables_services: ['aio_activity_events / aio_client_lifecycle_events are insert-only'] }),
  fromRegion(H, quickActionsRegion, 'none (routes only)', { missing_contracts: ['permission checks on quick actions'], missing_routes: ['create case', 'staff document upload'] }),
  fromRegion(H, businessPulse, 'REPORTS metric sources', { missing_contracts: ['production-backed metrics'] }),
  ...AIO_WORK_LANES.map((l) => ds(l.lane_id, W, {
    data_source: l.records.map((r) => r.record).join(' · '),
    backing: l.shell.SERVICE_OVERVIEW.state === 'NOT_IMPLEMENTED' ? 'NONE' : 'DEMO_STORE',
    state: l.shell.SERVICE_OVERVIEW.state, write_owner: l.lane_id,
    readers: [`${H}.WORK_ACROSS_AIO`, R, ...l.related.map((x) => x.node_id)].slice(0, 6),
    missing_contracts: laneGaps(l, ['MISSING_STATE', 'MISSING_CONTRACT', 'MISSING_ROLE', 'PRIVACY', 'DEMO_ONLY', 'DEFERRED']),
    missing_tables_services: laneGaps(l, ['MISSING_TABLE_OR_SERVICE']),
    missing_routes: laneGaps(l, ['MISSING_SURFACE', 'MISSING_ROUTE']),
    evidence: l.records.map((r) => r.evidence),
  })),
  ...REPORTS_CONTRACT.regions.map((r) => ds(r.region_id, R, {
    data_source: r.sources.map((s) => s.data_source).join(' · ') || 'none',
    backing: r.sources.length ? 'DEMO_STORE' : 'NONE', state: r.state,
    write_owner: 'none — REPORTS reads only', readers: [r.region_id, `${H}.BUSINESS_PULSE`],
    missing_contracts: AIO_REPORT_METRICS.filter((m) => m.domain_node === r.region_id && (m.classification === 'DERIVED_UNSUPPORTED' || m.classification === 'NOT_IMPLEMENTED')).map((m) => m.label),
    missing_tables_services: r.sources.length ? ['production-backed source'] : ['report surface'],
    missing_routes: r.sources.length ? [] : [`/office/reports/${r.region_id.split('.').pop()!.toLowerCase()}`],
    evidence: [...new Set(r.sources.flatMap((s) => s.evidence))],
    visibility: V_GRANT,
  })),
  ...AIO_MORE_ENTRIES.map((e) => ds(e.entry_id, M, {
    data_source: e.owns.join(' · '), backing: e.state === 'NOT_IMPLEMENTED' ? 'NONE' : 'DEMO_STORE', state: e.state, write_owner: e.entry_id,
    readers: [H, W], missing_contracts: [], missing_tables_services: [], missing_routes: e.state === 'NOT_IMPLEMENTED' ? ['entry surface'] : [],
    evidence: e.evidence, visibility: ['AIO_OFFICE.MORE.GROWTH_CRM', 'AIO_OFFICE.MORE.BILLING', 'AIO_OFFICE.MORE.SYSTEM_SETTINGS'].includes(e.entry_id) ? V_GRANT : V_STAFF,
  })),
];
// specific MORE gaps
for (const [id, tables, routes] of [
  [`${M}.BILLING`, ['aio_invoices / aio_quotes / aio_payments unqueried'], []],
  [`${M}.GROWTH_CRM`, ['aio_leads / aio_opportunities unqueried'], ['referrals UI']],
  [`${M}.DOCUMENTS_VAULT`, ['backend file storage not configured'], ['staff upload']],
  [`${M}.MESSAGES`, ['aio_conversations / aio_messages unqueried'], []],
  [`${M}.TEAM_STAFF`, ['aio_staff_profiles / aio_roles / aio_user_roles unused'], ['role assignment']],
  [`${M}.MECHANIC_NETWORK`, ['aio_service_providers unqueried'], []],
] as [string, string[], string[]][]) {
  const row = AIO_DATA_SOURCES.find((d) => d.subject_id === id)!;
  row.missing_tables_services = tables;
  row.missing_routes = routes;
}

/* ════════════════════════════════ FOUNDER role contract ════════════════════════════════ */

export const AIO_FOUNDER_ROLE: PrivilegedRoleContract = {
  role: 'FOUNDER',
  definition: 'An explicitly authorized company principal with company-wide authority across AIO OFFICE (D-FOUNDER-ROLE).',
  identity_rule: 'A role granted to a person — never a hard-coded person, name, email or account in code or configuration. More than one person may hold it.',
  multiplicity: 'ONE_OR_MORE',
  assignment: [
    'Granted to a person by an existing FOUNDER through MORE → TEAM & STAFF; every grant and revocation is recorded in the audit trail.',
    'At least one FOUNDER exists at all times: the last FOUNDER role cannot be revoked.',
    'The first FOUNDER is provisioned by an audited, out-of-band step, never by a constant in code. The mechanism is decided in the permissions sprint.',
    'A FOUNDER also holds every STAFF ability. STAFF never hold founder acts or founder-only visibility, except by an explicit, revocable grant for a named view (BY_GRANT).',
  ],
  never: [
    'hard-code a person, name, email or account id as founder',
    'let STAFF inherit a founder act',
    'let anyone grant a role or a grant to themselves (no self-elevation)',
    'decide founder status in the browser — the role must be enforced server-side and in database policy',
    'change auth, roles or database policy in this sprint (contract only)',
  ],
  acts: [
    { act: 'All-client and all-service visibility', node_ids: [`${H}`, `${M}.CLIENTS`, W], today: 'Every internal user has it (OfficeRouteGuard); not founder-specific — staff hold it too.', state: 'PARTIAL', evidence: [`${SRC}/auth/guards/RouteGuards.tsx:69-92`] },
    { act: 'Founder review of a migrated client file', node_ids: ['AIO_OFFICE.INTAKE.FOUNDER_REVIEW'], today: 'The approve-batch API admits any active internal staff member; there is no founder check.', state: 'BLOCKED', evidence: ['api/aio/client-migration/approve-batch.ts:38-45'] },
    { act: 'PREBUILT approval and the activation invite', node_ids: ['AIO_OFFICE.INTAKE.PREBUILT_CLIENT', 'AIO_OFFICE.INTAKE.ACTIVATION_INVITE'], today: 'Same staff-only gate as founder review. Client confirmation remains the gate before ACTIVE (unchanged).', state: 'BLOCKED', evidence: ['api/aio/client-migration/approve-batch.ts:38-45', `${SRC}/client-migration/server/supabaseApproveMigration.ts:19`] },
    { act: 'Internal financial visibility', node_ids: [`${R}.FINANCIAL_REVENUE`, `${M}.BILLING`, `${W}.BROKERAGE.LOAD_FINANCIALS`], today: 'management.financial.read / brokerage_finance.read are resolved in the browser from a demo-store role that defaults to manager; /office/billing routes are not gated.', state: 'BLOCKED', evidence: [`${SRC}/office-core/officeContext.ts:171-177`] },
    { act: 'Reporting', node_ids: [R], today: 'ManagementGate checks management.*.read in the browser.', state: 'BLOCKED', evidence: [`${SRC}/office-core/officeContext.ts:171-177`] },
    { act: 'Staff role and permission administration', node_ids: [`${M}.TEAM_STAFF`], today: 'No role-assignment UI; team.manage is defined but never enforced; setOfficeStaffRole has no page caller.', state: 'NOT_IMPLEMENTED', evidence: [`${SRC}/office-core/officeContext.ts:214`] },
    { act: 'System configuration', node_ids: [`${M}.SYSTEM_SETTINGS`], today: 'Some settings pages carry browser-side gates (security, integrations, data, QA); others are open to any internal user.', state: 'PARTIAL', evidence: [OR('210-242')] },
    { act: 'Service configuration (activation, pricing)', node_ids: [`${M}.SERVICE_CATALOG`], today: 'Pricing settings and the Service Activation Center check no permission.', state: 'BLOCKED', evidence: [`${SRC}/office/pages/BillingPages.tsx:252`, `${SRC}/office/pages/LaunchPages.tsx:157-169`] },
    { act: 'High-risk overrides', node_ids: [], today: 'Contract: any action that bypasses a client confirmation, an activation or lifecycle gate, an approval, or a recorded filing or payment is a founder act. No such override exists in code today, so none is listed.', state: 'NOT_IMPLEMENTED', evidence: [] },
    { act: 'Founder-only approvals', node_ids: ['AIO_OFFICE.INTAKE.FOUNDER_REVIEW', 'AIO_OFFICE.INTAKE.PREBUILT_CLIENT', `${M}.TEAM_STAFF`, `${M}.SERVICE_CATALOG`], today: 'Defined today: founder review, PREBUILT approval, staff role changes, service activation and pricing changes. New approvals join this list only when their action exists.', state: 'BLOCKED', evidence: ['api/aio/client-migration/approve-batch.ts:38-45', `${SRC}/office-core/officeContext.ts:214`] },
  ],
  code_today: `No FOUNDER role in code. Nearest: the demo-store OfficeStaffRole owner and the database role super_admin; the two role sets do not map to each other, and office permissions are resolved in the browser. No founder identity is hard-coded.`,
  gaps: ['G-FOUNDER-ROLE-NOT-IMPLEMENTED', 'G-FOUNDER-ACTS-STAFF-GATED', 'G-PERMISSIONS-CLIENT-SIDE', 'G-PERMISSIONS-UNCHECKED', 'G-ROLE-ASSIGNMENT-UI'],
};

/* ════════════════════════════════ the contracts ════════════════════════════════ */

export const AIO_ROOT_CONTRACTS: RootContract[] = [HOME_CONTRACT, WORK_CONTRACT, REPORTS_CONTRACT, MORE_CONTRACT];

export const AIO_OFFICE_CONTRACTS: OfficeRootContracts = {
  project_id: 'AIO',
  sprint: AIO_OFFICE_CONTRACTS_SPRINT,
  roots: AIO_ROOT_CONTRACTS,
  lanes: AIO_WORK_LANES,
  metrics: AIO_REPORT_METRICS,
  more_entries: AIO_MORE_ENTRIES,
  ownership: AIO_ROOT_OWNERSHIP,
  data_sources: AIO_DATA_SOURCES,
  permissions: AIO_PERMISSIONS,
  client_safe: AIO_CLIENT_SAFE,
  responsive: AIO_RESPONSIVE,
  gaps: AIO_IMPLEMENTATION_GAPS,
  vocabularies: [
    { name: 'HOME blocker groups', mappings: AIO_HOME_BLOCKER_GROUPS },
    { name: 'HOME event verbs', mappings: AIO_HOME_EVENT_VERBS },
  ],
  privileged_roles: [AIO_FOUNDER_ROLE],
};

/** The founder's three known gaps — they must stay recorded until code proves otherwise. */
export const AIO_KNOWN_GAPS = ['G-ROAD-READY-NO-ENGAGEMENT-STATE', 'G-FOUNDER-ROLE-NOT-IMPLEMENTED', 'G-VEHICLES-NO-STAFF-SCREEN'] as const;

/** Root-ownership minimum list from the brief. */
export const AIO_REQUIRED_OWNERSHIP_DOMAINS = ['CLIENTS', 'MIGRATION', 'PERMITTING', 'IFTA', 'COMPLIANCE', 'VEHICLES', 'DISPATCH', 'BROKERAGE', 'INSURANCE', 'FACTORING', 'BOOKKEEPING', 'DRIVERS', 'MAINTENANCE', 'ROAD_READY', 'CRM', 'BILLING', 'DOCUMENTS', 'MESSAGING', 'STAFF', 'SERVICE_CATALOG'] as const;
