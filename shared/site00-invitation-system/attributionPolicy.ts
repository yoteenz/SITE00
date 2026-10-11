/** Versioned attribution rules — commercial precedence requires founder approval. */
export const ATTRIBUTION_POLICY_VERSION = '1.0.0-draft';

export type AttributionPolicy = {
  version: typeof ATTRIBUTION_POLICY_VERSION;
  approval_status: 'PENDING_FOUNDER';
  capture_on: 'VERIFIED_ACTIVATION';
  attribution_window_days: number;
  repeat_visit_handling: 'EXTEND_SESSION' | 'IGNORE_DUPLICATE_LEAD';
  existing_client_handling: 'PRESERVE_PRIOR' | 'RECORD_ASSISTED';
  multi_partner_collision: 'MANUAL_REVIEW';
  self_referral: 'DISQUALIFY';
  scan_is_not_attribution: true;
  unpaid_is_not_commission: true;
};

export const defaultAttributionPolicy = (): AttributionPolicy => ({
  version: ATTRIBUTION_POLICY_VERSION,
  approval_status: 'PENDING_FOUNDER',
  capture_on: 'VERIFIED_ACTIVATION',
  attribution_window_days: 90,
  repeat_visit_handling: 'EXTEND_SESSION',
  existing_client_handling: 'PRESERVE_PRIOR',
  multi_partner_collision: 'MANUAL_REVIEW',
  self_referral: 'DISQUALIFY',
  scan_is_not_attribution: true,
  unpaid_is_not_commission: true,
});
