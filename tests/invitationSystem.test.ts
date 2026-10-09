import { describe, expect, it, beforeEach } from 'vitest';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import { resetInvitationMemoryState } from '../api/_lib/invitationSystem/memoryStore.js';
import {
  beginSecureActivation,
  buildEntryPresentation,
  completeVerifiedActivation,
  getPartnerReporting,
  issueActivationVerificationSecretForTests,
  recordConversionEvent,
  recordInvitationVisit,
  resolveInvitationCode,
} from '../api/_lib/invitationSystem/service.js';
import { reverseCommission } from '../api/_lib/invitationSystem/commissionLedger.js';
import { mayCreateCommissionCandidate } from '../api/_lib/invitationSystem/eligibility.js';
import { getInvitationMemoryState } from '../api/_lib/invitationSystem/memoryStore.js';
import {
  aioOfficeInvitationCodeValue,
  AIO_PARTNER_DISPLAY_ID,
  FIXTURE_INVITATION_CODES,
  invitationPublicPath,
  invitationPublicUrl,
  renderInvitationQrSvg,
  seedAioPartner001,
} from '../shared/site00-invitation-system/index.js';
import { defaultCommissionRules } from '../shared/site00-invitation-system/commissionRules.js';

const AIO_CODE = FIXTURE_INVITATION_CODES.AIO_OFFICE_SHARED;
const VISITOR = 'fixture-visitor-key-001';

describe('Invitation resolution + QR destination', () => {
  beforeEach(() => {
    resetInvitationMemoryState();
  });

  it('resolves AIO shared office code as VALID', () => {
    expect(resolveInvitationCode(AIO_CODE).reason).toBe('VALID');
    expect(aioOfficeInvitationCodeValue()).toBe(AIO_CODE);
  });

  it('uses stable first-party path without PII', () => {
    expect(invitationPublicPath(AIO_CODE)).toBe(`/invite/${AIO_CODE}`);
    expect(invitationPublicUrl('https://site00.com', AIO_CODE)).toBe(`https://site00.com/invite/${AIO_CODE}`);
    expect(AIO_CODE).not.toContain('@');
  });

  it('generates high-contrast SVG QR for canonical URL', async () => {
    const svg = await renderInvitationQrSvg({
      destinationUrl: invitationPublicUrl('https://site00.com', AIO_CODE),
    });
    expect(svg).toContain('<svg');
    expect(svg).toContain('#000000');
  });

  it('returns UNKNOWN / EXPIRED / REVOKED for fixture edge codes', () => {
    expect(resolveInvitationCode(FIXTURE_INVITATION_CODES.UNKNOWN).reason).toBe('UNKNOWN');
    expect(resolveInvitationCode(FIXTURE_INVITATION_CODES.EXPIRED).reason).toBe('EXPIRED');
    expect(resolveInvitationCode(FIXTURE_INVITATION_CODES.REVOKED).reason).toBe('REVOKED');
  });
});

describe('Visit deduplication + traffic', () => {
  beforeEach(() => {
    resetInvitationMemoryState();
  });

  it('records first scan and dedupes repeat visitor in same bucket', () => {
    const first = recordInvitationVisit({ code: AIO_CODE, visitor_key: VISITOR });
    expect(first.visit).not.toBeNull();
    expect(first.visit!.is_repeat_in_bucket).toBe(false);

    const second = recordInvitationVisit({ code: AIO_CODE, visitor_key: VISITOR });
    expect(second.visit!.is_repeat_in_bucket).toBe(true);
    expect(second.visit!.visit_id).not.toBe(first.visit!.visit_id);
  });

  it('classifies bot user agents without blocking resolution', () => {
    const bot = recordInvitationVisit({
      code: AIO_CODE,
      visitor_key: 'bot-key',
      user_agent: 'Slackbot-LinkExpanding 1.0',
    });
    expect(bot.visit!.traffic_class).toBe('BOT');
    expect(bot.resolution).toBe('VALID');
  });
});

