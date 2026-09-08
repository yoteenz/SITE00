/**
 * P0.VR.4 — Live UI binding model.
 */

import { assertCanonicalLiveSource } from './supabaseStorage.js';
import type { DesignAssetBinding, DesignReconstructionAsset } from './types.js';
import { addLiveBinding } from './designAssetRegistry.js';

export function createDesignAssetBinding(input: {
  asset: DesignReconstructionAsset;
  componentPath: string;
  componentName: string;
  assetSlot: string;
  canonicalUrl: string;
}): DesignAssetBinding {
  assertCanonicalLiveSource(input.canonicalUrl);

  return {
    bindingId: `bind-${input.asset.assetId}-${Date.now()}`,
    assetId: input.asset.assetId,
    projectId: input.asset.projectId,
    route: input.asset.route,
    componentPath: input.componentPath,
    componentName: input.componentName,
    assetSlot: input.assetSlot,
    previousAsset: input.asset.binding?.currentAsset ?? null,
    currentAsset: input.canonicalUrl,
    bindingStatus: 'PENDING',
    boundAt: null,
    verifiedAt: null,
  };
}

export function canBindAsset(asset: DesignReconstructionAsset): boolean {
  return (
    asset.founderJudgment === 'LOVE_IT' &&
    ['APPROVED', 'PERSISTED', 'BOUND'].includes(asset.status)
  );
}

export function unapprovedAssetCannotAutoBind(asset: DesignReconstructionAsset): boolean {
  return asset.founderJudgment !== 'LOVE_IT' || !['APPROVED', 'PERSISTED', 'BOUND'].includes(asset.status);
}

export function applyBindingToAsset(
  asset: DesignReconstructionAsset,
  binding: DesignAssetBinding,
): DesignReconstructionAsset {
  if (unapprovedAssetCannotAutoBind(asset)) {
    throw new Error('Unapproved asset cannot bind to live page');
  }

  const bound: DesignAssetBinding = {
    ...binding,
    bindingStatus: 'BOUND',
    boundAt: new Date().toISOString(),
  };

  addLiveBinding(asset.assetId, bound);

  return {
    ...asset,
    binding: bound,
    status: 'BOUND',
    updatedAt: new Date().toISOString(),
  };
}

export function verifyLiveBinding(asset: DesignReconstructionAsset): DesignReconstructionAsset {
  if (!asset.binding) return asset;
  return {
    ...asset,
    binding: {
      ...asset.binding,
      bindingStatus: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
    },
    status: 'VERIFIED',
    updatedAt: new Date().toISOString(),
  };
}
