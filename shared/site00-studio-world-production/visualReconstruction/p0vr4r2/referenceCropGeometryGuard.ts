/**
 * P0.VR.4R2 — Asset-type-aware minimum crop geometry guard.
 */

import type { CropFailureClass, SourcePixelBounds } from './types.js';

export type GeometryGuardInput = {
  bounds: SourcePixelBounds;
  sourceWidth: number;
  sourceHeight: number;
  assetType: string;
  isPointLike?: boolean;
};

export type GeometryGuardResult = {
  pass: boolean;
  failures: CropFailureClass[];
};

const HERO_OBJECT_MIN = {
  minWidth: 280,
  minHeight: 250,
  minAreaRatio: 0.08,
  maxAreaRatio: 0.65,
};

const DEFAULT_MIN = {
  minWidth: 48,
  minHeight: 48,
  minAreaRatio: 0.005,
  maxAreaRatio: 0.85,
};

export function isPointLikeBounds(bounds: SourcePixelBounds): boolean {
  return bounds.width < 48 || bounds.height < 48 || (bounds.width <= 64 && bounds.height <= 64);
}

export function referenceCropGeometryGuard(input: GeometryGuardInput): GeometryGuardResult {
  const failures: CropFailureClass[] = [];
  const limits = input.assetType === 'HERO_OBJECT' ? HERO_OBJECT_MIN : DEFAULT_MIN;
  const sourceArea = input.sourceWidth * input.sourceHeight;
  const cropArea = input.bounds.width * input.bounds.height;
  const areaRatio = cropArea / sourceArea;

  if (input.isPointLike || isPointLikeBounds(input.bounds)) {
    failures.push('CROP_FEATURE_POINT_USED_AS_OBJECT');
    failures.push('CROP_TOO_SMALL');
  }

  if (input.bounds.width < limits.minWidth || input.bounds.height < limits.minHeight) {
    failures.push('CROP_TOO_SMALL');
  }

  if (areaRatio < limits.minAreaRatio) {
    failures.push('CROP_TOO_SMALL');
  }

  if (areaRatio > limits.maxAreaRatio) {
    failures.push('CROP_TOO_LARGE');
  }

  if (input.bounds.x + input.bounds.width > input.sourceWidth || input.bounds.y + input.bounds.height > input.sourceHeight) {
    failures.push('CROP_SOURCE_DIMENSION_MISMATCH');
  }

  return { pass: failures.length === 0, failures: [...new Set(failures)] };
}
