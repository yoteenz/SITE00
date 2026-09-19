import {
  GROK_TWIN_TEST_A_HISTORY_KEY,
  GROK_TWIN_TEST_A_INCIDENT_KEY,
  GROK_TWIN_TEST_A_STORAGE_KEY,
} from './constants.js';
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

function forStorage(run: GrokDesignBenchRun): GrokDesignBenchRun {
  if (!run.reference?.imageUrl?.startsWith('data:')) return run;
  return {
    ...run,
    reference: {
      ...run.reference,
      imageUrl: '',
    },
  };
}

function writeJson(ls: Storage, key: string, value: unknown): void {
  try {
    ls.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — never crash boot */
  }
}

export function persistGrokTwinTestARun(run: GrokDesignBenchRun): void {
  const ls = storage();
  if (!ls) return;
  if (isForbiddenTwinTestAStorageKey(GROK_TWIN_TEST_A_STORAGE_KEY)) return;
  writeJson(ls, GROK_TWIN_TEST_A_STORAGE_KEY, forStorage(run));
  if (run.stage === 'COMPLETE' && run.timing.totalDurationMs && run.timing.totalDurationMs > 0 && run.timing.totalDurationMs < 10 * 60 * 1000) {
    const history = readGrokTwinTestADurationHistory();
    history.push(run.timing.totalDurationMs);
    writeJson(ls, GROK_TWIN_TEST_A_HISTORY_KEY, history.slice(-12));
  }
  if (
    (run.timing.totalDurationMs ?? 0) >= 10 * 60 * 1000 ||
    run.error === 'GROK_PROVIDER_TIMEOUT' ||
    run.error === 'RUN_STALLED' ||
    (run.stage === 'ANALYZING_VISUAL' && Date.parse(run.timing.queuedAt ?? '') && Date.now() - Date.parse(run.timing.queuedAt ?? '') > 10 * 60 * 1000)
  ) {
    archiveGrokTwinTestAIncident(run);
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

export function archiveGrokTwinTestAIncident(run: GrokDesignBenchRun): void {
  const ls = storage();
  if (!ls || isForbiddenTwinTestAStorageKey(GROK_TWIN_TEST_A_INCIDENT_KEY)) return;
  const prev = readGrokTwinTestAIncidents();
  if (prev.some((item) => item.runId === run.runId)) return;
  writeJson(ls, GROK_TWIN_TEST_A_INCIDENT_KEY, [forStorage(run), ...prev].slice(0, 20));
}

export function markGrokTwinTestAServerLost(run: GrokDesignBenchRun): GrokDesignBenchRun {
  archiveGrokTwinTestAIncident(run);
  const now = new Date().toISOString();
  const elapsed = run.timing.queuedAt ? Date.now() - Date.parse(run.timing.queuedAt) : 0;
  return {
    ...run,
    stage: 'FAILED',
    stageLabel: 'Failed',
    error: run.error ?? 'SERVER_RUN_LOST',
    stall: {
      stalled: true,
      stalledStage: run.stage,
      lastStateChange: run.lastStateChangeAt ?? run.timing.providerStartedAt ?? run.timing.queuedAt ?? null,
      providerRequestStatus: run.providerRequestStatus ?? 'IN_FLIGHT',
    },
    timing: {
      ...run.timing,
      completedAt: run.timing.completedAt ?? now,
      totalDurationMs: run.timing.totalDurationMs ?? Math.max(elapsed, 0),
    },
  };
}

export function readGrokTwinTestAIncidents(): GrokDesignBenchRun[] {
  const ls = storage();
  if (!ls) return [];
  const raw = ls.getItem(GROK_TWIN_TEST_A_INCIDENT_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as GrokDesignBenchRun[]) : [];
  } catch {
    return [];
  }
}
