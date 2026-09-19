/**
 * P0.VR.CAPTURE.1R3A — Map public-site visual paths to Supabase on preview hosts.
 *
 * `/visual-references/...` works on production site00.com (committed under public/).
 * Preview hosts (fsbw-dev, localhost, cloud tunnel) serve SPA HTML for those paths — previews
 * must use Supabase public URLs instead.
 */

import { SITE00_STORAGE_PUBLIC_PREFIX } from './constants.js';

const PRODUCTION_PUBLIC_ASSET_HOSTS = new Set(['site00.com', 'www.site00.com']);

export function isProductionPublicAssetHost(origin: string | null | undefined): boolean {
  if (!origin?.trim()) return false;
  try {
    return PRODUCTION_PUBLIC_ASSET_HOSTS.has(new URL(origin).hostname.toLowerCase());
  } catch {
    return false;
  }
}

/** Map `/visual-references/...` or `visual-references/...` to Supabase object path under site00/. */
export function mapVisualReferencePathToStorageObjectPath(publicPath: string): string | null {
  const trimmed = publicPath.trim().replace(/^\/+/, '').replace(/^public\//, '');
  if (!trimmed.startsWith('visual-references/')) return null;
  return `${SITE00_STORAGE_PUBLIC_PREFIX}/${trimmed}`;
}

/** Map any public-site path that mirrors Supabase storage (e.g. `/site00/visual-references/...`). */
export function mapPublicSitePathToStorageObjectPath(publicPath: string): string | null {
  const trimmed = publicPath.trim().replace(/^\/+/, '').replace(/^public\//, '');
  if (trimmed.startsWith(`${SITE00_STORAGE_PUBLIC_PREFIX}/visual-references/`)) {
    return trimmed;
  }
  return mapVisualReferencePathToStorageObjectPath(publicPath);
}

export function shouldPreferSupabaseForPublicSitePath(origin: string | null | undefined): boolean {
  if (!origin?.trim()) return false;
  return !isProductionPublicAssetHost(origin);
}
