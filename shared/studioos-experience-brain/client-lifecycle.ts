/**
 * Client lifecycle, migration and activation — the bridge from "known to the business" to "active digital client".
 *
 * Existing-client onboarding is NOT account creation. It is reconciliation between what the business already knows
 * and the client's current truth:
 *
 *   LEGACY FILE → MIGRATION INTAKE → EXTRACTION / CLASSIFICATION → STAFF REVIEW → PREBUILT PROFILE → VAULT
 *   → OFFICE PROVISIONING → ACTIVATION INVITE → CLIENT REVIEW → WHAT CHANGED? → CLIENT CONFIRMATION → ACTIVE
 *
 * Invariants (enforced by the pure functions below, never by convention):
 *   - A profile existing is not an active client. ACTIVE needs every activation condition, including client confirmation.
 *   - Nothing extracted from a document becomes canonical truth without a recorded human decision.
 *   - Every proposed or verified field keeps its lineage (source → page / region → fact → confidence → reviewer →
 *     decision → canonical field).
 *   - Uncertain identity is never merged automatically; a confident match is never duplicated.
 *   - Credentials come only from a secure, single-use activation link. Passwords are never generated or sent.
 *   - Business-profile, document-vault and client-review completeness are three separate measures.
 *
 * Project-agnostic: projects supply identifier kinds, field registries, document classes and section definitions.
 */
import type { ExperienceActor } from './schema.js';

/* ─────────────────────────────── actors + domains ─────────────────────────────── */

export const LIFECYCLE_DOMAINS = ['MIGRATION', 'CLIENT_IDENTITY', 'CLIENT_ACTIVATION', 'VAULT', 'CLIENT_OFFICE', 'WORKSPACE_PROVISIONING', 'EXPANSION'] as const;
export type LifecycleDomain = (typeof LIFECYCLE_DOMAINS)[number];

/** Lifecycle actors refine the four experience actors (the experience schema stays four-actor). */
export const LIFECYCLE_ACTORS: Record<'FOUNDER' | 'STAFF' | 'EXISTING_CLIENT' | 'NEW_CLIENT' | 'SYSTEM', { experience_actor: ExperienceActor; does: string }> = {
  FOUNDER: { experience_actor: 'FOUNDER_STAFF', does: 'approves migrations, resolves ambiguous identity, overrides with a recorded reason' },
  STAFF: { experience_actor: 'FOUNDER_STAFF', does: 'creates batches, uploads files, reviews facts, prepares and invites the client' },
  EXISTING_CLIENT: { experience_actor: 'CLIENT', does: 'activates the invitation, reviews what is known, reports what changed, confirms' },
  NEW_CLIENT: { experience_actor: 'CLIENT', does: 'signs up through intake; converges into the same identity, office and activation model' },
  SYSTEM: { experience_actor: 'SYSTEM', does: 'ingests, hashes, classifies, extracts, matches and scores; proposes, never commits' },
};
export type LifecycleActor = keyof typeof LIFECYCLE_ACTORS;

/* ─────────────────────────────── lifecycle ─────────────────────────────── */

export const CLIENT_LIFECYCLE_STATES = [
  'KNOWN_UNMIGRATED',
  'MIGRATION_IN_PROGRESS',
  'MIGRATION_REVIEW_REQUIRED',
  'INTAKE_IN_PROGRESS',
  'PREBUILT',
  'INVITED',
  'CLIENT_CONFIRMATION_REQUIRED',
  'ACTIVE',
  'PAUSED',
  'ENDED',
] as const;
export type ClientLifecycleState = (typeof CLIENT_LIFECYCLE_STATES)[number];

export const CLIENT_ENTRY_TYPES = ['NEW_CLIENT', 'EXISTING_PREBUILT', 'EXISTING_KNOWN_NOT_MIGRATED'] as const;
export type ClientEntryType = (typeof CLIENT_ENTRY_TYPES)[number];

/** What a business must have before it may be counted ACTIVE (all required). */
export const ACTIVATION_CONDITIONS = [
  'CANONICAL_IDENTITY_EXISTS',
  'REVIEW_OR_INTAKE_COMPLETE',
  'AUTH_IDENTITY_LINKED',
  'INVITATION_COMPLETED',
  'CLIENT_REVIEWED_REQUIRED_SECTIONS',
  'CLIENT_CONFIRMED_CURRENT_TRUTH',
  'REQUIRED_CONSENTS_ACCEPTED',
  'OFFICE_PROVISIONING_SUCCEEDED',
] as const;
export type ActivationCondition = (typeof ACTIVATION_CONDITIONS)[number];

export type LifecycleClient = {
  client_ref: string;
  entry_type: ClientEntryType;
  lifecycle: ClientLifecycleState;
  /** Durable business identity (never the email). Null until staff commit the identity. */
  business_identity_id: string | null;
  conditions: Record<ActivationCondition, boolean>;
  /** Paused / ended only exist for businesses that were active. */
  was_active: boolean;
};

/** For a new client the invitation step is their own verified sign-up; for an existing client it is the activation link. */
export function evaluateActivation(c: LifecycleClient): { ready: boolean; missing: ActivationCondition[] } {
  const missing = ACTIVATION_CONDITIONS.filter((k) => !c.conditions[k]);
  return { ready: missing.length === 0, missing };
}

/** The only rule any dashboard, count or queue may use. A prebuilt or invited client is never counted active. */
export const isCountedActive = (c: LifecycleClient) => c.lifecycle === 'ACTIVE' && evaluateActivation(c).ready;

export type LifecycleTransition = {
  from: ClientLifecycleState;
  to: ClientLifecycleState;
  trigger: string;
  actor: LifecycleActor;
  events: LifecycleAuditEvent[];
  /** Guard over the client record; returns the reasons the transition is refused (empty = allowed). */
  guard: (c: LifecycleClient) => string[];
  entry_types: ClientEntryType[];
};

const need = (cond: boolean, reason: string) => (cond ? [] : [reason]);
const EXISTING: ClientEntryType[] = ['EXISTING_PREBUILT', 'EXISTING_KNOWN_NOT_MIGRATED'];
const ALL_ENTRY: ClientEntryType[] = [...CLIENT_ENTRY_TYPES];

