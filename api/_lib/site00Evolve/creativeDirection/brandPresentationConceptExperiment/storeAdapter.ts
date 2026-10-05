/**
 * Experiment G persistence — Supabase in production (fail loud), memory in tests.
 */

import { resolveDurableStoreMode } from '../../../../../shared/site00-studio-world-execution/persistencePolicy.js';
import type { BrandPresentationConceptFormationRun } from '../../../../../shared/site00-brand-lore/brandPresentationConceptTerritory/types.js';
import { EXPERIMENT_G_RUN_ID } from '../../../../../shared/site00-brand-lore/brandPresentationConceptTerritory/constants.js';
import * as mem from './memoryStore.js';
import * as db from './supabaseStore.js';

export function useExperimentGMemoryStore(): boolean {
  return process.env.SITE00_EXPERIMENT_G_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let cachedMode: 'memory' | 'supabase' | null = null;

export async function resolveExperimentGStoreMode(): Promise<'memory' | 'supabase'> {
  if (cachedMode) return cachedMode;
  cachedMode = await resolveDurableStoreMode({
    storeName: 'ExperimentG',
    explicitUseMemory: useExperimentGMemoryStore(),
    schemaExists: db.methodologyValidationTablesExist,
    migrationHint: 'run supabase/migrations/20260823010000_site00_methodology_validation_runs.sql',
  });
  return cachedMode;
}

export function resetExperimentGStoreModeCache(): void {
  cachedMode = null;
}

async function store() {
  return (await resolveExperimentGStoreMode()) === 'memory' ? mem : db;
}

export async function getBrandPresentationConceptFormationRun(
  runId: string = EXPERIMENT_G_RUN_ID,
): Promise<BrandPresentationConceptFormationRun | null> {
  return (await store()).getBrandPresentationConceptFormationRun(runId);
}

export async function saveBrandPresentationConceptFormationRun(
  run: BrandPresentationConceptFormationRun,
): Promise<BrandPresentationConceptFormationRun> {
  return (await store()).saveBrandPresentationConceptFormationRun(run);
}

export { resetExperimentGMemory } from './memoryStore.js';
