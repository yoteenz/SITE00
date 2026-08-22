/**
 * SITE 00 EVOLVE — canonical commercial/pricing domain types.
 *
 * This is the ONE source of truth for EVOLVE pricing. It is intentionally kept
 * dependency-free (no Supabase, no fs, no env) so it can be imported from both
 * the server (api/_lib) and the client (src/site00) without pulling backend
 * code into the browser bundle — the same pattern already used for
 * shared/site00-marketing.
 *
 * Money is always stored as integer cents. Never introduce a floating-point
 * dollar amount as billing truth.
 */

export type EvolveBillingType = 'ONE_TIME' | 'RECURRING_MONTHLY' | 'PROJECT_SCOPED' | 'USAGE_BASED';

export type EvolvePriceQualifier = 'FIXED' | 'STARTING_AT';

export type EvolveBillingInterval = 'ONE_TIME' | 'MONTHLY' | 'PROJECT';

export type EvolveServiceCategory = 'ACTIVATION' | 'RECURRING_PLAN' | 'PROJECT_SERVICE' | 'PAID_MEDIA';

export type EvolvePlanId = 'evolve_essential' | 'evolve_growth' | 'evolve_studio' | 'evolve_private';

export const EVOLVE_PLAN_IDS: EvolvePlanId[] = ['evolve_essential', 'evolve_growth', 'evolve_studio', 'evolve_private'];

export type EvolveProjectServiceId =
  | 'creative_direction_intensive'
  | 'content_sprint'
  | 'launch_campaign'
  | 'campaign_world'
  | 'visual_dna_refresh';

export const EVOLVE_FOUNDATION_ID = 'evolve_foundation' as const;
export type EvolveActivationServiceId = typeof EVOLVE_FOUNDATION_ID;

/** Truthful availability — never implies functionality that does not exist yet. */
export type EvolveServiceAvailability = 'AVAILABLE' | 'CUSTOM_SCOPE_REQUIRED' | 'NOT_CONFIGURED' | 'AVAILABLE_BY_SCOPE';

export type EvolveCapacityRange = { min: number; max: number } | null;

/** Optional future billing-provider identifiers — SITE 00 owns commercial identity, not Stripe. */
export type EvolveProviderRef = {
  stripeProductId?: string | null;
  stripePriceId?: string | null;
};

export type EvolveServiceCatalogEntryBase = {
  id: string;
  slug: string;
  name: string;
  category: EvolveServiceCategory;
  billingType: EvolveBillingType;
  priceCents: number;
  priceQualifier: EvolvePriceQualifier;
  billingInterval: EvolveBillingInterval;
  description: string;
  positioning: string;
  recommended: boolean;
  requiresFoundation: boolean;
  customScopeRequired: boolean;
  availability: EvolveServiceAvailability;
  features: string[];
  governanceNotes: string;
  providerRef: EvolveProviderRef;
};

export type EvolveRecurringPlan = EvolveServiceCatalogEntryBase & {
  id: EvolvePlanId;
  category: 'RECURRING_PLAN';
  /** Primary value framing shown above capacity details, e.g. "You approve. EVOLVE operates." */
  serviceModel: string;
  channelLimit: number | null;
  campaignCapacity: EvolveCapacityRange;
  assetCapacity: EvolveCapacityRange;
};

export type EvolveActivationService = EvolveServiceCatalogEntryBase & {
  id: EvolveActivationServiceId;
  category: 'ACTIVATION';
  includes: string[];
};

export type EvolveProjectService = EvolveServiceCatalogEntryBase & {
  id: EvolveProjectServiceId;
  category: 'PROJECT_SERVICE';
  purpose: string;
  scopeDependent: boolean;
};

export type EvolvePaidMediaService = {
  id: 'paid_media_management';
  slug: 'paid-media-management';
  name: 'PAID MEDIA MANAGEMENT';
  category: 'PAID_MEDIA';
  managementFeeMinCents: number;
  percentageOfSpend: number;
  feeLogic: 'HIGHER_OF';
  adSpendBilledSeparately: true;
  availability: EvolveServiceAvailability;
  description: string;
  governanceNotes: string;
};

export type EvolveServiceCatalog = {
  foundation: EvolveActivationService;
  plans: EvolveRecurringPlan[];
  projectServices: EvolveProjectService[];
  paidMedia: EvolvePaidMediaService;
};

/** Truthful Foundation ↔ Identity-intelligence qualification states. */
export type EvolveFoundationStatus =
  | 'FOUNDATION_REQUIRED'
  | 'FOUNDATION_INCLUDED'
  | 'FOUNDATION_COMPLETED'
  | 'FOUNDATION_WAIVED_WITH_CANONICAL_INTELLIGENCE';

export type EvolveFoundationQualification = {
  status: EvolveFoundationStatus;
  /** Canonical intelligence categories still missing (empty when satisfied). */
  missing: string[];
  satisfiedBy: 'CONTENT_BRAIN_CANONICAL_INTELLIGENCE' | 'EXPLICIT_FOUNDATION_COMPLETION' | 'NONE';
  explanation: string;
};

export type EvolveEntitlementSummary = {
  planId: EvolvePlanId | null;
  channelLimit: number | null;
  campaignCapacity: EvolveCapacityRange;
  assetCapacity: EvolveCapacityRange;
  customScopeRequired: boolean;
};

/**
 * Whether EVOLVE's commercial (paid-service) model even applies to this
 * organization. This is intentionally distinct from operational classification —
 * Studio World is production infrastructure (never a marketing client); founder
 * brands may use EVOLVE internally without being a billable client.
 */
export type EvolveCommercialApplicability = 'BILLABLE_CLIENT' | 'INTERNAL_NON_BILLING' | 'NOT_APPLICABLE';

export type EvolveCommercialPlanSelection = {
  id: EvolvePlanId;
  name: string;
  priceCents: number;
  priceQualifier: EvolvePriceQualifier;
  billingInterval: EvolveBillingInterval;
  serviceModel: string;
};

export type EvolveCommercialState = {
  organizationSlug: string;
  applicability: EvolveCommercialApplicability;
  applicabilityNote: string;
  plan: EvolveCommercialPlanSelection | null;
  planStatus: 'ACTIVE' | 'NOT_SELECTED' | 'NOT_APPLICABLE';
  foundation: EvolveFoundationQualification | null;
  entitlements: EvolveEntitlementSummary | null;
  /** Always [] until a real project-services ledger exists — never fabricated. */
  projectServicesHistory: Array<{ id: string; serviceId: EvolveProjectServiceId; status: string }>;
  paidMedia: { status: EvolveServiceAvailability; note: string };
  usageMetering: 'NOT_AVAILABLE';
  billing: { integrated: false; provider: 'NONE'; stripeReady: boolean; note: string };
};
