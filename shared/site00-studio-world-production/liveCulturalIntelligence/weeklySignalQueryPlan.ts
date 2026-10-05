/**
 * P0.5D.2 — Weekly signal query plan (brand-configured, not generic trending).
 */

import type { ClientIntelligenceConfiguration, WeeklySignalQueryPlan } from './types.js';

export function buildWeeklySignalQueryPlan(params: {
  projectId: string;
  weekStart: string;
  config?: ClientIntelligenceConfiguration | null;
  watchSubjects?: string[];
  unresolvedInvestigations?: string[];
}): WeeklySignalQueryPlan {
  const priorityDomains = params.config?.priorityDomains ?? [
    'culture',
    'entertainment',
    'consumer behavior',
    'money',
    'workplace',
    'technology',
    'internet culture',
    'business',
    'fashion',
    'beauty',
    'lifestyle',
    'research',
    'design',
  ];

  const watchQueries = (params.watchSubjects ?? []).map((s) => s.toLowerCase());
  const investigationQueries = (params.unresolvedInvestigations ?? []).map((s) => s.toLowerCase());

  return {
    planId: `wsqp-${params.projectId}-${params.weekStart}`,
    projectId: params.projectId,
    weekStart: params.weekStart,
    queryFamilies: [
      {
        family: 'brand_domains',
        queries: priorityDomains.slice(0, 8),
        rationale: 'ClientIntelligenceConfiguration priority domains',
      },
      {
        family: 'watch_queue',
        queries: watchQueries.length ? watchQueries : ['subscription normalization', 'consumer cost fatigue'],
        rationale: 'Active watch queue + unresolved NDX investigations',
      },
      {
        family: 'known_events',
        queries: ['award show', 'economic data release', 'product launch'],
        rationale: 'Upcoming known moments within forecast horizon',
      },
      {
        family: 'exploratory',
        queries: investigationQueries.length ? investigationQueries : ['platform policy change', 'household debt'],
        rationale: 'Exploratory capacity — avoid query lock-in',
      },
    ],
    derivedFrom: ['ClientIntelligenceConfiguration', 'watch_queue', 'known_events', 'exploratory'],
    generatedAt: new Date().toISOString(),
  };
}
