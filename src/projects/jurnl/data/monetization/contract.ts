/**
 * JURNL MONETIZATION CONTRACT — FOUNDATION stage. Data only (host + runtime may import).
 * No prices, no billing, no checkout, no live trials, no commerce / referral surfaces, no ads.
 */

import { MONETIZATION_CONTRACT_VERSION, MONETIZATION_EVENT_NAMES, REVENUE_SOURCES, type ProjectMonetizationContract } from '../../../../../shared/site00-monetization/contract.js';
import { JURNL_ADD_ONS } from './addOns';
import { JURNL_CAPABILITIES } from './capabilities';
import { JURNL_DRAFT_ENTITLEMENT_MAP } from './entitlementMap';
import { JURNL_FEATURE_ENTITLEMENTS } from './features';
import { JURNL_PLANS } from './plans';
import { JURNL_PRICING } from './pricing';

export const JURNL_MONETIZATION_CONTRACT: ProjectMonetizationContract = {
  contractVersion: MONETIZATION_CONTRACT_VERSION,
  projectId: 'jurnl',
  stage: 'FOUNDATION',
  defaultPlanId: 'JURNL_FREE',
  plans: [...JURNL_PLANS],
  capabilities: [...JURNL_CAPABILITIES],
  addOns: [...JURNL_ADD_ONS],
  pricing: [...JURNL_PRICING],
  billing: { provider: 'NONE', status: 'NOT_CONFIGURED', checkout: 'NOT_IMPLEMENTED' },
  dataUse: {
    userFinancialDataSale: 'PROHIBITED',
    userFinancialDataAdTargeting: 'PROHIBITED',
    personalizedProductFunctionality: 'PERMITTED_SUBJECT_TO_CONSENT_AND_POLICY',
    displayAds: 'PROHIBITED',
    adNetworkIntegration: 'PROHIBITED',
    uiLegalClaims: 'NONE_YET',
  },
  recommendations: {
    independenceRule: 'VERDICT_INDEPENDENT_OF_COMPENSATION',
    payToRank: 'PROHIBITED',
    disclosureRequiredFor: ['AFFILIATE_LINK', 'SPONSORED_PLACEMENT'],
    commerceFlowOrder: ['AFFORDABILITY_DECISION', 'USER_CHOSE_TO_SHOP', 'MERCHANT_OPTIONS'],
  },
  referrals: {
    types: ['HYSA', 'CREDIT_CARD', 'INSURANCE', 'MORTGAGE', 'REFINANCING', 'TAX_PROFESSIONAL', 'BOOKKEEPER', 'FINANCIAL_PLANNER', 'ESTATE_SERVICES', 'HOTEL', 'FLIGHT', 'EXPERIENCE', 'TRAVEL_INSURANCE', 'MERCHANT', 'CASHBACK'],
    status: 'DISABLED',
  },
  analytics: { events: MONETIZATION_EVENT_NAMES, financialDataInPayloads: 'PROHIBITED' },
  revenueSources: REVENUE_SOURCES,
  upgradeGrammar: 'FACT_VALUE_ACTION',
  features: [...JURNL_FEATURE_ENTITLEMENTS],
  draftEntitlementMap: [...JURNL_DRAFT_ENTITLEMENT_MAP],
};
