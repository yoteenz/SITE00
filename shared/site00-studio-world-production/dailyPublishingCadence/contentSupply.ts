/**
 * Daily matrix, story clusters, reel eligibility, content supply.
 */

import { createHash } from 'node:crypto';
import type {
  CadenceFailureState,
  CadenceFulfillmentEvaluation,
  CadenceFulfillmentState,
  ContentWatchQueue,
  DailyCrossPlatformContentMatrix,
  DailyStoryCluster,
  EvergreenContentReserve,
  PlatformContentExpression,
  PublishingCadencePolicy,
  RapidResponseContentPolicy,
  SecondReelDecision,
  SecondReelEligibilityEvaluation,
  SecondReelOpportunityReason,
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
  feedPlanned?: number;
  storyPlanned?: number;
  reelPlanned?: number;
  secondReelApproved?: boolean;
  secondReelNotJustified?: boolean;
}): CadenceFulfillmentState {
  return evaluateCadenceFulfillmentDetailed(params).state;
}

export function evaluateCadenceFulfillmentDetailed(params: {
  policy: PublishingCadencePolicy;
  date: string;
  primaryEventCount: number;
  strongOpportunityCount: number;
  evergreenAvailable: boolean;
  watchQueueTriggered: boolean;
  feedPlanned?: number;
  storyPlanned?: number;
  reelPlanned?: number;
  secondReelApproved?: boolean;
  secondReelNotJustified?: boolean;
}): CadenceFulfillmentEvaluation {
  const feedTarget = channelTargetFor(params.policy, 'INSTAGRAM', 'FEED')?.targetPerDay ?? 0;
  const storyTarget = channelTargetFor(params.policy, 'INSTAGRAM', 'STORY')?.targetPerDay ?? 0;
  const reelTarget = channelTargetFor(params.policy, 'INSTAGRAM', 'REEL')?.targetPerDay ?? 0;
  const feedPlanned = params.feedPlanned ?? feedTarget;
  const storyPlanned = params.storyPlanned ?? storyTarget;
  const reelPlanned = params.reelPlanned ?? reelTarget;
  const baselineMet = feedPlanned >= feedTarget && storyPlanned >= storyTarget && reelPlanned >= reelTarget;
  const optionalCapacityUsed = Boolean(params.secondReelApproved) && reelPlanned >= reelTarget + 1;

  if (params.secondReelNotJustified && baselineMet) {
    return {
      date: params.date,
      state: 'HOLD_SLOT_EMPTY',
      healthy: true,
      baselineMet: true,
      optionalCapacityUsed: false,
      fillerPressureDetected: false,
      cadenceIsNotQuota: true,
    };
  }

  if (baselineMet && optionalCapacityUsed) {
    return {
      date: params.date,
      state: 'HEALTHY_WITH_OPTIONAL_EXPANSION',
      healthy: true,
      baselineMet: true,
      optionalCapacityUsed: true,
      fillerPressureDetected: false,
      cadenceIsNotQuota: true,
    };
  }

  if (baselineMet) {
    return {
      date: params.date,
      state: 'HEALTHY_BASELINE',
      healthy: true,
      baselineMet: true,
      optionalCapacityUsed: false,
      fillerPressureDetected: false,
      cadenceIsNotQuota: true,
    };
  }

  const planningTarget = params.policy.primaryEventsPerDay;
  if (params.primaryEventCount >= planningTarget && params.strongOpportunityCount >= planningTarget) {
    return {
      date: params.date,
      state: 'FULLY_SUPPLIED',
      healthy: true,
      baselineMet,
      optionalCapacityUsed,
      fillerPressureDetected: false,
      cadenceIsNotQuota: true,
    };
  }
  if (params.primaryEventCount >= planningTarget) {
    return {
      date: params.date,
      state: 'PARTIALLY_SUPPLIED',
      healthy: true,
      baselineMet,
      optionalCapacityUsed,
      fillerPressureDetected: false,
      cadenceIsNotQuota: true,
    };
  }
  if (params.evergreenAvailable) {
    return {
      date: params.date,
      state: 'EVERGREEN_BACKFILL_AVAILABLE',
      healthy: true,
      baselineMet,
      optionalCapacityUsed,
      fillerPressureDetected: false,
      cadenceIsNotQuota: true,
    };
  }
  if (params.watchQueueTriggered) {
    return {
      date: params.date,
      state: 'RESEARCH_QUEUE_AVAILABLE',
      healthy: true,
      baselineMet,
      optionalCapacityUsed,
      fillerPressureDetected: false,
      cadenceIsNotQuota: true,
    };
  }
  if (params.strongOpportunityCount === 0) {
    return {
      date: params.date,
      state: 'NO_STRONG_OPPORTUNITY',
      healthy: true,
      baselineMet,
      optionalCapacityUsed,
      fillerPressureDetected: false,
      cadenceIsNotQuota: true,
    };
  }

  return {
    date: params.date,
    state: 'UNDER_TARGET_DUE_TO_SUPPLY',
    healthy: false,
    baselineMet,
    optionalCapacityUsed,
    fillerPressureDetected: false,
    cadenceIsNotQuota: true,
  };
}

