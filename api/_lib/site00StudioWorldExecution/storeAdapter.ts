/**
 * Studio World execution store adapter — fail loud in production, memory in tests.
 */

import { resolveDurableStoreMode } from '../../../shared/site00-studio-world-execution/persistencePolicy.js';
import type {
  CapabilityVerificationRecord,
  StudioWorldIdempotencyRecord,
  StudioWorldRunRecord,
} from '../../../shared/site00-studio-world-execution/types.js';
import * as mem from './memoryStore.js';
import * as db from './supabaseStore.js';

export function useStudioWorldExecutionMemoryStore(): boolean {
  return process.env.SITE00_STUDIO_WORLD_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let storeModeCache: 'memory' | 'supabase' | null = null;

export async function resolveStudioWorldExecutionStoreMode(): Promise<'memory' | 'supabase'> {
  if (storeModeCache) return storeModeCache;
  storeModeCache = await resolveDurableStoreMode({
    storeName: 'StudioWorldExecution',
    explicitUseMemory: useStudioWorldExecutionMemoryStore(),
    schemaExists: db.studioWorldExecutionTablesExist,
    migrationHint: 'run supabase/migrations/20260823200000_site00_studio_world_execution.sql',
  });
  return storeModeCache;
}

export function resetStudioWorldExecutionStoreModeCache(): void {
  storeModeCache = null;
}

async function store() {
  return (await resolveStudioWorldExecutionStoreMode()) === 'memory' ? mem : db;
}

export async function saveStudioWorldRun(record: StudioWorldRunRecord): Promise<StudioWorldRunRecord> {
  return (await store()).saveStudioWorldRun(record);
}

export async function getStudioWorldRunById(id: string): Promise<StudioWorldRunRecord | null> {
  return (await store()).getStudioWorldRunById(id);
}

export async function listStudioWorldRuns(params: {
  projectSlug?: string;
  runType?: string;
  limit?: number;
}): Promise<StudioWorldRunRecord[]> {
  return (await store()).listStudioWorldRuns(params);
}

export async function saveStudioWorldRunWithVersionCheck(
  record: StudioWorldRunRecord,
  expectedVersion: number,
): Promise<StudioWorldRunRecord> {
  return (await store()).saveStudioWorldRunWithVersionCheck(record, expectedVersion);
}

export async function registerIdempotencyKey(
  record: Omit<StudioWorldIdempotencyRecord, 'id' | 'createdAt'>,
): Promise<StudioWorldIdempotencyRecord> {
  return (await store()).registerIdempotencyKey(record);
}

export async function findIdempotencyKey(params: {
  projectSlug: string | null;
  idempotencyKey: string;
  inputFingerprint: string;
}): Promise<StudioWorldIdempotencyRecord | null> {
  return (await store()).findIdempotencyKey(params);
}

export async function upsertCapabilityVerification(
  record: CapabilityVerificationRecord,
): Promise<CapabilityVerificationRecord> {
  return (await store()).upsertCapabilityVerification(record);
}

export async function listCapabilityVerifications(): Promise<CapabilityVerificationRecord[]> {
  return (await store()).listCapabilityVerifications();
}

export { resetStudioWorldExecutionMemory } from './memoryStore.js';
