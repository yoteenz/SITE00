/**
 * Founder approval gates — CROP / GENERATION / OUTPUT / REGENERATION.
 * P0.VR.6R6
 */

export const APPROVAL_TYPES = [
  'CROP',
  'GENERATION',
  'OUTPUT',
  'REGENERATION',
  'BINDING_OVERRIDE',
  'ACCEPT_AS_IS',
] as const;

export type ApprovalType = (typeof APPROVAL_TYPES)[number];

export type ReferenceReconstructionApproval = {
  approvalId: string;
  jobId: string;
  candidateId?: string;
  approvalType: ApprovalType;
  approvedBy: string | null;
  approvedAt: string | null;
  version: string;
  scope: 'JOB' | 'CANDIDATE';
  providerDispatchesAuthorized: number;
};

export type CropApprovalState = {
  total: number;
  prepared: number;
  approved: number;
  rejected: number;
  status: 'PENDING' | 'PARTIAL' | 'COMPLETE' | 'BLOCKED';
};

export type GenerationApprovalState = {
  status: 'BLOCKED' | 'READY' | 'APPROVED' | 'DISPATCHED' | 'COMPLETE';
  authorizedDispatchCount: number;
  dispatchesUsed: number;
};

export function evaluateCropApprovalGate(candidates: Array<{ cropStatus: string }>): {
  allowed: boolean;
  failureCode: 'REFERENCE_CROP_APPROVAL_SKIPPED' | null;
  state: CropApprovalState;
} {
  const total = candidates.length;
  const prepared = candidates.filter((c) => c.cropStatus === 'PREPARED' || c.cropStatus === 'APPROVED').length;
  const approved = candidates.filter((c) => c.cropStatus === 'APPROVED').length;
  const rejected = candidates.filter((c) => c.cropStatus === 'REJECTED').length;

  return {
    allowed: approved > 0,
    failureCode: approved === 0 && prepared > 0 ? null : approved === 0 ? 'REFERENCE_CROP_APPROVAL_SKIPPED' : null,
    state: {
      total,
      prepared,
      approved,
      rejected,
      status: approved === total ? 'COMPLETE' : approved > 0 ? 'PARTIAL' : prepared > 0 ? 'PENDING' : 'BLOCKED',
    },
  };
}

export function evaluateGenerationApprovalGate(input: {
  cropApproved: boolean;
  generationApproved: boolean;
  authorizedCount: number;
}): {
  allowed: boolean;
  failureCode: 'REFERENCE_GENERATION_APPROVAL_SKIPPED' | 'REFERENCE_CROP_APPROVAL_SKIPPED' | null;
} {
  if (!input.cropApproved) {
    return { allowed: false, failureCode: 'REFERENCE_CROP_APPROVAL_SKIPPED' };
  }
  if (!input.generationApproved) {
    return { allowed: false, failureCode: 'REFERENCE_GENERATION_APPROVAL_SKIPPED' };
  }
  if (input.authorizedCount <= 0) {
    return { allowed: false, failureCode: 'REFERENCE_GENERATION_APPROVAL_SKIPPED' };
  }
  return { allowed: true, failureCode: null };
}

export function cropApprovalIsNotGenerationApproval(cropApproved: boolean, generationApproved: boolean): boolean {
  return cropApproved && !generationApproved;
}

export function evaluateOutputApprovalGate(input: {
  outputApprovalStatus: string;
}): { allowed: boolean; failureCode: 'REFERENCE_OUTPUT_APPROVAL_SKIPPED' | 'REFERENCE_BINDING_WITHOUT_OUTPUT_APPROVAL' | null } {
  if (input.outputApprovalStatus === 'LOVE_IT') return { allowed: true, failureCode: null };
  if (input.outputApprovalStatus === 'PENDING') {
    return { allowed: false, failureCode: 'REFERENCE_OUTPUT_APPROVAL_SKIPPED' };
  }
  return { allowed: false, failureCode: 'REFERENCE_BINDING_WITHOUT_OUTPUT_APPROVAL' };
}

export function evaluateRegenerationGate(input: {
  founderApprovedRegeneration: boolean;
  autoRetryReason?: string;
}): { allowed: boolean; failureCode: 'REFERENCE_REGENERATION_AUTO_DISPATCHED' | null } {
  if (input.autoRetryReason && !input.founderApprovedRegeneration) {
    const technicalOnly = ['network failure', 'provider timeout', 'transient infrastructure error'].includes(
      input.autoRetryReason,
    );
    if (!technicalOnly) {
      return { allowed: false, failureCode: 'REFERENCE_REGENERATION_AUTO_DISPATCHED' };
    }
  }
  if (!input.founderApprovedRegeneration) {
    return { allowed: false, failureCode: 'REFERENCE_REGENERATION_AUTO_DISPATCHED' };
  }
  return { allowed: true, failureCode: null };
}

export function createApprovalRecord(input: {
  jobId: string;
  approvalType: ApprovalType;
  candidateId?: string;
  approvedBy?: string;
  dispatches?: number;
}): ReferenceReconstructionApproval {
  return {
    approvalId: `approval-${input.approvalType.toLowerCase()}-${Date.now()}`,
    jobId: input.jobId,
    candidateId: input.candidateId,
    approvalType: input.approvalType,
    approvedBy: input.approvedBy ?? null,
    approvedAt: input.approvedBy ? new Date().toISOString() : null,
    version: '1.0.0',
    scope: input.candidateId ? 'CANDIDATE' : 'JOB',
    providerDispatchesAuthorized: input.dispatches ?? 0,
  };
}
