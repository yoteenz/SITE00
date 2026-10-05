/**
 * P0.VR.PAGE-CONCEPT-GENERATE-CLICK-DEADPATH1 — non-secret generate click telemetry.
 */

export type PageConceptGenerateClickTrace = {
  clickReceived: boolean;
  clickAt: string | null;
  preflightStatus: 'idle' | 'started' | 'passed' | 'failed';
  preflightResult: string | null;
  generationRunId: string | null;
  dispatchStatus: 'idle' | 'started' | 'failed' | 'complete';
  lastErrorCode: string | null;
  canGenerateAtClick: boolean | null;
  canPressAtClick: boolean | null;
  sessionPresentAtClick: boolean | null;
  stateSetCgptRunning: boolean;
  renderedStageAtClick: string | null;
};

export const PAGE_CONCEPT_GENERATE_CLICK_TRACE_INITIAL: PageConceptGenerateClickTrace = {
  clickReceived: false,
  clickAt: null,
  preflightStatus: 'idle',
  generationRunId: null,
  dispatchStatus: 'idle',
  lastErrorCode: null,
  canGenerateAtClick: null,
  canPressAtClick: null,
  preflightResult: null,
  sessionPresentAtClick: null,
  stateSetCgptRunning: false,
  renderedStageAtClick: null,
};

export function emitPageConceptGenerateTelemetry(
  kind:
    | 'page_concept_generate_clicked'
    | 'page_concept_generate_preflight_started'
    | 'page_concept_generate_preflight_passed'
    | 'page_concept_generate_preflight_failed'
    | 'page_concept_generation_run_created'
    | 'page_concept_generation_dispatch_started'
    | 'page_concept_generation_dispatch_failed'
    | 'page_concept_generation_trace_api_complete'
    | 'page_concept_founder_generation_confirmed'
    | 'page_concept_review_opened'
    | 'page_concept_new_generation_requested'
    | 'page_concept_cgpt_regeneration_requested'
    | 'page_concept_gpt2_regeneration_requested'
    | 'page_concept_nbp_regeneration_requested'
    | 'page_concept_run_archived'
    | 'page_concept_run_switched'
    | 'page_concept_dual_render_test_requested',
  detail: {
    projectId: string;
    pageId: string;
    generationRunId?: string | null;
    release?: string | null;
    timestamp?: string;
    errorCode?: string | null;
  },
): void {
  const payload = {
    kind,
    ...detail,
    timestamp: detail.timestamp ?? new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('site00:page-concept-generate-telemetry', { detail: payload }));
  }
  if (import.meta.env?.DEV) {
    console.info(kind, payload);
  }
}

export function createPageConceptGenerationRunId(projectId: string, pageId: string): string {
  const stamp = Date.now().toString(36);
  return `pcg-${projectId}-${pageId}-${stamp}`;
}
