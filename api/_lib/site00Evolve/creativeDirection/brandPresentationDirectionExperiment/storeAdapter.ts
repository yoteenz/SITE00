/**
 * Brand Presentation Direction persistence — Supabase in production, memory in tests.
 */

import { resolveDurableStoreMode } from '../../../../../shared/site00-studio-world-execution/persistencePolicy.js';
import type { BrandPresentationDirectionFormationRun } from '../../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/types.js';
import { BRAND_PRESENTATION_DIRECTION_RUN_ID } from '../../../../../shared/site00-brand-lore/brandPresentationDirectionTerritory/constants.js';
import * as mem from './memoryStore.js';
import * as db from './supabaseStore.js';

export function useBrandPresentationDirectionMemoryStore(): boolean {
  return process.env.SITE00_EXPERIMENT_G_DIRECTION_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let cachedMode: 'memory' | 'supabase' | null = null;

export async function resolveBrandPresentationDirectionStoreMode(): Promise<'memory' | 'supabase'> {
  if (cachedMode) return cachedMode;
  cachedMode = await resolveDurableStoreMode({
    storeName: 'BrandPresentationDirection',
    explicitUseMemory: useBrandPresentationDirectionMemoryStore(),
    schemaExists: db.methodologyValidationTablesExist,
    migrationHint: 'run supabase/migrations/20260823010000_site00_methodology_validation_runs.sql',
  });
  return cachedMode;
}

export function resetBrandPresentationDirectionStoreModeCache(): void {
  cachedMode = null;
}

async function store() {
  return (await resolveBrandPresentationDirectionStoreMode()) === 'memory' ? mem : db;
}

export async function getBrandPresentationDirectionFormationRun(
  runId: string = BRAND_PRESENTATION_DIRECTION_RUN_ID,
): Promise<BrandPresentationDirectionFormationRun | null> {
  return (await store()).getBrandPresentationDirectionFormationRun(runId);
}

export async function saveBrandPresentationDirectionFormationRun(
  run: BrandPresentationDirectionFormationRun,
): Promise<BrandPresentationDirectionFormationRun> {
  return (await store()).saveBrandPresentationDirectionFormationRun(run);
}

export { resetBrandPresentationDirectionMemory } from './memoryStore.js';
