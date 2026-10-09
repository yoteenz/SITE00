/** Partner-safe reporting (aggregate + scoped referral rows). */
export type PartnerReportingWindow = {
  partner_id: string;
  display_id: string;
  from: string;
  to: string;
};

export type PartnerReportingSummary = {
  window: PartnerReportingWindow;
  totals: {
    invitation_visits: number;
    unique_visit_buckets: number;
    verified_activations: number;
    foundation_starts: number;
    foundation_purchases: number;
    foundation_completions: number;
    bldr_leads: number;
    bldr_signed_projects: number;
  };
  commissions: {
    eligible_minor: number;
    pending_minor: number;
    approved_minor: number;
    paid_minor: number;
    reversed_minor: number;
    currency: string;
    payout_live: false;
  };
  campaign_performance: Array<{
    campaign_id: string;
    collection_label: string;
    visits: number;
    activations: number;
    foundation_purchases: number;
  }>;
};
