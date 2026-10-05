/**
 * JURNL PLAN REGISTRY — structural entitlement classes (DRAFT). No prices, no final packages, no billing.
 *
 *  JURNL_FREE      core financial organization
 *  JURNL_PLUS      deeper planning + automation          (includes FREE)
 *  JURNL_PRO       advanced intelligence + forecasting   (includes PLUS)
 *  JURNL_BUSINESS  business accounting / records / tax   (own BUSINESS line — includes FREE core, NOT PRO)
 *  JURNL_ADD_ON    entitlement class for optional add-ons (not a base plan)
 *
 * Capability lists are the DRAFT entitlement map (founder review) — not approved pricing policy.
 */

import type { PlanDefinition, TrialPolicy } from '../../../../../shared/site00-monetization/contract.js';

export const JURNL_PLAN_IDS = ['JURNL_FREE', 'JURNL_PLUS', 'JURNL_PRO', 'JURNL_BUSINESS', 'JURNL_ADD_ON'] as const;
export type JurnlPlanId = (typeof JURNL_PLAN_IDS)[number];

const NO_TRIAL: TrialPolicy = { enabled: false, lengthDays: null, trialCapabilities: 'PLAN', postTrialPlan: 'JURNL_FREE' };
const base = {
  status: 'DRAFT',
  baseSubscribable: true,
  trialPolicy: NO_TRIAL,
  billingProvider: 'NONE',
  billingStatus: 'NOT_CONFIGURED',
  regionRules: { regions: 'TBD' },
  affiliateEligibility: 'DISCLOSED_ONLY',
} as const satisfies Partial<PlanDefinition>;

