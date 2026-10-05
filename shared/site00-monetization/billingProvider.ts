/**
 * BILLING PROVIDER BOUNDARY — interface + an honest unconfigured implementation.
 *
 * No billing provider is wired for consumer products yet. The unconfigured provider never fakes success: every
 * mutating call (checkout, portal, plan changes) returns BILLING_NOT_CONFIGURED; read calls truthfully report that
 * no subscription exists. Provider ids reuse shared/site00-commercial-audit (SITE 00 owns commercial identity).
 */

import type { AccountAddOn, BillingProviderRef, Subscription } from './contract.js';

export type BillingErrorCode = 'BILLING_NOT_CONFIGURED' | 'PROVIDER_UNAVAILABLE' | 'NOT_FOUND' | 'NOT_ELIGIBLE' | 'PAYMENT_REQUIRED';
export type BillingResult<T> = { ok: true; value: T } | { ok: false; code: BillingErrorCode };

export type BillingCadence = 'MONTHLY' | 'ANNUAL';
export type CheckoutRequest = { accountId: string; productId: string; productKind: 'PLAN' | 'ADD_ON'; cadence: BillingCadence; returnUrl: string };
export type BillingHistoryEntry = { id: string; productId: string; periodStart: string; periodEnd: string; amountCents: number; currency: string; status: 'PAID' | 'OPEN' | 'VOID' | 'REFUNDED' };

export interface BillingProvider {
  readonly id: BillingProviderRef;
  readonly configured: boolean;
  createCheckoutSession(req: CheckoutRequest): Promise<BillingResult<{ sessionId: string; url: string }>>;
  createPortalSession(accountId: string, returnUrl: string): Promise<BillingResult<{ url: string }>>;
  getSubscription(accountId: string): Promise<BillingResult<Subscription | null>>;
  changePlan(accountId: string, toPlanId: string, cadence: BillingCadence): Promise<BillingResult<Subscription>>;
  cancelPlan(accountId: string, atPeriodEnd: boolean): Promise<BillingResult<Subscription>>;
  resumePlan(accountId: string): Promise<BillingResult<Subscription>>;
  /** Raw billing facts for the server-side resolver (resolveEntitlements with source SERVER_VERIFIED). */
  getEntitlements(accountId: string): Promise<BillingResult<{ subscription: Subscription | null; addOns: AccountAddOn[] }>>;
  getBillingHistory(accountId: string): Promise<BillingResult<BillingHistoryEntry[]>>;
}

export function createUnconfiguredBillingProvider(): BillingProvider {
  const notConfigured = async <T,>(): Promise<BillingResult<T>> => ({ ok: false, code: 'BILLING_NOT_CONFIGURED' });
  return {
    id: 'NONE',
    configured: false,
    createCheckoutSession: () => notConfigured(),
    createPortalSession: () => notConfigured(),
    changePlan: () => notConfigured(),
    cancelPlan: () => notConfigured(),
    resumePlan: () => notConfigured(),
    // Truthful reads: with no billing there is no subscription, no add-on purchase and no history.
    getSubscription: async () => ({ ok: true, value: null }),
    getEntitlements: async () => ({ ok: true, value: { subscription: null, addOns: [] } }),
    getBillingHistory: async () => ({ ok: true, value: [] }),
  };
}
