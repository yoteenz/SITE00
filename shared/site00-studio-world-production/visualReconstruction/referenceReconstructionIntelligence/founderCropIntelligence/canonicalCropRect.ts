/**
 * P0.VR.6R9 — CanonicalCropRect: single authority in source image pixel space.
 */

import type { NormalizedBbox } from '../types.js';
import type { PixelBounds } from './types.js';

export type CanonicalCropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  sourceNaturalWidth: number;
  sourceNaturalHeight: number;
  normalizedX: number;
  normalizedY: number;
  normalizedWidth: number;
  normalizedHeight: number;
};

export const MIN_SOURCE_CROP_PX = 8;

export function canonicalFromNormalized(
  bbox: NormalizedBbox,
  sourceNaturalWidth: number,
  sourceNaturalHeight: number,
): CanonicalCropRect {
  const x = bbox.x * sourceNaturalWidth;
  const y = bbox.y * sourceNaturalHeight;
  const width = bbox.width * sourceNaturalWidth;
  const height = bbox.height * sourceNaturalHeight;
  return clampCanonicalCrop({
    x,
    y,
    width,
    height,
    sourceNaturalWidth,
    sourceNaturalHeight,
    normalizedX: bbox.x,
    normalizedY: bbox.y,
    normalizedWidth: bbox.width,
    normalizedHeight: bbox.height,
  });
}

export function canonicalFromPixelBounds(
  pixel: PixelBounds,
  sourceNaturalWidth: number,
  sourceNaturalHeight: number,
): CanonicalCropRect {
  return canonicalFromNormalized(
    {
      x: pixel.x / sourceNaturalWidth,
      y: pixel.y / sourceNaturalHeight,
      width: pixel.width / sourceNaturalWidth,
      height: pixel.height / sourceNaturalHeight,
    },
    sourceNaturalWidth,
    sourceNaturalHeight,
  );
}

export function normalizedFromCanonical(crop: CanonicalCropRect): NormalizedBbox {
  const nw = crop.sourceNaturalWidth;
  const nh = crop.sourceNaturalHeight;
  return {
    x: crop.x / nw,
    y: crop.y / nh,
    width: crop.width / nw,
    height: crop.height / nh,
  };
}

export function clampCanonicalCrop(crop: CanonicalCropRect): CanonicalCropRect {
  const nw = crop.sourceNaturalWidth;
  const nh = crop.sourceNaturalHeight;
  const minW = Math.min(MIN_SOURCE_CROP_PX, nw);
  const minH = Math.min(MIN_SOURCE_CROP_PX, nh);
  let { x, y, width, height } = crop;
  width = Math.min(nw, Math.max(minW, width));
  height = Math.min(nh, Math.max(minH, height));
  x = Math.max(0, Math.min(nw - width, x));
  y = Math.max(0, Math.min(nh - height, y));
  const normalizedX = x / nw;
  const normalizedY = y / nh;
  const normalizedWidth = width / nw;
  const normalizedHeight = height / nh;
  return {
    x,
    y,
    width,
    height,
    sourceNaturalWidth: nw,
    sourceNaturalHeight: nh,
    normalizedX,
    normalizedY,
    normalizedWidth,
    normalizedHeight,
  };
}

/** Integer pixel extract rect for canvas drawImage (round only at extraction). */
export function canonicalToExtractPixels(crop: CanonicalCropRect): PixelBounds {
  return {
    x: Math.floor(crop.x),
    y: Math.floor(crop.y),
    width: Math.max(1, Math.round(crop.width)),
    height: Math.max(1, Math.round(crop.height)),
  };
}

export function canonicalCropIdentity(crop: CanonicalCropRect): string {
  return `${crop.sourceNaturalWidth}x${crop.sourceNaturalHeight}`;
}

export function canonicalCropsEquivalent(a: CanonicalCropRect, b: CanonicalCropRect, tolerancePx = 1): boolean {
  if (a.sourceNaturalWidth !== b.sourceNaturalWidth || a.sourceNaturalHeight !== b.sourceNaturalHeight) return false;
  return (
    Math.abs(a.x - b.x) <= tolerancePx &&
    Math.abs(a.y - b.y) <= tolerancePx &&
    Math.abs(a.width - b.width) <= tolerancePx &&
    Math.abs(a.height - b.height) <= tolerancePx
  );
}