export const JURNL_PLANS: readonly PlanDefinition[] = [
  {
    ...base,
    planId: 'JURNL_FREE',
    planName: 'JURNL',
    tierLabel: 'FREE',
    planClass: 'FREE',
    audience: 'CONSUMER',
    rank: 0,
    includes: [],
    capabilities: [
      'CORE_ACCOUNT_SECURITY',
      'CORE_PERSONAL_DATA_CONTROL',
      'CORE_GUIDED_SETUP',
      'CORE_TODAY_OVERVIEW',
      'CORE_TRANSACTION_TRACKING',
      'CORE_ACCOUNT_OVERVIEW',
      'CORE_INCOME_TRACKING',
      'CORE_UPCOMING_BILLS',
      'CORE_BASIC_BUDGETING',
      'CORE_SAFE_TO_SPEND',
      'CORE_PURCHASE_CHECK',
      'CORE_TRIP_AFFORDABILITY',
      'CORE_CREDIT_OVERVIEW',
      'CORE_PAYDOWN_BASICS',
      'CORE_BASIC_GOALS',
      'CORE_BASIC_FORECAST',
      'RECORDS_BASIC',
      'AI_EXPLAIN_BASIC',
      // Revenue surfaces: available to every account once enabled (disclosed, verdict-independent) — OFF today.
      'COMMERCE_PRICE_COMPARISON',
      'COMMERCE_MERCHANT_OPTIONS',
      'TRAVEL_BOOKING_REFERRALS',
      'FINANCIAL_SERVICE_REFERRALS',
    ],
    limits: [{ capability: 'AI_EXPLAIN_BASIC', limitType: 'REQUESTS', period: 'PER_MONTH', tier: 'LIMITED', amount: null }],
    addOns: ['JURNL_ADD_ON_TRAVEL', 'JURNL_ADD_ON_MAJOR_PURCHASE_PREP'],
    upgradePaths: ['JURNL_PLUS', 'JURNL_PRO', 'JURNL_BUSINESS'],
    downgradeBehavior: null,
    eligibility: ['ANY_ACCOUNT'],
    businessEligibility: false,
    accountScopes: ['INDIVIDUAL'],
  },
  {
    ...base,
    planId: 'JURNL_PLUS',
    planName: 'JURNL PLUS',
    tierLabel: 'PLUS',
    planClass: 'CONSUMER_PAID',
    audience: 'CONSUMER',
    rank: 1,
    includes: ['JURNL_FREE'],
    capabilities: ['ADVANCED_SAFE_TO_SPEND', 'ADVANCED_SCENARIOS', 'ADVANCED_AUTOMATION', 'ADVANCED_DEBT_STRATEGY', 'RECORDS_ADVANCED', 'AI_PLANNING_GUIDANCE'],
    limits: [
      { capability: 'AI_EXPLAIN_BASIC', limitType: 'REQUESTS', period: 'PER_MONTH', tier: 'HIGHER', amount: null },
      { capability: 'AI_PLANNING_GUIDANCE', limitType: 'REQUESTS', period: 'PER_MONTH', tier: 'LIMITED', amount: null },
    ],
    addOns: ['JURNL_ADD_ON_TRAVEL', 'JURNL_ADD_ON_PREMIUM_CREDIT', 'JURNL_ADD_ON_MAJOR_PURCHASE_PREP'],
    upgradePaths: ['JURNL_PRO'],
    downgradeBehavior: { toPlan: 'JURNL_FREE', userData: 'RETAIN', premiumOutputs: 'TBD' },
    eligibility: ['ANY_ACCOUNT'],
    businessEligibility: false,
    accountScopes: ['INDIVIDUAL'],
  },
  {
    ...base,
    planId: 'JURNL_PRO',
    planName: 'JURNL PRO',
    tierLabel: 'PRO',
    planClass: 'CONSUMER_PAID',
    audience: 'CONSUMER',
    rank: 2,
    includes: ['JURNL_PLUS'],
    capabilities: ['ADVANCED_FORECASTING', 'ADVANCED_PURCHASE_ANALYSIS', 'ADVANCED_CREDIT_PLANNING', 'AI_MULTI_SCENARIO_ANALYSIS', 'AI_HIGHER_USAGE'],
    limits: [
      { capability: 'AI_PLANNING_GUIDANCE', limitType: 'REQUESTS', period: 'PER_MONTH', tier: 'HIGHER', amount: null },
      { capability: 'AI_MULTI_SCENARIO_ANALYSIS', limitType: 'RUNS', period: 'PER_BILLING_PERIOD', tier: 'HIGHER', amount: null },
    ],
    addOns: ['JURNL_ADD_ON_TRAVEL', 'JURNL_ADD_ON_PREMIUM_CREDIT'],
    upgradePaths: [],
    downgradeBehavior: { toPlan: 'JURNL_PLUS', userData: 'RETAIN', premiumOutputs: 'TBD' },
    eligibility: ['ANY_ACCOUNT'],
    businessEligibility: false,
    accountScopes: ['INDIVIDUAL'],
  },
  {
    ...base,
    planId: 'JURNL_BUSINESS',
    planName: 'JURNL BUSINESS',
    tierLabel: 'BUSINESS',
    planClass: 'BUSINESS',
    audience: 'BUSINESS',
    rank: 0,
    // Business keeps personal core organization; it does NOT inherit consumer PLUS / PRO capabilities.
    includes: ['JURNL_FREE'],
    capabilities: [
      'BUSINESS_RECEIPTS',
      'BUSINESS_MILEAGE',
      'BUSINESS_CATEGORIZATION',
      'BUSINESS_PNL',
      'BUSINESS_CASH_FLOW',
      'BUSINESS_TAX_PREP',
      'BUSINESS_ACCOUNTANT_EXPORT',
      'BUSINESS_FORECASTING',
      'RECORDS_ADVANCED',
      'AI_BUSINESS_ANALYSIS',
    ],
    limits: [{ capability: 'AI_BUSINESS_ANALYSIS', limitType: 'REQUESTS', period: 'PER_MONTH', tier: 'LIMITED', amount: null }],
    addOns: ['JURNL_ADD_ON_BUSINESS_TAX'],
    upgradePaths: [],
    downgradeBehavior: { toPlan: 'JURNL_FREE', userData: 'RETAIN', premiumOutputs: 'TBD', notes: 'BUSINESS RECORDS MUST REMAIN EXPORTABLE AFTER DOWNGRADE.' },
    eligibility: ['BUSINESS_ACCOUNT'],
    businessEligibility: true,
    accountScopes: ['BUSINESS'],
  },
  {
    ...base,
    planId: 'JURNL_ADD_ON',
    planName: 'JURNL ADD-ON',
    tierLabel: 'ADD_ON',
    planClass: 'ADD_ON',
    audience: 'CONSUMER',
    baseSubscribable: false,
    rank: 0,
    includes: [],
    capabilities: [],
    limits: [],
    addOns: [],
    upgradePaths: [],
    downgradeBehavior: null,
    eligibility: ['HAS_ELIGIBLE_BASE_PLAN'],
    businessEligibility: false,
    accountScopes: ['INDIVIDUAL', 'BUSINESS'],
  },
];
