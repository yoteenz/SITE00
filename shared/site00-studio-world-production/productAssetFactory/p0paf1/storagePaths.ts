/**
 * P0.PAF.1 — Deterministic Supabase storage paths for Frontal Slayer product assets.
 * P0.PAF.2 namespace is authoritative — paths delegate to product-assets hierarchy.
 */

import {
  buildAWigVariantPaths,
  masterHeroOriginalPath,
  pdpColorVariantPaths,
  FS_STORAGE_ROOT,
} from '../p0paf2/storageNamespace.js';
import type { BackgroundMode, FactoryMode } from './types.js';

const ROOT = FS_STORAGE_ROOT.split('/')[0] ?? 'frontal-slayer';

export function masterHeroStoragePath(productId: string, masterHeroId: string, ext: 'png' | 'webp' = 'png'): string {
  const path = masterHeroOriginalPath(productId, masterHeroId);
  return ext === 'png' ? path : path.replace(/\.png$/, `.${ext}`);
}

export function variantStoragePath(input: {
  productId: string;
  masterHeroId: string;
  mode: FactoryMode;
  configurationHash: string;
  colorSlug?: string;
  axes?: Record<string, string>;
  ext?: 'png' | 'webp';
}): string {
  const ext = input.ext ?? 'webp';
  if (input.mode === 'BUILD_A_WIG' && input.axes) {
    const paths = buildAWigVariantPaths({ masterHeroId: input.masterHeroId, axes: input.axes });
    return ext === 'png' ? paths.masterPng : paths.deliveryWebp;
  }
  if (input.colorSlug) {
    const paths = pdpColorVariantPaths({ productId: input.productId, colorSlug: input.colorSlug });
    return ext === 'png' ? paths.primaryPng : paths.primaryWebp;
  }
  return `${FS_STORAGE_ROOT}/products/${sanitize(input.productId)}/variants/${input.configurationHash}.${ext}`;
}

export function subjectMaskStoragePath(masterHeroId: string, region: 'subject' | 'hair'): string {
  return `${ROOT}/products/masks/${sanitize(masterHeroId)}/${region}-mask.png`;
}

export function deliveryDerivativePath(assetId: string, usage: 'desktop' | 'mobile' | 'thumbnail' | 'baw' | 'pdp'): string {
  return `${ROOT}/delivery/${sanitize(assetId)}/${usage}.webp`;
}

export function buildConfigurationHash(axes: Record<string, string>): string {
  const sorted = Object.keys(axes)
    .sort()
    .map((k) => `${k}=${axes[k]}`)
    .join('&');
  let hash = 5381;
  for (let i = 0; i < sorted.length; i += 1) {
    hash = (hash * 33) ^ sorted.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).padStart(16, '0').slice(0, 16);
}

export function colorSlugFromId(colorId: string): string {
  return sanitize(colorId);
}

export function storagePathUsesStructuredConvention(path: string): boolean {
  return path.startsWith('frontal-slayer/product-assets/') && !path.includes('//');
}

export function temporaryFalUrlIsCanonical(url: string | null): boolean {
  if (!url) return false;
  return url.includes('fal.media') || url.includes('fal.ai');
}

function sanitize(value: string): string {
  return value.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
}

export function resolveBackgroundExtension(mode: BackgroundMode): 'png' | 'webp' {
  return mode === 'TRANSPARENT_CUTOUT' || mode === 'REMOVE_BACKGROUND' ? 'png' : 'webp';
}
