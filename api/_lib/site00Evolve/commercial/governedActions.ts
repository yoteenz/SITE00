/**
 * SITE 00 EVOLVE — commercial governed actions.
 *
 * These are founder-controlled, non-transactional writes. They never process
 * payment, never create a Stripe subscription, and never bypass Foundation or
 * operational governance elsewhere in the product (Creative Direction, Visual
 * DNA, publishing fences, provider readiness, organization isolation). Nothing
 * in EVOLVE seeding/bootstrap calls these automatically — a plan or Foundation
 * completion only appears for an organization when an explicit, founder-driven
 * call is made.
 */

import { updateProfileCommercialMetadata } from '../storeAdapter.js';
import { orgIdFromSlug } from '../orgRegistry.js';
import { getEvolvePlanById } from '../../../../shared/site00-evolve-commercial/catalog.js';
import type { EvolvePlanId } from '../../../../shared/site00-evolve-commercial/types.js';

export async function setEvolveCommercialPlan(orgSlug: string, planId: EvolvePlanId, actorEmail: string) {
  const plan = getEvolvePlanById(planId);
  if (!plan) throw new Error(`Unknown EVOLVE plan id: ${planId}`);
  const orgId = orgIdFromSlug(orgSlug);
  if (!orgId) throw new Error(`Unknown organization slug: ${orgSlug}`);
  const updated = await updateProfileCommercialMetadata(orgId, {
    planId,
    planSelectedAt: new Date().toISOString(),
    planSelectedBy: actorEmail,
  });
  if (!updated) throw new Error(`No marketing profile found for organization ${orgSlug} — cannot assign a commercial plan`);
  return updated;
}

export async function markEvolveFoundationCompleted(orgSlug: string, actorEmail: string) {
  const orgId = orgIdFromSlug(orgSlug);
  if (!orgId) throw new Error(`Unknown organization slug: ${orgSlug}`);
  const updated = await updateProfileCommercialMetadata(orgId, {
    foundationCompletedAt: new Date().toISOString(),
    foundationCompletedBy: actorEmail,
  });
  if (!updated) throw new Error(`No marketing profile found for organization ${orgSlug} — cannot mark Foundation complete`);
  return updated;
}
