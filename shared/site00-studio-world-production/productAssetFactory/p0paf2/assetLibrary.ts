/**
 * P0.PAF.2 — Asset library hierarchical browsing for founder.
 */

import type { FsBindingSurface } from '../../../frontal-slayer-product-assets/contract/types.js';
import { listBindings, listVisualAssets, getMasterHeroById, getMasterHeroRecord } from './bindingStore.js';
import { getWhereUsed } from './bindingService.js';
import { FS_NAMESPACE_SEGMENTS } from './storageNamespace.js';

export type AssetLibraryGroup = 'MASTERS' | 'PRODUCT_PAGES' | 'BUILD_A_WIG' | 'SHARED' | 'ARCHIVED';

export type AssetLibraryEntry = {
  assetId: string;
  productId: string;
  label: string;
  group: AssetLibraryGroup;
  colorId: string | null;
  styleId: string | null;
  status: string;
  canonStatus: string;
  storagePath: string;
  folderPath: string;
  bindingStatus: 'ACTIVE' | 'PREVIEW' | 'UNBOUND';
  whereUsed: string[];
};

export type AssetLibraryFilters = {
  productId?: string;
  surface?: FsBindingSurface;
  colorId?: string;
  styleId?: string;
  length?: string;
  status?: string;
  canonStatus?: string;
  batchId?: string;
};

export function buildAssetLibraryTree(filters?: AssetLibraryFilters): Record<AssetLibraryGroup, AssetLibraryEntry[]> {
  const assets = listVisualAssets();
  const tree: Record<AssetLibraryGroup, AssetLibraryEntry[]> = {
    MASTERS: [],
    PRODUCT_PAGES: [],
    BUILD_A_WIG: [],
    SHARED: [],
    ARCHIVED: [],
  };

  for (const hero of [getMasterHeroRecord(filters?.productId ?? 'noir', false)].filter(Boolean)) {
    if (!hero) continue;
    if (filters?.productId && hero.productId !== filters.productId) continue;
    tree.MASTERS.push({
      assetId: hero.id,
      productId: hero.productId,
      label: `${hero.productId.toUpperCase()} Master`,
      group: 'MASTERS',
      colorId: null,
      styleId: null,
      status: hero.status,
      canonStatus: hero.canonStatus,
      storagePath: hero.storagePath,
      folderPath: hero.storagePath.split('/').slice(0, -1).join('/'),
      bindingStatus: 'UNBOUND',
      whereUsed: [],
    });
  }

  for (const asset of assets) {
    if (filters?.productId && asset.productId !== filters.productId) continue;
    if (filters?.colorId && asset.colorId !== filters.colorId) continue;
    if (filters?.styleId && asset.styleId !== filters.styleId) continue;
    if (filters?.length && asset.length !== filters.length) continue;
    if (filters?.status && asset.status !== filters.status) continue;
    if (filters?.canonStatus && asset.canonStatus !== filters.canonStatus) continue;
    if (filters?.batchId && asset.batchId !== filters.batchId) continue;

    const whereUsed = getWhereUsed(asset.id).map((b) => `${b.surface}:${b.slotId}`);
    const activeBinding = getWhereUsed(asset.id).find((b) => b.bindingState === 'ACTIVE');
    const previewBinding = getWhereUsed(asset.id).find((b) => b.bindingState === 'PREVIEW');

    const entry: AssetLibraryEntry = {
      assetId: asset.id,
      productId: asset.productId,
      label: formatLabel(asset),
      group: classifyGroup(asset),
      colorId: asset.colorId,
      styleId: asset.styleId,
      status: asset.status,
      canonStatus: asset.canonStatus,
      storagePath: asset.storagePath,
      folderPath: asset.storagePath.split('/').slice(0, -1).join('/'),
      bindingStatus: activeBinding ? 'ACTIVE' : previewBinding ? 'PREVIEW' : 'UNBOUND',
      whereUsed,
    };

    if (asset.status === 'ARCHIVED') tree.ARCHIVED.push(entry);
    else tree[entry.group].push(entry);
  }

  return tree;
}

function classifyGroup(asset: { styleId: string | null; surface: FsBindingSurface | null; storagePath: string }): AssetLibraryGroup {
  if (asset.storagePath.includes('/shared/')) return 'SHARED';
  if (asset.styleId || asset.surface === 'BUILD_A_WIG') return 'BUILD_A_WIG';
  return 'PRODUCT_PAGES';
}

function formatLabel(asset: {
  productId: string;
  colorId: string | null;
  styleId: string | null;
  length: string | null;
}): string {
  const parts = [asset.productId.toUpperCase()];
  if (asset.colorId) parts.push(asset.colorId);
  if (asset.styleId) parts.push(asset.styleId);
  if (asset.length) parts.push(`${asset.length}"`);
  return parts.join(' · ');
}

export function getAssetDetail(assetId: string) {
  const assets = listVisualAssets();
  const asset = assets.find((a) => a.id === assetId);
  if (!asset) {
    const hero = getMasterHeroById(assetId);
    if (hero) {
      return {
        type: 'master' as const,
        hero,
        bindings: listBindings({ productId: hero.productId }),
        lineage: { masterHeroId: hero.id },
        integration: { storage: true, binding: false, website: false },
      };
    }
    return null;
  }
  return {
    type: 'variant' as const,
    asset,
    bindings: getWhereUsed(assetId),
    lineage: { masterHeroId: asset.masterHeroId, batchId: asset.batchId, parentAssetId: asset.parentAssetId },
    integration: {
      storage: asset.storagePath.startsWith(FS_NAMESPACE_SEGMENTS.masters.split('/')[0] ?? 'frontal-slayer'),
      binding: getWhereUsed(assetId).some((b) => b.bindingState === 'ACTIVE'),
      website: getWhereUsed(assetId).some((b) => b.bindingState === 'ACTIVE') && !asset.publicUrl.includes('fal.'),
    },
    supabasePath: asset.storagePath,
  };
}

export function archiveAsset(assetId: string): boolean {
  const assets = listVisualAssets();
  const asset = assets.find((a) => a.id === assetId);
  if (!asset) return false;
  asset.status = 'ARCHIVED';
  return true;
}
