/**
 * Live Cultural Intelligence store adapter.
 */

import type { LiveCulturalIntelligenceRun } from '../../../../shared/site00-studio-world-production/liveCulturalIntelligence/types.js';
import * as memory from './liveCulturalIntelligenceMemoryStore.js';

let storeMode: 'memory' | 'supabase' = 'memory';

export function resetLiveCulturalIntelligenceStoreModeCache(): void {
  storeMode = 'memory';
}

export async function getLiveCulturalIntelligenceRun(projectId: string): Promise<LiveCulturalIntelligenceRun | null> {
  if (storeMode === 'memory') return memory.getLiveCulturalIntelligenceRun(projectId);
  return memory.getLiveCulturalIntelligenceRun(projectId);
}

export async function saveLiveCulturalIntelligenceRun(run: LiveCulturalIntelligenceRun): Promise<LiveCulturalIntelligenceRun> {
  if (storeMode === 'memory') return memory.saveLiveCulturalIntelligenceRun(run);
  return memory.saveLiveCulturalIntelligenceRun(run);
}

export { resetLiveCulturalIntelligenceMemory } from './liveCulturalIntelligenceMemoryStore.js';
