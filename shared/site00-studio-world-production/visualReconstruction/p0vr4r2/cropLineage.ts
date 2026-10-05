/**
 * P0.VR.4R2 — In-memory crop lineage store (per asset).
 */

import type { CropCoordinateRecord, CropQaStatus } from './types.js';

const cropStore = new Map<string, CropCoordinateRecord>();

export function clearCropStoreForTest(): void {
  cropStore.clear();
}

export function getCropRecord(assetId: string): CropCoordinateRecord | null {
  return cropStore.get(assetId) ?? null;
}

export function upsertCropRecord(assetId: string, record: CropCoordinateRecord): CropCoordinateRecord {
  cropStore.set(assetId, record);
  return record;
}

export function lockApprovedCrop(assetId: string, checksum: string): CropCoordinateRecord | null {
  const existing = cropStore.get(assetId);
  if (!existing) return null;
  const updated: CropCoordinateRecord = {
    ...existing,
    cropChecksum: checksum,
    locked: true,
    approvedAt: new Date().toISOString(),
    qaStatus: 'CROP_APPROVED',
  };
  cropStore.set(assetId, updated);
  return updated;
}

export function adjustFounderCropBounds(
  assetId: string,
  founderBounds: CropCoordinateRecord['detectedBounds'],
): CropCoordinateRecord | null {
  const existing = cropStore.get(assetId);
  if (!existing || existing.locked) return existing ?? null;
  const updated: CropCoordinateRecord = {
    ...existing,
    founderAdjustedBounds: founderBounds,
    finalBounds: founderBounds,
    cropVersion: existing.cropVersion + 1,
    qaStatus: 'CROP_DRAFT' as CropQaStatus,
    cropChecksum: null,
    approvedAt: null,
  };
  cropStore.set(assetId, updated);
  return updated;
}

export function recordGenerationUsedCrop(assetId: string, generationId: string): void {
  const existing = cropStore.get(assetId);
  if (!existing) return;
  if (!existing.generationIdsUsingCrop.includes(generationId)) {
    existing.generationIdsUsingCrop.push(generationId);
  }
}

export function getDispatchCounts(assetId: string): { generations: number; cropVersion: number } {
  const record = cropStore.get(assetId);
  return {
    generations: record?.generationIdsUsingCrop.length ?? 0,
    cropVersion: record?.cropVersion ?? 0,
  };
}
