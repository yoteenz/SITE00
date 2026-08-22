import { useCallback, useEffect, useState } from 'react';
import type { Site00ProjectDetail, Site00ProjectIndexEntry, Site00ProjectsIndexSummary } from '../../../shared/site00-projects/types';
import { site00ProjectsApi, Site00ProjectsApiError } from '../services/site00ProjectsApi';

export type Site00ProjectsLoadState = 'loading' | 'ready' | 'partial' | 'error';

export type Site00ProjectsSourceLabel = 'LOADING' | 'LIVE' | 'PARTIAL' | 'ERROR';

export function useSite00ProjectsIndex() {
  const [projects, setProjects] = useState<Site00ProjectIndexEntry[]>([]);
  const [clientProjects, setClientProjects] = useState<Site00ProjectsIndexPayload['clientProjects']>([]);
  const [summary, setSummary] = useState<Site00ProjectsIndexSummary | null>(null);
  const [state, setState] = useState<Site00ProjectsLoadState>('loading');
  const [sourceLabel, setSourceLabel] = useState<Site00ProjectsSourceLabel>('LOADING');
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    setSourceLabel('LOADING');
    setError(null);
    setSummary(null);

    site00ProjectsApi
      .index()
      .then((data) => {
        if (cancelled) return;
        const loaded = data.projects ?? [];
        const partialCount = loaded.filter((p) => p.enrichmentStatus === 'PARTIAL').length;
        setProjects(loaded);
        setClientProjects(data.clientProjects ?? []);
        setSummary(data.summary ?? null);
        setState(partialCount > 0 ? 'partial' : 'ready');
        setSourceLabel(partialCount > 0 ? 'PARTIAL' : 'LIVE');
      })
      .catch((e) => {
        if (cancelled) return;
        setProjects([]);
        setClientProjects([]);
        setSummary(null);
        setSourceLabel('ERROR');
        setError(
          e instanceof Site00ProjectsApiError
            ? e.message
            : 'PROJECT INDEX UNAVAILABLE — COULD NOT LOAD PROJECTS.',
        );
        setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  return { projects, clientProjects, summary, state, sourceLabel, error, reload };
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
        setState(data.project.enrichmentStatus === 'PARTIAL' ? 'partial' : 'ready');
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
