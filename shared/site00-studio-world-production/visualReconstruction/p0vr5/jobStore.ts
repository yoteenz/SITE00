/**
 * P0.VR.5 — In-memory asset job store.
 */

import { detectAssetCandidates } from './assetCandidateDetection.js';
import { buildJobFromInstruction, computeCostRiskLevel } from './jobPlan.js';
import { parseFounderInstruction } from './instructionParser.js';
import { recordPresetUsageFromJob } from './presetStore.js';
import { resolveEffectiveJobInstruction } from '../p0vr7/integration.js';
import type {
  AssetJob,
  DetectedAssetCandidate,
  JobEvent,
  ReconstructedAssetVersion,
  SourceUploadRecord,
} from './types.js';

const jobs = new Map<string, AssetJob>();
const events: JobEvent[] = [];

function now(): string {
  return new Date().toISOString();
}

function eventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function jobId(): string {
  return `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function uploadId(): string {
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function appendEvent(jobId: string, eventType: string, payload: Record<string, unknown>, actor: JobEvent['actor'] = 'SYSTEM'): JobEvent {
  const evt: JobEvent = {
    eventId: eventId(),
    jobId,
    eventType,
    timestamp: now(),
    actor,
    payload,
  };
  events.push(evt);
  return evt;
}

export function createAssetJob(input: {
  workspaceId: string;
  projectId: string;
  pageId: string;
  route: string;
  founderInstruction?: string;
  selectedPresetId?: string | null;
}): AssetJob {
  const instruction = input.founderInstruction ?? '';
  const plan = buildJobFromInstruction({
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    pageId: input.pageId,
    route: input.route,
    founderInstruction: instruction,
    selectedPresetId: input.selectedPresetId,
  });

  const id = jobId();
  const job: AssetJob = {
    jobId: id,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    pageId: input.pageId,
    route: input.route,
    sourceUploadIds: [],
    sourceUploads: [],
    founderInstruction: instruction,
    selectedPresetId: input.selectedPresetId ?? null,
    status: 'DRAFT',
    currentStep: 'UPLOAD',
    dispatchCounts: { planned: plan.multiAsset ? 2 : 1, executed: 0, blocked: 0 },
    detectedRegions: [],
    detectionCount: 0,
    detectionOrdering: plan.orderingRule,
    reconstructedVersions: [],
    cropsConfirmed: false,
    fidelityContractId: null,
    createdAt: now(),
    updatedAt: now(),
    ...plan,
  };

  jobs.set(id, job);
  appendEvent(id, 'JOB_CREATED', { projectId: input.projectId, pageId: input.pageId });
  return job;
}

export function getAssetJob(jobId: string): AssetJob | null {
  return jobs.get(jobId) ?? null;
}

export function listAssetJobs(filter?: { workspaceId?: string; projectId?: string }): AssetJob[] {
  return [...jobs.values()].filter((j) => {
    if (filter?.workspaceId && j.workspaceId !== filter.workspaceId) return false;
    if (filter?.projectId && j.projectId !== filter.projectId) return false;
    return true;
  });
}

export function getEffectiveJobInstruction(job: AssetJob): string {
  return resolveEffectiveJobInstruction(job.fidelityContractId, job.founderInstruction);
}

export function linkFidelityContract(jobId: string, fidelityContractId: string): AssetJob | null {
  const job = jobs.get(jobId);
  if (!job) return null;
  job.fidelityContractId = fidelityContractId;
  job.updatedAt = now();
  appendEvent(jobId, 'FIDELITY_CONTRACT_LINKED', { fidelityContractId });
  return job;
}

export function addSourceUpload(
  jobId: string,
  input: {
    url: string;
    fileName?: string | null;
    sourcePage?: string | null;
    sourceModule?: string | null;
    sourceRoute?: string | null;
    imageWidth?: number;
    imageHeight?: number;
    fidelityContractId?: string | null;
  },
): AssetJob | null {
  const job = jobs.get(jobId);
  if (!job) return null;

  const record: SourceUploadRecord = {
    uploadId: uploadId(),
    url: input.url,
    fileName: input.fileName ?? null,
    sourcePage: input.sourcePage ?? job.pageId,
    sourceModule: input.sourceModule ?? null,
    sourceRoute: input.sourceRoute ?? job.route,
    imageWidth: input.imageWidth ?? 946,
    imageHeight: input.imageHeight ?? 667,
    createdAt: now(),
  };

  job.sourceUploads.push(record);
  job.sourceUploadIds.push(record.uploadId);
  if (input.fidelityContractId) job.fidelityContractId = input.fidelityContractId;
  job.status = 'PLANNED';
  job.currentStep = 'INSTRUCT';
  job.updatedAt = now();
  appendEvent(jobId, 'SOURCE_UPLOAD_ADDED', { uploadId: record.uploadId, fidelityContractId: input.fidelityContractId ?? null }, 'FOUNDER');
  return job;
}

export function updateJobInstruction(
  jobId: string,
  input: { founderInstruction: string; selectedPresetId?: string | null },
): AssetJob | null {
  const job = jobs.get(jobId);
  if (!job) return null;

  job.founderInstruction = input.founderInstruction;
  if (input.selectedPresetId !== undefined) job.selectedPresetId = input.selectedPresetId;

  const plan = buildJobFromInstruction({
    workspaceId: job.workspaceId,
    projectId: job.projectId,
    pageId: job.pageId,
    route: job.route,
    founderInstruction: getEffectiveJobInstruction(job),
    selectedPresetId: job.selectedPresetId,
  });

  Object.assign(job, plan);
  job.dispatchCounts.planned = job.multiAsset ? Math.max(2, job.detectionCount || 2) : 1;
  job.costRiskLevel = computeCostRiskLevel(job.dispatchCounts.planned, job.multiAsset);
  job.currentStep = 'INSTRUCT';
  job.updatedAt = now();
  appendEvent(jobId, 'INSTRUCTION_UPDATED', { instruction: input.founderInstruction }, 'FOUNDER');
  return job;
}

export function runJobDetection(jobId: string, explicitCount?: number): AssetJob | null {
  const job = jobs.get(jobId);
  if (!job || !job.sourceUploads.length) return null;

  job.status = 'DETECTING';
  const result = detectAssetCandidates({
    jobId,
    uploads: job.sourceUploads,
    founderInstruction: getEffectiveJobInstruction(job),
    jobType: job.jobType,
    orderingRule: job.orderingRule,
    explicitCount,
  });

  job.detectedRegions = result.detectedRegions;
  job.detectionCount = result.detectionCount;
  job.detectionOrdering = result.detectionOrdering;
  job.dispatchCounts.planned = result.detectionCount;
  job.costRiskLevel = computeCostRiskLevel(result.detectionCount, job.multiAsset);
  job.status = 'CROP_REVIEW';
  job.currentStep = 'CONFIRM_CROP';
  job.updatedAt = now();
  appendEvent(jobId, 'DETECTION_COMPLETE', { count: result.detectionCount });
  return job;
}

export function updateJobCandidates(jobId: string, regions: DetectedAssetCandidate[]): AssetJob | null {
  const job = jobs.get(jobId);
  if (!job) return null;
  job.detectedRegions = regions;
  job.detectionCount = regions.filter((r) => r.founderDecision !== 'REJECTED' && r.founderDecision !== 'SKIPPED').length;
  job.updatedAt = now();
  return job;
}

export function attachReconstructedVersions(jobId: string, versions: ReconstructedAssetVersion[]): AssetJob | null {
  const job = jobs.get(jobId);
  if (!job) return null;
  job.reconstructedVersions = versions;
  job.updatedAt = now();
  return job;
}

export function markJobStatus(jobId: string, status: AssetJob['status'], step: AssetJob['currentStep']): AssetJob | null {
  const job = jobs.get(jobId);
  if (!job) return null;
  job.status = status;
  job.currentStep = step;
  job.updatedAt = now();
  return job;
}

export function incrementJobDispatch(jobId: string, blocked = false): AssetJob | null {
  const job = jobs.get(jobId);
  if (!job) return null;
  if (blocked) job.dispatchCounts.blocked += 1;
  else job.dispatchCounts.executed += 1;
  job.updatedAt = now();
  return job;
}

export function touchPresetUsage(jobId: string): void {
  const job = jobs.get(jobId);
  if (!job?.selectedPresetId) return;
  recordPresetUsageFromJob(jobId, job.selectedPresetId);
}

export function getJobEvents(jobId: string): JobEvent[] {
  return events.filter((e) => e.jobId === jobId);
}

export function clearAssetJobStoreForTest(): void {
  jobs.clear();
  events.length = 0;
}

export function parseInstructionForJob(jobId: string) {
  const job = jobs.get(jobId);
  if (!job) return null;
  return parseFounderInstruction(job.founderInstruction);
}
