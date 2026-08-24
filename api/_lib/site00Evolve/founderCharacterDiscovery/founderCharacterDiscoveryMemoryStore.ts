/**
 * P0.5E.4 — Founder Character Discovery memory store (tests).
 */

import type { NdxFounderCharacterDiscoveryRun } from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/types.js';

let run: NdxFounderCharacterDiscoveryRun | null = null;

export async function getFounderCharacterDiscoveryRun(
  _projectId: string,
): Promise<NdxFounderCharacterDiscoveryRun | null> {
  return run;
}

export async function saveFounderCharacterDiscoveryRun(
  next: NdxFounderCharacterDiscoveryRun,
): Promise<NdxFounderCharacterDiscoveryRun> {
  run = next;
  return next;
}

export function resetFounderCharacterDiscoveryMemory(): void {
  run = null;
}
