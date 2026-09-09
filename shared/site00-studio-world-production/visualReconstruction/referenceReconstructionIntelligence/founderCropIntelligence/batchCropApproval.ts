/**
 * Intelligent batch crop approval — only valid crops.
 */

import type { CropReviewState } from './types.js';
import { approveCropReview, canApproveInBatch } from './founderCropIntelligence.js';

export type BatchApproveResult = {
  approved: CropReviewState[];
  skipped: Array<{ review: CropReviewState; reason: string }>;
  approvedCount: number;
};

export function approveAllValidCrops(reviews: CropReviewState[], approvedBy = 'founder'): BatchApproveResult {
  const approved: CropReviewState[] = [];
  const skipped: BatchApproveResult['skipped'] = [];

  for (const review of reviews) {
    if (review.reviewStatus === 'APPROVED') {
      approved.push(review);
      continue;
    }
    if (!canApproveInBatch(review)) {
      skipped.push({
        review,
        reason: review.preflight.recommendedAction || review.reviewStatus,
      });
      continue;
    }
    const result = approveCropReview(review, approvedBy);
    if (result.allowed) approved.push(result.review);
    else skipped.push({ review, reason: result.reason ?? 'BLOCKED' });
  }

  return { approved, skipped, approvedCount: approved.length };
}
