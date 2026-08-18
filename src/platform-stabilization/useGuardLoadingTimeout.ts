import { useEffect, useState } from 'react';
import { DEFAULT_MAX_LOADING_MS } from './loadingTerminalRegistry';

export function useGuardLoadingTimeout(isLoading: boolean, label: string, maxDurationMs = DEFAULT_MAX_LOADING_MS) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setTimedOut(false);
      return;
    }
    const timer = window.setTimeout(() => setTimedOut(true), maxDurationMs);
    return () => window.clearTimeout(timer);
  }, [isLoading, label, maxDurationMs]);

  return timedOut;
}
