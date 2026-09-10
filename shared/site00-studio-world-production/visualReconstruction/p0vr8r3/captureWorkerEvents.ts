/**
 * P0.VR.8R3R4 — Capture worker event log (shared persistence).
 */

import { loadCaptureOrchestrationRegistry, mutateCaptureOrchestrationRegistry } from './captureRunPersistentStore.js';

export type CaptureWorkerEventType =
  | 'WORKER_BOOTING'
  | 'WORKER_REGISTERED'
  | 'HEARTBEAT'
  | 'PLAYWRIGHT_READY'
  | 'BROWSER_READY'
  | 'JOB_CLAIMED'
  | 'JOB_ACKNOWLEDGED'
  | 'CAPTURE_STARTED'
  | 'CAPTURE_COMPLETED'
  | 'CAPTURE_FAILED'
  | 'WORKER_DEGRADED'
  | 'WORKER_OFFLINE'
  | 'TEST_JOB_COMPLETE'
  | 'TEST_JOB_FAILED';

export type CaptureWorkerEvent = {
  eventId: string;
  workerId: string;
  type: CaptureWorkerEventType;
  timestamp: string;
  message: string;
  jobId?: string | null;
  errorCode?: string | null;
};

export function appendCaptureWorkerEvent(
  input: Omit<CaptureWorkerEvent, 'eventId' | 'timestamp'> & { timestamp?: string },
  repoRoot?: string,
): CaptureWorkerEvent {
  const event: CaptureWorkerEvent = {
    eventId: `cwe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: input.timestamp ?? new Date().toISOString(),
    workerId: input.workerId,
    type: input.type,
    message: input.message,
    jobId: input.jobId ?? null,
    errorCode: input.errorCode ?? null,
  };
  mutateCaptureOrchestrationRegistry((registry) => {
    if (!registry.workerEvents) registry.workerEvents = [];
    registry.workerEvents.push(event);
    if (registry.workerEvents.length > 500) {
      registry.workerEvents = registry.workerEvents.slice(-500);
    }
  }, repoRoot);
  return event;
}

export function listCaptureWorkerEvents(workerId?: string, repoRoot?: string): CaptureWorkerEvent[] {
  const registry = loadCaptureOrchestrationRegistry(repoRoot);
  const events = registry.workerEvents ?? [];
  return workerId ? events.filter((e) => e.workerId === workerId) : events;
}

export function clearCaptureWorkerEventsForTest(): void {
  mutateCaptureOrchestrationRegistry((registry) => {
    registry.workerEvents = [];
  });
}
