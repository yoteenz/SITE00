/** SITE 00 — IDNTY — Digital Foundation Artifact V1 (canonical types). */

export const DIGITAL_FOUNDATION_SERVICE_ID = 'IDNTY.DIGITAL_FOUNDATION' as const;

export type DigitalFoundationArtifactState =
  | 'INVITED'
  | 'OPENED'
  | 'INTAKE_IN_PROGRESS'
  | 'INTAKE_COMPLETE'
  | 'RECOMMENDATION_READY'
  | 'QUOTE_READY'
  | 'AWAITING_ACCEPTANCE'
  | 'AWAITING_PAYMENT'
  | 'PAID'
  | 'PROJECT_ACTIVE'
  | 'IN_PROGRESS'
  | 'WAITING_ON_CLIENT'
  | 'WAITING_ON_PROVIDER'
  | 'FINAL_VERIFICATION'
  | 'COMPLETE'
  | 'BUILD_OPPORTUNITY'
  | 'ARCHIVED';

export type DigitalFoundationIntakeState = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE';

export type DigitalFoundationPaymentState =
  | 'NONE'
  | 'CHECKOUT_PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'DISPUTED';

export type DigitalFoundationProjectState =
  | 'NOT_STARTED'
  | 'ACTIVE'
  | 'WAITING_ON_CLIENT'
  | 'WAITING_ON_PROVIDER'
  | 'FINAL_VERIFICATION'
  | 'COMPLETE';

export type DigitalFoundationCompletionState = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE';

export type DigitalFoundationQuoteStatus =
  | 'DRAFT'
  | 'READY'
  | 'CLIENT_REVIEW'
  | 'ACCEPTED'
  | 'SUPERSEDED'
  | 'EXPIRED'
  | 'PAID';

export type ReferralSourceKind = 'AIO' | 'SISTER_REA' | 'DIRECT' | 'CLIENT_REFERRAL' | 'SITE00' | 'CUSTOM';

export type ReferralFunnelStage =
  | 'REFERRED'
  | 'OPENED'
  | 'STARTED'
  | 'QUOTED'
  | 'ACCEPTED'
  | 'PAID'
  | 'COMPLETE'
  | 'BUILD_INTEREST'
  | 'BUILD_BOOKED';

export type FoundationBuildCreditStatus = 'AVAILABLE' | 'RESERVED' | 'APPLIED' | 'EXPIRED' | 'VOID';

export type BuildRecommendationLevel = 'SIMPLE_BUILD' | 'ADVANCED_BUILD' | 'CUSTOM_BUILD' | 'NONE';

export type BuildInterestState = 'NONE' | 'SAVED_FOR_LATER' | 'INTERESTED' | 'BOOKED';

export type DigitalFoundationAddonId =
  | 'ADDITIONAL_MAILBOX'
  | 'ADDITIONAL_DOMAIN'
  | 'DOMAIN_TRANSFER'
  | 'DOMAIN_RECOVERY'
  | 'LEGACY_EMAIL_MIGRATION'
  | 'MULTI_USER_WORKSPACE_SETUP'
  | 'ADVANCED_EMAIL_ROUTING'
  | 'STAFF_SIGNATURE_SYSTEM'
  | 'ADDITIONAL_DEVICE_SETUP'
  | 'ADVANCED_DNS_CLEANUP'
  | 'EXISTING_SITE_DOMAIN_CONFLICT'
  | 'EXPEDITED_FOUNDATION'
  | 'CUSTOM_FOUNDATION_WORK';

export type DigitalFoundationAddon = {
  addon_id: DigitalFoundationAddonId;
  label: string;
  client_description: string;
  internal_description: string;
  price_minor_units: number;
  currency: string;
  workload_modifier: number;
  timeline_modifier_business_days: number;
  requires_manual_review: boolean;
  dependencies: DigitalFoundationAddonId[];
  active: boolean;
  display_order: number;
  version: number;
  /** When set, unit price applies per quantity (e.g. mailboxes). */
  quantity_unit?: boolean;
};

export type IntakeNeedFlag =
  | 'NEED_DOMAIN'
  | 'OWN_DOMAIN'
  | 'LOST_DOMAIN'
  | 'NEED_PRO_EMAIL'
  | 'NEED_MULTI_MAILBOX'
  | 'NEED_ALIASES'
  | 'NEED_MIGRATION'
  | 'NEED_DEVICE'
  | 'NEED_SIGNATURE'
  | 'NEED_DNS_SECURITY'
  | 'HAVE_WEBSITE'
  | 'EVENTUAL_WEBSITE'
  | 'NEED_BRANDING'
  | 'UNSURE';

export type DigitalFoundationIntake = {
  business_name?: string;
  legal_business_name?: string;
  industry?: string;
  contact_name?: string;
  current_email?: string;
  phone?: string;
  existing_domain?: string;
  existing_registrar?: string;
  existing_email_provider?: string;
  team_size?: number;
  website_status?: string;
  branding_status?: string;
  future_website_interest?: string;
  needs: IntakeNeedFlag[];
};

