/**
 * FounderCropIntelligence — orchestrates crop review, edit, validation, approval.
 * P0.VR.6R8 — semantic boundary detection + bounds-based contamination inference.
 */

import type { ReferenceAssetCandidate } from '../referenceAssetMismatch.js';
import type { NormalizedBbox } from '../types.js';
import { resolveAssetTargetSlotContract } from './assetTargetSlotContract.js';
import { buildCropDetectionExplanation } from './cropDetectionExplanation.js';
import { runCropQualityPreflight } from './cropQualityPreflight.js';
import { clampNormalizedBbox, computeCropChecksum } from './cropGeometry.js';
import { recordDetectionCorrection } from './cropDetectionLearning.js';
import { SOURCE_HEIGHT_MOBILE, SOURCE_WIDTH_MOBILE } from './familyCropCalibration.js';
import {
  inferContaminationFromBounds,
  resolveSemanticAssetBoundary,
  selectDetectionCandidate,
} from './semanticAssetBoundaryResolver.js';
import type {
  AssetIdentityDecision,
  BatchCropSummary,
  CropEditHistoryEntry,
  CropReviewState,
  CropReviewStatus,
  CropEditorState,
} from './types.js';

export { clampNormalizedBbox, computeCropChecksum, normalizedToPixelBounds, pixelToNormalizedBounds } from './cropGeometry.js';
export { SOURCE_WIDTH_MOBILE, SOURCE_HEIGHT_MOBILE } from './familyCropCalibration.js';

export const DEFAULT_OBJECT_PADDING_PERCENT = 10;

function brandKeyFromReview(review: CropReviewState): string {
  const match = review.candidateId.match(/NDXBOOK|FRONTAL_SLAYER|AIO|ASTRAL_WORLD|STUDIO_WORLD/);
  return match?.[0] ?? review.assetName.split(' ')[0] ?? 'UNKNOWN';
}

function runPreflightForCrop(
  crop: NormalizedBbox,
  review: Pick<CropReviewState, 'targetSlotContract' | 'semanticBoundary' | 'candidateId'>,
  brandKey: string,
  sourceWidth: number,
  sourceHeight: number,
  founderOverridePartial = false,
) {
  const card = review.semanticBoundary?.cardRegion ?? crop;
  const media = review.semanticBoundary?.mediaRegion ?? crop;
  const flags = inferContaminationFromBounds(crop, card, media, brandKey);
  return runCropQualityPreflight({
    crop,
    sourceWidth,
    sourceHeight,
    contract: review.targetSlotContract,
    ...flags,
    founderOverridePartial,
  });
}

function deriveReviewStatus(
  preflight: ReturnType<typeof runCropQualityPreflight>,
  assetIdentity: AssetIdentityDecision,
  approved: boolean,
  manual: boolean,
  needsFounderPlacement: boolean,
): CropReviewStatus {
  if (approved) return 'APPROVED';
  if (assetIdentity === 'WRONG_ASSET') return 'REJECTED';
  if (needsFounderPlacement && !manual) return 'EDIT_REQUIRED';
  if (preflight.blocksApproval) return 'EDIT_REQUIRED';
  if (manual) {
    if (assetIdentity === 'CONFIRMED') return 'READY_FOR_APPROVAL';
    return 'REPLACED_BY_MANUAL_CROP';
  }
  if (assetIdentity === 'UNSURE' || assetIdentity === null) return 'NEEDS_IDENTITY_CONFIRMATION';
  if (
    assetIdentity === 'CONFIRMED' &&
    (preflight.recommendedAction === 'READY FOR APPROVAL' || preflight.recommendedAction === 'REVIEW WARNINGS')
  ) {
    return 'READY_FOR_APPROVAL';
  }
  return 'DETECTED';
}

function buildHumanSummary(brandKey: string, _contract: ReturnType<typeof resolveAssetTargetSlotContract>): string {
  const name = brandKey.replace(/_/g, ' ');
  return `RECONSTRUCT THE FULL ${name} FAMILY VISUAL FROM THIS APPROVED CROP. REMOVE DEVICE / UI CONTEXT. PRESERVE THE VISUAL OBJECT. OUTPUT CLEAN CANONICAL ASSET.`;
}

