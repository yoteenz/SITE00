/**
 * P0.5E.5 — Character Continuity memory store (tests).
 */

import type { NdxCharacterContinuityPipelineRun } from '../../../../shared/site00-brand-lore/ndxCharacterContinuityPipeline/types.js';

let run: NdxCharacterContinuityPipelineRun | null = null;

export async function getCharacterContinuityRun(
  _projectId: string,
): Promise<NdxCharacterContinuityPipelineRun | null> {
  return run;
}

export async function saveCharacterContinuityRun(
  next: NdxCharacterContinuityPipelineRun,
): Promise<NdxCharacterContinuityPipelineRun> {
  run = next;
  return next;
}

export function resetCharacterContinuityMemory(): void {
  run = null;
}
