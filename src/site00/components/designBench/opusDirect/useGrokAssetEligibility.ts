import { useEffect, useMemo, useState } from 'react';

import {
  computeGrokAssetEligibility,
  type GrokEligibilityResult,
} from '../../../../../shared/site00-design-workspace-production/designGrokAssetEligibility.js';
import { listPageConceptCandidates } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/designPageConceptModel.js';
import { compileDesignPageContext } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/pageContext.js';
import {
  loadPageAuthorityWorkflow,
  markTwinRouteVerified,
  savePageAuthorityWorkflow,
} from '../../../../../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import type { PageViewportId } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/pageViewportAuthority.js';
import type { DesignProductionState } from '../../../../../shared/site00-design-workspace-production/types.js';

export function useGrokAssetEligibility(
  projectId: string,
  pageId: string,
  viewport: PageViewportId,
  production: DesignProductionState,
  workflowRevision = 0,
): GrokEligibilityResult {
  const [twinRouteReachable, setTwinRouteReachable] = useState<boolean | null>(null);
  const pageCtx = useMemo(() => compileDesignPageContext(projectId, pageId), [pageId, projectId]);
  const twinRoute = pageCtx?.route ?? null;

  useEffect(() => {
    if (!twinRoute || typeof window === 'undefined') {
      setTwinRouteReachable(null);
      return;
    }
    let cancelled = false;
    const url = `${window.location.origin}${twinRoute.startsWith('/') ? twinRoute : `/${twinRoute}`}`;
    fetch(url, { method: 'HEAD', credentials: 'same-origin' })
      .then((res) => {
        if (!cancelled) {
          setTwinRouteReachable(res.ok);
          if (res.ok) {
            const wf = loadPageAuthorityWorkflow(projectId, pageId);
            savePageAuthorityWorkflow(projectId, pageId, markTwinRouteVerified(wf));
          }
        }
      })
      .catch(() => {
        if (!cancelled) setTwinRouteReachable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [twinRoute, production.pairLockedAt, production.twinImplementationStatus, workflowRevision]);

  return useMemo(() => {
    const pageWorkflow = loadPageAuthorityWorkflow(projectId, pageId);
    const concepts = listPageConceptCandidates(projectId, pageId);
    return computeGrokAssetEligibility({
      projectId,
      pageId,
      viewport,
      production,
      pageWorkflow,
      twinRouteReachable:
        pageWorkflow.twinRouteVerifiedAt ? true : twinRouteReachable,
      twinRoute,
      hasPageConceptCandidates: concepts.length > 0,
    });
  }, [
    pageId,
    production,
    projectId,
    twinRoute,
    twinRouteReachable,
    viewport,
    workflowRevision,
  ]);
}
