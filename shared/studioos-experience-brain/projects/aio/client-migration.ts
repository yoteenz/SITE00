/**
 * AIO CLIENT MIGRATION, ACTIVATION + OFFICE PROVISIONING — the AIO mapping of the generic client lifecycle
 * (../../client-lifecycle.ts) onto AIO's existing records (P0.AIO.CLIENT-MIGRATION-ACTIVATION-AND-OFFICE-PROVISIONING-ARCHITECTURE1).
 *
 * Founder decision: EXISTING-CLIENT ONBOARDING IS NOT ACCOUNT CREATION. It is reconciliation between AIO's existing
 * knowledge and the client's current business truth.
 *
 *   LEGACY / PHYSICAL CLIENT FILE → MIGRATION INTAKE → EXTRACTION / CLASSIFICATION → FOUNDER REVIEW → PREBUILT CLIENT
 *   PROFILE → VAULT ORGANIZATION → OFFICE PROVISIONING → ACTIVATION INVITE → CLIENT REVIEW → WHAT CHANGED? → CLIENT
 *   CONFIRMATION → ACTIVE CLIENT → ACTIVE WORKSPACES → CONTEXTUAL EXPANSION
 *
 * Every AIO reference is from the read-only audit of yoteenz/fsbw · all-in-one-enterprises @ AIO_MIGRATION_AUDIT_SHA.
 * Architecture only: nothing in AIO is changed and no page is implemented.
 */
import {
  ACTIVATION_CONDITIONS,
  CLIENT_LIFECYCLE_STATES,
  CLIENT_LIFECYCLE_TRANSITIONS,
  FOUNDER_CLIENT_SEGMENTS,
  LIFECYCLE_AUDIT_EVENTS,
  LifecycleError,
  MIGRATION_PIPELINE,
  PASSWORD_DELIVERY_FORBIDDEN,
  REVIEW_ACTIONS,
  acceptInvite,
  analyzeConflicts,
  assessStaleness,
  auditRecord,
  batchState,
  checkClientConfirmation,
  checkInviteMessage,
  computeCompleteness,
  confirmMatch,
  isCountedActive,
  markDuplicates,
  planMigrationCommit,
  proposeClientMatch,
  provisionWorkspaces,
  routeChange,
  segmentOf,
  supersede,
  transitionClient,
  type ActivationCondition,
  type ActivationInvite,
  type BatchState,
  type ChangeShortcut,
  type ClientLifecycleState,
  type Completeness,
  type Confidence,
  type ExtractedFact,
  type FactProvenance,
  type FieldRule,
  type InviteState,
  type LifecycleAuditEvent,
  type LifecycleAuditRecord,
  type LifecycleClient,
  type MatchProfile,
  type MatchSignalKind,
  type ProvisionedWorkspace,
  type ReviewDecision,
  type ReviewSection,
  type SectionAnswer,
  type ServiceRelationship,
  type SourceDocument,
  type SourceDocumentState,
  type Staleness,
  type VaultLineageRecord,
} from '../../client-lifecycle.js';
import { evaluateExpansion, type ClientRecord, type ExpansionTrigger } from '../../operating-environment.js';
import { validateExperienceContract } from '../../validate.js';
import { AIO_IFTA_CONTRACT } from './ifta.js';
import { AIO_CLIENT_ACTIVATION, AIO_CLIENT_MIGRATION } from './migration.js';
import { AIO_OFFICE_DEMO_CLIENTS, AIO_OFFICE_REFERENCE_DATE, AIO_WORKSPACES } from './office.js';

export const AIO_MIGRATION_SPRINT = 'P0.AIO.CLIENT-MIGRATION-ACTIVATION-AND-OFFICE-PROVISIONING-ARCHITECTURE1';
export const AIO_MIGRATION_AUDIT_SHA = 'c88a3000866d55c09c8271dd7c2cfccb32e5bf23';
const SRC = 'all-in-one-enterprises/src';
const MIG = 'all-in-one-enterprises/supabase/migrations';
type Truth = 'EXISTING' | 'PARTIAL' | 'MISSING' | 'CONFLICT' | 'PROPOSED';

/* ─────────────────────────────── matching signals ─────────────────────────────── */

/** STRONG identifiers identify a carrier on their own; WEAK ones only support a match. */
export const AIO_MATCH_SIGNALS: (MatchSignalKind & { label: string })[] = [
  { kind: 'USDOT', strength: 'STRONG', label: 'USDOT number' },
  { kind: 'MC', strength: 'STRONG', label: 'MC / operating authority number' },
  { kind: 'EIN', strength: 'STRONG', label: 'EIN' },
  { kind: 'VIN', strength: 'STRONG', label: 'Vehicle VIN (owned by one business at a time)' },
  { kind: 'LEGAL_NAME', strength: 'WEAK', label: 'Legal business name (normalised)' },
  { kind: 'DBA', strength: 'WEAK', label: 'Doing-business-as name' },
  { kind: 'PHONE', strength: 'WEAK', label: 'Phone' },
  { kind: 'EMAIL', strength: 'WEAK', label: 'Email' },
  { kind: 'ADDRESS', strength: 'WEAK', label: 'Address (normalised)' },
  { kind: 'SERVICE_RECORD', strength: 'WEAK', label: 'Existing service record reference (request / policy / quarter)' },
];

/* ─────────────────────────────── existing-client first login ─────────────────────────────── */

/** WELCOME → HERE'S WHAT AIO ALREADY KNOWS → COMPANY → PEOPLE → VEHICLES → ACTIVE SERVICES → DOCUMENTS WE HAVE → WHAT CHANGED? → CONFIRM → ENTER YOUR OFFICE */
export const AIO_FIRST_LOGIN_STEPS = [
  { step: 'WELCOME', shows: 'Company name · AIO client ID · “Here’s what AIO already knows.” (early invite: “We know your business. Your digital office is just getting started.”)', answer: null },
  { step: 'WHAT_AIO_KNOWS', shows: 'Three honest measures: BUSINESS PROFILE n% KNOWN · DOCUMENT VAULT state · CLIENT REVIEW REQUIRED', answer: null },
  { step: 'COMPANY', shows: 'Legal name · DBA · USDOT · MC · EIN (masked) · addresses · phone · email', answer: 'LOOKS RIGHT / NEEDS AN UPDATE / I’M NOT SURE' },
  { step: 'PEOPLE', shows: 'Owners · contacts · drivers', answer: 'LOOKS RIGHT / NEEDS AN UPDATE / I’M NOT SURE' },
  { step: 'VEHICLES', shows: 'Units · VIN (last 6) · plate · registration expiry', answer: 'LOOKS RIGHT / NEEDS AN UPDATE / I’M NOT SURE' },
  { step: 'ACTIVE_SERVICES', shows: 'Services AIO already handles for you (staff-confirmed relationships only)', answer: 'LOOKS RIGHT / NEEDS AN UPDATE / I’M NOT SURE' },
  { step: 'DOCUMENTS', shows: 'Documents AIO has on file, by kind, with expiry flags (informational)', answer: 'LOOKS RIGHT / I’M NOT SURE (optional)' },
  { step: 'WHAT_CHANGED', shows: 'Shortcuts — the client taps what changed; NOTHING CHANGED is one tap', answer: 'shortcut(s)' },
  { step: 'CONFIRM', shows: 'One decision: CONFIRM & ENTER MY OFFICE (+ required acknowledgements)', answer: 'CONFIRM' },
  { step: 'ENTER_OFFICE', shows: 'YOUR AIO OFFICE — ACTIVE WITH AIO · WE ALSO KNOW ABOUT · WORKSPACES THAT MAY HELP', answer: null },
] as const;

export const AIO_REVIEW_SECTIONS: ReviewSection[] = [
  { section_id: 'COMPANY', label: 'Company', required: true },
  { section_id: 'PEOPLE', label: 'People', required: true },
  { section_id: 'VEHICLES', label: 'Vehicles', required: true },
  { section_id: 'ACTIVE_SERVICES', label: 'Active services', required: true },
  { section_id: 'DOCUMENTS', label: 'Documents we have', required: false },
];

/** WHAT CHANGED? shortcuts. A client report never silently overwrites a verified fact. */
export const AIO_WHAT_CHANGED: ChangeShortcut[] = [
  { shortcut_id: 'BOUGHT_A_TRUCK', label: 'BOUGHT A TRUCK', section_id: 'VEHICLES', routes_to: 'add vehicle (unit · VIN · plate) → staff reconcile', reconciliation: 'STAFF_RECONCILE', affects: ['fleet registry', 'IFTA quarter vehicles', 'tags / registration', 'insurance schedule'] },
  { shortcut_id: 'SOLD_A_TRUCK', label: 'SOLD A TRUCK', section_id: 'VEHICLES', routes_to: 'mark vehicle sold (date) → staff reconcile', reconciliation: 'STAFF_RECONCILE', affects: ['fleet registry', 'IFTA quarter vehicles (participation)', 'tags / registration', 'insurance schedule'] },
  { shortcut_id: 'ADDED_A_DRIVER', label: 'ADDED A DRIVER', section_id: 'PEOPLE', routes_to: 'add driver (name · licence state) → staff reconcile', reconciliation: 'STAFF_RECONCILE', affects: ['drivers', 'driver qualification (compliance)', 'insurance driver list'] },
  { shortcut_id: 'REMOVED_A_DRIVER', label: 'REMOVED A DRIVER', section_id: 'PEOPLE', routes_to: 'mark driver removed (date) → staff reconcile', reconciliation: 'STAFF_RECONCILE', affects: ['drivers', 'insurance driver list'] },
  { shortcut_id: 'ADDRESS_CHANGED', label: 'ADDRESS CHANGED', section_id: 'COMPANY', routes_to: 'new address → staff reconcile (regulatory filings may need updating)', reconciliation: 'STAFF_RECONCILE', affects: ['company profile', 'USDOT / MCS-150 update', 'IFTA base jurisdiction'] },
  { shortcut_id: 'INSURANCE_CHANGED', label: 'INSURANCE CHANGED', section_id: 'ACTIVE_SERVICES', routes_to: 'new carrier / policy (upload certificate) → staff reconcile', reconciliation: 'STAFF_RECONCILE', affects: ['insurance', 'filings that need proof of coverage'] },
  { shortcut_id: 'OWNERSHIP_CHANGED', label: 'OWNERSHIP CHANGED', section_id: 'COMPANY', routes_to: 'ownership change → founder / staff review (high impact)', reconciliation: 'STAFF_RECONCILE', affects: ['company profile', 'operating authority', 'banking / factoring', 'every service relationship'] },
  { shortcut_id: 'CONTACT_INFO_CHANGED', label: 'CONTACT INFO CHANGED', section_id: 'PEOPLE', routes_to: 'update phone / email (prior value kept in history)', reconciliation: 'APPLY_WITH_HISTORY', affects: ['contacts'] },
  { shortcut_id: 'NOTHING_CHANGED', label: 'NOTHING CHANGED', section_id: null, routes_to: 'CONFIRM', reconciliation: 'NONE', affects: [] },
  { shortcut_id: 'SOMETHING_ELSE', label: 'SOMETHING ELSE', section_id: null, routes_to: 'short note → staff reconcile', reconciliation: 'STAFF_RECONCILE', affects: ['whatever the note names'] },
];

/* ─────────────────────────────── future authority families (structure only) ─────────────────────────────── */

/** Low-cost structural outlines. Each family needs its own visual authority (territories → reference → lock) before any page. */
export const AIO_FUTURE_AUTHORITY_FAMILIES = [
  { family_id: 'AIO.MIGRATION_INTAKE', actor: 'FOUNDER_STAFF', archetype: 'PIPELINE', primary_object: 'THE CLIENT FILE (batch)', zones: ['batch header (client / unknown · batch id · status)', 'drop zone (folder · multi-file)', 'processing rail (13 pipeline stages with counts)', 'exceptions list (unreadable · duplicate · unsupported · failed)'], primary_action: 'UPLOAD CLIENT FILE', authority_status: 'VISUAL_AUTHORITY_REQUIRED' },
  { family_id: 'AIO.MIGRATION_REVIEW', actor: 'FOUNDER_STAFF', archetype: 'MATCHING_BOARD', primary_object: 'PROPOSED PROFILE (facts with lineage)', zones: ['header: client / candidate · batch · processing status · match status · document count', 'summary: profile facts · vehicles · drivers · services · documents · conflicts · stale · unresolved', 'fact table with source page preview', 'match panel'], primary_action: 'APPROVE MIGRATION', authority_status: 'VISUAL_AUTHORITY_REQUIRED' },
  { family_id: 'AIO.EXISTING_CLIENT_WELCOME', actor: 'CLIENT', archetype: 'THRESHOLD', primary_object: 'WHAT AIO ALREADY KNOWS', zones: ['welcome + AIO client ID', 'three completeness measures', 'section checklist'], primary_action: 'CONTINUE', authority_status: 'VISUAL_AUTHORITY_REQUIRED' },
  { family_id: 'AIO.WHAT_CHANGED', actor: 'CLIENT', archetype: 'CHECKLIST', primary_object: 'WHAT CHANGED SHORTCUTS', zones: ['shortcut grid', 'focused change capture (one at a time)', 'NOTHING CHANGED'], primary_action: 'NOTHING CHANGED / CONTINUE', authority_status: 'VISUAL_AUTHORITY_REQUIRED' },
  { family_id: 'AIO.CLIENT_OFFICE_ACTIVATION', actor: 'CLIENT', archetype: 'DECISION_WINDOW', primary_object: 'THE CONFIRMATION', zones: ['summary of answers + reported changes', 'acknowledgements', 'one decision'], primary_action: 'CONFIRM & ENTER MY OFFICE', authority_status: 'VISUAL_AUTHORITY_REQUIRED' },
  { family_id: 'AIO.CLIENT_OFFICE_HUB', actor: 'CLIENT', archetype: 'CONTROL_ROOM', primary_object: 'YOUR AIO OFFICE', zones: ['ACTIVE WITH AIO', 'WE ALSO KNOW ABOUT (review needed)', 'WORKSPACES THAT MAY HELP (expansion contract)', 'current actions · deadlines · messages'], primary_action: 'OPEN WORKSPACE', authority_status: 'VISUAL_AUTHORITY_REQUIRED' },
] as const;

/* ─────────────────────────────── lifecycle on AIO's existing records ─────────────────────────────── */

