/**
 * P0.VR.8 — PageSnapshotFreshness — stale detection separate from fidelity.
 */

import type { PageSnapshotFreshness, ProjectPageRecord } from './types.js';

export function computePageSnapshotFreshness(
  page: ProjectPageRecord,
  input?: {
    lastDeployAt?: string | null;
    lastPageChangeAt?: string | null;
  },
): PageSnapshotFreshness {
  const lastPageChangeAt = input?.lastPageChangeAt ?? page.updatedAt;
  const lastDeployAt = input?.lastDeployAt ?? page.lastDeploymentId ? page.updatedAt : null;
  const lastCaptureAt = page.lastCapturedAt;

  let isStale = page.status === 'STALE';
  let staleReason: string | null = isStale ? 'page marked stale' : null;

  if (lastCaptureAt && lastPageChangeAt && lastPageChangeAt > lastCaptureAt) {
    isStale = true;
    staleReason = 'page changed after last capture';
  }
  if (lastCaptureAt && lastDeployAt && lastDeployAt > lastCaptureAt) {
    isStale = true;
    staleReason = 'deploy completed after last capture';
  }
  if (!lastCaptureAt && page.isActive && page.status !== 'ROUTE_MISSING') {
    isStale = true;
    staleReason = 'never captured';
  }

  return {
    pageId: page.pageId,
    projectId: page.projectId,
    lastPageChangeAt,
    lastDeployAt,
    lastCaptureAt,
    isStale,
    staleReason,
  };
}

export function mapSnapshotStatusToMirrorStatus(
  captureStatus: string,
  stale: boolean,
): ProjectPageRecord['status'] {
  if (captureStatus === 'CAPTURING') return 'CAPTURING';
  if (captureStatus === 'FAILED' || captureStatus === 'AUTH_BLOCKED') return 'CAPTURE_FAILED';
  if (stale || captureStatus === 'STALE' || captureStatus === 'POSSIBLY_STALE') return 'STALE';
  if (captureStatus === 'CURRENT') return 'CURRENT';
  if (captureStatus === 'MISSING' || captureStatus === 'IMPLEMENTATION_MISSING') return 'CAPTURE_PENDING';
  return 'DISCOVERED';
}
