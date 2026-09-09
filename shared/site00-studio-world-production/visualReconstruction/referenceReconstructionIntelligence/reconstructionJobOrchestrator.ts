/**
 * Job orchestrator — approvals resume pipeline automatically.
 * P0.VR.6R7
 */

import type { WorkflowView } from './founderAction.js';
import { syncFounderActionsFromJob, resolveFounderActionsByGate } from './founderActionRouter.js';
import type { DesignFounderAction } from './founderAction.js';
import {
  approveGeneration,
  buildMultiAssetReconstructionPlan,
  buildSkinsMobileMultiAssetReconstructionJob,
  type ReferenceMultiAssetReconstructionJob,
} from './multiAssetReconstructionJob.js';
import {
  initializeSubJobs,
  updateSubJobsFromJobState,
  type ReferenceReconstructionSubJobs,
} from './referenceReconstructionSubJobs.js';
import { evaluateCropApprovalGate } from './reconstructionApprovals.js';
import {
  approveCropReview,
  approveAllValidCrops,
  initializeCropReviewsForJob,
  type CropReviewState,
} from './founderCropIntelligence/index.js';

export type ReconstructionWorkflowState = {
  job: ReferenceMultiAssetReconstructionJob;
  actions: DesignFounderAction[];
  subJobs: ReferenceReconstructionSubJobs;
  workflowView: WorkflowView;
  activeCandidateIndex: number;
  generationExecuting: boolean;
  cropReviews: CropReviewState[];
};

export function createInitialWorkflowState(): ReconstructionWorkflowState | null {
  const job = buildSkinsMobileMultiAssetReconstructionJob({
    liveColorSwatchBrands: ['FRONTAL_SLAYER', 'AIO', 'ASTRAL_WORLD', 'STUDIO_WORLD'],
  });
  if (!job) return null;

  const subJobs = initializeSubJobs({ cropApprovalPending: true, generationBlocked: true });
  const cropReviews = initializeCropReviewsForJob(job.candidateAssets);
  const actions = syncFounderActionsFromJob(job, cropReviews);

  return {
    job,
    actions,
    subJobs,
    workflowView: null,
    activeCandidateIndex: 0,
    generationExecuting: false,
    cropReviews,
  };
}

export function openWorkflowView(state: ReconstructionWorkflowState, view: WorkflowView): ReconstructionWorkflowState {
  return { ...state, workflowView: view };
}

export function approveCropAtIndex(state: ReconstructionWorkflowState, index: number): ReconstructionWorkflowState {
  const review = state.cropReviews[index];
  if (!review) return state;
  const approval = approveCropReview(review);
  if (!approval.allowed) return state;

  const cropReviews = state.cropReviews.map((r, i) => (i === index ? approval.review : r));
  const candidates = state.job.candidateAssets.map((c, i) =>
    i === index ? { ...c, cropStatus: 'APPROVED' as const } : c,
  );
  const cropGate = evaluateCropApprovalGate(candidates);
  let job: ReferenceMultiAssetReconstructionJob = {
    ...state.job,
    candidateAssets: candidates,
    cropApprovalStatus: cropGate.state,
    jobStatus: cropGate.state.approved === cropGate.state.total ? 'GENERATION_PLAN' : 'CROP_REVIEW',
  };

  let actions = syncFounderActionsFromJob(job, cropReviews);
  let workflowView: WorkflowView = state.workflowView;

  if (cropGate.state.approved === cropGate.state.total) {
    actions = resolveFounderActionsByGate(actions, job.jobId, 'REVIEW_CROPS');
    workflowView = 'generation-plan';
    actions = syncFounderActionsFromJob(job, cropReviews);
  }

  const subJobs = updateSubJobsFromJobState({
    subJobs: state.subJobs,
    cropsApproved: cropGate.state.approved,
    cropsTotal: cropGate.state.total,
    generationApproved: false,
    generationComplete: false,
    outputsPendingReview: 0,
  });

  return { ...state, job, actions, subJobs, workflowView, cropReviews, activeCandidateIndex: Math.min(index + 1, candidates.length - 1) };
}

export function updateCropReviewAtIndex(
  state: ReconstructionWorkflowState,
  index: number,
  review: CropReviewState,
): ReconstructionWorkflowState {
  const cropReviews = state.cropReviews.map((r, i) => (i === index ? review : r));
  const actions = syncFounderActionsFromJob(state.job, cropReviews);
  return { ...state, cropReviews, actions };
}

