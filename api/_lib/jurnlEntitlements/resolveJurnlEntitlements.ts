/**
 * Trusted JURNL entitlement resolution for API handlers.
 */

import { createUnconfiguredBillingProvider } from '../../../shared/site00-monetization/billingProvider.js';
import { resolveEntitlements, type ResolvedEntitlements } from '../../../shared/site00-monetization/entitlements.js';
import { hasActiveFounderFull } from '../../../shared/site00-monetization/internalGrants.js';
import type { ProjectMonetizationContract } from '../../../shared/site00-monetization/contract.js';
import { listActiveInternalGrants } from './internalGrantStore.js';
import { getPlanPreviewPlanId } from './planPreviewStore.js';

export type JurnlEntitlementApiPayload = {
  projectId: string;
  authorization: ResolvedEntitlements;
  presentation: {
    simulatedPlanId: string | null;
    previewActive: boolean;
  };
};

export async function resolveJurnlEntitlementsForPrincipal(
  contract: ProjectMonetizationContract,
  principalId: string,
  billingAccountId: string,
): Promise<JurnlEntitlementApiPayload> {
  const billing = createUnconfiguredBillingProvider();
  const entitlementsResult = await billing.getEntitlements(billingAccountId);
  const subscription = entitlementsResult.ok ? entitlementsResult.value.subscription : null;
  const addOns = entitlementsResult.ok ? entitlementsResult.value.addOns : [];

  const internalGrants = listActiveInternalGrants(contract.projectId, principalId);

  const authorization = resolveEntitlements(contract, {
    source: 'SERVER_VERIFIED',
    subscription,
    addOns,
    internalGrants,
  });

  const simulatedPlanId = hasActiveFounderFull(internalGrants, contract.projectId) ? getPlanPreviewPlanId(principalId) : null;

  return {
    projectId: contract.projectId,
    authorization,
    presentation: {
      simulatedPlanId,
      previewActive: simulatedPlanId !== null,
    },
  };
}
