/**
 * P0.VR.CAPTURE.1R3 — Legacy ref normalization + repair.
 */

import type { CanonicalAssetRef, AssetStorageProvider } from './types.js';
import type { ImageDeliveryErrorCode } from './constants.js';
import { SITE00_ASSETS_BUCKET_DEFAULT, SITE00_STORAGE_PUBLIC_PREFIX } from './constants.js';

import { isInvalidPersistedAssetRef } from './persistableCaptureUrl.js';

export { isInvalidPersistedAssetRef } from './persistableCaptureUrl.js';

export function classifyAssetRef(ref: string): AssetStorageProvider {
  if (!ref?.trim()) return 'NONE';
  const trimmed = ref.trim();
  if (isInvalidPersistedAssetRef(trimmed)) return 'NONE';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return 'ABSOLUTE_URL';
  if (trimmed.startsWith('/visual-references/') || trimmed.startsWith('public/visual-references/')) {
    return 'PUBLIC_SITE';
  }
  if (
    trimmed.startsWith('site00/') ||
    trimmed.startsWith('visual-references/site00/') ||
    trimmed.startsWith('studio-world/')
  ) {
    return 'SUPABASE';
  }
  if (trimmed.startsWith('/studio-world/') || trimmed.startsWith('/site00/')) {
    return 'SUPABASE';
  }
  if (trimmed.startsWith('/')) {
    return 'PUBLIC_SITE';
  }
  return 'SUPABASE';
}

function stripPublicPrefix(path: string): string {
  return path.replace(/^public\//, '').replace(/^\/+/, '');
}

export function normalizeLegacyAssetRef(
  ref: string | null | undefined,
  options?: { assetId?: string | null },
): CanonicalAssetRef | null {
  if (!ref?.trim() || isInvalidPersistedAssetRef(ref)) return null;

  const legacyRef = ref.trim();
  const provider = classifyAssetRef(legacyRef);

  if (provider === 'ABSOLUTE_URL') {
    return {
      provider,
      bucket: null,
      objectPath: null,
      assetId: options?.assetId ?? null,
      visibility: 'PUBLIC',
      mimeType: inferMimeFromPath(legacyRef),
      version: 'canonical',
      checksum: null,
      legacyRef,
      assetRefVersion: legacyRef.includes('/storage/v1/object/public/') ? 'v1' : 'v2',
    };
  }

  if (provider === 'PUBLIC_SITE') {
    const objectPath = legacyRef.startsWith('/')
      ? legacyRef
      : `/${stripPublicPrefix(legacyRef)}`;
    return {
      provider,
      bucket: null,
      objectPath,
      assetId: options?.assetId ?? null,
      visibility: 'PUBLIC',
      mimeType: inferMimeFromPath(objectPath),
      version: 'canonical',
      checksum: null,
      legacyRef,
      assetRefVersion: 'v2',
    };
  }

  if (provider === 'SUPABASE') {
    let objectPath = legacyRef.replace(/^\/+/, '');
    if (objectPath.startsWith('site00/') || objectPath.startsWith('visual-references/site00/')) {
      /* already canonical storage path */
    } else if (objectPath.startsWith('studio-world/')) {
      /* implementation snapshots */
    } else if (legacyRef.startsWith('/') && !legacyRef.startsWith('/visual-references/')) {
      objectPath = `${SITE00_STORAGE_PUBLIC_PREFIX}/${objectPath.replace(/^\/+/, '')}`;
    }
    return {
      provider,
      bucket: SITE00_ASSETS_BUCKET_DEFAULT,
      objectPath,
      assetId: options?.assetId ?? null,
      visibility: 'PUBLIC',
      mimeType: inferMimeFromPath(objectPath),
      version: 'canonical',
      checksum: null,
      legacyRef,
      assetRefVersion: 'v2',
    };
  }

  return null;
}

export function repairAssetRef(
  ref: string | null | undefined,
  options?: { assetId?: string | null; storageObjectExists?: boolean },
): { ref: CanonicalAssetRef | null; repaired: boolean; errorCode: ImageDeliveryErrorCode | null } {
  const normalized = normalizeLegacyAssetRef(ref, options);
  if (!normalized) {
    return { ref: null, repaired: false, errorCode: 'ASSET_REF_MISSING' };
  }

  if (normalized.provider === 'SUPABASE' && ref?.startsWith('/') && !ref.startsWith('http')) {
    return { ref: normalized, repaired: true, errorCode: null };
  }

  if (
    options?.storageObjectExists &&
    ref &&
    classifyAssetRef(ref) === 'PUBLIC_SITE' &&
    normalized.objectPath &&
    ref !== normalized.objectPath
  ) {
    return { ref: normalized, repaired: true, errorCode: null };
  }

  return { ref: normalized, repaired: false, errorCode: null };
}

export function inferMimeFromPath(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/png';
}

export function maskSignedUrlForDisplay(url: string): string {
  try {
    const parsed = new URL(url);
    for (const key of ['token', 'Signature', 'X-Amz-Signature', 'sig']) {
      if (parsed.searchParams.has(key)) {
        parsed.searchParams.set(key, '***');
      }
    }
    return parsed.toString();
  } catch {
    return url.replace(/([?&](?:token|sig|Signature)=)[^&]+/gi, '$1***');
  }
}
