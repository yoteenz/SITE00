/** Supabase-backed EVOLVE marketing persistence */

import { getSupabaseAdmin } from '../supabase.js';
import type {
  ContentCalendarItemRow,
  MarketingApprovalRow,
  MarketingAssessmentRow,
  MarketingCampaignRow,
  MarketingChannelRow,
  MarketingInsightRow,
  MarketingManifestItemRow,
  MarketingManifestRow,
  MarketingObjectiveRow,
  MarketingProfileRow,
  StudioProductionRequestRow,
} from './types.js';

const EVOLVE_TABLE_PROBE = 'site00_marketing_profiles';

export async function evolveTablesExist(): Promise<boolean> {
  try {
    const { error } = await getSupabaseAdmin().from(EVOLVE_TABLE_PROBE).select('id').limit(1);
    if (error) return false;
    const { error: e2 } = await getSupabaseAdmin().from('site00_campaign_events').select('id').limit(1);
    return !e2;
  } catch {
    return false;
  }
}

function mapProfile(row: Record<string, unknown>): MarketingProfileRow {
  return {
    ...row,
    secondary_objectives: (row.secondary_objectives as string[]) ?? [],
    metadata: (row.metadata as Record<string, unknown>) ?? {},
  } as MarketingProfileRow;
}

function mapCampaign(row: Record<string, unknown>): MarketingCampaignRow {
  return {
    ...row,
    channels: (row.channels as string[]) ?? [],
    metadata: (row.metadata as Record<string, unknown>) ?? {},
  } as MarketingCampaignRow;
}

function mapAssessment(row: Record<string, unknown>): MarketingAssessmentRow {
  return {
    ...row,
    health_dimensions: (row.health_dimensions as Record<string, string>) ?? {},
    objective_alignment: (row.objective_alignment as Record<string, unknown>) ?? {},
    channel_coverage: (row.channel_coverage as Record<string, unknown>) ?? {},
    content_readiness: (row.content_readiness as Record<string, unknown>) ?? {},
    production_readiness: (row.production_readiness as Record<string, unknown>) ?? {},
    measurement_readiness: (row.measurement_readiness as Record<string, unknown>) ?? {},
    blockers: (row.blockers as MarketingAssessmentRow['blockers']) ?? [],
    opportunities: (row.opportunities as MarketingAssessmentRow['opportunities']) ?? [],
    next_best_actions: (row.next_best_actions as MarketingAssessmentRow['next_best_actions']) ?? [],
    inputs_snapshot: (row.inputs_snapshot as Record<string, unknown>) ?? {},
  } as MarketingAssessmentRow;
}

export async function loadProfile(orgId: string): Promise<MarketingProfileRow | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_marketing_profiles')
    .select('*')
    .eq('organization_id', orgId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfile(data) : undefined;
}

export async function upsertProfile(row: MarketingProfileRow): Promise<MarketingProfileRow> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_marketing_profiles')
    .upsert(row, { onConflict: 'organization_id' })
    .select('*')
    .single();
  if (error) throw error;
  return mapProfile(data);
}

export async function updateProfileCommercialMetadataDb(
  orgId: string,
  patch: Record<string, unknown>,
): Promise<MarketingProfileRow | undefined> {
  const existing = await loadProfile(orgId);
  if (!existing) return undefined;
  const existingCommercial = (existing.metadata?.commercial as Record<string, unknown>) ?? {};
  const metadata = { ...existing.metadata, commercial: { ...existingCommercial, ...patch } };
  return upsertProfile({ ...existing, metadata });
}

export async function loadChannels(orgId: string): Promise<MarketingChannelRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_marketing_channels')
    .select('*')
    .eq('organization_id', orgId);
  if (error) throw error;
  return (data ?? []).map((r) => ({ ...r, metadata: r.metadata ?? {} })) as MarketingChannelRow[];
}

export async function upsertChannels(rows: MarketingChannelRow[]): Promise<void> {
  if (!rows.length) return;
  const { error } = await getSupabaseAdmin()
    .from('site00_marketing_channels')
    .upsert(rows, { onConflict: 'organization_id,channel_key' });
  if (error) throw error;
}

export async function loadObjectives(orgId: string): Promise<MarketingObjectiveRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_marketing_objectives')
    .select('*')
    .eq('organization_id', orgId);
  if (error) throw error;
  return (data ?? []).map((r) => ({ ...r, metadata: r.metadata ?? {} })) as MarketingObjectiveRow[];
}

export async function insertObjectiveDb(row: MarketingObjectiveRow): Promise<MarketingObjectiveRow> {
  const { data, error } = await getSupabaseAdmin().from('site00_marketing_objectives').insert(row).select('*').single();
  if (error) throw error;
  return data as MarketingObjectiveRow;
}

