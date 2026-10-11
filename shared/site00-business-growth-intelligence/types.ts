import type { BUSINESS_GROWTH_CATALOG_VERSION, BUSINESS_GROWTH_INTELLIGENCE_VERSION } from './version.js';

export type BusinessGrowthServiceFamilyId =
  | 'VISIBILITY'
  | 'PRESENCE'
  | 'OPPORTUNITY'
  | 'SALES_SYSTEMS'
  | 'GROWTH_OPERATIONS';

export type BusinessGrowthServiceId =
  | 'BGI.VISIBILITY_AUDIT'
  | 'BGI.PRESENCE_LAUNCH'
  | 'BGI.OPPORTUNITY_READINESS'
  | 'BGI.APPLICATION_PROCUREMENT_SUPPORT'
  | 'BGI.GROWTH_OPERATIONS'
  | 'BGI.BUSINESS_GROWTH_PACKAGE';

export type GrowthCommercialStatus =
  | 'PROPOSED_NOT_ACTIVE'
  | 'FOUNDER_APPROVED'
  | 'CUSTOM_QUOTE_REQUIRED'
  | 'BLDR_ESTIMATOR_AUTHORITY'
  | 'FUTURE_NOT_ACTIVE';

export type GrowthExecutionOwner =
  | 'SITE00_DIRECT'
  | 'AIO_PARTNER'
  | 'QUALIFIED_SPECIALIST'
  | 'CLIENT_ACTION'
  | 'EXTERNAL_PROVIDER'
  | 'HUMAN_VERIFICATION';

export type GrowthRecommendationCategory =
  | 'NEEDED_NOW'
  | 'RECOMMENDED_NEXT'
  | 'OPTIONAL'
  | 'FUTURE_OPPORTUNITY'
  | 'SPECIALIST_REVIEW_REQUIRED'
  | 'NOT_RECOMMENDED';

export type BusinessAmbitionGoalId =
  | 'BE_FOUND_ONLINE'
  | 'BUILD_WEBSITE'
  | 'ATTRACT_CUSTOMERS'
  | 'FIND_GRANTS_FUNDING'
  | 'PURSUE_BUSINESS_CONTRACTS'
  | 'PURSUE_GOVERNMENT_CONTRACTS'
  | 'IMPROVE_CREDIBILITY'
  | 'AUTOMATE_SALES_FOLLOWUP'
  | 'ORGANIZE_CRM'
  | 'PREPARE_EXPANSION'
  | 'OTHER'
  | 'NOT_SURE';

export type BusinessAmbitionIntake = {
  schema_version: typeof BUSINESS_GROWTH_INTELLIGENCE_VERSION;
  started_at?: string;
  completed_at?: string;
  skipped?: boolean;
  goals: BusinessAmbitionGoalId[];
  /** Adaptive follow-ups — only answered fields present. */
  context?: {
    has_functioning_website?: boolean | null;
    findable_in_search?: boolean | null;
    has_professional_email?: boolean | null;
    receiving_inquiries?: boolean | null;
    pursues_private_contracts?: boolean | null;
    government_procurement_relevant?: boolean | null;
    applied_for_grants_before?: boolean | null;
    has_capabilities_statement?: boolean | null;
    industry?: string | null;
    geographic_markets?: string | null;
    business_stage?: string | null;
    immediate_priority?: string | null;
  };
};

export type BusinessGrowthServiceDefinition = {
  service_id: BusinessGrowthServiceId;
  family_id: BusinessGrowthServiceFamilyId;
  display_name: string;
  description: string;
  deliverables: string[];
  intake_requirements: string[];
  eligibility_criteria: string[];
  exclusions: string[];
  pricing_basis: string;
  commercial_status: GrowthCommercialStatus;
  /** Illustrative planning range — not live checkout unless FOUNDER_APPROVED. */
  proposed_price_min_minor?: number | null;
  proposed_price_max_minor?: number | null;
  proposed_currency: string;
  delivery: GrowthDeliveryMetadata;
  dependencies: BusinessGrowthServiceId[];
  execution_owner: GrowthExecutionOwner;
  approval_requirements: string[];
  client_facing_status: 'DISCOVERABLE' | 'HIDDEN' | 'FUTURE';
  catalog_version: typeof BUSINESS_GROWTH_CATALOG_VERSION;
};

