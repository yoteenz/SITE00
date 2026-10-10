import { randomBytes, randomUUID } from 'node:crypto';
import { assertArtifactTransition, canTransitionArtifactState } from '../../../shared/site00-digital-foundation/lifecycle.js';
import { createQuoteDraft, type SelectedAddonInput, validateSelectionRemovable } from '../../../shared/site00-digital-foundation/quoteEngine.js';
import { inferBuildRecommendation, recommendFromIntake } from '../../../shared/site00-digital-foundation/recommendationEngine.js';
import { isLaunchGateCheckoutBlocked, LAUNCH_GATE_CHECKOUT_ERROR } from '../../../shared/site00-digital-foundation/launchGate.js';
import { resolveArtifactSurface, resolveArtifactSurfaceForClient } from '../../../shared/site00-digital-foundation/surface.js';
import { initialProjectStages } from '../../../shared/site00-digital-foundation/projectStages.js';
import { findReferralByKind } from '../../../shared/site00-digital-foundation/referralSources.js';
import {
  DIGITAL_FOUNDATION_SERVICE_ID,
  type ApprovalRecord,
  type ArtifactEvent,
  type BuildReadinessAssessment,
  type ClientActionRequest,
  type DigitalFoundationArtifact,
  type DigitalFoundationArtifactPayload,
  type DigitalFoundationIntake,
  type DigitalFoundationLead,
  type DigitalFoundationQuote,
  type FoundationBuildCredit,
  type OwnershipRecord,
  type ProjectStageRecord,
  type QuoteAcceptanceRecord,
  type ReferralSourceKind,
} from '../../../shared/site00-digital-foundation/types.js';
import type { CommunicationConsentRecord } from '../../../shared/site00-digital-foundation/communications/types.js';
import { enqueueCommunicationsForEvent } from './communications/dispatch.js';
import * as mem from './memoryStore.js';
import { getFoundationPaymentAdapter } from './payment/stripeHostedCheckout.js';
import {
  assessArtifactCompletion,
  prepareOwnershipFromOperations,
} from './operationsEngine.js';
import {
  actionRequiresExplicitApproval,
  approvalSubjectForAction,
  parseClientApprovalDecision,
  targetVersionFromResponse,
} from './approvalDecisions.js';
import { assessQuotePayability } from '../../../shared/site00-digital-foundation/quoteReadiness.js';
import { computeReadinessState } from '../../../shared/site00-digital-foundation/readinessClock.js';
import { toClientArtifactPayload } from '../../../shared/site00-digital-foundation/clientProjection.js';
import { persistArtifactGraph } from './persistence/supabaseStore.js';

function nowIso(): string {
  return new Date().toISOString();
}

function schedulePersist(artifactId: string): void {
  void persistArtifactGraph(artifactId).catch((err) => {
    console.error('[digital-foundation] persist failed', artifactId, err);
  });
}

function newPublicToken(): string {
  return randomBytes(24).toString('base64url');
}

function logEvent(
  artifactId: string,
  event_type: ArtifactEvent['event_type'],
  actor: string | null,
  payload: Record<string, unknown> = {},
): void {
  mem.memAppendEvent({
    event_id: randomUUID(),
    artifact_id: artifactId,
    event_type,
    actor,
    payload,
    created_at: nowIso(),
  });
  const artifact = mem.memGetArtifact(artifactId);
  const lead = artifact ? mem.memGetLead(artifact.lead_id) : undefined;
  const email = lead?.contact_email ?? artifact?.intake.current_email ?? null;
  enqueueCommunicationsForEvent({ artifactId, eventType: event_type, recipientEmail: email, payload });
}

function transitionArtifact(a: DigitalFoundationArtifact, to: DigitalFoundationArtifact['state']): void {
  assertArtifactTransition(a.state, to);
  a.state = to;
  a.last_activity_at = nowIso();
}

function getReferral(id: string | null) {
  if (!id) return null;
  return mem.getDfMemoryState().referralSources.find((r) => r.referral_source_id === id) ?? null;
}

export function getCommercialConfig() {
  return mem.getDfMemoryState().config;
}

export function setCommercialConfig(patch: Partial<ReturnType<typeof getCommercialConfig>>): void {
  Object.assign(mem.getDfMemoryState().config, patch);
}

export function listReferralSources() {
  return mem.getDfMemoryState().referralSources;
}

export function createLead(input: {
  contact_email?: string | null;
  contact_name?: string | null;
  business_name?: string | null;
  referral_kind?: ReferralSourceKind;
  referral_source_id?: string | null;
}): DigitalFoundationLead {
  const s = mem.getDfMemoryState();
  let referralId = input.referral_source_id ?? null;
  if (!referralId && input.referral_kind) {
    referralId = findReferralByKind(s.referralSources, input.referral_kind)?.referral_source_id ?? null;
  }
  const lead: DigitalFoundationLead = {
    lead_id: randomUUID(),
    contact_email: input.contact_email ?? null,
    contact_name: input.contact_name ?? null,
    business_name: input.business_name ?? null,
    referral_source_id: referralId,
    referral_funnel_stage: referralId ? 'REFERRED' : 'REFERRED',
    created_at: nowIso(),
  };
  mem.memSaveLead(lead);
  return lead;
}

