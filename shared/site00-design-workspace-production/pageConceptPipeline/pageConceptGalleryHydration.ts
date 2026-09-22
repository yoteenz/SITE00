import {
  listPageConceptCandidates,
  type PageConceptCandidate,
} from '../designProjectBinding/designPageConceptModel.js';
import type { PageViewportId } from '../designProjectBinding/pageViewportAuthority.js';
import { loadPageConceptGenerationState } from './store.js';
import type { PageConceptGenerationState } from './types.js';
import { syncPageConceptGalleryFromGenerationState } from './pageConceptGallerySync.js';

export type PageConceptGalleryEmptyPresentation = {
  message: string | null;
  testId: 'gallery-page-concept-empty' | 'gallery-page-concept-load-failed' | null;
};

function normalizeProjectId(projectId: string): string {
  return projectId.trim().toLowerCase();
}

export function pageConceptGenerationStateHasReadyMobileArtifacts(state: PageConceptGenerationState): boolean {
  if (state.pipelineSet?.pipelineLineage !== 'GPT2_VIEWPORT_FAMILY_TWIN_PIPELINE') {
    return state.generationJobs.some((j) => j.provider === 'GPT2_MOBILE' && j.status === 'READY');
  }
  const concepts = state.pipelineSet?.mobileConcepts ?? [];
  if (concepts.some((c) => c.status === 'READY')) return true;
  return state.generationJobs.some((j) => j.provider === 'GPT2_MOBILE' && j.status === 'READY');
}

function loadGenerationStateForGallery(projectId: string, pageId: string): PageConceptGenerationState {
  const normalized = normalizeProjectId(projectId);
  let state = loadPageConceptGenerationState(normalized, pageId);
  if (
    state.projectId === normalized &&
    (state.pipelineSet?.mobileConcepts?.length || state.generationJobs.length)
  ) {
    return state;
  }
  const raw = loadPageConceptGenerationState(projectId, pageId);
  if (raw.generationJobs.length > 0 || raw.pipelineSet?.mobileConcepts?.length) return raw;
  return state;
}

/** Sync in-memory gallery store from persisted generation state (single source of truth). */
export function refreshPageConceptGalleryFromPersistedState(projectId: string, pageId: string): void {
  const state = loadGenerationStateForGallery(projectId, pageId);
  syncPageConceptGalleryFromGenerationState(state);
  for (const archived of state.archivedRuns ?? []) {
    syncPageConceptGalleryFromGenerationState({
      ...state,
      projectId: state.projectId,
      pageId: state.pageId,
      pipelineSet: archived.pipelineSet,
      generationJobs: archived.generationJobs,
      activeGenerationRunId: state.activeGenerationRunId,
      activeReviewRunId: archived.runId,
    });
  }
}

export function listPageConceptCandidatesHydrated(
  projectId: string,
  pageId: string,
): readonly PageConceptCandidate[] {
  refreshPageConceptGalleryFromPersistedState(projectId, pageId);
  return listPageConceptCandidates(normalizeProjectId(projectId), pageId);
}

export function resolvePageConceptGalleryEmptyPresentation(
  projectId: string,
  pageId: string,
  viewport: PageViewportId,
): PageConceptGalleryEmptyPresentation {
  refreshPageConceptGalleryFromPersistedState(projectId, pageId);
  const slug = normalizeProjectId(projectId);
  const all = listPageConceptCandidates(slug, pageId);
  const mobileReady = all.filter(
    (c) =>
      c.viewportScope === viewport ||
      (viewport === 'MOBILE' && c.artifactRole === 'MOBILE_CANDIDATE'),
  );
  if (
    mobileReady.some((c) => c.artifactStatus === 'READY' || c.mobileVisualReference || c.visualReference)
  ) {
    return { message: null, testId: null };
  }
  if (mobileReady.length > 0) {
    return { message: null, testId: null };
  }

  const state = loadGenerationStateForGallery(projectId, pageId);
  if (pageConceptGenerationStateHasReadyMobileArtifacts(state)) {
    return { message: 'CONCEPTS COULD NOT BE LOADED', testId: 'gallery-page-concept-load-failed' };
  }

  if (all.length === 0) {
    return { message: 'NO PAGE CONCEPTS YET', testId: 'gallery-page-concept-empty' };
  }
  if (viewport === 'DESKTOP') return { message: 'NO DESKTOP PAGE CONCEPTS YET', testId: 'gallery-page-concept-empty' };
  if (viewport === 'TABLET') return { message: 'NO TABLET PAGE CONCEPTS YET', testId: 'gallery-page-concept-empty' };
  return { message: 'NO PAGE CONCEPTS FOR THIS VIEWPORT', testId: 'gallery-page-concept-empty' };
}
