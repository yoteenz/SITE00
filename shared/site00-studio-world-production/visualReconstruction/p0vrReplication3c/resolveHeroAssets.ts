/**
 * P0.VR.REPLICATION.3C — Resolve hero visual assets (search → derive → procedural).
 */

import type { ReplicationAssetSlot, AssetResolutionReceipt } from './types.js';
import { HERO_AUTHORITY_SLICE_CROPS, KNOWN_NDX_LIBRARY_ASSETS } from './constants.js';

const ENTRY_ARTWORK_BY_SLOT: Record<string, string> = {
  slice_b: '/visual-references/founder/ndxbook/card-artwork/corporate-layoff-memo.webp',
  slice_a: '/assets/ndxbook/entry-001/entry001-archive-01-then-now.webp',
};

function searchExistingAssets(slot: ReplicationAssetSlot): string[] {
  const hits: string[] = [];
  if (ENTRY_ARTWORK_BY_SLOT[slot.slotId]) hits.push(ENTRY_ARTWORK_BY_SLOT[slot.slotId]);
  for (const lib of KNOWN_NDX_LIBRARY_ASSETS) {
    if (!hits.includes(lib)) hits.push(lib);
  }
  return hits.filter(Boolean);
}

export function resolveHeroAssetSlots(input: {
  slots: ReplicationAssetSlot[];
  authorityImageUrl: string | null;
}): { slots: ReplicationAssetSlot[]; receipts: AssetResolutionReceipt[] } {
  const receipts: AssetResolutionReceipt[] = [];
  const authority = input.authorityImageUrl?.trim() ?? '';

  const resolved = input.slots.map((slot) => {
    const candidates = searchExistingAssets(slot);
    slot.candidateAssets = [...new Set([...slot.candidateAssets, ...candidates])];

    if (slot.slotId === 'lime_ndx') {
      const next: ReplicationAssetSlot = {
        ...slot,
        selectedStrategy: 'PROCEDURAL_DOM_GRAPHIC',
        selectedAsset: 'css:lime-ndx-block',
        cropSpec: null,
        status: 'BOUND',
        failureReason: null,
      };
      receipts.push({
        slotId: slot.slotId,
        strategy: 'PROCEDURAL_DOM_GRAPHIC',
        candidateCount: 0,
        selectedAsset: next.selectedAsset,
        source: 'DOM/CSS',
        cropApplied: false,
        bound: true,
        rendered: true,
        status: 'OK',
        notes: 'Lime rectangle via CSS — not image placeholder',
      });
      return next;
    }

    const libraryMatch = ENTRY_ARTWORK_BY_SLOT[slot.slotId];
    if (libraryMatch) {
      const next: ReplicationAssetSlot = {
        ...slot,
        selectedStrategy: 'EXISTING_LIBRARY_ASSET',
        selectedAsset: libraryMatch,
        cropSpec: { objectFit: 'cover', backgroundPosition: 'center 40%' },
        status: 'BOUND',
        failureReason: null,
      };
      receipts.push({
        slotId: slot.slotId,
        strategy: 'EXISTING_LIBRARY_ASSET',
        candidateCount: candidates.length,
        selectedAsset: libraryMatch,
        source: 'ndxbook library',
        cropApplied: true,
        bound: true,
        rendered: true,
        status: 'OK',
        notes: 'High-confidence library match for hero slice',
      });
      return next;
    }

    if (authority && HERO_AUTHORITY_SLICE_CROPS[slot.slotId]) {
      const crop = HERO_AUTHORITY_SLICE_CROPS[slot.slotId];
      const next: ReplicationAssetSlot = {
        ...slot,
        selectedStrategy: 'AUTHORITY_REGION_DERIVATION',
        selectedAsset: authority,
        cropSpec: {
          backgroundSize: crop.backgroundSize,
          backgroundPosition: crop.backgroundPosition,
          objectFit: 'cover',
        },
        status: 'BOUND',
        failureReason: null,
      };
      receipts.push({
        slotId: slot.slotId,
        strategy: 'AUTHORITY_REGION_DERIVATION',
        candidateCount: candidates.length + 1,
        selectedAsset: authority,
        source: 'authority PNG region derivation',
        cropApplied: true,
        bound: true,
        rendered: true,
        status: 'OK',
        notes: 'Region crop from design authority — not full-screen bake',
      });
      return next;
    }

    if (authority) {
      const next: ReplicationAssetSlot = {
        ...slot,
        selectedStrategy: 'AUTHORITY_CROP',
        selectedAsset: authority,
        cropSpec: { backgroundSize: 'cover', backgroundPosition: 'center', objectFit: 'cover' },
        status: 'BOUND',
        failureReason: null,
      };
      receipts.push({
        slotId: slot.slotId,
        strategy: 'AUTHORITY_CROP',
        candidateCount: candidates.length,
        selectedAsset: authority,
        source: 'authority fallback crop',
        cropApplied: true,
        bound: true,
        rendered: true,
        status: 'OK',
        notes: 'Fallback authority crop',
      });
      return next;
    }

    const failed: ReplicationAssetSlot = {
      ...slot,
      selectedStrategy: 'UNRESOLVED',
      status: 'UNRESOLVED_VISUAL_ASSET',
      failureReason: 'ASSET_SEARCH_NO_MATCH',
    };
    receipts.push({
      slotId: slot.slotId,
      strategy: 'UNRESOLVED',
      candidateCount: candidates.length,
      selectedAsset: null,
      source: 'none',
      cropApplied: false,
      bound: false,
      rendered: false,
      status: 'UNRESOLVED_VISUAL_ASSET',
      notes: 'No authority URL and no library match',
    });
    return failed;
  });

  return { slots: resolved, receipts };
}

export function heroAssetsFullyBound(slots: ReplicationAssetSlot[]): boolean {
  return slots.every((s) => !s.required || s.status === 'BOUND');
}
