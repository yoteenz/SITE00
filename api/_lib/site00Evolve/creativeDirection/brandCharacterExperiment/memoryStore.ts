/**
 * In-memory Brand Character formation store — tests and dev.
 */

import type { BrandCharacterFormationRun } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/types.js';

let run: BrandCharacterFormationRun | null = null;

export async function getBrandCharacterFormationRun(
  _runId: string,
): Promise<BrandCharacterFormationRun | null> {
  return run;
}

export async function saveBrandCharacterFormationRun(
  next: BrandCharacterFormationRun,
): Promise<BrandCharacterFormationRun> {
  run = next;
  return next;
}

export function resetBrandCharacterMemory(): void {
  run = null;
}