export function createArtifactForLead(input: {
  lead_id?: string;
  contact_email?: string | null;
  contact_name?: string | null;
  business_name?: string | null;
  referral_kind?: ReferralSourceKind;
  referral_source_id?: string | null;
}): DigitalFoundationArtifact {
  const lead =
    input.lead_id && mem.memGetLead(input.lead_id)
      ? mem.memGetLead(input.lead_id)!
      : createLead({
          contact_email: input.contact_email,
          contact_name: input.contact_name,
          business_name: input.business_name,
          referral_kind: input.referral_kind,
          referral_source_id: input.referral_source_id,
        });

  const artifact: DigitalFoundationArtifact = {
    artifact_id: randomUUID(),
    public_token: newPublicToken(),
    lead_id: lead.lead_id,
    client_org_id: null,
    contact_id: null,
    referral_source_id: lead.referral_source_id,
    service_id: DIGITAL_FOUNDATION_SERVICE_ID,
    state: 'INVITED',
    intake_state: 'NOT_STARTED',
    quote_id: null,
    payment_state: 'NONE',
    project_state: 'NOT_STARTED',
    completion_state: 'NOT_STARTED',
    build_interest: 'NONE',
    build_recommendation: 'NONE',
    foundation_credit_id: null,
    intake: { needs: [] },
    created_at: nowIso(),
    opened_at: null,
    last_activity_at: nowIso(),
    completed_at: null,
  };
  mem.memSaveArtifact(artifact);
  logEvent(artifact.artifact_id, 'ARTIFACT_CREATED', 'FOUNDER', { lead_id: lead.lead_id });
  schedulePersist(artifact.artifact_id);
  return artifact;
}

export function openArtifactByToken(token: string): DigitalFoundationArtifact {
  const a = mem.memGetArtifactByToken(token);
  if (!a) throw new Error('ARTIFACT_NOT_FOUND');
  if (a.state === 'INVITED') {
    transitionArtifact(a, 'OPENED');
    a.opened_at = nowIso();
    logEvent(a.artifact_id, 'LINK_OPENED', 'CLIENT');
    const lead = mem.memGetLead(a.lead_id);
    if (lead) {
      lead.referral_funnel_stage = 'OPENED';
      mem.memSaveLead(lead);
    }
    mem.memSaveArtifact(a);
    schedulePersist(a.artifact_id);
  }
  return a;
}

export function updateIntake(
  artifactId: string,
  patch: Partial<DigitalFoundationIntake>,
  markComplete?: boolean,
): DigitalFoundationArtifact {
  const a = mem.memGetArtifact(artifactId);
  if (!a) throw new Error('ARTIFACT_NOT_FOUND');
  if (a.payment_state === 'PAID') throw new Error('INTAKE_LOCKED_AFTER_PAYMENT');

  if (a.state === 'INVITED') {
    transitionArtifact(a, 'OPENED');
    a.opened_at = nowIso();
    logEvent(a.artifact_id, 'LINK_OPENED', 'CLIENT');
  }
  if (a.intake_state === 'NOT_STARTED') {
    a.intake_state = 'IN_PROGRESS';
    if (a.state === 'OPENED') transitionArtifact(a, 'INTAKE_IN_PROGRESS');
    logEvent(a.artifact_id, 'INTAKE_STARTED', 'CLIENT');
  }

  a.intake = { ...a.intake, ...patch, needs: patch.needs ?? a.intake.needs ?? [] };
  a.last_activity_at = nowIso();
  logEvent(a.artifact_id, 'INTAKE_UPDATED', 'CLIENT');

  if (markComplete) {
    return completeIntake(artifactId);
  }
  mem.memSaveArtifact(a);
  schedulePersist(a.artifact_id);
  return a;
}

function ensureIntakePath(artifact: DigitalFoundationArtifact): void {
  if (artifact.state === 'INVITED') {
    transitionArtifact(artifact, 'OPENED');
    artifact.opened_at = nowIso();
  }
  if (artifact.intake_state === 'NOT_STARTED') {
    artifact.intake_state = 'IN_PROGRESS';
  }
  if (artifact.state === 'OPENED') {
    transitionArtifact(artifact, 'INTAKE_IN_PROGRESS');
  }
}

export function completeIntake(artifactId: string): DigitalFoundationArtifact {
  const a = mem.memGetArtifact(artifactId);
  if (!a) throw new Error('ARTIFACT_NOT_FOUND');
  ensureIntakePath(a);
  a.intake_state = 'COMPLETE';
  transitionArtifact(a, 'INTAKE_COMPLETE');
  logEvent(a.artifact_id, 'INTAKE_COMPLETED', 'CLIENT');

  const config = getCommercialConfig();
  const { selections, recommendation } = recommendFromIntake(a.intake, config);
  const build = inferBuildRecommendation(a.intake);
  a.build_recommendation = build.level;
  mem.getDfMemoryState().buildReadiness.set(a.artifact_id, build.readiness);

  transitionArtifact(a, 'RECOMMENDATION_READY');
  logEvent(a.artifact_id, 'QUOTE_CREATED', 'SYSTEM', { phase: 'recommendation' });

  const quote = createQuoteDraft({
    artifact_id: a.artifact_id,
    selections,
    config,
    quote_version: 1,
    status: 'CLIENT_REVIEW',
  });
  mem.memSaveQuote(quote);
  a.quote_id = quote.quote_id;
  transitionArtifact(a, 'QUOTE_READY');

  const lead = mem.memGetLead(a.lead_id);
  if (lead) {
    lead.referral_funnel_stage = 'QUOTED';
    mem.memSaveLead(lead);
  }

  mem.memSaveArtifact(a);
  schedulePersist(a.artifact_id);
  return a;
}

