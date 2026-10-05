/**
 * Brand Lore store adapter — Supabase in production/dev (fail loud if unavailable), memory for
 * tests only. Same pattern as api/_lib/site00Intakes/storeAdapter.ts and
 * api/_lib/site00Evolve/storeAdapter.ts.
 */
import { hasSupabaseServiceRole } from '../supabase.js';
import * as mem from './memoryStore.js';
import * as db from './supabaseStore.js';
import type { BrandLoreProfile } from '../../../shared/site00-brand-lore/types.js';

export class BrandLoreStoreUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BrandLoreStoreUnavailableError';
  }
}

export function useMemoryStore(): boolean {
  return process.env.SITE00_BRAND_LORE_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let storeModeCache: 'memory' | 'supabase' | null = null;

export async function resolveBrandLoreStoreMode(): Promise<'memory' | 'supabase'> {
  if (useMemoryStore()) {
    storeModeCache = null;
    return 'memory';
  }
  if (storeModeCache) return storeModeCache;
  if (!hasSupabaseServiceRole()) {
    throw new BrandLoreStoreUnavailableError(
      'Brand Lore persistence requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY — memory fallback is disabled outside tests',
    );
  }
  const exists = await db.brandLoreTablesExist();
  if (!exists) {
    throw new BrandLoreStoreUnavailableError(
      'Brand Lore Supabase schema incomplete — run supabase/migrations/20260821050000_site00_brand_lore_profiles.sql',
    );
  }
  storeModeCache = 'supabase';
  return 'supabase';
}

export function resetBrandLoreStoreModeCache(): void {
  storeModeCache = null;
}

async function store() {
  const mode = await resolveBrandLoreStoreMode();
  return mode === 'memory' ? mem : db;
}

export async function saveBrandLoreProfile(profile: BrandLoreProfile): Promise<BrandLoreProfile> {
  return (await store()).saveBrandLoreProfile(profile);
}

export async function getBrandLoreProfileById(id: string): Promise<BrandLoreProfile | null> {
  return (await store()).getBrandLoreProfileById(id);
}

export async function getBrandLoreProfileByIntake(
  intakeType: 'IDENTITY' | 'BUILDER' | 'CONTENT_BRAIN',
  intakeId: string,
): Promise<BrandLoreProfile | null> {
  return (await store()).getBrandLoreProfileByIntake(intakeType, intakeId);
}

export async function getBrandLoreProfileByOrgId(orgId: string): Promise<BrandLoreProfile | null> {
  return (await store()).getBrandLoreProfileByOrgId(orgId);
}

export async function confirmLoreField(
  profileId: string,
  fieldKey: keyof BrandLoreProfile,
): Promise<BrandLoreProfile | null> {
  return (await store()).confirmLoreField(profileId, fieldKey);
}
