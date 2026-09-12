/**
 * P0.VR.REPLICATION.1 — Per-slot asset replication classification.
 */

import type { AssetReplicationDecision } from './types.js';

export function classifyAssetSlot(input: {
  slotId: string;
  hasApprovedAsset: boolean;
  hasPartialAsset: boolean;
}): AssetReplicationDecision {
  if (input.hasApprovedAsset) return 'REUSE_EXISTING';
  if (input.hasPartialAsset) return 'CROP_EXISTING';
  if (input.slotId.includes('hero') || input.slotId.includes('media')) return 'FOUNDER_REQUIRED';
  return 'RECONSTRUCT';
}
