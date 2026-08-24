/**
 * Campaign production memory store — tests + dev.
 */

import type { MarketingCampaignProductionRun } from '../../../../shared/site00-studio-world-production/marketingCampaignProduction/types.js';

let run: MarketingCampaignProductionRun | null = null;

export async function getCampaignProductionRun(_projectId: string): Promise<MarketingCampaignProductionRun | null> {
  return run;
}

export async function saveCampaignProductionRun(
  next: MarketingCampaignProductionRun,
): Promise<MarketingCampaignProductionRun> {
  run = next;
  return next;
}

export function resetCampaignProductionMemory(): void {
  run = null;
}
