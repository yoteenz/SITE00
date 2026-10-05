import type { DesignPageAuthorityReviewSession } from '../p0vrTwinV30/types.js';
import type { MobileTwinPackageApprovalStatus } from './types.js';

/** Part 1 — normalize confirmed approval when local pipeline already founder-approved. */
export function isMobileTwinPackageApprovalConfirmed(session: DesignPageAuthorityReviewSession): boolean {
  const p = session.mobileTwinPipeline;
  if (!p?.latestPackageId) return false;
  const pkg = p.packages.find((x) => x.id === p.latestPackageId);
  if (!pkg || pkg.status !== 'APPROVED') return false;
  const pair = p.activeVisualPairId ? p.visualPairs.find((v) => v.id === p.activeVisualPairId) : null;
  if (!pair || pair.status !== 'APPROVED') return false;
  const run = p.activeAtomicRunId ? p.atomicRuns.find((r) => r.id === p.activeAtomicRunId) : null;
  if (run && run.status !== 'APPROVED') return false;
  const auth = p.implementationVisualAuthority;
  if (!auth || auth.status !== 'FROZEN_IMPLEMENTATION_AUTHORITY') return false;
  return true;
}

export function resolveMobileTwinPackageApprovalStatus(
  session: DesignPageAuthorityReviewSession,
): MobileTwinPackageApprovalStatus {
  const slice = session.mobileTwinPipeline?.mobileTwinImplementation;
  if (slice?.packageApprovalStatus === 'CONFIRMED' && slice.backendPackageApprovalId) return 'CONFIRMED';
  if (slice?.packageApprovalStatus === 'PERSIST_FAILED') return 'PERSIST_FAILED';
  if (isMobileTwinPackageApprovalConfirmed(session)) {
    return slice?.backendPackageApprovalId ? 'CONFIRMED' : 'LOCAL_ONLY';
  }
  return 'PENDING';
}

export function applyMobileTwinPackageApprovalConfirmation(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  if (!isMobileTwinPackageApprovalConfirmed(session)) return session;
  const pipeline = session.mobileTwinPipeline!;
  const existing = pipeline.mobileTwinImplementation;
  const backendId = existing?.backendPackageApprovalId ?? null;
  const status: MobileTwinPackageApprovalStatus = backendId ? 'CONFIRMED' : (existing?.packageApprovalStatus ?? 'LOCAL_ONLY');
  const implStatus =
    existing?.implementationStatus ??
    (status === 'CONFIRMED' || status === 'LOCAL_ONLY' ? 'READY_TO_COMPILE' : 'NOT_STARTED');
  return {
    ...session,
    mobileTwinPipeline: {
      ...pipeline,
      mobileTwinImplementation: {
        packageApprovalStatus: status === 'PENDING' ? 'LOCAL_ONLY' : status,
        backendPackageApprovalId: backendId,
        implementationStatus: implStatus,
        latestBuildId: existing?.latestBuildId ?? null,
        latestImplementationVersion: existing?.latestImplementationVersion ?? null,
        previewRoute: existing?.previewRoute ?? null,
        promotionStatus: existing?.promotionStatus ?? 'NOT_READY',
        history: existing?.history ?? ['PACKAGE APPROVED'],
      },
    },
  };
}