export const CLIENT_LIFECYCLE_TRANSITIONS: LifecycleTransition[] = [
  { from: 'KNOWN_UNMIGRATED', to: 'MIGRATION_IN_PROGRESS', trigger: 'staff opens a migration batch for the business', actor: 'STAFF', events: ['MIGRATION_BATCH_CREATED'], guard: () => [], entry_types: EXISTING },
  { from: 'MIGRATION_IN_PROGRESS', to: 'MIGRATION_REVIEW_REQUIRED', trigger: 'processing finished (all documents processed or marked as exceptions)', actor: 'SYSTEM', events: ['MATCH_PROPOSED'], guard: () => [], entry_types: EXISTING },
  { from: 'MIGRATION_REVIEW_REQUIRED', to: 'MIGRATION_IN_PROGRESS', trigger: 'staff adds files to the batch', actor: 'STAFF', events: ['DOCUMENT_INGESTED'], guard: () => [], entry_types: EXISTING },
  { from: 'MIGRATION_REVIEW_REQUIRED', to: 'PREBUILT', trigger: 'APPROVE MIGRATION (commit gate passed)', actor: 'FOUNDER', events: ['MIGRATION_APPROVED', 'CLIENT_PREBUILT'], guard: (c) => [...need(!!c.business_identity_id, 'identity not committed'), ...need(c.conditions.CANONICAL_IDENTITY_EXISTS, 'canonical identity missing'), ...need(c.conditions.REVIEW_OR_INTAKE_COMPLETE, 'migration review incomplete')], entry_types: EXISTING },
  { from: 'INTAKE_IN_PROGRESS', to: 'PREBUILT', trigger: 'staff convert a qualified lead into a prepared profile (staff-created, not active)', actor: 'STAFF', events: ['CLIENT_PREBUILT'], guard: (c) => [...need(!!c.business_identity_id, 'identity not committed'), ...need(c.conditions.REVIEW_OR_INTAKE_COMPLETE, 'intake incomplete')], entry_types: ['NEW_CLIENT'] },
  { from: 'INTAKE_IN_PROGRESS', to: 'CLIENT_CONFIRMATION_REQUIRED', trigger: 'new client submits intake from a verified sign-up', actor: 'NEW_CLIENT', events: ['CLIENT_REVIEW_STARTED'], guard: (c) => [...need(c.conditions.AUTH_IDENTITY_LINKED, 'sign-up not verified'), ...need(c.conditions.REVIEW_OR_INTAKE_COMPLETE, 'intake incomplete')], entry_types: ['NEW_CLIENT'] },
  { from: 'PREBUILT', to: 'INVITED', trigger: 'staff sends the activation invitation', actor: 'STAFF', events: ['INVITATION_SENT'], guard: (c) => [...need(!!c.business_identity_id, 'identity not committed — no credentials before identity matching'), ...need(c.conditions.OFFICE_PROVISIONING_SUCCEEDED, 'prebuilt office not provisioned')], entry_types: ALL_ENTRY },
  { from: 'INVITED', to: 'PREBUILT', trigger: 'invitation expired, failed delivery or was revoked', actor: 'SYSTEM', events: ['INVITATION_LAPSED'], guard: () => [], entry_types: ALL_ENTRY },
  { from: 'INVITED', to: 'CLIENT_CONFIRMATION_REQUIRED', trigger: 'client opens the link, verifies and sets a password (or completes magic-link sign-in)', actor: 'EXISTING_CLIENT', events: ['CLIENT_REVIEW_STARTED'], guard: (c) => [...need(c.conditions.AUTH_IDENTITY_LINKED, 'auth identity not linked'), ...need(c.conditions.INVITATION_COMPLETED, 'invitation not completed')], entry_types: ALL_ENTRY },
  {
    from: 'CLIENT_CONFIRMATION_REQUIRED', to: 'ACTIVE', trigger: 'CONFIRM & ENTER MY OFFICE', actor: 'EXISTING_CLIENT', events: ['CLIENT_CONFIRMED', 'CLIENT_ACTIVATED'],
    guard: (c) => evaluateActivation(c).missing.map((m) => `activation condition missing: ${m}`), entry_types: ALL_ENTRY,
  },
  { from: 'ACTIVE', to: 'PAUSED', trigger: 'staff pauses the relationship', actor: 'STAFF', events: ['CLIENT_PAUSED'], guard: (c) => need(c.was_active, 'only an active client can pause'), entry_types: ALL_ENTRY },
  { from: 'PAUSED', to: 'ACTIVE', trigger: 'staff resumes the relationship', actor: 'STAFF', events: ['CLIENT_RESUMED'], guard: (c) => evaluateActivation(c).missing.map((m) => `activation condition missing: ${m}`), entry_types: ALL_ENTRY },
  { from: 'ACTIVE', to: 'ENDED', trigger: 'relationship ends', actor: 'STAFF', events: ['CLIENT_ENDED'], guard: (c) => need(c.was_active, 'only an active client can end'), entry_types: ALL_ENTRY },
  { from: 'PAUSED', to: 'ENDED', trigger: 'relationship ends', actor: 'STAFF', events: ['CLIENT_ENDED'], guard: () => [], entry_types: ALL_ENTRY },
];

export class LifecycleError extends Error {
  constructor(public code: 'NO_SUCH_TRANSITION' | 'GUARD_REFUSED' | 'WRONG_ENTRY_TYPE', public reasons: string[]) { super(`${code}: ${reasons.join('; ')}`); }
}