describe('Secure activation + Foundation idempotency', () => {
  beforeEach(() => {
    resetInvitationMemoryState();
    resetDigitalFoundationMemoryStore();
  });

  async function activateFoundation(email = 'prospect@example.com') {
    const visit = recordInvitationVisit({ code: AIO_CODE, visitor_key: VISITOR }).visit!;
    const begun = beginSecureActivation({ code: AIO_CODE, visit_id: visit.visit_id, contact_email: email });
    expect(begun.ok).toBe(true);
    if (!begun.ok) throw new Error('begin failed');
    const secret = 'test-verification-secret';
    issueActivationVerificationSecretForTests(begun.activation_id, secret);
    const done = completeVerifiedActivation({
      activation_id: begun.activation_id,
      verification_secret: secret,
    });
    expect(done.ok).toBe(true);
    return { visit, activation_id: begun.activation_id, token: done.foundation_token! };
  }

  it('links one Foundation artifact per activation and reuses on repeat complete', async () => {
    const { activation_id, token } = await activateFoundation();
    const again = completeVerifiedActivation({
      activation_id,
      verification_secret: 'wrong',
    });
    expect(again.ok).toBe(true);
    expect(again.foundation_token).toBe(token);
  });

  it('does not create commission from scan-only events', () => {
    const state = getInvitationMemoryState();
    expect(mayCreateCommissionCandidate(state, 'INVITATION_SCANNED')).toBe(false);
    expect(mayCreateCommissionCandidate(state, 'INVITATION_VIEWED')).toBe(false);
  });

  it('creates PENDING commission candidate with unapproved rates (zero calculated reward)', async () => {
    const { activation_id } = await activateFoundation();
    const state = getInvitationMemoryState();
    const activation = state.activations.get(activation_id)!;
    recordConversionEvent({
      event_type: 'FOUNDATION_PURCHASED',
      partner_id: activation.partner_id,
      campaign_id: activation.campaign_id,
      activation_id,
      foundation_artifact_id: activation.foundation_artifact_id,
      payment_id: 'pay_test_001',
      eligible_amount_minor: 50_000,
      idempotency_key: 'pay:pay_test_001',
    });
    const entries = [...state.commissions.values()];
    expect(entries.length).toBe(1);
    expect(entries[0].calculated_reward_minor).toBe(0);
    expect(entries[0].status).toBe('PENDING');
    expect(defaultCommissionRules().foundation.draft_fixed_reward_minor).toBeNull();
  });

  it('begin activation is idempotent for same visit', async () => {
    const visit = recordInvitationVisit({ code: AIO_CODE, visitor_key: 'idem-visitor' }).visit!;
    const a = beginSecureActivation({ code: AIO_CODE, visit_id: visit.visit_id, contact_email: 'a@example.com' });
    const b = beginSecureActivation({ code: AIO_CODE, visit_id: visit.visit_id, contact_email: 'a@example.com' });
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) expect(a.activation_id).toBe(b.activation_id);
  });
});

describe('Partner reporting + privacy', () => {
  beforeEach(() => {
    resetInvitationMemoryState();
  });

  it('returns AIO-scoped reporting only for partner 001', () => {
    const partner = seedAioPartner001(new Date().toISOString());
    const from = '1970-01-01T00:00:00.000Z';
    const to = new Date().toISOString();
    recordInvitationVisit({ code: AIO_CODE, visitor_key: VISITOR });
    const report = getPartnerReporting(partner.partner_id, from, to);
    expect(report).not.toBeNull();
    expect(report!.window.display_id).toBe(AIO_PARTNER_DISPLAY_ID);
    expect(report!.commissions.payout_live).toBe(false);
  });

  it('returns null for unknown partner (no cross-partner leakage)', () => {
    expect(getPartnerReporting('00000000-0000-4000-8000-000099999999', '1970-01-01T00:00:00.000Z', new Date().toISOString())).toBeNull();
  });
});

describe('Commission reversal', () => {
  beforeEach(() => {
    resetInvitationMemoryState();
    resetDigitalFoundationMemoryStore();
  });

  it('reverses commission entry with auditable adjustment', async () => {
    const visit = recordInvitationVisit({ code: AIO_CODE, visitor_key: 'rev-visitor' }).visit!;
    const begun = beginSecureActivation({ code: AIO_CODE, visit_id: visit.visit_id, contact_email: 'r@example.com' });
    if (!begun.ok) throw new Error('begin');
    issueActivationVerificationSecretForTests(begun.activation_id, 'sec');
    completeVerifiedActivation({ activation_id: begun.activation_id, verification_secret: 'sec' });
    const state = getInvitationMemoryState();
    const activation = state.activations.get(begun.activation_id)!;
    recordConversionEvent({
      event_type: 'FOUNDATION_PURCHASED',
      partner_id: activation.partner_id,
      campaign_id: activation.campaign_id,
      activation_id: begun.activation_id,
      payment_id: 'pay_rev_1',
      eligible_amount_minor: 50_000,
      idempotency_key: 'pay:pay_rev_1',
    });
    const entryId = [...state.commissions.keys()][0];
    const reversed = reverseCommission(entryId, 'refund', 'founder');
    expect(reversed!.status).toBe('REVERSED');
    expect(state.adjustments.length).toBe(1);
  });
});

describe('Entry presentation contract', () => {
  beforeEach(() => {
    resetInvitationMemoryState();
  });

  it('exposes Opus-ready presentation for valid code', () => {
    const p = buildEntryPresentation({ code: AIO_CODE });
    expect(p.invitation_system_version).toBe('1.0.0');
    expect(p.activation.requires_identity_verification).toBe(true);
    expect(p.partner_presented_through).toContain('ALL IN ONE ENTERPRISES');
  });
});
