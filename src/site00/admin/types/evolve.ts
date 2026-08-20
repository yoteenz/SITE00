/** EVOLVE operator UI — client-side types aligned with site00-evolve API */

export type EvolveCampaignListRow = {
  id: string;
  title: string;
  objective: string | null;
  status: string;
  channels: string[];
  targetDate: string | null;
  nextMilestone: string | null;
  productionState: string;
  approvalState: string;
  blockers: string[];
};

export type SafeConnectionView = {
  id: string;
  organizationId: string;
  providerKey: string;
  providerCategory: string;
  displayName: string;
  status: string;
  health: string;
  externalAccountName: string | null;
  externalPropertyName: string | null;
  grantedCapabilities: string[];
  supportedCapabilities: string[];
  capabilityMap: Record<string, string>;
  grantedScopes: string[];
  lastVerifiedAt: string | null;
  lastSyncAt: string | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  credentialState: string;
  recommendedAction: string | null;
};

export type EvolveOverview = {
  organizationSlug: string;
  organizationName: string;
  classification: string;
  isMarketingClient: boolean;
  currentObjective: string | null;
  marketingHealth: string;
  healthDimensions: Record<string, string>;
  activeCampaigns: number;
  contentPipeline: { planned: number; inProduction: number; awaitingReview: number };
  productionQueue: number;
  needsApproval: number;
  nextPublishingEvent: string | null;
  latestPerformanceSignal: string | null;
  nextBestAction: { title?: string; reason?: string; route?: string; category?: string } | null;
  channels: Array<{ channelKey: string; state: string; label: string }>;
  deferredItems: string[];
  blockers: string[];
  route: string;
};

export type EvolveCalendarItem = {
  id: string;
  organization_id: string;
  campaign_id: string | null;
  channel_key: string;
  content_type: string;
  title: string;
  objective: string | null;
  content_pillar: string | null;
  planned_date: string | null;
  status: string;
  production_required: boolean;
  approval_required: boolean;
  metadata: Record<string, unknown>;
};

export type EvolveEmailItem = {
  id: string;
  email_type: string;
  objective: string | null;
  audience: string | null;
  subject: string | null;
  approval_state: string;
  delivery_state: string;
  metadata: Record<string, unknown>;
};

export type EvolveSocialItem = {
  id: string;
  platform: string;
  content_pillar: string | null;
  format: string | null;
  hook: string | null;
  publish_state: string;
  metadata: Record<string, unknown>;
};

export type EvolveApprovalItem = {
  id: string;
  organization_id: string;
  organizationSlug?: string;
  organizationName?: string;
  subject_type: string;
  subject_id: string;
  approval_type: string;
  status: string;
  requested_by: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
};

export type EvolveMarketingPlan = {
  id: string;
  plan_type: string;
  period_label: string;
  period_start: string | null;
  period_end: string | null;
  objectives: unknown[];
  campaign_expectations: unknown[];
  content_expectations: unknown[];
  production_expectations: unknown[];
  measurement_targets: unknown[];
  review_state: string;
  metadata: Record<string, unknown>;
};