export type QuoteLineAddon = {
  addon_id: DigitalFoundationAddonId;
  quantity: number;
  unit_price_minor: number;
  line_total_minor: number;
  requires_manual_review: boolean;
};

export type DigitalFoundationQuote = {
  quote_id: string;
  artifact_id: string;
  base_service_version: string;
  base_price_minor: number;
  selected_addons: QuoteLineAddon[];
  addon_total_minor: number;
  manual_adjustments_minor: number;
  subtotal_minor: number;
  currency: string;
  projected_min_days: number;
  projected_max_days: number;
  timeline_custom_review: boolean;
  third_party_cost_notice: string;
  quote_version: number;
  status: DigitalFoundationQuoteStatus;
  /** Founder cleared manual-review / custom pricing for checkout. */
  founder_commercial_ready?: boolean;
  founder_commercial_ready_at?: string | null;
  created_at: string;
  expires_at: string;
};

export type DigitalFoundationLead = {
  lead_id: string;
  contact_email: string | null;
  contact_name: string | null;
  business_name: string | null;
  referral_source_id: string | null;
  referral_funnel_stage: ReferralFunnelStage;
  created_at: string;
};

export type ReferralSource = {
  referral_source_id: string;
  kind: ReferralSourceKind;
  label: string;
  active: boolean;
};

export type DigitalFoundationArtifact = {
  artifact_id: string;
  public_token: string;
  lead_id: string;
  client_org_id: string | null;
  contact_id: string | null;
  referral_source_id: string | null;
  service_id: typeof DIGITAL_FOUNDATION_SERVICE_ID;
  state: DigitalFoundationArtifactState;
  intake_state: DigitalFoundationIntakeState;
  quote_id: string | null;
  payment_state: DigitalFoundationPaymentState;
  project_state: DigitalFoundationProjectState;
  completion_state: DigitalFoundationCompletionState;
  build_interest: BuildInterestState;
  build_recommendation: BuildRecommendationLevel;
  foundation_credit_id: string | null;
  intake: DigitalFoundationIntake;
  created_at: string;
  opened_at: string | null;
  last_activity_at: string;
  completed_at: string | null;
};

export type FoundationBuildCredit = {
  credit_id: string;
  artifact_id: string;
  amount_minor: number;
  currency: string;
  valid_from: string;
  expires_at: string;
  status: FoundationBuildCreditStatus;
  applicable_product_types: string[];
  applied_project_id: string | null;
  created_at: string;
};

export type ProjectStageCode =
  | '01_DETAILS_RECEIVED'
  | '02_DOMAIN'
  | '03_PROFESSIONAL_EMAIL'
  | '04_DNS_SECURITY'
  | '05_DEVICE_SIGNATURE'
  | '06_FINAL_VERIFICATION'
  | '07_FOUNDATION_COMPLETE';

export type ProjectStageStatus =
  | 'WAITING'
  | 'IN_PROGRESS'
  | 'NEEDS_CLIENT'
  | 'NEEDS_PROVIDER'
  | 'COMPLETE'
  | 'BLOCKED';

export type ProjectStageRecord = {
  stage_code: ProjectStageCode;
  status: ProjectStageStatus;
  updated_at: string;
};

export type ClientActionType =
  | 'APPROVE_DOMAIN'
  | 'PROVIDE_DOMAIN_ACCESS'
  | 'AUTHORIZE_PROVIDER'
  | 'CONFIRM_EMAIL_ADDRESS'
  | 'CHOOSE_EMAIL_ADDRESS'
  | 'CHOOSE_DOMAIN'
  | 'AUTHORIZE_DOMAIN_TRANSFER'
  | 'PROVIDE_PROVIDER_ACCESS'
  | 'CONFIRM_PRIMARY_EMAIL'
  | 'APPROVE_SIGNATURE'
  | 'APPROVE_DNS_CHANGE'
  | 'CONNECT_DEVICE'
  | 'COMPLETE_DEVICE_SETUP'
  | 'CONFIRM_RECOVERY_EMAIL'
  | 'PROVIDE_BUSINESS_DETAILS'
  | 'REVIEW_FINAL_RECORD'
  | 'CUSTOM_REQUEST';

export type ClientActionRequest = {
  request_id: string;
  artifact_id: string;
  action_type: ClientActionType;
  title: string;
  detail: string;
  status: 'OPEN' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  completed_at: string | null;
  response: Record<string, unknown> | null;
};

export type ApprovalRecord = {
  approval_id: string;
  artifact_id: string;
  subject: string;
  version: number;
  status: 'REQUESTED' | 'APPROVED' | 'REVISION_REQUESTED';
  actor: 'CLIENT' | 'FOUNDER' | 'SYSTEM';
  note: string | null;
  created_at: string;
  resolved_at: string | null;
};

