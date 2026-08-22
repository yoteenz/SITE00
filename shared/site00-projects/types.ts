/** SITE 00 founder project index — shared types */

export type Site00FounderProjectSlug = 'frontal-slayer' | 'studio-world' | 'ndxbook' | 'all-in-one-enterprises';

export type Site00ProjectSurface = {
  id: string;
  label: string;
  /** Canonical client-facing route */
  route: string;
  /** Admin-only route when surface also exists in operator context */
  adminRoute?: string;
  available: boolean;
  description?: string;
};

export type Site00ProjectCommandItem = {
  id: string;
  category: 'FOCUS_NOW' | 'NEEDS_YOU' | 'BLOCKED' | 'UPCOMING' | 'DEFERRED' | 'RUNNING';
  title: string;
  reason: string;
  route: string;
};

export type Site00ProjectIndexEntry = {
  slug: Site00FounderProjectSlug;
  name: string;
  displayName: string;
  internalLabel?: string;
  organizationSlug: string;
  organizationUuid: string;
  classification: string;
  currentSystem: string;
  currentPhase: string;
  focusNow: string | null;
  lastActivity: string | null;
  surfaces: Site00ProjectSurface[];
  detailRoute: string;
  /** COMPLETE when full resolver succeeded; PARTIAL when identity exists but enrichment failed */
  enrichmentStatus?: 'COMPLETE' | 'PARTIAL';
  enrichmentNote?: string | null;
};

export type Site00ProjectsIndexSummary = {
  total: number;
  founderIndex: number;
  clientProjects: number;
  partial: number;
};

export type Site00ProjectsApiErrorBody = {
  code: string;
  message: string;
};

export type Site00ProjectsIndexPayload = {
  ok: true;
  projects: Site00ProjectIndexEntry[];
  source: 'site00_project_resolver';
  summary: Site00ProjectsIndexSummary;
  clientProjects?: Array<{ id: string; slug: string; name: string; studioRoute: string }>;
};

export type Site00ProjectsIndexFailure = {
  ok: false;
  error: Site00ProjectsApiErrorBody;
  source: 'site00_project_resolver';
};

export type Site00ProjectIntelligenceSummary = {
  available: boolean;
  canonical: number;
  reference: number;
  ideas: number;
  insights: number;
  route: string;
  adminRoute?: string;
};

export type Site00ProjectCreativeDirectionSummary = {
  available: boolean;
  lifecycleState: string;
  founderDecision: string;
  visualDnaStatus: string;
  territoriesGenerated: boolean;
  route: string;
  adminRoute?: string;
  page001Gate: {
    visualDnaApproved: boolean;
    productionEligible: boolean;
    blockedReason: string | null;
  };
};

export type Site00ProjectProductionSummary = {
  launchState: string;
  page001: {
    topic: string | null;
    contentState: string | null;
    visualApproval: string | null;
    publicationApproval: string | null;
    distribution: string | null;
  } | null;
  publishingEnabled: boolean;
  crossPostingEnabled: boolean;
};

export type Site00ProjectChannelSummary = {
  key: string;
  state: string;
  locked: boolean;
};

/** EVOLVE commercial snapshot for a project — intentionally separate from operational/governance state. */
export type Site00ProjectCommercialSummary = {
  applicability: 'BILLABLE_CLIENT' | 'INTERNAL_NON_BILLING' | 'NOT_APPLICABLE';
  applicabilityNote: string;
  plan: { id: string; name: string; priceLabel: string; serviceModel: string } | null;
  planStatus: 'ACTIVE' | 'NOT_SELECTED' | 'NOT_APPLICABLE';
  foundation: { status: string; missing: string[]; explanation: string } | null;
  entitlements: { channelLimit: number | null; assetCapacityLabel: string | null; customScopeRequired: boolean } | null;
  paidMediaStatus: string;
  usageMetering: string;
  billingIntegrated: boolean;
  route: string;
};

export type Site00ProjectDetail = Site00ProjectIndexEntry & {
  overview: {
    description: string;
    lifecycleStage: string | null;
    marketingHealth: string | null;
    importState: string | null;
    boundaryNote: string | null;
    repositoryConnection?: string | null;
  };
  intelligence: Site00ProjectIntelligenceSummary;
  evolve: {
    route: string;
    adminRoute?: string;
    isMarketingClient: boolean;
    activeCampaigns: number;
    needsApproval: number;
  };
  creativeDirection: Site00ProjectCreativeDirectionSummary | null;
  commercial: Site00ProjectCommercialSummary;
  assets: {
    available: boolean;
    route: string;
    note: string;
  };
  production: Site00ProjectProductionSummary;
  channels: Site00ProjectChannelSummary[];
  channelsRoute: string;
  command: {
    focusNow: Site00ProjectCommandItem[];
    needsYou: Site00ProjectCommandItem[];
    blocked: Site00ProjectCommandItem[];
    upcoming: Site00ProjectCommandItem[];
    deferred: Site00ProjectCommandItem[];
  };
  activity: Array<{ id: string; summary: string; timestamp: string | null }>;
  activityNote: string | null;
};

export type Site00ProjectDetailResponse = {
  ok: true;
  project: Site00ProjectDetail;
  source: 'site00_project_resolver';
};
