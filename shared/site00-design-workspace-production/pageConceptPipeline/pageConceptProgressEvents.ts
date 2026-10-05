/**
 * P0.VR.PAGE-CONCEPT-FOUNDER-START-AND-PROGRESS-EVENTS1 — append-only run progress history.
 */

import type { PageConceptCgptSubstepId } from './pageConceptLiveProgress.js';
import { PAGE_CONCEPT_CGPT_SUBSTEP_ORDER } from './pageConceptLiveProgress.js';
import type { PageConceptRunProgress } from './pageConceptServerRun.js';
import type { PageConceptServerRun } from './pageConceptServerRun.js';
import type { PageConceptSubstepRunState } from './pageConceptLiveProgress.js';
import { mapCgptServerSubstepToPanel } from './pageConceptLiveProgress.js';
import type { PageConceptCgptSubstepServerState } from './pageConceptCgptSubstepRun.js';
import { emptyCgptSubstepRunDetail } from './pageConceptCgptSubstepRun.js';

export type PageConceptProgressEventStage = 'CGPT' | 'GPT2' | 'NBP';

export type PageConceptProgressEventStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETE'
  | 'RATE_LIMITED'
  | 'FAILED';

export type PageConceptProgressEvent = {
  eventId: string;
  sequence: number;
  runId: string;
  stage: PageConceptProgressEventStage;
  substep: PageConceptCgptSubstepId | null;
  status: PageConceptProgressEventStatus;
  timestamp: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export const PAGE_CONCEPT_PROGRESS_EVENT_PRESENTATION_DWELL_MS = 400;

const MAX_EVENTS_PER_RUN = 600;

function nextSequence(run: Pick<PageConceptServerRun, 'latestProgressSequence'>): number {
  return (run.latestProgressSequence ?? 0) + 1;
}

function makeEvent(
  run: PageConceptServerRun,
  input: Omit<PageConceptProgressEvent, 'eventId' | 'sequence' | 'runId' | 'timestamp'> & {
    timestamp?: string;
  },
): PageConceptProgressEvent {
  const sequence = nextSequence(run);
  return {
    eventId: `pce-${run.runId}-${sequence}`,
    sequence,
    runId: run.runId,
    timestamp: input.timestamp ?? new Date().toISOString(),
    stage: input.stage,
    substep: input.substep,
    status: input.status,
    metadata: input.metadata,
  };
}

function serverSubstepStatus(
  run: PageConceptServerRun,
  id: PageConceptCgptSubstepId,
): PageConceptCgptSubstepServerState {
  return run.cgptSubsteps?.substepStatusById[id] ?? 'PENDING';
}

function mergedSubstepStatusAfterPatch(
  run: PageConceptServerRun,
  patch: PageConceptRunProgress,
  id: PageConceptCgptSubstepId,
): PageConceptCgptSubstepServerState {
  if (patch.cgptSubsteps?.substepStatusById[id] != null) {
    return patch.cgptSubsteps.substepStatusById[id]!;
  }
  return serverSubstepStatus(run, id);
}

function mapServerStatusToEventStatus(
  state: PageConceptCgptSubstepServerState,
): PageConceptProgressEventStatus {
  if (state === 'RUNNING') return 'RUNNING';
  if (state === 'COMPLETE') return 'COMPLETE';
  if (state === 'RATE_LIMITED') return 'RATE_LIMITED';
  if (state === 'FAILED') return 'FAILED';
  return 'PENDING';
}

export function diffPageConceptProgressEventsFromPatch(
  run: PageConceptServerRun,
  patch: PageConceptRunProgress,
): PageConceptProgressEvent[] {
  const events: PageConceptProgressEvent[] = [];
  let cursor = run;

  for (const substepId of PAGE_CONCEPT_CGPT_SUBSTEP_ORDER) {
    const before = serverSubstepStatus(cursor, substepId);
    const after = mergedSubstepStatusAfterPatch(run, patch, substepId);
    if (before === after) continue;
    const event = makeEvent(cursor, {
      stage: 'CGPT',
      substep: substepId,
      status: mapServerStatusToEventStatus(after),
    });
    events.push(event);
    const baseDetail = patch.cgptSubsteps ?? cursor.cgptSubsteps ?? emptyCgptSubstepRunDetail();
    cursor = {
      ...cursor,
      latestProgressSequence: event.sequence,
      cgptSubsteps: {
        ...baseDetail,
        substepStatusById: {
          ...baseDetail.substepStatusById,
          ...(patch.cgptSubsteps?.substepStatusById ?? {}),
          [substepId]: after,
        },
      },
    };
  }

  const gpt2Before = run.gpt2Status;
  const gpt2After = patch.gpt2Status ?? gpt2Before;
  if (gpt2After !== gpt2Before && gpt2After !== 'PENDING') {
    const event = makeEvent(cursor, {
      stage: 'GPT2',
      substep: null,
      status:
        gpt2After === 'RUNNING' ? 'RUNNING'
        : gpt2After === 'COMPLETE' ? 'COMPLETE'
        : gpt2After === 'FAILED' ? 'FAILED'
        : 'PENDING',
    });
    events.push(event);
    cursor = { ...cursor, latestProgressSequence: event.sequence, gpt2Status: gpt2After };
  }

  const nbpBefore = run.nbpStatus;
  const nbpAfter = patch.nbpStatus ?? nbpBefore;
  if (nbpAfter !== nbpBefore && nbpAfter !== 'PENDING') {
    const event = makeEvent(cursor, {
      stage: 'NBP',
      substep: null,
      status:
        nbpAfter === 'RUNNING' ? 'RUNNING'
        : nbpAfter === 'COMPLETE' || nbpAfter === 'PARTIAL' ? 'COMPLETE'
        : nbpAfter === 'FAILED' ? 'FAILED'
        : 'PENDING',
      metadata: patch.currentStage?.startsWith('NBP_') ? { nbpStage: patch.currentStage } : undefined,
    });
    events.push(event);
  }

  return events;
}

export function appendPageConceptProgressEvents(
  run: PageConceptServerRun,
  patch: PageConceptRunProgress,
): { events: PageConceptProgressEvent[]; latestProgressSequence: number } {
  const newEvents = diffPageConceptProgressEventsFromPatch(run, patch);
  if (newEvents.length === 0) {
    return { events: run.progressEvents ?? [], latestProgressSequence: run.latestProgressSequence ?? 0 };
  }
  const merged = [...(run.progressEvents ?? []), ...newEvents];
  const trimmed = merged.length > MAX_EVENTS_PER_RUN ? merged.slice(-MAX_EVENTS_PER_RUN) : merged;
  const latestProgressSequence = newEvents[newEvents.length - 1]!.sequence;
  return { events: trimmed, latestProgressSequence };
}

export function pageConceptProgressEventsAfterSequence(
  events: readonly PageConceptProgressEvent[],
  afterSequence: number,
): PageConceptProgressEvent[] {
  return events.filter((e) => e.sequence > afterSequence);
}

export function eventStatusToPanelSubstepState(
  status: PageConceptProgressEventStatus,
): PageConceptSubstepRunState {
  if (status === 'RUNNING') return 'ACTIVE';
  if (status === 'RATE_LIMITED') return 'RATE_LIMITED';
  if (status === 'COMPLETE') return 'COMPLETE';
  if (status === 'FAILED') return 'FAILED';
  return 'PENDING';
}

export function applyPageConceptProgressEventToSubstepMap(
  map: Record<PageConceptCgptSubstepId, PageConceptSubstepRunState>,
  event: PageConceptProgressEvent,
): Record<PageConceptCgptSubstepId, PageConceptSubstepRunState> {
  if (event.stage !== 'CGPT' || !event.substep) return map;
  return {
    ...map,
    [event.substep]: eventStatusToPanelSubstepState(event.status),
  };
}

/** Rebuild CGPT substep map from ordered events (truthful final states). */
export function substepMapFromProgressEvents(
  events: readonly PageConceptProgressEvent[],
): Record<PageConceptCgptSubstepId, PageConceptSubstepRunState> {
  const map = Object.fromEntries(
    PAGE_CONCEPT_CGPT_SUBSTEP_ORDER.map((id) => [id, 'PENDING' as const]),
  ) as Record<PageConceptCgptSubstepId, PageConceptSubstepRunState>;
  for (const event of events) {
    if (event.stage === 'CGPT' && event.substep) {
      map[event.substep] = eventStatusToPanelSubstepState(event.status);
    }
  }
  return map;
}

export function mergeCgptSubstepDetailIntoEventMap(
  detail: PageConceptServerRun['cgptSubsteps'],
): Record<PageConceptCgptSubstepId, PageConceptSubstepRunState> {
  const map = Object.fromEntries(
    PAGE_CONCEPT_CGPT_SUBSTEP_ORDER.map((id) => [id, 'PENDING' as const]),
  ) as Record<PageConceptCgptSubstepId, PageConceptSubstepRunState>;
  if (!detail) return map;
  for (const id of PAGE_CONCEPT_CGPT_SUBSTEP_ORDER) {
    map[id] = mapCgptServerSubstepToPanel(detail.substepStatusById[id] ?? 'PENDING');
  }
  return map;
}