/** Apply a lifecycle transition. ACTIVE is reachable only through CLIENT_CONFIRMATION_REQUIRED with every condition met. */
export function transitionClient(c: LifecycleClient, to: ClientLifecycleState): { client: LifecycleClient; events: LifecycleAuditEvent[] } {
  const t = CLIENT_LIFECYCLE_TRANSITIONS.find((x) => x.from === c.lifecycle && x.to === to);
  if (!t) throw new LifecycleError('NO_SUCH_TRANSITION', [`${c.lifecycle} → ${to}`]);
  if (!t.entry_types.includes(c.entry_type)) throw new LifecycleError('WRONG_ENTRY_TYPE', [`${c.entry_type} cannot ${c.lifecycle} → ${to}`]);
  const refused = t.guard(c);
  if (refused.length) throw new LifecycleError('GUARD_REFUSED', refused);
  return { client: { ...c, lifecycle: to, was_active: c.was_active || to === 'ACTIVE' }, events: t.events };
}

/* ─────────────────────────────── migration batch + documents ─────────────────────────────── */

export const MIGRATION_PIPELINE = [
  { stage: 'INGEST', does: 'accept the files (folder or multi-file upload); record filename, type, size, uploader, batch', writes_canonical: false, failure: 'UNSUPPORTED_DOCUMENT' },
  { stage: 'HASH', does: 'sha256 of the bytes', writes_canonical: false, failure: null },
  { stage: 'DUPLICATE_CHECK', does: 'same hash already in this batch or in the client’s vault → DUPLICATE (kept, linked, not re-extracted)', writes_canonical: false, failure: 'DUPLICATE_DOCUMENT' },
  { stage: 'DOCUMENT_TYPE_DETECTION', does: 'propose a document class with confidence; staff may reclassify', writes_canonical: false, failure: 'UNREADABLE_DOCUMENT' },
  { stage: 'TEXT_FIELD_EXTRACTION', does: 'text / fields per page with regions where available', writes_canonical: false, failure: 'EXTRACTION_FAILED' },
  { stage: 'ENTITY_EXTRACTION', does: 'business, people, vehicles, policies, accounts, dates', writes_canonical: false, failure: 'EXTRACTION_FAILED' },
  { stage: 'CLIENT_MATCHING', does: 'match the batch to one existing business or propose a new one', writes_canonical: false, failure: 'AMBIGUOUS_CLIENT_MATCH' },
  { stage: 'RECORD_MATCHING', does: 'match extracted vehicles / people / policies to existing records', writes_canonical: false, failure: null },
  { stage: 'STALENESS_ANALYSIS', does: 'expired or old evidence is marked possibly stale / stale', writes_canonical: false, failure: null },
  { stage: 'CONFLICT_ANALYSIS', does: 'different values for the same field are grouped as a conflict', writes_canonical: false, failure: 'CONFLICTING_FACTS' },
  { stage: 'CONFIDENCE_SCORING', does: 'HIGH / MEDIUM / LOW per fact; CONFLICT when values disagree', writes_canonical: false, failure: null },
  { stage: 'PROPOSED_PROFILE_MUTATIONS', does: 'a proposed change list (create / update / no-op) against current records', writes_canonical: false, failure: null },
  { stage: 'REVIEW_REQUIRED', does: 'everything waits for a human decision', writes_canonical: false, failure: null },
] as const;
export type PipelineStage = (typeof MIGRATION_PIPELINE)[number]['stage'];

export const MIGRATION_EXCEPTIONS = {
  UNREADABLE_DOCUMENT: { raised_at: 'DOCUMENT_TYPE_DETECTION', state: 'document UNREADABLE', handling: 'listed in review; staff rescans, reclassifies by hand or ignores — never silently dropped' },
  DUPLICATE_DOCUMENT: { raised_at: 'DUPLICATE_CHECK', state: 'document DUPLICATE', handling: 'linked to the original; not re-extracted; staff may keep or discard the copy' },
  AMBIGUOUS_CLIENT_MATCH: { raised_at: 'CLIENT_MATCHING', state: 'batch blocked', handling: 'staff must choose MATCH TO EXISTING or CREATE NEW CLIENT; approval refused until resolved' },
  CONFLICTING_FACTS: { raised_at: 'CONFLICT_ANALYSIS', state: 'fact group CONFLICT', handling: 'staff confirms one value and marks the others stale / ignored, or sends it to the client' },
  UNSUPPORTED_DOCUMENT: { raised_at: 'INGEST', state: 'document UNSUPPORTED', handling: 'file type outside policy; listed with the reason; staff converts and re-uploads' },
  EXTRACTION_FAILED: { raised_at: 'TEXT_FIELD_EXTRACTION', state: 'document EXTRACTION_FAILED', handling: 'document stays in the batch for manual review; facts may be entered by staff with provenance STAFF_ENTRY' },
  PARTIAL_BATCH: { raised_at: 'INGEST', state: 'batch PARTIAL', handling: 'some files failed upload or processing; batch shows counts and the failed files; review may proceed on the rest' },
  INVITE_DELIVERY_FAILED: { raised_at: 'INVITATION', state: 'invite DELIVERY_FAILED · lifecycle back to PREBUILT', handling: 'staff fixes the address or resends; founder sees it in PREBUILT NOT INVITED' },
  CLIENT_EMAIL_MISSING: { raised_at: 'INVITATION', state: 'invite blocked', handling: 'no deliverable login email; staff collects one — no invite and no credentials until then' },
  CLIENT_DECLINES_FACT: { raised_at: 'CLIENT_REVIEW', state: 'section NEEDS_UPDATE / fact disputed', handling: 'becomes a client change for staff reconciliation; the verified value is kept in history, never silently overwritten' },
  ACTIVATION_EXPIRED: { raised_at: 'INVITATION', state: 'invite EXPIRED · lifecycle back to PREBUILT', handling: 'single-use link expired; staff re-invites; a new token is issued and the old one stays invalid' },
} as const;
export type MigrationException = keyof typeof MIGRATION_EXCEPTIONS;

export const BATCH_STATES = ['CREATED', 'UPLOADING', 'PROCESSING', 'PARTIAL', 'REVIEW_REQUIRED', 'APPROVED', 'REJECTED', 'FAILED'] as const;
export type BatchState = (typeof BATCH_STATES)[number];

export const SOURCE_DOCUMENT_STATES = ['INGESTED', 'CLASSIFIED', 'EXTRACTED', 'DUPLICATE', 'UNREADABLE', 'UNSUPPORTED', 'EXTRACTION_FAILED'] as const;
export type SourceDocumentState = (typeof SOURCE_DOCUMENT_STATES)[number];

