/**
 * P0.5D.2 — Live intelligence refresh run orchestration.
 */

import { randomUUID } from 'node:crypto';
import type {
  LiveIntelligenceRefreshRun,
  LiveWorldSignal,
  ManualSignalSubmission,
  RawWebNewsCandidate,
  RefreshTrigger,
  SignalSourceReceipt,
  SignalCluster,
} from './types.js';
import { buildLiveWorldSignal } from './signalProcessing.js';
import { clusterSignals } from './signalProcessing.js';
import { buildSourceReceipt } from './signalSources.js';
import { fetchRssNewsDiscovery, type FetchFn } from './rssNewsDiscovery.js';
import { buildKnownEventsFromCurated } from './knownEventSource.js';
import { buildWeeklySignalQueryPlan } from './weeklySignalQueryPlan.js';
import { buildDefaultClientIntelligenceConfiguration } from './clientIntelligenceConfiguration.js';
import { FAL_REQUESTS_FOR_LIVE_INTELLIGENCE } from './constants.js';

export type LiveAcquisitionResult = {
  refreshRun: LiveIntelligenceRefreshRun;
  rawCandidates: RawWebNewsCandidate[];
  signals: LiveWorldSignal[];
  clusters: SignalCluster[];
  knownMoments: ReturnType<typeof buildKnownEventsFromCurated>;
  adaptersUpdated: Array<{ adapterId: string; status: string; receipt: SignalSourceReceipt | null }>;
};

function mapCategoryToSourceType(category: string | null): LiveWorldSignal['sourceType'] {
  const c = (category ?? '').toLowerCase();
  if (c.includes('business')) return 'BUSINESS';
  if (c.includes('technology')) return 'TECHNOLOGY';
  if (c.includes('entertainment')) return 'ENTERTAINMENT';
  return 'NEWS';
}

export function normalizeWebNewsCandidates(params: {
  projectId: string;
  brandId: string;
  candidates: RawWebNewsCandidate[];
}): LiveWorldSignal[] {
  return params.candidates.map((c) =>
    buildLiveWorldSignal({
      projectId: params.projectId,
      brandId: params.brandId,
      title: c.headline,
      summary: `[${c.publisher}] ${c.summary} — Source: ${c.url}`,
      sourceType: mapCategoryToSourceType(c.query),
      signalOrigin: 'EMERGING',
      domains: [c.query ?? 'news', c.publisher.toLowerCase()],
      entities: c.entities,
      keywords: c.headline.toLowerCase().split(/\s+/).slice(0, 6),
      sourceIds: [`rss-${c.publisher.replace(/\s+/g, '-').toLowerCase()}`, 'public-rss'],
      velocity: 0.45,
      momentum: 0.4,
    }),
  );
}

export function normalizeManualSubmission(params: {
  submission: ManualSignalSubmission;
  brandId: string;
}): LiveWorldSignal {
  return buildLiveWorldSignal({
    projectId: params.submission.projectId,
    brandId: params.brandId,
    title: params.submission.whatCaughtAttention.slice(0, 120),
    summary: params.submission.founderNote,
    sourceType: 'MANUAL_FOUNDER',
    signalOrigin: params.submission.urgency === 'HIGH' ? 'BREAKING' : 'EMERGING',
    domains: ['manual founder signal'],
    sourceIds: [params.submission.submittedBy === 'FOUNDER' ? 'manual-founder' : 'manual-editorial'],
    velocity: params.submission.urgency === 'HIGH' ? 0.8 : 0.5,
  });
}

