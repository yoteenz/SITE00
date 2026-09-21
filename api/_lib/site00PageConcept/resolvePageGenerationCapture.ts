import { hydratePersistentImplementationSnapshots } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr3e/hydratePersistentImplementationSnapshots.js';
import { getImplementationSnapshot } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotRegistry.js';
import type { PageGenerationCapturePayload } from './runPageConceptGeneration.js';

let snapshotsHydrated = false;

async function ensureImplementationSnapshotsHydrated(): Promise<void> {
  if (snapshotsHydrated) return;
  await hydratePersistentImplementationSnapshots({ repoRoot: process.cwd() });
  snapshotsHydrated = true;
}

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
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CAPTURE_FETCH_${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.toString('base64');
}

export async function resolvePageGenerationCaptureBase64(payload: PageGenerationCapturePayload): Promise<string> {
  const inline = payload.artifactBase64?.trim();
  if (inline) return inline;

  const snapshotId = payload.snapshotId?.trim();
  if (snapshotId) {
    await ensureImplementationSnapshotsHydrated();
    const snap = getImplementationSnapshot(snapshotId);
    const publicUrl = snap?.publicUrl?.trim();
    if (!snap?.qaPassed || !publicUrl) {
      throw new Error('BLOCKED_CAPTURE_SNAPSHOT_UNREADABLE');
    }
    return fetchUrlAsBase64(publicUrl);
  }

  const url = payload.artifactUrl?.trim();
  if (!url) throw new Error('CAPTURE_ARTIFACTS_REQUIRED');
  return fetchUrlAsBase64(url);
}