/**
 * The lifecycle is a new, single canonical field on the organisation (proposed `aio_organizations.client_lifecycle`,
 * demo `Client.clientLifecycle`). The existing fields keep their meaning and are DERIVED from it:
 *   - Client.accountStatus ('active' | 'pending' | 'inactive', demoTypes.ts:329) — no code transitions it today.
 *   - ClientMigrationStatus (vaultTypes.ts:44) — Vault digitisation progress = DOCUMENT VAULT completeness, NOT lifecycle.
 *   - membership.status 'active' (identity_foundation.sql:80) — the RLS gate; created only by invitation acceptance.
 */
export const AIO_LIFECYCLE_MAPPING: { state: ClientLifecycleState; client_account_status: string; archive_migration_status: string; org_status: string; portal_access: string; counted_active: boolean }[] = [
  { state: 'KNOWN_UNMIGRATED', client_account_status: 'pending', archive_migration_status: 'not_started', org_status: 'pending', portal_access: 'none', counted_active: false },
  { state: 'MIGRATION_IN_PROGRESS', client_account_status: 'pending', archive_migration_status: 'in_progress', org_status: 'pending', portal_access: 'none', counted_active: false },
  { state: 'MIGRATION_REVIEW_REQUIRED', client_account_status: 'pending', archive_migration_status: 'needs_review', org_status: 'pending', portal_access: 'none', counted_active: false },
  { state: 'INTAKE_IN_PROGRESS', client_account_status: 'pending', archive_migration_status: 'not_started (new client)', org_status: 'pending', portal_access: 'intake only', counted_active: false },
  { state: 'PREBUILT', client_account_status: 'pending', archive_migration_status: 'digitized | in_progress (independent)', org_status: 'pending', portal_access: 'none', counted_active: false },
  { state: 'INVITED', client_account_status: 'pending', archive_migration_status: 'independent', org_status: 'pending', portal_access: 'activation link only', counted_active: false },
  { state: 'CLIENT_CONFIRMATION_REQUIRED', client_account_status: 'pending', archive_migration_status: 'independent', org_status: 'pending', portal_access: 'review flow only (not the office)', counted_active: false },
  { state: 'ACTIVE', client_account_status: 'active', archive_migration_status: 'independent', org_status: 'active', portal_access: 'YOUR AIO OFFICE', counted_active: true },
  { state: 'PAUSED', client_account_status: 'inactive', archive_migration_status: 'independent', org_status: 'paused', portal_access: 'read-only office', counted_active: false },
  { state: 'ENDED', client_account_status: 'inactive', archive_migration_status: 'independent', org_status: 'ended', portal_access: 'records export only', counted_active: false },
];

export const AIO_ENTRY_TYPES = [
  { entry_type: 'NEW_CLIENT', starts_at: 'INTAKE_IN_PROGRESS', path: `Self sign-up / Get Started intake (${SRC}/pages/GetStartedPage.tsx:22, ${SRC}/auth/authService.ts:95) → intake complete → confirm → ACTIVE. Staff CRM conversion (${SRC}/crm/conversionEngine.ts:58) → PREBUILT → invite (it no longer creates an active client).` },
  { entry_type: 'EXISTING_PREBUILT', starts_at: 'KNOWN_UNMIGRATED', path: 'Migration intake → review → APPROVE MIGRATION → PREBUILT → invite → review → what changed → confirm → ACTIVE.' },
  { entry_type: 'EXISTING_KNOWN_NOT_MIGRATED', starts_at: 'KNOWN_UNMIGRATED', path: 'Staff confirm identity + what they know (STAFF_KNOWLEDGE provenance, no documents needed) → PREBUILT → may be invited early: “WE KNOW YOUR BUSINESS. YOUR DIGITAL OFFICE IS JUST GETTING STARTED.” Vault migration continues later.' },
] as const;

/** Where each activation condition is decided in AIO (today → proposed). */
export const AIO_ACTIVATION_CONDITION_SOURCES = [
  { condition: 'CANONICAL_IDENTITY_EXISTS', today: 'PARTIAL', where: `organisation row + AIO client ID (${MIG}/20260815120000_aio_identity_roles_contacts.sql:141 aio_next_customer_number — unused)` },
  { condition: 'REVIEW_OR_INTAKE_COMPLETE', today: 'MISSING', where: 'migration commit (APPROVE MIGRATION) or intake completion record' },
  { condition: 'AUTH_IDENTITY_LINKED', today: 'PARTIAL', where: `membership (organization_id, user_id) created server-side at invitation acceptance (${MIG}/20260815100000_aio_identity_foundation.sql:75)` },
  { condition: 'INVITATION_COMPLETED', today: 'MISSING', where: 'activation invitation record ACCEPTED (new table)' },
  { condition: 'CLIENT_REVIEWED_REQUIRED_SECTIONS', today: 'MISSING', where: 'client review answers (new table)' },
  { condition: 'CLIENT_CONFIRMED_CURRENT_TRUTH', today: 'MISSING', where: 'CONFIRM & ENTER MY OFFICE event' },
  { condition: 'REQUIRED_CONSENTS_ACCEPTED', today: 'MISSING', where: `aio_consents (${MIG}/20260815140000_aio_integrations_security_audit.sql:72 — exists, unused; terms are never persisted today)` },
  { condition: 'OFFICE_PROVISIONING_SUCCEEDED', today: 'MISSING', where: 'provisioning run result (records written, workspaces PENDING_SETUP, Vault filed)' },
] as const;

/* ─────────────────────────────── intake, files, classes, fields ─────────────────────────────── */

export const AIO_MIGRATION_INTAKE = {
  extends: {
    feature: 'Physical Archive Migration (office)',
    routes: ['/office/archive-migration', '/office/archive-migration/digitize', '/office/archive-migration/batches/:batchId'],
    refs: [`${SRC}/office/routes/OfficeRoutes.tsx:270`, `${SRC}/demo/archiveMigrationActions.ts:50`, `${SRC}/vault/archiveMigrationTypes.ts:18`, `${MIG}/20260817180000_aio_digital_records_vault.sql:64`],
    already_does: ['batch per client (ArchiveMigrationBatch)', 'multi-file upload with SHA-256 per file', 'duplicate warning (same organisation)', 'manual classification', 'batch approval into the Vault', 'Client.archiveMigrationStatus progress', 'security audit ARCHIVE_MIGRATION_BATCH_CREATED / _APPROVED'],
  },
  adds: [
    'UNKNOWN CLIENT batches (today the client must already exist) + client matching (USDOT · MC · EIN · VIN + weak signals)',
    'suggested class + confidence (fields exist: classificationConfidence / suggestedMetadata, never written today)',
    'extracted facts with page / region provenance and review decisions (new fact + decision tables)',
    'conflict, staleness and confidence analysis',
    'founder / authorised-staff gate on APPROVE MIGRATION (today any staff can approve — no permission check)',
    'commit of verified facts into profile, people, fleet, insurance, service relationships → PREBUILT client',
    'duplicate files linked instead of stored again',
    'folder upload',
  ],
  must_not: ['become a second migration tool beside Archive Migration', 'be confused with the Data Migration Center (debug → production platform import)'],
  workflow: ['SELECT / CREATE MIGRATION BATCH', 'SELECT CLIENT OR UNKNOWN CLIENT', 'UPLOAD FOLDER / FILE BATCH', 'INGEST', 'PROCESS', 'REVIEW', 'COMMIT VERIFIED DATA', 'PROVISION PREBUILT OFFICE'],
  desktop_flow: 'PC → client folder → batch-scan paper → PDFs / photos / files together → upload the whole batch. No manual pre-classification.',
} as const;

export const AIO_MIGRATION_FILE_POLICY = {
  accepted: ['PDF', 'JPG', 'JPEG', 'PNG', 'WEBP'],
  source: `${SRC}/vault/vaultConfig.ts:33 FILE_POLICY (15 MB; pdf · jpg · jpeg · png · webp)`,
  folder_upload: 'MISSING today (multi-file upload exists: SecureDocumentUploader multiple=true) — add directory selection where the browser allows it',
  not_supported_today: ['TIFF / HEIC / multi-page scanner formats', 'office documents (doc / docx / xls / xlsx)', 'ZIP', 'email (.eml / .msg)'],
  conflicts: [`FILE_POLICY 15 MB vs Supabase storage file_size_limit 10 MiB (all-in-one-enterprises/supabase/config.toml:23)`, 'demo stores whole files as data URLs in localStorage (twice per migrated file) — a whole client file will not fit; backend storage is not built'],
  note: 'Office documents are accepted only after the stack supports them; an unsupported file is listed as UNSUPPORTED_DOCUMENT, never dropped.',
} as const;

/** Founder's target classes → existing AIO Vault category / document type (taxonomy reused, not duplicated). */
export const AIO_DOCUMENT_CLASSES: { class_id: string; vault_category: string; document_type: string; status: Truth; extracts: string[]; current_truth: boolean; workspace: string | null; note?: string }[] = [
  { class_id: 'COMPANY_FORMATION', vault_category: 'business', document_type: 'Articles of Organization | Articles of Incorporation | Operating Agreement | Business Registration', status: 'EXISTING', extracts: ['organization.legal_name', 'organization.formation_state', 'owners'], current_truth: true, workspace: 'BUSINESS_FORMATION' },
  { class_id: 'EIN', vault_category: 'business', document_type: 'EIN Letter', status: 'EXISTING', extracts: ['organization.ein', 'organization.legal_name'], current_truth: true, workspace: null, note: 'Document type exists; the EIN value has no field today (einStatus yes/no only).' },
  { class_id: 'DOT', vault_category: 'authority', document_type: 'USDOT Registration | MCS-150', status: 'EXISTING', extracts: ['organization.usdot', 'organization.legal_name', 'organization.physical_address'], current_truth: true, workspace: 'COMPLIANCE' },
  { class_id: 'MC_AUTHORITY', vault_category: 'authority', document_type: 'MC Authority', status: 'EXISTING', extracts: ['organization.mc', 'organization.legal_name'], current_truth: true, workspace: 'COMPLIANCE' },
  { class_id: 'BOC3', vault_category: 'authority', document_type: 'BOC-3', status: 'EXISTING', extracts: ['service.boc3_on_file'], current_truth: true, workspace: 'COMPLIANCE' },
  { class_id: 'W9', vault_category: 'business', document_type: 'Other (W-9)', status: 'PARTIAL', extracts: ['organization.legal_name', 'organization.ein'], current_truth: true, workspace: null, note: 'No Vault type for W-9 (brokerage tracks w9Status only).' },
  { class_id: 'IFTA_LICENSE', vault_category: 'registration', document_type: 'IFTA License', status: 'EXISTING', extracts: ['ifta.account', 'ifta.base_jurisdiction', 'document.expiration_date'], current_truth: true, workspace: 'IFTA' },
  { class_id: 'IFTA_RETURN', vault_category: 'tax_fuel', document_type: 'Tax Document (IFTA return)', status: 'PARTIAL', extracts: ['ifta.account', 'ifta.filed_quarters'], current_truth: false, workspace: 'IFTA', note: 'Historical returns are archive, not quarter cases (quarter cases are not backfilled from paper).' },
  { class_id: 'CAB_CARD', vault_category: 'registration', document_type: 'IRP Cab Card', status: 'EXISTING', extracts: ['vehicle.vin', 'vehicle.plate', 'vehicle.unit_number', 'vehicle.registration_expiration'], current_truth: true, workspace: 'TAGS_REGISTRATION' },
  { class_id: 'REGISTRATION', vault_category: 'registration', document_type: 'Apportioned Registration (plain vehicle registration: Other)', status: 'EXISTING', extracts: ['vehicle.vin', 'vehicle.plate', 'vehicle.registration_expiration'], current_truth: true, workspace: 'TAGS_REGISTRATION' },
  { class_id: 'TITLE', vault_category: 'supporting', document_type: 'Vehicle Title', status: 'EXISTING', extracts: ['vehicle.vin', 'vehicle.ownership'], current_truth: true, workspace: 'TAGS_REGISTRATION' },
  { class_id: 'LEASE', vault_category: 'contracts', document_type: 'Lease Agreement', status: 'EXISTING', extracts: ['vehicle.vin', 'vehicle.ownership'], current_truth: true, workspace: null },
  { class_id: 'INSURANCE_CERTIFICATE', vault_category: 'insurance', document_type: 'Certificate of Insurance', status: 'EXISTING', extracts: ['insurance.carrier', 'insurance.policy_number', 'insurance.effective_date', 'insurance.expiration_date'], current_truth: true, workspace: 'INSURANCE' },
  { class_id: 'INSURANCE_POLICY', vault_category: 'insurance', document_type: 'Policy Document | Coverage Summary', status: 'EXISTING', extracts: ['insurance.carrier', 'insurance.policy_number', 'insurance.expiration_date', 'insurance.coverage'], current_truth: true, workspace: 'INSURANCE' },
  { class_id: 'PERMIT', vault_category: 'permits', document_type: 'Trip Permit | Temporary Permit | State Permit', status: 'EXISTING', extracts: ['permit.type', 'permit.jurisdiction', 'document.expiration_date'], current_truth: true, workspace: 'PERMITTING', note: 'No structured permit record exists (Road Ready yes/no flags only).' },
  { class_id: 'DRIVER_LICENSE', vault_category: 'supporting', document_type: 'Driver License', status: 'EXISTING', extracts: ['driver.name', 'driver.license_state', 'driver.license_expiration'], current_truth: true, workspace: null, note: 'Vault cannot link a document to a driver (no driver entity type).' },
  { class_id: 'MEDICAL_CARD', vault_category: 'supporting', document_type: 'Supporting ID (medical card)', status: 'PARTIAL', extracts: ['driver.name', 'driver.medical_card_expiration'], current_truth: true, workspace: 'COMPLIANCE', note: 'No Vault type for the DOT medical card.' },
  { class_id: 'DRIVER_DOCUMENT', vault_category: 'supporting', document_type: 'Supporting ID | Fleet Document', status: 'PARTIAL', extracts: ['driver.name'], current_truth: false, workspace: 'COMPLIANCE' },
  { class_id: 'FUEL_RECEIPT', vault_category: 'tax_fuel', document_type: 'Receipt', status: 'PARTIAL', extracts: [], current_truth: false, workspace: 'IFTA', note: 'Classify UI cannot pick Receipt under tax_fuel today (taxonomy group conflict). Historical receipts are archive.' },
  { class_id: 'INVOICE', vault_category: 'billing', document_type: 'Invoice', status: 'EXISTING', extracts: [], current_truth: false, workspace: null },
  { class_id: 'FACTORING_DOCUMENT', vault_category: 'factoring', document_type: 'Factoring Document', status: 'EXISTING', extracts: ['service.factoring_provider'], current_truth: true, workspace: 'FACTORING' },
  { class_id: 'BOOKKEEPING_DOCUMENT', vault_category: 'billing', document_type: 'Financial Statement | Tax Document', status: 'PARTIAL', extracts: [], current_truth: false, workspace: 'BOOKKEEPING' },
  { class_id: 'COMPLIANCE_DOCUMENT', vault_category: 'authority | correspondence', document_type: 'UCR | MCS-150 | Federal Correspondence | Agency Letter | Notice | Form 2290 / HVUT', status: 'PARTIAL', extracts: ['document.expiration_date'], current_truth: true, workspace: 'COMPLIANCE' },
  { class_id: 'MAINTENANCE_DOCUMENT', vault_category: 'supporting', document_type: 'Fleet Document (closest)', status: 'MISSING', extracts: ['vehicle.vin'], current_truth: false, workspace: 'FLEETCARE', note: 'No maintenance Vault type; FleetCare repair records need an AIO job.' },
  { class_id: 'OTHER', vault_category: 'legacy', document_type: 'Legacy Scan | Historical File | Unclassified Legacy', status: 'EXISTING', extracts: [], current_truth: false, workspace: null },
];

