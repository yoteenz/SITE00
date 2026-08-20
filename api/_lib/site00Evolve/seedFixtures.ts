/**
 * Organization-specific EVOLVE marketing seed data.
 * Does NOT invent finalized strategies — safe baselines only.
 */

import type {
  MarketingChannelKey,
  MarketingChannelRow,
  MarketingObjectiveRow,
  MarketingProfileRow,
  ChannelState,
  ObjectiveKey,
} from './types.js';

export const ORG_SLUG_TO_ID: Record<string, string> = {
  'site-00': 'org-00000000-0000-4000-8000-000000000001',
  'frontal-slayer': 'org-00000000-0000-4000-8000-000000000002',
  'all-in-one-enterprises': 'org-00000000-0000-4000-8000-000000000003',
  'studio-world': 'org-00000000-0000-4000-8000-000000000004',
};

export function orgIdFromSlug(slug: string): string | undefined {
  return ORG_SLUG_TO_ID[slug];
}

type ProfileSeed = Omit<MarketingProfileRow, 'id' | 'created_at' | 'updated_at'> & { orgSlug: string };

const PROFILE_SEEDS: ProfileSeed[] = [
  {
    orgSlug: 'site-00',
    organization_id: ORG_SLUG_TO_ID['site-00'],
    lifecycle_stage: 'POST_LAUNCH',
    primary_objective: 'Platform growth — creator acquisition and product communication',
    secondary_objectives: ['Product education', 'Case studies', 'Email lifecycle'],
    audience_summary: null,
    offer_summary: 'Brand + production operating system for creators, brands, and products',
    positioning_summary: null,
    marketing_maturity: 'ASSESSMENT_REQUIRED',
    monthly_budget_range: null,
    production_budget_range: null,
    approval_mode: 'OWNER_APPROVAL_REQUIRED',
    strategy_status: 'NOT_STARTED',
    metadata: { seed: 'evolve_marketing_os', direction: 'platform/creator/customer acquisition' },
  },
  {
    orgSlug: 'frontal-slayer',
    organization_id: ORG_SLUG_TO_ID['frontal-slayer'],
    lifecycle_stage: 'PRE_LAUNCH',
    primary_objective: 'Prepare flagship launch marketing',
    secondary_objectives: ['Ecommerce conversion', 'Lifecycle email', 'Product storytelling'],
    audience_summary: null,
    offer_summary: null,
    positioning_summary: null,
    marketing_maturity: 'ASSESSMENT_REQUIRED',
    monthly_budget_range: null,
    production_budget_range: null,
    approval_mode: 'OWNER_APPROVAL_REQUIRED',
    strategy_status: 'NOT_STARTED',
    metadata: { seed: 'evolve_marketing_os', content_brain_available: true },
  },
  {
    orgSlug: 'all-in-one-enterprises',
    organization_id: ORG_SLUG_TO_ID['all-in-one-enterprises'],
    lifecycle_stage: 'POST_LAUNCH',
    primary_objective: 'Acquire more service clients',
    secondary_objectives: ['Lead generation', 'Service education', 'Customer lifecycle communication'],
    audience_summary: 'Trucking and logistics service buyers',
    offer_summary: 'Trucking brokerage and related services',
    positioning_summary: null,
    marketing_maturity: 'PARTIAL',
    monthly_budget_range: null,
    production_budget_range: null,
    approval_mode: 'OWNER_APPROVAL_REQUIRED',
    strategy_status: 'NOT_STARTED',
    metadata: { seed: 'evolve_marketing_os', social_deferred: true },
  },
];

type ChannelSeed = {
  orgSlug: string;
  channel_key: MarketingChannelKey;
  channel_state: ChannelState;
  is_required?: boolean;
  owner_decision?: string;
  notes?: string;
};

