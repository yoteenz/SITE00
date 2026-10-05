/**
 * SITE 00 — project-agnostic MONETIZATION CONTRACT (foundation).
 *
 * Any SITE 00 product (personal or client) can declare plans, semantic capabilities, add-ons, central pricing,
 * billing boundaries, commerce / referral disclosure rules and data-use constraints in this shape. The contract is
 * structural: it never implies that billing, checkout, trials or referrals are live.
 *
 * Plan → entitlements → capabilities → UI behaviour. Feature code asks for CAPABILITIES (see entitlements.ts),
 * never for plan names.
 *
 * Money follows the SITE 00 convention (integer cents); `null` = not decided (TBD).
 */

import type { PaymentProviderId } from '../site00-commercial-audit/paymentAbstraction.js';

export const MONETIZATION_CONTRACT_VERSION = 'SITE00.MONETIZATION_CONTRACT.V1' as const;

/* ───────────── plans ───────────── */

/** Structural entitlement classes. BUSINESS is its own line — never a consumer tier above PRO-like plans. */
export type PlanClass = 'FREE' | 'CONSUMER_PAID' | 'BUSINESS' | 'ADD_ON';
export type PlanAudience = 'CONSUMER' | 'BUSINESS';
export type PlanStatus = 'DRAFT' | 'ACTIVE' | 'RETIRED';
/** Who a subscription belongs to. Subscriptions attach to a BILLING ACCOUNT, never permanently to one user record. */
export type AccountScope = 'INDIVIDUAL' | 'HOUSEHOLD' | 'FAMILY' | 'BUSINESS';
export type BillingProviderRef = PaymentProviderId | 'NONE';
export type BillingStatus = 'NOT_CONFIGURED' | 'TEST' | 'LIVE';

export type UsagePeriod = 'PER_DAY' | 'PER_MONTH' | 'PER_BILLING_PERIOD' | 'UNLIMITED';
export type UsageLimit = {
  capability: string;
  limitType: 'REQUESTS' | 'RUNS' | 'EXPORTS' | 'ITEMS';
  period: UsagePeriod;
  /** Relative depth only until numbers are decided. */
  tier: 'LIMITED' | 'HIGHER' | 'UNLIMITED';
  /** `null` = number not decided (TBD). Never enforce a guessed number. */
  amount: number | null;
};

/** Trials are supported structurally; no length is assumed. */
export type TrialPolicy = {
  enabled: boolean;
  /** `null` = not decided. */
  lengthDays: number | null;
  /** Capabilities granted during the trial: the plan's own, or an explicit list. */
  trialCapabilities: 'PLAN' | string[];
  postTrialPlan: string | null;
};

export type DowngradeBehavior = {
  toPlan: string;
  userData: 'RETAIN' | 'RETAIN_READ_ONLY' | 'TBD';
  premiumOutputs: 'HIDE' | 'READ_ONLY' | 'TBD';
  notes?: string;
};

export type PlanDefinition = {
  planId: string;
  /** Display name (uppercase), e.g. used by upgrade copy — the only place a plan's name lives. */
  planName: string;
  /** Short access-class label for inspection (e.g. FREE / PLUS / PRO / BUSINESS / ADD_ON). */
  tierLabel: string;
  planClass: PlanClass;
  audience: PlanAudience;
  status: PlanStatus;
  /** Can an account subscribe to it as its BASE plan (false for the add-on class container). */
  baseSubscribable: boolean;
  /** Rank within its audience line (upgrade direction). Lines never mix. */
  rank: number;
  /** Plans whose capabilities this plan inherits — explicit, never an implicit ladder across audiences. */
  includes: string[];
  capabilities: string[];
  limits: UsageLimit[];
  /** Add-ons that may attach to this plan. */
  addOns: string[];
  trialPolicy: TrialPolicy;
  upgradePaths: string[];
  downgradeBehavior: DowngradeBehavior | null;
  billingProvider: BillingProviderRef;
  billingStatus: BillingStatus;
  eligibility: string[];
  regionRules: { regions: string[] | 'ALL' | 'TBD'; notes?: string };
  /** Whether disclosed affiliate / referral options may appear for accounts on this plan. */
  affiliateEligibility: 'NONE' | 'DISCLOSED_ONLY';
  businessEligibility: boolean;
  accountScopes: AccountScope[];
};

/* ───────────── capabilities ───────────── */

export type CapabilityKind = 'FEATURE' | 'ANALYSIS' | 'COMPUTE' | 'DATA_EXPORT' | 'COMMERCE' | 'REFERRAL';
/**
 * Where protection actually lives. SERVER_ENFORCED = paid data or compute: the trusted backend must authorize every
 * request (serverAuthorization.ts). CLIENT_PRESENTATION = presentation only (nothing premium is sent to the client).
 */
