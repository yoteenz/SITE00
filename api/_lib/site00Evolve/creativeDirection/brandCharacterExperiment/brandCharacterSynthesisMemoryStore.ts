/**
 * Brand Character Synthesis memory store — tests only.
 */

import type { BrandCharacterSynthesisRun } from '../../../../../shared/site00-brand-lore/brandCharacterSynthesis/types.js';

let run: BrandCharacterSynthesisRun | null = null;

export async function getBrandCharacterSynthesisRun(
  _projectId: string,
): Promise<BrandCharacterSynthesisRun | null> {
  return run;
}

export async function saveBrandCharacterSynthesisRun(
  next: BrandCharacterSynthesisRun,
): Promise<BrandCharacterSynthesisRun> {
  run = next;
  return next;
}

export function resetBrandCharacterSynthesisMemory(): void {
  run = null;
}
