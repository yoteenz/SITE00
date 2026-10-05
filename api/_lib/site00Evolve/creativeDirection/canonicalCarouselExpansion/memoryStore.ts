/**
 * In-memory store for carousel expansion runs (tests).
 */

import type { CanonicalCarouselExpansionRun } from '../../../../../shared/site00-brand-lore/canonicalCarouselExpansionTypes.js';

const memory = new Map<string, CanonicalCarouselExpansionRun>();

export function resetCanonicalCarouselExpansionMemory(): void {
  memory.clear();
}

export async function getCanonicalCarouselExpansionRun(
  runId: string,
): Promise<CanonicalCarouselExpansionRun | null> {
  return memory.get(runId) ?? null;
}

export async function saveCanonicalCarouselExpansionRun(
  run: CanonicalCarouselExpansionRun,
): Promise<CanonicalCarouselExpansionRun> {
  memory.set(run.runId, run);
  return run;
}
