/**
 * Authoritative capability check for JURNL API routes.
 */

import { authorizeCapability } from '../../../shared/site00-monetization/serverAuthorization.js';
import type { ProjectMonetizationContract } from '../../../shared/site00-monetization/contract.js';
import { resolveJurnlEntitlementsForPrincipal } from './resolveJurnlEntitlements.js';

export async function authorizeJurnlCapability(
  contract: ProjectMonetizationContract,
  principalId: string,
  billingAccountId: string,
  capability: string,
) {
  const { authorization } = await resolveJurnlEntitlementsForPrincipal(contract, principalId, billingAccountId);
  return authorizeCapability(contract, authorization, capability);
}
