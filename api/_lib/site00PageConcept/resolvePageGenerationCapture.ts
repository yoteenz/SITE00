import type { PageGenerationCapturePayload } from './runPageConceptGeneration.js';

export function pageGenerationCapturePayloadValid(payload: PageGenerationCapturePayload | undefined): boolean {
  if (!payload?.captureId) return false;
  return Boolean(payload.artifactBase64?.trim() || payload.artifactUrl?.trim());
}

export async function resolvePageGenerationCaptureBase64(payload: PageGenerationCapturePayload): Promise<string> {
  const inline = payload.artifactBase64?.trim();
  if (inline) return inline;

  const url = payload.artifactUrl?.trim();
  if (!url) throw new Error('CAPTURE_ARTIFACTS_REQUIRED');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`CAPTURE_FETCH_${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.toString('base64');
}
