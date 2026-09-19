/**
 * In-memory persistence for Brand Presentation Direction formation (Vitest/dev).
 */

import type { BrandPresentationDirectionFormationRun } from '../../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/types.js';
import { BRAND_PRESENTATION_DIRECTION_RUN_ID } from '../../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/constants.js';

let run: BrandPresentationDirectionFormationRun | null = null;

export async function getBrandPresentationDirectionFormationRun(
  _runId: string = BRAND_PRESENTATION_DIRECTION_RUN_ID,
): Promise<BrandPresentationDirectionFormationRun | null> {
  return run ? structuredClone(run) : null;
}

export async function saveBrandPresentationDirectionFormationRun(
  next: BrandPresentationDirectionFormationRun,
): Promise<BrandPresentationDirectionFormationRun> {
  run = structuredClone(next);
  return run;
}

export function resetBrandPresentationDirectionMemory(): void {
  run = null;
}