function mapEligibilityToDecision(eligibility: SecondReelEligibilityEvaluation['eligibility']): {
  decision: SecondReelDecision;
  opportunityReason: SecondReelOpportunityReason | null;
  holdSlotEmpty: boolean;
} {
  if (eligibility === 'NOT_JUSTIFIED') {
    return { decision: 'SECOND_REEL_HELD_EMPTY', opportunityReason: 'NO_STRONG_OPPORTUNITY', holdSlotEmpty: true };
  }
  const approvedReasons: SecondReelOpportunityReason[] = [
    'STRONG_OPPORTUNITY',
    'BREAKING_CULTURAL_SIGNAL',
    'CAMPAIGN_REQUIRED',
    'EVERGREEN_HIGH_VALUE',
    'FOUNDER_REQUESTED',
  ];
  if (approvedReasons.includes(eligibility as SecondReelOpportunityReason)) {
    return {
      decision: 'SECOND_REEL_APPROVED',
      opportunityReason: eligibility as SecondReelOpportunityReason,
      holdSlotEmpty: false,
    };
  }
  return { decision: 'SECOND_REEL_NOT_JUSTIFIED', opportunityReason: null, holdSlotEmpty: true };
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
  quotaPressure?: boolean;
}): SecondReelEligibilityEvaluation {
  const reelTarget = channelTargetFor(params.policy, 'INSTAGRAM', 'REEL');
  const maxNormal = reelTarget?.maxNormalPerDay ?? 1;
  if (params.quotaPressure && !params.founderRequested) {
    const base = {
      date: params.date,
      eligibility: 'NOT_JUSTIFIED' as const,
      reason: 'Quota pressure cannot justify optional second Reel',
      primaryContentEventId: null,
    };
    const mapped = mapEligibilityToDecision('NOT_JUSTIFIED');
    return { ...base, ...mapped };
  }
  if (maxNormal < 2) {
    const base = {
      date: params.date,
      eligibility: 'NOT_JUSTIFIED' as const,
      reason: 'Max normal Reels below 2',
      primaryContentEventId: null,
    };
    return { ...base, ...mapEligibilityToDecision('NOT_JUSTIFIED') };
  }
  if (params.founderRequested) {
    const base = {
      date: params.date,
      eligibility: 'FOUNDER_REQUESTED' as const,
      reason: 'Founder requested second Reel',
      primaryContentEventId: null,
    };
    return { ...base, ...mapEligibilityToDecision('FOUNDER_REQUESTED') };
  }
  if (params.campaignRequired) {
    const base = {
      date: params.date,
      eligibility: 'CAMPAIGN_REQUIRED' as const,
      reason: 'Campaign requires second Reel',
      primaryContentEventId: null,
    };
    return { ...base, ...mapEligibilityToDecision('CAMPAIGN_REQUIRED') };
  }
  if (params.breakingCulturalSignal) {
    const base = {
      date: params.date,
      eligibility: 'BREAKING_CULTURAL_SIGNAL' as const,
      reason: 'Breaking cultural signal',
      primaryContentEventId: null,
    };
    return { ...base, ...mapEligibilityToDecision('BREAKING_CULTURAL_SIGNAL') };
  }
  if (params.strongSecondOpportunity) {
    const base = {
      date: params.date,
      eligibility: 'STRONG_OPPORTUNITY' as const,
      reason: 'Second strong opportunity exists',
      primaryContentEventId: null,
    };
    return { ...base, ...mapEligibilityToDecision('STRONG_OPPORTUNITY') };
  }
  if (params.evergreenHighValue) {
    const base = {
      date: params.date,
      eligibility: 'EVERGREEN_HIGH_VALUE' as const,
      reason: 'Evergreen high-value slot',
      primaryContentEventId: null,
    };
    return { ...base, ...mapEligibilityToDecision('EVERGREEN_HIGH_VALUE') };
  }
  const base = {
    date: params.date,
    eligibility: 'NOT_JUSTIFIED' as const,
    reason: 'Second Reel not justified — do not manufacture filler',
    primaryContentEventId: null,
  };
  return { ...base, ...mapEligibilityToDecision('NOT_JUSTIFIED') };
}

export function cadenceDoesNotForceFiller(fulfillment: CadenceFulfillmentState): boolean {
  return (
    fulfillment === 'NO_STRONG_OPPORTUNITY' ||
    fulfillment === 'HOLD_SLOT_EMPTY' ||
    fulfillment === 'HEALTHY_BASELINE' ||
    fulfillment === 'HEALTHY_WITH_OPTIONAL_EXPANSION' ||
    fulfillment === 'UNDER_TARGET_BY_EDITORIAL_CHOICE'
  );
}

export function emptySecondReelSlotIsValid(evaluation: SecondReelEligibilityEvaluation): boolean {
  return evaluation.holdSlotEmpty && evaluation.decision === 'SECOND_REEL_HELD_EMPTY';
}

export function detectForcedPremiseCreation(params: {
  inventedPremiseCount: number;
  planningCapacityPerWeek: number;
  weakPremiseRatio: number;
}): CadenceFailureState | null {
  if (params.inventedPremiseCount > params.planningCapacityPerWeek && params.weakPremiseRatio > 0.5) {
    return 'FAIL_FORCED_PREMISE_CREATION';
  }
  if (params.weakPremiseRatio > 0.7) {
    return 'FAIL_FORCED_PREMISE_CREATION';
  }
  return null;
}

export function primaryEventTargetIsPlanningCapacity(primaryEventsPerWeek: number): boolean {
  return primaryEventsPerWeek === 21;
}

export function crossPlatformDoesNotMultiplyResearchPremises(params: {
  primaryEventCount: number;
  intelligenceCount: number;
}): boolean {
  return params.intelligenceCount <= params.primaryEventCount;
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
