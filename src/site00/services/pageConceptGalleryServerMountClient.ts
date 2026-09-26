import { refreshPageConceptGalleryFromPersistedState } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryHydration.js';
import {
  applyPageConceptServerRunSnapshotForGalleryMount,
  PAGE_CONCEPT_GALLERY_SERVER_MOUNT_EVENT,
  pageConceptGenerationStateGalleryArtifactTimestamp,
  pageConceptServerRunHasReadyMobileGallery,
  pageConceptServerRunMaxArtifactTimestamp,
  shouldReplaceLocalPageConceptStateWithServerRun,
  type PageConceptGalleryServerMountTrace,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryServerHydration.js';
import {
  consolidatePageConceptGenerationStateStorage,
  loadPageConceptActiveServerRunIdForDesignPage,
  loadPageConceptGenerationStateForDesignPage,
  resolveDesignPageIdentityForGallery,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationStateDiscovery.js';
import type { PageConceptGenerationState } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { pageConceptServerRunIsTerminal } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';
import { ensurePageConceptApiAccessToken } from './pageConceptApiSession.js';
import {
  fetchLatestPageConceptGenerationRunForDesignPage,
  fetchPageConceptGenerationRunApi,
  savePageConceptActiveServerRunId,
} from './pageConceptGenerationRunClient.js';

export type { PageConceptGalleryServerMountTrace };

function emitMountTrace(projectId: string, pageId: string, trace: PageConceptGalleryServerMountTrace): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(PAGE_CONCEPT_GALLERY_SERVER_MOUNT_EVENT, {
      detail: { projectId, pageId, trace },
    }),
  );
}

function syncGalleryStoreFromPersistence(input: {
  projectId: string;
  pageId: string;
  screenId: string;
  route?: string | null;
}): void {
  refreshPageConceptGalleryFromPersistedState(input.projectId, input.pageId, {
    screenId: input.screenId,
    route: input.route ?? null,
  });
}

function applyMountedServerRunToClient(input: {
  projectId: string;
  pageId: string;
  screenId: string;
  route?: string | null;
  server: Parameters<typeof applyPageConceptServerRunSnapshotForGalleryMount>[1];
  persist: (fn: (s: PageConceptGenerationState) => PageConceptGenerationState) => void;
}): PageConceptGenerationState {
  const baseState = loadPageConceptGenerationStateForDesignPage({
    projectSlug: input.projectId,
    pageId: input.pageId,
    screenId: input.screenId,
    route: input.route ?? null,
  });
  const next = applyPageConceptServerRunSnapshotForGalleryMount(baseState, input.server);
  consolidatePageConceptGenerationStateStorage(
    {
      projectSlug: input.projectId,
      pageId: input.pageId,
      screenId: input.screenId,
      route: input.route ?? null,
    },
    next,
  );
  savePageConceptActiveServerRunId(input.projectId, input.pageId, input.server.runId);
  refreshPageConceptGalleryFromPersistedState(input.projectId, input.pageId, {
    screenId: input.screenId,
    route: input.route ?? null,
  });
  input.persist(() => next);
  window.dispatchEvent(
    new CustomEvent('site00:page-concept-generation-updated', {
      detail: { projectId: input.projectId, pageId: input.pageId },
    }),
  );
  return next;
}

