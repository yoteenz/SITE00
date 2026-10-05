/**
 * Live Cultural Intelligence memory store — tests + dev.
 */

import type { LiveCulturalIntelligenceRun } from '../../../../shared/site00-studio-world-production/liveCulturalIntelligence/types.js';

let run: LiveCulturalIntelligenceRun | null = null;

export async function getLiveCulturalIntelligenceRun(_projectId: string): Promise<LiveCulturalIntelligenceRun | null> {
  return run;
}

export async function saveLiveCulturalIntelligenceRun(next: LiveCulturalIntelligenceRun): Promise<LiveCulturalIntelligenceRun> {
  run = next;
  return next;
}

export function resetLiveCulturalIntelligenceMemory(): void {
  run = null;
}
