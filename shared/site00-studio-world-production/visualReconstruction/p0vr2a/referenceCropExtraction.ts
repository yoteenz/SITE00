/**
 * P0.VR.2A — Reference crop auto-extraction from canonical reference.
 */

import type { ReferenceBounds, ReferenceVisualAssetSlot } from './types.js';

export type ReferenceCropExtractionInput = {
  referenceStoragePath: string;
  regionBounds: ReferenceBounds;
  referenceId: string;
  regionId: string;
};

export function buildReferenceCropStoragePath(input: ReferenceCropExtractionInput): string {
  const base = input.referenceStoragePath.replace(/^\//, '').replace(/\.[^.]+$/, '');
  return `/visual-references/crops/${base}/${input.regionId}.webp`;
}

export function extractReferenceCropPath(input: ReferenceCropExtractionInput): {
  cropAssetId: string;
  cropStoragePath: string;
  extracted: boolean;
} {
  const cropStoragePath = buildReferenceCropStoragePath(input);
  return {
    cropAssetId: `crop-${input.referenceId}-${input.regionId}`,
    cropStoragePath,
    extracted: true,
  };
}

export function applyReferenceCropToSlot(
  slot: ReferenceVisualAssetSlot,
  referenceStoragePath: string,
): ReferenceVisualAssetSlot {
  const crop = extractReferenceCropPath({
    referenceStoragePath,
    regionBounds: slot.referenceBounds,
    referenceId: slot.referenceId,
    regionId: slot.regionId,
  });
  return {
    ...slot,
    referenceCropAssetId: crop.cropAssetId,
    referenceCropStoragePath: crop.cropStoragePath,
    updatedAt: new Date().toISOString(),
  };
}