type AioFieldRule = FieldRule & { label: string; target_status: Truth; source_ref: string };
const F = (field: string, label: string, domain: string, target: string, target_status: Truth, source_ref: string, p: 1 | 2 | 3, prebuilt: boolean, activation: boolean, fresh: number | null): AioFieldRule =>
  ({ field, label, domain, canonical_target: target, target_status, source_ref, current_truth_priority: p, required_for_prebuilt: prebuilt, required_for_activation: activation, freshness_days: fresh });

const NO_FIELD = 'proposed — no canonical field today';

/** Extraction contract (§8) → canonical home in AIO. PROPOSED targets need a schema change before implementation. */
export const AIO_MIGRATION_FIELD_RULES: AioFieldRule[] = [
  F('organization.legal_name', 'Legal business name', 'COMPANY', 'aio_organizations.name · Client.companyName · RoadReadyProfile.business.legalName', 'EXISTING', `${SRC}/road-ready/roadReadyTypes.ts:50`, 1, true, true, null),
  F('organization.dba', 'DBA', 'COMPANY', 'RoadReadyProfile.business.dba (Supabase column proposed)', 'PARTIAL', `${SRC}/road-ready/roadReadyTypes.ts:50`, 2, false, false, null),
  F('organization.ein', 'EIN', 'COMPANY', 'aio_organization_regulatory_identifiers (type EIN)', 'PARTIAL', `${MIG}/20260815120000_aio_identity_roles_contacts.sql:94`, 1, false, true, null),
  F('organization.usdot', 'USDOT number', 'COMPANY', 'aio_organization_regulatory_identifiers (type USDOT) · RoadReadyProfile.authority.usdotNumber', 'PARTIAL', `${SRC}/road-ready/roadReadyTypes.ts:77`, 1, false, true, null),
  F('organization.mc', 'MC number', 'COMPANY', 'aio_organization_regulatory_identifiers (type MC) · RoadReadyProfile.authority.mcNumber', 'PARTIAL', `${SRC}/road-ready/roadReadyTypes.ts:75`, 1, false, false, null),
  F('organization.physical_address', 'Physical address', 'COMPANY', 'RoadReadyProfile.business.address (Supabase column proposed)', 'PARTIAL', `${SRC}/road-ready/roadReadyTypes.ts:50`, 1, false, true, 365),
  F('organization.mailing_address', 'Mailing address', 'COMPANY', 'RoadReadyProfile.business.mailingAddress (Supabase column proposed)', 'PARTIAL', `${SRC}/road-ready/roadReadyTypes.ts:50`, 2, false, false, 365),
  F('organization.phone', 'Business phone', 'COMPANY', 'RoadReadyProfile.business.phone · Client.contactPhone', 'EXISTING', `${SRC}/demo/demoTypes.ts:324`, 1, false, true, 365),
  F('organization.email', 'Business email', 'COMPANY', 'RoadReadyProfile.business.email · Client.contactEmail', 'EXISTING', `${SRC}/demo/demoTypes.ts:324`, 1, false, true, 365),
  F('owners', 'Owners / officers', 'PEOPLE', 'aio_contacts + aio_customer_organizations (relationship_type owner — proposed)', 'MISSING', `${MIG}/20260815120000_aio_identity_roles_contacts.sql:7`, 1, false, false, null),
  F('contacts.primary', 'Primary contact', 'PEOPLE', 'aio_contacts · Client.contactName / contactEmail / contactPhone', 'PARTIAL', `${SRC}/demo/demoTypes.ts:324`, 1, true, true, 365),
  F('driver.name', 'Driver', 'PEOPLE', 'DriverPlaceholder · aio_driver_profiles (hired_organization_id)', 'PARTIAL', `${SRC}/road-ready/roadReadyTypes.ts:139`, 1, false, false, null),
  F('driver.license_state', 'Driver licence state', 'PEOPLE', 'aio_driver_credentials (credential_type cdl)', 'PARTIAL', `${MIG}/20260817200000_aio_driverlink.sql:68`, 2, false, false, null),
  F('driver.license_expiration', 'Driver licence expiry', 'PEOPLE', 'aio_driver_credentials.expiration_date', 'PARTIAL', `${MIG}/20260817200000_aio_driverlink.sql:68`, 2, false, false, null),
  F('driver.medical_card_expiration', 'Medical card expiry', 'PEOPLE', 'aio_driver_credentials (credential_type medical_certificate)', 'PARTIAL', `${MIG}/20260817200000_aio_driverlink.sql:68`, 2, false, false, null),
  F('vehicle.vin', 'VIN', 'VEHICLES', 'PowerUnit.vin · aio_fleet_vehicles.vin', 'EXISTING', `${SRC}/road-ready/roadReadyTypes.ts:111`, 1, false, false, null),
  F('vehicle.unit_number', 'Unit number', 'VEHICLES', 'aio_fleet_vehicles.unit_number · PowerUnit.nickname', 'PARTIAL', `${MIG}/20260817190000_aio_fleetcare_network.sql:86`, 1, false, false, null),
  F('vehicle.plate', 'Plate (+ state)', 'VEHICLES', 'PowerUnit.plate / plateState · aio_fleet_vehicles.license_plate', 'PARTIAL', `${SRC}/road-ready/roadReadyTypes.ts:111`, 1, false, false, null),
  F('vehicle.registration_expiration', 'Registration expiry', 'VEHICLES', 'Vault document expiresAt (relatedEntityType vehicle) → Deadline / RenewalRecord.vehicleId', 'PARTIAL', `${SRC}/renewals/renewalTypes.ts:42`, 1, false, false, null),
  F('vehicle.ownership', 'Ownership (owned / financed / leased)', 'VEHICLES', 'PowerUnit.ownership', 'EXISTING', `${SRC}/road-ready/roadReadyTypes.ts:122`, 2, false, false, null),
  F('insurance.carrier', 'Insurance carrier', 'INSURANCE', 'InsurancePolicy.carrierName (source document_import)', 'EXISTING', `${SRC}/insurance/insuranceTypes.ts:57`, 1, false, false, null),
  F('insurance.policy_number', 'Policy number', 'INSURANCE', 'InsurancePolicy.policyNumber', 'EXISTING', `${SRC}/insurance/insuranceTypes.ts:57`, 1, false, false, null),
  F('insurance.effective_date', 'Policy effective date', 'INSURANCE', 'InsurancePolicy.effectiveDate', 'EXISTING', `${SRC}/insurance/insuranceTypes.ts:57`, 1, false, false, null),
  F('insurance.expiration_date', 'Policy expiry', 'INSURANCE', 'InsurancePolicy.expirationDate', 'EXISTING', `${SRC}/insurance/insuranceTypes.ts:57`, 1, false, false, null),
  F('insurance.coverage', 'Coverage', 'INSURANCE', 'InsurancePolicy.policyType / coverage', 'PARTIAL', `${SRC}/insurance/insuranceTypes.ts:24`, 2, false, false, null),
  F('ifta.account', 'IFTA account / licence', 'TAX_FUEL', 'org-level IFTA account (proposed: regulatory identifier type IFTA_ACCOUNT); today per quarter case (IftaQuarterCase.iftaAccount)', 'PARTIAL', `${SRC}/ifta/iftaTypes.ts:151`, 1, false, false, null),
  F('ifta.base_jurisdiction', 'IFTA base jurisdiction', 'TAX_FUEL', 'IftaQuarterCase.baseJurisdiction (org-level proposed)', 'PARTIAL', `${SRC}/ifta/iftaTypes.ts:151`, 1, false, false, null),
  F('permit.type', 'Permit', 'PERMITS', 'Vault document (permits) + RenewalRecord (type permit); structured permit record proposed', 'PARTIAL', `${SRC}/renewals/renewalTypes.ts:7`, 2, false, false, null),
  F('service.relationship', 'Service relationship with AIO', 'SERVICES', 'workspace entitlement source per workspace (AIO_WORKSPACES entitlement_sources)', 'PARTIAL', 'docs/aio/office/AIO_OFFICE_WORKSPACE_REGISTRY.json (SITE00)', 1, false, true, null),
  F('organization.formation_state', 'Formation state', 'COMPANY', 'aio_organizations.formation_state (proposed)', 'PROPOSED', NO_FIELD, 2, false, false, null),
  F('service.boc3_on_file', 'BOC-3 on file', 'SERVICES', 'Vault BOC-3 document (current) → COMPLIANCE workspace item (proposed flag)', 'PROPOSED', NO_FIELD, 2, false, false, null),
  F('service.factoring_provider', 'Factoring provider', 'SERVICES', 'FactoringProfile partner (proposed field)', 'PROPOSED', NO_FIELD, 2, false, false, null),
  F('ifta.filed_quarters', 'IFTA quarters filed (historical)', 'TAX_FUEL', 'Vault archive only — historical returns are never backfilled into quarter cases', 'PROPOSED', NO_FIELD, 3, false, false, null),
  F('permit.jurisdiction', 'Permit jurisdiction', 'PERMITS', 'RenewalRecord (type permit) jurisdiction (structured permit record proposed)', 'PROPOSED', NO_FIELD, 2, false, false, null),
  F('document.effective_date', 'Document effective date', 'DOCUMENTS', 'VaultDocument.effectiveAt', 'EXISTING', `${SRC}/vault/vaultTypes.ts:104`, 2, false, false, null),
  F('document.expiration_date', 'Document expiry', 'DOCUMENTS', 'VaultDocument.expiresAt', 'EXISTING', `${SRC}/vault/vaultTypes.ts:104`, 1, false, false, null),
];

/** Existing matching in AIO (extended, not duplicated). */
export const AIO_EXISTING_MATCHING = [
  { what: 'findDuplicateMatches — leads + clients by email (high), phone (high), exact normalised name (medium)', ref: `${SRC}/crm/leadDeduplication.ts:16`, status: 'EXISTING', use: 'weak signals (EMAIL · PHONE · LEGAL_NAME)' },
  { what: 'checkDuplicateCustomer — accepts usdot / mc but ignores them; only a test calls it', ref: `${SRC}/office-core/client360Service.ts:139`, status: 'CONFLICT', use: 'extend with strong identifiers' },
  { what: 'findOrCreateClientFromIntake — reuses a client by contactEmail', ref: `${SRC}/demo/demoActions.ts:89`, status: 'PARTIAL', use: 'new-client convergence (claim instead of duplicate)' },
  { what: 'aio_organization_regulatory_identifiers unique(org, type, value) — unused', ref: `${MIG}/20260815120000_aio_identity_roles_contacts.sql:94`, status: 'PARTIAL', use: 'canonical home + match index for USDOT / MC / EIN (cross-org uniqueness proposed)' },
  { what: 'findDuplicateDocuments(org, sha256)', ref: `${SRC}/vault/documentHash.ts:10`, status: 'EXISTING', use: 'DUPLICATE_CHECK (extend across the batch; link instead of storing again)' },
  { what: 'runRegulatoryLookup — demo stand-in (one test number); live FMCSA not configured', ref: `${SRC}/demo/integrationActions.ts:98`, status: 'PARTIAL', use: 'optional verification of USDOT / MC during review (never auto-writes)' },
] as const;

export const AIO_COMMIT_TARGETS = {
  organization: 'aio_organizations (+ client_lifecycle, client_number proposed) · Client · RoadReadyProfile.business (demo)',
  identifiers: 'aio_organization_regulatory_identifiers (USDOT · MC · EIN · IFTA_ACCOUNT)',
  people: 'aio_contacts + aio_customer_organizations · OrganizationMember (demo) · aio_driver_profiles / aio_driver_credentials',
  vehicles: 'aio_fleet_vehicles · PowerUnit (demo)',
  insurance: 'InsurancePolicy (source document_import / staff_entry — enum values exist, unused)',
  documents: 'aio_documents / VaultDocument (migration_batch_id · file_hash · record_lifecycle · supersedes / superseded_by)',
  service_relationships: 'per-workspace entitlement records (AIO_WORKSPACES)',
  never: ['RoadReadyProfile via saveRoadReadyProfile as-is (stamps every write as a customer update — roadReadyActions.ts:84)', 'completeRoadReadyOnboarding as-is (wipes staff verifications — roadReadyActions.ts:131)'],
} as const;

/* ─────────────────────────────── vault + current truth ─────────────────────────────── */