const CHANNEL_SEEDS: ChannelSeed[] = [
  // SITE 00
  { orgSlug: 'site-00', channel_key: 'EMAIL', channel_state: 'PLANNED', is_required: false },
  { orgSlug: 'site-00', channel_key: 'WEBSITE', channel_state: 'ACTIVE', is_required: true },
  { orgSlug: 'site-00', channel_key: 'SEO', channel_state: 'RECOMMENDED' },
  { orgSlug: 'site-00', channel_key: 'INSTAGRAM', channel_state: 'PLANNED' },
  { orgSlug: 'site-00', channel_key: 'TIKTOK', channel_state: 'NOT_REQUIRED' },
  { orgSlug: 'site-00', channel_key: 'PAID_SEARCH', channel_state: 'NOT_CONFIGURED' },

  // Frontal Slayer
  { orgSlug: 'frontal-slayer', channel_key: 'EMAIL', channel_state: 'PLANNED', is_required: false },
  { orgSlug: 'frontal-slayer', channel_key: 'INSTAGRAM', channel_state: 'PLANNED' },
  { orgSlug: 'frontal-slayer', channel_key: 'TIKTOK', channel_state: 'PLANNED' },
  { orgSlug: 'frontal-slayer', channel_key: 'PAID_SOCIAL', channel_state: 'RECOMMENDED' },
  { orgSlug: 'frontal-slayer', channel_key: 'WEBSITE', channel_state: 'ACTIVE', is_required: true },
  { orgSlug: 'frontal-slayer', channel_key: 'SEO', channel_state: 'NOT_CONFIGURED' },

  // AIO — social explicitly deferred
  { orgSlug: 'all-in-one-enterprises', channel_key: 'EMAIL', channel_state: 'PLANNED', is_required: false },
  { orgSlug: 'all-in-one-enterprises', channel_key: 'SEO', channel_state: 'RECOMMENDED' },
  { orgSlug: 'all-in-one-enterprises', channel_key: 'REFERRAL', channel_state: 'PLANNED' },
  { orgSlug: 'all-in-one-enterprises', channel_key: 'WEBSITE', channel_state: 'ACTIVE', is_required: true },
  {
    orgSlug: 'all-in-one-enterprises',
    channel_key: 'INSTAGRAM',
    channel_state: 'DEFERRED',
    is_required: false,
    owner_decision: 'DEFERRED_BY_OWNER',
    notes: 'Owner elected core operations first — not a launch blocker',
  },
  {
    orgSlug: 'all-in-one-enterprises',
    channel_key: 'TIKTOK',
    channel_state: 'DEFERRED',
    is_required: false,
    owner_decision: 'DEFERRED_BY_OWNER',
  },
  {
    orgSlug: 'all-in-one-enterprises',
    channel_key: 'FACEBOOK',
    channel_state: 'DEFERRED',
    is_required: false,
    owner_decision: 'DEFERRED_BY_OWNER',
  },
  { orgSlug: 'all-in-one-enterprises', channel_key: 'PAID_SOCIAL', channel_state: 'NOT_REQUIRED' },
];

type ObjectiveSeed = {
  orgSlug: string;
  objective_key: ObjectiveKey;
  title: string;
  description?: string;
  source?: string;
  status?: string;
};

const OBJECTIVE_SEEDS: ObjectiveSeed[] = [
  { orgSlug: 'site-00', objective_key: 'PLATFORM_GROWTH', title: 'Grow SITE 00 platform adoption', source: 'SYSTEM' },
  { orgSlug: 'site-00', objective_key: 'CREATOR_ACQUISITION', title: 'Acquire creators and brands', source: 'SYSTEM' },
  { orgSlug: 'frontal-slayer', objective_key: 'PRODUCT_LAUNCH', title: 'Prepare flagship product launch marketing', source: 'SYSTEM' },
  { orgSlug: 'frontal-slayer', objective_key: 'SALES_CONVERSION', title: 'Drive ecommerce conversion', source: 'SYSTEM' },
  { orgSlug: 'all-in-one-enterprises', objective_key: 'LEAD_GENERATION', title: 'Acquire more service clients', source: 'SYSTEM' },
  { orgSlug: 'all-in-one-enterprises', objective_key: 'BOOKINGS', title: 'Increase service bookings', source: 'SYSTEM' },
  { orgSlug: 'all-in-one-enterprises', objective_key: 'SEO_VISIBILITY', title: 'Improve local/search visibility', source: 'SYSTEM' },
];

