/**
 * P0.VR.7R1 — Smart next-action resolver for guided reconstruction.
 */

import type { ReferenceAssetCandidate } from '../referenceReconstructionIntelligence/referenceAssetMismatch.js';
import type { ReferenceMultiAssetReconstructionJob } from '../referenceReconstructionIntelligence/multiAssetReconstructionJob.js';
import type { GuidedFounderStage, GuidedReconstructionSequence, NextBestWorkflowAction } from './types.js';
function stageForJobStatus(job: ReferenceMultiAssetReconstructionJob): GuidedFounderStage {
  switch (job.jobStatus) {
    case 'DISCOVERY':
    case 'CROP_REVIEW':
      return 'FRAME';
    case 'GENERATION_PLAN':
      return 'BUILD';
    case 'GENERATION':
      return 'BUILD';
    case 'OUTPUT_REVIEW':
      return 'REVIEW';
    case 'BINDING':
    case 'RECOMPARISON':
      return 'REPLACE';
    case 'COMPLETE':
      return 'REPLACE';
    default:
      return 'FRAME';
  }
}

export function resolveNextBestWorkflowAction(input: {
  job: ReferenceMultiAssetReconstructionJob;
  guided: GuidedReconstructionSequence | null;
  activeCandidateIndex: number;
}): NextBestWorkflowAction {
  const { job, guided, activeCandidateIndex } = input;
  const stage = guided?.founderStage ?? stageForJobStatus(job);
  const active = job.candidateAssets[activeCandidateIndex] ?? null;
  const total = job.candidateAssets.length;

  if (job.jobStatus === 'CROP_REVIEW' || stage === 'FRAME') {
    const needsCrop = active && active.cropStatus !== 'APPROVED';
    return {
      action: needsCrop ? `REVIEW_${active!.brandKey}_CROP` : 'REVIEW_NEXT_ASSET',
      reason: needsCrop ? 'Crop awaiting founder approval' : 'Advance to next asset in sequence',
      targetAssetId: active?.candidateId ?? null,
      targetStage: 'FRAME',
      primaryCta: needsCrop ? 'APPROVE CROP' : 'REVIEW NEXT ASSET',
      requiresFounder: true,
      safeToAutoAdvance: Boolean(guided?.autoAdvanceEnabled && guided.intelligence.autoAdvanceAllowed && !needsCrop),
    };
  }

  if (job.jobStatus === 'GENERATION_PLAN') {
    return {
      action: 'REVIEW_GENERATION_PLAN',
      reason: `${total} crops approved — review generation plan before dispatch`,
      targetAssetId: null,
      targetStage: 'BUILD',
      primaryCta: `APPROVE GENERATION FOR ${total} ASSETS`,
      requiresFounder: true,
      safeToAutoAdvance: false,
    };
  }

  if (job.jobStatus === 'GENERATION') {
    return {
      action: 'MONITOR_GENERATION',
      reason: 'Generation executing — wait for outputs',
      targetAssetId: active?.candidateId ?? null,
      targetStage: 'BUILD',
      primaryCta: 'VIEW BUILD PROGRESS',
      requiresFounder: false,
      safeToAutoAdvance: true,
    };
  }

  const pendingOutputs = job.candidateAssets.filter(
    (c: ReferenceAssetCandidate) => c.generationStatus === 'COMPLETE' && c.approvalStatus === 'PENDING',
  );
  if (job.jobStatus === 'OUTPUT_REVIEW' && pendingOutputs.length > 0) {
    const next = pendingOutputs[0]!;
    return {
      action: 'REVIEW_OUTPUT',
      reason: 'Output ready for founder review',
      targetAssetId: next.candidateId,
      targetStage: 'REVIEW',
      primaryCta: 'LOVE IT / APPROVE',
      requiresFounder: true,
      safeToAutoAdvance: true,
    };
  }

  if (job.jobStatus === 'BINDING' || job.bindingStatus.status !== 'COMPLETE') {
    return {
      action: 'REPLACE_APPROVED_ASSETS',
      reason: 'Outputs approved — replace live assets',
      targetAssetId: null,
      targetStage: 'REPLACE',
      primaryCta: `REPLACE ${job.bindingStatus.total} ASSETS`,
      requiresFounder: true,
      safeToAutoAdvance: false,
    };
  }

  if (job.jobStatus === 'RECOMPARISON') {
    return {
      action: 'RUN_LIVE_QA',
      reason: 'Bindings complete — verify live implementation',
      targetAssetId: null,
      targetStage: 'REPLACE',
      primaryCta: 'RUN LIVE QA',
      requiresFounder: true,
      safeToAutoAdvance: false,
    };
  }

  return {
    action: 'COMPLETE_JOB',
    reason: 'All stages complete',
    targetAssetId: null,
    targetStage: 'REPLACE',
    primaryCta: 'COMPLETE JOB',
    requiresFounder: false,
    safeToAutoAdvance: false,
  };
}
