/** Draft commission configuration — amounts are placeholders until founder commercial approval. */
export const COMMISSION_RULE_VERSION = '1.0.0-unapproved';

export type CommissionRuleDraft = {
  version: typeof COMMISSION_RULE_VERSION;
  approval_status: 'UNAPPROVED';
  foundation: {
    product: 'FOUNDATION';
    reward_kind: 'FIXED_MINOR';
    /** Illustrative only — not a locked commercial rate. */
    draft_fixed_reward_minor: null;
    currency: 'USD';
  };
  bldr: {
    product: 'BLDR';
    reward_kind: 'PERCENT_OF_QUALIFYING_PAYMENTS';
    /** Illustrative only — not a locked commercial rate. */
    draft_basis_points: null;
    currency: 'USD';
    installment_eligible: true;
  };
  payout_live: false;
};

export const defaultCommissionRules = (): CommissionRuleDraft => ({
  version: COMMISSION_RULE_VERSION,
  approval_status: 'UNAPPROVED',
  foundation: {
    product: 'FOUNDATION',
    reward_kind: 'FIXED_MINOR',
    draft_fixed_reward_minor: null,
    currency: 'USD',
  },
  bldr: {
    product: 'BLDR',
    reward_kind: 'PERCENT_OF_QUALIFYING_PAYMENTS',
    draft_basis_points: null,
    currency: 'USD',
    installment_eligible: true,
  },
  payout_live: false,
});
