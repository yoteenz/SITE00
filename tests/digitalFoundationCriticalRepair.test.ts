import { describe, expect, it, beforeEach, vi } from 'vitest';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import {
  acceptQuote,
  applyManualQuoteAdjustment,
  captureBuildInterest,
  completeClientAction,
  completeIntake,
  createArtifactForLead,
  createCheckoutSession,
  createClientAction,
  getArtifactPayload,
  getClientArtifactPayloadByToken,
  markQuoteCommerciallyReady,
  markFoundationComplete,
  openArtifactByToken,
  recordRefund,
  updateQuoteSelections,
} from '../api/_lib/digitalFoundation/service.js';
import { recommendFromIntake } from '../shared/site00-digital-foundation/recommendationEngine.js';
import { defaultDigitalFoundationCommercialConfig } from '../shared/site00-digital-foundation/commercialConfig.js';
import { resolveArtifactSurface } from '../shared/site00-digital-foundation/surface.js';
import { assessQuotePayability } from '../shared/site00-digital-foundation/quoteReadiness.js';
import { computeReadinessState } from '../shared/site00-digital-foundation/readinessClock.js';
import { getFoundationPaymentAdapter } from '../api/_lib/digitalFoundation/payment/stripeHostedCheckout.js';
import { simulateStripeCheckoutCompleted } from '../api/_lib/digitalFoundation/payment/webhookHandler.js';
import { generateRunbookForArtifact } from '../api/_lib/digitalFoundation/operationsEngine.js';
import * as mem from '../api/_lib/digitalFoundation/memoryStore.js';

const disclosures = [
  'I HAVE REVIEWED MY DIGITAL FOUNDATION SCOPE.',
  'I UNDERSTAND THAT DOMAIN / EMAIL PROVIDER SUBSCRIPTIONS AND OTHER THIRD-PARTY FEES MAY BE SEPARATE.',
  'I UNDERSTAND THAT THE PROJECTED TURNAROUND BEGINS AFTER REQUIRED INFORMATION, ACCESS AND PAYMENT ARE RECEIVED.',
];

describe('Digital Foundation critical repair — approvals', () => {
  beforeEach(() => resetDigitalFoundationMemoryStore());

  it('REQUEST_CHANGE does not complete approval-gated task', () => {
    const a = createArtifactForLead({});
    completeIntake(a.artifact_id);
    const req = createClientAction({
      artifact_id: a.artifact_id,
      action_type: 'APPROVE_SIGNATURE',
      title: 'Approve signature',
      detail: 'Review signature draft',
    });
    mem.getDfMemoryState().tasks.set(a.artifact_id, [
      {
        task_id: 't1',
        artifact_id: a.artifact_id,
        runbook_id: 'rb1',
        task_type: 'SIGNATURE_APPROVED',
        title: 'Signature',
        status: 'WAITING_CLIENT',
        client_action_request_id: req.request_id,
        created_at: new Date().toISOString(),
        completed_at: null,
        blocked_reason: null,
        verification_status: 'PENDING',
      } as never,
    ]);

    completeClientAction(a.artifact_id, req.request_id, { decision: 'REQUEST_CHANGE', notes: 'Use serif' });
    const tasks = mem.getDfMemoryState().tasks.get(a.artifact_id)!;
    expect(tasks[0].status).toBe('WAITING_CLIENT');
    const approvals = mem.getDfMemoryState().approvals.get(a.artifact_id)!;
    expect(approvals.some((ap) => ap.status === 'REVISION_REQUESTED')).toBe(true);
  });

  it('APPROVE completes linked task', () => {
    const a = createArtifactForLead({});
    const req = createClientAction({
      artifact_id: a.artifact_id,
      action_type: 'APPROVE_SIGNATURE',
      title: 'Approve signature',
      detail: 'Review',
    });
    mem.getDfMemoryState().tasks.set(a.artifact_id, [
      {
        task_id: 't1',
        artifact_id: a.artifact_id,
        runbook_id: 'rb1',
        task_type: 'SIGNATURE_APPROVED',
        title: 'Signature',
        status: 'WAITING_CLIENT',
        client_action_request_id: req.request_id,
        created_at: new Date().toISOString(),
        completed_at: null,
        blocked_reason: null,
        verification_status: 'PENDING',
      } as never,
    ]);
    completeClientAction(a.artifact_id, req.request_id, { decision: 'APPROVE', target_version: 1 });
    expect(mem.getDfMemoryState().tasks.get(a.artifact_id)![0].status).toBe('COMPLETE');
  });
});

