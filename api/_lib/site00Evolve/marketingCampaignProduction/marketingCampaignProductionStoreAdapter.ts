/**
 * Campaign production store adapter.
 */

import { resolveDurableStoreMode } from '../../../../shared/site00-studio-world-execution/persistencePolicy.js';
import type { MarketingCampaignProductionRun } from '../../../../shared/site00-studio-world-production/marketingCampaignProduction/types.js';
import * as mem from './marketingCampaignProductionMemoryStore.js';

export function useCampaignProductionMemoryStore(): boolean {
  return process.env.SITE00_CAMPAIGN_PRODUCTION_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let cachedMode: 'memory' | 'supabase' | null = null;

export async function resolveCampaignProductionStoreMode(): Promise<'memory' | 'supabase'> {
  if (cachedMode) return cachedMode;
  cachedMode = useCampaignProductionMemoryStore() ? 'memory' : 'memory';
  return cachedMode;
}

export function resetCampaignProductionStoreModeCache(): void {
  cachedMode = null;
}

async function store() {
  return (await resolveCampaignProductionStoreMode()) === 'memory' ? mem : mem;
}

export async function getCampaignProductionRun(projectId: string): Promise<MarketingCampaignProductionRun | null> {
  return (await store()).getCampaignProductionRun(projectId);
}

export async function saveCampaignProductionRun(
  run: MarketingCampaignProductionRun,
): Promise<MarketingCampaignProductionRun> {
  return (await store()).saveCampaignProductionRun(run);
}

export { resetCampaignProductionMemory } from './marketingCampaignProductionMemoryStore.js';
