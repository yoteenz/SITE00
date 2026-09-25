import type { PageConceptGenerationState } from './types.js';
import type { PageConceptServerRunSnapshot } from './pageConceptServerRun.js';
import { pageConceptGenerationStateHasReadyMobileArtifacts } from './pageConceptGalleryHydration.js';
import { pageConceptGenerationStateMaxArtifactTimestamp } from './pageConceptGenerationStateDiscovery.js';

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
 * When true, apply a durable server run snapshot over localStorage so preview origins
 * (cloud tunnel) match production gallery after founder auth.
 */
export function shouldReplaceLocalPageConceptStateWithServerRun(
  local: PageConceptGenerationState,
  server: PageConceptServerRunSnapshot,
): boolean {
  if (!pageConceptServerRunHasReadyMobileGallery(server)) return false;

  const localReady = pageConceptGenerationStateHasReadyMobileArtifacts(local);
  if (!localReady) return true;

  const localTs = pageConceptGenerationStateMaxArtifactTimestamp(local);
  const serverTs = pageConceptServerRunMaxArtifactTimestamp(server);
  if (serverTs > localTs) return true;

  const localRunId = local.activeGenerationRunId ?? local.activeReviewRunId ?? null;
  if (localRunId && localRunId !== server.runId && serverTs >= localTs) return true;

  return false;
}
