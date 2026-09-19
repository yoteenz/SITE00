/**
 * Daily publishing cadence store adapter.
 */

import type { DailyPublishingCadenceRun } from '../../../../shared/site00-studio-world-production/dailyPublishingCadence/types.js';
import * as mem from './dailyPublishingCadenceMemoryStore.js';

export function useDailyPublishingCadenceMemoryStore(): boolean {
  return process.env.VITEST === 'true' || process.env.SITE00_DAILY_PUBLISHING_USE_MEMORY === '1';
}

let cachedMode: 'memory' | null = null;

export async function resolveDailyPublishingCadenceStoreMode(): Promise<'memory'> {
  if (cachedMode) return cachedMode;
  cachedMode = 'memory';
  return cachedMode;
}

export function resetDailyPublishingCadenceStoreModeCache(): void {
  cachedMode = null;
}

async function store() {
  await resolveDailyPublishingCadenceStoreMode();
  return mem;
}

export async function getDailyPublishingCadenceRun(projectId: string): Promise<DailyPublishingCadenceRun | null> {
  return (await store()).getDailyPublishingCadenceRun(projectId);
}

export async function saveDailyPublishingCadenceRun(run: DailyPublishingCadenceRun): Promise<DailyPublishingCadenceRun> {
  return (await store()).saveDailyPublishingCadenceRun(run);
}

export { resetDailyPublishingCadenceMemory } from './dailyPublishingCadenceMemoryStore.js';
