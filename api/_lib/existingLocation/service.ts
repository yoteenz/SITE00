import { randomUUID } from 'node:crypto';
import {
  codesMatch,
  hashCourtesyCode,
  validateCourtesyForQuote,
} from '../../../shared/site00-existing-location/courtesy.js';
import { canClientTransition } from '../../../shared/site00-existing-location/stateMachine.js';
import { shopifyAccessRequirements } from '../../../shared/site00-existing-location/shopifyAdapter.js';
import type {
  CaseAuditEvent,
  CaseAuditEventType,
  ExistingLocationCaseRecord,
  ExistingLocationEvidence,
  ExistingLocationPlatform,
  ExistingLocationQuote,
  ExistingLocationRequestType,
  ServiceCourtesyCodeRecord,
} from '../../../shared/site00-existing-location/types.js';
import * as mem from './memoryStore.js';

function nowIso(): string {
  return new Date().toISOString();
}

function publicRef(): string {
  return `EL-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function audit(caseId: string, event_type: CaseAuditEventType, actor: CaseAuditEvent['actor'], detail: Record<string, unknown> = {}) {
  mem.memAppendEvent({
    id: randomUUID(),
    case_id: caseId,
    event_type,
    actor,
    detail,
    created_at: nowIso(),
  });
}

export function createCase(input: {
  client_user_id: string | null;
  client_email: string | null;
}): ExistingLocationCaseRecord {
  const id = randomUUID();
  const record: ExistingLocationCaseRecord = {
    id,
    public_reference: publicRef(),
    client_user_id: input.client_user_id,
    client_email: input.client_email,
    project_id: null,
    platform: null,
    site_url: null,
    request_type: null,
    client_description: '',
    expected_behavior: '',
    actual_behavior: '',
    enhancement_goal: '',
    evidence: [],
    access_requirements: [],
    access_status: 'NOT_REQUESTED',
    diagnosis_status: 'DRAFT',
    status: 'DRAFT',
    risk_level: 'UNKNOWN',
    affected_systems: [],
    findings: [],
    recommended_intervention: null,
    service_classification: null,
    modify_production_authorized: false,
    quote_id: null,
    approval_status: 'NONE',
    checkout_status: 'NONE',
    implementation_status: 'NONE',
    qa_status: 'NONE',
    entitlement: null,
    courtesy_redemption_id: null,
    created_at: nowIso(),
    updated_at: nowIso(),
    completed_at: null,
  };
  mem.memSaveCase(record);
  audit(id, 'CASE_CREATED', 'CLIENT');
  return record;
}

export function updateCaseIntake(
  caseId: string,
  patch: {
    request_type?: ExistingLocationRequestType;
    platform?: ExistingLocationPlatform;
    site_url?: string;
    client_description?: string;
    expected_behavior?: string;
    actual_behavior?: string;
    enhancement_goal?: string;
    evidence?: ExistingLocationEvidence[];
  },
  actor: CaseAuditEvent['actor'] = 'CLIENT',
): ExistingLocationCaseRecord {
  const c = mem.memGetCase(caseId);
  if (!c) throw new Error('CASE_NOT_FOUND');
  if (c.status !== 'DRAFT' && c.status !== 'INTAKE_COMPLETE') {
    throw new Error('CASE_NOT_EDITABLE');
  }
  if (patch.platform !== undefined) {
    c.platform = patch.platform;
    audit(caseId, 'PLATFORM_SELECTED', actor, { platform: patch.platform });
    if (patch.platform === 'SHOPIFY') {
      c.access_requirements = shopifyAccessRequirements();
    }
  }
  Object.assign(c, patch);
  c.updated_at = nowIso();
  mem.memSaveCase(c);
  return c;
}

export function submitIntake(caseId: string): ExistingLocationCaseRecord {
  const c = mem.memGetCase(caseId);
  if (!c) throw new Error('CASE_NOT_FOUND');
  if (!c.request_type || !c.platform) throw new Error('INTAKE_INCOMPLETE');
  if (!c.client_description.trim()) throw new Error('DESCRIPTION_REQUIRED');
  c.status = 'INTAKE_COMPLETE';
  c.diagnosis_status = 'INTAKE_COMPLETE';
  c.access_status = 'REQUESTED';
  c.status = 'ACCESS_REQUIRED';
  c.updated_at = nowIso();
  mem.memSaveCase(c);
  audit(caseId, 'INTAKE_SUBMITTED', 'CLIENT');
  audit(caseId, 'ACCESS_REQUESTED', 'SYSTEM');
  return c;
}

export function markAccessConnected(caseId: string, actor: CaseAuditEvent['actor'] = 'FOUNDER'): ExistingLocationCaseRecord {
  const c = mem.memGetCase(caseId);
  if (!c) throw new Error('CASE_NOT_FOUND');
  c.access_status = 'CONNECTED';
  c.access_requirements = c.access_requirements.map((a) => ({
    ...a,
    status: a.required_or_optional === 'REQUIRED' ? 'CONNECTED' : a.status === 'NOT_REQUESTED' ? 'CONNECTED' : a.status,
    connected_at: nowIso(),
  }));
  c.status = 'ACCESS_CONNECTED';
  c.updated_at = nowIso();
  mem.memSaveCase(c);
  audit(caseId, 'ACCESS_CONNECTED', actor);
  return c;
}

export function createQuoteForCase(
  caseId: string,
  input: { line_items: ExistingLocationQuote['line_items']; basis_notes: string; diagnosis_fee_cents?: number },
): { case: ExistingLocationCaseRecord; quote: ExistingLocationQuote } {
  const c = mem.memGetCase(caseId);
  if (!c) throw new Error('CASE_NOT_FOUND');
  const subtotal = input.line_items.reduce((s, l) => s + l.amount_cents, 0);
  const quote: ExistingLocationQuote = {
    id: randomUUID(),
    case_id: caseId,
    currency: 'USD',
    line_items: input.line_items,
    subtotal_cents: subtotal,
    discount_cents: 0,
    total_cents: subtotal,
    diagnosis_fee_cents: input.diagnosis_fee_cents ?? 0,
    basis_notes: input.basis_notes,
    locked: true,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  mem.memSaveQuote(quote);
  c.quote_id = quote.id;
  c.status = 'QUOTE_READY';
  c.approval_status = 'PENDING';
  c.updated_at = nowIso();
  mem.memSaveCase(c);
  audit(caseId, 'QUOTE_CREATED', 'FOUNDER', { quote_id: quote.id, subtotal_cents: subtotal });
  return { case: c, quote };
}

export function clientApproveQuote(caseId: string): ExistingLocationCaseRecord {
  const c = mem.memGetCase(caseId);
  if (!c) throw new Error('CASE_NOT_FOUND');
  if (c.status !== 'QUOTE_READY' && c.status !== 'AWAITING_CLIENT_APPROVAL') throw new Error('QUOTE_NOT_READY');
  c.status = 'APPROVED';
  c.approval_status = 'APPROVED';
  c.checkout_status = 'PENDING';
  c.status = 'CHECKOUT_PENDING';
  c.updated_at = nowIso();
  mem.memSaveCase(c);
  audit(caseId, 'CLIENT_APPROVED', 'CLIENT');
  return c;
}

export function previewCourtesyCode(caseId: string, rawCode: string, clientEmail: string | null, clientUserId: string | null) {
  const c = mem.memGetCase(caseId);
  if (!c?.quote_id) throw new Error('QUOTE_MISSING');
  const quote = mem.memGetQuote(c.quote_id);
  if (!quote) throw new Error('QUOTE_MISSING');
  const hash = hashCourtesyCode(rawCode);
  const record = mem.memFindCourtesyByHash(hash);
  if (!record || !codesMatch(rawCode, record)) return { ok: false as const, reason: 'INVALID_CODE' };
  return { ok: true as const, ...validateCourtesyForQuote(record, quote, { clientEmail, clientUserId }) };
}

export function completeCheckout(
  caseId: string,
  rawCode: string | undefined,
  clientEmail: string | null,
  clientUserId: string | null,
): ExistingLocationCaseRecord {
  const c = mem.memGetCase(caseId);
  if (!c?.quote_id) throw new Error('QUOTE_MISSING');
  if (c.status !== 'CHECKOUT_PENDING' && c.status !== 'APPROVED') throw new Error('CHECKOUT_NOT_ALLOWED');
  const quote = mem.memGetQuote(c.quote_id);
  if (!quote) throw new Error('QUOTE_MISSING');

  let discount = 0;
  let finalTotal = quote.subtotal_cents;
  let redemptionId: string | null = null;

  if (rawCode?.trim()) {
    const hash = hashCourtesyCode(rawCode);
    const record = mem.memFindCourtesyByHash(hash);
    if (!record || !codesMatch(rawCode, record)) throw new Error('INVALID_COURTESY_CODE');
    const validation = validateCourtesyForQuote(record, quote, { clientEmail, clientUserId });
    if (!validation.ok) throw new Error(validation.reason);
    discount = validation.discount_cents;
    finalTotal = validation.final_total_cents;
    record.redemptions_used += 1;
    mem.memSaveCourtesyCode(record);
    redemptionId = randomUUID();
    mem.memSaveRedemption({
      id: redemptionId,
      code_id: record.id,
      case_id: caseId,
      quote_id: quote.id,
      client_email: clientEmail,
      discount_applied_cents: discount,
      final_total_cents: finalTotal,
      created_at: nowIso(),
    });
    audit(caseId, 'COURTESY_CODE_APPLIED', 'CLIENT', { discount_cents: discount, final_total_cents: finalTotal });
  }

  if (finalTotal > 0) {
    throw new Error('PAYMENT_REQUIRED'); // Checkout visual authority incomplete — block fake paid state
  }

  quote.discount_cents = discount;
  quote.total_cents = finalTotal;
  quote.updated_at = nowIso();
  mem.memSaveQuote(quote);

  c.courtesy_redemption_id = redemptionId;
  c.checkout_status = 'COMPLETE';
  c.status = finalTotal === 0 && discount > 0 ? 'COMPLIMENTARY_APPROVED' : 'PAID';
  c.entitlement = {
    service: 'EXISTING_LOCATION',
    case_id: caseId,
    quote_id: quote.id,
    authorized_at: nowIso(),
    payment_required: false,
    complimentary: discount > 0,
  };
  c.updated_at = nowIso();
  mem.memSaveCase(c);
  audit(caseId, 'PAYMENT_COMPLETED', 'SYSTEM', { final_total_cents: finalTotal, complimentary: discount > 0 });
  return c;
}

export function createCourtesyCode(input: {
  raw_code: string;
  display_label: string;
  discount_type: ServiceCourtesyCodeRecord['discount_type'];
  discount_value: number;
  eligible_email?: string | null;
  eligible_client_id?: string | null;
  max_redemptions?: number;
  expires_at?: string | null;
  founder_note?: string;
  created_by: string;
}): ServiceCourtesyCodeRecord {
  const record: ServiceCourtesyCodeRecord = {
    id: randomUUID(),
    code_hash: hashCourtesyCode(input.raw_code),
    display_label: input.display_label,
    discount_type: input.discount_type,
    discount_value: input.discount_value,
    eligible_services: ['EXISTING_LOCATION'],
    eligible_client_id: input.eligible_client_id ?? null,
    eligible_email: input.eligible_email ?? null,
    max_redemptions: input.max_redemptions ?? 1,
    redemptions_used: 0,
    valid_from: nowIso(),
    expires_at: input.expires_at ?? null,
    founder_note: input.founder_note ?? '',
    active: true,
    created_by: input.created_by,
    created_at: nowIso(),
  };
  mem.memSaveCourtesyCode(record);
  return record;
}

export function getCasePayload(caseId: string) {
  const c = mem.memGetCase(caseId);
  if (!c) return null;
  const quote = c.quote_id ? mem.memGetQuote(c.quote_id) : null;
  return { case: c, quote, events: mem.memListEvents(caseId) };
}

export function assertClientCannotMutateQuote(caseId: string, attemptedTotal: number): void {
  const c = mem.memGetCase(caseId);
  if (!c?.quote_id) throw new Error('QUOTE_MISSING');
  const quote = mem.memGetQuote(c.quote_id);
  if (!quote) throw new Error('QUOTE_MISSING');
  if (attemptedTotal !== quote.total_cents) throw new Error('QUOTE_IMMUTABLE');
}

export function listFounderQueue() {
  return mem.memListCases().map((c) => ({
    id: c.id,
    public_reference: c.public_reference,
    status: c.status,
    platform: c.platform,
    request_type: c.request_type,
    client_email: c.client_email,
    updated_at: c.updated_at,
  }));
}
