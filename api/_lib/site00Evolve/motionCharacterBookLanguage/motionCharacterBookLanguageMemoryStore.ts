/**
 * P0.5E.2 — Motion Character + Book Language memory store.
 */

import type { NdxMotionCharacterBookLanguageRun } from '../../../../shared/site00-brand-lore/ndxBookCulturalLanguage/types.js';

let run: NdxMotionCharacterBookLanguageRun | null = null;

export async function getMotionCharacterBookLanguageRun(
  _projectId: string,
): Promise<NdxMotionCharacterBookLanguageRun | null> {
  return run;
}

export async function saveMotionCharacterBookLanguageRun(
  next: NdxMotionCharacterBookLanguageRun,
): Promise<NdxMotionCharacterBookLanguageRun> {
  run = next;
  return next;
}

export function resetMotionCharacterBookLanguageMemory(): void {
  run = null;
}
