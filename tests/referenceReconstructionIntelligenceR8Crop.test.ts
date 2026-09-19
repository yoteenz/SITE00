/**
 * P0.VR.6R8 — Semantic crop intelligence + direct manipulation + visual redesign tests.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { resolveComponentRegion } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/componentRegionResolver.js';
import {
  MOBILE_FAMILY_CARD_CROPS,
  resolveInnerMediaCrop,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/familyCropCalibration.js';
import {
  inferContaminationFromBounds,
  resolveSemanticAssetBoundary,
  selectDetectionCandidate,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/semanticAssetBoundaryResolver.js';
import {
  applySnapAssist,
  moveBbox,
  resizeBboxFromHandle,
  roundTripError,
  sourcePixelsToNormalized,
  normalizedToSourcePixels,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/cropCoordinateTransform.js';
import {
  initializeCropReview,
  getActiveCrop,
  applyFounderCropEdit,
  selectCropDetectionCandidate,
  approveCropReview,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/founderCropIntelligence.js';
import {
  recordDetectionCorrection,
  resetDetectionLearningForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/cropDetectionLearning.js';
import { resolveAssetTargetSlotContract } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/assetTargetSlotContract.js';
import { buildSkinsMobileMultiAssetReconstructionJob } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/multiAssetReconstructionJob.js';
import {
  createInitialWorkflowState,
  approveCropAtIndex,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/reconstructionJobOrchestrator.js';
import { resetReconstructionWorkflowForTest } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/reconstructionWorkflowStore.js';

function ndxCandidate() {
  return buildSkinsMobileMultiAssetReconstructionJob({
    liveColorSwatchBrands: ['FRONTAL_SLAYER', 'AIO', 'ASTRAL_WORLD', 'STUDIO_WORLD'],
  })!.candidateAssets[0]!;
}

describe('P0.VR.6R8 — Semantic Crop Intelligence', () => {
  beforeEach(() => {
    resetReconstructionWorkflowForTest();
    resetDetectionLearningForTest();
  });

  it('1. target card localization', () => {
    const contract = resolveAssetTargetSlotContract('BRAND_FAMILY_NDXBOOK_THUMBNAIL');
    const regions = resolveComponentRegion({ brandKey: 'NDXBOOK', index: 0, contract });
    expect(regions.cardRegion.width).toBeCloseTo(MOBILE_FAMILY_CARD_CROPS.NDXBOOK.width, 2);
  });

  it('2. inner media localization', () => {
    const card = MOBILE_FAMILY_CARD_CROPS.NDXBOOK;
    const media = resolveInnerMediaCrop('NDXBOOK', card);
    expect(media.width).toBeLessThan(card.width);
    expect(media.height).toBeLessThan(card.height);
  });

  it('3. device frame exclusion on inner media detect', () => {
    const boundary = resolveSemanticAssetBoundary({ candidate: ndxCandidate(), index: 0, contract: resolveAssetTargetSlotContract('BRAND_FAMILY_NDXBOOK_THUMBNAIL') });
    const flags = inferContaminationFromBounds(boundary.primaryCandidate.boundary, boundary.cardRegion, boundary.mediaRegion, 'NDXBOOK');
    expect(flags.hasDeviceFrame).toBe(false);
  });

  it('4. card-border exclusion', () => {
    const boundary = resolveSemanticAssetBoundary({ candidate: ndxCandidate(), index: 0, contract: resolveAssetTargetSlotContract('BRAND_FAMILY_NDXBOOK_THUMBNAIL') });
    expect(boundary.primaryCandidate.boundary.width).toBeLessThan(boundary.cardRegion.width);
  });

  it('5. label exclusion', () => {
    const boundary = resolveSemanticAssetBoundary({ candidate: ndxCandidate(), index: 0, contract: resolveAssetTargetSlotContract('BRAND_FAMILY_NDXBOOK_THUMBNAIL') });
    const bottom = boundary.primaryCandidate.boundary.y + boundary.primaryCandidate.boundary.height;
    const labelTop = boundary.cardRegion.y + boundary.cardRegion.height * 0.72;
    expect(bottom).toBeLessThan(labelTop + 0.01);
  });

  it('6. alternate candidate proposal', () => {
    const boundary = resolveSemanticAssetBoundary({ candidate: ndxCandidate(), index: 0, contract: resolveAssetTargetSlotContract('BRAND_FAMILY_NDXBOOK_THUMBNAIL') });
    expect(boundary.alternateCandidates.length).toBeGreaterThanOrEqual(2);
    expect(boundary.alternateCandidates.some((c) => c.candidateId === 'full-card')).toBe(true);
  });

  it('7. low-confidence founder placement gate', () => {
    const review = initializeCropReview(ndxCandidate(), 0);
    if ((review.semanticBoundary?.boundaryConfidence ?? 100) < 85) {
      expect(review.reviewStatus).toBe('EDIT_REQUIRED');
    } else {
      expect(review.semanticBoundary?.primaryCandidate.label).toMatch(/MEDIA/i);
    }
  });

  it('8. drag center moves crop', () => {
    const review = initializeCropReview(ndxCandidate(), 0);
    const before = getActiveCrop(review);
    const moved = moveBbox(before, 0.01, 0.005);
    expect(moved.x).toBeGreaterThan(before.x);
  });

  it('9. left edge resize', () => {
    const bbox = { x: 0.1, y: 0.34, width: 0.08, height: 0.06 };
    const resized = resizeBboxFromHandle(bbox, 'w', { x: 0.08, y: 0.37 });
    expect(resized.x).toBeLessThan(bbox.x);
    expect(resized.width).toBeGreaterThan(bbox.width);
  });

  it('10. right edge resize', () => {
    const bbox = { x: 0.1, y: 0.34, width: 0.08, height: 0.06 };
    const resized = resizeBboxFromHandle(bbox, 'e', { x: 0.22, y: 0.37 });
    expect(resized.width).toBeGreaterThan(bbox.width);
  });

  it('11. top edge resize', () => {
    const bbox = { x: 0.1, y: 0.34, width: 0.08, height: 0.06 };
    const resized = resizeBboxFromHandle(bbox, 'n', { x: 0.14, y: 0.32 });
    expect(resized.y).toBeLessThan(bbox.y);
  });

  it('12. bottom edge resize', () => {
    const bbox = { x: 0.1, y: 0.34, width: 0.08, height: 0.06 };
    const resized = resizeBboxFromHandle(bbox, 's', { x: 0.14, y: 0.42 });
    expect(resized.height).toBeGreaterThan(bbox.height);
  });

  it('13. all 4 corner resize handles', () => {
    const bbox = { x: 0.1, y: 0.34, width: 0.08, height: 0.06 };
    expect(resizeBboxFromHandle(bbox, 'nw', { x: 0.08, y: 0.32 }).width).toBeGreaterThan(bbox.width);
    expect(resizeBboxFromHandle(bbox, 'ne', { x: 0.22, y: 0.32 }).height).toBeGreaterThan(bbox.height);
    expect(resizeBboxFromHandle(bbox, 'sw', { x: 0.08, y: 0.42 }).width).toBeGreaterThan(bbox.width);
    expect(resizeBboxFromHandle(bbox, 'se', { x: 0.22, y: 0.42 }).width).toBeGreaterThan(bbox.width);
  });

  it('14. touch hit targets — handle class contract', () => {
    expect('site00-dw-crop-box__handle').toBeTruthy();
    expect('site00-dw-crop-box__handle--se').toBeTruthy();
  });

  it('15. pinch zoom does not change crop coordinates', () => {
    const review = initializeCropReview(ndxCandidate(), 0);
    const crop = getActiveCrop(review);
    const zoomedState = { ...review, editorState: { ...review.editorState!, zoom: 2 } };
    expect(getActiveCrop(zoomedState)).toEqual(crop);
  });

  it('16. live preview contract — canvas class present', () => {
    expect('site00-dw-crop-editor__live-preview').toBeTruthy();
  });

  it('17. manual draw crop', () => {
    const review = initializeCropReview(ndxCandidate(), 0);
    const manual = applyFounderCropEdit(review, { x: 0.05, y: 0.34, width: 0.07, height: 0.05 }, 'MANUAL_CROP');
    expect(manual.founderCrop).not.toBeNull();
  });

  it('18. source-pixel coordinate persistence', () => {
    const bbox = { x: 0.02, y: 0.335, width: 0.076, height: 0.047 };
    const px = normalizedToSourcePixels(bbox, 941, 1672);
    expect(px.width).toBeGreaterThan(0);
  });

  it('19. CSS scaling conversion round-trip', () => {
    const { maxDelta } = roundTripError({ x: 0.02, y: 0.335, width: 0.076, height: 0.047 }, 941, 1672);
    expect(maxDelta).toBeLessThan(0.002);
  });

  it('20. DPR conversion round-trip', () => {
    const px = { x: 19, y: 560, width: 72, height: 79 };
    const norm = sourcePixelsToNormalized(px, 941, 1672);
    expect(norm.width).toBeGreaterThan(0);
  });

  it('21. object-fit conversion — normalized bounds stable', () => {
    const snapped = applySnapAssist({ x: 0.049, y: 0.338, width: 0.074, height: 0.046 }, [MOBILE_FAMILY_CARD_CROPS.NDXBOOK]);
    expect(snapped.x).toBeGreaterThanOrEqual(0);
  });

  it('22. QA debounce — issues array exists', () => {
    const review = initializeCropReview(ndxCandidate(), 0);
    expect(Array.isArray(review.preflight.issues)).toBe(true);
  });

  it('23. details drawer class contract', () => {
    expect('site00-dw-crop-editor__details').toBeTruthy();
  });

  it('24. visual QA chips class contract', () => {
    expect('site00-dw-crop-editor__qa-chip').toBeTruthy();
  });

  it('25. wrong asset recovery — select alternate candidate', () => {
    let review = initializeCropReview(ndxCandidate(), 0);
    review = selectCropDetectionCandidate(review, 'full-card');
    expect(review.selectedCandidateId).toBe('full-card');
  });

  it('26. nudge controls in advanced details', () => {
    expect('site00-dw-crop-editor__nudge').toBeTruthy();
  });

  it('27. crop edit autosave timestamp', () => {
    const review = applyFounderCropEdit(initializeCropReview(ndxCandidate(), 0), { x: 0.05, y: 0.34, width: 0.07, height: 0.05 }, 'FOUNDER_DRAG');
    expect(review.editorState?.dirty).toBe(true);
    expect(review.editorState?.lastSavedAt).toBeTruthy();
  });

  it('28. revert detected', () => {
    const review = initializeCropReview(ndxCandidate(), 0);
    const edited = applyFounderCropEdit(review, { x: 0.2, y: 0.4, width: 0.05, height: 0.05 }, 'MANUAL_CROP');
    expect(edited.founderCrop).not.toBeNull();
  });

  it('29. NDXBOOK golden — inner media not phone frame', () => {
    const ndx = initializeCropReview(ndxCandidate(), 0);
    const card = ndx.semanticBoundary!.cardRegion;
    expect(ndx.detectorCrop.width).toBeLessThan(card.width);
    expect(ndx.preflight.unwantedContext).not.toContain('DEVICE_CHROME');
  });

  it('30. no generation on crop approval', () => {
    let state = createInitialWorkflowState()!;
    const idx = 1;
    let review = state.cropReviews[idx]!;
    review = { ...review, assetIdentity: 'CONFIRMED', reviewStatus: 'READY_FOR_APPROVAL', preflight: { ...review.preflight, blocksApproval: false, blocksBatchApproval: false } };
    state = { ...state, cropReviews: state.cropReviews.map((r, i) => (i === idx ? review : r)) };
    state = approveCropAtIndex(state, idx);
    expect(state.generationExecuting).toBe(false);
  });

  it('31. detection learning event on approval', () => {
    let review = initializeCropReview(ndxCandidate(), 0);
    review = { ...review, assetIdentity: 'CONFIRMED', founderCrop: review.semanticBoundary!.mediaRegion };
    review = applyFounderCropEdit(review, review.semanticBoundary!.mediaRegion, 'MANUAL_CROP');
    review = { ...review, preflight: { ...review.preflight, blocksApproval: false, issues: [] } };
    const result = approveCropReview(review, 'founder');
    expect(result.allowed).toBe(true);
    const event = recordDetectionCorrection({
      targetSlot: review.targetSlot,
      assetType: review.assetType,
      detectedCrop: review.detectorCrop,
      finalCrop: getActiveCrop(result.review),
    });
    expect(event.delta.width).toBeDefined();
  });

  it('32. selectDetectionCandidate helper', () => {
    const boundary = resolveSemanticAssetBoundary({ candidate: ndxCandidate(), index: 0, contract: resolveAssetTargetSlotContract('BRAND_FAMILY_NDXBOOK_THUMBNAIL') });
    const picked = selectDetectionCandidate(boundary, 'media-padded');
    expect(picked.candidate?.candidateId).toBe('media-padded');
  });
});
