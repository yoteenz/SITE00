/**
 * P0.VR.7R1 — Guided reconstruction sequence orchestration.
 */

import type { ReferenceAssetCandidate } from '../referenceReconstructionIntelligence/referenceAssetMismatch.js';
import type { ReferenceMultiAssetReconstructionJob } from '../referenceReconstructionIntelligence/multiAssetReconstructionJob.js';
import { evaluateCropApprovalGate } from '../referenceReconstructionIntelligence/reconstructionApprovals.js';
import { displayNameForCandidate, resolveSiblingAssetSet } from './siblingAssetSetResolver.js';
import { analyzeWorkflowSequence } from './workflowSequenceIntelligence.js';
import { proposeSiblingGeometryTransfer, applyGeometryProposalToCrop } from './siblingGeometryTransfer.js';
import { recordApprovedCropPattern, proposeCropFromLearnedPattern } from './repeatedCropPatternIntelligence.js';
import type {
  CropCheckResult,
  GuidedFounderStage,
  GuidedReconstructionSequence,
  GuidedSequenceItem,
  GuidedTransitionFeedback,
  NormalizedCropRegion,
} from './types.js';

const STAGE_MAP: Record<GuidedFounderStage, string> = {
  SOURCE: 'upload-detect',
  FRAME: 'crop-review',
  BUILD: 'generation-plan',
  REVIEW: 'output-review',
  REPLACE: 'binding-live-qa',
};

function regionFromCandidate(c: ReferenceAssetCandidate): NormalizedCropRegion {
  return { ...c.sourceCrop.sourceRegion };
}

function statusForCandidate(c: ReferenceAssetCandidate, isCurrent: boolean): GuidedSequenceItem['status'] {
  if (c.cropStatus === 'APPROVED' && c.approvalStatus === 'LOVE_IT') return 'COMPLETE';
  if (c.generationStatus === 'FAILED' || c.cropStatus === 'REJECTED') return 'NEEDS_ATTENTION';
  if (isCurrent) return 'CURRENT';
  if (c.cropStatus === 'APPROVED') return 'COMPLETE';
  return 'UPCOMING';
}

export function evaluateCropCheck(candidate: ReferenceAssetCandidate): CropCheckResult {
  const items: CropCheckResult['items'] = [];
  if (candidate.sourceCrop.uiContaminationSuspected) {
    items.push({ code: 'UI_CONTAMINATION', label: 'ADJACENT CARD / UI CHROME', severity: 'warning' });
  }
  if (candidate.mismatchType === 'ASSET_MISMATCH') {
    items.push({ code: 'PARTIAL_COVERAGE', label: 'PARTIAL COVERAGE', severity: 'warning' });
  }
  if (candidate.treatmentPlan.reconstructionRequired) {
    items.push({ code: 'RECONSTRUCTION', label: 'INNER MEDIA REGION', severity: 'warning' });
  }
  const hasBlocker = items.some((i) => i.severity === 'blocker');
  const status = hasBlocker ? 'NOT_READY' : items.length > 0 ? 'READY_WITH_WARNING' : 'READY';
  return { status, items };
}

function buildSequenceItems(
  job: ReferenceMultiAssetReconstructionJob,
  orderedIds: string[],
  currentIndex: number,
): GuidedSequenceItem[] {
  return orderedIds.map((id, orderIndex) => {
    const c = job.candidateAssets.find((x) => x.candidateId === id)!;
    return {
      assetId: id,
      candidateId: id,
      displayName: displayNameForCandidate(c),
      thumbnailUrl: c.sourceCrop.sourceCropUrl,
      orderIndex,
      status: statusForCandidate(c, orderIndex === currentIndex),
      cropRegion: regionFromCandidate(c),
      cropProposalSource: 'DETECTION',
      cropProposalApproved: c.cropStatus === 'APPROVED',
    };
  });
}

