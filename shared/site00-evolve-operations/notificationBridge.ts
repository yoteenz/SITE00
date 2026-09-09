/**
 * Operational notification integration — deduplication, grouped incidents.
 */

import type { EvolveOperationalAlertType, EvolveOperationalAction, EvolveProviderIncident } from './types.js';

export type OperationalNotification = {
  id: string;
  type: EvolveOperationalAlertType;
  title: string;
  message: string;
  route: string | null;
  dedupeKey: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  audience: 'FOUNDER' | 'INTERNAL' | 'CLIENT';
  createdAt: string;
};

const sentKeys = new Map<string, number>();
const COOLDOWN_MS = 4 * 60 * 60 * 1000;

/** Test-only reset for dedupe state. */
export function resetOperationalNotificationDedupe(): void {
  sentKeys.clear();
}

export function buildOperationalNotifications(
  actions: EvolveOperationalAction[],
  incidents: EvolveProviderIncident[],
  audience: 'FOUNDER' | 'INTERNAL' | 'CLIENT',
): OperationalNotification[] {
  const out: OperationalNotification[] = [];

  for (const incident of incidents) {
    if (!incident.groupedAlertSent) continue;
    out.push({
      id: `notif-inc-${incident.id}`,
      type: 'SYSTEM_BLOCKED',
      title: 'PROVIDER INCIDENT',
      message: `${incident.affectedJobCount} JOBS AFFECTED · SYSTEM RETRIES PAUSED · OPEN INCIDENT`,
      route: `/control/evolve-operations?incident=${incident.id}`,
      dedupeKey: `provider-incident:${incident.providerId}`,
      priority: 'URGENT',
      audience: 'FOUNDER',
      createdAt: incident.createdAt,
    });
  }

  for (const action of actions) {
    if (action.queueId === 'NEEDS_YOU_NOW' || action.queueId === 'HIGH_VALUE_CLIENTS') {
      const type: EvolveOperationalAlertType =
        action.queueId === 'HIGH_VALUE_CLIENTS' ? 'VIP_GROWTH_PARTNER_RISK' : 'ACTION_REQUIRED';
      out.push({
        id: `notif-${action.id}`,
        type,
        title: action.title,
        message: action.summary,
        route: action.route,
        dedupeKey: `action:${action.projectId}:${action.queueId}`,
        priority: action.priority.band === 'CRITICAL' ? 'URGENT' : 'HIGH',
        audience,
        createdAt: action.createdAt,
      });
    }
    if (action.queueId === 'SPEND_WATCH') {
      out.push({
        id: `notif-spend-${action.id}`,
        type: 'SPEND_WARNING',
        title: 'SPEND WATCH',
        message: action.summary,
        route: action.route,
        dedupeKey: `spend:${action.projectId}`,
        priority: 'NORMAL',
        audience,
        createdAt: action.createdAt,
      });
    }
  }

  return dedupeNotifications(out);
}

export function dedupeNotifications(notifications: OperationalNotification[], now = Date.now()): OperationalNotification[] {
  const seen = new Set<string>();
  const result: OperationalNotification[] = [];

  for (const n of notifications) {
    if (seen.has(n.dedupeKey)) continue;
    seen.add(n.dedupeKey);
    const lastSent = sentKeys.get(n.dedupeKey);
    if (lastSent != null && now - lastSent < COOLDOWN_MS) continue;
    sentKeys.set(n.dedupeKey, now);
    result.push(n);
  }

  return result;
}

export function toClientSafeNotifications(notifications: OperationalNotification[]): OperationalNotification[] {
  const clientTypes: EvolveOperationalAlertType[] = [
    'SPEND_WARNING',
    'ACTION_REQUIRED',
    'CLIENT_WAITING',
    'CREDIT_LIMIT',
  ];
  return notifications.filter((n) => n.audience === 'CLIENT' || clientTypes.includes(n.type));
}
