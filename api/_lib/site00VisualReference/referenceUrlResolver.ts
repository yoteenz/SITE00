/**
 * Resolve placeholder reference URLs to Supabase public URLs when objects exist.
 */

import type { HostVisualMemory, VisualReferenceRecord } from '../../../shared/site00-visual-reference/types.js';
import {
  hostReferenceStoragePathCandidates,
} from '../../../shared/site00-visual-reference/referenceStoragePaths.js';
import {
  isFalAccessibleReferenceUrl,
  isPlaceholderReferenceUrl,
} from '../../../shared/site00-visual-reference/referencePublicUrl.js';
import {
  getSite00AssetPublicUrl,
  site00StorageObjectExists,
} from '../site00Assts/storage.js';

async function resolveStoragePathPublicUrl(storagePath: string): Promise<string | null> {
  if (!(await site00StorageObjectExists(storagePath))) return null;
  return getSite00AssetPublicUrl(storagePath);
}

export async function resolveReferenceRecordPublicUrl(
  ref: VisualReferenceRecord,
): Promise<VisualReferenceRecord> {
  if (isFalAccessibleReferenceUrl(ref.publicUrl)) return ref;

  for (const candidate of hostReferenceStoragePathCandidates(ref.route, ref.viewportClass)) {
    const resolved = await resolveStoragePathPublicUrl(candidate);
    if (resolved) {
      return {
        ...ref,
        storagePath: candidate,
        publicUrl: resolved,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  if (ref.storagePath && !isPlaceholderReferenceUrl(ref.publicUrl)) {
    const resolved = await resolveStoragePathPublicUrl(ref.storagePath);
    if (resolved) {
      return { ...ref, publicUrl: resolved, updatedAt: new Date().toISOString() };
    }
  }

  return ref;
}

export async function hydrateHostVisualMemory(host: HostVisualMemory): Promise<HostVisualMemory> {
  const references = await Promise.all(host.references.map((ref) => resolveReferenceRecordPublicUrl(ref)));
  const changed = references.some((ref, index) => ref.publicUrl !== host.references[index]?.publicUrl);
  if (!changed) return host;
  return { ...host, references };
}

export function collectInvalidReferenceUrls(references: Array<{ referenceId: string; publicUrl: string | null }>): string[] {
  return references
    .filter((ref) => !isFalAccessibleReferenceUrl(ref.publicUrl))
    .map((ref) => ref.referenceId);
}

export function formatReferenceCaptureRequiredError(invalidReferenceIds: string[]): string {
  return `REFERENCE_CAPTURE_REQUIRED — FAL cannot download reference images (${invalidReferenceIds.join(', ')}). Tap CAPTURE / REFRESH REFERENCES on visual development (API must reach ${process.env.SITE00_CAPTURE_BASE_URL?.trim() || 'https://site00.com'} with Playwright).`;
}
