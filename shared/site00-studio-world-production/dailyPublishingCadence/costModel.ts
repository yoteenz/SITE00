/**
 * Shared research reuse + cost tracking.
 * Baseline assumes target Reels/week; max-normal is labeled capacity projection only.
 */

import type { ContentCostBreakdown, PublishingCadencePolicy } from './types.js';
import { channelTargetFor } from './publishingCadencePolicy.js';

const PER_EXPRESSION_USD = 8;

function channelCostFromUnits(units: number, share: number): number {
  return units * share * PER_EXPRESSION_USD;
}

export function estimateWeeklyContentCost(params: {
  primaryEventCount: number;
  expressionCount: number;
  sharedResearchUsd?: number;
  policy?: PublishingCadencePolicy;
  approvedSecondReelsPerWeek?: number;
}): ContentCostBreakdown {
  const shared = params.sharedResearchUsd ?? params.primaryEventCount * 12;
  const perExpression = PER_EXPRESSION_USD;
  const feed = params.expressionCount * 0.35 * perExpression;
  const story = params.expressionCount * 0.2 * perExpression;
  const reel = params.expressionCount * 0.15 * perExpression;
  const tiktok = params.expressionCount * 0.1 * perExpression;
  const shorts = params.expressionCount * 0.1 * perExpression;
  const text = params.expressionCount * 0.1 * perExpression;
  const weeklyEstimateUsd = shared + feed + story + reel + tiktok + shorts + text;
  const multiplicationGuardPass = params.expressionCount <= params.primaryEventCount * 8;

  const reelTargetPerWeek =
    (params.policy ? channelTargetFor(params.policy, 'INSTAGRAM', 'REEL')?.targetPerDay ?? 1 : 1) * 7;
  const reelMaxPerWeek =
    (params.policy
      ? channelTargetFor(params.policy, 'INSTAGRAM', 'REEL')?.maxNormalPerDay ??
        channelTargetFor(params.policy, 'INSTAGRAM', 'REEL')?.targetPerDay ??
        1
      : 1) * 7;
  const approvedSecondReels = params.approvedSecondReelsPerWeek ?? 0;
  const baselineReelsPerWeek = reelTargetPerWeek;
  const maxNormalReelsPerWeek = reelMaxPerWeek;

  const baselineReelUsd = channelCostFromUnits(baselineReelsPerWeek, 1);
  const maxNormalReelUsd = channelCostFromUnits(maxNormalReelsPerWeek, 1);
  const optionalReelUsd =
    approvedSecondReels > 0 ? channelCostFromUnits(approvedSecondReels, 1) : 0;

  const baselineWeeklyEstimateUsd = shared + feed + story + baselineReelUsd + tiktok + shorts + text;
  const maxNormalWeeklyEstimateUsd = shared + feed + story + maxNormalReelUsd + tiktok + shorts + text;
  const actualPlannedWeeklyEstimateUsd = baselineWeeklyEstimateUsd + optionalReelUsd;

  return {
    sharedIntelligenceUsd: shared,
    feedUsd: feed,
    storyUsd: story,
    reelUsd: reel,
    tiktokUsd: tiktok,
    shortsUsd: shorts,
    textUsd: text,
    weeklyEstimateUsd,
    baselineWeeklyEstimateUsd,
    maxNormalWeeklyEstimateUsd,
    actualPlannedWeeklyEstimateUsd,
    baselineReelsPerWeek,
    maxNormalReelsPerWeek,
    approvedSecondReelsPerWeek: approvedSecondReels,
    costSemanticLevel: approvedSecondReels > 0 ? 'ACTUAL_PLANNED' : 'TARGET',
    multiplicationGuardPass,
  };
}

export function sharedIntelligenceCostSeparateFromExpressionCost(cost: ContentCostBreakdown): boolean {
  return cost.sharedIntelligenceUsd > 0 && cost.feedUsd + cost.reelUsd > 0;
}

export function baselineCostUsesTargetReels(cost: ContentCostBreakdown): boolean {
  return cost.baselineReelsPerWeek === 7;
}

export function optionalReelCostRequiresApproval(cost: ContentCostBreakdown): boolean {
  if (cost.approvedSecondReelsPerWeek === 0) {
    return cost.actualPlannedWeeklyEstimateUsd <= cost.baselineWeeklyEstimateUsd;
  }
  return cost.actualPlannedWeeklyEstimateUsd > cost.baselineWeeklyEstimateUsd;
}
