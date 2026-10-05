/**
 * SITE 00 EVOLVE — canonical commercial/pricing catalog.
 *
 * ONE canonical source for all EVOLVE pricing. Do not duplicate these numbers
 * in React components, admin panels, or docs — import from here.
 *
 * All prices are integer cents. Display strings are produced only by
 * formatEvolvePrice() so the presentation format stays consistent everywhere.
 */

import type {
  EvolveActivationService,
  EvolvePaidMediaService,
  EvolveBillingInterval,
  EvolvePlanId,
  EvolvePriceQualifier,
  EvolveProjectService,
  EvolveProjectServiceId,
  EvolveRecurringPlan,
  EvolveServiceCatalog,
} from './types.js';

const NO_PROVIDER_REF = { stripeProductId: null, stripePriceId: null } as const;

/** Foundation — one-time intelligence activation phase, NOT generic account setup. */
export const EVOLVE_FOUNDATION: EvolveActivationService = {
  id: 'evolve_foundation',
  slug: 'evolve-foundation',
  name: 'EVOLVE FOUNDATION',
  category: 'ACTIVATION',
  billingType: 'ONE_TIME',
  priceCents: 150_000,
  priceQualifier: 'FIXED',
  billingInterval: 'ONE_TIME',
  description:
    'Required activation/intelligence phase for a new standalone EVOLVE client. Foundation establishes the marketing intelligence environment EVOLVE needs before it can operate a client\u2019s marketing — it is the intelligence-building phase, not account setup.',
  positioning: 'ACTIVATE — the intelligence phase that lets EVOLVE understand the company before operating its marketing.',
  recommended: false,
  requiresFoundation: false,
  customScopeRequired: false,
  availability: 'AVAILABLE',
  features: [
    'Business / brand intelligence ingestion',
    'Existing brand identity ingestion',
    'Products / services ingestion',
    'Audience intelligence',
    'Positioning',
    'Brand voice',
    'Objectives',
    'Competitor / reference intelligence where available',
    'Existing content ingestion',
    'Existing marketing / social account context',
    'Content Brain initialization',
    'Initial Creative Direction',
    'Initial Visual DNA decision workflow',
    'Channel strategy',
    'Initial content pillars',
    'Marketing baseline',
  ],
  includes: [
    'Content Brain initialization',
    'Initial Creative Direction territories',
    'Initial Visual DNA decision workflow',
    'Channel strategy + initial content pillars',
  ],
  governanceNotes:
    'Foundation activates intelligence only. It never approves Creative Direction, Visual DNA, or Page 001, and never enables publishing.',
  providerRef: NO_PROVIDER_REF,
};

