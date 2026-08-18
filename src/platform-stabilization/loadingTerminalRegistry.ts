import { clearLoadingScreenDocumentLock } from './loadingScreenLock';

export type LoadingTerminalSource = {
  id: string;
  label: string;
  since: number;
};

const activeSources = new Map<string, LoadingTerminalSource>();
const sourceMaxMs = new Map<string, number>();

export const DEFAULT_MAX_LOADING_MS = 12_000;

export function registerLoadingTerminal(label: string, maxDurationMs = DEFAULT_MAX_LOADING_MS): () => void {
  const id = `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  activeSources.set(id, { id, label, since: Date.now() });
  sourceMaxMs.set(id, maxDurationMs);
  return () => {
    activeSources.delete(id);
    sourceMaxMs.delete(id);
  };
}

export function getActiveLoadingSources(): LoadingTerminalSource[] {
  return [...activeSources.values()].sort((a, b) => a.since - b.since);
}

export async function forceLoadingTerminalRecovery(
  stuck: LoadingTerminalSource[],
  reason = 'loading-timeout',
): Promise<void> {
  if (typeof document === 'undefined') return;
  clearLoadingScreenDocumentLock();
  document.querySelectorAll('.loading-screen-root').forEach((el) => el.remove());
  console.error('[loading-terminal] forced recovery', { reason, stuck });
}
