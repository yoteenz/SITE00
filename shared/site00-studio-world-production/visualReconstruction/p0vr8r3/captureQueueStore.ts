/**
 * P0.VR.8R3R4 — Shared capture queue store with job claim / lease.
 */

import {
  enqueuePageCapture,
  startCaptureJob,
  completeCaptureJob,
  type PageCaptureQueueJobExtended,
} from '../p0vr8/captureQueue.js';
import {
  loadCaptureOrchestrationRegistry,
  mutateCaptureOrchestrationRegistry,
  type PersistedCaptureQueueJob,
} from './captureRunPersistentStore.js';

export const CAPTURE_JOB_LEASE_MS = 120_000;

function syncJobToMemory(job: PersistedCaptureQueueJob): void {
  enqueuePageCapture({
    projectId: job.projectId,
    pageId: job.pageId,
    route: job.route,
    viewport: job.viewport,
    reason: job.reason,
    priority: job.priority,
    deploymentId: job.deploymentId,
    runId: job.runId,
    targetId: job.targetId,
    jobId: job.jobId,
  });
  if (job.status === 'CAPTURING') startCaptureJob(job.jobId);
  if (job.status === 'COMPLETE' || job.status === 'FAILED') completeCaptureJob(job.jobId, job.status === 'COMPLETE');
}

export const captureQueueStore = {
  enqueueJob(job: PageCaptureQueueJobExtended, repoRoot?: string): PersistedCaptureQueueJob {
    const enqueued = enqueuePageCapture(job);
    const persisted: PersistedCaptureQueueJob = {
      ...enqueued,
      status: enqueued.status === 'COALESCED' ? 'COALESCED' : 'QUEUED',
      runId: job.runId ?? enqueued.runId ?? undefined,
      targetId: job.targetId ?? enqueued.targetId ?? undefined,
      claimedBy: null,
      claimedAt: null,
      leaseExpiresAt: null,
      acknowledgedAt: null,
    };
    mutateCaptureOrchestrationRegistry((registry) => {
      const idx = registry.jobs.findIndex((j) => j.jobId === persisted.jobId);
      if (idx >= 0) registry.jobs[idx] = persisted;
      else registry.jobs.push(persisted);
    }, repoRoot);
    return persisted;
  },

  claimNextJob(workerId: string, projectId?: string, repoRoot?: string): PersistedCaptureQueueJob | null {
    const now = Date.now();
    let claimed: PersistedCaptureQueueJob | null = null;
    mutateCaptureOrchestrationRegistry((registry) => {
      for (const job of registry.jobs) {
        if (projectId && job.projectId !== projectId) continue;
        if (job.status !== 'QUEUED') continue;
        if (job.claimedBy && job.leaseExpiresAt && new Date(job.leaseExpiresAt).getTime() > now) continue;
        claimed = {
          ...job,
          status: 'CAPTURING',
          claimedBy: workerId,
          claimedAt: new Date().toISOString(),
          leaseExpiresAt: new Date(now + CAPTURE_JOB_LEASE_MS).toISOString(),
          startedAt: new Date().toISOString(),
        };
        const idx = registry.jobs.findIndex((j) => j.jobId === job.jobId);
        if (idx >= 0) registry.jobs[idx] = claimed;
        break;
      }
    }, repoRoot);
    if (claimed) syncJobToMemory(claimed);
    return claimed;
  },

  acknowledgeJob(jobId: string, repoRoot?: string): PersistedCaptureQueueJob | null {
    let updated: PersistedCaptureQueueJob | null = null;
    mutateCaptureOrchestrationRegistry((registry) => {
      const idx = registry.jobs.findIndex((j) => j.jobId === jobId);
      if (idx < 0) return;
      updated = {
        ...registry.jobs[idx]!,
        acknowledgedAt: new Date().toISOString(),
      };
      registry.jobs[idx] = updated;
    }, repoRoot);
    return updated;
  },

  completeJob(jobId: string, success: boolean, repoRoot?: string): PersistedCaptureQueueJob | null {
    completeCaptureJob(jobId, success);
    let updated: PersistedCaptureQueueJob | null = null;
    mutateCaptureOrchestrationRegistry((registry) => {
      const idx = registry.jobs.findIndex((j) => j.jobId === jobId);
      if (idx < 0) return;
      updated = {
        ...registry.jobs[idx]!,
        status: success ? 'COMPLETE' : registry.jobs[idx]!.attempts >= 3 ? 'FAILED' : 'QUEUED',
        completedAt: success ? new Date().toISOString() : registry.jobs[idx]!.completedAt,
        claimedBy: null,
        leaseExpiresAt: null,
      };
      registry.jobs[idx] = updated;
    }, repoRoot);
    return updated;
  },

  failJob(jobId: string, _error: string, repoRoot?: string): PersistedCaptureQueueJob | null {
    return captureQueueStore.completeJob(jobId, false, repoRoot);
  },

  releaseExpiredLeases(repoRoot?: string): number {
    const now = Date.now();
    let released = 0;
    mutateCaptureOrchestrationRegistry((registry) => {
      for (let i = 0; i < registry.jobs.length; i++) {
        const job = registry.jobs[i]!;
        if (job.status !== 'CAPTURING' || !job.leaseExpiresAt) continue;
        if (new Date(job.leaseExpiresAt).getTime() > now) continue;
        registry.jobs[i] = {
          ...job,
          status: 'QUEUED',
          claimedBy: null,
          claimedAt: null,
          leaseExpiresAt: null,
          startedAt: null,
        };
        released++;
      }
    }, repoRoot);
    return released;
  },

  hydrateInMemoryQueue(projectId: string, repoRoot?: string): void {
    const registry = loadCaptureOrchestrationRegistry(repoRoot);
    for (const job of registry.jobs) {
      if (job.projectId !== projectId) continue;
      if (job.status === 'QUEUED' || job.status === 'CAPTURING') syncJobToMemory(job);
    }
  },

  queueDepth(projectId?: string, repoRoot?: string): number {
    const registry = loadCaptureOrchestrationRegistry(repoRoot);
    return registry.jobs.filter(
      (j) => j.status === 'QUEUED' && (!projectId || j.projectId === projectId),
    ).length;
  },
};