export type SourceDocument = {
  document_id: string;
  batch_id: string;
  original_filename: string;
  mime: string;
  bytes: number;
  sha256: string;
  ingested_at: string;
  state: SourceDocumentState;
  document_class: string | null;
  class_confidence: Confidence | null;
  duplicate_of: string | null;
  document_date: string | null;
  effective_date: string | null;
  expiration_date: string | null;
  pages: number | null;
};

export type MigrationBatch = {
  batch_id: string;
  /** The business the batch was opened for (null = unknown client — matching decides). */
  client_ref: string | null;
  state: BatchState;
  created_by: string;
  created_at: string;
  documents: SourceDocument[];
};

/** Hash duplicate check across the batch and the client's existing vault. Never re-extract a duplicate. */
export function markDuplicates(docs: SourceDocument[], vaultHashes: string[] = []): SourceDocument[] {
  const seen = new Map<string, string>(vaultHashes.map((h) => [h, `vault:${h.slice(0, 12)}`]));
  return docs.map((d) => {
    const first = seen.get(d.sha256);
    if (first) return { ...d, state: 'DUPLICATE', duplicate_of: first };
    seen.set(d.sha256, d.document_id);
    return d;
  });
}

export function batchState(b: MigrationBatch): BatchState {
  if (!b.documents.length) return b.state;
  const failed = b.documents.filter((d) => d.state === 'UNSUPPORTED' || d.state === 'EXTRACTION_FAILED' || d.state === 'UNREADABLE').length;
  const pending = b.documents.filter((d) => d.state === 'INGESTED').length;
  if (pending) return 'PROCESSING';
  if (failed === b.documents.length) return 'FAILED';
  return failed ? 'PARTIAL' : 'REVIEW_REQUIRED';
}

/* ─────────────────────────────── facts, provenance, confidence ─────────────────────────────── */

export const CONFIDENCE_LEVELS = ['HIGH', 'MEDIUM', 'LOW', 'CONFLICT'] as const;
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

export const FACT_SOURCES = ['DOCUMENT_EXTRACTION', 'STAFF_ENTRY', 'STAFF_KNOWLEDGE', 'EXISTING_RECORD', 'CLIENT_REPORTED'] as const;
export type FactSource = (typeof FACT_SOURCES)[number];

export const REVIEW_DECISIONS = ['PENDING', 'CONFIRMED', 'EDITED', 'IGNORED', 'MARKED_STALE', 'NEEDS_CLIENT_CONFIRMATION', 'REJECTED'] as const;
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

export const STALENESS = ['CURRENT', 'POSSIBLY_STALE', 'STALE', 'UNKNOWN'] as const;
export type Staleness = (typeof STALENESS)[number];

export type FactProvenance = {
  source: FactSource;
  document_id: string | null;
  page: number | null;
  region: string | null;
  /** Who supplied a non-document fact (staff id, client user id). */
  supplied_by: string | null;
  observed_on: string | null;
};

export type ExtractedFact = {
  fact_id: string;
  batch_id: string;
  /** Canonical field path in the project's field registry (e.g. organization.legal_name, vehicle[VIN].plate). */
  field: string;
  /** Record key for repeating entities (a VIN, a licence number); null for single-valued fields. */
  entity_key: string | null;
  value: string;
  provenance: FactProvenance;
  confidence: Confidence;
  staleness: Staleness;
  review: { decision: ReviewDecision; reviewer: string | null; decided_at: string | null; edited_value: string | null; reason: string | null };
  /** Set only by the commit gate. */
  canonical_ref: string | null;
};

/** Required lineage for every fact; a fact missing any link is refused by the commit gate. */
export function provenanceGaps(f: ExtractedFact): string[] {
  const p = f.provenance;
  const gaps: string[] = [];
  if (p.source === 'DOCUMENT_EXTRACTION' && !p.document_id) gaps.push('document extraction without a source document');
  if ((p.source === 'STAFF_ENTRY' || p.source === 'STAFF_KNOWLEDGE' || p.source === 'CLIENT_REPORTED') && !p.supplied_by) gaps.push(`${p.source} without who supplied it`);
  if (f.review.decision !== 'PENDING' && !f.review.reviewer) gaps.push('decision without a reviewer');
  if (f.review.decision === 'EDITED' && f.review.edited_value === null) gaps.push('edit without the edited value');
  return gaps;
}

/** Group facts by field + entity; more than one distinct live value is a CONFLICT (until staff resolve it). */
export function analyzeConflicts(facts: ExtractedFact[]): ExtractedFact[] {
  const live = (f: ExtractedFact) => !['IGNORED', 'MARKED_STALE', 'REJECTED'].includes(f.review.decision) && f.staleness !== 'STALE';
  const key = (f: ExtractedFact) => `${f.field}|${f.entity_key ?? ''}`;
  const norm = (v: string) => v.trim().toUpperCase().replace(/\s+/g, ' ');
  const groups = new Map<string, Set<string>>();
  for (const f of facts.filter(live)) groups.set(key(f), (groups.get(key(f)) ?? new Set()).add(norm(f.review.edited_value ?? f.value)));
  return facts.map((f) => (live(f) && (groups.get(key(f))?.size ?? 0) > 1 && f.review.decision === 'PENDING' ? { ...f, confidence: 'CONFLICT' } : f));
}

/** Expiry in the past → STALE; evidence older than the field's freshness window → POSSIBLY_STALE. */
export function assessStaleness(f: { observed_on: string | null; expires_on: string | null }, freshness_days: number | null, today: string): Staleness {
  if (f.expires_on && f.expires_on < today) return 'STALE';
  if (!f.observed_on) return 'UNKNOWN';
  if (freshness_days === null) return 'CURRENT';
  const age = (Date.parse(today) - Date.parse(f.observed_on)) / 86_400_000;
  return age > freshness_days ? 'POSSIBLY_STALE' : 'CURRENT';
}

/* ─────────────────────────────── client matching ─────────────────────────────── */

