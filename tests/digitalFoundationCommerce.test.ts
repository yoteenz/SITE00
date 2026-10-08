import { describe, expect, it, beforeEach } from 'vitest';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import {
  acceptQuote,
  applyFoundationCredit,
  completeIntake,
  createArtifactForLead,
  createCheckoutSession,
  expireFoundationCredit,
  getArtifactPayload,
  markFoundationComplete,
  openArtifactByToken,
  reserveFoundationCredit,
  updateQuoteSelections,
} from '../api/_lib/digitalFoundation/service.js';
import { simulateStripeCheckoutCompleted } from '../api/_lib/digitalFoundation/payment/webhookHandler.js';
import { processDigitalFoundationStripeEvent } from '../api/_lib/digitalFoundation/payment/webhookHandler.js';
import { calculateQuoteTotals, buildQuoteLines } from '../shared/site00-digital-foundation/quoteEngine.js';
import { defaultDigitalFoundationCommercialConfig } from '../shared/site00-digital-foundation/commercialConfig.js';
import { projectTimeline } from '../shared/site00-digital-foundation/timelineEngine.js';
import { materializeFixtureScenario } from '../api/_lib/digitalFoundation/service.js';
import { findReferralByKind, seedReferralSources } from '../shared/site00-digital-foundation/referralSources.js';

describe('Digital Foundation quote + timeline', () => {
  const config = defaultDigitalFoundationCommercialConfig();

  it('uses integer minor units for base + addons', () => {
    const lines = buildQuoteLines([{ addon_id: 'ADDITIONAL_MAILBOX', quantity: 3 }], config);
    const totals = calculateQuoteTotals(lines, config);
    expect(totals.subtotal_minor).toBe(50_000 + 3 * 7_500);
  });

  it('extends timeline for migration', () => {
    const lines = buildQuoteLines([{ addon_id: 'LEGACY_EMAIL_MIGRATION', quantity: 1 }], config);
    const t = projectTimeline(lines, config);
    expect(t.projected_max_days).toBeGreaterThan(config.base_max_business_days);
  });
});

