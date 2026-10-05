import { useCallback, useEffect, useState } from 'react';
import { site00ProductionApi } from '../services/productionApi';
import type { ControlCommandPayload } from '../types/control';

export type ControlLoadState = 'loading' | 'ready' | 'error';

export function useControlCommand() {
  const [data, setData] = useState<ControlCommandPayload | null>(null);
  const [state, setState] = useState<ControlLoadState>('loading');
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const payload = await site00ProductionApi.command();
      setData(payload);
      setState('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'FAILED TO LOAD COMMAND CENTER');
      setState('error');
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, state, error, reload };
}
