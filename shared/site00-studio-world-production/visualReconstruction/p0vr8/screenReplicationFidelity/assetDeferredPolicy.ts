/**
 * P0.VR.8-SRF — Asset-deferred policy (structural convergence continues).
 */

import { ASSET_DEFERRED_STATES } from './constants.js';
import type { AssetDeferredPolicy, AssetDeferredState, ScreenAuthorityRegion } from './types.js';

export const DEFAULT_ASSET_DEFERRED_POLICY: AssetDeferredPolicy = {
  policyId: 'asset-deferred-v1',
  allowedStates: [...ASSET_DEFERRED_STATES],
  continueStructuralConvergenceWhenAssetPending: true,
  preserveExactGeometry: true,
  forbidBrokenImageUi: true,
  forbidRandomSubstitute: true,
  placeholderMustBeNeutral: true,
};

export function resolveAssetState(input: {
  hasCanonicalAsset: boolean;
  hasApprovedAsset: boolean;
  reconstructionReady: boolean;
}): AssetDeferredState {
  if (input.hasCanonicalAsset) return 'CANONICAL_ASSET';
  if (input.hasApprovedAsset) return 'EXISTING_APPROVED_ASSET';
  if (input.reconstructionReady) return 'TEMPORARY_PLACEHOLDER';
  return 'ASSET_PENDING';
}

export function assetPendingBlocksStructuralConvergence(_region: ScreenAuthorityRegion): boolean {
  return false;
}

export function structuralConvergenceAllowedWithDeferredAssets(
  policy: AssetDeferredPolicy,
  pendingCount: number,
): boolean {
  if (!policy.continueStructuralConvergenceWhenAssetPending) return pendingCount === 0;
  return true;
}

export function onlyAssetDeferredRegionsMaskable(
  region: ScreenAuthorityRegion,
  policy: AssetDeferredPolicy,
): boolean {
  return region.assetState === 'ASSET_PENDING' && policy.placeholderMustBeNeutral;
}
