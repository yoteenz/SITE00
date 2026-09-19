/**
 * Carousel expansion persistence — Supabase in production, memory in tests.
 */

import { hasSupabaseServiceRole } from '../../../supabase.js';
import type { CanonicalCarouselExpansionRun } from '../../../../../shared/site00-brand-lore/canonicalCarouselExpansionTypes.js';
import { NDXBOOK_CANONICAL_CAROUSEL_EXPANSION_RUN_ID } from '../../../../../shared/site00-brand-lore/canonicalCarouselExpansionConstants.js';
import * as mem from './memoryStore.js';
import * as db from './supabaseStore.js';

export function useCarouselExpansionMemoryStore(): boolean {
  return process.env.SITE00_CAROUSEL_EXPANSION_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let storeModeCache: 'memory' | 'supabase' | null = null;

export async function resolveCarouselExpansionStoreMode(): Promise<'memory' | 'supabase'> {
  if (useCarouselExpansionMemoryStore()) {
    storeModeCache = null;
    return 'memory';
  }
  if (storeModeCache) return storeModeCache;
  if (!hasSupabaseServiceRole()) {
    console.warn('[canonical-carousel-expansion] Supabase unavailable — using in-memory store');
    storeModeCache = 'memory';
    return 'memory';
  }
  const exists = await db.methodologyValidationTablesExist();
  if (!exists) {
    console.warn('[canonical-carousel-expansion] Validation tables missing — using in-memory store');
    storeModeCache = 'memory';
    return 'memory';
  }
  storeModeCache = 'supabase';
  return 'supabase';
}

export function resetCarouselExpansionStoreModeCache(): void {
  storeModeCache = null;
}

async function store() {
  return (await resolveCarouselExpansionStoreMode()) === 'memory' ? mem : db;
}

export async function getCanonicalCarouselExpansionRun(
  runId: string = NDXBOOK_CANONICAL_CAROUSEL_EXPANSION_RUN_ID,
): Promise<CanonicalCarouselExpansionRun | null> {
  return (await store()).getCanonicalCarouselExpansionRun(runId);
}

export async function saveCanonicalCarouselExpansionRun(
  run: CanonicalCarouselExpansionRun,
): Promise<CanonicalCarouselExpansionRun> {
  return (await store()).saveCanonicalCarouselExpansionRun(run);
}

export { resetCanonicalCarouselExpansionMemory } from './memoryStore.js';