export function buildGuidedReconstructionSequence(input: {
  job: ReferenceMultiAssetReconstructionJob;
  founderInstruction?: string | null;
  autoAdvanceEnabled?: boolean;
  activeCandidateIndex?: number;
}): GuidedReconstructionSequence {
  const intelligence = analyzeWorkflowSequence({
    jobId: input.job.jobId,
    jobType: 'multi-asset-reconstruction',
    sourceReferenceId: input.job.referenceId,
    founderInstruction: input.founderInstruction,
    candidates: input.job.candidateAssets,
    autoAdvanceEnabled: input.autoAdvanceEnabled ?? true,
  });

  const currentIndex = input.activeCandidateIndex ?? intelligence.currentIndex;
  const founderStage: GuidedFounderStage =
    input.job.jobStatus === 'GENERATION_PLAN' || input.job.jobStatus === 'GENERATION'
      ? 'BUILD'
      : input.job.jobStatus === 'OUTPUT_REVIEW'
        ? 'REVIEW'
        : input.job.jobStatus === 'BINDING' || input.job.jobStatus === 'RECOMPARISON'
          ? 'REPLACE'
          : 'FRAME';

  const items = buildSequenceItems(input.job, intelligence.orderedAssetIds, currentIndex);
  const cropChecksByAssetId = Object.fromEntries(
    input.job.candidateAssets.map((c) => [c.candidateId, evaluateCropCheck(c)]),
  );

  const approved = input.job.cropApprovalStatus.approved;
  const total = input.job.candidateAssets.length;
  const nextItem = items[currentIndex];

  return {
    sequenceId: intelligence.sequenceId,
    jobId: input.job.jobId,
    founderStage,
    workflowStageMap: STAGE_MAP,
    intelligence,
    items,
    currentIndex,
    autoAdvanceEnabled: input.autoAdvanceEnabled ?? true,
    lastTransition: null,
    cropChecksByAssetId,
    generationPlanReady: approved >= total,
    bindingPlanReady: input.job.bindingStatus.bound > 0,
    liveQaReady: input.job.recomparisonStatus === 'PENDING',
    jobComplete: input.job.jobStatus === 'COMPLETE',
    resumeHint:
      approved < total
        ? `CONTINUE RECONSTRUCTION · ${approved} OF ${total} CROPS APPROVED · NEXT: ${nextItem?.displayName ?? 'ASSET'}`
        : input.job.jobStatus === 'GENERATION_PLAN'
          ? 'REVIEW GENERATION PLAN'
          : null,
  };
}

export function migrateJobToGuidedSequence(
  job: ReferenceMultiAssetReconstructionJob,
  state?: { activeCandidateIndex?: number; autoAdvanceEnabled?: boolean; founderInstruction?: string | null },
): GuidedReconstructionSequence {
  return buildGuidedReconstructionSequence({
    job,
    founderInstruction: state?.founderInstruction,
    autoAdvanceEnabled: state?.autoAdvanceEnabled ?? true,
    activeCandidateIndex: state?.activeCandidateIndex,
  });
}

export function applySiblingCropProposalToCandidate(
  candidate: ReferenceAssetCandidate,
  region: NormalizedCropRegion,
): ReferenceAssetCandidate {
  return {
    ...candidate,
    sourceCrop: {
      ...candidate.sourceCrop,
      sourceRegion: region,
    },
    cropStatus: 'PREPARED',
  };
}

export function proposeCropForSiblingIndex(input: {
  job: ReferenceMultiAssetReconstructionJob;
  targetIndex: number;
  previousApprovedIndex: number | null;
}): ReferenceAssetCandidate {
  const resolution = resolveSiblingAssetSet({ candidates: input.job.candidateAssets });
  const orderedIds = resolution.orderedCandidateIds;
  const targetId = orderedIds[input.targetIndex];
  const target = input.job.candidateAssets.find((c) => c.candidateId === targetId)!;

  if (input.previousApprovedIndex == null || input.previousApprovedIndex < 0) {
    const learned = proposeCropFromLearnedPattern({
      projectId: input.job.projectId,
      jobType: 'multi-asset-reconstruction',
      assetSetType: resolution.setType,
    });
    return applySiblingCropProposalToCandidate(target, learned.region);
  }

  const prevId = orderedIds[input.previousApprovedIndex];
  const prev = input.job.candidateAssets.find((c) => c.candidateId === prevId)!;
  const proposal = proposeSiblingGeometryTransfer({
    sourceAssetId: prev.candidateId,
    targetAssetId: target.candidateId,
    approvedSourceRegion: regionFromCandidate(prev),
    sharedStructure: resolution.setType === 'BRAND_FAMILY_VISUAL_ROW',
  });

  return applySiblingCropProposalToCandidate(
    target,
    applyGeometryProposalToCrop(regionFromCandidate(target), proposal),
  );
}

