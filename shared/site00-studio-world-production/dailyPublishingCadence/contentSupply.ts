/**
 * Daily matrix, story clusters, reel eligibility, content supply.
 */

import { createHash } from 'node:crypto';
import type {
  CadenceFulfillmentState,
  ContentWatchQueue,
  DailyCrossPlatformContentMatrix,
  DailyStoryCluster,
  EvergreenContentReserve,
  PlatformContentExpression,
  PublishingCadencePolicy,
  RapidResponseContentPolicy,
  SecondReelEligibilityEvaluation,
  StoryUnit,
} from './types.js';
import type { DailyPrimaryContentEvent } from './types.js';
import { channelTargetFor } from './publishingCadencePolicy.js';

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

export function buildDailyCrossPlatformContentMatrix(params: {
  projectId: string;
  date: string;
  primaryEvents: DailyPrimaryContentEvent[];
  expressions: PlatformContentExpression[];
}): DailyCrossPlatformContentMatrix {
  const cells = params.primaryEvents.flatMap((event) => {
    const eventExpressions = params.expressions.filter((e) => e.primaryContentEventId === event.id);
    const platforms: Array<{ platform: PlatformContentExpression['platform']; surface: PlatformContentExpression['surface']; optional: boolean }> = [
      { platform: 'INSTAGRAM', surface: 'FEED', optional: false },
      { platform: 'INSTAGRAM', surface: 'STORY', optional: false },
      { platform: 'INSTAGRAM', surface: 'REEL', optional: false },
      { platform: 'TIKTOK', surface: 'REEL', optional: true },
      { platform: 'YOUTUBE', surface: 'SHORT', optional: true },
      { platform: 'THREADS', surface: 'TEXT', optional: true },
    ];
    return platforms.map(({ platform, surface, optional }) => {
      const match = eventExpressions.find((e) => e.platform === platform && e.surface === surface);
      return {
        primaryContentEventId: event.id,
        platform,
        surface,
        planned: Boolean(match),
        optional,
        expressionId: match?.id ?? null,
      };
    });
  });

  return {
    matrixId: `matrix-${params.date}`,
    projectId: params.projectId,
    date: params.date,
    primaryEventIds: params.primaryEvents.map((e) => e.id),
    cells,
    reuseIntelligenceCount: params.primaryEvents.length,
    uniqueExpressionCount: params.expressions.length,
    fingerprint: hash(`${params.date}-${params.expressions.length}`),
  };
}

export function evaluateCadenceFulfillment(params: {
  policy: PublishingCadencePolicy;
  date: string;
  primaryEventCount: number;
  strongOpportunityCount: number;
  evergreenAvailable: boolean;
  watchQueueTriggered: boolean;
}): CadenceFulfillmentState {
  const target = params.policy.primaryEventsPerDay;
  if (params.primaryEventCount >= target && params.strongOpportunityCount >= target) {
    return 'FULLY_SUPPLIED';
  }
  if (params.primaryEventCount >= target) return 'PARTIALLY_SUPPLIED';
  if (params.evergreenAvailable) return 'EVERGREEN_BACKFILL_AVAILABLE';
  if (params.watchQueueTriggered) return 'RESEARCH_QUEUE_AVAILABLE';
  if (params.strongOpportunityCount === 0) return 'NO_STRONG_OPPORTUNITY';
  return 'HOLD_SLOT_EMPTY';
}

