/**
 * P0.5E.3 — Embodied Character Discovery memory store (tests).
 */

import type { NdxEmbodiedCharacterDiscoveryRun } from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterDiscovery/types.js';

let run: NdxEmbodiedCharacterDiscoveryRun | null = null;

export async function getEmbodiedCharacterDiscoveryRun(
  _projectId: string,
): Promise<NdxEmbodiedCharacterDiscoveryRun | null> {
  return run;
}

export async function saveEmbodiedCharacterDiscoveryRun(
  next: NdxEmbodiedCharacterDiscoveryRun,
): Promise<NdxEmbodiedCharacterDiscoveryRun> {
  run = next;
  return next;
}

export function resetEmbodiedCharacterDiscoveryMemory(): void {
  run = null;
}
