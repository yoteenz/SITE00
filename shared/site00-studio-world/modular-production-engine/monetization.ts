/**
 * Client marketing monetization — allowances, billable expansions, reuse economics.
 */

import type { AssetScopeTier } from './libraryTypes.js';

export const GENERATION_ECONOMICS = ['REUSE_EXISTING', 'RESKIN_EXISTING', 'CUSTOMIZE_EXISTING', 'GENERATE_NET_NEW'] as const;
export type GenerationEconomics = (typeof GENERATION_ECONOMICS)[number];

export const BILLABLE_EXPANSION_TYPES = [
  'EXTRA_CHARACTER_CAST',
  'EXTRA_ENVIRONMENT',
  'CUSTOM_WARDROBE',
  'CUSTOM_PROP_SIGNAGE',
  'PREMIUM_RESKIN',
  'CLIENT_EXCLUSIVE_ACTOR',
  'CLIENT_EXCLUSIVE_ENVIRONMENT',
  'ADDITIONAL_GENERATIONS',
  'ADDITIONAL_REVISIONS',
] as const;

export type BillableExpansionType = (typeof BILLABLE_EXPANSION_TYPES)[number];

export type MonthlyAllowanceEntitlement = {
  characterCastsPerMonth: number;
  environmentOrSetAdaptationsPerMonth: number;
  unlimitedApprovedSharedReuse: boolean;
  reskinsIncludedPerMonth: number;
};

export type ClientUsageLedger = {
  clientId: string;
  billingPeriod: string;
  allowance: MonthlyAllowanceEntitlement;
  usedCharacterCasts: number;
  usedEnvironmentAdaptations: number;
  usedReskins: number;
  billableExpansions: readonly { type: BillableExpansionType; quantity: number; at: string }[];
};

export type PricingTierHint = 'LOWEST' | 'MID' | 'PREMIUM' | 'EXCLUSIVE_PREMIUM';

const ECONOMICS_PRICING: Record<GenerationEconomics, PricingTierHint> = {
  REUSE_EXISTING: 'LOWEST',
  RESKIN_EXISTING: 'MID',
  CUSTOMIZE_EXISTING: 'MID',
  GENERATE_NET_NEW: 'PREMIUM',
};

export function pricingTierForEconomics(mode: GenerationEconomics): PricingTierHint {
  return ECONOMICS_PRICING[mode];
}

export function pricingTierForScope(scope: AssetScopeTier): PricingTierHint {
  switch (scope) {
    case 'SHARED_LIBRARY':
      return 'LOWEST';
    case 'CLIENT_PRIVATE':
      return 'MID';
    case 'PREMIUM_EXCLUSIVE':
      return 'EXCLUSIVE_PREMIUM';
    case 'FOUNDER_INTERNAL_ONLY':
      return 'PREMIUM';
    default:
      return 'MID';
  }
}

export function canUseAssetWithinAllowance(
  ledger: ClientUsageLedger,
  economics: GenerationEconomics,
  expansion?: BillableExpansionType,
): { allowed: boolean; reason: string; requiresBillable: boolean } {
  if (economics === 'REUSE_EXISTING' && ledger.allowance.unlimitedApprovedSharedReuse) {
    return { allowed: true, reason: 'Shared approved reuse within tier', requiresBillable: false };
  }
  if (economics === 'RESKIN_EXISTING' && ledger.usedReskins < ledger.allowance.reskinsIncludedPerMonth) {
    return { allowed: true, reason: 'Included reskin allowance', requiresBillable: false };
  }
  if (economics === 'GENERATE_NET_NEW') {
    if (expansion === 'EXTRA_CHARACTER_CAST' && ledger.usedCharacterCasts < ledger.allowance.characterCastsPerMonth) {
      return { allowed: true, reason: 'Included character cast slot', requiresBillable: false };
    }
    if (
      expansion === 'EXTRA_ENVIRONMENT' &&
      ledger.usedEnvironmentAdaptations < ledger.allowance.environmentOrSetAdaptationsPerMonth
    ) {
      return { allowed: true, reason: 'Included environment adaptation slot', requiresBillable: false };
    }
    return { allowed: true, reason: 'Requires billable expansion', requiresBillable: true };
  }
  return { allowed: true, reason: 'Billable or approved path', requiresBillable: economics !== 'REUSE_EXISTING' };
}
