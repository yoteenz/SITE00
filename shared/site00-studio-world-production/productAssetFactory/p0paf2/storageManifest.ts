/**
 * P0.PAF.2 — Frontal Slayer product asset storage manifest.
 */

import type { FsAssetRole, FsBindingSurface } from '../../../frontal-slayer-product-assets/contract/types.js';

export type FrontalSlayerProductAssetStorageManifest = {
  assetId: string;
  productId: string;
  masterHeroId: string;
  variantKey: string;
  surface: FsBindingSurface | null;
  role: FsAssetRole;
  storageBucket: string;
  storagePath: string;
  folderPath: string;
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  aspectRatio: number;
  hasAlpha: boolean;
  createdAt: string;
  archivedAt: string | null;
};

export function buildStorageManifest(input: {
  assetId: string;
  productId: string;
  masterHeroId: string;
  variantKey: string;
  surface?: FsBindingSurface | null;
  role: FsAssetRole;
  storageBucket: string;
  storagePath: string;
  mimeType: string;
  width: number;
  height: number;
  aspectRatio: number;
  hasAlpha: boolean;
}): FrontalSlayerProductAssetStorageManifest {
  const lastSlash = input.storagePath.lastIndexOf('/');
  const folderPath = lastSlash >= 0 ? input.storagePath.slice(0, lastSlash) : input.storagePath;
  const filename = lastSlash >= 0 ? input.storagePath.slice(lastSlash + 1) : input.storagePath;
  return {
    assetId: input.assetId,
    productId: input.productId,
    masterHeroId: input.masterHeroId,
    variantKey: input.variantKey,
    surface: input.surface ?? null,
    role: input.role,
    storageBucket: input.storageBucket,
    storagePath: input.storagePath,
    folderPath,
    filename,
    mimeType: input.mimeType,
    width: input.width,
    height: input.height,
    aspectRatio: input.aspectRatio,
    hasAlpha: input.hasAlpha,
    createdAt: new Date().toISOString(),
    archivedAt: null,
  };
}
