/**
 * P0.PAF.2 — In-memory + contract binding store (mirrors fs_* tables).
 */

import { FS_VISUAL_ASSET_CONTRACT_VERSION } from '../../../frontal-slayer-product-assets/contract/version.js';
import { buildDeterministicVariantKey } from '../../../frontal-slayer-product-assets/contract/variantKey.js';
import type {
  FrontalSlayerAssetBinding,
  FrontalSlayerBuildAWigVisualVariant,
  FrontalSlayerMasterHero,
  FrontalSlayerVisualAsset,
  FsBindingState,
  FsBindingSurface,
} from '../../../frontal-slayer-product-assets/contract/types.js';

const masterHeroes = new Map<string, FrontalSlayerMasterHero>();
const visualAssets = new Map<string, FrontalSlayerVisualAsset>();
const bindings = new Map<string, FrontalSlayerAssetBinding>();
const bawVariants = new Map<string, FrontalSlayerBuildAWigVisualVariant>();

export function upsertMasterHeroRecord(hero: FrontalSlayerMasterHero): FrontalSlayerMasterHero {
  masterHeroes.set(hero.id, hero);
  return hero;
}

export function upsertVisualAssetRecord(asset: FrontalSlayerVisualAsset): FrontalSlayerVisualAsset {
  if (asset.contractVersion !== FS_VISUAL_ASSET_CONTRACT_VERSION) {
    throw new Error('FAIL_CROSS_REPO_CONTRACT_MISMATCH');
  }
  visualAssets.set(asset.id, asset);
  return asset;
}

export function getVisualAssetRecord(assetId: string): FrontalSlayerVisualAsset | null {
  return visualAssets.get(assetId) ?? null;
}

export function getMasterHeroRecord(productId: string, activeOnly = true): FrontalSlayerMasterHero | null {
  for (const hero of masterHeroes.values()) {
    if (hero.productId === productId && (!activeOnly || hero.canonStatus === 'CANON' || hero.status === 'ACTIVE_CANONICAL')) {
      return hero;
    }
  }
  return null;
}

export function getMasterHeroById(id: string): FrontalSlayerMasterHero | null {
  return masterHeroes.get(id) ?? null;
}

export function listVisualAssets(filters?: {
  productId?: string;
  status?: string;
  canonStatus?: string;
}): FrontalSlayerVisualAsset[] {
  return [...visualAssets.values()].filter((a) => {
    if (filters?.productId && a.productId !== filters.productId) return false;
    if (filters?.status && a.status !== filters.status) return false;
    if (filters?.canonStatus && a.canonStatus !== filters.canonStatus) return false;
    return true;
  });
}

