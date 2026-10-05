/**
 * Identity commercial — explicit founder decision blocks (no guessed policy).
 */

import { COMMERCIAL_FOUNDER_DECISIONS } from '../site00-commercial-canon/founderDecisions.js';
import type { IdentityCommercialSelection } from './types.js';
export const IDENTITY_TIER_PURCHASE_DECISION_ID = 'FD-IDNTY-TIER-PURCHASE' as const;

export function getIdentityTierPurchaseFounderDecision() {
  return COMMERCIAL_FOUNDER_DECISIONS.find((d) => d.decisionId === IDENTITY_TIER_PURCHASE_DECISION_ID) ?? null;
}

/** Tier SKUs remain quote/display until FD-IDNTY-TIER-PURCHASE is resolved. */
export function identityTierPurchaseBlockedByFounderDecision(
  selection: IdentityCommercialSelection,
): typeof IDENTITY_TIER_PURCHASE_DECISION_ID | null {
  if (selection.serviceId === 'idnty-investment-tiers') {
    return IDENTITY_TIER_PURCHASE_DECISION_ID;
  }
  return null;
}

export function identityFounderDecisionReceipt(): {
  decisionId: string;
  question: string;
  affectedServiceId: string;
  affectedPackageId: string | null;
  whyBlocksFullWiring: string;
  recommendedOptions: string;
} | null {
  const d = getIdentityTierPurchaseFounderDecision();
  if (!d) return null;
  return {
    decisionId: d.decisionId,
    question: d.question,
    affectedServiceId: d.serviceId,
    affectedPackageId: d.packageId,
    whyBlocksFullWiring: d.whyRequired,
    recommendedOptions: d.recommendedDecisionType,
  };
}
