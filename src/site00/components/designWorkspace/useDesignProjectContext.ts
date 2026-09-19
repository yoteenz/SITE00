/**
 * P0.VR.8R1 — Atomic design project context switch hook.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  bootstrapManagedDesignProject,
  createLoadingDesignProjectContext,
  detectDesignContextLeaks,
  filterRecordsForActiveProject,
  resolveDesignProjectContext,
  type DesignProjectContext,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/client.js';

export type UseDesignProjectContextResult = {
  context: DesignProjectContext;
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
  leakReport: ReturnType<typeof detectDesignContextLeaks>;
  switchProject: (nextProjectId: string) => Promise<DesignProjectContext>;
  filterForActiveProject: <T extends { projectId: string; global?: boolean }>(records: T[]) => T[];
};

export function useDesignProjectContext(
  activeProjectId: string,
  options?: { activeViewport?: 'mobile' | 'tablet' | 'desktop' },
): UseDesignProjectContextResult {
  const [context, setContext] = useState<DesignProjectContext>(() =>
    resolveDesignProjectContext(activeProjectId, { activeViewport: options?.activeViewport }),
  );
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);

  const hydrate = useCallback(
    async (projectId: string): Promise<DesignProjectContext> => {
      const requestId = ++requestIdRef.current;
      setIsLoading(true);
      setContext(createLoadingDesignProjectContext(projectId));

      bootstrapManagedDesignProject(projectId);

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      if (requestId !== requestIdRef.current) {
        return resolveDesignProjectContext(projectId, { activeViewport: options?.activeViewport });
      }

      const resolved = resolveDesignProjectContext(projectId, { activeViewport: options?.activeViewport });
      setContext(resolved);
      setIsLoading(false);
      return resolved;
    },
    [options?.activeViewport],
  );

  useEffect(() => {
    void hydrate(activeProjectId);
  }, [activeProjectId, hydrate]);

  const leakReport = detectDesignContextLeaks({
    activeDesignProjectId: activeProjectId,
    contextProjectId: context.projectId,
    themeTokens: context.themeTokens,
  });

  const filterForActiveProject = useCallback(
    <T extends { projectId: string; global?: boolean }>(records: T[]) =>
      filterRecordsForActiveProject(records, activeProjectId),
    [activeProjectId],
  );

  return {
    context,
    isLoading: isLoading || context.status === 'PROJECT_CONTEXT_LOADING',
    isReady: context.status === 'PROJECT_CONTEXT_READY' && !isLoading,
    isError: context.status === 'PROJECT_CONTEXT_ERROR',
    leakReport,
    switchProject: hydrate,
    filterForActiveProject,
  };
}
