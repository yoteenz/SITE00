/** Performance intelligence — evidence-backed snapshots and insights */

import { randomUUID } from 'node:crypto';
import { orgIdFromSlug } from '../orgRegistry.js';
import { useMemoryConnections, memObservations } from './connectionService.js';
import { buildEvidenceInsight, gradeInsightConfidence } from './insightEngine.js';
import { getSupabaseAdmin } from '../../supabase.js';
import type { InsightConfidence } from './types.js';

export type SnapshotCoverage = 'MEASURED' | 'PARTIALLY_MEASURED' | 'UNMEASURED' | 'STALE' | 'ERROR';

export type PerformanceSnapshotView = {
  id: string;
  organizationId: string;
  scope: string;
  scopeId: string | null;
  coverage: SnapshotCoverage;
  metrics: Record<string, number | null | 'NOT_AVAILABLE'>;
  provenance: Array<{ connectionId: string; providerKey: string; metricKey: string; periodEnd: string | null }>;
  generatedAt: string;
};

async function loadObservations(orgId: string, connectionId?: string) {
  if (useMemoryConnections()) {
    return memObservations.filter(
      (o) => o.organization_id === orgId && (!connectionId || o.connection_id === connectionId),
    );
  }
  let q = getSupabaseAdmin()
    .from('site00_marketing_metric_observations')
    .select('*')
    .eq('organization_id', orgId)
    .order('period_end', { ascending: false })
    .limit(200);
  if (connectionId) q = q.eq('connection_id', connectionId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function buildPerformanceSnapshot(
  orgSlug: string,
  opts?: { campaignId?: string; connectionId?: string },
): Promise<PerformanceSnapshotView> {
  const orgId = orgIdFromSlug(orgSlug)!;
  const observations = await loadObservations(orgId, opts?.connectionId);
  const filtered = opts?.campaignId
    ? observations.filter((o) => o.campaign_id === opts.campaignId)
    : observations;

  const metrics: Record<string, number | null | 'NOT_AVAILABLE'> = {};
  const provenance: PerformanceSnapshotView['provenance'] = [];
  const keys = ['SESSIONS', 'USERS', 'IMPRESSIONS', 'ENGAGEMENTS', 'CLICKS', 'SEARCH_IMPRESSIONS'];

  for (const key of keys) {
    const match = filtered.find((o) => o.metric_key === key);
    if (!match) {
      metrics[key] = 'NOT_AVAILABLE';
    } else if (match.metric_value === null || match.metric_value === undefined) {
      metrics[key] = 'NOT_AVAILABLE';
    } else {
      metrics[key] = Number(match.metric_value);
      provenance.push({
        connectionId: String(match.connection_id ?? ''),
        providerKey: String(match.provider_key),
        metricKey: key,
        periodEnd: match.period_end ? String(match.period_end) : null,
      });
    }
  }

  const measuredCount = Object.values(metrics).filter((v) => typeof v === 'number').length;
  let coverage: SnapshotCoverage = 'UNMEASURED';
  if (measuredCount === keys.length) coverage = 'MEASURED';
  else if (measuredCount > 0) coverage = 'PARTIALLY_MEASURED';

  const latestEnd = provenance[0]?.periodEnd;
  if (latestEnd) {
    const ageHours = (Date.now() - new Date(latestEnd).getTime()) / 3600000;
    if (ageHours > 168 && measuredCount > 0) coverage = 'STALE';
  }

  return {
    id: randomUUID(),
    organizationId: orgId,
    scope: opts?.campaignId ? 'campaign' : 'organization',
    scopeId: opts?.campaignId ?? null,
    coverage,
    metrics,
    provenance,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateEvidenceInsights(orgSlug: string, connectionIds: string[]) {
  const orgId = orgIdFromSlug(orgSlug)!;
  const observations = await loadObservations(orgId);
  if (observations.length < 2) {
    return [
      buildEvidenceInsight({
        title: 'Insufficient measurement evidence',
        summary: 'Connect analytics and run sync before generating performance insights.',
        evidence: [],
        confidence: 'INSUFFICIENT_EVIDENCE',
        connectionIds,
      }),
    ];
  }

  const confidence = gradeInsightConfidence({
    sampleSize: observations.length,
    measurementComplete: observations.some((o) => o.metric_key === 'SESSIONS'),
    dataFreshnessHours: 24,
    attributionConfidence: 'UNCERTAIN',
  });

  return [
    buildEvidenceInsight({
      title: 'Measurement evidence ingested',
      summary: `${observations.length} normalized metric observation(s) available for review.`,
      evidence: observations.slice(0, 5).map((o) => ({
        metricKey: o.metric_key,
        value: o.metric_value,
        provider: o.provider_key,
        source: o.source_metadata,
      })),
      confidence,
      connectionIds,
    }),
  ];
}

export function attributeCampaignEvidence(
  campaignId: string | null,
  utmCampaign?: string | null,
  externalCampaignId?: string | null,
): 'ATTRIBUTED' | 'UNATTRIBUTED' | 'ATTRIBUTION_UNCERTAIN' {
  if (campaignId) return 'ATTRIBUTED';
  if (utmCampaign || externalCampaignId) return 'ATTRIBUTION_UNCERTAIN';
  return 'UNATTRIBUTED';
}

export function contentBrainLearningBoundary() {
  return {
    flow: 'Evidence → Insight → Suggested Learning → Human Review → Canonical Content Brain update',
    autoApply: false,
    status: 'SUGGESTED_ONLY',
  };
}
