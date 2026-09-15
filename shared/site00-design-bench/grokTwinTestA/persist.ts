import { GROK_TWIN_TEST_A_HISTORY_KEY, GROK_TWIN_TEST_A_STORAGE_KEY } from './constants.js';
import { isForbiddenTwinTestAStorageKey } from './isolation.js';
import type { GrokDesignBenchRun } from './types.js';
import { meanPositive } from './timing.js';

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function persistGrokTwinTestARun(run: GrokDesignBenchRun): void {
  const ls = storage();
  if (!ls) return;
  if (isForbiddenTwinTestAStorageKey(GROK_TWIN_TEST_A_STORAGE_KEY)) return;
  ls.setItem(GROK_TWIN_TEST_A_STORAGE_KEY, JSON.stringify(run));
  if (run.stage === 'COMPLETE' && run.timing.totalDurationMs && run.timing.totalDurationMs > 0) {
    const history = readGrokTwinTestADurationHistory();
    history.push(run.timing.totalDurationMs);
    ls.setItem(GROK_TWIN_TEST_A_HISTORY_KEY, JSON.stringify(history.slice(-12)));
  }
}

export function readPersistedGrokTwinTestARun(): GrokDesignBenchRun | null {
  const ls = storage();
  if (!ls) return null;
  const raw = ls.getItem(GROK_TWIN_TEST_A_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GrokDesignBenchRun;
  } catch {
    return null;
  }
}

export function readGrokTwinTestADurationHistory(): number[] {
  const ls = storage();
  if (!ls) return [];
  const raw = ls.getItem(GROK_TWIN_TEST_A_HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

export function historicalGrokTwinTestAAverageMs(): number | null {
  return meanPositive(readGrokTwinTestADurationHistory());
}

export function clearPersistedGrokTwinTestARun(): void {
  storage()?.removeItem(GROK_TWIN_TEST_A_STORAGE_KEY);
}