export function updateQuoteSelections(
  artifactId: string,
  selections: SelectedAddonInput[],
  actor: 'CLIENT' | 'FOUNDER' = 'CLIENT',
): DigitalFoundationQuote {
  const a = mem.memGetArtifact(artifactId);
  if (!a || !a.quote_id) throw new Error('QUOTE_NOT_FOUND');
  const prev = mem.memGetQuote(a.quote_id);
  if (!prev) throw new Error('QUOTE_NOT_FOUND');
  if (prev.status === 'PAID' || prev.status === 'ACCEPTED') throw new Error('QUOTE_LOCKED');

  const config = getCommercialConfig();
  const quote = createQuoteDraft({
    artifact_id: artifactId,
    selections,
    config,
    quote_version: prev.quote_version + 1,
    status: 'CLIENT_REVIEW',
    manual_adjustments_minor: prev.manual_adjustments_minor,
  });
  if (prev.status !== 'DRAFT') quote.status = 'CLIENT_REVIEW';
  prev.status = 'SUPERSEDED';
  mem.memSaveQuote(prev);
  mem.memSaveQuote(quote);
  a.quote_id = quote.quote_id;
  transitionArtifact(a, 'QUOTE_READY');
  logEvent(artifactId, 'QUOTE_UPDATED', actor, { quote_version: quote.quote_version });
  mem.memSaveArtifact(a);
  schedulePersist(a.artifact_id);
  return quote;
}

export function removeQuoteAddon(
  artifactId: string,
  addonId: string,
): DigitalFoundationQuote {
  const a = mem.memGetArtifact(artifactId);
  if (!a?.quote_id) throw new Error('QUOTE_NOT_FOUND');
  const q = mem.memGetQuote(a.quote_id);
  if (!q) throw new Error('QUOTE_NOT_FOUND');
  const remaining = q.selected_addons
    .filter((l) => l.addon_id !== addonId)
    .map((l) => ({ addon_id: l.addon_id, quantity: l.quantity }));
  const check = validateSelectionRemovable(addonId, remaining, getCommercialConfig());
  if (!check.ok) throw new Error(`ADDON_REQUIRED:${check.reason}`);
  return updateQuoteSelections(artifactId, remaining);
}

export function acceptQuote(input: {
  artifact_id: string;
  disclosures: string[];
  terms_version?: string;
  source_surface?: string;
  client_ip?: string | null;
  user_agent?: string | null;
}): DigitalFoundationArtifact {
  const a = mem.memGetArtifact(input.artifact_id);
  if (!a?.quote_id) throw new Error('QUOTE_NOT_FOUND');
  const q = mem.memGetQuote(a.quote_id);
  if (!q) throw new Error('QUOTE_NOT_FOUND');
  const config = getCommercialConfig();
  const required = [
    'I HAVE REVIEWED MY DIGITAL FOUNDATION SCOPE.',
    'I UNDERSTAND THAT DOMAIN / EMAIL PROVIDER SUBSCRIPTIONS AND OTHER THIRD-PARTY FEES MAY BE SEPARATE.',
    'I UNDERSTAND THAT THE PROJECTED TURNAROUND BEGINS AFTER REQUIRED INFORMATION, ACCESS AND PAYMENT ARE RECEIVED.',
  ];
  for (const d of required) {
    if (!input.disclosures.includes(d)) throw new Error('DISCLOSURE_REQUIRED');
  }

  q.status = 'ACCEPTED';
  mem.memSaveQuote(q);
  const acceptance: QuoteAcceptanceRecord = {
    artifact_id: a.artifact_id,
    quote_version: q.quote_version,
    terms_version: input.terms_version ?? config.terms_version,
    accepted_at: nowIso(),
    accepted_disclosures: input.disclosures,
    source_surface: input.source_surface ?? 'artifact',
    client_ip: input.client_ip ?? null,
    user_agent: input.user_agent ?? null,
  };
  mem.getDfMemoryState().acceptances.set(a.artifact_id, acceptance);
  if (a.state === 'QUOTE_READY') transitionArtifact(a, 'AWAITING_ACCEPTANCE');
  transitionArtifact(a, 'AWAITING_PAYMENT');
  logEvent(a.artifact_id, 'QUOTE_ACCEPTED', 'CLIENT', { quote_version: q.quote_version });

  const lead = mem.memGetLead(a.lead_id);
  if (lead) {
    lead.referral_funnel_stage = 'ACCEPTED';
    mem.memSaveLead(lead);
  }
  mem.memSaveArtifact(a);
  schedulePersist(a.artifact_id);
  return a;
}

export function markQuoteCommerciallyReady(artifactId: string): DigitalFoundationQuote {
  const a = mem.memGetArtifact(artifactId);
  if (!a?.quote_id) throw new Error('QUOTE_NOT_FOUND');
  const q = mem.memGetQuote(a.quote_id);
  if (!q) throw new Error('QUOTE_NOT_FOUND');
  q.founder_commercial_ready = true;
  q.founder_commercial_ready_at = nowIso();
  mem.memSaveQuote(q);
  logEvent(artifactId, 'QUOTE_UPDATED', 'FOUNDER', { founder_commercial_ready: true });
  schedulePersist(artifactId);
  return q;
}

