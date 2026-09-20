import type {
  WorkspaceSelfGenerationPlan,
  WorkspaceSelfGenerationRunResult,
} from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/generationTypes.js';
import type { WorkspaceSelfWorkflowState } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/types.js';
import { captureApiFetch, CAPTURE_CURRENT_PAGE_TIMEOUT_MS, CAPTURE_API_TIMEOUT_MS } from './captureApiFetch.js';

const PATH = '/api/site00/workspace-self-concept-generation';

export type WorkspaceSelfGenerationCapturePayload = {
  captureId: string;
  artifactBase64: string;
  width: number;
  height: number;
};

export async function planWorkspaceSelfConceptGeneration(state: WorkspaceSelfWorkflowState): Promise<WorkspaceSelfGenerationPlan> {
  const result = await captureApiFetch<{ ok: boolean; plan?: WorkspaceSelfGenerationPlan; error?: string }>(PATH, {
    method: 'POST',
    timeoutMs: CAPTURE_API_TIMEOUT_MS,
    body: { action: 'plan', state },
  });
  if (!result.ok || !result.data?.plan) {
    throw new Error(result.data?.error ?? result.errorCode ?? 'PLAN_FAILED');
  }
  return result.data.plan;
}

export async function runWorkspaceSelfConceptGeneration(input: {
  state: WorkspaceSelfWorkflowState;
  mobileCapture: WorkspaceSelfGenerationCapturePayload;
  desktopCapture: WorkspaceSelfGenerationCapturePayload;
  founderConfirmedSpend: boolean;
  retryArtifactIds?: string[];
}): Promise<WorkspaceSelfGenerationRunResult> {
  const result = await captureApiFetch<WorkspaceSelfGenerationRunResult & { ok: boolean; error?: string }>(PATH, {
    method: 'POST',
    timeoutMs: CAPTURE_CURRENT_PAGE_TIMEOUT_MS,
    body: {
      action: input.retryArtifactIds?.length ? 'retry_failed' : 'generate',
      state: input.state,
      mobileCapture: input.mobileCapture,
      desktopCapture: input.desktopCapture,
      founderConfirmedSpend: input.founderConfirmedSpend,
      retryArtifactIds: input.retryArtifactIds,
    },
  });
  if (!result.ok || !result.data?.pipelineSet) {
    throw new Error(result.data?.error ?? result.errorCode ?? 'GENERATION_FAILED');
  }
  return result.data;
}