export function createBinding(input: {
  surface: FsBindingSurface;
  productId: string;
  slotId: string;
  variantKey: string;
  assetId: string;
  bindingState: FsBindingState;
  priority?: number;
}): FrontalSlayerAssetBinding {
  const asset = visualAssets.get(input.assetId);
  if (!asset) throw new Error('FAIL_PRODUCT_ASSET_NOT_PERSISTED');

  if (input.bindingState === 'ACTIVE' && asset.canonStatus !== 'CANON' && asset.status !== 'APPROVED') {
    throw new Error('FAIL_UNAPPROVED_ASSET_BOUND_LIVE');
  }

  const existingActive = [...bindings.values()].filter(
    (b) =>
      b.surface === input.surface &&
      b.productId === input.productId &&
      b.slotId === input.slotId &&
      b.variantKey === input.variantKey &&
      b.isActive &&
      b.bindingState === 'ACTIVE',
  );

  if (input.bindingState === 'ACTIVE' && existingActive.length > 0) {
    for (const old of existingActive) {
      bindings.set(old.id, {
        ...old,
        isActive: false,
        bindingState: 'SUPERSEDED',
        updatedAt: new Date().toISOString(),
        supersededById: `pending-${input.assetId}`,
      });
    }
  }

  const binding: FrontalSlayerAssetBinding = {
    id: `bind-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    surface: input.surface,
    productId: input.productId,
    slotId: input.slotId,
    variantKey: input.variantKey,
    assetId: input.assetId,
    bindingState: input.bindingState,
    isActive: input.bindingState === 'ACTIVE' || input.bindingState === 'PREVIEW',
    priority: input.priority ?? 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    supersededById: null,
  };
  bindings.set(binding.id, binding);

  if (input.surface === 'BUILD_A_WIG') {
    const config = parseVariantKeyToConfig(input.variantKey);
    bawVariants.set(input.variantKey, {
      id: `baw-var-${input.variantKey}`,
      masterHeroId: asset.masterHeroId,
      variantKey: input.variantKey,
      configurationJson: config,
      assetId: input.assetId,
      status: input.bindingState === 'ACTIVE' ? 'ACTIVE' : 'PREVIEW',
      isActive: binding.isActive,
      createdAt: binding.createdAt,
      updatedAt: binding.updatedAt,
    });
  }

  return binding;
}

export function unbindBinding(bindingId: string): FrontalSlayerAssetBinding | null {
  const binding = bindings.get(bindingId);
  if (!binding) return null;
  const updated = { ...binding, isActive: false, bindingState: 'SUPERSEDED' as FsBindingState, updatedAt: new Date().toISOString() };
  bindings.set(bindingId, updated);
  return updated;
}

export function getActiveBinding(
  surface: FsBindingSurface,
  productId: string,
  slotId: string,
  variantKey: string,
  previewAllowed = false,
): FrontalSlayerAssetBinding | null {
  const matches = [...bindings.values()].filter(
    (b) =>
      b.surface === surface &&
      b.productId === productId &&
      b.slotId === slotId &&
      b.variantKey === variantKey &&
      b.isActive &&
      (b.bindingState === 'ACTIVE' || (previewAllowed && b.bindingState === 'PREVIEW')),
  );
  if (matches.length > 1 && matches.filter((m) => m.bindingState === 'ACTIVE').length > 1) {
    throw new Error('FAIL_ACTIVE_BINDING_AMBIGUOUS');
  }
  const active = matches.find((m) => m.bindingState === 'ACTIVE') ?? (previewAllowed ? matches[0] : null);
  return active ?? null;
}

export function listBindings(filters?: { productId?: string; surface?: FsBindingSurface; activeOnly?: boolean }): FrontalSlayerAssetBinding[] {
  return [...bindings.values()].filter((b) => {
    if (filters?.productId && b.productId !== filters.productId) return false;
    if (filters?.surface && b.surface !== filters.surface) return false;
    if (filters?.activeOnly && !b.isActive) return false;
    return true;
  });
}

export function getBuildAWigVariantRecord(variantKey: string): FrontalSlayerBuildAWigVisualVariant | null {
  return bawVariants.get(variantKey) ?? null;
}

export function listBuildAWigVariants(masterHeroId?: string): FrontalSlayerBuildAWigVisualVariant[] {
  return [...bawVariants.values()].filter((v) => !masterHeroId || v.masterHeroId === masterHeroId);
}

function parseVariantKeyToConfig(variantKey: string): Record<string, string> {
  const config: Record<string, string> = {};
  for (const part of variantKey.split('|')) {
    const [k, v] = part.split('=');
    if (k && v) config[k] = v;
  }
  return config;
}

export function configToVariantKey(axes: Record<string, string>): string {
  return buildDeterministicVariantKey(axes);
}

export function clearBindingStoreForTest(): void {
  masterHeroes.clear();
  visualAssets.clear();
  bindings.clear();
  bawVariants.clear();
}

export function seedBindingStoreForTest(input: {
  hero?: FrontalSlayerMasterHero;
  asset?: FrontalSlayerVisualAsset;
  binding?: FrontalSlayerAssetBinding;
}): void {
  if (input.hero) masterHeroes.set(input.hero.id, input.hero);
  if (input.asset) visualAssets.set(input.asset.id, input.asset);
  if (input.binding) bindings.set(input.binding.id, input.binding);
}
