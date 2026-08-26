/**
 * P0.PAF.2 — Ingest approved assets from FAL → Supabase storage (never FAL URL as canonical).
 */

import { FS_VISUAL_ASSET_CONTRACT_VERSION } from '../../../frontal-slayer-product-assets/contract/version.js';
import { buildDeterministicVariantKey } from '../../../frontal-slayer-product-assets/contract/variantKey.js';
import type { FrontalSlayerVisualAsset } from '../../../frontal-slayer-product-assets/contract/types.js';
import type { ProductVisualAssetRecord } from '../p0paf1/types.js';
import { FS_STORAGE_BUCKET } from './storageNamespace.js';
import { buildAWigVariantPaths, masterHeroOriginalPath, pdpColorVariantPaths } from './storageNamespace.js';
import { buildStorageManifest } from './storageManifest.js';
import { upsertVisualAssetRecord, upsertMasterHeroRecord, getVisualAssetRecord } from './bindingStore.js';
import { getWhereUsed } from './bindingService.js';
import type { ProductMasterHero } from '../p0paf1/types.js';

export function falUrlIsCanonical(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('fal.media') || url.includes('fal.ai');
}

export function mapP0paf1AssetToFsRecord(
  record: ProductVisualAssetRecord,
  canonicalPublicUrl: string,
  deliveryPath?: string,
): FrontalSlayerVisualAsset {
  if (falUrlIsCanonical(canonicalPublicUrl)) {
    throw new Error('FAIL_FAL_URL_USED_AS_CANONICAL_ASSET');
  }

  const variantKey = buildDeterministicVariantKey(record.variationValues as Record<string, string>);
  const axes = record.variationValues as Record<string, string>;

  return {
    id: record.assetId,
    productId: record.productId,
    masterHeroId: record.masterHeroId,
    batchId: record.batchId,
    variantKey,
    surface: record.variationValues.COLOR ? 'PRODUCT_PAGE' : 'BUILD_A_WIG',
    role: record.role === 'MASTER' ? 'MASTER' : record.role === 'VARIANT' ? 'VARIANT' : 'PRIMARY_HERO',
    colorId: axes.COLOR ?? axes.variantValue ?? null,
    styleId: axes.STYLE ?? null,
    textureId: axes.TEXTURE ?? null,
    length: axes.LENGTH ?? null,
    part: axes.PART ?? null,
    finish: axes.FINISH ?? null,
    storagePath: deliveryPath ?? record.storagePath,
    publicUrl: canonicalPublicUrl,
    deliveryUrl: deliveryPath ? canonicalPublicUrl : record.resolvedUrl,
    thumbnailUrl: deliveryPath ? canonicalPublicUrl.replace(/\.(webp|png)$/, '-thumb.webp') : null,
    width: record.width,
    height: record.height,
    aspectRatio: record.aspectRatio,
    backgroundMode: record.backgroundMode,
    hasAlpha: record.hasAlpha,
    provider: record.provider,
    model: record.model,
    promptVersion: record.promptVersion,
    qaStatus: record.qaStatus,
    status: record.status,
    canonStatus: record.canonStatus === 'CANON' ? 'CANON' : record.canonStatus === 'PREVIEW' ? 'PREVIEW' : 'GENERATED',
    parentAssetId: record.parentAssetId,
    supersedesId: record.supersedes,
    createdAt: record.createdAt,
    approvedAt: record.approvedAt,
    contractVersion: FS_VISUAL_ASSET_CONTRACT_VERSION,
  };
}

export function resolveCanonicalStoragePath(record: ProductVisualAssetRecord): {
  masterPath: string;
  deliveryPath: string;
  thumbnailPath: string;
  folderPath: string;
} {
  const axes = record.variationValues as Record<string, string>;
  if (axes.STYLE || axes.TEXTURE || axes.PART || axes.LENGTH) {
    const paths = buildAWigVariantPaths({ masterHeroId: record.masterHeroId, axes });
    return {
      masterPath: paths.masterPng,
      deliveryPath: paths.deliveryWebp,
      thumbnailPath: paths.thumbnailWebp,
      folderPath: paths.folderPath,
    };
  }
  const colorSlug = axes.COLOR ?? axes.variantValue ?? 'default';
  const paths = pdpColorVariantPaths({ productId: record.productId, colorSlug });
  return {
    masterPath: paths.primaryPng,
    deliveryPath: paths.primaryWebp,
    thumbnailPath: paths.thumbnailWebp,
    folderPath: paths.folderPath,
  };
}

export function ingestApprovedAssetToSupabase(input: {
  record: ProductVisualAssetRecord;
  supabasePublicUrl: string;
}): { asset: FrontalSlayerVisualAsset; manifest: ReturnType<typeof buildStorageManifest> } {
  const paths = resolveCanonicalStoragePath(input.record);
  const asset = mapP0paf1AssetToFsRecord(input.record, input.supabasePublicUrl, paths.deliveryPath);
  upsertVisualAssetRecord(asset);
  const manifest = buildStorageManifest({
    assetId: asset.id,
    productId: asset.productId,
    masterHeroId: asset.masterHeroId,
    variantKey: asset.variantKey,
    surface: asset.surface,
    role: asset.role,
    storageBucket: FS_STORAGE_BUCKET,
    storagePath: paths.deliveryPath,
    mimeType: asset.hasAlpha ? 'image/png' : 'image/webp',
    width: asset.width,
    height: asset.height,
    aspectRatio: asset.aspectRatio,
    hasAlpha: asset.hasAlpha,
  });
  return { asset, manifest };
}

export function ingestMasterHeroToSupabase(hero: ProductMasterHero, publicUrl: string): void {
  if (falUrlIsCanonical(publicUrl)) throw new Error('FAIL_FAL_URL_USED_AS_CANONICAL_ASSET');
  const storagePath = masterHeroOriginalPath(hero.productId, hero.masterHeroId);
  upsertMasterHeroRecord({
    id: hero.masterHeroId,
    productId: hero.productId,
    sourceAssetId: hero.sourceAssetId,
    storagePath,
    publicUrl,
    heroType: hero.heroType,
    backgroundMode: hero.backgroundMode,
    width: 1024,
    height: 1280,
    aspectRatio: hero.aspectRatio,
    lockedAttributes: hero.lockedAttributes as unknown as Record<string, boolean>,
    allowedVariationAxes: hero.allowedVariationAxes,
    status: hero.status,
    canonStatus: hero.status === 'ACTIVE_CANONICAL' ? 'CANON' : 'DRAFT',
    createdAt: hero.createdAt,
    approvedAt: hero.approvedAt,
    supersedesId: hero.supersedes,
  });
}

export function assetIntegrationStatus(assetId: string): {
  storage: boolean;
  binding: boolean;
  website: boolean;
} {
  const asset = getVisualAssetRecord(assetId);
  if (!asset) return { storage: false, binding: false, website: false };
  const storage = Boolean(asset.storagePath.startsWith('frontal-slayer/product-assets'));
  const activeBindings = getWhereUsed(assetId).filter((b) => b.bindingState === 'ACTIVE');
  return {
    storage,
    binding: activeBindings.length > 0,
    website: activeBindings.length > 0 && !falUrlIsCanonical(asset.publicUrl),
  };
}
