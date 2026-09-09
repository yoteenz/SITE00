/**
 * P0.VR.5 — Founder instruction intelligence + multi-asset deconstruction pipeline tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  P0_VR_5_LINEAGE,
  P0_VR_5_FEATURE_LABEL,
  BUILT_IN_PRESET_IDS,
  parseFounderInstruction,
  createAssetJob,
  addSourceUpload,
  updateJobInstruction,
  runJobDetection,
  applyCropConfirmationActions,
  confirmAssetCrops,
  reconstructConfirmedAssets,
  uploadReconstructedAssets,
  bindReconstructedAssets,
  summarizeAssetJobPlan,
  suggestInstructionPresets,
  saveDesignInstructionPreset,
  listAllPresets,
  clearAssetJobStoreForTest,
  clearLearnedPresetsForTest,
  uploadNeverTriggersGeneration,
  providerDispatchOnUpload,
  providerDispatchOnDetect,
  estimateDispatchCount,
  blockGenerationWithoutCropApproval,
  buildReplacementMappingFromJob,
  removeBackgroundIfNeeded,
  getAssetJob,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr5/index.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function setupJob(instruction: string, presetId?: string) {
  const job = createAssetJob({
    workspaceId: 'test-ws',
    projectId: 'site00',
    pageId: 'projects-index',
    route: '/projects',
    founderInstruction: instruction,
    selectedPresetId: presetId ?? BUILT_IN_PRESET_IDS.CUSTOM,
  });
  addSourceUpload(job.jobId, {
    url: '/visual-references/founder/site00/projects-index-approved-reference.jpg',
    fileName: 'ref.jpg',
    sourcePage: 'projects-index',
    sourceRoute: '/projects',
  });
  updateJobInstruction(job.jobId, { founderInstruction: instruction, selectedPresetId: presetId ?? null });
  runJobDetection(job.jobId);
  return job.jobId;
}

function confirmAllCrops(jobId: string) {
  let job = getAssetJob(jobId)!;
  applyCropConfirmationActions(job, [{ type: 'CONFIRM_ALL' }]);
  job = getAssetJob(jobId)!;
  return confirmAssetCrops(job);
}

describe('P0.VR.5 founder instruction + multi-asset pipeline', () => {
  beforeEach(() => {
    clearAssetJobStoreForTest();
    clearLearnedPresetsForTest();
  });

  it('module lineage and feature label exist', () => {
    expect(P0_VR_5_LINEAGE).toBe('P0.VR.5');
    expect(P0_VR_5_FEATURE_LABEL).toBe('ASSET DECONSTRUCTION PIPELINE');
  });

  it('SCENARIO A — single icon with transparent background', () => {
    const parsed = parseFounderInstruction('GENERATE THIS ICON BY ITSELF WITH NO BACKGROUND');
    expect(parsed.intentType).toBe('SINGLE_ASSET');
    expect(parsed.backgroundPolicy).toBe('REMOVE_BACKGROUND');
    expect(parsed.multiAsset).toBe(false);

    const jobId = setupJob('GENERATE THIS ICON BY ITSELF WITH NO BACKGROUND', BUILT_IN_PRESET_IDS.SINGLE_ICON);
    const job = getAssetJob(jobId)!;
    expect(job.detectionCount).toBe(1);
    expect(job.detectedRegions[0].classification).toBe('ICON');

    const cropResult = confirmAllCrops(jobId);
    expect(cropResult.ok).toBe(true);

    const bg = removeBackgroundIfNeeded('REMOVE_BACKGROUND', '/out.png');
    expect(bg.bgRemoved).toBe(true);

    const recon = reconstructConfirmedAssets(getAssetJob(jobId)!, { explicitFounderAction: true });
    expect(recon.ok).toBe(true);
    expect(recon.dispatchCount).toBe(1);
    expect(recon.versions[0].outputUrl).toContain('transparent');
  });

  it('SCENARIO B — multi-icon set with ordered replacement', () => {
    const instruction =
      'ISOLATE EACH OF THESE ICONS ONE BY ONE AND REPLACE THE CURRENT ICONS WITH THEM';
    const parsed = parseFounderInstruction(instruction);
    expect(parsed.multiAsset).toBe(true);
    expect(parsed.replacementBehavior).toBe('REPLACE_BY_ORDER');

    const jobId = setupJob(instruction, BUILT_IN_PRESET_IDS.REPLACE_NAV);
    const job = getAssetJob(jobId)!;
    expect(job.detectionCount).toBeGreaterThanOrEqual(4);
    expect(job.detectionOrdering).toBe('LEFT_TO_RIGHT');

    confirmAllCrops(jobId);
    const updated = getAssetJob(jobId)!;
    const mapping = buildReplacementMappingFromJob(updated);
    expect(mapping?.replacementSlots.length).toBeGreaterThanOrEqual(4);
    expect(Object.keys(mapping?.sourceOrderToTargetOrder ?? {}).length).toBeGreaterThanOrEqual(4);

    const recon = reconstructConfirmedAssets(updated, { explicitFounderAction: true });
    expect(recon.dispatchCount).toBe(updated.detectionCount);
  });

  it('SCENARIO C — background image extract keeps background', () => {
    const jobId = setupJob('EXTRACT THE BACKGROUND IMAGE ONLY', BUILT_IN_PRESET_IDS.BACKGROUND);
    const job = getAssetJob(jobId)!;
    expect(job.jobType).toBe('BACKGROUND_EXTRACT');
    expect(job.backgroundPolicy).toBe('KEEP_BACKGROUND');
    expect(job.detectedRegions[0].classification).toBe('BACKGROUND_IMAGE');

    confirmAllCrops(jobId);
    const recon = reconstructConfirmedAssets(getAssetJob(jobId)!, { explicitFounderAction: true });
    expect(recon.versions[0].outputUrl).not.toContain('transparent');
  });

  it('SCENARIO D — hero decorative object extraction', () => {
    const jobId = setupJob(
      'ISOLATE THE HERO OBJECT AND REPLACE THE CURRENT HEADER VISUAL',
      BUILT_IN_PRESET_IDS.HERO_OBJECT,
    );
    const job = getAssetJob(jobId)!;
    expect(job.detectedRegions[0].classification).toBe('HERO_OBJECT');
    expect(job.replacementMapping?.replacementTargetScope).toBe('PAGE_HEADER');

    confirmAllCrops(jobId);
    const recon = reconstructConfirmedAssets(getAssetJob(jobId)!, { explicitFounderAction: true });
    expect(recon.ok).toBe(true);
    expect(recon.dispatchCount).toBe(1);
  });

  it('SCENARIO E — preset suggestion after repeated similar instructions', () => {
    const instruction = 'ISOLATE EACH OF THESE ICONS ONE BY ONE';
    for (let i = 0; i < 3; i++) {
      const jobId = setupJob(instruction, BUILT_IN_PRESET_IDS.ICON_SET);
      confirmAllCrops(jobId);
    }
    const suggested = suggestInstructionPresets({
      founderInstruction: instruction,
      intentType: 'ICON_SET',
      multiAsset: true,
    });
    expect(suggested.length).toBeGreaterThan(0);
    expect(suggested[0].name).toMatch(/ICON/i);

    const custom = saveDesignInstructionPreset({
      name: 'MY NAV ICON FLOW',
      instructionTemplate: instruction,
      intentType: 'ICON_SET',
      assetTypes: ['ICON_SET_MEMBER'],
      multiAsset: true,
      orderingRule: 'LEFT_TO_RIGHT',
      backgroundPolicy: 'REMOVE_BACKGROUND',
      replacementBehavior: 'REPLACE_BY_ORDER',
      targetScope: 'NAV_ICON_SET',
    });
    expect(listAllPresets().some((p) => p.presetId === custom.presetId)).toBe(true);
  });

  it('SCENARIO F — spend protection: zero dispatch without crop approval', () => {
    const jobId = setupJob('GENERATE THIS ICON BY ITSELF WITH NO BACKGROUND');
    const job = getAssetJob(jobId)!;

    expect(uploadNeverTriggersGeneration()).toBe(true);
    expect(providerDispatchOnUpload()).toBe(false);
    expect(providerDispatchOnDetect()).toBe(false);
    expect(blockGenerationWithoutCropApproval(job)).toBe(true);

    const blocked = reconstructConfirmedAssets(job, { explicitFounderAction: true });
    expect(blocked.blocked).toBe(true);
    expect(blocked.dispatchCount).toBe(0);
    expect(job.dispatchCounts.executed).toBe(0);
  });

  it('job plan summary surfaces confirmation and dispatch estimate', () => {
    const jobId = setupJob('ISOLATE EACH OF THESE ICONS ONE BY ONE', BUILT_IN_PRESET_IDS.ICON_SET);
    const plan = summarizeAssetJobPlan(getAssetJob(jobId)!);
    expect(plan.founderConfirmationRequired).toBe(true);
    expect(plan.estimatedDispatchCount).toBeGreaterThan(1);
    expect(plan.singleOrMulti).toBe('MULTI');
  });

  it('upload approve bind pipeline completes job', () => {
    const jobId = setupJob('GENERATE THIS ICON BY ITSELF WITH NO BACKGROUND', BUILT_IN_PRESET_IDS.SINGLE_ICON);
    confirmAllCrops(jobId);
    reconstructConfirmedAssets(getAssetJob(jobId)!, { explicitFounderAction: true });
    let job = getAssetJob(jobId)!;
    for (const v of job.reconstructedVersions) {
      v.approvalState = 'APPROVED';
    }
    const versionIds = job.reconstructedVersions.map((v) => v.versionId);
    uploadReconstructedAssets(job, versionIds);
    bindReconstructedAssets(getAssetJob(jobId)!, versionIds);
    job = getAssetJob(jobId)!;
    expect(job.status).toBe('COMPLETED');
    expect(estimateDispatchCount(job)).toBe(1);
  });

  it('UI wiring — job workspace integrated in ASSETS tab', () => {
    expect(read('src/site00/components/designWorkspace/DesignAssetJobWorkspace.tsx')).toContain('ASSET DECONSTRUCTION PIPELINE');
    expect(read('src/site00/components/designWorkspace/DesignReferenceAssetsPanel.tsx')).toContain('DesignAssetJobWorkspace');
    expect(read('src/site00/styles/site00-design-workspace-p0vr2b.css')).toContain('site00-dw-job-workspace');
    expect(read('api/site00/design-asset-reconstruction.ts')).toContain('job_create');
    expect(read('api/site00/design-asset-reconstruction.ts')).toContain('job_reconstruct');
  });
});
