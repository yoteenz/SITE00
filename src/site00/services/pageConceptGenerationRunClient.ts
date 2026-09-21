import type { PageConceptServerRunSnapshot } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';
import type { PageConceptProgressEvent } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProgressEvents.js';
import {
  PAGE_CONCEPT_POLL_INTERVAL_MS,
  PAGE_CONCEPT_POLL_TIMEOUT_MS,
  PAGE_CONCEPT_START_TIMEOUT_MS,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptApiTimeouts.js';
import type { PageConceptGenerationState } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { pageConceptServerRunIsTerminal } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';
import { refreshAccessTokenForApi } from '../../utils/api.js';
import { captureApiFetch } from './captureApiFetch.js';
import { throwPageConceptApiFailure } from './pageConceptGenerationErrors.js';
import type { PageConceptCapturePayload } from './pageConceptGenerationClient.js';

const PATH = '/api/site00/page-concept-generation';

const ACTIVE_RUN_KEY = 'site00:page-concept-server-run:v1';

export function pageConceptActiveServerRunStorageKey(projectId: string, pageId: string): string {
  return `${ACTIVE_RUN_KEY}:${projectId}:${pageId}`;
}

export function savePageConceptActiveServerRunId(projectId: string, pageId: string, runId: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(pageConceptActiveServerRunStorageKey(projectId, pageId), runId);
}

export function loadPageConceptActiveServerRunId(projectId: string, pageId: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(pageConceptActiveServerRunStorageKey(projectId, pageId));
}

export function clearPageConceptActiveServerRunId(projectId: string, pageId: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(pageConceptActiveServerRunStorageKey(projectId, pageId));
}

export type PageConceptGenerationRunPollUpdate = {
  run: PageConceptServerRunSnapshot;
  progressEvents: PageConceptProgressEvent[];
  latestSequence: number;
};

async function pageConceptGetRun(
  runId: string,
  afterSequence: number,
  scope?: { projectId?: string; pageId?: string },
  attempt = 0,
) {
  const qs = new URLSearchParams({
    runId,
    afterSequence: String(Math.max(0, afterSequence)),
  });
  if (scope?.projectId) qs.set('projectId', scope.projectId);
  if (scope?.pageId) qs.set('pageId', scope.pageId);
  const result = await captureApiFetch<{
    ok: boolean;
    run?: PageConceptServerRunSnapshot;
    progressEvents?: PageConceptProgressEvent[];
    latestSequence?: number;
    error?: string;
  }>(`${PATH}?${qs.toString()}`, {
    method: 'GET',
    timeoutMs: PAGE_CONCEPT_POLL_TIMEOUT_MS,
    authHeaderPresent: attempt > 0,
  });
  const apiError =
    result.data && typeof result.data === 'object' && 'error' in result.data ?
      String((result.data as { error?: string }).error ?? '').trim().toUpperCase()
    : '';
  if ((result.status === 401 || apiError === 'UNAUTHORIZED') && attempt === 0) {
    const refreshed = await refreshAccessTokenForApi();
    if (refreshed) return pageConceptGetRun(runId, afterSequence, scope, 1);
  }
  return result;
}

export async function startPageConceptGenerationRunApi(input: {
  state: PageConceptGenerationState;
  mobileCapture: PageConceptCapturePayload;
  desktopCapture: PageConceptCapturePayload;
  founderConfirmedSpend: boolean;
  retryFailedOnly?: boolean;
  retryCgptOnly?: boolean;
  resumeRunId?: string;
  continueNbpAfterGpt2Review?: boolean;
  continueGpt2AfterCgptReview?: boolean;
  retryGpt2Only?: boolean;
  regenerateNbpOnly?: boolean;
  dryRun?: boolean;
}): Promise<{ runId: string; status: string; dryRun: boolean }> {
  const result = await captureApiFetch<{
    ok: boolean;
    runId?: string;
    status?: string;
    dryRun?: boolean;
    error?: string;
  }>(PATH, {
    method: 'POST',
    timeoutMs: PAGE_CONCEPT_START_TIMEOUT_MS,
    body: {
      action: 'start',
      state: input.state,
      mobileCapture: input.mobileCapture,
      desktopCapture: input.desktopCapture,
      founderConfirmedSpend: input.founderConfirmedSpend,
      retryFailedOnly: input.retryFailedOnly === true,
      retryCgptOnly: input.retryCgptOnly === true,
      resumeRunId: input.resumeRunId,
      continueNbpAfterGpt2Review: input.continueNbpAfterGpt2Review === true,
      continueGpt2AfterCgptReview: input.continueGpt2AfterCgptReview === true,
      retryGpt2Only: input.retryGpt2Only === true,
      regenerateNbpOnly: input.regenerateNbpOnly === true,
      dryRun: input.dryRun === true,
    },
  });
  if (result.status !== 202 || !result.ok || !result.data?.runId) {
    throwPageConceptApiFailure(result, 'GENERATION_START_FAILED');
  }
  return {
    runId: result.data.runId,
    status: result.data.status ?? 'QUEUED',
    dryRun: result.data.dryRun === true,
  };
}

export async function fetchPageConceptGenerationRunApi(
  runId: string,
  afterSequence = 0,
  scope?: { projectId?: string; pageId?: string },
): Promise<PageConceptGenerationRunPollUpdate> {
  const result = await pageConceptGetRun(runId, afterSequence, scope);
  if (!result.ok || !result.data?.run) {
    throwPageConceptApiFailure(result, 'GENERATION_RUN_STATUS_FAILED');
  }
  const run = result.data.run;
  const progressEvents =
    result.data.progressEvents ?? run.progressEventsAfterSequence ?? [];
  const latestSequence =
    result.data.latestSequence ?? run.latestProgressSequence ?? 0;
  return { run, progressEvents, latestSequence };
}

export async function pollPageConceptGenerationRunUntilTerminal(input: {
  runId: string;
  projectId?: string;
  pageId?: string;
  afterSequence?: number;
  onUpdate: (update: PageConceptGenerationRunPollUpdate) => void;
  intervalMs?: number;
  maxPolls?: number;
}): Promise<PageConceptServerRunSnapshot> {
  const intervalMs = input.intervalMs ?? PAGE_CONCEPT_POLL_INTERVAL_MS;
  const maxPolls = input.maxPolls ?? 600;
  let lastObservedSequence = input.afterSequence ?? 0;
  let last: PageConceptServerRunSnapshot | null = null;
  for (let i = 0; i < maxPolls; i += 1) {
    const update = await fetchPageConceptGenerationRunApi(input.runId, lastObservedSequence, {
      projectId: input.projectId,
      pageId: input.pageId,
    });
    lastObservedSequence = Math.max(lastObservedSequence, update.latestSequence);
    last = update.run;
    input.onUpdate(update);
    if (
      pageConceptServerRunIsTerminal(last.status) ||
      last.generationStatus === 'GPT2_AWAITING_FOUNDER_REVIEW' ||
      last.generationStatus === 'CGPT_AWAITING_FOUNDER_REVIEW' ||
      last.generationStatus === 'GPT2_MOBILE_AWAITING_SELECTION'
    ) {
      return last;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('GENERATION_RUN_POLL_TIMEOUT');
}
