/**
 * Strip full-page authority URLs from hero media slots unless materialized to a region crop.
 */

import type { ReplicationAssetSlot } from '../p0vrReplication3c/types.js';
import { HERO_MATERIALIZATION_PROOF_SLOT_ID } from '../p0vrReplication3cR1/constants.js';
import { checkAssetBindingCompatibility } from './assetBindingCompatibility.js';

export function enforceHeroSlotBindings(slots: ReplicationAssetSlot[]): {
  slots: ReplicationAssetSlot[];
  strippedSlotIds: string[];
} {
  const strippedSlotIds: string[] = [];
  const next = slots.map((slot) => {
    const check = checkAssetBindingCompatibility(slot);
    if (check.compatible) return slot;
    if (slot.slotId === HERO_MATERIALIZATION_PROOF_SLOT_ID) return slot;

    strippedSlotIds.push(slot.slotId);
    return {
      ...slot,
      selectedAsset: null,
      selectedStrategy: 'UNRESOLVED' as const,
      status: 'UNRESOLVED_VISUAL_ASSET' as const,
      bindingStage: 'RESOLVED' as const,
      failureReason: check.failureCode ?? 'PAGE_AUTHORITY_MISUSED_AS_REGION_ASSET',
      cropSpec: null,
    };
  });
  return { slots: next, strippedSlotIds };
}
