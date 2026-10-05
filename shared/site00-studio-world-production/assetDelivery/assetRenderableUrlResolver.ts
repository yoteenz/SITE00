/**
 * P0.VR.CAPTURE.1R3 — Single canonical browser/server asset URL resolver.
 */

import {
  SITE00_ASSETS_BUCKET_DEFAULT,
  SITE00_PUBLIC_PROJECT_REF,
  SITE00_STORAGE_PUBLIC_PREFIX,
} from './constants.js';
import { classifyAssetRef, isInvalidPersistedAssetRef, normalizeLegacyAssetRef } from './canonicalAssetRef.js';
import type { CanonicalAssetRef, RenderableAssetUrl } from './types.js';
import type { ImageDeliveryErrorCode } from './constants.js';
import { readFounderAuthorityUpload } from '../visualReconstruction/p0vrCapture1R3a/founderAuthorityUploadStore.js';
import { repairMishostedStorageHttpUrl } from './repairMishostedStorageHttpUrl.js';
import {
  mapPublicSitePathToStorageObjectPath,
  shouldPreferSupabaseForPublicSitePath,
} from './publicSiteUrlStrategy.js';

export type AssetResolverEnvironment = {
  supabaseUrl?: string | null;
  bucket?: string | null;
  origin?: string | null;
};

function resolveSupabaseBase(env?: AssetResolverEnvironment): string {
  const envUrl = env?.supabaseUrl?.replace(/\/$/, '');
  if (envUrl && envUrl.length > 0) return envUrl;
  if (typeof import.meta !== 'undefined') {
    const viteUrl = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_SUPABASE_URL;
    if (viteUrl?.trim()) return viteUrl.replace(/\/$/, '');
  }
  const nodeUrl = typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL : undefined;
  if (nodeUrl?.trim()) return nodeUrl.replace(/\/$/, '');
  return `https://${SITE00_PUBLIC_PROJECT_REF}.supabase.co`;
}

function resolveOrigin(env?: AssetResolverEnvironment): string | null {
  if (env?.origin?.trim()) return env.origin.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  return null;
}

export function buildSupabasePublicObjectUrl(
  objectPath: string,
  env?: AssetResolverEnvironment,
): string {
  const bucket = env?.bucket?.trim() || SITE00_ASSETS_BUCKET_DEFAULT;
  const base = resolveSupabaseBase(env);
  const normalized = objectPath.replace(/^\/+/, '');
  return `${base}/storage/v1/object/public/${bucket}/${normalized}`;
}

