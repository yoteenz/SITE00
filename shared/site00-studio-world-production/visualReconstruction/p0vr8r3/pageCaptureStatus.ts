/**
 * P0.VR.8R3R2 — Page capture status (delegates to PageCaptureStateResolver).
 */

import type { PageCaptureQueueJob, ProjectPageRecord } from '../p0vr8/types.js';
import {
  mapResolvedStateToMirrorFilter,
  resolvePageCaptureStateFromRecord,
} from './pageCaptureStateResolver.js';
import type { PageCaptureStatus } from './types.js';

export function derivePageCaptureStatus(
  page: ProjectPageRecord,
  queueJob?: PageCaptureQueueJob | null,
): PageCaptureStatus {
  const resolved = resolvePageCaptureStateFromRecord(page, queueJob);
  if (resolved === 'UNSUPPORTED') return 'UNSUPPORTED';
  if (resolved === 'NEVER_CAPTURED') return 'NEVER_CAPTURED';
  if (resolved === 'QUEUED') return 'QUEUED';
  if (resolved === 'CAPTURING') return 'CAPTURING';
  if (resolved === 'FAILED') return 'FAILED';
  if (resolved === 'STALE') return 'STALE';
  if (resolved === 'SKIPPED') return 'SKIPPED';
  return 'CURRENT';
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
  return mapResolvedStateToMirrorFilter(status as never);
}
