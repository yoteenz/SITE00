/**
 * P0.VR.8R3 — Capture queue worker dispatch with controlled concurrency.
 */

import { PAGE_CAPTURE_MAX_RETRIES } from '../p0vr8/constants.js';
import {
  completeCaptureJob,
  listCaptureQueue,
  startCaptureJob,
} from '../p0vr8/captureQueue.js';
import { getProjectPageRecord, upsertProjectPageRecord } from '../p0vr8/projectPageRegistry.js';
import { captureImplementationSnapshot } from '../p0vr8/screenshotRecorder.js';
import { resolveProjectLiveBaseUrl } from '../p0vr8/projectBaseUrl.js';
import { recordCaptureFailure, shouldBlockCaptureRetry } from './captureFailureLoopGuard.js';
import {
  getCaptureWorkerHealth,
  markWorkerDispatchFinished,
  markWorkerDispatchStarted,
  markWorkerOffline,
} from './captureWorkerHealth.js';
import { getProjectCaptureRun, updateProjectCaptureRun } from './projectCaptureRunStore.js';
import type { PageCaptureJob } from './types.js';

import { DEFAULT_CAPTURE_CONCURRENCY, CAPTURE_RENDER_TIMEOUT_MS } from './constants.js';

export { DEFAULT_CAPTURE_CONCURRENCY, CAPTURE_RENDER_TIMEOUT_MS } from './constants.js';

export type CaptureExecutor = typeof captureImplementationSnapshot;

async function runWithTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(label)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function syncRunCountsFromQueue(projectId: string, runId: string): void {
  const run = getProjectCaptureRun(runId);
  if (!run) return;

  const jobs = listCaptureQueue(projectId);
  const queued = jobs.filter((j) => j.status === 'QUEUED').length;
  const capturing = jobs.filter((j) => j.status === 'CAPTURING').length;
  const completed = jobs.filter((j) => j.status === 'COMPLETE').length;
  const failed = jobs.filter((j) => j.status === 'FAILED').length;

  let status = run.status;
  if (capturing > 0 || queued > 0) status = 'CAPTURING';
  else if (failed > 0 && completed > 0) status = 'PARTIAL';
  else if (failed > 0 && completed === 0) status = 'FAILED';
  else if (completed > 0) status = 'PARTIAL';

  updateProjectCaptureRun(runId, {
    queuedCount: queued,
    capturingCount: capturing,
    completedCount: completed,
    failedCount: failed,
    status,
  });
}

async function executeCaptureJob(
  job: PageCaptureJob,
  options: {
    baseUrl?: string;
    repoRoot?: string;
    captureFn: CaptureExecutor;
  },
): Promise<boolean> {
  const page = getProjectPageRecord(job.projectId, job.pageId);
  if (!page) return false;

  if (shouldBlockCaptureRetry(job.projectId, job.pageId, job.viewport, job.errorCode ?? 'UNKNOWN')) {
    upsertProjectPageRecord({ ...page, status: 'CAPTURE_FAILED' });
    completeCaptureJob(job.jobId, false);
    return false;
  }

  markWorkerDispatchStarted();
  startCaptureJob(job.jobId);
  upsertProjectPageRecord({ ...page, status: 'CAPTURING' });

  try {
    const result = await runWithTimeout(
      options.captureFn({
        projectId: job.projectId,
        screenId: page.screenId,
        pageId: job.pageId,
        viewportClass: job.viewport,
        baseUrl: options.baseUrl ?? resolveProjectLiveBaseUrl(job.projectId),
        repoRoot: options.repoRoot,
        jobId: job.jobId,
        deploymentId: job.deploymentVersion,
        captureType: 'LIVE_CURRENT',
      }),
      CAPTURE_RENDER_TIMEOUT_MS,
      'CAPTURE_RENDER_TIMEOUT',
    );

    const success = Boolean(result && 'pageSnapshot' in result ? result.pageSnapshot : result);
    markWorkerDispatchFinished(success);
    syncRunCountsFromQueue(job.projectId, job.runId);
    return success;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const errorCode = message.includes('TIMEOUT') ? 'CAPTURE_RENDER_TIMEOUT' : 'PAGE_SCREENSHOT_CAPTURE_FAILED';
    recordCaptureFailure(job.projectId, job.pageId, job.viewport, errorCode);

    const updatedJob = completeCaptureJob(job.jobId, false);
    const pageRecord = getProjectPageRecord(job.projectId, job.pageId);
    if (pageRecord) {
      const retry = updatedJob && updatedJob.attempts < PAGE_CAPTURE_MAX_RETRIES;
      upsertProjectPageRecord({
        ...pageRecord,
        status: retry ? 'CAPTURE_PENDING' : 'CAPTURE_FAILED',
      });
    }

    markWorkerDispatchFinished(false, message);
    syncRunCountsFromQueue(job.projectId, job.runId);
    return false;
  }
}

export async function dispatchCaptureWorker(input: {
  projectId: string;
  runId: string;
  concurrency?: number;
  baseUrl?: string;
  repoRoot?: string;
  captureFn?: CaptureExecutor;
}): Promise<{ processed: number; succeeded: number; failed: number }> {
  const health = getCaptureWorkerHealth();
  if (health.status === 'OFFLINE') {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  const captureFn = input.captureFn ?? captureImplementationSnapshot;
  const concurrency = input.concurrency ?? health.concurrencyLimit ?? DEFAULT_CAPTURE_CONCURRENCY;

  updateProjectCaptureRun(input.runId, { status: 'CAPTURING' });

  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  while (true) {
    const pending = listCaptureQueue(input.projectId).filter((j) => j.status === 'QUEUED');
    if (!pending.length) break;

    const batch = pending.slice(0, concurrency);
    const results = await Promise.all(
      batch.map((j) =>
        executeCaptureJob({ ...j, runId: input.runId, attempt: j.attempts, maxAttempts: PAGE_CAPTURE_MAX_RETRIES, captureId: null, errorCode: null, errorMessage: null, sourceVersion: null, deploymentVersion: j.deploymentId ?? null } as PageCaptureJob, {
          baseUrl: input.baseUrl,
          repoRoot: input.repoRoot,
          captureFn,
        }),
      ),
    );

    for (const ok of results) {
      processed++;
      if (ok) succeeded++;
      else failed++;
    }

    syncRunCountsFromQueue(input.projectId, input.runId);
  }

  const run = getProjectCaptureRun(input.runId);
  if (run) {
    const finalStatus =
      run.failedCount > 0 && run.completedCount > 0
        ? 'PARTIAL'
        : run.failedCount > 0
          ? 'FAILED'
          : 'COMPLETE';
    updateProjectCaptureRun(input.runId, {
      status: finalStatus,
      completedAt: new Date().toISOString(),
      queuedCount: 0,
      capturingCount: 0,
    });
  }

  return { processed, succeeded, failed };
}

export function markCaptureWorkerOffline(reason: string): void {
  markWorkerOffline(reason);
}
