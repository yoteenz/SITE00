import { useEffect, useState } from 'react';
import {
  site00ClientProductionApi,
  type ClientProjectSummary,
  ClientProductionApiError,
} from '../services/clientProductionApi';

export type ClientProjectsLoadState = 'loading' | 'ready' | 'error';

export function useClientProjects() {
  const [projects, setProjects] = useState<ClientProjectSummary[]>([]);
  const [state, setState] = useState<ClientProjectsLoadState>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState('loading');

    site00ClientProductionApi
      .projects()
      .then((data) => {
        if (cancelled) return;
        setProjects(data.projects ?? []);
        setState('ready');
      })
      .catch((e) => {
        if (cancelled) return;
        setProjects([]);
        setError(e instanceof ClientProductionApiError ? e.message : 'FAILED TO LOAD PROJECTS');
        setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, state, error };
}
