/**
 * P0.VR.4 — Bulk page asset queue (no auto-dispatch).
 */

import type { BulkQueueItem, DesignReconstructionAsset } from './types.js';

export function buildBulkPageQueue(assets: DesignReconstructionAsset[]): BulkQueueItem[] {
  return assets
    .filter((a) => a.status !== 'REJECTED')
    .map((asset, index) => ({
      queueIndex: index + 1,
      assetId: asset.assetId,
      semanticName: asset.semanticName,
      assetType: asset.assetType,
      status: asset.status,
      ready: ['DETECTED', 'SELECTED', 'CROPPED', 'CLASSIFIED', 'READY_TO_GENERATE'].includes(asset.status),
    }));
}

export function filterQueueReady(items: BulkQueueItem[]): BulkQueueItem[] {
  return items.filter((i) => i.ready);
}

export function getNextQueueItem(items: BulkQueueItem[]): BulkQueueItem | null {
  return filterQueueReady(items)[0] ?? null;
}

export function bulkQueueDoesNotAutoDispatch(): boolean {
  return true;
}

export function formatQueueLabel(item: BulkQueueItem): string {
  const num = String(item.queueIndex).padStart(2, '0');
  return `${num} ${item.semanticName}`;
}

export function groupAssetsByStatus(assets: DesignReconstructionAsset[]): Record<string, DesignReconstructionAsset[]> {
  const groups: Record<string, DesignReconstructionAsset[]> = {
    DETECTED: [],
    READY_TO_RECONSTRUCT: [],
    IN_REVIEW: [],
    APPROVED: [],
    LIVE: [],
  };

  for (const asset of assets) {
    if (['DETECTED', 'SELECTED'].includes(asset.status)) {
      groups.DETECTED.push(asset);
    } else if (['CROPPED', 'CLASSIFIED', 'READY_TO_GENERATE'].includes(asset.status)) {
      groups.READY_TO_RECONSTRUCT.push(asset);
    } else if (
      ['GENERATING', 'GENERATED', 'TRANSPARENCY_REVIEW', 'BACKGROUND_REMOVAL', 'QA_REQUIRED', 'REVISION_REQUIRED', 'AWAITING_FOUNDER_APPROVAL'].includes(
        asset.status,
      )
    ) {
      groups.IN_REVIEW.push(asset);
    } else if (['APPROVED', 'PERSISTING', 'PERSISTED'].includes(asset.status)) {
      groups.APPROVED.push(asset);
    } else if (['BOUND', 'LIVE_QA_REQUIRED', 'VERIFIED'].includes(asset.status)) {
      groups.LIVE.push(asset);
    }
  }

  return groups;
}

export type AssetListSection = keyof ReturnType<typeof groupAssetsByStatus>;