export function initializeCropReview(
  candidate: ReferenceAssetCandidate,
  index: number,
  sourceWidth = SOURCE_WIDTH_MOBILE,
  sourceHeight = SOURCE_HEIGHT_MOBILE,
): CropReviewState {
  const contract = resolveAssetTargetSlotContract(candidate.semanticSlot);
  const semanticBoundary = resolveSemanticAssetBoundary({ candidate, index, contract });
  const detectorCrop = semanticBoundary.primaryCandidate.boundary;
  const activeCrop = detectorCrop;

  const preflight = runPreflightForCrop(activeCrop, { targetSlotContract: contract, semanticBoundary, candidateId: candidate.candidateId }, candidate.brandKey, sourceWidth, sourceHeight);

  const detectionExplanation = buildCropDetectionExplanation({
    brandKey: candidate.brandKey,
    assetType: candidate.assetType,
    semanticSlot: candidate.semanticSlot,
    confidencePercent: semanticBoundary.boundaryConfidence,
  });

  const history: CropEditHistoryEntry[] = [
    {
      id: `hist-detector-${candidate.candidateId}`,
      action: 'DETECTOR_INITIAL',
      bounds: { ...detectorCrop },
      timestamp: new Date().toISOString(),
      note: semanticBoundary.reasonCode,
    },
  ];

  return {
    candidateId: candidate.candidateId,
    assetNumber: String(index + 1).padStart(2, '0'),
    assetName: `${candidate.brandKey.replace(/_/g, ' ')} FAMILY VISUAL`,
    assetType: candidate.assetType,
    targetSlot: candidate.semanticSlot,
    reviewStatus: deriveReviewStatus(
      preflight,
      null,
      false,
      false,
      semanticBoundary.needsFounderPlacement,
    ),
    assetIdentity: null,
    detectorCrop,
    founderCrop: null,
    finalApprovedCrop: null,
    detectionExplanation,
    semanticBoundary,
    selectedCandidateId: semanticBoundary.primaryCandidate.candidateId,
    editorState: {
      selectedCandidateId: semanticBoundary.primaryCandidate.candidateId,
      zoom: 1,
      panX: 0,
      panY: 0,
      isDragging: false,
      activeHandle: null,
      dirty: false,
      lastSavedAt: null,
    },
    preflight,
    targetSlotContract: contract,
    editHistory: history,
    cropChecksum: null,
    approvedAt: null,
    approvedBy: null,
    humanSummary: buildHumanSummary(candidate.brandKey, contract),
    providerDispatchCount: 0,
  };
}

export function selectCropDetectionCandidate(review: CropReviewState, candidateId: string, sourceWidth = SOURCE_WIDTH_MOBILE, sourceHeight = SOURCE_HEIGHT_MOBILE): CropReviewState {
  if (!review.semanticBoundary) return review;
  const { boundary } = selectDetectionCandidate(review.semanticBoundary, candidateId);
  const next = applyFounderCropEdit(review, boundary, 'RE_DETECT', sourceWidth, sourceHeight, `Selected candidate ${candidateId}`);
  return {
    ...next,
    selectedCandidateId: candidateId,
    editorState: { ...(next.editorState ?? defaultEditorState(candidateId)), selectedCandidateId: candidateId },
  };
}

function defaultEditorState(candidateId: string) {
  return {
    selectedCandidateId: candidateId,
    zoom: 1,
    panX: 0,
    panY: 0,
    isDragging: false,
    activeHandle: null,
    dirty: false,
    lastSavedAt: null,
  };
}

export function getActiveCrop(review: CropReviewState): NormalizedBbox {
  return review.founderCrop ?? review.detectorCrop;
}

export function applyFounderCropEdit(
  review: CropReviewState,
  newBounds: NormalizedBbox,
  action: CropEditHistoryEntry['action'],
  sourceWidth = SOURCE_WIDTH_MOBILE,
  sourceHeight = SOURCE_HEIGHT_MOBILE,
  note?: string,
  brandKey?: string,
): CropReviewState {
  const founderCrop = clampNormalizedBbox(newBounds);
  const key = brandKey ?? brandKeyFromReview(review);
  const preflight = runPreflightForCrop(founderCrop, review, key, sourceWidth, sourceHeight, action === 'MANUAL_CROP');

  const entry: CropEditHistoryEntry = {
    id: `hist-${Date.now()}`,
    action,
    bounds: { ...founderCrop },
    timestamp: new Date().toISOString(),
    note: note ?? null,
  };

  const needsPlacement = review.semanticBoundary?.needsFounderPlacement ?? false;

  return {
    ...review,
    founderCrop,
    preflight,
    reviewStatus: deriveReviewStatus(preflight, review.assetIdentity, false, action === 'MANUAL_CROP', needsPlacement && action === 'DETECTOR_INITIAL'),
    editHistory: [...review.editHistory, entry],
    cropChecksum: null,
    approvedAt: null,
    approvedBy: null,
    editorState: {
      ...(review.editorState ?? defaultEditorState(review.selectedCandidateId ?? 'media-inner')),
      dirty: true,
      lastSavedAt: new Date().toISOString(),
    },
  };
}

