/**
 * SkinScreenImplementationJob — handoff to P0.VR.6 / P0.VR.6R2 fidelity pipeline.
 */

import { ingestReferenceWithFidelityContract } from '../../../site00-studio-world-production/visualReconstruction/p0vr7/integration.js';
import {
  ensureConvergenceSessionForContract,
  onImplementationComplete,
} from '../../../site00-studio-world-production/visualReconstruction/p0vr6r2/integration.js';
import { getModuleFunctionalContract } from './functionalContract.js';
import { getSkinContinuityRecord } from './continuity.js';
import { getBrandFamilySkinByKey } from './registry.js';
import { patchSkinScreenAuthority } from './screenAuthority.js';
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
    fidelityContractId: authority.fidelityContractId ?? null,
    convergenceSessionId: authority.convergenceSessionId ?? null,
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

export function startScreenAuthorityImplementation(authority: SkinScreenAuthority, projectId: string) {
  const fidelityInput = buildFidelityContractInputFromAuthority(authority, projectId);
  const contract = ingestReferenceWithFidelityContract({
    referenceId: fidelityInput.referenceId,
    projectId: fidelityInput.projectId,
    pageId: fidelityInput.pageId,
    route: fidelityInput.route,
    viewport: fidelityInput.viewport === 'DESKTOP' ? 'desktop' : 'mobile',
    authorityMode: fidelityInput.authorityMode,
    fidelityMode: fidelityInput.fidelityMode,
  });

  const session = ensureConvergenceSessionForContract(contract);
  patchSkinScreenAuthority(authority.id, {
    implementationStatus: 'IMPLEMENTING',
    fidelityContractId: contract.contractId,
    convergenceSessionId: session?.sessionId ?? null,
  });

  const job = createSkinScreenImplementationJob(authority);
  if (job) {
    job.status = 'IMPLEMENTING';
    job.fidelityContractId = contract.contractId;
    job.convergenceSessionId = session?.sessionId ?? null;
    jobStore.set(job.jobId, job);
  }

  return {
    job,
    contract,
    session,
    fidelityEnvelope: job?.fidelityEnvelope ?? null,
  };
}

export function completeScreenAuthorityImplementation(authority: SkinScreenAuthority) {
  patchSkinScreenAuthority(authority.id, { implementationStatus: 'VISUAL_QA' });

  const job = jobStore.get(`skin-job-${authority.id}`);
  if (job) {
    job.status = 'VISUAL_QA';
    jobStore.set(job.jobId, job);
  }

  if (!authority.fidelityContractId) {
    return { authority, job, contract: null, session: null };
  }

  const { contract, session } = onImplementationComplete({
    contractId: authority.fidelityContractId,
    referencePath: authority.referenceAssetId ?? '',
    livePath: '/tmp/live-capture-placeholder.png',
    liveWidth: 390,
    liveHeight: 844,
  });

  patchSkinScreenAuthority(authority.id, {
    implementationStatus: 'VISUAL_QA',
    visualMatchStatus: 'DRIFT',
    convergenceSessionId: session?.sessionId ?? authority.convergenceSessionId ?? null,
  });

  return { authority, job, contract, session };
}

export function getSkinScreenImplementationJob(jobId: string): SkinScreenImplementationJob | null {
  return jobStore.get(jobId) ?? null;
}

export function clearImplementationJobsForTest(): void {
  jobStore.clear();
}
