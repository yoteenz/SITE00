import type { WorkspaceSelfSourceContext } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/sourceContext.js';
import { formatCaptureTransportError } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/formatCaptureTransportError.js';
import { resolveFounderCaptureBaseUrl } from '../../utils/site00CaptureBase.js';
import { captureApiFetch, CAPTURE_CURRENT_PAGE_TIMEOUT_MS } from './captureApiFetch.js';

export type WorkspaceSelfCaptureApiResult = {
  ok: true;
  route: string;
  build: string;
  sourceContext: WorkspaceSelfSourceContext;
  mobile: { captureId: string; artifactBase64: string };
  desktop: { captureId: string; artifactBase64: string };
};

const WORKSPACE_SELF_CAPTURE_PATH = '/api/site00/workspace-self-capture';

export async function requestWorkspaceSelfDesignCapture(input: {
  build: string;
  sourceContext: WorkspaceSelfSourceContext;
}): Promise<WorkspaceSelfCaptureApiResult> {
  const result = await captureApiFetch<WorkspaceSelfCaptureApiResult & { error?: string; ok?: boolean }>(
    WORKSPACE_SELF_CAPTURE_PATH,
    {
      method: 'POST',
      timeoutMs: CAPTURE_CURRENT_PAGE_TIMEOUT_MS,
      body: {
        build: input.build,
        sourceContext: input.sourceContext,
        baseUrl: resolveFounderCaptureBaseUrl(),
      },
    },
  );
  if (!result.ok || !result.data?.ok) {
    const apiMessage = result.data?.error?.trim();
    throw new Error(
      apiMessage ||
        (result.errorCode ? formatCaptureTransportError(result.errorCode) : `Capture failed (${result.status})`),
    );
  }
  return result.data;
}
