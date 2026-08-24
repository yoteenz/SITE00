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
  }): SignalSourceAdapter => ({
    adapterId: params.adapterId,
    provider: params.provider,
    sourceFamily: params.sourceFamily,
    status: params.status,
    lastCheckedAt: params.status === 'MANUAL' ? now : null,
    nextRecommendedCheck: null,
    refreshMode: 'MANUAL_REFRESH' as RefreshMode,
    receipt: params.status === 'CONNECTED' || params.status === 'MANUAL'
      ? buildSourceReceipt({ provider: params.provider, source: params.sourceFamily, status: params.status, limitations: params.limitations })
      : null,
  });

  return [
    base({ adapterId: 'manual-founder', provider: 'FOUNDER', sourceFamily: 'MANUAL_EDITORIAL', status: 'MANUAL', limitations: [] }),
    base({ adapterId: 'manual-editorial', provider: 'EDITORIAL', sourceFamily: 'MANUAL_RESEARCH', status: 'MANUAL', limitations: [] }),
    base({ adapterId: 'news-search', provider: 'NEWS_SEARCH', sourceFamily: 'WEB_NEWS', status: 'AVAILABLE_NOT_CONFIGURED', limitations: ['No API credentials configured'] }),
    base({ adapterId: 'search-trends', provider: 'SEARCH_TRENDS', sourceFamily: 'SEARCH_BEHAVIOR', status: 'NOT_AVAILABLE', limitations: ['Provider not integrated in this sprint'] }),
    base({ adapterId: 'social-trends', provider: 'SOCIAL_TRENDS', sourceFamily: 'SOCIAL_PLATFORM', status: 'NOT_AVAILABLE', limitations: ['Platform APIs not connected'] }),
    base({ adapterId: 'event-calendar', provider: 'EVENT_CALENDAR', sourceFamily: 'KNOWN_UPCOMING', status: 'MANUAL', limitations: ['Known moments entered manually or seeded'] }),
    base({ adapterId: 'public-reports', provider: 'PUBLIC_REPORTS', sourceFamily: 'DATA_RELEASES', status: 'AVAILABLE_NOT_CONFIGURED', limitations: ['RSS/API not configured'] }),
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
  return adapters.every((a) => ['CONNECTED', 'MANUAL', 'AVAILABLE_NOT_CONFIGURED', 'NOT_AVAILABLE', 'BLOCKED', 'FAILED'].includes(a.status));
}

export function liveSourcesConnected(adapters: SignalSourceAdapter[]): SignalSourceAdapter[] {
  return adapters.filter((a) => a.status === 'CONNECTED');
}

export function manualSources(adapters: SignalSourceAdapter[]): SignalSourceAdapter[] {
  return adapters.filter((a) => a.status === 'MANUAL');
}

export function unavailableSources(adapters: SignalSourceAdapter[]): SignalSourceAdapter[] {
  return adapters.filter((a) => a.status === 'NOT_AVAILABLE' || a.status === 'AVAILABLE_NOT_CONFIGURED');
}
