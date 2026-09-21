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
import type { PageConceptCgptProviderTelemetry } from './pageConceptCgpt429.js';
import type { PageConceptPanelProgress } from './pageConceptLiveProgress.js';

export type PageConceptServerRunStatus =
  | 'QUEUED'
  | 'CGPT_RUNNING'
  | 'CGPT_RATE_LIMITED'
  | 'GPT2_RUNNING'
  | 'NBP_RUNNING'
  | 'PARTIAL'
  | 'READY_FOR_REVIEW'
  | 'FAILED'
  | 'CANCELLED';

export type PageConceptCgptStageStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'RATE_LIMITED'
  | 'RETRY_WAIT'
  | 'COMPLETE'
  | 'FAILED';

export type PageConceptCgptRunMeta = {
  idempotencyKey: string;
  attemptNumber: number;
  maxAttempts: number;
  nextRetryAt: string | null;
  lastProviderStatus: number | null;
  lastProviderRequestId: string | null;
  lastErrorCode: string | null;
  dispatchCount: number;
  lastTelemetry: PageConceptCgptProviderTelemetry | null;
};

export type PageConceptServerRun = {
  runId: string;
  projectId: string;
  pageId: string;
  founderEmail: string;
  dryRun: boolean;
  status: PageConceptServerRunStatus;
  currentStage: string | null;
  cgptStatus: PageConceptCgptStageStatus;
  gpt2Status: 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED';
  cgptMeta: PageConceptCgptRunMeta | null;
  panelProgress: PageConceptPanelProgress | null;
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
  | 'cgptMeta'
  | 'panelProgress'
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
  cgptMeta: PageConceptCgptRunMeta | null;
  panelProgress: PageConceptPanelProgress | null;
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

export function pageConceptServerRunToResult(
  run: Pick<PageConceptServerRun, 'plan' | 'pipelineSet' | 'jobs'>,
): PageConceptGenerationRunResult | null {
  if (!run.plan || !run.pipelineSet) return null;
  return { plan: run.plan, pipelineSet: run.pipelineSet, jobs: run.jobs };
}
