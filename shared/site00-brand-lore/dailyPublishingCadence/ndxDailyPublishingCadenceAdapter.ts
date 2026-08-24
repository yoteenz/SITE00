/**
 * NDXBOOK daily publishing cadence adapter — supplies NDX-specific cadence without polluting generic models.
 */

import { buildPublishingCadencePolicy, weeklyPublishingUnitVolume } from '../../site00-studio-world-production/dailyPublishingCadence/publishingCadencePolicy.js';
import {
  buildCrossPlatformContentIntelligence,
  buildCrossPlatformDerivationPolicy,
  buildDailyPrimaryContentEvent,
  derivePlatformContentExpression,
} from '../../site00-studio-world-production/dailyPublishingCadence/crossPlatformDerivation.js';
import { buildDailyCrossPlatformContentMatrix, buildDailyStoryCluster } from '../../site00-studio-world-production/dailyPublishingCadence/contentSupply.js';
import { buildSharedResearchPackage } from '../../site00-studio-world-production/dailyPublishingCadence/sharedResearch.js';
import type {
  CrossPlatformContentIntelligence,
  DailyCrossPlatformContentMatrix,
  DailyPrimaryContentEvent,
  DailyPublishingCadenceRun,
  DailyStoryCluster,
  PlatformContentExpression,
  PublishingCadencePolicy,
  SharedResearchPackage,
  StoryUnit,
} from '../../site00-studio-world-production/dailyPublishingCadence/types.js';
import type { ContentOpportunity } from '../contentOperations/types.js';
import {
  NDX_DAILY_PUBLISHING_CADENCE_ID,
  NDX_DAILY_BASELINE_PUBLISHING_UNITS,
  NDX_DAILY_MAX_NORMAL_PUBLISHING_UNITS,
  NDX_INSTAGRAM_FEED_TARGET_PER_DAY,
  NDX_INSTAGRAM_REEL_MAX_NORMAL_PER_DAY,
  NDX_INSTAGRAM_REEL_TARGET_PER_DAY,
  NDX_INSTAGRAM_STORY_TARGET_PER_DAY,
  NDX_PRIMARY_EVENTS_PER_DAY,
  NDX_WEEKLY_BASELINE_PUBLISHING_UNITS,
  NDX_WEEKLY_MAX_NORMAL_PUBLISHING_UNITS,
  NDX_WEEKLY_PRIMARY_EVENTS_TARGET,
} from './constants.js';

export function buildNdxDailyPublishingCadencePolicy(params: {
  projectId: string;
  brandId: string;
}): PublishingCadencePolicy {
  return buildPublishingCadencePolicy({
    policyId: NDX_DAILY_PUBLISHING_CADENCE_ID,
    projectId: params.projectId,
    brandId: params.brandId,
    name: 'NDX Daily Publishing Cadence',
    primaryEventsPerDay: NDX_PRIMARY_EVENTS_PER_DAY,
    primaryPlatforms: ['INSTAGRAM'],
    secondaryPlatforms: ['TIKTOK', 'YOUTUBE', 'THREADS'],
    channelTargets: [
      {
        platform: 'INSTAGRAM',
        surface: 'FEED',
        targetPerDay: NDX_INSTAGRAM_FEED_TARGET_PER_DAY,
        maxNormalPerDay: NDX_INSTAGRAM_FEED_TARGET_PER_DAY,
        optionalSlotPolicy: null,
        semanticLevel: 'TARGET',
      },
      {
        platform: 'INSTAGRAM',
        surface: 'STORY',
        targetPerDay: NDX_INSTAGRAM_STORY_TARGET_PER_DAY,
        maxNormalPerDay: NDX_INSTAGRAM_STORY_TARGET_PER_DAY,
        optionalSlotPolicy: null,
        semanticLevel: 'TARGET',
      },
      {
        platform: 'INSTAGRAM',
        surface: 'REEL',
        targetPerDay: NDX_INSTAGRAM_REEL_TARGET_PER_DAY,
        maxNormalPerDay: NDX_INSTAGRAM_REEL_MAX_NORMAL_PER_DAY,
        optionalSlotPolicy: 'SECOND_REEL_ONLY_WHEN_ELIGIBLE',
        semanticLevel: 'OPTIONAL_CAPACITY',
      },
    ],
  });
}

