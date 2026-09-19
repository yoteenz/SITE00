/**
 * Brand Character Synthesis store adapter.
 */

import { resolveDurableStoreMode } from '../../../../../shared/site00-studio-world-execution/persistencePolicy.js';
import type { BrandCharacterSynthesisRun } from '../../../../../shared/site00-brand-lore/brandCharacterSynthesis/types.js';
import * as mem from './brandCharacterSynthesisMemoryStore.js';
import * as db from './brandCharacterSynthesisSupabaseStore.js';

export function useBrandCharacterSynthesisMemoryStore(): boolean {
  return process.env.SITE00_BRAND_CHARACTER_SYNTHESIS_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let cachedMode: 'memory' | 'supabase' | null = null;

export async function resolveBrandCharacterSynthesisStoreMode(): Promise<'memory' | 'supabase'> {
  if (cachedMode) return cachedMode;
  cachedMode = await resolveDurableStoreMode({
    storeName: 'BrandCharacterSynthesis',
    explicitUseMemory: useBrandCharacterSynthesisMemoryStore(),
    schemaExists: db.brandCharacterSynthesisTablesExist,
    migrationHint: 'run supabase/migrations/20260823010000_site00_methodology_validation_runs.sql',
  });
  return cachedMode;
}

export function resetBrandCharacterSynthesisStoreModeCache(): void {
  cachedMode = null;
}

async function store() {
  return (await resolveBrandCharacterSynthesisStoreMode()) === 'memory' ? mem : db;
}

export async function getBrandCharacterSynthesisRun(
  projectId: string,
): Promise<BrandCharacterSynthesisRun | null> {
  return (await store()).getBrandCharacterSynthesisRun(projectId);
}

export async function saveBrandCharacterSynthesisRun(
  run: BrandCharacterSynthesisRun,
): Promise<BrandCharacterSynthesisRun> {
  return (await store()).saveBrandCharacterSynthesisRun(run);
}

export { resetBrandCharacterSynthesisMemory } from './brandCharacterSynthesisMemoryStore.js';
