/**
 * Core Direction Formation store adapter — Supabase in production (fail loud),
 * memory for tests only.
 */

import { hasSupabaseServiceRole } from '../../../../supabase.js';
import type { CoreDirectionFormationRecord } from '../types.js';
import * as mem from './memoryStore.js';
import * as db from './supabaseStore.js';

export class FormationStoreUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FormationStoreUnavailableError';
  }
}

export function useFormationMemoryStore(): boolean {
  return process.env.SITE00_FORMATION_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let storeModeCache: 'memory' | 'supabase' | null = null;

export async function resolveFormationStoreMode(): Promise<'memory' | 'supabase'> {
  if (useFormationMemoryStore()) {
    storeModeCache = null;
    return 'memory';
  }
  if (storeModeCache) return storeModeCache;
  if (!hasSupabaseServiceRole()) {
    throw new FormationStoreUnavailableError(
      'Core Direction Formation persistence requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY — memory fallback is disabled outside tests',
    );
  }
  const exists = await db.formationTablesExist();
  if (!exists) {
    throw new FormationStoreUnavailableError(
      'Core Direction Formation Supabase schema incomplete — run supabase/migrations/20260822140000_site00_core_direction_formations.sql',
    );
  }
  storeModeCache = 'supabase';
  return 'supabase';
}

export function resetFormationStoreModeCache(): void {
  storeModeCache = null;
}

async function store() {
  const mode = await resolveFormationStoreMode();
  return mode === 'memory' ? mem : db;
}

export async function saveFormationRecord(record: CoreDirectionFormationRecord): Promise<CoreDirectionFormationRecord> {
  return (await store()).saveFormationRecord(record);
}

export async function getFormationRecordByIdempotencyKey(
  idempotencyKey: string,
): Promise<CoreDirectionFormationRecord | null> {
  return (await store()).getFormationRecordByIdempotencyKey(idempotencyKey);
}

export async function getFormationRecordById(formationId: string): Promise<CoreDirectionFormationRecord | null> {
  return (await store()).getFormationRecordById(formationId);
}

export async function listFormationRecordsByOrganizationId(
  organizationId: string,
): Promise<CoreDirectionFormationRecord[]> {
  return (await store()).listFormationRecordsByOrganizationId(organizationId);
}

export function resetFormationMemoryStore(): void {
  mem.resetFormationMemoryStore();
}
