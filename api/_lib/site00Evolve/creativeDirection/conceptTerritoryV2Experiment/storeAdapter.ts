/**
 * Experiment F persistence — Supabase in production, memory in tests.
 */

import { hasSupabaseServiceRole } from '../../../supabase.js';
import type { SixConceptReformationRun } from '../../../../../shared/site00-brand-lore/conceptTerritoryV2/types.js';
import { EXPERIMENT_F_RUN_ID } from '../../../../../shared/site00-brand-lore/conceptTerritoryV2/constants.js';
import * as mem from './memoryStore.js';
import * as db from './supabaseStore.js';

export function useExperimentFMemoryStore(): boolean {
  return process.env.SITE00_EXPERIMENT_F_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let storeModeCache: 'memory' | 'supabase' | null = null;

export async function resolveExperimentFStoreMode(): Promise<'memory' | 'supabase'> {
  if (useExperimentFMemoryStore()) {
    storeModeCache = null;
    return 'memory';
  }
  if (storeModeCache) return storeModeCache;
  if (!hasSupabaseServiceRole()) {
    storeModeCache = 'memory';
    return 'memory';
  }
  const exists = await db.methodologyValidationTablesExist();
  storeModeCache = exists ? 'supabase' : 'memory';
  return storeModeCache;
}

export function resetExperimentFStoreModeCache(): void {
  storeModeCache = null;
}

async function store() {
  return (await resolveExperimentFStoreMode()) === 'memory' ? mem : db;
}

export async function getSixConceptReformationRun(
  runId: string = EXPERIMENT_F_RUN_ID,
): Promise<SixConceptReformationRun | null> {
  return (await store()).getSixConceptReformationRun(runId);
}

export async function saveSixConceptReformationRun(run: SixConceptReformationRun): Promise<SixConceptReformationRun> {
  return (await store()).saveSixConceptReformationRun(run);
}

export { resetExperimentFMemory } from './memoryStore.js';
