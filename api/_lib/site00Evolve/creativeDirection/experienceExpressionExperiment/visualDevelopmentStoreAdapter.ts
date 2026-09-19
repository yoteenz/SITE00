/**
 * Visual development persistence — Supabase in production (fail loud), memory in tests.
 */

import { resolveDurableStoreMode } from '../../../../../shared/site00-studio-world-execution/persistencePolicy.js';
import type { ProjectWorkspaceVisualDevelopmentRun } from '../../../../../shared/site00-brand-lore/experienceExpression/designProofTypes.js';
import * as mem from './visualDevelopmentMemoryStore.js';
import * as db from './visualDevelopmentSupabaseStore.js';

export function useVisualDevelopmentMemoryStore(): boolean {
  return process.env.SITE00_VISUAL_DEVELOPMENT_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let storeModeCache: 'memory' | 'supabase' | null = null;

export async function resolveVisualDevelopmentStoreMode(): Promise<'memory' | 'supabase'> {
  if (storeModeCache) return storeModeCache;
  storeModeCache = await resolveDurableStoreMode({
    storeName: 'VisualDevelopment',
    explicitUseMemory: useVisualDevelopmentMemoryStore(),
    schemaExists: db.visualDevelopmentTablesExist,
    migrationHint: 'run supabase/migrations/20260823200000_site00_studio_world_execution.sql',
  });
  return storeModeCache;
}

export function resetVisualDevelopmentStoreModeCache(): void {
  storeModeCache = null;
}

async function store() {
  return (await resolveVisualDevelopmentStoreMode()) === 'memory' ? mem : db;
}

export async function getVisualDevelopmentRun(): Promise<ProjectWorkspaceVisualDevelopmentRun | null> {
  return (await store()).getVisualDevelopmentRun();
}

export function getVisualDevelopmentRunSync(): ProjectWorkspaceVisualDevelopmentRun | null {
  return mem.getVisualDevelopmentRun();
}

export async function saveVisualDevelopmentRun(
  next: ProjectWorkspaceVisualDevelopmentRun,
): Promise<ProjectWorkspaceVisualDevelopmentRun> {
  return (await store()).saveVisualDevelopmentRun(next);
}

export function resetVisualDevelopmentMemory(): void {
  mem.resetVisualDevelopmentMemory();
}