export async function createCheckoutSession(input: {
  artifact_id: string;
  success_url: string;
  cancel_url: string;
}): Promise<{ checkout_url: string; session_id: string; simulated?: boolean }> {
  if (isLaunchGateCheckoutBlocked()) {
    throw new Error(LAUNCH_GATE_CHECKOUT_ERROR);
  }
  const a = mem.memGetArtifact(input.artifact_id);
  if (!a?.quote_id) throw new Error('QUOTE_NOT_READY');
  const q = mem.memGetQuote(a.quote_id);
  const acceptance = mem.getDfMemoryState().acceptances.get(a.artifact_id) ?? null;
  const payability = assessQuotePayability({ artifact: a, quote: q ?? null, acceptance });
  if (!payability.ok) throw new Error(payability.code);

  const adapter = getFoundationPaymentAdapter();
  if (!adapter.configured && process.env.NODE_ENV === 'production') {
    throw new Error('PAYMENT_NOT_CONFIGURED');
  }
  const result = await adapter.createHostedCheckout({
    artifact_id: a.artifact_id,
    quote_id: q.quote_id,
    quote_version: q.quote_version,
    lead_id: a.lead_id,
    referral_source_id: a.referral_source_id,
    service_type: DIGITAL_FOUNDATION_SERVICE_ID,
    amount_minor: q.subtotal_minor,
    currency: q.currency,
    success_url: input.success_url,
    cancel_url: input.cancel_url,
    line_description: 'Digital Foundation',
  });
  if (!result.ok) throw new Error(result.code);

  a.payment_state = 'CHECKOUT_PENDING';
  mem.memSaveArtifact(a);
  mem.getDfMemoryState().checkoutSessions.set(result.session_id, {
    artifact_id: a.artifact_id,
    quote_id: q!.quote_id,
    session_id: result.session_id,
  });
  logEvent(a.artifact_id, 'CHECKOUT_CREATED', 'CLIENT', {
    session_id: result.session_id,
    quote_version: q!.quote_version,
  });
  schedulePersist(a.artifact_id);

  return {
    checkout_url: result.url,
    session_id: result.session_id,
    simulated: !adapter.configured,
  };
}

export async function confirmPaymentFromWebhook(input: {
  artifact_id: string;
  quote_id: string;
  stripe_event_id: string;
  session_id: string;
}): Promise<DigitalFoundationArtifact> {
  const s = mem.getDfMemoryState();
  if (s.stripeProcessedEventIds.has(input.stripe_event_id)) {
    const a = mem.memGetArtifact(input.artifact_id);
    if (!a) throw new Error('ARTIFACT_NOT_FOUND');
    return a;
  }

  const a = mem.memGetArtifact(input.artifact_id);
  if (!a) throw new Error('ARTIFACT_NOT_FOUND');
  if (a.payment_state === 'PAID') {
    s.stripeProcessedEventIds.add(input.stripe_event_id);
    return a;
  }
  const q = mem.memGetQuote(input.quote_id);
  if (!q) throw new Error('QUOTE_NOT_FOUND');
  const acceptance = s.acceptances.get(input.artifact_id);
  if (!acceptance || acceptance.quote_version !== q.quote_version) {
    throw new Error('QUOTE_VERSION_MISMATCH');
  }
  if (q.status === 'SUPERSEDED' || q.status === 'EXPIRED') {
    throw new Error('QUOTE_NOT_PAYABLE');
  }
  if (new Date(q.expires_at).getTime() < Date.now()) {
    throw new Error('QUOTE_EXPIRED');
  }

  q.status = 'PAID';
  mem.memSaveQuote(q);
  a.payment_state = 'PAID';
  a.quote_id = q.quote_id;
  if (a.state === 'AWAITING_PAYMENT' || a.state === 'AWAITING_ACCEPTANCE') {
    transitionArtifact(a, 'PAID');
  }
  a.project_state = 'ACTIVE';
  if (a.state === 'PAID') transitionArtifact(a, 'PROJECT_ACTIVE');
  if (a.state === 'PROJECT_ACTIVE') transitionArtifact(a, 'IN_PROGRESS');

  const stages = initialProjectStages(nowIso());
  s.stages.set(a.artifact_id, stages);
  logEvent(a.artifact_id, 'PAYMENT_CONFIRMED', 'STRIPE', { event_id: input.stripe_event_id });
  logEvent(a.artifact_id, 'PROJECT_ACTIVATED', 'SYSTEM');

  const lead = mem.memGetLead(a.lead_id);
  if (lead) {
    lead.referral_funnel_stage = 'PAID';
    mem.memSaveLead(lead);
  }

  s.stripeProcessedEventIds.add(input.stripe_event_id);
  mem.memSaveArtifact(a);
  const clock = s.readinessClock.get(a.artifact_id) ?? {
    readiness_satisfied_at: null,
    production_started_at: null,
  };
  if (!clock.readiness_satisfied_at) {
    clock.readiness_satisfied_at = nowIso();
    clock.production_started_at = clock.readiness_satisfied_at;
    s.readinessClock.set(a.artifact_id, clock);
  }
  schedulePersist(a.artifact_id);

  const { activateRunbookForArtifact, generateRunbookForArtifact } = await import('./operationsEngine.js');
  generateRunbookForArtifact(a.artifact_id);
  activateRunbookForArtifact(a.artifact_id);

  return a;
}

export function recordCheckoutExpired(artifactId: string, detail: Record<string, unknown>): void {
  const a = mem.memGetArtifact(artifactId);
  if (!a) return;
  if (a.payment_state === 'CHECKOUT_PENDING') {
    a.payment_state = 'NONE';
  }
  mem.memSaveArtifact(a);
  logEvent(artifactId, 'PAYMENT_FAILED', 'STRIPE', { ...detail, reason: 'CHECKOUT_EXPIRED' });
  schedulePersist(artifactId);
}

