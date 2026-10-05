import type { PageConceptIncomingCapturePayload } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationRequest.js';
import type {
  PageConceptGenerationPlan,
  PageConceptGenerationState,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { refreshAccessTokenForApi } from '../../utils/api.js';
import { PAGE_CONCEPT_START_TIMEOUT_MS } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptApiTimeouts.js';
import { captureApiFetch, CAPTURE_API_TIMEOUT_MS } from './captureApiFetch.js';
import { throwPageConceptApiFailure } from './pageConceptGenerationErrors.js';

const PATH = '/api/site00/page-concept-generation';

async function pageConceptApiFetch<T>(
  body: Record<string, unknown>,
  timeoutMs: number,
  attempt = 0,
): Promise<Awaited<ReturnType<typeof captureApiFetch<T>>>> {
  const result = await captureApiFetch<T>(PATH, {
    method: 'POST',
    timeoutMs,
    body,
    authHeaderPresent: attempt > 0,
  });
  const apiError =
    result.data && typeof result.data === 'object' && 'error' in result.data ?
      String((result.data as { error?: string }).error ?? '').trim().toUpperCase()
    : '';
  if ((result.status === 401 || apiError === 'UNAUTHORIZED') && attempt === 0) {
    const refreshed = await refreshAccessTokenForApi();
    if (refreshed) return pageConceptApiFetch<T>(body, timeoutMs, 1);
  }
  return result;
}

export type PageConceptCapturePayload = PageConceptIncomingCapturePayload;

export async function planPageConceptGenerationApi(
  state: PageConceptGenerationState,
): Promise<PageConceptGenerationPlan> {
  const result = await pageConceptApiFetch<{ ok: boolean; plan?: PageConceptGenerationPlan; error?: string }>(
    { action: 'plan', state },
    CAPTURE_API_TIMEOUT_MS,
  );
  if (!result.ok || !result.data?.plan) {
    throwPageConceptApiFailure(result, 'PLAN_FAILED');
  }
  return result.data.plan;
}

export async function tracePageConceptGenerationApi(input: {
  state: PageConceptGenerationState;
  mobileCapture?: PageConceptCapturePayload;
  desktopCapture?: PageConceptCapturePayload;
}): Promise<{
  ok: boolean;
  trace: boolean;
  receipt: Awaited<ReturnType<typeof pageConceptApiFetch>>;
}> {
  const result = await pageConceptApiFetch<{
    ok: boolean;
    trace?: boolean;
    dryRun?: boolean;
    message?: string;
    error?: string;
  }>(
    {
      action: 'trace',
      traceOnly: true,
      dryRun: true,
      state: input.state,
      mobileCapture: input.mobileCapture,
      desktopCapture: input.desktopCapture,
    },
    PAGE_CONCEPT_START_TIMEOUT_MS,
  );
  return { ok: result.ok, trace: Boolean(result.data?.trace), receipt: result };
}

