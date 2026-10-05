/**
 * P0.VR.4 — Versioned Supabase storage paths for design assets.
 */

import { DESIGN_ASSETS_STORAGE_ROOT } from './constants.js';
import type { DesignReconstructionAssetType } from './types.js';

export function buildDesignAssetStoragePath(params: {
  projectId: string;
  pageId: string;
  assetType: DesignReconstructionAssetType;
  semanticName: string;
  version: number;
  ext?: 'png' | 'webp';
}): string {
  const safeName = params.semanticName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const safeType = params.assetType.toLowerCase();
  const ver = String(params.version).padStart(3, '0');
  const ext = params.ext ?? 'png';
  return `${DESIGN_ASSETS_STORAGE_ROOT}/${params.projectId}/${params.pageId}/${safeType}/${safeName}/v${ver}.${ext}`;
}

export function isTemporaryProviderUrl(url: string | null): boolean {
  if (!url) return false;
  return (
    url.includes('fal.media') ||
    url.includes('fal.ai') ||
    url.includes('fal.run') ||
    url.includes('replicate.delivery')
  );
}

export function assertCanonicalLiveSource(url: string): void {
  if (isTemporaryProviderUrl(url)) {
    throw new Error('Temporary provider URL cannot be used as canonical live page source');
  }
}
