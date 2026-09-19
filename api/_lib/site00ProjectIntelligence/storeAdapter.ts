/**
 * Project intelligence persistence — Supabase in production (fail loud), memory in tests.
 */

import { resolveDurableStoreMode } from '../../../shared/site00-studio-world-execution/persistencePolicy.js';
import type { ProjectIntelligenceIntakeManifest } from '../../../shared/site00-project-intelligence/types.js';
import * as mem from './projectIntelligenceMemoryStore.js';
import * as db from './supabaseStore.js';

export function useProjectIntelligenceMemoryStore(): boolean {
  return process.env.SITE00_PROJECT_INTELLIGENCE_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let storeModeCache: 'memory' | 'supabase' | null = null;

export async function resolveProjectIntelligenceStoreMode(): Promise<'memory' | 'supabase'> {
  if (storeModeCache) return storeModeCache;
  storeModeCache = await resolveDurableStoreMode({
    storeName: 'ProjectIntelligence',
    explicitUseMemory: useProjectIntelligenceMemoryStore(),
    schemaExists: db.projectIntelligenceTablesExist,
    migrationHint: 'run supabase/migrations/20260823200000_site00_studio_world_execution.sql',
  });
  return storeModeCache;
}

export function resetProjectIntelligenceStoreModeCache(): void {
  storeModeCache = null;
}

async function store() {
  return (await resolveProjectIntelligenceStoreMode()) === 'memory' ? mem : db;
}

export async function getLatestManifest(projectSlug: string): Promise<ProjectIntelligenceIntakeManifest | null> {
  return (await store()).getLatestManifest(projectSlug);
}

export async function getAllManifests(projectSlug: string): Promise<ProjectIntelligenceIntakeManifest[]> {
  return (await store()).getAllManifests(projectSlug);
}

export async function saveManifest(manifest: ProjectIntelligenceIntakeManifest): Promise<ProjectIntelligenceIntakeManifest> {
  return (await store()).saveManifest(manifest);
}

export { resetProjectIntelligenceMemory } from './projectIntelligenceMemoryStore.js';
