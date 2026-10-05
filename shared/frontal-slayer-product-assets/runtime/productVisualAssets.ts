/**
 * Frontal Slayer website runtime — product visual asset resolver (P0.PAF.2).
 * READ ONLY: ACTIVE approved bindings. No FAL at runtime.
 */

import { FS_VISUAL_ASSET_CONTRACT_VERSION } from '../contract/version.js';
import { buildDeterministicVariantKey, normalizeVariantAxes } from '../contract/variantKey.js';
import type {
  FrontalSlayerAssetBinding,
  FrontalSlayerVisualAsset,
  FsBindingSurface,
  ResolvedProductAsset,
} from '../contract/types.js';

export type ProductVisualAssetsReader = {
  getActiveBinding(
    surface: FsBindingSurface,
    productId: string,
    slotId: string,
    variantKey: string,
  ): FrontalSlayerAssetBinding | null;
  getVisualAsset(assetId: string): FrontalSlayerVisualAsset | null;
  getMasterHero(productId: string): { id: string; publicUrl: string; storagePath: string } | null;
  getBuildAWigVariant(variantKey: string): { assetId: string; isActive: boolean } | null;
};

const bindingCache = new Map<string, ResolvedProductAsset | null>();

function cacheKey(surface: string, productId: string, slotId: string, variantKey: string): string {
  return `${surface}:${productId}:${slotId}:${variantKey}`;
}

export function createProductVisualAssetsService(reader: ProductVisualAssetsReader) {
  return {
    contractVersion: FS_VISUAL_ASSET_CONTRACT_VERSION,

    getProductMasterHero(productId: string) {
      return reader.getMasterHero(productId);
    },

    getProductAssetBinding(
      surface: FsBindingSurface,
      productId: string,
      slotId: string,
      variantKey: string,
    ): ResolvedProductAsset | null {
      const key = cacheKey(surface, productId, slotId, variantKey);
      if (bindingCache.has(key)) return bindingCache.get(key) ?? null;

      const binding = reader.getActiveBinding(surface, productId, slotId, variantKey);
      if (!binding || binding.bindingState !== 'ACTIVE') {
        const fallback = resolveMasterFallback(reader, productId);
        bindingCache.set(key, fallback);
        return fallback;
      }

      const asset = reader.getVisualAsset(binding.assetId);
      if (!asset || asset.canonStatus !== 'CANON') {
        bindingCache.set(key, null);
        return null;
      }

      if (asset.publicUrl.includes('fal.media') || asset.publicUrl.includes('fal.ai')) {
        bindingCache.set(key, null);
        return null;
      }

      const resolved: ResolvedProductAsset = {
        asset,
        binding,
        source: 'ACTIVE_BINDING',
        publicUrl: asset.deliveryUrl ?? asset.publicUrl,
      };
      bindingCache.set(key, resolved);
      return resolved;
    },

    getProductVariantAsset(
      productId: string,
      variantKey: string,
      role: string,
    ): ResolvedProductAsset | null {
      return this.getProductAssetBinding('PRODUCT_PAGE', productId, role, variantKey);
    },

    getBuildAWigVisualAsset(configuration: Record<string, string>): ResolvedProductAsset | null {
      const normalized = normalizeVariantAxes(configuration);
      const variantKey = buildDeterministicVariantKey(normalized);
      const bawRecord = reader.getBuildAWigVariant(variantKey);

      if (bawRecord?.isActive) {
        const asset = reader.getVisualAsset(bawRecord.assetId);
        if (asset && asset.canonStatus === 'CANON') {
          return {
            asset,
            binding: null,
            source: 'ACTIVE_BINDING',
            publicUrl: asset.deliveryUrl ?? asset.publicUrl,
          };
        }
      }

      return this.getProductAssetBinding('BUILD_A_WIG', normalized.productid ?? 'noir', 'CONFIG', variantKey);
    },

    invalidateCache() {
      bindingCache.clear();
    },

    preloadConfigurations(configurations: Record<string, string>[]) {
      for (const config of configurations) {
        this.getBuildAWigVisualAsset(config);
      }
    },
  };
}

function resolveMasterFallback(
  reader: ProductVisualAssetsReader,
  productId: string,
): ResolvedProductAsset | null {
  const master = reader.getMasterHero(productId);
  if (!master) return null;
  return {
    asset: {
      id: master.id,
      productId,
      masterHeroId: master.id,
      batchId: null,
      variantKey: 'master',
      surface: null,
      role: 'MASTER',
      colorId: null,
      styleId: null,
      textureId: null,
      length: null,
      part: null,
      finish: null,
      storagePath: master.storagePath,
      publicUrl: master.publicUrl,
      deliveryUrl: master.publicUrl,
      thumbnailUrl: null,
      width: 1024,
      height: 1280,
      aspectRatio: 0.8,
      backgroundMode: 'KEEP_ORIGINAL',
      hasAlpha: false,
      provider: null,
      model: null,
      promptVersion: null,
      qaStatus: 'PASS',
      status: 'APPROVED',
      canonStatus: 'CANON',
      parentAssetId: null,
      supersedesId: null,
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      contractVersion: FS_VISUAL_ASSET_CONTRACT_VERSION,
    },
    binding: null,
    source: 'MASTER_FALLBACK',
    publicUrl: master.publicUrl,
  };
}

export type ProductVisualAssetsService = ReturnType<typeof createProductVisualAssetsService>;

export function clearProductVisualAssetsCache(): void {
  bindingCache.clear();
}
