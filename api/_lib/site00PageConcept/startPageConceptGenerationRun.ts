import type { PageConceptServerRun } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';
import { validateIncomingPageConceptCaptures } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/validateIncomingPageConceptCaptures.js';
import { PAGE_CONCEPT_TARGET_TYPE } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/constants.js';
import { executePageConceptGeneration } from './executePageConceptGenerationRun.js';
import {
  getPageConceptServerRun,
  patchPageConceptServerRun,
  putPageConceptServerRun,
} from './pageConceptGenerationRunStore.js';
import type { RunPageConceptGenerationInput } from './runPageConceptGeneration.js';
import { clearPageConceptCgptStageLock } from './pageConceptCgptStageLock.js';
import { cgptSubstepsForStatusApi } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptSubstepRun.js';
import { pageConceptProgressEventsAfterSequence } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProgressEvents.js';

export type StartPageConceptGenerationRunInput = RunPageConceptGenerationInput & {
  founderEmail: string;
  dryRun?: boolean;
  retryCgptOnly?: boolean;
  resumeRunId?: string;
};

export function createPageConceptGenerationRunId(): string {
  return `pcgr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function startPageConceptGenerationRun(input: StartPageConceptGenerationRunInput): {
  runId: string;
  status: 'QUEUED';
} {
  if (!input.dryRun && !input.founderConfirmedSpend) {
    throw new Error('SPEND_GUARD: founder confirmation required');
  }
  if (input.state.targetType !== PAGE_CONCEPT_TARGET_TYPE) throw new Error('PAGE_TARGET_REQUIRED');

  const captureValidation = validateIncomingPageConceptCaptures({
    projectId: input.state.projectId,
    pageId: input.state.pageId,
    mobileCapture: input.mobileCapture,
    desktopCapture: input.desktopCapture,
  });
  if (!captureValidation.ok) {
    throw new Error(captureValidation.code);
  }

  const resumeRunId = input.resumeRunId?.trim() || null;
  const continueNbpAfterGpt2Review = input.continueNbpAfterGpt2Review === true;
  const continueGpt2AfterCgptReview = input.continueGpt2AfterCgptReview === true;
  const continueDualRenderTest = input.continueDualRenderTest === true;
  const regenerateDualRenderLane = input.regenerateDualRenderLane ?? null;
  const existing =
    resumeRunId &&
    (input.retryCgptOnly ||
      continueNbpAfterGpt2Review ||
      continueGpt2AfterCgptReview ||
      continueDualRenderTest ||
      regenerateDualRenderLane) ?
      getPageConceptServerRun(resumeRunId)
    : null;
  if (
    resumeRunId &&
    (input.retryCgptOnly ||
      continueNbpAfterGpt2Review ||
      continueGpt2AfterCgptReview ||
      continueDualRenderTest ||
      regenerateDualRenderLane) &&
    !existing
  ) {
    throw new Error('RUN_NOT_FOUND');
  }
  if (continueGpt2AfterCgptReview && existing?.pipelineSet) {
    input = {
      ...input,
      state: {
        ...input.state,
        pipelineSet: existing.pipelineSet,
        generationJobs: existing.jobs.length ? existing.jobs : input.state.generationJobs,
        generationStatus: 'CGPT_AWAITING_FOUNDER_REVIEW',
      },
    };
  }
  if (continueNbpAfterGpt2Review && existing?.pipelineSet) {
    input = {
      ...input,
      state: {
        ...input.state,
        pipelineSet: existing.pipelineSet,
        generationJobs: existing.jobs.length ? existing.jobs : input.state.generationJobs,
        generationStatus: 'GPT2_AWAITING_FOUNDER_REVIEW',
      },
    };
  }
  if ((continueDualRenderTest || regenerateDualRenderLane) && existing?.pipelineSet) {
    input = {
      ...input,
      state: {
        ...input.state,
        pipelineSet: existing.pipelineSet,
        generationJobs: existing.jobs.length ? existing.jobs : input.state.generationJobs,
        dualRenderTestRun: input.state.dualRenderTestRun ?? null,
        generationStatus:
          regenerateDualRenderLane ? 'DUAL_RENDER_TEST_RUNNING' : (
            input.state.generationStatus
          ),
      },
    };
  }

  const runId = existing?.runId ?? createPageConceptGenerationRunId();
  const now = new Date().toISOString();
  const run: PageConceptServerRun = {
    runId,
    projectId: input.state.projectId,
    pageId: input.state.pageId,
    founderEmail: input.founderEmail,
    dryRun: input.dryRun === true,
    status: 'QUEUED',
    currentStage: 'QUEUED',
    cgptStatus: existing && input.retryCgptOnly ? 'PENDING' : 'PENDING',
    gpt2Status: existing?.gpt2Status ?? 'PENDING',
    nbpStatus: existing?.nbpStatus ?? 'PENDING',
    cgptMeta: input.retryCgptOnly ? null : (existing?.cgptMeta ?? null),
    panelProgress: null,
    cgptSubsteps: null,
    createdAt: existing?.createdAt ?? now,
    startedAt: null,
    updatedAt: now,
    completedAt: null,
    error: null,
    plan: null,
    pipelineSet: null,
    jobs: [],
    generationStatus: input.dryRun ? 'CGPT_RUNNING' : 'CGPT_RUNNING',
    inputState: input.retryCgptOnly && existing ? existing.inputState : input.state,
    progressEvents: existing?.progressEvents ?? [],
    latestProgressSequence: existing?.latestProgressSequence ?? 0,
  };
  putPageConceptServerRun(run);

  if (input.retryCgptOnly) {
    clearPageConceptCgptStageLock(runId);
  }

  void runPageConceptGenerationInBackground(runId, input, {
    retryCgptOnly: input.retryCgptOnly === true,
    continueNbpAfterGpt2Review,
    continueGpt2AfterCgptReview,
    continueDualRenderTest,
    regenerateDualRenderLane,
    retryGpt2Only: input.retryGpt2Only === true,
    regenerateNbpOnly: input.regenerateNbpOnly === true,
  });
  return { runId, status: 'QUEUED' };
}

async function runPageConceptGenerationInBackground(
  runId: string,
  input: StartPageConceptGenerationRunInput,
  flags: {
    retryCgptOnly?: boolean;
    continueNbpAfterGpt2Review?: boolean;
    continueGpt2AfterCgptReview?: boolean;
    retryGpt2Only?: boolean;
    regenerateNbpOnly?: boolean;
    continueDualRenderTest?: boolean;
    regenerateDualRenderLane?: 'GPT2_DIRECT' | 'NBP' | null;
  } = {},
): Promise<void> {
  const startedAt = new Date().toISOString();
  patchPageConceptServerRun(runId, {
    status: 'CGPT_RUNNING',
    currentStage: 'CGPT_STARTING',
    cgptStatus: 'RUNNING',
    generationStatus: 'CGPT_RUNNING',
    error: null,
    updatedAt: startedAt,
    completedAt: null,
  });
  const current = getPageConceptServerRun(runId);
  if (current) {
    putPageConceptServerRun({ ...current, startedAt });
  }

  try {
    await executePageConceptGeneration(input, {
      runId,
      dryRun: input.dryRun,
      retryCgptOnly: flags.retryCgptOnly === true,
      continueNbpAfterGpt2Review: flags.continueNbpAfterGpt2Review === true,
      continueGpt2AfterCgptReview: flags.continueGpt2AfterCgptReview === true,
      retryGpt2Only: flags.retryGpt2Only === true,
      regenerateNbpOnly: flags.regenerateNbpOnly === true,
      continueDualRenderTest: flags.continueDualRenderTest === true,
      regenerateDualRenderLane: flags.regenerateDualRenderLane ?? null,
      onProgress: (patch) => {
        patchPageConceptServerRun(runId, patch);
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'GENERATION_FAILED';
    patchPageConceptServerRun(runId, {
      status: 'FAILED',
      currentStage: 'FAILED',
      error: message,
      generationStatus: 'FAILED',
      completedAt: new Date().toISOString(),
    });
  }
}

export function snapshotPageConceptServerRun(runId: string, afterSequence = 0) {
  const run = getPageConceptServerRun(runId);
  if (!run) return null;
  const progressEventsAfterSequence = pageConceptProgressEventsAfterSequence(
    run.progressEvents ?? [],
    afterSequence,
  );
  return {
    runId: run.runId,
    projectId: run.projectId,
    pageId: run.pageId,
    status: run.status,
    currentStage: run.currentStage,
    cgptStatus: run.cgptStatus,
    gpt2Status: run.gpt2Status,
    nbpStatus: run.nbpStatus,
    dryRun: run.dryRun,
    error: run.error,
    generationStatus: run.generationStatus,
    plan: run.plan,
    pipelineSet: run.pipelineSet,
    jobs: run.jobs,
    cgptMeta: run.cgptMeta,
    panelProgress: run.panelProgress,
    cgptSubsteps: run.cgptSubsteps,
    cgptSubstepsStatus: cgptSubstepsForStatusApi(run.cgptSubsteps),
    currentCgptSubstep: run.cgptSubsteps?.currentCgptSubstep ?? run.panelProgress?.currentSubstep ?? null,
    updatedAt: run.updatedAt,
    completedAt: run.completedAt,
    createdAt: run.createdAt,
    startedAt: run.startedAt,
    latestProgressSequence: run.latestProgressSequence ?? 0,
    progressEventsAfterSequence,
  };
}
