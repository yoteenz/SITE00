/**
 * P0.VR.8R3 — Normalize page capture status (NEVER_CAPTURED ≠ STALE).
 */

import type { PageCaptureQueueJob, ProjectPageRecord } from '../p0vr8/types.js';
import { computePageSnapshotFreshness } from '../p0vr8/snapshotFreshness.js';
import type { PageCaptureStatus } from './types.js';

export function derivePageCaptureStatus(
  page: ProjectPageRecord,
  queueJob?: PageCaptureQueueJob | null,
): PageCaptureStatus {
  if (page.status === 'ROUTE_MISSING' || page.status === 'BLOCKED') return 'UNSUPPORTED';
  if (page.status === 'AUTH_REQUIRED') return 'UNSUPPORTED';

  if (queueJob?.status === 'CAPTURING') return 'CAPTURING';
  if (queueJob?.status === 'QUEUED') return 'QUEUED';
  if (queueJob?.status === 'FAILED') return 'FAILED';

  if (page.status === 'CAPTURE_FAILED') return 'FAILED';
  if (page.status === 'CAPTURING') return 'CAPTURING';
  if (page.status === 'CAPTURE_PENDING') return 'QUEUED';

  const freshness = computePageSnapshotFreshness(page);

  if (!page.lastCapturedAt) {
    return 'NEVER_CAPTURED';
  }

  if (freshness.isStale && freshness.staleReason !== 'never captured') {
    return 'STALE';
  }

  if (page.status === 'CURRENT' || page.status === 'DISCOVERED') {
    return page.lastCapturedAt ? 'CURRENT' : 'NEVER_CAPTURED';
  }

  if (page.status === 'STALE') {
    return page.lastCapturedAt ? 'STALE' : 'NEVER_CAPTURED';
  }

  return page.lastCapturedAt ? 'CURRENT' : 'NEVER_CAPTURED';
}

export function countPagesByCaptureStatus(
  pages: ProjectPageRecord[],
  queueJobs: PageCaptureQueueJob[],
): Record<PageCaptureStatus | 'ALL', number> {
  const counts: Record<PageCaptureStatus | 'ALL', number> = {
    ALL: pages.length,
    NEVER_CAPTURED: 0,
    QUEUED: 0,
    CAPTURING: 0,
    CURRENT: 0,
    STALE: 0,
    FAILED: 0,
    SKIPPED: 0,
    UNSUPPORTED: 0,
  };

  for (const page of pages) {
    const job = queueJobs.find(
      (j) =>
        j.pageId === page.pageId &&
        (j.status === 'QUEUED' || j.status === 'CAPTURING' || j.status === 'FAILED'),
    );
    const status = derivePageCaptureStatus(page, job);
    counts[status]++;
  }

  return counts;
}

export function mapCaptureStatusToMirrorFilter(status: PageCaptureStatus): string {
  if (status === 'FAILED') return 'FAILED';
  if (status === 'NEVER_CAPTURED') return 'NEVER CAPTURED';
  return status;
}
