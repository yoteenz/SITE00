/**
 * Intake store adapter — Supabase in production/dev (fail loud if unavailable), memory for tests
 * only. Same pattern as api/_lib/site00Evolve/storeAdapter.ts.
 */
import { hasSupabaseServiceRole } from '../supabase.js';
import * as mem from './memoryStore.js';
import * as db from './supabaseStore.js';
import type { IntakeType } from '../../../shared/site00-intakes/types.js';
import type {
  AccessTokenRecord,
  AdminIntakeFilters,
  CreateAccessTokenInput,
  CreateIntakeEventInput,
  CreateIntakeInput,
  IntakeEventRecord,
  IntakeRecord,
  IntakeUpdate,
} from './types.js';

export class IntakeStoreUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IntakeStoreUnavailableError';
  }
}

export function useMemoryStore(): boolean {
  return process.env.SITE00_INTAKES_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let storeModeCache: 'memory' | 'supabase' | null = null;

export async function resolveIntakeStoreMode(): Promise<'memory' | 'supabase'> {
  if (useMemoryStore()) {
    storeModeCache = null;
    return 'memory';
  }
  if (storeModeCache) return storeModeCache;
  if (!hasSupabaseServiceRole()) {
    throw new IntakeStoreUnavailableError(
      'Intake persistence requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY — memory fallback is disabled outside tests',
    );
  }
  const exists = await db.intakeTablesExist();
  if (!exists) {
    throw new IntakeStoreUnavailableError(
      'Intake Supabase schema incomplete — run supabase/migrations/20260821010000_site00_intake_persistence.sql',
    );
  }
  storeModeCache = 'supabase';
  return 'supabase';
}

export function resetIntakeStoreModeCache(): void {
  storeModeCache = null;
}

async function store() {
  const mode = await resolveIntakeStoreMode();
  return mode === 'memory' ? mem : db;
}

export async function createIntake(input: CreateIntakeInput): Promise<IntakeRecord> {
  return (await store()).createIntake(input);
}

export async function getIntakeById(intakeType: IntakeType, id: string): Promise<IntakeRecord | null> {
  return (await store()).getIntakeById(intakeType, id);
}

export async function listIntakesByUserId(userId: string): Promise<IntakeRecord[]> {
  return (await store()).listIntakesByUserId(userId);
}

export async function listUnclaimedIntakesByEmail(email: string): Promise<IntakeRecord[]> {
  return (await store()).listUnclaimedIntakesByEmail(email);
}

export async function updateIntake(intakeType: IntakeType, id: string, patch: IntakeUpdate): Promise<IntakeRecord> {
  return (await store()).updateIntake(intakeType, id, patch);
}

export async function listIntakesForAdmin(filters: AdminIntakeFilters): Promise<IntakeRecord[]> {
  return (await store()).listIntakesForAdmin(filters);
}

export async function createAccessToken(input: CreateAccessTokenInput): Promise<AccessTokenRecord> {
  return (await store()).createAccessToken(input);
}

export async function getAccessTokenByHash(tokenHash: string): Promise<AccessTokenRecord | null> {
  return (await store()).getAccessTokenByHash(tokenHash);
}

export async function listActiveTokensForIntake(
  intakeType: IntakeType,
  intakeId: string,
  purpose: AccessTokenRecord['purpose'],
): Promise<AccessTokenRecord[]> {
  return (await store()).listActiveTokensForIntake(intakeType, intakeId, purpose);
}

export async function updateAccessToken(id: string, patch: Partial<AccessTokenRecord>): Promise<AccessTokenRecord> {
  return (await store()).updateAccessToken(id, patch);
}

export async function createIntakeEvent(input: CreateIntakeEventInput): Promise<IntakeEventRecord> {
  return (await store()).createIntakeEvent(input);
}

export async function listEventsForIntake(intakeType: IntakeType, intakeId: string): Promise<IntakeEventRecord[]> {
  return (await store()).listEventsForIntake(intakeType, intakeId);
}
