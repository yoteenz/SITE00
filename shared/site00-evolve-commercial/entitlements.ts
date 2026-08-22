/**
 * SITE 00 EVOLVE — commercial entitlements.
 *
 * Entitlements answer ONE question: "is this included in the client's
 * commercial service?" They are derived purely from the canonical catalog
 * (shared/site00-evolve-commercial/catalog.ts) and NEVER read or influence
 * governance state (Creative Direction decisions, Visual DNA approval,
 * publishing fences, provider readiness, organization isolation).
 *
 * Governance answers a different question — "is this action
 * authorized/approved/ready?" — and lives entirely in api/_lib/site00Evolve
 * (governance.ts, campaignLifecycle.ts, creativeDirection/visualDnaContract.ts,
 * providers/pilotReadinessSprint04.ts, etc). Do not import any of those modules
 * here, and do not let entitlement checks bypass them.
 */

import { getEvolvePlanById } from './catalog.js';
import type { EvolveCapacityRange, EvolveEntitlementSummary, EvolvePlanId } from './types.js';

export function resolveEvolveEntitlements(planId: EvolvePlanId | null): EvolveEntitlementSummary {
  if (!planId) {
    return { planId: null, channelLimit: null, campaignCapacity: null, assetCapacity: null, customScopeRequired: false };
  }
  const plan = getEvolvePlanById(planId);
  if (!plan) {
    return { planId: null, channelLimit: null, campaignCapacity: null, assetCapacity: null, customScopeRequired: false };
  }
  return {
    planId: plan.id,
    channelLimit: plan.channelLimit,
    campaignCapacity: plan.campaignCapacity,
    assetCapacity: plan.assetCapacity,
    customScopeRequired: plan.customScopeRequired,
  };
}

function withinRange(value: number, range: EvolveCapacityRange): boolean {
  if (!range) return true;
  return value >= range.min && value <= range.max;
}

/** Informational only — reports whether a count is within the plan's guideline capacity. Never blocks or approves anything. */
export function isWithinChannelEntitlement(planId: EvolvePlanId | null, activeChannelCount: number): boolean {
  const entitlement = resolveEvolveEntitlements(planId);
  if (entitlement.channelLimit === null) return true;
  return activeChannelCount <= entitlement.channelLimit;
}

/** Informational only — reports whether a count is within the plan's guideline campaign capacity. Never blocks or approves anything. */
export function isWithinCampaignEntitlement(planId: EvolvePlanId | null, activeCampaignCount: number): boolean {
  const entitlement = resolveEvolveEntitlements(planId);
  return withinRange(activeCampaignCount, entitlement.campaignCapacity);
}

/** Informational only — reports whether a count is within the plan's guideline asset capacity. Never blocks or approves anything. */
export function isWithinAssetEntitlement(planId: EvolvePlanId | null, monthlyAssetCount: number): boolean {
  const entitlement = resolveEvolveEntitlements(planId);
  return withinRange(monthlyAssetCount, entitlement.assetCapacity);
}
