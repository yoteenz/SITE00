/**
 * Generic client lifecycle / migration / activation model (shared/studioos-experience-brain/client-lifecycle.ts).
 * Project-agnostic invariants: PROFILE EXISTS ≠ ACTIVE; no unreviewed fact becomes truth; lineage is never lost;
 * uncertain identity is never merged; credentials never travel in messages.
 */
import { describe, expect, it } from 'vitest';
import {
  ACTIVATION_CONDITIONS,
  CLIENT_LIFECYCLE_TRANSITIONS,
  LifecycleError,
  MIGRATION_PIPELINE,
  acceptInvite,
  analyzeConflicts,
  assessStaleness,
  auditRecord,
  batchState,
  checkClientConfirmation,
  checkInviteMessage,
  computeCompleteness,
  confirmMatch,
  evaluateActivation,
  isCountedActive,
  markDuplicates,
  planMigrationCommit,
  proposeClientMatch,
  provenanceGaps,
  provisionWorkspaces,
  routeChange,
  segmentOf,
  supersede,
  transitionClient,
  type ExtractedFact,
  type FieldRule,
  type LifecycleClient,
  type SourceDocument,
} from '../shared/studioos-experience-brain/index';

const allConditions = (v: boolean) => Object.fromEntries(ACTIVATION_CONDITIONS.map((k) => [k, v])) as LifecycleClient['conditions'];
const client = (over: Partial<LifecycleClient> = {}): LifecycleClient => ({ client_ref: 'c1', entry_type: 'EXISTING_PREBUILT', lifecycle: 'KNOWN_UNMIGRATED', business_identity_id: null, conditions: allConditions(false), was_active: false, ...over });
const fact = (id: string, field: string, value: string, over: Partial<ExtractedFact> = {}): ExtractedFact => ({
  fact_id: id, batch_id: 'b1', field, entity_key: null, value,
  provenance: { source: 'DOCUMENT_EXTRACTION', document_id: 'd1', page: 1, region: null, supplied_by: null, observed_on: '2026-06-01' },
  confidence: 'HIGH', staleness: 'CURRENT', review: { decision: 'PENDING', reviewer: null, decided_at: null, edited_value: null, reason: null }, canonical_ref: null, ...over,
});
const decided = (f: ExtractedFact, decision: ExtractedFact['review']['decision'], edited: string | null = null): ExtractedFact => ({ ...f, review: { decision, reviewer: 'staff-1', decided_at: '2026-10-06', edited_value: edited, reason: null } });
const RULES: FieldRule[] = [
  { field: 'organization.legal_name', domain: 'COMPANY', canonical_target: 'org.name', current_truth_priority: 1, required_for_prebuilt: true, required_for_activation: true, freshness_days: null },
  { field: 'organization.phone', domain: 'COMPANY', canonical_target: 'org.phone', current_truth_priority: 1, required_for_prebuilt: false, required_for_activation: true, freshness_days: 365 },
  { field: 'organization.history_note', domain: 'COMPANY', canonical_target: null, current_truth_priority: 3, required_for_prebuilt: false, required_for_activation: false, freshness_days: null },
];