export const EVOLVE_RECURRING_PLANS: EvolveRecurringPlan[] = [
  {
    id: 'evolve_essential',
    slug: 'evolve-essential',
    name: 'EVOLVE ESSENTIAL',
    category: 'RECURRING_PLAN',
    billingType: 'RECURRING_MONTHLY',
    priceCents: 125_000,
    priceQualifier: 'FIXED',
    billingInterval: 'MONTHLY',
    description: 'For businesses that need consistent marketing while remaining actively involved.',
    positioning: 'OPERATE — EVOLVE assists and operates, but the client still provides meaningful source material and participates more heavily.',
    serviceModel: 'EVOLVE works WITH you.',
    recommended: false,
    requiresFoundation: true,
    customScopeRequired: false,
    availability: 'AVAILABLE',
    channelLimit: 1,
    campaignCapacity: { min: 1, max: 1 },
    assetCapacity: { min: 8, max: 10 },
    features: [
      'One active brand / organization',
      'One primary campaign at a time',
      'Monthly marketing planning',
      'Content Brain intelligence',
      'EVOLVE recommendations',
      'One primary social channel',
      'Monthly content plan',
      'Copy / captions',
      '~8\u201310 finished content assets/month',
      'Creative Direction',
      'Governed asset generation / production',
      'Approval workflow',
      'Scheduling / publishing where provider readiness permits',
      'Monthly performance intelligence',
    ],
    governanceNotes:
      'Asset/channel counts are capacity guidelines, not the value proposition. Publishing still requires provider readiness and founder/client approval regardless of plan.',
    providerRef: NO_PROVIDER_REF,
  },
  {
    id: 'evolve_growth',
    slug: 'evolve-growth',
    name: 'EVOLVE GROWTH',
    category: 'RECURRING_PLAN',
    billingType: 'RECURRING_MONTHLY',
    priceCents: 250_000,
    priceQualifier: 'FIXED',
    billingInterval: 'MONTHLY',
    description: 'Primary recommended package for businesses actively pursuing growth.',
    positioning: 'GROW — the primary recommended recurring plan.',
    serviceModel: 'You approve. EVOLVE operates.',
    recommended: true,
    requiresFoundation: true,
    customScopeRequired: false,
    availability: 'AVAILABLE',
    channelLimit: 3,
    campaignCapacity: null,
    assetCapacity: { min: 12, max: 16 },
    features: [
      'Everything in Essential, plus:',
      '~12\u201316 finished assets/month',
      'Up to 3 active marketing channels',
      'Deeper campaign development',
      'Custom graphic production',
      'Short-form / reel creative',
      'Campaign-level Creative Direction',
      'Content repurposing',
      'Active Content Brain learning',
      'Competitive / content opportunity intelligence',
      'Monthly campaign review',
      'Deeper performance recommendations',
      'Greater EVOLVE operational autonomy',
    ],
    governanceNotes: 'Not unlimited production. Capacity is a guideline the founder/client can see, not a hard promise of volume.',
    providerRef: NO_PROVIDER_REF,
  },
  {
    id: 'evolve_studio',
    slug: 'evolve-studio',
    name: 'EVOLVE STUDIO',
    category: 'RECURRING_PLAN',
    billingType: 'RECURRING_MONTHLY',
    priceCents: 450_000,
    priceQualifier: 'FIXED',
    billingInterval: 'MONTHLY',
    description: 'A substantially done-for-you creative marketing department.',
    positioning: 'SCALE PRODUCTION — a substantially done-for-you creative marketing department.',
    serviceModel: 'EVOLVE functions as your creative marketing department.',
    recommended: false,
    requiresFoundation: true,
    customScopeRequired: false,
    availability: 'AVAILABLE',
    channelLimit: 5,
    campaignCapacity: null,
    assetCapacity: { min: 20, max: 30 },
    features: [
      'Everything in Growth, plus:',
      '~20\u201330 finished assets/month',
      'Up to 5 active marketing channels',
      'Multiple simultaneous campaigns within governed capacity',
      'Heavier FAL / AI visual production',
      'Advanced art direction',
      'Campaign worlds',
      'Motion / video creative',
      'Email campaign creative',
      'Launch campaign support',
      'Deeper cross-channel adaptation',
      'Priority production',
      'Higher production autonomy',
    ],
    governanceNotes:
      'EVOLVE STUDIO is an EVOLVE service-tier name only. Studio World remains an independent, distinct production infrastructure product — this tier does not merge runtimes, organization identity, or product boundaries.',
    providerRef: NO_PROVIDER_REF,
  },
  {
    id: 'evolve_private',
    slug: 'evolve-private',
    name: 'EVOLVE PRIVATE',
    category: 'RECURRING_PLAN',
    billingType: 'RECURRING_MONTHLY',
    priceCents: 750_000,
    priceQualifier: 'STARTING_AT',
    billingInterval: 'MONTHLY',
    description: 'High-touch external marketing department / custom engagement.',
    positioning: 'CUSTOM MARKETING DEPARTMENT — a custom external marketing operation.',
    serviceModel: 'A custom external marketing operation.',
    recommended: false,
    requiresFoundation: true,
    customScopeRequired: true,
    availability: 'CUSTOM_SCOPE_REQUIRED',
    channelLimit: null,
    campaignCapacity: null,
    assetCapacity: null,
    features: [
      'Multiple campaigns',
      'Multi-channel strategy',
      'High-volume production',
      'Advanced creative',
      'Launch strategy',
      'Email',
      'Social',
      'Campaign architecture',
      'Custom workflows',
      'Leadership / founder strategy',
      'Priority turnaround',
      'Governed Studio World production where appropriate',
    ],
    governanceNotes: 'Private is not unlimited. Actual scope is quoted per production requirements — no maximum asset counts or channel limits are fabricated.',
    providerRef: NO_PROVIDER_REF,
  },
];

