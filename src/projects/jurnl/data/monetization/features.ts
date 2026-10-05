/**
 * Feature-level entitlement metadata (DRAFT) — what the DESIGN workspace can inspect per feature:
 * access class · capability · paywall (NONE / SOFT / HARD) · upgrade surface. Feature-level gating, not locked families.
 * HARD paywalls are reserved for server-enforced paid data (business records) — never for core or safety features.
 */

import type { FeatureEntitlement } from '../../../../../shared/site00-monetization/contract.js';

const f = (familyId: string, featureId: string, label: string, access: FeatureEntitlement['access'], capability: string | null, paywall: FeatureEntitlement['paywall'], upgradeSurface: string | null = null): FeatureEntitlement => ({
  familyId,
  featureId,
  label,
  access,
  capability,
  paywall,
  upgradeSurface,
  status: 'DRAFT',
});

export const JURNL_FEATURE_ENTITLEMENTS: readonly FeatureEntitlement[] = [
  f('F01', 'F01.ENTRY', 'ENTRY — ALL SCREENS', 'FULL', 'CORE_ACCOUNT_SECURITY', 'NONE'),
  f('F01', 'F01.PRIVACY.DATA', 'EXPORT / DELETE YOUR DATA', 'FULL', 'CORE_PERSONAL_DATA_CONTROL', 'NONE'),
  f('F03', 'F03.ASK.EXPLAIN', 'ASK JURNL — EXPLANATIONS', 'FULL', 'AI_EXPLAIN_BASIC', 'NONE'),
  f('F03', 'F03.ASK.GUIDANCE', 'ASK JURNL — PLANNING GUIDANCE', 'LIMITED', 'AI_PLANNING_GUIDANCE', 'SOFT', 'JURNL_UPGRADE_PANEL'),
  f('F08', 'F08.SCENARIOS', 'SCENARIO COMPARISONS', 'PREVIEW', 'ADVANCED_SCENARIOS', 'SOFT', 'JURNL_FEATURE_PREVIEW'),
  f('F09', 'F09.NUMBER', 'SAFE TO SPEND', 'FULL', 'CORE_SAFE_TO_SPEND', 'NONE'),
  f('F09', 'F09.PROJECTIONS', 'ADVANCED PROJECTIONS', 'LIMITED', 'ADVANCED_SAFE_TO_SPEND', 'SOFT', 'JURNL_UPGRADE_PANEL'),
  f('F10', 'F10.VERDICT', 'CAN I BUY IT? VERDICT', 'FULL', 'CORE_PURCHASE_CHECK', 'NONE'),
  f('F10', 'F10.IMPACT_90D', '90-DAY PURCHASE IMPACT', 'PREVIEW', 'ADVANCED_PURCHASE_ANALYSIS', 'SOFT', 'JURNL_FEATURE_PREVIEW'),
  f('F11', 'F11.SCENARIOS', 'TRIP SCENARIO COMPARISON', 'ADD_ON_REQUIRED', 'ADVANCED_TRIP_PLANNING', 'SOFT', 'JURNL_ADD_ON_OFFER'),
  f('F12', 'F12.STRATEGY', 'CREDIT STRATEGY', 'PREVIEW', 'ADVANCED_CREDIT_PLANNING', 'SOFT', 'JURNL_FEATURE_PREVIEW'),
  f('F13', 'F13.STRATEGY', 'ADVANCED PAYOFF STRATEGY', 'PREVIEW', 'ADVANCED_DEBT_STRATEGY', 'SOFT', 'JURNL_FEATURE_PREVIEW'),
  f('F15', 'F15.BASIC', 'BASIC FORECAST', 'FULL', 'CORE_BASIC_FORECAST', 'NONE'),
  f('F15', 'F15.ADVANCED', 'ADVANCED FORECAST', 'PREVIEW', 'ADVANCED_FORECASTING', 'SOFT', 'JURNL_UPGRADE_PANEL'),
  f('F16', 'F16.PNL', 'PROFIT + LOSS', 'BUSINESS_ONLY', 'BUSINESS_PNL', 'HARD', 'JURNL_UPGRADE_PANEL'),
  f('F16', 'F16.ACCOUNTANT_EXPORT', 'ACCOUNTANT EXPORT', 'BUSINESS_ONLY', 'BUSINESS_ACCOUNTANT_EXPORT', 'HARD', 'JURNL_UPGRADE_PANEL'),
  f('F16', 'F16.TAX_ADVANCED', 'ADVANCED BUSINESS TAX', 'ADD_ON_REQUIRED', 'BUSINESS_TAX_ADVANCED', 'SOFT', 'JURNL_ADD_ON_OFFER'),
];
