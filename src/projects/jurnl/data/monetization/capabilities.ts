/**
 * JURNL CAPABILITY REGISTRY — semantic capabilities mapped to the canonical product tree (F01–F16).
 * Feature code asks `hasCapability('ADVANCED_FORECASTING')`, never "is this PRO?".
 *
 * SERVER_ENFORCED = paid data or compute (the trusted backend authorizes). Safety-floor capabilities are never
 * removed by plan, downgrade or failure. Commerce / referral surfaces are DISABLED until founder-enabled.
 */

import type { CapabilityDefinition } from '../../../../../shared/site00-monetization/contract.js';

const core = (id: string, label: string, families: string[], extra: Partial<CapabilityDefinition> = {}): CapabilityDefinition => ({
  id,
  label,
  domain: 'CORE',
  kind: 'FEATURE',
  enforcement: 'CLIENT_PRESENTATION',
  families,
  ...extra,
});
const adv = (id: string, label: string, families: string[], kind: CapabilityDefinition['kind'] = 'ANALYSIS'): CapabilityDefinition => ({
  id,
  label,
  domain: 'ADVANCED',
  kind,
  enforcement: 'SERVER_ENFORCED',
  families,
});
const ai = (id: string, label: string, extra: Partial<CapabilityDefinition> = {}): CapabilityDefinition => ({
  id,
  label,
  domain: 'AI',
  kind: 'COMPUTE',
  enforcement: 'SERVER_ENFORCED',
  families: ['F03', 'F05', 'F08', 'F09', 'F10', 'F11', 'F12', 'F13', 'F15', 'F16'],
  ...extra,
});
const biz = (id: string, label: string, families: string[], kind: CapabilityDefinition['kind'] = 'FEATURE'): CapabilityDefinition => ({
  id,
  label,
  domain: 'BUSINESS',
  kind,
  enforcement: 'SERVER_ENFORCED',
  families,
});

