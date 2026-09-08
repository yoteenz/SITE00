/**
 * B5.6R1 — Campaign package store mode resolution.
 */

import { hasSupabaseServiceRole } from '../supabase.js';
import { campaignPackageSchemaExists } from './supabaseStore.js';
import { resolveDurableStoreMode } from '../../../shared/site00-studio-world-execution/persistencePolicy.js';

export const CAMPAIGN_PACKAGE_STORE_MODES = ['SUPABASE', 'MEMORY_TEST', 'LOCAL_FALLBACK'] as const;
export type CampaignPackageStoreMode = (typeof CAMPAIGN_PACKAGE_STORE_MODES)[number];

export function useCampaignPackageMemoryStore(): boolean {
  return (
    process.env.SITE00_CAMPAIGN_PACKAGE_USE_MEMORY === '1' ||
    process.env.VITEST === 'true'
  );
}

export async function resolveCampaignPackageStoreMode(): Promise<CampaignPackageStoreMode> {
  if (useCampaignPackageMemoryStore()) return 'MEMORY_TEST';

  try {
    const durable = await resolveDurableStoreMode({
      storeName: 'CampaignPackage',
      explicitUseMemory: false,
      schemaExists: campaignPackageSchemaExists,
      migrationHint: 'run supabase/migrations/20260908160000_site00_campaign_package_persistence.sql',
    });
    if (durable === 'supabase') return 'SUPABASE';
  } catch {
    if (process.env.NODE_ENV === 'production' || process.env.SITE00_DURABLE_REQUIRED === '1') {
      throw new Error('Campaign package production persistence unavailable — configure Supabase service role');
    }
  }

  return 'LOCAL_FALLBACK';
}

export function resolveCampaignPackageStoreModeSyncForTests(): CampaignPackageStoreMode {
  if (useCampaignPackageMemoryStore()) return 'MEMORY_TEST';
  if (hasSupabaseServiceRole()) return 'SUPABASE';
  return 'LOCAL_FALLBACK';
}
