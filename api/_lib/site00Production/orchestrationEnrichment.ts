/**
 * Merge orchestration dashboard snapshot into Control Command payload.
 * Orchestration is authoritative for portfolio, command queue, and external health.
 */

import type { ControlCommandPayload, ControlPriorityItem, ControlPrioritySeverity } from '../../site00Production/controlCommand.js';
import { getOrchestrationDashboardSnapshot } from '../site00Orchestration/dashboardAggregator.js';
import { orchestrationTablesExist } from '../site00Orchestration/supabaseStore.js';

function categoryToSeverity(category: string): ControlPrioritySeverity {
  switch (category) {
    case 'NEEDS_YOU':
      return 'CRITICAL';
    case 'BLOCKED':
      return 'BLOCKED';
    case 'RUNNING':
      return 'ACTION';
    case 'UPCOMING':
      return 'INFO';
    case 'POST_LAUNCH':
      return 'MILESTONE';
    default:
      return 'INFO';
  }
}

function formatClock(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
  } catch {
    return '';
  }
}

export async function enrichControlCommandWithOrchestration(
  base: ControlCommandPayload,
  operatorEmail?: string,
): Promise<ControlCommandPayload> {
  if (!(await orchestrationTablesExist())) {
    return { ...base, orchestration: null };
  }

  const snapshot = await getOrchestrationDashboardSnapshot();
  const now = new Date().toISOString();

  const orchestrationPriority: ControlPriorityItem[] = snapshot.commandQueue.slice(0, 25).map((item) => ({
    id: item.id,
    severity: categoryToSeverity(item.category),
    projectId: item.organizationSlug,
    projectName: item.organizationName,
    projectSlug: item.organizationSlug,
    title: `${item.actionLabel}: ${item.requirementTitle}`.toUpperCase(),
    detail: `[${item.category}] ${item.reason}`.toUpperCase(),
    timestamp: now,
    clockTime: formatClock(now),
    route: item.route,
    sortWeight: item.priority,
  }));

  for (const ny of snapshot.needsYou) {
    orchestrationPriority.unshift({
      id: ny.id,
      severity: 'CRITICAL',
      projectId: ny.organizationSlug,
      projectName: ny.organizationName,
      projectSlug: ny.organizationSlug,
      title: ny.title.toUpperCase(),
      detail: ny.reason.toUpperCase(),
      timestamp: now,
      clockTime: formatClock(now),
      route: ny.route,
      sortWeight: ny.priority,
    });
  }

  orchestrationPriority.sort((a, b) => a.sortWeight - b.sortWeight);

  const needsYouCount = snapshot.needsYou.length;
  const blockedCount = snapshot.commandQueue.filter((c) => c.category === 'BLOCKED').length;
  const deferredCount = snapshot.portfolio.reduce((n, p) => n + p.deferredCount, 0);
  const pendingRecon = snapshot.reconciliationInbox.length;

  const connectionOverall =
    snapshot.connections.some((c) => c.state === 'UNAVAILABLE')
      ? 'CRITICAL'
      : snapshot.connections.some((c) => c.state === 'PARTIAL' || c.state === 'STALE')
        ? 'DEGRADED'
        : snapshot.connections.every((c) => c.state === 'CONNECTED')
          ? 'OPERATIONAL'
          : 'UNKNOWN';

  const externalSystems = snapshot.connections.map((c) => ({
    id: c.id,
    label: `${c.organizationName}: ${c.logicalName}`.toUpperCase(),
    state: c.state,
    detail: c.externalIdentifier ?? c.errorReason ?? c.state,
  }));

  const operatorLocal = operatorEmail?.split('@')[0]?.replace(/\./g, ' ').toUpperCase() ?? base.operator.displayName;

  return {
    ...base,
    operator: { ...base.operator, displayName: operatorLocal },
    metrics: [
      { id: 'needs-you', label: 'NEEDS YOU', sublabel: 'DECISIONS', value: needsYouCount, route: '/admin/site00/reconciliation' },
      { id: 'blocked', label: 'BLOCKED', sublabel: 'LAUNCH', value: blockedCount, route: '/admin/site00' },
      { id: 'recon', label: 'RECONCILIATION', sublabel: 'PENDING', value: pendingRecon, route: '/admin/site00/reconciliation' },
      { id: 'portfolio', label: 'PORTFOLIO', sublabel: 'ORGS', value: snapshot.portfolio.length + snapshot.infrastructure.length, route: '/admin/site00/projects' },
      { id: 'deferred', label: 'EVOLVE', sublabel: 'DEFERRED', value: deferredCount, route: '/admin/site00' },
    ],
    priorityQueue: orchestrationPriority.slice(0, 20),
    activity: snapshot.activity.length > 0 ? snapshot.activity : base.activity,
    systemHealth: {
      overall: connectionOverall,
      summary:
        connectionOverall === 'OPERATIONAL'
          ? 'ALL ORCHESTRATION CONNECTIONS HEALTHY'
          : connectionOverall === 'DEGRADED'
            ? 'PARTIAL OR STALE CONNECTIONS'
            : 'CONNECTION ISSUES DETECTED',
      systems: externalSystems.length > 0 ? externalSystems : base.systemHealth.systems,
    },
    alertCount: needsYouCount + blockedCount,
    orchestration: snapshot,
  };
}
