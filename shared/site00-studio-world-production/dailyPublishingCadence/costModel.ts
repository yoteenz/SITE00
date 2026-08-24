/**
 * Shared research reuse + cost tracking.
 */

import type { ContentCostBreakdown } from './types.js';

export function estimateWeeklyContentCost(params: {
  primaryEventCount: number;
  expressionCount: number;
  sharedResearchUsd?: number;
}): ContentCostBreakdown {
  const shared = params.sharedResearchUsd ?? params.primaryEventCount * 12;
  const perExpression = 8;
  const feed = params.expressionCount * 0.35 * perExpression;
  const story = params.expressionCount * 0.2 * perExpression;
  const reel = params.expressionCount * 0.15 * perExpression;
  const tiktok = params.expressionCount * 0.1 * perExpression;
  const shorts = params.expressionCount * 0.1 * perExpression;
  const text = params.expressionCount * 0.1 * perExpression;
  const weeklyEstimateUsd = shared + feed + story + reel + tiktok + shorts + text;
  const multiplicationGuardPass = params.expressionCount <= params.primaryEventCount * 8;

  return {
    sharedIntelligenceUsd: shared,
    feedUsd: feed,
    storyUsd: story,
    reelUsd: reel,
    tiktokUsd: tiktok,
    shortsUsd: shorts,
    textUsd: text,
    weeklyEstimateUsd,
    multiplicationGuardPass,
  };
}

export function sharedIntelligenceCostSeparateFromExpressionCost(cost: ContentCostBreakdown): boolean {
  return cost.sharedIntelligenceUsd > 0 && cost.feedUsd + cost.reelUsd > 0;
}
