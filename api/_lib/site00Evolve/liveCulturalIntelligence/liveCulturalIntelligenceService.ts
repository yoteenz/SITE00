/**
 * P0.5D.1 + P0.5D.2 — Live Cultural Intelligence service.
 */

import { randomUUID } from 'node:crypto';
import {
  NDX_LIVE_CULTURAL_INTELLIGENCE_PROVING_RUN_01,
  NDX_WEEKLY_CULTURAL_FORECAST_LIVE_01,
  NDXBOOK_LIVE_CULTURAL_INTELLIGENCE_RUN_ID,
} from '../../../../shared/site00-brand-lore/liveCulturalIntelligence/constants.js';
import {
  buildDefaultClientIntelligenceConfiguration,
  buildDefaultSignalSourceAdapters,
  buildEventPreparationPackage,
  buildLiveSourceCapabilityAudit,
  buildLiveWatchQueue,
  buildSignalDiscoveryDiversityEvaluation,
  buildSourceCoverageEvaluation,
  buildWeeklyOpportunityOriginBalanceEvaluation,
  executeLiveIntelligenceRefreshRun,
  fetchRssFeed,
  DEFAULT_RSS_FEEDS,
  FAL_REQUESTS_FOR_FORECASTING,
  FAL_REQUESTS_FOR_LIVE_INTELLIGENCE,
  probeSourceCredentials,
} from '../../../../shared/site00-studio-world-production/liveCulturalIntelligence/index.js';
import type {
  LiveCulturalIntelligenceRun,
  ManualSignalSubmission,
  SignalSourceAdapter,
} from '../../../../shared/site00-studio-world-production/liveCulturalIntelligence/types.js';
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
    accounting: {
      anthropicRequests: 0,
      searchSourceRequests: 0,
      falRequests: FAL_REQUESTS_FOR_FORECASTING,
      estimatedCostUsd: 0,
      sourceRequests: 0,
      reasoningRequests: 0,
    },
    error: null,
    updatedAt: nowIso(),
    capabilityAudit: null,
    refreshRuns: [],
    manualSignals: [],
    sourceCoverage: null,
    discoveryDiversity: null,
    eventPreparationPackages: [],
    clientConfig: null,
    queryPlan: null,
    provingRunId: null,
    originBalance: null,
    promotedOpportunityIds: [],
  };
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function mergeAdaptersFromRefresh(
  existing: SignalSourceAdapter[],
  refreshAdapters: Array<{ adapterId: string; status: string; receipt: SignalSourceAdapter['receipt'] }>,
): SignalSourceAdapter[] {
  const map = new Map(existing.map((a) => [a.adapterId, a]));
  for (const u of refreshAdapters) {
    const prev = map.get(u.adapterId);
    if (prev) {
      map.set(u.adapterId, {
        ...prev,
        status: u.status as SignalSourceAdapter['status'],
        receipt: u.receipt,
        lastCheckedAt: nowIso(),
        lastRefreshAt: nowIso(),
        lastSuccessAt: u.status === 'PRODUCTION_CONNECTED' || u.status === 'MANUAL_CONNECTED' ? nowIso() : prev.lastSuccessAt,
        lastFailureAt: u.status === 'FAILED' ? nowIso() : prev.lastFailureAt,
        signalsFound: u.receipt?.resultCount ?? prev.signalsFound,
      });
    }
  }
  return [...map.values()];
}

export async function getLiveCulturalIntelligenceState(params: {
  projectId: string;
}): Promise<LiveCulturalIntelligenceRun | null> {
  return intelStore.getLiveCulturalIntelligenceRun(params.projectId);
}

