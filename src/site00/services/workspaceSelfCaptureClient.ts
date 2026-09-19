import type { WorkspaceSelfSourceContext } from '../../../shared/site00-design-workspace-production/workspaceSelfConcept/sourceContext.js';

export type WorkspaceSelfCaptureApiResult = {
  ok: true;
  route: string;
  build: string;
  sourceContext: WorkspaceSelfSourceContext;
  mobile: { captureId: string; artifactBase64: string };
  desktop: { captureId: string; artifactBase64: string };
};

export async function requestWorkspaceSelfDesignCapture(input: {
  build: string;
  sourceContext: WorkspaceSelfSourceContext;
}): Promise<WorkspaceSelfCaptureApiResult> {
  const apiBase = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? '';
  const res = await fetch(`${apiBase}/api/site00/workspace-self-capture`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      build: input.build,
      sourceContext: input.sourceContext,
      baseUrl: window.location.origin,
    }),
  });
  const json = (await res.json()) as WorkspaceSelfCaptureApiResult & { error?: string; ok?: boolean };
  if (!res.ok || !json.ok) {
    throw new Error(json.error ?? `Capture failed (${res.status})`);
  }
  return json;
}
