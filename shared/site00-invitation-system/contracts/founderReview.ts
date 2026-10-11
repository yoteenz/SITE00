import type { InvitationCampaign, ReferralPartner } from '../types.js';

export type FounderInvitationReviewSnapshot = {
  invitation_system_version: string;
  partners: ReferralPartner[];
  campaigns: InvitationCampaign[];
  attribution_policy_version: string;
  commission_rule_version: string;
  commission_rates_approved: false;
  public_activation: false;
  live_payouts: false;
  pending_commission_liability_minor: number;
};
