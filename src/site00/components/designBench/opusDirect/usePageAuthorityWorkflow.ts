import { useCallback, useEffect, useState } from 'react';

import {
  appendAuthorityChatMessage,
  createAuthorityReferenceVersion,
  createComposerHandoffPackage,
  loadPageAuthorityWorkflow,
  markPairReviewOpened,
  markTwinReviewed,
  promoteViewportDesign,
  savePageAuthorityWorkflow,
  setPreferredViewportConcept,
  type PageAuthorityWorkflowState,
} from '../../../../../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';

export function usePageAuthorityWorkflow(projectId: string, pageId: string) {
  const [workflow, setWorkflow] = useState<PageAuthorityWorkflowState>(() =>
    loadPageAuthorityWorkflow(projectId, pageId),
  );

  useEffect(() => {
    setWorkflow(loadPageAuthorityWorkflow(projectId, pageId));
  }, [pageId, projectId]);

  const persist = useCallback(
    (next: PageAuthorityWorkflowState) => {
      savePageAuthorityWorkflow(projectId, pageId, next);
      setWorkflow(next);
      return next;
    },
    [pageId, projectId],
  );

  return {
    workflow,
    preferConcept: (viewport: 'MOBILE' | 'DESKTOP', conceptId: string) =>
      persist(setPreferredViewportConcept(workflow, viewport, conceptId)),
    promoteDesign: (viewport: 'MOBILE' | 'DESKTOP') => persist(promoteViewportDesign(workflow, viewport)),
    openPairReview: () => persist(markPairReviewOpened(workflow)),
    markTwinReviewed: () => persist(markTwinReviewed(workflow)),
    appendChat: (
      viewport: 'MOBILE' | 'DESKTOP',
      message: { role: 'founder' | 'cgpt'; text: string; attachmentDataUrl?: string },
    ) => persist(appendAuthorityChatMessage(workflow, viewport, message)),
    regenerateAuthorityFixture: (viewport: 'MOBILE' | 'DESKTOP', notes: string) =>
      persist(
        createAuthorityReferenceVersion(workflow, viewport, {
          imageUrl: null,
          notes,
        }),
      ),
    confirmHandoff: (input: {
      interactionContractVersion: string;
      assetManifestVersion: string;
      pageContextVersion: string;
      tabletPolicy: 'DERIVED' | 'OVERRIDE';
    }) => {
      const { state, pkg } = createComposerHandoffPackage(workflow, {
        projectId,
        pageId,
        ...input,
      });
      persist(state);
      return pkg;
    },
    reload: () => setWorkflow(loadPageAuthorityWorkflow(projectId, pageId)),
  };
}