export const MATCH_CLASSES = ['MATCH_CONFIRMED', 'LIKELY_MATCH', 'AMBIGUOUS', 'NEW_CLIENT_CANDIDATE'] as const;
export type MatchClass = (typeof MATCH_CLASSES)[number];

/** Project-defined identifiers: STRONG ones identify a business on their own (registration numbers); WEAK ones only support. */
export type MatchSignalKind = { kind: string; strength: 'STRONG' | 'WEAK' };
export type MatchProfile = { client_ref: string; signals: Record<string, string[]> };

export type MatchResult = {
  class: MatchClass;
  candidates: { client_ref: string; strong: string[]; weak: string[]; strong_conflicts: string[] }[];
  chosen: string | null;
  reasons: string[];
  /** Staff must decide before the batch can be approved. */
  requires_staff_resolution: boolean;
};

const normSignal = (v: string) => v.trim().toUpperCase().replace(/[^A-Z0-9@.]/g, '');

/**
 * Propose a match. The system never returns MATCH_CONFIRMED by itself: confirmation is a staff decision
 * (confirmMatch). LIKELY_MATCH = exactly one business shares a strong identifier and none contradicts it.
 */
export function proposeClientMatch(batch: Record<string, string[]>, existing: MatchProfile[], kinds: MatchSignalKind[], selected: string | null = null): MatchResult {
  const strongKinds = kinds.filter((k) => k.strength === 'STRONG').map((k) => k.kind);
  const weakKinds = kinds.filter((k) => k.strength === 'WEAK').map((k) => k.kind);
  const has = (vals: string[] | undefined, v: string) => (vals ?? []).map(normSignal).includes(normSignal(v));
  const candidates = existing.map((p) => {
    const strong = strongKinds.flatMap((k) => (batch[k] ?? []).filter((v) => has(p.signals[k], v)).map((v) => `${k}:${v}`));
    const weak = weakKinds.flatMap((k) => (batch[k] ?? []).filter((v) => has(p.signals[k], v)).map((v) => `${k}:${v}`));
    const strong_conflicts = strongKinds.filter((k) => (batch[k] ?? []).length && (p.signals[k] ?? []).length && !(batch[k] ?? []).some((v) => has(p.signals[k], v))).map((k) => k);
    return { client_ref: p.client_ref, strong, weak, strong_conflicts };
  }).filter((c) => c.strong.length || c.weak.length);
  const strongHits = candidates.filter((c) => c.strong.length);
  // The batch was opened for a chosen business: evidence must agree with that choice (or be absent).
  if (selected) {
    const other = strongHits.filter((c) => c.client_ref !== selected);
    const mine = candidates.find((c) => c.client_ref === selected);
    const selProfile = existing.find((p) => p.client_ref === selected);
    const contradicted = strongKinds.filter((k) => (batch[k] ?? []).length && (selProfile?.signals[k] ?? []).length && !(batch[k] ?? []).some((v) => has(selProfile!.signals[k], v)));
    if (other.length || contradicted.length) return { class: 'AMBIGUOUS', candidates, chosen: null, reasons: [`evidence does not agree with the selected business (${[...other.map((o) => o.client_ref), ...contradicted].join(', ')})`], requires_staff_resolution: true };
    return { class: 'LIKELY_MATCH', candidates, chosen: selected, reasons: [mine?.strong.length ? `selected by staff; strong identifier agrees: ${mine.strong.join(', ')}` : 'selected by staff; no contradicting identifier in the batch'], requires_staff_resolution: true };
  }
  if (strongHits.length === 1 && !strongHits[0].strong_conflicts.length) {
    return { class: 'LIKELY_MATCH', candidates, chosen: strongHits[0].client_ref, reasons: [`strong identifier match: ${strongHits[0].strong.join(', ')}`], requires_staff_resolution: true };
  }
  if (strongHits.length > 1) return { class: 'AMBIGUOUS', candidates, chosen: null, reasons: ['strong identifiers point to more than one business'], requires_staff_resolution: true };
  if (strongHits.length === 1) return { class: 'AMBIGUOUS', candidates, chosen: null, reasons: [`strong identifier match contradicted by ${strongHits[0].strong_conflicts.join(', ')}`], requires_staff_resolution: true };
  if (candidates.length) return { class: 'AMBIGUOUS', candidates, chosen: null, reasons: ['only weak signals match (name / phone / email / address)'], requires_staff_resolution: true };
  return { class: 'NEW_CLIENT_CANDIDATE', candidates, chosen: null, reasons: ['no existing business shares any signal'], requires_staff_resolution: true };
}

export type MatchDecision =
  | { action: 'MATCH_TO_EXISTING'; client_ref: string; staff: string; reason: string | null }
  | { action: 'CREATE_NEW_CLIENT'; staff: string; override_reason: string | null };

/** Staff resolution. Creating a new business while a likely match exists needs an explicit recorded reason (no silent duplicates). */
export function confirmMatch(m: MatchResult, d: MatchDecision): { class: MatchClass; client_ref: string | null; refused: string[] } {
  if (d.action === 'MATCH_TO_EXISTING') {
    const known = m.chosen === d.client_ref || m.candidates.some((c) => c.client_ref === d.client_ref);
    if (!known && !d.reason) return { class: m.class, client_ref: null, refused: ['business is not a match candidate — matching it needs a recorded reason'] };
    return { class: 'MATCH_CONFIRMED', client_ref: d.client_ref, refused: [] };
  }
  if ((m.class === 'LIKELY_MATCH' || m.candidates.some((c) => c.strong.length)) && !d.override_reason) return { class: m.class, client_ref: null, refused: ['a likely match exists — creating a new business needs a recorded reason'] };
  return { class: 'MATCH_CONFIRMED', client_ref: null, refused: [] };
}

/* ─────────────────────────────── review + commit gate ─────────────────────────────── */

export const REVIEW_ACTIONS = ['CONFIRM', 'EDIT', 'IGNORE', 'MARK_STALE', 'NEEDS_CLIENT_CONFIRMATION', 'RECLASSIFY', 'MATCH_TO_EXISTING', 'CREATE_NEW_CLIENT', 'REJECT_EXTRACTION'] as const;
export type ReviewAction = (typeof REVIEW_ACTIONS)[number];