export const EVOLVE_PROJECT_SERVICES: EvolveProjectService[] = [
  {
    id: 'creative_direction_intensive',
    slug: 'creative-direction-intensive',
    name: 'CREATIVE DIRECTION INTENSIVE',
    category: 'PROJECT_SERVICE',
    billingType: 'PROJECT_SCOPED',
    priceCents: 150_000,
    priceQualifier: 'FIXED',
    billingInterval: 'PROJECT',
    description: 'Develop and evaluate multiple creative territories before establishing/promoting Visual DNA.',
    positioning: 'Brand intelligence \u2192 3 distinct territories \u2192 specimens \u2192 compare \u2192 founder/client decision.',
    purpose: 'Develop and evaluate multiple creative territories before establishing/promoting Visual DNA.',
    recommended: false,
    requiresFoundation: false,
    customScopeRequired: false,
    scopeDependent: false,
    availability: 'AVAILABLE',
    features: ['3 distinct creative territories', 'Specimen comparison', 'APPROVE / REFINE / HYBRIDIZE / REJECT decision gate'],
    governanceNotes: 'Purchase does NOT equal approval. Visual DNA only promotes through the canonical founder/client approval workflow.',
    providerRef: NO_PROVIDER_REF,
  },
  {
    id: 'content_sprint',
    slug: 'content-sprint',
    name: 'CONTENT SPRINT',
    category: 'PROJECT_SERVICE',
    billingType: 'PROJECT_SCOPED',
    priceCents: 125_000,
    priceQualifier: 'STARTING_AT',
    billingInterval: 'PROJECT',
    description: 'Finite governed content-production batch without ongoing marketing management.',
    positioning: 'A governed, finite production batch — not an open-ended retainer.',
    purpose: 'Finite governed content-production batch without ongoing marketing management.',
    recommended: false,
    requiresFoundation: false,
    customScopeRequired: false,
    scopeDependent: true,
    availability: 'AVAILABLE_BY_SCOPE',
    features: ['Scope-dependent asset batch', 'Governed approval workflow'],
    governanceNotes: 'Scope-dependent — never implies unlimited assets.',
    providerRef: NO_PROVIDER_REF,
  },
  {
    id: 'launch_campaign',
    slug: 'launch-campaign',
    name: 'LAUNCH CAMPAIGN',
    category: 'PROJECT_SERVICE',
    billingType: 'PROJECT_SCOPED',
    priceCents: 250_000,
    priceQualifier: 'STARTING_AT',
    billingInterval: 'PROJECT',
    description: 'Campaign Creative Direction, campaign concept, messaging, key visuals, and a launch content package.',
    positioning: 'One moment. Full creative execution.',
    purpose: 'Campaign Creative Direction, campaign concept, messaging, key visuals, launch content package.',
    recommended: false,
    requiresFoundation: false,
    customScopeRequired: false,
    scopeDependent: true,
    availability: 'AVAILABLE_BY_SCOPE',
    features: ['Campaign Creative Direction', 'Campaign concept + messaging', 'Key visuals', 'Launch content package'],
    governanceNotes: 'Scope-dependent — never implies unlimited assets.',
    providerRef: NO_PROVIDER_REF,
  },
  {
    id: 'campaign_world',
    slug: 'campaign-world',
    name: 'CAMPAIGN WORLD',
    category: 'PROJECT_SERVICE',
    billingType: 'PROJECT_SCOPED',
    priceCents: 400_000,
    priceQualifier: 'STARTING_AT',
    billingInterval: 'PROJECT',
    description: 'Large art-directed campaign system spanning FAL asset production, social, story/reel, feed treatments, and motion concepts.',
    positioning: 'A large art-directed campaign system, not a single asset drop.',
    purpose: 'Large art-directed campaign system.',
    recommended: false,
    requiresFoundation: false,
    customScopeRequired: false,
    scopeDependent: true,
    availability: 'AVAILABLE_BY_SCOPE',
    features: [
      'Campaign visual world',
      'FAL asset production',
      'Social creative',
      'Story / reel creative',
      'Feed treatments',
      'Motion concepts',
      'Cross-channel creative system',
    ],
    governanceNotes: 'Scope-dependent — never implies unlimited assets.',
    providerRef: NO_PROVIDER_REF,
  },
  {
    id: 'visual_dna_refresh',
    slug: 'visual-dna-refresh',
    name: 'VISUAL DNA REFRESH',
    category: 'PROJECT_SERVICE',
    billingType: 'PROJECT_SCOPED',
    priceCents: 75_000,
    priceQualifier: 'STARTING_AT',
    billingInterval: 'PROJECT',
    description: 'Evolve the visual language of an existing EVOLVE client without rebuilding the underlying brand.',
    positioning: 'Evolve the visual language — not a rebuild.',
    purpose: 'Evolve the visual language of an existing EVOLVE client without rebuilding the underlying brand.',
    recommended: false,
    requiresFoundation: false,
    customScopeRequired: false,
    scopeDependent: true,
    availability: 'AVAILABLE_BY_SCOPE',
    features: ['Visual DNA refresh proposal', 'Founder/client approval workflow'],
    governanceNotes: 'Refresh proposal \u2260 Visual DNA approval. Existing canonical approval governance remains authoritative.',
    providerRef: NO_PROVIDER_REF,
  },
];

