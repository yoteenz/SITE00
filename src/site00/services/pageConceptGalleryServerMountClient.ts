import { refreshPageConceptGalleryFromPersistedState } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryHydration.js';
import {
  applyPageConceptServerRunSnapshotForGalleryMount,
  PAGE_CONCEPT_GALLERY_SERVER_MOUNT_EVENT,
  pageConceptGenerationStateGalleryArtifactTimestamp,
  pageConceptServerRunMaxArtifactTimestamp,
  shouldReplaceLocalPageConceptStateWithServerRun,
  type PageConceptGalleryServerMountTrace,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryServerHydration.js';
import {
  loadPageConceptActiveServerRunIdForDesignPage,
  loadPageConceptGenerationStateForDesignPage,
  resolveDesignPageIdentityForGallery,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationStateDiscovery.js';
import { savePageConceptGenerationState } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import type { PageConceptGenerationState } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { isSite00PreviewTunnelHost } from '../components/loader/site00PreviewHost.js';
import { ensurePageConceptApiAccessToken } from './pageConceptApiSession.js';
import {
  fetchLatestPageConceptGenerationRunForDesignPage,
  fetchPageConceptGenerationRunApi,
  savePageConceptActiveServerRunId,
} from './pageConceptGenerationRunClient.js';
import { pageConceptServerRunHasReadyMobileGallery } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryServerHydration.js';
import { pageConceptServerRunIsTerminal } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';

export type { PageConceptGalleryServerMountTrace };

function emitMountTrace(projectId: string, pageId: string, trace: PageConceptGalleryServerMountTrace): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(PAGE_CONCEPT_GALLERY_SERVER_MOUNT_EVENT, {
      detail: { projectId, pageId, trace },
    }),
  );
}

export async function mountPageConceptGalleryFromServer(input: {
  projectId: string;
  pageId: string;
  screenId: string;
  route?: string | null;
  persist: (fn: (s: PageConceptGenerationState) => PageConceptGenerationState) => void;
}): Promise<PageConceptGalleryServerMountTrace> {
  const preferServerGallery = isSite00PreviewTunnelHost();
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

    if (
      !shouldReplaceLocalPageConceptStateWithServerRun(loaded, server, { preferServerGallery }) &&
      !(
        !preferServerGallery &&
        pageConceptServerRunHasReadyMobileGallery(server) &&
        !pageConceptServerRunIsTerminal(server.status)
      )
    ) {
      const trace: PageConceptGalleryServerMountTrace = {
        phase: 'skipped',
        reason: 'LOCAL_ALREADY_CURRENT',
        runId: server.runId,
        localArtifactTs,
        serverArtifactTs,
        pageIdsTried,
      };
      emitMountTrace(input.projectId, input.pageId, trace);
      return trace;
    }

    input.persist((s) => applyPageConceptServerRunSnapshotForGalleryMount(s, server));
    savePageConceptActiveServerRunId(input.projectId, input.pageId, server.runId);
    savePageConceptGenerationState(
      loadPageConceptGenerationStateForDesignPage({
        projectSlug: input.projectId,
        pageId: input.pageId,
        screenId: input.screenId,
        route: input.route ?? null,
      }),
    );
    refreshPageConceptGalleryFromPersistedState(input.projectId, input.pageId, {
      screenId: input.screenId,
      route: input.route ?? null,
    });
    window.dispatchEvent(
      new CustomEvent('site00:page-concept-generation-updated', {
        detail: { projectId: input.projectId, pageId: input.pageId },
      }),
    );

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
