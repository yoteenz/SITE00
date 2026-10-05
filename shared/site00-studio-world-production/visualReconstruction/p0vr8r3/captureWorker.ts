/**
 * P0.VR.8R3R1 — Capture queue worker dispatch with receipts + events.
 */

import { completeCaptureJob, listCaptureQueue, startCaptureJob } from '../p0vr8/captureQueue.js';
import { getProjectPageRecord, upsertProjectPageRecord } from '../p0vr8/projectPageRegistry.js';
import { captureImplementationSnapshot } from '../p0vr8/screenshotRecorder.js';
import { resolveProjectLiveBaseUrl } from '../p0vr8/projectBaseUrl.js';
import { recordCaptureFailure, shouldBlockCaptureRetry } from './captureFailureLoopGuard.js';
import {
  getCaptureWorkerHealth,
  markWorkerDispatchFinished,
  markWorkerDispatchStarted,
  markWorkerOffline,
  markWorkerOnline,
} from './captureWorkerHealth.js';
import { getProjectCaptureRun, updateProjectCaptureRun, updateCaptureTarget } from './projectCaptureRunStore.js';
import { syncCaptureQueueToPersistence } from './captureQueuePersistence.js';
import { appendCaptureRunEvent } from './captureRunEvents.js';
import { recordWorkerDispatch, acknowledgeWorkerDispatch } from './workerDispatchReceipt.js';
import type { PageCaptureQueueJobExtended } from '../p0vr8/captureQueue.js';
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

function syncRunCountsFromQueue(projectId: string, runId: string, repoRoot?: string): void {
  const run = getProjectCaptureRun(runId, repoRoot);
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
  else if (completed > 0) status = completed >= run.totalTargets ? 'COMPLETE' : 'PARTIAL';

  updateProjectCaptureRun(
    runId,
    {
      queuedCount: queued,
      capturingCount: capturing,
      completedCount: completed,
      failedCount: failed,
      status,
    },
    repoRoot,
  );
  syncCaptureQueueToPersistence(projectId, runId, repoRoot);
}