export async function configureLiveCulturalIntelligence(params: {
  projectId: string;
}): Promise<LiveCulturalIntelligenceRun> {
  const probe = probeSourceCredentials(process.env as Record<string, string | undefined>);
  let rssVerified = false;
  try {
    const check = await fetchRssFeed({ feed: DEFAULT_RSS_FEEDS[0]!, timeoutMs: 10000 });
    rssVerified = check.ok && check.items.length > 0;
  } catch {
    rssVerified = false;
  }

  const capabilityAudit = buildLiveSourceCapabilityAudit({
    projectId: params.projectId,
    probe,
    rssVerified,
  });

  const adapters = buildDefaultSignalSourceAdapters().map((a) => {
    if (a.adapterId === 'public-rss' && rssVerified) {
      return { ...a, status: 'PRODUCTION_CONNECTED' as const, lastCheckedAt: nowIso(), lastSuccessAt: nowIso() };
    }
    return a;
  });

  return intelStore.saveLiveCulturalIntelligenceRun({
    ...emptyRun(params.projectId),
    sourceAdapters: adapters,
    clientConfig: buildDefaultClientIntelligenceConfiguration(params.projectId),
    capabilityAudit,
    status: 'CONFIGURED',
    updatedAt: nowIso(),
  });
}

export async function refreshLiveIntelligence(params: {
  projectId: string;
  trigger?: 'MANUAL_FOUNDER_REFRESH' | 'PROVING_RUN' | 'SYSTEM_RETRY';
  skipLiveFetch?: boolean;
}): Promise<LiveCulturalIntelligenceRun> {
  const existing = (await intelStore.getLiveCulturalIntelligenceRun(params.projectId)) ??
    (await configureLiveCulturalIntelligence(params));
  const weekStart = new Date().toISOString().slice(0, 10);

  const acquisition = await executeLiveIntelligenceRefreshRun({
    projectId: params.projectId,
    brandId: NDXBOOK_ORG_ID,
    weekStart,
    trigger: params.trigger ?? 'MANUAL_FOUNDER_REFRESH',
    manualSignals: existing.manualSignals ?? [],
    skipLiveFetch: params.skipLiveFetch,
  });

  const contentOps = await contentOpsStore.getContentOperationsRun(params.projectId);
  const processed = processNdxLiveIntelligence({
    projectId: params.projectId,
    brandId: NDXBOOK_ORG_ID,
    weekStart,
    weekEnd: addDays(weekStart, 6),
    editorialMemory: contentOps?.editorialMemory ?? null,
    liveSignals: acquisition.signals,
    knownMoments: acquisition.knownMoments,
  });

  const sourceCoverage = buildSourceCoverageEvaluation({
    projectId: params.projectId,
    signals: processed.signals,
    priorityDomains: existing.clientConfig?.priorityDomains,
  });
  const discoveryDiversity = buildSignalDiscoveryDiversityEvaluation({
    projectId: params.projectId,
    signals: processed.signals,
    rawCandidates: acquisition.rawCandidates,
  });
  const eventPreparationPackages = processed.knownMoments.map(buildEventPreparationPackage);
  const originBalance = buildWeeklyOpportunityOriginBalanceEvaluation({
    projectId: params.projectId,
    signals: processed.signals,
    opportunities: processed.interpretations,
  });

  return intelStore.saveLiveCulturalIntelligenceRun({
    ...existing,
    sourceAdapters: mergeAdaptersFromRefresh(existing.sourceAdapters, acquisition.adaptersUpdated),
    signals: processed.signals,
    clusters: processed.clusters,
    lifecycleEvaluations: processed.lifecycles,
    upcomingMoments: processed.knownMoments,
    intelligencePackages: processed.packages,
    brandInterpretations: processed.interpretations,
    culturalMemoryMatches: processed.memoryMatches,
    watchQueue: buildLiveWatchQueue({ projectId: params.projectId, entries: processed.watchlist }),
    flexCapacity: processed.weeklyForecast.openCapacity,
    refreshRuns: [...(existing.refreshRuns ?? []), acquisition.refreshRun],
    sourceCoverage,
    discoveryDiversity,
    eventPreparationPackages,
    originBalance,
    queryPlan: acquisition.refreshRun.queries.length
      ? {
          planId: `wsqp-${params.projectId}-${weekStart}`,
          projectId: params.projectId,
          weekStart,
          queryFamilies: [],
          derivedFrom: ['refresh_run'],
          generatedAt: nowIso(),
        }
      : existing.queryPlan,
    status: 'SIGNALS_LOADED',
    lastCheckedAt: nowIso(),
    nextRecommendedCheck: addDays(weekStart, 1),
    accounting: {
      ...existing.accounting,
      searchSourceRequests: existing.accounting.searchSourceRequests + acquisition.refreshRun.queries.length,
      sourceRequests: (existing.accounting.sourceRequests ?? 0) + acquisition.refreshRun.receipts.length,
      falRequests: FAL_REQUESTS_FOR_LIVE_INTELLIGENCE,
      estimatedCostUsd: existing.accounting.estimatedCostUsd + acquisition.refreshRun.costUsd,
    },
    error: acquisition.refreshRun.errors.length ? acquisition.refreshRun.errors.join('; ') : null,
    updatedAt: nowIso(),
  });
}

