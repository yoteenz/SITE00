/**
 * P0.VR.8 — PageCaptureQueue with duplicate suppression and bounded retries.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { PAGE_CAPTURE_MAX_RETRIES } from './constants.js';
import type { PageCaptureQueueJob, PageSyncEventType } from './types.js';

const queue = new Map<string, PageCaptureQueueJob>();

function jobKey(projectId: string, pageId: string, viewport: DesignViewportClass): string {
  return `${projectId}:${pageId}:${viewport}`;
}

export function enqueuePageCapture(input: {
  projectId: string;
  pageId: string;
  route: string;
  viewport: DesignViewportClass;
  reason: PageSyncEventType | string;
  priority?: number;
  deploymentId?: string | null;
}): PageCaptureQueueJob {
  const key = jobKey(input.projectId, input.pageId, input.viewport);
  const existing = queue.get(key);
  if (existing && (existing.status === 'QUEUED' || existing.status === 'CAPTURING')) {
    return { ...existing, status: 'COALESCED', reason: input.reason };
  }

  const job: PageCaptureQueueJob = {
    jobId: `pcq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    projectId: input.projectId,
    pageId: input.pageId,
    route: input.route,
    viewport: input.viewport,
    reason: input.reason,
    priority: input.priority ?? 5,
    status: 'QUEUED',
    attempts: 0,
    queuedAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    deploymentId: input.deploymentId ?? null,
  };
  queue.set(key, job);
  return job;
}

export function coalesceDuplicateCaptures(projectId: string): number {
  const byPage = new Map<string, PageCaptureQueueJob[]>();
  for (const job of queue.values()) {
    if (job.projectId !== projectId || job.status !== 'QUEUED') continue;
    const list = byPage.get(job.pageId) ?? [];
    list.push(job);
    byPage.set(job.pageId, list);
  }
  let coalesced = 0;
  for (const jobs of byPage.values()) {
    if (jobs.length <= 1) continue;
    jobs.sort((a, b) => b.priority - a.priority);
    for (let i = 1; i < jobs.length; i++) {
      queue.set(jobKey(jobs[i]!.projectId, jobs[i]!.pageId, jobs[i]!.viewport), {
        ...jobs[i]!,
        status: 'COALESCED',
      });
      coalesced++;
    }
  }
  return coalesced;
}

export function startCaptureJob(jobId: string): PageCaptureQueueJob | null {
  const job = [...queue.values()].find((j) => j.jobId === jobId);
  if (!job) return null;
  const updated = { ...job, status: 'CAPTURING' as const, startedAt: new Date().toISOString(), attempts: job.attempts + 1 };
  queue.set(jobKey(job.projectId, job.pageId, job.viewport), updated);
  return updated;
}

export function completeCaptureJob(jobId: string, success: boolean): PageCaptureQueueJob | null {
  const job = [...queue.values()].find((j) => j.jobId === jobId);
  if (!job) return null;
  const failed = !success && job.attempts < PAGE_CAPTURE_MAX_RETRIES;
  const updated: PageCaptureQueueJob = {
    ...job,
    status: success ? 'COMPLETE' : failed ? 'QUEUED' : 'FAILED',
    completedAt: success || !failed ? new Date().toISOString() : null,
  };
  queue.set(jobKey(job.projectId, job.pageId, job.viewport), updated);
  return updated;
}

export function listCaptureQueue(projectId?: string): PageCaptureQueueJob[] {
  return [...queue.values()].filter((j) => !projectId || j.projectId === projectId);
}

export function clearCaptureQueueForTest(): void {
  queue.clear();
}
