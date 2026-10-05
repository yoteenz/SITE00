/**
 * P0.VR.8R3R4 — Capture worker boot receipt.
 */

export type CaptureWorkerBootStatus = 'STARTING' | 'HEALTHY' | 'DEGRADED' | 'FAILED';

export type CaptureWorkerBootReceipt = {
  workerId: string;
  bootStartedAt: string;
  bootCompletedAt: string | null;
  buildVersion: string;
  playwrightInit: boolean;
  browserInit: boolean;
  queueInit: boolean;
  heartbeatInit: boolean;
  status: CaptureWorkerBootStatus;
  errors: string[];
};

export function createBootReceipt(workerId: string, buildVersion: string): CaptureWorkerBootReceipt {
  return {
    workerId,
    bootStartedAt: new Date().toISOString(),
    bootCompletedAt: null,
    buildVersion,
    playwrightInit: false,
    browserInit: false,
    queueInit: false,
    heartbeatInit: false,
    status: 'STARTING',
    errors: [],
  };
}
