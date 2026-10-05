/**
 * P0.VR.5 — Crop confirmation workflow (no generation before approval).
 */

import { isLowConfidenceRegion, mergeCandidateRegions, splitCandidateRegion } from './assetCandidateDetection.js';
import { updateJobCandidates, markJobStatus } from './jobStore.js';
import type { AssetJob, BoundingBox, CandidateClassification, DetectedAssetCandidate, FounderCropDecision } from './types.js';

export type CropConfirmationAction =
  | { type: 'CONFIRM'; candidateId: string }
  | { type: 'REJECT'; candidateId: string }
  | { type: 'SKIP'; candidateId: string }
  | { type: 'RE_CROP'; candidateId: string; bounds: BoundingBox }
  | { type: 'SPLIT'; candidateId: string }
  | { type: 'MERGE'; candidateIds: string[] }
  | { type: 'REORDER'; candidateIds: string[] }
  | { type: 'RECLASSIFY'; candidateId: string; classification: CandidateClassification }
  | { type: 'CONFIRM_ALL' }
  | { type: 'MANUAL_ADD'; bounds: BoundingBox; classification: CandidateClassification };

export type CropConfirmationResult = {
  ok: boolean;
  job: AssetJob | null;
  blocker?: string;
  confirmedCount: number;
  pendingCount: number;
  lowConfidenceBlock: boolean;
};

function applyAction(regions: DetectedAssetCandidate[], action: CropConfirmationAction): DetectedAssetCandidate[] {
  switch (action.type) {
    case 'CONFIRM':
      return regions.map((r) =>
        r.candidateId === action.candidateId ? { ...r, founderDecision: 'CONFIRMED' as FounderCropDecision } : r,
      );
    case 'REJECT':
      return regions.map((r) =>
        r.candidateId === action.candidateId ? { ...r, founderDecision: 'REJECTED' as FounderCropDecision } : r,
      );
    case 'SKIP':
      return regions.map((r) =>
        r.candidateId === action.candidateId ? { ...r, founderDecision: 'SKIPPED' as FounderCropDecision } : r,
      );
    case 'RE_CROP':
      return regions.map((r) =>
        r.candidateId === action.candidateId
          ? {
              ...r,
              boundingBox: action.bounds,
              founderDecision: 'RE_CROP' as FounderCropDecision,
              previewUrl: r.previewUrl?.split('#')[0] + `#crop=${action.bounds.x},${action.bounds.y},${action.bounds.width},${action.bounds.height}`,
            }
          : r,
      );
    case 'SPLIT':
      return splitCandidateRegion(regions, action.candidateId);
    case 'MERGE':
      return mergeCandidateRegions(regions, action.candidateIds);
    case 'REORDER': {
      const orderMap = new Map(action.candidateIds.map((id, i) => [id, i]));
      return [...regions]
        .sort((a, b) => (orderMap.get(a.candidateId) ?? a.orderIndex) - (orderMap.get(b.candidateId) ?? b.orderIndex))
        .map((r, i) => ({ ...r, orderIndex: i }));
    }
    case 'RECLASSIFY':
      return regions.map((r) =>
        r.candidateId === action.candidateId ? { ...r, classification: action.classification } : r,
      );
    case 'CONFIRM_ALL':
      return regions.map((r) =>
        r.founderDecision === 'REJECTED' || r.founderDecision === 'SKIPPED'
          ? r
          : { ...r, founderDecision: 'CONFIRMED' as FounderCropDecision },
      );
    case 'MANUAL_ADD': {
      const newRegion: DetectedAssetCandidate = {
        candidateId: `manual-${regions.length + 1}`,
        jobId: regions[0]?.jobId ?? 'unknown',
        sourceUploadId: regions[0]?.sourceUploadId ?? 'unknown',
        boundingBox: action.bounds,
        previewUrl: null,
        classification: action.classification,
        confidence: 0.6,
        orderIndex: regions.length,
        founderDecision: 'PENDING',
        replacementTarget: null,
        lowConfidenceBlock: false,
      };
      return [...regions, newRegion];
    }
    default:
      return regions;
  }
}