/** Legacy alias — delegates to live refresh. */
export async function refreshLiveSignals(params: { projectId: string }): Promise<LiveCulturalIntelligenceRun> {
  return refreshLiveIntelligence({ projectId: params.projectId });
}

export async function addManualFounderSignal(params: {
  projectId: string;
  founderNote: string;
  whatCaughtAttention: string;
  referenceUrl?: string | null;
  possibleConnection?: string | null;
  whyRelevant?: string | null;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH';
}): Promise<LiveCulturalIntelligenceRun> {
  const existing = (await intelStore.getLiveCulturalIntelligenceRun(params.projectId)) ??
    (await configureLiveCulturalIntelligence(params));

  const submission: ManualSignalSubmission = {
    submissionId: `mss-${randomUUID().slice(0, 8)}`,
    projectId: params.projectId,
    brandId: NDXBOOK_ORG_ID,
    submittedAt: nowIso(),
    submittedBy: 'FOUNDER',
    referenceUrl: params.referenceUrl ?? null,
    founderNote: params.founderNote,
    whatCaughtAttention: params.whatCaughtAttention,
    possibleConnection: params.possibleConnection ?? null,
    whyRelevant: params.whyRelevant ?? null,
    urgency: params.urgency ?? 'MEDIUM',
    sourceContext: 'FOUNDER_SIGNAL',
    classification: 'FOUNDER_SIGNAL',
  };

  return intelStore.saveLiveCulturalIntelligenceRun({
    ...existing,
    manualSignals: [...(existing.manualSignals ?? []), submission],
    updatedAt: nowIso(),
  });
}

export async function runLiveProvingRun(params: { projectId: string }): Promise<LiveCulturalIntelligenceRun> {
  await addManualFounderSignal({
    projectId: params.projectId,
    founderNote: 'Founder editorial observation for proving run — subscription pricing fatigue pattern',
    whatCaughtAttention: 'Consumer pushback on recurring price increases across streaming',
    urgency: 'MEDIUM',
  });

  const refreshed = await refreshLiveIntelligence({
    projectId: params.projectId,
    trigger: 'PROVING_RUN',
  });

  const weekStart = new Date().toISOString().slice(0, 10);
  const forecast = await generateWeeklyCulturalForecast({
    projectId: params.projectId,
    weekStart,
    forecastId: NDX_WEEKLY_CULTURAL_FORECAST_LIVE_01,
  });

  return intelStore.saveLiveCulturalIntelligenceRun({
    ...forecast,
    provingRunId: NDX_LIVE_CULTURAL_INTELLIGENCE_PROVING_RUN_01,
    updatedAt: nowIso(),
  });
}

export async function generateWeeklyCulturalForecast(params: {
  projectId: string;
  weekStart: string;
  forecastId?: string;
}): Promise<LiveCulturalIntelligenceRun> {
  const existing = (await intelStore.getLiveCulturalIntelligenceRun(params.projectId)) ??
    (await refreshLiveIntelligence(params));
  const contentOps = await contentOpsStore.getContentOperationsRun(params.projectId);
  const weekEnd = addDays(params.weekStart, 6);

  const processed = processNdxLiveIntelligence({
    projectId: params.projectId,
    brandId: NDXBOOK_ORG_ID,
    weekStart: params.weekStart,
    weekEnd,
    editorialMemory: contentOps?.editorialMemory ?? null,
    liveSignals: existing.signals.filter((s) => s.sourceIds.some((id) => id.includes('rss') || id === 'public-rss')),
    knownMoments: existing.upcomingMoments,
    forecastId: params.forecastId ?? existing.weeklyForecast?.forecastId,
  });

  const originBalance = buildWeeklyOpportunityOriginBalanceEvaluation({
    projectId: params.projectId,
    signals: processed.signals,
    opportunities: processed.interpretations,
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
    originBalance,
    status: 'FORECAST_READY',
    accounting: {
      ...existing.accounting,
      reasoningRequests: (existing.accounting.reasoningRequests ?? 0) + 1,
      falRequests: FAL_REQUESTS_FOR_LIVE_INTELLIGENCE,
    },
    updatedAt: nowIso(),
  });
}

