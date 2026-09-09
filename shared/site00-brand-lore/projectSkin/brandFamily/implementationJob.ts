/**
 * SkinScreenImplementationJob — handoff to P0.VR.6 / P0.VR.6R2 fidelity pipeline.
 */

import { getModuleFunctionalContract } from './functionalContract.js';
import { getSkinContinuityRecord } from './continuity.js';
import { getBrandFamilySkinByKey } from './registry.js';
import type { SkinScreenAuthority, SkinScreenImplementationJob } from './types.js';

const jobStore = new Map<string, SkinScreenImplementationJob>();

export function createSkinScreenImplementationJob(authority: SkinScreenAuthority): SkinScreenImplementationJob | null {
  if (authority.status !== 'APPROVED' || !authority.referenceAssetId) return null;

  const skin = getBrandFamilySkinByKey(authority.brandFamilySkinId);
  if (!skin) return null;

  const functionalContract = getModuleFunctionalContract(authority.screenType);
  const continuityRecord = getSkinContinuityRecord(skin.id, skin.version);

  const job: SkinScreenImplementationJob = {
    jobId: `skin-job-${authority.id}`,
    brandFamilySkinId: authority.brandFamilySkinId,
    moduleId: authority.moduleId,
    screenType: authority.screenType,
    viewport: authority.viewport,
    referenceId: authority.referenceAssetId,
    functionalContract,
    continuityRecord,
    fidelityEnvelope: {
      authorityMode: 'DESIGN_AUTHORITY',
      fidelityMode: 'EXACT',
      visualConvergenceRequired: authority.visualConvergenceRequired,
    },
    status: 'READY',
    createdAt: new Date().toISOString(),
  };
  jobStore.set(job.jobId, job);
  return job;
}

export function buildFidelityContractInputFromAuthority(authority: SkinScreenAuthority, projectId: string) {
  return {
    referenceId: authority.referenceAssetId!,
    projectId,
    pageId: `${authority.moduleId}-${authority.screenType}`,
    route: `/projects/${projectId}/${authority.moduleId.toLowerCase()}`,
    viewport: authority.viewport === 'DESKTOP' ? ('DESKTOP' as const) : ('MOBILE' as const),
    authorityMode: 'DESIGN_AUTHORITY' as const,
    fidelityMode: 'EXACT' as const,
  };
}

export function getSkinScreenImplementationJob(jobId: string): SkinScreenImplementationJob | null {
  return jobStore.get(jobId) ?? null;
}

export function clearImplementationJobsForTest(): void {
  jobStore.clear();
}
