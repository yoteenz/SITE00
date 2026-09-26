import type { PageConceptGenerationState } from './types.js';
import type { PageConceptServerRunSnapshot } from './pageConceptServerRun.js';
import { pageConceptGenerationStateHasReadyMobileArtifacts } from './pageConceptGalleryHydration.js';
import {
  applyPageConceptPipelineSet,
  mergePageConceptArtifactsIntoGallery,
  mergePageConceptGenerationJobs,
  registerPageConceptGenerationJobs,
} from './generationWorkflow.js';

export const PAGE_CONCEPT_GALLERY_SERVER_MOUNT_EVENT = 'site00:page-concept-gallery-server-mount';

export type PageConceptGalleryServerMountTrace = {
  phase: 'start' | 'skipped' | 'applied' | 'failed';
  reason?: string;
  runId?: string | null;
  serverArtifactTs?: number;
  localArtifactTs?: number;
  pageIdsTried?: readonly string[];
};

/** Artifact recency for gallery parity — excludes in-flight runStartedAt noise. */
export function pageConceptGenerationStateGalleryArtifactTimestamp(state: PageConceptGenerationState): number {
  let max = 0;
  for (const job of state.generationJobs) {
    if (job.provider !== 'GPT2_MOBILE') continue;
    const t = job.createdAt ? Date.parse(job.createdAt) : 0;
    if (Number.isFinite(t) && t > max) max = t;
  }
  for (const concept of state.pipelineSet?.mobileConcepts ?? []) {
    const t = concept.createdAt ? Date.parse(concept.createdAt) : 0;
    if (Number.isFinite(t) && t > max) max = t;
  }
  return max;
}

export function pageConceptServerRunHasReadyMobileGallery(
  run: Pick<PageConceptServerRunSnapshot, 'jobs' | 'pipelineSet'>,
): boolean {
  if (run.jobs.some((j) => j.provider === 'GPT2_MOBILE' && j.status === 'READY')) return true;
  if (run.pipelineSet?.mobileConcepts?.some((c) => c.status === 'READY')) return true;
  return false;
}

export function pageConceptServerRunMaxArtifactTimestamp(run: PageConceptServerRunSnapshot): number {
  let max = 0;
  for (const job of run.jobs) {
    const t = job.createdAt ? Date.parse(job.createdAt) : 0;
    if (Number.isFinite(t) && t > max) max = t;
  }
  for (const concept of run.pipelineSet?.mobileConcepts ?? []) {
    const t = concept.createdAt ? Date.parse(concept.createdAt) : 0;
    if (Number.isFinite(t) && t > max) max = t;
  }
  for (const iso of [run.updatedAt, run.completedAt, run.createdAt]) {
    const t = iso ? Date.parse(iso) : 0;
    if (Number.isFinite(t) && t > max) max = t;
  }
  return max;
}

/**
 * When true, apply a durable server run snapshot over localStorage.
 * With `preferServerGallery` (default for authenticated server mount), Supabase latest run
 * is the cross-browser source of truth — site00.com, tunnel, and new devices stay aligned.
 */
export function shouldReplaceLocalPageConceptStateWithServerRun(
  local: PageConceptGenerationState,
  server: PageConceptServerRunSnapshot,
  options?: { preferServerGallery?: boolean },
): boolean {
  if (!pageConceptServerRunHasReadyMobileGallery(server)) return false;

  const localReady = pageConceptGenerationStateHasReadyMobileArtifacts(local);
  const localTs = pageConceptGenerationStateGalleryArtifactTimestamp(local);
  const serverTs = pageConceptServerRunMaxArtifactTimestamp(server);
  const localRunId = local.activeGenerationRunId ?? local.activeReviewRunId ?? null;

  if (options?.preferServerGallery) {
    return true;
  }

  if (!localReady) return true;
  if (serverTs > localTs) return true;
  if (localRunId && localRunId !== server.runId && serverTs >= localTs) return true;

  return false;
}

/** Replace mobile GPT2 jobs from a server run and rebuild the in-memory gallery store inputs. */
export function applyPageConceptServerRunSnapshotForGalleryMount(
  state: PageConceptGenerationState,
  run: PageConceptServerRunSnapshot,
): PageConceptGenerationState {
  let next: PageConceptGenerationState = {
    ...state,
    activeGenerationRunId: run.runId,
    activeReviewRunId: run.runId,
    generationStatus: run.generationStatus,
    activeGenerationStage: run.currentStage,
  };
  if (run.pipelineSet) {
    next = applyPageConceptPipelineSet(next, run.pipelineSet);
  }
  const mobileJobs = run.jobs.filter((j) => j.provider === 'GPT2_MOBILE');
  const preservedJobs = next.generationJobs.filter((j) => j.provider !== 'GPT2_MOBILE');
  if (mobileJobs.length > 0) {
    next = registerPageConceptGenerationJobs({ ...next, generationJobs: preservedJobs }, mobileJobs);
  } else if (run.jobs.length > 0) {
    next = mergePageConceptGenerationJobs({ ...next, generationJobs: preservedJobs }, run.jobs);
  } else {
    next = { ...next, generationJobs: preservedJobs };
  }
  return mergePageConceptArtifactsIntoGallery(next);
}
