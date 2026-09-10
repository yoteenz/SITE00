/**
 * P0.VR.8R3R1 — Capture worker health telemetry.
 */

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
};

const WORKER_ID = `cap-worker-${process.env.RAILWAY_DEPLOYMENT_ID ?? 'local'}`;

let health: CaptureWorkerHealth = {
  status: 'UNKNOWN',
  workerId: WORKER_ID,
  lastHeartbeat: null,
  lastDispatchAt: null,
  lastAcceptedJobAt: null,
  lastSuccessAt: null,
  lastErrorAt: null,
  lastError: null,
  activeJobCount: 0,
  queueDepth: 0,
  concurrencyLimit: 2,
};

export function getCaptureWorkerHealth(): CaptureWorkerHealth {
  return { ...health };
}

export function setCaptureWorkerConcurrency(limit: number): void {
  health = { ...health, concurrencyLimit: Math.max(1, Math.min(4, limit)) };
}

export function markWorkerOnline(): void {
  health = {
    ...health,
    status: 'HEALTHY',
    lastHeartbeat: new Date().toISOString(),
  };
}

export function markWorkerDispatchStarted(queueDepth: number): void {
  health = {
    ...health,
    status: 'HEALTHY',
    lastHeartbeat: new Date().toISOString(),
    lastDispatchAt: new Date().toISOString(),
    lastAcceptedJobAt: new Date().toISOString(),
    activeJobCount: health.activeJobCount + 1,
    queueDepth,
  };
}

export function markWorkerDispatchFinished(success: boolean, queueDepth: number, error?: string | null): void {
  const now = new Date().toISOString();
  health = {
    ...health,
    lastHeartbeat: now,
    activeJobCount: Math.max(0, health.activeJobCount - 1),
    queueDepth,
    lastSuccessAt: success ? now : health.lastSuccessAt,
    lastErrorAt: success ? health.lastErrorAt : now,
    lastError: success ? health.lastError : (error ?? 'CAPTURE_FAILED'),
    status: health.status === 'OFFLINE' ? 'OFFLINE' : success ? 'HEALTHY' : 'DEGRADED',
  };
}

export function markWorkerOffline(reason: string): void {
  health = {
    ...health,
    status: 'OFFLINE',
    lastError: reason,
    lastErrorAt: new Date().toISOString(),
    lastHeartbeat: new Date().toISOString(),
  };
}

export function resetCaptureWorkerHealthForTest(): void {
  health = {
    status: 'HEALTHY',
    workerId: WORKER_ID,
    lastHeartbeat: new Date().toISOString(),
    lastDispatchAt: null,
    lastAcceptedJobAt: null,
    lastSuccessAt: null,
    lastErrorAt: null,
    lastError: null,
    activeJobCount: 0,
    queueDepth: 0,
    concurrencyLimit: 2,
  };
}
