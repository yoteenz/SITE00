/**
 * In-memory canonical creative range store — tests only.
 */

import type { CanonicalCreativeRangeRun } from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeTypes.js';

const memory = new Map<string, CanonicalCreativeRangeRun>();

export function resetCanonicalCreativeRangeMemory(): void {
  memory.clear();
}

export async function getCanonicalCreativeRangeRun(runId: string): Promise<CanonicalCreativeRangeRun | null> {
  return memory.get(runId) ?? null;
}

export async function saveCanonicalCreativeRangeRun(run: CanonicalCreativeRangeRun): Promise<CanonicalCreativeRangeRun> {
  memory.set(run.runId, run);
  return run;
}
