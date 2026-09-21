/**
 * P0.VR.PAGE-CONCEPT-FETCH-ABORT-ASYNC-RUN1 — server-side generation run model.
 */

import type {
  PageConceptGeneratedArtifact,
  PageConceptGenerationPlan,
  PageConceptGenerationRunResult,
  PageConceptGenerationState,
  PageConceptGenerationStatus,
  PageConceptPipelineSet,
} from './types.js';

export type PageConceptServerRunStatus =
  | 'QUEUED'
  | 'CGPT_RUNNING'
  | 'GPT2_RUNNING'
  | 'NBP_RUNNING'
  | 'PARTIAL'
  | 'READY_FOR_REVIEW'
  | 'FAILED'
  | 'CANCELLED';

export type PageConceptServerRun = {
  runId: string;
  projectId: string;
  pageId: string;
  founderEmail: string;
  dryRun: boolean;
  status: PageConceptServerRunStatus;
  currentStage: string | null;
  cgptStatus: 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED';
  gpt2Status: 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED';
  nbpStatus: 'PENDING' | 'RUNNING' | 'COMPLETE' | 'PARTIAL' | 'FAILED';
  createdAt: string;
  startedAt: string | null;
  updatedAt: string;
  completedAt: string | null;
  error: string | null;
  plan: PageConceptGenerationPlan | null;
  pipelineSet: PageConceptPipelineSet | null;
  jobs: PageConceptGeneratedArtifact[];
  generationStatus: PageConceptGenerationStatus;
  inputState: PageConceptGenerationState;
};

export type PageConceptRunProgress = Pick<
  PageConceptServerRun,
  | 'status'
  | 'currentStage'
  | 'cgptStatus'
  | 'gpt2Status'
  | 'nbpStatus'
  | 'generationStatus'
  | 'plan'
  | 'pipelineSet'
  | 'jobs'
  | 'error'
  | 'updatedAt'
  | 'completedAt'
>;

export type PageConceptServerRunSnapshot = {
  runId: string;
  projectId: string;
  pageId: string;
  status: PageConceptServerRunStatus;
  currentStage: string | null;
  cgptStatus: PageConceptServerRun['cgptStatus'];
  gpt2Status: PageConceptServerRun['gpt2Status'];
  nbpStatus: PageConceptServerRun['nbpStatus'];
  dryRun: boolean;
  error: string | null;
  generationStatus: PageConceptGenerationStatus;
  plan: PageConceptGenerationPlan | null;
  pipelineSet: PageConceptPipelineSet | null;
  jobs: PageConceptGeneratedArtifact[];
  updatedAt: string;
  completedAt: string | null;
};

export function pageConceptServerRunIsTerminal(status: PageConceptServerRunStatus): boolean {
  return (
    status === 'READY_FOR_REVIEW' ||
    status === 'FAILED' ||
    status === 'CANCELLED' ||
    status === 'PARTIAL'
  );
}

export function pageConceptServerRunToResult(run: PageConceptServerRun): PageConceptGenerationRunResult | null {
  if (!run.plan || !run.pipelineSet) return null;
  return { plan: run.plan, pipelineSet: run.pipelineSet, jobs: run.jobs };
}
