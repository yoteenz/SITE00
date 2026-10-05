/**
 * P0.VR.4R2 — Zero-waste generation preflight guard.
 */

import type { CropCoordinateRecord, DesignGenerationPreflightResult } from './types.js';
import { evaluateReferenceCropQA, cropQaAllowsGeneration } from './referenceCropQA.js';
import { isPointLikeBounds } from './referenceCropGeometryGuard.js';

export function runDesignGenerationPreflight(input: {
  coordinate: CropCoordinateRecord | null;
  assetType: string;
  cropPreviewUrl: string | null;
  cropPreviewValid: boolean;
  providerAvailable: boolean;
  explicitFounderAction: boolean;
  cropApproved: boolean;
}): DesignGenerationPreflightResult {
  const checks = {
    referenceExists: Boolean(input.coordinate && input.cropPreviewUrl),
    cropQaPass: false,
    cropDimensionsValid: false,
    objectCoveragePass: false,
    referencePreviewValid: input.cropPreviewValid,
    referenceChecksumPresent: Boolean(input.coordinate?.cropChecksum),
    providerAvailable: input.providerAvailable,
    spendAuthorized: input.explicitFounderAction,
    cropApproved: input.cropApproved || Boolean(input.coordinate?.locked),
  };

  if (!input.coordinate) {
    return {
      pass: false,
      blocked: true,
      blocker: 'GENERATION_BLOCKED_BY_CROP_QA: no crop coordinate record',
      failureClass: 'GENERATION_BLOCKED_BY_CROP_QA',
      checks,
    };
  }

  const qa = evaluateReferenceCropQA({
    coordinate: input.coordinate,
    assetType: input.assetType,
    cropPreviewValid: input.cropPreviewValid,
  });

  checks.cropQaPass = qa.pass;
  checks.cropDimensionsValid = !isPointLikeBounds(input.coordinate.finalBounds);
  checks.objectCoveragePass = qa.coveragePass;

  const cropAllows = cropQaAllowsGeneration(qa, input.coordinate.locked) || input.cropApproved;

  if (!cropAllows) {
    return {
      pass: false,
      blocked: true,
      blocker: `GENERATION_BLOCKED_BY_CROP_QA: ${qa.failures.join(', ') || qa.status}`,
      failureClass: qa.failures[0] ?? 'CROP_NOT_APPROVED',
      checks,
    };
  }

  if (!checks.referenceChecksumPresent) {
    return {
      pass: false,
      blocked: true,
      blocker: 'GENERATION_BLOCKED_BY_CROP_QA: referenceCropChecksum missing',
      failureClass: 'CROP_PREVIEW_PROVIDER_INPUT_MISMATCH',
      checks,
    };
  }

  if (!checks.providerAvailable) {
    return {
      pass: false,
      blocked: true,
      blocker: 'LIVE_FAL_PROVIDER_BLOCKED',
      failureClass: 'GENERATION_BLOCKED_BY_CROP_QA',
      checks,
    };
  }

  if (!checks.spendAuthorized) {
    return {
      pass: false,
      blocked: true,
      blocker: 'Explicit GENERATE action required',
      failureClass: 'GENERATION_BLOCKED_BY_CROP_QA',
      checks,
    };
  }

  const pass = Object.values(checks).every(Boolean);
  return {
    pass,
    blocked: !pass,
    blocker: pass ? null : 'GENERATION_BLOCKED_BY_CROP_QA',
    failureClass: pass ? null : 'GENERATION_BLOCKED_BY_CROP_QA',
    checks,
  };
}