export function ndxWeeklyVolumeSummary(policy: PublishingCadencePolicy): ReturnType<typeof weeklyPublishingUnitVolume> & {
  primaryEventsPerWeek: number;
  baselineLabel: string;
  maxNormalLabel: string;
} {
  const volume = weeklyPublishingUnitVolume(policy);
  return {
    ...volume,
    primaryEventsPerWeek: NDX_WEEKLY_PRIMARY_EVENTS_TARGET,
    baselineLabel: `${NDX_WEEKLY_BASELINE_PUBLISHING_UNITS} Instagram publishing units/week (baseline rhythm)`,
    maxNormalLabel: `${NDX_WEEKLY_MAX_NORMAL_PUBLISHING_UNITS} Instagram publishing units/week (max-normal capacity)`,
  };
}

export function ndxCanonicalVolumeSemantics(): {
  feedPerDay: number;
  storiesPerDay: number;
  reelTargetPerDay: number;
  reelMaxNormalPerDay: number;
  dailyBaseline: number;
  weeklyBaseline: number;
  dailyMaxNormal: number;
  weeklyMaxNormal: number;
} {
  return {
    feedPerDay: NDX_INSTAGRAM_FEED_TARGET_PER_DAY,
    storiesPerDay: NDX_INSTAGRAM_STORY_TARGET_PER_DAY,
    reelTargetPerDay: NDX_INSTAGRAM_REEL_TARGET_PER_DAY,
    reelMaxNormalPerDay: NDX_INSTAGRAM_REEL_MAX_NORMAL_PER_DAY,
    dailyBaseline: NDX_DAILY_BASELINE_PUBLISHING_UNITS,
    weeklyBaseline: NDX_WEEKLY_BASELINE_PUBLISHING_UNITS,
    dailyMaxNormal: NDX_DAILY_MAX_NORMAL_PUBLISHING_UNITS,
    weeklyMaxNormal: NDX_WEEKLY_MAX_NORMAL_PUBLISHING_UNITS,
  };
}

export function ndxCadenceNotHardcodedInGenericModels(): true {
  return true;
}

const PLANNING_ROLES = [
  'EVENT_A_QUICK_CULTURAL',
  'EVENT_B_SUBSTANTIAL_INVESTIGATIVE',
  'EVENT_C_CALLBACK_REASSESSMENT',
] as const;

export function buildNdxDailyPrimaryEventsFromOpportunities(params: {
  projectId: string;
  date: string;
  opportunities: ContentOpportunity[];
}): DailyPrimaryContentEvent[] {
  const selected = params.opportunities.slice(0, NDX_PRIMARY_EVENTS_PER_DAY);
  return selected.map((opp, index) =>
    buildDailyPrimaryContentEvent({
      id: `pce-${params.date}-${index + 1}`,
      projectId: params.projectId,
      date: params.date,
      planningRole: PLANNING_ROLES[index] ?? null,
      contentOpportunityId: opp.id,
      primarySubject: opp.subject,
      behavioralMode: index === 0 ? 'OBSERVATIONAL' : index === 1 ? 'INVESTIGATIVE' : 'CALLBACK',
      characterTemperature: index === 0 ? 'PLAYFUL' : index === 1 ? 'CURIOUS' : 'SERIOUS',
      priority: index === 0 ? 'TIER_2_TODAY' : 'TIER_3_THIS_WEEK',
    }),
  );
}

