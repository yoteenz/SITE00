/**
 * Launch Seed Set semantics — founder-controlled selection with provenance.
 */

import type { CreativeAssetRecord, LaunchSeedSet } from '../../../../shared/site00-brand-lore/creativeLineage/types.js';
import { resolveProductionDestiny } from '../../../../shared/site00-brand-lore/creativeLineage/assetLifecycleDimensions.js';

function nowIso(): string {
  return new Date().toISOString();
}

export type LaunchSeedReconcileResult = {
  launchSeedSet: LaunchSeedSet | null;
  assetsUpdated: number;
  reviewRequiredCount: number;
  autoRemovedCount: number;
  preservedAmbiguous: number;
};

export function createEmptyLaunchSeedSet(params: {
  brandSlug: string;
  orgId: string;
  winningDirectionId?: string | null;
  notes?: string;
}): LaunchSeedSet {
  const ts = nowIso();
  return {
    launchSeedSetId: `launch-seed-${Date.now()}`,
    brandSlug: params.brandSlug,
    orgId: params.orgId,
    winningDirectionId: params.winningDirectionId ?? null,
    selectedAssets: [],
    selectedConcepts: [],
    selectedFranchises: [],
    launchOrder: [],
    assetProvenance: {},
    reviewRequiredAssetIds: [],
    notes: params.notes ?? 'Founder selects launch contents explicitly',
    status: 'DRAFT',
    createdAt: ts,
    updatedAt: ts,
  };
}

/** Founder explicitly selects an asset for launch — never called by LOVE IT alone. */
export function addAssetToLaunchSeedSet(
  seedSet: LaunchSeedSet,
  assetId: string,
  source: LaunchSeedSet['assetProvenance'][string]['source'] = 'FOUNDER_SELECTED',
): LaunchSeedSet {
  const ts = nowIso();
  const selectedAssets = seedSet.selectedAssets.includes(assetId)
    ? seedSet.selectedAssets
    : [...seedSet.selectedAssets, assetId];
  const assetProvenance = {
    ...seedSet.assetProvenance,
    [assetId]: { source, addedAt: ts, notes: null },
  };
  const reviewRequiredAssetIds = seedSet.reviewRequiredAssetIds.filter((id) => id !== assetId);
  return {
    ...seedSet,
    selectedAssets,
    assetProvenance,
    reviewRequiredAssetIds,
    updatedAt: ts,
  };
}

/**
 * Reconcile historical launch seed entries from PR #286 auto-LOVE_IT behavior.
 * Removes only entries with provenance AUTO_LOVE_IT_LEGACY; flags UNKNOWN as review-required.
 */
export function reconcileLaunchSeedSemantics(
  seedSet: LaunchSeedSet | null,
  assets: CreativeAssetRecord[],
): LaunchSeedReconcileResult {
  if (!seedSet) {
    return {
      launchSeedSet: null,
      assetsUpdated: 0,
      reviewRequiredCount: 0,
      autoRemovedCount: 0,
      preservedAmbiguous: 0,
    };
  }

  const ts = nowIso();
  let selectedAssets = [...seedSet.selectedAssets];
  const assetProvenance = { ...seedSet.assetProvenance };
  const reviewRequiredAssetIds = new Set(seedSet.reviewRequiredAssetIds);
  let autoRemovedCount = 0;
  let preservedAmbiguous = 0;

  for (const assetId of [...seedSet.selectedAssets]) {
    const provenance = assetProvenance[assetId];
    if (!provenance) {
      reviewRequiredAssetIds.add(assetId);
      assetProvenance[assetId] = {
        source: 'UNKNOWN',
        addedAt: ts,
        notes: 'Pre-provenance launch seed entry — founder review required',
      };
      preservedAmbiguous += 1;
      continue;
    }
    if (provenance.source === 'AUTO_LOVE_IT_LEGACY') {
      selectedAssets = selectedAssets.filter((id) => id !== assetId);
      delete assetProvenance[assetId];
      autoRemovedCount += 1;
    }
    if (provenance.source === 'UNKNOWN') {
      reviewRequiredAssetIds.add(assetId);
      preservedAmbiguous += 1;
    }
  }

  let assetsUpdated = 0;
  for (const asset of assets) {
    const destiny = resolveProductionDestiny(
      {
        ...asset,
        launchSeedReviewRequired: reviewRequiredAssetIds.has(asset.assetId),
      },
      { ...seedSet, selectedAssets, assetProvenance, reviewRequiredAssetIds: [...reviewRequiredAssetIds] },
    );
    const needsFlag =
      reviewRequiredAssetIds.has(asset.assetId) && !asset.launchSeedReviewRequired;
    const needsDestiny = asset.productionDestiny !== destiny && destiny === 'LAUNCH_SEED_REVIEW_REQUIRED';
    if (needsFlag || needsDestiny) {
      assetsUpdated += 1;
    }
  }

  const updated: LaunchSeedSet = {
    ...seedSet,
    selectedAssets,
    assetProvenance,
    reviewRequiredAssetIds: [...reviewRequiredAssetIds],
    updatedAt: ts,
  };

  return {
    launchSeedSet: updated,
    assetsUpdated,
    reviewRequiredCount: reviewRequiredAssetIds.size,
    autoRemovedCount,
    preservedAmbiguous,
  };
}

export function applyLaunchSeedReviewFlagsToAssets(
  assets: CreativeAssetRecord[],
  seedSet: LaunchSeedSet | null,
): CreativeAssetRecord[] {
  if (!seedSet) return assets;
  return assets.map((asset) => {
    const inReview = seedSet.reviewRequiredAssetIds.includes(asset.assetId);
    const inLaunch = seedSet.selectedAssets.includes(asset.assetId);
    let productionDestiny = asset.productionDestiny ?? 'UNDECIDED';
    if (inReview) productionDestiny = 'LAUNCH_SEED_REVIEW_REQUIRED';
    else if (inLaunch) productionDestiny = 'LAUNCH_SELECTED';
    return {
      ...asset,
      launchSeedReviewRequired: inReview,
      productionDestiny,
    };
  });
}
