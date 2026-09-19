/**
 * P0.5E.4 — Founder Character Discovery store adapter.
 */

import { resolveDurableStoreMode } from '../../../../shared/site00-studio-world-execution/persistencePolicy.js';
import type { NdxFounderCharacterDiscoveryRun } from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/types.js';
import * as mem from './founderCharacterDiscoveryMemoryStore.js';
import * as db from './founderCharacterDiscoverySupabaseStore.js';

export function useFounderCharacterDiscoveryMemoryStore(): boolean {
  return process.env.SITE00_FOUNDER_CHARACTER_DISCOVERY_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let cachedMode: 'memory' | 'supabase' | null = null;

export async function resolveFounderCharacterDiscoveryStoreMode(): Promise<'memory' | 'supabase'> {
  if (cachedMode) return cachedMode;
  cachedMode = await resolveDurableStoreMode({
    storeName: 'FounderCharacterDiscovery',
    explicitUseMemory: useFounderCharacterDiscoveryMemoryStore(),
    schemaExists: db.founderCharacterDiscoveryTablesExist,
    migrationHint: 'run supabase/migrations/20260823010000_site00_methodology_validation_runs.sql',
  });
  return cachedMode;
}

export function resetFounderCharacterDiscoveryStoreModeCache(): void {
  cachedMode = null;
}

async function store() {
  return (await resolveFounderCharacterDiscoveryStoreMode()) === 'memory' ? mem : db;
}

export async function getFounderCharacterDiscoveryRun(
  projectId: string,
): Promise<NdxFounderCharacterDiscoveryRun | null> {
  return (await store()).getFounderCharacterDiscoveryRun(projectId);
}

export async function saveFounderCharacterDiscoveryRun(
  run: NdxFounderCharacterDiscoveryRun,
): Promise<NdxFounderCharacterDiscoveryRun> {
  return (await store()).saveFounderCharacterDiscoveryRun(run);
}

export { resetFounderCharacterDiscoveryMemory } from './founderCharacterDiscoveryMemoryStore.js';
