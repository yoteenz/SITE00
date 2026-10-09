import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { INVITATION_SYSTEM_VERSION } from '../../../shared/site00-invitation-system/version.js';
import type { InvitationEntryPresentation } from '../../../shared/site00-invitation-system/contracts/entryPresentation.js';
import type { FounderInvitationReviewSnapshot } from '../../../shared/site00-invitation-system/contracts/founderReview.js';
import type { PartnerReportingSummary } from '../../../shared/site00-invitation-system/contracts/partnerReporting.js';
import type {
  InvitationActivation,
  InvitationCode,
  InvitationVisit,
  ReferralBusinessEvent,
  ReferralBusinessEventType,
  VisitTrafficClass,
} from '../../../shared/site00-invitation-system/types.js';
import { createArtifactForLead } from '../digitalFoundation/service.js';
import { getInvitationMemoryState } from './memoryStore.js';
import { createCommissionCandidate } from './commissionLedger.js';

function nowIso(): string {
  return new Date().toISOString();
}

function hashSecret(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function dedupeBucket(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function classifyTraffic(userAgent: string | null): VisitTrafficClass {
  const ua = (userAgent ?? '').toLowerCase();
  if (!ua) return 'UNKNOWN';
  if (/bot|crawler|spider|preview|slackbot|facebookexternalhit|whatsapp/i.test(ua)) return 'BOT';
  if (/curl|wget|python-requests|go-http-client/i.test(ua)) return 'PREVIEW';
  return 'HUMAN';
}

function logEvent(input: Omit<ReferralBusinessEvent, 'event_id' | 'received_at'>): ReferralBusinessEvent {
  const state = getInvitationMemoryState();
  if (state.processedIdempotency.has(input.idempotency_key)) {
    return state.events.find((e) => e.idempotency_key === input.idempotency_key)!;
  }
  const event: ReferralBusinessEvent = {
    ...input,
    event_id: randomUUID(),
    received_at: nowIso(),
  };
  state.events.push(event);
  state.processedIdempotency.add(input.idempotency_key);
  return event;
}

function resolveCodeRecord(code: string): InvitationCode | null {
  const state = getInvitationMemoryState();
  const id = state.codesByValue.get(code);
  if (!id) return null;
  return state.codes.get(id) ?? null;
}

function campaignForCode(code: InvitationCode) {
  const state = getInvitationMemoryState();
  const campaign = state.campaigns.get(code.campaign_id);
  const partner = campaign ? state.partners.get(campaign.partner_id) : null;
  return { campaign, partner };
}

export function resolveInvitationCode(code: string): {
  ok: boolean;
  reason: InvitationEntryPresentation['resolution'];
  code: InvitationCode | null;
} {
  const record = resolveCodeRecord(code);
  if (!record) return { ok: false, reason: 'UNKNOWN', code: null };
  if (record.status === 'REVOKED') return { ok: false, reason: 'REVOKED', code: record };
  if (record.status === 'EXPIRED' || (record.expires_at && record.expires_at < nowIso())) {
    return { ok: false, reason: 'EXPIRED', code: record };
  }
  const { campaign } = campaignForCode(record);
  if (!campaign || campaign.status === 'REVOKED' || campaign.status === 'RETIRED') {
    return { ok: false, reason: 'REVOKED', code: record };
  }
  if (campaign.status === 'PAUSED') return { ok: false, reason: 'PAUSED', code: record };
  return { ok: true, reason: 'VALID', code: record };
}

export function recordInvitationVisit(input: {
  code: string;
  visitor_key: string;
  user_agent?: string | null;
  referrer?: string | null;
}): { visit: InvitationVisit | null; resolution: InvitationEntryPresentation['resolution'] } {
  const resolved = resolveInvitationCode(input.code);
  if (!resolved.ok || !resolved.code) return { visit: null, resolution: resolved.reason };
  const { campaign, partner } = campaignForCode(resolved.code);
  if (!campaign || !partner) return { visit: null, resolution: 'UNAVAILABLE' };

  const state = getInvitationMemoryState();
  const bucket = dedupeBucket();
  const anonymous_visit_key = createHash('sha256')
    .update(`${resolved.code.invitation_code_id}:${input.visitor_key}:${bucket}`)
    .digest('hex');
  const repeat = [...state.visits.values()].some(
    (v) => v.anonymous_visit_key === anonymous_visit_key && v.invitation_code_id === resolved.code!.invitation_code_id,
  );

  const visit: InvitationVisit = {
    visit_id: randomUUID(),
    invitation_code_id: resolved.code.invitation_code_id,
    campaign_id: campaign.campaign_id,
    partner_id: partner.partner_id,
    anonymous_visit_key,
    traffic_class: classifyTraffic(input.user_agent ?? null),
    user_agent: input.user_agent ?? null,
    referrer: input.referrer ?? null,
    dedupe_bucket: bucket,
    is_repeat_in_bucket: repeat,
    occurred_at: nowIso(),
  };
  state.visits.set(visit.visit_id, visit);

  logEvent({
    event_type: repeat ? 'INVITATION_VIEWED' : 'INVITATION_SCANNED',
    occurred_at: visit.occurred_at,
    partner_id: partner.partner_id,
    campaign_id: campaign.campaign_id,
    invitation_code_id: resolved.code.invitation_code_id,
    activation_id: null,
    client_id: null,
    foundation_artifact_id: null,
    bldr_project_id: null,
    source_system: 'SITE00_INVITATION_SYSTEM',
    source_transaction_id: null,
    correlation_id: visit.visit_id,
    policy_version: state.policy.version,
    idempotency_key: `visit:${visit.visit_id}`,
    payload: { traffic_class: visit.traffic_class, repeat },
  });

  return { visit, resolution: 'VALID' };
}

export function buildEntryPresentation(input: {
  code: string;
  visit_id?: string | null;
  activation_id?: string | null;
}): InvitationEntryPresentation {
  const state = getInvitationMemoryState();
  const resolved = resolveInvitationCode(input.code);
  const activation =
    input.activation_id && state.activations.get(input.activation_id)
      ? state.activations.get(input.activation_id)!
      : null;

  let resolution = resolved.reason;
  if (activation?.foundation_public_token) resolution = 'RETURNING_USER';
  if (activation?.status === 'FOUNDATION_LINKED') resolution = 'EXISTING_FOUNDATION';

  const campaign = resolved.code ? state.campaigns.get(resolved.code.campaign_id) : null;
  const partner = campaign ? state.partners.get(campaign.partner_id) : null;

  return {
    phase: activation?.foundation_public_token ? 'FOUNDATION' : 'WELCOME',
    resolution,
    collection_label: campaign?.collection_label ?? 'INVITATION',
    partner_presented_through: partner ? `PRESENTED THROUGH ${partner.legal_name}` : 'SITE 00',
    headline_candidates: [
      'YOUR BUSINESS HAS AN ADDRESS.',
      'NOW GIVE IT A PRESENCE.',
      'YOUR NEXT ADDRESS BEGINS HERE.',
      'ACTIVATE YOUR DIGITAL FOUNDATION.',
    ],
    primary_service: campaign?.primary_service ?? 'SITE 00 DIGITAL FOUNDATION',
    secondary_expansion: campaign?.secondary_expansion ?? 'SITE 00 BLDR',
    activation: {
      can_begin: resolved.ok,
      activation_id: activation?.activation_id ?? null,
      requires_identity_verification: true,
    },
    foundation: {
      route: activation?.foundation_public_token ? `/foundation/${activation.foundation_public_token}` : null,
      artifact_state: activation?.foundation_artifact_id ? 'LINKED' : null,
    },
    next_address: { bldr_available: Boolean(activation?.foundation_public_token) },
    policy_version: state.policy.version,
    invitation_system_version: INVITATION_SYSTEM_VERSION,
  };
}

export function beginSecureActivation(input: {
  code: string;
  visit_id: string;
  contact_email: string;
}): { ok: true; activation_id: string; verification_required: true } | { ok: false; error: string } {
  const resolved = resolveInvitationCode(input.code);
  if (!resolved.ok || !resolved.code) return { ok: false, error: 'Invitation not available' };

  const state = getInvitationMemoryState();
  const visit = state.visits.get(input.visit_id);
  if (!visit || visit.invitation_code_id !== resolved.code.invitation_code_id) {
    return { ok: false, error: 'Visit not valid for this invitation' };
  }

  const existing = [...state.activations.values()].find(
    (a) => a.visit_id === visit.visit_id && a.status !== 'ABANDONED',
  );
  if (existing) {
    return { ok: true, activation_id: existing.activation_id, verification_required: true };
  }

  const secret = randomBytes(24).toString('base64url');
  const activation: InvitationActivation = {
    activation_id: randomUUID(),
    visit_id: visit.visit_id,
    invitation_code_id: resolved.code.invitation_code_id,
    campaign_id: visit.campaign_id,
    partner_id: visit.partner_id,
    status: 'IDENTITY_PENDING',
    contact_email: input.contact_email.trim().toLowerCase(),
    verified_client_id: null,
    foundation_artifact_id: null,
    foundation_public_token: null,
    activation_secret_hash: hashSecret(secret),
    policy_version: state.policy.version,
    created_at: nowIso(),
    updated_at: nowIso(),
    identity_verified_at: null,
  };
  state.activations.set(activation.activation_id, activation);

  logEvent({
    event_type: 'INVITATION_ACTIVATED',
    occurred_at: nowIso(),
    partner_id: activation.partner_id,
    campaign_id: activation.campaign_id,
    invitation_code_id: activation.invitation_code_id,
    activation_id: activation.activation_id,
    client_id: null,
    foundation_artifact_id: null,
    bldr_project_id: null,
    source_system: 'SITE00_INVITATION_SYSTEM',
    source_transaction_id: null,
    correlation_id: activation.activation_id,
    policy_version: state.policy.version,
    idempotency_key: `activation:begin:${activation.activation_id}`,
    payload: {},
  });

  return { ok: true, activation_id: activation.activation_id, verification_required: true };
}

export function completeVerifiedActivation(input: {
  activation_id: string;
  verification_secret: string;
  verified_client_id?: string | null;
}): {
  ok: boolean;
  foundation_token?: string;
  attribution_id?: string;
  error?: string;
} {
  const state = getInvitationMemoryState();
  const activation = state.activations.get(input.activation_id);
  if (!activation) return { ok: false, error: 'Activation not found' };

  if (activation.foundation_public_token) {
    return {
      ok: true,
      foundation_token: activation.foundation_public_token,
      attribution_id: [...state.attributions.values()].find((a) => a.activation_id === activation.activation_id)?.attribution_id,
    };
  }

  const expected = activation.activation_secret_hash;
  const provided = hashSecret(input.verification_secret);
  if (!expected || !timingSafeEqual(Buffer.from(expected), Buffer.from(provided))) {
    return { ok: false, error: 'Verification failed' };
  }

  activation.status = 'IDENTITY_VERIFIED';
  activation.identity_verified_at = nowIso();
  activation.verified_client_id = input.verified_client_id ?? null;
  activation.updated_at = nowIso();

  const artifact = createArtifactForLead({
    contact_email: activation.contact_email,
    referral_kind: 'AIO',
  });

  activation.foundation_artifact_id = artifact.artifact_id;
  activation.foundation_public_token = artifact.public_token;
  activation.status = 'FOUNDATION_LINKED';
  activation.updated_at = nowIso();

  const attribution = {
    attribution_id: randomUUID(),
    partner_id: activation.partner_id,
    campaign_id: activation.campaign_id,
    invitation_code_id: activation.invitation_code_id,
    activation_id: activation.activation_id,
    client_id: activation.verified_client_id,
    foundation_artifact_id: artifact.artifact_id,
    foundation_project_id: null,
    bldr_project_id: null,
    policy_version: state.policy.version,
    eligibility: 'CANDIDATE' as const,
    disqualification_reason: null,
    captured_at: nowIso(),
  };
  state.attributions.set(attribution.attribution_id, attribution);

  logEvent({
    event_type: 'CLIENT_IDENTITY_VERIFIED',
    occurred_at: activation.identity_verified_at,
    partner_id: activation.partner_id,
    campaign_id: activation.campaign_id,
    invitation_code_id: activation.invitation_code_id,
    activation_id: activation.activation_id,
    client_id: activation.verified_client_id,
    foundation_artifact_id: artifact.artifact_id,
    bldr_project_id: null,
    source_system: 'SITE00_INVITATION_SYSTEM',
    source_transaction_id: null,
    correlation_id: activation.activation_id,
    policy_version: state.policy.version,
    idempotency_key: `activation:verified:${activation.activation_id}`,
    payload: {},
  });

  logEvent({
    event_type: 'FOUNDATION_STARTED',
    occurred_at: nowIso(),
    partner_id: activation.partner_id,
    campaign_id: activation.campaign_id,
    invitation_code_id: activation.invitation_code_id,
    activation_id: activation.activation_id,
    client_id: activation.verified_client_id,
    foundation_artifact_id: artifact.artifact_id,
    bldr_project_id: null,
    source_system: 'SITE00_DIGITAL_FOUNDATION',
    source_transaction_id: artifact.artifact_id,
    correlation_id: activation.activation_id,
    policy_version: state.policy.version,
    idempotency_key: `foundation:start:${artifact.artifact_id}`,
    payload: {},
  });

  return { ok: true, foundation_token: artifact.public_token, attribution_id: attribution.attribution_id };
}

/** Issue a one-time verification secret for tests / controlled environments only. */
export function issueActivationVerificationSecretForTests(activationId: string, secret: string): void {
  if (process.env.NODE_ENV === 'production') return;
  const state = getInvitationMemoryState();
  const activation = state.activations.get(activationId);
  if (!activation) return;
  activation.activation_secret_hash = hashSecret(secret);
}

export function recordConversionEvent(input: {
  event_type: ReferralBusinessEventType;
  partner_id: string;
  campaign_id: string;
  activation_id: string;
  foundation_artifact_id?: string | null;
  payment_id?: string | null;
  eligible_amount_minor?: number;
  idempotency_key: string;
}): ReferralBusinessEvent {
  const state = getInvitationMemoryState();
  const event = logEvent({
    event_type: input.event_type,
    occurred_at: nowIso(),
    partner_id: input.partner_id,
    campaign_id: input.campaign_id,
    invitation_code_id: null,
    activation_id: input.activation_id,
    client_id: null,
    foundation_artifact_id: input.foundation_artifact_id ?? null,
    bldr_project_id: null,
    source_system: 'SITE00_INVITATION_SYSTEM',
    source_transaction_id: input.payment_id ?? null,
    correlation_id: input.activation_id,
    policy_version: state.policy.version,
    idempotency_key: input.idempotency_key,
    payload: { eligible_amount_minor: input.eligible_amount_minor ?? 0 },
  });

  if (input.event_type === 'FOUNDATION_PURCHASED' && input.payment_id) {
    const attribution = [...state.attributions.values()].find((a) => a.activation_id === input.activation_id);
    if (attribution) {
      createCommissionCandidate({
        partner_id: input.partner_id,
        attribution_id: attribution.attribution_id,
        product: 'FOUNDATION',
        eligible_amount_minor: input.eligible_amount_minor ?? 0,
        qualifying_payment_id: input.payment_id,
        event_type: 'FOUNDATION_PURCHASED',
      });
    }
  }
  return event;
}

export function getPartnerReporting(partnerId: string, from: string, to: string): PartnerReportingSummary | null {
  const state = getInvitationMemoryState();
  const partner = state.partners.get(partnerId);
  if (!partner) return null;

  const inWindow = (iso: string) => iso >= from && iso <= to;
  const visits = [...state.visits.values()].filter((v) => v.partner_id === partnerId && inWindow(v.occurred_at));
  const activations = [...state.activations.values()].filter(
    (a) => a.partner_id === partnerId && inWindow(a.created_at),
  );
  const foundationStarts = state.events.filter(
    (e) => e.partner_id === partnerId && e.event_type === 'FOUNDATION_STARTED' && inWindow(e.occurred_at),
  );
  const foundationPurchases = state.events.filter(
    (e) => e.partner_id === partnerId && e.event_type === 'FOUNDATION_PURCHASED' && inWindow(e.occurred_at),
  );
  const commissions = [...state.commissions.values()].filter((c) => c.partner_id === partnerId);

  const sumStatus = (status: string) =>
    commissions.filter((c) => c.status === status).reduce((n, c) => n + c.calculated_reward_minor, 0);

  const campaigns = [...state.campaigns.values()].filter((c) => c.partner_id === partnerId);

  return {
    window: { partner_id: partnerId, display_id: partner.display_id, from, to },
    totals: {
      invitation_visits: visits.length,
      unique_visit_buckets: new Set(visits.map((v) => v.anonymous_visit_key)).size,
      verified_activations: activations.filter((a) => a.identity_verified_at).length,
      foundation_starts: foundationStarts.length,
      foundation_purchases: foundationPurchases.length,
      foundation_completions: state.events.filter(
        (e) => e.partner_id === partnerId && e.event_type === 'FOUNDATION_COMPLETED' && inWindow(e.occurred_at),
      ).length,
      bldr_leads: state.events.filter(
        (e) => e.partner_id === partnerId && e.event_type === 'BLDR_EXPLORED' && inWindow(e.occurred_at),
      ).length,
      bldr_signed_projects: state.events.filter(
        (e) => e.partner_id === partnerId && e.event_type === 'BLDR_CONTRACT_ACCEPTED' && inWindow(e.occurred_at),
      ).length,
    },
    commissions: {
      eligible_minor: sumStatus('QUALIFIED') + sumStatus('CANDIDATE') + sumStatus('PENDING'),
      pending_minor: sumStatus('PENDING'),
      approved_minor: sumStatus('APPROVED'),
      paid_minor: sumStatus('PAID'),
      reversed_minor: sumStatus('REVERSED'),
      currency: 'USD',
      payout_live: false,
    },
    campaign_performance: campaigns.map((c) => ({
      campaign_id: c.campaign_id,
      collection_label: c.collection_label,
      visits: visits.filter((v) => v.campaign_id === c.campaign_id).length,
      activations: activations.filter((a) => a.campaign_id === c.campaign_id).length,
      foundation_purchases: foundationPurchases.filter((e) => e.campaign_id === c.campaign_id).length,
    })),
  };
}

export function getFounderReviewSnapshot(): FounderInvitationReviewSnapshot {
  const state = getInvitationMemoryState();
  const pending = [...state.commissions.values()]
    .filter((c) => c.status === 'CANDIDATE' || c.status === 'PENDING' || c.status === 'QUALIFIED')
    .reduce((n, c) => n + c.calculated_reward_minor, 0);
  return {
    invitation_system_version: INVITATION_SYSTEM_VERSION,
    partners: [...state.partners.values()],
    campaigns: [...state.campaigns.values()],
    attribution_policy_version: state.policy.version,
    commission_rule_version: state.commissionRules.version,
    commission_rates_approved: false,
    public_activation: false,
    live_payouts: false,
    pending_commission_liability_minor: pending,
  };
}

export function listPartners() {
  return [...getInvitationMemoryState().partners.values()];
}