export type CapabilityEnforcement = 'CLIENT_PRESENTATION' | 'SERVER_ENFORCED';

export type CapabilityDefinition = {
  id: string;
  label: string;
  domain: 'CORE' | 'ADVANCED' | 'AI' | 'RECORDS' | 'BUSINESS' | 'COMMERCE' | 'REFERRAL';
  kind: CapabilityKind;
  enforcement: CapabilityEnforcement;
  /** Product-tree family ids where the capability appears. */
  families: string[];
  /** Never removed by plan, downgrade or entitlement failure (e.g. basic explanations, account security, own-data export). */
  safetyFloor?: boolean;
  /** Commerce / referral capabilities are revenue surfaces, not paid features; they stay off until enabled. */
  surfaceStatus?: 'ENABLED' | 'DISABLED';
  notes?: string;
};

/* ───────────── add-ons ───────────── */

export type AddOnDefinition = {
  addOnId: string;
  name: string;
  status: PlanStatus;
  /** Entitlement class container the add-on belongs to. */
  entitlementClass: string;
  capabilityGrants: string[];
  eligiblePlans: string[];
  billingType: 'RECURRING' | 'ONE_TIME' | 'USAGE' | 'TBD';
  limits: UsageLimit[];
};
export type AddOnPurchaseStatus = 'NONE' | 'PENDING' | 'ACTIVE' | 'PAYMENT_ISSUE' | 'CANCELED' | 'EXPIRED';
export type AccountAddOn = { addOnId: string; purchaseStatus: AddOnPurchaseStatus };

/* ───────────── subscription / trial / account ───────────── */

export type SubscriptionState = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED' | 'PAUSED' | 'NONE';
export type BillingAccount = { accountId: string; scope: AccountScope; ownerUserId: string; memberUserIds: string[] };
export type Subscription = {
  accountId: string;
  planId: string;
  state: SubscriptionState;
  startDate: string | null;
  renewalDate: string | null;
  cancelAtPeriodEnd: boolean;
  provider: BillingProviderRef;
  providerRef: string | null;
};
export type TrialRecord = {
  trialPlan: string;
  startDate: string;
  endDate: string;
  trialCapabilities: 'PLAN' | string[];
  postTrialPlan: string;
  trialUsed: boolean;
};

/* ───────────── pricing (central; never in components) ───────────── */

export type PriceAmount = { amountCents: number | null; currency: string | null };
export type PricingEntry = {
  productId: string;
  productKind: 'PLAN' | 'ADD_ON';
  monthly: PriceAmount;
  annual: PriceAmount;
  region: string | 'ALL' | 'TBD';
  intro: PriceAmount | null;
  promotion: string | null;
  effectiveDate: string | null;
  status: 'TBD' | 'DRAFT' | 'APPROVED';
};

/* ───────────── trust rules (types make violations un-typeable) ───────────── */

export type DataUsePolicy = {
  userFinancialDataSale: 'PROHIBITED';
  userFinancialDataAdTargeting: 'PROHIBITED';
  personalizedProductFunctionality: 'PERMITTED_SUBJECT_TO_CONSENT_AND_POLICY';
  displayAds: 'PROHIBITED';
  adNetworkIntegration: 'PROHIBITED';
  /** Product-architecture rule only — no legal claims are made in UI from this record. */
  uiLegalClaims: 'NONE_YET';
};

export type MonetizedPlacementKind = 'EDITORIAL_RECOMMENDATION' | 'AFFILIATE_LINK' | 'SPONSORED_PLACEMENT';
export type CommerceFlowStage = 'AFFORDABILITY_DECISION' | 'USER_CHOSE_TO_SHOP' | 'MERCHANT_OPTIONS';
export type ReferralType =
  | 'HYSA'
  | 'CREDIT_CARD'
  | 'INSURANCE'
  | 'MORTGAGE'
  | 'REFINANCING'
  | 'TAX_PROFESSIONAL'
  | 'BOOKKEEPER'
  | 'FINANCIAL_PLANNER'
  | 'ESTATE_SERVICES'
  | 'HOTEL'
  | 'FLIGHT'
  | 'EXPERIENCE'
  | 'TRAVEL_INSURANCE'
  | 'MERCHANT'
  | 'CASHBACK';

export type RecommendationPolicy = {
  /** Compensation never reaches the financial verdict (affordability, safe-to-spend, payoff order, …). */
  independenceRule: 'VERDICT_INDEPENDENT_OF_COMPENSATION';
  payToRank: 'PROHIBITED';
  disclosureRequiredFor: MonetizedPlacementKind[];
  /** Verdict first, then the user chooses to shop, only then merchant / affiliate options. */
  commerceFlowOrder: readonly ['AFFORDABILITY_DECISION', 'USER_CHOSE_TO_SHOP', 'MERCHANT_OPTIONS'];
};