export function applyCropConfirmationActions(
  job: AssetJob,
  actions: CropConfirmationAction[],
): CropConfirmationResult {
  let regions = [...job.detectedRegions];
  for (const action of actions) {
    regions = applyAction(regions, action);
  }
  updateJobCandidates(job.jobId, regions);
  const updated = { ...job, detectedRegions: regions };
  return summarizeCropState(updated);
}

export function confirmAssetCrops(job: AssetJob, options?: { approveSubset?: string[] }): CropConfirmationResult {
  let regions = job.detectedRegions;

  if (options?.approveSubset?.length) {
    const allowed = new Set(options.approveSubset);
    regions = regions.map((r) =>
      allowed.has(r.candidateId) ? { ...r, founderDecision: 'CONFIRMED' as FounderCropDecision } : r,
    );
    updateJobCandidates(job.jobId, regions);
  }

  const state = summarizeCropState({ ...job, detectedRegions: regions });
  if (!state.ok) return state;

  const confirmed = regions.filter((r) => r.founderDecision === 'CONFIRMED');
  const lowBlock = confirmed.some(isLowConfidenceRegion);
  if (lowBlock) {
    return {
      ok: false,
      job,
      blocker: 'LOW_CONFIDENCE_CROP_REQUIRES_FOUNDER_REVIEW',
      confirmedCount: state.confirmedCount,
      pendingCount: state.pendingCount,
      lowConfidenceBlock: true,
    };
  }

  job.cropsConfirmed = true;
  job.status = 'CROPS_CONFIRMED';
  job.currentStep = 'RECONSTRUCT';
  job.updatedAt = new Date().toISOString();
  markJobStatus(job.jobId, 'CROPS_CONFIRMED', 'RECONSTRUCT');
  updateJobCandidates(job.jobId, regions);

  return {
    ok: true,
    job: { ...job, detectedRegions: regions, cropsConfirmed: true },
    confirmedCount: confirmed.length,
    pendingCount: 0,
    lowConfidenceBlock: false,
  };
}

function summarizeCropState(job: AssetJob): CropConfirmationResult {
  const active = job.detectedRegions.filter(
    (r) => r.founderDecision !== 'REJECTED' && r.founderDecision !== 'SKIPPED',
  );
  const confirmedCount = active.filter((r) => r.founderDecision === 'CONFIRMED').length;
  const pendingCount = active.filter((r) => r.founderDecision === 'PENDING' || r.founderDecision === 'RE_CROP').length;
  const lowConfidenceBlock = active.some((r) => r.founderDecision === 'CONFIRMED' && isLowConfidenceRegion(r));

  return {
    ok: confirmedCount > 0 && pendingCount === 0,
    job,
    blocker: pendingCount > 0 ? 'UNCONFIRMED_REGIONS_REMAIN' : confirmedCount === 0 ? 'NO_CONFIRMED_CROPS' : undefined,
    confirmedCount,
    pendingCount,
    lowConfidenceBlock,
  };
}

export function canBeginGeneration(job: AssetJob): { allowed: boolean; blocker?: string } {
  if (!job.cropsConfirmed) {
    return { allowed: false, blocker: 'GENERATION_BLOCKED: CROP CONFIRMATION REQUIRED' };
  }
  const confirmed = job.detectedRegions.filter((r) => r.founderDecision === 'CONFIRMED');
  if (!confirmed.length) {
    return { allowed: false, blocker: 'GENERATION_BLOCKED: NO CONFIRMED CROPS' };
  }
  if (confirmed.some(isLowConfidenceRegion)) {
    return { allowed: false, blocker: 'GENERATION_BLOCKED: LOW CONFIDENCE CROP' };
  }
  return { allowed: true };
}

export function countUnconfirmedRegions(job: AssetJob): number {
  return job.detectedRegions.filter(
    (r) =>
      r.founderDecision !== 'REJECTED' &&
      r.founderDecision !== 'SKIPPED' &&
      r.founderDecision !== 'CONFIRMED',
  ).length;
}
