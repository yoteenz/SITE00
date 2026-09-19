/**
 * Experiment D persistence — Supabase in production (fail loud), memory in tests.
 */

import { resolveDurableStoreMode } from '../../../../../shared/site00-studio-world-execution/persistencePolicy.js';
import type { SixConceptHeroRangeRun } from '../../../../../shared/site00-brand-lore/conceptTerritory/conceptTerritoryTypes.js';
import { EXPERIMENT_D_RUN_ID } from '../../../../../shared/site00-brand-lore/conceptTerritory/conceptTerritoryConstants.js';
import * as mem from './memoryStore.js';
import * as db from './supabaseStore.js';

export function useExperimentDMemoryStore(): boolean {
  return process.env.SITE00_EXPERIMENT_D_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let storeModeCache: 'memory' | 'supabase' | null = null;

export async function resolveExperimentDStoreMode(): Promise<'memory' | 'supabase'> {
  if (storeModeCache) return storeModeCache;
  storeModeCache = await resolveDurableStoreMode({
    storeName: 'ExperimentD',
    explicitUseMemory: useExperimentDMemoryStore(),
    schemaExists: db.methodologyValidationTablesExist,
    migrationHint: 'run supabase/migrations/20260823010000_site00_methodology_validation_runs.sql',
  });
  return storeModeCache;
}

export function resetExperimentDStoreModeCache(): void {
  storeModeCache = null;
}

async function store() {
  return (await resolveExperimentDStoreMode()) === 'memory' ? mem : db;
}

export async function getSixConceptHeroRangeRun(
  runId: string = EXPERIMENT_D_RUN_ID,
): Promise<SixConceptHeroRangeRun | null> {
  return (await store()).getSixConceptHeroRangeRun(runId);
}

export async function saveSixConceptHeroRangeRun(run: SixConceptHeroRangeRun): Promise<SixConceptHeroRangeRun> {
  return (await store()).saveSixConceptHeroRangeRun(run);
}

export { resetExperimentDMemory } from './memoryStore.js';
