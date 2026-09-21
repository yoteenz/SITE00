/**
 * P0.VR.PAGE-CONCEPT-DUAL-RENDER-ENGINE-TEST1 — dual render test run model + job ids.
 */

import type {
  PageConceptDualRenderLane,
  PageConceptDualRenderLaneJob,
  PageConceptDualRenderTestRun,
  PageConceptGeneratedArtifact,
  PageConceptGenerationStatus,
  PageConceptRenderGroundingMeta,
  PageConceptRenderLaneType,
} from './types.js';

export const PAGE_CONCEPT_DUAL_RENDER_SLOT = 'RENDITION_A' as const;

export function dualRenderTestArtifactId(lane: PageConceptRenderLaneType, viewport: 'MOBILE' | 'DESKTOP'): string {
  return `pcga-DRT-${lane}-RENDITION_A-${viewport}`;
}

export function createDualRenderLaneJob(viewport: 'MOBILE' | 'DESKTOP', lane: PageConceptRenderLaneType): PageConceptDualRenderLaneJob {
  return {
    jobKey: `${lane}-${viewport}`,
    viewport,
    status: 'PENDING',
    artifactId: null,
  };
}

export function createInitialDualRenderTestRun(input: {
  testRunId: string;
  authorityApprovalId: string;
  approvedAuthorityArtifactId: string;
  upstreamCgptRunId: string;
  upstreamGpt2AuthorityRunId: string;
}): PageConceptDualRenderTestRun {
  const now = new Date().toISOString();
  return {
    id: input.testRunId,
    renderMode: 'DUAL_RENDER_TEST',
    upstreamCgptRunId: input.upstreamCgptRunId,
    upstreamGpt2AuthorityRunId: input.upstreamGpt2AuthorityRunId,
    approvedAuthorityArtifactId: input.approvedAuthorityArtifactId,
    authorityApprovalId: input.authorityApprovalId,
    status: 'RUNNING',
    founderDecisionStatus: 'PENDING_REVIEW',
    createdAt: now,
    gpt2Lane: {
      laneType: 'GPT2_DIRECT',
      status: 'PENDING',
      mobile: createDualRenderLaneJob('MOBILE', 'GPT2_DIRECT'),
      desktop: createDualRenderLaneJob('DESKTOP', 'GPT2_DIRECT'),
    },
    nbpLane: {
      laneType: 'NBP',
      status: 'PENDING',
      mobile: createDualRenderLaneJob('MOBILE', 'NBP'),
      desktop: createDualRenderLaneJob('DESKTOP', 'NBP'),
    },
  };
}

export function syncDualRenderLaneFromJobs(
  run: PageConceptDualRenderTestRun,
  jobs: readonly PageConceptGeneratedArtifact[],
): PageConceptDualRenderTestRun {
  const patchLane = (lane: PageConceptDualRenderLane): PageConceptDualRenderLane => {
    const patchJob = (job: PageConceptDualRenderLaneJob, laneType: PageConceptRenderLaneType): PageConceptDualRenderLaneJob => {
      const artifactId = dualRenderTestArtifactId(laneType, job.viewport);
      const artifact = jobs.find((j) => j.artifactId === artifactId);
      if (!artifact) return job;
      const status: PageConceptDualRenderLaneJob['status'] =
        artifact.status === 'READY' ? 'COMPLETE'
        : artifact.status === 'FAILED' ? 'FAILED'
        : artifact.status === 'RUNNING' ? 'RUNNING'
        : 'PENDING';
      return {
        ...job,
        artifactId,
        status,
      };
    };
    const mobile = patchJob(lane.mobile, lane.laneType);
    const desktop = patchJob(lane.desktop, lane.laneType);
    const statuses = [mobile.status, desktop.status];
    const laneStatus =
      statuses.every((s) => s === 'COMPLETE') ? 'READY'
      : statuses.some((s) => s === 'FAILED') && statuses.some((s) => s === 'COMPLETE') ? 'PARTIAL'
      : statuses.every((s) => s === 'FAILED') ? 'FAILED'
      : statuses.some((s) => s === 'RUNNING' || s === 'COMPLETE') ? 'RUNNING'
      : 'PENDING';
    return { ...lane, mobile, desktop, status: laneStatus };
  };

  const gpt2Lane = patchLane(run.gpt2Lane);
  const nbpLane = patchLane(run.nbpLane);
  const allComplete =
    gpt2Lane.mobile.status === 'COMPLETE' &&
    gpt2Lane.desktop.status === 'COMPLETE' &&
    nbpLane.mobile.status === 'COMPLETE' &&
    nbpLane.desktop.status === 'COMPLETE';
  const anyFailed =
    [gpt2Lane, nbpLane].some((l) => l.status === 'FAILED' || l.status === 'PARTIAL');

  return {
    ...run,
    gpt2Lane,
    nbpLane,
    status: allComplete ? 'READY_FOR_REVIEW' : anyFailed ? 'FAILED' : 'RUNNING',
  };
}

export function pageConceptDualRenderTestActive(status: PageConceptGenerationStatus): boolean {
  return status === 'DUAL_RENDER_TEST_RUNNING' || status === 'DUAL_RENDER_TEST_REVIEW';
}

export function buildRenderGroundingMeta(input: {
  lane: PageConceptRenderLaneType;
  renderMode: 'DUAL_RENDER_TEST';
  authoritySourceRunId: string;
  authorityArtifactId: string;
  implementationCaptureRole: 'FUNCTIONAL_REFERENCE_ONLY' | 'OMITTED';
  skinGroundingPresent: boolean;
  identityGroundingPresent: boolean;
  functionContractPresent: boolean;
}): PageConceptRenderGroundingMeta {
  return {
    authorityPriorityUsed: true,
    implementationCaptureRole: input.implementationCaptureRole,
    skinGroundingPresent: input.skinGroundingPresent,
    identityGroundingPresent: input.identityGroundingPresent,
    functionContractPresent: input.functionContractPresent,
    forbiddenDriftApplied: input.skinGroundingPresent,
    renderLaneType: input.lane,
    renderMode: input.renderMode,
    authoritySourceRunId: input.authoritySourceRunId,
    authorityArtifactId: input.authorityArtifactId,
  };
}