describe('lifecycle: PROFILE EXISTS ≠ ACTIVE', () => {
  it('ACTIVE needs every activation condition, reached only through client confirmation', () => {
    const prebuilt = client({ lifecycle: 'PREBUILT', business_identity_id: 'B-1', conditions: { ...allConditions(true), CLIENT_CONFIRMED_CURRENT_TRUTH: false, CLIENT_REVIEWED_REQUIRED_SECTIONS: false } });
    expect(isCountedActive(prebuilt)).toBe(false);
    expect(() => transitionClient(prebuilt, 'ACTIVE')).toThrow(LifecycleError);
    const waiting = { ...prebuilt, lifecycle: 'CLIENT_CONFIRMATION_REQUIRED' as const };
    try { transitionClient(waiting, 'ACTIVE'); throw new Error('should refuse'); } catch (e) { expect((e as LifecycleError).reasons.join(' ')).toMatch(/CLIENT_CONFIRMED_CURRENT_TRUTH/); }
    const ok = transitionClient({ ...waiting, conditions: allConditions(true) }, 'ACTIVE');
    expect(ok.client.lifecycle).toBe('ACTIVE');
    expect(ok.events).toEqual(['CLIENT_CONFIRMED', 'CLIENT_ACTIVATED']);
    expect(isCountedActive(ok.client)).toBe(true);
    // A record marked ACTIVE without the conditions is never counted.
    expect(isCountedActive(client({ lifecycle: 'ACTIVE' }))).toBe(false);
    expect(evaluateActivation(client()).missing).toEqual([...ACTIVATION_CONDITIONS]);
  });

  it('every route to ACTIVE passes CLIENT_CONFIRMATION_REQUIRED (or resumes a client that was active)', () => {
    const toActive = CLIENT_LIFECYCLE_TRANSITIONS.filter((t) => t.to === 'ACTIVE').map((t) => t.from);
    expect(toActive.sort()).toEqual(['CLIENT_CONFIRMATION_REQUIRED', 'PAUSED']);
    expect(() => transitionClient(client({ lifecycle: 'PREBUILT', business_identity_id: 'B-1', conditions: allConditions(true) }), 'ACTIVE')).toThrow(/NO_SUCH_TRANSITION/);
    // No credentials before identity matching.
    expect(() => transitionClient(client({ lifecycle: 'PREBUILT', conditions: allConditions(true) }), 'INVITED')).toThrow(/identity not committed/);
    // New clients converge at the same confirmation gate.
    const n = client({ entry_type: 'NEW_CLIENT', lifecycle: 'INTAKE_IN_PROGRESS', conditions: { ...allConditions(false), AUTH_IDENTITY_LINKED: true, REVIEW_OR_INTAKE_COMPLETE: true } });
    expect(transitionClient(n, 'CLIENT_CONFIRMATION_REQUIRED').client.lifecycle).toBe('CLIENT_CONFIRMATION_REQUIRED');
    expect(() => transitionClient(client({ lifecycle: 'KNOWN_UNMIGRATED' }), 'INTAKE_IN_PROGRESS')).toThrow(LifecycleError);
  });

  it('founder segmentation never mixes states; an unconfirmed ACTIVE flag lands in WAITING FOR CLIENT', () => {
    expect(segmentOf(client({ lifecycle: 'PREBUILT' }), 'APPROVED', null)).toBe('PREBUILT_NOT_INVITED');
    expect(segmentOf(client({ lifecycle: 'INVITED' }), 'APPROVED', 'SENT')).toBe('INVITATION_SENT');
    expect(segmentOf(client({ lifecycle: 'INVITED' }), 'APPROVED', 'DELIVERY_FAILED')).toBe('PREBUILT_NOT_INVITED');
    expect(segmentOf(client({ lifecycle: 'CLIENT_CONFIRMATION_REQUIRED' }), 'APPROVED', 'ACCEPTED')).toBe('WAITING_FOR_CLIENT');
    expect(segmentOf(client({ lifecycle: 'MIGRATION_IN_PROGRESS' }), 'PARTIAL', null)).toBe('MIGRATION_FAILED_NEEDS_REVIEW');
    expect(segmentOf(client({ lifecycle: 'ACTIVE' }), null, null)).toBe('WAITING_FOR_CLIENT');
  });
});