export function handleGuidedCropApproval(input: {
  job: ReferenceMultiAssetReconstructionJob;
  candidateIndex: number;
  guided: GuidedReconstructionSequence;
}): {
  job: ReferenceMultiAssetReconstructionJob;
  guided: GuidedReconstructionSequence;
  nextIndex: number;
  transition: GuidedTransitionFeedback | null;
  autoAdvanced: boolean;
} {
  const candidates = input.job.candidateAssets.map((c, i) =>
    i === input.candidateIndex ? { ...c, cropStatus: 'APPROVED' as const } : c,
  );

  const approvedCandidate = candidates[input.candidateIndex]!;
  recordApprovedCropPattern({
    projectId: input.job.projectId,
    jobType: 'multi-asset-reconstruction',
    assetSetType: input.guided.intelligence.sequenceType,
    approvedRegion: regionFromCandidate(approvedCandidate),
    treatmentPattern: approvedCandidate.treatmentPlan.reconstructionRequired ? 'RECONSTRUCTION' : 'DIRECT',
    backgroundPolicy: approvedCandidate.treatmentPlan.backgroundPolicy,
  });

  const cropGate = evaluateCropApprovalGate(candidates);
  let job: ReferenceMultiAssetReconstructionJob = {
    ...input.job,
    candidateAssets: candidates,
    cropApprovalStatus: cropGate.state,
    jobStatus: cropGate.state.approved === cropGate.state.total ? 'GENERATION_PLAN' : 'CROP_REVIEW',
  };

  const orderedIds = input.guided.intelligence.orderedAssetIds;
  const approvedName = displayNameForCandidate(approvedCandidate);
  let nextIndex = input.candidateIndex;
  let transition: GuidedTransitionFeedback | null = null;
  let autoAdvanced = false;

  const allCropsDone = cropGate.state.approved === cropGate.state.total;

  if (allCropsDone) {
    transition = {
      completedAssetName: approvedName,
      completedLabel: 'CROP APPROVED ✓',
      nextAssetName: null,
      nextStage: 'BUILD',
    };
    const guided = buildGuidedReconstructionSequence({
      job,
      autoAdvanceEnabled: input.guided.autoAdvanceEnabled,
      activeCandidateIndex: input.candidateIndex,
    });
    return {
      job,
      guided: { ...guided, lastTransition: transition, founderStage: 'BUILD' },
      nextIndex,
      transition,
      autoAdvanced: true,
    };
  }

  if (input.guided.autoAdvanceEnabled && input.guided.intelligence.autoAdvanceAllowed) {
    const currentOrderIndex = orderedIds.indexOf(approvedCandidate.candidateId);
    const nextOrderIndex = currentOrderIndex + 1;
    if (nextOrderIndex < orderedIds.length) {
      nextIndex = job.candidateAssets.findIndex((c) => c.candidateId === orderedIds[nextOrderIndex]);
      const nextCandidate = proposeCropForSiblingIndex({
        job,
        targetIndex: nextOrderIndex,
        previousApprovedIndex: currentOrderIndex,
      });
      job = {
        ...job,
        candidateAssets: job.candidateAssets.map((c) => (c.candidateId === nextCandidate.candidateId ? nextCandidate : c)),
      };
      const nextName = displayNameForCandidate(nextCandidate);
      transition = {
        completedAssetName: approvedName,
        completedLabel: 'CROP APPROVED ✓',
        nextAssetName: nextName,
        nextStage: 'FRAME',
      };
      autoAdvanced = true;
    }
  }

  const guided = buildGuidedReconstructionSequence({
    job,
    autoAdvanceEnabled: input.guided.autoAdvanceEnabled,
    activeCandidateIndex: nextIndex,
  });

  return {
    job,
    guided: { ...guided, lastTransition: transition },
    nextIndex,
    transition,
    autoAdvanced,
  };
}

