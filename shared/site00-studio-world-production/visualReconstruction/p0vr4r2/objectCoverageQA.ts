/**
 * P0.VR.4R2 — Object coverage QA — ensure full object silhouette in crop.
 */

import type { CropFailureClass, SourcePixelBounds } from './types.js';

export type ObjectCoverageInput = {
  objectBounds: SourcePixelBounds;
  cropBounds: SourcePixelBounds;
  edgeTolerancePx?: number;
};

export type ObjectCoverageResult = {
  pass: boolean;
  failures: CropFailureClass[];
  leftExtent: number;
  rightExtent: number;
  topExtent: number;
  bottomExtent: number;
  objectClipped: boolean;
};

export function evaluateObjectCoverageQA(input: ObjectCoverageInput): ObjectCoverageResult {
  const tol = input.edgeTolerancePx ?? 4;
  const obj = input.objectBounds;
  const crop = input.cropBounds;

  const leftGap = obj.x - crop.x;
  const topGap = obj.y - crop.y;
  const rightGap = crop.x + crop.width - (obj.x + obj.width);
  const bottomGap = crop.y + crop.height - (obj.y + obj.height);

  const objectClipped =
    leftGap < -tol || topGap < -tol || rightGap < -tol || bottomGap < -tol;

  const failures: CropFailureClass[] = [];
  if (objectClipped) {
    failures.push('CROP_OBJECT_CLIPPED');
  }

  if (leftGap < tol || topGap < tol || rightGap < tol || bottomGap < tol) {
    failures.push('CROP_OBJECT_CLIPPED');
  }

  return {
    pass: failures.length === 0,
    failures: [...new Set(failures)],
    leftExtent: leftGap,
    rightExtent: rightGap,
    topExtent: topGap,
    bottomExtent: bottomGap,
    objectClipped,
  };
}