describe('pipeline: propose, never commit', () => {
  it('no pipeline stage writes canonical truth; duplicates are linked, not re-extracted', () => {
    expect(MIGRATION_PIPELINE.map((s) => s.stage)).toEqual(['INGEST', 'HASH', 'DUPLICATE_CHECK', 'DOCUMENT_TYPE_DETECTION', 'TEXT_FIELD_EXTRACTION', 'ENTITY_EXTRACTION', 'CLIENT_MATCHING', 'RECORD_MATCHING', 'STALENESS_ANALYSIS', 'CONFLICT_ANALYSIS', 'CONFIDENCE_SCORING', 'PROPOSED_PROFILE_MUTATIONS', 'REVIEW_REQUIRED']);
    expect(MIGRATION_PIPELINE.every((s) => s.writes_canonical === false)).toBe(true);
    const doc = (id: string, sha: string, state: SourceDocument['state'] = 'EXTRACTED'): SourceDocument => ({ document_id: id, batch_id: 'b1', original_filename: `${id}.pdf`, mime: 'application/pdf', bytes: 1, sha256: sha, ingested_at: '2026-10-06', state, document_class: null, class_confidence: null, duplicate_of: null, document_date: null, effective_date: null, expiration_date: null, pages: 1 });
    const out = markDuplicates([doc('a', 'h1'), doc('b', 'h1'), doc('c', 'h2')], ['h2']);
    expect(out.map((d) => [d.state, d.duplicate_of])).toEqual([['EXTRACTED', null], ['DUPLICATE', 'a'], ['DUPLICATE', 'vault:h2']]);
    expect(batchState({ batch_id: 'b1', client_ref: null, state: 'PROCESSING', created_by: 's', created_at: 'x', documents: [doc('a', 'h1'), doc('b', 'h3', 'UNREADABLE')] })).toBe('PARTIAL');
  });

  it('conflicts and staleness are detected; provenance gaps are named', () => {
    const facts = analyzeConflicts([fact('f1', 'organization.phone', '555-0100'), fact('f2', 'organization.phone', '555 0199'), fact('f3', 'organization.legal_name', 'Acme LLC')]);
    expect(facts.map((f) => f.confidence)).toEqual(['CONFLICT', 'CONFLICT', 'HIGH']);
    expect(assessStaleness({ observed_on: '2024-01-01', expires_on: '2025-01-01' }, 365, '2026-10-06')).toBe('STALE');
    expect(assessStaleness({ observed_on: '2024-01-01', expires_on: null }, 365, '2026-10-06')).toBe('POSSIBLY_STALE');
    expect(assessStaleness({ observed_on: '2026-09-01', expires_on: null }, 365, '2026-10-06')).toBe('CURRENT');
    expect(provenanceGaps(fact('x', 'a', 'b', { provenance: { source: 'DOCUMENT_EXTRACTION', document_id: null, page: null, region: null, supplied_by: null, observed_on: null } }))).toEqual(['document extraction without a source document']);
    expect(provenanceGaps(fact('x', 'a', 'b', { provenance: { source: 'STAFF_KNOWLEDGE', document_id: null, page: null, region: null, supplied_by: null, observed_on: null } }))).toEqual(['STAFF_KNOWLEDGE without who supplied it']);
  });

  it('matching: strong identifiers propose, staff confirm; ambiguity and duplicates are refused', () => {
    const kinds = [{ kind: 'REG', strength: 'STRONG' as const }, { kind: 'NAME', strength: 'WEAK' as const }];
    const existing = [{ client_ref: 'c1', signals: { REG: ['111'], NAME: ['ACME'] } }, { client_ref: 'c2', signals: { REG: ['222'], NAME: ['ACME'] } }];
    const likely = proposeClientMatch({ REG: ['111'] }, existing, kinds);
    expect([likely.class, likely.chosen]).toEqual(['LIKELY_MATCH', 'c1']);
    expect(proposeClientMatch({ REG: ['111', '222'] }, existing, kinds).class).toBe('AMBIGUOUS');
    expect(proposeClientMatch({ NAME: ['Acme'] }, existing, kinds).class).toBe('AMBIGUOUS');
    expect(proposeClientMatch({ REG: ['999'] }, existing, kinds).class).toBe('NEW_CLIENT_CANDIDATE');
    expect(proposeClientMatch({ REG: ['222'] }, existing, kinds, 'c1').class).toBe('AMBIGUOUS');
    expect(MATCH_NEVER_SELF_CONFIRMED(likely.class)).toBe(true);
    expect(confirmMatch(likely, { action: 'CREATE_NEW_CLIENT', staff: 's', override_reason: null }).refused).toEqual(['a likely match exists — creating a new business needs a recorded reason']);
    expect(confirmMatch(likely, { action: 'MATCH_TO_EXISTING', client_ref: 'c1', staff: 's', reason: null })).toMatchObject({ class: 'MATCH_CONFIRMED', client_ref: 'c1' });
  });
});
const MATCH_NEVER_SELF_CONFIRMED = (c: string) => c !== 'MATCH_CONFIRMED';

