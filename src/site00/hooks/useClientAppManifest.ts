import { useCallback, useEffect, useState } from 'react';
import type { ClientAppManifest } from '../../../shared/site00-client-app/types.js';
import { site00ClientAppApi } from '../services/clientAppApi';

export function useClientAppManifest(projectSlug: string) {
  const [data, setData] = useState<ClientAppManifest | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!projectSlug) return;
    setState('loading');
    setError(null);
    try {
      const manifest = await site00ClientAppApi.manifest(projectSlug);
      setData(manifest);
      setState('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load app');
      setState('error');
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, state, error, reload };
}
