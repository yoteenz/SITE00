/**
 * Restore GPT2 mobile gallery from archived run branches (local) when active branch was reset.
 */

import { pageConceptGenerationStateHasReadyMobileArtifacts } from './pageConceptGalleryHydration.js';
import { mergePageConceptArtifactsIntoGallery, registerPageConceptGenerationJobs } from './generationWorkflow.js';
import { ensureGpt2MobileConceptCatalog } from './pageConceptGpt2MobileConceptCatalog.js';
import { recoverStalePageConceptInFlightGenerationState } from './pageConceptInFlightRecovery.js';
import { rehydrateViewportAuthorityFamilyFromPipelineSignals } from './pageConceptViewportAuthorityFamilyPersistence.js';
import type { PageConceptArchivedRun, PageConceptGenerationState } from './types.js';

function archivedRunHasReadyMobile(entry: PageConceptArchivedRun): boolean {
  if (entry.pipelineSet.mobileConcepts?.some((c) => c.status === 'READY')) return true;
  return entry.generationJobs.some((j) => j.provider === 'GPT2_MOBILE' && j.status === 'READY');
}

function archivedRunRecency(entry: PageConceptArchivedRun): number {
  const fromArchive = Date.parse(entry.archivedAt) || 0;
  let maxJob = 0;
  for (const job of entry.generationJobs) {
    if (job.provider !== 'GPT2_MOBILE') continue;
    const t = Date.parse(job.createdAt ?? '') || 0;
    if (t > maxJob) maxJob = t;
  }
  return Math.max(fromArchive, maxJob);
}

/** Pick newest archived branch that still has READY mobile concept artifacts. */
export function pickNewestArchivedPageConceptRunWithReadyMobile(
  state: PageConceptGenerationState,
): PageConceptArchivedRun | null {
  const runs = state.archivedRuns ?? [];
  let best: PageConceptArchivedRun | null = null;
  let bestTs = 0;
  for (const entry of runs) {
    if (!archivedRunHasReadyMobile(entry)) continue;
    const ts = archivedRunRecency(entry);
    if (!best || ts > bestTs) {
      best = entry;
      bestTs = ts;
    }
  }
  return best;
}

export function restorePageConceptMobileGalleryFromArchivedRuns(
  state: PageConceptGenerationState,
): PageConceptGenerationState | null {
  if (pageConceptGenerationStateHasReadyMobileArtifacts(state)) return null;
  const entry = pickNewestArchivedPageConceptRunWithReadyMobile(state);
  if (!entry) return null;

  const mobileJobs = entry.generationJobs.filter((j) => j.provider === 'GPT2_MOBILE');
  let next: PageConceptGenerationState = {
    ...state,
    pipelineSet: entry.pipelineSet,
    activeGenerationRunId: entry.runId,
    activeReviewRunId: entry.runId,
    generationJobs: entry.generationJobs.filter((j) => j.provider !== 'GPT2_MOBILE'),
  };
  if (mobileJobs.length > 0) {
    next = registerPageConceptGenerationJobs(next, mobileJobs);
  }
  next = mergePageConceptArtifactsIntoGallery(next);
  next = ensureGpt2MobileConceptCatalog(next);
  next = recoverStalePageConceptInFlightGenerationState(next, false);
  return rehydrateViewportAuthorityFamilyFromPipelineSignals(next);
}

/** Known durable run ids to retry when latest-for-page lookup misses (archived branches, active run pointer). */
export function collectPageConceptRestoreRunIdCandidates(state: PageConceptGenerationState): readonly string[] {
  const ids = new Set<string>();
  for (const entry of state.archivedRuns ?? []) {
    if (entry.runId?.trim()) ids.add(entry.runId.trim());
  }
  for (const id of [state.activeGenerationRunId, state.activeReviewRunId]) {
    if (id?.trim()) ids.add(id.trim());
  }
  return [...ids];
}
