/**
 * P0.VR.8R3R4 — Shared worker health store (canonical — not process-local).
 */

import type { CaptureWorkerIdentity } from './captureWorkerIdentity.js';
import type { CaptureWorkerBootReceipt } from './captureWorkerBootReceipt.js';
import type { CaptureWorkerHeartbeat } from './captureWorkerHeartbeat.js';
import { heartbeatAgeMs, resolveWorkerStatusFromHeartbeat } from './captureWorkerHeartbeat.js';
import type { CaptureWorkerHealth } from './captureWorkerHealth.js';
import type { BrowserBootReceipt } from './browserBootReceipt.js';
import {
  loadCaptureOrchestrationRegistry,
  mutateCaptureOrchestrationRegistry,
  type PersistedWorkerRecord,
} from './captureRunPersistentStore.js';
import { DEFAULT_CAPTURE_CONCURRENCY } from './constants.js';

export type WorkerHealthView = CaptureWorkerHealth & {
  buildVersion: string;
  heartbeatAgeMs: number | null;
  playwrightReady: boolean;
  browserReady: boolean;
  lastCompletedJobAt: string | null;
};

function recordToHealth(record: PersistedWorkerRecord): WorkerHealthView {
  const status = resolveWorkerStatusFromHeartbeat({
    lastHeartbeat: record.lastHeartbeat,
    storedStatus: record.status === 'STARTING' ? 'UNKNOWN' : record.status,
    playwrightReady: record.playwrightReady,
    browserReady: record.browserReady,
  });

  return {
    status,
    workerId: record.workerId,
    lastHeartbeat: record.lastHeartbeat,
    lastDispatchAt: record.lastDispatchAt,
    lastAcceptedJobAt: record.lastAcceptedJobAt,
    lastSuccessAt: record.lastSuccessAt,
    lastErrorAt: record.lastErrorAt,
    lastError: record.lastError,
    activeJobCount: record.activeJobCount,
    queueDepth: record.queueDepth,
    concurrencyLimit: record.concurrencyLimit,
    buildVersion: record.buildVersion,
    heartbeatAgeMs: heartbeatAgeMs(record.lastHeartbeat),
    playwrightReady: record.playwrightReady,
    browserReady: record.browserReady,
    lastCompletedJobAt: record.lastCompletedJobAt,
  };
}

function ensureWorkers(registry: ReturnType<typeof loadCaptureOrchestrationRegistry>): Record<string, PersistedWorkerRecord> {
  if (!registry.workers) registry.workers = {};
  return registry.workers;
}