describe('commit gate: APPROVE MIGRATION → PREBUILT, never ACTIVE', () => {
  const name = fact('f1', 'organization.legal_name', 'Acme LLC');
  const phone = fact('f2', 'organization.phone', '555-0100');
  it('refuses with undecided facts, unresolved identity or open conflicts', () => {
    const p = planMigrationCommit({ match: { class: 'LIKELY_MATCH', client_ref: 'c1' }, facts: [name, phone], rules: RULES, approver: 'founder' });
    expect(p.allowed).toBe(false);
    expect(p.writes).toEqual([]);
    expect(p.refused.join(' ')).toMatch(/identity not resolved/);
    expect(p.refused.join(' ')).toMatch(/2 fact\(s\) without a decision/);
  });

  it('writes only confirmed / edited facts with lineage; client-confirmation items and history stay separate', () => {
    const p = planMigrationCommit({
      match: { class: 'MATCH_CONFIRMED', client_ref: 'c1' },
      facts: [decided(name, 'EDITED', 'ACME HAULING LLC'), decided(phone, 'NEEDS_CLIENT_CONFIRMATION'), decided(fact('f3', 'organization.phone', '555-0000'), 'MARKED_STALE')],
      rules: RULES, approver: 'founder',
    });
    expect(p.allowed).toBe(true);
    expect(p.next_lifecycle).toBe('PREBUILT');
    expect(p.writes).toEqual([{ field: 'organization.legal_name', entity_key: null, value: 'ACME HAULING LLC', target: 'org.name', fact_id: 'f1', provenance: name.provenance, reviewer: 'staff-1' }]);
    expect(p.client_review_items.map((x) => x.fact_id)).toEqual(['f2']);
    expect(p.history_only).toEqual([{ fact_id: 'f3', decision: 'MARKED_STALE' }]);
  });

  it('a confirmed fact with no canonical home is refused rather than dropped', () => {
    const p = planMigrationCommit({ match: { class: 'MATCH_CONFIRMED', client_ref: 'c1' }, facts: [decided(name, 'CONFIRMED'), decided(fact('f4', 'organization.history_note', 'x'), 'CONFIRMED')], rules: RULES, approver: 'founder' });
    expect(p.refused).toEqual(['no canonical home for: organization.history_note']);
  });
});

