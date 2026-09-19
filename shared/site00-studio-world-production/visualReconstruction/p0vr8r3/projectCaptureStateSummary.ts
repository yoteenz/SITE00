/**
 * P0.VR.8R3R2 — Project capture summary derived from PageCaptureStateResolver.
 */

import type { PageCaptureQueueJob, ProjectPageRecord } from '../p0vr8/types.js';
import {
  resolvePageCaptureStateFromRecord,
  type ResolvedPageCaptureState,
} from './pageCaptureStateResolver.js';

export type ProjectCaptureStateSummary = {
  totalPages: number;
  current: number;
  neverCaptured: number;
  queued: number;
  capturing: number;
  stale: number;
  failed: number;
  skipped: number;
  unsupported: number;
};

function bump(counts: ProjectCaptureStateSummary, state: ResolvedPageCaptureState): void {
  switch (state) {
    case 'CURRENT':
      counts.current++;
      break;
    case 'NEVER_CAPTURED':
      counts.neverCaptured++;
      break;
    case 'QUEUED':
      counts.queued++;
      break;
    case 'CAPTURING':
      counts.capturing++;
      break;
    case 'STALE':
      counts.stale++;
      break;
    case 'FAILED':
      counts.failed++;
      break;
    case 'SKIPPED':
      counts.skipped++;
      break;
    case 'UNSUPPORTED':
      counts.unsupported++;
      break;
    default:
      break;
  }
}

export function buildProjectCaptureStateSummary(
  pages: ProjectPageRecord[],
  queueJobs: PageCaptureQueueJob[] = [],
): ProjectCaptureStateSummary {
  const counts: ProjectCaptureStateSummary = {
    totalPages: 0,
    current: 0,
    neverCaptured: 0,
    queued: 0,
    capturing: 0,
    stale: 0,
    failed: 0,
    skipped: 0,
    unsupported: 0,
  };

  for (const page of pages) {
    if (!page.isActive) continue;
    counts.totalPages++;

    const job = queueJobs.find(
      (j) =>
        j.pageId === page.pageId &&
        (j.status === 'QUEUED' || j.status === 'CAPTURING' || j.status === 'FAILED'),
    );
    const state = resolvePageCaptureStateFromRecord(page, job);
    bump(counts, state);
  }

  return counts;
}
