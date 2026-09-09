/**
 * Portfolio aggregation — scales to 1,000+ projects with pagination.
 */

import type {
  EvolveOperationalAction,
  EvolvePortfolioPage,
  EvolvePortfolioSummary,
  EvolveProjectOpsView,
  EvolveProviderIncident,
  EvolveQueueId,
} from './types.js';
import { generateExecutiveBrief } from './executiveBriefIntelligence.js';

const QUEUE_IDS: EvolveQueueId[] = [
  'NEEDS_YOU_NOW',
  'SYSTEM_CAN_HANDLE',
  'CLIENT_ACTION_REQUIRED',
  'SITE00_ACTION_REQUIRED',
  'AT_RISK',
  'BLOCKED',
  'SPEND_WATCH',
  'REPEATED_FAILURES',
  'HIGH_VALUE_CLIENTS',
];

export function aggregatePortfolioSummary(views: EvolveProjectOpsView[]): EvolvePortfolioSummary {
  const active = views.filter((v) => v.health.health !== 'COMPLETE').length;
  const needsAttention = views.filter(
    (v) =>
      v.health.health === 'AT_RISK' ||
      v.health.health === 'STALLED' ||
      v.health.health === 'SYSTEM_BLOCKED' ||
      v.queueAssignments.some((q) => q.queueId === 'NEEDS_YOU_NOW'),
  ).length;
  const blocked = views.filter((v) => v.health.health === 'SYSTEM_BLOCKED').length;
  const clientWaiting = views.filter((v) => v.health.health === 'WAITING_ON_CLIENT').length;
  const systemWaiting = views.filter((v) => v.health.health === 'WAITING_ON_SITE00').length;
  const systemFailures = views.filter((v) => v.failureBudget.anomalyDetected || v.failureBudget.failureSpendPercent >= 10).length;
  const spendWatch = views.filter((v) => v.spend.health === 'WATCH' || v.spend.health === 'AT_RISK').length;
  const marginWatch = views.filter((v) => v.internalMargin?.health === 'WATCH' || v.internalMargin?.health === 'ERODING').length;
  const highValueAtRisk = views.filter(
    (v) =>
      v.clientRisk.level === 'HIGH' ||
      v.clientRisk.level === 'CRITICAL' ||
      v.queueAssignments.some((q) => q.queueId === 'HIGH_VALUE_CLIENTS'),
  ).length;

  let portfolioHealth: EvolvePortfolioSummary['portfolioHealth'] = 'HEALTHY';
  if (needsAttention >= Math.max(5, active * 0.15)) portfolioHealth = 'AT_RISK';
  else if (needsAttention >= 3 || spendWatch >= 5) portfolioHealth = 'WATCH';

  return {
    activeProjects: active,
    needsAttention,
    blocked,
    clientWaiting,
    systemWaiting,
    systemFailures,
    spendWatch,
    marginWatch,
    highValueAtRisk,
    portfolioHealth,
    healthReasons: [
      { code: 'NEEDS_ATTENTION', label: `${needsAttention} PROJECTS NEED ATTENTION` },
      { code: 'CLIENT_WAITING', label: `${clientWaiting} WAITING ON CLIENT` },
    ],
  };
}

export function collectQueueActions(views: EvolveProjectOpsView[]): EvolveOperationalAction[] {
  return views.flatMap((v) => v.pendingActions);
}

export function paginateQueue(
  actions: EvolveOperationalAction[],
  queueId: EvolveQueueId,
  page: number,
  pageSize: number,
): { total: number; items: EvolveOperationalAction[] } {
  const filtered = actions.filter((a) => a.queueId === queueId);
  const start = page * pageSize;
  return {
    total: filtered.length,
    items: filtered.slice(start, start + pageSize),
  };
}

export function buildPortfolioPage(
  views: EvolveProjectOpsView[],
  incidents: EvolveProviderIncident[],
  changedSinceLastCheck: string[],
  whatSystemHandled: string[],
  pageSize = 20,
): EvolvePortfolioPage {
  const summary = aggregatePortfolioSummary(views);
  const allActions = collectQueueActions(views);
  allActions.sort((a, b) => b.priority.score - a.priority.score);

  const queues = {} as EvolvePortfolioPage['queues'];
  for (const qid of QUEUE_IDS) {
    const page = paginateQueue(allActions, qid, 0, pageSize);
    queues[qid] = { total: page.total, items: page.items };
  }

  const topSignals = [
    { id: 'active', label: 'ACTIVE PROJECTS', value: summary.activeProjects, state: 'HEALTHY' as const },
    { id: 'health', label: 'PORTFOLIO HEALTH', value: summary.needsAttention, state: summary.portfolioHealth },
    { id: 'attention', label: 'NEEDS ATTENTION', value: summary.needsAttention, state: summary.needsAttention > 0 ? ('AT_RISK' as const) : ('HEALTHY' as const) },
    { id: 'blocked', label: 'BLOCKED', value: summary.blocked, state: summary.blocked > 0 ? ('BLOCKED' as const) : ('HEALTHY' as const) },
    { id: 'client-wait', label: 'CLIENT WAITING', value: summary.clientWaiting, state: 'WATCH' as const },
    { id: 'failures', label: 'SYSTEM FAILURES', value: summary.systemFailures, state: summary.systemFailures > 0 ? ('AT_RISK' as const) : ('HEALTHY' as const) },
    { id: 'spend', label: 'SPEND WATCH', value: summary.spendWatch, state: 'WATCH' as const },
    { id: 'margin', label: 'MARGIN HEALTH', value: summary.marginWatch, state: 'WATCH' as const },
  ];

  const founderActions = allActions.filter((a) => a.queueId === 'NEEDS_YOU_NOW' || a.assignee === 'FOUNDER');
  const executiveBrief = generateExecutiveBrief(
    summary,
    founderActions,
    incidents,
    changedSinceLastCheck,
    whatSystemHandled,
  );

  return {
    summary,
    topSignals,
    queues,
    providerIncidents: incidents,
    executiveBrief,
    changedSinceLastCheck,
  };
}
