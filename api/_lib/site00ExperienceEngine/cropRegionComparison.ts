/**
 * Crop-based region pixel comparison — real per-region pixelmatch (not global heuristic).
 */

import pixelmatch from 'pixelmatch';
import sharp from 'sharp';
import type { RegionPixelScore } from '../../../shared/site00-experience-engine/types.js';

export type CropBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CropRegionDefinition = {
  regionId: string;
  label: string;
  bounds: CropBounds;
  highAuthority?: boolean;
};

export type CropRegionComparisonInput = {
  referenceBuffer: Buffer;
  renderBuffer: Buffer;
  viewportWidth: number;
  viewportHeight: number;
  regions: readonly CropRegionDefinition[];
  threshold?: number;
  outputDir?: string;
};

export type CropRegionComparisonResult = {
  fullViewportPixelScore: number;
  regionScores: RegionPixelScore[];
  heatmapBuffer: Buffer;
  mismatchPixels: number;
  totalPixels: number;
};

function clampBounds(bounds: CropBounds, width: number, height: number): CropBounds {
  const x = Math.max(0, Math.min(bounds.x, width - 1));
  const y = Math.max(0, Math.min(bounds.y, height - 1));
  const w = Math.max(1, Math.min(bounds.width, width - x));
  const h = Math.max(1, Math.min(bounds.height, height - y));
  return { x, y, width: w, height: h };
}

async function cropToRaw(buffer: Buffer, bounds: CropBounds, width: number, height: number) {
  const crop = clampBounds(bounds, width, height);
  return sharp(buffer)
    .extract({ left: crop.x, top: crop.y, width: crop.width, height: crop.height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
}

export async function compareCropRegions(
  input: CropRegionComparisonInput,
): Promise<CropRegionComparisonResult> {
  const threshold = input.threshold ?? 0.12;
  const refNorm = await sharp(input.referenceBuffer)
    .resize(input.viewportWidth, input.viewportHeight, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const renderNorm = await sharp(input.renderBuffer)
    .resize(input.viewportWidth, input.viewportHeight, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = refNorm.info;
  const refData = refNorm.data;
  const renderData = renderNorm.data;
  const diff = Buffer.alloc(width * height * 4);
  const mismatchPixels = pixelmatch(refData, renderData, diff, width, height, { threshold });
  const fullViewportPixelScore = 1 - mismatchPixels / (width * height);

  const regionScores: RegionPixelScore[] = [];
  for (const region of input.regions) {
    const crop = clampBounds(region.bounds, width, height);
    const refCrop = await cropToRaw(input.referenceBuffer, crop, width, height);
    const renderCrop = await cropToRaw(input.renderBuffer, crop, width, height);
    const rw = refCrop.info.width;
    const rh = refCrop.info.height;
    const regionDiff = Buffer.alloc(rw * rh * 4);
    const regionMismatch = pixelmatch(refCrop.data, renderCrop.data, regionDiff, rw, rh, { threshold });
    const pixelScore = 1 - regionMismatch / (rw * rh);
    const passThreshold = region.highAuthority ? 0.94 : 0.88;
    regionScores.push({
      regionId: region.regionId,
      label: region.label,
      pixelScore,
      passed: pixelScore >= passThreshold,
      cropBounds: crop,
    });
  }

  return {
    fullViewportPixelScore,
    regionScores,
    heatmapBuffer: diff,
    mismatchPixels,
    totalPixels: width * height,
  };
}

export function scoreToFidelityStatus(
  score: number,
  threshold = 0.94,
): 'PIXEL_PASS' | 'FOUNDER_REVIEW' {
  return score >= threshold ? 'PIXEL_PASS' : 'FOUNDER_REVIEW';
}
