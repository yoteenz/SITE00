/**
 * In-memory store for Experiment F six-concept reformation runs (tests).
 */

import type { SixConceptReformationRun } from '../../../../../shared/site00-brand-lore/conceptTerritoryV2/types.js';

const memory = new Map<string, SixConceptReformationRun>();

export function resetExperimentFMemory(): void {
  memory.clear();
}

export async function getSixConceptReformationRun(runId: string): Promise<SixConceptReformationRun | null> {
  return memory.get(runId) ?? null;
}

export async function saveSixConceptReformationRun(run: SixConceptReformationRun): Promise<SixConceptReformationRun> {
  memory.set(run.runId, run);
  return run;
}

export async function listSixConceptReformationRuns(runId: string): Promise<SixConceptReformationRun[]> {
  const run = memory.get(runId);
  return run ? [run] : [];
}