async function executeCaptureJob(
  job: PageCaptureQueueJobExtended,
  runId: string,
  options: {
    baseUrl?: string;
    repoRoot?: string;
    captureFn: CaptureExecutor;
  },
): Promise<boolean> {
  const page = getProjectPageRecord(job.projectId, job.pageId);
  if (!page) return false;

  const health = getCaptureWorkerHealth();
  const dispatch = recordWorkerDispatch({ workerId: health.workerId, jobId: job.jobId, runId });
  acknowledgeWorkerDispatch(dispatch.dispatchId);

  appendCaptureRunEvent(
    {
      runId,
      projectId: job.projectId,
      type: 'WORKER_ACKNOWLEDGED',
      route: job.route,
      viewport: job.viewport,
      targetId: job.targetId ?? null,
      jobId: job.jobId,
      message: `${job.route} · ${job.viewport} · worker ack`,
    },
    options.repoRoot,
  );

  if (shouldBlockCaptureRetry(job.projectId, job.pageId, job.viewport, 'CAPTURE_RENDER_TIMEOUT')) {
    upsertProjectPageRecord({ ...page, status: 'CAPTURE_FAILED' });
    completeCaptureJob(job.jobId, false);
    return false;
  }

  const queueDepth = listCaptureQueue(job.projectId).filter((j) => j.status === 'QUEUED').length;
  markWorkerDispatchStarted(queueDepth, options.repoRoot);
  startCaptureJob(job.jobId);
  upsertProjectPageRecord({ ...page, status: 'CAPTURING' });
  if (job.targetId) {
    updateCaptureTarget(job.targetId, { status: 'CAPTURING' }, options.repoRoot);
    updateProjectCaptureRun(runId, { currentTargetId: job.targetId }, options.repoRoot);
  }

  appendCaptureRunEvent(
    {
      runId,
      projectId: job.projectId,
      type: 'CAPTURE_STARTED',
      route: job.route,
      viewport: job.viewport,
      targetId: job.targetId ?? null,
      jobId: job.jobId,
      message: `${job.route} · ${job.viewport} · CAPTURE STARTED`,
    },
    options.repoRoot,
  );

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
        deploymentId: job.deploymentId,
        captureType: 'LIVE_CURRENT',
      }),
      CAPTURE_RENDER_TIMEOUT_MS,
      'CAPTURE_RENDER_TIMEOUT',
    );

    const pageSnap = result && typeof result === 'object' && 'pageSnapshot' in result ? result.pageSnapshot : null;
    const success = Boolean(pageSnap ?? result);

    if (success) {
      appendCaptureRunEvent(
        {
          runId,
          projectId: job.projectId,
          type: 'CAPTURE_PERSISTED',
          route: job.route,
          viewport: job.viewport,
          targetId: job.targetId ?? null,
          jobId: job.jobId,
          message: `${job.route} · ${job.viewport} · persisted`,
        },
        options.repoRoot,
      );
      appendCaptureRunEvent(
        {
          runId,
          projectId: job.projectId,
          type: 'PAGE_PROMOTED_CURRENT',
          route: job.route,
          viewport: job.viewport,
          targetId: job.targetId ?? null,
          jobId: job.jobId,
          message: `${job.route} · ${job.viewport} · CURRENT`,
        },
        options.repoRoot,
      );
      if (job.targetId) updateCaptureTarget(job.targetId, { status: 'COMPLETE' }, options.repoRoot);
    }

    markWorkerDispatchFinished(
      success,
      listCaptureQueue(job.projectId).filter((j) => j.status === 'QUEUED').length,
      undefined,
      options.repoRoot,
    );
    syncRunCountsFromQueue(job.projectId, runId, options.repoRoot);
    return success;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const errorCode = message.includes('TIMEOUT') ? 'CAPTURE_RENDER_TIMEOUT' : 'PAGE_SCREENSHOT_CAPTURE_FAILED';
    recordCaptureFailure(job.projectId, job.pageId, job.viewport, errorCode);

    completeCaptureJob(job.jobId, false);
    const pageRecord = getProjectPageRecord(job.projectId, job.pageId);
    if (pageRecord) {
      upsertProjectPageRecord({ ...pageRecord, status: 'CAPTURE_FAILED' });
    }
    if (job.targetId) updateCaptureTarget(job.targetId, { status: 'FAILED' }, options.repoRoot);

    appendCaptureRunEvent(
      {
        runId,
        projectId: job.projectId,
        type: 'CAPTURE_FAILED',
        route: job.route,
        viewport: job.viewport,
        targetId: job.targetId ?? null,
        jobId: job.jobId,
        message: `${job.route} · ${job.viewport} · ${errorCode}`,
      },
      options.repoRoot,
    );

    markWorkerDispatchFinished(
      false,
      listCaptureQueue(job.projectId).filter((j) => j.status === 'QUEUED').length,
      message,
      options.repoRoot,
    );
    syncRunCountsFromQueue(job.projectId, runId, options.repoRoot);
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
  markWorkerOnline(input.repoRoot);
  const health = getCaptureWorkerHealth(input.repoRoot);
  if (health.status === 'OFFLINE') {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  const captureFn = input.captureFn ?? captureImplementationSnapshot;
  const concurrency = input.concurrency ?? health.concurrencyLimit ?? DEFAULT_CAPTURE_CONCURRENCY;

  updateProjectCaptureRun(input.runId, { status: 'CAPTURING' }, input.repoRoot);

  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  while (true) {
    const pending = listCaptureQueue(input.projectId)
      .filter((j) => j.status === 'QUEUED')
      .sort((a, b) => b.priority - a.priority);
    if (!pending.length) break;

    const batch = pending.slice(0, concurrency);
    const results = await Promise.all(
      batch.map((j) =>
        executeCaptureJob({ ...j, runId: j.runId ?? input.runId }, input.runId, {
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

    syncRunCountsFromQueue(input.projectId, input.runId, input.repoRoot);
  }

  const run = getProjectCaptureRun(input.runId, input.repoRoot);
  if (run) {
    const finalStatus =
      run.failedCount > 0 && run.completedCount > 0
        ? 'PARTIAL'
        : run.failedCount > 0
          ? 'FAILED'
          : 'COMPLETE';
    updateProjectCaptureRun(
      input.runId,
      {
        status: finalStatus,
        completedAt: new Date().toISOString(),
        queuedCount: 0,
        capturingCount: 0,
      },
      input.repoRoot,
    );
    appendCaptureRunEvent(
      {
        runId: input.runId,
        projectId: input.projectId,
        type: finalStatus === 'PARTIAL' ? 'RUN_PARTIAL' : 'RUN_COMPLETED',
        route: null,
        viewport: null,
        targetId: null,
        jobId: null,
        message: finalStatus,
      },
      input.repoRoot,
    );
  }

  return { processed, succeeded, failed };
}

export function markCaptureWorkerOffline(reason: string): void {
  markWorkerOffline(reason);
}
