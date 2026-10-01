/** SITE 00 — Existing Location service (external digital property work). */

export const EXISTING_LOCATION_SERVICE_ID = 'EXISTING_LOCATION' as const;

/** Public working label — internal concept EXISTING_LOCATION. */
export const EXISTING_LOCATION_PUBLIC_LABEL = 'EXISTING LOCATION';

export type ExistingLocationRequestType =
  | 'DIAGNOSE'
  | 'REPAIR'
  | 'IMPROVE'
  | 'INSTALL'
  | 'CUSTOM_EXPERIENCE'
  | 'UNSURE';

export type ExistingLocationPlatform =
  | 'SHOPIFY'
  | 'WORDPRESS'
  | 'WEBFLOW'
  | 'SQUARESPACE'
  | 'WIX'
  | 'CUSTOM_CODE'
  | 'OTHER'
  | 'UNSURE';

export type ExistingLocationCaseStatus =
  | 'DRAFT'
  | 'INTAKE_COMPLETE'
  | 'ACCESS_REQUIRED'
  | 'ACCESS_CONNECTED'
  | 'DIAGNOSING'
  | 'NEEDS_MORE_INFORMATION'
  | 'DIAGNOSIS_COMPLETE'
  | 'QUOTE_READY'
  | 'AWAITING_CLIENT_APPROVAL'
  | 'APPROVED'
  | 'CHECKOUT_PENDING'
  | 'PAID'
  | 'COMPLIMENTARY_APPROVED'
  | 'IN_PROGRESS'
  | 'READY_FOR_QA'
  | 'QA_FAILED'
  | 'QA_PASSED'
  | 'COMPLETE'
  | 'CANCELLED';

export type AccessRequirementStatus =
  | 'NOT_REQUESTED'
  | 'REQUESTED'
  | 'CONNECTED'
  | 'INSUFFICIENT_ACCESS'
  | 'REVOKED'
  | 'EXPIRED';

export type ServiceClassification =
  | 'QUICK_FIX'
  | 'STANDARD_REPAIR'
  | 'ADVANCED_REPAIR'
  | 'INTEGRATION'
  | 'ENHANCEMENT'
  | 'CUSTOM_DEVELOPMENT'
  | 'CUSTOM_EXPERIENCE'
  | 'SYSTEM_TRANSFORMATION';

export type CourtesyDiscountType =
  | 'PERCENT_100'
  | 'FIXED_AMOUNT'
  | 'DIAGNOSIS_ONLY'
  | 'LABOR_ONLY'
  | 'SPECIFIC_SERVICE'
  | 'FULL_CASE_COMP';

export type CapabilityReusabilityStatus =
  | 'PROJECT_LOCAL'
  | 'REUSABLE_CANDIDATE'
  | 'CATALOG_CAPABILITY'
  | 'INTEGRATION_READY';

export type AccessRequirement = {
  platform: ExistingLocationPlatform;
  access_type: string;
  permission_scope: string;
  required_or_optional: 'REQUIRED' | 'OPTIONAL';
  purpose: string;
  read_only_supported: boolean;
  write_required: boolean;
  temporary_supported: boolean;
  instructions: string;
  status: AccessRequirementStatus;
  connected_at: string | null;
  revoked_at: string | null;
};

export type ExistingLocationEvidence = {
  id: string;
  kind: 'screenshot' | 'screen_recording' | 'error_message' | 'url' | 'order_example' | 'product_example' | 'repro_steps' | 'note';
  label: string;
  value: string;
  created_at: string;
};

export type DiagnosisFinding = {
  id: string;
  title: string;
  summary: string;
  why: string;
  recommendation: string;
  will_change: string[];
  will_not_change: string[];
  risk_impact: string;
  affected_systems: string[];
  test_plan_summary: string;
};

export type QuoteLineItem = {
  id: string;
  code: string;
  label: string;
  amount_cents: number;
  optional: boolean;
};

export type ExistingLocationQuote = {
  id: string;
  case_id: string;
  currency: string;
  line_items: QuoteLineItem[];
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  diagnosis_fee_cents: number;
  basis_notes: string;
  locked: boolean;
  created_at: string;
  updated_at: string;
};

export type ExistingLocationCaseRecord = {
  id: string;
  public_reference: string;
  client_user_id: string | null;
  client_email: string | null;
  project_id: string | null;
  platform: ExistingLocationPlatform | null;
  site_url: string | null;
  request_type: ExistingLocationRequestType | null;
  client_description: string;
  expected_behavior: string;
  actual_behavior: string;
  enhancement_goal: string;
  evidence: ExistingLocationEvidence[];
  access_requirements: AccessRequirement[];
  access_status: AccessRequirementStatus;
  diagnosis_status: ExistingLocationCaseStatus;
  status: ExistingLocationCaseStatus;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  affected_systems: string[];
  findings: DiagnosisFinding[];
  recommended_intervention: string | null;
  service_classification: ServiceClassification | null;
  modify_production_authorized: boolean;
  quote_id: string | null;
  approval_status: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  checkout_status: 'NONE' | 'PENDING' | 'COMPLETE';
  implementation_status: 'NONE' | 'IN_PROGRESS' | 'COMPLETE';
  qa_status: 'NONE' | 'READY' | 'PASSED' | 'FAILED';
  entitlement: Record<string, unknown> | null;
  courtesy_redemption_id: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type CaseAuditEventType =
  | 'CASE_CREATED'
  | 'PLATFORM_SELECTED'
  | 'INTAKE_SUBMITTED'
  | 'ACCESS_REQUESTED'
  | 'ACCESS_CONNECTED'
  | 'DIAGNOSIS_STARTED'
  | 'DIAGNOSIS_COMPLETED'
  | 'QUOTE_CREATED'
  | 'CLIENT_APPROVED'
  | 'COURTESY_CODE_APPLIED'
  | 'PAYMENT_COMPLETED'
  | 'CHANGE_STARTED'
  | 'CHANGE_DEPLOYED'
  | 'QA_PASSED'
  | 'CASE_COMPLETED'
  | 'ACCESS_REVOKED';

export type CaseAuditEvent = {
  id: string;
  case_id: string;
  event_type: CaseAuditEventType;
  actor: 'CLIENT' | 'SYSTEM' | 'FOUNDER' | 'ADMIN';
  detail: Record<string, unknown>;
  created_at: string;
};

export type ServiceCourtesyCodeRecord = {
  id: string;
  code_hash: string;
  display_label: string;
  discount_type: CourtesyDiscountType;
  discount_value: number;
  eligible_services: string[];
  eligible_client_id: string | null;
  eligible_email: string | null;
  max_redemptions: number;
  redemptions_used: number;
  valid_from: string;
  expires_at: string | null;
  founder_note: string;
  active: boolean;
  created_by: string;
  created_at: string;
};

export type CourtesyRedemptionRecord = {
  id: string;
  code_id: string;
  case_id: string;
  quote_id: string;
  client_email: string | null;
  discount_applied_cents: number;
  final_total_cents: number;
  created_at: string;
};

export type Site00CapabilityRecord = {
  capability_id: string;
  name: string;
  category: string;
  origin_project: string | null;
  origin_case: string | null;
  description: string;
  supported_platforms: ExistingLocationPlatform[];
  experience_family: string;
  reusability_status: CapabilityReusabilityStatus;
  maturity_status: string;
  version: string;
  created_at: string;
};
