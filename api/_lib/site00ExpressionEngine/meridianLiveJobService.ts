/**
 * C1.9R3 — Async Meridian live job (POST start, GET ?jobId= poll).
 * Avoids Railway / gateway HTTP timeout on long FULL_REASONING runs.
 */

import { randomUUID } from 'node:crypto';
import { bootstrapC19R3MeridianLivePostRedeploy } from './entry003/entry003C14Pipeline.js';

export type MeridianLiveJobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export type MeridianLiveJob = {
  jobId: string;
  jobType: 'C19R3_MERIDIAN_LIVE_POST_REDEPLOY';
  status: MeridianLiveJobStatus;
  phase: string;
  progressLabel: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  result: Awaited<ReturnType<typeof bootstrapC19R3MeridianLivePostRedeploy>> | null;
};

const jobs = new Map<string, MeridianLiveJob>();
let latestJobId: string | null = null;

export function resetMeridianLiveJobs(): void {
  jobs.clear();
  latestJobId = null;
}

export function startC19R3MeridianLiveJob(): MeridianLiveJob {
  const existing = latestJobId ? jobs.get(latestJobId) : null;
  if (existing && (existing.status === 'QUEUED' || existing.status === 'RUNNING')) {
    return existing;
  }

  const job: MeridianLiveJob = {
    jobId: randomUUID(),
    jobType: 'C19R3_MERIDIAN_LIVE_POST_REDEPLOY',
    status: 'QUEUED',
    phase: 'QUEUED',
    progressLabel: 'MERIDIAN LIVE JOB QUEUED',
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    errorMessage: null,
    result: null,
  };

  jobs.set(job.jobId, job);
  latestJobId = job.jobId;

  void executeMeridianLiveJob(job.jobId).catch((e) => {
    const failed = jobs.get(job.jobId);
    if (!failed) return;
    failed.status = 'FAILED';
    failed.phase = 'FAILED';
    failed.progressLabel = 'MERIDIAN LIVE JOB FAILED';
    failed.completedAt = new Date().toISOString();
    failed.errorMessage = e instanceof Error ? e.message : 'Meridian live job failed';
  });

  return job;
}

async function executeMeridianLiveJob(jobId: string): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = 'RUNNING';
  job.phase = 'FULL_REASONING_EXECUTION';
  job.progressLabel = 'RUNNING C19R3 MERIDIAN LIVE POST-REDEPLOY';
  job.startedAt = new Date().toISOString();

  const result = await bootstrapC19R3MeridianLivePostRedeploy();

  job.status = 'COMPLETED';
  job.phase = 'COMPLETED';
  job.progressLabel = result.acceptanceStatus;
  job.completedAt = new Date().toISOString();
  job.result = result;
}

export function getMeridianLiveJob(jobId: string): MeridianLiveJob | null {
  return jobs.get(jobId) ?? null;
}

export function getLatestMeridianLiveJob(): MeridianLiveJob | null {
  return latestJobId ? jobs.get(latestJobId) ?? null : null;
}

export function serializeMeridianLiveJobPoll(job: MeridianLiveJob) {
  if (job.status === 'COMPLETED' && job.result) {
    return {
      jobId: job.jobId,
      status: job.status,
      phase: job.phase,
      progressLabel: job.progressLabel,
      completedAt: job.completedAt,
      ...job.result,
    };
  }

  return {
    jobId: job.jobId,
    jobType: job.jobType,
    status: job.status,
    phase: job.phase,
    progressLabel: job.progressLabel,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    errorMessage: job.errorMessage,
    asyncRequired: job.status === 'QUEUED' || job.status === 'RUNNING',
  };
}
