/** EVOLVE Marketing OS — canonical types */

export type MarketingChannelKey =
  | 'EMAIL'
  | 'INSTAGRAM'
  | 'TIKTOK'
  | 'FACEBOOK'
  | 'YOUTUBE'
  | 'PINTEREST'
  | 'LINKEDIN'
  | 'SMS'
  | 'SEO'
  | 'BLOG'
  | 'WEBSITE'
  | 'PAID_SEARCH'
  | 'PAID_SOCIAL'
  | 'AFFILIATE'
  | 'REFERRAL'
  | 'COMMUNITY'
  | 'PR'
  | 'OTHER';

export type ChannelState =
  | 'ACTIVE'
  | 'PLANNED'
  | 'RECOMMENDED'
  | 'DEFERRED'
  | 'NOT_REQUIRED'
  | 'BLOCKED'
  | 'DISCONNECTED'
  | 'NOT_CONFIGURED';

export type ObjectiveKey =
  | 'BRAND_AWARENESS'
  | 'LEAD_GENERATION'
  | 'SALES_CONVERSION'
  | 'BOOKINGS'
  | 'EMAIL_LIST_GROWTH'
  | 'CUSTOMER_RETENTION'
  | 'REPEAT_PURCHASE'
  | 'MEMBERSHIP_GROWTH'
  | 'AFFILIATE_GROWTH'
  | 'PRODUCT_LAUNCH'
  | 'SERVICE_ADOPTION'
  | 'SEO_VISIBILITY'
  | 'SOCIAL_GROWTH'
  | 'COMMUNITY_GROWTH'
  | 'EDUCATION'
  | 'RE_ENGAGEMENT'
  | 'PLATFORM_GROWTH'
  | 'CREATOR_ACQUISITION';

export type CampaignStatus =
  | 'IDEA'
  | 'STRATEGY'
  | 'PLANNED'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'IN_PRODUCTION'
  | 'READY'
  | 'SCHEDULED'
  | 'LIVE'
  | 'MEASURING'
  | 'OPTIMIZING'
  | 'COMPLETE'
  | 'PAUSED'
  | 'CANCELLED';

export type CalendarStatus =
  | 'IDEA'
  | 'PLANNED'
  | 'BRIEF_READY'
  | 'IN_PRODUCTION'
  | 'AWAITING_REVIEW'
  | 'APPROVED'
  | 'READY'
  | 'SCHEDULED'
  | 'READY_TO_PUBLISH'
  | 'PUBLISHED'
  | 'MEASURING'
  | 'COMPLETE'
  | 'CANCELLED';

export type ContentBrainEntryClass =
  | 'CANONICAL'
  | 'REFERENCE'
  | 'IDEA'
  | 'INSIGHT'
  | 'EXPERIMENT'
  | 'PERFORMANCE_LEARNING';

export type ApprovalMode =
  | 'OWNER_APPROVAL_REQUIRED'
  | 'AGENCY_APPROVAL_ALLOWED'
  | 'AUTO_APPROVE_LOW_RISK'
  | 'CUSTOM';

export type MarketingHealthLevel =
  | 'HEALTHY'
  | 'ATTENTION_REQUIRED'
  | 'ASSESSMENT_REQUIRED'
  | 'BLOCKED'
  | 'NOT_APPLICABLE';

export type IntelligenceKind = 'FACT' | 'INFERENCE' | 'RECOMMENDATION' | 'OWNER_DECISION';

export type CommandCategory = 'NEEDS_YOU' | 'BLOCKED' | 'RUNNING' | 'UPCOMING' | 'DEFERRED' | 'FOCUS_NOW';

export type ProductionType =
  | 'PRODUCT_PHOTOGRAPHY'
  | 'CAMPAIGN_KEY_VISUALS'
  | 'SOCIAL_GRAPHICS'
  | 'SHORT_FORM_VIDEO'
  | 'VIDEO_PRODUCTION'
  | 'MOTION'
  | 'EMAIL_IMAGERY'
  | 'WEBSITE_IMAGERY'
  | 'EDITORIAL'
  | 'BRAND_ASSETS'
  | 'OTHER';

export type ProductionGovernanceState =
  | 'AVAILABLE'
  | 'BLOCKED_BY_GOVERNANCE'
  | 'NOT_CONFIGURED';