export function fitObjectToCrop(
  review: CropReviewState,
  paddingPercent = DEFAULT_OBJECT_PADDING_PERCENT,
  sourceWidth = SOURCE_WIDTH_MOBILE,
  sourceHeight = SOURCE_HEIGHT_MOBILE,
): CropReviewState {
  const base = getActiveCrop(review);
  const padX = (base.width * paddingPercent) / 100;
  const padY = (base.height * paddingPercent) / 100;
  const expanded = clampNormalizedBbox({
    x: base.x - padX,
    y: base.y - padY,
    width: base.width + padX * 2,
    height: base.height + padY * 2,
  });
  return applyFounderCropEdit(review, expanded, 'FIT_OBJECT', sourceWidth, sourceHeight, `FIT OBJECT +${paddingPercent}% PADDING`);
}

export function resetCropToDetector(review: CropReviewState, sourceWidth = SOURCE_WIDTH_MOBILE, sourceHeight = SOURCE_HEIGHT_MOBILE): CropReviewState {
  const brandKey = brandKeyFromReview(review);
  const preflight = runPreflightForCrop(review.detectorCrop, review, brandKey, sourceWidth, sourceHeight);
  return {
    ...review,
    founderCrop: null,
    preflight,
    reviewStatus: deriveReviewStatus(
      preflight,
      review.assetIdentity,
      false,
      false,
      review.semanticBoundary?.needsFounderPlacement ?? false,
    ),
    editHistory: [
      ...review.editHistory,
      { id: `hist-reset-${Date.now()}`, action: 'RESET', bounds: { ...review.detectorCrop }, timestamp: new Date().toISOString(), note: 'Reset to detector crop' },
    ],
    editorState: { ...(review.editorState ?? defaultEditorState('media-inner')), dirty: false },
  };
}

export function setAssetIdentity(review: CropReviewState, decision: AssetIdentityDecision): CropReviewState {
  const status =
    decision === 'WRONG_ASSET'
      ? 'REJECTED'
      : decision === 'UNSURE'
        ? 'NEEDS_IDENTITY_CONFIRMATION'
        : deriveReviewStatus(
            review.preflight,
            decision,
            false,
            review.reviewStatus === 'REPLACED_BY_MANUAL_CROP',
            false,
          );
  return { ...review, assetIdentity: decision, reviewStatus: status };
}

export function approveCropReview(
  review: CropReviewState,
  approvedBy = 'founder',
  options?: { overrideWarnings?: boolean },
): { review: CropReviewState; allowed: boolean; reason: string | null } {
  if (review.assetIdentity !== 'CONFIRMED') {
    return { review, allowed: false, reason: 'ASSET IDENTITY NOT CONFIRMED' };
  }
  const hasBlocks = review.preflight.issues.some((i) => i.severity === 'BLOCK');
  if (hasBlocks) {
    return { review, allowed: false, reason: review.preflight.recommendedAction };
  }
  if (options?.overrideWarnings === false && review.preflight.issues.some((i) => i.severity === 'WARN')) {
    return { review, allowed: false, reason: 'WARNINGS REQUIRE OVERRIDE OR CORRECTION' };
  }

  const finalCrop = getActiveCrop(review);
  const checksum = computeCropChecksum(review.candidateId, finalCrop);

  if (review.founderCrop && review.semanticBoundary) {
    recordDetectionCorrection({
      targetSlot: review.targetSlot,
      assetType: review.assetType,
      detectedCrop: review.detectorCrop,
      finalCrop,
      reason: options?.overrideWarnings ? 'APPROVED_WITH_WARNING' : null,
      contaminationRemoved: review.semanticBoundary.contaminationFlags,
    });
  }

  const updated: CropReviewState = {
    ...review,
    finalApprovedCrop: finalCrop,
    cropChecksum: checksum,
    approvedAt: new Date().toISOString(),
    approvedBy,
    reviewStatus: 'APPROVED',
    editHistory: [
      ...review.editHistory,
      { id: `hist-approve-${Date.now()}`, action: 'APPROVED', bounds: { ...finalCrop }, timestamp: new Date().toISOString(), note: checksum },
    ],
  };
  return { review: updated, allowed: true, reason: null };
}

export function canApproveInBatch(review: CropReviewState): boolean {
  return (
    review.assetIdentity === 'CONFIRMED' &&
    !review.preflight.blocksBatchApproval &&
    (review.reviewStatus === 'READY_FOR_APPROVAL' || review.reviewStatus === 'REPLACED_BY_MANUAL_CROP') &&
    (review.preflight.objectCoverage === 'FULL' || review.founderCrop != null)
  );
}

