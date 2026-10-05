import type { ReplicationAssetSlot } from '../p0vrReplication3c/types.js';
import { HERO_MATERIALIZATION_PROOF_SLOT_ID } from '../p0vrReplication3cR1/constants.js';
import { classifyVisualSource, isPageAuthorityClass } from './sourceClassification.js';
import type { AssetBindingCompatibilityResult } from './types.js';

export function checkAssetBindingCompatibility(slot: ReplicationAssetSlot): AssetBindingCompatibilityResult {
  const ref = slot.materializedPublicUrl ?? slot.selectedAsset;
  const receipt = classifyVisualSource(ref);
  const pageAuthority = isPageAuthorityClass(receipt.classification) && receipt.isFullPageScreenshot;

  if (!pageAuthority) {
    return { slotId: slot.slotId, compatible: true, failureCode: null, message: 'OK' };
  }

  const materializedCrop = Boolean(slot.materializedPublicUrl && slot.materializedPublicUrl.startsWith('data:image/'));
  if (slot.slotId === HERO_MATERIALIZATION_PROOF_SLOT_ID && materializedCrop) {
    return {
      slotId: slot.slotId,
      compatible: true,
      failureCode: null,
      message: 'Proof slot uses materialized region crop',
    };
  }

  if (slot.selectedStrategy === 'AUTHORITY_REGION_DERIVATION' && ref === slot.selectedAsset && !slot.materializedPublicUrl) {
    return {
      slotId: slot.slotId,
      compatible: false,
      failureCode: 'PAGE_AUTHORITY_MISUSED_AS_REGION_ASSET',
      message: 'Full-page authority bound as CSS background inside hero slot (nested page risk)',
    };
  }

  if (slot.selectedStrategy === 'AUTHORITY_CROP' && !slot.materializedPublicUrl) {
    return {
      slotId: slot.slotId,
      compatible: false,
      failureCode: 'PAGE_AUTHORITY_MISUSED_AS_REGION_ASSET',
      message: 'Authority fallback crop without materialized region asset',
    };
  }

  return { slotId: slot.slotId, compatible: true, failureCode: null, message: 'OK' };
}

export function checkAllHeroBindings(slots: ReplicationAssetSlot[]): AssetBindingCompatibilityResult[] {
  return slots.map(checkAssetBindingCompatibility);
}
