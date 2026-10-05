/**
 * P0.VR.7R1 — Guided reconstruction flow + workflow sequence intelligence.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  resolveSiblingAssetSet,
  displayNameForCandidate,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr7r1/siblingAssetSetResolver.js';
import {
  analyzeWorkflowSequence,
  sequenceProgressLabel,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr7r1/workflowSequenceIntelligence.js';
import {
  proposeSiblingGeometryTransfer,
  DEFAULT_INNER_MEDIA_CROP,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr7r1/siblingGeometryTransfer.js';
import {
  recordApprovedCropPattern,
  proposeCropFromLearnedPattern,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr7r1/repeatedCropPatternIntelligence.js';
import { resetFounderWorkflowPatternsForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr7r1/founderWorkflowPatternStore.js';
import { resolveNextBestWorkflowAction } from '../shared/site00-studio-world-production/visualReconstruction/p0vr7r1/nextBestWorkflowAction.js';
import {
  buildGuidedReconstructionSequence,
  handleGuidedCropApproval,
  migrateJobToGuidedSequence,
  resumeGuidedSequence,
  reorderGuidedSequence,
  skipGuidedAsset,
  completeJobSummary,
  evaluateCropCheck,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr7r1/guidedReconstructionSequence.js';
import {
  buildSkinsMobileMultiAssetReconstructionJob,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/multiAssetReconstructionJob.js';
import {
  createInitialWorkflowState,
  approveCropAtIndex,
  resumeGuidedWorkflowState,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/reconstructionJobOrchestrator.js';
import { resetReconstructionWorkflowForTest } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/reconstructionWorkflowStore.js';
import { approveCropReview } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/founderCropIntelligence.js';

function buildJob() {
  const job = buildSkinsMobileMultiAssetReconstructionJob({
    liveColorSwatchBrands: ['FRONTAL_SLAYER', 'AIO', 'ASTRAL_WORLD', 'STUDIO_WORLD'],
  });
  if (!job) throw new Error('job missing');
  return job;
}

describe('P0.VR.7R1 guided reconstruction', () => {
  beforeEach(() => {
    resetFounderWorkflowPatternsForTest();
    resetReconstructionWorkflowForTest();
  });

  it('1. sibling asset-set detection — brand family row', () => {
    const job = buildJob();
    const resolution = resolveSiblingAssetSet({ candidates: job.candidateAssets });
    expect(resolution.setType).toBe('BRAND_FAMILY_VISUAL_ROW');
    expect(resolution.spatialPattern).toBe('HORIZONTAL_ROW_LEFT_TO_RIGHT');
    expect(resolution.orderedCandidateIds).toHaveLength(5);
  });

  it('2–4. row / column / grid ordering', () => {
    const job = buildJob();
    const intel = analyzeWorkflowSequence({
      jobId: job.jobId,
      jobType: 'multi-asset-reconstruction',
      sourceReferenceId: job.referenceId,
      candidates: job.candidateAssets,
    });
    expect(intel.orderedAssetIds[0]).toContain('NDXBOOK');
    expect(intel.orderedAssetIds[1]).toContain('FRONTAL_SLAYER');
    expect(intel.spatialPattern).toBe('HORIZONTAL_ROW_LEFT_TO_RIGHT');
    expect(intel.sequenceType).toBe('BRAND_FAMILY_VISUAL_ROW');
  });

  it('5. workflow intent inference', () => {
    const job = buildJob();
    const guided = buildGuidedReconstructionSequence({ job });
    expect(guided.intelligence.intentSummary.some((l) => l.includes('5 BRAND FAMILY'))).toBe(true);
    expect(guided.intelligence.intentSummary.some((l) => l.includes('LEFT TO RIGHT'))).toBe(true);
  });

  it('6–7. auto-advance after crop approval without generation', () => {
    const job = buildJob();
    let guided = buildGuidedReconstructionSequence({ job, autoAdvanceEnabled: true });
    const ndxIndex = job.candidateAssets.findIndex((c) => c.brandKey === 'NDXBOOK');
    const result = handleGuidedCropApproval({ job, candidateIndex: ndxIndex, guided });
    expect(result.autoAdvanced).toBe(true);
    expect(result.nextIndex).not.toBe(ndxIndex);
    expect(result.job.candidateAssets[ndxIndex]?.cropStatus).toBe('APPROVED');
    expect(result.job.jobStatus).toBe('CROP_REVIEW');
    expect(result.job.generationApprovalStatus.status).not.toBe('DISPATCHED');
    expect(result.transition?.nextAssetName).toBe('FRONTAL SLAYER');
  });

  it('8. auto-advance does not generate', () => {
    const job = buildJob();
    const guided = buildGuidedReconstructionSequence({ job });
    const ndxIndex = job.candidateAssets.findIndex((c) => c.brandKey === 'NDXBOOK');
    const result = handleGuidedCropApproval({ job, candidateIndex: ndxIndex, guided });
    expect(result.job.generationApprovalStatus.authorizedDispatchCount).toBe(0);
  });

  it('9–10. sibling geometry transfer is proposal only', () => {
    const proposal = proposeSiblingGeometryTransfer({
      sourceAssetId: 'a',
      targetAssetId: 'b',
      approvedSourceRegion: { x: 0.08, y: 0.1, width: 0.84, height: 0.68 },
      sharedStructure: true,
    });
    expect(proposal.requiresFounderReview).toBe(true);
    expect(proposal.proposedRegion.width).toBeCloseTo(0.84);
  });

  it('11–13. founder override reorder and skip', () => {
    const job = buildJob();
    const guided = buildGuidedReconstructionSequence({ job });
    const reversed = [...guided.intelligence.orderedAssetIds].reverse();
    const reordered = reorderGuidedSequence(guided, reversed);
    expect(reordered.intelligence.orderedAssetIds[0]).toBe(reversed[0]);
    const skipped = skipGuidedAsset(guided, guided.items[2]!.assetId);
    expect(skipped.items[2]?.status).toBe('SKIPPED');
  });

  it('14. resume next incomplete asset', () => {
    const job = buildJob();
    job.candidateAssets = job.candidateAssets.map((c, i) =>
      i < 2 ? { ...c, cropStatus: 'APPROVED' as const } : c,
    );
    const resume = resumeGuidedSequence({ job, guided: null });
    expect(resume.index).toBe(2);
    expect(resume.resumeHint).toContain('AIO');
  });

  it('15–16. generation plan transition after final crop', () => {
    let job = buildJob();
    let guided = buildGuidedReconstructionSequence({ job });
    for (let i = 0; i < job.candidateAssets.length; i++) {
      const r = handleGuidedCropApproval({ job, candidateIndex: i, guided });
      job = r.job;
      guided = r.guided;
    }
    expect(job.cropApprovalStatus.approved).toBe(5);
    expect(job.jobStatus).toBe('GENERATION_PLAN');
    expect(guided.founderStage).toBe('BUILD');
  });

  it('17. generation approval gate — next action requires founder', () => {
    const job = buildJob();
    job.jobStatus = 'GENERATION_PLAN';
    job.cropApprovalStatus = { approved: 5, total: 5, status: 'APPROVED' };
    const guided = buildGuidedReconstructionSequence({ job });
    const next = resolveNextBestWorkflowAction({ job, guided, activeCandidateIndex: 0 });
    expect(next.requiresFounder).toBe(true);
    expect(next.primaryCta).toContain('APPROVE GENERATION');
    expect(next.safeToAutoAdvance).toBe(false);
  });

  it('18–19. output review auto-advance + regeneration gate in UI copy', () => {
    const job = buildJob();
    job.jobStatus = 'OUTPUT_REVIEW';
    job.candidateAssets = job.candidateAssets.map((c, i) => ({
      ...c,
      generationStatus: 'COMPLETE' as const,
      approvalStatus: i === 0 ? ('PENDING' as const) : ('LOVE_IT' as const),
      output: { outputId: 'o', outputUrl: '/x.png', approvalStatus: 'PENDING' },
    }));
    const guided = buildGuidedReconstructionSequence({ job });
    const next = resolveNextBestWorkflowAction({ job, guided, activeCandidateIndex: 0 });
    expect(next.action).toBe('REVIEW_OUTPUT');
    expect(next.safeToAutoAdvance).toBe(true);
  });

  it('20. binding plan next action', () => {
    const job = buildJob();
    job.jobStatus = 'OUTPUT_REVIEW';
    job.candidateAssets = job.candidateAssets.map((c) => ({
      ...c,
      approvalStatus: 'LOVE_IT' as const,
      bindingStatus: 'UNBOUND' as const,
    }));
    job.bindingStatus = { bound: 0, total: 5, status: 'UNBOUND' };
    const guided = buildGuidedReconstructionSequence({ job });
    const next = resolveNextBestWorkflowAction({ job, guided, activeCandidateIndex: 0 });
    expect(next.primaryCta).toContain('REPLACE');
  });

  it('21. interrupted asset handling — NEEDS_ATTENTION status', () => {
    const job = buildJob();
    job.candidateAssets[2] = { ...job.candidateAssets[2]!, generationStatus: 'FAILED' };
    const guided = buildGuidedReconstructionSequence({ job });
    expect(guided.items[2]?.status).toBe('NEEDS_ATTENTION');
  });

  it('22. pattern learning proposes after threshold', () => {
    recordApprovedCropPattern({
      projectId: 'site00',
      jobType: 'multi-asset-reconstruction',
      assetSetType: 'BRAND_FAMILY_VISUAL_ROW',
      approvedRegion: DEFAULT_INNER_MEDIA_CROP,
      treatmentPattern: 'RECONSTRUCTION',
      backgroundPolicy: 'REMOVE',
    });
    recordApprovedCropPattern({
      projectId: 'site00',
      jobType: 'multi-asset-reconstruction',
      assetSetType: 'BRAND_FAMILY_VISUAL_ROW',
      approvedRegion: DEFAULT_INNER_MEDIA_CROP,
      treatmentPattern: 'RECONSTRUCTION',
      backgroundPolicy: 'REMOVE',
    });
    const learned = proposeCropFromLearnedPattern({
      projectId: 'site00',
      jobType: 'multi-asset-reconstruction',
      assetSetType: 'BRAND_FAMILY_VISUAL_ROW',
    });
    expect(learned.learned).toBe(true);
    expect(learned.summary).toContain('inner media');
  });

  it('23. migrate existing 5-asset job', () => {
    const job = buildJob();
    const guided = migrateJobToGuidedSequence(job);
    expect(guided.items).toHaveLength(5);
    expect(guided.intelligence.sequenceType).toBe('BRAND_FAMILY_VISUAL_ROW');
  });

  it('24. orchestrator integration — approve crop auto-advances index', () => {
    const state = createInitialWorkflowState();
    if (!state) throw new Error('no state');
    const ndxIndex = state.job.candidateAssets.findIndex((c) => c.brandKey === 'NDXBOOK');
    const review = {
      ...state.cropReviews[ndxIndex]!,
      assetIdentity: 'CONFIRMED' as const,
      reviewStatus: 'READY_FOR_APPROVAL' as const,
      preflight: {
        ...state.cropReviews[ndxIndex]!.preflight,
        blocksApproval: false,
        issues: state.cropReviews[ndxIndex]!.preflight.issues.filter((i) => i.severity !== 'BLOCK'),
      },
    };
    const ready = approveCropReview(review, 'founder', { overrideWarnings: true });
    expect(ready.allowed).toBe(true);
    const cropReviews = state.cropReviews.map((r, i) => (i === ndxIndex ? ready.review : r));
    const next = approveCropAtIndex({ ...state, cropReviews }, ndxIndex, { overrideWarnings: true });
    expect(next.activeCandidateIndex).not.toBe(ndxIndex);
    expect(next.guidedSequence.lastTransition?.nextAssetName).toBe('FRONTAL SLAYER');
  });

  it('25. resume workflow opens at next asset', () => {
    let state = createInitialWorkflowState();
    if (!state) throw new Error('no state');
    state = {
      ...state,
      job: {
        ...state.job,
        candidateAssets: state.job.candidateAssets.map((c, i) =>
          i < 2 ? { ...c, cropStatus: 'APPROVED' as const } : c,
        ),
        cropApprovalStatus: { approved: 2, total: 5, status: 'PARTIAL' },
      },
    };
    const resumed = resumeGuidedWorkflowState(state);
    expect(resumed.activeCandidateIndex).toBe(2);
    expect(resumed.workflowView).toBe('crop-review');
  });

  it('26. crop check grouping', () => {
    const job = buildJob();
    const c = job.candidateAssets[0]!;
    const check = evaluateCropCheck(c);
    expect(['NOT_READY', 'READY_WITH_WARNING', 'READY']).toContain(check.status);
  });

  it('27. complete job summary strings', () => {
    const job = buildJob();
    job.candidateAssets = job.candidateAssets.map((c) => ({
      ...c,
      cropStatus: 'APPROVED' as const,
      generationStatus: 'COMPLETE' as const,
      approvalStatus: 'LOVE_IT' as const,
      bindingStatus: 'BOUND' as const,
    }));
    job.jobStatus = 'COMPLETE';
    job.recomparisonStatus = 'COMPLETE';
    const lines = completeJobSummary(job);
    expect(lines.some((l) => l.includes('5 ASSETS FOUND'))).toBe(true);
    expect(lines.some((l) => l.includes('JOB COMPLETE'))).toBe(true);
  });

  it('28. display names for sequence strip', () => {
    const job = buildJob();
    expect(displayNameForCandidate(job.candidateAssets[0]!)).toBe('NDXBOOK');
  });

  it('29. sequence progress label', () => {
    const job = buildJob();
    const intel = analyzeWorkflowSequence({
      jobId: job.jobId,
      jobType: 'x',
      sourceReferenceId: job.referenceId,
      candidates: job.candidateAssets,
    });
    const label = sequenceProgressLabel({ intelligence: intel, candidates: job.candidateAssets });
    expect(label).toContain('CROPS APPROVED');
  });
});
