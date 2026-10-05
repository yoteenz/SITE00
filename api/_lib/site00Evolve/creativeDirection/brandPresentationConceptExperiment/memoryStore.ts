/**
 * In-memory Experiment G store — tests and dev.
 */

import type { BrandPresentationConceptFormationRun } from '../../../../../shared/site00-brand-lore/brandPresentationConceptTerritory/types.js';

let run: BrandPresentationConceptFormationRun | null = null;

export async function getBrandPresentationConceptFormationRun(
  _runId: string,
): Promise<BrandPresentationConceptFormationRun | null> {
  return run;
}

export async function saveBrandPresentationConceptFormationRun(
  next: BrandPresentationConceptFormationRun,
): Promise<BrandPresentationConceptFormationRun> {
  run = next;
  return next;
}

export function resetExperimentGMemory(): void {
  run = null;
}
