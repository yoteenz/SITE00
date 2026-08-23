/**
 * Canonical creative range validation persistence.
 */

import type { CanonicalCreativeRangeRun } from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeTypes.js';
import { NDXBOOK_CANONICAL_CREATIVE_RANGE_RUN_ID } from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeConstants.js';

const memory = new Map<string, CanonicalCreativeRangeRun>();

export async function getCanonicalCreativeRangeRun(
  runId: string = NDXBOOK_CANONICAL_CREATIVE_RANGE_RUN_ID,
): Promise<CanonicalCreativeRangeRun | null> {
  return memory.get(runId) ?? null;
}

export async function saveCanonicalCreativeRangeRun(run: CanonicalCreativeRangeRun): Promise<CanonicalCreativeRangeRun> {
  memory.set(run.runId, run);
  return run;
}

export function resetCanonicalCreativeRangeMemory(): void {
  memory.clear();
}
