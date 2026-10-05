/**
 * Provider incident grouping — pause unsafe retries, dedupe alerts.
 */

import type { EvolveFailureClass, EvolveProviderIncident, EvolveExplainReason } from './types.js';

export type ProviderFailureRecord = {
  jobId: string;
  providerId: string;
  providerName: string;
  failureClass: EvolveFailureClass;
  timestamp: string;
};

export function detectProviderIncidents(
  failures: ProviderFailureRecord[],
  minJobs = 25,
): EvolveProviderIncident[] {
  const byProvider = new Map<string, ProviderFailureRecord[]>();
  for (const f of failures) {
    const list = byProvider.get(f.providerId) ?? [];
    list.push(f);
    byProvider.set(f.providerId, list);
  }

  const incidents: EvolveProviderIncident[] = [];
  for (const [providerId, records] of byProvider) {
    if (records.length < minJobs) continue;
    const reasons: EvolveExplainReason[] = [
      { code: 'PROVIDER_OUTAGE', label: `${records.length} JOBS FAILED WITH SAME PROVIDER` },
      { code: 'RETRIES_PAUSED', label: 'SYSTEM RETRIES PAUSED' },
    ];
    incidents.push({
      id: `inc-${providerId}-${Date.now()}`,
      providerId,
      providerName: records[0]?.providerName ?? providerId,
      affectedJobCount: records.length,
      failureClass: records[0]?.failureClass ?? 'UNKNOWN_FAILURE',
      status: 'ACTIVE',
      unsafeRetriesPaused: true,
      groupedAlertSent: true,
      reasons,
      createdAt: records[0]?.timestamp ?? new Date().toISOString(),
      resolvedAt: null,
    });
  }
  return incidents;
}

export function isProviderIncidentActive(incidents: EvolveProviderIncident[], providerId: string): boolean {
  return incidents.some((i) => i.providerId === providerId && i.status === 'ACTIVE' && i.unsafeRetriesPaused);
}
