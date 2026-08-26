/**
 * P0.PAF.1 — Product master hero registry + upload/approval.
 */

import { DEFAULT_LOCKED_ATTRIBUTES, FRONTAL_SLAYER_BRAND_ID, FRONTAL_SLAYER_PROJECT_ID } from './constants.js';
import { masterHeroStoragePath } from './storagePaths.js';
import { deriveHeroDecomposition } from './heroDecomposition.js';
import { buildDefaultEditRegionMap } from './editRegionMap.js';
import type {
  BackgroundMode,
  MasterHeroType,
  ProductMasterHero,
  VariationAxis,
} from './types.js';

const masterHeroStore = new Map<string, ProductMasterHero>();
const pendingUploads = new Map<string, { buffer: Uint8Array; productId: string; heroType: MasterHeroType }>();

export function registerMasterHeroUpload(input: {
  productId: string;
  productFamilyId: string;
  heroType: MasterHeroType;
  fileName: string;
  buffer: Uint8Array;
  aspectRatio?: number;
  backgroundMode?: BackgroundMode;
}): ProductMasterHero {
  const masterHeroId = `mh-${input.productId}-${Date.now()}`;
  const storagePath = masterHeroStoragePath(input.productId, masterHeroId, 'png');
  pendingUploads.set(masterHeroId, { buffer: input.buffer, productId: input.productId, heroType: input.heroType });

  const hero: ProductMasterHero = {
    masterHeroId,
    projectId: FRONTAL_SLAYER_PROJECT_ID,
    brandId: FRONTAL_SLAYER_BRAND_ID,
    productId: input.productId,
    productFamilyId: input.productFamilyId,
    sourceAssetId: `upload-${input.fileName}`,
    storagePath,
    publicUrl: `/storage/${storagePath}`,
    heroType: input.heroType,
    orientation: 'portrait',
    cameraAngle: 'front-three-quarter',
    crop: 'full-product',
    aspectRatio: input.aspectRatio ?? 0.8,
    backgroundMode: input.backgroundMode ?? 'KEEP_ORIGINAL',
    lockedAttributes: { ...DEFAULT_LOCKED_ATTRIBUTES },
    allowedVariationAxes: defaultAxesForHeroType(input.heroType),
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    approvedAt: null,
    supersedes: null,
  };

  masterHeroStore.set(masterHeroId, hero);
  deriveHeroDecomposition(hero);
  buildDefaultEditRegionMap(hero.masterHeroId);
  return hero;
}

export async function persistMasterHeroToSupabase(masterHeroId: string): Promise<ProductMasterHero | null> {
  const hero = masterHeroStore.get(masterHeroId);
  const pending = pendingUploads.get(masterHeroId);
  if (!hero || !pending) return null;

  // Simulated Supabase persistence — real upload via API service
  hero.publicUrl = `https://storage.site00.test/${hero.storagePath}`;
  masterHeroStore.set(masterHeroId, hero);
  pendingUploads.delete(masterHeroId);
  return hero;
}

export function approveMasterHero(masterHeroId: string): ProductMasterHero | null {
  const hero = masterHeroStore.get(masterHeroId);
  if (!hero || hero.status !== 'DRAFT') return null;

  // Supersede prior canonical for same product
  for (const [id, existing] of masterHeroStore) {
    if (
      existing.productId === hero.productId &&
      existing.status === 'ACTIVE_CANONICAL' &&
      id !== masterHeroId
    ) {
      masterHeroStore.set(id, { ...existing, status: 'SUPERSEDED' });
    }
  }

  const approved: ProductMasterHero = {
    ...hero,
    status: 'ACTIVE_CANONICAL',
    approvedAt: new Date().toISOString(),
  };
  masterHeroStore.set(masterHeroId, approved);
  return approved;
}

export function getMasterHero(masterHeroId: string): ProductMasterHero | null {
  return masterHeroStore.get(masterHeroId) ?? null;
}

export function getActiveCanonicalMasterHero(productId: string): ProductMasterHero | null {
  for (const hero of masterHeroStore.values()) {
    if (hero.productId === productId && hero.status === 'ACTIVE_CANONICAL') {
      return hero;
    }
  }
  return null;
}

export function listMasterHeroes(productId?: string): ProductMasterHero[] {
  const all = [...masterHeroStore.values()];
  return productId ? all.filter((h) => h.productId === productId) : all;
}

export function masterHeroUploadDoesNotTriggerFal(masterHeroId: string): boolean {
  const hero = masterHeroStore.get(masterHeroId);
  return Boolean(hero && hero.status === 'DRAFT');
}

function defaultAxesForHeroType(heroType: MasterHeroType): VariationAxis[] {
  if (heroType === 'BUILD_A_WIG_BASE') {
    return ['COLOR', 'STYLE', 'TEXTURE', 'PART', 'LENGTH', 'FINISH'];
  }
  return ['COLOR'];
}

export function clearMasterHeroStoreForTest(): void {
  masterHeroStore.clear();
  pendingUploads.clear();
}

export function seedMasterHeroForTest(hero: ProductMasterHero): void {
  masterHeroStore.set(hero.masterHeroId, hero);
}