export function recordPaymentFailure(artifactId: string, detail: Record<string, unknown>): void {
  const a = mem.memGetArtifact(artifactId);
  if (!a) return;
  a.payment_state = 'FAILED';
  mem.memSaveArtifact(a);
  logEvent(artifactId, 'PAYMENT_FAILED', 'STRIPE', detail);
}

export function recordRefund(artifactId: string, detail: Record<string, unknown>): void {
  const a = mem.memGetArtifact(artifactId);
  if (!a) return;
  a.payment_state = 'REFUNDED';
  if (a.state !== 'ARCHIVED' && canTransitionArtifactState(a.state, 'ARCHIVED')) {
    transitionArtifact(a, 'ARCHIVED');
  }
  mem.memSaveArtifact(a);
  logEvent(artifactId, 'REFUND_RECORDED', 'STRIPE', detail);
  schedulePersist(artifactId);
}

export function createClientAction(input: {
  artifact_id: string;
  action_type: ClientActionRequest['action_type'];
  title: string;
  detail: string;
}): ClientActionRequest {
  const req: ClientActionRequest = {
    request_id: randomUUID(),
    artifact_id: input.artifact_id,
    action_type: input.action_type,
    title: input.title,
    detail: input.detail,
    status: 'OPEN',
    created_at: nowIso(),
    completed_at: null,
    response: null,
  };
  const list = mem.getDfMemoryState().clientActions.get(input.artifact_id) ?? [];
  list.push(req);
  mem.getDfMemoryState().clientActions.set(input.artifact_id, list);
  logEvent(input.artifact_id, 'CLIENT_ACTION_REQUESTED', 'FOUNDER', { request_id: req.request_id });
  return req;
}

export function completeClientAction(
  artifactId: string,
  requestId: string,
  response: Record<string, unknown>,
): ClientActionRequest {
  const list = mem.getDfMemoryState().clientActions.get(artifactId) ?? [];
  const req = list.find((r) => r.request_id === requestId);
  if (!req) throw new Error('REQUEST_NOT_FOUND');
  req.status = 'COMPLETED';
  req.completed_at = nowIso();
  req.response = response;

  const decision = parseClientApprovalDecision(response);
  const subject = approvalSubjectForAction(req.action_type);
  const targetVersion = targetVersionFromResponse(response);

  if (actionRequiresExplicitApproval(req)) {
    const approvals = mem.getDfMemoryState().approvals.get(artifactId) ?? [];
    const pending = approvals
      .filter((a) => a.subject === subject && a.status === 'REQUESTED')
      .sort((a, b) => b.version - a.version)[0];
    if (pending && pending.version !== targetVersion) {
      throw new Error('STALE_APPROVAL_VERSION');
    }

    if (decision === 'REQUEST_CHANGE') {
      const rec = {
        approval_id: randomUUID(),
        artifact_id: artifactId,
        subject,
        version: targetVersion,
        status: 'REVISION_REQUESTED' as const,
        actor: 'CLIENT' as const,
        note: String(response.notes ?? response.note ?? ''),
        created_at: nowIso(),
        resolved_at: nowIso(),
      };
      approvals.push(rec);
      mem.getDfMemoryState().approvals.set(artifactId, approvals);
      logEvent(artifactId, 'REVISION_REQUESTED', 'CLIENT', { subject, version: targetVersion });
      logEvent(artifactId, 'CLIENT_ACTION_COMPLETED', 'CLIENT', { request_id: requestId, decision });
      schedulePersist(artifactId);
      return req;
    }

    const rec = {
      approval_id: randomUUID(),
      artifact_id: artifactId,
      subject,
      version: targetVersion,
      status: 'APPROVED' as const,
      actor: 'CLIENT' as const,
      note: String(response.notes ?? response.note ?? '') || null,
      created_at: nowIso(),
      resolved_at: nowIso(),
    };
    approvals.push(rec);
    mem.getDfMemoryState().approvals.set(artifactId, approvals);
    logEvent(artifactId, 'APPROVED', 'CLIENT', { subject, version: targetVersion });
  }

  logEvent(artifactId, 'CLIENT_ACTION_COMPLETED', 'CLIENT', { request_id: requestId, decision });

  const tasks = mem.getDfMemoryState().tasks.get(artifactId) ?? [];
  const linked = tasks.find((t) => t.client_action_request_id === requestId);
  if (linked && decision === 'APPROVE') {
    linked.status = 'COMPLETE';
    linked.completed_at = nowIso();
    mem.getDfMemoryState().tasks.set(artifactId, tasks);
    logEvent(artifactId, 'TASK_COMPLETED', 'CLIENT', { task_id: linked.task_id });
    void import('./operationsEngine.js').then(({ syncDerivedState }) => syncDerivedState(artifactId));
  }
  schedulePersist(artifactId);
  return req;
}

export function requestApproval(input: {
  artifact_id: string;
  subject: string;
  version?: number;
}): ApprovalRecord {
  const rec: ApprovalRecord = {
    approval_id: randomUUID(),
    artifact_id: input.artifact_id,
    subject: input.subject,
    version: input.version ?? 1,
    status: 'REQUESTED',
    actor: 'FOUNDER',
    note: null,
    created_at: nowIso(),
    resolved_at: null,
  };
  const list = mem.getDfMemoryState().approvals.get(input.artifact_id) ?? [];
  list.push(rec);
  mem.getDfMemoryState().approvals.set(input.artifact_id, list);
  logEvent(input.artifact_id, 'APPROVAL_REQUESTED', 'FOUNDER', { subject: input.subject });
  return rec;
}

