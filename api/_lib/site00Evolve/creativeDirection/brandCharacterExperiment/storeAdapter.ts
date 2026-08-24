/**
 * Brand Character persistence — Supabase in production, memory in tests.
 */

import { resolveDurableStoreMode } from '../../../../../shared/site00-studio-world-execution/persistencePolicy.js';
import type { BrandCharacterFormationRun } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/types.js';
import { NDXBOOK_CHARACTER_FORMATION_RUN_ID } from '../../../../../shared/site00-brand-lore/brandCharacterTerritory/constants.js';
import * as mem from './memoryStore.js';
import * as db from './supabaseStore.js';

export function useBrandCharacterMemoryStore(): boolean {
  return process.env.SITE00_EXPERIMENT_H_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let cachedMode: 'memory' | 'supabase' | null = null;

export async function resolveBrandCharacterStoreMode(): Promise<'memory' | 'supabase'> {
  if (cachedMode) return cachedMode;
  cachedMode = await resolveDurableStoreMode({
    storeName: 'BrandCharacter',
    explicitUseMemory: useBrandCharacterMemoryStore(),
    schemaExists: db.methodologyValidationTablesExist,
    migrationHint: 'run supabase/migrations/20260823010000_site00_methodology_validation_runs.sql',
  });
  return cachedMode;
}

export function resetBrandCharacterStoreModeCache(): void {
  cachedMode = null;
}

async function store() {
  return (await resolveBrandCharacterStoreMode()) === 'memory' ? mem : db;
}

export async function getBrandCharacterFormationRun(
  runId: string = NDXBOOK_CHARACTER_FORMATION_RUN_ID,
): Promise<BrandCharacterFormationRun | null> {
  return (await store()).getBrandCharacterFormationRun(runId);
}

export async function saveBrandCharacterFormationRun(
  run: BrandCharacterFormationRun,
): Promise<BrandCharacterFormationRun> {
  return (await store()).saveBrandCharacterFormationRun(run);
}

export { resetBrandCharacterMemory } from './memoryStore.js';
