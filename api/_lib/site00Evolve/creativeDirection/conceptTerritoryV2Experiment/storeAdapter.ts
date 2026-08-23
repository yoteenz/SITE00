/**
 * Experiment F persistence — Supabase in production (fail loud), memory in tests.
 */

import { resolveDurableStoreMode } from '../../../../../shared/site00-studio-world-execution/persistencePolicy.js';
import type { SixConceptReformationRun } from '../../../../../shared/site00-brand-lore/conceptTerritoryV2/types.js';
import { EXPERIMENT_F_RUN_ID } from '../../../../../shared/site00-brand-lore/conceptTerritoryV2/constants.js';
import * as mem from './memoryStore.js';
import * as db from './supabaseStore.js';

export function useExperimentFMemoryStore(): boolean {
  return process.env.SITE00_EXPERIMENT_F_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let storeModeCache: 'memory' | 'supabase' | null = null;

export async function resolveExperimentFStoreMode(): Promise<'memory' | 'supabase'> {
  if (storeModeCache) return storeModeCache;
  storeModeCache = await resolveDurableStoreMode({
    storeName: 'ExperimentF',
    explicitUseMemory: useExperimentFMemoryStore(),
    schemaExists: db.methodologyValidationTablesExist,
    migrationHint: 'run supabase/migrations/20260823010000_site00_methodology_validation_runs.sql',
  });
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
