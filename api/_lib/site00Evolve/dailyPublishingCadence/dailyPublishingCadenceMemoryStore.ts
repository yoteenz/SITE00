/**
 * Daily publishing cadence memory store — tests + dev.
 */

import type { DailyPublishingCadenceRun } from '../../../../shared/site00-studio-world-production/dailyPublishingCadence/types.js';

let run: DailyPublishingCadenceRun | null = null;

export async function getDailyPublishingCadenceRun(_projectId: string): Promise<DailyPublishingCadenceRun | null> {
  return run;
}

export async function saveDailyPublishingCadenceRun(next: DailyPublishingCadenceRun): Promise<DailyPublishingCadenceRun> {
  run = next;
  return next;
}

export function resetDailyPublishingCadenceMemory(): void {
  run = null;
}