export async function updateObjectiveDb(id: string, patch: Partial<MarketingObjectiveRow>): Promise<MarketingObjectiveRow | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_marketing_objectives')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data as MarketingObjectiveRow | undefined;
}

export async function loadCampaigns(orgId: string): Promise<MarketingCampaignRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_marketing_campaigns')
    .select('*')
    .eq('organization_id', orgId);
  if (error) throw error;
  return (data ?? []).map(mapCampaign);
}

export async function loadCampaignById(id: string): Promise<MarketingCampaignRow | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_marketing_campaigns')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCampaign(data) : undefined;
}

export async function insertCampaignDb(row: MarketingCampaignRow): Promise<MarketingCampaignRow> {
  const { data, error } = await getSupabaseAdmin().from('site00_marketing_campaigns').insert(row).select('*').single();
  if (error) throw error;
  return mapCampaign(data);
}

export async function updateCampaignDb(id: string, patch: Partial<MarketingCampaignRow>): Promise<MarketingCampaignRow | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_marketing_campaigns')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data ? mapCampaign(data) : undefined;
}

export async function insertCampaignEventDb(event: {
  campaign_id: string;
  event_type: string;
  actor_email?: string | null;
  summary: string;
  before_state?: unknown;
  after_state?: unknown;
}): Promise<void> {
  const { error } = await getSupabaseAdmin().from('site00_campaign_events').insert(event);
  if (error) throw error;
}

export async function loadLatestAssessment(orgId: string): Promise<MarketingAssessmentRow | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_marketing_assessments')
    .select('*')
    .eq('organization_id', orgId)
    .order('assessed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapAssessment(data) : undefined;
}

export async function insertAssessmentDb(row: MarketingAssessmentRow): Promise<MarketingAssessmentRow> {
  const { data, error } = await getSupabaseAdmin().from('site00_marketing_assessments').insert(row).select('*').single();
  if (error) throw error;
  return mapAssessment(data);
}

export async function loadActiveManifest(orgId: string): Promise<MarketingManifestRow | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_marketing_manifests')
    .select('*')
    .eq('organization_id', orgId)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return data as MarketingManifestRow | undefined;
}

export async function loadManifestItems(manifestId: string): Promise<MarketingManifestItemRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_marketing_manifest_items')
    .select('*')
    .eq('manifest_id', manifestId)
    .order('sort_order');
  if (error) throw error;
  return (data ?? []) as MarketingManifestItemRow[];
}

export async function upsertManifestDb(manifest: MarketingManifestRow, items: MarketingManifestItemRow[]): Promise<void> {
  await getSupabaseAdmin()
    .from('site00_marketing_manifests')
    .update({ is_active: false, manifest_state: 'SUPERSEDED' })
    .eq('organization_id', manifest.organization_id)
    .eq('is_active', true);

  const { error: mErr } = await getSupabaseAdmin().from('site00_marketing_manifests').upsert(manifest);
  if (mErr) throw mErr;
  if (items.length) {
    const { error: iErr } = await getSupabaseAdmin().from('site00_marketing_manifest_items').upsert(items);
    if (iErr) throw iErr;
  }
}

export async function approveManifestDb(manifestId: string, approvedBy: string): Promise<MarketingManifestRow | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_marketing_manifests')
    .update({
      approval_state: 'APPROVED',
      manifest_state: 'ACTIVE',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    })
    .eq('id', manifestId)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data as MarketingManifestRow | null;
}

export async function loadCalendar(orgId: string): Promise<ContentCalendarItemRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_content_calendar_items')
    .select('*')
    .eq('organization_id', orgId)
    .order('planned_date');
  if (error) throw error;
  return (data ?? []).map((r) => ({
    ...r,
    asset_refs: r.asset_refs ?? [],
    copy_refs: r.copy_refs ?? [],
    metadata: r.metadata ?? {},
  })) as ContentCalendarItemRow[];
}

export async function loadCalendarItemById(id: string): Promise<ContentCalendarItemRow | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_content_calendar_items')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as ContentCalendarItemRow | undefined;
}

export async function insertCalendarItemDb(row: ContentCalendarItemRow): Promise<ContentCalendarItemRow> {
  const { data, error } = await getSupabaseAdmin().from('site00_content_calendar_items').insert(row).select('*').single();
  if (error) throw error;
  return data as ContentCalendarItemRow;
}

export async function loadEmailItems(orgId: string): Promise<Array<Record<string, unknown>>> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_marketing_email_items')
    .select('*')
    .eq('organization_id', orgId);
  if (error) throw error;
  return data ?? [];
}

export async function loadSocialItems(orgId: string): Promise<Array<Record<string, unknown>>> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_social_content_items')
    .select('*')
    .eq('organization_id', orgId);
  if (error) throw error;
  return data ?? [];
}

