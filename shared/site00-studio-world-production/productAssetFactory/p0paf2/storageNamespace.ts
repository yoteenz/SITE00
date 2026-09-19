/**
 * P0.PAF.2 — Frontal Slayer product asset storage namespace.
 * Human-browsable hierarchy under frontal-slayer/product-assets/
 */

import { buildConfigurationSlug } from '../../../frontal-slayer-product-assets/contract/variantKey.js';

export const FS_STORAGE_ROOT = 'frontal-slayer/product-assets' as const;
export const FS_STORAGE_BUCKET = process.env.STUDIO_ASSETS_BUCKET?.trim() || 'live-preview';

export const FS_NAMESPACE_SEGMENTS = {
  masters: `${FS_STORAGE_ROOT}/masters`,
  products: `${FS_STORAGE_ROOT}/products`,
  buildAWig: `${FS_STORAGE_ROOT}/build-a-wig`,
  shared: `${FS_STORAGE_ROOT}/shared`,
  derivatives: `${FS_STORAGE_ROOT}/derivatives`,
  thumbnails: `${FS_STORAGE_ROOT}/thumbnails`,
  archived: `${FS_STORAGE_ROOT}/archived`,
} as const;

function sanitize(value: string): string {
  return value.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
}

export function masterHeroOriginalPath(productId: string, masterHeroId: string, version = 1): string {
  return `${FS_NAMESPACE_SEGMENTS.masters}/${sanitize(productId)}/${sanitize(masterHeroId)}/original/${sanitize(productId)}-master-v${version}.png`;
}

export function masterHeroIsolatedPath(productId: string, masterHeroId: string, version = 1): string {
  return `${FS_NAMESPACE_SEGMENTS.masters}/${sanitize(productId)}/${sanitize(masterHeroId)}/isolated/${sanitize(productId)}-master-isolated-v${version}.png`;
}

export function masterHeroMaskPath(productId: string, masterHeroId: string, region: 'subject' | 'hair'): string {
  return `${FS_NAMESPACE_SEGMENTS.masters}/${sanitize(productId)}/${sanitize(masterHeroId)}/masks/${region}-mask.png`;
}

export function buildAWigVariantPaths(input: {
  masterHeroId: string;
  axes: Record<string, string>;
  version?: number;
}): { folderPath: string; masterPng: string; deliveryWebp: string; thumbnailWebp: string } {
  const slug = buildConfigurationSlug(input.axes);
  const folderPath = `${FS_NAMESPACE_SEGMENTS.buildAWig}/${sanitize(input.masterHeroId)}/${slug}`;
  const v = input.version ?? 1;
  const base = `baw-${slug}-v${v}`;
  return {
    folderPath,
    masterPng: `${folderPath}/${base}.png`,
    deliveryWebp: `${folderPath}/${base}.webp`,
    thumbnailWebp: `${folderPath}/${base}-thumb.webp`,
  };
}

export function pdpColorVariantPaths(input: {
  productId: string;
  colorSlug: string;
  role?: string;
  version?: number;
}): { folderPath: string; primaryPng: string; primaryWebp: string; thumbnailWebp: string } {
  const folderPath = `${FS_NAMESPACE_SEGMENTS.products}/${sanitize(input.productId)}/color-variants/${sanitize(input.colorSlug)}`;
  const v = input.version ?? 1;
  const base = `${sanitize(input.productId)}-primary-hero-${sanitize(input.colorSlug)}-v${v}`;
  return {
    folderPath,
    primaryPng: `${folderPath}/${base}.png`,
    primaryWebp: `${folderPath}/${base}.webp`,
    thumbnailWebp: `${folderPath}/${base}-thumb.webp`,
  };
}

export function archivePath(year: number, month: number, filename: string): string {
  const mm = String(month).padStart(2, '0');
  return `${FS_NAMESPACE_SEGMENTS.archived}/${year}/${mm}/${sanitize(filename)}`;
}

export function sharedReferencePath(category: 'colors' | 'styles' | 'textures' | 'references', filename: string): string {
  return `${FS_NAMESPACE_SEGMENTS.shared}/${category}/${sanitize(filename)}`;
}

export function storagePathIsHumanReadable(path: string): boolean {
  return (
    path.startsWith(FS_STORAGE_ROOT) &&
    !path.match(/\/[a-f0-9]{32}\//) &&
    !path.endsWith('.bin')
  );
}

export function legacyP0paf1PathWouldBeUsed(path: string): boolean {
  return path.startsWith('frontal-slayer/products/') && !path.startsWith(FS_STORAGE_ROOT);
}

/** Migrate logical path from P0.PAF.1 flat structure to P0.PAF.2 namespace. */
export function upgradeStoragePathToNamespace(legacyPath: string, context: {
  productId: string;
  masterHeroId: string;
  axes?: Record<string, string>;
  mode?: 'BUILD_A_WIG' | 'PRODUCT_PAGE';
  colorSlug?: string;
}): string {
  if (legacyPath.startsWith(FS_STORAGE_ROOT)) return legacyPath;
  if (context.mode === 'BUILD_A_WIG' && context.axes) {
    return buildAWigVariantPaths({ masterHeroId: context.masterHeroId, axes: context.axes }).masterPng;
  }
  if (context.colorSlug) {
    return pdpColorVariantPaths({ productId: context.productId, colorSlug: context.colorSlug }).primaryWebp;
  }
  return masterHeroOriginalPath(context.productId, context.masterHeroId);
}
