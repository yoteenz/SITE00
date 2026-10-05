/**
 * P0.VR.8R3R4 — Explicit capture worker boot + heartbeat + queue poll.
 */

import { buildCaptureWorkerIdentity } from './captureWorkerIdentity.js';
import { createBootReceipt, type CaptureWorkerBootReceipt } from './captureWorkerBootReceipt.js';
import {
  CAPTURE_WORKER_HEARTBEAT_INTERVAL_MS,
  type CaptureWorkerHeartbeat,
} from './captureWorkerHeartbeat.js';
import { appendCaptureWorkerEvent } from './captureWorkerEvents.js';
import { probePlaywrightReadiness } from './playwrightReadiness.js';
import { workerHealthStore } from './workerHealthStore.js';
import { captureQueueStore } from './captureQueueStore.js';
import { executeCaptureWorkerTestJob, getLatestCaptureWorkerTestJob } from './captureWorkerTestJob.js';
import { listCaptureQueue } from '../p0vr8/captureQueue.js';
import { dispatchCaptureWorker } from './captureWorker.js';
import { getActiveProjectCaptureRun } from './projectCaptureRunStore.js';
import { DEFAULT_CAPTURE_CONCURRENCY } from './constants.js';
import {
  getActiveCaptureWorkerId,
  isCaptureWorkerBootStarted,
  markCaptureWorkerBootStarted,
  resetCaptureWorkerRuntimeForTest,
} from './captureWorkerRuntime.js';

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let repoRootRef: string | undefined;

const QUEUE_POLL_INTERVAL_MS = 5_000;
let pollInFlight = false;

function writeCurrentHeartbeat(repoRoot?: string): void {
  const activeWorkerId = getActiveCaptureWorkerId();
  if (!activeWorkerId) return;
  const health = workerHealthStore.getWorkerHealth(activeWorkerId, repoRoot);
  const heartbeat: CaptureWorkerHeartbeat = {
    workerId: activeWorkerId,
    timestamp: new Date().toISOString(),
    status: health.status === 'UNKNOWN' ? 'HEALTHY' : health.status,
    activeJobCount: health.activeJobCount,
    queueDepth: captureQueueStore.queueDepth(undefined, repoRoot),
    lastAcceptedJobAt: health.lastAcceptedJobAt,
    lastCompletedJobAt: health.lastCompletedJobAt,
    lastError: health.lastError,
    playwrightReady: health.playwrightReady,
    browserReady: health.browserReady,
  };
  workerHealthStore.writeHeartbeat(heartbeat, repoRoot);
  appendCaptureWorkerEvent(
    { workerId: activeWorkerId, type: 'HEARTBEAT', message: `heartbeat ${heartbeat.status}` },
    repoRoot,
  );
}

