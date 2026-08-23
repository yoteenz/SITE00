/**
 * Visual reference persistence — Supabase in production (fail loud), memory in tests.
 */

import { resolveDurableStoreMode } from '../../../shared/site00-studio-world-execution/persistencePolicy.js';
import type {
  ClientVisualMemory,
  HostVisualMemory,
  VisualReferenceRecord,
} from '../../../shared/site00-visual-reference/types.js';
import * as mem from './visualReferenceMemoryStore.js';
import * as db from './supabaseStore.js';

export function useVisualReferenceMemoryStore(): boolean {
  return process.env.SITE00_VISUAL_REFERENCE_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let storeModeCache: 'memory' | 'supabase' | null = null;

export async function resolveVisualReferenceStoreMode(): Promise<'memory' | 'supabase'> {
  if (storeModeCache) return storeModeCache;
  storeModeCache = await resolveDurableStoreMode({
    storeName: 'VisualReference',
    explicitUseMemory: useVisualReferenceMemoryStore(),
    schemaExists: db.visualReferenceTablesExist,
    migrationHint: 'run supabase/migrations/20260823200000_site00_studio_world_execution.sql',
  });
  return storeModeCache;
}

export function resetVisualReferenceStoreModeCache(): void {
  storeModeCache = null;
}

async function store() {
  return (await resolveVisualReferenceStoreMode()) === 'memory' ? mem : db;
}

export async function getHostVisualMemory(): Promise<HostVisualMemory | null> {
  return (await store()).getHostVisualMemory();
}

export async function saveHostVisualMemory(next: HostVisualMemory): Promise<HostVisualMemory> {
  return (await store()).saveHostVisualMemory(next);
}

export async function getClientVisualMemory(projectId: string): Promise<ClientVisualMemory | null> {
  return (await store()).getClientVisualMemory(projectId);
}

export async function saveClientVisualMemory(next: ClientVisualMemory): Promise<ClientVisualMemory> {
  return (await store()).saveClientVisualMemory(next);
}

export async function getVisualReferenceById(id: string): Promise<VisualReferenceRecord | null> {
  return (await store()).getVisualReferenceById(id);
}

export async function saveVisualReference(ref: VisualReferenceRecord): Promise<VisualReferenceRecord> {
  return (await store()).saveVisualReference(ref);
}

export function resetVisualReferenceMemory(): void {
  mem.resetVisualReferenceMemory();
}
