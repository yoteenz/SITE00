import crypto from 'node:crypto';
import type { CinematicGenerationJobRecord, CinematicJobState, ShotExecutionContract } from '../types/schemas.js';
import { CINEMATIC_JOB_LIFECYCLE_VERSION } from '../types/schemas.js';

const jobs = new Map<string, CinematicGenerationJobRecord>();
const idempotencyIndex = new Map<string, string>();

export function resetCinematicJobStoreForTests(): void {
  jobs.clear();
  idempotencyIndex.clear();
}

export function buildIdempotencyKey(contract: ShotExecutionContract, promptHash: string): string {
  return crypto
    .createHash('sha256')
    .update(`${contract.shotId}:${contract.shotVersion}:${promptHash}`)
    .digest('hex');
}

export function createCinematicJob(input: {
  contract: ShotExecutionContract;
  referenceManifestHash: string;
  promptHash: string;
  modelVersion: string;
}): { ok: true; job: CinematicGenerationJobRecord } | { ok: false; reason: 'DUPLICATE_SUBMISSION'; existingJobId: string } {
  const idempotencyKey = buildIdempotencyKey(input.contract, input.promptHash);
  const existing = idempotencyIndex.get(idempotencyKey);
  if (existing) {
    return { ok: false, reason: 'DUPLICATE_SUBMISSION', existingJobId: existing };
  }
  const jobId = `cinejob_${crypto.randomBytes(10).toString('hex')}`;
  const job: CinematicGenerationJobRecord = {
    lifecycleVersion: CINEMATIC_JOB_LIFECYCLE_VERSION,
    jobId,
    idempotencyKey,
    state: 'DRAFT',
    providerJobId: null,
    sourceContractVersion: input.contract.contractVersion,
    referenceManifestHash: input.referenceManifestHash,
    promptHash: input.promptHash,
    modelVersion: input.modelVersion,
    submissionTimestamp: null,
    startTimestamp: null,
    completionTimestamp: null,
    providerStatus: null,
    providerError: null,
    costOrCredits: null,
    outputAssetIds: [],
    qualityReviewId: null,
    approvalHistory: [],
  };
  jobs.set(jobId, job);
  idempotencyIndex.set(idempotencyKey, jobId);
  return { ok: true, job };
}

export function transitionCinematicJob(jobId: string, next: CinematicJobState, meta?: Partial<CinematicGenerationJobRecord>): CinematicGenerationJobRecord | null {
  const job = jobs.get(jobId);
  if (!job) return null;
  const updated: CinematicGenerationJobRecord = { ...job, ...meta, state: next };
  if (next === 'SUBMITTED') updated.submissionTimestamp = new Date().toISOString();
  if (next === 'RUNNING') updated.startTimestamp = new Date().toISOString();
  if (next === 'SUCCEEDED' || next === 'FAILED' || next === 'CANCELLED') {
    updated.completionTimestamp = new Date().toISOString();
  }
  jobs.set(jobId, updated);
  return updated;
}

export function getCinematicJob(jobId: string): CinematicGenerationJobRecord | null {
  return jobs.get(jobId) ?? null;
}