export async function executeLiveIntelligenceRefreshRun(params: {
  projectId: string;
  brandId: string;
  weekStart: string;
  trigger: RefreshTrigger;
  manualSignals?: ManualSignalSubmission[];
  fetchImpl?: FetchFn;
  maxRssItems?: number;
  skipLiveFetch?: boolean;
}): Promise<LiveAcquisitionResult> {
  const startedAt = new Date().toISOString();
  const runId = `lirr-${randomUUID().slice(0, 8)}`;
  const errors: string[] = [];
  const receipts: SignalSourceReceipt[] = [];
  let rawRecordsFound = 0;
  let rawCandidates: RawWebNewsCandidate[] = [];

  const config = buildDefaultClientIntelligenceConfiguration(params.projectId);
  const queryPlan = buildWeeklySignalQueryPlan({ projectId: params.projectId, weekStart: params.weekStart, config });

  if (!params.skipLiveFetch) {
    const rss = await fetchRssNewsDiscovery({ fetchImpl: params.fetchImpl, maxItems: params.maxRssItems ?? 20 });
    rawCandidates = rss.items;
    rawRecordsFound = rss.items.length;

    for (const r of rss.receipts) {
      receipts.push(
        buildSourceReceipt({
          provider: 'PUBLIC_RSS',
          source: 'WEB_NEWS',
          status: r.ok ? 'PRODUCTION_CONNECTED' : 'FAILED',
          limitations: r.error ? [r.error] : [],
          resultCount: r.resultCount,
          query: r.publisher,
        }),
      );
      if (!r.ok && r.error) errors.push(`${r.publisher}: ${r.error}`);
    }
  }

  const webSignals = normalizeWebNewsCandidates({
    projectId: params.projectId,
    brandId: params.brandId,
    candidates: rawCandidates,
  });

  const manualNormalized = (params.manualSignals ?? []).map((s) =>
    normalizeManualSubmission({ submission: s, brandId: params.brandId }),
  );

  const combined = [...webSignals, ...manualNormalized];
  const { clusters, signals } = clusterSignals(combined);
  const duplicatesRemoved = combined.length - signals.length;

  const knownMoments = buildKnownEventsFromCurated({ projectId: params.projectId, weekStart: params.weekStart });

  const rssOk = receipts.some((r) => r.status === 'PRODUCTION_CONNECTED' && r.resultCount > 0);
  const adaptersUpdated = [
    {
      adapterId: 'public-rss',
      status: rssOk ? 'PRODUCTION_CONNECTED' : 'FAILED',
      receipt: receipts.find((r) => r.provider === 'PUBLIC_RSS') ?? null,
    },
    {
      adapterId: 'event-calendar',
      status: 'MANUAL_CONNECTED',
      receipt: buildSourceReceipt({
        provider: 'EVENT_CALENDAR',
        source: 'KNOWN_UPCOMING',
        status: 'MANUAL_CONNECTED',
        limitations: ['Curated seed + manual entry'],
        resultCount: knownMoments.length,
      }),
    },
    {
      adapterId: 'search-trends',
      status: 'NOT_CONNECTED',
      receipt: buildSourceReceipt({
        provider: 'SEARCH_TRENDS',
        source: 'SEARCH_BEHAVIOR',
        status: 'NOT_CONNECTED',
        limitations: ['No compliant search-interest provider configured'],
        resultCount: 0,
      }),
    },
    {
      adapterId: 'social-trends',
      status: 'NOT_CONNECTED',
      receipt: buildSourceReceipt({
        provider: 'SOCIAL_TRENDS',
        source: 'SOCIAL_PLATFORM',
        status: 'NOT_CONNECTED',
        limitations: ['COMMUNITY_SIGNAL_SOURCE_NOT_CONNECTED'],
        resultCount: 0,
      }),
    },
    {
      adapterId: 'manual-founder',
      status: 'MANUAL_CONNECTED',
      receipt: buildSourceReceipt({
        provider: 'FOUNDER',
        source: 'MANUAL_EDITORIAL',
        status: 'MANUAL_CONNECTED',
        limitations: [],
        resultCount: manualNormalized.length,
      }),
    },
  ];

  const status: LiveIntelligenceRefreshRun['status'] =
    errors.length && signals.length ? 'PARTIAL_FAILURE' : errors.length ? 'FAILED' : 'COMPLETED';

  const refreshRun: LiveIntelligenceRefreshRun = {
    id: runId,
    projectId: params.projectId,
    brandId: params.brandId,
    startedAt,
    completedAt: new Date().toISOString(),
    trigger: params.trigger,
    sourceAdapters: adaptersUpdated.map((a) => a.adapterId),
    queries: queryPlan.queryFamilies.flatMap((f) => f.queries).slice(0, 20),
    rawRecordsFound,
    signalCandidatesFound: combined.length,
    signalsAccepted: signals.length,
    signalsDeduplicated: duplicatesRemoved,
    clustersUpdated: clusters.length,
    costUsd: 0,
    receipts,
    errors,
    status,
    falRequests: FAL_REQUESTS_FOR_LIVE_INTELLIGENCE,
  };

  return {
    refreshRun,
    rawCandidates,
    signals,
    clusters,
    knownMoments,
    adaptersUpdated,
  };
}

export function partialSourceFailureCanStillProduceForecast(refreshRun: LiveIntelligenceRefreshRun): boolean {
  return refreshRun.status === 'PARTIAL_FAILURE' || refreshRun.status === 'COMPLETED';
}

export function sourceFailureDoesNotSubstituteFakeData(refreshRun: LiveIntelligenceRefreshRun): boolean {
  return !refreshRun.errors.some((e) => e.includes('substitute'));
}