function uuid(prefix: string, n: number): string {
  return `${prefix}-00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
}

export function buildSeedProfiles(): MarketingProfileRow[] {
  const now = new Date().toISOString();
  return PROFILE_SEEDS.map((s, i) => ({
    id: uuid('mprof', i + 1),
    organization_id: s.organization_id,
    lifecycle_stage: s.lifecycle_stage,
    primary_objective: s.primary_objective,
    secondary_objectives: s.secondary_objectives,
    audience_summary: s.audience_summary,
    offer_summary: s.offer_summary,
    positioning_summary: s.positioning_summary,
    marketing_maturity: s.marketing_maturity,
    monthly_budget_range: s.monthly_budget_range,
    production_budget_range: s.production_budget_range,
    approval_mode: s.approval_mode,
    strategy_status: s.strategy_status,
    metadata: s.metadata,
    created_at: now,
    updated_at: now,
  }));
}

export function buildSeedChannels(): MarketingChannelRow[] {
  const now = new Date().toISOString();
  return CHANNEL_SEEDS.map((s, i) => ({
    id: uuid('mchan', i + 1),
    organization_id: ORG_SLUG_TO_ID[s.orgSlug],
    channel_key: s.channel_key,
    channel_state: s.channel_state,
    is_required: s.is_required ?? false,
    owner_decision: s.owner_decision ?? null,
    connection_id: null,
    notes: s.notes ?? null,
    metadata: { seed: true },
    created_at: now,
    updated_at: now,
  }));
}

export function buildSeedObjectives(): MarketingObjectiveRow[] {
  const now = new Date().toISOString();
  return OBJECTIVE_SEEDS.map((s, i) => ({
    id: uuid('mobj', i + 1),
    organization_id: ORG_SLUG_TO_ID[s.orgSlug],
    project_id: null,
    campaign_id: null,
    objective_key: s.objective_key,
    title: s.title,
    description: s.description ?? null,
    priority: 'MEDIUM',
    status: s.status ?? 'ACTIVE',
    target_metric: null,
    baseline_value: null,
    target_value: null,
    time_horizon: null,
    owner_email: null,
    source: s.source ?? 'SYSTEM',
    approval_state: 'DRAFT',
    metadata: { seed: true },
    created_at: now,
    updated_at: now,
  }));
}

export type EvolveRoadmapSeed = {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  metadata: Record<string, unknown>;
};

export function buildSeedEvolveRoadmapItems(): EvolveRoadmapSeed[] {
  return [
    {
      id: uuid('evm', 1),
      organization_id: ORG_SLUG_TO_ID['all-in-one-enterprises'],
      title: 'Social Marketing',
      description: 'Owner elected core operations first — deferred from launch manifest',
      category: 'DEFERRED',
      priority: 'LOW',
      status: 'DEFERRED_BY_OWNER',
      metadata: {
        source: 'Launch Manifest Deferral',
        channel_keys: ['INSTAGRAM', 'TIKTOK', 'FACEBOOK'],
        revisit: 'Owner-defined / future planning',
        kind: 'OWNER_DECISION',
      },
    },
    {
      id: uuid('evm', 2),
      organization_id: ORG_SLUG_TO_ID['site-00'],
      title: 'Expanded Marketing Automation',
      description: 'Post-launch marketing expansion — optional',
      category: 'LATER',
      priority: 'MEDIUM',
      status: 'PLANNED',
      metadata: { source: 'Launch Manifest Deferral', kind: 'OWNER_DECISION' },
    },
  ];
}

export function isMarketingClientOrg(classification: string): boolean {
  return classification !== 'PRODUCTION_INFRASTRUCTURE';
}
