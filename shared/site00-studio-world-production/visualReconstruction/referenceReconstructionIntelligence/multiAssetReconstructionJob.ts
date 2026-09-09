/**
 * Multi-asset reconstruction job orchestration.
 * P0.VR.6R6
 */

import { SKINS_REFERENCE_MOBILE } from '../p0vr6/skinsReferenceFidelity.js';
import { getSkinsDesignAuthority } from '../p0vr6/skinsAuthorityRegistry.js';
import {
  buildReferenceLiveVisualInventory,
  discoverAssetMismatchCandidates,
  detectIncompleteMultiAssetDiscovery,
  type ReferenceAssetCandidate,
} from './referenceAssetMismatch.js';
import {
  evaluateCropApprovalGate,
  evaluateGenerationApprovalGate,
  type CropApprovalState,
  type GenerationApprovalState,
} from './reconstructionApprovals.js';

export type MultiAssetJobStatus =
  | 'DISCOVERY'
  | 'CROP_REVIEW'
  | 'GENERATION_PLAN'
  | 'GENERATION'
  | 'OUTPUT_REVIEW'
  | 'BINDING'
  | 'RECOMPARISON'
  | 'COMPLETE'
  | 'BLOCKED';

export type ReferenceMultiAssetReconstructionJob = {
  jobId: string;
  authorityId: string;
  projectId: string;
  screenId: string;
  viewport: 'MOBILE' | 'DESKTOP';
  referenceId: string;
  liveCaptureId: string | null;
  candidateAssets: ReferenceAssetCandidate[];
  jobStatus: MultiAssetJobStatus;
  cropApprovalStatus: CropApprovalState;
  generationApprovalStatus: GenerationApprovalState;
  bindingStatus: { bound: number; total: number; status: 'UNBOUND' | 'PARTIAL' | 'COMPLETE' };
  recomparisonStatus: 'NOT_RUN' | 'PENDING' | 'COMPLETE';
  discoveryComplete: boolean;
  failureCodes: string[];
};

export type MultiAssetReconstructionPlanEntry = {
  candidateId: string;
  semanticSlot: string;
  assetType: string;
  sourceCropUrl: string;
  method: 'DIRECT_EXTRACTION' | 'RECONSTRUCTION';
  provider: string;
  model: string;
  generatedPrompt: string;
  backgroundPolicy: string;
  expectedOutput: string;
  targetBinding: string;
  dispatchAuthorized: boolean;
};

export type MultiAssetReconstructionPlan = {
  planId: string;
  jobId: string;
  entries: MultiAssetReconstructionPlanEntry[];
  totalDispatches: number;
  generationApproved: boolean;
};

export function buildSkinsMobileMultiAssetReconstructionJob(input?: {
  liveColorSwatchBrands?: string[];
}): ReferenceMultiAssetReconstructionJob | null {
  const authority = getSkinsDesignAuthority('MOBILE');
  if (!authority) return null;

  const inventory = buildReferenceLiveVisualInventory({
    authorityId: authority.authorityId,
    viewport: 'MOBILE',
    liveColorSwatchBrands: input?.liveColorSwatchBrands,
  });

  const allCandidates = discoverAssetMismatchCandidates({
    inventory,
    viewport: 'MOBILE',
    sourceReferenceId: SKINS_REFERENCE_MOBILE,
    includeMatched: true,
  });

  const expectedFamilyCount = 5;
  const discoveryCheck = detectIncompleteMultiAssetDiscovery({
    expectedCount: expectedFamilyCount,
    discoveredCount: allCandidates.length,
  });

  const cropGate = evaluateCropApprovalGate(allCandidates);

  return {
    jobId: `rri-multi-asset-skins-mobile-${authority.authorityId}`,
    authorityId: authority.authorityId,
    projectId: 'site00',
    screenId: 'design-skins-mobile',
    viewport: 'MOBILE',
    referenceId: SKINS_REFERENCE_MOBILE,
    liveCaptureId: null,
    candidateAssets: allCandidates,
    jobStatus: discoveryCheck.incomplete ? 'BLOCKED' : 'CROP_REVIEW',
    cropApprovalStatus: cropGate.state,
    generationApprovalStatus: {
      status: 'BLOCKED',
      authorizedDispatchCount: 0,
      dispatchesUsed: 0,
    },
    bindingStatus: { bound: 0, total: expectedFamilyCount, status: 'UNBOUND' },
    recomparisonStatus: 'NOT_RUN',
    discoveryComplete: !discoveryCheck.incomplete,
    failureCodes: discoveryCheck.failureCode ? [discoveryCheck.failureCode] : [],
  };
}

