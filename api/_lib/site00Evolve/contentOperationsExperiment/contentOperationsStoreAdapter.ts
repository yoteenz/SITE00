/**
 * Content Operations store adapter.
 */

import { resolveDurableStoreMode } from '../../../../shared/site00-studio-world-execution/persistencePolicy.js';
import type { ContentOperationsRun } from '../../../../shared/site00-brand-lore/contentOperations/types.js';
import * as mem from './contentOperationsMemoryStore.js';
import * as db from './contentOperationsSupabaseStore.js';

export function useContentOperationsMemoryStore(): boolean {
  return process.env.SITE00_CONTENT_OPERATIONS_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let cachedMode: 'memory' | 'supabase' | null = null;

export async function resolveContentOperationsStoreMode(): Promise<'memory' | 'supabase'> {
  if (cachedMode) return cachedMode;
  cachedMode = await resolveDurableStoreMode({
    storeName: 'ContentOperations',
    explicitUseMemory: useContentOperationsMemoryStore(),
    schemaExists: db.contentOperationsTablesExist,
    migrationHint: 'run supabase/migrations/20260823010000_site00_methodology_validation_runs.sql',
  });
  return cachedMode;
}

export function resetContentOperationsStoreModeCache(): void {
  cachedMode = null;
}

async function store() {
  return (await resolveContentOperationsStoreMode()) === 'memory' ? mem : db;
}

export async function getContentOperationsRun(projectId: string): Promise<ContentOperationsRun | null> {
  return (await store()).getContentOperationsRun(projectId);
}

export async function saveContentOperationsRun(run: ContentOperationsRun): Promise<ContentOperationsRun> {
  return (await store()).saveContentOperationsRun(run);
}

export { resetContentOperationsMemory } from './contentOperationsMemoryStore.js';
