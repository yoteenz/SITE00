import {
  listPageConceptCandidates,
  type PageConceptCandidate,
} from '../designProjectBinding/designPageConceptModel.js';
import type { PageViewportId } from '../designProjectBinding/pageViewportAuthority.js';
import type { PageConceptGenerationState } from './types.js';
import { inferPageConceptPipelineLineage } from './pageConceptCanonicalPipeline.js';
import { syncPageConceptGalleryFromGenerationState } from './pageConceptGallerySync.js';
import { loadPageConceptGenerationStateForDesignPage } from './pageConceptGenerationStateDiscovery.js';
import {
  listPageConceptCandidatesForViewportGallery,
  resolvePageConceptViewportGalleryEmptyPresentation,
} from './pageConceptViewportGalleryScope.js';

export type PageConceptGalleryEmptyPresentation = {
  message: string | null;
  secondaryLine: string | null;
  testId:
    | 'gallery-page-concept-empty'
    | 'gallery-page-concept-load-failed'
    | 'gallery-page-concept-reconciling'
    | null;
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

function normalizeGenerationStateForGallerySync(state: PageConceptGenerationState): PageConceptGenerationState {
  if (!state.pipelineSet) return state;
  const lineage = inferPageConceptPipelineLineage({
    pipelineLineage: state.pipelineSet.pipelineLineage ?? null,
    generationJobs: state.generationJobs,
  });
  if (state.pipelineSet.pipelineLineage === lineage) return state;
  return {
    ...state,
    pipelineSet: {
      ...state.pipelineSet,
      pipelineLineage: lineage,
    },
  };
}

/** Sync in-memory gallery store from persisted generation state (single source of truth). */
export function refreshPageConceptGalleryFromPersistedState(
  projectId: string,
  pageId: string,
  scope?: Omit<PageConceptGalleryHydrationScope, 'projectId' | 'pageId'>,
): void {
  const loaded = loadGenerationStateForGallery({
    projectId,
    pageId,
    screenId: scope?.screenId,
    route: scope?.route ?? null,
  });
  const state = normalizeGenerationStateForGallerySync(loaded);
  syncPageConceptGalleryFromGenerationState(state);
  for (const archived of state.archivedRuns ?? []) {
    syncPageConceptGalleryFromGenerationState(
      normalizeGenerationStateForGallerySync({
        ...state,
        projectId: state.projectId,
        pageId: state.pageId,
        pipelineSet: archived.pipelineSet,
        generationJobs: archived.generationJobs,
        activeGenerationRunId: state.activeGenerationRunId,
        activeReviewRunId: archived.runId,
      }),
    );
  }
}

export function reconcilePageConceptCandidates(projectId: string, pageId: string, scope?: Omit<PageConceptGalleryHydrationScope, 'projectId' | 'pageId'>): void {
  refreshPageConceptGalleryFromPersistedState(projectId, pageId, scope);
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
  const scoped = listPageConceptCandidatesForViewportGallery(all, viewport);
  const state = loadGenerationStateForGallery({
    projectId,
    pageId,
    screenId: scope?.screenId,
    route: scope?.route ?? null,
  });
  const empty = resolvePageConceptViewportGalleryEmptyPresentation({
    viewport,
    scoped,
    generationState: state,
  });
  return {
    message: empty.message,
    secondaryLine: empty.secondaryLine,
    testId: empty.testId,
  };
}
