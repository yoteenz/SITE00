/**
 * Environment-aware persistence policy — production must not silently fall back to memory.
 */

import { DurablePersistenceUnavailableError } from './errors.js';

function hasSupabaseServiceRole(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export type PersistencePolicyMode =
  | 'PRODUCTION_DURABLE_REQUIRED'
  | 'DEVELOPMENT_DURABLE_PREFERRED'
  | 'TEST_IN_MEMORY_ALLOWED';

export function resolvePersistencePolicyMode(): PersistencePolicyMode {
  if (process.env.VITEST === 'true') return 'TEST_IN_MEMORY_ALLOWED';
  if (process.env.NODE_ENV === 'production' || process.env.SITE00_DURABLE_REQUIRED === '1') {
    return 'PRODUCTION_DURABLE_REQUIRED';
  }
  return 'DEVELOPMENT_DURABLE_PREFERRED';
}

export function isTestMemoryAllowed(explicitUseMemoryFlag?: boolean): boolean {
  return process.env.VITEST === 'true' || explicitUseMemoryFlag === true;
}

export function isExplicitDevMemoryFallbackAllowed(): boolean {
  return process.env.SITE00_ALLOW_MEMORY_FALLBACK === '1';
}

let warnedDevFallbackStores = new Set<string>();

export async function resolveDurableStoreMode(params: {
  storeName: string;
  explicitUseMemory?: boolean;
  schemaExists: () => Promise<boolean>;
  migrationHint: string;
}): Promise<'memory' | 'supabase'> {
  if (isTestMemoryAllowed(params.explicitUseMemory)) {
    return 'memory';
  }

  const policy = resolvePersistencePolicyMode();

  if (!hasSupabaseServiceRole()) {
    if (policy === 'PRODUCTION_DURABLE_REQUIRED') {
      throw new DurablePersistenceUnavailableError(
        `${params.storeName} requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in production — memory fallback is disabled`,
      );
    }
    if (isExplicitDevMemoryFallbackAllowed()) {
      if (!warnedDevFallbackStores.has(params.storeName)) {
        warnedDevFallbackStores.add(params.storeName);
        console.warn(
          `[SITE00] ${params.storeName}: using explicit dev memory fallback (SITE00_ALLOW_MEMORY_FALLBACK=1)`,
        );
      }
      return 'memory';
    }
    throw new DurablePersistenceUnavailableError(
      `${params.storeName} requires durable Supabase persistence — set credentials or SITE00_ALLOW_MEMORY_FALLBACK=1 for explicit dev fallback`,
    );
  }

  const exists = await params.schemaExists();
  if (!exists) {
    throw new DurablePersistenceUnavailableError(
      `${params.storeName} Supabase schema incomplete — ${params.migrationHint}`,
    );
  }

  return 'supabase';
}

export function resetPersistencePolicyWarnings(): void {
  warnedDevFallbackStores = new Set();
}
