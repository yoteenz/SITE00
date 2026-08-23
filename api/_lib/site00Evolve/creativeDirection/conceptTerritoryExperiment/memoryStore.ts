/**
 * In-memory store for Experiment D six-concept hero range runs (tests).
 */

import type { SixConceptHeroRangeRun } from '../../../../../shared/site00-brand-lore/conceptTerritory/conceptTerritoryTypes.js';

const memory = new Map<string, SixConceptHeroRangeRun>();

export function resetExperimentDMemory(): void {
  memory.clear();
}

export async function getSixConceptHeroRangeRun(runId: string): Promise<SixConceptHeroRangeRun | null> {
  return memory.get(runId) ?? null;
}

export async function saveSixConceptHeroRangeRun(run: SixConceptHeroRangeRun): Promise<SixConceptHeroRangeRun> {
  memory.set(run.runId, run);
  return run;
}
