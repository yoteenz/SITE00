/**
 * In-memory store for Brand Presentation Visual Formulation (tests / dev).
 */

import type { BrandPresentationVisualFormulationRun } from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/types.js';
import { BRAND_PRESENTATION_VISUAL_FORMULATION_RUN_ID } from '../../../../../shared/site00-brand-lore/brandPresentationVisualFormulation/constants.js';

const memory = new Map<string, BrandPresentationVisualFormulationRun>();

export function resetBrandPresentationVisualFormulationMemory(): void {
  memory.clear();
}

export async function getBrandPresentationVisualFormulationRun(
  runId: string = BRAND_PRESENTATION_VISUAL_FORMULATION_RUN_ID,
): Promise<BrandPresentationVisualFormulationRun | null> {
  return memory.get(runId) ?? null;
}

export async function saveBrandPresentationVisualFormulationRun(
  run: BrandPresentationVisualFormulationRun,
): Promise<BrandPresentationVisualFormulationRun> {
  memory.set(run.runId, run);
  return run;
}