export function resumeGuidedSequence(input: {
  job: ReferenceMultiAssetReconstructionJob;
  guided: GuidedReconstructionSequence | null;
}): { index: number; stage: GuidedFounderStage; resumeHint: string } {
  const guided =
    input.guided ??
    buildGuidedReconstructionSequence({ job: input.job, autoAdvanceEnabled: true });

  const orderedIds = guided.intelligence.orderedAssetIds;
  const firstIncomplete = orderedIds.findIndex((id) => {
    const c = input.job.candidateAssets.find((x) => x.candidateId === id);
    return c && c.cropStatus !== 'APPROVED';
  });

  if (firstIncomplete >= 0) {
    const index = input.job.candidateAssets.findIndex((c) => c.candidateId === orderedIds[firstIncomplete]);
    const name = displayNameForCandidate(input.job.candidateAssets[index]!);
    return {
      index,
      stage: 'FRAME',
      resumeHint: `CONTINUE RECONSTRUCTION · NEXT: ${name}`,
    };
  }

  if (input.job.jobStatus === 'GENERATION_PLAN') {
    return { index: 0, stage: 'BUILD', resumeHint: 'REVIEW GENERATION PLAN' };
  }

  if (input.job.jobStatus === 'OUTPUT_REVIEW') {
    const idx = input.job.candidateAssets.findIndex((c) => c.approvalStatus === 'PENDING');
    return { index: Math.max(0, idx), stage: 'REVIEW', resumeHint: 'REVIEW OUTPUTS' };
  }

  return { index: guided.currentIndex, stage: guided.founderStage, resumeHint: guided.resumeHint ?? 'CONTINUE' };
}

export function reorderGuidedSequence(
  guided: GuidedReconstructionSequence,
  newOrderedAssetIds: string[],
): GuidedReconstructionSequence {
  return {
    ...guided,
    intelligence: {
      ...guided.intelligence,
      orderedAssetIds: newOrderedAssetIds,
      orderAmbiguous: false,
    },
    items: newOrderedAssetIds.map((id, orderIndex) => {
      const existing = guided.items.find((i) => i.assetId === id)!;
      return { ...existing, orderIndex, status: orderIndex === guided.currentIndex ? 'CURRENT' : existing.status };
    }),
  };
}

export function skipGuidedAsset(
  guided: GuidedReconstructionSequence,
  assetId: string,
): GuidedReconstructionSequence {
  return {
    ...guided,
    items: guided.items.map((item) =>
      item.assetId === assetId ? { ...item, status: 'SKIPPED' } : item,
    ),
  };
}

export function completeJobSummary(job: ReferenceMultiAssetReconstructionJob): string[] {
  const total = job.candidateAssets.length;
  const crops = job.cropApprovalStatus.approved;
  const built = job.candidateAssets.filter((c) => c.generationStatus === 'COMPLETE').length;
  const outputs = job.candidateAssets.filter((c) => c.approvalStatus === 'LOVE_IT').length;
  const bound = job.bindingStatus.bound;
  return [
    `${total} ASSETS FOUND`,
    `${crops} CROPS APPROVED`,
    `${built} ASSETS BUILT`,
    `${outputs} OUTPUTS APPROVED`,
    `${bound} LIVE REPLACEMENTS`,
    job.recomparisonStatus === 'COMPLETE' ? 'LIVE QA PASSED' : 'LIVE QA PENDING',
    job.jobStatus === 'COMPLETE' ? 'JOB COMPLETE' : '',
  ].filter(Boolean);
}