export async function loadProductionRequests(orgId: string): Promise<StudioProductionRequestRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_studio_production_requests')
    .select('*')
    .eq('organization_id', orgId);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    ...r,
    deliverables: r.deliverables ?? [],
    canon_refs: r.canon_refs ?? [],
    reference_refs: r.reference_refs ?? [],
    asset_refs: r.asset_refs ?? [],
    metadata: r.metadata ?? {},
  })) as StudioProductionRequestRow[];
}

export async function insertProductionRequestDb(row: StudioProductionRequestRow): Promise<StudioProductionRequestRow> {
  const { data, error } = await getSupabaseAdmin().from('site00_studio_production_requests').insert(row).select('*').single();
  if (error) throw error;
  return data as StudioProductionRequestRow;
}

export async function loadPendingApprovals(orgId?: string): Promise<MarketingApprovalRow[]> {
  let q = getSupabaseAdmin().from('site00_marketing_approvals').select('*').eq('status', 'PENDING');
  if (orgId) q = q.eq('organization_id', orgId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((r) => ({ ...r, metadata: r.metadata ?? {} })) as MarketingApprovalRow[];
}

export async function insertApprovalDb(row: MarketingApprovalRow): Promise<MarketingApprovalRow> {
  const { data, error } = await getSupabaseAdmin().from('site00_marketing_approvals').insert(row).select('*').single();
  if (error) throw error;
  return data as MarketingApprovalRow;
}

export async function decideApprovalDb(
  id: string,
  status: 'APPROVED' | 'REJECTED',
  decidedBy: string,
  reason?: string,
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('site00_marketing_approvals')
    .update({
      status,
      decided_by: decidedBy,
      decided_at: new Date().toISOString(),
      reason: reason ?? null,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function loadInsights(orgId: string): Promise<MarketingInsightRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_marketing_insights')
    .select('*')
    .eq('organization_id', orgId);
  if (error) throw error;
  return (data ?? []).map((r) => ({ ...r, evidence: r.evidence ?? [], metadata: r.metadata ?? {} })) as MarketingInsightRow[];
}

export async function insertInsightDb(row: MarketingInsightRow): Promise<MarketingInsightRow> {
  const { data, error } = await getSupabaseAdmin().from('site00_marketing_insights').insert(row).select('*').single();
  if (error) throw error;
  return data as MarketingInsightRow;
}

export async function loadMarketingPlans(orgId: string): Promise<Array<Record<string, unknown>>> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_marketing_plans')
    .select('*')
    .eq('organization_id', orgId);
  if (error) throw error;
  return data ?? [];
}

export async function countProfiles(): Promise<number> {
  const { count, error } = await getSupabaseAdmin()
    .from('site00_marketing_profiles')
    .select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function verifyOrgAccess(orgId: string, recordOrgId: string): Promise<boolean> {
  return orgId === recordOrgId;
}

export async function loadContentBrain(orgId: string): Promise<Array<Record<string, unknown>>> {
  const { data, error } = await getSupabaseAdmin()
    .from('site00_content_brain_entries')
    .select('*')
    .eq('organization_id', orgId);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    ...r,
    entry_class: (r.metadata as Record<string, unknown>)?.entry_class ?? 'REFERENCE',
  }));
}

export async function insertContentBrainDb(row: Record<string, unknown>): Promise<void> {
  const { error } = await getSupabaseAdmin().from('site00_content_brain_entries').insert(row);
  if (error) throw error;
}

export const EVOLVE_EXPECTED_TABLES = [
  'site00_marketing_profiles',
  'site00_marketing_objectives',
  'site00_marketing_channels',
  'site00_marketing_assessments',
  'site00_marketing_manifests',
  'site00_marketing_manifest_items',
  'site00_marketing_campaigns',
  'site00_campaign_objectives',
  'site00_campaign_channels',
  'site00_campaign_deliverables',
  'site00_campaign_dependencies',
  'site00_campaign_events',
  'site00_content_calendar_items',
  'site00_marketing_email_items',
  'site00_social_content_items',
  'site00_studio_production_requests',
  'site00_marketing_approvals',
  'site00_marketing_plans',
  'site00_marketing_metrics',
  'site00_marketing_performance_snapshots',
  'site00_marketing_insights',
] as const;

export async function verifyEvolveSchema(): Promise<{ ok: boolean; missing: string[] }> {
  const missing: string[] = [];
  for (const table of EVOLVE_EXPECTED_TABLES) {
    const { error } = await getSupabaseAdmin().from(table).select('id').limit(1);
    if (error) missing.push(table);
  }
  return { ok: missing.length === 0, missing };
}
