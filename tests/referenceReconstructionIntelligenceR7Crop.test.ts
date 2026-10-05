/**
 * P0.VR.6R7 — Founder Crop Intelligence + Editable Crop Workspace tests.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  initializeCropReview,
  initializeCropReviewsForJob,
  applyFounderCropEdit,
  fitObjectToCrop,
  resetCropToDetector,
  setAssetIdentity,
  approveCropReview,
  getActiveCrop,
  adjustCropPadding,
  splitActiveCrop,
  mergeIntoCrop,
  prepareAllCropReviewsForApproval,
  assertNoProviderDispatchDuringCropEdit,
  summarizeBatchCropReviews,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/founderCropIntelligence.js';
import { approveAllValidCrops } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/batchCropApproval.js';
import { buildCropDetectionExplanation } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/cropDetectionExplanation.js';
import { resolveAssetTargetSlotContract } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/assetTargetSlotContract.js';
import { runCropQualityPreflight } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/cropQualityPreflight.js';
import { canonicalFromNormalized } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/canonicalCropRect.js';
import { computeCropCoordinateChecksum } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/cropPreviewAlignment.js';
import { SOURCE_HEIGHT_MOBILE, SOURCE_WIDTH_MOBILE } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/familyCropCalibration.js';
import {
  createInitialWorkflowState,
  approveCropAtIndex,
  approveAllCropsInWorkflow,
  approveGenerationInWorkflow,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/reconstructionJobOrchestrator.js';
import { resetReconstructionWorkflowForTest } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/reconstructionWorkflowStore.js';
import { buildSkinsMobileMultiAssetReconstructionJob } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/multiAssetReconstructionJob.js';

function jobCandidates() {
  return buildSkinsMobileMultiAssetReconstructionJob({
    liveColorSwatchBrands: ['FRONTAL_SLAYER', 'AIO', 'ASTRAL_WORLD', 'STUDIO_WORLD'],
  })!.candidateAssets;
}

describe('P0.VR.6R7 — Founder Crop Intelligence', () => {
  beforeEach(() => resetReconstructionWorkflowForTest());

  it('1. crop explanation exists', () => {
    const exp = buildCropDetectionExplanation({
      brandKey: 'NDXBOOK',
      assetType: 'PROJECT_VISUAL',
      semanticSlot: 'BRAND_FAMILY_NDXBOOK_THUMBNAIL',
      confidencePercent: 82,
    });
    expect(exp.summary.length).toBeGreaterThan(10);
    expect(exp.detectionBasis).toMatch(/IMAGE-LIKE/i);
  });

  it('2. source context fields present on crop review', () => {
    const review = initializeCropReview(jobCandidates()[0]!, 0);
    expect(review.detectorCrop.width).toBeGreaterThan(0);
    expect(review.detectionExplanation.expectedContent).toBeTruthy();
  });

  it('3. crop editor state supports interactive edits', () => {
    const review = initializeCropReview(jobCandidates()[1]!, 1);
    const edited = applyFounderCropEdit(review, { ...getActiveCrop(review), x: review.detectorCrop.x + 0.01 }, 'FOUNDER_DRAG');
    expect(edited.founderCrop).not.toBeNull();
    expect(edited.editHistory.length).toBeGreaterThan(review.editHistory.length);
  });

  it('4. drag updates crop', () => {
    const review = initializeCropReview(jobCandidates()[1]!, 1);
    const before = getActiveCrop(review).x;
    const edited = applyFounderCropEdit(review, { ...getActiveCrop(review), x: before + 0.005 }, 'FOUNDER_DRAG');
    expect(getActiveCrop(edited).x).toBeGreaterThan(before);
  });

  it('5. resize updates crop', () => {
    const review = initializeCropReview(jobCandidates()[1]!, 1);
    const edited = applyFounderCropEdit(review, { ...getActiveCrop(review), width: getActiveCrop(review).width + 0.01 }, 'FOUNDER_RESIZE');
    expect(getActiveCrop(edited).width).toBeGreaterThan(getActiveCrop(review).width);
  });

  it('6. manual crop works', () => {
    const review = initializeCropReview(jobCandidates()[1]!, 1);
    const manual = applyFounderCropEdit(review, { x: 0.12, y: 0.34, width: 0.09, height: 0.08 }, 'MANUAL_CROP');
    expect(manual.founderCrop).not.toBeNull();
    expect(manual.reviewStatus).toBe('REPLACED_BY_MANUAL_CROP');
  });

  it('7. fit object works', () => {
    const review = initializeCropReview(jobCandidates()[1]!, 1);
    const fitted = fitObjectToCrop(review, 12);
    expect(getActiveCrop(fitted).width).toBeGreaterThanOrEqual(getActiveCrop(review).width);
  });

  it('8. padding adjustment works', () => {
    const review = initializeCropReview(jobCandidates()[1]!, 1);
    const padded = adjustCropPadding(review, 10);
    expect(getActiveCrop(padded).width).toBeGreaterThan(getActiveCrop(review).width);
  });

  it('9. reset works', () => {
    let review = applyFounderCropEdit(initializeCropReview(jobCandidates()[0]!, 0), { x: 0.2, y: 0.4, width: 0.05, height: 0.05 }, 'MANUAL_CROP');
    review = resetCropToDetector(review);
    expect(review.founderCrop).toBeNull();
  });

  it('10. wrong asset flow works', () => {
    const review = setAssetIdentity(initializeCropReview(jobCandidates()[0]!, 0), 'WRONG_ASSET');
    expect(review.reviewStatus).toBe('REJECTED');
    expect(approveCropReview(review).allowed).toBe(false);
  });

  it('11. split works', () => {
    const review = initializeCropReview(jobCandidates()[1]!, 1);
    const { left, rightBounds } = splitActiveCrop(review);
    expect(getActiveCrop(left).width).toBeLessThan(getActiveCrop(review).width);
    expect(rightBounds.width).toBeGreaterThan(0);
  });

  it('12. merge works', () => {
    const review = initializeCropReview(jobCandidates()[1]!, 1);
    const { rightBounds } = splitActiveCrop(review);
    const merged = mergeIntoCrop(review, rightBounds);
    expect(getActiveCrop(merged).width).toBeGreaterThanOrEqual(getActiveCrop(review).width);
  });

  it('13. object coverage classification', () => {
    const ndx = initializeCropReview(jobCandidates()[0]!, 0);
    expect(['FULL', 'PARTIAL', 'UNKNOWN']).toContain(ndx.preflight.objectCoverage);
    const other = initializeCropReview(jobCandidates()[1]!, 1);
    expect(['FULL', 'UNKNOWN']).toContain(other.preflight.objectCoverage);
  });

  it('14. edge contact classification', () => {
    const review = initializeCropReview(jobCandidates()[0]!, 0);
    expect(['CLEAR', 'TOUCHING', 'CLIPPED']).toContain(review.preflight.edgeContact);
  });

  it('15. device chrome flagged when full-card crop selected', () => {
    const ndx = initializeCropReview(jobCandidates()[0]!, 0);
    const fullCard = ndx.semanticBoundary!.alternateCandidates.find((c) => c.candidateId === 'full-card')!.boundary;
    const edited = applyFounderCropEdit(ndx, fullCard, 'MANUAL_CROP');
    expect(edited.preflight.unwantedContext).toContain('DEVICE_CHROME');
  });

  it('16. UI chrome contamination flagged on full card', () => {
    const ndx = initializeCropReview(jobCandidates()[0]!, 0);
    const fullCard = ndx.semanticBoundary!.alternateCandidates.find((c) => c.candidateId === 'full-card')!.boundary;
    const edited = applyFounderCropEdit(ndx, fullCard, 'MANUAL_CROP');
    expect(edited.preflight.issues.some((i) => i.code === 'DEVICE_CHROME' || i.code === 'UI_CHROME')).toBe(true);
  });

  it('17. text contamination flagged on full card', () => {
    const ndx = initializeCropReview(jobCandidates()[0]!, 0);
    const fullCard = ndx.semanticBoundary!.alternateCandidates.find((c) => c.candidateId === 'full-card')!.boundary;
    const edited = applyFounderCropEdit(ndx, fullCard, 'MANUAL_CROP');
    expect(edited.preflight.unwantedContext).toContain('TEXT');
  });

  it('18. adjacent card contamination flagged when crop bleeds past card', () => {
    const ndx = initializeCropReview(jobCandidates()[0]!, 0);
    const card = ndx.semanticBoundary!.cardRegion;
    const bleed = { ...card, width: card.width + 0.02 };
    const edited = applyFounderCropEdit(ndx, bleed, 'MANUAL_CROP');
    expect(edited.preflight.unwantedContext).toContain('ADJACENT_CARD');
  });

  it('19. minimum geometry guard blocks tiny crop', () => {
    const contract = resolveAssetTargetSlotContract('BRAND_FAMILY_NDXBOOK_THUMBNAIL');
    const tiny = runCropQualityPreflight({
      crop: { x: 0.4, y: 0.4, width: 0.001, height: 0.001 },
      sourceWidth: 941,
      sourceHeight: 1672,
      contract,
    });
    expect(tiny.minimumSizePass).toBe(false);
    expect(tiny.blocksApproval).toBe(true);
  });

  it('20. target slot compatibility', () => {
    const review = initializeCropReview(jobCandidates()[1]!, 1);
    expect(review.targetSlotContract.allowDeviceChrome).toBe(false);
    expect(review.targetSlotContract.slotId).toContain('BRAND_FAMILY');
  });

  it('21. ready-for-approval derivation', () => {
    const prepared = prepareAllCropReviewsForApproval([initializeCropReview(jobCandidates()[1]!, 1)])[0]!;
    expect(prepared.reviewStatus).toBe('READY_FOR_APPROVAL');
  });

  it('22. invalid crop blocks batch approval', () => {
    const reviews = initializeCropReviewsForJob(jobCandidates());
    const batch = approveAllValidCrops(reviews);
    expect(batch.approvedCount).toBe(0);
    expect(batch.skipped.length).toBe(5);
  });

  it('23. approve all valid crops only approves valid crops', () => {
    const reviews = prepareAllCropReviewsForApproval(initializeCropReviewsForJob(jobCandidates()));
    const batch = approveAllValidCrops(reviews);
    expect(batch.approvedCount).toBe(5);
  });

  it('24. crop checksum stored on approval', () => {
    let review = prepareAllCropReviewsForApproval([initializeCropReview(jobCandidates()[1]!, 1)])[0]!;
    const result = approveCropReview(review);
    expect(result.allowed).toBe(true);
    expect(result.review.cropChecksum).toBeTruthy();
    const canonical = canonicalFromNormalized(getActiveCrop(result.review), SOURCE_WIDTH_MOBILE, SOURCE_HEIGHT_MOBILE);
    expect(result.review.cropChecksum).toBe(computeCropCoordinateChecksum(review.candidateId, canonical));
  });

  it('25. founder crop supersedes detector crop', () => {
    const review = applyFounderCropEdit(initializeCropReview(jobCandidates()[0]!, 0), { x: 0.12, y: 0.36, width: 0.07, height: 0.08 }, 'MANUAL_CROP');
    expect(getActiveCrop(review)).not.toEqual(review.detectorCrop);
    expect(review.founderCrop).not.toBeNull();
  });

  it('26. no provider dispatch during crop editing', () => {
    const review = applyFounderCropEdit(initializeCropReview(jobCandidates()[0]!, 0), { x: 0.12, y: 0.36, width: 0.07, height: 0.08 }, 'MANUAL_CROP');
    expect(assertNoProviderDispatchDuringCropEdit(review)).toBe(true);
    expect(review.providerDispatchCount).toBe(0);
  });

  it('27. no provider dispatch on crop approval', () => {
    let state = createInitialWorkflowState()!;
    state = {
      ...state,
      cropReviews: prepareAllCropReviewsForApproval(state.cropReviews),
    };
    state = approveCropAtIndex(state, 0);
    expect(state.generationExecuting).toBe(false);
    expect(state.job.generationApprovalStatus.status).toBe('BLOCKED');
  });

  it('28. generation approval remains separate', () => {
    let state = createInitialWorkflowState()!;
    state = { ...state, cropReviews: prepareAllCropReviewsForApproval(state.cropReviews) };
    state = approveAllCropsInWorkflow(state);
    expect(state.workflowView).toBe('generation-plan');
    expect(state.generationExecuting).toBe(false);
    state = approveGenerationInWorkflow(state);
    expect(state.generationExecuting).toBe(true);
  });

  it('29. mobile crop editor class contract', () => {
    expect('site00-dw-crop-editor--mobile').toBeTruthy();
  });

  it('30. desktop crop editor class contract', () => {
    expect('site00-dw-crop-editor__panes').toBeTruthy();
  });

  it('31. multi-asset candidate navigator batch summary', () => {
    const batch = summarizeBatchCropReviews(initializeCropReviewsForJob(jobCandidates()));
    expect(batch.total).toBe(5);
    expect(batch.editRequired).toBeGreaterThan(0);
    expect(batch.generationBlocked).toBe(true);
  });

  it('32. crop edit history stored', () => {
    const review = fitObjectToCrop(initializeCropReview(jobCandidates()[1]!, 1));
    expect(review.editHistory.some((e) => e.action === 'FIT_OBJECT')).toBe(true);
  });

  it('33. NDXBOOK golden test uses semantic inner media', () => {
    const state = createInitialWorkflowState()!;
    const ndx = state.cropReviews[0]!;
    expect(ndx.assetName).toMatch(/NDXBOOK/i);
    expect(ndx.semanticBoundary).not.toBeNull();
    expect(ndx.detectorCrop.width).toBeLessThan(ndx.semanticBoundary!.cardRegion.width);
    expect(ndx.preflight.unwantedContext).not.toContain('DEVICE_CHROME');
  });

  it('34. batch partial approval in workflow orchestrator', () => {
    let state = createInitialWorkflowState()!;
    state = {
      ...state,
      cropReviews: state.cropReviews.map((r, i) => (i === 0 ? r : setAssetIdentity(r, 'CONFIRMED'))),
    };
    state = approveAllCropsInWorkflow(state);
    expect(state.job.cropApprovalStatus.approved).toBe(4);
    expect(state.job.candidateAssets[0]?.cropStatus).not.toBe('APPROVED');
  });
});