export const workerHealthStore = {
  registerWorker(identity: CaptureWorkerIdentity, repoRoot?: string): PersistedWorkerRecord {
    let record!: PersistedWorkerRecord;
    mutateCaptureOrchestrationRegistry((registry) => {
      const workers = ensureWorkers(registry);
      record = {
        workerId: identity.workerId,
        serviceId: identity.serviceId,
        instanceId: identity.instanceId,
        buildVersion: identity.buildVersion,
        contractVersion: identity.contractVersion,
        startedAt: identity.startedAt,
        environment: identity.environment,
        capabilities: identity.capabilities,
        status: 'STARTING',
        lastHeartbeat: null,
        activeJobCount: 0,
        queueDepth: 0,
        lastAcceptedJobAt: null,
        lastCompletedJobAt: null,
        lastError: null,
        playwrightReady: false,
        browserReady: false,
        bootReceipt: null,
        lastDispatchAt: null,
        lastSuccessAt: null,
        lastErrorAt: null,
        concurrencyLimit: DEFAULT_CAPTURE_CONCURRENCY,
      };
      workers[identity.workerId] = record;
    }, repoRoot);
    return record!;
  },

  saveBootReceipt(receipt: CaptureWorkerBootReceipt, repoRoot?: string): void {
    mutateCaptureOrchestrationRegistry((registry) => {
      const workers = ensureWorkers(registry);
      const existing = workers[receipt.workerId];
      if (!existing) return;
      workers[receipt.workerId] = {
        ...existing,
        bootReceipt: receipt,
        playwrightReady: receipt.playwrightInit,
        browserReady: receipt.browserInit,
        status: receipt.status === 'HEALTHY' ? 'HEALTHY' : receipt.status === 'DEGRADED' ? 'DEGRADED' : existing.status,
        lastError: receipt.errors[0] ?? existing.lastError,
      };
    }, repoRoot);
  },

  writeHeartbeat(heartbeat: CaptureWorkerHeartbeat, repoRoot?: string): void {
    mutateCaptureOrchestrationRegistry((registry) => {
      const workers = ensureWorkers(registry);
      const existing = workers[heartbeat.workerId];
      if (!existing) return;
      workers[heartbeat.workerId] = {
        ...existing,
        status: heartbeat.status,
        lastHeartbeat: heartbeat.timestamp,
        activeJobCount: heartbeat.activeJobCount,
        queueDepth: heartbeat.queueDepth,
        lastAcceptedJobAt: heartbeat.lastAcceptedJobAt ?? existing.lastAcceptedJobAt,
        lastCompletedJobAt: heartbeat.lastCompletedJobAt ?? existing.lastCompletedJobAt,
        lastError: heartbeat.lastError,
        playwrightReady: heartbeat.playwrightReady,
        browserReady: heartbeat.browserReady,
      };
    }, repoRoot);
  },

  getWorkerHealth(workerId?: string, repoRoot?: string): WorkerHealthView {
    const registry = loadCaptureOrchestrationRegistry(repoRoot);
    const workers = registry.workers ?? {};
    const ids = Object.keys(workers);
    if (!ids.length) {
      return {
        status: 'UNKNOWN',
        workerId: workerId ?? 'none',
        lastHeartbeat: null,
        lastDispatchAt: null,
        lastAcceptedJobAt: null,
        lastSuccessAt: null,
        lastErrorAt: null,
        lastError: null,
        activeJobCount: 0,
        queueDepth: 0,
        concurrencyLimit: DEFAULT_CAPTURE_CONCURRENCY,
        buildVersion: '',
        heartbeatAgeMs: null,
        playwrightReady: false,
        browserReady: false,
        lastCompletedJobAt: null,
      };
    }

    const targetId = workerId && workers[workerId] ? workerId : ids.sort((a, b) => {
      const aTs = workers[a]?.lastHeartbeat ?? '';
      const bTs = workers[b]?.lastHeartbeat ?? '';
      return bTs.localeCompare(aTs);
    })[0]!;

    return recordToHealth(workers[targetId]!);
  },

  listWorkers(repoRoot?: string): WorkerHealthView[] {
    const registry = loadCaptureOrchestrationRegistry(repoRoot);
    return Object.values(registry.workers ?? {}).map(recordToHealth);
  },

  markWorkerOffline(workerId: string, reason: string, repoRoot?: string): void {
    mutateCaptureOrchestrationRegistry((registry) => {
      const workers = ensureWorkers(registry);
      const existing = workers[workerId];
      if (!existing) return;
      workers[workerId] = {
        ...existing,
        status: 'OFFLINE',
        lastError: reason,
        lastErrorAt: new Date().toISOString(),
      };
    }, repoRoot);
  },

  recordWorkerError(workerId: string, error: string, repoRoot?: string): void {
    mutateCaptureOrchestrationRegistry((registry) => {
      const workers = ensureWorkers(registry);
      const existing = workers[workerId];
      if (!existing) return;
      workers[workerId] = {
        ...existing,
        lastError: error,
        lastErrorAt: new Date().toISOString(),
        status: existing.status === 'HEALTHY' ? 'DEGRADED' : existing.status,
      };
    }, repoRoot);
  },

  updateWorkerMetrics(
    workerId: string,
    patch: Partial<
      Pick<
        PersistedWorkerRecord,
        | 'activeJobCount'
        | 'queueDepth'
        | 'lastDispatchAt'
        | 'lastAcceptedJobAt'
        | 'lastCompletedJobAt'
        | 'lastSuccessAt'
        | 'lastErrorAt'
        | 'lastError'
        | 'lastHeartbeat'
        | 'status'
        | 'concurrencyLimit'
        | 'playwrightReady'
        | 'browserReady'
      >
    >,
    repoRoot?: string,
  ): void {
    mutateCaptureOrchestrationRegistry((registry) => {
      const workers = ensureWorkers(registry);
      const existing = workers[workerId];
      if (!existing) return;
      workers[workerId] = { ...existing, ...patch };
    }, repoRoot);
  },

  hasSuccessfulTestJob(repoRoot?: string): boolean {
    const registry = loadCaptureOrchestrationRegistry(repoRoot);
    return Boolean(registry.lastSuccessfulTestJobAt);
  },

  saveBrowserBootReceipt(receipt: BrowserBootReceipt, repoRoot?: string): void {
    mutateCaptureOrchestrationRegistry((registry) => {
      registry.lastBrowserBootReceipt = receipt;
    }, repoRoot);
  },

  getBrowserBootReceipt(repoRoot?: string): BrowserBootReceipt | null {
    const registry = loadCaptureOrchestrationRegistry(repoRoot);
    return registry.lastBrowserBootReceipt ?? null;
  },
};

export function resetWorkerHealthStoreForTest(): void {
  mutateCaptureOrchestrationRegistry((registry) => {
    registry.workers = {};
    registry.workerEvents = [];
    registry.workerTestJobs = [];
    registry.lastSuccessfulTestJobAt = null;
    registry.lastBrowserBootReceipt = null;
    registry.lastTestScreenshot = null;
  });
}
