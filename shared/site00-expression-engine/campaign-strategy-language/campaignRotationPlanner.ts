/**
 * P0.CSI.1 — Campaign rotation planner.
 */

import type { CampaignExpressionHistoryEntry, CampaignStrategyType } from './types.js';
import { getBrandCampaignRange } from './brandRangeProfiles.js';
import { filterStrategiesForVariety, buildCreativeVariationPolicy } from './campaignVarietyEngine.js';

export function planCampaignRotation(brandSlug: string, history: CampaignExpressionHistoryEntry[]): {
  suggestedSequence: CampaignStrategyType[];
  rotationNote: string;
} {
  const range = getBrandCampaignRange(brandSlug);
  const policy = buildCreativeVariationPolicy({ brandSlug, history });
  const pool = filterStrategiesForVariety(
    [...range.safeRange, ...range.stretchRange],
    policy,
  );

  const recentPrimary = history
    .filter((h) => h.brandSlug === brandSlug)
    .slice(-3)
    .flatMap((h) => h.strategyTypes.slice(0, 1));

  const suggestedSequence: CampaignStrategyType[] = [];
  for (const candidate of pool) {
    if (suggestedSequence.length >= 4) break;
    if (!recentPrimary.includes(candidate) || suggestedSequence.length === 0) {
      suggestedSequence.push(candidate);
    }
  }

  while (suggestedSequence.length < 4 && pool.length) {
    const next = pool[suggestedSequence.length % pool.length];
    if (next) suggestedSequence.push(next);
    else break;
  }

  const rotationNote =
    recentPrimary.length >= 2
      ? `Last campaigns leaned ${recentPrimary.join(' → ')} — rotation suggests fresh strategy mix`
      : 'No recent campaign fatigue detected — full brand range available';

  return { suggestedSequence, rotationNote };
}
