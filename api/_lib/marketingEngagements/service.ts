import { getSupabaseAdmin } from '../supabase.js';
import { getProductionServiceAdapter } from '../studioWorld/client.js';
import type {
  MarketingEngagementPayload,
  MarketingEngagementRecord,
  MarketingEngagementStatus,
  MarketingIntakeRecord,
  MarketingPaymentState,
  MarketingScopeRecord,
  MarketingServiceCategory,
} from '../../../shared/site00-marketing/types.js';

type DbRow = {
  id: string;
  engagement_code: string;
  client_email: string;
  client_user_id: string | null;
  project_id: string | null;
  identity_id: string | null;
  campaign_name: string;
  service_category: string;
  status: string;
  payment_state: string;
  brand_source: string;
  brand_setup_required: boolean;
  intake: Record<string, unknown>;
  scope: Record<string, unknown>;
  client_phase: string;
  client_action_required: boolean;
  client_action_label: string | null;
  provisioning_state: string;
  provisioning_error: string | null;
  studio_world_campaign_id: string | null;
  external_sync_status: string;
  authorized_at: string | null;
  paid_at: string | null;
  provisioned_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: DbRow): MarketingEngagementRecord {
  return {
    id: row.id,
    engagementCode: row.engagement_code,
    clientEmail: row.client_email,
    clientUserId: row.client_user_id,
    projectId: row.project_id,
    identityId: row.identity_id,
    campaignName: row.campaign_name,
    serviceCategory: row.service_category as MarketingServiceCategory,
    status: row.status as MarketingEngagementStatus,
    paymentState: row.payment_state as MarketingPaymentState,
    brandSource: row.brand_source as MarketingEngagementRecord['brandSource'],
    brandSetupRequired: row.brand_setup_required,
    intake: row.intake as MarketingIntakeRecord,
    scope: row.scope as MarketingScopeRecord,
    clientPhase: row.client_phase,
    clientActionRequired: row.client_action_required,
    clientActionLabel: row.client_action_label,
    provisioningState: row.provisioning_state,
    provisioningError: row.provisioning_error,
    studioWorldCampaignId: row.studio_world_campaign_id,
    externalSyncStatus: row.external_sync_status,
    authorizedAt: row.authorized_at,
    paidAt: row.paid_at,
    provisionedAt: row.provisioned_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function engagementCode(): string {
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `MKT-${n}`;
}

async function logEvent(engagementId: string, eventType: string, actor?: string, payload?: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  await supabase.from('site00_marketing_engagement_events').insert({
    engagement_id: engagementId,
    event_type: eventType,
    actor: actor ?? null,
    payload: payload ?? {},
  });
}

export async function createMarketingEngagement(input: {
  clientEmail: string;
  clientUserId?: string;
  serviceCategory: MarketingServiceCategory;
  campaignName?: string;
}): Promise<MarketingEngagementRecord> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site00_marketing_engagements')
    .insert({
      engagement_code: engagementCode(),
      client_email: input.clientEmail,
      client_user_id: input.clientUserId ?? null,
      service_category: input.serviceCategory,
      campaign_name: input.campaignName ?? 'UNTITLED CAMPAIGN',
      scope: { serviceCategory: input.serviceCategory, status: 'DRAFT' },
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to create engagement');
  await logEvent(data.id, 'INTAKE_STARTED', input.clientEmail);
  return mapRow(data as DbRow);
}

export async function updateMarketingIntake(
  engagementId: string,
  clientEmail: string,
  intake: Partial<MarketingIntakeRecord>,
  opts?: { markComplete?: boolean },
): Promise<MarketingEngagementRecord> {
  const supabase = getSupabaseAdmin();
  const { data: existing, error: loadErr } = await supabase
    .from('site00_marketing_engagements')
    .select('*')
    .eq('id', engagementId)
    .eq('client_email', clientEmail)
    .single();
  if (loadErr || !existing) throw new Error('ENGAGEMENT NOT FOUND');

  const mergedIntake = { ...(existing.intake as Record<string, unknown>), ...intake };
  const status: MarketingEngagementStatus = opts?.markComplete ? 'INTAKE_COMPLETE' : (existing.status as MarketingEngagementStatus);

  const { data, error } = await supabase
    .from('site00_marketing_engagements')
    .update({
      intake: mergedIntake,
      campaign_name: intake.businessName ?? existing.campaign_name,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', engagementId)
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Update failed');
  if (opts?.markComplete) await logEvent(engagementId, 'INTAKE_SUBMITTED', clientEmail);
  return mapRow(data as DbRow);
}

export async function updateMarketingScope(
  engagementId: string,
  clientEmail: string,
  scope: Partial<MarketingScopeRecord>,
): Promise<MarketingEngagementRecord> {
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from('site00_marketing_engagements')
    .select('*')
    .eq('id', engagementId)
    .eq('client_email', clientEmail)
    .single();
  if (!existing) throw new Error('ENGAGEMENT NOT FOUND');

  const mergedScope = { ...(existing.scope as Record<string, unknown>), ...scope, status: scope.status ?? 'READY' };
  const { data, error } = await supabase
    .from('site00_marketing_engagements')
    .update({ scope: mergedScope, status: 'SCOPE_REVIEW', updated_at: new Date().toISOString() })
    .eq('id', engagementId)
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Scope update failed');
  return mapRow(data as DbRow);
}

export async function authorizeMarketingEngagement(engagementId: string, clientEmail: string): Promise<MarketingEngagementRecord> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site00_marketing_engagements')
    .update({
      status: 'AWAITING_AUTHORIZATION',
      updated_at: new Date().toISOString(),
    })
    .eq('id', engagementId)
    .eq('client_email', clientEmail)
    .select('*')
    .single();
  if (error || !data) throw new Error('ENGAGEMENT NOT FOUND');
  return mapRow(data as DbRow);
}

/** Simulates authoritative payment confirmation — replaces Stripe webhook until wired. */
export async function confirmMarketingPayment(engagementId: string, actorEmail: string, isAdmin = false): Promise<MarketingEngagementRecord> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from('site00_marketing_engagements').select('*').eq('id', engagementId);
  if (!isAdmin) query = query.eq('client_email', actorEmail);
  const { data: existing } = await query.single();
  if (!existing) throw new Error('ENGAGEMENT NOT FOUND');

  const { data, error } = await supabase
    .from('site00_marketing_engagements')
    .update({
      payment_state: 'CONFIRMED',
      status: 'PAID',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', engagementId)
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Payment confirm failed');
  await logEvent(engagementId, 'PAYMENT_CONFIRMED', actorEmail);
  return mapRow(data as DbRow);
}

export async function provisionMarketingEngagement(engagementId: string): Promise<MarketingEngagementRecord> {
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase.from('site00_marketing_engagements').select('*').eq('id', engagementId).single();
  if (!existing) throw new Error('ENGAGEMENT NOT FOUND');
  if (existing.payment_state !== 'CONFIRMED') throw new Error('PAYMENT NOT CONFIRMED');
  if (existing.studio_world_campaign_id) return mapRow(existing as DbRow);

  const adapter = getProductionServiceAdapter();
  try {
    await supabase
      .from('site00_marketing_engagements')
      .update({ status: 'PROVISIONING', provisioning_state: 'IN_PROGRESS' })
      .eq('id', engagementId);

    const result = await adapter.provisionCampaign({
      externalSystem: 'SITE_00',
      externalClientId: existing.client_user_id ?? existing.client_email,
      externalEngagementId: existing.id,
      externalProjectId: existing.project_id ?? undefined,
      brandSetupRequired: existing.brand_setup_required,
      engagementType: 'EVOLVE_MARKETING',
      serviceType: existing.service_category,
      campaignObjective: (existing.intake as MarketingIntakeRecord)?.campaignObjective,
      deliverables: (existing.intake as MarketingIntakeRecord)?.deliverableTypes,
      platforms: (existing.intake as MarketingIntakeRecord)?.platforms,
      approvedScope: existing.scope as Record<string, unknown>,
      clientVisibleProjectId: existing.engagement_code,
    });

    const { data, error } = await supabase
      .from('site00_marketing_engagements')
      .update({
        studio_world_campaign_id: result.campaignId,
        status: 'ACTIVE',
        provisioning_state: 'COMPLETE',
        provisioned_at: new Date().toISOString(),
        client_phase: result.clientPhase ?? '02',
        external_sync_status: 'LINKED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', engagementId)
      .select('*')
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Provision persist failed');

    await supabase.from('site00_external_production_links').upsert({
      external_system: 'STUDIO_WORLD',
      external_engagement_id: engagementId,
      external_campaign_id: result.campaignId,
      sync_status: 'LINKED',
      external_status: result.status,
      last_synced_at: new Date().toISOString(),
    });

    await logEvent(engagementId, 'PROVISIONED', 'system', { campaignId: result.campaignId });
    return mapRow(data as DbRow);
  } catch (err) {
    await supabase
      .from('site00_marketing_engagements')
      .update({
        status: 'PROVISIONING_RETRY_REQUIRED',
        provisioning_state: 'FAILED',
        provisioning_error: err instanceof Error ? err.message : 'Provision failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', engagementId);
    throw err;
  }
}

export async function syncMarketingEngagement(engagementId: string, clientEmail?: string): Promise<MarketingEngagementPayload> {
  const payload = await getMarketingEngagementPayload(engagementId, clientEmail);
  if (!payload.studioWorldCampaignId) return payload;

  const adapter = getProductionServiceAdapter();
  const status = await adapter.getClientStatus(payload.studioWorldCampaignId);
  const reviews = await adapter.listClientReviews(payload.studioWorldCampaignId);
  const deliverables = await adapter.listClientDeliverables(payload.studioWorldCampaignId);

  const supabase = getSupabaseAdmin();
  await supabase
    .from('site00_marketing_engagements')
    .update({
      client_phase: status.clientPhase,
      client_action_required: status.clientActionRequired,
      client_action_label: status.clientActionLabel ?? null,
      external_sync_status: status.syncStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', engagementId);

  return {
    ...payload,
    clientPhase: status.clientPhase,
    clientActionRequired: status.clientActionRequired,
    clientActionLabel: status.clientActionLabel,
    reviews: reviews.map((r) => ({
      id: r.id,
      engagementId,
      title: r.title,
      reviewType: r.reviewType as MarketingEngagementPayload['reviews'][0]['reviewType'],
      previewUrl: r.previewUrl,
      thumbnailUrl: r.thumbnailUrl,
      status: r.status,
      allowsDirectionSelect: r.allowsDirectionSelect,
      directions: r.directions,
    })),
    deliverables: deliverables.map((d) => ({
      id: d.id,
      engagementId,
      title: d.title,
      format: d.format,
      aspectRatio: d.aspectRatio,
      version: d.version,
      previewUrl: d.previewUrl,
      downloadUrl: d.downloadUrl,
      status: d.visibility === 'APPROVED' ? 'APPROVED' : 'CLIENT_VISIBLE',
    })),
  };
}

export async function getMarketingEngagementPayload(engagementId: string, clientEmail?: string): Promise<MarketingEngagementPayload> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from('site00_marketing_engagements').select('*').eq('id', engagementId);
  if (clientEmail) query = query.eq('client_email', clientEmail);
  const { data, error } = await query.single();
  if (error || !data) throw new Error('ENGAGEMENT NOT FOUND');

  const record = mapRow(data as DbRow);
  const { data: history } = await supabase
    .from('site00_marketing_engagements')
    .select('engagement_code, campaign_name, status')
    .eq('client_email', record.clientEmail)
    .order('created_at', { ascending: false })
    .limit(6);

  return {
    ...record,
    reviews: [],
    deliverables: [],
    campaignHistory: (history ?? []).map((h) => ({
      code: h.engagement_code,
      name: h.campaign_name,
      status: h.status as MarketingEngagementStatus,
    })),
    reusedIdentity: record.identityId ? { name: 'APPROVED IDENTITY', source: 'SITE 00 IDNTY' } : null,
  };
}

export async function listMarketingEngagementsForClient(clientEmail: string): Promise<MarketingEngagementRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('site00_marketing_engagements')
    .select('*')
    .eq('client_email', clientEmail)
    .order('updated_at', { ascending: false });
  return (data ?? []).map((row) => mapRow(row as DbRow));
}

export async function listMarketingEngagementsAdmin(): Promise<MarketingEngagementRecord[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('site00_marketing_engagements').select('*').order('updated_at', { ascending: false });
  return (data ?? []).map((row) => mapRow(row as DbRow));
}

export async function submitMarketingReviewAction(input: {
  engagementId: string;
  clientEmail: string;
  clientUserId: string;
  reviewId: string;
  action: 'APPROVE' | 'REQUEST_REVISION' | 'SELECT_DIRECTION';
  note?: string;
  directionId?: string;
}): Promise<{ ok: true }> {
  const payload = await getMarketingEngagementPayload(input.engagementId, input.clientEmail);
  if (!payload.studioWorldCampaignId) throw new Error('NOT PROVISIONED');

  const adapter = getProductionServiceAdapter();
  await adapter.submitClientAction({
    reviewId: input.reviewId,
    clientUserId: input.clientUserId,
    action: input.action,
    note: input.note,
    directionId: input.directionId,
    timestamp: new Date().toISOString(),
  });

  await logEvent(input.engagementId, input.action, input.clientEmail, { reviewId: input.reviewId });
  return { ok: true };
}