export async function promoteLiveOpportunityItem(params: {
  projectId: string;
  interpretationId: string;
}): Promise<{ intelRun: LiveCulturalIntelligenceRun; contentOpsRun: Awaited<ReturnType<typeof contentOpsStore.getContentOperationsRun>> }> {
  const intel = (await intelStore.getLiveCulturalIntelligenceRun(params.projectId)) ??
    (await generateWeeklyCulturalForecast({ projectId: params.projectId, weekStart: new Date().toISOString().slice(0, 10) }));
  const contentOps = await contentOpsStore.getContentOperationsRun(params.projectId);
  if (!contentOps) throw new Error('Content Operations not initialized');

  const interpretation = intel.brandInterpretations.find((i) => i.id === params.interpretationId);
  if (!interpretation) throw new Error('Interpretation not found');
  if (interpretation.decision !== 'STRONG_OPPORTUNITY' && interpretation.decision !== 'CALLBACK_OPPORTUNITY') {
    throw new Error('Only STRONG_OPPORTUNITY or CALLBACK_OPPORTUNITY may be promoted');
  }

  const signal = intel.signals.find((s) => s.id === interpretation.signalId)!;
  const pkg = intel.intelligencePackages.find((p) => p.id === interpretation.intelligencePackageId)!;
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
  const opportunity = createContentOpportunity({
    projectId: params.projectId,
    spec,
    memory: contentOps.editorialMemory,
    liveLineage: lineage,
  });

  const updatedOps = await contentOpsStore.saveContentOperationsRun({
    ...contentOps,
    opportunities: [...contentOps.opportunities, opportunity],
    status: contentOps.status === 'NOT_STARTED' ? 'OPPORTUNITIES_READY' : contentOps.status,
    updatedAt: nowIso(),
  });

  const intelRun = await intelStore.saveLiveCulturalIntelligenceRun({
    ...intel,
    promotedOpportunityIds: [...(intel.promotedOpportunityIds ?? []), opportunity.id],
    status: intel.status === 'FORECAST_READY' ? 'OPPORTUNITIES_PROMOTED' : intel.status,
    updatedAt: nowIso(),
  });

  return { intelRun, contentOpsRun: updatedOps };
}

export async function promoteLiveOpportunitiesToContentOps(params: {
  projectId: string;
}): Promise<{ intelRun: LiveCulturalIntelligenceRun; contentOpsRun: Awaited<ReturnType<typeof contentOpsStore.getContentOperationsRun>> }> {
  const intel = (await intelStore.getLiveCulturalIntelligenceRun(params.projectId)) ??
    (await generateWeeklyCulturalForecast({ projectId: params.projectId, weekStart: new Date().toISOString().slice(0, 10) }));

  const candidates = intel.brandInterpretations.filter(
    (i) => (i.decision === 'STRONG_OPPORTUNITY' || i.decision === 'CALLBACK_OPPORTUNITY') &&
      !(intel.promotedOpportunityIds ?? []).some(() => false),
  );

  if (candidates.length === 0) {
    const contentOps = await contentOpsStore.getContentOperationsRun(params.projectId);
    return { intelRun: intel, contentOpsRun: contentOps };
  }

  let latest = intel;
  let ops = await contentOpsStore.getContentOperationsRun(params.projectId);
  for (const c of candidates.slice(0, 1)) {
    const result = await promoteLiveOpportunityItem({ projectId: params.projectId, interpretationId: c.id });
    latest = result.intelRun;
    ops = result.contentOpsRun;
  }
  return { intelRun: latest, contentOpsRun: ops };
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

export function falRequestsForLiveIntelligence(): number {
  return FAL_REQUESTS_FOR_LIVE_INTELLIGENCE;
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

export function contentOpportunityAutoPromotionDisabled(): true {
  return true;
}
