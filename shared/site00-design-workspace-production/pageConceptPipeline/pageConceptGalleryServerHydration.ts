import type { PageConceptGenerationRunResult, PageConceptGenerationState } from './types.js';
import type { PageConceptServerRunSnapshot } from './pageConceptServerRun.js';
import { pageConceptGenerationStateHasReadyMobileArtifacts } from './pageConceptGalleryHydration.js';
import {
  applyPageConceptPipelineSet,
  mergePageConceptArtifactsIntoGallery,
  mergePageConceptGenerationJobs,
  registerPageConceptGenerationJobs,
} from './generationWorkflow.js';
import {
  preserveLocalViewportAuthorityFamilyProgressAfterServerMerge,
  rehydrateViewportAuthorityFamilyFromPipelineSignals,
} from './pageConceptViewportAuthorityFamilyPersistence.js';
import { recoverStalePageConceptInFlightGenerationState } from './pageConceptInFlightRecovery.js';
import { ensureGpt2MobileConceptCatalog } from './pageConceptGpt2MobileConceptCatalog.js';

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
  options?: { preferServerGallery?: boolean; forceGalleryRestore?: boolean },
): boolean {
  if (!pageConceptServerRunHasReadyMobileGallery(server)) return false;

  if (options?.forceGalleryRestore) {
    const localReady = pageConceptGenerationStateHasReadyMobileArtifacts(local);
    const localTs = pageConceptGenerationStateGalleryArtifactTimestamp(local);
    const serverTs = pageConceptServerRunMaxArtifactTimestamp(server);
    if (!localReady) return true;
    if (serverTs >= localTs) return true;
  }

  const localReady = pageConceptGenerationStateHasReadyMobileArtifacts(local);
  const localTs = pageConceptGenerationStateGalleryArtifactTimestamp(local);
  const serverTs = pageConceptServerRunMaxArtifactTimestamp(server);
  const localRunId = local.activeGenerationRunId ?? local.activeReviewRunId ?? null;

  if (options?.preferServerGallery) {
    const localFamily = local.pipelineSet?.viewportAuthorityFamily;
    const serverFamily = server.pipelineSet?.viewportAuthorityFamily;
    if (
      localReady &&
      localFamily?.selectedMobileConceptId &&
      !serverFamily?.selectedMobileConceptId
    ) {
      const localFamilyTs = localFamily.updatedAt ? Date.parse(localFamily.updatedAt) : 0;
      const serverUpdated = server.updatedAt ? Date.parse(server.updatedAt) : 0;
      if (
        Number.isFinite(localFamilyTs) &&
        localFamilyTs > 0 &&
        (!Number.isFinite(serverUpdated) || localFamilyTs >= serverUpdated)
      ) {
        return false;
      }
    }
    const localInFlight =
      local.generationStatus === 'CGPT_RUNNING' ||
      local.generationStatus === 'CGPT_RATE_LIMITED' ||
      local.generationStatus === 'GPT2_RUNNING' ||
      local.generationStatus === 'NBP_RUNNING';
    if (localInFlight && !localReady && pageConceptServerRunHasReadyMobileGallery(server)) {
      return true;
    }
    return true;
  }

  if (!localReady) return true;
  if (serverTs > localTs) return true;
  if (localRunId && localRunId !== server.runId && serverTs >= localTs) return true;

  return false;
}

export type MergePageConceptServerRunSnapshotOptions = {
  /** Gallery mount replaces GPT2 mobile jobs; poll/progress merges all job types. */
  mobileJobMode?: 'replace' | 'merge';
  syncRunIdentity?: boolean;
  /** When false, keep server run generationStatus even if stale CGPT_RUNNING with READY mobile. */
  normalizeInFlightStatus?: boolean;
  hasFounderRunSession?: boolean;
};

/**
 * Merge a durable server run into local generation state without clobbering founder
 * viewport-family progress (select/confirm/experience).
 */
