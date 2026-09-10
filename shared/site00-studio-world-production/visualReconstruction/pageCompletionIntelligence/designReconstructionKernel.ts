/**
 * DesignReconstructionKernel — shared reconstruction services for SKINS / PAGES / ASSETS.
 */

import { buildReferenceReconstructionInspectorState } from '../referenceReconstructionIntelligence/systemInspector.js';
import { buildSkinsMobileMultiAssetReconstructionJob } from '../referenceReconstructionIntelligence/multiAssetReconstructionJob.js';
import { syncFounderActionsFromJob } from '../referenceReconstructionIntelligence/founderActionRouter.js';
import { runPageCompletionIntelligence, buildPageCompletionInspectorState } from './pageCompletionEngine.js';
import type { PageExperienceInput, PageExperienceImplementationJob } from './types.js';

export type DesignReconstructionKernelServices = {
  measurement: true;
  layoutInference: true;
  authorityBoundary: true;
  assetDiscovery: true;
  multiAssetJobs: true;
  founderApprovals: true;
  implementation: true;
  capture: true;
  diff: true;
  correction: true;
  verification: true;
  interactionCompletion: true;
};

export const DESIGN_RECONSTRUCTION_KERNEL_SERVICES: DesignReconstructionKernelServices = {
  measurement: true,
  layoutInference: true,
  authorityBoundary: true,
  assetDiscovery: true,
  multiAssetJobs: true,
  founderApprovals: true,
  implementation: true,
  capture: true,
  diff: true,
  correction: true,
  verification: true,
  interactionCompletion: true,
};

export function runDesignReconstructionKernel(input: {
  workspace: 'SKINS' | 'PAGES' | 'ASSETS';
  pageExperience: PageExperienceInput;
  /** P0.VR.8-SRF — optional screen replication golden case */
  screenReplicationGoldenCase?: 'NDX_OVERVIEW_MOBILE';
}) {
  const pageJob = runPageCompletionIntelligence(input.pageExperience);
  const rriInspector = buildReferenceReconstructionInspectorState();
  const multiAssetJob =
    input.workspace === 'SKINS' || input.workspace === 'ASSETS'
      ? buildSkinsMobileMultiAssetReconstructionJob({
          liveColorSwatchBrands: ['FRONTAL_SLAYER', 'AIO', 'ASTRAL_WORLD', 'STUDIO_WORLD'],
        })
      : null;
  const founderActions = multiAssetJob ? syncFounderActionsFromJob(multiAssetJob) : [];
  const pageInspector = buildPageCompletionInspectorState(pageJob);

  const base = {
    kernel: DESIGN_RECONSTRUCTION_KERNEL_SERVICES,
    workspace: input.workspace,
    pageJob,
    pageInspector,
    rriInspector,
    multiAssetJob,
    founderActions,
    assetJobLinked: Boolean(multiAssetJob && pageJob.assetJobs.length > 0),
  };

  if (input.screenReplicationGoldenCase) {
    return {
      ...base,
      screenReplicationGoldenCase: input.screenReplicationGoldenCase,
    };
  }

  return base;
}

export function pagesPipelineInheritsSkinsKernel(): boolean {
  return DESIGN_RECONSTRUCTION_KERNEL_SERVICES.interactionCompletion && DESIGN_RECONSTRUCTION_KERNEL_SERVICES.multiAssetJobs;
}

export function assetsPipelineLinkedToPageJob(job: PageExperienceImplementationJob): boolean {
  return job.assetJobs.length > 0;
}
