/**
 * P0.5E.1 — Daily publishing cadence service.
 */

import { NDXBOOK_DAILY_PUBLISHING_RUN_ID } from '../../../../shared/site00-brand-lore/dailyPublishingCadence/constants.js';
import {
  buildNdxDailyPlan,
  buildNdxWeekPrimaryEvents,
  initializeNdxDailyPublishingRun,
  ndxWeeklyVolumeSummary,
} from '../../../../shared/site00-brand-lore/dailyPublishingCadence/ndxDailyPublishingCadenceAdapter.js';
import { evaluateSecondReelEligibility, evaluateCadenceFulfillment } from '../../../../shared/site00-studio-world-production/dailyPublishingCadence/contentSupply.js';
import { evaluateContentFatigue, evaluateDailyEditorialHealth, evaluateWeeklyEditorialHealth } from '../../../../shared/site00-studio-world-production/dailyPublishingCadence/editorialHealth.js';
import { estimateWeeklyContentCost } from '../../../../shared/site00-studio-world-production/dailyPublishingCadence/costModel.js';
import { buildVideoHookRound, buildWeeklyMarketingProductionBoard } from '../../../../shared/site00-studio-world-production/dailyPublishingCadence/weeklyProductionBoard.js';
import type { DailyPublishingCadenceRun } from '../../../../shared/site00-studio-world-production/dailyPublishingCadence/types.js';
import { NDXBOOK_ORG_ID } from '../creativeDirection/creativeIntelligence/founderComparisonSet.js';
import * as cadenceStore from './dailyPublishingCadenceStoreAdapter.js';
import * as contentOpsStore from '../contentOperationsExperiment/contentOperationsStoreAdapter.js';

function nowIso(): string {
  return new Date().toISOString();
}

function emptyRun(projectId: string): DailyPublishingCadenceRun {
  return {
    runId: NDXBOOK_DAILY_PUBLISHING_RUN_ID,
    projectId,
    organizationId: NDXBOOK_ORG_ID,
    status: 'NOT_STARTED',
    publishingCadencePolicy: null,
    derivationPolicy: null,
    weeklyBoard: null,
    primaryEvents: [],
    intelligenceObjects: [],
    platformExpressions: [],
    dailyMatrices: [],
    storyClusters: [],
    videoHookRounds: [],
    sharedResearchPackages: [],
    evergreenReserve: null,
    watchQueue: null,
    rapidResponsePolicy: null,
    channelExpressionLearning: [],
    costBreakdown: null,
    cadenceFulfillmentByDate: {},
    secondReelEligibilityByDate: {},
    error: null,
    updatedAt: nowIso(),
  };
}

export async function getDailyPublishingCadenceState(params: {
  projectId: string;
}): Promise<DailyPublishingCadenceRun | null> {
  return cadenceStore.getDailyPublishingCadenceRun(params.projectId);
}

export async function configureDailyPublishingCadence(params: {
  projectId: string;
}): Promise<DailyPublishingCadenceRun> {
  const init = initializeNdxDailyPublishingRun({
    projectId: params.projectId,
    brandId: NDXBOOK_ORG_ID,
    runId: NDXBOOK_DAILY_PUBLISHING_RUN_ID,
  });

  return cadenceStore.saveDailyPublishingCadenceRun({
    ...emptyRun(params.projectId),
    ...init,
    status: 'CONFIGURED',
    updatedAt: nowIso(),
  });
}

export async function planWeeklyPrimaryEvents(params: {
  projectId: string;
  weekStart: string;
}): Promise<DailyPublishingCadenceRun> {
  const existing = (await cadenceStore.getDailyPublishingCadenceRun(params.projectId)) ?? (await configureDailyPublishingCadence(params));
  const contentOps = await contentOpsStore.getContentOperationsRun(params.projectId);
  const opportunities = contentOps?.opportunities.filter((o) => o.status !== 'REJECTED') ?? [];

  const primaryEvents = buildNdxWeekPrimaryEvents({
    projectId: params.projectId,
    weekStart: params.weekStart,
    opportunities,
  });

  const weekEnd = addDays(params.weekStart, 6);
  const weeklyBoard = buildWeeklyMarketingProductionBoard({
    projectId: params.projectId,
    weekStart: params.weekStart,
    weekEnd,
    primaryEventIds: primaryEvents.map((e) => e.id),
    dailyMatrixIds: [],
    storyClusterIds: [],
  });

  const policy = existing.publishingCadencePolicy!;
  const cadenceFulfillmentByDate: DailyPublishingCadenceRun['cadenceFulfillmentByDate'] = {};
  const secondReelEligibilityByDate: DailyPublishingCadenceRun['secondReelEligibilityByDate'] = {};

  for (let day = 0; day < 7; day += 1) {
    const date = addDays(params.weekStart, day);
    const dayEvents = primaryEvents.filter((e) => e.date === date);
    cadenceFulfillmentByDate[date] = evaluateCadenceFulfillment({
      policy,
      date,
      primaryEventCount: dayEvents.length,
      strongOpportunityCount: dayEvents.length,
      evergreenAvailable: (existing.evergreenReserve?.entries.length ?? 0) > 0,
      watchQueueTriggered: false,
    });
    secondReelEligibilityByDate[date] = evaluateSecondReelEligibility({
      policy,
      date,
      firstReelPlanned: true,
      strongSecondOpportunity: dayEvents.length > 1,
      breakingCulturalSignal: false,
      campaignRequired: false,
      evergreenHighValue: false,
      founderRequested: false,
    });
  }

  return cadenceStore.saveDailyPublishingCadenceRun({
    ...existing,
    primaryEvents,
    weeklyBoard,
    status: 'WEEK_PLANNED',
    cadenceFulfillmentByDate,
    secondReelEligibilityByDate,
    updatedAt: nowIso(),
  });
}

