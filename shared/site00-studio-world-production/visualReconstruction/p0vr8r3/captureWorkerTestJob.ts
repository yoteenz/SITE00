/**
 * P0.VR.8R3R4 / P0.VR.8R3R5 — Lightweight worker test job (non-destructive browser boot proof).
 */

import {
  loadCaptureOrchestrationRegistry,
  mutateCaptureOrchestrationRegistry,
  type CaptureWorkerTestJob,
} from './captureRunPersistentStore.js';
import { runBrowserBootProbe } from './browserBootProbe.js';
import { founderBrowserFailureMessage } from './browserBootReceipt.js';
import { appendCaptureWorkerEvent } from './captureWorkerEvents.js';
import { workerHealthStore } from './workerHealthStore.js';

export type WorkerTestJobResult = {
  job: CaptureWorkerTestJob;
};

export function createCaptureWorkerTestJob(repoRoot?: string): CaptureWorkerTestJob {
  const job: CaptureWorkerTestJob = {
    jobId: `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: 'QUEUED',
    workerId: null,
    queuedAt: new Date().toISOString(),
    claimedAt: null,
    acknowledgedAt: null,
    startedAt: null,
    completedAt: null,
    lastError: null,
  };
  mutateCaptureOrchestrationRegistry((registry) => {
    if (!registry.workerTestJobs) registry.workerTestJobs = [];
    registry.workerTestJobs.push(job);
  }, repoRoot);
  return job;
}

export function getLatestCaptureWorkerTestJob(repoRoot?: string): CaptureWorkerTestJob | null {
  const registry = loadCaptureOrchestrationRegistry(repoRoot);
  const jobs = registry.workerTestJobs ?? [];
  return jobs.length ? jobs[jobs.length - 1]! : null;
}

export async function executeCaptureWorkerTestJob(
  workerId: string,
  jobId: string,
  repoRoot?: string,
): Promise<CaptureWorkerTestJob> {
  const updateJob = (patch: Partial<CaptureWorkerTestJob>): CaptureWorkerTestJob => {
    let updated!: CaptureWorkerTestJob;
    mutateCaptureOrchestrationRegistry((registry) => {
      const jobs = registry.workerTestJobs ?? [];
      const idx = jobs.findIndex((j) => j.jobId === jobId);
      if (idx < 0) return;
      updated = { ...jobs[idx]!, ...patch };
      jobs[idx] = updated;
    }, repoRoot);
    return updated!;
  };

  updateJob({ status: 'CLAIMED', workerId, claimedAt: new Date().toISOString() });
  appendCaptureWorkerEvent(
    { workerId, type: 'JOB_CLAIMED', message: `Test job ${jobId} claimed`, jobId },
    repoRoot,
  );

  updateJob({ status: 'ACKNOWLEDGED', acknowledgedAt: new Date().toISOString() });
  appendCaptureWorkerEvent(
    { workerId, type: 'JOB_ACKNOWLEDGED', message: `Test job ${jobId} acknowledged`, jobId },
    repoRoot,
  );

  updateJob({ status: 'RUNNING', startedAt: new Date().toISOString() });

  const probe = await runBrowserBootProbe({ repoRoot, testProductionUrl: true });

  mutateCaptureOrchestrationRegistry((registry) => {
    registry.lastBrowserBootReceipt = probe.receipt;
    registry.lastTestScreenshot = probe.screenshot;
  }, repoRoot);

  workerHealthStore.saveBrowserBootReceipt(probe.receipt, repoRoot);

  if (!probe.passed) {
    const errorCode = probe.receipt.errorCode ?? 'BROWSER_LAUNCH_FAILED';
    const failed = updateJob({
      status: 'FAILED',
      completedAt: new Date().toISOString(),
      lastError: errorCode,
      browserBootErrorCode: errorCode,
    });
    appendCaptureWorkerEvent(
      {
        workerId,
        type: 'TEST_JOB_FAILED',
        message: founderBrowserFailureMessage(probe.receipt),
        jobId,
        errorCode,
      },
      repoRoot,
    );
    workerHealthStore.recordWorkerError(workerId, errorCode, repoRoot);
    workerHealthStore.updateWorkerMetrics(
      workerId,
      { browserReady: false, playwrightReady: true, status: 'DEGRADED' },
      repoRoot,
    );
    return failed;
  }

  const completed = updateJob({
    status: 'COMPLETE',
    completedAt: new Date().toISOString(),
    screenshotPath: probe.screenshot?.path ?? null,
    screenshotWidth: probe.screenshot?.width ?? null,
    screenshotHeight: probe.screenshot?.height ?? null,
    screenshotTimestamp: probe.screenshot?.timestamp ?? null,
  });

  mutateCaptureOrchestrationRegistry((registry) => {
    registry.lastSuccessfulTestJobAt = new Date().toISOString();
  }, repoRoot);

  appendCaptureWorkerEvent(
    { workerId, type: 'TEST_JOB_COMPLETE', message: `Test job ${jobId} complete`, jobId },
    repoRoot,
  );

  workerHealthStore.updateWorkerMetrics(
    workerId,
    {
      lastCompletedJobAt: completed.completedAt,
      lastSuccessAt: completed.completedAt,
      browserReady: true,
      playwrightReady: true,
      status: 'HEALTHY',
      lastError: null,
    },
    repoRoot,
  );

  return completed;
}
