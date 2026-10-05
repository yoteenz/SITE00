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

import { MEMORY_ORG_SLUG_TO_ID, orgIdFromSlug as resolveOrgId } from './orgRegistry.js';

/** Fixture org IDs for seed builders and memory store */
export const ORG_SLUG_TO_ID = MEMORY_ORG_SLUG_TO_ID;

export function orgIdFromSlug(slug: string): string | undefined {
  return resolveOrgId(slug);
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

/** Operational seed data for Sprint 02 operator UI — safe baselines, not finalized strategy */
export function buildSeedCampaigns(): import('./types.js').MarketingCampaignRow[] {
  const now = new Date().toISOString();
  return [
    {
      id: uuid('mcamp', 1),
      organization_id: ORG_SLUG_TO_ID['frontal-slayer'],
      project_id: null,
      campaign_key: 'fs-flagship-launch',
      title: 'Flagship Product Launch',
      status: 'IN_PRODUCTION',
      why: 'Primary pre-launch conversion and awareness push',
      audience: 'Beauty-forward consumers, 25–40',
      message: 'Luxury redefined — unapologetic boldness',
      call_to_action: 'Shop the collection',
      channels: ['EMAIL', 'INSTAGRAM', 'TIKTOK', 'PAID_SOCIAL'],
      deliverables_summary: 'Hero visuals, launch email, social cutdowns',
      approver_email: null,
      success_metric: 'Launch week conversion rate',
      metadata: {
        seed: true,
        objective_label: 'Product launch marketing',
        target_date: '2026-09-15',
        next_milestone: 'Key visuals approval',
        production_state: 'IN_PROGRESS',
        approval_state: 'PENDING_STRATEGY',
        blockers: [],
      },
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid('mcamp', 2),
      organization_id: ORG_SLUG_TO_ID['all-in-one-enterprises'],
      project_id: null,
      campaign_key: 'aio-service-acquisition',
      title: 'Service Client Acquisition',
      status: 'PLANNED',
      why: 'Drive qualified service inquiries from search and referral',
      audience: 'Trucking and logistics decision makers',
      message: 'Reliable brokerage — operations first',
      call_to_action: 'Request a quote',
      channels: ['EMAIL', 'SEO', 'REFERRAL', 'WEBSITE'],
      deliverables_summary: 'Landing refresh, lifecycle email, local SEO foundation',
      approver_email: null,
      success_metric: 'Qualified leads per month',
      metadata: {
        seed: true,
        objective_label: 'Acquire more service clients',
        target_date: '2026-10-01',
        next_milestone: 'Complete marketing assessment',
        production_state: 'NOT_STARTED',
        approval_state: 'DRAFT',
        blockers: ['EMAIL PROVIDER NOT CONNECTED'],
      },
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid('mcamp', 3),
      organization_id: ORG_SLUG_TO_ID['site-00'],
      project_id: null,
      campaign_key: 'site00-platform-growth',
      title: 'Platform Growth — Creator Acquisition',
      status: 'STRATEGY',
      why: 'Grow SITE 00 adoption among creators and brands',
      audience: 'Creators, indie brands, product founders',
      message: 'Your brand operating system starts at zero',
      call_to_action: 'Start assessment',
      channels: ['WEBSITE', 'SEO', 'EMAIL'],
      deliverables_summary: 'Case studies, onboarding email sequence, SEO foundation',
      approver_email: null,
      success_metric: 'Creator sign-ups',
      metadata: {
        seed: true,
        objective_label: 'Platform growth',
        target_date: null,
        next_milestone: 'Run marketing assessment',
        production_state: 'NOT_STARTED',
        approval_state: 'DRAFT',
        blockers: [],
      },
      created_at: now,
      updated_at: now,
    },
  ];
}

export function buildSeedCalendarItems(): import('./types.js').ContentCalendarItemRow[] {
  const now = new Date().toISOString();
  return [
    {
      id: uuid('mcal', 1),
      organization_id: ORG_SLUG_TO_ID['frontal-slayer'],
      campaign_id: uuid('mcamp', 1),
      channel_key: 'INSTAGRAM',
      content_type: 'CAROUSEL',
      title: 'Launch teaser — hero product',
      objective: 'Awareness',
      content_pillar: 'Product story',
      planned_date: '2026-09-01',
      status: 'IN_PRODUCTION',
      production_required: true,
      approval_required: true,
      asset_refs: [],
      copy_refs: [],
      published_url: null,
      performance_link_id: null,
      metadata: { seed: true },
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid('mcal', 2),
      organization_id: ORG_SLUG_TO_ID['frontal-slayer'],
      campaign_id: uuid('mcamp', 1),
      channel_key: 'EMAIL',
      content_type: 'LAUNCH_ANNOUNCE',
      title: 'Launch day email',
      objective: 'Conversion',
      content_pillar: 'Launch',
      planned_date: '2026-09-15',
      status: 'PLANNED',
      production_required: true,
      approval_required: true,
      asset_refs: [],
      copy_refs: [],
      published_url: null,
      performance_link_id: null,
      metadata: { seed: true },
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid('mcal', 3),
      organization_id: ORG_SLUG_TO_ID['all-in-one-enterprises'],
      campaign_id: uuid('mcamp', 2),
      channel_key: 'SEO',
      content_type: 'LANDING_PAGE',
      title: 'Service inquiry landing refresh',
      objective: 'Lead generation',
      content_pillar: 'Services',
      planned_date: '2026-10-15',
      status: 'IDEA',
      production_required: false,
      approval_required: true,
      asset_refs: [],
      copy_refs: [],
      published_url: null,
      performance_link_id: null,
      metadata: { seed: true },
      created_at: now,
      updated_at: now,
    },
  ];
}

export function buildSeedEmailItems(): Array<Record<string, unknown>> {
  const now = new Date().toISOString();
  return [
    {
      id: uuid('memail', 1),
      organization_id: ORG_SLUG_TO_ID['frontal-slayer'],
      campaign_id: uuid('mcamp', 1),
      calendar_item_id: uuid('mcal', 2),
      email_type: 'LAUNCH_ANNOUNCE',
      objective: 'Drive launch-day conversion',
      audience: 'VIP waitlist',
      subject: 'It arrives — [Product Name]',
      preheader: 'The moment is here',
      content_brief: 'Hero imagery, single CTA, urgency without discounting',
      cta: 'Shop now',
      template_ref: 'marketing-campaign-launch',
      approval_state: 'DRAFT',
      delivery_state: 'NOT_SCHEDULED',
      performance: {},
      metadata: { seed: true },
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid('memail', 2),
      organization_id: ORG_SLUG_TO_ID['all-in-one-enterprises'],
      campaign_id: uuid('mcamp', 2),
      calendar_item_id: null,
      email_type: 'LIFECYCLE',
      objective: 'Nurture service inquiries',
      audience: 'Past quote requesters',
      subject: 'Your logistics partner — follow up',
      preheader: null,
      content_brief: 'Service education, trust signals, quote CTA',
      cta: 'Request quote',
      template_ref: null,
      approval_state: 'DRAFT',
      delivery_state: 'NOT_SCHEDULED',
      performance: {},
      metadata: { seed: true, blocked_by: 'EMAIL PROVIDER NOT CONNECTED' },
      created_at: now,
      updated_at: now,
    },
  ];
}

export function buildSeedSocialItems(): Array<Record<string, unknown>> {
  const now = new Date().toISOString();
  return [
    {
      id: uuid('msocial', 1),
      organization_id: ORG_SLUG_TO_ID['frontal-slayer'],
      campaign_id: uuid('mcamp', 1),
      calendar_item_id: uuid('mcal', 1),
      platform: 'INSTAGRAM',
      content_pillar: 'Product story',
      format: 'CAROUSEL',
      hook: 'The reveal you waited for',
      caption: 'Draft caption — pending approval',
      cta: 'Link in bio',
      asset_requirement: 'Hero product stills from Studio World',
      publish_state: 'IN_PRODUCTION',
      performance: {},
      metadata: { seed: true },
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid('msocial', 2),
      organization_id: ORG_SLUG_TO_ID['all-in-one-enterprises'],
      campaign_id: null,
      calendar_item_id: null,
      platform: 'INSTAGRAM',
      content_pillar: 'Social Marketing',
      format: 'REEL',
      hook: null,
      caption: null,
      cta: null,
      asset_requirement: null,
      publish_state: 'DEFERRED_BY_OWNER',
      performance: {},
      metadata: {
        seed: true,
        owner_decision: 'DEFERRED_BY_OWNER',
        note: 'Owner elected core operations first — not a launch blocker',
      },
      created_at: now,
      updated_at: now,
    },
  ];
}

export function buildSeedMarketingPlans(): Array<Record<string, unknown>> {
  const now = new Date().toISOString();
  return [
    {
      id: uuid('mplan', 1),
      organization_id: ORG_SLUG_TO_ID['frontal-slayer'],
      plan_type: 'QUARTERLY',
      period_label: 'Q3 2026 — Launch Quarter',
      period_start: '2026-07-01',
      period_end: '2026-09-30',
      objectives: ['Product launch', 'Ecommerce conversion', 'Email lifecycle'],
      campaign_expectations: ['Flagship launch campaign live by mid-September'],
      content_expectations: ['Launch teaser, hero email, paid social cutdowns'],
      production_expectations: ['Campaign key visuals via Studio World'],
      measurement_targets: ['Launch week conversion — baseline TBD'],
      budget_notes: 'Production budget TBD with owner',
      review_state: 'DRAFT',
      metadata: { seed: true },
      created_at: now,
      updated_at: now,
    },
    {
      id: uuid('mplan', 2),
      organization_id: ORG_SLUG_TO_ID['all-in-one-enterprises'],
      plan_type: 'QUARTERLY',
      period_label: 'Q4 2026 — Service Growth',
      period_start: '2026-10-01',
      period_end: '2026-12-31',
      objectives: ['Lead generation', 'SEO visibility', 'Referral activation'],
      campaign_expectations: ['Service acquisition campaign — social excluded by owner'],
      content_expectations: ['Landing refresh, lifecycle email when provider connected'],
      production_expectations: ['Minimal — operations-first positioning'],
      measurement_targets: ['Qualified leads — analytics not connected'],
      budget_notes: null,
      review_state: 'DRAFT',
      metadata: { seed: true, social_deferred: true },
      created_at: now,
      updated_at: now,
    },
  ];
}
