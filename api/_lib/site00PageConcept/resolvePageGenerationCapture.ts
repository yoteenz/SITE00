import { PAGE_CONCEPT_CAPTURE_FETCH_TIMEOUT_MS } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptApiTimeouts.js';
import { loadImplementationSnapshotArtifact } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr3e/resolveImplementationSnapshotArtifact.js';
import type { PageGenerationCapturePayload } from './runPageConceptGeneration.js';

export function pageGenerationCapturePayloadValid(payload: PageGenerationCapturePayload | undefined): boolean {
  if (!payload?.captureId) return false;
  return Boolean(
    payload.snapshotId?.trim() ||
      payload.artifactBase64?.trim() ||
      payload.artifactUrl?.trim(),
  );
}

async function fetchUrlAsBase64(url: string): Promise<string> {
  const lower = url.toLowerCase();
  if (
    lower.startsWith('blob:') ||
    lower.startsWith('local://') ||
    lower.includes('localhost') ||
    lower.startsWith('127.0.0.1')
  ) {
    throw new Error('BLOCKED_CAPTURE_ARTIFACT_UNREADABLE');
  }
  const res = await fetch(url, { signal: AbortSignal.timeout(PAGE_CONCEPT_CAPTURE_FETCH_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`CAPTURE_FETCH_${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.toString('base64');
}

export async function resolvePageGenerationCaptureBase64(
  payload: PageGenerationCapturePayload,
  options?: { viewport?: 'MOBILE' | 'DESKTOP' },
): Promise<string> {
  const inline = payload.artifactBase64?.trim();
  if (inline) return inline;

  const snapshotId = payload.snapshotId?.trim();
  if (snapshotId) {
    const artifact = await loadImplementationSnapshotArtifact({
      snapshotId,
      repoRoot: process.cwd(),
      viewport: options?.viewport ?? null,
    });
    return artifact.base64;
  }

  const url = payload.artifactUrl?.trim();
  if (!url) throw new Error('CAPTURE_ARTIFACTS_REQUIRED');
  return fetchUrlAsBase64(url);
}
