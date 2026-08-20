/** SITE 00 founder project index — shared types */

export type Site00FounderProjectSlug = 'frontal-slayer' | 'studio-world' | 'ndxbook';

export type Site00ProjectSurface = {
  id: string;
  label: string;
  route: string;
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
};

export type Site00ProjectIntelligenceSummary = {
  available: boolean;
  canonical: number;
  reference: number;
  ideas: number;
  insights: number;
  route: string;
};

export type Site00ProjectCreativeDirectionSummary = {
  available: boolean;
  lifecycleState: string;
  founderDecision: string;
  visualDnaStatus: string;
  territoriesGenerated: boolean;
  route: string;
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

export type Site00ProjectDetail = Site00ProjectIndexEntry & {
  overview: {
    description: string;
    lifecycleStage: string | null;
    marketingHealth: string | null;
    importState: string | null;
    boundaryNote: string | null;
  };
  intelligence: Site00ProjectIntelligenceSummary;
  evolve: {
    route: string;
    isMarketingClient: boolean;
    activeCampaigns: number;
    needsApproval: number;
  };
  creativeDirection: Site00ProjectCreativeDirectionSummary | null;
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

export type Site00ProjectsIndexPayload = {
  projects: Site00ProjectIndexEntry[];
  source: 'site00_project_resolver';
  clientProjects?: Array<{ id: string; slug: string; name: string; studioRoute: string }>;
};
