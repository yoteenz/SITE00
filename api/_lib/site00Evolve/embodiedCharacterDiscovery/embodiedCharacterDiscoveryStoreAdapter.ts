/**
 * P0.5E.3 — Embodied Character Discovery store adapter.
 */

import type { NdxEmbodiedCharacterDiscoveryRun } from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterDiscovery/types.js';
import * as mem from './embodiedCharacterDiscoveryMemoryStore.js';

export async function getEmbodiedCharacterDiscoveryRun(
  projectId: string,
): Promise<NdxEmbodiedCharacterDiscoveryRun | null> {
  return mem.getEmbodiedCharacterDiscoveryRun(projectId);
}

export async function saveEmbodiedCharacterDiscoveryRun(
  run: NdxEmbodiedCharacterDiscoveryRun,
): Promise<NdxEmbodiedCharacterDiscoveryRun> {
  return mem.saveEmbodiedCharacterDiscoveryRun(run);
}

export { resetEmbodiedCharacterDiscoveryMemory } from './embodiedCharacterDiscoveryMemoryStore.js';
