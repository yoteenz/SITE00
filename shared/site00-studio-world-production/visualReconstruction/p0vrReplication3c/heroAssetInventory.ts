/**
 * P0.VR.REPLICATION.3C — Hero asset slot inventory from literal spec.
 */

import type { LiteralRegionSpec } from '../p0vrReplication3b/types.js';
import type { ReplicationAssetSlot } from './types.js';

export function buildHeroAssetInventory(input: {
  heroSpec: LiteralRegionSpec;
  authorityImageUrl: string | null;
}): ReplicationAssetSlot[] {
  const authority = input.authorityImageUrl ?? '';
  const slots: ReplicationAssetSlot[] = [];

  for (const img of input.heroSpec.imageSlots) {
    slots.push({
      slotId: img.slotId,
      regionId: 'hero-editorial',
      authorityBounds: img.authorityCrop ?? 'hero-center',
      assetType: 'photography',
      visualRole: img.slotId,
      required: true,
      authorityEvidence: 'Authority hero grayscale photography segment',
      candidateAssets: [],
      selectedStrategy: 'UNRESOLVED',
      selectedAsset: null,
      cropSpec: null,
      fitMode: 'cover',
      positionSpec: null,
      status: 'PENDING',
      failureReason: null,
    });
  }

  for (const g of input.heroSpec.graphicSlots) {
    slots.push({
      slotId: g.slotId,
      regionId: 'hero-editorial',
      authorityBounds: g.authorityCrop ?? 'hero-graphic',
      assetType: g.slotId === 'lime_ndx' ? 'graphic' : 'decorative-crop',
      visualRole: g.slotId,
      required: true,
      authorityEvidence: g.slotId === 'lime_ndx' ? 'NDX lime accent block' : 'Right-side visual panel',
      candidateAssets: [],
      selectedStrategy: 'UNRESOLVED',
      selectedAsset: null,
      cropSpec: null,
      fitMode: 'cover',
      positionSpec: null,
      status: 'PENDING',
      failureReason: null,
    });
  }

  if (authority) {
    for (const slot of slots) {
      slot.candidateAssets.push(authority);
    }
  }

  return slots;
}