export function resolveApproval(
  artifactId: string,
  approvalId: string,
  status: 'APPROVED' | 'REVISION_REQUESTED',
  actor: ApprovalRecord['actor'],
  note?: string,
): ApprovalRecord {
  const list = mem.getDfMemoryState().approvals.get(artifactId) ?? [];
  const rec = list.find((a) => a.approval_id === approvalId);
  if (!rec) throw new Error('APPROVAL_NOT_FOUND');
  rec.status = status;
  rec.actor = actor;
  rec.note = note ?? null;
  rec.resolved_at = nowIso();
  logEvent(artifactId, status === 'APPROVED' ? 'APPROVED' : 'REVISION_REQUESTED', actor, { approval_id: approvalId });
  return rec;
}

export function updateProjectStage(
  artifactId: string,
  stage_code: ProjectStageRecord['stage_code'],
  status: ProjectStageRecord['status'],
): ProjectStageRecord[] {
  const stages = mem.getDfMemoryState().stages.get(artifactId) ?? initialProjectStages(nowIso());
  const stage = stages.find((s) => s.stage_code === stage_code);
  if (stage) {
    stage.status = status;
    stage.updated_at = nowIso();
    logEvent(artifactId, status === 'COMPLETE' ? 'STAGE_COMPLETED' : 'STAGE_STARTED', 'FOUNDER', {
      stage_code,
      status,
    });
  }
  mem.getDfMemoryState().stages.set(artifactId, stages);
  return stages;
}

export function markFoundationComplete(
  artifactId: string,
  ownership?: OwnershipRecord,
  opts?: { founder_override?: boolean; override_reason?: string },
): DigitalFoundationArtifact {
  const a = mem.memGetArtifact(artifactId);
  if (!a) throw new Error('ARTIFACT_NOT_FOUND');
  if (a.payment_state !== 'PAID') throw new Error('PAYMENT_REQUIRED');

  const resolvedOwnership = ownership ?? prepareOwnershipFromOperations(artifactId);
  const gate = assessArtifactCompletion(artifactId);
  if (!gate.ok && !opts?.founder_override) {
    throw new Error(`COMPLETION_GATE_FAILED:${gate.reasons.join(',')}`);
  }
  if (!gate.ok && opts?.founder_override) {
    logEvent(artifactId, 'FOUNDATION_VERIFIED', 'FOUNDER', {
      override: true,
      reason: opts.override_reason ?? 'Founder manual verification override',
    });
  } else {
    logEvent(artifactId, 'FOUNDATION_VERIFIED', 'SYSTEM');
  }

  mem.getDfMemoryState().ownership.set(artifactId, resolvedOwnership);
  a.completion_state = 'COMPLETE';
  a.completed_at = nowIso();
  transitionArtifact(a, 'FINAL_VERIFICATION');
  transitionArtifact(a, 'COMPLETE');

  const config = getCommercialConfig();
  const credit: FoundationBuildCredit = {
    credit_id: randomUUID(),
    artifact_id: artifactId,
    amount_minor: config.foundation_credit_amount_minor,
    currency: config.base_currency,
    valid_from: nowIso(),
    expires_at: new Date(Date.now() + config.foundation_credit_validity_days * 864e5).toISOString(),
    status: 'AVAILABLE',
    applicable_product_types: ['SITE00.BLDR'],
    applied_project_id: null,
    created_at: nowIso(),
  };
  mem.getDfMemoryState().credits.set(credit.credit_id, credit);
  a.foundation_credit_id = credit.credit_id;
  transitionArtifact(a, 'BUILD_OPPORTUNITY');

  updateProjectStage(artifactId, '07_FOUNDATION_COMPLETE', 'COMPLETE');

  logEvent(artifactId, 'FOUNDATION_COMPLETED', 'FOUNDER');
  logEvent(artifactId, 'CREDIT_CREATED', 'SYSTEM', { credit_id: credit.credit_id });

  const lead = mem.memGetLead(a.lead_id);
  if (lead) {
    lead.referral_funnel_stage = 'COMPLETE';
    mem.memSaveLead(lead);
  }
  mem.memSaveArtifact(a);
  return a;
}

export function captureBuildInterest(
  artifactId: string,
  interest: DigitalFoundationArtifact['build_interest'],
): DigitalFoundationArtifact {
  const a = mem.memGetArtifact(artifactId);
  if (!a) throw new Error('ARTIFACT_NOT_FOUND');
  a.build_interest = interest;
  logEvent(artifactId, 'BUILD_INTEREST_CAPTURED', 'CLIENT', { interest });
  const lead = mem.memGetLead(a.lead_id);
  if (lead && interest === 'INTERESTED') {
    lead.referral_funnel_stage = 'BUILD_INTEREST';
    mem.memSaveLead(lead);
  }
  mem.memSaveArtifact(a);
  return a;
}

