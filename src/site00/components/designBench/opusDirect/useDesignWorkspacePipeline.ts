import { useCallback, useEffect, useMemo, useState } from 'react';

import type { DesignProductionState } from '../../../../../shared/site00-design-workspace-production/types.js';
import type { PageAuthorityWorkflowState } from '../../../../../shared/site00-design-workspace-production/designPageAuthorityWorkflow.js';
import {
  compileDesignWorkspacePipelineState,
  type DesignWorkspacePipelineState,
} from '../../../../../shared/site00-design-workspace-production/designWorkspacePipelineState.js';
import {
  buildDesignWorkspacePipelineReadinessRows,
  canConfirmMobileAuthority,
  canCreateDesktopExpression,
  canCreateFramework,
  canCreateMobileExpression,
  canCreateTabletExpression,
  canGenerateAssets,
  canGenerateDesktop,
  canGenerateTablet,
  canOpenPairReview,
  canReviewMobileExperience,
} from '../../../../../shared/site00-design-workspace-production/designWorkspacePipelineSelectors.js';
import { subscribeDesignWorkspacePipelineRefresh } from '../../../../../shared/site00-design-workspace-production/designWorkspacePipelineEvents.js';
import type { PageConceptGenerationState } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

export type UseDesignWorkspacePipelineInput = {
  projectId: string;
  pageId: string;
  generationState: PageConceptGenerationState | null;
  production: DesignProductionState;
  pageWorkflow: PageAuthorityWorkflowState;
  twinRouteReachable: boolean | null;
  /** Bumps when parent already received legacy page-concept events. */
  externalRevision?: number;
};

export function useDesignWorkspacePipeline(input: UseDesignWorkspacePipelineInput): {
  pipeline: DesignWorkspacePipelineState;
  readinessRows: ReturnType<typeof buildDesignWorkspacePipelineReadinessRows>;
  revision: number;
  selectors: {
    canConfirmMobileAuthority: boolean;
    canCreateMobileExpression: boolean;
    canReviewMobileExperience: boolean;
    canGenerateDesktop: boolean;
    canCreateDesktopExpression: boolean;
    canGenerateTablet: boolean;
    canCreateTabletExpression: boolean;
    canOpenPairReview: boolean;
    canCreateFramework: boolean;
    canGenerateAssets: boolean;
  };
} {
  const [revision, setRevision] = useState(0);
  const bump = useCallback(() => setRevision((n) => n + 1), []);

  useEffect(() => {
    return subscribeDesignWorkspacePipelineRefresh((detail) => {
      if (detail.projectId !== input.projectId || detail.pageId !== input.pageId) return;
      bump();
    });
  }, [bump, input.pageId, input.projectId]);

  useEffect(() => {
    if (input.externalRevision !== undefined) bump();
  }, [bump, input.externalRevision]);

  const pipeline = useMemo(
    () =>
      compileDesignWorkspacePipelineState({
        projectId: input.projectId,
        pageId: input.pageId,
        generationState: input.generationState,
        production: input.production,
        pageWorkflow: input.pageWorkflow,
        twinRouteReachable: input.twinRouteReachable,
      }),
    [
      input.generationState,
      input.pageId,
      input.pageWorkflow,
      input.production,
      input.projectId,
      input.twinRouteReachable,
      revision,
    ],
  );

  const readinessRows = useMemo(() => buildDesignWorkspacePipelineReadinessRows(pipeline), [pipeline]);

  const selectors = useMemo(
    () => ({
      canConfirmMobileAuthority: canConfirmMobileAuthority(pipeline),
      canCreateMobileExpression: canCreateMobileExpression(pipeline),
      canReviewMobileExperience: canReviewMobileExperience(pipeline),
      canGenerateDesktop: canGenerateDesktop(pipeline),
      canCreateDesktopExpression: canCreateDesktopExpression(pipeline),
      canGenerateTablet: canGenerateTablet(pipeline),
      canCreateTabletExpression: canCreateTabletExpression(pipeline),
      canOpenPairReview: canOpenPairReview(pipeline),
      canCreateFramework: canCreateFramework(pipeline),
      canGenerateAssets: canGenerateAssets(pipeline),
    }),
    [pipeline],
  );

  return { pipeline, readinessRows, revision, selectors };
}
