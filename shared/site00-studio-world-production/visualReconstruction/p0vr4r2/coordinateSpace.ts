/**
 * P0.VR.4R2 — Canonical SOURCE_IMAGE_PIXELS coordinate space.
 */

import type { CropCoordinateRecord, NormalizedBounds, SourcePixelBounds } from './types.js';

export type DisplaySelection = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CoordinateSpaceInput = {
  sourceWidth: number;
  sourceHeight: number;
  displayWidth: number;
  displayHeight: number;
  devicePixelRatio?: number;
  scrollX?: number;
  scrollY?: number;
  selectionDisplay: DisplaySelection;
};

export function computeScaleFactors(sourceWidth: number, sourceHeight: number, displayWidth: number, displayHeight: number): {
  scaleX: number;
  scaleY: number;
} {
  if (displayWidth <= 0 || displayHeight <= 0) {
    return { scaleX: 1, scaleY: 1 };
  }
  return {
    scaleX: sourceWidth / displayWidth,
    scaleY: sourceHeight / displayHeight,
  };
}

/** Convert UI display-space selection to source-image pixels. */
export function displaySelectionToSourcePixels(input: CoordinateSpaceInput): SourcePixelBounds {
  const dpr = input.devicePixelRatio ?? 1;
  const scrollX = input.scrollX ?? 0;
  const scrollY = input.scrollY ?? 0;
  const { scaleX, scaleY } = computeScaleFactors(
    input.sourceWidth,
    input.sourceHeight,
    input.displayWidth,
    input.displayHeight,
  );

  const x = Math.round((input.selectionDisplay.x + scrollX) * scaleX * dpr) / dpr;
  const y = Math.round((input.selectionDisplay.y + scrollY) * scaleY * dpr) / dpr;
  const width = Math.round(input.selectionDisplay.width * scaleX);
  const height = Math.round(input.selectionDisplay.height * scaleY);

  return clampBoundsToSource({ x, y, width, height }, input.sourceWidth, input.sourceHeight);
}

export function sourcePixelsToNormalized(bounds: SourcePixelBounds, sourceWidth: number, sourceHeight: number): NormalizedBounds {
  return {
    normalizedX: bounds.x / sourceWidth,
    normalizedY: bounds.y / sourceHeight,
    normalizedWidth: bounds.width / sourceWidth,
    normalizedHeight: bounds.height / sourceHeight,
  };
}

export function normalizedToSourcePixels(normalized: NormalizedBounds, sourceWidth: number, sourceHeight: number): SourcePixelBounds {
  return clampBoundsToSource(
    {
      x: Math.round(normalized.normalizedX * sourceWidth),
      y: Math.round(normalized.normalizedY * sourceHeight),
      width: Math.round(normalized.normalizedWidth * sourceWidth),
      height: Math.round(normalized.normalizedHeight * sourceHeight),
    },
    sourceWidth,
    sourceHeight,
  );
}

export function clampBoundsToSource(bounds: SourcePixelBounds, sourceWidth: number, sourceHeight: number): SourcePixelBounds {
  const x = Math.max(0, Math.min(bounds.x, sourceWidth - 1));
  const y = Math.max(0, Math.min(bounds.y, sourceHeight - 1));
  const maxW = sourceWidth - x;
  const maxH = sourceHeight - y;
  return {
    x,
    y,
    width: Math.max(1, Math.min(bounds.width, maxW)),
    height: Math.max(1, Math.min(bounds.height, maxH)),
  };
}

export function buildCoordinateRecord(input: {
  sourceWidth: number;
  sourceHeight: number;
  displayWidth: number;
  displayHeight: number;
  devicePixelRatio?: number;
  scrollX?: number;
  scrollY?: number;
  detectedBounds: SourcePixelBounds;
  founderAdjustedBounds?: SourcePixelBounds | null;
  paddingPercent: number;
  sourceScreenshotId: string;
  cropId: string;
  cropVersion: number;
}): Omit<CropCoordinateRecord, 'qaStatus' | 'qaFailures' | 'cropChecksum' | 'approvedAt' | 'locked' | 'generationIdsUsingCrop'> {
  const { scaleX, scaleY } = computeScaleFactors(
    input.sourceWidth,
    input.sourceHeight,
    input.displayWidth,
    input.displayHeight,
  );
  const objectBounds = input.founderAdjustedBounds ?? input.detectedBounds;
  const finalBounds = applyPaddingToBounds(objectBounds, input.paddingPercent, input.sourceWidth, input.sourceHeight);

  const displayW = input.displayWidth || input.sourceWidth;
  const displayH = input.displayHeight || input.sourceHeight;

  return {
    sourceWidth: input.sourceWidth,
    sourceHeight: input.sourceHeight,
    displayWidth: displayW,
    displayHeight: displayH,
    scaleX,
    scaleY,
    devicePixelRatio: input.devicePixelRatio ?? 1,
    scrollX: input.scrollX ?? 0,
    scrollY: input.scrollY ?? 0,
    selectionDisplayX: finalBounds.x / scaleX,
    selectionDisplayY: finalBounds.y / scaleY,
    selectionDisplayWidth: finalBounds.width / scaleX,
    selectionDisplayHeight: finalBounds.height / scaleY,
    detectedBounds: input.detectedBounds,
    founderAdjustedBounds: input.founderAdjustedBounds ?? null,
    finalBounds,
    normalizedBounds: sourcePixelsToNormalized(finalBounds, input.sourceWidth, input.sourceHeight),
    paddingPercent: input.paddingPercent,
    cropId: input.cropId,
    cropVersion: input.cropVersion,
    sourceScreenshotId: input.sourceScreenshotId,
  };
}

export function applyPaddingToBounds(
  objectBounds: SourcePixelBounds,
  paddingPercent: number,
  sourceWidth: number,
  sourceHeight: number,
): SourcePixelBounds {
  const padX = Math.round(objectBounds.width * paddingPercent);
  const padY = Math.round(objectBounds.height * paddingPercent);
  return clampBoundsToSource(
    {
      x: objectBounds.x - padX,
      y: objectBounds.y - padY,
      width: objectBounds.width + padX * 2,
      height: objectBounds.height + padY * 2,
    },
    sourceWidth,
    sourceHeight,
  );
}