export function applyManualQuoteAdjustment(artifactId: string, adjustmentMinor: number): DigitalFoundationQuote {
  const a = mem.memGetArtifact(artifactId);
  if (!a?.quote_id) throw new Error('QUOTE_NOT_FOUND');
  const prev = mem.memGetQuote(a.quote_id)!;
  const selections = prev.selected_addons.map((l) => ({ addon_id: l.addon_id, quantity: l.quantity }));
  const config = getCommercialConfig();
  const quote = createQuoteDraft({
    artifact_id: artifactId,
    selections,
    config,
    quote_version: prev.quote_version + 1,
    status: prev.status === 'ACCEPTED' ? 'CLIENT_REVIEW' : 'DRAFT',
    manual_adjustments_minor: adjustmentMinor,
  });
  prev.status = 'SUPERSEDED';
  mem.memSaveQuote(prev);
  mem.memSaveQuote(quote);
  a.quote_id = quote.quote_id;
  if (a.state === 'AWAITING_PAYMENT') transitionArtifact(a, 'QUOTE_READY');
  mem.memSaveArtifact(a);
  return quote;
}

export function getArtifactPayloadByToken(token: string): DigitalFoundationArtifactPayload {
  const artifact = openArtifactByToken(token);
  return getArtifactPayload(artifact.artifact_id);
}

export function getClientArtifactPayloadByToken(token: string) {
  const internal = getArtifactPayloadByToken(token);
  const s = mem.getDfMemoryState();
  const clock = s.readinessClock.get(internal.artifact.artifact_id);
  const timeline_readiness = computeReadinessState({
    artifact: internal.artifact,
    quote: internal.quote,
    stages: internal.stages,
    production_started_at: clock?.production_started_at ?? null,
    readiness_satisfied_at: clock?.readiness_satisfied_at ?? null,
    projected_min_days: internal.quote?.projected_min_days ?? null,
    projected_max_days: internal.quote?.projected_max_days ?? null,
  });
  return toClientArtifactPayload(internal, timeline_readiness, getCommunicationPreferencesForArtifact(internal.artifact.artifact_id));
}

export function getCommunicationPreferencesForArtifact(artifactId: string) {
  const artifact = mem.memGetArtifact(artifactId);
  const lead = artifact ? mem.memGetLead(artifact.lead_id) : undefined;
  const email = lead?.contact_email ?? artifact?.intake.current_email ?? '';
  const stored = mem.getDfMemoryState().communicationConsents.get(artifactId);
  return {
    marketing_opt_in: stored?.marketing_opt_in ?? false,
    project_operations: stored?.categories.PROJECT_OPERATIONS ?? true,
    educational: stored?.categories.EDUCATIONAL ?? false,
  } satisfies import('../../../shared/site00-digital-foundation/clientProjection.js').ClientCommunicationPreferences;
}

export function updateCommunicationPreferences(
  artifactId: string,
  preferences: import('../../../shared/site00-digital-foundation/clientProjection.js').ClientCommunicationPreferences,
): CommunicationConsentRecord {
  const artifact = mem.memGetArtifact(artifactId);
  if (!artifact) throw new Error('ARTIFACT_NOT_FOUND');
  const lead = mem.memGetLead(artifact.lead_id);
  const email = lead?.contact_email ?? artifact.intake.current_email ?? '';
  const rec: CommunicationConsentRecord = {
    artifact_id: artifactId,
    contact_email: email,
    marketing_opt_in: preferences.marketing_opt_in,
    categories: {
      PROJECT_OPERATIONS: preferences.project_operations,
      EDUCATIONAL: preferences.educational,
      MARKETING: preferences.marketing_opt_in,
      ESSENTIAL_SERVICE: true,
      SECURITY: true,
    },
    consent_source: 'CLIENT_PREFERENCE_CENTER',
    consent_at: nowIso(),
    notice_version: 'df-comm-prefs-v1',
    updated_at: nowIso(),
  };
  mem.getDfMemoryState().communicationConsents.set(artifactId, rec);
  logEvent(artifactId, 'INTAKE_UPDATED', 'CLIENT', { communication_preferences: true });
  schedulePersist(artifactId);
  return rec;
}

export function getArtifactPayload(artifactId: string): DigitalFoundationArtifactPayload {
  const artifact = mem.memGetArtifact(artifactId);
  if (!artifact) throw new Error('ARTIFACT_NOT_FOUND');
  const lead = mem.memGetLead(artifact.lead_id);
  if (!lead) throw new Error('LEAD_NOT_FOUND');

  const quote = artifact.quote_id ? mem.memGetQuote(artifact.quote_id) ?? null : null;
  const config = getCommercialConfig();
  const recommendation =
    artifact.intake_state === 'COMPLETE'
      ? recommendFromIntake(artifact.intake, config).recommendation
      : null;

  const s = mem.getDfMemoryState();
  const opsTasks = s.tasks.get(artifactId);
  if (opsTasks?.length) {
    void import('./operationsEngine.js').then(({ syncDerivedState }) => syncDerivedState(artifactId));
  }
  const stages = s.stages.get(artifactId) ?? [];
  const forecast = s.forecasts.get(artifactId);
  const openActions = (s.clientActions.get(artifactId) ?? []).filter((c) => c.status === 'OPEN');
  const currentStage = stages.find((st) => st.status !== 'COMPLETE')?.stage_code ?? stages.at(-1)?.stage_code ?? null;

  return {
    artifact,
    lead,
    referral_source: getReferral(artifact.referral_source_id),
    quote,
    recommendation,
    acceptance: s.acceptances.get(artifactId) ?? null,
    stages,
    client_actions: openActions,
    approvals: s.approvals.get(artifactId) ?? [],
    ownership_record: s.ownership.get(artifactId) ?? null,
    build_readiness: s.buildReadiness.get(artifactId) ?? null,
    credit: artifact.foundation_credit_id ? s.credits.get(artifact.foundation_credit_id) ?? null : null,
    events: s.events.filter((e) => e.artifact_id === artifactId).slice(-50),
    surface: resolveArtifactSurfaceForClient(artifact),
    operations_summary:
      artifact.payment_state === 'PAID'
        ? {
            current_stage: currentStage,
            needs_you_count: openActions.length,
            projected_completion: forecast
              ? `${forecast.current_min_days}–${forecast.current_max_days} business days`
              : null,
          }
        : undefined,
  };
}

