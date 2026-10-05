import { useCallback, useEffect, useState } from 'react';
import type { ProjectCodebaseIntelligence } from '../../../shared/site00-projects/technical/types.js';
import { fetchProjectTechnicalIntelligence } from '../services/projectTechnicalIntelligenceApi.js';
import { useProjectViewMode } from '../context/ProjectViewModeContext.js';

export function useProjectTechnicalIntelligence(projectId: string, enabled = true) {
  const { viewMode } = useProjectViewMode();
  const [intelligence, setIntelligence] = useState<ProjectCodebaseIntelligence | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (sync = false) => {
      if (!enabled || !projectId) return;
      setState('loading');
      setError(null);
      try {
        const data = await fetchProjectTechnicalIntelligence(projectId, { sync, viewMode });
        setIntelligence(data);
        setState('ready');
      } catch (e) {
        setIntelligence(null);
        setError(e instanceof Error ? e.message : 'SYNC FAILED');
        setState('error');
      }
    },
    [enabled, projectId, viewMode],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  return { intelligence, state, error, reload: () => load(true), syncNow: () => load(true) };
}
