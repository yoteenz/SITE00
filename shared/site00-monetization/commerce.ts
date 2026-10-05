/**
 * Commerce, affiliate and referral boundaries — disclosure-aware, verdict-independent.
 *
 *  1. Financial verdicts (affordability, safe-to-spend, payoff order …) never see compensation data.
 *  2. Merchant / affiliate options appear only AFTER the verdict and only if the person chooses to shop.
 *  3. Affiliate links and sponsored placements are always disclosed; editorial recommendations never carry hidden
 *     compensation; ranking ignores compensation (no pay-to-rank); sponsored placements never mix into the ranking.
 */

import type { MonetizedPlacementKind, ReferralType } from './contract.js';

export type CommissionType = 'NONE' | 'CPA' | 'REV_SHARE' | 'FLAT' | 'TBD';

/** One option a product may show next to (never inside) a financial verdict. */
export type MonetizedPlacement = {
  placementId: string;
  kind: MonetizedPlacementKind;
  partnerType: 'TRAVEL' | 'COMMERCE' | 'FINANCIAL_SERVICE';
  affiliateProvider: string | null;
  merchant: string | null;
  offerId: string | null;
  commissionType: CommissionType;
  disclosureRequired: boolean;
  bookingUrl: string | null;
  trackingId: string | null;
  /** Must always be true: the recommendation exists regardless of compensation. */
  recommendationIndependent: true;
  /** Relevance computed from the person's own criteria only. */
  editorialScore: number;
};

export function validatePlacement(p: MonetizedPlacement): string[] {
  const errors: string[] = [];
  if (p.recommendationIndependent !== true) errors.push('RECOMMENDATION_NOT_INDEPENDENT');
  if ((p.kind === 'AFFILIATE_LINK' || p.kind === 'SPONSORED_PLACEMENT') && !p.disclosureRequired) errors.push('DISCLOSURE_REQUIRED');
  if (p.kind === 'EDITORIAL_RECOMMENDATION' && p.commissionType !== 'NONE') errors.push('HIDDEN_COMPENSATION_ON_EDITORIAL');
  if (p.kind !== 'EDITORIAL_RECOMMENDATION' && p.commissionType === 'NONE') errors.push('MONETIZED_KIND_WITHOUT_COMPENSATION_RECORD');
  return errors;
}

/**
 * Ranking ignores compensation entirely. Editorial + affiliate options rank by editorial score (affiliate ones keep
 * their disclosure); sponsored placements are returned separately and must be labeled — never interleaved.
 */
export function orderPlacements(placements: MonetizedPlacement[]): { ranked: MonetizedPlacement[]; sponsored: MonetizedPlacement[] } {
  const byScore = (a: MonetizedPlacement, b: MonetizedPlacement) => b.editorialScore - a.editorialScore || a.placementId.localeCompare(b.placementId);
  return {
    ranked: placements.filter((p) => p.kind !== 'SPONSORED_PLACEMENT').sort(byScore),
    sponsored: placements.filter((p) => p.kind === 'SPONSORED_PLACEMENT').sort(byScore),
  };
}

/** Verdict first → the person chooses to shop → merchant options. */
export const merchantOptionsAllowed = (flow: { verdictReached: boolean; userChoseToShop: boolean }) => flow.verdictReached && flow.userChoseToShop;

const COMPENSATION_KEYS = /commission|affiliate|sponsor|payout|bounty|referral_?fee|partner_?rate|tracking_?id|offer_?id/i;
/**
 * Guard for any financial-verdict engine input: compensation-shaped fields are rejected outright, so commercial
 * incentives cannot reach the verdict even by accident.
 */
export function assertVerdictInputIndependent(input: Record<string, unknown>, path = 'input'): void {
  for (const [k, v] of Object.entries(input)) {
    if (COMPENSATION_KEYS.test(k)) throw new Error(`${path}.${k}: compensation data cannot enter a financial verdict`);
    if (v && typeof v === 'object' && !Array.isArray(v)) assertVerdictInputIndependent(v as Record<string, unknown>, `${path}.${k}`);
  }
}

/** Disclosure-aware referral contract (financial services, travel, commerce). */
export type ReferralOffer = {
  referralType: ReferralType;
  status: 'DISABLED' | 'ENABLED';
  placement: MonetizedPlacementKind;
  partnerId: string | null;
  /** Regulated categories (credit, insurance, mortgage …) need compliance review before enabling. */
  regulatedCategory: boolean;
  disclosure: { required: true; text: string | null };
  recommendationIndependent: true;
};

export const REGULATED_REFERRALS: readonly ReferralType[] = ['HYSA', 'CREDIT_CARD', 'INSURANCE', 'MORTGAGE', 'REFINANCING', 'TRAVEL_INSURANCE'];