/**
 * Paid advertising spend must never be bundled into EVOLVE package prices, and
 * EVOLVE never pays the client's ad platforms. No active ad-management
 * integration exists in this repository, so availability is truthfully
 * NOT_CONFIGURED rather than AVAILABLE.
 */
export const EVOLVE_PAID_MEDIA_SERVICE: EvolvePaidMediaService = {
  id: 'paid_media_management',
  slug: 'paid-media-management',
  name: 'PAID MEDIA MANAGEMENT',
  category: 'PAID_MEDIA',
  managementFeeMinCents: 75_000,
  percentageOfSpend: 0.15,
  feeLogic: 'HIGHER_OF',
  adSpendBilledSeparately: true,
  availability: 'NOT_CONFIGURED',
  description:
    '$750/month minimum OR 15% of ad spend, whichever is greater. Ad spend is paid separately by the client — EVOLVE never pays Meta/Google/TikTok/etc. on the client\u2019s behalf.',
  governanceNotes: 'No active ad-management implementation exists yet. This defines the commercial product truthfully without fabricating live functionality.',
};

export function getEvolveServiceCatalog(): EvolveServiceCatalog {
  return {
    foundation: EVOLVE_FOUNDATION,
    plans: EVOLVE_RECURRING_PLANS,
    projectServices: EVOLVE_PROJECT_SERVICES,
    paidMedia: EVOLVE_PAID_MEDIA_SERVICE,
  };
}

export function getEvolvePlanById(id: string): EvolveRecurringPlan | undefined {
  return EVOLVE_RECURRING_PLANS.find((p) => p.id === id);
}

export function getEvolveProjectServiceById(id: EvolveProjectServiceId | string): EvolveProjectService | undefined {
  return EVOLVE_PROJECT_SERVICES.find((s) => s.id === id);
}

export function getRecommendedEvolvePlan(): EvolveRecurringPlan {
  const recommended = EVOLVE_RECURRING_PLANS.find((p) => p.recommended);
  if (!recommended) throw new Error('EVOLVE catalog invariant violated — no recommended plan configured');
  return recommended;
}

/** Canonical display formatting — the ONLY place price strings are produced. */
export function formatEvolvePrice(
  priceCents: number,
  priceQualifier: EvolvePriceQualifier,
  billingInterval: EvolveBillingInterval,
): string {
  const dollars = priceCents / 100;
  const amount = `$${dollars.toLocaleString('en-US')}`;
  const withQualifier = priceQualifier === 'STARTING_AT' ? `FROM ${amount}` : amount;
  return billingInterval === 'MONTHLY' ? `${withQualifier} / MONTH` : withQualifier;
}

/** Higher-of paid-media fee calculation. adSpendCents is the client's ad spend for the period. */
export function computePaidMediaFeeCents(adSpendCents: number): number {
  if (!Number.isFinite(adSpendCents) || adSpendCents < 0) {
    throw new Error('adSpendCents must be a non-negative finite number');
  }
  const percentageFeeCents = Math.round(adSpendCents * EVOLVE_PAID_MEDIA_SERVICE.percentageOfSpend);
  return Math.max(EVOLVE_PAID_MEDIA_SERVICE.managementFeeMinCents, percentageFeeCents);
}

/** Canonical package hierarchy — display/ordering order, never re-derive elsewhere. */
export const EVOLVE_PACKAGE_HIERARCHY: Array<'FOUNDATION' | EvolvePlanId> = [
  'FOUNDATION',
  'evolve_essential',
  'evolve_growth',
  'evolve_studio',
  'evolve_private',
];

export const EVOLVE_COMMERCIAL_HIERARCHY_LABELS: Record<(typeof EVOLVE_PACKAGE_HIERARCHY)[number], string> = {
  FOUNDATION: 'ACTIVATE',
  evolve_essential: 'OPERATE',
  evolve_growth: 'GROW',
  evolve_studio: 'SCALE PRODUCTION',
  evolve_private: 'CUSTOM MARKETING DEPARTMENT',
};

export type { EvolvePlanId, EvolveProjectServiceId };