describe('Digital Foundation critical repair — client redaction', () => {
  beforeEach(() => resetDigitalFoundationMemoryStore());

  it('client payload excludes internal events and referral label', () => {
    const a = createArtifactForLead({ referral_kind: 'AIO' });
    openArtifactByToken(a.public_token);
    mem.memAppendEvent({
      event_id: 'e1',
      artifact_id: a.artifact_id,
      event_type: 'ARTIFACT_CREATED',
      actor: 'FOUNDER',
      payload: { internal_escalation: true },
      created_at: new Date().toISOString(),
    });
    const client = getClientArtifactPayloadByToken(a.public_token);
    expect('events' in client).toBe(false);
    expect('referral_source' in client).toBe(false);
    expect(client.referral_channel?.display_label).not.toBe('AIO');
    expect(client.referral_channel?.kind).toBe('AIO');
  });
});

describe('Digital Foundation critical repair — lifecycle routing', () => {
  beforeEach(() => resetDigitalFoundationMemoryStore());

  it('refunded projects use PAYMENT_RECOVERY surface', () => {
    const a = createArtifactForLead({});
    completeIntake(a.artifact_id);
    acceptQuote({ artifact_id: a.artifact_id, disclosures });
    recordRefund(a.artifact_id, { reason: 'test' });
    const payload = getArtifactPayload(a.artifact_id);
    expect(payload.surface).toBe('PAYMENT_RECOVERY');
  });

  it('completed projects use COMPLETE surface', async () => {
    const a = createArtifactForLead({});
    completeIntake(a.artifact_id);
    acceptQuote({ artifact_id: a.artifact_id, disclosures });
    markQuoteCommerciallyReady(a.artifact_id);
    await createCheckoutSession({
      artifact_id: a.artifact_id,
      success_url: 'http://localhost/ok',
      cancel_url: 'http://localhost/cancel',
    });
    const q = getArtifactPayload(a.artifact_id).quote!;
    await simulateStripeCheckoutCompleted({ artifact_id: a.artifact_id, quote_id: q.quote_id });
    captureBuildInterest(a.artifact_id, 'NONE');
    markFoundationComplete(a.artifact_id, undefined, { founder_override: true });
    const done = getArtifactPayload(a.artifact_id).artifact;
    expect(done.completion_state).toBe('COMPLETE');
    expect(resolveArtifactSurface(done)).toBe('COMPLETE');
  });
});

describe('Digital Foundation critical repair — quote gating', () => {
  beforeEach(() => resetDigitalFoundationMemoryStore());

  it('blocks checkout when manual review pending', async () => {
    const a = createArtifactForLead({});
    completeIntake(a.artifact_id);
    updateQuoteSelections(a.artifact_id, [{ addon_id: 'DOMAIN_RECOVERY', quantity: 1 }]);
    acceptQuote({ artifact_id: a.artifact_id, disclosures });
    await expect(
      createCheckoutSession({
        artifact_id: a.artifact_id,
        success_url: 'http://localhost/ok',
        cancel_url: 'http://localhost/cancel',
      }),
    ).rejects.toThrow(/MANUAL_REVIEW_PENDING/);
    markQuoteCommerciallyReady(a.artifact_id);
    const checkout = await createCheckoutSession({
      artifact_id: a.artifact_id,
      success_url: 'http://localhost/ok',
      cancel_url: 'http://localhost/cancel',
    });
    expect(checkout.checkout_url).toBeTruthy();
  });

  it('rejects outdated quote payment via webhook confirmation', async () => {
    const a = createArtifactForLead({});
    completeIntake(a.artifact_id);
    const oldQuoteId = getArtifactPayload(a.artifact_id).quote!.quote_id;
    updateQuoteSelections(a.artifact_id, [{ addon_id: 'ADDITIONAL_MAILBOX', quantity: 1 }]);
    acceptQuote({ artifact_id: a.artifact_id, disclosures });
    await expect(
      simulateStripeCheckoutCompleted({ artifact_id: a.artifact_id, quote_id: oldQuoteId }),
    ).rejects.toThrow(/QUOTE_VERSION_MISMATCH/);
  });
});

