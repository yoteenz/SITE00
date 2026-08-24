/**
 * Signal source adapters — provider-agnostic, truthful connectivity states.
 */

import type { ConnectorStatus, RefreshMode, SignalSourceAdapter, SignalSourceReceipt } from './types.js';

export function buildDefaultSignalSourceAdapters(): SignalSourceAdapter[] {
  const now = new Date().toISOString();
  const base = (params: {
    adapterId: string;
    provider: string;
    sourceFamily: string;
    status: ConnectorStatus;
    limitations: string[];
    supportsSearch?: boolean;
    supportsKnownEvents?: boolean;
    supportsTrendMovement?: boolean;
    supportsCommunitySignals?: boolean;
  }): SignalSourceAdapter => ({
    adapterId: params.adapterId,
    provider: params.provider,
    sourceFamily: params.sourceFamily,
    status: params.status,
    lastCheckedAt: params.status === 'MANUAL' || params.status === 'MANUAL_CONNECTED' ? now : null,
    nextRecommendedCheck: null,
    refreshMode: 'MANUAL_REFRESH' as RefreshMode,
    receipt:
      params.status === 'CONNECTED' ||
      params.status === 'PRODUCTION_CONNECTED' ||
      params.status === 'MANUAL' ||
      params.status === 'MANUAL_CONNECTED'
        ? buildSourceReceipt({ provider: params.provider, source: params.sourceFamily, status: params.status, limitations: params.limitations })
        : null,
    supportsSearch: params.supportsSearch ?? false,
    supportsKnownEvents: params.supportsKnownEvents ?? false,
    supportsTrendMovement: params.supportsTrendMovement ?? false,
    supportsCommunitySignals: params.supportsCommunitySignals ?? false,
    limitations: params.limitations,
    signalsFound: 0,
  });

  return [
    base({ adapterId: 'manual-founder', provider: 'FOUNDER', sourceFamily: 'MANUAL_EDITORIAL', status: 'MANUAL_CONNECTED', limitations: [] }),
    base({ adapterId: 'manual-editorial', provider: 'EDITORIAL', sourceFamily: 'MANUAL_RESEARCH', status: 'MANUAL_CONNECTED', limitations: [] }),
    base({
      adapterId: 'public-rss',
      provider: 'PUBLIC_RSS',
      sourceFamily: 'WEB_NEWS',
      status: 'AVAILABLE_NOT_CONFIGURED',
      limitations: ['Awaiting live RSS health check'],
      supportsSearch: true,
    }),
    base({
      adapterId: 'news-search',
      provider: 'NEWS_API',
      sourceFamily: 'WEB_NEWS',
      status: 'AVAILABLE_NOT_CONFIGURED',
      limitations: ['NEWS_API_KEY not configured'],
      supportsSearch: true,
    }),
    base({
      adapterId: 'search-trends',
      provider: 'SEARCH_TRENDS',
      sourceFamily: 'SEARCH_BEHAVIOR',
      status: 'NOT_CONNECTED',
      limitations: ['No compliant search-interest provider configured'],
      supportsTrendMovement: true,
    }),
    base({
      adapterId: 'social-trends',
      provider: 'SOCIAL_TRENDS',
      sourceFamily: 'SOCIAL_PLATFORM',
      status: 'NOT_CONNECTED',
      limitations: ['COMMUNITY_SIGNAL_SOURCE_NOT_CONNECTED'],
      supportsCommunitySignals: true,
    }),
    base({
      adapterId: 'event-calendar',
      provider: 'EVENT_CALENDAR',
      sourceFamily: 'KNOWN_UPCOMING',
      status: 'MANUAL_CONNECTED',
      limitations: ['Curated seed + manual entry'],
      supportsKnownEvents: true,
    }),
    base({
      adapterId: 'public-reports',
      provider: 'PUBLIC_REPORTS',
      sourceFamily: 'DATA_RELEASES',
      status: 'AVAILABLE_NOT_CONFIGURED',
      limitations: ['RSS/API not configured'],
    }),
  ];
}

export function buildSourceReceipt(params: {
  provider: string;
  source: string;
  status: ConnectorStatus;
  limitations: string[];
  resultCount?: number;
  query?: string | null;
}): SignalSourceReceipt {
  return {
    provider: params.provider,
    source: params.source,
    retrievedAt: new Date().toISOString(),
    query: params.query ?? null,
    resultCount: params.resultCount ?? 0,
    freshness: params.status === 'MANUAL' ? 'CURRENT' : 'RECENT',
    status: params.status,
    costUsd: 0,
    limitations: params.limitations,
  };
}

export function connectorStatesReportTruthfully(adapters: SignalSourceAdapter[]): boolean {
  const valid = [
    'CONNECTED',
    'PRODUCTION_CONNECTED',
    'STAGING_CONNECTED',
    'TEST_VERIFIED',
    'MANUAL',
    'MANUAL_CONNECTED',
    'AVAILABLE_NOT_CONFIGURED',
    'CREDENTIAL_MISSING',
    'NOT_AVAILABLE',
    'NOT_CONNECTED',
    'BLOCKED',
    'FAILED',
    'UNASSESSED',
  ];
  return adapters.every((a) => valid.includes(a.status));
}

export function liveSourcesConnected(adapters: SignalSourceAdapter[]): SignalSourceAdapter[] {
  return adapters.filter((a) =>
    a.status === 'CONNECTED' || a.status === 'PRODUCTION_CONNECTED' || a.status === 'STAGING_CONNECTED' || a.status === 'TEST_VERIFIED',
  );
}

export function manualSources(adapters: SignalSourceAdapter[]): SignalSourceAdapter[] {
  return adapters.filter((a) => a.status === 'MANUAL' || a.status === 'MANUAL_CONNECTED');
}

export function unavailableSources(adapters: SignalSourceAdapter[]): SignalSourceAdapter[] {
  return adapters.filter(
    (a) =>
      a.status === 'NOT_AVAILABLE' ||
      a.status === 'NOT_CONNECTED' ||
      a.status === 'AVAILABLE_NOT_CONFIGURED' ||
      a.status === 'CREDENTIAL_MISSING',
  );
}