async function pollWorkerQueue(repoRoot?: string): Promise<void> {
  const activeWorkerId = getActiveCaptureWorkerId();
  if (pollInFlight || !activeWorkerId) return;
  pollInFlight = true;
  try {
    captureQueueStore.releaseExpiredLeases(repoRoot);

    const testJob = getLatestCaptureWorkerTestJob(repoRoot);
    if (testJob?.status === 'QUEUED') {
      await executeCaptureWorkerTestJob(activeWorkerId, testJob.jobId, repoRoot);
      writeCurrentHeartbeat(repoRoot);
      return;
    }

    const registryProjects = new Set(
      listCaptureQueue().filter((j) => j.status === 'QUEUED').map((j) => j.projectId),
    );
    for (const projectId of registryProjects) {
      const activeRun = getActiveProjectCaptureRun(projectId, repoRoot);
      if (!activeRun) continue;
      const pending = listCaptureQueue(projectId).filter((j) => j.status === 'QUEUED');
      if (!pending.length) continue;
      await dispatchCaptureWorker({
        projectId,
        runId: activeRun.runId,
        repoRoot,
        concurrency: DEFAULT_CAPTURE_CONCURRENCY,
      });
      writeCurrentHeartbeat(repoRoot);
      break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (activeWorkerId) workerHealthStore.recordWorkerError(activeWorkerId, message, repoRoot);
  } finally {
    pollInFlight = false;
  }
}

export function isCaptureWorkerStarted(): boolean {
  return isCaptureWorkerBootStarted();
}

export async function startCaptureWorker(options?: { repoRoot?: string }): Promise<CaptureWorkerBootReceipt> {
  const existingWorkerId = getActiveCaptureWorkerId();
  if (isCaptureWorkerBootStarted() && existingWorkerId) {
    const health = workerHealthStore.getWorkerHealth(existingWorkerId, options?.repoRoot);
    return (
      health.status !== 'UNKNOWN'
        ? {
            workerId: existingWorkerId,
            bootStartedAt: health.lastHeartbeat ?? new Date().toISOString(),
            bootCompletedAt: health.lastHeartbeat,
            buildVersion: health.buildVersion,
            playwrightInit: health.playwrightReady,
            browserInit: health.browserReady,
            queueInit: true,
            heartbeatInit: Boolean(heartbeatTimer),
            status: health.status === 'HEALTHY' ? 'HEALTHY' : health.status === 'DEGRADED' ? 'DEGRADED' : 'FAILED',
            errors: health.lastError ? [health.lastError] : [],
          }
        : createBootReceipt(existingWorkerId, health.buildVersion)
    ) as CaptureWorkerBootReceipt;
  }

  repoRootRef = options?.repoRoot;

  const identity = buildCaptureWorkerIdentity();
  markCaptureWorkerBootStarted(identity.workerId);
  const receipt = createBootReceipt(identity.workerId, identity.buildVersion);

  appendCaptureWorkerEvent(
    { workerId: identity.workerId, type: 'WORKER_BOOTING', message: 'Worker boot starting' },
    repoRootRef,
  );
  workerHealthStore.registerWorker(identity, repoRootRef);
  appendCaptureWorkerEvent(
    { workerId: identity.workerId, type: 'WORKER_REGISTERED', message: 'Worker registered' },
    repoRootRef,
  );

  const readiness = await probePlaywrightReadiness();
  receipt.playwrightInit = readiness.playwrightReady;
  receipt.browserInit = readiness.browserReady;

  if (readiness.browserBootReceipt) {
    workerHealthStore.saveBrowserBootReceipt(readiness.browserBootReceipt, repoRootRef);
  }

  if (readiness.playwrightReady) {
    appendCaptureWorkerEvent(
      { workerId: identity.workerId, type: 'PLAYWRIGHT_READY', message: 'Playwright module loaded' },
      repoRootRef,
    );
  }
  if (readiness.browserReady) {
    appendCaptureWorkerEvent(
      { workerId: identity.workerId, type: 'BROWSER_READY', message: 'Chromium launch verified' },
      repoRootRef,
    );
  }

  if (!readiness.browserReady) {
    receipt.errors.push(readiness.errorCode ?? 'BROWSER_LAUNCH_FAILED');
    receipt.status = 'DEGRADED';
    workerHealthStore.updateWorkerMetrics(
      identity.workerId,
      {
        status: 'DEGRADED',
        playwrightReady: readiness.playwrightReady,
        browserReady: false,
        lastError: readiness.errorCode ?? readiness.errorMessage,
        lastErrorAt: new Date().toISOString(),
      },
      repoRootRef,
    );
    appendCaptureWorkerEvent(
      {
        workerId: identity.workerId,
        type: 'WORKER_DEGRADED',
        message: readiness.errorMessage ?? 'Browser not ready',
        errorCode: readiness.errorCode,
      },
      repoRootRef,
    );
  } else {
    receipt.status = 'HEALTHY';
    workerHealthStore.updateWorkerMetrics(
      identity.workerId,
      { status: 'HEALTHY', playwrightReady: true, browserReady: true },
      repoRootRef,
    );
  }

  receipt.queueInit = true;
  receipt.heartbeatInit = true;
  receipt.bootCompletedAt = new Date().toISOString();
  workerHealthStore.saveBootReceipt(receipt, repoRootRef);
  writeCurrentHeartbeat(repoRootRef);

  heartbeatTimer = setInterval(() => writeCurrentHeartbeat(repoRootRef), CAPTURE_WORKER_HEARTBEAT_INTERVAL_MS);
  pollTimer = setInterval(() => {
    void pollWorkerQueue(repoRootRef);
  }, QUEUE_POLL_INTERVAL_MS);

  if (typeof heartbeatTimer.unref === 'function') heartbeatTimer.unref();
  if (typeof pollTimer.unref === 'function') pollTimer.unref();

  return receipt;
}

export function stopCaptureWorkerForTest(): void {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  if (pollTimer) clearInterval(pollTimer);
  heartbeatTimer = null;
  pollTimer = null;
  resetCaptureWorkerRuntimeForTest();
}
