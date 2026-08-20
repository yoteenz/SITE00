import { useEffect, useState } from 'react';
import type { Site00ProjectDetail, Site00ProjectIndexEntry } from '../../../shared/site00-projects/types';
import { site00ProjectsApi, Site00ProjectsApiError } from '../services/site00ProjectsApi';

export type Site00ProjectsLoadState = 'loading' | 'ready' | 'error';

export function useSite00ProjectsIndex() {
  const [projects, setProjects] = useState<Site00ProjectIndexEntry[]>([]);
  const [clientProjects, setClientProjects] = useState<Site00ProjectsIndexPayload['clientProjects']>([]);
  const [state, setState] = useState<Site00ProjectsLoadState>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState('loading');

    site00ProjectsApi
      .index()
      .then((data) => {
        if (cancelled) return;
        setProjects(data.projects ?? []);
        setClientProjects(data.clientProjects ?? []);
        setState('ready');
      })
      .catch((e) => {
        if (cancelled) return;
        setProjects([]);
        setClientProjects([]);
        setError(e instanceof Site00ProjectsApiError ? e.message : 'FAILED TO LOAD PROJECTS');
        setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, clientProjects, state, error };
}

type Site00ProjectsIndexPayload = import('../../../shared/site00-projects/types').Site00ProjectsIndexPayload;

export function useSite00ProjectDetail(slug: string) {
  const [project, setProject] = useState<Site00ProjectDetail | null>(null);
  const [state, setState] = useState<Site00ProjectsLoadState>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setState('loading');

    site00ProjectsApi
      .detail(slug)
      .then((data) => {
        if (cancelled) return;
        setProject(data.project);
        setState('ready');
      })
      .catch((e) => {
        if (cancelled) return;
        setProject(null);
        setError(e instanceof Site00ProjectsApiError ? e.message : 'FAILED TO LOAD PROJECT');
        setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { project, state, error };
}
