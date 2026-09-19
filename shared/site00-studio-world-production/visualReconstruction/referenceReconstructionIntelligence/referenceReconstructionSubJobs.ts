/**
 * Independent sub-jobs — asset block must not block structure/typography.
 * P0.VR.6R7
 */

export type SubJobId = 'STRUCTURE' | 'TYPOGRAPHY' | 'SURFACES' | 'ASSETS' | 'CAPTURE_QA';

export type SubJobStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'WAITING_CROP_APPROVAL'
  | 'WAITING_GENERATION_APPROVAL'
  | 'WAITING_OUTPUT_APPROVAL'
  | 'WAITING_FOR_DEPENDENCIES'
  | 'COMPLETE'
  | 'BLOCKED';

export type ReferenceReconstructionSubJob = {
  subJobId: SubJobId;
  status: SubJobStatus;
  blockReason: string | null;
  progressNote: string | null;
};

export type ReferenceReconstructionSubJobs = {
  structure: ReferenceReconstructionSubJob;
  typography: ReferenceReconstructionSubJob;
  surfaces: ReferenceReconstructionSubJob;
  assets: ReferenceReconstructionSubJob;
  captureQa: ReferenceReconstructionSubJob;
};

export type TopLevelJobPresentation = {
  label: 'IN_PROGRESS — FOUNDER ACTION REQUIRED' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETE';
  summary: string;
};

export function initializeSubJobs(input: {
  cropApprovalPending: boolean;
  generationBlocked: boolean;
}): ReferenceReconstructionSubJobs {
  return {
    structure: {
      subJobId: 'STRUCTURE',
      status: 'RUNNING',
      blockReason: null,
      progressNote: 'Applying geometry + spacing corrections',
    },
    typography: {
      subJobId: 'TYPOGRAPHY',
      status: 'RUNNING',
      blockReason: null,
      progressNote: 'Calibrating Martian Mono metrics',
    },
    surfaces: {
      subJobId: 'SURFACES',
      status: 'RUNNING',
      blockReason: null,
      progressNote: 'Surface token alignment',
    },
    assets: {
      subJobId: 'ASSETS',
      status: input.cropApprovalPending ? 'WAITING_CROP_APPROVAL' : 'RUNNING',
      blockReason: input.cropApprovalPending ? 'CROPS_NOT_APPROVED' : null,
      progressNote: input.cropApprovalPending ? 'Waiting for founder crop review' : 'Asset pipeline active',
    },
    captureQa: {
      subJobId: 'CAPTURE_QA',
      status: 'WAITING_FOR_DEPENDENCIES',
      blockReason: null,
      progressNote: 'Waiting for structure + assets',
    },
  };
}

export function updateSubJobsFromJobState(input: {
  subJobs: ReferenceReconstructionSubJobs;
  cropsApproved: number;
  cropsTotal: number;
  generationApproved: boolean;
  generationComplete: boolean;
  outputsPendingReview: number;
}): ReferenceReconstructionSubJobs {
  const assetsStatus: SubJobStatus =
    input.cropsApproved < input.cropsTotal
      ? 'WAITING_CROP_APPROVAL'
      : !input.generationApproved
        ? 'WAITING_GENERATION_APPROVAL'
        : input.generationComplete
          ? input.outputsPendingReview > 0
            ? 'WAITING_OUTPUT_APPROVAL'
            : 'COMPLETE'
          : 'RUNNING';

  return {
    ...input.subJobs,
    structure: { ...input.subJobs.structure, status: input.cropsApproved < input.cropsTotal ? 'RUNNING' : 'COMPLETE' },
    typography: { ...input.subJobs.typography, status: input.cropsApproved < input.cropsTotal ? 'RUNNING' : 'COMPLETE' },
    surfaces: { ...input.subJobs.surfaces, status: 'RUNNING' },
    assets: {
      ...input.subJobs.assets,
      status: assetsStatus,
      blockReason:
        assetsStatus === 'WAITING_CROP_APPROVAL'
          ? 'CROPS_NOT_APPROVED'
          : assetsStatus === 'WAITING_GENERATION_APPROVAL'
            ? 'GENERATION_NOT_APPROVED'
            : null,
    },
    captureQa: {
      ...input.subJobs.captureQa,
      status:
        input.generationComplete && input.outputsPendingReview === 0 ? 'RUNNING' : 'WAITING_FOR_DEPENDENCIES',
    },
  };
}

export function getTopLevelJobPresentation(subJobs: ReferenceReconstructionSubJobs): TopLevelJobPresentation {
  const assetWaiting =
    subJobs.assets.status === 'WAITING_CROP_APPROVAL' ||
    subJobs.assets.status === 'WAITING_GENERATION_APPROVAL' ||
    subJobs.assets.status === 'WAITING_OUTPUT_APPROVAL';

  if (assetWaiting) {
    return {
      label: 'IN_PROGRESS — FOUNDER ACTION REQUIRED',
      summary: `STRUCTURE: ${subJobs.structure.status} · TYPOGRAPHY: ${subJobs.typography.status} · ASSETS: ${subJobs.assets.status}`,
    };
  }

  const allComplete = [subJobs.structure, subJobs.typography, subJobs.surfaces, subJobs.assets, subJobs.captureQa].every(
    (s) => s.status === 'COMPLETE',
  );
  if (allComplete) return { label: 'COMPLETE', summary: 'All sub-jobs complete' };

  return {
    label: 'IN_PROGRESS',
    summary: `STRUCTURE: ${subJobs.structure.status} · ASSETS: ${subJobs.assets.status}`,
  };
}

export function assertStructureNotBlockedByAssets(subJobs: ReferenceReconstructionSubJobs): {
  coupled: boolean;
  failureCode: 'BLOCKED_ASSET_JOB_BLOCKED_STRUCTURE' | 'RECONSTRUCTION_SUBJOB_COUPLED' | null;
} {
  const assetsBlocked = subJobs.assets.status.startsWith('WAITING_');
  const structureBlocked = subJobs.structure.status === 'BLOCKED' || subJobs.structure.status === 'WAITING_FOR_DEPENDENCIES';
  if (assetsBlocked && structureBlocked) {
    return { coupled: true, failureCode: 'BLOCKED_ASSET_JOB_BLOCKED_STRUCTURE' };
  }
  if (assetsBlocked && subJobs.typography.status === 'BLOCKED') {
    return { coupled: true, failureCode: 'RECONSTRUCTION_SUBJOB_COUPLED' };
  }
  return { coupled: false, failureCode: null };
}