export const JURNL_CAPABILITIES: readonly CapabilityDefinition[] = [
  // ── CORE (free-candidate foundations; user rights and safety are floors) ──
  core('CORE_ACCOUNT_SECURITY', 'ACCOUNT, SIGN IN, SECURITY + PRIVACY CONTROLS', ['F01'], { safetyFloor: true, notes: 'ENTRY IS NEVER MONETIZED.' }),
  core('CORE_PERSONAL_DATA_CONTROL', 'EXPORT, REMOVE ACCESS OR DELETE YOUR OWN DATA', ['F01', 'F16'], { kind: 'DATA_EXPORT', safetyFloor: true, notes: 'A USER RIGHT — NEVER PAYWALLED.' }),
  core('CORE_GUIDED_SETUP', 'GUIDED SETUP', ['F02']),
  core('CORE_TODAY_OVERVIEW', 'TODAY OVERVIEW', ['F03']),
  core('CORE_TRANSACTION_TRACKING', 'TRANSACTION TRACKING', ['F04']),
  core('CORE_ACCOUNT_OVERVIEW', 'ACCOUNT OVERVIEW', ['F05']),
  core('CORE_INCOME_TRACKING', 'INCOME TRACKING', ['F06']),
  core('CORE_UPCOMING_BILLS', 'UPCOMING BILLS + PAYMENTS', ['F07']),
  core('CORE_BASIC_BUDGETING', 'BASIC BUDGETING', ['F08']),
  core('CORE_SAFE_TO_SPEND', 'SAFE TO SPEND', ['F09', 'F03']),
  core('CORE_PURCHASE_CHECK', 'CAN I BUY IT? VERDICT', ['F10'], { notes: 'FINANCIALLY INDEPENDENT VERDICT — NEVER INFLUENCED BY COMMERCE.' }),
  core('CORE_TRIP_AFFORDABILITY', 'TRIP AFFORDABILITY', ['F11']),
  core('CORE_CREDIT_OVERVIEW', 'CREDIT OVERVIEW', ['F12']),
  core('CORE_PAYDOWN_BASICS', 'PAYDOWN BASICS', ['F13']),
  core('CORE_BASIC_GOALS', 'BASIC GOALS', ['F14']),
  core('CORE_BASIC_FORECAST', 'BASIC FORECAST', ['F15']),
  core('RECORDS_BASIC', 'BASIC RECORDS', ['F16'], { domain: 'RECORDS' }),

  // ── ADVANCED (planning, automation, intelligence) ──
  adv('ADVANCED_SAFE_TO_SPEND', 'ADVANCED SAFE TO SPEND PROJECTIONS', ['F09', 'F03']),
  adv('ADVANCED_SCENARIOS', 'SCENARIO COMPARISONS', ['F08', 'F15', 'F10']),
  adv('ADVANCED_AUTOMATION', 'PLANNING AUTOMATION', ['F07', 'F08', 'F14'], 'FEATURE'),
  adv('ADVANCED_FORECASTING', 'ADVANCED FORECASTING', ['F15', 'F06']),
  adv('ADVANCED_PURCHASE_ANALYSIS', 'PURCHASE IMPACT ANALYSIS', ['F10']),
  adv('ADVANCED_TRIP_PLANNING', 'ADVANCED TRIP PLANNING', ['F11']),
  adv('ADVANCED_DEBT_STRATEGY', 'ADVANCED PAYOFF STRATEGY', ['F13']),
  adv('ADVANCED_CREDIT_PLANNING', 'CREDIT STRATEGY', ['F12']),
  { ...adv('RECORDS_ADVANCED', 'ADVANCED RECORDS', ['F16'], 'FEATURE'), domain: 'RECORDS' },

  // ── ASK JURNL (depth / compute; basic explanation is a floor) ──
  ai('AI_EXPLAIN_BASIC', 'ASK JURNL — EXPLANATIONS', { safetyFloor: true, notes: 'BASIC SAFETY + EXPLANATION IS NEVER DEGRADED TO FORCE UPGRADES.' }),
  ai('AI_PLANNING_GUIDANCE', 'ASK JURNL — PLANNING + GUIDANCE'),
  ai('AI_MULTI_SCENARIO_ANALYSIS', 'ASK JURNL — MULTI-SCENARIO ANALYSIS'),
  ai('AI_BUSINESS_ANALYSIS', 'ASK JURNL — BUSINESS ANALYSIS', { families: ['F05', 'F15', 'F16'] }),
  ai('AI_HIGHER_USAGE', 'ASK JURNL — HIGHER USAGE'),

  // ── BUSINESS (own plan class — not consumer PRO) ──
  biz('BUSINESS_RECEIPTS', 'RECEIPT CAPTURE', ['F16']),
  biz('BUSINESS_MILEAGE', 'MILEAGE', ['F16']),
  biz('BUSINESS_CATEGORIZATION', 'BUSINESS CATEGORIZATION', ['F04', 'F16']),
  biz('BUSINESS_PNL', 'PROFIT + LOSS', ['F16', 'F05'], 'ANALYSIS'),
  biz('BUSINESS_CASH_FLOW', 'BUSINESS CASH FLOW', ['F05', 'F15'], 'ANALYSIS'),
  biz('BUSINESS_TAX_PREP', 'TAX PREP', ['F16']),
  biz('BUSINESS_TAX_ADVANCED', 'ADVANCED BUSINESS TAX', ['F16'], 'ANALYSIS'),
  biz('BUSINESS_ACCOUNTANT_EXPORT', 'ACCOUNTANT EXPORT', ['F16'], 'DATA_EXPORT'),
  biz('BUSINESS_FORECASTING', 'BUSINESS FORECASTING', ['F15'], 'ANALYSIS'),

  // ── COMMERCE + REFERRALS (revenue surfaces, disclosed, OFF until enabled) ──
  { id: 'COMMERCE_PRICE_COMPARISON', label: 'PRICE COMPARISON', domain: 'COMMERCE', kind: 'COMMERCE', enforcement: 'CLIENT_PRESENTATION', families: ['F10'], surfaceStatus: 'DISABLED', notes: 'ONLY AFTER THE VERDICT AND ONLY IF THE PERSON CHOOSES TO SHOP.' },
  { id: 'COMMERCE_MERCHANT_OPTIONS', label: 'MERCHANT OPTIONS', domain: 'COMMERCE', kind: 'COMMERCE', enforcement: 'CLIENT_PRESENTATION', families: ['F10'], surfaceStatus: 'DISABLED' },
  { id: 'TRAVEL_BOOKING_REFERRALS', label: 'TRAVEL BOOKING OPTIONS', domain: 'REFERRAL', kind: 'REFERRAL', enforcement: 'CLIENT_PRESENTATION', families: ['F11'], surfaceStatus: 'DISABLED' },
  { id: 'FINANCIAL_SERVICE_REFERRALS', label: 'FINANCIAL SERVICE OPTIONS', domain: 'REFERRAL', kind: 'REFERRAL', enforcement: 'CLIENT_PRESENTATION', families: ['F05', 'F12', 'F13', 'F16'], surfaceStatus: 'DISABLED' },
];

export type JurnlCapabilityId = string;
export const JURNL_CAPABILITY_IDS = JURNL_CAPABILITIES.map((c) => c.id);
