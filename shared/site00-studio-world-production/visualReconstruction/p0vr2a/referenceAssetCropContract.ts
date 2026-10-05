/**
 * P0.VR.2A — Reference asset crop contract.
 */

import type { ObjectFitMode, ReferenceAssetCropContract, ReferenceBounds } from './types.js';

export function createCropContractFromBounds(
  bounds: ReferenceBounds,
  objectFit: ObjectFitMode = 'cover',
  objectPosition = 'center 42%',
): ReferenceAssetCropContract {
  return {
    aspectRatio: bounds.aspectRatio,
    objectFit,
    objectPosition,
    focusX: 0.5,
    focusY: 0.42,
    allowCropTop: objectFit === 'cover',
    allowCropBottom: objectFit === 'cover',
    allowCropLeft: objectFit === 'cover',
    allowCropRight: objectFit === 'cover',
  };
}

export function formatCropContractForPrompt(crop: ReferenceAssetCropContract, bounds: ReferenceBounds): string {
  const fit = crop.objectFit.toUpperCase();
  return [
    `This asset will appear inside a ${bounds.width}×${bounds.height} ${bounds.aspectRatio >= 1 ? 'landscape' : 'portrait'} slot at ${bounds.aspectRatio}:1 ratio.`,
    `Object fit: ${fit}. Object position: ${crop.objectPosition}.`,
    `Do not place critical detail within outer ${Math.round(8)}% because the coded page uses ${fit} cropping.`,
    `Focus point: ${Math.round(crop.focusX * 100)}% horizontal, ${Math.round(crop.focusY * 100)}% vertical.`,
  ].join(' ');
}

export function aspectRatioMatchesOutput(
  outputWidth: number,
  outputHeight: number,
  expectedRatio: number,
  tolerance = 0.02,
): boolean {
  const actual = outputWidth / Math.max(outputHeight, 1);
  return Math.abs(actual - expectedRatio) <= tolerance;
}

export function cropCompatibleWithSlot(
  crop: ReferenceAssetCropContract,
  outputWidth: number,
  outputHeight: number,
): boolean {
  return aspectRatioMatchesOutput(outputWidth, outputHeight, crop.aspectRatio);
}
