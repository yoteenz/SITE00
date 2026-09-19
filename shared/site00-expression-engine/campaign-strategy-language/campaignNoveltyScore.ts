/**
 * P0.CSI.1 — Campaign novelty scoring.
 */

import type {
  CampaignExpressionHistoryEntry,
  CampaignNoveltyScore,
  CampaignStrategyType,
  ProductRoleInCampaign,
} from './types.js';
import { getStrategyDefinition } from './strategyLibrary.js';

export function computeCampaignNoveltyScore(input: {
  brandSlug: string;
  strategyType: CampaignStrategyType;
  productRole: ProductRoleInCampaign;
  history: CampaignExpressionHistoryEntry[];
}): CampaignNoveltyScore {
  const brandHistory = input.history.filter((h) => h.brandSlug === input.brandSlug);
  const recent = brandHistory.slice(-6);

  const strategyNovelty = noveltyFromRecency(
    recent.flatMap((h) => h.strategyTypes),
    input.strategyType,
  );
  const productRoleNovelty = noveltyFromRecency(
    recent.map((h) => h.productRole),
    input.productRole,
  );

  const def = getStrategyDefinition(input.strategyType);
  const sequenceNovelty = def.defaultSequenceGrammar.length > 4 ? 0.75 : 0.5;
  const visualNovelty = def.defaultProfile.visualRisk === 'HIGH' ? 0.8 : 0.5;
  const copyNovelty = def.defaultCopyBehavior === 'NO_COPY' ? 0.7 : 0.4;
  const settingNovelty =
    def.defaultEnvironmentRole === 'STORY_ENGINE' || def.defaultEnvironmentRole === 'RECURRING_WORLD'
      ? 0.75
      : 0.45;

  const overall =
    (strategyNovelty +
      settingNovelty +
      sequenceNovelty +
      visualNovelty +
      copyNovelty +
      productRoleNovelty) /
    6;

  return {
    strategyNovelty,
    settingNovelty,
    sequenceNovelty,
    visualNovelty,
    copyNovelty,
    productRoleNovelty,
    overall: Math.round(overall * 100) / 100,
  };
}

function noveltyFromRecency<T>(recent: T[], value: T): number {
  if (!recent.length) return 1;
  const matches = recent.filter((v) => v === value).length;
  if (matches === 0) return 1;
  if (matches === 1) return 0.6;
  if (matches === 2) return 0.35;
  return 0.15;
}
