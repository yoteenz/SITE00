/**
 * P0.PAF.2 — Runtime reader adapter (binding store → Frontal Slayer runtime service).
 */

import { createProductVisualAssetsService } from '../../../frontal-slayer-product-assets/runtime/productVisualAssets.js';
import {
  getActiveBinding,
  getBuildAWigVariantRecord,
  getMasterHeroRecord,
  getVisualAssetRecord,
} from './bindingStore.js';

export function createStudioWorldRuntimeReader() {
  return createProductVisualAssetsService({
    getActiveBinding: (surface, productId, slotId, variantKey) =>
      getActiveBinding(surface, productId, slotId, variantKey, false),
    getVisualAsset: (assetId) => getVisualAssetRecord(assetId),
    getMasterHero: (productId) => {
      const hero = getMasterHeroRecord(productId);
      return hero ? { id: hero.id, publicUrl: hero.publicUrl, storagePath: hero.storagePath } : null;
    },
    getBuildAWigVariant: (variantKey) => {
      const rec = getBuildAWigVariantRecord(variantKey);
      return rec ? { assetId: rec.assetId, isActive: rec.isActive } : null;
    },
  });
}

export function createPreviewRuntimeReader() {
  return createProductVisualAssetsService({
    getActiveBinding: (surface, productId, slotId, variantKey) =>
      getActiveBinding(surface, productId, slotId, variantKey, true),
    getVisualAsset: (assetId) => getVisualAssetRecord(assetId),
    getMasterHero: (productId) => {
      const hero = getMasterHeroRecord(productId);
      return hero ? { id: hero.id, publicUrl: hero.publicUrl, storagePath: hero.storagePath } : null;
    },
    getBuildAWigVariant: (variantKey) => {
      const rec = getBuildAWigVariantRecord(variantKey);
      return rec ? { assetId: rec.assetId, isActive: rec.isActive } : null;
    },
  });
}
