import { listPageConceptCandidates } from '../../../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';
import {
  pageConceptGenerationStateHasReadyMobileArtifacts,
  refreshPageConceptGalleryFromPersistedState,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGalleryHydration.js';
import { loadPageConceptGenerationStateForDesignPage } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGenerationStateDiscovery.js';
import { pageConceptCandidateMatchesViewportGallery } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportGalleryScope.js';

/** True when MOBILE concept candidate gallery has nothing visible to show. */
export function designPageMobileConceptGalleryIsEmpty(input: {
  projectSlug: string;
  pageId: string;
  screenId?: string;
  route?: string | null;
}): boolean {
  refreshPageConceptGalleryFromPersistedState(input.projectSlug, input.pageId, {
    screenId: input.screenId,
    route: input.route ?? null,
  });
  const slug = input.projectSlug.trim().toLowerCase();
  const visible = listPageConceptCandidates(slug, input.pageId).some(
    (c) =>
      pageConceptCandidateMatchesViewportGallery(c, 'MOBILE') &&
      (c.artifactStatus === 'READY' || Boolean(c.visualReference || c.mobileVisualReference)),
  );
  if (visible) return false;
  const state = loadPageConceptGenerationStateForDesignPage({
    projectSlug: input.projectSlug,
    pageId: input.pageId,
    screenId: input.screenId,
    route: input.route ?? null,
  });
  return !pageConceptGenerationStateHasReadyMobileArtifacts(state);
}
