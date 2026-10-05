/**
 * P0.VR.4R2 — Reference crop QA orchestrator.
 */

import type { CropCoordinateRecord, CropQaStatus, ReferenceCropQaResult } from './types.js';
import { referenceCropGeometryGuard, isPointLikeBounds } from './referenceCropGeometryGuard.js';
import { evaluateObjectCoverageQA } from './objectCoverageQA.js';

export function evaluateReferenceCropQA(input: {
  coordinate: CropCoordinateRecord;
  assetType: string;
  cropPreviewValid?: boolean;
}): ReferenceCropQaResult {
  const objectBounds = input.coordinate.founderAdjustedBounds ?? input.coordinate.detectedBounds;
  const geometry = referenceCropGeometryGuard({
    bounds: input.coordinate.finalBounds,
    sourceWidth: input.coordinate.sourceWidth,
    sourceHeight: input.coordinate.sourceHeight,
    assetType: input.assetType,
    isPointLike: isPointLikeBounds(objectBounds),
  });

  const coverage = evaluateObjectCoverageQA({
    objectBounds,
    cropBounds: input.coordinate.finalBounds,
  });

  const previewValid = input.cropPreviewValid !== false;
  const failures = [...geometry.failures, ...coverage.failures];
  if (!previewValid) failures.push('CROP_PREVIEW_PROVIDER_INPUT_MISMATCH');

  const pass = geometry.pass && coverage.pass && previewValid;
  let status: CropQaStatus = 'CROP_DRAFT';
  if (pass) status = 'CROP_READY';
  else if (failures.length) status = 'CROP_QA_FAILED';

  if (input.coordinate.locked && input.coordinate.approvedAt) {
    status = 'CROP_APPROVED';
  }

  return {
    status,
    pass,
    failures: [...new Set(failures)],
    geometryPass: geometry.pass,
    coveragePass: coverage.pass,
    previewValid,
  };
}

export function cropQaAllowsGeneration(qa: ReferenceCropQaResult, cropLocked: boolean): boolean {
  if (cropLocked && qa.status === 'CROP_APPROVED') return true;
  return qa.pass && qa.status === 'CROP_READY';
}
