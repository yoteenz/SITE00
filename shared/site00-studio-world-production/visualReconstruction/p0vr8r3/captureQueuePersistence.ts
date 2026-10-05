/**
 * P0.VR.8R3R1 — Hydrate in-memory capture queue from persisted registry.
 */

import {
  clearCaptureQueueForTest,
  enqueuePageCapture,
  listCaptureQueue,
} from '../p0vr8/captureQueue.js';
import { listPersistedCaptureJobs, persistCaptureJobs } from './projectCaptureRunStore.js';
import type { PageCaptureQueueJob } from '../p0vr8/types.js';

export function syncCaptureQueueToPersistence(projectId: string, runId: string, repoRoot?: string): void {
  const jobs = listCaptureQueue(projectId).map((j) => ({
    ...j,
    runId: j.runId ?? runId,
    targetId: j.targetId ?? undefined,
  }));
  persistCaptureJobs(jobs, repoRoot);
}

export function hydrateCaptureQueueFromPersistence(projectId: string, repoRoot?: string): void {
  const jobs = listPersistedCaptureJobs(projectId, undefined, repoRoot);
  for (const job of jobs) {
    if (job.status === 'QUEUED' || job.status === 'CAPTURING') {
      enqueuePageCapture({
        projectId: job.projectId,
        pageId: job.pageId,
        route: job.route,
        viewport: job.viewport,
        reason: job.reason,
        deploymentId: job.deploymentId,
        priority: job.priority,
        runId: job.runId,
        targetId: job.targetId,
        jobId: job.jobId,
      });
    }
  }
}

export function resetCaptureQueueHydrationForTest(): void {
  clearCaptureQueueForTest();
}

export type ExtendedCaptureJob = PageCaptureQueueJob & { runId?: string; targetId?: string };