export type FieldRule = {
  field: string;
  domain: string;
  /** Where a verified value is written (project table / field) — or null when no canonical home exists yet. */
  canonical_target: string | null;
  current_truth_priority: 1 | 2 | 3;
  required_for_prebuilt: boolean;
  required_for_activation: boolean;
  freshness_days: number | null;
};

export type CommitPlan = {
  allowed: boolean;
  refused: string[];
  writes: { field: string; entity_key: string | null; value: string; target: string; fact_id: string; provenance: FactProvenance; reviewer: string }[];
  client_review_items: { field: string; entity_key: string | null; value: string; fact_id: string }[];
  history_only: { fact_id: string; decision: ReviewDecision }[];
  next_lifecycle: ClientLifecycleState | null;
};

/**
 * APPROVE MIGRATION. Writes happen only for CONFIRMED / EDITED facts with full provenance; nothing PENDING or in
 * CONFLICT may remain; identity must be resolved; required prebuilt fields must be confirmed. Result: PREBUILT (never ACTIVE).
 */
export function planMigrationCommit(input: { match: { class: MatchClass; client_ref: string | null }; facts: ExtractedFact[]; rules: FieldRule[]; approver: string | null }): CommitPlan {
  const refused: string[] = [];
  if (input.match.class !== 'MATCH_CONFIRMED') refused.push(`identity not resolved (${input.match.class})`);
  if (!input.approver) refused.push('no approver');
  const facts = analyzeConflicts(input.facts);
  const pending = facts.filter((f) => f.review.decision === 'PENDING');
  if (pending.length) refused.push(`${pending.length} fact(s) without a decision`);
  const conflicts = facts.filter((f) => f.confidence === 'CONFLICT' && f.review.decision === 'PENDING');
  if (conflicts.length) refused.push(`${new Set(conflicts.map((f) => f.field)).size} conflicting field(s) unresolved`);
  for (const f of facts) for (const g of provenanceGaps(f)) refused.push(`${f.fact_id}: ${g}`);
  const accepted = facts.filter((f) => f.review.decision === 'CONFIRMED' || f.review.decision === 'EDITED');
  const ruleOf = (field: string) => input.rules.find((r) => r.field === field);
  for (const r of input.rules.filter((x) => x.required_for_prebuilt)) if (!accepted.some((f) => f.field === r.field)) refused.push(`required field not confirmed: ${r.field}`);
  const writes = accepted.flatMap((f) => {
    const r = ruleOf(f.field);
    if (!r?.canonical_target) return [];
    return [{ field: f.field, entity_key: f.entity_key, value: f.review.edited_value ?? f.value, target: r.canonical_target, fact_id: f.fact_id, provenance: f.provenance, reviewer: f.review.reviewer! }];
  });
  const unmapped = accepted.filter((f) => !ruleOf(f.field)?.canonical_target).map((f) => f.field);
  if (unmapped.length) refused.push(`no canonical home for: ${[...new Set(unmapped)].join(', ')}`);
  const allowed = refused.length === 0;
  return {
    allowed, refused,
    writes: allowed ? writes : [],
    client_review_items: facts.filter((f) => f.review.decision === 'NEEDS_CLIENT_CONFIRMATION').map((f) => ({ field: f.field, entity_key: f.entity_key, value: f.value, fact_id: f.fact_id })),
    history_only: facts.filter((f) => ['IGNORED', 'MARKED_STALE', 'REJECTED'].includes(f.review.decision)).map((f) => ({ fact_id: f.fact_id, decision: f.review.decision })),
    next_lifecycle: allowed ? 'PREBUILT' : null,
  };
}

/* ─────────────────────────────── completeness (three separate measures) ─────────────────────────────── */

export const VAULT_COMPLETENESS_STATES = ['NOT_STARTED', 'MIGRATION_IN_PROGRESS', 'CURRENT_DOCUMENTS_ON_FILE', 'ARCHIVE_COMPLETE'] as const;
export const CLIENT_REVIEW_STATES = ['NOT_STARTED', 'REQUIRED', 'IN_PROGRESS', 'COMPLETE'] as const;

export type Completeness = {
  business_profile: { known: number; required: number; pct: number; missing: string[] };
  document_vault: { state: (typeof VAULT_COMPLETENESS_STATES)[number]; current_on_file: number; current_expected: number; historical_on_file: number };
  client_review: { state: (typeof CLIENT_REVIEW_STATES)[number]; reviewed: number; required: number };
};

/**
 * Business-profile completeness counts known current-truth fields from ANY verified source (staff knowledge, existing
 * records, documents, client reports) — an empty vault never makes a profile 0 %.
 */
export function computeCompleteness(input: {
  known_fields: string[];
  rules: FieldRule[];
  vault: { current_on_file: number; current_expected: number; historical_on_file: number; migration_open: boolean; archive_done: boolean };
  review: { started: boolean; reviewed: number; required: number };
}): Completeness {
  const req = input.rules.filter((r) => r.required_for_activation).map((r) => r.field);
  const known = req.filter((f) => input.known_fields.includes(f));
  const v = input.vault;
  const vaultState = v.archive_done ? 'ARCHIVE_COMPLETE' : v.current_expected > 0 && v.current_on_file >= v.current_expected ? 'CURRENT_DOCUMENTS_ON_FILE' : v.migration_open || v.current_on_file + v.historical_on_file > 0 ? 'MIGRATION_IN_PROGRESS' : 'NOT_STARTED';
  const r = input.review;
  const reviewState = r.required > 0 && r.reviewed >= r.required ? 'COMPLETE' : r.started ? 'IN_PROGRESS' : r.required > 0 ? 'REQUIRED' : 'NOT_STARTED';
  return {
    business_profile: { known: known.length, required: req.length, pct: req.length ? Math.floor((known.length / req.length) * 100) : 0, missing: req.filter((f) => !known.includes(f)) },
    document_vault: { state: vaultState, current_on_file: v.current_on_file, current_expected: v.current_expected, historical_on_file: v.historical_on_file },
    client_review: { state: reviewState, reviewed: r.reviewed, required: r.required },
  };
}

