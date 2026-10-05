import { useCallback, useEffect, useState } from 'react';
import type { ClientAppProjectsPayload } from '../../../shared/site00-client-app/types.js';
import { site00ClientAppApi } from '../services/clientAppApi';

export function useClientAppProjects(fixtureMode?: string) {
  const [data, setData] = useState<ClientAppProjectsPayload | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const payload = await site00ClientAppApi.projects(fixtureMode);
      setData(payload);
      setState('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load projects');
      setState('error');
    }
  }, [fixtureMode]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, state, error, reload };
}
