/**
 * P0.5E.5 — Character Continuity store adapter.
 */

import { resolveDurableStoreMode } from '../../../../shared/site00-studio-world-execution/persistencePolicy.js';
import type { NdxCharacterContinuityPipelineRun } from '../../../../shared/site00-brand-lore/ndxCharacterContinuityPipeline/types.js';
import * as mem from './characterContinuityMemoryStore.js';
import * as db from './characterContinuitySupabaseStore.js';

export function useCharacterContinuityMemoryStore(): boolean {
  return process.env.SITE00_CHARACTER_CONTINUITY_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let cachedMode: 'memory' | 'supabase' | null = null;

export async function resolveCharacterContinuityStoreMode(): Promise<'memory' | 'supabase'> {
  if (cachedMode) return cachedMode;
  cachedMode = await resolveDurableStoreMode({
    storeName: 'CharacterContinuity',
    explicitUseMemory: useCharacterContinuityMemoryStore(),
    schemaExists: db.characterContinuityTablesExist,
    migrationHint: 'run supabase/migrations/20260823010000_site00_methodology_validation_runs.sql',
  });
  return cachedMode;
}

export function resetCharacterContinuityStoreModeCache(): void {
  cachedMode = null;
}

async function store() {
  return (await resolveCharacterContinuityStoreMode()) === 'memory' ? mem : db;
}

export async function getCharacterContinuityRun(
  projectId: string,
): Promise<NdxCharacterContinuityPipelineRun | null> {
  return (await store()).getCharacterContinuityRun(projectId);
}

export async function saveCharacterContinuityRun(
  run: NdxCharacterContinuityPipelineRun,
): Promise<NdxCharacterContinuityPipelineRun> {
  return (await store()).saveCharacterContinuityRun(run);
}

export { resetCharacterContinuityMemory } from './characterContinuityMemoryStore.js';