export function buildMultiAssetReconstructionPlan(job: ReferenceMultiAssetReconstructionJob): MultiAssetReconstructionPlan {
  const cropApproved = job.candidateAssets.filter((c) => c.cropStatus === 'APPROVED');
  const entries: MultiAssetReconstructionPlanEntry[] = cropApproved.map((c) => ({
    candidateId: c.candidateId,
    semanticSlot: c.semanticSlot,
    assetType: c.assetType,
    sourceCropUrl: c.sourceCrop.sourceCropUrl,
    method: c.treatmentPlan.reconstructionRequired ? 'RECONSTRUCTION' : 'DIRECT_EXTRACTION',
    provider: 'fal',
    model: 'openai/gpt-image-2/edit',
    generatedPrompt: c.generatedPrompt,
    backgroundPolicy: c.treatmentPlan.backgroundPolicy,
    expectedOutput: `/site00/skins/canonical/mobile/${c.brandKey.toLowerCase()}.webp`,
    targetBinding: `SKINS → ${c.brandKey} → FAMILY THUMBNAIL`,
    dispatchAuthorized: false,
  }));

  return {
    planId: `plan-${job.jobId}`,
    jobId: job.jobId,
    entries,
    totalDispatches: entries.length,
    generationApproved: false,
  };
}

export function approveAllCrops(job: ReferenceMultiAssetReconstructionJob): ReferenceMultiAssetReconstructionJob {
  return {
    ...job,
    candidateAssets: job.candidateAssets.map((c) => ({ ...c, cropStatus: 'APPROVED' as const })),
    cropApprovalStatus: evaluateCropApprovalGate(
      job.candidateAssets.map(() => ({ cropStatus: 'APPROVED' })),
    ).state,
    jobStatus: 'GENERATION_PLAN',
  };
}

export function approveGeneration(
  job: ReferenceMultiAssetReconstructionJob,
  dispatchCount: number,
): { job: ReferenceMultiAssetReconstructionJob; gate: ReturnType<typeof evaluateGenerationApprovalGate> } {
  const cropApproved = job.cropApprovalStatus.approved > 0;
  const gate = evaluateGenerationApprovalGate({
    cropApproved,
    generationApproved: true,
    authorizedCount: dispatchCount,
  });

  const updated: ReferenceMultiAssetReconstructionJob = {
    ...job,
    generationApprovalStatus: {
      status: gate.allowed ? 'APPROVED' : 'BLOCKED',
      authorizedDispatchCount: dispatchCount,
      dispatchesUsed: 0,
    },
    candidateAssets: job.candidateAssets.map((c) =>
      c.cropStatus === 'APPROVED' ? { ...c, generationStatus: gate.allowed ? 'READY' : 'BLOCKED' } : c,
    ),
    jobStatus: gate.allowed ? 'GENERATION' : 'BLOCKED',
  };

  return { job: updated, gate };
}

export function getJobProgressSummary(job: ReferenceMultiAssetReconstructionJob): {
  detect: string;
  crops: string;
  generation: string;
  outputs: string;
  bound: string;
} {
  const total = job.candidateAssets.length;
  const cropsApproved = job.cropApprovalStatus.approved;
  const outputsComplete = job.candidateAssets.filter((c) => c.generationStatus === 'COMPLETE').length;
  const bound = job.bindingStatus.bound;

  return {
    detect: `${total} / ${total}`,
    crops: `${cropsApproved} / ${total} APPROVED`,
    generation: job.generationApprovalStatus.status === 'BLOCKED' ? 'BLOCKED' : `${job.generationApprovalStatus.dispatchesUsed} / ${job.generationApprovalStatus.authorizedDispatchCount}`,
    outputs: `${outputsComplete} / ${total}`,
    bound: `${bound} / ${total}`,
  };
}
