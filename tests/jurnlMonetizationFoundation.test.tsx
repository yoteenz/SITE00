/**
 * P0.JURNL.MONETIZATION-FOUNDATION1 — plan registry, capability registry, entitlement resolution, default free state,
 * unknown-plan fallback, add-on grants, business separation, family contract monetization metadata, projects without
 * monetization, server authorization boundary, no F01 paywall regression, no price hard-coding, trust rules.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import {
  MONETIZATION_EVENT_NAMES,
  REVENUE_SOURCES,
  authorizeCapability,
  buildMonetizationEvent,
  checkUsage,
  clientGate,
  createUnconfiguredBillingProvider,
  assertVerdictInputIndependent,
  hasCapability,
  lowestPlanGranting,
  merchantOptionsAllowed,
  orderPlacements,
  planCapabilities,
  resolveEntitlements,
  validatePlacement,
  ENTITLEMENT_FAILURES,
  type MonetizedPlacement,
  type ResolvedEntitlements,
  type Subscription,
} from '../shared/site00-monetization';
import { evaluateFamilyCompleteness, evaluateFamilyGate } from '../shared/site00-product-families/familyGate';
import { familyMonetization, type FamilyProductionContract } from '../shared/site00-product-families/familyProductionContract';
import { JURNL_F01_CONTRACT } from '../src/projects/jurnl/data/f01/contract';
import { JURNL_F01_COVERAGE } from '../src/projects/jurnl/data/f01/coverage';
import { JURNL_CAPABILITIES } from '../src/projects/jurnl/data/monetization/capabilities';
import { JURNL_MONETIZATION_CONTRACT as C } from '../src/projects/jurnl/data/monetization/contract';
import { JURNL_MONETIZATION_COPY } from '../src/projects/jurnl/data/monetization/copy';
import { JURNL_DRAFT_ENTITLEMENT_MAP, JURNL_ENTITLEMENT_CANDIDATES } from '../src/projects/jurnl/data/monetization/entitlementMap';
import { JURNL_PLAN_IDS, JURNL_PLANS } from '../src/projects/jurnl/data/monetization/plans';
import { JURNL_PRICING } from '../src/projects/jurnl/data/monetization/pricing';
import { JURNL_FAMILY_IDS, JURNL_PRODUCT_TREE } from '../src/projects/jurnl/data/monetization/productTree';
import { projectMonetization, projectMonetizationInspection } from '../src/projects/monetization';
import JurnlRuntimeRoot from '../src/projects/jurnl/runtime/JurnlRuntimeRoot';
import { JurnlEntitlementsProvider } from '../src/projects/jurnl/runtime/monetization/JurnlEntitlements';
import {
  JurnlAddOnOffer,
  JurnlBillingStatus,
  JurnlEntitlementGate,
  JurnlFeaturePreview,
  JurnlPlanBadge,
  JurnlTrialNotice,
  JurnlUpgradePanel,
  JurnlUsageLimitNotice,
} from '../src/projects/jurnl/runtime/monetization/JurnlMonetizationPrimitives';
import { F01_SCREENS } from '../src/projects/jurnl/data/f01/screens';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
function walk(dir: string): string[] {
  return readdirSync(path.join(root, dir)).flatMap((n) => {
    const rel = `${dir}/${n}`;
    return statSync(path.join(root, rel)).isDirectory() ? walk(rel) : [rel];
  });
}
const sub = (planId: string, state: Subscription['state'] = 'ACTIVE', extra: Partial<Subscription> = {}): Subscription => ({
  accountId: 'acct_1',
  planId,
  state,
  startDate: '2026-10-01',
  renewalDate: '2026-11-01',
  cancelAtPeriodEnd: false,
  provider: 'NONE',
  providerRef: null,
  ...extra,
});
const NOW = '2026-10-05T12:00:00Z';
const server = (s: Subscription | null, extra: Record<string, unknown> = {}) => resolveEntitlements(C, { source: 'SERVER_VERIFIED', subscription: s, now: NOW, ...extra });
const PREMIUM = ['ADVANCED_SAFE_TO_SPEND', 'ADVANCED_FORECASTING', 'ADVANCED_PURCHASE_ANALYSIS', 'BUSINESS_PNL', 'AI_MULTI_SCENARIO_ANALYSIS', 'ADVANCED_TRIP_PLANNING'];

describe('plan registry', () => {
  it('has the five structural classes, all DRAFT, no billing configured', () => {
    expect([...JURNL_PLAN_IDS]).toEqual(['JURNL_FREE', 'JURNL_PLUS', 'JURNL_PRO', 'JURNL_BUSINESS', 'JURNL_ADD_ON']);
    expect(JURNL_PLANS.map((p) => p.planId)).toEqual([...JURNL_PLAN_IDS]);
    for (const p of JURNL_PLANS) {
      expect(p.status, p.planId).toBe('DRAFT');
      expect(p.billingProvider).toBe('NONE');
      expect(p.billingStatus).toBe('NOT_CONFIGURED');
      expect(p.trialPolicy).toMatchObject({ enabled: false, lengthDays: null });
    }
    expect(C.billing).toEqual({ provider: 'NONE', status: 'NOT_CONFIGURED', checkout: 'NOT_IMPLEMENTED' });
    expect(C.stage).toBe('FOUNDATION');
    expect(JURNL_PLANS.find((p) => p.planId === 'JURNL_ADD_ON')).toMatchObject({ planClass: 'ADD_ON', baseSubscribable: false });
  });
  it('subscriptions attach to a billing account (household / family ready), not to a user record', () => {
    expect(Object.keys(sub('JURNL_PLUS'))).toContain('accountId');
    expect(Object.keys(sub('JURNL_PLUS'))).not.toContain('userId');
    expect(read('shared/site00-monetization/contract.ts')).toMatch(/AccountScope = 'INDIVIDUAL' \| 'HOUSEHOLD' \| 'FAMILY' \| 'BUSINESS'/);
  });
});

describe('capability registry', () => {
  it('semantic, unique, mapped to the canonical 16-family product tree', () => {
    expect(JURNL_PRODUCT_TREE).toHaveLength(16);
    expect(JURNL_PRODUCT_TREE.map((f) => f.name)).toEqual(['ENTRY', 'SETUP', 'TODAY', 'ACTIVITY', 'MONEY', 'INCOME', 'UPCOMING', 'PLAN', 'SAFE TO SPEND', 'PURCHASES', 'TRIPS', 'CREDIT', 'PAYDOWN', 'GOALS', 'AHEAD', 'RECORDS']);
    const ids = JURNL_CAPABILITIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of JURNL_CAPABILITIES) {
      expect(c.id, c.id).toMatch(/^[A-Z][A-Z0-9_]+$/);
      expect(c.label).toBe(c.label.toUpperCase());
      expect(c.families.length, c.id).toBeGreaterThan(0);
      for (const f of c.families) expect(JURNL_FAMILY_IDS, `${c.id} → ${f}`).toContain(f);
    }
    for (const p of JURNL_PLANS) for (const cap of p.capabilities) expect(ids, `${p.planId} → ${cap}`).toContain(cap);
    for (const a of C.addOns) for (const cap of a.capabilityGrants) expect(ids, `${a.addOnId} → ${cap}`).toContain(cap);
    for (const f of C.features) if (f.capability) expect(ids, f.featureId).toContain(f.capability);
  });
  it('paid data / compute capabilities are server-enforced; safety floors exist and are in every base plan', () => {
    for (const c of JURNL_CAPABILITIES.filter((x) => ['ADVANCED', 'BUSINESS', 'AI'].includes(x.domain) && !x.safetyFloor)) expect(c.enforcement, c.id).toBe('SERVER_ENFORCED');
    const floors = JURNL_CAPABILITIES.filter((c) => c.safetyFloor).map((c) => c.id);
    expect(floors.sort()).toEqual(['AI_EXPLAIN_BASIC', 'CORE_ACCOUNT_SECURITY', 'CORE_PERSONAL_DATA_CONTROL']);
    for (const p of JURNL_PLANS.filter((x) => x.baseSubscribable)) for (const f of floors) expect(planCapabilities(C, p.planId), `${p.planId} ${f}`).toContain(f);
  });
});

describe('entitlement resolution', () => {
  it('default FREE state with no subscription (also canceled / paused)', () => {
    for (const s of [null, sub('JURNL_PRO', 'CANCELED'), sub('JURNL_PRO', 'PAUSED'), sub('JURNL_PRO', 'NONE')]) {
      const e = server(s);
      expect(e).toMatchObject({ status: 'RESOLVED', effectivePlanId: 'JURNL_FREE', failure: null });
      expect(hasCapability(e, 'CORE_SAFE_TO_SPEND')).toBe(true);
      for (const p of PREMIUM) expect(hasCapability(e, p), p).toBe(false);
    }
  });
  it('plans inherit only what they include: PRO ⊃ PLUS ⊃ FREE', () => {
    const plus = server(sub('JURNL_PLUS'));
    expect(hasCapability(plus, 'ADVANCED_SCENARIOS')).toBe(true);
    expect(hasCapability(plus, 'ADVANCED_FORECASTING')).toBe(false);
    const pro = server(sub('JURNL_PRO'));
    for (const c of ['ADVANCED_SCENARIOS', 'ADVANCED_FORECASTING', 'CORE_SAFE_TO_SPEND']) expect(hasCapability(pro, c), c).toBe(true);
    expect(pro.limits.find((l) => l.capability === 'AI_PLANNING_GUIDANCE')?.tier).toBe('HIGHER');
  });
  it('unknown / failing state falls back to FREE and never reveals premium capabilities or add-ons', () => {
    const unknown = server(sub('JURNL_ULTRA'));
    expect(unknown).toMatchObject({ status: 'FALLBACK', failure: 'UNKNOWN_PLAN', effectivePlanId: 'JURNL_FREE' });
    expect(server(sub('JURNL_ADD_ON')).failure).toBe('UNKNOWN_PLAN');
    for (const failure of ENTITLEMENT_FAILURES) {
      const e = server(sub('JURNL_PRO'), { failure, addOns: [{ addOnId: 'JURNL_ADD_ON_TRAVEL', purchaseStatus: 'ACTIVE' }] });
      expect(e.status, failure).toBe('FALLBACK');
      expect(e.addOns.granted).toEqual([]);
      for (const p of PREMIUM) expect(hasCapability(e, p), `${failure} ${p}`).toBe(false);
      expect(hasCapability(e, 'AI_EXPLAIN_BASIC')).toBe(true);
    }
    expect(server(sub('JURNL_PRO', 'PAST_DUE')).failure).toBe('PAYMENT_ISSUE');
    expect(server(sub('JURNL_PRO', 'EXPIRED')).failure).toBe('EXPIRED_ACCESS');
    expect(server(sub('JURNL_PRO', 'ACTIVE', { cancelAtPeriodEnd: true, renewalDate: '2026-10-01' })).failure).toBe('EXPIRED_ACCESS');
    expect(server(sub('JURNL_PRO', 'ACTIVE', { cancelAtPeriodEnd: true, renewalDate: '2026-12-01' })).effectivePlanId).toBe('JURNL_PRO');
    // corrupt input never throws
    expect(resolveEntitlements(C, { source: 'SERVER_VERIFIED', subscription: { planId: 'JURNL_PRO', state: 'TRIALING' } as unknown as Subscription }).status).toBe('FALLBACK');
  });
  it('trials: no length assumed; active only with a trial record inside its window', () => {
    const trial = { trialPlan: 'JURNL_PRO', startDate: '2026-10-01', endDate: '2026-10-20', trialCapabilities: 'PLAN' as const, postTrialPlan: 'JURNL_FREE', trialUsed: true };
    expect(server(sub('JURNL_PRO', 'TRIALING'), { trial })).toMatchObject({ trialActive: true, effectivePlanId: 'JURNL_PRO' });
    expect(server(sub('JURNL_PRO', 'TRIALING'), { trial: { ...trial, endDate: '2026-10-02' } }).failure).toBe('EXPIRED_ACCESS');
    expect(server(sub('JURNL_PRO', 'TRIALING')).failure).toBe('EXPIRED_ACCESS');
    // unparseable dates fail closed (never keep premium access)
    expect(server(sub('JURNL_PRO', 'TRIALING'), { trial: { ...trial, endDate: 'not-a-date' } }).failure).toBe('EXPIRED_ACCESS');
    expect(server(sub('JURNL_PRO', 'ACTIVE', { cancelAtPeriodEnd: true, renewalDate: 'garbage' })).failure).toBe('EXPIRED_ACCESS');
    expect(resolveEntitlements(C, { source: 'SERVER_VERIFIED', subscription: sub('JURNL_PRO'), now: 'nope' }).failure).toBe('ENTITLEMENT_LOAD_FAILURE');
  });
});

describe('add-ons', () => {
  it('grant capabilities only when ACTIVE and eligible for the base plan', () => {
    const travel = server(null, { addOns: [{ addOnId: 'JURNL_ADD_ON_TRAVEL', purchaseStatus: 'ACTIVE' }] });
    expect(travel.addOns.granted).toEqual(['JURNL_ADD_ON_TRAVEL']);
    expect(hasCapability(travel, 'ADVANCED_TRIP_PLANNING')).toBe(true);
    expect(hasCapability(travel, 'ADVANCED_FORECASTING')).toBe(false);
    const pending = server(null, { addOns: [{ addOnId: 'JURNL_ADD_ON_TRAVEL', purchaseStatus: 'PENDING' }] });
    expect(hasCapability(pending, 'ADVANCED_TRIP_PLANNING')).toBe(false);
    const ineligible = server(sub('JURNL_PRO'), { addOns: [{ addOnId: 'JURNL_ADD_ON_BUSINESS_TAX', purchaseStatus: 'ACTIVE' }] });
    expect(ineligible.addOns.ignored[0]).toMatchObject({ addOnId: 'JURNL_ADD_ON_BUSINESS_TAX' });
    expect(hasCapability(ineligible, 'BUSINESS_TAX_ADVANCED')).toBe(false);
    for (const a of C.addOns) expect(a.status).toBe('DRAFT');
  });
});

describe('business is its own plan class (not consumer PRO)', () => {
  it('BUSINESS and PRO do not contain each other', () => {
    const biz = server(sub('JURNL_BUSINESS'));
    const pro = server(sub('JURNL_PRO'));
    for (const c of ['BUSINESS_PNL', 'BUSINESS_TAX_PREP', 'BUSINESS_RECEIPTS', 'BUSINESS_MILEAGE']) {
      expect(hasCapability(biz, c), c).toBe(true);
      expect(hasCapability(pro, c), c).toBe(false);
    }
    for (const c of ['ADVANCED_FORECASTING', 'AI_MULTI_SCENARIO_ANALYSIS', 'ADVANCED_PURCHASE_ANALYSIS']) expect(hasCapability(biz, c), c).toBe(false);
    expect(JURNL_PLANS.find((p) => p.planId === 'JURNL_BUSINESS')).toMatchObject({ planClass: 'BUSINESS', audience: 'BUSINESS', includes: ['JURNL_FREE'] });
    expect(lowestPlanGranting(C, 'BUSINESS_PNL')?.planId).toBe('JURNL_BUSINESS');
    expect(lowestPlanGranting(C, 'ADVANCED_SCENARIOS')?.planId).toBe('JURNL_PLUS');
    expect(lowestPlanGranting(C, 'ADVANCED_FORECASTING')?.planId).toBe('JURNL_PRO');
  });
});

describe('server authorization boundary (client hiding is not security)', () => {
  it('only SERVER_VERIFIED entitlements authorize paid data / compute', () => {
    const client = resolveEntitlements(C, { source: 'CLIENT_CACHE', subscription: sub('JURNL_PRO'), now: NOW });
    expect(authorizeCapability(C, client, 'ADVANCED_FORECASTING')).toMatchObject({ allowed: false, status: 401, reason: 'UNTRUSTED_ENTITLEMENT_SOURCE' });
    const forged = { ...server(null), capabilities: [...server(null).capabilities, 'BUSINESS_PNL'], source: 'CLIENT_CACHE' } as ResolvedEntitlements;
    expect(authorizeCapability(C, forged, 'BUSINESS_PNL').allowed).toBe(false);
    expect(authorizeCapability(C, server(sub('JURNL_PRO')), 'ADVANCED_FORECASTING')).toMatchObject({ allowed: true, status: 200 });
    expect(authorizeCapability(C, server(null), 'ADVANCED_FORECASTING')).toMatchObject({ allowed: false, status: 402 });
    expect(authorizeCapability(C, server(null), 'NOT_A_CAPABILITY')).toMatchObject({ allowed: false, status: 403 });
    expect(authorizeCapability(C, server(sub('JURNL_PRO'), { failure: 'PROVIDER_UNAVAILABLE' }), 'ADVANCED_FORECASTING')).toMatchObject({ allowed: false, status: 503 });
    expect(authorizeCapability(C, server(null, { failure: 'ENTITLEMENT_LOAD_FAILURE' }), 'AI_EXPLAIN_BASIC').allowed).toBe(true);
    expect(authorizeCapability(C, server(null), 'TRAVEL_BOOKING_REFERRALS')).toMatchObject({ allowed: false, reason: 'SURFACE_DISABLED' });
  });
  it('client gate is presentation only and withholds when state is unknown', () => {
    expect(clientGate(server(sub('JURNL_PRO')), 'ADVANCED_FORECASTING')).toMatchObject({ mode: 'SHOW', authoritative: false });
    expect(clientGate(server(null), 'ADVANCED_FORECASTING').mode).toBe('PREVIEW');
    expect(clientGate(server(null, { failure: 'OFFLINE_BILLING' }), 'ADVANCED_FORECASTING').mode).toBe('WITHHOLD');
    expect(clientGate(null, 'ADVANCED_FORECASTING').mode).toBe('WITHHOLD');
  });
  it('usage limits: numbers are TBD → never enforced as a guess (fail closed)', () => {
    expect(checkUsage({ capability: 'AI_EXPLAIN_BASIC', limitType: 'REQUESTS', period: 'PER_MONTH', tier: 'LIMITED', amount: null }, 0)).toMatchObject({ allowed: false, reason: 'LIMIT_TBD' });
    expect(checkUsage({ capability: 'X', limitType: 'REQUESTS', period: 'UNLIMITED', tier: 'UNLIMITED', amount: null }, 999).allowed).toBe(true);
    for (const p of JURNL_PLANS) for (const l of p.limits) expect(l.amount, `${p.planId} ${l.capability}`).toBeNull();
  });
});

describe('billing provider boundary — no fake live billing', () => {
  it('unconfigured provider refuses every mutation and truthfully reports no subscription', async () => {
    const b = createUnconfiguredBillingProvider();
    expect(b).toMatchObject({ id: 'NONE', configured: false });
    expect(await b.createCheckoutSession({ accountId: 'a', productId: 'JURNL_PRO', productKind: 'PLAN', cadence: 'MONTHLY', returnUrl: '/' })).toEqual({ ok: false, code: 'BILLING_NOT_CONFIGURED' });
    for (const r of [await b.createPortalSession('a', '/'), await b.changePlan('a', 'JURNL_PRO', 'ANNUAL'), await b.cancelPlan('a', true), await b.resumePlan('a')]) expect(r).toEqual({ ok: false, code: 'BILLING_NOT_CONFIGURED' });
    expect(await b.getSubscription('a')).toEqual({ ok: true, value: null });
    expect(await b.getEntitlements('a')).toEqual({ ok: true, value: { subscription: null, addOns: [] } });
    expect(await b.getBillingHistory('a')).toEqual({ ok: true, value: [] });
  });
  it('no Stripe SDK / checkout wiring anywhere in the foundation', () => {
    for (const f of [...walk('shared/site00-monetization'), ...walk('src/projects')].filter((x) => /\.(ts|tsx)$/.test(x))) expect(read(f), f).not.toMatch(/from ['"]stripe|@stripe\/|checkout\.stripe|loadStripe/);
  });
});

describe('pricing: central, configurable, unset — no hard-coding', () => {
  it('every price is TBD', () => {
    expect(JURNL_PRICING.length).toBe(7);
    for (const p of JURNL_PRICING) {
      expect(p.status, p.productId).toBe('TBD');
      expect(p.monthly).toEqual({ amountCents: null, currency: null });
      expect(p.annual).toEqual({ amountCents: null, currency: null });
      expect(p.intro).toBeNull();
    }
  });
  it('no price strings anywhere in JURNL code or the shared contract', () => {
    const files = [...walk('src/projects/jurnl'), ...walk('shared/site00-monetization')].filter((x) => /\.(ts|tsx|css)$/.test(x));
    for (const f of files) {
      const src = read(f);
      expect(src, f).not.toMatch(/[$€£]\s?\d|\d+(\.\d{2})?\s?(USD|EUR|GBP)\b|\/\s?(MO|MONTH|YR|YEAR)\b|PER (MONTH|YEAR)\b(?!_)/);
      expect(src, f).not.toMatch(/amountCents:\s*\d/);
    }
  });
});

describe('trust rules', () => {
  it('financial data sale and ad targeting are prohibited; no ads, no ad networks', () => {
    expect(C.dataUse).toMatchObject({ userFinancialDataSale: 'PROHIBITED', userFinancialDataAdTargeting: 'PROHIBITED', displayAds: 'PROHIBITED', adNetworkIntegration: 'PROHIBITED', uiLegalClaims: 'NONE_YET' });
    for (const f of walk('src/projects').filter((x) => /\.(ts|tsx|css)$/.test(x))) expect(read(f), f).not.toMatch(/adsbygoogle|googletag|doubleclick|ad-slot|AdSlot|admob/i);
  });
  it('affiliate / sponsored placements are disclosed; ranking ignores compensation; sponsored never interleaves', () => {
    const p = (id: string, kind: MonetizedPlacement['kind'], score: number, commission: MonetizedPlacement['commissionType'], disclosed = kind !== 'EDITORIAL_RECOMMENDATION'): MonetizedPlacement => ({
      placementId: id, kind, partnerType: 'TRAVEL', affiliateProvider: kind === 'EDITORIAL_RECOMMENDATION' ? null : 'X', merchant: 'M', offerId: null, commissionType: commission, disclosureRequired: disclosed, bookingUrl: null, trackingId: null, recommendationIndependent: true, editorialScore: score,
    });
    expect(validatePlacement(p('a', 'AFFILIATE_LINK', 1, 'CPA', false))).toContain('DISCLOSURE_REQUIRED');
    expect(validatePlacement(p('b', 'EDITORIAL_RECOMMENDATION', 1, 'CPA'))).toContain('HIDDEN_COMPENSATION_ON_EDITORIAL');
    expect(validatePlacement(p('c', 'SPONSORED_PLACEMENT', 1, 'FLAT'))).toEqual([]);
    const ordered = orderPlacements([p('low-paid', 'AFFILIATE_LINK', 0.2, 'REV_SHARE'), p('best', 'EDITORIAL_RECOMMENDATION', 0.9, 'NONE'), p('sponsor', 'SPONSORED_PLACEMENT', 0.99, 'FLAT'), p('mid', 'AFFILIATE_LINK', 0.5, 'CPA')]);
    expect(ordered.ranked.map((x) => x.placementId)).toEqual(['best', 'mid', 'low-paid']);
    expect(ordered.sponsored.map((x) => x.placementId)).toEqual(['sponsor']);
    expect(C.recommendations).toMatchObject({ independenceRule: 'VERDICT_INDEPENDENT_OF_COMPENSATION', payToRank: 'PROHIBITED' });
  });
  it('verdict first, then the person chooses to shop; compensation can never enter a verdict', () => {
    expect([...C.recommendations.commerceFlowOrder]).toEqual(['AFFORDABILITY_DECISION', 'USER_CHOSE_TO_SHOP', 'MERCHANT_OPTIONS']);
    expect(merchantOptionsAllowed({ verdictReached: false, userChoseToShop: true })).toBe(false);
    expect(merchantOptionsAllowed({ verdictReached: true, userChoseToShop: false })).toBe(false);
    expect(merchantOptionsAllowed({ verdictReached: true, userChoseToShop: true })).toBe(true);
    expect(() => assertVerdictInputIndependent({ price: 1, cash: { available: 2 } })).not.toThrow();
    expect(() => assertVerdictInputIndependent({ price: 1, offer: { commissionRate: 0.1 } })).toThrow(/compensation/);
    expect(() => assertVerdictInputIndependent({ affiliateBoost: 1 })).toThrow();
  });
  it('referrals + commerce surfaces exist structurally but are disabled', () => {
    expect(C.referrals.status).toBe('DISABLED');
    for (const c of JURNL_CAPABILITIES.filter((x) => x.domain === 'COMMERCE' || x.domain === 'REFERRAL')) {
      expect(c.surfaceStatus, c.id).toBe('DISABLED');
      expect(hasCapability(server(sub('JURNL_PRO')), c.id), c.id).toBe(false);
    }
  });
  it('analytics: 12 events, allow-listed props, no financial data, pseudonymous accounts', () => {
    expect([...MONETIZATION_EVENT_NAMES]).toHaveLength(12);
    expect(buildMonetizationEvent('feature_gate_seen', { capability: 'ADVANCED_FORECASTING', familyId: 'F15' }, { accountRef: 'acct_ref_a1' }).ok).toBe(true);
    expect(buildMonetizationEvent('feature_gate_seen', { balance: '1200' }, { accountRef: 'acct_ref_a1' })).toMatchObject({ ok: false });
    expect(buildMonetizationEvent('feature_gate_seen', { reason: 'SPEND OVER $40.00' }, { accountRef: 'acct_ref_a1' })).toMatchObject({ ok: false });
    expect(buildMonetizationEvent('upgrade_viewed', {}, { accountRef: 'emma@example.com' })).toMatchObject({ ok: false });
    expect(buildMonetizationEvent('bank_synced', {}, { accountRef: 'acct_ref_a1' })).toMatchObject({ ok: false });
    expect([...REVENUE_SOURCES]).toEqual(['SUBSCRIPTION', 'ADD_ON', 'AFFILIATE', 'TRAVEL', 'COMMERCE', 'PROFESSIONAL_REFERRAL', 'BUSINESS']);
  });
});

describe('family production contract carries OPTIONAL monetization metadata', () => {
  it('F01 declares FULL access and no upgrade surface', () => {
    expect(familyMonetization(JURNL_F01_CONTRACT)).toMatchObject({ defaultAccess: 'FULL', upgradeSurfaceAllowed: false, premiumChildren: [], premiumInteractions: [] });
  });
  it('projects / families without monetization do not break', () => {
    const { monetization: _m, ...plain } = JURNL_F01_CONTRACT;
    const contract: FamilyProductionContract = plain;
    expect(familyMonetization(contract)).toBeNull();
    const gate = evaluateFamilyGate(contract, JURNL_F01_COVERAGE);
    expect(gate.implementationReady).toBe(true);
    expect(evaluateFamilyCompleteness(contract, gate)).toEqual(evaluateFamilyCompleteness(JURNL_F01_CONTRACT, evaluateFamilyGate(JURNL_F01_CONTRACT, JURNL_F01_COVERAGE)));
    expect(projectMonetization('ndxbook')).toBeNull();
    expect(projectMonetizationInspection('ndxbook')).toEqual([]);
  });
  it('the shared monetization contract never names a project', () => {
    for (const f of walk('shared/site00-monetization')) {
      const code = read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      expect(code, f).not.toMatch(/jurnl|ndxbook/i);
    }
  });
});

describe('draft 16-family entitlement map (for founder review)', () => {
  it('classifies every family, nothing approved', () => {
    expect(JURNL_DRAFT_ENTITLEMENT_MAP.map((r) => r.familyId)).toEqual([...JURNL_FAMILY_IDS]);
    for (const r of JURNL_DRAFT_ENTITLEMENT_MAP) {
      expect(r.founderApproved).toBe(false);
      expect(JURNL_ENTITLEMENT_CANDIDATES as readonly string[]).toContain(r.familyCandidate);
      for (const c of r.capabilities) expect(JURNL_ENTITLEMENT_CANDIDATES as readonly string[]).toContain(c.candidate);
    }
    expect(JURNL_DRAFT_ENTITLEMENT_MAP[0]).toMatchObject({ familyName: 'ENTRY', familyCandidate: 'CORE_FREE_CANDIDATE', defaultAccess: 'FULL' });
  });
  it('DESIGN can inspect feature · access class · capability · paywall · upgrade surface', () => {
    const rows = projectMonetizationInspection('jurnl');
    expect(rows.length).toBe(C.features.length);
    expect(rows.find((r) => r.featureId === 'F01.ENTRY')).toMatchObject({ project: 'JURNL', accessClass: 'FREE', paywall: 'NONE', upgradeSurface: null });
    expect(rows.find((r) => r.featureId === 'F08.SCENARIOS')).toMatchObject({ accessClass: 'PLUS', paywall: 'SOFT' });
    expect(rows.find((r) => r.featureId === 'F15.ADVANCED')).toMatchObject({ accessClass: 'PRO' });
    expect(rows.find((r) => r.featureId === 'F16.PNL')).toMatchObject({ accessClass: 'BUSINESS', paywall: 'HARD' });
    expect(rows.find((r) => r.featureId === 'F11.SCENARIOS')).toMatchObject({ accessClass: 'ADD_ON' });
    for (const r of rows.filter((x) => x.paywall === 'HARD')) expect(C.capabilities.find((c) => c.id === r.capability)?.enforcement).toBe('SERVER_ENFORCED');
  });
});

describe('UI queries semantic capabilities — plan names never scattered through feature code', () => {
  it('no plan-id literals or plan comparisons in runtime code', () => {
    for (const f of walk('src/projects/jurnl/runtime').filter((x) => /\.(ts|tsx)$/.test(x))) {
      expect(read(f), f).not.toMatch(/JURNL_(FREE|PLUS|PRO|BUSINESS)\b|plan(Id)?\s*===|tierLabel\s*===/);
    }
    for (const f of walk('src/projects/jurnl/data').filter((x) => /\.(ts|tsx)$/.test(x) && !x.includes('/monetization/'))) {
      expect(read(f), f).not.toMatch(/JURNL_(PLUS|PRO|BUSINESS)\b/);
    }
  });
  it('monetization copy is uppercase and price-free', () => {
    const strings: string[] = [];
    const collect = (v: unknown) => {
      if (typeof v === 'string') strings.push(v);
      else if (typeof v === 'function') strings.push(String((v as (s: string) => string)('JURNL PRO')));
      else if (v && typeof v === 'object') Object.values(v).forEach(collect);
    };
    collect(JURNL_MONETIZATION_COPY);
    for (const s of strings) expect(s).toBe(s.toUpperCase());
  });
});

describe('monetization primitives (rendered outside F01)', () => {
  const withEnt = (node: ReactNode, value?: ResolvedEntitlements) => renderToStaticMarkup(createElement(JurnlEntitlementsProvider, { mode: 'design-preview', value }, node));
  const gate = (value?: ResolvedEntitlements, familyId = 'F15') =>
    withEnt(
      createElement(JurnlEntitlementGate, { capability: 'ADVANCED_FORECASTING', familyId, preview: 'SAMPLE', upgrade: { fact: 'YOUR BASIC FORECAST IS READY.', action: { onClick: () => undefined } } }, 'PREMIUM-CONTENT'),
      value,
    );
  it('gate shows content only with the capability; unknown state never reveals it', () => {
    expect(gate(server(sub('JURNL_PRO')))).toContain('PREMIUM-CONTENT');
    expect(gate()).not.toContain('PREMIUM-CONTENT');
    expect(gate()).toContain('data-gate-mode="preview"');
    const failing = gate(server(sub('JURNL_PRO'), { failure: 'ENTITLEMENT_LOAD_FAILURE' }));
    expect(failing).not.toContain('PREMIUM-CONTENT');
    expect(failing).toContain('data-failure="ENTITLEMENT_LOAD_FAILURE"');
    expect(renderToStaticMarkup(createElement(JurnlEntitlementGate, { capability: 'ADVANCED_FORECASTING', familyId: 'F15' }, 'PREMIUM-CONTENT'))).not.toContain('PREMIUM-CONTENT');
  });
  it('upgrade surfaces never render in F01 (or any family without allowed metadata)', () => {
    for (const fam of ['F01', 'F15', 'F99']) {
      expect(withEnt(createElement(JurnlUpgradePanel, { familyId: fam, capability: 'ADVANCED_FORECASTING', fact: 'X', action: { onClick: () => undefined } })), fam).toBe('');
      expect(withEnt(createElement(JurnlAddOnOffer, { familyId: fam, addOnId: 'JURNL_ADD_ON_TRAVEL', fact: 'X', action: { onClick: () => undefined } })), fam).toBe('');
    }
    expect(gate(undefined, 'F01')).not.toContain('VIEW OPTIONS');
  });
  it('badge / billing status / trial / usage / preview render from the registry, uppercase, square', () => {
    expect(withEnt(createElement(JurnlPlanBadge, {}))).toContain('>FREE<');
    expect(withEnt(createElement(JurnlPlanBadge, { planId: 'JURNL_BUSINESS' }))).toContain('>BUSINESS<');
    expect(withEnt(createElement(JurnlBillingStatus, { state: 'PAST_DUE' }))).toContain('PAYMENT ISSUE');
    expect(withEnt(createElement(JurnlTrialNotice, { endDateLabel: 'OCT 20' }))).toBe('');
    expect(withEnt(createElement(JurnlUsageLimitNotice, { capability: 'AI_EXPLAIN_BASIC', reached: true }))).toContain("THIS PERIOD&#x27;S LIMIT HAS BEEN REACHED.");
    expect(withEnt(createElement(JurnlFeaturePreview, null, 'SAMPLE'))).toContain('PREVIEW');
    const css = read('src/projects/jurnl/runtime/monetization/jurnl-monetization.css');
    expect(css).not.toMatch(/border-radius:\s*(50%|9999|999px|100%)/);
  });
});

describe('no F01 paywall regression', () => {
  const BASE = '/production/jurnl/runtime';
  const renderRuntime = (route: string, mode: 'design-preview' | 'production' = 'design-preview') =>
    renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [`${BASE}/${route}`] }, createElement(Routes, null, createElement(Route, { path: '/production/:projectSlug/runtime/*', element: createElement(JurnlRuntimeRoot, { basePath: BASE, mode }) }))));
  it('no F01 screen renders plan, upgrade, trial, price or billing UI', () => {
    for (const s of F01_SCREENS) {
      for (const mode of ['design-preview', 'production'] as const) {
        const html = renderRuntime(s.route, mode);
        expect(html, `${s.id} ${mode}`).toContain(`data-jrn-screen="${s.id}"`);
        expect(html, s.id).not.toMatch(/data-jrn-monetization|data-jrn-gate|JURNL (PLUS|PRO|BUSINESS)|UPGRADE|SUBSCRIBE|FREE TRIAL|TRIAL ENDS|VIEW OPTIONS|CHECKOUT/);
      }
    }
  });
  it('F01 screens / components do not import monetization primitives', () => {
    for (const f of [...walk('src/projects/jurnl/runtime/screens'), ...walk('src/projects/jurnl/runtime/components'), 'src/projects/jurnl/runtime/state/store.tsx']) {
      expect(read(f), f).not.toMatch(/monetization/i);
    }
  });
});