export type OwnershipRecord = {
  business: string;
  domain: string | null;
  registrar: string | null;
  renewal_date: string | null;
  email_provider: string | null;
  primary_mailbox: string | null;
  aliases: string[];
  dns_status: string | null;
  security_status: string | null;
  owner: string | null;
  administrative_access_model: string | null;
};

export type BuildReadinessAssessment = {
  site_needed: boolean;
  site_type: string | null;
  primary_customer_action: string | null;
  recommended_structure: string | null;
  brand_readiness: string | null;
  content_readiness: string | null;
};

export type QuoteAcceptanceRecord = {
  artifact_id: string;
  quote_version: number;
  terms_version: string;
  accepted_at: string;
  accepted_disclosures: string[];
  source_surface: string;
  client_ip: string | null;
  user_agent: string | null;
};

export type ArtifactEventType =
  | 'ARTIFACT_CREATED'
  | 'LINK_OPENED'
  | 'INTAKE_STARTED'
  | 'INTAKE_UPDATED'
  | 'INTAKE_COMPLETED'
  | 'QUOTE_CREATED'
  | 'QUOTE_UPDATED'
  | 'QUOTE_ACCEPTED'
  | 'CHECKOUT_CREATED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_FAILED'
  | 'REFUND_RECORDED'
  | 'PROJECT_ACTIVATED'
  | 'STAGE_STARTED'
  | 'CLIENT_ACTION_REQUESTED'
  | 'CLIENT_ACTION_COMPLETED'
  | 'APPROVAL_REQUESTED'
  | 'APPROVED'
  | 'REVISION_REQUESTED'
  | 'STAGE_COMPLETED'
  | 'FOUNDATION_COMPLETED'
  | 'CREDIT_CREATED'
  | 'BUILD_INTEREST_CAPTURED'
  | 'BUILD_BOOKED'
  | 'RUNBOOK_GENERATED'
  | 'RUNBOOK_ACTIVATED'
  | 'TASK_READY'
  | 'TASK_STARTED'
  | 'TASK_WAITING_CLIENT'
  | 'TASK_WAITING_PROVIDER'
  | 'TASK_BLOCKED'
  | 'TASK_EXECUTED'
  | 'TASK_VERIFICATION_STARTED'
  | 'TASK_VERIFIED'
  | 'TASK_VERIFICATION_FAILED'
  | 'TASK_COMPLETED'
  | 'TASK_SUPERSEDED'
  | 'PROVIDER_HANDOFF_OPENED'
  | 'FORECAST_CHANGED'
  | 'FINAL_VERIFICATION_STARTED'
  | 'FOUNDATION_VERIFIED';

export type ArtifactEvent = {
  event_id: string;
  artifact_id: string;
  event_type: ArtifactEventType;
  actor: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

export type DigitalFoundationCommercialConfig = {
  base_price_minor: number;
  base_currency: string;
  base_min_business_days: number;
  base_max_business_days: number;
  base_service_version: string;
  quote_expiry_days: number;
  terms_version: string;
  foundation_credit_amount_minor: number;
  foundation_credit_validity_days: number;
  expedited_premium_minor: number | null;
  third_party_cost_notice: string;
};

export type DigitalFoundationRecommendation = {
  title: string;
  recommended_addons: QuoteLineAddon[];
  site00_handles: string[];
  client_must_provide: string[];
  third_party_costs: string[];
  projected_investment_minor: number;
  projected_min_days: number;
  projected_max_days: number;
  timeline_custom_review: boolean;
  dependencies: string[];
  manual_review: boolean;
  manual_review_reasons: string[];
};

export type DigitalFoundationArtifactPayload = {
  artifact: DigitalFoundationArtifact;
  lead: DigitalFoundationLead;
  referral_source: ReferralSource | null;
  quote: DigitalFoundationQuote | null;
  recommendation: DigitalFoundationRecommendation | null;
  acceptance: QuoteAcceptanceRecord | null;
  stages: ProjectStageRecord[];
  client_actions: ClientActionRequest[];
  approvals: ApprovalRecord[];
  ownership_record: OwnershipRecord | null;
  build_readiness: BuildReadinessAssessment | null;
  credit: FoundationBuildCredit | null;
  events: ArtifactEvent[];
  surface:
    | 'PROSPECT'
    | 'INTAKE'
    | 'RECOMMENDATION'
    | 'QUOTE'
    | 'CHECKOUT'
    | 'PORTAL'
    | 'COMPLETE'
    | 'BUILD_UPSELL'
    | 'PAYMENT_RECOVERY';
  /** Client-safe operational summary (no internal notes). */
  operations_summary?: {
    current_stage: string | null;
    needs_you_count: number;
    projected_completion: string | null;
  };
};