export async function mountPageConceptGalleryFromServer(input: {
  projectId: string;
  pageId: string;
  screenId: string;
  route?: string | null;
  persist: (fn: (s: PageConceptGenerationState) => PageConceptGenerationState) => void;
}): Promise<PageConceptGalleryServerMountTrace> {
  /** Authenticated server mount: latest durable run wins over per-origin localStorage. */
  const preferServerGallery = true;
  const identity = resolveDesignPageIdentityForGallery({
    projectSlug: input.projectId,
    pageId: input.pageId,
    screenId: input.screenId,
    route: input.route ?? null,
  });
  const pageIdsTried = [
    ...new Set([identity.registryPageId, identity.canonicalPageId, identity.screenId].filter(Boolean)),
  ];

  const baseTrace: PageConceptGalleryServerMountTrace = {
    phase: 'start',
    pageIdsTried,
  };
  emitMountTrace(input.projectId, input.pageId, baseTrace);

  const loaded = loadPageConceptGenerationStateForDesignPage({
    projectSlug: input.projectId,
    pageId: input.pageId,
    screenId: input.screenId,
    route: input.route ?? null,
  });
  const localArtifactTs = pageConceptGenerationStateGalleryArtifactTimestamp(loaded);

  try {
    await ensurePageConceptApiAccessToken();

    let serverUpdate = await fetchLatestPageConceptGenerationRunForDesignPage({
      projectSlug: input.projectId,
      pageId: input.pageId,
      screenId: input.screenId,
      route: input.route ?? null,
    });

    if (
      !serverUpdate &&
      !(
        loaded.pipelineSet?.mobileConcepts?.some((c) => c.status === 'READY') ||
        loaded.generationJobs.some((j) => j.provider === 'GPT2_MOBILE' && j.status === 'READY')
      )
    ) {
      const runId = loadPageConceptActiveServerRunIdForDesignPage({
        projectSlug: input.projectId,
        pageId: input.pageId,
        screenId: input.screenId,
        route: input.route ?? null,
      });
      if (runId) {
        const polled = await fetchPageConceptGenerationRunApi(runId, 0, {
          projectId: input.projectId,
          pageId: input.pageId,
        });
        serverUpdate = polled;
      }
    }

    if (!serverUpdate?.run) {
      syncGalleryStoreFromPersistence(input);
      const trace: PageConceptGalleryServerMountTrace = {
        phase: 'skipped',
        reason: 'NO_SERVER_RUN',
        localArtifactTs,
        pageIdsTried,
      };
      emitMountTrace(input.projectId, input.pageId, trace);
      return trace;
    }

    const server = serverUpdate.run;
    const serverArtifactTs = pageConceptServerRunMaxArtifactTimestamp(server);

    const localRunId = loaded.activeGenerationRunId ?? loaded.activeReviewRunId ?? null;
    const serverHasReady = pageConceptServerRunHasReadyMobileGallery(server);
    const localFresherSameRun =
      serverHasReady &&
      localRunId === server.runId &&
      localArtifactTs > serverArtifactTs + 500;

    const shouldApply =
      localFresherSameRun ?
        false
      : preferServerGallery && serverHasReady ?
        true
      : shouldReplaceLocalPageConceptStateWithServerRun(loaded, server, { preferServerGallery }) ||
        (
          !preferServerGallery &&
          serverHasReady &&
          !pageConceptServerRunIsTerminal(server.status)
        );

    if (!shouldApply) {
      syncGalleryStoreFromPersistence(input);
      const trace: PageConceptGalleryServerMountTrace = {
        phase: 'skipped',
        reason: localFresherSameRun ? 'LOCAL_FRESHER_THAN_SERVER' : 'LOCAL_ALREADY_CURRENT',
        runId: server.runId,
        localArtifactTs,
        serverArtifactTs,
        pageIdsTried,
      };
      emitMountTrace(input.projectId, input.pageId, trace);
      return trace;
    }

    applyMountedServerRunToClient({
      projectId: input.projectId,
      pageId: input.pageId,
      screenId: input.screenId,
      route: input.route,
      server,
      persist: input.persist,
    });

    const trace: PageConceptGalleryServerMountTrace = {
      phase: 'applied',
      runId: server.runId,
      localArtifactTs,
      serverArtifactTs,
      pageIdsTried,
    };
    emitMountTrace(input.projectId, input.pageId, trace);
    return trace;
  } catch (err) {
    syncGalleryStoreFromPersistence(input);
    const trace: PageConceptGalleryServerMountTrace = {
      phase: 'failed',
      reason: err instanceof Error ? err.message : 'MOUNT_FAILED',
      localArtifactTs,
      pageIdsTried,
    };
    emitMountTrace(input.projectId, input.pageId, trace);
    return trace;
  }
}
