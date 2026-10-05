/**
 * Client-side catch-up presentation for factual progress events (not simulated execution).
 */

import {
  PAGE_CONCEPT_PROGRESS_EVENT_PRESENTATION_DWELL_MS,
  applyPageConceptProgressEventToSubstepMap,
  eventStatusToPanelSubstepState,
  type PageConceptProgressEvent,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProgressEvents.js';
import {
  PAGE_CONCEPT_CGPT_SUBSTEP_ORDER,
  type PageConceptCgptSubstepId,
  type PageConceptSubstepRunState,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLiveProgress.js';

export type PageConceptPresentedSubstepState = Record<
  PageConceptCgptSubstepId,
  PageConceptSubstepRunState
>;

export function emptyPresentedSubstepState(): PageConceptPresentedSubstepState {
  return Object.fromEntries(
    PAGE_CONCEPT_CGPT_SUBSTEP_ORDER.map((id) => [id, 'PENDING' as const]),
  ) as PageConceptPresentedSubstepState;
}

export function shouldDwellOnProgressEvent(event: PageConceptProgressEvent): boolean {
  return event.stage === 'CGPT' && event.status === 'COMPLETE' && Boolean(event.substep);
}

export async function presentPageConceptProgressEvents(input: {
  events: readonly PageConceptProgressEvent[];
  initialMap: PageConceptPresentedSubstepState;
  onMapUpdate: (map: PageConceptPresentedSubstepState) => void;
  dwellMs?: number;
  sleep?: (ms: number) => Promise<void>;
  isCancelled?: () => boolean;
}): Promise<PageConceptPresentedSubstepState> {
  const dwellMs = input.dwellMs ?? PAGE_CONCEPT_PROGRESS_EVENT_PRESENTATION_DWELL_MS;
  const sleep = input.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
  let map = { ...input.initialMap };

  for (const event of input.events) {
    if (input.isCancelled?.()) break;
    if (event.stage === 'CGPT' && event.substep) {
      map = applyPageConceptProgressEventToSubstepMap(map, event);
      input.onMapUpdate(map);
      if (shouldDwellOnProgressEvent(event)) {
        await sleep(dwellMs);
      }
    } else if (event.stage === 'GPT2' || event.stage === 'NBP') {
      // Stage rail updates come from snapshot; events are still consumed for sequence cursor.
    }
  }

  return map;
}

export function mergeSnapshotSubstepsWithPresented(
  snapshotMap: PageConceptPresentedSubstepState,
  presentedMap: PageConceptPresentedSubstepState,
): PageConceptPresentedSubstepState {
  const out = { ...presentedMap };
  for (const id of PAGE_CONCEPT_CGPT_SUBSTEP_ORDER) {
    const snap = snapshotMap[id];
    const pres = presentedMap[id];
    if (snap === 'ACTIVE' || snap === 'RATE_LIMITED') {
      out[id] = snap;
    } else if (pres === 'COMPLETE' || pres === 'FAILED') {
      out[id] = pres;
    } else {
      out[id] = snap;
    }
  }
  return out;
}

export function panelStateFromEventStatus(
  status: PageConceptProgressEvent['status'],
): PageConceptSubstepRunState {
  return eventStatusToPanelSubstepState(status);
}