/* ─────────────────────────────── vault lineage ─────────────────────────────── */

export const CANONICAL_DOCUMENT_STATUSES = ['UNVERIFIED', 'CURRENT', 'SUPERSEDED', 'HISTORICAL', 'REJECTED'] as const;
export type CanonicalDocumentStatus = (typeof CANONICAL_DOCUMENT_STATUSES)[number];

export type VaultLineageRecord = {
  client_id: string;
  organization_id: string;
  document_type: string;
  source_migration_batch: string | null;
  original_filename: string;
  sha256: string;
  ingested_at: string;
  document_date: string | null;
  effective_date: string | null;
  expiration_date: string | null;
  classification: { proposed: string | null; confirmed: string | null; confirmed_by: string | null };
  review_status: 'PENDING' | 'REVIEWED' | 'REJECTED';
  canonical_status: CanonicalDocumentStatus;
  superseded_by: string | null;
  extracted_fact_ids: string[];
  workspace_relationships: string[];
};

/** A newer current document supersedes the older one; nothing is ever deleted because something newer exists. */
export function supersede(older: VaultLineageRecord, newerId: string): VaultLineageRecord {
  return { ...older, canonical_status: 'SUPERSEDED', superseded_by: newerId };
}

/* ─────────────────────────────── identity + activation invitation ─────────────────────────────── */

export type ClientIdentity = {
  /** Durable business identity, issued once, never reused, never derived from an email. */
  business_identity_id: string;
  organization_ref: string;
  /** Deliverable login email (authentication); replaceable only through a verified credential-change flow. */
  login_email: string | null;
  /** Optional branded alias — separate from identity and login; never required to authenticate. */
  alias: string | null;
};

export const INVITE_STATES = ['PENDING', 'SENT', 'DELIVERY_FAILED', 'OPENED', 'ACCEPTED', 'EXPIRED', 'REVOKED'] as const;
export type InviteState = (typeof INVITE_STATES)[number];

export type ActivationInvite = {
  invite_id: string;
  business_identity_id: string;
  email: string;
  /** Only the hash of the single-use token is stored. */
  token_sha256: string;
  issued_at: string;
  expires_at: string;
  state: InviteState;
  single_use: true;
};

/** What the invitation message may contain. Profile facts, documents and any credential are forbidden. */
export const INVITE_MESSAGE_ALLOWED = ['company_name', 'business_identity_id', 'activation_link', 'expires_at', 'support_contact'] as const;
export const PASSWORD_DELIVERY_FORBIDDEN = ['EMAIL', 'SMS', 'PHONE_NOTE', 'LETTER', 'STAFF_VERBAL'] as const;

export function checkInviteMessage(fields: Record<string, string>): { ok: boolean; forbidden: string[] } {
  const forbidden = Object.keys(fields).filter((k) => !(INVITE_MESSAGE_ALLOWED as readonly string[]).includes(k));
  const leaks = Object.values(fields).some((v) => /password|passcode|temp(orary)?\s*pass/i.test(v));
  return { ok: !forbidden.length && !leaks, forbidden: [...forbidden, ...(leaks ? ['credential text in message'] : [])] };
}

/** Invitation acceptance: token must match, be unexpired and unused; the client sets their own password (or uses a magic link). */
export function acceptInvite(inv: ActivationInvite, presentedTokenSha256: string, now: string): { ok: boolean; state: InviteState; reason: string | null } {
  if (inv.state === 'ACCEPTED' || inv.state === 'REVOKED') return { ok: false, state: inv.state, reason: 'link already used or revoked' };
  if (now > inv.expires_at) return { ok: false, state: 'EXPIRED', reason: 'ACTIVATION_EXPIRED' };
  if (presentedTokenSha256 !== inv.token_sha256) return { ok: false, state: inv.state, reason: 'token mismatch' };
  return { ok: true, state: 'ACCEPTED', reason: null };
}

/* ─────────────────────────────── client review + what changed ─────────────────────────────── */

export const REVIEW_RESPONSES = ['LOOKS_RIGHT', 'NEEDS_AN_UPDATE', 'NOT_SURE'] as const;
export type ReviewResponse = (typeof REVIEW_RESPONSES)[number];

export type ReviewSection = { section_id: string; label: string; required: boolean };
export type SectionAnswer = { section_id: string; response: ReviewResponse | null; changes: string[] };

export type ChangeShortcut = {
  shortcut_id: string;
  label: string;
  section_id: string | null;
  routes_to: string;
  reconciliation: 'APPLY_WITH_HISTORY' | 'STAFF_RECONCILE' | 'NONE';
  affects: string[];
};

export type ClientChange = { change_id: string; shortcut_id: string; section_id: string | null; detail: string; reported_by: string; reconciliation: ChangeShortcut['reconciliation']; status: 'REPORTED' | 'APPLIED_WITH_HISTORY' | 'AWAITING_STAFF' | 'RECONCILED' };

/**
 * CONFIRM & ENTER MY OFFICE. Every required section answered; every NEEDS_AN_UPDATE section carries a reported
 * change; NOT_SURE is allowed (it becomes an AIO follow-up, never a silent acceptance).
 */
export function checkClientConfirmation(sections: ReviewSection[], answers: SectionAnswer[], consentsAccepted: boolean): { ok: boolean; missing: string[]; follow_ups: string[] } {
  const missing: string[] = [];
  for (const s of sections.filter((x) => x.required)) {
    const a = answers.find((x) => x.section_id === s.section_id);
    if (!a?.response) missing.push(`${s.section_id}: not reviewed`);
    else if (a.response === 'NEEDS_AN_UPDATE' && !a.changes.length) missing.push(`${s.section_id}: update requested but nothing reported`);
  }
  if (!consentsAccepted) missing.push('required consents not accepted');
  return { ok: !missing.length, missing, follow_ups: answers.filter((a) => a.response === 'NOT_SURE').map((a) => a.section_id) };
}

