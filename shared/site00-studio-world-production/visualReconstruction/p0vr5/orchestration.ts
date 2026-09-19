/**
 * P0.VR.5 — Reconstruction orchestration (simulated dispatch; live path env-gated).
 */

import { canBeginGeneration } from './cropConfirmation.js';
import {
  attachReconstructedVersions,
  incrementJobDispatch,
  markJobStatus,
  touchPresetUsage,
} from './jobStore.js';
import { buildReplacementMappingFromJob } from './replacementMapping.js';
import {
  blockGenerationWithoutCropApproval,
  blockPartialMultiAssetRun,
  maxOnePrimaryDispatchPerAssetVersion,
  uploadNeverTriggersGeneration,
} from './spendGuard.js';
import type {
  AssetJob,
  BackgroundPolicy,
  DetectedAssetCandidate,
  ReconstructedAssetVersion,
} from './types.js';

export type ReconstructionOrchestrationResult = {
  ok: boolean;
  blocked: boolean;
  blocker?: string;
  versions: ReconstructedAssetVersion[];
  dispatchCount: number;
  job: AssetJob | null;
};

function versionId(candidateId: string): string {
  return `ver-${candidateId}-${Date.now()}`;
}

function simulateOutputUrl(job: AssetJob, candidate: DetectedAssetCandidate): string {
  const safeClass = candidate.classification.toLowerCase().replace(/_/g, '-');
  return `/design-assets/${job.projectId}/${job.pageId}/${safeClass}/${candidate.candidateId}/v001-sim.png`;
}

export function removeBackgroundIfNeeded(
  backgroundPolicy: BackgroundPolicy,
  outputUrl: string,
): { outputUrl: string; bgRemoved: boolean; provider: string | null } {
  if (backgroundPolicy === 'KEEP_BACKGROUND') {
    return { outputUrl, bgRemoved: false, provider: null };
  }
  if (backgroundPolicy === 'REMOVE_BACKGROUND') {
    return { outputUrl: outputUrl.replace('.png', '-transparent.png'), bgRemoved: true, provider: 'SIMULATED_BIREFNET' };
  }
  return { outputUrl, bgRemoved: false, provider: null };
}

export function reconstructConfirmedAssets(
  job: AssetJob,
  options?: {
    explicitFounderAction?: boolean;
    approvedSubset?: string[];
    simulate?: boolean;
  },
): ReconstructionOrchestrationResult {
  if (!options?.explicitFounderAction) {
    return {
      ok: false,
      blocked: true,
      blocker: 'EXPLICIT_FOUNDER_ACTION_REQUIRED',
      versions: [],
      dispatchCount: 0,
      job,
    };
  }

  if (uploadNeverTriggersGeneration() && blockGenerationWithoutCropApproval(job)) {
    return {
      ok: false,
      blocked: true,
      blocker: 'GENERATION_BLOCKED: CROP CONFIRMATION REQUIRED',
      versions: [],
      dispatchCount: 0,
      job,
    };
  }

  const partial = blockPartialMultiAssetRun(job, options.approvedSubset);
  if (partial.blocked) {
    return {
      ok: false,
      blocked: true,
      blocker: partial.reason,
      versions: [],
      dispatchCount: 0,
      job,
    };
  }

  const gate = canBeginGeneration(job);
  if (!gate.allowed) {
    return {
      ok: false,
      blocked: true,
      blocker: gate.blocker,
      versions: [],
      dispatchCount: 0,
      job,
    };
  }

  let candidates = job.detectedRegions.filter((r) => r.founderDecision === 'CONFIRMED');
  if (options.approvedSubset?.length) {
    const allowed = new Set(options.approvedSubset);
    candidates = candidates.filter((r) => allowed.has(r.candidateId));
  }

  const versions: ReconstructedAssetVersion[] = [];
  let dispatchCount = 0;

  for (const candidate of candidates) {
    const existing = job.reconstructedVersions.find((v) => v.candidateId === candidate.candidateId);
    const priorDispatch = existing?.dispatchCount ?? 0;
    if (!maxOnePrimaryDispatchPerAssetVersion(priorDispatch)) {
      incrementJobDispatch(job.jobId, true);
      continue;
    }

    const rawUrl = simulateOutputUrl(job, candidate);
    const bg = removeBackgroundIfNeeded(job.backgroundPolicy, rawUrl);
    const version: ReconstructedAssetVersion = {
      versionId: versionId(candidate.candidateId),
      candidateId: candidate.candidateId,
      provider: options.simulate !== false ? 'SIMULATED_GPT_IMAGE_2_EDIT' : 'GPT_IMAGE_2_EDIT',
      backgroundPolicy: job.backgroundPolicy,
      outputUrl: bg.outputUrl,
      approvalState: 'PENDING',
      uploadState: 'PENDING',
      bindState: job.replacementMapping ? 'PENDING' : 'SKIPPED',
      dispatchCount: priorDispatch + 1,
      createdAt: new Date().toISOString(),
    };
    versions.push(version);
    dispatchCount += 1;
    incrementJobDispatch(job.jobId, false);
  }

  attachReconstructedVersions(job.jobId, [...job.reconstructedVersions, ...versions]);
  markJobStatus(job.jobId, 'OUTPUT_REVIEW', 'APPROVE');
  touchPresetUsage(job.jobId);

  const mapping = buildReplacementMappingFromJob(job);
  if (mapping) job.replacementMapping = mapping;

  return {
    ok: versions.length > 0,
    blocked: versions.length === 0,
    blocker: versions.length === 0 ? 'NO_DISPATCH_EXECUTED' : undefined,
    versions,
    dispatchCount,
    job: { ...job, reconstructedVersions: [...job.reconstructedVersions, ...versions], replacementMapping: mapping ?? job.replacementMapping },
  };
}

export function approveReconstructedVersion(
  job: AssetJob,
  versionId: string,
  approved: boolean,
): ReconstructedAssetVersion | null {
  const version = job.reconstructedVersions.find((v) => v.versionId === versionId);
  if (!version) return null;
  version.approvalState = approved ? 'APPROVED' : 'REJECTED';
  return version;
}

export function uploadReconstructedAssets(
  job: AssetJob,
  versionIds: string[],
): { uploaded: ReconstructedAssetVersion[]; job: AssetJob } {
  const uploaded: ReconstructedAssetVersion[] = [];
  for (const vid of versionIds) {
    const version = job.reconstructedVersions.find((v) => v.versionId === vid && v.approvalState === 'APPROVED');
    if (!version?.outputUrl) continue;
    version.uploadState = 'UPLOADED';
    uploaded.push(version);
  }
  if (uploaded.length) markJobStatus(job.jobId, 'UPLOADING', 'REPLACE');
  return { uploaded, job };
}

export function bindReconstructedAssets(
  job: AssetJob,
  versionIds: string[],
): { bound: number; job: AssetJob } {
  let bound = 0;
  for (const vid of versionIds) {
    const version = job.reconstructedVersions.find((v) => v.versionId === vid && v.uploadState === 'UPLOADED');
    if (!version) continue;
    version.bindState = 'BOUND';
    bound += 1;
  }
  if (bound > 0) markJobStatus(job.jobId, 'COMPLETED', 'REPLACE');
  return { bound, job };
}

export function cachePreviousAttempt(
  job: AssetJob,
  candidateId: string,
): ReconstructedAssetVersion | null {
  return job.reconstructedVersions.find((v) => v.candidateId === candidateId) ?? null;
}