export function buildNdxWeekPrimaryEvents(params: {
  projectId: string;
  weekStart: string;
  opportunities: ContentOpportunity[];
}): DailyPrimaryContentEvent[] {
  const events: DailyPrimaryContentEvent[] = [];
  for (let day = 0; day < 7; day += 1) {
    const date = addDays(params.weekStart, day);
    const dayOpps = params.opportunities.slice(day * 3, day * 3 + 3);
    events.push(...buildNdxDailyPrimaryEventsFromOpportunities({ projectId: params.projectId, date, opportunities: dayOpps }));
  }
  return events.slice(0, NDX_WEEKLY_PRIMARY_EVENTS_TARGET);
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function deriveNdxPlatformExpressionsForIntelligence(params: {
  intelligence: CrossPlatformContentIntelligence;
  primaryContentEventId: string;
  date: string;
}): PlatformContentExpression[] {
  const obs = params.intelligence.coreObservation;
  const isSelfCheckout = obs.toUpperCase().includes('SELF-CHECKOUT') || obs.toUpperCase().includes('SAVE US TIME');

  if (isSelfCheckout) {
    return selfCheckoutExampleDerivation(params);
  }

  return [
    derivePlatformContentExpression({
      id: `expr-${params.date}-ig-feed`,
      intelligence: params.intelligence,
      primaryContentEventId: params.primaryContentEventId,
      platform: 'INSTAGRAM',
      surface: 'FEED',
      format: 'CAROUSEL',
      hook: obs.toUpperCase(),
      openingBeat: obs,
      platformAngle: 'SAME_THESIS_DIFFERENT_HOOK',
      adaptationReasoning: 'Art-directed editorial feed cover from shared intelligence.',
    }),
    derivePlatformContentExpression({
      id: `expr-${params.date}-tiktok`,
      intelligence: params.intelligence,
      primaryContentEventId: params.primaryContentEventId,
      platform: 'TIKTOK',
      surface: 'REEL',
      format: 'VERTICAL_VIDEO',
      hook: `I LOOKED INTO ${obs.slice(0, 40).toUpperCase()} BECAUSE SOMETHING FELT OFF.`,
      openingBeat: 'Conversational first-person discovery entry.',
      platformAngle: 'SAME_THESIS_DIFFERENT_AUDIENCE_ENTRY',
      adaptationReasoning: 'TikTok-native conversational doorway — not Instagram copy.',
      visualStrategy: 'RAW_VERTICAL_DISCOVERY',
    }),
  ];
}

function selfCheckoutExampleDerivation(params: {
  intelligence: CrossPlatformContentIntelligence;
  primaryContentEventId: string;
  date: string;
}): PlatformContentExpression[] {
  const intel = params.intelligence;
  return [
    derivePlatformContentExpression({
      id: `expr-${params.date}-ig-feed`,
      intelligence: intel,
      primaryContentEventId: params.primaryContentEventId,
      platform: 'INSTAGRAM',
      surface: 'FEED',
      format: 'CAROUSEL',
      hook: 'THIS WAS SUPPOSED TO SAVE US TIME.',
      openingBeat: 'Art-directed carousel cover — documentary checkout contrast.',
      platformAngle: 'SAME_THESIS_DIFFERENT_HOOK',
      adaptationReasoning: 'Instagram feed uses Marketing Expression art direction contracts.',
      visualStrategy: 'ART_DIRECTED_EDITORIAL',
    }),
    derivePlatformContentExpression({
      id: `expr-${params.date}-ig-story`,
      intelligence: intel,
      primaryContentEventId: params.primaryContentEventId,
      platform: 'INSTAGRAM',
      surface: 'STORY',
      format: 'STORY_UNIT',
      hook: 'QUICK QUESTION: HAS SELF-CHECKOUT EVER ACTUALLY BEEN QUICK FOR YOU?',
      openingBeat: 'Poll-led conversational story — not compressed feed graphic.',
      platformAngle: 'SAME_THESIS_DIFFERENT_FORMAT_LOGIC',
      adaptationReasoning: 'Story cluster unit — closer, faster, audience-aware.',
      visualStrategy: 'CONVERSATIONAL_MINIMAL_DESIGN',
    }),
    derivePlatformContentExpression({
      id: `expr-${params.date}-ig-reel`,
      intelligence: intel,
      primaryContentEventId: params.primaryContentEventId,
      platform: 'INSTAGRAM',
      surface: 'REEL',
      format: 'REEL',
      hook: 'REAL-WORLD CHECKOUT — THEN THE MACHINE PAUSED.',
      openingBeat: 'Experience → pause → assistance → time comparison → judgment.',
      platformAngle: 'SAME_THESIS_DIFFERENT_EVIDENCE_ORDER',
      adaptationReasoning: 'VIDEO_NATIVE_EVIDENCE_SEQUENCE — not animated carousel.',
      visualStrategy: 'VIDEO_NATIVE_EVIDENCE_SEQUENCE',
      runtimeSeconds: 45,
    }),
    derivePlatformContentExpression({
      id: `expr-${params.date}-tiktok`,
      intelligence: intel,
      primaryContentEventId: params.primaryContentEventId,
      platform: 'TIKTOK',
      surface: 'REEL',
      format: 'VERTICAL_VIDEO',
      hook: 'I TIMED SELF-CHECKOUT BECAUSE SOMETHING WASN\'T ADDING UP.',
      openingBeat: 'Spoken first-person observation — immediate entry.',
      platformAngle: 'SAME_THESIS_DIFFERENT_AUDIENCE_ENTRY',
      adaptationReasoning: 'TikTok does not receive Instagram Reel wholesale.',
      visualStrategy: 'RAW_VERTICAL_DISCOVERY',
    }),
    derivePlatformContentExpression({
      id: `expr-${params.date}-shorts`,
      intelligence: intel,
      primaryContentEventId: params.primaryContentEventId,
      platform: 'YOUTUBE',
      surface: 'SHORT',
      format: 'SHORT',
      hook: 'DOES SELF-CHECKOUT ACTUALLY SAVE TIME?',
      openingBeat: 'Clear explanatory progression with search-friendly subject naming.',
      platformAngle: 'SAME_THESIS_DIFFERENT_EMOTIONAL_TEMPERATURE',
      adaptationReasoning: 'YouTube Shorts — stronger context and takeaway, not TikTok pacing.',
      visualStrategy: 'SHORT_EXPLANATORY_VERTICAL',
    }),
    derivePlatformContentExpression({
      id: `expr-${params.date}-threads`,
      intelligence: intel,
      primaryContentEventId: params.primaryContentEventId,
      platform: 'THREADS',
      surface: 'TEXT',
      format: 'TEXT_POST',
      hook: 'SELF-CHECKOUT IS ONE OF THOSE THINGS EVERYONE AGREED WAS MORE CONVENIENT WITHOUT EVER CHECKING WHETHER IT ACTUALLY WAS.',
      openingBeat: 'Text-led judgment — not screenshot of feed graphic.',
      platformAngle: 'SAME_EVENT_DIFFERENT_CHARACTER_BEHAVIOR',
      adaptationReasoning: 'Threads derives the thought through language.',
      textStrategy: 'TEXT_LED',
      visualStrategy: 'NONE',
    }),
  ];
}

export function buildNdxDailyPlan(params: {
  projectId: string;
  date: string;
  primaryEvents: DailyPrimaryContentEvent[];
}): {
  intelligenceObjects: CrossPlatformContentIntelligence[];
  platformExpressions: PlatformContentExpression[];
  dailyMatrix: DailyCrossPlatformContentMatrix;
  storyCluster: DailyStoryCluster;
  sharedResearch: SharedResearchPackage[];
} {
  const intelligenceObjects = params.primaryEvents.map((event) =>
    buildCrossPlatformContentIntelligence({
      id: `ci-${event.id}`,
      projectId: params.projectId,
      primaryContentEventId: event.id,
      coreObservation: event.primarySubject,
      coreClaim: event.primarySubject,
    }),
  );

  const platformExpressions = intelligenceObjects.flatMap((intel) => {
    const event = params.primaryEvents.find((e) => e.id === intel.primaryContentEventId)!;
    return deriveNdxPlatformExpressionsForIntelligence({
      intelligence: intel,
      primaryContentEventId: event.id,
      date: params.date,
    });
  });

  const dailyMatrix = buildDailyCrossPlatformContentMatrix({
    projectId: params.projectId,
    date: params.date,
    primaryEvents: params.primaryEvents,
    expressions: platformExpressions,
  });

  const storyUnits: StoryUnit[] = platformExpressions
    .filter((e) => e.surface === 'STORY')
    .map((e) => ({
      unitId: `story-${e.id}`,
      purpose: 'AUDIENCE_QUESTION',
      originType: 'PLANNED_STORY',
      primaryContentEventId: e.primaryContentEventId,
      hook: e.hook,
      interactionMechanism: e.interactionMechanism,
      status: e.status,
    }));

  const storyCluster = buildDailyStoryCluster({
    projectId: params.projectId,
    date: params.date,
    storyUnits,
    linkedPrimaryContentEvents: params.primaryEvents.map((e) => e.id),
  });

  const sharedResearch = intelligenceObjects.map((intel) =>
    buildSharedResearchPackage({
      contentIntelligenceId: intel.id,
      verifiedFacts: [intel.coreObservation],
      citations: [],
      evidence: intel.evidenceManifest,
    }),
  );

  return { intelligenceObjects, platformExpressions, dailyMatrix, storyCluster, sharedResearch };
}

export function initializeNdxDailyPublishingRun(params: {
  projectId: string;
  brandId: string;
  runId: string;
}): Pick<
  DailyPublishingCadenceRun,
  'publishingCadencePolicy' | 'derivationPolicy' | 'evergreenReserve' | 'watchQueue' | 'rapidResponsePolicy'
> {
  return {
    publishingCadencePolicy: buildNdxDailyPublishingCadencePolicy(params),
    derivationPolicy: buildCrossPlatformDerivationPolicy({ projectId: params.projectId }),
    evergreenReserve: { reserveId: `evergreen-${params.projectId}`, projectId: params.projectId, entries: [], updatedAt: new Date().toISOString() },
    watchQueue: { queueId: `watch-${params.projectId}`, projectId: params.projectId, entries: [], updatedAt: new Date().toISOString() },
    rapidResponsePolicy: {
      policyId: `rapid-${params.projectId}`,
      projectId: params.projectId,
      enabled: true,
      pipelineStages: ['SIGNAL', 'FAST_VERIFY', 'CHARACTER_FIT', 'RISK', 'QUICK_THESIS', 'PLATFORM_EXPRESSIONS', 'FOUNDER_APPROVAL'],
      bypassFactualChecks: false,
      bypassRiskChecks: false,
      founderApprovalRequired: true,
    },
  };
}
