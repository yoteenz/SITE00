/**
 * P0.5D.1 — Live Cultural Intelligence service.
 */

import { NDXBOOK_LIVE_CULTURAL_INTELLIGENCE_RUN_ID } from '../../../../shared/site00-brand-lore/liveCulturalIntelligence/constants.js';
import {
  buildDefaultSignalSourceAdapters,
  buildLiveWatchQueue,
  FAL_REQUESTS_FOR_FORECASTING,
} from '../../../../shared/site00-studio-world-production/liveCulturalIntelligence/index.js';
import type { LiveCulturalIntelligenceRun } from '../../../../shared/site00-studio-world-production/liveCulturalIntelligence/types.js';
import {
  buildOpportunityLineage,
  processNdxLiveIntelligence,
  promoteSignalToContentOpportunitySpec,
} from '../../../../shared/site00-brand-lore/liveCulturalIntelligence/ndxLiveCulturalIntelligenceAdapter.js';
import { createContentOpportunity } from '../../../../shared/site00-brand-lore/contentOperations/opportunityEngine.js';
import { NDXBOOK_ORG_ID } from '../creativeDirection/creativeIntelligence/founderComparisonSet.js';
import * as intelStore from './liveCulturalIntelligenceStoreAdapter.js';
import * as contentOpsStore from '../contentOperationsExperiment/contentOperationsStoreAdapter.js';

function nowIso(): string {
  return new Date().toISOString();
}

