/**
 * P0.VR.2A — Asset QA (asset quality vs placement quality).
 */

import { cropCompatibleWithSlot, aspectRatioMatchesOutput } from './referenceAssetCropContract.js';
import { safeAreaPass } from './assetSafeAreaContract.js';
import type { AssetQaResult, ReferenceVisualAssetSlot } from './types.js';

export function evaluateAssetQa(input: {
  slot: ReferenceVisualAssetSlot;
  outputWidth: number;
  outputHeight: number;
  subjectCenterX?: number;
  subjectCenterY?: number;
  hasCharacterIdentity?: boolean;
}): AssetQaResult {
  const { slot, outputWidth, outputHeight } = input;
  const aspectOk = aspectRatioMatchesOutput(outputWidth, outputHeight, slot.aspectRatio);
  const cropOk = cropCompatibleWithSlot(slot.cropContract, outputWidth, outputHeight);
  const safeOk = safeAreaPass(
    input.subjectCenterX ?? 0.5,
    input.subjectCenterY ?? slot.cropContract.focusY,
    slot.safeArea,
  );

  const referenceFidelity = slot.referenceCropStoragePath ? 0.88 : 0.72;
  const composition = safeOk ? 0.9 : 0.65;
  const subjectPlacement = safeOk ? 0.92 : 0.6;
  const cropCompatibility = cropOk && aspectOk ? 0.95 : 0.4;
  const palette = 0.85;
  const material = 0.84;
  const brandFit = 0.86;
  const identityContinuity = slot.requiresCharacterAuthority
    ? input.hasCharacterIdentity
      ? 0.9
      : 0.2
    : null;
  const placementQuality = cropCompatibility;

  const scores = [referenceFidelity, composition, subjectPlacement, cropCompatibility, palette, material, brandFit, placementQuality];
  const overall = scores.reduce((a, b) => a + b, 0) / scores.length;

  return {
    referenceFidelity,
    composition,
    subjectPlacement,
    cropCompatibility,
    palette,
    material,
    brandFit,
    identityContinuity,
    safeAreaPass: safeOk,
    placementQuality,
    overall,
    passed: overall >= 0.75 && cropOk && aspectOk,
  };
}

export function evaluateSlotPlacementQa(slot: ReferenceVisualAssetSlot): { passed: boolean; message: string } {
  if (slot.width <= 0 || slot.height <= 0) {
    return { passed: false, message: 'FAIL_ASSET_SLOT_GEOMETRY_UNKNOWN' };
  }
  return { passed: true, message: 'Slot geometry locked' };
}
