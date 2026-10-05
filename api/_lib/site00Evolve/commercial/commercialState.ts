/**
 * SITE 00 EVOLVE — per-organization commercial state.
 *
 * Commercial state (plan, Foundation status, entitlements, paid media) is
 * intentionally kept separate from operational state (Creative Direction
 * decisions, Visual DNA approval, publishing fences, provider readiness).
 * A commercial plan existing here never implies any of those are approved —
 * see governance.ts, campaignLifecycle.ts, and creativeDirection/visualDnaContract.ts
 * for the actual authorization logic, which this module never touches.
 */

import { resolveOrgContext } from '../evolveService.js';
import { getProfileByOrgId } from '../storeAdapter.js';
import { orgIdFromSlug } from '../orgRegistry.js';
import { resolveEvolveFoundationQualification } from './foundationQualification.js';
import { getEvolvePlanById } from '../../../../shared/site00-evolve-commercial/catalog.js';
import { resolveEvolveEntitlements } from '../../../../shared/site00-evolve-commercial/entitlements.js';
import type { EvolveCommercialState, EvolvePlanId } from '../../../../shared/site00-evolve-commercial/types.js';

/** Production/infrastructure organizations — EVOLVE's commercial model does not apply at all. */
const NOT_APPLICABLE_CLASSIFICATIONS = new Set(['PRODUCTION_INFRASTRUCTURE']);

/** Founder-owned / platform-internal organizations — use EVOLVE operationally, never billed. */
const INTERNAL_NON_BILLING_CLASSIFICATIONS = new Set(['INTERNAL_BRAND', 'INTERNAL_BRAND_PLATFORM']);

const NO_BILLING_INTEGRATION = {
  integrated: false as const,
  provider: 'NONE' as const,
  stripeReady: false,
  note: 'No billing integration exists yet — canonical plan/service ids are ready to map to a future provider (e.g. Stripe) without renaming.',
};

function isKnownEvolvePlanId(value: unknown): value is EvolvePlanId {
  return value === 'evolve_essential' || value === 'evolve_growth' || value === 'evolve_studio' || value === 'evolve_private';
}

function notApplicableState(orgSlug: string, note: string): EvolveCommercialState {
  return {
    organizationSlug: orgSlug,
    applicability: 'NOT_APPLICABLE',
    applicabilityNote: note,
    plan: null,
    planStatus: 'NOT_APPLICABLE',
    foundation: null,
    entitlements: null,
    projectServicesHistory: [],
    paidMedia: { status: 'NOT_CONFIGURED', note: 'Not applicable to production infrastructure.' },
    usageMetering: 'NOT_AVAILABLE',
    billing: NO_BILLING_INTEGRATION,
  };
}

function internalNonBillingState(orgSlug: string): EvolveCommercialState {
  return {
    organizationSlug: orgSlug,
    applicability: 'INTERNAL_NON_BILLING',
    applicabilityNote:
      'INTERNAL / FOUNDER BRAND — uses EVOLVE operationally without a commercial subscription. No plan is fabricated for internal use.',
    plan: null,
    planStatus: 'NOT_APPLICABLE',
    foundation: null,
    entitlements: null,
    projectServicesHistory: [],
    paidMedia: { status: 'NOT_CONFIGURED', note: 'Not billed — internal/founder brand.' },
    usageMetering: 'NOT_AVAILABLE',
    billing: NO_BILLING_INTEGRATION,
  };
}

export async function resolveEvolveCommercialState(orgSlug: string): Promise<EvolveCommercialState> {
  const orgCtx = resolveOrgContext(orgSlug);

  if (NOT_APPLICABLE_CLASSIFICATIONS.has(orgCtx.classification)) {
    return notApplicableState(
      orgSlug,
      'PRODUCTION INFRASTRUCTURE — EVOLVE\u2019s commercial marketing-service model does not apply. This project is not an EVOLVE marketing client and is never converted into one.',
    );
  }

  if (INTERNAL_NON_BILLING_CLASSIFICATIONS.has(orgCtx.classification)) {
    return internalNonBillingState(orgSlug);
  }

  const orgId = orgIdFromSlug(orgSlug);
  const profile = orgId ? await getProfileByOrgId(orgId) : undefined;
  const commercialMeta = ((profile?.metadata ?? {}) as Record<string, unknown>).commercial as Record<string, unknown> | undefined;
  const selectedPlanId = commercialMeta?.planId;
  const plan = isKnownEvolvePlanId(selectedPlanId) ? getEvolvePlanById(selectedPlanId) : undefined;
  const foundation = await resolveEvolveFoundationQualification(orgSlug);

  return {
    organizationSlug: orgSlug,
    applicability: 'BILLABLE_CLIENT',
    applicabilityNote: 'MANAGED BRAND — eligible for an EVOLVE commercial plan. No purchase or plan is fabricated automatically.',
    plan: plan
      ? {
          id: plan.id,
          name: plan.name,
          priceCents: plan.priceCents,
          priceQualifier: plan.priceQualifier,
          billingInterval: plan.billingInterval,
          serviceModel: plan.serviceModel,
        }
      : null,
    planStatus: plan ? 'ACTIVE' : 'NOT_SELECTED',
    foundation,
    entitlements: resolveEvolveEntitlements(plan ? plan.id : null),
    projectServicesHistory: [],
    paidMedia: { status: 'NOT_CONFIGURED', note: 'No active paid-media management implementation exists yet.' },
    usageMetering: 'NOT_AVAILABLE',
    billing: NO_BILLING_INTEGRATION,
  };
}
