/**
 * Digital Foundation client (Board 01 + 02) presentation model, driven by payloads from Composer's real service.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import {
  acceptQuote,
  createArtifactForLead,
  createCheckoutSession,
  createClientAction,
  getClientArtifactPayloadByToken,
  markQuoteCommerciallyReady,
  recordRefund,
  updateIntake,
  updateQuoteSelections,
} from '../api/_lib/digitalFoundation/service.js';
import { simulateStripeCheckoutCompleted } from '../api/_lib/digitalFoundation/payment/webhookHandler.js';
import { defaultDigitalFoundationCommercialConfig } from '../shared/site00-digital-foundation/commercialConfig.js';
import { listCatalogForClient } from '../shared/site00-digital-foundation/quoteEngine.js';
import {
  buildAddonRows,
  DF_DISCLOSURES,
  deriveActivationState,
  deriveReviewState,
  domainPathFromNeeds,
  draftFromPayload,
  featuredRows,
  intakeFromDraft,
  needsFromDraft,
  planQuoteSync,
  quoteFigures,
  quoteNeedsFounderReview,
  resolveDfRoute,
  selectionsFromQuote,
  validateForRecommendation,
} from '../src/site00/foundation-client/model';

const config = defaultDigitalFoundationCommercialConfig();
const catalog = listCatalogForClient(config);

function link(lead: { business_name?: string; contact_name?: string; contact_email?: string } = {}) {
  const a = createArtifactForLead({ referral_kind: 'AIO', ...lead });
  return { id: a.artifact_id, token: a.public_token, payload: () => getClientArtifactPayloadByToken(a.public_token) };
}

function quoted(needs: Parameters<typeof updateIntake>[1]['needs'] = ['NEED_DOMAIN'], team_size = 1) {
  const l = link({ business_name: 'Anthony Transport LLC', contact_name: 'Anthony', contact_email: 'a@example.com' });
  updateIntake(l.id, { business_name: 'Anthony Transport LLC', contact_name: 'Anthony', current_email: 'a@example.com', team_size, needs }, true);
  return l;
}

const ctx = { checkout: null, activationSeen: false } as const;

beforeEach(() => resetDigitalFoundationMemoryStore());

describe('one link, server-resolved parent', () => {
  it('lands a fresh link on P01 and an in-progress intake on P02', () => {
    const l = link();
    expect(resolveDfRoute(l.payload(), ctx)).toEqual({ kind: 'views', views: ['P01', 'P02', 'P03'], defaultView: 'P01' });
    updateIntake(l.id, {});
    expect(resolveDfRoute(l.payload(), ctx)).toMatchObject({ defaultView: 'P02' });
  });

  it('lands a quote on P04 and an accepted quote on P05; P02/P03 are no longer reachable', () => {
    const l = quoted();
    expect(resolveDfRoute(l.payload(), ctx)).toEqual({ kind: 'views', views: ['P04', 'P05'], defaultView: 'P04' });
    acceptQuote({ artifact_id: l.id, disclosures: [...DF_DISCLOSURES] });
    expect(resolveDfRoute(l.payload(), ctx)).toEqual({ kind: 'views', views: ['P04', 'P05'], defaultView: 'P05' });
    expect(resolveDfRoute(l.payload(), { checkout: 'return', activationSeen: false })).toMatchObject({ defaultView: 'P06' });
  });

  it('shows P06 once after payment, then the overview; refund pauses on P06', async () => {
    const l = quoted();
    acceptQuote({ artifact_id: l.id, disclosures: [...DF_DISCLOSURES] });
    await simulateStripeCheckoutCompleted({ artifact_id: l.id, quote_id: l.payload().quote!.quote_id });
    expect(resolveDfRoute(l.payload(), ctx)).toEqual({ kind: 'views', views: ['P06', 'OVERVIEW'], defaultView: 'P06' });
    expect(resolveDfRoute(l.payload(), { checkout: null, activationSeen: true })).toMatchObject({ defaultView: 'OVERVIEW' });
    recordRefund(l.id, {});
    expect(resolveDfRoute(l.payload(), ctx)).toEqual({ kind: 'views', views: ['P06'], defaultView: 'P06' });
    expect(deriveActivationState(l.payload(), null)).toBe('PROJECT_PAUSED');
  });
});

describe('P02 / P03 intake', () => {
  it('prefills from the lead and never sends both NEED_DOMAIN and OWN_DOMAIN', () => {
    const l = link({ business_name: 'Anthony Transport LLC', contact_name: 'Anthony', contact_email: 'a@example.com' });
    const draft = draftFromPayload(l.payload());
    expect(draft).toMatchObject({ business_name: 'Anthony Transport LLC', contact_name: 'Anthony', current_email: 'a@example.com', domainPath: null });
    const own = { ...draft, domainPath: 'OWN' as const, existing_domain: 'anthonytransport.co', team_size: 3, needs: ['NEED_MIGRATION' as const] };
    const needs = needsFromDraft(own);
    expect(needs).toEqual(expect.arrayContaining(['OWN_DOMAIN', 'NEED_MULTI_MAILBOX', 'NEED_MIGRATION']));
    expect(needs).not.toContain('NEED_DOMAIN');
    expect(intakeFromDraft(own)).toMatchObject({ existing_domain: 'anthonytransport.co', team_size: 3 });
    expect(domainPathFromNeeds(needs)).toBe('OWN');
  });

  it('requires business info and exactly one domain path, with a domain for OWN', () => {
    const draft = draftFromPayload(link().payload());
    expect(Object.keys(validateForRecommendation(draft))).toEqual(['business_name', 'contact_name', 'current_email', 'domainPath']);
    const filled = { ...draft, business_name: 'B', contact_name: 'C', current_email: 'c@example.com', domainPath: 'OWN' as const };
    expect(validateForRecommendation(filled)).toEqual({ existing_domain: 'ENTER THE DOMAIN YOU OWN' });
    expect(validateForRecommendation({ ...filled, existing_domain: 'example.com' })).toEqual({});
  });

  it('round-trips a saved intake back into the same draft (resume)', () => {
    const l = link();
    const draft = { ...draftFromPayload(l.payload()), business_name: 'B', contact_name: 'C', current_email: 'c@example.com', domainPath: 'NEW' as const, needs: ['NEED_DEVICE' as const] };
    updateIntake(l.id, { ...intakeFromDraft(draft), needs: needsFromDraft(draft) });
    expect(draftFromPayload(l.payload())).toMatchObject({ domainPath: 'NEW', needs: ['NEED_DEVICE'], business_name: 'B' });
  });
});

describe('P04 add-ons bind to the server quote', () => {
  it('shows server totals and the add-on delta; never hardcodes the mockup values', () => {
    const l = quoted(['NEED_DOMAIN', 'NEED_MULTI_MAILBOX', 'NEED_MIGRATION'], 2);
    const q = l.payload().quote!;
    const f = quoteFigures(q, config);
    expect(f.total).toBe(`$${(q.subtotal_minor / 100).toLocaleString('en-US')}`);
    expect(f.caption).toBe(`$500 + $${q.addon_total_minor / 100} ADD-ONS`);
    expect(f.turnaround).toBe(`${q.projected_min_days}–${q.projected_max_days}`);
    expect(f.reviewSuffix).toBe('CONFIRMED AFTER REVIEW');
    expect(quoteNeedsFounderReview(q)).toBe(true);
  });

  it('labels custom work as quoted after review and locks dependent add-ons', () => {
    const l = quoted();
    const rows = buildAddonRows({ catalog, config, quote: l.payload().quote, recommended: [], desired: { CUSTOM_FOUNDATION_WORK: 1 } });
    expect(rows.find((r) => r.addon_id === 'CUSTOM_FOUNDATION_WORK')?.unitPriceLabel).toBe('QUOTED AFTER REVIEW');
    expect(rows.find((r) => r.addon_id === 'STAFF_SIGNATURE_SYSTEM')?.lockedReason).toBe('REQUIRES MULTI-USER WORKSPACE');
    expect(rows.some((r) => r.addon_id === 'EXPEDITED_FOUNDATION')).toBe(false);
    const both = buildAddonRows({ catalog, config, quote: null, recommended: [], desired: { MULTI_USER_WORKSPACE_SETUP: 1, STAFF_SIGNATURE_SYSTEM: 1 } });
    expect(both.find((r) => r.addon_id === 'MULTI_USER_WORKSPACE_SETUP')?.lockedReason).toBe('REQUIRED BY STAFF SIGNATURE SYSTEM');
    expect(featuredRows(rows).slice(0, 4).map((r) => r.addon_id)).toEqual([
      'ADDITIONAL_MAILBOX',
      'DOMAIN_TRANSFER',
      'LEGACY_EMAIL_MIGRATION',
      'ADDITIONAL_DEVICE_SETUP',
    ]);
  });

  it('shows a line total only once the server line matches the on-screen quantity', () => {
    const l = quoted();
    updateQuoteSelections(l.id, [{ addon_id: 'ADDITIONAL_MAILBOX', quantity: 2 }]);
    const quote = l.payload().quote;
    const row = (qty: number) =>
      buildAddonRows({ catalog, config, quote, recommended: [], desired: { ADDITIONAL_MAILBOX: qty } }).find((r) => r.addon_id === 'ADDITIONAL_MAILBOX')!;
    expect(row(2).lineTotalLabel).toBe('+$150');
    expect(row(3).lineTotalLabel).toBeNull();
  });

  it('plans one request per settled edit: a lone removal uses remove-addon', () => {
    expect(planQuoteSync({ ADDITIONAL_MAILBOX: 2 }, { ADDITIONAL_MAILBOX: 2 })).toEqual({ kind: 'none' });
    expect(planQuoteSync({ ADDITIONAL_MAILBOX: 2, DOMAIN_TRANSFER: 1 }, { ADDITIONAL_MAILBOX: 2 })).toEqual({ kind: 'remove', addon_id: 'DOMAIN_TRANSFER' });
    expect(planQuoteSync({ ADDITIONAL_MAILBOX: 2 }, { ADDITIONAL_MAILBOX: 3 })).toEqual({
      kind: 'update',
      selections: [{ addon_id: 'ADDITIONAL_MAILBOX', quantity: 3 }],
    });
    expect(selectionsFromQuote(null)).toEqual({});
  });
});

describe('P05 review + checkout states', () => {
  const state = (l: ReturnType<typeof quoted>, extra: Partial<Parameters<typeof deriveReviewState>[0]> = {}) =>
    deriveReviewState({ payload: l.payload(), acknowledged: 0, checkout: null, creating: false, errorCode: null, ...extra });

  it('walks READY TO REVIEW → AWAITING ACCEPTANCE → AWAITING FOUNDER PRICING → READY FOR CHECKOUT → PAYMENT PENDING', async () => {
    const l = quoted(['NEED_DOMAIN', 'NEED_MIGRATION']);
    expect(state(l)).toBe('READY_TO_REVIEW');
    expect(state(l, { acknowledged: 2 })).toBe('AWAITING_ACCEPTANCE');
    acceptQuote({ artifact_id: l.id, disclosures: [...DF_DISCLOSURES] });
    expect(state(l)).toBe('AWAITING_FOUNDER_PRICING');
    await expect(createCheckoutSession({ artifact_id: l.id, success_url: 'x', cancel_url: 'y' })).rejects.toThrow('MANUAL_REVIEW_PENDING');
    markQuoteCommerciallyReady(l.id);
    expect(state(l)).toBe('READY_FOR_CHECKOUT');
    expect(state(l, { creating: true })).toBe('CREATING_CHECKOUT');
    expect(state(l, { errorCode: 'PROVIDER_ERROR' })).toBe('CHECKOUT_ERROR');
    await createCheckoutSession({ artifact_id: l.id, success_url: 'x', cancel_url: 'y' });
    expect(l.payload().artifact.payment_state).toBe('CHECKOUT_PENDING');
    expect(state(l)).toBe('PAYMENT_PENDING');
    expect(state(l, { checkout: 'cancel' })).toBe('PAYMENT_CANCELLED');
  });
});

describe('P06 activation reads server payment data only', () => {
  it('verifies → pending without a webhook; activated states after it', async () => {
    const l = quoted();
    acceptQuote({ artifact_id: l.id, disclosures: [...DF_DISCLOSURES] });
    await createCheckoutSession({ artifact_id: l.id, success_url: 'x', cancel_url: 'y' });
    expect(deriveActivationState(l.payload(), 'polling')).toBe('VERIFYING_PAYMENT');
    expect(deriveActivationState(l.payload(), 'exhausted')).toBe('PAYMENT_CONFIRMATION_PENDING');
    expect(deriveActivationState(l.payload(), 'error')).toBe('ACTIVATION_ERROR');
    await simulateStripeCheckoutCompleted({ artifact_id: l.id, quote_id: l.payload().quote!.quote_id });
    const paid = l.payload();
    const s = deriveActivationState(paid, null);
    expect(['AWAITING_REQUIRED_INFORMATION', 'PRODUCTION_READY', 'PROJECT_ACTIVATED']).toContain(s);
    createClientAction({ artifact_id: l.id, action_type: 'AUTHORIZE_PROVIDER', title: 'Authorize', detail: 'd' });
    expect(deriveActivationState(l.payload(), null)).toBe('AWAITING_CLIENT_AUTHORIZATION');
  });

  it('never exposes events or the internal referral label to the client view model', () => {
    const p = quoted().payload() as Record<string, unknown>;
    expect(p.events).toBeUndefined();
    expect(p.referral_source).toBeUndefined();
    expect(JSON.stringify(p)).not.toContain('Sister');
  });
});
