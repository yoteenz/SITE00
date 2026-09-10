/**
 * P0.CSI.1 — Anti-repetition / variety engine.
 */

import type {
  CampaignExpressionHistoryEntry,
  CampaignStrategyType,
  CreativeVariationPolicy,
} from './types.js';
export type { CreativeVariationPolicy };
import type { FounderCreativeAppetiteProfile } from '../../site00-brand-lore/founderCreativeAppetite/types.js';
import { getBrandCampaignRange } from './brandRangeProfiles.js';

const REPEAT_WINDOW = 4;

export function detectVarietyWarnings(
  brandSlug: string,
  candidateStrategy: CampaignStrategyType,
  history: CampaignExpressionHistoryEntry[],
): string[] {
  const recent = history
    .filter((h) => h.brandSlug === brandSlug)
    .slice(-REPEAT_WINDOW);
  const warnings: string[] = [];

  const recentStrategies = recent.flatMap((h) => h.strategyTypes);
  const sameCount = recentStrategies.filter((s) => s === candidateStrategy).length;
  if (sameCount >= 2) {
    warnings.push(`Strategy ${candidateStrategy} used ${sameCount} times in last ${REPEAT_WINDOW} campaigns`);
  }

  const recentReveals = recent.map((h) => h.revealStyle);
  const dominantReveal = mode(recentReveals);
  if (dominantReveal && recentReveals.filter((r) => r === dominantReveal).length >= 3) {
    warnings.push(`Reveal style ${dominantReveal} repeating — consider variation`);
  }

  return warnings;
}

function mode<T>(arr: T[]): T | null {
  if (!arr.length) return null;
  const counts = new Map<T, number>();
  for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best: T | null = null;
  let bestN = 0;
  for (const [k, n] of counts) {
    if (n > bestN) {
      best = k;
      bestN = n;
    }
  }
  return best;
}

export function buildCreativeVariationPolicy(input: {
  brandSlug: string;
  appetite?: FounderCreativeAppetiteProfile | null;
  history: CampaignExpressionHistoryEntry[];
}): CreativeVariationPolicy {
  const range = getBrandCampaignRange(input.brandSlug);
  const recentStrategies = input.history
    .filter((h) => h.brandSlug === input.brandSlug)
    .slice(-REPEAT_WINDOW)
    .flatMap((h) => h.strategyTypes);

  const avoidStrategies = [...new Set(recentStrategies)] as CampaignStrategyType[];
  const appetiteBand = input.appetite?.creativeRiskTolerance?.value ?? 'CONTROLLED';

  return {
    brandSlug: input.brandSlug,
    allowedSafe: range.safeRange.filter((s) => !shouldOverAvoid(s, recentStrategies, appetiteBand)),
    allowedStretch: range.stretchRange,
    allowedExperimental:
      appetiteBand === 'ADVENTUROUS' || appetiteBand === 'HIGH_EXPERIMENTATION'
        ? range.experimentalRange
        : [],
    avoidRecentStrategies: avoidStrategies,
    deviationBudget: appetiteBand === 'CONSERVATIVE' ? 'LOW' : appetiteBand === 'OPEN' ? 'HIGH' : 'MEDIUM',
  };
}

function shouldOverAvoid(
  strategy: CampaignStrategyType,
  recent: CampaignStrategyType[],
  appetite: string,
): boolean {
  const count = recent.filter((s) => s === strategy).length;
  if (count >= 2) return true;
  if (count >= 1 && appetite === 'CONSERVATIVE') return true;
  return false;
}

export function filterStrategiesForVariety(
  candidates: CampaignStrategyType[],
  policy: CreativeVariationPolicy,
): CampaignStrategyType[] {
  return candidates.filter((s) => {
    if (policy.avoidRecentStrategies.filter((a) => a === s).length >= 2) return false;
    return true;
  });
}
