/**
 * Generic PublishingCadencePolicy builder — brand-agnostic.
 */

import type { ChannelCadenceTarget, PublishingCadencePolicy } from './types.js';

export function buildPublishingCadencePolicy(params: {
  policyId: string;
  projectId: string;
  brandId: string;
  name: string;
  channelTargets: ChannelCadenceTarget[];
  primaryEventsPerDay?: number;
  primaryPlatforms?: PublishingCadencePolicy['primaryPlatforms'];
  secondaryPlatforms?: PublishingCadencePolicy['secondaryPlatforms'];
}): PublishingCadencePolicy {
  const now = new Date().toISOString();
  return {
    policyId: params.policyId,
    projectId: params.projectId,
    brandId: params.brandId,
    name: params.name,
    primaryPlatforms: params.primaryPlatforms ?? ['INSTAGRAM'],
    secondaryPlatforms: params.secondaryPlatforms ?? ['TIKTOK', 'YOUTUBE', 'THREADS'],
    channelTargets: params.channelTargets,
    primaryEventsPerDay: params.primaryEventsPerDay ?? 3,
    derivationPolicyId: `${params.policyId}-derivation`,
    approvalPolicyId: `${params.policyId}-approval`,
    budgetPolicyId: `${params.policyId}-budget`,
    configurableBy: ['weekday', 'campaign', 'season', 'launch_period', 'founder_override', 'performance_learning'],
    fingerprint: `cadence-${params.policyId}`,
    createdAt: now,
    updatedAt: now,
  };
}

export function channelTargetFor(
  policy: PublishingCadencePolicy,
  platform: ChannelCadenceTarget['platform'],
  surface: ChannelCadenceTarget['surface'],
): ChannelCadenceTarget | undefined {
  return policy.channelTargets.find((t) => t.platform === platform && t.surface === surface);
}

export function weeklyPublishingUnitVolume(policy: PublishingCadencePolicy): {
  feedPerWeek: number;
  storyPerWeek: number;
  reelTargetPerWeek: number;
  reelMaxPerWeek: number;
  baselineInstagramUnits: number;
  maxNormalInstagramUnits: number;
  dailyBaselineUnits: number;
  dailyMaxNormalUnits: number;
} {
  const daily = dailyPublishingUnitVolume(policy);
  return {
    feedPerWeek: daily.feedPerDay * 7,
    storyPerWeek: daily.storyPerDay * 7,
    reelTargetPerWeek: daily.reelTargetPerDay * 7,
    reelMaxPerWeek: daily.reelMaxPerDay * 7,
    baselineInstagramUnits: daily.baselineInstagramUnits * 7,
    maxNormalInstagramUnits: daily.maxNormalInstagramUnits * 7,
    dailyBaselineUnits: daily.baselineInstagramUnits,
    dailyMaxNormalUnits: daily.maxNormalInstagramUnits,
  };
}

export function dailyPublishingUnitVolume(policy: PublishingCadencePolicy): {
  feedPerDay: number;
  storyPerDay: number;
  reelTargetPerDay: number;
  reelMaxPerDay: number;
  baselineInstagramUnits: number;
  maxNormalInstagramUnits: number;
} {
  const feed = channelTargetFor(policy, 'INSTAGRAM', 'FEED')?.targetPerDay ?? 0;
  const story = channelTargetFor(policy, 'INSTAGRAM', 'STORY')?.targetPerDay ?? 0;
  const reelTarget = channelTargetFor(policy, 'INSTAGRAM', 'REEL')?.targetPerDay ?? 0;
  const reelMax =
    channelTargetFor(policy, 'INSTAGRAM', 'REEL')?.maxNormalPerDay ??
    channelTargetFor(policy, 'INSTAGRAM', 'REEL')?.targetPerDay ??
    0;
  return {
    feedPerDay: feed,
    storyPerDay: story,
    reelTargetPerDay: reelTarget,
    reelMaxPerDay: reelMax,
    baselineInstagramUnits: feed + story + reelTarget,
    maxNormalInstagramUnits: feed + story + reelMax,
  };
}

/** 63 is max-normal capacity — never label as baseline. */
export function isBaselineVolumeLabel(volume: number, policy: PublishingCadencePolicy): boolean {
  const { baselineInstagramUnits } = weeklyPublishingUnitVolume(policy);
  return volume === baselineInstagramUnits;
}

export function genericModelsContainNoBrandCadence(): true {
  return true;
}
