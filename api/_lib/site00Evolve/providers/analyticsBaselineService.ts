/** Analytics baseline — one initial sync when read capability exists */

import { orgIdFromSlug } from '../orgRegistry.js';
import { useMemoryConnections, memConnections, memObservations } from './connectionService.js';
import { runConnectionSync } from './syncService.js';
import * as db from './connectionStore.js';
import { randomUUID } from 'node:crypto';

export async function runAnalyticsBaseline(orgSlug: string, connectionId: string) {
  const orgId = orgIdFromSlug(orgSlug)!;

  let conn: Record<string, unknown> | undefined;
  if (useMemoryConnections()) {
    conn = memConnections.find((c) => c.id === connectionId && c.organization_id === orgId) as Record<string, unknown> | undefined;
  } else {
    conn = (await db.loadConnectionById(connectionId, orgId)) as Record<string, unknown> | undefined;
  }
  if (!conn) throw new Error('Cross-organization access denied');

  const analyticsCap = String(conn.analytics_capability ?? '');
  const granted = (conn.granted_capabilities as string[]) ?? [];
  const canRead =
    analyticsCap === 'AVAILABLE' ||
    granted.includes('READ_ANALYTICS') ||
    granted.includes('READ_CONTENT_METRICS');

  if (!canRead) {
    return {
      attempted: true,
      status: 'UNAVAILABLE',
      measurementState: 'UNMEASURED',
      message: 'READ_ANALYTICS capability not granted — baseline not attempted',
      syncRunId: null,
      observations: [],
    };
  }

  if (useMemoryConnections()) {
    const syncRunId = randomUUID();
    const periodEnd = new Date().toISOString();
    const periodStart = new Date(Date.now() - 30 * 86400000).toISOString();
    const obs = {
      id: randomUUID(),
      organization_id: orgId,
      connection_id: connectionId,
      sync_run_id: syncRunId,
      provider_key: String(conn.provider_key ?? 'meta_instagram'),
      metric_key: 'IMPRESSIONS',
      metric_value: 0,
      period_start: periodStart,
      period_end: periodEnd,
      attribution_state: 'UNATTRIBUTED',
      source_metadata: { baseline: true, provenance: 'INITIAL_BASELINE_SYNC' },
    };
    memObservations.push(obs);
    return {
      attempted: true,
      status: 'COMPLETED',
      measurementState: 'BASELINE_CAPTURED',
      message: 'Initial analytics baseline sync completed',
      syncRunId,
      observations: [obs],
      dateRange: { start: periodStart, end: periodEnd },
    };
  }

  const sync = await runConnectionSync(orgSlug, connectionId);
  return {
    attempted: true,
    status: sync.state,
    measurementState: sync.recordsNormalized > 0 ? 'BASELINE_CAPTURED' : 'UNMEASURED',
    message: sync.recordsNormalized > 0 ? 'Initial analytics baseline sync completed' : 'Sync returned no observations',
    syncRunId: sync.syncRunId,
    observations: [],
    dateRange: null,
  };
}
