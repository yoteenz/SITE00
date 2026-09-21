import type { PageConceptServerRunSnapshot } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';
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

async function pageConceptGetRun(runId: string, attempt = 0) {
  const result = await captureApiFetch<{ ok: boolean; run?: PageConceptServerRunSnapshot; error?: string }>(
    `${PATH}?runId=${encodeURIComponent(runId)}`,
    { method: 'GET', timeoutMs: PAGE_CONCEPT_POLL_TIMEOUT_MS, authHeaderPresent: attempt > 0 },
  );
  const apiError =
    result.data && typeof result.data === 'object' && 'error' in result.data ?
      String((result.data as { error?: string }).error ?? '').trim().toUpperCase()
    : '';
  if ((result.status === 401 || apiError === 'UNAUTHORIZED') && attempt === 0) {
    const refreshed = await refreshAccessTokenForApi();
    if (refreshed) return pageConceptGetRun(runId, 1);
  }
  return result;
}

export async function startPageConceptGenerationRunApi(input: {
  state: PageConceptGenerationState;
  mobileCapture: PageConceptCapturePayload;
  desktopCapture: PageConceptCapturePayload;
  founderConfirmedSpend: boolean;
  retryFailedOnly?: boolean;
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

export async function fetchPageConceptGenerationRunApi(runId: string): Promise<PageConceptServerRunSnapshot> {
  const result = await pageConceptGetRun(runId);
  if (!result.ok || !result.data?.run) {
    throwPageConceptApiFailure(result, 'GENERATION_RUN_STATUS_FAILED');
  }
  return result.data.run;
}

export async function pollPageConceptGenerationRunUntilTerminal(input: {
  runId: string;
  onUpdate: (run: PageConceptServerRunSnapshot) => void;
  intervalMs?: number;
  maxPolls?: number;
}): Promise<PageConceptServerRunSnapshot> {
  const intervalMs = input.intervalMs ?? PAGE_CONCEPT_POLL_INTERVAL_MS;
  const maxPolls = input.maxPolls ?? 600;
  let last: PageConceptServerRunSnapshot | null = null;
  for (let i = 0; i < maxPolls; i += 1) {
    last = await fetchPageConceptGenerationRunApi(input.runId);
    input.onUpdate(last);
    if (pageConceptServerRunIsTerminal(last.status)) return last;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('GENERATION_RUN_POLL_TIMEOUT');
}
