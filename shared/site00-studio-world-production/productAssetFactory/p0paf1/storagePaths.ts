/**
 * P0.PAF.1 — Deterministic Supabase storage paths for Frontal Slayer product assets.
 */

import type { BackgroundMode, FactoryMode } from './types.js';

const ROOT = 'frontal-slayer';

export function masterHeroStoragePath(productId: string, masterHeroId: string, ext: 'png' | 'webp' = 'png'): string {
  return `${ROOT}/products/${sanitize(productId)}/master/${sanitize(masterHeroId)}.${ext}`;
}

export function variantStoragePath(input: {
  productId: string;
  masterHeroId: string;
  mode: FactoryMode;
  configurationHash: string;
  colorSlug?: string;
  ext?: 'png' | 'webp';
}): string {
  const ext = input.ext ?? 'webp';
  if (input.mode === 'BUILD_A_WIG') {
    return `${ROOT}/build-a-wig/${sanitize(input.masterHeroId)}/${input.configurationHash}/variant.${ext}`;
  }
  const colorSegment = input.colorSlug ? `color/${sanitize(input.colorSlug)}` : 'variants';
  return `${ROOT}/products/${sanitize(input.productId)}/variants/${colorSegment}/${input.configurationHash}.${ext}`;
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
  return path.startsWith(`${ROOT}/`) && !path.includes('//');
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
