/**
 * Personality replay store adapter — memory in tests, Supabase in production.
 */

import { hasSupabaseServiceRole } from '../../../../supabase.js';
import type { BrandPersonalityReplayRecord } from '../../../../../shared/site00-brand-lore/personalityReplayTypes.js';
import * as mem from './memoryStore.js';
import * as db from './supabaseStore.js';

export class PersonalityReplayStoreUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PersonalityReplayStoreUnavailableError';
  }
}

export function useMemoryReplayStore(): boolean {
  return process.env.SITE00_REPLAY_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let storeModeCache: 'memory' | 'supabase' | null = null;

export async function resolveReplayStoreMode(): Promise<'memory' | 'supabase'> {
  if (useMemoryReplayStore()) {
    storeModeCache = null;
    return 'memory';
  }
  if (storeModeCache) return storeModeCache;
  if (!hasSupabaseServiceRole()) {
    console.warn('[personality-replay] Supabase unavailable — using in-memory replay store');
    storeModeCache = 'memory';
    return 'memory';
  }
  const exists = await db.methodologyValidationTablesExist();
  if (!exists) {
    console.warn(
      '[personality-replay] Validation tables missing — using in-memory replay store. Run supabase/migrations/20260823010000_site00_methodology_validation_runs.sql',
    );
    storeModeCache = 'memory';
    return 'memory';
  }
  storeModeCache = 'supabase';
  return 'supabase';
}

export function resetPersonalityReplayStoreModeCache(): void {
  storeModeCache = null;
}

export { resetPersonalityReplayMemoryStore } from './memoryStore.js';

async function store() {
  return (await resolveReplayStoreMode()) === 'memory' ? mem : db;
}

export async function savePersonalityReplayRecord(
  record: BrandPersonalityReplayRecord,
): Promise<BrandPersonalityReplayRecord> {
  return (await store()).savePersonalityReplayRecord(record);
}

export async function getPersonalityReplayRecord(replayId: string): Promise<BrandPersonalityReplayRecord | null> {
  return (await store()).getPersonalityReplayRecord(replayId);
}

export async function listPersonalityReplayRecordsForOrg(
  organizationId: string,
): Promise<BrandPersonalityReplayRecord[]> {
  return (await store()).listPersonalityReplayRecordsForOrg(organizationId);
}