export function expireFoundationCredit(creditId: string): FoundationBuildCredit {
  const credit = mem.getDfMemoryState().credits.get(creditId);
  if (!credit) throw new Error('CREDIT_NOT_FOUND');
  if (credit.status === 'APPLIED') throw new Error('CREDIT_ALREADY_APPLIED');
  credit.status = 'EXPIRED';
  return credit;
}

export function reserveFoundationCredit(creditId: string): FoundationBuildCredit {
  const credit = mem.getDfMemoryState().credits.get(creditId);
  if (!credit) throw new Error('CREDIT_NOT_FOUND');
  if (credit.status !== 'AVAILABLE') throw new Error('CREDIT_NOT_AVAILABLE');
  credit.status = 'RESERVED';
  return credit;
}

export function applyFoundationCredit(creditId: string, projectId: string): FoundationBuildCredit {
  const credit = mem.getDfMemoryState().credits.get(creditId);
  if (!credit) throw new Error('CREDIT_NOT_FOUND');
  if (credit.status === 'APPLIED') throw new Error('CREDIT_ALREADY_APPLIED');
  if (credit.status === 'EXPIRED' || credit.status === 'VOID') throw new Error('CREDIT_NOT_AVAILABLE');
  credit.status = 'APPLIED';
  credit.applied_project_id = projectId;
  return credit;
}

/** Run a named fixture scenario for QA / tests. */
export async function materializeFixtureScenario(
  scenarioId: string,
): Promise<{ artifact: DigitalFoundationArtifact; token: string }> {
  const { FOUNDATION_FIXTURE_SCENARIOS } = await import('../../../shared/site00-digital-foundation/fixtures/scenarios.js');
  const scenario = FOUNDATION_FIXTURE_SCENARIOS.find((s) => s.id === scenarioId);
  if (!scenario) throw new Error('FIXTURE_NOT_FOUND');

  const artifact = createArtifactForLead({
    referral_kind: scenario.referral_kind ?? 'DIRECT',
    business_name: scenario.intake.business_name ?? `Fixture ${scenario.id}`,
  });
  updateIntake(artifact.artifact_id, scenario.intake, true);

  if (scenario.extra_addon_selections?.length) {
    updateQuoteSelections(artifact.artifact_id, scenario.extra_addon_selections, 'FOUNDER');
  }

  const quoteAfterAccept = () => mem.memGetQuote(mem.memGetArtifact(artifact.artifact_id)!.quote_id!)!;

  acceptQuote({
    artifact_id: artifact.artifact_id,
    disclosures: [
      'I HAVE REVIEWED MY DIGITAL FOUNDATION SCOPE.',
      'I UNDERSTAND THAT DOMAIN / EMAIL PROVIDER SUBSCRIPTIONS AND OTHER THIRD-PARTY FEES MAY BE SEPARATE.',
      'I UNDERSTAND THAT THE PROJECTED TURNAROUND BEGINS AFTER REQUIRED INFORMATION, ACCESS AND PAYMENT ARE RECEIVED.',
    ],
  });

  const qPrePay = quoteAfterAccept();
  if (qPrePay.selected_addons.some((l) => l.requires_manual_review)) {
    markQuoteCommerciallyReady(artifact.artifact_id);
  }

  if (scenario.simulate_payment === 'success' || scenario.simulate_payment === 'refund') {
    const q = mem.memGetQuote(mem.memGetArtifact(artifact.artifact_id)!.quote_id!)!;
    const { simulateStripeCheckoutCompleted } = await import('./payment/webhookHandler.js');
    await simulateStripeCheckoutCompleted({ artifact_id: artifact.artifact_id, quote_id: q.quote_id });
    if (scenario.simulate_payment === 'refund') {
      recordRefund(artifact.artifact_id, { fixture: scenario.id });
    }
  } else if (scenario.simulate_payment === 'failure') {
    recordPaymentFailure(artifact.artifact_id, { fixture: scenario.id });
  }

  if (scenario.mark_complete) {
    markFoundationComplete(
      artifact.artifact_id,
      {
        business: scenario.intake.business_name ?? 'Fixture business',
        domain: scenario.intake.existing_domain ?? 'example.com',
        registrar: 'Example Registrar',
        renewal_date: null,
        email_provider: 'Google Workspace',
        primary_mailbox: 'hello@example.com',
        aliases: [],
        dns_status: 'CONFIGURED',
        security_status: 'PROTECTED',
        owner: scenario.intake.contact_name ?? null,
        administrative_access_model: 'Client-owned with SITE 00 setup',
      },
      { founder_override: true, override_reason: 'Fixture completion' },
    );
  }

  const fresh = mem.memGetArtifact(artifact.artifact_id)!;
  return { artifact: fresh, token: fresh.public_token };
}