export function approveAllCropsInWorkflow(state: ReconstructionWorkflowState): ReconstructionWorkflowState {
  const batch = approveAllValidCrops(state.cropReviews);
  const approvedIds = new Set(batch.approved.map((r) => r.candidateId));
  const cropReviews = state.cropReviews.map((r) => batch.approved.find((a) => a.candidateId === r.candidateId) ?? r);
  const candidates = state.job.candidateAssets.map((c) =>
    approvedIds.has(c.candidateId) ? { ...c, cropStatus: 'APPROVED' as const } : c,
  );
  let job: ReferenceMultiAssetReconstructionJob = {
    ...state.job,
    candidateAssets: candidates,
    cropApprovalStatus: evaluateCropApprovalGate(candidates).state,
    jobStatus: evaluateCropApprovalGate(candidates).state.approved === candidates.length ? 'GENERATION_PLAN' : 'CROP_REVIEW',
  };
  let actions = resolveFounderActionsByGate(state.actions, job.jobId, 'REVIEW_CROPS');
  actions = syncFounderActionsFromJob(job, cropReviews);
  const subJobs = updateSubJobsFromJobState({
    subJobs: state.subJobs,
    cropsApproved: job.cropApprovalStatus.approved,
    cropsTotal: job.cropApprovalStatus.total,
    generationApproved: false,
    generationComplete: false,
    outputsPendingReview: 0,
  });
  const workflowView: WorkflowView =
    job.cropApprovalStatus.approved === job.cropApprovalStatus.total ? 'generation-plan' : state.workflowView;
  return {
    ...state,
    job,
    actions,
    subJobs,
    cropReviews,
    workflowView,
  };
}

export function approveGenerationInWorkflow(state: ReconstructionWorkflowState): ReconstructionWorkflowState {
  const plan = buildMultiAssetReconstructionPlan(state.job);
  const { job } = approveGeneration(state.job, plan.totalDispatches);
  let actions = resolveFounderActionsByGate(state.actions, job.jobId, 'APPROVE_GENERATION');
  actions = syncFounderActionsFromJob(job, state.cropReviews);
  const subJobs = updateSubJobsFromJobState({
    subJobs: state.subJobs,
    cropsApproved: job.cropApprovalStatus.approved,
    cropsTotal: job.cropApprovalStatus.total,
    generationApproved: true,
    generationComplete: false,
    outputsPendingReview: 0,
  });
  return {
    ...state,
    job,
    actions,
    subJobs,
    workflowView: 'generation-executing',
    generationExecuting: true,
  };
}

export function markCandidateGenerationComplete(
  state: ReconstructionWorkflowState,
  candidateIndex: number,
  outputUrl: string | null,
): ReconstructionWorkflowState {
  const candidates = state.job.candidateAssets.map((c, i) =>
    i === candidateIndex
      ? {
          ...c,
          generationStatus: 'COMPLETE' as const,
          output: outputUrl ? { outputId: `out-${c.candidateId}`, outputUrl, approvalStatus: 'PENDING' } : c.output,
        }
      : c,
  );
  const completeCount = candidates.filter((c) => c.generationStatus === 'COMPLETE').length;
  const job: ReferenceMultiAssetReconstructionJob = {
    ...state.job,
    candidateAssets: candidates,
    generationApprovalStatus: {
      ...state.job.generationApprovalStatus,
      dispatchesUsed: completeCount,
      status: completeCount >= candidates.length ? 'COMPLETE' : 'DISPATCHED',
    },
    jobStatus: completeCount >= candidates.length ? 'OUTPUT_REVIEW' : 'GENERATION',
  };
  const outputsPending = candidates.filter((c) => c.generationStatus === 'COMPLETE' && c.approvalStatus === 'PENDING').length;
  const subJobs = updateSubJobsFromJobState({
    subJobs: state.subJobs,
    cropsApproved: job.cropApprovalStatus.approved,
    cropsTotal: job.cropApprovalStatus.total,
    generationApproved: true,
    generationComplete: completeCount >= candidates.length,
    outputsPendingReview: outputsPending,
  });
  const actions = syncFounderActionsFromJob(job, state.cropReviews);
  const workflowView: WorkflowView =
    completeCount >= candidates.length ? 'output-review' : state.workflowView;
  return {
    ...state,
    job,
    actions,
    subJobs,
    workflowView,
    generationExecuting: completeCount < candidates.length,
  };
}

export function approveOutputAtIndex(state: ReconstructionWorkflowState, index: number): ReconstructionWorkflowState {
  const candidates = state.job.candidateAssets.map((c, i) =>
    i === index ? { ...c, approvalStatus: 'LOVE_IT' as const, bindingStatus: 'BOUND' as const } : c,
  );
  const bound = candidates.filter((c) => c.bindingStatus === 'BOUND').length;
  const job: ReferenceMultiAssetReconstructionJob = {
    ...state.job,
    candidateAssets: candidates,
    bindingStatus: { bound, total: candidates.length, status: bound >= candidates.length ? 'COMPLETE' : 'PARTIAL' },
    jobStatus: bound >= candidates.length ? 'RECOMPARISON' : 'OUTPUT_REVIEW',
    recomparisonStatus: bound >= candidates.length ? 'PENDING' : 'NOT_RUN',
  };
  const actions = syncFounderActionsFromJob(job, state.cropReviews);
  const subJobs = updateSubJobsFromJobState({
    subJobs: state.subJobs,
    cropsApproved: job.cropApprovalStatus.approved,
    cropsTotal: job.cropApprovalStatus.total,
    generationApproved: true,
    generationComplete: true,
    outputsPendingReview: candidates.filter((c) => c.approvalStatus === 'PENDING').length,
  });
  return { ...state, job, actions, subJobs };
}

export function closeWorkflowView(state: ReconstructionWorkflowState): ReconstructionWorkflowState {
  return { ...state, workflowView: null };
}
