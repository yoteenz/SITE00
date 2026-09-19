/**
 * P0.VR.8R3R4 — Capture worker health (reads canonical shared WorkerHealthStore).
 */

import { workerHealthStore, resetWorkerHealthStoreForTest } from './workerHealthStore.js';
import { getActiveCaptureWorkerId } from './captureWorkerRuntime.js';
import { DEFAULT_CAPTURE_CONCURRENCY } from './constants.js';

export type CaptureWorkerHealthStatus = 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'UNKNOWN';

export type CaptureWorkerHealth = {
  status: CaptureWorkerHealthStatus;
  workerId: string;
  lastHeartbeat: string | null;
  lastDispatchAt: string | null;
  lastAcceptedJobAt: string | null;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastError: string | null;
  activeJobCount: number;
  queueDepth: number;
  concurrencyLimit: number;
  buildVersion?: string;
  heartbeatAgeMs?: number | null;
  playwrightReady?: boolean;
  browserReady?: boolean;
  lastCompletedJobAt?: string | null;
};

function resolveWorkerId(): string | undefined {
  return getActiveCaptureWorkerId() ?? undefined;
}

export function getCaptureWorkerHealth(repoRoot?: string): CaptureWorkerHealth {
  const view = workerHealthStore.getWorkerHealth(resolveWorkerId(), repoRoot);
  return {
    status: view.status,
    workerId: view.workerId,
    lastHeartbeat: view.lastHeartbeat,
    lastDispatchAt: view.lastDispatchAt,
    lastAcceptedJobAt: view.lastAcceptedJobAt,
    lastSuccessAt: view.lastSuccessAt,
    lastErrorAt: view.lastErrorAt,
    lastError: view.lastError,
    activeJobCount: view.activeJobCount,
    queueDepth: view.queueDepth,
    concurrencyLimit: view.concurrencyLimit,
    buildVersion: view.buildVersion,
    heartbeatAgeMs: view.heartbeatAgeMs,
    playwrightReady: view.playwrightReady,
    browserReady: view.browserReady,
    lastCompletedJobAt: view.lastCompletedJobAt,
  };
}

export function setCaptureWorkerConcurrency(limit: number, repoRoot?: string): void {
  const workerId = resolveWorkerId() ?? workerHealthStore.getWorkerHealth(undefined, repoRoot).workerId;
  if (workerId && workerId !== 'none') {
    workerHealthStore.updateWorkerMetrics(
      workerId,
      { concurrencyLimit: Math.max(1, Math.min(4, limit)) },
      repoRoot,
    );
  }
}

export function markWorkerOnline(repoRoot?: string): void {
  const workerId = resolveWorkerId() ?? workerHealthStore.getWorkerHealth(undefined, repoRoot).workerId;
  if (!workerId || workerId === 'none') return;
  workerHealthStore.updateWorkerMetrics(
    workerId,
    { status: 'HEALTHY', lastHeartbeat: new Date().toISOString() },
    repoRoot,
  );
}

export function markWorkerDispatchStarted(queueDepth: number, repoRoot?: string): void {
  const workerId = resolveWorkerId() ?? workerHealthStore.getWorkerHealth(undefined, repoRoot).workerId;
  if (!workerId || workerId === 'none') return;
  const health = workerHealthStore.getWorkerHealth(workerId, repoRoot);
  workerHealthStore.updateWorkerMetrics(
    workerId,
    {
      status: 'HEALTHY',
      lastHeartbeat: new Date().toISOString(),
      lastDispatchAt: new Date().toISOString(),
      lastAcceptedJobAt: new Date().toISOString(),
      activeJobCount: health.activeJobCount + 1,
      queueDepth,
    },
    repoRoot,
  );
}

export function markWorkerDispatchFinished(
  success: boolean,
  queueDepth: number,
  error?: string | null,
  repoRoot?: string,
): void {
  const workerId = resolveWorkerId() ?? workerHealthStore.getWorkerHealth(undefined, repoRoot).workerId;
  if (!workerId || workerId === 'none') return;
  const health = workerHealthStore.getWorkerHealth(workerId, repoRoot);
  const now = new Date().toISOString();
  workerHealthStore.updateWorkerMetrics(
    workerId,
    {
      lastHeartbeat: now,
      activeJobCount: Math.max(0, health.activeJobCount - 1),
      queueDepth,
      lastSuccessAt: success ? now : health.lastSuccessAt,
      lastErrorAt: success ? health.lastErrorAt : now,
      lastError: success ? health.lastError : (error ?? 'CAPTURE_FAILED'),
      lastCompletedJobAt: success ? now : health.lastCompletedJobAt,
      status: health.status === 'OFFLINE' ? 'OFFLINE' : success ? 'HEALTHY' : 'DEGRADED',
    },
    repoRoot,
  );
}

export function markWorkerOffline(reason: string, repoRoot?: string): void {
  const workerId = resolveWorkerId() ?? workerHealthStore.getWorkerHealth(undefined, repoRoot).workerId;
  if (!workerId || workerId === 'none') return;
  workerHealthStore.markWorkerOffline(workerId, reason, repoRoot);
}

export function resetCaptureWorkerHealthForTest(): void {
  resetWorkerHealthStoreForTest();
  const workerId = `cap-worker-test-${Date.now()}`;
  workerHealthStore.registerWorker({
    workerId,
    serviceId: 'test',
    instanceId: 'test',
    buildVersion: 'v262',
    contractVersion: 'capture-run-v1',
    startedAt: new Date().toISOString(),
    environment: 'test',
    capabilities: ['PLAYWRIGHT', 'MOBILE_CAPTURE'],
  });
  workerHealthStore.updateWorkerMetrics(workerId, {
    status: 'HEALTHY',
    lastHeartbeat: new Date().toISOString(),
    playwrightReady: true,
    browserReady: true,
    concurrencyLimit: DEFAULT_CAPTURE_CONCURRENCY,
  });
}
