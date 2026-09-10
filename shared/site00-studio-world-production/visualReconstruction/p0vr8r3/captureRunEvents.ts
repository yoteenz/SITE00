/**
 * P0.VR.8R3R1 — Project capture run event stream (persisted).
 */

import { mutateCaptureOrchestrationRegistry, loadCaptureOrchestrationRegistry } from './captureRunPersistentStore.js';

export const CAPTURE_RUN_EVENT_TYPES = [
  'RUN_CREATED',
  'TARGETS_PLANNED',
  'JOBS_QUEUED',
  'WORKER_ACKNOWLEDGED',
  'CAPTURE_STARTED',
  'CAPTURE_PERSISTED',
  'PAGE_PROMOTED_CURRENT',
  'CAPTURE_FAILED',
  'RUN_PARTIAL',
  'RUN_COMPLETED',
  'RUN_INVALID',
] as const;

export type CaptureRunEventType = (typeof CAPTURE_RUN_EVENT_TYPES)[number];

export type ProjectCaptureRunEvent = {
  eventId: string;
  runId: string;
  projectId: string;
  type: CaptureRunEventType;
  route: string | null;
  viewport: string | null;
  targetId: string | null;
  jobId: string | null;
  message: string;
  occurredAt: string;
};

export function appendCaptureRunEvent(
  input: Omit<ProjectCaptureRunEvent, 'eventId' | 'occurredAt'>,
  repoRoot?: string,
): ProjectCaptureRunEvent {
  const event: ProjectCaptureRunEvent = {
    ...input,
    eventId: `cre-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    occurredAt: new Date().toISOString(),
  };
  mutateCaptureOrchestrationRegistry((registry) => {
    registry.events.unshift(event);
    if (registry.events.length > 500) registry.events.pop();
  }, repoRoot);
  return event;
}

export function getLastCaptureRunEvent(runId: string, repoRoot?: string): ProjectCaptureRunEvent | null {
  const registry = loadCaptureOrchestrationRegistry(repoRoot);
  return registry.events.find((e) => e.runId === runId) ?? null;
}

export function listCaptureRunEvents(runId?: string, limit = 50, repoRoot?: string): ProjectCaptureRunEvent[] {
  const registry = loadCaptureOrchestrationRegistry(repoRoot);
  return registry.events.filter((e) => !runId || e.runId === runId).slice(0, limit);
}

export function clearCaptureRunEventsForTest(): void {
  mutateCaptureOrchestrationRegistry((registry) => {
    registry.events = [];
  });
}