export const AIO_VAULT_MAPPING = [
  { lineage_field: 'client_id / organization_id', aio: 'VaultDocument.organizationId (clientId deprecated)', ref: `${SRC}/vault/vaultTypes.ts:88`, status: 'EXISTING' },
  { lineage_field: 'document_type / classification', aio: 'category (VaultCategory) + documentType; proposed class + confidence in classificationConfidence / suggestedMetadata', ref: `${SRC}/vault/vaultTypes.ts:89`, status: 'PARTIAL' },
  { lineage_field: 'source_migration_batch', aio: 'batchId / migrationBatchFileId · aio_documents.migration_batch_id', ref: `${SRC}/vault/vaultTypes.ts:130`, status: 'EXISTING' },
  { lineage_field: 'original_filename · sha256', aio: 'fileName · fileHash', ref: `${SRC}/vault/vaultTypes.ts:100`, status: 'EXISTING' },
  { lineage_field: 'ingested_at', aio: 'uploadedAt (uploadedBy is never filled today)', ref: `${SRC}/vault/vaultTypes.ts:107`, status: 'PARTIAL' },
  { lineage_field: 'document_date · effective_date · expiration_date', aio: 'issuedAt · effectiveAt · expiresAt', ref: `${SRC}/vault/vaultTypes.ts:104`, status: 'EXISTING' },
  { lineage_field: 'review_status', aio: 'reviewStatus (pending | approved | needs_attention) + verificationStatus', ref: `${SRC}/vault/vaultTypes.ts:54`, status: 'EXISTING' },
  { lineage_field: 'canonical_status', aio: 'recordLifecycle (current | historical | superseded | expired | pending | needs_review | archived)', ref: `${SRC}/vault/vaultTypes.ts:28`, status: 'EXISTING' },
  { lineage_field: 'superseded_by', aio: 'supersededByDocumentId / supersedesDocumentId / isCurrent (supersedeDocument exists; no UI calls it)', ref: `${SRC}/demo/vaultActions.ts:250`, status: 'PARTIAL' },
  { lineage_field: 'extracted_fact_ids', aio: 'MISSING — new fact table keyed by document id', ref: `${SRC}/vault/vaultTypes.ts:133`, status: 'MISSING' },
  { lineage_field: 'workspace_relationships', aio: 'relatedServiceId / relatedEntityType (no driver / policy / person entity types)', ref: `${SRC}/vault/vaultTypes.ts:67`, status: 'PARTIAL' },
  { lineage_field: 'visibility before activation', aio: "visibility 'internal' until ACTIVE; the expiration notifier ignores visibility today and must not notify a pre-active client", ref: `${SRC}/notifications/notificationScheduler.ts:25`, status: 'CONFLICT' },
] as const;

export const AIO_CURRENT_TRUTH_PRIORITY = [
  { priority: 1, domain: 'Company identity (legal name · USDOT · MC · EIN · address · phone · email)', required_for_activation: true },
  { priority: 1, domain: 'Primary contact + login email', required_for_activation: true },
  { priority: 1, domain: 'Current service relationships (what AIO handles today)', required_for_activation: true },
  { priority: 2, domain: 'Current vehicles (VIN · unit · plate · registration expiry)', required_for_activation: false },
  { priority: 2, domain: 'Current drivers', required_for_activation: false },
  { priority: 2, domain: 'Current insurance · permits · tags · IFTA account state', required_for_activation: false },
  { priority: 2, domain: 'Current required documents (cab cards · COI · IFTA licence · authority)', required_for_activation: false },
  { priority: 3, domain: 'Historical archive (old returns · receipts · expired documents · correspondence)', required_for_activation: false },
] as const;

/* ─────────────────────────────── identity + auth ─────────────────────────────── */

export const AIO_CLIENT_IDENTITY = {
  business_identity: {
    format: 'AIO-CUS-######',
    rule: 'Issued once per business from the existing sequence aio_next_customer_number() (AIO-CUS- + 6 digits), stored on the organisation, never reused, never derived from an email. Plain AIO-###### is already the service-request number format (aio_next_request_number), so a client ID must not use it.',
    refs: [`${MIG}/20260815120000_aio_identity_roles_contacts.sql:141`, `${SRC}/data/constants.ts:22`, `${MIG}/20260815110000_aio_business_data_rls.sql:414`],
    issued_at: 'APPROVE MIGRATION (existing client) · intake completion or CRM conversion (new client)',
    founder_question: 'Display format: AIO-CUS-001042 (existing primitive) or a shorter AIO-C-1042 — not AIO-1042 (collides with request numbers).',
  },
  login_email: { rule: 'The deliverable email the client signs in with (Supabase auth user). Replaceable only through a verified credential-change flow (verify the new address before switching). Never the business identity.' },
  alias: { rule: 'Optional AIO-branded alias (for example an AIO mailbox name) kept as a separate attribute. Never required to authenticate; AIO does not need to run a mailbox system for clients to sign in.' },
} as const;

export const AIO_AUTH_CONTRACT = {
  flow: ['YOUR AIO OFFICE IS READY (email: company name · AIO client ID · secure link)', 'ACTIVATE YOUR OFFICE (single-use link)', 'server verifies the token hash + expiry', 'client sets their own password (updateUser) — or signs in by magic link', 'server links the auth user to the organisation (membership, status active)', 'sign in → review flow'],
  existing: [
    { capability: 'email + password sign-in / sign-up', ref: `${SRC}/auth/authService.ts:157`, status: 'EXISTING' },
    { capability: 'update password (updateUser)', ref: `${SRC}/auth/authService.ts:180`, status: 'EXISTING' },
    { capability: 'password reset (resetPasswordForEmail)', ref: `${SRC}/auth/authService.ts:171`, status: 'CONFLICT', note: 'redirects to /all-in-one/reset-password; the route is /reset-password' },
    { capability: 'magic link (signInWithOtp)', ref: `${SRC}/data/supabase/client.ts:20`, status: 'MISSING', note: 'not used; detectSessionInUrl is on, so link sessions would be picked up' },
    { capability: 'invite / generateLink (admin)', ref: `${SRC}/config/env.ts:42`, status: 'MISSING', note: 'no server function holds the service-role key yet' },
    { capability: 'link an existing organisation to a new user', ref: `${MIG}/20260815100000_aio_identity_foundation.sql:75`, status: 'MISSING', note: 'membership user_id is NOT NULL — the membership is created at acceptance, not at invitation' },
  ],
  proposed: {
    invitation_store: 'aio_client_activation_invites (organization_id, email, token_sha256, issued_at, expires_at, state, sent_by, accepted_user_id) — single use; plain token never stored',
    route: '/office-activation/:token (token-route precedent /quote/:secureToken; “/activate” already names the start-your-business compliance step)',
    server: 'activation endpoint with the service-role key: verify token → create or find the auth user → membership (organization_owner, active) → lifecycle CLIENT_CONFIRMATION_REQUIRED',
    expiry_days: 7,
    magic_link: 'optional sign-in method after activation (signInWithOtp); the invitation token still decides which organisation is linked',
  },
  must_fix_before_activation: [
    { id: 'C11', what: 'RLS lets any signed-in user insert a membership into any organisation', ref: `${MIG}/20260815100000_aio_identity_foundation.sql:233` },
    { id: 'C8', what: 'Self sign-up always creates a new organisation — a migrated client who signs up would duplicate their business (route known emails to “check your invitation / contact AIO”, never auto-link without the token)', ref: `${SRC}/auth/authService.ts:66` },
    { id: 'C10', what: 'Password-reset link points at a route that does not exist', ref: `${SRC}/auth/authService.ts:171` },
    { id: 'C9', what: 'ensureOrganizationForUser is never called', ref: `${SRC}/auth/authService.ts:126` },
    { id: 'PORTAL', what: 'The portal never reads account status — a pending client would get the full portal', ref: `${SRC}/auth/guards/RouteGuards.tsx:8` },
  ],
} as const;

export const AIO_INVITE_TEMPLATE = {
  slug: 'client_office_activation',
  subject: 'Your AIO office is ready',
  fields: { company_name: '{company_name}', business_identity_id: '{aio_client_id}', activation_link: '{secure_link}', expires_at: '{expires_at}', support_contact: '{aio_support_phone}' },
  body: ['YOUR AIO OFFICE IS READY', '{company_name} · {aio_client_id}', 'ACTIVATE YOUR OFFICE → {secure_link}', 'This link works once and expires {expires_at}. AIO will never send you a password.'],
  channel: 'email via the communication engine (templates model communicationTypes.ts:212; provider not configured — demo adapters only)',
} as const;

export const AIO_PASSWORD_FINDINGS = {
  today: 'No temporary or generated password exists anywhere in AIO; every password is typed by the user and goes straight to Supabase Auth. Nothing emails or texts a password.',
  risk: 'With no invite / magic-link primitive, an activation flow could be tempted to mint and send passwords. Forbidden by this contract.',
} as const;

export const AIO_REQUIRED_CONSENTS = {
  at_activation: ['TERMS_OF_SERVICE (versioned)', 'PRIVACY_POLICY (versioned)', 'ELECTRONIC_COMMUNICATIONS (email; SMS only if opted in)'],
  store: `aio_consents (user_id, consent_type, version, granted_at, revoked_at — ${MIG}/20260815140000_aio_integrations_security_audit.sql:72; unused today) + CommConsentRecord for channels (${SRC}/communications/communicationTypes.ts:189)`,
  today: 'Terms acceptance is validated on sign-up but never persisted in backend mode.',
  not_at_activation: 'Service authorisations (POA · BOC-3 · IFTA authorisation) belong to the workspace that needs them, not to activation.',
  founder_question: 'Confirm the legally required set and wording.',
} as const;

/* ─────────────────────────────── provisioning ─────────────────────────────── */

export const AIO_PREBUILT_PROVISIONING = {
  provisions: ['client identity (AIO-CUS-######)', 'organisation', 'contacts', 'vehicles', 'drivers', 'Vault (documents filed internal-only with lineage)', 'known active services', 'workspace eligibility', 'known service relationships', 'workspace shells (PENDING_SETUP)', 'review tasks (client review items + staff follow-ups)'],
  does_not: ['activate operations that need missing mandatory truth', 'notify the client (no expiry notices before ACTIVE)', 'count the client active', 'open a portal session'],
  side_effects_held_until_active: ['deadlines / renewals from migrated expiries (verifyVaultDocument side effects — archive approval bypasses them today)', 'Road Ready sync', 'client-visible activity', 'document visibility customer'],
} as const;

export const AIO_WORKSPACE_PROVISIONING = [
  { workspace_id: 'IFTA', provisioned_by: 'staff-confirmed IFTA relationship (+ IFTA licence on file)', on_active: 'open the current quarter case from confirmed vehicles', gap: 'no “open first quarter” writer (openNextQuarter needs a previous quarter)' },
  { workspace_id: 'TAGS_REGISTRATION', provisioned_by: 'staff-confirmed registration relationship', on_active: 'renewals / deadlines from cab card and registration expiries', gap: 'registration expiry lives only on Vault documents' },
  { workspace_id: 'INSURANCE', provisioned_by: 'staff-confirmed relationship; a COI alone → WE ALSO KNOW ABOUT — REVIEW NEEDED', on_active: 'InsurancePolicy (source document_import) becomes visible', gap: 'no Supabase policy table' },
  { workspace_id: 'BOOKKEEPING', provisioned_by: 'staff-confirmed subscription', on_active: 'subscription state from the bookkeeping record', gap: null },
  { workspace_id: 'FACTORING', provisioned_by: 'staff-confirmed factoring relationship', on_active: 'factoring profile active', gap: null },
  { workspace_id: 'COMPLIANCE', provisioned_by: 'staff-confirmed authority / BOC-3 / safety relationship', on_active: 'Road Ready items verified by staff (preserving verifications)', gap: 'completeRoadReadyOnboarding wipes staff verifications today' },
] as const;

export const AIO_NEW_CLIENT_CONVERGENCE = {
  rule: 'New clients keep the existing intake. They converge into the same identity (AIO-CUS-######), organisation, Vault, workspace entitlement, lifecycle and activation gate — never a second permanent client architecture.',
  paths: [
    { path: 'Self sign-up + Get Started intake', today: 'organisation is born active at sign-up', converges: 'INTAKE_IN_PROGRESS → CLIENT_CONFIRMATION_REQUIRED (review + consents at the end of intake) → ACTIVE' },
    { path: 'Service request submit (/request/submit)', today: 'creates Client pending', converges: 'INTAKE_IN_PROGRESS until the client signs up and confirms' },
    { path: 'CRM lead conversion (staff)', today: 'creates Client active immediately', converges: 'PREBUILT → invite → confirm → ACTIVE (staff-created profiles never count active)' },
    { path: 'Self sign-up by a client AIO already knows', today: 'creates a duplicate organisation', converges: 'matched by email / identifiers → “check your invitation” (claim only with the invitation token)' },
  ],
} as const;

/* ─────────────────────────────── founder surfaces + events ─────────────────────────────── */

export const AIO_FOUNDER_SEGMENTS = [
  { segment: 'ACTIVE', label: 'ACTIVE CLIENTS', meaning: 'confirmed, provisioned, counted' },
  { segment: 'WAITING_FOR_CLIENT', label: 'WAITING FOR CLIENT', meaning: 'invitation accepted; review / confirmation pending' },
  { segment: 'INVITATION_SENT', label: 'INVITATION SENT', meaning: 'link sent, not yet opened / accepted' },
  { segment: 'PREBUILT_NOT_INVITED', label: 'PREBUILT NOT INVITED', meaning: 'office prepared; invite (or re-invite after delivery failure / expiry)' },
  { segment: 'MIGRATION_REVIEW', label: 'MIGRATION REVIEW', meaning: 'facts waiting for a decision' },
  { segment: 'MIGRATION_FAILED_NEEDS_REVIEW', label: 'MIGRATION FAILED / NEEDS REVIEW', meaning: 'partial or failed batch' },
  { segment: 'MIGRATING', label: 'MIGRATING', meaning: 'files uploading / processing' },
  { segment: 'KNOWN', label: 'KNOWN', meaning: 'known to AIO, no digital file yet' },
  { segment: 'NEW_CLIENT_INTAKE', label: 'NEW CLIENT INTAKE', meaning: 'new client completing intake' },
  { segment: 'PAUSED', label: 'PAUSED', meaning: 'relationship paused' },
  { segment: 'ENDED', label: 'ENDED', meaning: 'relationship ended' },
] as const;

