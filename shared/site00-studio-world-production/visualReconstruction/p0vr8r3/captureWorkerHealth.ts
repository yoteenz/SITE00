/**
 * P0.VR.8R3 — Capture worker health telemetry.
 */

export type CaptureWorkerHealthStatus = 'HEALTHY' | 'DEGRADED' | 'OFFLINE';

export type CaptureWorkerHealth = {
  status: CaptureWorkerHealthStatus;
  lastDispatchAt: string | null;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastError: string | null;
  activeWorkers: number;
  concurrencyLimit: number;
};

let health: CaptureWorkerHealth = {
  status: 'HEALTHY',
  lastDispatchAt: null,
  lastSuccessAt: null,
  lastErrorAt: null,
  lastError: null,
  activeWorkers: 0,
  concurrencyLimit: 3,
};

export function getCaptureWorkerHealth(): CaptureWorkerHealth {
  return { ...health };
}

export function setCaptureWorkerConcurrency(limit: number): void {
  health = { ...health, concurrencyLimit: Math.max(1, Math.min(8, limit)) };
}

export function markWorkerDispatchStarted(): void {
  health = {
    ...health,
    status: 'HEALTHY',
    lastDispatchAt: new Date().toISOString(),
    activeWorkers: health.activeWorkers + 1,
  };
}

export function markWorkerDispatchFinished(success: boolean, error?: string | null): void {
  const now = new Date().toISOString();
  health = {
    ...health,
    activeWorkers: Math.max(0, health.activeWorkers - 1),
    lastSuccessAt: success ? now : health.lastSuccessAt,
    lastErrorAt: success ? health.lastErrorAt : now,
    lastError: success ? health.lastError : (error ?? 'CAPTURE_FAILED'),
    status: health.activeWorkers <= 0 && !success ? 'DEGRADED' : health.status,
  };
}

export function markWorkerOffline(reason: string): void {
  health = {
    ...health,
    status: 'OFFLINE',
    lastError: reason,
    lastErrorAt: new Date().toISOString(),
  };
}

export function resetCaptureWorkerHealthForTest(): void {
  health = {
    status: 'HEALTHY',
    lastDispatchAt: null,
    lastSuccessAt: null,
    lastErrorAt: null,
    lastError: null,
    activeWorkers: 0,
    concurrencyLimit: 3,
  };
}
