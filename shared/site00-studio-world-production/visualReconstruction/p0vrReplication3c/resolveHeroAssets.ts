/**
 * P0.VR.REPLICATION.3C — Resolve hero visual assets (search → derive → procedural).
 * P0.VR.REPLICATION.3C-R1 — Do not bind missing library paths; proof slot awaits materialization.
 */

import type { ReplicationAssetSlot, AssetResolutionReceipt } from './types.js';
import { HERO_AUTHORITY_SLICE_CROPS } from './constants.js';
import { HERO_MATERIALIZATION_PROOF_SLOT_ID } from '../p0vrReplication3cR1/constants.js';

function searchExistingAssets(slot: ReplicationAssetSlot): string[] {
  return [...slot.candidateAssets];
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
        bindingStage: 'VISIBLE',
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
        visible: true,
        bindingStage: 'VISIBLE',
        status: 'OK',
        notes: 'Lime rectangle via CSS — not image placeholder',
      });
      return next;
    }

    if (slot.slotId === HERO_MATERIALIZATION_PROOF_SLOT_ID) {
      if (
        slot.materializedPublicUrl &&
        slot.materializationTrace?.visible &&
        slot.bindingStage === 'PERSISTED'
      ) {
        return slot;
      }
      if (!authority) {
        const failed: ReplicationAssetSlot = {
          ...slot,
          selectedStrategy: 'UNRESOLVED',
          status: 'UNRESOLVED_VISUAL_ASSET',
          failureReason: 'ASSET_SEARCH_NO_MATCH',
        };
        receipts.push({
          slotId: slot.slotId,
          strategy: 'UNRESOLVED',
          candidateCount: 0,
          selectedAsset: null,
          source: 'none',
          cropApplied: false,
          bound: false,
          rendered: false,
          visible: false,
          status: 'UNRESOLVED_VISUAL_ASSET',
          notes: 'Proof slot requires design authority URL for crop materialization',
        });
        return failed;
      }
      const next: ReplicationAssetSlot = {
        ...slot,
        selectedStrategy: 'AUTHORITY_REGION_DERIVATION',
        selectedAsset: authority,
        cropSpec: HERO_AUTHORITY_SLICE_CROPS.slice_b
          ? {
              backgroundSize: HERO_AUTHORITY_SLICE_CROPS.slice_b.backgroundSize,
              backgroundPosition: HERO_AUTHORITY_SLICE_CROPS.slice_b.backgroundPosition,
              objectFit: 'cover',
            }
          : { objectFit: 'cover' },
        status: 'PENDING',
        bindingStage: 'RESOLVED',
        failureReason: null,
      };
      receipts.push({
        slotId: slot.slotId,
        strategy: 'AUTHORITY_REGION_DERIVATION',
        candidateCount: 1,
        selectedAsset: authority,
        source: 'authority pending materialization',
        cropApplied: true,
        bound: false,
        rendered: false,
        visible: false,
        bindingStage: 'RESOLVED',
        status: 'OK',
        notes: 'Awaiting persisted authority crop (3C-R1) — not marked visible until decode',
      });
      return next;
    }

    if (authority && HERO_AUTHORITY_SLICE_CROPS[slot.slotId]) {
      const next: ReplicationAssetSlot = {
        ...slot,
        selectedStrategy: 'UNRESOLVED',
        selectedAsset: null,
        cropSpec: null,
        status: 'UNRESOLVED_VISUAL_ASSET',
        bindingStage: 'RESOLVED',
        failureReason: 'PAGE_AUTHORITY_MISUSED_AS_REGION_ASSET',
      };
      receipts.push({
        slotId: slot.slotId,
        strategy: 'UNRESOLVED',
        candidateCount: candidates.length,
        selectedAsset: null,
        source: 'blocked — requires materialized region crop (3D boundary)',
        cropApplied: false,
        bound: false,
        rendered: false,
        visible: false,
        bindingStage: 'RESOLVED',
        status: 'UNRESOLVED_VISUAL_ASSET',
        notes: 'Non-proof hero slots cannot bind full-page authority as CSS background',
      });
      return next;
    }

    if (authority) {
      const next: ReplicationAssetSlot = {
        ...slot,
        selectedStrategy: 'UNRESOLVED',
        selectedAsset: null,
        cropSpec: null,
        status: 'UNRESOLVED_VISUAL_ASSET',
        bindingStage: 'RESOLVED',
        failureReason: 'PAGE_AUTHORITY_MISUSED_AS_REGION_ASSET',
      };
      receipts.push({
        slotId: slot.slotId,
        strategy: 'UNRESOLVED',
        candidateCount: candidates.length,
        selectedAsset: null,
        source: 'blocked — no raw authority fallback',
        cropApplied: false,
        bound: false,
        rendered: false,
        visible: false,
        bindingStage: 'RESOLVED',
        status: 'UNRESOLVED_VISUAL_ASSET',
        notes: 'Authority fallback crop disabled (nested page prevention)',
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
      visible: false,
      status: 'UNRESOLVED_VISUAL_ASSET',
      notes: 'No authority URL',
    });
    return failed;
  });

  return { slots: resolved, receipts };
}

export function heroAssetsFullyBound(slots: ReplicationAssetSlot[]): boolean {
  return slots.every((s) => !s.required || s.status === 'BOUND' || s.status === 'PENDING');
}

export function heroProofSlotVisible(slots: ReplicationAssetSlot[]): boolean {
  const proof = slots.find((s) => s.slotId === HERO_MATERIALIZATION_PROOF_SLOT_ID);
  return Boolean(proof?.materializationTrace?.visible && proof.materializedPublicUrl);
}
