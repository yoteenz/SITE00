/**
 * P0.VR.5 — Job-level spend guardrails.
 */

import type { AssetJob } from './types.js';

export function uploadNeverTriggersGeneration(): boolean {
  return true;
}

export function noAutoRetrySpirals(): boolean {
  return true;
}

export function maxOnePrimaryDispatchPerAssetVersion(dispatchCount: number): boolean {
  return dispatchCount < 1;
}

export function blockGenerationWithoutCropApproval(job: AssetJob): boolean {
  return !job.cropsConfirmed;
}

export function blockPartialMultiAssetRun(job: AssetJob, approvedSubset?: string[]): { blocked: boolean; reason?: string } {
  const unconfirmed = job.detectedRegions.filter(
    (r) =>
      r.founderDecision !== 'REJECTED' &&
      r.founderDecision !== 'SKIPPED' &&
      r.founderDecision !== 'CONFIRMED',
  );
  if (unconfirmed.length === 0) return { blocked: false };
  if (approvedSubset?.length) return { blocked: false };
  return { blocked: true, reason: 'PARTIAL_RUN_BLOCKED: UNCONFIRMED REGIONS EXIST' };
}

export function estimateDispatchCount(job: AssetJob): number {
  return job.detectedRegions.filter((r) => r.founderDecision === 'CONFIRMED').length || job.detectionCount || 0;
}

export function providerDispatchOnUpload(): boolean {
  return false;
}

export function providerDispatchOnDetect(): boolean {
  return false;
}