/* ───────────── analytics / revenue ───────────── */

export const MONETIZATION_EVENT_NAMES = [
  'upgrade_viewed',
  'upgrade_started',
  'checkout_started',
  'subscription_started',
  'subscription_changed',
  'subscription_canceled',
  'feature_gate_seen',
  'feature_preview_used',
  'trial_started',
  'trial_converted',
  'trial_expired',
  'affiliate_link_opened',
] as const;
export type MonetizationEventName = (typeof MONETIZATION_EVENT_NAMES)[number];

export const REVENUE_SOURCES = ['SUBSCRIPTION', 'ADD_ON', 'AFFILIATE', 'TRAVEL', 'COMMERCE', 'PROFESSIONAL_REFERRAL', 'BUSINESS'] as const;
export type RevenueSource = (typeof REVENUE_SOURCES)[number];

/* ───────────── screens / features / families ───────────── */

/** How much of a screen or feature an account can use. Feature-level gating is preferred over whole-screen locks. */
export type ScreenAccess = 'FULL' | 'LIMITED' | 'PREVIEW' | 'LOCKED' | 'ADD_ON_REQUIRED' | 'BUSINESS_ONLY';
export type PaywallKind = 'NONE' | 'SOFT' | 'HARD';
export type FamilyDefaultAccess = 'FULL' | 'FREE_PREVIEW' | 'LIMITED' | 'PLAN_REQUIRED' | 'ADD_ON_REQUIRED' | 'BUSINESS_ONLY' | 'UNDECIDED';

/** Optional family-level monetization metadata (carried by the family production contract). */
export type FamilyMonetization = {
  defaultAccess: FamilyDefaultAccess;
  capabilityRequirements: string[];
  premiumChildren: string[];
  premiumInteractions: string[];
  usageLimits: UsageLimit[];
  addOnEligibility: string[];
  /** false = no upgrade / plan / trial surface may ever render in this family. */
  upgradeSurfaceAllowed: boolean;
  monetizationNotes: string;
  status: 'DRAFT' | 'FOUNDER_APPROVED';
};

/** One gated feature (structural metadata the DESIGN workspace can inspect). */
export type FeatureEntitlement = {
  featureId: string;
  label: string;
  familyId: string;
  access: ScreenAccess;
  capability: string | null;
  paywall: PaywallKind;
  /** Component / authority that would present the upgrade (never rendered in families that disallow it). */
  upgradeSurface: string | null;
  status: 'DRAFT' | 'FOUNDER_APPROVED';
};

/** Draft classification row for founder review (candidate labels are project-defined). */
export type DraftEntitlementRow = {
  familyId: string;
  familyName: string;
  defaultAccess: FamilyDefaultAccess;
  familyCandidate: string;
  capabilities: { capability: string; candidate: string; note?: string }[];
  rationale: string;
  founderApproved: false;
};

/* ───────────── the contract ───────────── */

export type ProjectMonetizationContract = {
  contractVersion: typeof MONETIZATION_CONTRACT_VERSION;
  projectId: string;
  /** FOUNDATION = structure only (no prices, no billing, no live surfaces). */
  stage: 'FOUNDATION' | 'PRICING_DESIGN' | 'BILLING_INTEGRATION' | 'LIVE';
  defaultPlanId: string;
  plans: PlanDefinition[];
  capabilities: CapabilityDefinition[];
  addOns: AddOnDefinition[];
  pricing: PricingEntry[];
  billing: { provider: BillingProviderRef; status: BillingStatus; checkout: 'NOT_IMPLEMENTED' | 'IMPLEMENTED' };
  dataUse: DataUsePolicy;
  recommendations: RecommendationPolicy;
  referrals: { types: ReferralType[]; status: 'DISABLED' | 'ENABLED' };
  analytics: { events: readonly MonetizationEventName[]; financialDataInPayloads: 'PROHIBITED' };
  revenueSources: readonly RevenueSource[];
  /** Upgrade copy grammar: FACT → VALUE → ACTION. No interruption, no dark patterns. */
  upgradeGrammar: 'FACT_VALUE_ACTION';
  features: FeatureEntitlement[];
  draftEntitlementMap?: DraftEntitlementRow[];
};

export const planById = (c: ProjectMonetizationContract, planId: string) => c.plans.find((p) => p.planId === planId) ?? null;
export const capabilityById = (c: ProjectMonetizationContract, id: string) => c.capabilities.find((x) => x.id === id) ?? null;
export const addOnById = (c: ProjectMonetizationContract, id: string) => c.addOns.find((a) => a.addOnId === id) ?? null;
export const safetyFloorCapabilities = (c: ProjectMonetizationContract) => c.capabilities.filter((x) => x.safetyFloor).map((x) => x.id);
