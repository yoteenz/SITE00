/**
 * P0.5D.2 — Live source capability forensic audit.
 */

import type { ConnectorStatus, LiveSourceCapabilityAudit, LiveSourceCapabilityAuditEntry } from './types.js';

export type SourceCredentialProbe = {
  newsApiKeyPresent: boolean;
  newsApiReachable: boolean;
  rssReachable: boolean;
};

export function probeSourceCredentials(env: Record<string, string | undefined>): SourceCredentialProbe {
  const newsApiKey = env.NEWS_API_KEY ?? env.NEWSAPI_KEY ?? '';
  return {
    newsApiKeyPresent: newsApiKey.length > 0,
    newsApiReachable: false,
    rssReachable: false,
  };
}

function entry(params: Omit<LiveSourceCapabilityAuditEntry, 'blockingReason'> & { blockingReason?: string | null }): LiveSourceCapabilityAuditEntry {
  return { ...params, blockingReason: params.blockingReason ?? null };
}

export function buildLiveSourceCapabilityAudit(params: {
  projectId: string;
  probe: SourceCredentialProbe;
  rssVerified?: boolean;
  newsApiVerified?: boolean;
}): LiveSourceCapabilityAudit {
  const entries: LiveSourceCapabilityAuditEntry[] = [
    entry({
      provider: 'PUBLIC_RSS',
      sourceFamily: 'WEB_NEWS',
      availableInRepo: true,
      sdkPresent: false,
      credentialsPresent: true,
      credentialVerified: true,
      apiReachable: params.rssVerified ?? false,
      termsCompatible: true,
      rateLimitKnown: true,
      costKnown: true,
      dataClasses: ['headline', 'summary', 'url', 'publicationTime'],
      freshnessCapability: 'RECENT',
      queryCapability: 'FEED_CATEGORY',
      historicalCapability: 'LIMITED',
      productionSafe: params.rssVerified ?? false,
      status: params.rssVerified ? 'PRODUCTION_CONNECTED' : 'AVAILABLE_NOT_CONFIGURED',
      blockingReason: params.rssVerified ? null : 'RSS health check not yet verified',
    }),
    entry({
      provider: 'NEWS_API',
      sourceFamily: 'WEB_NEWS',
      availableInRepo: true,
      sdkPresent: false,
      credentialsPresent: params.probe.newsApiKeyPresent,
      credentialVerified: params.newsApiVerified ?? false,
      apiReachable: params.newsApiVerified ?? false,
      termsCompatible: true,
      rateLimitKnown: true,
      costKnown: true,
      dataClasses: ['headline', 'publisher', 'url'],
      freshnessCapability: 'CURRENT',
      queryCapability: 'SEARCH',
      historicalCapability: 'LIMITED',
      productionSafe: params.newsApiVerified ?? false,
      status: params.newsApiVerified
        ? 'PRODUCTION_CONNECTED'
        : params.probe.newsApiKeyPresent
          ? 'CREDENTIAL_MISSING'
          : 'AVAILABLE_NOT_CONFIGURED',
      blockingReason: params.newsApiVerified
        ? null
        : params.probe.newsApiKeyPresent
          ? 'Credentials present but live request not verified'
          : 'NEWS_API_KEY not configured',
    }),
    entry({
      provider: 'EVENT_CALENDAR',
      sourceFamily: 'KNOWN_UPCOMING',
      availableInRepo: true,
      sdkPresent: false,
      credentialsPresent: true,
      credentialVerified: true,
      apiReachable: true,
      termsCompatible: true,
      rateLimitKnown: true,
      costKnown: true,
      dataClasses: ['event', 'date', 'category'],
      freshnessCapability: 'SCHEDULED',
      queryCapability: 'CURATED_SEED',
      historicalCapability: 'MANUAL',
      productionSafe: true,
      status: 'MANUAL_CONNECTED',
      blockingReason: null,
    }),
    entry({
      provider: 'SEARCH_TRENDS',
      sourceFamily: 'SEARCH_BEHAVIOR',
      availableInRepo: true,
      sdkPresent: false,
      credentialsPresent: false,
      credentialVerified: false,
      apiReachable: false,
      termsCompatible: false,
      rateLimitKnown: false,
      costKnown: false,
      dataClasses: [],
      freshnessCapability: 'NONE',
      queryCapability: 'NONE',
      historicalCapability: 'NONE',
      productionSafe: false,
      status: 'NOT_CONNECTED',
      blockingReason: 'No compliant search-interest provider configured',
    }),
    entry({
      provider: 'SOCIAL_TRENDS',
      sourceFamily: 'SOCIAL_PLATFORM',
      availableInRepo: true,
      sdkPresent: false,
      credentialsPresent: false,
      credentialVerified: false,
      apiReachable: false,
      termsCompatible: false,
      rateLimitKnown: false,
      costKnown: false,
      dataClasses: [],
      freshnessCapability: 'NONE',
      queryCapability: 'NONE',
      historicalCapability: 'NONE',
      productionSafe: false,
      status: 'NOT_CONNECTED',
      blockingReason: 'COMMUNITY_SIGNAL_SOURCE_NOT_CONNECTED',
    }),
    entry({
      provider: 'FOUNDER',
      sourceFamily: 'MANUAL_EDITORIAL',
      availableInRepo: true,
      sdkPresent: false,
      credentialsPresent: true,
      credentialVerified: true,
      apiReachable: true,
      termsCompatible: true,
      rateLimitKnown: true,
      costKnown: true,
      dataClasses: ['manual observation', 'url', 'note'],
      freshnessCapability: 'CURRENT',
      queryCapability: 'MANUAL',
      historicalCapability: 'FULL',
      productionSafe: true,
      status: 'MANUAL_CONNECTED',
    }),
    entry({
      provider: 'EDITORIAL',
      sourceFamily: 'MANUAL_RESEARCH',
      availableInRepo: true,
      sdkPresent: false,
      credentialsPresent: true,
      credentialVerified: true,
      apiReachable: true,
      termsCompatible: true,
      rateLimitKnown: true,
      costKnown: true,
      dataClasses: ['manual observation', 'research note'],
      freshnessCapability: 'CURRENT',
      queryCapability: 'MANUAL',
      historicalCapability: 'FULL',
      productionSafe: true,
      status: 'MANUAL_CONNECTED',
    }),
  ];

  return {
    auditId: `lsca-${params.projectId}`,
    projectId: params.projectId,
    auditedAt: new Date().toISOString(),
    entries,
  };
}

export function sourceIsProductionConnected(status: ConnectorStatus): boolean {
  return status === 'PRODUCTION_CONNECTED' || status === 'CONNECTED';
}

export function sourceConnectedWithoutLiveRequest(status: ConnectorStatus): boolean {
  return sourceIsProductionConnected(status) === false && status !== 'MANUAL_CONNECTED' && status !== 'MANUAL';
}

export function missingCredentialsReportCredentialMissing(entry: LiveSourceCapabilityAuditEntry): boolean {
  return entry.status === 'CREDENTIAL_MISSING' || (!entry.credentialsPresent && entry.status === 'AVAILABLE_NOT_CONFIGURED');
}
