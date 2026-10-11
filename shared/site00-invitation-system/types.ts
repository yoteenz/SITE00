import type { INVITATION_SYSTEM_VERSION } from './version.js';

export type InvitationSystemVersion = typeof INVITATION_SYSTEM_VERSION;

export type PartnerStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'TERMINATED';

export type ReferralPartner = {
  partner_id: string;
  partner_number: string;
  display_id: string;
  legal_name: string;
  status: PartnerStatus;
  agreement_version: string | null;
  reporting_scope: 'SELF_ONLY';
  created_at: string;
  updated_at: string;
};

export type InvitationType = 'SHARED_OFFICE' | 'PERSONALIZED';

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'REVOKED' | 'RETIRED';

export type InvitationCampaign = {
  campaign_id: string;
  partner_id: string;
  collection_label: string;
  channel: string;
  placement: string;
  audience: string;
  primary_service: string;
  secondary_expansion: string;
  invitation_type: InvitationType;
  status: CampaignStatus;
  attribution_policy_version: string;
  commission_rule_version: string;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InvitationBatch = {
  batch_id: string;
  campaign_id: string;
  batch_label: string;
  card_edition: string;
  print_status: 'NOT_PRINTED' | 'PROOF' | 'PRINTED' | 'DISTRIBUTED' | 'RETIRED';
  distribution_location: string | null;
  optional_inventory_count: number | null;
  created_at: string;
};

export type InvitationCodeStatus = 'ACTIVE' | 'PAUSED' | 'REVOKED' | 'EXPIRED';

export type InvitationCode = {
  invitation_code_id: string;
  campaign_id: string;
  batch_id: string | null;
  code: string;
  invitation_type: InvitationType;
  status: InvitationCodeStatus;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

export type VisitTrafficClass = 'HUMAN' | 'PREVIEW' | 'BOT' | 'UNKNOWN';

export type InvitationVisit = {
  visit_id: string;
  invitation_code_id: string;
  campaign_id: string;
  partner_id: string;
  anonymous_visit_key: string;
  traffic_class: VisitTrafficClass;
  user_agent: string | null;
  referrer: string | null;
  dedupe_bucket: string;
  is_repeat_in_bucket: boolean;
  occurred_at: string;
};

export type ActivationStatus =
  | 'STARTED'
  | 'IDENTITY_PENDING'
  | 'IDENTITY_VERIFIED'
  | 'FOUNDATION_LINKED'
  | 'ABANDONED'
  | 'BLOCKED';

export type InvitationActivation = {
  activation_id: string;
  visit_id: string;
  invitation_code_id: string;
  campaign_id: string;
  partner_id: string;
  status: ActivationStatus;
  contact_email: string | null;
  verified_client_id: string | null;
  foundation_artifact_id: string | null;
  foundation_public_token: string | null;
  activation_secret_hash: string | null;
  policy_version: string;
  created_at: string;
  updated_at: string;
  identity_verified_at: string | null;
};

export type ClientAcquisitionAttribution = {
  attribution_id: string;
  partner_id: string;
  campaign_id: string;
  invitation_code_id: string;
  activation_id: string;
  client_id: string | null;
  foundation_artifact_id: string | null;
  foundation_project_id: string | null;
  bldr_project_id: string | null;
  policy_version: string;
  eligibility: 'CANDIDATE' | 'DISQUALIFIED';
  disqualification_reason: string | null;
  captured_at: string;
};

export type ReferralBusinessEventType =
  | 'INVITATION_SCANNED'
  | 'INVITATION_VIEWED'
  | 'INVITATION_ACTIVATED'
  | 'CLIENT_IDENTITY_VERIFIED'
  | 'FOUNDATION_STARTED'
  | 'FOUNDATION_PURCHASED'
  | 'FOUNDATION_COMPLETED'
  | 'BLDR_EXPLORED'
  | 'BLDR_PROPOSAL_CREATED'
  | 'BLDR_CONTRACT_ACCEPTED'
  | 'BLDR_PAYMENT_RECEIVED'
  | 'REFERRAL_QUALIFIED'
  | 'COMMISSION_APPROVED'
  | 'COMMISSION_PAYABLE'
  | 'COMMISSION_PAID'
  | 'COMMISSION_REVERSED';

export type ReferralBusinessEvent = {
  event_id: string;
  event_type: ReferralBusinessEventType;
  occurred_at: string;
  received_at: string;
  partner_id: string | null;
  campaign_id: string | null;
  invitation_code_id: string | null;
  activation_id: string | null;
  client_id: string | null;
  foundation_artifact_id: string | null;
  bldr_project_id: string | null;
  source_system: string;
  source_transaction_id: string | null;
  correlation_id: string;
  policy_version: string;
  idempotency_key: string;
  payload: Record<string, unknown>;
};

export type CommissionProduct = 'FOUNDATION' | 'BLDR';

export type CommissionEntryStatus =
  | 'CANDIDATE'
  | 'PENDING'
  | 'QUALIFIED'
  | 'APPROVED'
  | 'PAYABLE'
  | 'PAID'
  | 'REVERSED'
  | 'DISQUALIFIED';

export type PartnerCommissionEntry = {
  commission_entry_id: string;
  partner_id: string;
  referred_client_ref: string;
  product: CommissionProduct;
  qualifying_order_id: string | null;
  qualifying_payment_id: string | null;
  agreement_version: string;
  commission_rule_version: string;
  rate_basis_points: number | null;
  fixed_reward_minor: number | null;
  currency: string;
  eligible_amount_minor: number;
  calculated_reward_minor: number;
  status: CommissionEntryStatus;
  payout_batch_id: string | null;
  attribution_id: string;
  created_at: string;
  updated_at: string;
};

export type CommissionAdjustment = {
  adjustment_id: string;
  commission_entry_id: string;
  reason: string;
  delta_minor: number;
  created_at: string;
  actor: string;
};