/** Every place AIO counts clients today — each must adopt the one rule (isCountedActive) or segment explicitly. */
export const AIO_CLIENT_COUNT_SITES = [
  { surface: 'Office Command Center manager summary customersActive', logic_today: "accountStatus === 'active' (computed, not rendered)", ref: `${SRC}/office-core/officeCommandCenterService.ts:232`, fix: 'isCountedActive' },
  { surface: 'Management Executive Snapshot “Active Customers”', logic_today: 'clients with an open request; falls back to ALL clients when 0', ref: `${SRC}/management/managementQueryLayer.ts:92`, fix: 'isCountedActive; remove the fallback' },
  { surface: 'Metric registry active_customers', logic_today: 'definition text disagrees with the implementation', ref: `${SRC}/management/managementMetricRegistry.ts:67`, fix: 'definition = isCountedActive' },
  { surface: 'Management Customer Command Center “Total Customers”', logic_today: 'every client', ref: `${SRC}/management/managementQueryLayer.ts:312`, fix: 'segment by lifecycle' },
  { surface: 'Clients list', logic_today: 'every client, no status column or filter', ref: `${SRC}/office/pages/ClientsListPage.tsx:18`, fix: 'lifecycle column + segment filter' },
  { surface: 'Archive Migration dashboard totals', logic_today: 'every client', ref: `${SRC}/vault/documentVaultMetrics.ts:55`, fix: 'document-vault completeness only (not activity)' },
] as const;

export const AIO_EVENT_MAPPING = [
  { event: 'MIGRATION_BATCH_CREATED', aio: 'security audit ARCHIVE_MIGRATION_BATCH_CREATED (exists)', ref: `${SRC}/demo/archiveMigrationActions.ts:50`, status: 'EXISTING' },
  { event: 'DOCUMENT_INGESTED', aio: 'activity DOCUMENT_UPLOADED (internal) — reused today', ref: `${SRC}/demo/archiveMigrationActions.ts:72`, status: 'PARTIAL' },
  { event: 'DOCUMENT_CLASSIFIED', aio: 'security audit DOCUMENT_CLASSIFIED (exists)', ref: `${SRC}/security/securityTypes.ts:70`, status: 'EXISTING' },
  { event: 'FACT_EXTRACTED', aio: 'new', ref: null, status: 'MISSING' },
  { event: 'MATCH_PROPOSED', aio: 'new', ref: null, status: 'MISSING' },
  { event: 'MATCH_CONFIRMED', aio: 'new', ref: null, status: 'MISSING' },
  { event: 'FACT_APPROVED', aio: 'new', ref: null, status: 'MISSING' },
  { event: 'FACT_REJECTED', aio: 'new', ref: null, status: 'MISSING' },
  { event: 'MIGRATION_APPROVED', aio: 'security audit ARCHIVE_MIGRATION_BATCH_APPROVED (exists; extend with commit plan)', ref: `${SRC}/security/securityTypes.ts:70`, status: 'PARTIAL' },
  { event: 'CLIENT_PREBUILT', aio: 'new (CUSTOMER_CREATED exists but is never emitted)', ref: `${SRC}/security/securityTypes.ts:70`, status: 'MISSING' },
  { event: 'INVITATION_SENT', aio: 'new + CommMessage status sent / delivered / failed', ref: `${SRC}/communications/communicationTypes.ts:212`, status: 'MISSING' },
  { event: 'CLIENT_REVIEW_STARTED', aio: 'new', ref: null, status: 'MISSING' },
  { event: 'CLIENT_CHANGE_REPORTED', aio: 'new', ref: null, status: 'MISSING' },
  { event: 'CLIENT_CONFIRMED', aio: 'new', ref: null, status: 'MISSING' },
  { event: 'CLIENT_ACTIVATED', aio: 'new', ref: null, status: 'MISSING' },
  { event: 'WORKSPACE_PROVISIONED', aio: 'new', ref: null, status: 'MISSING' },
] as const;

export const AIO_AUDIT_STORE = {
  model: `SecurityAuditEvent with beforeSnapshot / afterSnapshot (${SRC}/security/securityTypes.ts:109) — recorder redacts secrets (${SRC}/security/securityAudit.ts:29)`,
  supabase: `aio_audit_events has no before / after columns (${MIG}/20260815140000_aio_integrations_security_audit.sql:40) — add them (or redacted before / after in safe_metadata) for lifecycle events`,
  naming: 'UPPER_SNAKE noun_verb, matching the existing event enums',
} as const;

/* ─────────────────────────────── proof fixtures ─────────────────────────────── */

export const AIO_MIGRATION_CONSTRAINTS = { page_implementation: false, new_paid_generations: 0, openart_accessed: false, ifta_lane_blocked: false, aio_code_changed: false } as const;

export const AIO_MIGRATION_FIXTURE_NOTE =
  'Proof fixtures only. Business names are the fictional AIO demo seed (all-in-one-enterprises/src/demo). Every identifier below — USDOT, MC, EIN, VIN, ' +
  'AIO-CUS numbers, policy and licence numbers, phones, *.example emails, tokens — is a synthetic fixture value, and every lifecycle position is assigned ' +
  'for the proof (the demo seed has no lifecycle). Never rendered as client data, never a fallback.';

const TODAY = AIO_OFFICE_REFERENCE_DATE;
const sha = (n: number) => n.toString(16).padStart(64, '0');
const FOUNDER = 'founder';
const STAFF = 'staff-1';
const CLIENT_USER = 'client-user-d';
const NO_CONDITIONS = Object.fromEntries(ACTIVATION_CONDITIONS.map((k) => [k, false])) as Record<ActivationCondition, boolean>;
const ALL_CONDITIONS = Object.fromEntries(ACTIVATION_CONDITIONS.map((k) => [k, true])) as Record<ActivationCondition, boolean>;
const demo = (id: string) => AIO_OFFICE_DEMO_CLIENTS.find((c) => c.client_id === id)!;
const wsName = (id: string) => AIO_WORKSPACES.find((w) => w.workspace_id === id)?.name ?? id;
const docClass = (id: string | null) => AIO_DOCUMENT_CLASSES.find((c) => c.class_id === id) ?? null;
const shortcut = (id: string) => AIO_WHAT_CHANGED.find((s) => s.shortcut_id === id)!;

function refusal(fn: () => unknown): { code: string; reasons: string[] } | null {
  try { fn(); return null; } catch (e) { return e instanceof LifecycleError ? { code: e.code, reasons: e.reasons } : { code: 'ERROR', reasons: [String((e as Error).message ?? e)] }; }
}

const doc = (batch_id: string, n: number, file: string, cls: string | null, conf: Confidence | null, d: { doc?: string; eff?: string; exp?: string; state?: SourceDocumentState; mime?: string; hash?: number } = {}): SourceDocument => ({
  document_id: `${batch_id}-D${String(n).padStart(2, '0')}`, batch_id, original_filename: file, mime: d.mime ?? 'application/pdf', bytes: 180_000 + n * 7_000,
  sha256: sha(d.hash ?? 0x1000 + n), ingested_at: '2026-10-01T15:00:00Z', state: d.state ?? 'EXTRACTED', document_class: cls, class_confidence: conf, duplicate_of: null,
  document_date: d.doc ?? null, effective_date: d.eff ?? null, expiration_date: d.exp ?? null, pages: d.state === 'UNSUPPORTED' ? null : 1,
});

const fact = (batch_id: string, id: string, field: string, value: string, prov: Partial<FactProvenance> & Pick<FactProvenance, 'source'>, confidence: Confidence, entity_key: string | null = null, staleness: Staleness = 'CURRENT'): ExtractedFact => ({
  fact_id: id, batch_id, field, entity_key, value, confidence, staleness, canonical_ref: null,
  provenance: { document_id: null, page: null, region: null, supplied_by: null, observed_on: null, ...prov },
  review: { decision: 'PENDING', reviewer: null, decided_at: null, edited_value: null, reason: null },
});
const decide = (f: ExtractedFact, decision: ReviewDecision, reviewer: string, x: { edited_value?: string; reason?: string } = {}): ExtractedFact => ({
  ...f, review: { decision, reviewer, decided_at: '2026-10-02T16:00:00Z', edited_value: x.edited_value ?? null, reason: x.reason ?? null },
});

/** Synthetic identifiers for the matching index (see AIO_MIGRATION_FIXTURE_NOTE). */
const ID = {
  D: { usdot: '3100004', mc: 'MC-1100004', ein: '84-0000004', vin1: '1FUJGLDR7CLBP4101', vin2: '1FUJGLDR9CLBP4102', phone: '(555) 010-0104', aio: 'AIO-CUS-000104' },
  B: { usdot: '3100002' },
  C: { usdot: '3100003' },
  G: { usdot: '3100007', phone: '(555) 010-0107', aio: 'AIO-CUS-000107' },
  NEW: { usdot: '3100099' },
} as const;

/** What AIO already holds per business (the match index the pipeline searches). */
const MATCH_INDEX: MatchProfile[] = [
  { client_ref: 'client-b', signals: { USDOT: [ID.B.usdot], LEGAL_NAME: [demo('client-b').name] } },
  { client_ref: 'client-c', signals: { USDOT: [ID.C.usdot], LEGAL_NAME: [demo('client-c').name] } },
  { client_ref: 'client-d', signals: { USDOT: [ID.D.usdot], VIN: [ID.D.vin1, ID.D.vin2], LEGAL_NAME: [demo('client-d').name], PHONE: [ID.D.phone] } },
  { client_ref: 'client-g', signals: { LEGAL_NAME: [demo('client-g').name], PHONE: [ID.G.phone] } },
];

const batchSignals = (facts: ExtractedFact[]) => {
  const by: Record<string, string> = { 'organization.usdot': 'USDOT', 'organization.mc': 'MC', 'organization.ein': 'EIN', 'vehicle.vin': 'VIN', 'organization.legal_name': 'LEGAL_NAME', 'organization.phone': 'PHONE', 'organization.email': 'EMAIL' };
  const out: Record<string, string[]> = {};
  for (const f of facts) { const k = by[f.field]; if (k && !(out[k] ?? []).includes(f.value)) out[k] = [...(out[k] ?? []), f.value]; }
  return out;
};

/** Staff-confirmed relationships come from SERVICE facts; every other workspace a document points at is evidence only. */
function serviceRelationships(facts: ExtractedFact[], docs: SourceDocument[]): ServiceRelationship[] {
  const confirmed = facts.filter((f) => f.field === 'service.relationship' && (f.review.decision === 'CONFIRMED' || f.review.decision === 'EDITED'));
  const rels: ServiceRelationship[] = confirmed.map((f) => ({ workspace_id: f.review.edited_value ?? f.value, basis: 'STAFF_CONFIRMED_RELATIONSHIP', confirmed_by: f.review.reviewer }));
  const evidence = [...new Set(docs.filter((d) => d.state === 'EXTRACTED').map((d) => docClass(d.document_class)?.workspace).filter((w): w is string => !!w))];
  for (const w of evidence) if (!rels.some((r) => r.workspace_id === w)) rels.push({ workspace_id: w, basis: 'DOCUMENT_EVIDENCE_ONLY', confirmed_by: null });
  return rels;
}

const AFTER_ACTIVATION: ExpansionTrigger = { placement: 'AFTER_ACTIVATION', current_workspace_id: null, critical_state: false, error_recovery: false };

/**
 * The first office view after CONFIRM & ENTER MY OFFICE: ACTIVE WITH AIO · WE ALSO KNOW ABOUT · WORKSPACES THAT MAY HELP.
 * Composed only for a counted-active client. A workspace already shown as WE ALSO KNOW ABOUT is never also advertised.
 */
export function composeClientOffice(c: LifecycleClient, provisioned: ProvisionedWorkspace[], signals: ClientRecord['signals'], name: string) {
  if (!isCountedActive(c)) return { composed: false, reason: `client is ${c.lifecycle} — the office opens only after CONFIRM & ENTER MY OFFICE`, active_with_aio: [], we_also_know_about: [], workspaces_that_may_help: [], not_suggested: [] };
  const active = provisioned.filter((p) => p.state === 'ACTIVE').map((p) => p.workspace_id);
  const known = provisioned.filter((p) => p.state === 'KNOWN_REVIEW_NEEDED');
  const record: ClientRecord = { client_id: c.client_ref, name, signals, entitlements: Object.fromEntries(active.map((w) => [w, { state: 'ACTIVE' as const, source: 'staff-confirmed relationship · client confirmed' }])) };
  const evals = AIO_WORKSPACES.filter((w) => !active.includes(w.workspace_id) && !known.some((k) => k.workspace_id === w.workspace_id)).map((w) => evaluateExpansion(w, record, AIO_WORKSPACES, AFTER_ACTIVATION));
  return {
    composed: true,
    reason: null,
    active_with_aio: active.map((w) => ({ workspace_id: w, name: wsName(w) })),
    we_also_know_about: known.map((k) => ({ workspace_id: k.workspace_id, label: `${wsName(k.workspace_id)} — REVIEW NEEDED`, reason: k.reason })),
    workspaces_that_may_help: evals.filter((e) => !e.suppressed).map((e) => ({ workspace_id: e.workspace_id, rule_id: e.rule_id, headline: e.headline, body: e.body, reasons: e.reasons, cta: e.cta, relevance: e.relevance_class })),
    not_suggested: evals.filter((e) => e.suppressed).map((e) => ({ workspace_id: e.workspace_id, suppressed_by: e.suppressed_by })),
  };
}

type JourneyStep = { step: string; lifecycle: ClientLifecycleState; counted_active: boolean; events: LifecycleAuditEvent[] };

