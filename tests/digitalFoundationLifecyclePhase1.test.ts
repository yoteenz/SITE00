/**
 * Phase 1 — portal continuity, credit handoff, lifecycle routing (sprint test contract A–Q subset).
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import {
  acceptQuote,
  createArtifactForLead,
  createFoundationBuilderHandoff,
  expireFoundationCredit,
  getClientArtifactPayloadByToken,
  markFoundationComplete,
  markQuoteCommerciallyReady,
  verifyFoundationBuilderHandoff,
} from '../api/_lib/digitalFoundation/service.js';
import { simulateStripeCheckoutCompleted } from '../api/_lib/digitalFoundation/payment/webhookHandler.js';
import { completeIntakeWithContactPhone } from './helpers/dfTestContactPhone.js';
import { buildDfMenu, portalViewsForPayload, resolveDfRoute } from '../src/site00/foundation-client/model';
import { assessFoundationCreditEligibility } from '../shared/site00-digital-foundation/builderHandoff.js';

const disclosures = [
  'I HAVE REVIEWED MY DIGITAL FOUNDATION SCOPE.',
  'I UNDERSTAND THAT DOMAIN / EMAIL PROVIDER SUBSCRIPTIONS AND OTHER THIRD-PARTY FEES MAY BE SEPARATE.',
  'I UNDERSTAND THAT THE PROJECTED TURNAROUND BEGINS AFTER REQUIRED INFORMATION, ACCESS AND PAYMENT ARE RECEIVED.',
];

async function paidActivated() {
  const a = createArtifactForLead({ referral_kind: 'DIRECT', business_name: 'Phase1 Co' });
  completeIntakeWithContactPhone(a.artifact_id);
  markQuoteCommerciallyReady(a.artifact_id);
  acceptQuote({ artifact_id: a.artifact_id, disclosures });
  await simulateStripeCheckoutCompleted({
    artifact_id: a.artifact_id,
    quote_id: getClientArtifactPayloadByToken(a.public_token).quote!.quote_id,
  });
  return a;
}

beforeEach(() => resetDigitalFoundationMemoryStore());

describe('portal continuity through completion', () => {
  it('verified complete retains OVERVIEW, RECORDS, and COMPLETE milestone views (J)', async () => {
    const a = await paidActivated();
    markFoundationComplete(a.artifact_id, undefined, { founder_override: true });
    const payload = getClientArtifactPayloadByToken(a.public_token);
    expect(['COMPLETE', 'BUILD_UPSELL']).toContain(payload.surface);
    const route = resolveDfRoute(payload, { checkout: null, activationSeen: true });
    expect(route.kind).toBe('views');
    if (route.kind !== 'views') return;
    expect(route.views).toContain('OVERVIEW');
    expect(route.views).toContain('ROADMAP');
    expect(route.views).toContain('NEEDS_YOU');
    expect(route.views).toContain('RECORDS');
    expect(route.views).toContain('COMPLETE');
    const menu = buildDfMenu(route.views, 'OVERVIEW');
    expect(menu.destinations.find((d) => d.id === 'records')?.available).toBe(true);
    expect(menu.destinations.find((d) => d.id === 'location')?.view).toBe('COMPLETE');
  });

  it('incomplete project cannot create builder handoff (K)', async () => {
    const a = await paidActivated();
    expect(() => createFoundationBuilderHandoff(a.artifact_id)).toThrow(/HANDOFF_COMPLETION_REQUIRED/);
  });

  it('eligible complete client receives verified handoff without URL-trusted credit (L,N)', async () => {
    const a = await paidActivated();
    markFoundationComplete(a.artifact_id, undefined, { founder_override: true });
    const handoff = createFoundationBuilderHandoff(a.artifact_id, { build_path_preference: 'SIMPLE_BUILD' });
    expect(handoff.credit_verified).toBe(true);
    expect(handoff.deep_link_path).toMatch(/^\/bldr\/studio\/blueprint\?dfHandoff=/);
    expect(handoff.deep_link_path).not.toMatch(/amount|token|email/i);
    const verified = verifyFoundationBuilderHandoff(handoff.handoff.handoff_id);
    expect(verified.credit.amount_minor).toBeGreaterThan(0);
  });

  it('expired credit blocks handoff (M)', async () => {
    const a = await paidActivated();
    markFoundationComplete(a.artifact_id, undefined, { founder_override: true });
    const payload = getClientArtifactPayloadByToken(a.public_token);
    expireFoundationCredit(payload.credit!.credit_id);
    expect(() => createFoundationBuilderHandoff(a.artifact_id)).toThrow(/HANDOFF_CREDIT_NOT_AVAILABLE/);
    const eligibility = assessFoundationCreditEligibility({
      completion_state: 'COMPLETE',
      credit: { ...payload.credit!, status: 'EXPIRED' },
    });
    expect(eligibility.ok).toBe(false);
  });

  it('handoff idempotency returns same active token (N)', async () => {
    const a = await paidActivated();
    markFoundationComplete(a.artifact_id, undefined, { founder_override: true });
    const first = createFoundationBuilderHandoff(a.artifact_id);
    const second = createFoundationBuilderHandoff(a.artifact_id);
    expect(second.handoff.handoff_id).toBe(first.handoff.handoff_id);
  });
});

describe('pre-activation queue boundary', () => {
  it('intake submitted stays on P03 queue, not portal (B)', () => {
    const a = createArtifactForLead({});
    completeIntakeWithContactPhone(a.artifact_id);
    const payload = getClientArtifactPayloadByToken(a.public_token);
    const route = resolveDfRoute(payload, { checkout: null, activationSeen: true });
    if (route.kind === 'views') {
      expect(route.views).toEqual(['P03']);
      expect(route.views).not.toContain('OVERVIEW');
    }
  });

  it('paid portal includes v2 tabs before completion (D,E)', async () => {
    const a = await paidActivated();
    const payload = getClientArtifactPayloadByToken(a.public_token);
    expect(portalViewsForPayload(payload)).toContain('OVERVIEW');
    expect(portalViewsForPayload(payload)).not.toContain('COMPLETE');
  });
});
