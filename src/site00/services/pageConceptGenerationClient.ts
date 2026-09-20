import type {
  PageConceptGenerationPlan,
  PageConceptGenerationRunResult,
  PageConceptGenerationState,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { captureApiFetch, CAPTURE_API_TIMEOUT_MS, CAPTURE_CURRENT_PAGE_TIMEOUT_MS } from './captureApiFetch.js';

const PATH = '/api/site00/page-concept-generation';

export type PageConceptCapturePayload = {
  captureId: string;
  artifactBase64: string;
  width: number;
  height: number;
};

export async function planPageConceptGenerationApi(
  state: PageConceptGenerationState,
): Promise<PageConceptGenerationPlan> {
  const result = await captureApiFetch<{ ok: boolean; plan?: PageConceptGenerationPlan; error?: string }>(PATH, {
    method: 'POST',
    timeoutMs: CAPTURE_API_TIMEOUT_MS,
    body: { action: 'plan', state },
  });
  if (!result.ok || !result.data?.plan) {
    throw new Error(result.data?.error ?? result.errorCode ?? 'PLAN_FAILED');
  }
  return result.data.plan;
}

export async function runPageConceptGenerationApi(input: {
  state: PageConceptGenerationState;
  mobileCapture: PageConceptCapturePayload;
  desktopCapture: PageConceptCapturePayload;
  founderConfirmedSpend: boolean;
}): Promise<PageConceptGenerationRunResult> {
  const result = await captureApiFetch<PageConceptGenerationRunResult & { ok: boolean; error?: string }>(PATH, {
    method: 'POST',
    timeoutMs: CAPTURE_CURRENT_PAGE_TIMEOUT_MS,
    body: {
      action: 'generate',
      state: input.state,
      mobileCapture: input.mobileCapture,
      desktopCapture: input.desktopCapture,
      founderConfirmedSpend: input.founderConfirmedSpend,
    },
  });
  if (!result.ok || !result.data?.pipelineSet) {
    throw new Error(result.data?.error ?? result.errorCode ?? 'GENERATION_FAILED');
  }
  return result.data;
}
