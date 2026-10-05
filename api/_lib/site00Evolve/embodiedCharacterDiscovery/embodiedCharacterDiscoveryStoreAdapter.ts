/**
 * P0.5E.3 — Embodied Character Discovery store adapter.
 */

import { resolveDurableStoreMode } from '../../../../shared/site00-studio-world-execution/persistencePolicy.js';
import type { NdxEmbodiedCharacterDiscoveryRun } from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterDiscovery/types.js';
import * as mem from './embodiedCharacterDiscoveryMemoryStore.js';
import * as db from './embodiedCharacterDiscoverySupabaseStore.js';

export function useEmbodiedCharacterDiscoveryMemoryStore(): boolean {
  return process.env.SITE00_EMBODIED_CHARACTER_DISCOVERY_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let cachedMode: 'memory' | 'supabase' | null = null;

export async function resolveEmbodiedCharacterDiscoveryStoreMode(): Promise<'memory' | 'supabase'> {
  if (cachedMode) return cachedMode;
  cachedMode = await resolveDurableStoreMode({
    storeName: 'EmbodiedCharacterDiscovery',
    explicitUseMemory: useEmbodiedCharacterDiscoveryMemoryStore(),
    schemaExists: db.embodiedCharacterDiscoveryTablesExist,
    migrationHint: 'run supabase/migrations/20260823010000_site00_methodology_validation_runs.sql',
  });
  return cachedMode;
}

export function resetEmbodiedCharacterDiscoveryStoreModeCache(): void {
  cachedMode = null;
}

async function store() {
  return (await resolveEmbodiedCharacterDiscoveryStoreMode()) === 'memory' ? mem : db;
}

export async function getEmbodiedCharacterDiscoveryRun(
  projectId: string,
): Promise<NdxEmbodiedCharacterDiscoveryRun | null> {
  return (await store()).getEmbodiedCharacterDiscoveryRun(projectId);
}

export async function saveEmbodiedCharacterDiscoveryRun(
  run: NdxEmbodiedCharacterDiscoveryRun,
): Promise<NdxEmbodiedCharacterDiscoveryRun> {
  return (await store()).saveEmbodiedCharacterDiscoveryRun(run);
}

export { resetEmbodiedCharacterDiscoveryMemory } from './embodiedCharacterDiscoveryMemoryStore.js';
