/**
 * P0.VR.PAGE-CONCEPT-LIVE-PRODUCTION-TRACE1 — founder-visible live trace log (no secrets).
 */

export type PageConceptLiveTraceEvent = {
  kind: string;
  at: string;
  detail?: string;
};

export type PageConceptLiveProductionTrace = {
  events: PageConceptLiveTraceEvent[];
  sessionPresent: boolean | null;
  stateBefore: string | null;
  stateAfter: string | null;
  renderedStage: string | null;
  apiRequestUrl: string | null;
  apiRequestSent: boolean;
  apiStatus: number | null;
  apiDurationMs: number | null;
  apiErrorCode: string | null;
  apiResponseSummary: string | null;
  dryRunUsed: boolean;
};

export const PAGE_CONCEPT_LIVE_TRACE_INITIAL: PageConceptLiveProductionTrace = {
  events: [],
  sessionPresent: null,
  stateBefore: null,
  stateAfter: null,
  renderedStage: null,
  apiRequestUrl: null,
  apiRequestSent: false,
  apiStatus: null,
  apiDurationMs: null,
  apiErrorCode: null,
  apiResponseSummary: null,
  dryRunUsed: false,
};

export function appendPageConceptLiveTraceEvent(
  trace: PageConceptLiveProductionTrace,
  kind: string,
  detail?: string,
): PageConceptLiveProductionTrace {
  const at = new Date().toISOString();
  const events = [...trace.events, { kind, at, detail }].slice(-40);
  return { ...trace, events };
}

export function formatPageConceptGenerationStatusSnapshot(status: string, generating: boolean): string {
  return `status=${status} generating=${generating ? 'true' : 'false'}`;
}
