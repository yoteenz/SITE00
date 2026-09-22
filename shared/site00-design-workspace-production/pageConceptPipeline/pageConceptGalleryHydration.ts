import {
  listPageConceptCandidates,
  type PageConceptCandidate,
} from '../designProjectBinding/designPageConceptModel.js';
import type { PageViewportId } from '../designProjectBinding/pageViewportAuthority.js';
import type { PageConceptGenerationState } from './types.js';
import { syncPageConceptGalleryFromGenerationState } from './pageConceptGallerySync.js';
import { loadPageConceptGenerationStateForDesignPage } from './pageConceptGenerationStateDiscovery.js';

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

export type PageConceptGalleryHydrationScope = {
  projectId: string;
  pageId: string;
  screenId?: string;
  route?: string | null;
};

function loadGenerationStateForGallery(scope: PageConceptGalleryHydrationScope): PageConceptGenerationState {
  return loadPageConceptGenerationStateForDesignPage({
    projectSlug: scope.projectId,
    pageId: scope.pageId,
    screenId: scope.screenId,
    route: scope.route ?? null,
  });
}

/** Sync in-memory gallery store from persisted generation state (single source of truth). */
export function refreshPageConceptGalleryFromPersistedState(
  projectId: string,
  pageId: string,
  scope?: Omit<PageConceptGalleryHydrationScope, 'projectId' | 'pageId'>,
): void {
  const state = loadGenerationStateForGallery({
    projectId,
    pageId,
    screenId: scope?.screenId,
    route: scope?.route ?? null,
  });
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
  scope?: Omit<PageConceptGalleryHydrationScope, 'projectId' | 'pageId'>,
): readonly PageConceptCandidate[] {
  refreshPageConceptGalleryFromPersistedState(projectId, pageId, scope);
  return listPageConceptCandidates(normalizeProjectId(projectId), pageId);
}

export function resolvePageConceptGalleryEmptyPresentation(
  projectId: string,
  pageId: string,
  viewport: PageViewportId,
  scope?: Omit<PageConceptGalleryHydrationScope, 'projectId' | 'pageId'>,
): PageConceptGalleryEmptyPresentation {
  refreshPageConceptGalleryFromPersistedState(projectId, pageId, scope);
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

  const state = loadGenerationStateForGallery({
    projectId,
    pageId,
    screenId: scope?.screenId,
    route: scope?.route ?? null,
  });
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
