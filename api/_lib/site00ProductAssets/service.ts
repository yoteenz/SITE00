/**
 * P0.PAF.1 — Product Asset Factory API service (master hero upload + batch dispatch).
 */

import {
  approveMasterHero,
  dispatchBatch,
  confirmBatchCost,
  getBatch,
  getMasterHero,
  persistMasterHeroToSupabase,
  planBatch,
  registerMasterHeroUpload,
} from '../../../shared/site00-studio-world-production/productAssetFactory/p0paf1/index.js';
import { uploadSite00AssetBuffer } from '../site00Assts/storage.js';
import type {
  BackgroundMode,
  FactoryMode,
  MasterHeroType,
  VariantSelection,
  VariationAxis,
} from '../../../shared/site00-studio-world-production/productAssetFactory/p0paf1/types.js';

export async function uploadProductMasterHero(input: {
  productId: string;
  productFamilyId: string;
  heroType: MasterHeroType;
  fileName: string;
  buffer: Buffer;
  backgroundMode?: BackgroundMode;
}): Promise<{ hero: Awaited<ReturnType<typeof registerMasterHeroUpload>>; persisted: boolean }> {
  const hero = registerMasterHeroUpload({
    productId: input.productId,
    productFamilyId: input.productFamilyId,
    heroType: input.heroType,
    fileName: input.fileName,
    buffer: input.buffer,
    backgroundMode: input.backgroundMode,
  });

  await uploadSite00AssetBuffer(hero.storagePath, input.buffer, 'image/png', { upsert: true });
  await persistMasterHeroToSupabase(hero.masterHeroId);
  return { hero: getMasterHero(hero.masterHeroId)!, persisted: true };
}

export async function approveProductMasterHero(masterHeroId: string) {
  return approveMasterHero(masterHeroId);
}

export function createVariantBatchPlan(input: {
  productId: string;
  masterHeroId: string;
  mode: FactoryMode;
  selection: VariantSelection;
  axes: VariationAxis[];
  backgroundMode: BackgroundMode;
}) {
  return planBatch(input);
}

export function confirmVariantBatchCost(batchId: string) {
  return confirmBatchCost(batchId);
}

export function startVariantBatch(batchId: string) {
  return dispatchBatch(batchId);
}

export function getVariantBatch(batchId: string) {
  return getBatch(batchId);
}