export function summarizeBatchCropReviews(reviews: CropReviewState[]): BatchCropSummary {
  const approved = reviews.filter((r) => r.reviewStatus === 'APPROVED').length;
  const ready = reviews.filter((r) => r.reviewStatus === 'READY_FOR_APPROVAL').length;
  const editRequired = reviews.filter((r) => r.reviewStatus === 'EDIT_REQUIRED' || r.reviewStatus === 'NEEDS_IDENTITY_CONFIRMATION').length;
  const identityConfirmed = reviews.filter((r) => r.assetIdentity === 'CONFIRMED').length;

  return {
    total: reviews.length,
    detected: reviews.length,
    identityConfirmed,
    ready,
    editRequired,
    approved,
    generationBlocked: approved < reviews.length,
  };
}

export function assertNoProviderDispatchDuringCropEdit(review: CropReviewState): boolean {
  return review.providerDispatchCount === 0 && review.reviewStatus !== 'APPROVED' || review.providerDispatchCount === 0;
}

export function initializeCropReviewsForJob(candidates: ReferenceAssetCandidate[]): CropReviewState[] {
  return candidates.map((c, i) => initializeCropReview(c, i));
}

export function mergeCropBounds(a: NormalizedBbox, b: NormalizedBbox): NormalizedBbox {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const x2 = Math.max(a.x + a.width, b.x + b.width);
  const y2 = Math.max(a.y + a.height, b.y + b.height);
  return clampNormalizedBbox({ x, y, width: x2 - x, height: y2 - y });
}

export function splitActiveCrop(review: CropReviewState): { left: CropReviewState; rightBounds: NormalizedBbox } {
  const active = getActiveCrop(review);
  const halfW = active.width / 2;
  const leftBounds = clampNormalizedBbox({ ...active, width: halfW });
  const rightBounds = clampNormalizedBbox({
    x: active.x + halfW,
    y: active.y,
    width: halfW,
    height: active.height,
  });
  const left = applyFounderCropEdit(review, leftBounds, 'SPLIT', SOURCE_WIDTH_MOBILE, SOURCE_HEIGHT_MOBILE, 'Split left child');
  return { left, rightBounds };
}

export function mergeIntoCrop(review: CropReviewState, otherBounds: NormalizedBbox): CropReviewState {
  const merged = mergeCropBounds(getActiveCrop(review), otherBounds);
  return applyFounderCropEdit(review, merged, 'MERGE', SOURCE_WIDTH_MOBILE, SOURCE_HEIGHT_MOBILE, 'Merged region');
}

export function adjustCropPadding(
  review: CropReviewState,
  deltaPercent: number,
  sourceWidth = SOURCE_WIDTH_MOBILE,
  sourceHeight = SOURCE_HEIGHT_MOBILE,
): CropReviewState {
  const base = getActiveCrop(review);
  const padX = (base.width * Math.abs(deltaPercent)) / 100;
  const padY = (base.height * Math.abs(deltaPercent)) / 100;
  const next =
    deltaPercent >= 0
      ? clampNormalizedBbox({
          x: base.x - padX,
          y: base.y - padY,
          width: base.width + padX * 2,
          height: base.height + padY * 2,
        })
      : clampNormalizedBbox({
          x: base.x + padX,
          y: base.y + padY,
          width: Math.max(0.02, base.width - padX * 2),
          height: Math.max(0.02, base.height - padY * 2),
        });
  return applyFounderCropEdit(review, next, 'PADDING_ADJUST', sourceWidth, sourceHeight, `Padding ${deltaPercent >= 0 ? '+' : ''}${deltaPercent}%`);
}

/** Test / recovery helper — confirm identity and fix blocked NDXBOOK-style crops. */
export function prepareCropReviewForApproval(review: CropReviewState): CropReviewState {
  let next = setAssetIdentity(review, 'CONFIRMED');
  if (next.preflight.blocksApproval) {
    const media = next.semanticBoundary?.mediaRegion ?? getActiveCrop(next);
    next = applyFounderCropEdit(next, media, 'MANUAL_CROP', SOURCE_WIDTH_MOBILE, SOURCE_HEIGHT_MOBILE, 'Snap to inner media region');
    if (next.preflight.blocksApproval) {
      next = fitObjectToCrop(next, 8);
    }
  }
  return next;
}

export function prepareAllCropReviewsForApproval(reviews: CropReviewState[]): CropReviewState[] {
  return reviews.map((r) => prepareCropReviewForApproval(r));
}

export function updateCropEditorViewport(
  review: CropReviewState,
  patch: Partial<Pick<CropEditorState, 'zoom' | 'panX' | 'panY' | 'isDragging' | 'activeHandle'>>,
): CropReviewState {
  if (!review.editorState) return review;
  return {
    ...review,
    editorState: { ...review.editorState, ...patch },
  };
}