export type GrowthDeliveryMetadata = {
  estimated_min_business_days: number | null;
  estimated_max_business_days: number | null;
  delivery_unit: 'BUSINESS_DAYS' | 'WEEKS' | 'MONTHS' | 'CUSTOM' | 'RECURRING';
  min_duration_business_days: number | null;
  max_duration_business_days: number | null;
  prerequisites: string[];
  client_dependencies: string[];
  external_dependencies: string[];
  parallelizable_with_foundation: boolean;
  required_review_steps: string[];
  capacity_assumption: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'PENDING_SCOPE_REVIEW';
  time_policy_version: string;
};

export type GrowthServiceRecommendation = {
  service_id: BusinessGrowthServiceId;
  category: GrowthRecommendationCategory;
  reason: string;
  missing_information: string[];
  dependencies: BusinessGrowthServiceId[];
  priority: number;
  suggested_sequence: number;
  aio_handoff?: string | null;
  specialist_handoff?: string | null;
};

export type BusinessGrowthAssessment = {
  assessment_id: string;
  schema_version: typeof BUSINESS_GROWTH_INTELLIGENCE_VERSION;
  ambition: BusinessAmbitionIntake;
  recommendations: GrowthServiceRecommendation[];
  created_at: string;
};

export type SelectedGrowthService = {
  service_id: BusinessGrowthServiceId;
  quantity: number;
  /** Client explicitly opted in — never preselected. */
  client_selected: boolean;
};

export type GrowthQuoteLine = {
  service_id: BusinessGrowthServiceId;
  label: string;
  line_total_minor: number | null;
  price_display: string;
  commercial_status: GrowthCommercialStatus;
  requires_manual_review: boolean;
  delivery_min_business_days: number | null;
  delivery_max_business_days: number | null;
};

export type BusinessGrowthRoadmap = {
  roadmap_id: string;
  schema_version: typeof BUSINESS_GROWTH_INTELLIGENCE_VERSION;
  roadmap_version: number;
  founder_approval_state: 'DRAFT' | 'PENDING_FOUNDER' | 'APPROVED';
  client_goals: BusinessAmbitionGoalId[];
  foundation_readiness_summary: string | null;
  selected_services: SelectedGrowthService[];
  recommended_services: GrowthServiceRecommendation[];
  immediate_actions: string[];
  delivery_milestones: GrowthDeliveryMilestone[];
  blockers: string[];
  bldr_opportunity_notes: string | null;
  aio_referrals: string[];
  specialist_referrals: string[];
  future_options: string[];
  updated_at: string;
};

export type GrowthDeliveryMilestone = {
  milestone_id: string;
  kind: 'FOUNDATION_READY' | 'GROWTH_SERVICE' | 'FULL_PROJECT' | 'BLDR_OPPORTUNITY';
  label: string;
  estimated_min_business_days: number | null;
  estimated_max_business_days: number | null;
  display_range: string | null;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETE' | 'BLOCKED';
};

export type UnifiedCommercialQuoteSections = {
  schema_version: typeof BUSINESS_GROWTH_INTELLIGENCE_VERSION;
  foundation_base_minor: number;
  foundation_addon_minor: number;
  foundation_subtotal_minor: number;
  foundation_ready_min_days: number;
  foundation_ready_max_days: number;
  growth_lines: GrowthQuoteLine[];
  growth_subtotal_minor: number | null;
  growth_subtotal_display: string;
  bldr_scope: { status: 'NONE' | 'ESTIMATOR_REQUIRED' | 'QUOTED_SEPARATELY' };
  third_party_notice: string;
  recurring_lines: { label: string; status: 'NOT_ACTIVATED' }[];
  one_time_total_minor: number | null;
  one_time_total_display: string;
  full_project_min_days: number | null;
  full_project_max_days: number | null;
  full_project_display: string | null;
};