export async function buildDailyPublishingPlan(params: {
  projectId: string;
  date: string;
}): Promise<DailyPublishingCadenceRun> {
  const existing = (await cadenceStore.getDailyPublishingCadenceRun(params.projectId)) ?? (await planWeeklyPrimaryEvents({ projectId: params.projectId, weekStart: params.date }));
  const dayEvents = existing.primaryEvents.filter((e) => e.date === params.date);
  if (dayEvents.length === 0) {
    throw new Error(`No primary content events planned for ${params.date}`);
  }

  const plan = buildNdxDailyPlan({ projectId: params.projectId, date: params.date, primaryEvents: dayEvents });

  const dailyMatrices = [
    ...existing.dailyMatrices.filter((m) => m.date !== params.date),
    plan.dailyMatrix,
  ];
  const storyClusters = [
    ...existing.storyClusters.filter((c) => c.date !== params.date),
    plan.storyCluster,
  ];

  const intelligenceObjects = [
    ...existing.intelligenceObjects.filter((i) => !dayEvents.some((e) => e.id === i.primaryContentEventId)),
    ...plan.intelligenceObjects,
  ];
  const platformExpressions = [
    ...existing.platformExpressions.filter((e) => !dayEvents.some((ev) => ev.id === e.primaryContentEventId)),
    ...plan.platformExpressions,
  ];
  const sharedResearchPackages = [
    ...existing.sharedResearchPackages.filter((p) => !plan.sharedResearch.some((r) => r.packageId === p.packageId)),
    ...plan.sharedResearch,
  ];

  const fatigue = evaluateContentFatigue({
    projectId: params.projectId,
    windowStart: params.date,
    windowEnd: params.date,
    expressions: platformExpressions,
  });

  evaluateDailyEditorialHealth({
    projectId: params.projectId,
    date: params.date,
    primaryEvents: dayEvents,
    expressions: plan.platformExpressions,
  });

  const costBreakdown = estimateWeeklyContentCost({
    primaryEventCount: existing.primaryEvents.length,
    expressionCount: platformExpressions.length,
  });

  const reelExpressions = platformExpressions.filter((e) => e.surface === 'REEL' && e.platform === 'INSTAGRAM');
  const videoHookRound = buildVideoHookRound({
    projectId: params.projectId,
    weekStart: params.date.slice(0, 10),
    reelExpressions,
  });

  return cadenceStore.saveDailyPublishingCadenceRun({
    ...existing,
    intelligenceObjects,
    platformExpressions,
    dailyMatrices,
    storyClusters,
    sharedResearchPackages,
    videoHookRounds: [...existing.videoHookRounds.filter((r) => r.weekStart !== params.date.slice(0, 10)), videoHookRound],
    costBreakdown,
    status: 'IN_PRODUCTION',
    updatedAt: nowIso(),
  });
}

export async function approveWeeklyIntelligenceSlate(params: {
  projectId: string;
}): Promise<DailyPublishingCadenceRun> {
  const existing = await cadenceStore.getDailyPublishingCadenceRun(params.projectId);
  if (!existing?.weeklyBoard) throw new Error('Weekly board not planned');

  const fatigue = evaluateContentFatigue({
    projectId: params.projectId,
    windowStart: existing.weeklyBoard.weekStart,
    windowEnd: existing.weeklyBoard.weekEnd,
    expressions: existing.platformExpressions,
  });

  evaluateWeeklyEditorialHealth({
    projectId: params.projectId,
    weekStart: existing.weeklyBoard.weekStart,
    weekEnd: existing.weeklyBoard.weekEnd,
    primaryEvents: existing.primaryEvents,
    expressions: existing.platformExpressions,
    fatigue: fatigue.level,
  });

  return cadenceStore.saveDailyPublishingCadenceRun({
    ...existing,
    weeklyBoard: {
      ...existing.weeklyBoard,
      approvalStage: 'FEED_COVER_ROUND',
    },
    status: 'APPROVED',
    updatedAt: nowIso(),
  });
}

export function ndxWeeklyVolumeFromRun(run: DailyPublishingCadenceRun) {
  if (!run.publishingCadencePolicy) return null;
  return ndxWeeklyVolumeSummary(run.publishingCadencePolicy);
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function autonomousPublishingEnabled(): false {
  return false;
}

export function brandCharacterMutated(): false {
  return false;
}

export function brandCanonMutated(): false {
  return false;
}

export function productExpressionImplemented(): false {
  return false;
}

export function worldFormationImplemented(): false {
  return false;
}
