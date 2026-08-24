/**
 * P0.5E.1 — Daily Publishing Cadence + Cross-Platform Derivation (61 requirements, spec LXVI).
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  AUTONOMOUS_PUBLISHING_ENABLED,
  BRAND_CANON_MUTATED,
  BRAND_CHARACTER_MUTATED,
  CONTENT_FATIGUE_EVALUATION_IMPLEMENTED,
  CROSS_PLATFORM_CHARACTER_FIDELITY_IMPLEMENTED,
  CROSS_PLATFORM_CONTENT_INTELLIGENCE_IMPLEMENTED,
  CROSS_PLATFORM_COPY_DUPLICATION_GUARD_IMPLEMENTED,
  CROSS_PLATFORM_DERIVATION_POLICY_IMPLEMENTED,
  CROSS_PLATFORM_VISUAL_DUPLICATION_GUARD_IMPLEMENTED,
  DAILY_CROSS_PLATFORM_CONTENT_MATRIX_IMPLEMENTED,
  DAILY_EDITORIAL_HEALTH_IMPLEMENTED,
  EVERGREEN_RESERVE_IMPLEMENTED,
  GENERIC_PUBLISHING_CADENCE_POLICY_IMPLEMENTED,
  NDX_DAILY_PUBLISHING_CADENCE_IMPLEMENTED,
  PLATFORM_CONTENT_EXPRESSION_IMPLEMENTED,
  PLATFORM_NATIVE_FIT_EVALUATION_IMPLEMENTED,
  PRIMARY_CONTENT_EVENT_MODEL_IMPLEMENTED,
  PRODUCT_EXPRESSION_IMPLEMENTED,
  RAPID_RESPONSE_POLICY_IMPLEMENTED,
  REEL_HOOK_ROUND_IMPLEMENTED,
  REUSE_THINKING_NOT_POSTS_ENFORCED,
  SHARED_RESEARCH_REUSE_IMPLEMENTED,
  STORY_CLUSTER_REVIEW_IMPLEMENTED,
  WATCH_QUEUE_IMPLEMENTED,
  WEEKLY_EDITORIAL_HEALTH_HIGH_VOLUME_IMPLEMENTED,
  WEEKLY_MARKETING_PRODUCTION_BOARD_IMPLEMENTED,
  WORLD_FORMATION_IMPLEMENTED,
  CHANNEL_EXPRESSION_LEARNING_IMPLEMENTED,
} from '../site00-studio-world-production/dailyPublishingCadence/constants.js';
import {
  buildCrossPlatformContentIntelligence,
  buildCrossPlatformDerivationPolicy,
  buildDailyPrimaryContentEvent,
  derivePlatformContentExpression,
  freezeContentIntelligence,
  platformDerivationMayChangeHookButNotFacts,
  primaryEventDistinctFromPlatformExpression,
  reuseThinkingNotPostsEnforced,
} from '../site00-studio-world-production/dailyPublishingCadence/crossPlatformDerivation.js';
import {
  buildDailyCrossPlatformContentMatrix,
  buildDailyStoryCluster,
  buildEvergreenContentReserve,
  buildContentWatchQueue,
  buildRapidResponseContentPolicy,
  cadenceDoesNotForceFiller,
  evaluateCadenceFulfillment,
  evaluateSecondReelEligibility,
  instagramReelMustNotDefaultToAnimatedCarousel,
  storiesMustNotBecomeMiniFeedPosts,
  weekViewGroupsByPrimaryEventNotFlatList,
} from '../site00-studio-world-production/dailyPublishingCadence/contentSupply.js';
import {
  evaluateContentFatigue,
  evaluateDailyEditorialHealth,
  evaluateWeeklyEditorialHealth,
} from '../site00-studio-world-production/dailyPublishingCadence/editorialHealth.js';
import {
  evaluateCrossPlatformCharacterFidelity,
  evaluateCrossPlatformCopySimilarity,
  evaluateCrossPlatformVisualSimilarity,
  evaluatePlatformNativeFit,
  storiesDoNotDefaultToCompressedFeedAssets,
  tiktokDoesNotDefaultToInstagramReelCopy,
} from '../site00-studio-world-production/dailyPublishingCadence/platformQA.js';
import {
  buildPublishingCadencePolicy,
  channelTargetFor,
  genericModelsContainNoBrandCadence,
  weeklyPublishingUnitVolume,
} from '../site00-studio-world-production/dailyPublishingCadence/publishingCadencePolicy.js';
import {
  buildSharedResearchPackage,
  freezeSharedResearchPackage,
  researchNotDuplicatedPerPlatformByDefault,
  researchReusedAcrossPlatforms,
} from '../site00-studio-world-production/dailyPublishingCadence/sharedResearch.js';
import {
  estimateWeeklyContentCost,
  sharedIntelligenceCostSeparateFromExpressionCost,
} from '../site00-studio-world-production/dailyPublishingCadence/costModel.js';
import {
  buildVideoHookRound,
  buildWeeklyMarketingProductionBoard,
  channelLearningCannotMutateBrandCharacter,
  founderApprovalRequiredForPublishing,
  productionStateDistinctFromPublishingState,
  recordChannelExpressionLearning,
  reelHookRoundAvoidsIdenticalOpenings,
} from '../site00-studio-world-production/dailyPublishingCadence/weeklyProductionBoard.js';
import {
  CADENCE_DOES_NOT_FORCE_FILLER,
  NDX_INSTAGRAM_FEED_TARGET_PER_DAY,
  NDX_INSTAGRAM_REEL_MAX_NORMAL_PER_DAY,
  NDX_INSTAGRAM_REEL_TARGET_PER_DAY,
  NDX_INSTAGRAM_STORY_TARGET_PER_DAY,
  NDX_PRIMARY_EVENTS_PER_DAY,
  NDX_WEEKLY_APPROVAL_FLOW_IMPLEMENTED,
  NDX_WEEKLY_PRIMARY_EVENTS_TARGET,
  SECOND_REEL_OPTIONAL_POLICY_IMPLEMENTED,
  THIRD_REEL_OPTIONAL_POLICY_IMPLEMENTED,
} from './dailyPublishingCadence/constants.js';
import {
  buildNdxDailyPlan,
  buildNdxDailyPrimaryEventsFromOpportunities,
  buildNdxDailyPublishingCadencePolicy,
  buildNdxWeekPrimaryEvents,
  initializeNdxDailyPublishingRun,
  ndxCadenceNotHardcodedInGenericModels,
  ndxWeeklyVolumeSummary,
} from './dailyPublishingCadence/ndxDailyPublishingCadenceAdapter.js';
import { seedPilotOpportunities } from './contentOperations/opportunityEngine.js';
import {
  prepareContentOperations,
  compileContentOperations,
  discoverContentOpportunities,
  seedVitestContentOperationsPrerequisites,
} from '../../api/_lib/site00Evolve/contentOperationsExperiment/contentOperationsService.js';
import {
  resetDailyPublishingCadenceMemory,
  resetDailyPublishingCadenceStoreModeCache,
} from '../../api/_lib/site00Evolve/dailyPublishingCadence/dailyPublishingCadenceStoreAdapter.js';
import {
  approveWeeklyIntelligenceSlate,
  autonomousPublishingEnabled,
  brandCanonMutated,
  brandCharacterMutated,
  buildDailyPublishingPlan,
  configureDailyPublishingCadence,
  ndxWeeklyVolumeFromRun,
  planWeeklyPrimaryEvents,
  productExpressionImplemented,
  worldFormationImplemented,
} from '../../api/_lib/site00Evolve/dailyPublishingCadence/dailyPublishingCadenceService.js';

const ROOT = join(process.cwd());
const ROUTES = readFileSync(join(ROOT, 'src/site00/config/routes.ts'), 'utf8');
const SITE_ROUTES = readFileSync(join(ROOT, 'src/routes/Site00Routes.tsx'), 'utf8');
const PROJECTS_API = readFileSync(join(ROOT, 'api/site00/projects.ts'), 'utf8');
const DAILY_PLAN_PAGE = readFileSync(join(ROOT, 'src/site00/pages/ProjectContentOperationsDailyPlanPage.tsx'), 'utf8');

const WEEK_START = '2026-08-18';

beforeEach(async () => {
  resetDailyPublishingCadenceMemory();
  resetDailyPublishingCadenceStoreModeCache();
  await seedVitestContentOperationsPrerequisites();
});

function ndxPolicy() {
  return buildNdxDailyPublishingCadencePolicy({ projectId: 'ndxbook', brandId: 'org' });
}

describe('P0.5E.1 Daily Publishing Cadence', () => {
  it('1. Generic publishing cadence policy is brand-agnostic', () => {
    expect(GENERIC_PUBLISHING_CADENCE_POLICY_IMPLEMENTED).toBe(true);
    expect(genericModelsContainNoBrandCadence()).toBe(true);
    const generic = buildPublishingCadencePolicy({
      policyId: 'generic-v1',
      projectId: 'any',
      brandId: 'any',
      name: 'Generic Cadence',
      channelTargets: [],
    });
    expect(generic.primaryEventsPerDay).toBe(3);
  });

  it('2. NDX daily publishing cadence adapter implemented', () => {
    expect(NDX_DAILY_PUBLISHING_CADENCE_IMPLEMENTED).toBe(true);
    expect(ndxCadenceNotHardcodedInGenericModels()).toBe(true);
  });

  it('3. NDX policy defines 3 primary content events per day', () => {
    const policy = ndxPolicy();
    expect(policy.primaryEventsPerDay).toBe(NDX_PRIMARY_EVENTS_PER_DAY);
    expect(NDX_PRIMARY_EVENTS_PER_DAY).toBe(3);
  });

  it('4. NDX Instagram feed target is 3 per day', () => {
    const policy = ndxPolicy();
    expect(channelTargetFor(policy, 'INSTAGRAM', 'FEED')?.targetPerDay).toBe(NDX_INSTAGRAM_FEED_TARGET_PER_DAY);
    expect(NDX_INSTAGRAM_FEED_TARGET_PER_DAY).toBe(3);
  });

  it('5. NDX Instagram story target is 4 units per day', () => {
    const policy = ndxPolicy();
    expect(channelTargetFor(policy, 'INSTAGRAM', 'STORY')?.targetPerDay).toBe(NDX_INSTAGRAM_STORY_TARGET_PER_DAY);
    expect(NDX_INSTAGRAM_STORY_TARGET_PER_DAY).toBe(4);
  });

  it('6. NDX Instagram reel target is 1 per day with max 2 normal', () => {
    const policy = ndxPolicy();
    const reel = channelTargetFor(policy, 'INSTAGRAM', 'REEL');
    expect(reel?.targetPerDay).toBe(NDX_INSTAGRAM_REEL_TARGET_PER_DAY);
    expect(reel?.maxNormalPerDay).toBe(NDX_INSTAGRAM_REEL_MAX_NORMAL_PER_DAY);
    expect(SECOND_REEL_OPTIONAL_POLICY_IMPLEMENTED).toBe(true);
    expect(THIRD_REEL_OPTIONAL_POLICY_IMPLEMENTED).toBe(true);
  });

  it('7. Weekly volume summary includes ~21 primary events', () => {
    const policy = ndxPolicy();
    const volume = ndxWeeklyVolumeSummary(policy);
    expect(volume.primaryEventsPerWeek).toBe(NDX_WEEKLY_PRIMARY_EVENTS_TARGET);
    expect(volume.feedPerWeek).toBe(21);
    expect(volume.storyPerWeek).toBe(28);
    expect(volume.reelTargetPerWeek).toBe(7);
    expect(weeklyPublishingUnitVolume(policy).baselineInstagramUnits).toBe(8 * 7);
  });

  it('8. Primary Content Event model implemented', () => {
    expect(PRIMARY_CONTENT_EVENT_MODEL_IMPLEMENTED).toBe(true);
    const event = buildDailyPrimaryContentEvent({
      id: 'pce-1',
      projectId: 'ndxbook',
      date: WEEK_START,
      planningRole: 'EVENT_A_QUICK_CULTURAL',
      primarySubject: 'subscription normalization',
      behavioralMode: 'OBSERVATIONAL',
      characterTemperature: 'PLAYFUL',
    });
    expect(event.status).toBe('PLANNED');
    expect(event.fingerprint).toBeTruthy();
  });

  it('9. Three daily planning roles assigned across events A/B/C', () => {
    const opps = seedPilotOpportunities('ndxbook').slice(0, 3);
    const events = buildNdxDailyPrimaryEventsFromOpportunities({
      projectId: 'ndxbook',
      date: WEEK_START,
      opportunities: opps,
    });
    expect(events.map((e) => e.planningRole)).toEqual([
      'EVENT_A_QUICK_CULTURAL',
      'EVENT_B_SUBSTANTIAL_INVESTIGATIVE',
      'EVENT_C_CALLBACK_REASSESSMENT',
    ]);
  });

  it('10. Primary event remains distinct from platform expression', () => {
    const event = buildDailyPrimaryContentEvent({
      id: 'pce-2',
      projectId: 'ndxbook',
      date: WEEK_START,
      planningRole: 'EVENT_B_SUBSTANTIAL_INVESTIGATIVE',
      primarySubject: 'corporate layoff memo language',
      behavioralMode: 'INVESTIGATIVE',
      characterTemperature: 'CURIOUS',
    });
    const intel = buildCrossPlatformContentIntelligence({
      id: 'ci-2',
      projectId: 'ndxbook',
      primaryContentEventId: event.id,
      coreObservation: event.primarySubject,
      coreClaim: event.primarySubject,
    });
    const expression = derivePlatformContentExpression({
      id: 'expr-2',
      intelligence: intel,
      primaryContentEventId: event.id,
      platform: 'TIKTOK',
      surface: 'REEL',
      format: 'VERTICAL_VIDEO',
      hook: 'I READ A LAYOFF MEMO AND SOMETHING FELT OFF.',
      openingBeat: 'Conversational entry.',
      platformAngle: 'SAME_THESIS_DIFFERENT_AUDIENCE_ENTRY',
      adaptationReasoning: 'TikTok-native doorway.',
    });
    expect(primaryEventDistinctFromPlatformExpression(event, expression)).toBe(true);
  });

  it('11. Cross-Platform Content Intelligence implemented', () => {
    expect(CROSS_PLATFORM_CONTENT_INTELLIGENCE_IMPLEMENTED).toBe(true);
    const intel = buildCrossPlatformContentIntelligence({
      id: 'ci-3',
      projectId: 'ndxbook',
      primaryContentEventId: 'pce-3',
      coreObservation: 'attention economy pattern',
      coreClaim: 'attention economy pattern',
    });
    expect(intel.platformExpressionEligibility.length).toBeGreaterThanOrEqual(6);
  });

  it('12. Content intelligence may freeze for downstream derivation', () => {
    const intel = buildCrossPlatformContentIntelligence({
      id: 'ci-4',
      projectId: 'ndxbook',
      primaryContentEventId: 'pce-4',
      coreObservation: 'late fees across decades',
      coreClaim: 'late fees across decades',
    });
    const frozen = freezeContentIntelligence(intel);
    expect(frozen.status).toBe('FROZEN');
  });

  it('13. Cross-Platform Derivation Policy enforces REUSE_THINKING_NOT_POSTS', () => {
    expect(CROSS_PLATFORM_DERIVATION_POLICY_IMPLEMENTED).toBe(true);
    const policy = buildCrossPlatformDerivationPolicy({ projectId: 'ndxbook' });
    expect(policy.coreRule).toBe('REUSE_THINKING_NOT_POSTS');
    expect(policy.forbidCrosspostCopy).toBe(true);
    expect(policy.forbidAssetDump).toBe(true);
  });

  it('14. reuseThinkingNotPostsEnforced guard is active', () => {
    expect(REUSE_THINKING_NOT_POSTS_ENFORCED).toBe(true);
    expect(reuseThinkingNotPostsEnforced()).toBe(true);
  });

  it('15. Platform Content Expression model implemented', () => {
    expect(PLATFORM_CONTENT_EXPRESSION_IMPLEMENTED).toBe(true);
    const intel = buildCrossPlatformContentIntelligence({
      id: 'ci-5',
      projectId: 'ndxbook',
      primaryContentEventId: 'pce-5',
      coreObservation: 'airline loyalty devaluation',
      coreClaim: 'airline loyalty devaluation',
    });
    const expression = derivePlatformContentExpression({
      id: 'expr-5',
      intelligence: intel,
      primaryContentEventId: 'pce-5',
      platform: 'THREADS',
      surface: 'TEXT',
      format: 'TEXT_POST',
      hook: 'LOYALTY POINTS KEEP CHANGING THE RULES MID-FLIGHT.',
      openingBeat: 'Text-led judgment.',
      platformAngle: 'SAME_THESIS_DIFFERENT_CHARACTER_BEHAVIOR',
      adaptationReasoning: 'Threads derives through language.',
      textStrategy: 'TEXT_LED',
    });
    expect(expression.sharedIntelligenceFingerprint).toBe(intel.fingerprint);
  });

  it('16. Platform derivation may change hook but not facts', () => {
    const intel = buildCrossPlatformContentIntelligence({
      id: 'ci-6',
      projectId: 'ndxbook',
      primaryContentEventId: 'pce-6',
      coreObservation: 'standing desk reconsideration',
      coreClaim: 'standing desk reconsideration',
    });
    const expression = derivePlatformContentExpression({
      id: 'expr-6',
      intelligence: intel,
      primaryContentEventId: 'pce-6',
      platform: 'YOUTUBE',
      surface: 'SHORT',
      format: 'SHORT',
      hook: 'DO STANDING DESKS ACTUALLY HELP?',
      openingBeat: 'Explanatory progression.',
      platformAngle: 'SAME_THESIS_DIFFERENT_EMOTIONAL_TEMPERATURE',
      adaptationReasoning: 'Shorts explanatory vertical.',
    });
    expect(platformDerivationMayChangeHookButNotFacts({ intelligence: intel, expression, proposedClaim: intel.coreClaim! }).allowed).toBe(true);
    expect(
      platformDerivationMayChangeHookButNotFacts({
        intelligence: intel,
        expression,
        proposedClaim: 'different factual claim',
      }).allowed,
    ).toBe(false);
  });

  it('17. Daily Cross-Platform Content Matrix implemented', () => {
    expect(DAILY_CROSS_PLATFORM_CONTENT_MATRIX_IMPLEMENTED).toBe(true);
    const opps = seedPilotOpportunities('ndxbook').slice(0, 1);
    const events = buildNdxDailyPrimaryEventsFromOpportunities({
      projectId: 'ndxbook',
      date: WEEK_START,
      opportunities: opps,
    });
    const plan = buildNdxDailyPlan({ projectId: 'ndxbook', date: WEEK_START, primaryEvents: events });
    expect(plan.dailyMatrix.cells.length).toBeGreaterThan(0);
    expect(plan.dailyMatrix.reuseIntelligenceCount).toBe(1);
  });

  it('18. Matrix tracks shared intelligence vs unique expressions', () => {
    const selfCheckout = seedPilotOpportunities('ndxbook').find((o) => o.subject.includes('self-checkout'))!;
    const events = buildNdxDailyPrimaryEventsFromOpportunities({
      projectId: 'ndxbook',
      date: WEEK_START,
      opportunities: [selfCheckout],
    });
    const plan = buildNdxDailyPlan({ projectId: 'ndxbook', date: WEEK_START, primaryEvents: events });
    expect(plan.dailyMatrix.uniqueExpressionCount).toBe(6);
    expect(plan.dailyMatrix.uniqueExpressionCount).toBeGreaterThan(plan.dailyMatrix.reuseIntelligenceCount);
  });

  it('19. Cadence fulfillment evaluates HEALTHY_BASELINE when baseline met', () => {
    const policy = ndxPolicy();
    const state = evaluateCadenceFulfillment({
      policy,
      date: WEEK_START,
      primaryEventCount: 3,
      strongOpportunityCount: 3,
      evergreenAvailable: false,
      watchQueueTriggered: false,
    });
    expect(state).toBe('HEALTHY_BASELINE');
  });

  it('20. Cadence does not force filler content', () => {
    expect(CADENCE_DOES_NOT_FORCE_FILLER).toBe(true);
    expect(cadenceDoesNotForceFiller('NO_STRONG_OPPORTUNITY')).toBe(true);
    expect(cadenceDoesNotForceFiller('HOLD_SLOT_EMPTY')).toBe(true);
  });

  it('21. Second reel NOT_JUSTIFIED without eligibility signals', () => {
    const policy = ndxPolicy();
    const evalResult = evaluateSecondReelEligibility({
      policy,
      date: WEEK_START,
      firstReelPlanned: true,
      strongSecondOpportunity: false,
      breakingCulturalSignal: false,
      campaignRequired: false,
      evergreenHighValue: false,
      founderRequested: false,
    });
    expect(evalResult.eligibility).toBe('NOT_JUSTIFIED');
  });

  it('22. Second reel eligible on founder request', () => {
    const policy = ndxPolicy();
    const evalResult = evaluateSecondReelEligibility({
      policy,
      date: WEEK_START,
      firstReelPlanned: true,
      strongSecondOpportunity: false,
      breakingCulturalSignal: false,
      campaignRequired: false,
      evergreenHighValue: false,
      founderRequested: true,
    });
    expect(evalResult.eligibility).toBe('FOUNDER_REQUESTED');
  });

  it('23. Daily story cluster review implemented', () => {
    expect(STORY_CLUSTER_REVIEW_IMPLEMENTED).toBe(true);
    const cluster = buildDailyStoryCluster({
      projectId: 'ndxbook',
      date: WEEK_START,
      storyUnits: [
        {
          unitId: 'su-1',
          purpose: 'AUDIENCE_QUESTION',
          originType: 'PLANNED_STORY',
          primaryContentEventId: 'pce-1',
          hook: 'QUICK QUESTION',
          interactionMechanism: 'POLL_OR_QUESTION',
          status: 'PLANNED',
        },
      ],
      linkedPrimaryContentEvents: ['pce-1'],
    });
    expect(cluster.status).toBe('DRAFT');
  });

  it('24. Stories must not become mini feed posts', () => {
    expect(
      storiesMustNotBecomeMiniFeedPosts({
        unitId: 'su-2',
        purpose: 'AUDIENCE_QUESTION',
        originType: 'PLANNED_STORY',
        primaryContentEventId: 'pce-2',
        hook: 'POLL: WHAT DO YOU THINK?',
        interactionMechanism: 'POLL_OR_QUESTION',
        status: 'PLANNED',
      }),
    ).toBe(true);
  });

  it('25. Instagram Reel must not default to animated carousel', () => {
    const selfCheckout = seedPilotOpportunities('ndxbook').find((o) => o.subject.includes('self-checkout'))!;
    const events = buildNdxDailyPrimaryEventsFromOpportunities({
      projectId: 'ndxbook',
      date: WEEK_START,
      opportunities: [selfCheckout],
    });
    const plan = buildNdxDailyPlan({ projectId: 'ndxbook', date: WEEK_START, primaryEvents: events });
    const igReel = plan.platformExpressions.find((e) => e.platform === 'INSTAGRAM' && e.surface === 'REEL')!;
    expect(instagramReelMustNotDefaultToAnimatedCarousel(igReel)).toBe(true);
  });

  it('26. Stories do not default to compressed feed assets', () => {
    const selfCheckout = seedPilotOpportunities('ndxbook').find((o) => o.subject.includes('self-checkout'))!;
    const plan = buildNdxDailyPlan({
      projectId: 'ndxbook',
      date: WEEK_START,
      primaryEvents: buildNdxDailyPrimaryEventsFromOpportunities({
        projectId: 'ndxbook',
        date: WEEK_START,
        opportunities: [selfCheckout],
      }),
    });
    const story = plan.platformExpressions.find((e) => e.surface === 'STORY')!;
    expect(storiesDoNotDefaultToCompressedFeedAssets(story)).toBe(true);
  });

  it('27. Evergreen reserve structure implemented', () => {
    expect(EVERGREEN_RESERVE_IMPLEMENTED).toBe(true);
    const reserve = buildEvergreenContentReserve({ projectId: 'ndxbook', entries: [] });
    expect(reserve.entries).toEqual([]);
  });

  it('28. Watch queue structure implemented', () => {
    expect(WATCH_QUEUE_IMPLEMENTED).toBe(true);
    const queue = buildContentWatchQueue({ projectId: 'ndxbook', entries: [] });
    expect(queue.queueId).toContain('watch');
  });

  it('29. Rapid response policy requires founder approval', () => {
    expect(RAPID_RESPONSE_POLICY_IMPLEMENTED).toBe(true);
    const init = initializeNdxDailyPublishingRun({ projectId: 'ndxbook', brandId: 'org', runId: 'run-1' });
    expect(init.rapidResponsePolicy?.founderApprovalRequired).toBe(true);
    expect(init.rapidResponsePolicy?.bypassFactualChecks).toBe(false);
    const policy = buildRapidResponseContentPolicy({ projectId: 'ndxbook' });
    expect(policy.founderApprovalRequired).toBe(true);
  });

  it('30. Weekly marketing production board implemented', () => {
    expect(WEEKLY_MARKETING_PRODUCTION_BOARD_IMPLEMENTED).toBe(true);
    const board = buildWeeklyMarketingProductionBoard({
      projectId: 'ndxbook',
      weekStart: WEEK_START,
      weekEnd: '2026-08-24',
      primaryEventIds: ['pce-1', 'pce-2'],
      dailyMatrixIds: [],
      storyClusterIds: [],
    });
    expect(board.approvalStage).toBe('WEEKLY_INTELLIGENCE_SLATE');
    expect(NDX_WEEKLY_APPROVAL_FLOW_IMPLEMENTED).toBe(true);
  });

  it('31. Week view groups by primary event not flat publishing list', () => {
    expect(
      weekViewGroupsByPrimaryEventNotFlatList({
        primaryEventCount: 3,
        publishingUnitCount: 18,
      }),
    ).toBe(true);
  });

  it('32. Video hook round implemented', () => {
    expect(REEL_HOOK_ROUND_IMPLEMENTED).toBe(true);
    const selfCheckout = seedPilotOpportunities('ndxbook').find((o) => o.subject.includes('self-checkout'))!;
    const plan = buildNdxDailyPlan({
      projectId: 'ndxbook',
      date: WEEK_START,
      primaryEvents: buildNdxDailyPrimaryEventsFromOpportunities({
        projectId: 'ndxbook',
        date: WEEK_START,
        opportunities: [selfCheckout],
      }),
    });
    const reelExpressions = plan.platformExpressions.filter((e) => e.surface === 'REEL');
    const round = buildVideoHookRound({ projectId: 'ndxbook', weekStart: WEEK_START, reelExpressions });
    expect(round.reelExpressionIds.length).toBeGreaterThan(0);
  });

  it('33. Reel hook round avoids identical SO I NOTICED openings', () => {
    const expressions = [
      derivePlatformContentExpression({
        id: 'r1',
        intelligence: buildCrossPlatformContentIntelligence({
          id: 'ci-r1',
          projectId: 'ndxbook',
          primaryContentEventId: 'pce-r1',
          coreObservation: 'topic a',
          coreClaim: 'topic a',
        }),
        primaryContentEventId: 'pce-r1',
        platform: 'INSTAGRAM',
        surface: 'REEL',
        format: 'REEL',
        hook: 'SO I NOTICED SOMETHING ABOUT CHECKOUTS',
        openingBeat: 'beat',
        platformAngle: 'SAME_THESIS_DIFFERENT_HOOK',
        adaptationReasoning: 'VIDEO_NATIVE_EVIDENCE_SEQUENCE',
        visualStrategy: 'VIDEO_NATIVE_EVIDENCE_SEQUENCE',
      }),
      derivePlatformContentExpression({
        id: 'r2',
        intelligence: buildCrossPlatformContentIntelligence({
          id: 'ci-r2',
          projectId: 'ndxbook',
          primaryContentEventId: 'pce-r2',
          coreObservation: 'topic b',
          coreClaim: 'topic b',
        }),
        primaryContentEventId: 'pce-r2',
        platform: 'TIKTOK',
        surface: 'REEL',
        format: 'VERTICAL_VIDEO',
        hook: 'I TIMED SELF-CHECKOUT BECAUSE SOMETHING FELT OFF',
        openingBeat: 'beat',
        platformAngle: 'SAME_THESIS_DIFFERENT_AUDIENCE_ENTRY',
        adaptationReasoning: 'TikTok-native',
      }),
    ];
    expect(reelHookRoundAvoidsIdenticalOpenings(expressions)).toBe(true);
  });

  it('34. Platform native fit evaluation implemented', () => {
    expect(PLATFORM_NATIVE_FIT_EVALUATION_IMPLEMENTED).toBe(true);
    const selfCheckout = seedPilotOpportunities('ndxbook').find((o) => o.subject.includes('self-checkout'))!;
    const plan = buildNdxDailyPlan({
      projectId: 'ndxbook',
      date: WEEK_START,
      primaryEvents: buildNdxDailyPrimaryEventsFromOpportunities({
        projectId: 'ndxbook',
        date: WEEK_START,
        opportunities: [selfCheckout],
      }),
    });
    const tiktok = plan.platformExpressions.find((e) => e.platform === 'TIKTOK')!;
    const fit = evaluatePlatformNativeFit(tiktok);
    expect(fit.dimensions.HOOK_NATIVE).toBe('PASS');
  });

  it('35. TikTok does not default to Instagram Reel copy', () => {
    const selfCheckout = seedPilotOpportunities('ndxbook').find((o) => o.subject.includes('self-checkout'))!;
    const plan = buildNdxDailyPlan({
      projectId: 'ndxbook',
      date: WEEK_START,
      primaryEvents: buildNdxDailyPrimaryEventsFromOpportunities({
        projectId: 'ndxbook',
        date: WEEK_START,
        opportunities: [selfCheckout],
      }),
    });
    const igReel = plan.platformExpressions.find((e) => e.platform === 'INSTAGRAM' && e.surface === 'REEL')!;
    const tiktok = plan.platformExpressions.find((e) => e.platform === 'TIKTOK')!;
    expect(tiktokDoesNotDefaultToInstagramReelCopy(igReel, tiktok)).toBe(true);
  });

  it('36. Cross-platform character fidelity preserves intelligence lineage', () => {
    expect(CROSS_PLATFORM_CHARACTER_FIDELITY_IMPLEMENTED).toBe(true);
    const selfCheckout = seedPilotOpportunities('ndxbook').find((o) => o.subject.includes('self-checkout'))!;
    const plan = buildNdxDailyPlan({
      projectId: 'ndxbook',
      date: WEEK_START,
      primaryEvents: buildNdxDailyPrimaryEventsFromOpportunities({
        projectId: 'ndxbook',
        date: WEEK_START,
        opportunities: [selfCheckout],
      }),
    });
    const fidelity = evaluateCrossPlatformCharacterFidelity({
      intelligence: plan.intelligenceObjects[0]!,
      expressions: plan.platformExpressions,
    });
    expect(fidelity.characterPreserved).toBe('PASS');
  });

  it('37. Cross-platform copy similarity guard detects identical hooks', () => {
    expect(CROSS_PLATFORM_COPY_DUPLICATION_GUARD_IMPLEMENTED).toBe(true);
    const dupA = derivePlatformContentExpression({
      id: 'dup-a',
      intelligence: buildCrossPlatformContentIntelligence({
        id: 'ci-dup',
        projectId: 'ndxbook',
        primaryContentEventId: 'pce-dup',
        coreObservation: 'test',
        coreClaim: 'test',
      }),
      primaryContentEventId: 'pce-dup',
      platform: 'INSTAGRAM',
      surface: 'FEED',
      format: 'CAROUSEL',
      hook: 'SAME HOOK',
      openingBeat: 'beat',
      platformAngle: 'SAME_THESIS_DIFFERENT_HOOK',
      adaptationReasoning: 'feed',
    });
    const dupB = { ...dupA, id: 'dup-b', platform: 'TIKTOK' as const, surface: 'REEL' as const };
    const copyEval = evaluateCrossPlatformCopySimilarity([dupA, dupB]);
    expect(copyEval.identicalHook).toBe(true);
    expect(copyEval.failureStates).toContain('FAIL_IDENTICAL_HOOK_ACROSS_PLATFORMS');
  });

  it('38. Cross-platform visual similarity guard detects asset dump', () => {
    expect(CROSS_PLATFORM_VISUAL_DUPLICATION_GUARD_IMPLEMENTED).toBe(true);
    const a = derivePlatformContentExpression({
      id: 'vis-a',
      intelligence: buildCrossPlatformContentIntelligence({
        id: 'ci-vis',
        projectId: 'ndxbook',
        primaryContentEventId: 'pce-vis',
        coreObservation: 'test',
        coreClaim: 'test',
      }),
      primaryContentEventId: 'pce-vis',
      platform: 'INSTAGRAM',
      surface: 'FEED',
      format: 'CAROUSEL',
      hook: 'HOOK A',
      openingBeat: 'beat',
      platformAngle: 'SAME_THESIS_DIFFERENT_HOOK',
      adaptationReasoning: 'feed',
      visualStrategy: 'IG_CROP',
    });
    const b = { ...a, id: 'vis-b', platform: 'TIKTOK' as const, surface: 'REEL' as const, hook: 'HOOK B' };
    const visualEval = evaluateCrossPlatformVisualSimilarity([a, b]);
    expect(visualEval.unjustifiedCrop).toBe(true);
    expect(visualEval.failureStates).toContain('FAIL_IG_ASSET_DUMP_TO_TIKTOK');
  });

  it('39. Shared research package reused across platform expressions', () => {
    expect(SHARED_RESEARCH_REUSE_IMPLEMENTED).toBe(true);
    const selfCheckout = seedPilotOpportunities('ndxbook').find((o) => o.subject.includes('self-checkout'))!;
    const plan = buildNdxDailyPlan({
      projectId: 'ndxbook',
      date: WEEK_START,
      primaryEvents: buildNdxDailyPrimaryEventsFromOpportunities({
        projectId: 'ndxbook',
        date: WEEK_START,
        opportunities: [selfCheckout],
      }),
    });
    expect(
      researchReusedAcrossPlatforms({
        packages: plan.sharedResearch,
        expressions: plan.platformExpressions,
      }),
    ).toBe(true);
    const frozen = freezeSharedResearchPackage(plan.sharedResearch[0]!);
    expect(frozen.frozenAt).toBeTruthy();
  });

  it('40. Research not duplicated per platform by default', () => {
    const intel = buildCrossPlatformContentIntelligence({
      id: 'ci-research',
      projectId: 'ndxbook',
      primaryContentEventId: 'pce-research',
      coreObservation: 'self-checkout time promise',
      coreClaim: 'self-checkout time promise',
    });
    const pkg = buildSharedResearchPackage({
      contentIntelligenceId: intel.id,
      verifiedFacts: [intel.coreObservation],
      citations: [],
      evidence: [],
    });
    expect(researchNotDuplicatedPerPlatformByDefault(intel, 6, 1)).toBe(true);
    expect(pkg.packageId).toContain(intel.id);
  });

  it('41. Daily editorial health evaluates repetition dimensions', () => {
    expect(DAILY_EDITORIAL_HEALTH_IMPLEMENTED).toBe(true);
    const opps = seedPilotOpportunities('ndxbook').slice(0, 3);
    const events = buildNdxDailyPrimaryEventsFromOpportunities({
      projectId: 'ndxbook',
      date: WEEK_START,
      opportunities: opps,
    });
    const plan = buildNdxDailyPlan({ projectId: 'ndxbook', date: WEEK_START, primaryEvents: events });
    const health = evaluateDailyEditorialHealth({
      projectId: 'ndxbook',
      date: WEEK_START,
      primaryEvents: events,
      expressions: plan.platformExpressions,
    });
    expect(health.topicRepetition).toBe('PASS');
  });

  it('42. Weekly editorial health high-volume evaluation implemented', () => {
    expect(WEEKLY_EDITORIAL_HEALTH_HIGH_VOLUME_IMPLEMENTED).toBe(true);
    const events = buildNdxWeekPrimaryEvents({
      projectId: 'ndxbook',
      weekStart: WEEK_START,
      opportunities: seedPilotOpportunities('ndxbook'),
    });
    const health = evaluateWeeklyEditorialHealth({
      projectId: 'ndxbook',
      weekStart: WEEK_START,
      weekEnd: '2026-08-24',
      primaryEvents: events,
      expressions: [],
      fatigue: 'LOW',
    });
    expect(health.behavioralRange).toBeDefined();
  });

  it('43. Content fatigue evaluation detects hook redundancy', () => {
    expect(CONTENT_FATIGUE_EVALUATION_IMPLEMENTED).toBe(true);
    const hooks = Array.from({ length: 8 }, (_, i) =>
      derivePlatformContentExpression({
        id: `fatigue-${i}`,
        intelligence: buildCrossPlatformContentIntelligence({
          id: `ci-f-${i}`,
          projectId: 'ndxbook',
          primaryContentEventId: `pce-f-${i}`,
          coreObservation: `topic ${i}`,
          coreClaim: `topic ${i}`,
        }),
        primaryContentEventId: `pce-f-${i}`,
        platform: 'INSTAGRAM',
        surface: 'FEED',
        format: 'CAROUSEL',
        hook: 'IDENTICAL HOOK SYNTAX HERE',
        openingBeat: 'beat',
        platformAngle: 'SAME_THESIS_DIFFERENT_HOOK',
        adaptationReasoning: 'feed',
      }),
    );
    const fatigue = evaluateContentFatigue({
      projectId: 'ndxbook',
      windowStart: WEEK_START,
      windowEnd: '2026-08-24',
      expressions: hooks,
    });
    expect(fatigue.level).not.toBe('LOW');
  });

  it('44. Weekly cost estimate includes multiplication guard', () => {
    const cost = estimateWeeklyContentCost({ primaryEventCount: 21, expressionCount: 42 });
    expect(cost.multiplicationGuardPass).toBe(true);
    expect(cost.weeklyEstimateUsd).toBeGreaterThan(0);
  });

  it('45. Shared intelligence cost separate from expression costs', () => {
    const cost = estimateWeeklyContentCost({ primaryEventCount: 21, expressionCount: 42 });
    expect(sharedIntelligenceCostSeparateFromExpressionCost(cost)).toBe(true);
  });

  it('46. Channel expression learning cannot mutate brand character', () => {
    expect(CHANNEL_EXPRESSION_LEARNING_IMPLEMENTED).toBe(true);
    const learning = recordChannelExpressionLearning({
      projectId: 'ndxbook',
      platform: 'TIKTOK',
      surface: 'REEL',
      finding: 'Conversational hooks outperform declarative openers on TikTok.',
    });
    expect(channelLearningCannotMutateBrandCharacter(learning)).toBe(true);
  });

  it('47. Production state distinct from publishing state', () => {
    expect(productionStateDistinctFromPublishingState()).toBe(true);
  });

  it('48. Founder approval required for publishing', () => {
    expect(founderApprovalRequiredForPublishing()).toBe(true);
  });

  it('49. Autonomous publishing remains disabled', () => {
    expect(AUTONOMOUS_PUBLISHING_ENABLED).toBe(false);
    expect(autonomousPublishingEnabled()).toBe(false);
  });

  it('50. Brand character not mutated by cadence layer', () => {
    expect(BRAND_CHARACTER_MUTATED).toBe(false);
    expect(brandCharacterMutated()).toBe(false);
  });

  it('51. Brand canon not mutated by cadence layer', () => {
    expect(BRAND_CANON_MUTATED).toBe(false);
    expect(brandCanonMutated()).toBe(false);
  });

  it('52. Product expression not implemented in this sprint', () => {
    expect(PRODUCT_EXPRESSION_IMPLEMENTED).toBe(false);
    expect(productExpressionImplemented()).toBe(false);
  });

  it('53. World formation not implemented in this sprint', () => {
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
    expect(worldFormationImplemented()).toBe(false);
  });

  it('54. Self-checkout example derives 6 platform expressions from one intelligence', () => {
    const selfCheckout = seedPilotOpportunities('ndxbook').find((o) => o.subject.includes('self-checkout'))!;
    const events = buildNdxDailyPrimaryEventsFromOpportunities({
      projectId: 'ndxbook',
      date: WEEK_START,
      opportunities: [selfCheckout],
    });
    const plan = buildNdxDailyPlan({ projectId: 'ndxbook', date: WEEK_START, primaryEvents: events });
    expect(plan.intelligenceObjects).toHaveLength(1);
    expect(plan.platformExpressions).toHaveLength(6);
    const platforms = plan.platformExpressions.map((e) => `${e.platform}_${e.surface}`);
    expect(platforms).toContain('INSTAGRAM_FEED');
    expect(platforms).toContain('INSTAGRAM_STORY');
    expect(platforms).toContain('INSTAGRAM_REEL');
    expect(platforms).toContain('TIKTOK_REEL');
    expect(platforms).toContain('YOUTUBE_SHORT');
    expect(platforms).toContain('THREADS_TEXT');
    expect(new Set(plan.platformExpressions.map((e) => e.hook)).size).toBe(6);
  });

  it('55. Service configures NDX daily publishing cadence', async () => {
    const run = await configureDailyPublishingCadence({ projectId: 'ndxbook' });
    expect(run.status).toBe('CONFIGURED');
    expect(run.publishingCadencePolicy?.primaryEventsPerDay).toBe(3);
    expect(run.derivationPolicy?.coreRule).toBe('REUSE_THINKING_NOT_POSTS');
    const volume = ndxWeeklyVolumeFromRun(run);
    expect(volume?.primaryEventsPerWeek).toBe(21);
  });

  it('56. Service plans weekly primary events from content opportunities', async () => {
    await prepareContentOperations({ projectId: 'ndxbook' });
    await compileContentOperations({ projectId: 'ndxbook' });
    await discoverContentOpportunities({ projectId: 'ndxbook' });
    const run = await planWeeklyPrimaryEvents({ projectId: 'ndxbook', weekStart: WEEK_START });
    expect(run.status).toBe('WEEK_PLANNED');
    expect(run.primaryEvents.length).toBeGreaterThan(0);
    expect(run.primaryEvents.length).toBeLessThanOrEqual(NDX_WEEKLY_PRIMARY_EVENTS_TARGET);
    expect(run.weeklyBoard?.approvalStage).toBe('WEEKLY_INTELLIGENCE_SLATE');
  });

  it('57. Service builds daily plan with cross-platform derivations', async () => {
    await prepareContentOperations({ projectId: 'ndxbook' });
    await compileContentOperations({ projectId: 'ndxbook' });
    await discoverContentOpportunities({ projectId: 'ndxbook' });
    const planned = await planWeeklyPrimaryEvents({ projectId: 'ndxbook', weekStart: WEEK_START });
    const dateWithEvents = planned.primaryEvents[0]!.date;
    const run = await buildDailyPublishingPlan({ projectId: 'ndxbook', date: dateWithEvents });
    expect(run.status).toBe('IN_PRODUCTION');
    expect(run.platformExpressions.length).toBeGreaterThan(0);
    expect(run.dailyMatrices.some((m) => m.date === dateWithEvents)).toBe(true);
    expect(run.costBreakdown?.multiplicationGuardPass).toBe(true);
  });

  it('58. Service approves weekly intelligence slate', async () => {
    await prepareContentOperations({ projectId: 'ndxbook' });
    await compileContentOperations({ projectId: 'ndxbook' });
    await discoverContentOpportunities({ projectId: 'ndxbook' });
    await planWeeklyPrimaryEvents({ projectId: 'ndxbook', weekStart: WEEK_START });
    const planned = await planWeeklyPrimaryEvents({ projectId: 'ndxbook', weekStart: WEEK_START });
    const dateWithEvents = planned.primaryEvents[0]!.date;
    await buildDailyPublishingPlan({ projectId: 'ndxbook', date: dateWithEvents });
    const approved = await approveWeeklyIntelligenceSlate({ projectId: 'ndxbook' });
    expect(approved.status).toBe('APPROVED');
    expect(approved.weeklyBoard?.approvalStage).toBe('FEED_COVER_ROUND');
  });

  it('59. Daily plan page does not auto-generate on load', () => {
    expect(DAILY_PLAN_PAGE).toContain('dailyPublishingGet');
    const mountEffect = DAILY_PLAN_PAGE.match(/useEffect\(\(\) => \{[\s\S]*?\}, \[reload\]\);/)?.[0] ?? '';
    expect(mountEffect).toContain('reload');
    expect(mountEffect).not.toContain('dailyPublishingConfigure');
    expect(mountEffect).not.toContain('dailyPublishingPlanWeek');
    expect(mountEffect).not.toContain('dailyPublishingBuildDay');
    expect(DAILY_PLAN_PAGE).toContain('CONFIGURE NDX DAILY CADENCE');
  });

  it('60. API routes wired for daily publishing cadence', () => {
    expect(PROJECTS_API).toContain('daily_publishing_get');
    expect(PROJECTS_API).toContain('daily_publishing_configure');
    expect(PROJECTS_API).toContain('daily_publishing_plan_week');
    expect(PROJECTS_API).toContain('daily_publishing_build_day');
    expect(PROJECTS_API).toContain('daily_publishing_approve_weekly_slate');
  });

  it('61. Frontend routes and daily plan UI wired', () => {
    expect(ROUTES).toContain('projectContentOperationsDailyPlan');
    expect(SITE_ROUTES).toContain('ProjectContentOperationsDailyPlanPage');
    expect(DAILY_PLAN_PAGE).toContain('P0.5E.1 — DAILY PUBLISHING CADENCE');
    expect(DAILY_PLAN_PAGE).toContain('REUSE THE THINKING');
    expect(DAILY_PLAN_PAGE).toContain('BY_EVENT');
    expect(DAILY_PLAN_PAGE).toContain('BY_PLATFORM');
  });
});
