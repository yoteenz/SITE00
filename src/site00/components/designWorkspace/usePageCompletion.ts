/**
 * Hook — page completion job for current design screen.
 */

import { useMemo } from 'react';
import {
  buildPageCompletionForDesignScreen,
  runDesignReconstructionKernel,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';

export function usePageCompletion(input: {
  projectId: string;
  screenId: string;
  route: string;
  primaryTab?: string;
}) {
  const pageJob = useMemo(
    () =>
      buildPageCompletionForDesignScreen({
        projectId: input.projectId,
        screenId: input.screenId || `design-${(input.primaryTab ?? 'workspace').toLowerCase()}`,
        route: input.route,
        moduleScreenType: input.primaryTab,
      }),
    [input.projectId, input.screenId, input.route, input.primaryTab],
  );

  const kernel = useMemo(
    () =>
      runDesignReconstructionKernel({
        workspace: input.primaryTab === 'SKINS' ? 'SKINS' : input.primaryTab === 'ASSETS' ? 'ASSETS' : 'PAGES',
        pageExperience: {
          projectId: input.projectId,
          pageId: input.screenId,
          primaryRoute: input.route,
          moduleScreenType: input.primaryTab,
        },
      }),
    [input.projectId, input.screenId, input.route, input.primaryTab, pageJob],
  );

  return { pageJob, kernel };
}