export function buildSite00PackPublicUrl(relativePath: string, env?: AssetResolverEnvironment): string {
  const normalized = relativePath.replace(/^\/+/, '').replace(/^site00\//, '');
  return buildSupabasePublicObjectUrl(`${SITE00_STORAGE_PUBLIC_PREFIX}/${normalized}`, env);
}

function readFounderAuthorityUploadForPath(path: string): string | null {
  const local = readFounderAuthorityUpload(path);
  if (local?.startsWith('data:')) return local;
  const storagePath = mapPublicSitePathToStorageObjectPath(path);
  if (storagePath && storagePath !== path.replace(/^\/+/, '')) {
    const fromStorageKey = readFounderAuthorityUpload(storagePath);
    if (fromStorageKey?.startsWith('data:')) return fromStorageKey;
  }
  return null;
}

function resolvePublicSitePath(objectPath: string, env?: AssetResolverEnvironment): string {
  const origin = resolveOrigin(env);
  const storageObjectPath = mapPublicSitePathToStorageObjectPath(objectPath);
  if (storageObjectPath && shouldPreferSupabaseForPublicSitePath(origin)) {
    return buildSupabasePublicObjectUrl(storageObjectPath, env);
  }
  const path = objectPath.startsWith('/') ? objectPath : `/${objectPath.replace(/^public\//, '')}`;
  return origin ? `${origin}${path}` : path;
}

function errorResult(
  canonicalRef: CanonicalAssetRef,
  errorCode: ImageDeliveryErrorCode,
): RenderableAssetUrl {
  return {
    url: null,
    provider: canonicalRef.provider,
    expiresAt: null,
    authMode: 'NONE',
    status: 'UNRESOLVABLE',
    errorCode,
    canonicalRef,
  };
}

export function resolveAssetRenderableUrl(
  input: string | CanonicalAssetRef | null | undefined,
  env?: AssetResolverEnvironment,
): RenderableAssetUrl {
  const canonicalRef =
    typeof input === 'string' || input == null ? normalizeLegacyAssetRef(input ?? null) : input;

  if (!canonicalRef) {
    const emptyRef: CanonicalAssetRef = {
      provider: 'NONE',
      bucket: null,
      objectPath: null,
      assetId: null,
      visibility: 'PUBLIC',
      mimeType: null,
      version: 'canonical',
      checksum: null,
      assetRefVersion: 'v2',
    };
    return errorResult(emptyRef, 'ASSET_REF_MISSING');
  }

  if (typeof input === 'string' && isInvalidPersistedAssetRef(input)) {
    return errorResult(canonicalRef, 'ASSET_REF_MALFORMED');
  }

  switch (canonicalRef.provider) {
    case 'ABSOLUTE_URL': {
      const url = canonicalRef.legacyRef ?? canonicalRef.objectPath ?? '';
      if (!url.startsWith('http')) {
        return errorResult(canonicalRef, 'PUBLIC_URL_INVALID');
      }
      const repaired = repairMishostedStorageHttpUrl(url);
      const resolvedUrl = repaired ?? url;
      const authMode = resolvedUrl.includes('token=') || resolvedUrl.includes('Signature=') ? 'SIGNED' : 'PUBLIC';
      return {
        url: resolvedUrl,
        provider: 'ABSOLUTE_URL',
        expiresAt: null,
        authMode,
        status: 'RESOLVED',
        errorCode: null,
        canonicalRef,
      };
    }
    case 'PUBLIC_SITE': {
      const path = canonicalRef.objectPath ?? canonicalRef.legacyRef ?? '';
      if (!path) return errorResult(canonicalRef, 'ASSET_REF_MISSING');
      const founderLocal = readFounderAuthorityUploadForPath(path);
      if (founderLocal?.startsWith('data:')) {
        return {
          url: founderLocal,
          provider: 'PUBLIC_SITE',
          expiresAt: null,
          authMode: 'PUBLIC',
          status: 'RESOLVED',
          errorCode: null,
          canonicalRef,
        };
      }
      return {
        url: resolvePublicSitePath(path, env),
        provider: 'PUBLIC_SITE',
        expiresAt: null,
        authMode: 'PUBLIC',
        status: 'RESOLVED',
        errorCode: null,
        canonicalRef,
      };
    }
    case 'SUPABASE': {
      const objectPath = canonicalRef.objectPath ?? '';
      if (!objectPath) return errorResult(canonicalRef, 'STORAGE_OBJECT_MISSING');
      return {
        url: buildSupabasePublicObjectUrl(objectPath, env),
        provider: 'SUPABASE',
        expiresAt: null,
        authMode: 'PUBLIC',
        status: 'RESOLVED',
        errorCode: null,
        canonicalRef,
      };
    }
    default:
      return errorResult(canonicalRef, 'ASSET_REF_MALFORMED');
  }
}

/** Alias for design authority + live capture + thumbnails. */
export function resolveRenderableAssetUrl(
  ref: string | null | undefined,
  env?: AssetResolverEnvironment,
): RenderableAssetUrl {
  return resolveAssetRenderableUrl(ref, env);
}

export function resolveStoragePublicUrl(
  storagePath: string,
  env?: AssetResolverEnvironment,
): string {
  if (!storagePath?.trim()) return '';
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) return storagePath;
  if (storagePath.startsWith('/visual-references/')) {
    return resolveAssetRenderableUrl(storagePath, env).url ?? storagePath;
  }
  const provider = classifyAssetRef(storagePath);
  if (provider === 'PUBLIC_SITE') {
    return resolveAssetRenderableUrl(storagePath, env).url ?? storagePath;
  }
  return buildSupabasePublicObjectUrl(storagePath.replace(/^\/+/, ''), env);
}
