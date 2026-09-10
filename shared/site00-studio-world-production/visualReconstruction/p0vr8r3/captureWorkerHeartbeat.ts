/**
 * P0.VR.8R3R4 — Capture worker heartbeat.
 */

import type { CaptureWorkerHealthStatus } from './captureWorkerHealth.js';

export const CAPTURE_WORKER_HEARTBEAT_INTERVAL_MS = 15_000;
export const CAPTURE_WORKER_HEARTBEAT_EXPIRE_MS = 60_000;

export type CaptureWorkerHeartbeat = {
  workerId: string;
  timestamp: string;
  status: CaptureWorkerHealthStatus;
  activeJobCount: number;
  queueDepth: number;
  lastAcceptedJobAt: string | null;
  lastCompletedJobAt: string | null;
  lastError: string | null;
  playwrightReady: boolean;
  browserReady: boolean;
};

export function heartbeatAgeMs(lastHeartbeat: string | null, now = Date.now()): number | null {
  if (!lastHeartbeat) return null;
  return Math.max(0, now - new Date(lastHeartbeat).getTime());
}

export function resolveWorkerStatusFromHeartbeat(input: {
  lastHeartbeat: string | null;
  storedStatus: CaptureWorkerHealthStatus;
  playwrightReady: boolean;
  browserReady: boolean;
  now?: number;
}): CaptureWorkerHealthStatus {
  const age = heartbeatAgeMs(input.lastHeartbeat, input.now);
  if (age === null) return 'UNKNOWN';
  if (age > CAPTURE_WORKER_HEARTBEAT_EXPIRE_MS) return 'OFFLINE';
  if (!input.playwrightReady || !input.browserReady) return 'DEGRADED';
  if (input.storedStatus === 'OFFLINE') return 'OFFLINE';
  return input.storedStatus === 'DEGRADED' ? 'DEGRADED' : 'HEALTHY';
}