/** Executable proofs of the contract over fixtures (asserted by tests/aioClientMigrationActivation1.test.ts). */
export function aioMigrationProofScenarios() {
  const rules = AIO_MIGRATION_FIELD_RULES;
  const trail: LifecycleAuditRecord[] = [];
  const log = (event: LifecycleAuditEvent, actor: string, role: Parameters<typeof auditRecord>[2], at: string, source: string, subject: string, before: unknown = null, after: unknown = null) => trail.push(auditRecord(event, actor, role, at, source, subject, before, after));

  /* ── A · BlueLine Transport (client-d): full journey KNOWN → ACTIVE ── */
  const BA = 'MB-FIX-0104';
  const rawDocs: SourceDocument[] = [
    doc(BA, 1, 'BlueLine/cab card unit 101.pdf', 'CAB_CARD', 'HIGH', { exp: '2027-02-28' }),
    doc(BA, 2, 'BlueLine/cab card unit 102.pdf', 'CAB_CARD', 'HIGH', { exp: '2027-02-28' }),
    doc(BA, 3, 'BlueLine/COI 2026-2027.pdf', 'INSURANCE_CERTIFICATE', 'HIGH', { eff: '2026-06-01', exp: '2027-06-01' }),
    doc(BA, 4, 'BlueLine/COI 2025-2026.pdf', 'INSURANCE_CERTIFICATE', 'HIGH', { eff: '2025-06-01', exp: '2026-06-01' }),
    doc(BA, 5, 'BlueLine/IFTA licence 2026.pdf', 'IFTA_LICENSE', 'HIGH', { exp: '2026-12-31' }),
    doc(BA, 6, 'BlueLine/MC authority letter.pdf', 'MC_AUTHORITY', 'HIGH', { doc: '2019-03-14' }),
    doc(BA, 7, 'BlueLine/W-9.pdf', 'W9', 'MEDIUM', { doc: '2024-01-10' }),
    doc(BA, 8, 'BlueLine/driver licence J Morales.jpg', 'DRIVER_LICENSE', 'MEDIUM', { exp: '2028-04-30', mime: 'image/jpeg' }),
    doc(BA, 9, 'BlueLine/cab card unit 101 (copy).pdf', 'CAB_CARD', 'HIGH', { exp: '2027-02-28', hash: 0x1000 + 1, state: 'CLASSIFIED' }),
    doc(BA, 10, 'BlueLine/IMG_2231.jpg', null, null, { state: 'UNREADABLE', mime: 'image/jpeg' }),
    doc(BA, 11, 'BlueLine/fuel receipts 2019.tif', null, null, { state: 'UNSUPPORTED', mime: 'image/tiff' }),
  ];
  const docs = markDuplicates(rawDocs);
  const batchA = { batch_id: BA, client_ref: 'client-d', state: 'PROCESSING' as BatchState, created_by: STAFF, created_at: '2026-10-01T14:55:00Z', documents: docs };
  const batchAState = batchState(batchA);
  const D = (n: number) => `${BA}-D${String(n).padStart(2, '0')}`;
  const ext = (n: number, region: string, observed_on: string | null = null) => ({ source: 'DOCUMENT_EXTRACTION' as const, document_id: D(n), page: 1, region, observed_on });
  const staff = (supplied_by: string) => ({ source: 'STAFF_KNOWLEDGE' as const, supplied_by, observed_on: '2026-10-02' });
  const raw: ExtractedFact[] = [
    fact(BA, 'A01', 'organization.legal_name', 'BLUELINE TRANSPORT LLC', ext(6, 'carrier name block', '2019-03-14'), 'HIGH'),
    fact(BA, 'A02', 'organization.usdot', ID.D.usdot, ext(6, 'USDOT line'), 'HIGH'),
    fact(BA, 'A03', 'organization.mc', ID.D.mc, ext(6, 'docket number'), 'HIGH'),
    fact(BA, 'A04', 'organization.ein', ID.D.ein, ext(7, 'part I TIN'), 'HIGH'),
    fact(BA, 'A05', 'organization.phone', ID.D.phone, ext(7, 'contact line'), 'MEDIUM'),
    fact(BA, 'A06', 'organization.phone', '(555) 010-0999', ext(3, 'producer block'), 'MEDIUM'),
    fact(BA, 'A07', 'organization.physical_address', '100 Fixture Way, Example City', ext(6, 'address block', '2019-03-14'), 'HIGH'),
    fact(BA, 'A08', 'contacts.primary', 'D. Rivera (fixture)', { source: 'EXISTING_RECORD', supplied_by: 'Client.contactName', observed_on: '2026-10-01' }, 'HIGH'),
    fact(BA, 'A09', 'vehicle.vin', ID.D.vin1, ext(1, 'VIN field'), 'HIGH', ID.D.vin1),
    fact(BA, 'A10', 'vehicle.plate', 'PRP-1O1', ext(1, 'plate field'), 'MEDIUM', ID.D.vin1),
    fact(BA, 'A11', 'vehicle.registration_expiration', '2027-02-28', ext(1, 'expiry'), 'HIGH', ID.D.vin1),
    fact(BA, 'A12', 'vehicle.vin', ID.D.vin2, ext(2, 'VIN field'), 'HIGH', ID.D.vin2),
    fact(BA, 'A13', 'vehicle.registration_expiration', '2027-02-28', ext(2, 'expiry'), 'HIGH', ID.D.vin2),
    fact(BA, 'A14', 'insurance.carrier', 'Fixture Mutual Insurance Co.', ext(3, 'insurer A'), 'HIGH', 'POL-FIX-2026'),
    fact(BA, 'A15', 'insurance.expiration_date', '2027-06-01', ext(3, 'policy expiry'), 'HIGH', 'POL-FIX-2026'),
    fact(BA, 'A16', 'insurance.expiration_date', '2026-06-01', ext(4, 'policy expiry', '2025-06-01'), 'HIGH', 'POL-FIX-2025', assessStaleness({ observed_on: '2025-06-01', expires_on: '2026-06-01' }, null, TODAY)),
    fact(BA, 'A17', 'ifta.account', 'IFTA-FIX-0104', ext(5, 'licence number'), 'HIGH'),
    fact(BA, 'A18', 'driver.name', 'J. Morales (fixture)', ext(8, 'name'), 'MEDIUM', 'DL-FIX-0104'),
    fact(BA, 'A19', 'driver.license_expiration', '2028-04-30', ext(8, 'expiry'), 'LOW', 'DL-FIX-0104'),
    fact(BA, 'A20', 'organization.legal_name', 'BLUELINE TRANSPQRT', ext(4, 'insured block'), 'LOW'),
    ...['IFTA', 'DISPATCH', 'FACTORING', 'BROKERAGE'].map((w, i) => fact(BA, `A${21 + i}`, 'service.relationship', w, staff(FOUNDER), 'HIGH', w)),
  ];
  for (const d of docs.filter((x) => x.state !== 'UNSUPPORTED')) log('DOCUMENT_INGESTED', 'system:migration-pipeline', 'SYSTEM', '2026-10-01T15:00:00Z', BA, d.document_id);
  for (const d of docs.filter((x) => x.document_class)) log('DOCUMENT_CLASSIFIED', 'system:migration-pipeline', 'SYSTEM', '2026-10-01T15:01:00Z', BA, d.document_id, null, d.document_class);
  for (const f of raw.filter((x) => x.provenance.source === 'DOCUMENT_EXTRACTION')) log('FACT_EXTRACTED', 'system:migration-pipeline', 'SYSTEM', '2026-10-01T15:02:00Z', BA, f.fact_id);
  const flagged = analyzeConflicts(raw);
  const conflicts = [...new Set(flagged.filter((f) => f.confidence === 'CONFLICT').map((f) => f.field))];

  const signalsA = batchSignals(raw);
  const proposedUnknown = proposeClientMatch(signalsA, MATCH_INDEX, AIO_MATCH_SIGNALS);
  const proposed = proposeClientMatch(signalsA, MATCH_INDEX, AIO_MATCH_SIGNALS, 'client-d');
  const duplicateAttempt = confirmMatch(proposed, { action: 'CREATE_NEW_CLIENT', staff: STAFF, override_reason: null });
  const matchA = confirmMatch(proposed, { action: 'MATCH_TO_EXISTING', client_ref: 'client-d', staff: FOUNDER, reason: null });
  log('MATCH_PROPOSED', 'system:migration-pipeline', 'SYSTEM', '2026-10-01T15:03:00Z', BA, 'client-d', null, proposed.class);
  log('MATCH_CONFIRMED', FOUNDER, 'FOUNDER', '2026-10-02T15:30:00Z', BA, 'client-d', proposed.class, matchA.class);

  const beforeReview = planMigrationCommit({ match: { class: proposed.class, client_ref: proposed.chosen }, facts: raw, rules, approver: null });
  const decisions: Record<string, [ReviewDecision, { edited_value?: string; reason?: string }?]> = {
    A01: ['EDITED', { edited_value: 'BlueLine Transport LLC', reason: 'casing' }], A06: ['IGNORED', { reason: 'insurance producer’s phone printed on the certificate, not the carrier' }],
    A10: ['EDITED', { edited_value: 'PRP-101', reason: 'OCR read 0 as O' }], A16: ['MARKED_STALE', { reason: 'expired policy — kept as history' }],
    A18: ['NEEDS_CLIENT_CONFIRMATION', { reason: 'is this driver still with you?' }], A19: ['NEEDS_CLIENT_CONFIRMATION', { reason: 'low-confidence read' }],
    A20: ['REJECTED', { reason: 'OCR misread of the insured name' }],
  };
  const reviewed = raw.map((f) => { const [d, x] = decisions[f.fact_id] ?? ['CONFIRMED']; return decide(f, d, FOUNDER, x); });
  for (const f of reviewed) log(['REJECTED', 'IGNORED', 'MARKED_STALE'].includes(f.review.decision) ? 'FACT_REJECTED' : 'FACT_APPROVED', FOUNDER, 'FOUNDER', '2026-10-02T16:00:00Z', BA, f.fact_id, 'PENDING', f.review.decision);
  const provenanceGapCommit = planMigrationCommit({ match: matchA, facts: [...reviewed.slice(1), { ...reviewed[0], provenance: { ...reviewed[0].provenance, document_id: null } }], rules, approver: FOUNDER });
  const commitA = planMigrationCommit({ match: matchA, facts: reviewed, rules, approver: FOUNDER });
  const lineage = commitA.writes.find((w) => w.field === 'organization.usdot')!;
  const lineageDoc = docs.find((d) => d.document_id === lineage.provenance.document_id)!;

  // Vault: every readable, non-duplicate document is filed internal-only with lineage; the older COI is superseded, never deleted.
  const vault: VaultLineageRecord[] = docs.filter((d) => d.state === 'EXTRACTED').map((d) => ({
    client_id: 'client-d', organization_id: 'org-client-d', document_type: docClass(d.document_class)?.document_type ?? 'Unclassified Legacy', source_migration_batch: BA,
    original_filename: d.original_filename, sha256: d.sha256, ingested_at: d.ingested_at, document_date: d.document_date, effective_date: d.effective_date, expiration_date: d.expiration_date,
    classification: { proposed: d.document_class, confirmed: d.document_class, confirmed_by: FOUNDER }, review_status: 'REVIEWED',
    canonical_status: d.expiration_date && d.expiration_date < TODAY ? 'HISTORICAL' : 'CURRENT', superseded_by: null,
    extracted_fact_ids: reviewed.filter((f) => f.provenance.document_id === d.document_id).map((f) => f.fact_id),
    workspace_relationships: [docClass(d.document_class)?.workspace].filter((w): w is string => !!w),
  }));
  const oldCoi = vault.find((v) => v.original_filename.includes('COI 2025'))!;
  const vaultAfter = vault.map((v) => (v === oldCoi ? supersede(v, D(3)) : v));

  // Lifecycle
  const journey: JourneyStep[] = [];
  let A: LifecycleClient = { client_ref: 'client-d', entry_type: 'EXISTING_PREBUILT', lifecycle: 'KNOWN_UNMIGRATED', business_identity_id: null, conditions: { ...NO_CONDITIONS }, was_active: false };
  const actorFor = (from: ClientLifecycleState, to: ClientLifecycleState) => CLIENT_LIFECYCLE_TRANSITIONS.find((t) => t.from === from && t.to === to)!.actor;
  const actorId = { FOUNDER, STAFF, EXISTING_CLIENT: CLIENT_USER, NEW_CLIENT: 'client-user-new', SYSTEM: 'system:lifecycle' } as const;
  const move = (label: string, to: ClientLifecycleState, at: string) => {
    const role = actorFor(A.lifecycle, to);
    const before = A.lifecycle;
    const r = transitionClient(A, to);
    A = r.client;
    for (const e of r.events) log(e, actorId[role], role, at, 'lifecycle', A.client_ref, before, to);
    journey.push({ step: label, lifecycle: A.lifecycle, counted_active: isCountedActive(A), events: r.events });
  };
  const mark = (label: string) => journey.push({ step: label, lifecycle: A.lifecycle, counted_active: isCountedActive(A), events: [] });
  mark('KNOWN TO AIO');
  move('MIGRATION BATCH CREATED', 'MIGRATION_IN_PROGRESS', '2026-10-01T14:55:00Z');
  move('PROCESSED → REVIEW', 'MIGRATION_REVIEW_REQUIRED', '2026-10-01T15:03:00Z');
  const approveBeforeCommit = refusal(() => transitionClient(A, 'PREBUILT'));
  A = { ...A, business_identity_id: ID.D.aio, conditions: { ...A.conditions, CANONICAL_IDENTITY_EXISTS: true, REVIEW_OR_INTAKE_COMPLETE: commitA.allowed } };
  move('APPROVE MIGRATION', 'PREBUILT', '2026-10-02T16:10:00Z');
  const prebuiltToActive = refusal(() => transitionClient(A, 'ACTIVE'));
  const inviteBeforeProvisioning = refusal(() => transitionClient(A, 'INVITED'));
  const requiredSections = AIO_REVIEW_SECTIONS.filter((s) => s.required).length;
  const completenessA = (reviewed: number, started: boolean) => computeCompleteness({
    known_fields: [...new Set(commitA.writes.map((w) => w.field))], rules,
    vault: { current_on_file: vaultAfter.filter((x) => x.canonical_status === 'CURRENT').length, current_expected: vaultAfter.filter((x) => x.canonical_status === 'CURRENT').length, historical_on_file: vaultAfter.filter((x) => x.canonical_status !== 'CURRENT').length, migration_open: false, archive_done: false },
    review: { started, reviewed, required: requiredSections },
  });
  const completenessPrebuilt = completenessA(0, false);

  // Provisioning (prebuilt): confirmed relationships → PENDING_SETUP; document-only → KNOWN_REVIEW_NEEDED
  const relsA = serviceRelationships(reviewed, docs);
  const prebuiltWorkspaces = provisionWorkspaces(relsA, A.lifecycle);
  for (const w of prebuiltWorkspaces) log('WORKSPACE_PROVISIONED', 'system:provisioning', 'SYSTEM', '2026-10-02T16:12:00Z', 'provisioning', `client-d:${w.workspace_id}`, null, w.state);
  A = { ...A, conditions: { ...A.conditions, OFFICE_PROVISIONING_SUCCEEDED: true } };
  mark('OFFICE PROVISIONED');

  // Invitation
  const inviteFields = { company_name: 'BlueLine Transport LLC', business_identity_id: ID.D.aio, activation_link: 'https://aio.example/office-activation/«single-use token»', expires_at: '2026-10-10T14:00:00Z', support_contact: '(555) 010-0000' };
  const invite: ActivationInvite = { invite_id: 'INV-FIX-0104', business_identity_id: ID.D.aio, email: 'owner@blueline.example', token_sha256: sha(0x9001), issued_at: '2026-10-03T14:00:00Z', expires_at: '2026-10-10T14:00:00Z', state: 'SENT', single_use: true };
  move('INVITATION SENT', 'INVITED', '2026-10-03T14:00:00Z');
  const accept = {
    wrong_token: acceptInvite(invite, sha(0x1), '2026-10-04T18:00:00Z'),
    expired: acceptInvite(invite, sha(0x9001), '2026-10-11T09:00:00Z'),
    accepted: acceptInvite(invite, sha(0x9001), '2026-10-04T18:00:00Z'),
    reused: acceptInvite({ ...invite, state: 'ACCEPTED' }, sha(0x9001), '2026-10-04T18:05:00Z'),
  };
  A = { ...A, conditions: { ...A.conditions, AUTH_IDENTITY_LINKED: accept.accepted.ok, INVITATION_COMPLETED: accept.accepted.ok } };
  move('LINK OPENED + PASSWORD SET', 'CLIENT_CONFIRMATION_REQUIRED', '2026-10-04T18:00:00Z');
  const atConfirmation = A;
  const confirmBeforeReview = refusal(() => transitionClient(A, 'ACTIVE'));

  // Client review + what changed
  const incomplete: SectionAnswer[] = [
    { section_id: 'COMPANY', response: 'LOOKS_RIGHT', changes: [] },
    { section_id: 'VEHICLES', response: 'NEEDS_AN_UPDATE', changes: [] },
  ];
  const answers: SectionAnswer[] = [
    { section_id: 'COMPANY', response: 'LOOKS_RIGHT', changes: [] },
    { section_id: 'PEOPLE', response: 'NEEDS_AN_UPDATE', changes: ['CONTACT_INFO_CHANGED'] },
    { section_id: 'VEHICLES', response: 'NEEDS_AN_UPDATE', changes: ['BOUGHT_A_TRUCK'] },
    { section_id: 'ACTIVE_SERVICES', response: 'LOOKS_RIGHT', changes: [] },
    { section_id: 'DOCUMENTS', response: 'NOT_SURE', changes: [] },
  ];
  const reviewIncomplete = checkClientConfirmation(AIO_REVIEW_SECTIONS, incomplete, false);
  const reviewOk = checkClientConfirmation(AIO_REVIEW_SECTIONS, answers, true);
  const changes = [
    routeChange(shortcut('BOUGHT_A_TRUCK'), 'Unit 103 · VIN ending 4103 · bought 2026-09-20', CLIENT_USER, 'CHG-FIX-1'),
    routeChange(shortcut('CONTACT_INFO_CHANGED'), 'new dispatch phone', CLIENT_USER, 'CHG-FIX-2'),
  ];
  for (const c of changes) log('CLIENT_CHANGE_REPORTED', CLIENT_USER, 'EXISTING_CLIENT', '2026-10-04T18:20:00Z', 'client review', c.change_id, null, c.status);
  mark('REVIEW + WHAT CHANGED');
  A = { ...A, conditions: { ...A.conditions, CLIENT_REVIEWED_REQUIRED_SECTIONS: reviewOk.ok, CLIENT_CONFIRMED_CURRENT_TRUTH: reviewOk.ok, REQUIRED_CONSENTS_ACCEPTED: reviewOk.ok } };
  move('CONFIRM & ENTER MY OFFICE', 'ACTIVE', '2026-10-04T18:25:00Z');
  const activeWorkspaces = provisionWorkspaces(relsA, A.lifecycle);
  const completenessActive = completenessA(answers.filter((a) => a.response && AIO_REVIEW_SECTIONS.find((s) => s.section_id === a.section_id)?.required).length, true);

  const signalsD = demo('client-d').signals;
  const officeBefore = composeClientOffice(atConfirmation, provisionWorkspaces(relsA, atConfirmation.lifecycle), signalsD, demo('client-d').name);
  const officeAfter = composeClientOffice(A, activeWorkspaces, signalsD, demo('client-d').name);
  const firstSuggestion = officeAfter.workspaces_that_may_help[0]?.workspace_id ?? null;
  const duringCritical = firstSuggestion
    ? evaluateExpansion(AIO_WORKSPACES.find((w) => w.workspace_id === firstSuggestion)!, { client_id: 'client-d', name: demo('client-d').name, signals: signalsD, entitlements: Object.fromEntries(officeAfter.active_with_aio.map((w) => [w.workspace_id, { state: 'ACTIVE' as const, source: 'fixture' }])) }, AIO_WORKSPACES, { ...AFTER_ACTIVATION, critical_state: true })
    : null;
  const auditWithoutActor = refusal(() => auditRecord('CLIENT_ACTIVATED', '', 'SYSTEM', '2026-10-04T18:25:00Z', 'lifecycle', 'client-d'));

  /* ── B · unknown-client batches that must not merge ── */
  const weakOnly = proposeClientMatch({ LEGAL_NAME: [demo('client-g').name], PHONE: [ID.G.phone] }, MATCH_INDEX, AIO_MATCH_SIGNALS);
  const strongCollision = proposeClientMatch({ USDOT: [ID.B.usdot], VIN: [ID.D.vin1] }, MATCH_INDEX, AIO_MATCH_SIGNALS);
  const weakCommit = planMigrationCommit({ match: { class: weakOnly.class, client_ref: weakOnly.chosen }, facts: [], rules, approver: FOUNDER });
  const weakResolved = confirmMatch(weakOnly, { action: 'MATCH_TO_EXISTING', client_ref: 'client-g', staff: FOUNDER, reason: 'founder knows the owner; same phone and name' });

  /* ── C · a business AIO serves on paper but has no record of ── */
  const newCandidate = proposeClientMatch({ USDOT: [ID.NEW.usdot], LEGAL_NAME: ['Prairie Wind Logistics LLC (fixture)'] }, MATCH_INDEX, AIO_MATCH_SIGNALS);
  const newCreated = confirmMatch(newCandidate, { action: 'CREATE_NEW_CLIENT', staff: FOUNDER, override_reason: null });

  /* ── D · RidgeLine Carriers (client-g): known, nothing digitised ── */
  const BG = 'MB-FIX-0107';
  const gFacts = [
    fact(BG, 'G01', 'organization.legal_name', demo('client-g').name, staff(FOUNDER), 'HIGH'),
    fact(BG, 'G02', 'organization.usdot', ID.G.usdot, staff(FOUNDER), 'HIGH'),
    fact(BG, 'G03', 'organization.phone', ID.G.phone, staff(FOUNDER), 'HIGH'),
    fact(BG, 'G04', 'organization.email', 'office@ridgeline.example', staff(FOUNDER), 'HIGH'),
    fact(BG, 'G05', 'contacts.primary', 'R. Okafor (fixture)', staff(FOUNDER), 'HIGH'),
    ...Object.entries(demo('client-g').entitlements).filter(([, e]) => e.state === 'ACTIVE').map(([w], i) => fact(BG, `G${String(6 + i).padStart(2, '0')}`, 'service.relationship', w, staff(FOUNDER), 'HIGH', w)),
  ].map((f) => decide(f, 'CONFIRMED', FOUNDER));
  const matchG = confirmMatch(proposeClientMatch(batchSignals(gFacts), MATCH_INDEX, AIO_MATCH_SIGNALS, 'client-g'), { action: 'MATCH_TO_EXISTING', client_ref: 'client-g', staff: FOUNDER, reason: null });
  const commitG = planMigrationCommit({ match: matchG, facts: gFacts, rules, approver: FOUNDER });
  let G: LifecycleClient = { client_ref: 'client-g', entry_type: 'EXISTING_KNOWN_NOT_MIGRATED', lifecycle: 'KNOWN_UNMIGRATED', business_identity_id: null, conditions: { ...NO_CONDITIONS }, was_active: false };
  G = transitionClient(G, 'MIGRATION_IN_PROGRESS').client;
  G = transitionClient(G, 'MIGRATION_REVIEW_REQUIRED').client;
  G = transitionClient({ ...G, business_identity_id: ID.G.aio, conditions: { ...G.conditions, CANONICAL_IDENTITY_EXISTS: true, REVIEW_OR_INTAKE_COMPLETE: commitG.allowed } }, 'PREBUILT').client;
  const gWorkspaces = provisionWorkspaces(serviceRelationships(gFacts, []), G.lifecycle);
  G = { ...G, conditions: { ...G.conditions, OFFICE_PROVISIONING_SUCCEEDED: gWorkspaces.length > 0 } };
  const gInviteGuard = CLIENT_LIFECYCLE_TRANSITIONS.find((t) => t.from === 'PREBUILT' && t.to === 'INVITED')!.guard(G);
  const completenessG: Completeness = computeCompleteness({
    known_fields: [...new Set(commitG.writes.map((w) => w.field))], rules,
    vault: { current_on_file: 0, current_expected: 6, historical_on_file: 0, migration_open: false, archive_done: false },
    review: { started: false, reviewed: 0, required: requiredSections },
  });
  const welcomeG = completenessG.document_vault.state === 'NOT_STARTED' ? 'WE KNOW YOUR BUSINESS. YOUR DIGITAL OFFICE IS JUST GETTING STARTED.' : 'HERE’S WHAT AIO ALREADY KNOWS.';

  /* ── N · a new client converges into the same gate ── */
  let N: LifecycleClient = { client_ref: 'new-signup', entry_type: 'NEW_CLIENT', lifecycle: 'INTAKE_IN_PROGRESS', business_identity_id: 'AIO-CUS-000200', conditions: { ...NO_CONDITIONS, CANONICAL_IDENTITY_EXISTS: true, REVIEW_OR_INTAKE_COMPLETE: true, AUTH_IDENTITY_LINKED: true, INVITATION_COMPLETED: true, OFFICE_PROVISIONING_SUCCEEDED: true }, was_active: false };
  const newPath: ClientLifecycleState[] = [N.lifecycle];
  N = transitionClient(N, 'CLIENT_CONFIRMATION_REQUIRED').client; newPath.push(N.lifecycle);
  const newBeforeConfirm = refusal(() => transitionClient(N, 'ACTIVE'));
  N = transitionClient({ ...N, conditions: { ...ALL_CONDITIONS } }, 'ACTIVE').client; newPath.push(N.lifecycle);
  const crmConvertedImmediateActive = refusal(() => transitionClient({ ...N, lifecycle: 'INTAKE_IN_PROGRESS', was_active: false }, 'ACTIVE'));

  /* ── founder segmentation over a fixture roster ── */
  const lc = (client_ref: string, entry_type: LifecycleClient['entry_type'], lifecycle: ClientLifecycleState, conditions: Partial<Record<ActivationCondition, boolean>> = {}, was_active = false): LifecycleClient =>
    ({ client_ref, entry_type, lifecycle, business_identity_id: null, conditions: { ...NO_CONDITIONS, ...conditions }, was_active });
  const roster: { client: LifecycleClient; name: string; batch: BatchState | null; invite: InviteState | null; note: string }[] = [
    { client: A, name: demo('client-d').name, batch: 'APPROVED', invite: 'ACCEPTED', note: 'fixture A — confirmed and active' },
    { client: G, name: demo('client-g').name, batch: null, invite: null, note: 'fixture D — prebuilt from staff knowledge' },
    { client: lc('client-a', 'EXISTING_PREBUILT', 'INVITED', { CANONICAL_IDENTITY_EXISTS: true, REVIEW_OR_INTAKE_COMPLETE: true, OFFICE_PROVISIONING_SUCCEEDED: true }), name: demo('client-a').name, batch: 'APPROVED', invite: 'SENT', note: 'invited, link not opened' },
    { client: lc('client-b', 'EXISTING_PREBUILT', 'CLIENT_CONFIRMATION_REQUIRED', { CANONICAL_IDENTITY_EXISTS: true, REVIEW_OR_INTAKE_COMPLETE: true, AUTH_IDENTITY_LINKED: true, INVITATION_COMPLETED: true, OFFICE_PROVISIONING_SUCCEEDED: true }), name: demo('client-b').name, batch: 'APPROVED', invite: 'ACCEPTED', note: 'signed in, review not confirmed' },
    { client: lc('client-c', 'EXISTING_PREBUILT', 'MIGRATION_IN_PROGRESS'), name: demo('client-c').name, batch: 'PARTIAL', invite: null, note: 'some files failed' },
    { client: lc('client-f', 'EXISTING_KNOWN_NOT_MIGRATED', 'KNOWN_UNMIGRATED'), name: demo('client-f').name, batch: null, invite: null, note: 'known, nothing started' },
    { client: lc('client-e', 'EXISTING_PREBUILT', 'PAUSED', { ...ALL_CONDITIONS }, true), name: demo('client-e').name, batch: 'APPROVED', invite: 'ACCEPTED', note: 'was active, relationship paused' },
    { client: lc('shipper-demo-b', 'NEW_CLIENT', 'ACTIVE', { CANONICAL_IDENTITY_EXISTS: true, REVIEW_OR_INTAKE_COMPLETE: true }), name: demo('shipper-demo-b').name, batch: null, invite: null, note: 'legacy accountStatus active from staff CRM conversion — no client confirmation, never counted' },
    { client: lc('candidate-b', 'EXISTING_PREBUILT', 'MIGRATION_REVIEW_REQUIRED'), name: 'Unknown batch (weak signals only)', batch: 'REVIEW_REQUIRED', invite: null, note: 'fixture B — ambiguous identity' },
    { client: lc('candidate-c', 'EXISTING_PREBUILT', 'MIGRATION_IN_PROGRESS'), name: 'Prairie Wind Logistics LLC (fixture)', batch: 'PROCESSING', invite: null, note: 'fixture C — new client candidate' },
    { client: lc('intake-1', 'NEW_CLIENT', 'INTAKE_IN_PROGRESS'), name: 'New sign-up (fixture)', batch: null, invite: null, note: 'new client completing intake' },
  ];
  const rows = roster.map((r) => ({ client_ref: r.client.client_ref, name: r.name, lifecycle: r.client.lifecycle, segment: segmentOf(r.client, r.batch, r.invite), counted_active: isCountedActive(r.client), note: r.note }));
  const segmentCounts = Object.fromEntries(FOUNDER_CLIENT_SEGMENTS.map((s) => [s, rows.filter((r) => r.segment === s).length]));

  const covered = new Set(trail.map((t) => t.event));
  const founderEvents = LIFECYCLE_AUDIT_EVENTS.slice(0, 16);
  const v = (c: typeof AIO_CLIENT_MIGRATION) => validateExperienceContract(c).earned_completion;

  const CRITERIA: { criterion: string; pass: boolean; evidence: string }[] = [
    { criterion: 'existing client lifecycle defined', pass: CLIENT_LIFECYCLE_STATES.length === 10 && A.lifecycle === 'ACTIVE', evidence: `${CLIENT_LIFECYCLE_STATES.length} states · ${CLIENT_LIFECYCLE_TRANSITIONS.length} guarded transitions · fixture A walked KNOWN_UNMIGRATED → ACTIVE` },
    { criterion: 'PREBUILT does not equal ACTIVE', pass: !AIO_LIFECYCLE_MAPPING.find((m) => m.state === 'PREBUILT')!.counted_active && !isCountedActive(G) && prebuiltToActive?.code === 'NO_SUCH_TRANSITION', evidence: `PREBUILT → ACTIVE refused (${prebuiltToActive?.code}); RidgeLine PREBUILT counted active: ${isCountedActive(G)}` },
    { criterion: 'client confirmation is required for ACTIVE', pass: CLIENT_LIFECYCLE_TRANSITIONS.filter((t) => t.to === 'ACTIVE').every((t) => t.from === 'CLIENT_CONFIRMATION_REQUIRED' || t.from === 'PAUSED') && confirmBeforeReview?.code === 'GUARD_REFUSED' && newBeforeConfirm?.code === 'GUARD_REFUSED', evidence: `only CLIENT_CONFIRMATION_REQUIRED (or resuming PAUSED) reaches ACTIVE; confirm before review refused: ${confirmBeforeReview?.reasons.length} condition(s) missing` },
    { criterion: 'founder migration intake defined', pass: AIO_MIGRATION_INTAKE.workflow.length === 8 && AIO_MIGRATION_INTAKE.extends.routes.length > 0, evidence: `${AIO_MIGRATION_INTAKE.workflow.join(' → ')} · extends Physical Archive Migration` },
    { criterion: 'batch upload defined', pass: docs.length === 11 && batchAState === 'PARTIAL', evidence: `11-file batch (PDF / JPG / TIF) → ${batchAState}: ${docs.filter((d) => d.state === 'DUPLICATE').length} duplicate · ${docs.filter((d) => d.state === 'UNREADABLE').length} unreadable · ${docs.filter((d) => d.state === 'UNSUPPORTED').length} unsupported, none dropped` },
    { criterion: 'extraction pipeline defined', pass: MIGRATION_PIPELINE.length === 13 && MIGRATION_PIPELINE.every((s) => !s.writes_canonical), evidence: `${MIGRATION_PIPELINE.length} stages, none writes canonical truth; ${raw.length} facts proposed, ${conflicts.length} conflicting field(s) found` },
    { criterion: 'human review required', pass: !beforeReview.allowed && beforeReview.writes.length === 0, evidence: `commit before review refused (${beforeReview.refused.length} reason(s)), 0 writes` },
    { criterion: 'provenance required', pass: commitA.writes.every((w) => w.fact_id && w.reviewer && (w.provenance.document_id || w.provenance.supplied_by)) && !provenanceGapCommit.allowed, evidence: `every write carries fact + reviewer + source; a fact without its source document is refused` },
    { criterion: 'duplicate detection defined', pass: docs.some((d) => d.state === 'DUPLICATE' && d.duplicate_of === D(1)) && duplicateAttempt.refused.length > 0, evidence: `same SHA-256 linked to ${D(1)}; creating a new business beside a likely match refused` },
    { criterion: 'founder review defined', pass: REVIEW_ACTIONS.length === 9 && commitA.allowed && commitA.next_lifecycle === 'PREBUILT', evidence: `${REVIEW_ACTIONS.length} actions; APPROVE MIGRATION → ${commitA.next_lifecycle} (${commitA.writes.length} writes · ${commitA.client_review_items.length} client items · ${commitA.history_only.length} history only)` },
    { criterion: 'Vault lineage defined', pass: vaultAfter.length === vault.length && vaultAfter.some((x) => x.canonical_status === 'SUPERSEDED' && x.superseded_by === D(3)), evidence: `${vaultAfter.length} documents filed with batch + SHA-256 + facts; old COI SUPERSEDED, not deleted` },
    { criterion: 'office provisioning defined', pass: prebuiltWorkspaces.every((w) => w.state === 'PENDING_SETUP' || w.state === 'KNOWN_REVIEW_NEEDED') && inviteBeforeProvisioning?.code === 'GUARD_REFUSED', evidence: `prebuilt: ${prebuiltWorkspaces.map((w) => `${w.workspace_id} ${w.state}`).join(' · ')}; invite refused before provisioning` },
    { criterion: 'activation invite defined', pass: checkInviteMessage(inviteFields).ok && !checkInviteMessage({ ...inviteFields, usdot: ID.D.usdot }).ok && accept.accepted.ok && !accept.reused.ok && accept.expired.reason === 'ACTIVATION_EXPIRED', evidence: 'company · client ID · single-use link · expiry · support only; profile facts refused; reuse and expiry refused' },
    { criterion: 'secure password setup / magic-link contract defined', pass: AIO_AUTH_CONTRACT.flow.some((s) => s.includes('sets their own password')) && AIO_AUTH_CONTRACT.proposed.magic_link.length > 0, evidence: `${AIO_AUTH_CONTRACT.proposed.route} · token hash only · client sets password (updateUser) or magic link` },
    { criterion: 'permanent passwords are never emailed/texted', pass: PASSWORD_DELIVERY_FORBIDDEN.includes('EMAIL') && PASSWORD_DELIVERY_FORBIDDEN.includes('SMS') && !checkInviteMessage({ ...inviteFields, temporary_password: 'set on first login' }).ok, evidence: `forbidden channels: ${PASSWORD_DELIVERY_FORBIDDEN.join(' · ')}; an invite carrying a password is refused` },
    { criterion: 'existing-client welcome flow defined', pass: AIO_FIRST_LOGIN_STEPS[0].step === 'WELCOME' && AIO_FIRST_LOGIN_STEPS[AIO_FIRST_LOGIN_STEPS.length - 1].step === 'ENTER_OFFICE', evidence: `${AIO_FIRST_LOGIN_STEPS.map((s) => s.step).join(' → ')}; early invite: “${welcomeG}”` },
    { criterion: 'WHAT CHANGED flow defined', pass: AIO_WHAT_CHANGED.length === 10 && changes[0].status === 'AWAITING_STAFF' && changes[1].status === 'APPLIED_WITH_HISTORY', evidence: 'BOUGHT A TRUCK → staff reconcile; CONTACT INFO CHANGED → applied with history; no silent overwrite' },
    { criterion: 'new-client convergence defined', pass: newPath.join('→') === 'INTAKE_IN_PROGRESS→CLIENT_CONFIRMATION_REQUIRED→ACTIVE' && crmConvertedImmediateActive?.code === 'NO_SUCH_TRANSITION', evidence: `new client: ${newPath.join(' → ')} through the same gate; staff conversion cannot jump to ACTIVE` },
    { criterion: 'workspace provisioning integrated', pass: activeWorkspaces.filter((w) => w.state === 'ACTIVE').length === 4 && activeWorkspaces.every((w) => w.state !== 'ACTIVE' || relsA.find((r) => r.workspace_id === w.workspace_id)!.basis === 'STAFF_CONFIRMED_RELATIONSHIP'), evidence: `after confirm: ${activeWorkspaces.map((w) => `${w.workspace_id} ${w.state}`).join(' · ')} — documents alone never ACTIVE` },
    { criterion: 'contextual expansion integrated', pass: !officeBefore.composed && officeAfter.composed && officeAfter.workspaces_that_may_help.length > 0 && !!duringCritical?.suppressed_by.includes('CRITICAL_STATE'), evidence: `AFTER_ACTIVATION placement: ${officeAfter.workspaces_that_may_help.map((w) => w.workspace_id).join(' · ')}; nothing before confirmation; suppressed in a critical state` },
    { criterion: 'founder client-status segmentation defined', pass: rows.filter((r) => r.counted_active).length === 1 && new Set(rows.map((r) => r.segment)).size >= 9, evidence: `${rows.length} businesses known to AIO → ${rows.filter((r) => r.counted_active).length} counted active; ${new Set(rows.map((r) => r.segment)).size} segments in use` },
    { criterion: 'Experience Brain updated', pass: v(AIO_CLIENT_MIGRATION) === 'EXPERIENCE_COMPLETE' && v(AIO_CLIENT_ACTIVATION) === 'EXPERIENCE_COMPLETE' && founderEvents.every((e) => covered.has(e)), evidence: `${AIO_CLIENT_MIGRATION.feature_id} + ${AIO_CLIENT_ACTIVATION.feature_id} EXPERIENCE_COMPLETE; generic client-lifecycle model; ${founderEvents.length}/16 audit events emitted by the fixture` },
    { criterion: 'no page implementation', pass: AIO_FUTURE_AUTHORITY_FAMILIES.every((f) => f.authority_status === 'VISUAL_AUTHORITY_REQUIRED') && !AIO_MIGRATION_CONSTRAINTS.page_implementation && !AIO_MIGRATION_CONSTRAINTS.aio_code_changed, evidence: `${AIO_FUTURE_AUTHORITY_FAMILIES.length} future families, structure only; AIO code unchanged` },
    { criterion: 'no OpenArt', pass: !AIO_MIGRATION_CONSTRAINTS.openart_accessed && AIO_MIGRATION_CONSTRAINTS.new_paid_generations === 0, evidence: 'no OpenArt access, no generation of any kind' },
    { criterion: 'current IFTA lane not blocked', pass: validateExperienceContract(AIO_IFTA_CONTRACT).earned_completion === 'EXPERIENCE_COMPLETE' && activeWorkspaces.some((w) => w.workspace_id === 'IFTA' && w.state === 'ACTIVE') && !AIO_MIGRATION_CONSTRAINTS.ifta_lane_blocked, evidence: 'AIO.IFTA contract untouched and complete; migration only feeds IFTA (account + vehicles) after activation' },
  ];

  return {
    A_BLUELINE: {
      batch: { batch_id: BA, state: batchAState, documents: docs.map((d) => ({ document_id: d.document_id, file: d.original_filename, state: d.state, class: d.document_class, confidence: d.class_confidence, duplicate_of: d.duplicate_of })) },
      conflicts_found: conflicts,
      match: { unknown_client: proposedUnknown.class, selected_client: proposed.class, reasons: proposed.reasons, duplicate_create_refused: duplicateAttempt.refused, confirmed: matchA },
      before_review: { allowed: beforeReview.allowed, refused: beforeReview.refused, writes: beforeReview.writes.length },
      commit: { allowed: commitA.allowed, next_lifecycle: commitA.next_lifecycle, writes: commitA.writes.length, client_review_items: commitA.client_review_items, history_only: commitA.history_only },
      provenance_gap_refused: provenanceGapCommit.refused.filter((r) => r.includes('source document')),
      lineage: { source_document: lineageDoc.original_filename, page: lineage.provenance.page, region: lineage.provenance.region, fact: lineage.fact_id, confidence: reviewed.find((f) => f.fact_id === lineage.fact_id)!.confidence, reviewer: lineage.reviewer, decision: reviewed.find((f) => f.fact_id === lineage.fact_id)!.review.decision, canonical_field: lineage.target },
      vault: vaultAfter.map((x) => ({ file: x.original_filename, type: x.document_type, canonical_status: x.canonical_status, superseded_by: x.superseded_by, facts: x.extracted_fact_ids.length })),
      refusals: { approve_before_commit: approveBeforeCommit, prebuilt_to_active: prebuiltToActive, invite_before_provisioning: inviteBeforeProvisioning, confirm_before_review: confirmBeforeReview, audit_without_actor: auditWithoutActor },
      invite: { message_ok: checkInviteMessage(inviteFields), with_profile_fact: checkInviteMessage({ ...inviteFields, usdot: ID.D.usdot }), with_password: checkInviteMessage({ ...inviteFields, temporary_password: 'set on first login' }), accept },
      review: { incomplete: reviewIncomplete, final: reviewOk, changes },
      workspaces: { prebuilt: prebuiltWorkspaces, active: activeWorkspaces },
      completeness: { prebuilt: completenessPrebuilt, active: completenessActive },
    },
    B_AMBIGUOUS: { weak_only: { class: weakOnly.class, reasons: weakOnly.reasons }, strong_collision: { class: strongCollision.class, reasons: strongCollision.reasons }, commit_refused: weakCommit.refused, staff_resolution: weakResolved },
    C_NEW_CLIENT_CANDIDATE: { class: newCandidate.class, reasons: newCandidate.reasons, created: newCreated },
    D_KNOWN_NOT_MIGRATED: { lifecycle: G.lifecycle, counted_active: isCountedActive(G), commit: { allowed: commitG.allowed, writes: commitG.writes.length }, workspaces: gWorkspaces, can_invite_now: gInviteGuard.length === 0, welcome: welcomeG, completeness: completenessG },
    NEW_CLIENT_CONVERGENCE: { path: newPath, refused_before_confirm: newBeforeConfirm, staff_conversion_cannot_jump: crmConvertedImmediateActive },
    ACTIVATION_JOURNEY: { client: 'client-d', steps: journey },
    POST_ACTIVATION_OFFICE: { client: 'client-d', before_confirmation: officeBefore, after_activation: officeAfter, during_critical_state: duringCritical ? { workspace_id: duringCritical.workspace_id, suppressed_by: duringCritical.suppressed_by } : null },
    FOUNDER_SEGMENTS: { roster: rows, counts: segmentCounts, profiles_existing: rows.length, lifecycle_active_raw: rows.filter((r) => r.lifecycle === 'ACTIVE').length, counted_active: rows.filter((r) => r.counted_active).length },
    COMPLETENESS: completenessG,
    AUDIT: { records: trail.length, founder_events_covered: founderEvents.filter((e) => covered.has(e)), missing: founderEvents.filter((e) => !covered.has(e)) },
    CRITERIA,
  };
}
