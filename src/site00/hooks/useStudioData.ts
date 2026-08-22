import { useCallback, useEffect, useState } from 'react';
import {
  site00ClientProductionApi,
  type ClientStudioPayload,
  ClientProductionApiError,
} from '../services/clientProductionApi';

export type StudioLoadState = 'loading' | 'ready' | 'error';

export function useStudioData(projectSlug: string) {
  const [data, setData] = useState<ClientStudioPayload | null>(null);
  const [state, setState] = useState<StudioLoadState>('loading');
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!projectSlug) return;
    setState('loading');
    setError(null);
    try {
      const payload = await site00ClientProductionApi.studio(projectSlug);
      setData(payload);
      setState('ready');
    } catch (e) {
      const message =
        e instanceof ClientProductionApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'WE COULDN\'T LOAD THIS OPERATION. TRY AGAIN.';
      setError(message.toUpperCase());
      setState('error');
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (data?.project.name) {
      document.title = `SITE 00 — ${data.project.name.toUpperCase()}`;
    }
  }, [data?.project.name]);

  return { data, state, error, reload };
}