describe('Digital Foundation artifact lifecycle', () => {
  beforeEach(() => {
    resetDigitalFoundationMemoryStore();
  });

  it('resolves unique opaque token without PII', () => {
    const a = createArtifactForLead({ contact_email: 'client@example.com' });
    expect(a.public_token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(a.public_token).not.toContain('client');
    expect(a.public_token).not.toContain('@');
  });

  it('persists referral attribution on AIO fixture', async () => {
    const { artifact, token } = await materializeFixtureScenario('I_AIO_REFERRAL');
    const payload = getArtifactPayload(artifact.artifact_id);
    expect(payload.referral_source?.kind).toBe('AIO');
    openArtifactByToken(token);
    expect(getArtifactPayload(artifact.artifact_id).lead.referral_funnel_stage).toBe('ACCEPTED');
  });

  it('requires explicit disclosures before checkout', async () => {
    const a = createArtifactForLead({});
    completeIntake(a.artifact_id);
    expect(() => acceptQuote({ artifact_id: a.artifact_id, disclosures: ['partial'] })).toThrow(
      /DISCLOSURE_REQUIRED/,
    );
  });

  it('confirms payment only via webhook simulation', async () => {
    const a = createArtifactForLead({});
    completeIntake(a.artifact_id);
    acceptQuote({
      artifact_id: a.artifact_id,
      disclosures: [
        'I HAVE REVIEWED MY DIGITAL FOUNDATION SCOPE.',
        'I UNDERSTAND THAT DOMAIN / EMAIL PROVIDER SUBSCRIPTIONS AND OTHER THIRD-PARTY FEES MAY BE SEPARATE.',
        'I UNDERSTAND THAT THE PROJECTED TURNAROUND BEGINS AFTER REQUIRED INFORMATION, ACCESS AND PAYMENT ARE RECEIVED.',
      ],
    });
    const checkout = await createCheckoutSession({
      artifact_id: a.artifact_id,
      success_url: 'http://localhost/foundation?ok=1',
      cancel_url: 'http://localhost/foundation?cancel=1',
    });
    expect(checkout.checkout_url).toBeTruthy();
    let payload = getArtifactPayload(a.artifact_id);
    expect(payload.artifact.payment_state).not.toBe('PAID');

    const q = payload.quote!;
    await simulateStripeCheckoutCompleted({ artifact_id: a.artifact_id, quote_id: q.quote_id, event_id: 'evt_1' });
    payload = getArtifactPayload(a.artifact_id);
    expect(payload.artifact.payment_state).toBe('PAID');
    expect(payload.surface).toBe('PORTAL');
    expect(payload.stages.length).toBeGreaterThan(0);

    await simulateStripeCheckoutCompleted({ artifact_id: a.artifact_id, quote_id: q.quote_id, event_id: 'evt_1' });
    expect(getArtifactPayload(a.artifact_id).artifact.payment_state).toBe('PAID');
  });

  it('webhook idempotency via stripe event ids', async () => {
    const { artifact } = await materializeFixtureScenario('J_PAYMENT_SUCCESS');
    const q = getArtifactPayload(artifact.artifact_id).quote!;
    const r1 = await processDigitalFoundationStripeEvent({
      id: 'evt_dup',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test',
          payment_status: 'paid',
          metadata: { artifact_id: artifact.artifact_id, quote_id: q.quote_id },
        },
      },
    });
    const r2 = await processDigitalFoundationStripeEvent({
      id: 'evt_dup',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test',
          payment_status: 'paid',
          metadata: { artifact_id: artifact.artifact_id, quote_id: q.quote_id },
        },
      },
    });
    expect(r1.duplicate).toBeFalsy();
    expect(r2.duplicate).toBe(true);
  });

  it('quote versioning on client edit', () => {
    const a = createArtifactForLead({});
    completeIntake(a.artifact_id);
    const v1 = getArtifactPayload(a.artifact_id).quote!.quote_version;
    updateQuoteSelections(a.artifact_id, [{ addon_id: 'ADDITIONAL_MAILBOX', quantity: 2 }]);
    const v2 = getArtifactPayload(a.artifact_id).quote!.quote_version;
    expect(v2).toBe(v1 + 1);
  });

  it('foundation credit single-use and expiry', async () => {
    const { artifact } = await materializeFixtureScenario('M_COMPLETE_CREDIT');
    const payload = getArtifactPayload(artifact.artifact_id);
    const creditId = payload.credit!.credit_id;
    reserveFoundationCredit(creditId);
    applyFoundationCredit(creditId, 'project-123');
    expect(() => applyFoundationCredit(creditId, 'project-456')).toThrow(/ALREADY_APPLIED/);

    resetDigitalFoundationMemoryStore();
    const { artifact: artifact2 } = await materializeFixtureScenario('M_COMPLETE_CREDIT');
    const creditId2 = getArtifactPayload(artifact2.artifact_id).credit!.credit_id;
    expireFoundationCredit(creditId2);
    expect(() => applyFoundationCredit(creditId2, 'p')).toThrow();
  });

  it('base fixture A pricing', async () => {
    const { artifact } = await materializeFixtureScenario('A_BASE');
    const q = getArtifactPayload(artifact.artifact_id).quote!;
    expect(q.subtotal_minor).toBe(50_000);
    expect(q.projected_min_days).toBe(2);
    expect(q.projected_max_days).toBe(3);
  });

  it('referral seed includes configurable kinds not individuals', () => {
    const sources = seedReferralSources();
    expect(findReferralByKind(sources, 'AIO')?.label).toBe('AIO');
    expect(sources.some((s) => s.label.includes('Anthony'))).toBe(false);
  });
});