describe('completeness, vault lineage, invitations, review, provisioning, audit', () => {
  it('business profile, document vault and client review are three measures; an empty vault is not an empty profile', () => {
    const c = computeCompleteness({ known_fields: ['organization.legal_name'], rules: RULES, vault: { current_on_file: 0, current_expected: 5, historical_on_file: 0, migration_open: false, archive_done: false }, review: { started: false, reviewed: 0, required: 5 } });
    expect(c.business_profile).toMatchObject({ known: 1, required: 2, pct: 50 });
    expect(c.document_vault.state).toBe('NOT_STARTED');
    expect(c.client_review.state).toBe('REQUIRED');
  });

  it('superseding keeps the older document', () => {
    const old = { client_id: 'c', organization_id: 'o', document_type: 'X', source_migration_batch: 'b1', original_filename: 'a.pdf', sha256: 'h', ingested_at: 't', document_date: null, effective_date: null, expiration_date: null, classification: { proposed: 'X', confirmed: 'X', confirmed_by: 's' }, review_status: 'REVIEWED' as const, canonical_status: 'CURRENT' as const, superseded_by: null, extracted_fact_ids: [], workspace_relationships: [] };
    expect(supersede(old, 'doc-2')).toMatchObject({ canonical_status: 'SUPERSEDED', superseded_by: 'doc-2', sha256: 'h' });
  });

  it('invitations carry no profile data or credentials; links are single-use and expire', () => {
    expect(checkInviteMessage({ company_name: 'Acme', business_identity_id: 'B-1', activation_link: 'https://x/activate/t' }).ok).toBe(true);
    expect(checkInviteMessage({ company_name: 'Acme', dot_number: '123' }).forbidden).toEqual(['dot_number']);
    expect(checkInviteMessage({ company_name: 'Your temporary password is 1234' }).ok).toBe(false);
    const inv = { invite_id: 'i', business_identity_id: 'B-1', email: 'a@b.c', token_sha256: 'tok', issued_at: '2026-10-06', expires_at: '2026-10-13', state: 'SENT' as const, single_use: true as const };
    expect(acceptInvite(inv, 'tok', '2026-10-07').ok).toBe(true);
    expect(acceptInvite(inv, 'tok', '2026-10-14')).toMatchObject({ ok: false, state: 'EXPIRED', reason: 'ACTIVATION_EXPIRED' });
    expect(acceptInvite({ ...inv, state: 'ACCEPTED' }, 'tok', '2026-10-07').ok).toBe(false);
  });

  it('client confirmation: every section answered; an update needs a reported change; NOT SURE becomes a follow-up', () => {
    const sections = [{ section_id: 'COMPANY', label: 'Company', required: true }, { section_id: 'VEHICLES', label: 'Vehicles', required: true }];
    expect(checkClientConfirmation(sections, [{ section_id: 'COMPANY', response: 'LOOKS_RIGHT', changes: [] }], true).missing).toEqual(['VEHICLES: not reviewed']);
    expect(checkClientConfirmation(sections, [{ section_id: 'COMPANY', response: 'LOOKS_RIGHT', changes: [] }, { section_id: 'VEHICLES', response: 'NEEDS_AN_UPDATE', changes: [] }], true).missing).toEqual(['VEHICLES: update requested but nothing reported']);
    const ok = checkClientConfirmation(sections, [{ section_id: 'COMPANY', response: 'NOT_SURE', changes: [] }, { section_id: 'VEHICLES', response: 'NEEDS_AN_UPDATE', changes: ['chg-1'] }], true);
    expect(ok).toEqual({ ok: true, missing: [], follow_ups: ['COMPANY'] });
    expect(checkClientConfirmation(sections, [{ section_id: 'COMPANY', response: 'LOOKS_RIGHT', changes: [] }, { section_id: 'VEHICLES', response: 'LOOKS_RIGHT', changes: [] }], false).missing).toEqual(['required consents not accepted']);
    expect(routeChange({ shortcut_id: 'OWNERSHIP', label: 'x', section_id: 'COMPANY', routes_to: 'y', reconciliation: 'STAFF_RECONCILE', affects: [] }, 'new owner', 'client-user', 'chg-1').status).toBe('AWAITING_STAFF');
  });

  it('workspaces never activate from documents alone, and wait for the client before ACTIVE', () => {
    const rels = [{ workspace_id: 'W1', basis: 'STAFF_CONFIRMED_RELATIONSHIP' as const, confirmed_by: 'staff-1' }, { workspace_id: 'W2', basis: 'DOCUMENT_EVIDENCE_ONLY' as const, confirmed_by: null }];
    expect(provisionWorkspaces(rels, 'PREBUILT').map((w) => w.state)).toEqual(['PENDING_SETUP', 'KNOWN_REVIEW_NEEDED']);
    expect(provisionWorkspaces(rels, 'ACTIVE').map((w) => w.state)).toEqual(['ACTIVE', 'KNOWN_REVIEW_NEEDED']);
  });

  it('audit records need actor, timestamp and source', () => {
    expect(auditRecord('CLIENT_ACTIVATED', 'user-1', 'EXISTING_CLIENT', '2026-10-06T12:00:00Z', 'activation', 'c1', { lifecycle: 'CLIENT_CONFIRMATION_REQUIRED' }, { lifecycle: 'ACTIVE' })).toMatchObject({ event: 'CLIENT_ACTIVATED', before: { lifecycle: 'CLIENT_CONFIRMATION_REQUIRED' } });
    expect(() => auditRecord('CLIENT_ACTIVATED', '', 'SYSTEM', '', '', 'c1')).toThrow();
  });
});
