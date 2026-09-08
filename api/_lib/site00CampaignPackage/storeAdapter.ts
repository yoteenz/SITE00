/**
 * B5.6 — Campaign package store adapter (memory for tests, Supabase when configured).
 */

import { hasSupabaseServiceRole } from '../supabase.js';
import * as mem from './memoryStore.js';

export function useCampaignPackageMemoryStore(): boolean {
  return process.env.SITE00_CAMPAIGN_PACKAGE_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

export async function resolveCampaignPackageStoreMode(): Promise<'memory' | 'supabase'> {
  if (useCampaignPackageMemoryStore()) return 'memory';
  if (!hasSupabaseServiceRole()) return 'memory';
  return 'supabase';
}

export { mem };
