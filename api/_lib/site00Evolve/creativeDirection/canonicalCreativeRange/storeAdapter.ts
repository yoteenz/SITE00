/**
 * Canonical creative range validation persistence — Supabase in production, memory in tests.
 */

import { hasSupabaseServiceRole } from '../../../supabase.js';
import type { CanonicalCreativeRangeRun } from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeTypes.js';
import { NDXBOOK_CANONICAL_CREATIVE_RANGE_RUN_ID } from '../../../../../shared/site00-brand-lore/canonicalCreativeRangeConstants.js';
import * as mem from './memoryStore.js';
import * as db from './supabaseStore.js';

export function useCanonicalRangeMemoryStore(): boolean {
  return process.env.SITE00_CANONICAL_RANGE_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let storeModeCache: 'memory' | 'supabase' | null = null;

export async function resolveCanonicalRangeStoreMode(): Promise<'memory' | 'supabase'> {
  if (useCanonicalRangeMemoryStore()) {
    storeModeCache = null;
    return 'memory';
  }
  if (storeModeCache) return storeModeCache;
  if (!hasSupabaseServiceRole()) {
    console.warn('[canonical-creative-range] Supabase unavailable — using in-memory store');
    storeModeCache = 'memory';
    return 'memory';
  }
  const exists = await db.methodologyValidationTablesExist();
  if (!exists) {
    console.warn('[canonical-creative-range] Validation tables missing — using in-memory store');
    storeModeCache = 'memory';
    return 'memory';
  }
  storeModeCache = 'supabase';
  return 'supabase';
}

export function resetCanonicalRangeStoreModeCache(): void {
  storeModeCache = null;
}

async function store() {
  return (await resolveCanonicalRangeStoreMode()) === 'memory' ? mem : db;
}

export async function getCanonicalCreativeRangeRun(
  runId: string = NDXBOOK_CANONICAL_CREATIVE_RANGE_RUN_ID,
): Promise<CanonicalCreativeRangeRun | null> {
  return (await store()).getCanonicalCreativeRangeRun(runId);
}

export async function saveCanonicalCreativeRangeRun(run: CanonicalCreativeRangeRun): Promise<CanonicalCreativeRangeRun> {
  return (await store()).saveCanonicalCreativeRangeRun(run);
}

export { resetCanonicalCreativeRangeMemory } from './memoryStore.js';
