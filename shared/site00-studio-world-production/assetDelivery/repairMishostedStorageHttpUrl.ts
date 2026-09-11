/**
 * P0.VR.CAPTURE.1R3A — Rewrite site-host storage paths to Supabase public URLs.
 *
 * Stale captures sometimes persist `https://site00.com/studio-world/...` or
 * `https://*.fsbw-dev.com/studio-world/...` which 404 on static hosts (HTML shell).
 * Object bytes live in Supabase `live-preview` — browser previews must use that URL.
 */

import { resolveAssetRenderableUrl } from './assetRenderableUrlResolver.js';

const STORAGE_OBJECT_PREFIXES = ['studio-world/', 'site00/', 'visual-references/site00/'] as const;

export function extractStorageObjectPath(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.includes('/storage/v1/object/public/')) {
    try {
      const url = new URL(trimmed);
      const marker = '/storage/v1/object/public/';
      const idx = url.pathname.indexOf(marker);
      if (idx < 0) return null;
      const afterBucket = url.pathname.slice(idx + marker.length);
      const slash = afterBucket.indexOf('/');
      if (slash < 0) return null;
      return afterBucket.slice(slash + 1);
    } catch {
      return null;
    }
  }

  let path = trimmed;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      path = new URL(path).pathname.replace(/^\/+/, '');
    } catch {
      return null;
    }
  } else {
    path = path.replace(/^\/+/, '');
  }

  if (STORAGE_OBJECT_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return path;
  }

  return null;
}

export function repairMishostedStorageHttpUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const objectPath = extractStorageObjectPath(raw);
  if (!objectPath) return null;
  return resolveAssetRenderableUrl(objectPath).url;
}
