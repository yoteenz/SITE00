/** Self-directed Evolve client product — project + delivery architecture. */

export type ProjectServiceScope =
  | 'MARKETING_ONLY'
  | 'MARKETING_PLUS_PRODUCTION'
  | 'FULL_SITE'
  | 'IDENTITY_ONLY'
  | 'BUILDER_ONLY'
  | 'CUSTOM'
  | 'WEBSITE_ONLY'
  | 'IDENTITY_PLUS_WEBSITE'
  | 'NDXBOOK_LIKE';

export type ProjectRelationship =
  | 'MY_BRAND'
  | 'CLIENT_BRAND'
  | 'FRIEND_COLLABORATOR'
  | 'INTERNAL_TEST';

export type ServiceDeliveryMode = 'SELF_DIRECTED' | 'SITE00_DIRECTED';

export type CreativeBrainEntryMode =
  | 'START_WITH_PRODUCT'
  | 'START_WITH_OBJECTIVE'
  | 'START_WITH_IDEA';

export type SelfDirectedNavSection = 'home' | 'projects' | 'reviews' | 'inbox' | 'profile';

export type ProjectEntitlementPlaceholder = {
  monthlySubscription: boolean;
  usageTier: string | null;
  campaignCredits: number | null;
  projectSeats: number | null;
  clientSeats: number | null;
  site00DirectedService: boolean;
};

export type SelfDirectedProjectContext = {
  projectId: string;
  projectSlug: string;
  displayName: string;
  projectNumber: string;
  serviceScope: ProjectServiceScope;
  relationship: ProjectRelationship;
  deliveryMode: ServiceDeliveryMode;
  skinAssigned: boolean;
  evolveEnabled: boolean;
  entitlements: ProjectEntitlementPlaceholder;
};

export type SelfDirectedDashboardMetrics = {
  activeCampaigns: number | null;
  assets: number | null;
  pendingApprovals: number | null;
  systemStatus: 'ALL_GOOD' | 'NEEDS_ATTENTION' | 'UNKNOWN';
};

/** Unknown counts must not render as zero. */
export function formatMetricCount(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return String(value);
}

export function marketingOnlyScope(scope: ProjectServiceScope): boolean {
  return scope === 'MARKETING_ONLY';
}

export function builderRequiredForScope(scope: ProjectServiceScope): boolean {
  return scope === 'FULL_SITE' || scope === 'BUILDER_ONLY' || scope === 'WEBSITE_ONLY' || scope === 'IDENTITY_PLUS_WEBSITE';
}
