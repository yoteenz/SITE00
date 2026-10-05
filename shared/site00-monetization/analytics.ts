/**
 * Monetization analytics + revenue attribution — data contracts only (no tracker wired).
 *
 * Event payloads are allow-listed and carry NO financial data (amounts, balances, merchants, transactions, income …).
 * Accounts are referenced pseudonymously. Revenue attribution is recorded server-side and is about the product's
 * revenue, never about a person's finances.
 */

import { MONETIZATION_EVENT_NAMES, type MonetizationEventName, type MonetizedPlacementKind, type RevenueSource } from './contract.js';

const ALLOWED_PROPS = ['planId', 'fromPlanId', 'toPlanId', 'capability', 'familyId', 'featureId', 'surface', 'addOnId', 'provider', 'placementKind', 'trialPlan', 'reason'] as const;
type AllowedProp = (typeof ALLOWED_PROPS)[number];
const FINANCIAL = /amount|balance|income|salary|price|cost|spend|transaction|merchant|account_?number|card|iban|routing|debt|loan|credit_?score|net_?worth|payee|budget|cash/i;

export type MonetizationEvent = { name: MonetizationEventName; at: string; accountRef: string; props: Partial<Record<AllowedProp, string>> };

export function buildMonetizationEvent(
  name: string,
  props: Record<string, unknown>,
  ctx: { accountRef: string; at?: string },
): { ok: true; event: MonetizationEvent } | { ok: false; rejected: string[] } {
  const rejected: string[] = [];
  if (!(MONETIZATION_EVENT_NAMES as readonly string[]).includes(name)) rejected.push(`event:${name}`);
  if (/@|\d{6,}/.test(ctx.accountRef)) rejected.push('accountRef:not-pseudonymous');
  const clean: Partial<Record<AllowedProp, string>> = {};
  for (const [k, v] of Object.entries(props)) {
    if (!(ALLOWED_PROPS as readonly string[]).includes(k) || FINANCIAL.test(k)) rejected.push(k);
    else if (typeof v !== 'string' || FINANCIAL.test(v) || /\d+[.,]\d{2}\b|[$€£]/.test(v)) rejected.push(`${k}:value`);
    else clean[k as AllowedProp] = v;
  }
  if (rejected.length) return { ok: false, rejected };
  return { ok: true, event: { name: name as MonetizationEventName, at: ctx.at ?? new Date().toISOString(), accountRef: ctx.accountRef, props: clean } };
}

/** Product revenue attribution (server-side ledger shape; no dashboard). */
export type RevenueAttribution = {
  source: RevenueSource;
  productId: string | null;
  partnerId: string | null;
  placementKind: MonetizedPlacementKind | null;
  periodStart: string;
  periodEnd: string;
  /** Revenue to the product, integer cents. Never derived from or linked to a person's financial data. */
  amountCents: number | null;
  currency: string | null;
};