export function mergePageConceptGenerationStateWithServerRunSnapshot(
  local: PageConceptGenerationState,
  run: PageConceptServerRunSnapshot,
  options?: MergePageConceptServerRunSnapshotOptions,
): PageConceptGenerationState {
  const mobileJobMode = options?.mobileJobMode ?? 'replace';
  const syncRunIdentity = options?.syncRunIdentity ?? true;

  let next: PageConceptGenerationState = {
    ...local,
    ...(syncRunIdentity ?
      {
        activeGenerationRunId: run.runId,
        activeReviewRunId: run.runId,
        generationStatus: run.generationStatus,
        activeGenerationStage: run.currentStage,
      }
    : {}),
  };
  if (run.pipelineSet) {
    next = applyPageConceptPipelineSet(next, run.pipelineSet);
  }
  const mobileJobs = run.jobs.filter((j) => j.provider === 'GPT2_MOBILE');
  if (mobileJobMode === 'replace') {
    const preservedJobs = next.generationJobs.filter((j) => j.provider !== 'GPT2_MOBILE');
    if (mobileJobs.length > 0) {
      next = registerPageConceptGenerationJobs({ ...next, generationJobs: preservedJobs }, mobileJobs);
    } else if (run.jobs.length > 0) {
      next = mergePageConceptGenerationJobs({ ...next, generationJobs: preservedJobs }, run.jobs);
    } else {
      next = { ...next, generationJobs: preservedJobs };
    }
  } else if (run.jobs.length > 0) {
    next = mergePageConceptGenerationJobs(next, run.jobs);
  }
  const withGallery = mergePageConceptArtifactsIntoGallery(next);
  const merged = preserveLocalViewportAuthorityFamilyProgressAfterServerMerge(local, withGallery);
  let normalized = rehydrateViewportAuthorityFamilyFromPipelineSignals(merged);
  if (options?.normalizeInFlightStatus !== false) {
    normalized = recoverStalePageConceptInFlightGenerationState(
      ensureGpt2MobileConceptCatalog(normalized),
      options?.hasFounderRunSession ?? false,
    );
  }
  return normalized;
}

/** Replace mobile GPT2 jobs from a server run and rebuild the in-memory gallery store inputs. */
export function applyPageConceptServerRunSnapshotForGalleryMount(
  state: PageConceptGenerationState,
  run: PageConceptServerRunSnapshot,
): PageConceptGenerationState {
  return mergePageConceptGenerationStateWithServerRunSnapshot(state, run, {
    mobileJobMode: 'replace',
    syncRunIdentity: true,
  });
}

/** Terminal generation run apply (CGPT/GPT2 finish) — preserves founder viewport-family progress. */
export function mergePageConceptTerminalRunResultIntoState(
  local: PageConceptGenerationState,
  terminalRun: PageConceptServerRunSnapshot,
  result: PageConceptGenerationRunResult,
  options?: { mergeJobsOnly?: boolean },
): PageConceptGenerationState {
  const run: PageConceptServerRunSnapshot = {
    ...terminalRun,
    pipelineSet: result.pipelineSet,
    jobs: [...result.jobs],
  };
  let next = mergePageConceptGenerationStateWithServerRunSnapshot(local, run, {
    mobileJobMode: options?.mergeJobsOnly ? 'merge' : 'replace',
    syncRunIdentity: true,
  });
  if (terminalRun.generationStatus === 'GPT2_AWAITING_FOUNDER_REVIEW') {
    next = { ...next, generationStatus: 'GPT2_AWAITING_FOUNDER_REVIEW' };
  } else if (terminalRun.generationStatus === 'CGPT_AWAITING_FOUNDER_REVIEW') {
    next = { ...next, generationStatus: 'CGPT_AWAITING_FOUNDER_REVIEW' };
  } else if (terminalRun.generationStatus === 'GPT2_MOBILE_AWAITING_SELECTION') {
    next = { ...next, generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION' };
  } else if (next.pipelineSet?.creativeInjectionError && !next.pipelineSet.creativeInjection) {
    next = { ...next, generationStatus: 'FAILED' };
  } else if (next.pipelineSet?.gpt2AuthorityError && !next.pipelineSet.gpt2AuthorityConcept) {
    next = { ...next, generationStatus: 'FAILED' };
  }
  return recoverStalePageConceptInFlightGenerationState(ensureGpt2MobileConceptCatalog(next), false);
}
