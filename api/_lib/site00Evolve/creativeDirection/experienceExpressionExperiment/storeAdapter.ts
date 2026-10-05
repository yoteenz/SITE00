/**
 * Experiment E persistence — Supabase in production (fail loud), memory in tests.
 */

import { resolveDurableStoreMode } from '../../../../../shared/site00-studio-world-execution/persistencePolicy.js';
import type { ExperienceExpressionRun } from '../../../../../shared/site00-brand-lore/experienceExpression/types.js';
import { EXPERIMENT_E_RUN_ID } from '../../../../../shared/site00-brand-lore/experienceExpression/constants.js';
import * as mem from './memoryStore.js';
import * as db from './supabaseStore.js';

export function useExperimentEMemoryStore(): boolean {
  return process.env.SITE00_EXPERIMENT_E_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let storeModeCache: 'memory' | 'supabase' | null = null;

export async function resolveExperimentEStoreMode(): Promise<'memory' | 'supabase'> {
  if (storeModeCache) return storeModeCache;
  storeModeCache = await resolveDurableStoreMode({
    storeName: 'ExperimentE',
    explicitUseMemory: useExperimentEMemoryStore(),
    schemaExists: db.methodologyValidationTablesExist,
    migrationHint: 'run supabase/migrations/20260823010000_site00_methodology_validation_runs.sql',
  });
  return storeModeCache;
}

export function resetExperimentEStoreModeCache(): void {
  storeModeCache = null;
}

async function store() {
  return (await resolveExperimentEStoreMode()) === 'memory' ? mem : db;
}

export async function getExperienceExpressionRun(
  runId: string = EXPERIMENT_E_RUN_ID,
): Promise<ExperienceExpressionRun | null> {
  return (await store()).getExperienceExpressionRun(runId);
}

export async function saveExperienceExpressionRun(run: ExperienceExpressionRun): Promise<ExperienceExpressionRun> {
  return (await store()).saveExperienceExpressionRun(run);
}

export { resetExperimentEMemory } from './memoryStore.js';