function emptyRun(projectId: string): LiveCulturalIntelligenceRun {
  return {
    runId: NDXBOOK_LIVE_CULTURAL_INTELLIGENCE_RUN_ID,
    projectId,
    organizationId: NDXBOOK_ORG_ID,
    status: 'NOT_STARTED',
    sourceAdapters: [],
    signals: [],
    clusters: [],
    lifecycleEvaluations: [],
    upcomingMoments: [],
    weeklyForecast: null,
    intelligencePackages: [],
    brandInterpretations: [],
    culturalMemoryMatches: [],
    watchQueue: null,
    flexCapacity: null,
    forecastOutcomes: [],
    notificationCandidates: [],
    refreshMode: 'MANUAL_REFRESH',
    lastCheckedAt: null,
    nextRecommendedCheck: null,
    accounting: { anthropicRequests: 0, searchSourceRequests: 0, falRequests: FAL_REQUESTS_FOR_FORECASTING, estimatedCostUsd: 0 },
    error: null,
    updatedAt: nowIso(),
  };
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function getLiveCulturalIntelligenceState(params: {
  projectId: string;
}): Promise<LiveCulturalIntelligenceRun | null> {
  return intelStore.getLiveCulturalIntelligenceRun(params.projectId);
}

export async function configureLiveCulturalIntelligence(params: {
  projectId: string;
}): Promise<LiveCulturalIntelligenceRun> {
  return intelStore.saveLiveCulturalIntelligenceRun({
    ...emptyRun(params.projectId),
    sourceAdapters: buildDefaultSignalSourceAdapters(),
    status: 'CONFIGURED',
    updatedAt: nowIso(),
  });
}

export async function refreshLiveSignals(params: {
  projectId: string;
}): Promise<LiveCulturalIntelligenceRun> {
  const existing = (await intelStore.getLiveCulturalIntelligenceRun(params.projectId)) ??
    (await configureLiveCulturalIntelligence(params));
  const contentOps = await contentOpsStore.getContentOperationsRun(params.projectId);
  const processed = processNdxLiveIntelligence({
    projectId: params.projectId,
    brandId: NDXBOOK_ORG_ID,
    weekStart: new Date().toISOString().slice(0, 10),
    weekEnd: addDays(new Date().toISOString().slice(0, 10), 6),
    editorialMemory: contentOps?.editorialMemory ?? null,
  });

  return intelStore.saveLiveCulturalIntelligenceRun({
    ...existing,
    signals: processed.signals,
    clusters: processed.clusters,
    lifecycleEvaluations: processed.lifecycles,
    upcomingMoments: processed.knownMoments,
    intelligencePackages: processed.packages,
    brandInterpretations: processed.interpretations,
    culturalMemoryMatches: processed.memoryMatches,
    watchQueue: buildLiveWatchQueue({ projectId: params.projectId, entries: processed.watchlist }),
    flexCapacity: processed.weeklyForecast.openCapacity,
    status: 'SIGNALS_LOADED',
    lastCheckedAt: nowIso(),
    nextRecommendedCheck: addDays(new Date().toISOString().slice(0, 10), 1),
    accounting: { ...existing.accounting, searchSourceRequests: existing.accounting.searchSourceRequests + 1, falRequests: 0 },
    updatedAt: nowIso(),
  });
}

export async function generateWeeklyCulturalForecast(params: {
  projectId: string;
  weekStart: string;
}): Promise<LiveCulturalIntelligenceRun> {
  const existing = (await intelStore.getLiveCulturalIntelligenceRun(params.projectId)) ??
    (await refreshLiveSignals(params));
  const contentOps = await contentOpsStore.getContentOperationsRun(params.projectId);
  const weekEnd = addDays(params.weekStart, 6);
  const processed = processNdxLiveIntelligence({
    projectId: params.projectId,
    brandId: NDXBOOK_ORG_ID,
    weekStart: params.weekStart,
    weekEnd,
    editorialMemory: contentOps?.editorialMemory ?? null,
  });

  return intelStore.saveLiveCulturalIntelligenceRun({
    ...existing,
    signals: processed.signals,
    clusters: processed.clusters,
    lifecycleEvaluations: processed.lifecycles,
    upcomingMoments: processed.knownMoments,
    weeklyForecast: processed.weeklyForecast,
    intelligencePackages: processed.packages,
    brandInterpretations: processed.interpretations,
    culturalMemoryMatches: processed.memoryMatches,
    watchQueue: buildLiveWatchQueue({ projectId: params.projectId, entries: processed.watchlist }),
    flexCapacity: processed.weeklyForecast.openCapacity,
    status: 'FORECAST_READY',
    updatedAt: nowIso(),
  });
}

export async function promoteLiveOpportunitiesToContentOps(params: {
  projectId: string;
}): Promise<{ intelRun: LiveCulturalIntelligenceRun; contentOpsRun: Awaited<ReturnType<typeof contentOpsStore.getContentOperationsRun>> }> {
  const intel = (await intelStore.getLiveCulturalIntelligenceRun(params.projectId)) ??
    (await generateWeeklyCulturalForecast({ projectId: params.projectId, weekStart: new Date().toISOString().slice(0, 10) }));
  const contentOps = await contentOpsStore.getContentOperationsRun(params.projectId);
  if (!contentOps) throw new Error('Content Operations not initialized');

  const promoted = intel.brandInterpretations
    .filter((i) => i.decision === 'STRONG_OPPORTUNITY' || i.decision === 'CALLBACK_OPPORTUNITY')
    .map((interpretation) => {
      const signal = intel.signals.find((s) => s.id === interpretation.signalId)!;
      const pkg = intel.intelligencePackages.find((p) => p.id === interpretation.intelligencePackageId)!;
      const whyNow = intel.weeklyForecast ? null : null;
      const temporal = intel.weeklyForecast?.expiringWindows.find((t) => t.signalId === signal.id);
      const lineage = buildOpportunityLineage({
        signal,
        intelligencePackageId: pkg.id,
        brandInterpretationId: interpretation.id,
        whyNowEvaluationId: `whynow-${signal.id}`,
        temporalRelevanceId: temporal?.id ?? `temp-${signal.id}`,
        culturalMemoryMatchIds: intel.culturalMemoryMatches.filter((m) => m.signalId === signal.id).map((m) => m.id),
        forecastId: intel.weeklyForecast?.forecastId ?? null,
      });
      const spec = promoteSignalToContentOpportunitySpec({ signal, interpretation, lineage });
      return createContentOpportunity({
        projectId: params.projectId,
        spec,
        memory: contentOps.editorialMemory,
        liveLineage: lineage,
      });
    });

  const mergedOpportunities = [
    ...contentOps.opportunities.filter((o) => !o.liveLineage),
    ...promoted,
  ];

  const updatedOps = await contentOpsStore.saveContentOperationsRun({
    ...contentOps,
    opportunities: mergedOpportunities,
    status: contentOps.status === 'NOT_STARTED' ? 'OPPORTUNITIES_READY' : contentOps.status,
    updatedAt: nowIso(),
  });

  const intelRun = await intelStore.saveLiveCulturalIntelligenceRun({
    ...intel,
    status: 'OPPORTUNITIES_PROMOTED',
    updatedAt: nowIso(),
  });

  return { intelRun, contentOpsRun: updatedOps };
}

export function rapidResponseBypassesVerification(): false {
  return false;
}

export function rapidResponseBypassesFounderApproval(): false {
  return false;
}

export function falRequestsForForecasting(): number {
  return FAL_REQUESTS_FOR_FORECASTING;
}

export function brandCharacterMutated(): false {
  return false;
}

export function brandCanonMutated(): false {
  return false;
}

export function autonomousPublishingEnabled(): false {
  return false;
}

export function productExpressionImplemented(): false {
  return false;
}

export function worldFormationImplemented(): false {
  return false;
}