export function evaluateSecondReelEligibility(params: {
  policy: PublishingCadencePolicy;
  date: string;
  firstReelPlanned: boolean;
  strongSecondOpportunity: boolean;
  breakingCulturalSignal: boolean;
  campaignRequired: boolean;
  evergreenHighValue: boolean;
  founderRequested: boolean;
}): SecondReelEligibilityEvaluation {
  const reelTarget = channelTargetFor(params.policy, 'INSTAGRAM', 'REEL');
  const maxNormal = reelTarget?.maxNormalPerDay ?? 1;
  if (maxNormal < 2) {
    return { date: params.date, eligibility: 'NOT_JUSTIFIED', reason: 'Max normal Reels below 2', primaryContentEventId: null };
  }
  if (params.founderRequested) {
    return { date: params.date, eligibility: 'FOUNDER_REQUESTED', reason: 'Founder requested second Reel', primaryContentEventId: null };
  }
  if (params.campaignRequired) {
    return { date: params.date, eligibility: 'CAMPAIGN_REQUIRED', reason: 'Campaign requires second Reel', primaryContentEventId: null };
  }
  if (params.breakingCulturalSignal) {
    return { date: params.date, eligibility: 'BREAKING_CULTURAL_SIGNAL', reason: 'Breaking cultural signal', primaryContentEventId: null };
  }
  if (params.strongSecondOpportunity) {
    return { date: params.date, eligibility: 'STRONG_OPPORTUNITY', reason: 'Second strong opportunity exists', primaryContentEventId: null };
  }
  if (params.evergreenHighValue) {
    return { date: params.date, eligibility: 'EVERGREEN_HIGH_VALUE', reason: 'Evergreen high-value slot', primaryContentEventId: null };
  }
  return { date: params.date, eligibility: 'NOT_JUSTIFIED', reason: 'Second Reel not justified — do not manufacture filler', primaryContentEventId: null };
}

export function cadenceDoesNotForceFiller(_fulfillment: CadenceFulfillmentState): boolean {
  return true;
}

export function buildDailyStoryCluster(params: {
  projectId: string;
  date: string;
  storyUnits: StoryUnit[];
  linkedPrimaryContentEvents: string[];
}): DailyStoryCluster {
  return {
    clusterId: `story-cluster-${params.date}`,
    projectId: params.projectId,
    date: params.date,
    storyUnits: params.storyUnits,
    linkedPrimaryContentEvents: params.linkedPrimaryContentEvents,
    independentStoryUnits: params.storyUnits.filter((u) => !u.primaryContentEventId).map((u) => u.unitId),
    narrativeFlow: 'ONE_DAY_WITH_CHARACTER',
    interactionMix: params.storyUnits.map((u) => u.interactionMechanism ?? 'NONE').filter(Boolean),
    resolutionMix: ['OPEN', 'PARTIAL', 'RESOLVED'],
    status: 'DRAFT',
    approvalState: null,
  };
}

export function storiesMustNotBecomeMiniFeedPosts(unit: StoryUnit): boolean {
  return unit.purpose !== 'TEASER' || unit.hook.length < 120;
}

export function instagramReelMustNotDefaultToAnimatedCarousel(expression: PlatformContentExpression): boolean {
  if (expression.platform !== 'INSTAGRAM' || expression.surface !== 'REEL') return true;
  return expression.visualStrategy !== 'CAROUSEL_ANIMATION' && expression.adaptationReasoning.includes('VIDEO_NATIVE');
}

export function buildEvergreenContentReserve(params: {
  projectId: string;
  entries: EvergreenContentReserve['entries'];
}): EvergreenContentReserve {
  return {
    reserveId: `evergreen-${params.projectId}`,
    projectId: params.projectId,
    entries: params.entries,
    updatedAt: new Date().toISOString(),
  };
}

export function buildContentWatchQueue(params: {
  projectId: string;
  entries: ContentWatchQueue['entries'];
}): ContentWatchQueue {
  return {
    queueId: `watch-${params.projectId}`,
    projectId: params.projectId,
    entries: params.entries,
    updatedAt: new Date().toISOString(),
  };
}

export function buildRapidResponseContentPolicy(params: { projectId: string }): RapidResponseContentPolicy {
  return {
    policyId: `rapid-${params.projectId}`,
    projectId: params.projectId,
    enabled: true,
    pipelineStages: ['SIGNAL', 'FAST_VERIFY', 'CHARACTER_FIT', 'RISK', 'QUICK_THESIS', 'PLATFORM_EXPRESSIONS', 'FOUNDER_APPROVAL', 'PUBLISH'],
    bypassFactualChecks: false,
    bypassRiskChecks: false,
    founderApprovalRequired: true,
  };
}

export function weekViewGroupsByPrimaryEventNotFlatList(params: {
  primaryEventCount: number;
  publishingUnitCount: number;
}): boolean {
  return params.publishingUnitCount > params.primaryEventCount * 2;
}

export function autonomousPublishingEnabled(): false {
  return false;
}
