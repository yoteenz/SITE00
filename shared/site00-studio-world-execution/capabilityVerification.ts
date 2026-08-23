/**
 * Capability verification registry — distinguishes test PASS from live production verification.
 */

import type {
  CapabilityImplementationStatus,
  CapabilityVerificationRecord,
  CapabilityVerificationStatus,
} from './types.js';

export const DEFAULT_CAPABILITY_VERIFICATIONS: CapabilityVerificationRecord[] = [
  {
    capabilityId: 'VISUAL_REFERENCE_CAPTURE',
    environment: 'production',
    implementationStatus: 'TEST_VERIFIED',
    verificationStatus: 'NOT_VERIFIED',
    verifiedAt: null,
    verificationMethod: null,
    verificationRunId: null,
    sourceCommit: null,
    notes: 'Playwright capture path exists; live production capture not verified in CI',
    updatedAt: new Date().toISOString(),
  },
  {
    capabilityId: 'FAL_GENERATION',
    environment: 'production',
    implementationStatus: 'TEST_VERIFIED',
    verificationStatus: 'NOT_VERIFIED',
    verifiedAt: null,
    verificationMethod: null,
    verificationRunId: null,
    sourceCommit: null,
    notes: 'Vitest mock provider path verified; live FAL dispatch not verified in CI',
    updatedAt: new Date().toISOString(),
  },
  {
    capabilityId: 'REFERENCE_CONDITIONED_GPT_IMAGE_EDIT',
    environment: 'production',
    implementationStatus: 'LIVE_PATH_UNVERIFIED',
    verificationStatus: 'NOT_VERIFIED',
    verifiedAt: null,
    verificationMethod: null,
    verificationRunId: null,
    sourceCommit: null,
    notes: 'Methodology ready; live path unverified',
    updatedAt: new Date().toISOString(),
  },
  {
    capabilityId: 'COMPOSER_ORCHESTRATION',
    environment: 'production',
    implementationStatus: 'IMPLEMENTED',
    verificationStatus: 'NOT_VERIFIED',
    verifiedAt: null,
    verificationMethod: null,
    verificationRunId: null,
    sourceCommit: null,
    notes: 'P1 adapter implemented — live production dispatch requires SITE00_COMPOSER_LIVE_VERIFIED',
    updatedAt: new Date().toISOString(),
  },
  {
    capabilityId: 'FIDELITY_EVALUATION',
    environment: 'production',
    implementationStatus: 'IMPLEMENTED',
    verificationStatus: 'NOT_VERIFIED',
    verifiedAt: null,
    verificationMethod: null,
    verificationRunId: null,
    sourceCommit: null,
    notes: 'Returns NOT_EVALUATED unless rendered evidence supplied',
    updatedAt: new Date().toISOString(),
  },
  {
    capabilityId: 'DURABLE_RUN_PERSISTENCE',
    environment: 'production',
    implementationStatus: 'IMPLEMENTED',
    verificationStatus: 'TEST_VERIFIED',
    verifiedAt: null,
    verificationMethod: 'vitest',
    verificationRunId: null,
    sourceCommit: null,
    notes: 'Adapter + migration; live restart verification requires isolated Supabase',
    updatedAt: new Date().toISOString(),
  },
];

export function isProductionVerified(record: CapabilityVerificationRecord): boolean {
  return record.verificationStatus === 'PRODUCTION_VERIFIED';
}

export function impliesProductionReady(status: CapabilityImplementationStatus): boolean {
  return status === 'PRODUCTION_READY' || status === 'LIVE_VERIFIED';
}

export function mergeCapabilityVerifications(
  persisted: CapabilityVerificationRecord[],
): CapabilityVerificationRecord[] {
  const byId = new Map(DEFAULT_CAPABILITY_VERIFICATIONS.map((r) => [r.capabilityId, { ...r }]));
  for (const row of persisted) {
    byId.set(row.capabilityId, { ...byId.get(row.capabilityId), ...row });
  }
  return [...byId.values()];
}

export function assertNotFalseProductionReady(params: {
  capabilityId: string;
  claimedStatus: CapabilityImplementationStatus;
  verificationStatus: CapabilityVerificationStatus;
}): { honest: boolean; reason: string | null } {
  if (!impliesProductionReady(params.claimedStatus)) {
    return { honest: true, reason: null };
  }
  if (params.verificationStatus === 'PRODUCTION_VERIFIED') {
    return { honest: true, reason: null };
  }
  return {
    honest: false,
    reason: `${params.capabilityId} cannot claim ${params.claimedStatus} without PRODUCTION_VERIFIED`,
  };
}