describe('Digital Foundation critical repair — included scope', () => {
  it('does not charge Advanced DNS for standard email security alone', () => {
    const config = defaultDigitalFoundationCommercialConfig();
    const { selections } = recommendFromIntake({ needs: ['NEED_DNS_SECURITY'] }, config);
    expect(selections.some((s) => s.addon_id === 'ADVANCED_DNS_CLEANUP')).toBe(false);
  });

  it('includes first device without add-on line', () => {
    const config = defaultDigitalFoundationCommercialConfig();
    const { selections } = recommendFromIntake({ needs: ['NEED_DEVICE'], team_size: 1 }, config);
    expect(selections.some((s) => s.addon_id === 'ADDITIONAL_DEVICE_SETUP')).toBe(false);
  });

  it('charges additional devices beyond included allowance', () => {
    const config = defaultDigitalFoundationCommercialConfig();
    const { selections } = recommendFromIntake({ needs: ['NEED_DEVICE'], team_size: 3 }, config);
    const device = selections.find((s) => s.addon_id === 'ADDITIONAL_DEVICE_SETUP');
    expect(device?.quantity).toBe(2);
  });
});

describe('Digital Foundation critical repair — readiness clock', () => {
  beforeEach(() => resetDigitalFoundationMemoryStore());

  it('does not mark production started before payment', () => {
    const a = createArtifactForLead({});
    completeIntake(a.artifact_id);
    const readiness = computeReadinessState({
      artifact: getArtifactPayload(a.artifact_id).artifact,
      quote: getArtifactPayload(a.artifact_id).quote,
      stages: [],
    });
    expect(readiness.production_started_at).toBeNull();
    expect(readiness.readiness_satisfied).toBe(false);
  });
});

describe('Digital Foundation critical repair — payment production fail-closed', () => {
  it('disables simulated checkout in production without Stripe key', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('VITEST', '');
    vi.stubEnv('SITE00_DIGITAL_FOUNDATION_STRIPE_SIM', '');
    vi.stubEnv('STRIPE_SECRET_KEY', '');
    const adapter = getFoundationPaymentAdapter();
    expect(adapter.configured).toBe(false);
    vi.unstubAllEnvs();
  });
});

describe('Digital Foundation critical repair — runbook idempotency', () => {
  beforeEach(() => resetDigitalFoundationMemoryStore());

  it('does not duplicate runbook for same scope hash', async () => {
    const a = createArtifactForLead({});
    completeIntake(a.artifact_id);
    acceptQuote({ artifact_id: a.artifact_id, disclosures });
    markQuoteCommerciallyReady(a.artifact_id);
    await simulateStripeCheckoutCompleted({
      artifact_id: a.artifact_id,
      quote_id: getArtifactPayload(a.artifact_id).quote!.quote_id,
    });
    const first = generateRunbookForArtifact(a.artifact_id);
    const second = generateRunbookForArtifact(a.artifact_id);
    expect(second.runbook.runbook_id).toBe(first.runbook.runbook_id);
  });
});

describe('Digital Foundation critical repair — completion gate', () => {
  beforeEach(() => resetDigitalFoundationMemoryStore());

  it('denies completion without payment', () => {
    const a = createArtifactForLead({});
    expect(() => markFoundationComplete(a.artifact_id)).toThrow(/PAYMENT_REQUIRED/);
  });
});

describe('Digital Foundation critical repair — quote payability helper', () => {
  beforeEach(() => resetDigitalFoundationMemoryStore());

  it('flags expired quotes', () => {
    const a = createArtifactForLead({});
    completeIntake(a.artifact_id);
    acceptQuote({ artifact_id: a.artifact_id, disclosures });
    const q = getArtifactPayload(a.artifact_id).quote!;
    q.expires_at = new Date(Date.now() - 86400000).toISOString();
    mem.memSaveQuote(q);
    const result = assessQuotePayability({
      artifact: getArtifactPayload(a.artifact_id).artifact,
      quote: q,
      acceptance: mem.getDfMemoryState().acceptances.get(a.artifact_id)!,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('QUOTE_EXPIRED');
  });
});
