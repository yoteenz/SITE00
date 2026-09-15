import type { GrokDesignBenchRun } from '../../../shared/site00-design-bench/grokTwinTestA/types.js';

const runs = new Map<string, GrokDesignBenchRun>();
const imageBytes = new Map<string, { mime: string; bytes: Buffer; sha256: string }>();
const durationHistory: number[] = [];

export function putGrokDesignBenchRun(run: GrokDesignBenchRun): GrokDesignBenchRun {
  runs.set(run.runId, run);
  return run;
}

export function getGrokDesignBenchRun(runId: string): GrokDesignBenchRun | undefined {
  return runs.get(runId);
}

export function latestGrokDesignBenchRun(projectId: string): GrokDesignBenchRun | undefined {
  const matches = [...runs.values()].filter((r) => r.projectId === projectId);
  matches.sort((a, b) => {
    const aT = Date.parse(a.timing.queuedAt ?? a.timing.startedAt ?? '') || 0;
    const bT = Date.parse(b.timing.queuedAt ?? b.timing.startedAt ?? '') || 0;
    return bT - aT;
  });
  return matches[0];
}

export function putGrokReferenceBytes(storageRef: string, payload: { mime: string; bytes: Buffer; sha256: string }): void {
  imageBytes.set(storageRef, payload);
}

export function getGrokReferenceBytes(storageRef: string): { mime: string; bytes: Buffer; sha256: string } | undefined {
  return imageBytes.get(storageRef);
}

export function recordGrokDuration(ms: number): void {
  if (Number.isFinite(ms) && ms > 0) durationHistory.push(ms);
}

export function grokHistoricalAverageMs(): number | null {
  if (!durationHistory.length) return null;
  return durationHistory.reduce((a, b) => a + b, 0) / durationHistory.length;
}

export function resetGrokDesignBenchStoreForTests(): void {
  runs.clear();
  imageBytes.clear();
  durationHistory.length = 0;
}