export type MarketingProfileRow = {
  id: string;
  organization_id: string;
  lifecycle_stage: string;
  primary_objective: string | null;
  secondary_objectives: string[];
  audience_summary: string | null;
  offer_summary: string | null;
  positioning_summary: string | null;
  marketing_maturity: string;
  monthly_budget_range: string | null;
  production_budget_range: string | null;
  approval_mode: ApprovalMode;
  strategy_status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type MarketingObjectiveRow = {
  id: string;
  organization_id: string;
  project_id: string | null;
  campaign_id: string | null;
  objective_key: ObjectiveKey;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  target_metric: string | null;
  baseline_value: number | null;
  target_value: number | null;
  time_horizon: string | null;
  owner_email: string | null;
  source: string;
  approval_state: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type MarketingChannelRow = {
  id: string;
  organization_id: string;
  channel_key: MarketingChannelKey;
  channel_state: ChannelState;
  is_required: boolean;
  owner_decision: string | null;
  connection_id: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type MarketingAssessmentRow = {
  id: string;
  organization_id: string;
  assessment_version: number;
  marketing_health: MarketingHealthLevel;
  health_dimensions: Record<string, string>;
  objective_alignment: Record<string, unknown>;
  channel_coverage: Record<string, unknown>;
  content_readiness: Record<string, unknown>;
  production_readiness: Record<string, unknown>;
  measurement_readiness: Record<string, unknown>;
  blockers: Array<{ kind: IntelligenceKind; label: string; detail: string }>;
  opportunities: Array<{ kind: IntelligenceKind; label: string; detail: string }>;
  next_best_actions: NextBestAction[];
  inputs_snapshot: Record<string, unknown>;
  assessed_at: string;
  assessed_by: string | null;
};

export type MarketingManifestRow = {
  id: string;
  organization_id: string;
  title: string;
  manifest_state: string;
  approval_state: string;
  is_active: boolean;
  generated_from: Record<string, unknown>;
  approved_by: string | null;
  approved_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type MarketingManifestItemRow = {
  id: string;
  manifest_id: string;
  item_key: string;
  title: string;
  description: string | null;
  category: string;
  channel_key: string | null;
  priority: string;
  status: string;
  sort_order: number;
  metadata: Record<string, unknown>;
};

export type MarketingCampaignRow = {
  id: string;
  organization_id: string;
  project_id: string | null;
  campaign_key: string;
  title: string;
  status: CampaignStatus;
  why: string | null;
  audience: string | null;
  message: string | null;
  call_to_action: string | null;
  channels: string[];
  deliverables_summary: string | null;
  approver_email: string | null;
  success_metric: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ContentCalendarItemRow = {
  id: string;
  organization_id: string;
  campaign_id: string | null;
  channel_key: MarketingChannelKey;
  content_type: string;
  title: string;
  objective: string | null;
  content_pillar: string | null;
  planned_date: string | null;
  status: CalendarStatus;
  production_required: boolean;
  approval_required: boolean;
  asset_refs: unknown[];
  copy_refs: unknown[];
  published_url: string | null;
  performance_link_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type StudioProductionRequestRow = {
  id: string;
  organization_id: string;
  project_id: string | null;
  campaign_id: string | null;
  calendar_item_id: string | null;
  production_type: ProductionType;
  objective: string | null;
  brief: string | null;
  deliverables: unknown[];
  canon_refs: unknown[];
  reference_refs: unknown[];
  asset_refs: unknown[];
  priority: string;
  due_date: string | null;
  approval_state: string;
  production_state: string;
  governance_state: ProductionGovernanceState | null;
  external_production_id: string | null;
  external_status: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  created_by: string | null;
  approved_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type MarketingApprovalRow = {
  id: string;
  organization_id: string;
  subject_type: string;
  subject_id: string;
  approval_type: string;
  status: string;
  requested_by: string | null;
  decided_by: string | null;
  decided_at: string | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type MarketingInsightRow = {
  id: string;
  organization_id: string;
  insight_type: string;
  title: string;
  summary: string;
  evidence: unknown[];
  confidence: string;
  recommendation: string | null;
  recommendation_status: string;
  content_brain_entry_id: string | null;
  campaign_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type NextBestAction = {
  rank: number;
  category: CommandCategory;
  title: string;
  reason: string;
  source: string;
  dependency: string | null;
  objectiveRelationship: string | null;
  route: string;
  priority: number;
};

export type EvolveOverview = {
  organizationSlug: string;
  organizationName: string;
  classification: string;
  isMarketingClient: boolean;
  currentObjective: string | null;
  marketingHealth: MarketingHealthLevel;
  healthDimensions: Record<string, string>;
  activeCampaigns: number;
  contentPipeline: { planned: number; inProduction: number; awaitingReview: number };
  productionQueue: number;
  needsApproval: number;
  nextPublishingEvent: string | null;
  latestPerformanceSignal: string | null;
  nextBestAction: NextBestAction | null;
  channels: Array<{ channelKey: MarketingChannelKey; state: ChannelState; label: string }>;
  deferredItems: string[];
  blockers: string[];
  route: string;
};

export type EvolveCommandItem = {
  id: string;
  organizationSlug: string;
  organizationName: string;
  category: CommandCategory;
  title: string;
  reason: string;
  route: string;
  priority: number;
};

export const ALL_CHANNEL_KEYS: MarketingChannelKey[] = [
  'EMAIL', 'INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'YOUTUBE', 'PINTEREST', 'LINKEDIN',
  'SMS', 'SEO', 'BLOG', 'WEBSITE', 'PAID_SEARCH', 'PAID_SOCIAL', 'AFFILIATE',
  'REFERRAL', 'COMMUNITY', 'PR', 'OTHER',
];

export const STUDIO_WORLD_GOVERNED_BLOCKED: ProductionType[] = [
  'PRODUCT_PHOTOGRAPHY',
];

export const STUDIO_WORLD_GOVERNANCE_BLOCKED_CAPABILITIES = [
  'PRODUCT_PHOTOGRAPHY',
  'LIVE_TRY_ON',
  'COMMERCE_FAL',
  'SLAY_FORECAST',
] as const;
