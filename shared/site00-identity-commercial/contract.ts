/**
 * ServiceFulfillmentContract resolution for Identity packages (no invented limits).
 */

import type { ServiceFulfillmentContract } from '../site00-commercial-canon/types.js';
import { deliverableContractForFamily } from '../site00-commercial-canon/contracts.js';
import { IDENTITY_TIER_PACKAGE_IDS, resolveIdentityPackageRow } from './inventory.js';

const TIER_INCLUDED_DELIVERABLES: Record<(typeof IDENTITY_TIER_PACKAGE_IDS)[number], readonly string[]> = {
  foundation: ['LOGO', 'VISUAL IDENTITY', 'BRAND GUIDELINES'],
  refine: ['LOGO ENHANCEMENT', 'GUIDELINES', 'VISUAL SYSTEM'],
  evolve: ['REBRANDING', 'STRATEGY', 'VISUAL EVOLUTION'],
  'build-ready-tier': ['ASSET VERIFICATION', 'PROCEED TO BLDR'],
};

export function identityFulfillmentContract(serviceId: string, packageId: string): ServiceFulfillmentContract {
  const { completionCriteria, deliveryDestination } = deliverableContractForFamily('IDENTITY');
  const row = resolveIdentityPackageRow(serviceId, packageId);

  const tierKey = IDENTITY_TIER_PACKAGE_IDS.find((t) => t === packageId);
  const includedDeliverables =
    tierKey != null
      ? [...TIER_INCLUDED_DELIVERABLES[tierKey]]
      : serviceId === 'services-hub-branding'
        ? ['IDENTITY_SYSTEM_SCOPE_FROM_INTAKE']
        : ['FOUNDER_DECISION_REQUIRED'];

  return {
    serviceId,
    packageId,
    family: 'IDENTITY',
    commercialMode: row?.commercialMode ?? 'CUSTOM_QUOTE',
    includedDeliverables,
    scopeLimits: {
      concepts: 'FOUNDER_DECISION_REQUIRED',
      revisions: 'FOUNDER_DECISION_REQUIRED',
      initialDirections: 'FOUNDER_DECISION_REQUIRED',
    },
    revisionPolicy: 'FOUNDER_DECISION_REQUIRED',
    entitlements: ['identity'],
    intakeSchemaId: 'site00-intake-identity',
    projectType: 'IDENTITY',
    fulfillmentAdapterId: 'identity-fulfillment',
    reviewRequirements: ['CLIENT_REVIEW', 'HUMAN_APPROVAL'],
    completionCriteria,
    deliveryDestination,
    addOnCompatibility: [],
  };
}
