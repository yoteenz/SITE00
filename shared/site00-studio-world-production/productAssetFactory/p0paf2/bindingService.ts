/**
 * P0.PAF.2 — Binding service: approve → promote ACTIVE, rebind, batch bind, resolver test.
 */

import type { FrontalSlayerAssetBinding } from '../../../frontal-slayer-product-assets/contract/types.js';
import { buildDeterministicVariantKey } from '../../../frontal-slayer-product-assets/contract/variantKey.js';
import type { FsBindingSurface } from '../../../frontal-slayer-product-assets/contract/types.js';
import {
  createBinding,
  getActiveBinding,
  getVisualAssetRecord,
  listBindings,
  listVisualAssets,
  unbindBinding,
} from './bindingStore.js';
import { runResolverTest } from './resolverTest.js';

export type BindAsInput = {
  assetId: string;
  surface: FsBindingSurface;
  productId: string;
  slotId: string;
  variantKey: string;
  preview?: boolean;
};

export function bindAssetAs(input: BindAsInput) {
  if (!input.preview) {
    const test = runResolverTest({
      surface: input.surface,
      productId: input.productId,
      slotId: input.slotId,
      variantKey: input.variantKey,
      expectedAssetId: input.assetId,
    });
    if (!test.passed) throw new Error(test.failureCode ?? 'FAIL_VARIANT_KEY_RESOLUTION');
  }
  return createBinding({
    surface: input.surface,
    productId: input.productId,
    slotId: input.slotId,
    variantKey: input.variantKey,
    assetId: input.assetId,
    bindingState: input.preview ? 'PREVIEW' : 'ACTIVE',
  });
}

export function promotePreviewToActive(bindingId: string) {
  const binding = listBindings().find((b) => b.id === bindingId);
  if (!binding || binding.bindingState !== 'PREVIEW') return null;
  return createBinding({
    surface: binding.surface,
    productId: binding.productId,
    slotId: binding.slotId,
    variantKey: binding.variantKey,
    assetId: binding.assetId,
    bindingState: 'ACTIVE',
  });
}

export function unbindAsset(bindingId: string) {
  return unbindBinding(bindingId);
}

export function rebindAsset(input: BindAsInput & { supersedeBindingId?: string }) {
  if (input.supersedeBindingId) unbindBinding(input.supersedeBindingId);
  return bindAssetAs({ ...input, preview: false });
}

export type BatchBindPreview = {
  willActivate: number;
  skippedFailedQa: number;
  missing: number;
  items: { assetId: string; variantKey: string; surface: FsBindingSurface }[];
};

export function previewBatchBindApprovedVariants(input: {
  productId: string;
  surface: FsBindingSurface;
  slotId: string;
  batchId?: string;
}): BatchBindPreview {
  const assets = listVisualAssets({
    productId: input.productId,
    status: 'APPROVED',
    canonStatus: 'CANON',
  }).filter((a) => !input.batchId || a.batchId === input.batchId);

  const items: BatchBindPreview['items'] = [];
  let skippedFailedQa = 0;
  let missing = 0;

  for (const asset of assets) {
    if (asset.qaStatus === 'FAIL') {
      skippedFailedQa += 1;
      continue;
    }
    if (!asset.variantKey) {
      missing += 1;
      continue;
    }
    items.push({ assetId: asset.id, variantKey: asset.variantKey, surface: input.surface });
  }

  return { willActivate: items.length, skippedFailedQa, missing, items };
}

export function batchBindApprovedVariants(input: {
  productId: string;
  surface: FsBindingSurface;
  slotId: string;
  batchId?: string;
  founderConfirmed: boolean;
}): FrontalSlayerAssetBinding[] {
  if (!input.founderConfirmed) return [];
  const preview = previewBatchBindApprovedVariants(input);
  const results = [];
  for (const item of preview.items) {
    results.push(
      bindAssetAs({
        assetId: item.assetId,
        surface: item.surface,
        productId: input.productId,
        slotId: input.slotId,
        variantKey: item.variantKey,
      }),
    );
  }
  return results;
}

export function getLiveBindingPanel(productId: string) {
  const surfaces: FsBindingSurface[] = ['BUILD_A_WIG', 'PRODUCT_PAGE', 'MOBILE_APP', 'SHOWROOM'];
  return surfaces.map((surface) => {
    const active = listBindings({ productId, surface, activeOnly: true }).filter((b) => b.bindingState === 'ACTIVE');
    return {
      surface,
      bound: active.length > 0,
      bindings: active.map((b) => {
        const asset = getVisualAssetRecord(b.assetId);
        return {
          bindingId: b.id,
          variantKey: b.variantKey,
          assetId: b.assetId,
          label: asset ? formatBindingLabel(asset) : b.variantKey,
          storagePath: asset?.storagePath ?? null,
          websiteResolvable: Boolean(asset?.publicUrl && !asset.publicUrl.includes('fal.media')),
        };
      }),
    };
  });
}

function formatBindingLabel(asset: { colorId?: string | null; styleId?: string | null; length?: string | null; part?: string | null; productId: string; role: string }): string {
  const parts = [asset.productId.toUpperCase()];
  if (asset.colorId) parts.push(asset.colorId);
  if (asset.styleId) parts.push(asset.styleId);
  if (asset.length) parts.push(`${asset.length}"`);
  if (asset.part) parts.push(asset.part);
  if (asset.role) parts.push(asset.role);
  return parts.join(' / ');
}

export function buildVariantKeyFromAxes(axes: Record<string, string>): string {
  return buildDeterministicVariantKey(axes);
}

export function getWhereUsed(assetId: string): FrontalSlayerAssetBinding[] {
  return listBindings().filter((b) => b.assetId === assetId && b.isActive);
}

export function canDeleteAsset(assetId: string): { allowed: boolean; reason?: string; affectedBindings: string[] } {
  const affected = getWhereUsed(assetId).filter((b) => b.bindingState === 'ACTIVE');
  if (affected.length > 0) {
    return { allowed: false, reason: 'FAIL_ACTIVE_ASSET_DELETED', affectedBindings: affected.map((b) => b.id) };
  }
  return { allowed: true, affectedBindings: [] };
}

export function uniqueActiveBindingEnforced(
  surface: FsBindingSurface,
  productId: string,
  slotId: string,
  variantKey: string,
): boolean {
  const active = listBindings({ productId, surface, activeOnly: true }).filter(
    (b) => b.slotId === slotId && b.variantKey === variantKey && b.bindingState === 'ACTIVE',
  );
  return active.length <= 1;
}

export { getActiveBinding };
