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
  const existing =
    resumeRunId && input.retryCgptOnly ? getPageConceptServerRun(resumeRunId) : null;
  if (resumeRunId && input.retryCgptOnly && !existing) {
    throw new Error('RUN_NOT_FOUND');
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
  };
  putPageConceptServerRun(run);

  if (input.retryCgptOnly) {
    clearPageConceptCgptStageLock(runId);
  }

  void runPageConceptGenerationInBackground(runId, input, {
    retryCgptOnly: input.retryCgptOnly === true,
  });
  return { runId, status: 'QUEUED' };
}

async function runPageConceptGenerationInBackground(
  runId: string,
  input: StartPageConceptGenerationRunInput,
  flags: { retryCgptOnly?: boolean } = {},
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

export function snapshotPageConceptServerRun(runId: string) {
  const run = getPageConceptServerRun(runId);
  if (!run) return null;
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
    updatedAt: run.updatedAt,
    completedAt: run.completedAt,
  };
}
