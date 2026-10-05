/**
 * Entitlement resolution: PLAN → ENTITLEMENTS → CAPABILITIES. Pure and deterministic; safe on client and server.
 *
 * Rules
 *  - No subscription → the contract's default (free) plan.
 *  - Anything unknown or failing (unknown plan, entitlement load failure, offline billing, provider unavailable,
 *    payment issue, expired access) falls back to the default plan + safety-floor capabilities. It NEVER falls
 *    forward into paid capabilities, and add-ons are not granted while state is uncertain.
 *  - Lines never mix: a plan only inherits what it explicitly `includes`.
 *  - Only SERVER_VERIFIED resolutions are authoritative. Client resolutions drive presentation only
 *    (see serverAuthorization.ts).
 */

import {
  addOnById,
  capabilityById,
  planById,
  safetyFloorCapabilities,
  type AccountAddOn,
  type FeatureEntitlement,
  type PlanDefinition,
  type ProjectMonetizationContract,
  type Subscription,
  type SubscriptionState,
  type TrialRecord,
  type UsageLimit,
} from './contract.js';

export type EntitlementSource = 'SERVER_VERIFIED' | 'CLIENT_CACHE' | 'DESIGN_PREVIEW' | 'NONE';
export const ENTITLEMENT_FAILURES = ['UNKNOWN_PLAN', 'OFFLINE_BILLING', 'ENTITLEMENT_LOAD_FAILURE', 'EXPIRED_ACCESS', 'PAYMENT_ISSUE', 'PROVIDER_UNAVAILABLE'] as const;
export type EntitlementFailure = (typeof ENTITLEMENT_FAILURES)[number];

export type EntitlementInput = {
  source: EntitlementSource;
  subscription?: Subscription | null;
  addOns?: AccountAddOn[];
  trial?: TrialRecord | null;
  /** A failure observed while loading entitlements (billing offline, provider down, …). */
  failure?: EntitlementFailure | null;
  now?: Date | string;
};

export type ResolvedEntitlements = {
  projectId: string;
  /** RESOLVED = the account's real state; FALLBACK = safe default because state is unknown / failing. */
  status: 'RESOLVED' | 'FALLBACK';
  source: EntitlementSource;
  /** Only server-verified resolutions may authorize paid data or compute. */
  authoritative: boolean;
  subscriptionState: SubscriptionState;
  requestedPlanId: string | null;
  effectivePlanId: string;
  capabilities: string[];
  limits: UsageLimit[];
  addOns: { granted: string[]; ignored: { addOnId: string; reason: string }[] };
  trialActive: boolean;
  failure: EntitlementFailure | null;
};

/** Epoch ms, null when absent, NaN when unparseable (callers treat NaN as invalid → fail closed). */
const toTime = (v: Date | string | null | undefined) => (v == null ? null : new Date(v).getTime());
/** Disabled surfaces (commerce / referrals not switched on) are never reported as available, whatever the plan says. */
const enabledOnly = (c: ProjectMonetizationContract, ids: string[]) => [...new Set(ids)].filter((id) => capabilityById(c, id)?.surfaceStatus !== 'DISABLED');

/** Capabilities of a plan including explicitly included plans (cycle-safe). */
export function planCapabilities(c: ProjectMonetizationContract, planId: string, seen = new Set<string>()): string[] {
  if (seen.has(planId)) return [];
  seen.add(planId);
  const plan = planById(c, planId);
  if (!plan) return [];
  return [...new Set([...plan.includes.flatMap((p) => planCapabilities(c, p, seen)), ...plan.capabilities])];
}

function planLimits(c: ProjectMonetizationContract, planId: string, seen = new Set<string>()): UsageLimit[] {
  if (seen.has(planId)) return [];
  seen.add(planId);
  const plan = planById(c, planId);
  if (!plan) return [];
  return [...plan.includes.flatMap((p) => planLimits(c, p, seen)), ...plan.limits];
}

