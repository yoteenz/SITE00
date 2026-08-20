/** Supabase persistence for external connections + Sprint 03 entities */

import { getSupabaseAdmin } from '../../supabase.js';
import type { ExternalConnectionRow, MetricObservationInput, SafeConnectionView } from './types.js';
import { buildCapabilityMap, getProviderDefinition } from './registry.js';
import type { ConnectionHealth, ConnectionStatus, ProviderCapability } from './types.js';

function mapConnectionRow(row: Record<string, unknown>): ExternalConnectionRow {
  return {
    ...row,
    granted_capabilities: (row.granted_capabilities as string[]) ?? [],
    supported_capabilities: (row.supported_capabilities as string[]) ?? [],
    granted_scopes: (row.granted_scopes as string[]) ?? [],
    metadata: (row.metadata as Record<string, unknown>) ?? {},
  } as ExternalConnectionRow;
}

export function toSafeConnectionView(row: ExternalConnectionRow): SafeConnectionView {
  const def = getProviderDefinition(row.provider_key ?? '');
  const supported = (row.supported_capabilities.length
    ? row.supported_capabilities
    : def?.supportedCapabilities ?? []) as ProviderCapability[];
  const granted = row.granted_capabilities as ProviderCapability[];
  const status = (row.status ?? row.connection_state ?? 'NOT_CONNECTED') as ConnectionStatus;
  const health = (row.health ?? 'UNKNOWN') as ConnectionHealth;

  let recommendedAction: string | null = null;
  if (status === 'AUTHORIZATION_REQUIRED') recommendedAction = 'Complete provider authorization';
  else if (status === 'REAUTH_REQUIRED') recommendedAction = 'Reauthorize provider';
  else if (row.credential_state === 'REQUIRES_SECURE_CONFIGURATION') recommendedAction = 'Configure secure credentials server-side';
  else if (health === 'DEGRADED') recommendedAction = 'Verify connection and sync';

  return {
    id: row.id,
    organizationId: row.organization_id,
    providerKey: row.provider_key ?? def?.providerKey ?? 'unknown',
    providerCategory: (row.provider_category ?? def?.category ?? 'OTHER') as SafeConnectionView['providerCategory'],
    displayName: row.display_name ?? row.logical_name,
    status,
    health,
    externalAccountName: row.external_account_name,
    externalPropertyName: row.external_property_name,
    grantedCapabilities: granted,
    supportedCapabilities: supported,
    capabilityMap: buildCapabilityMap(supported, granted),
    grantedScopes: row.granted_scopes,
    lastVerifiedAt: row.last_verified_at,
    lastSyncAt: row.last_sync_at,
    lastErrorCode: row.last_error_code,
    lastErrorMessage: row.last_error_message,
    credentialState: row.credential_state ?? 'NOT_CONFIGURED',
    recommendedAction,
  };
}

export async function loadConnections(orgId?: string): Promise<ExternalConnectionRow[]> {
  let q = getSupabaseAdmin().from('site00_external_connections').select('*');
  if (orgId) q = q.eq('organization_id', orgId);
  const { data, error } = await q.order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapConnectionRow);
}

export async function loadConnectionById(id: string, orgId?: string): Promise<ExternalConnectionRow | undefined> {
  let q = getSupabaseAdmin().from('site00_external_connections').select('*').eq('id', id);
  if (orgId) q = q.eq('organization_id', orgId);
  const { data, error } = await q.maybeSingle();
  if (error) throw error;
  return data ? mapConnectionRow(data) : undefined;
}

export async function upsertConnection(row: Record<string, unknown>): Promise<ExternalConnectionRow> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_external_connections')
    .upsert(row)
    .select('*')
    .single();
  if (error) throw error;
  return mapConnectionRow(data);
}

export async function insertConnectionEvent(event: Record<string, unknown>): Promise<void> {
  const { error } = await getSupabaseAdmin().from('site00_connection_events').insert(event);
  if (error) throw error;
}

export async function loadConnectionEvents(connectionId: string, limit = 20) {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_connection_events')
    .select('*')
    .eq('connection_id', connectionId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function startSyncRun(row: Record<string, unknown>) {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_connection_sync_runs')
    .insert(row)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function completeSyncRun(id: string, patch: Record<string, unknown>) {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_connection_sync_runs')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function insertMetricObservations(rows: MetricObservationInput[]): Promise<number> {
  if (!rows.length) return 0;
  const dbRows = rows.map((r) => ({
    organization_id: r.organizationId,
    connection_id: r.connectionId,
    sync_run_id: r.syncRunId ?? null,
    campaign_id: r.campaignId ?? null,
    calendar_item_id: r.calendarItemId ?? null,
    provider_key: r.providerKey,
    external_account_id: r.externalAccountId ?? null,
    external_property_id: r.externalPropertyId ?? null,
    external_object_id: r.externalObjectId ?? null,
    metric_key: r.metricKey,
    metric_value: r.metricValue,
    metric_unit: r.metricUnit ?? null,
    dimension: r.dimension ?? null,
    dimension_value: r.dimensionValue ?? null,
    period_start: r.periodStart ?? null,
    period_end: r.periodEnd ?? null,
    attribution_state: r.attributionState ?? 'UNATTRIBUTED',
    confidence: r.confidence ?? 'MEDIUM',
    source_metadata: r.sourceMetadata,
  }));
  const { error } = await getSupabaseAdmin().from('site00_marketing_metric_observations').insert(dbRows);
  if (error) throw error;
  return dbRows.length;
}

export async function loadPilotConfig(orgId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_evolve_pilot_config')
    .select('*')
    .eq('organization_id', orgId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertPilotConfig(row: Record<string, unknown>) {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_evolve_pilot_config')
    .upsert(row, { onConflict: 'organization_id' })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function loadDistributionJobs(orgId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_distribution_jobs')
    .select('*')
    .eq('organization_id', orgId);
  if (error) throw error;
  return data ?? [];
}

export async function insertDistributionJob(row: Record<string, unknown>) {
  const { data, error } = await getSupabaseAdmin().from('site00_distribution_jobs').insert(row).select('*').single();
  if (error) throw error;
  return data;
}

export async function verifySprint03Schema(): Promise<{ ok: boolean; missing: string[] }> {
  const tables = [
    'site00_evolve_pilot_config',
    'site00_connection_events',
    'site00_connection_sync_runs',
    'site00_marketing_metric_observations',
    'site00_distribution_jobs',
    'site00_external_publications',
  ];
  const missing: string[] = [];
  for (const t of tables) {
    const { error } = await getSupabaseAdmin().from(t).select('id').limit(1);
    if (error) missing.push(t);
  }
  return { ok: missing.length === 0, missing };
}

/** Safe client payload — strips secrets */
export function sanitizeConnectionForClient(row: ExternalConnectionRow): SafeConnectionView {
  return toSafeConnectionView(row);
}

export function assertNoSecrets(payload: Record<string, unknown>): void {
  const forbidden = ['access_token', 'refresh_token', 'client_secret', 'api_key', 'secret'];
  for (const key of Object.keys(payload)) {
    if (forbidden.some((f) => key.toLowerCase().includes(f))) {
      throw new Error('Credential leakage blocked');
    }
  }
}
