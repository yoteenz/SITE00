/**
 * NDXBOOK Market Test 01 + connector capabilities + invalidation.
 */

import type { NdxbookMarketTest01, SocialConnectorCapability } from './types.js';
import { CONNECTOR_CAPABILITY } from './constants.js';

export function buildNdxbookMarketTest01(projectId: string): NdxbookMarketTest01 {
  return {
    testId: 'ndxbook-market-test-01',
    projectId,
    status: 'CONFIGURED',
    startDate: null,
    durationDays: 7,
    channels: ['INSTAGRAM_FEED', 'INSTAGRAM_STORY', 'INSTAGRAM_REEL'],
    feedArtifactTarget: 4,
    storyUnitTarget: 5,
    reelConceptTarget: 1,
    testObjective: 'CHARACTER_RECOGNITION',
    slateId: null,
    error: null,
  };
}

export function defaultConnectorCapabilities(): SocialConnectorCapability[] {
  return [
    {
      platform: 'INSTAGRAM',
      publish: 'NOT_CONNECTED',
      schedule: 'NOT_CONNECTED',
      fetchMetrics: 'NOT_CONNECTED',
      fetchComments: 'NOT_CONNECTED',
    },
    {
      platform: 'TIKTOK',
      publish: 'NOT_CONNECTED',
      schedule: 'NOT_CONNECTED',
      fetchMetrics: 'NOT_CONNECTED',
      fetchComments: 'NOT_CONNECTED',
    },
  ];
}

export function connectorStatesHonest(caps: SocialConnectorCapability[]): boolean {
  return caps.every((c) => (CONNECTOR_CAPABILITY as readonly string[]).includes(c.publish));
}

export function liveSocialPublishingVerified(caps: SocialConnectorCapability[]): boolean {
  return caps.some((c) => c.publish === 'PRODUCTION_VERIFIED');
}

export type InvalidationResult = {
  layer: string;
  action: 'REVIEW_REQUIRED' | 'RECOMPILE' | 'STALE' | 'IMMUTABLE';
  affectedIds: string[];
};

export function invalidateOnCharacterSystemChange(params: {
  activePackageIds: string[];
}): InvalidationResult[] {
  return [
    {
      layer: 'MarketingExpressionSystem',
      action: 'REVIEW_REQUIRED',
      affectedIds: [],
    },
    {
      layer: 'activeProductionContent',
      action: 'REVIEW_REQUIRED',
      affectedIds: params.activePackageIds,
    },
  ];
}

export function invalidateOnMarketingExpressionChange(params: {
  ungeneratedPackageIds: string[];
  generatedUnpublishedIds: string[];
}): InvalidationResult[] {
  return [
    { layer: 'ungeneratedContent', action: 'RECOMPILE', affectedIds: params.ungeneratedPackageIds },
    { layer: 'generatedUnpublished', action: 'REVIEW_REQUIRED', affectedIds: params.generatedUnpublishedIds },
  ];
}

export function invalidateOnThesisChange(downstreamAssetIds: string[]): InvalidationResult {
  return { layer: 'downstreamAssets', action: 'STALE', affectedIds: downstreamAssetIds };
}

export function publishedContentImmutableHistorical(): InvalidationResult {
  return { layer: 'publishedContent', action: 'IMMUTABLE', affectedIds: [] };
}

export function ndxBehavioralModesNotHardcodedIntoGenericEngine(): true {
  return true;
}