const TIER_ORDER: Record<UsageLimit['tier'], number> = { LIMITED: 0, HIGHER: 1, UNLIMITED: 2 };
/** Most generous limit per capability (a higher plan / add-on lifts, never lowers, a limit). */
function mergeLimits(limits: UsageLimit[]): UsageLimit[] {
  const best = new Map<string, UsageLimit>();
  for (const l of limits) {
    const cur = best.get(l.capability);
    if (!cur || TIER_ORDER[l.tier] > TIER_ORDER[cur.tier]) best.set(l.capability, l);
  }
  return [...best.values()];
}

function fallback(c: ProjectMonetizationContract, input: EntitlementInput, failure: EntitlementFailure, state: SubscriptionState, requested: string | null): ResolvedEntitlements {
  const caps = enabledOnly(c, [...planCapabilities(c, c.defaultPlanId), ...safetyFloorCapabilities(c)]);
  return {
    projectId: c.projectId,
    status: 'FALLBACK',
    source: input.source,
    authoritative: input.source === 'SERVER_VERIFIED',
    subscriptionState: state,
    requestedPlanId: requested,
    effectivePlanId: c.defaultPlanId,
    capabilities: caps,
    limits: mergeLimits(planLimits(c, c.defaultPlanId)),
    addOns: { granted: [], ignored: (input.addOns ?? []).map((a) => ({ addOnId: a.addOnId, reason: `NOT GRANTED WHILE ${failure}` })) },
    trialActive: false,
    failure,
  };
}

export function resolveEntitlements(c: ProjectMonetizationContract, input: EntitlementInput): ResolvedEntitlements {
  try {
    const sub = input.subscription ?? null;
    const state: SubscriptionState = sub?.state ?? 'NONE';
    const requested = sub?.planId ?? null;
    if (input.failure) return fallback(c, input, input.failure, state, requested);
    // No subscription, canceled or paused → the default (free) plan, resolved normally (add-ons still evaluated).
    const onDefault = !sub || state === 'NONE' || state === 'CANCELED' || state === 'PAUSED';
    const plan: PlanDefinition | null = planById(c, onDefault ? c.defaultPlanId : sub.planId);
    if (!plan || !plan.baseSubscribable) return fallback(c, input, 'UNKNOWN_PLAN', state, requested);
    const now = toTime(input.now ?? new Date())!;
    if (Number.isNaN(now)) return fallback(c, input, 'ENTITLEMENT_LOAD_FAILURE', state, requested);
    if (!onDefault) {
      if (state === 'EXPIRED') return fallback(c, input, 'EXPIRED_ACCESS', state, requested);
      // Grace for unpaid periods is a business decision that is not made yet → fail closed to the default plan.
      if (state === 'PAST_DUE') return fallback(c, input, 'PAYMENT_ISSUE', state, requested);
      const renewal = toTime(sub.renewalDate);
      if (sub.cancelAtPeriodEnd && renewal !== null && (Number.isNaN(renewal) || renewal < now)) return fallback(c, input, 'EXPIRED_ACCESS', state, requested);
    }

    let caps = planCapabilities(c, plan.planId);
    let trialActive = false;
    if (!onDefault && state === 'TRIALING') {
      const t = input.trial;
      const end = toTime(t?.endDate);
      if (!t || end === null || Number.isNaN(end) || end < now) return fallback(c, input, 'EXPIRED_ACCESS', state, requested);
      trialActive = true;
      if (Array.isArray(t.trialCapabilities)) caps = [...new Set([...planCapabilities(c, c.defaultPlanId), ...t.trialCapabilities])];
    }

    const granted: string[] = [];
    const ignored: { addOnId: string; reason: string }[] = [];
    let limits = planLimits(c, plan.planId);
    for (const a of input.addOns ?? []) {
      const def = addOnById(c, a.addOnId);
      if (!def) ignored.push({ addOnId: a.addOnId, reason: 'UNKNOWN ADD-ON' });
      else if (a.purchaseStatus !== 'ACTIVE') ignored.push({ addOnId: a.addOnId, reason: `PURCHASE ${a.purchaseStatus}` });
      else if (!def.eligiblePlans.includes(plan.planId)) ignored.push({ addOnId: a.addOnId, reason: `NOT ELIGIBLE ON ${plan.planId}` });
      else {
        granted.push(def.addOnId);
        caps = [...caps, ...def.capabilityGrants];
        limits = [...limits, ...def.limits];
      }
    }
    return {
      projectId: c.projectId,
      status: 'RESOLVED',
      source: input.source,
      authoritative: input.source === 'SERVER_VERIFIED',
      subscriptionState: state,
      requestedPlanId: requested,
      effectivePlanId: plan.planId,
      capabilities: enabledOnly(c, [...caps, ...safetyFloorCapabilities(c)]),
      limits: mergeLimits(limits),
      addOns: { granted, ignored },
      trialActive,
      failure: null,
    };
  } catch {
    // Entitlement failure must never crash a screen — and never reveal premium capabilities.
    return fallback(c, input, 'ENTITLEMENT_LOAD_FAILURE', 'NONE', null);
  }
}

