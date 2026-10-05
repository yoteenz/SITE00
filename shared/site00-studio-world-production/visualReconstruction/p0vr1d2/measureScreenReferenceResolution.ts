/**
 * P0.VR.1D.2 — Measure screen reference resolution from actual crop pixels (not defaulted).
 */

import sharp from 'sharp';
import type { MeasuredScreenReferenceResolution } from './types.js';

export async function measureScreenReferenceResolutionFromCrop(
  cropBuffer: Buffer,
): Promise<MeasuredScreenReferenceResolution> {
  const meta = await sharp(cropBuffer).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const minDim = Math.min(width, height);

  const grey = await sharp(cropBuffer).greyscale().raw().toBuffer();
  let laplacian = 0;
  let edges = 0;
  const w = width;
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const c = grey[y * w + x] ?? 0;
      const r = grey[y * w + x + 1] ?? 0;
      const b = grey[(y + 1) * w + x] ?? 0;
      const grad = Math.abs(c - r) + Math.abs(c - b);
      laplacian += grad;
      if (grad > 18) edges += 1;
    }
  }
  const samples = Math.ceil(((height - 2) / 2) * ((width - 2) / 2));
  const sharpnessScore = laplacian / Math.max(samples, 1);
  const edgeDensityScore = edges / Math.max(samples, 1);

  const geometryLegibility = minDim >= 120 && edgeDensityScore > 0.04;
  const typographyLegibility = minDim >= 200 && sharpnessScore > 8 && edgeDensityScore > 0.06;
  const artworkLegibility = minDim >= 180 && sharpnessScore > 6;

  let status: MeasuredScreenReferenceResolution['status'] = 'INSUFFICIENT';
  let confidence = 0.42;
  if (typographyLegibility && geometryLegibility && minDim >= 280) {
    status = 'SUFFICIENT';
    confidence = Math.min(0.98, 0.7 + sharpnessScore / 40);
  } else if (geometryLegibility && minDim >= 160) {
    status = 'PARTIALLY_SUFFICIENT';
    confidence = 0.65 + edgeDensityScore;
  }

  return {
    status,
    confidence,
    effectiveCropWidth: width,
    effectiveCropHeight: height,
    sharpnessScore,
    edgeDensityScore,
    typographyLegibility,
    geometryLegibility,
    artworkLegibility,
    defaultedToSufficient: false,
  };
}

export function screenReferenceResolutionDefaultedToSufficient(): false {
  return false;
}
