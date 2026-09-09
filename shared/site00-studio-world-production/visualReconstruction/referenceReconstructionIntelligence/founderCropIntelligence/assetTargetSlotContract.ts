/**
 * AssetTargetSlotContract — what each target slot expects.
 */

import type { AssetTargetSlotContract } from './types.js';

const FAMILY_THUMB_CONTRACT: Omit<AssetTargetSlotContract, 'slotId'> = {
  assetType: 'PROJECT_VISUAL',
  expectedAspectRatio: 1.1,
  expectedBackgroundPolicy: 'REMOVE_BACKGROUND',
  expectedObjectCount: 1,
  allowText: false,
  allowDeviceChrome: false,
  allowUIChrome: false,
  minimumResolution: { width: 64, height: 64 },
  preferredPaddingPercent: 10,
  transparencyPolicy: 'TRANSPARENT_WHEN_APPLICABLE',
  treatmentPlan: 'RECONSTRUCT_FROM_CROP',
  expectedContentSummary: 'SINGLE PRIMARY FAMILY VISUAL · NO DEVICE FRAME · NO SURROUNDING UI',
};

export function resolveAssetTargetSlotContract(slotId: string): AssetTargetSlotContract {
  if (slotId.startsWith('BRAND_FAMILY_')) {
    return { slotId, ...FAMILY_THUMB_CONTRACT };
  }
  return {
    slotId,
    assetType: 'PROJECT_VISUAL',
    expectedAspectRatio: null,
    expectedBackgroundPolicy: 'AUTO_IF_NEEDED',
    expectedObjectCount: 1,
    allowText: false,
    allowDeviceChrome: false,
    allowUIChrome: false,
    minimumResolution: { width: 48, height: 48 },
    preferredPaddingPercent: 10,
    transparencyPolicy: 'PRESERVE',
    treatmentPlan: 'RECONSTRUCT_FROM_CROP',
    expectedContentSummary: 'PRIMARY VISUAL FOR TARGET SLOT',
  };
}