/** A client-reported change never silently overwrites a verified fact: low-risk changes apply with history, the rest wait for staff. */
export function routeChange(shortcut: ChangeShortcut, detail: string, reported_by: string, id: string): ClientChange {
  const status = shortcut.reconciliation === 'APPLY_WITH_HISTORY' ? 'APPLIED_WITH_HISTORY' : shortcut.reconciliation === 'STAFF_RECONCILE' ? 'AWAITING_STAFF' : 'RECONCILED';
  return { change_id: id, shortcut_id: shortcut.shortcut_id, section_id: shortcut.section_id, detail, reported_by, reconciliation: shortcut.reconciliation, status };
}

/* ─────────────────────────────── provisioning ─────────────────────────────── */

export type ServiceRelationship = {
  workspace_id: string;
  /** Evidence alone (a document) is never a service relationship. */
  basis: 'STAFF_CONFIRMED_RELATIONSHIP' | 'DOCUMENT_EVIDENCE_ONLY' | 'CLIENT_REPORTED';
  confirmed_by: string | null;
};

export type ProvisionedWorkspace = {
  workspace_id: string;
  state: 'PENDING_SETUP' | 'ACTIVE' | 'AVAILABLE_NOT_ACTIVATED' | 'KNOWN_REVIEW_NEEDED';
  reason: string;
};

/**
 * Workspace provisioning for a prebuilt office. A staff-confirmed relationship provisions the workspace shell as
 * PENDING_SETUP until the client confirms; it becomes ACTIVE only with an ACTIVE client. Document evidence alone
 * becomes "we also know about … — review needed", never ACTIVE.
 */
export function provisionWorkspaces(relationships: ServiceRelationship[], lifecycle: ClientLifecycleState): ProvisionedWorkspace[] {
  return relationships.map((r) => {
    if (r.basis === 'STAFF_CONFIRMED_RELATIONSHIP' && r.confirmed_by) {
      return lifecycle === 'ACTIVE'
        ? { workspace_id: r.workspace_id, state: 'ACTIVE', reason: `relationship confirmed by ${r.confirmed_by}; client active` }
        : { workspace_id: r.workspace_id, state: 'PENDING_SETUP', reason: 'relationship confirmed by staff; waits for client confirmation' };
    }
    return { workspace_id: r.workspace_id, state: 'KNOWN_REVIEW_NEEDED', reason: r.basis === 'DOCUMENT_EVIDENCE_ONLY' ? 'documents on file, no confirmed service relationship' : 'client-reported; staff confirm the relationship' };
  });
}

/* ─────────────────────────────── founder status segmentation ─────────────────────────────── */

export const FOUNDER_CLIENT_SEGMENTS = ['KNOWN', 'MIGRATING', 'MIGRATION_REVIEW', 'MIGRATION_FAILED_NEEDS_REVIEW', 'PREBUILT_NOT_INVITED', 'INVITATION_SENT', 'WAITING_FOR_CLIENT', 'ACTIVE', 'PAUSED', 'ENDED', 'NEW_CLIENT_INTAKE'] as const;
export type FounderClientSegment = (typeof FOUNDER_CLIENT_SEGMENTS)[number];

export function segmentOf(c: LifecycleClient, batch: BatchState | null, invite: InviteState | null): FounderClientSegment {
  switch (c.lifecycle) {
    case 'KNOWN_UNMIGRATED': return 'KNOWN';
    case 'MIGRATION_IN_PROGRESS': return batch === 'FAILED' || batch === 'PARTIAL' ? 'MIGRATION_FAILED_NEEDS_REVIEW' : 'MIGRATING';
    case 'MIGRATION_REVIEW_REQUIRED': return batch === 'FAILED' ? 'MIGRATION_FAILED_NEEDS_REVIEW' : 'MIGRATION_REVIEW';
    case 'INTAKE_IN_PROGRESS': return 'NEW_CLIENT_INTAKE';
    case 'PREBUILT': return 'PREBUILT_NOT_INVITED';
    case 'INVITED': return invite === 'DELIVERY_FAILED' || invite === 'EXPIRED' ? 'PREBUILT_NOT_INVITED' : 'INVITATION_SENT';
    case 'CLIENT_CONFIRMATION_REQUIRED': return 'WAITING_FOR_CLIENT';
    case 'ACTIVE': return isCountedActive(c) ? 'ACTIVE' : 'WAITING_FOR_CLIENT';
    case 'PAUSED': return 'PAUSED';
    case 'ENDED': return 'ENDED';
  }
}

/* ─────────────────────────────── audit events ─────────────────────────────── */

export const LIFECYCLE_AUDIT_EVENTS = [
  'MIGRATION_BATCH_CREATED', 'DOCUMENT_INGESTED', 'DOCUMENT_CLASSIFIED', 'FACT_EXTRACTED', 'MATCH_PROPOSED', 'MATCH_CONFIRMED',
  'FACT_APPROVED', 'FACT_REJECTED', 'MIGRATION_APPROVED', 'CLIENT_PREBUILT', 'INVITATION_SENT', 'CLIENT_REVIEW_STARTED',
  'CLIENT_CHANGE_REPORTED', 'CLIENT_CONFIRMED', 'CLIENT_ACTIVATED', 'WORKSPACE_PROVISIONED',
  /* lifecycle bookkeeping beyond the founder's list */
  'INVITATION_LAPSED', 'CLIENT_PAUSED', 'CLIENT_RESUMED', 'CLIENT_ENDED',
] as const;
export type LifecycleAuditEvent = (typeof LIFECYCLE_AUDIT_EVENTS)[number];

export type LifecycleAuditRecord = { event: LifecycleAuditEvent; actor: string; actor_role: LifecycleActor; at: string; source: string; subject: string; before: unknown; after: unknown };

export function auditRecord(event: LifecycleAuditEvent, actor: string, actor_role: LifecycleActor, at: string, source: string, subject: string, before: unknown = null, after: unknown = null): LifecycleAuditRecord {
  if (!actor || !at || !source) throw new Error('audit record needs actor, timestamp and source');
  return { event, actor, actor_role, at, source, subject, before, after };
}
