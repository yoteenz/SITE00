/**
 * Brand Character Readiness store adapter.
 */

import { resolveDurableStoreMode } from '../../../../../shared/site00-studio-world-execution/persistencePolicy.js';
import type { BrandCharacterReadinessRecord } from '../../../../../shared/site00-brand-lore/brandCharacterReadiness/types.js';
import * as mem from './brandCharacterReadinessMemoryStore.js';
import * as db from './brandCharacterReadinessSupabaseStore.js';

export function useBrandCharacterReadinessMemoryStore(): boolean {
  return process.env.SITE00_BRAND_CHARACTER_READINESS_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let cachedMode: 'memory' | 'supabase' | null = null;

export async function resolveBrandCharacterReadinessStoreMode(): Promise<'memory' | 'supabase'> {
  if (cachedMode) return cachedMode;
  cachedMode = await resolveDurableStoreMode({
    storeName: 'BrandCharacterReadiness',
    explicitUseMemory: useBrandCharacterReadinessMemoryStore(),
    schemaExists: db.brandCharacterReadinessTablesExist,
    migrationHint: 'run supabase/migrations/20260823010000_site00_methodology_validation_runs.sql',
  });
  return cachedMode;
}

export function resetBrandCharacterReadinessStoreModeCache(): void {
  cachedMode = null;
}

async function store() {
  return (await resolveBrandCharacterReadinessStoreMode()) === 'memory' ? mem : db;
}

export async function getBrandCharacterReadinessRecord(
  projectId: string,
): Promise<BrandCharacterReadinessRecord | null> {
  return (await store()).getBrandCharacterReadinessRecord(projectId);
}

export async function saveBrandCharacterReadinessRecord(
  record: BrandCharacterReadinessRecord,
): Promise<BrandCharacterReadinessRecord> {
  return (await store()).saveBrandCharacterReadinessRecord(record);
}

export { resetBrandCharacterReadinessMemory } from './brandCharacterReadinessMemoryStore.js';
