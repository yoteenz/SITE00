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
} {
  const feed = (channelTargetFor(policy, 'INSTAGRAM', 'FEED')?.targetPerDay ?? 0) * 7;
  const story = (channelTargetFor(policy, 'INSTAGRAM', 'STORY')?.targetPerDay ?? 0) * 7;
  const reelTarget = (channelTargetFor(policy, 'INSTAGRAM', 'REEL')?.targetPerDay ?? 0) * 7;
  const reelMax =
    (channelTargetFor(policy, 'INSTAGRAM', 'REEL')?.maxNormalPerDay ??
      channelTargetFor(policy, 'INSTAGRAM', 'REEL')?.targetPerDay ??
      0) * 7;
  return {
    feedPerWeek: feed,
    storyPerWeek: story,
    reelTargetPerWeek: reelTarget,
    reelMaxPerWeek: reelMax,
    baselineInstagramUnits: feed + story + reelTarget,
    maxNormalInstagramUnits: feed + story + reelMax,
  };
}

export function genericModelsContainNoBrandCadence(): true {
  return true;
}
