/**
 * JURNL CENTRAL PRICING CONFIG — the only place a JURNL price may ever live. Every value is UNSET (TBD).
 * Components never contain price strings; they read this config (and today it says "not decided").
 */

import type { PriceAmount, PricingEntry } from '../../../../../shared/site00-monetization/contract.js';
import { JURNL_ADD_ONS } from './addOns';
import { JURNL_PLANS } from './plans';

const UNSET: PriceAmount = { amountCents: null, currency: null };
const tbd = (productId: string, productKind: PricingEntry['productKind']): PricingEntry => ({
  productId,
  productKind,
  monthly: UNSET,
  annual: UNSET,
  region: 'TBD',
  intro: null,
  promotion: null,
  effectiveDate: null,
  status: 'TBD',
});

export const JURNL_PRICING: readonly PricingEntry[] = [
  ...JURNL_PLANS.filter((p) => p.baseSubscribable && p.planClass !== 'FREE').map((p) => tbd(p.planId, 'PLAN')),
  ...JURNL_ADD_ONS.map((a) => tbd(a.addOnId, 'ADD_ON')),
];
