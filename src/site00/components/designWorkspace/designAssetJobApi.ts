/**
 * P0.VR.5 — Design asset job API client helpers.
 */

import { apiFetch } from '../../../utils/api.js';
import type {
  AssetJob,
  AssetJobPlanSummary,
  DesignInstructionPreset,
  DetectedAssetCandidate,
  ReconstructedAssetVersion,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr5/browserClient.js';
import type { CropConfirmationAction } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr5/cropConfirmation.js';

async function postJob<T>(body: Record<string, unknown>): Promise<T> {
  const res = await apiFetch('/api/site00/design-asset-reconstruction?action=' + String(body.action), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

export async function createDesignAssetJob(input: {
  workspaceId: string;
  projectId: string;
  pageId: string;
  route: string;
  founderInstruction?: string;
  selectedPresetId?: string | null;
}): Promise<{ ok: boolean; job?: AssetJob }> {
  return postJob({ action: 'job_create', ...input });
}

export async function addJobSourceUpload(input: {
  jobId: string;
  url: string;
  fileName?: string;
  sourcePage?: string;
  sourceRoute?: string;
}): Promise<{ ok: boolean; job?: AssetJob; plan?: AssetJobPlanSummary }> {
  return postJob({ action: 'job_add_upload', ...input });
}

export async function updateJobInstruction(input: {
  jobId: string;
  founderInstruction: string;
  selectedPresetId?: string | null;
}): Promise<{ ok: boolean; job?: AssetJob; plan?: AssetJobPlanSummary }> {
  return postJob({ action: 'job_update_instruction', ...input });
}

export async function runJobDetection(input: {
  jobId: string;
  explicitCount?: number;
}): Promise<{ ok: boolean; job?: AssetJob; plan?: AssetJobPlanSummary }> {
  return postJob({ action: 'job_detect', ...input });
}

export async function applyJobCropActions(input: {
  jobId: string;
  actions: CropConfirmationAction[];
}): Promise<{ ok: boolean; job?: AssetJob; cropState?: unknown }> {
  return postJob({ action: 'job_crop_actions', ...input });
}

export async function confirmJobCrops(input: {
  jobId: string;
  approveSubset?: string[];
}): Promise<{ ok: boolean; job?: AssetJob; blocker?: string }> {
  return postJob({ action: 'job_confirm_crops', ...input });
}

export async function reconstructJobAssets(input: {
  jobId: string;
  explicitFounderAction: boolean;
  approvedSubset?: string[];
}): Promise<{
  ok: boolean;
  blocked?: boolean;
  blocker?: string;
  versions?: ReconstructedAssetVersion[];
  dispatchCount?: number;
  job?: AssetJob;
}> {
  return postJob({ action: 'job_reconstruct', ...input });
}

export async function approveJobVersion(input: {
  jobId: string;
  versionId: string;
  approved: boolean;
}): Promise<{ ok: boolean; job?: AssetJob }> {
  return postJob({ action: 'job_approve_version', ...input });
}

export async function uploadJobAssets(input: {
  jobId: string;
  versionIds: string[];
}): Promise<{ ok: boolean; job?: AssetJob; uploaded?: ReconstructedAssetVersion[] }> {
  return postJob({ action: 'job_upload', ...input });
}

export async function bindJobAssets(input: {
  jobId: string;
  versionIds: string[];
}): Promise<{ ok: boolean; job?: AssetJob; bound?: number }> {
  return postJob({ action: 'job_bind', ...input });
}

export async function listInstructionPresets(): Promise<{ ok: boolean; presets?: DesignInstructionPreset[] }> {
  const res = await apiFetch('/api/site00/design-asset-reconstruction?action=preset_list');
  return res.json() as Promise<{ ok: boolean; presets?: DesignInstructionPreset[] }>;
}

export async function suggestJobPresets(input: {
  founderInstruction: string;
  intentType?: string;
  multiAsset?: boolean;
}): Promise<{ ok: boolean; suggested?: DesignInstructionPreset[] }> {
  return postJob({ action: 'preset_suggest', ...input });
}

export async function saveJobPreset(input: {
  name: string;
  instructionTemplate: string;
  intentType: string;
  assetTypes: string[];
  multiAsset: boolean;
  orderingRule: string;
  backgroundPolicy: string;
  replacementBehavior: string;
  targetScope?: string | null;
  fromJobId?: string;
}): Promise<{ ok: boolean; preset?: DesignInstructionPreset }> {
  return postJob({ action: 'preset_save', ...input });
}

export async function getAssetJob(jobId: string): Promise<{ ok: boolean; job?: AssetJob; plan?: AssetJobPlanSummary }> {
  const res = await apiFetch(`/api/site00/design-asset-reconstruction?action=job_get&jobId=${encodeURIComponent(jobId)}`);
  return res.json() as Promise<{ ok: boolean; job?: AssetJob; plan?: AssetJobPlanSummary }>;
}

export type { DetectedAssetCandidate, AssetJob, AssetJobPlanSummary, DesignInstructionPreset, ReconstructedAssetVersion };
