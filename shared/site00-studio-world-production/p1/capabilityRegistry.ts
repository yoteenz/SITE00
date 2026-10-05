/**
 * P1 capability registry updates — honest verification status per capability.
 */

import type { CapabilityVerificationRecord, CapabilityVerificationStatus } from '../../site00-studio-world-execution/types.js';
import { mergeCapabilityVerifications } from '../../site00-studio-world-execution/capabilityVerification.js';
import { P1_CAPABILITY_IDS, type P1CapabilityId } from './constants.js';

export const P1_CAPABILITY_DEFAULTS: CapabilityVerificationRecord[] = P1_CAPABILITY_IDS.map((capabilityId) => ({
  capabilityId,
  environment: 'production',
  implementationStatus: capabilityId === 'COMPOSER_DISPATCH' ? 'IMPLEMENTED' : 'TEST_VERIFIED',
  verificationStatus: 'NOT_VERIFIED' as CapabilityVerificationStatus,
  verifiedAt: null,
  verificationMethod: null,
  verificationRunId: null,
  sourceCommit: null,
  notes: `P1 capability ${capabilityId} — awaiting live verification evidence`,
  updatedAt: new Date().toISOString(),
}));

export function mergeP1CapabilityVerifications(
  persisted: CapabilityVerificationRecord[],
): CapabilityVerificationRecord[] {
  const base = mergeCapabilityVerifications(persisted);
  const byId = new Map(base.map((r) => [r.capabilityId, r]));
  for (const p1 of P1_CAPABILITY_DEFAULTS) {
    if (!byId.has(p1.capabilityId)) {
      byId.set(p1.capabilityId, p1);
    }
  }
  return [...byId.values()];
}

export function updateP1CapabilityVerification(params: {
  capabilityId: P1CapabilityId;
  verificationStatus: CapabilityVerificationStatus;
  verificationRunId?: string | null;
  sourceCommit?: string | null;
  verificationMethod?: string | null;
  notes?: string | null;
  existing: CapabilityVerificationRecord[];
}): CapabilityVerificationRecord[] {
  const merged = mergeP1CapabilityVerifications(params.existing);
  return merged.map((record) => {
    if (record.capabilityId !== params.capabilityId) return record;
    return {
      ...record,
      verificationStatus: params.verificationStatus,
      verificationRunId: params.verificationRunId ?? record.verificationRunId,
      sourceCommit: params.sourceCommit ?? record.sourceCommit,
      verificationMethod: params.verificationMethod ?? record.verificationMethod,
      verifiedAt:
        params.verificationStatus === 'PRODUCTION_VERIFIED' ||
        params.verificationStatus === 'TEST_VERIFIED' ||
        params.verificationStatus === 'STAGING_VERIFIED'
          ? new Date().toISOString()
          : record.verifiedAt,
      notes: params.notes ?? record.notes,
      updatedAt: new Date().toISOString(),
    };
  });
}

export function capabilityRegistrySummary(records: CapabilityVerificationRecord[]): {
  TEST_VERIFIED: string[];
  STAGING_VERIFIED: string[];
  PRODUCTION_VERIFIED: string[];
  LIVE_PATH_UNVERIFIED: string[];
  VERIFICATION_FAILED: string[];
} {
  const summary = {
    TEST_VERIFIED: [] as string[],
    STAGING_VERIFIED: [] as string[],
    PRODUCTION_VERIFIED: [] as string[],
    LIVE_PATH_UNVERIFIED: [] as string[],
    VERIFICATION_FAILED: [] as string[],
  };
  for (const r of records) {
    if (r.verificationStatus === 'TEST_VERIFIED') summary.TEST_VERIFIED.push(r.capabilityId);
    else if (r.verificationStatus === 'STAGING_VERIFIED') summary.STAGING_VERIFIED.push(r.capabilityId);
    else if (r.verificationStatus === 'PRODUCTION_VERIFIED') summary.PRODUCTION_VERIFIED.push(r.capabilityId);
    else if (r.implementationStatus === 'LIVE_PATH_UNVERIFIED') summary.LIVE_PATH_UNVERIFIED.push(r.capabilityId);
    else if (r.verificationStatus === 'VERIFICATION_FAILED') summary.VERIFICATION_FAILED.push(r.capabilityId);
  }
  return summary;
}