/** The ONE question feature code asks. Never compare plan names in UI. */
export const hasCapability = (e: ResolvedEntitlements | null | undefined, capability: string) => !!e && e.capabilities.includes(capability);

export const usageLimitFor = (e: ResolvedEntitlements, capability: string): UsageLimit | null => e.limits.find((l) => l.capability === capability) ?? null;

/** Lowest-ranked base plan that grants a capability (upgrade copy derives the plan name from here, not from code). */
export function lowestPlanGranting(c: ProjectMonetizationContract, capability: string, audience?: PlanDefinition['audience']): PlanDefinition | null {
  return (
    c.plans
      .filter((p) => p.baseSubscribable && (!audience || p.audience === audience) && planCapabilities(c, p.planId).includes(capability))
      .sort((a, b) => (a.audience === b.audience ? a.rank - b.rank : a.audience === 'CONSUMER' ? -1 : 1))[0] ?? null
  );
}

export const addOnsGranting = (c: ProjectMonetizationContract, capability: string) => c.addOns.filter((a) => a.capabilityGrants.includes(capability));

/** Access class label for inspection: the tier of the lowest plan granting it, else ADD_ON, else UNASSIGNED. */
export function accessClassFor(c: ProjectMonetizationContract, capability: string | null): string {
  if (!capability) return planById(c, c.defaultPlanId)?.tierLabel ?? 'FREE';
  const plan = lowestPlanGranting(c, capability);
  if (plan) return plan.tierLabel;
  return addOnsGranting(c, capability).length ? 'ADD_ON' : 'UNASSIGNED';
}

export type ClientGateDecision = {
  /** SHOW = capability present · PREVIEW = resolved, show a preview + upgrade surface · WITHHOLD = state unknown/failing. */
  mode: 'SHOW' | 'PREVIEW' | 'WITHHOLD';
  /** Client decisions are presentation only — the server re-authorizes paid data and compute. */
  authoritative: false;
  reason: string;
};

/** Presentation decision for a feature. Unknown state withholds (never reveals premium content). */
export function clientGate(e: ResolvedEntitlements | null | undefined, capability: string): ClientGateDecision {
  if (!e) return { mode: 'WITHHOLD', authoritative: false, reason: 'ENTITLEMENTS NOT LOADED' };
  if (hasCapability(e, capability)) return { mode: 'SHOW', authoritative: false, reason: 'CAPABILITY PRESENT' };
  if (e.status === 'FALLBACK') return { mode: 'WITHHOLD', authoritative: false, reason: e.failure ?? 'FALLBACK' };
  return { mode: 'PREVIEW', authoritative: false, reason: 'CAPABILITY NOT INCLUDED' };
}

/** Inspection rows for the DESIGN workspace (structural metadata; no dashboard). */
export function buildMonetizationInspection(c: ProjectMonetizationContract, projectName: string) {
  return c.features.map((f: FeatureEntitlement) => ({
    project: projectName,
    familyId: f.familyId,
    featureId: f.featureId,
    feature: f.label,
    accessClass: f.access === 'BUSINESS_ONLY' ? 'BUSINESS' : f.access === 'ADD_ON_REQUIRED' ? 'ADD_ON' : accessClassFor(c, f.capability),
    access: f.access,
    capability: f.capability,
    paywall: f.paywall,
    upgradeSurface: f.upgradeSurface,
    status: f.status,
  }));
}
