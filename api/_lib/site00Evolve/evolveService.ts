/**
 * EVOLVE Marketing OS — primary service layer (Supabase-backed in production).
 */

import { runMarketingAssessment, explainMarketingHealth } from './assessment.js';
import { marketingRetrievalSummary } from './contentBrain.js';
import { generateMarketingManifest, getMarketingManifest, approveManifestById } from './manifest.js';
import { requestStudioProduction, canTransitionCampaignToLive } from './productionBridge.js';
import { listBlockedCapabilities, listAvailableCapabilities } from './governance.js';
import {
  evolveUuid,
  ensureEvolveStoreReady,
  getAllPendingApprovals,
  getCalendarByOrgId,
  getCalendarItemById,
  getCampaignById,
  getCampaignsByOrgId,
  getChannelsByOrgId,
  getEmailItemsByOrgId,
  getEvolveRoadmapByOrgId,
  getInsightsByOrgId,
  getLatestAssessment,
  getMarketingPlansByOrgId,
  getObjectivesByOrgId,
  getPendingApprovals,
  getProductionRequestsByOrgId,
  getProfileByOrgId,
  getSocialItemsByOrgId,
  insertApproval,
  insertCampaign,
  insertInsight,
  insertObjective,
  updateCampaignStatus,
  updateObjective,
  approveSubject,
  rejectSubject,
  assertOrgRecord,
} from './storeAdapter.js';
import { isMarketingClientOrg } from './seedFixtures.js';
import { orgIdFromSlug, slugFromOrgId } from './orgRegistry.js';
import { assertCampaignTransition } from './campaignLifecycle.js';
import type {
  CampaignStatus,
  EvolveOverview,
  MarketingCampaignRow,
  MarketingObjectiveRow,
  ProductionType,
} from './types.js';
import { buildNextBestActions } from './nextBestAction.js';

export type OrgContext = {
  slug: string;
  name: string;
  classification: string;
  externalConnections?: Array<{ logicalName: string; connectionState: string; systemType?: string }>;
};

const ORG_NAMES: Record<string, string> = {
  'site-00': 'SITE 00',
  'frontal-slayer': 'FRONTAL SLAYER',
  'all-in-one-enterprises': 'ALL IN ONE ENTERPRISES',
  'studio-world': 'STUDIO WORLD',
  ndxbook: 'NDXBOOK',
};

const ORG_CLASS: Record<string, string> = {
  'site-00': 'INTERNAL_BRAND_PLATFORM',
  'frontal-slayer': 'INTERNAL_BRAND',
  'all-in-one-enterprises': 'MANAGED_BRAND',
  'studio-world': 'PRODUCTION_INFRASTRUCTURE',
  ndxbook: 'MANAGED_BRAND',
};

export async function ensureEvolveSeeded(): Promise<void> {
  await ensureEvolveStoreReady();
  const { bootstrapNdxbookPilot } = await import('./providers/pilotService.js');
  await bootstrapNdxbookPilot();
}

export function resolveOrgContext(orgSlug: string): OrgContext {
  return {
    slug: orgSlug,
    name: ORG_NAMES[orgSlug] ?? orgSlug.toUpperCase(),
    classification: ORG_CLASS[orgSlug] ?? 'MANAGED_BRAND',
  };
}

export async function getEvolveOverview(orgSlug: string, ctx?: OrgContext): Promise<EvolveOverview> {
  await ensureEvolveStoreReady();
  const org = ctx ?? resolveOrgContext(orgSlug);
  const orgId = orgIdFromSlug(orgSlug)!;
  const isClient = isMarketingClientOrg(org.classification);

  if (!isClient) {
    return {
      organizationSlug: orgSlug,
      organizationName: org.name,
      classification: org.classification,
      isMarketingClient: false,
      currentObjective: null,
      marketingHealth: 'NOT_APPLICABLE',
      healthDimensions: {},
      activeCampaigns: 0,
      contentPipeline: { planned: 0, inProduction: 0, awaitingReview: 0 },
      productionQueue: 0,
      needsApproval: 0,
      nextPublishingEvent: null,
      latestPerformanceSignal: 'N/A — production infrastructure',
      nextBestAction: null,
      channels: [],
      deferredItems: [],
      blockers: [],
      route: `/admin/site00/orchestration/${orgSlug}`,
    };
  }

  const profile = await getProfileByOrgId(orgId);
  const channels = await getChannelsByOrgId(orgId);
  const campaigns = await getCampaignsByOrgId(orgId);
  const calendar = await getCalendarByOrgId(orgId);
  const production = await getProductionRequestsByOrgId(orgId);
  const approvals = await getPendingApprovals(orgId);
  const assessment = await getLatestAssessment(orgId);
  const roadmap = await getEvolveRoadmapByOrgId(orgId);

  const activeCampaigns = campaigns.filter((c) =>
    ['IN_PRODUCTION', 'LIVE', 'MEASURING', 'APPROVED', 'SCHEDULED'].includes(c.status),
  ).length;

  const health = assessment?.marketing_health ?? (profile?.marketing_maturity === 'ASSESSMENT_REQUIRED' ? 'ASSESSMENT_REQUIRED' : 'ATTENTION_REQUIRED');
  const healthDims = assessment?.health_dimensions ?? (await explainMarketingHealth(orgSlug)).dimensions;

  const nba = assessment?.next_best_actions[0] ?? buildNextBestActions({
    orgSlug,
    orgName: org.name,
    profile,
    channels,
    blockers: assessment?.blockers ?? [],
    opportunities: assessment?.opportunities ?? [],
    pendingApprovals: approvals.length,
    productionCount: production.filter((p) => p.production_state === 'IN_PROGRESS').length,
  })[0] ?? null;

  const cb = marketingRetrievalSummary(orgSlug);

  return {
    organizationSlug: orgSlug,
    organizationName: org.name,
    classification: org.classification,
    isMarketingClient: true,
    currentObjective: profile?.primary_objective ?? null,
    marketingHealth: health,
    healthDimensions: healthDims,
    activeCampaigns,
    contentPipeline: {
      planned: calendar.filter((c) => c.status === 'PLANNED' || c.status === 'IDEA').length,
      inProduction: calendar.filter((c) => c.status === 'IN_PRODUCTION').length,
      awaitingReview: calendar.filter((c) => c.status === 'AWAITING_REVIEW').length,
    },
    productionQueue: production.filter((p) => ['REQUESTED', 'IN_PROGRESS'].includes(p.production_state)).length,
    needsApproval: approvals.length,
    nextPublishingEvent: calendar.find((c) => c.status === 'SCHEDULED' || c.status === 'READY')?.planned_date ?? null,
    latestPerformanceSignal: String(assessment?.measurement_readiness?.analytics ?? 'UNKNOWN — ANALYTICS NOT CONNECTED'),
    nextBestAction: nba ?? null,
    channels: channels.map((c) => ({
      channelKey: c.channel_key,
      state: c.channel_state,
      label: `${c.channel_key}: ${c.channel_state}${c.owner_decision ? ` (${c.owner_decision})` : ''}`,
    })),
    deferredItems: roadmap.filter((r) => r.status === 'DEFERRED_BY_OWNER').map((r) => r.title),
    blockers: (assessment?.blockers ?? []).map((b) => b.label),
    route: `/admin/site00/orchestration/${orgSlug}/evolve`,
    ...(cb.available ? { contentBrainNote: 'Existing brand intelligence available' } : {}),
  } as EvolveOverview & { contentBrainNote?: string };
}

export async function getEvolveDebugPayload(orgSlug: string) {
  await ensureEvolveStoreReady();
  const org = resolveOrgContext(orgSlug);
  const orgId = orgIdFromSlug(orgSlug)!;
  const assessment = await getLatestAssessment(orgId);
  const manifest = await getMarketingManifest(orgSlug);

  return {
    organization: org,
    profile: await getProfileByOrgId(orgId),
    objectives: await getObjectivesByOrgId(orgId),
    channels: await getChannelsByOrgId(orgId),
    assessment,
    assessmentInputs: assessment?.inputs_snapshot,
    manifest: manifest.manifest,
    manifestItems: manifest.items,
    campaigns: await getCampaignsByOrgId(orgId),
    calendar: await getCalendarByOrgId(orgId),
    productionRequests: await getProductionRequestsByOrgId(orgId),
    approvals: await getPendingApprovals(orgId),
    insights: await getInsightsByOrgId(orgId),
    nextBestActions: assessment?.next_best_actions ?? [],
    roadmap: await getEvolveRoadmapByOrgId(orgId),
    contentBrain: marketingRetrievalSummary(orgSlug),
    studioWorld: {
      blockedCapabilities: listBlockedCapabilities(),
      availableCapabilities: listAvailableCapabilities(org.classification),
    },
    overview: await getEvolveOverview(orgSlug, org),
  };
}

export async function runAssessmentForOrg(
  orgSlug: string,
  assessedBy?: string,
  connections?: OrgContext['externalConnections'],
) {
  await ensureEvolveStoreReady();
  const org = resolveOrgContext(orgSlug);
  return runMarketingAssessment(
    { orgSlug, orgClassification: org.classification, orgName: org.name, externalConnections: connections },
    assessedBy,
  );
}

export async function generateManifestForOrg(orgSlug: string) {
  await ensureEvolveStoreReady();
  const orgId = orgIdFromSlug(orgSlug)!;
  return generateMarketingManifest(orgSlug, await getProfileByOrgId(orgId), await getChannelsByOrgId(orgId));
}

export async function createObjective(orgSlug: string, data: Partial<MarketingObjectiveRow>): Promise<MarketingObjectiveRow> {
  await ensureEvolveStoreReady();
  const orgId = orgIdFromSlug(orgSlug)!;
  const objectives = await getObjectivesByOrgId(orgId);
  const row: MarketingObjectiveRow = {
    id: evolveUuid('mobj', objectives.length + 100),
    organization_id: orgId,
    project_id: data.project_id ?? null,
    campaign_id: data.campaign_id ?? null,
    objective_key: data.objective_key ?? 'LEAD_GENERATION',
    title: data.title ?? 'New objective',
    description: data.description ?? null,
    priority: data.priority ?? 'MEDIUM',
    status: data.status ?? 'ACTIVE',
    target_metric: data.target_metric ?? null,
    baseline_value: null,
    target_value: null,
    time_horizon: data.time_horizon ?? null,
    owner_email: data.owner_email ?? null,
    source: data.source ?? 'OWNER_REQUEST',
    approval_state: 'DRAFT',
    metadata: data.metadata ?? {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await insertObjective(row);
  return row;
}

export async function createCampaign(orgSlug: string, data: Partial<MarketingCampaignRow>): Promise<MarketingCampaignRow> {
  await ensureEvolveStoreReady();
  const orgId = orgIdFromSlug(orgSlug)!;
  const campaigns = await getCampaignsByOrgId(orgId);
  const row: MarketingCampaignRow = {
    id: evolveUuid('mcamp', campaigns.length + 1000 + (Date.now() % 100000)),
    organization_id: orgId,
    project_id: data.project_id ?? null,
    campaign_key: data.campaign_key ?? `campaign-${Date.now()}`,
    title: data.title ?? 'New campaign',
    status: 'IDEA',
    why: data.why ?? null,
    audience: data.audience ?? null,
    message: data.message ?? null,
    call_to_action: data.call_to_action ?? null,
    channels: data.channels ?? [],
    deliverables_summary: data.deliverables_summary ?? null,
    approver_email: data.approver_email ?? null,
    success_metric: data.success_metric ?? null,
    metadata: {
      ...(data.metadata ?? {}),
      objective_label: data.metadata?.objective_label ?? data.why ?? null,
      target_date: data.metadata?.target_date ?? null,
      source: data.metadata?.source ?? 'OPERATOR',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await insertCampaign(row);
  return row;
}

export async function transitionCampaignStatus(
  orgSlug: string,
  campaignId: string,
  toStatus: CampaignStatus,
  ctx: { hasRequiredApproval?: boolean; productionComplete?: boolean; hasLiveEvidence?: boolean; deliverablesComplete?: boolean; actorEmail?: string } = {},
): Promise<{ ok: boolean; error?: string; campaign?: MarketingCampaignRow }> {
  const orgId = orgIdFromSlug(orgSlug)!;
  const campaign = await getCampaignById(campaignId);
  try {
    await assertOrgRecord(orgId, campaign, 'Campaign');
    assertCampaignTransition(campaign!.status, toStatus, ctx);
    const updated = await updateCampaignStatus(campaignId, toStatus, ctx.actorEmail);
    return { ok: true, campaign: updated };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Transition rejected' };
  }
}

export async function attemptCampaignLive(campaignId: string, deliverablesComplete: boolean): Promise<{ ok: boolean; error?: string }> {
  const campaign = await getCampaignById(campaignId);
  if (!campaign) return { ok: false, error: 'Campaign not found' };
  if (deliverablesComplete && !canTransitionCampaignToLive(campaign.status, true)) {
    return { ok: false, error: 'Asset completion does not authorize LIVE — campaign must be APPROVED or SCHEDULED' };
  }
  if (canTransitionCampaignToLive(campaign.status, deliverablesComplete)) {
    await updateCampaignStatus(campaignId, 'LIVE');
    return { ok: true };
  }
  return { ok: false, error: `Cannot transition from ${campaign.status} to LIVE` };
}

export async function createInsightFromPerformance(orgSlug: string, title: string, summary: string, evidence: unknown[]) {
  await ensureEvolveStoreReady();
  const orgId = orgIdFromSlug(orgSlug)!;
  const insights = await getInsightsByOrgId(orgId);
  const row = {
    id: evolveUuid('mins', insights.length + 1),
    organization_id: orgId,
    insight_type: 'PERFORMANCE_LEARNING',
    title,
    summary,
    evidence,
    confidence: evidence.length >= 3 ? 'MEDIUM' : 'LOW',
    recommendation: 'Review evidence before acting — correlation is not certainty',
    recommendation_status: 'SUGGESTED',
    content_brain_entry_id: null,
    campaign_id: null,
    metadata: { kind: 'INFERENCE' },
    created_at: new Date().toISOString(),
  };
  await insertInsight(row);
  return row;
}

export async function requestApproval(
  orgSlug: string,
  subjectType: string,
  subjectId: string,
  approvalType: string,
  requestedBy?: string,
) {
  await ensureEvolveStoreReady();
  const orgId = orgIdFromSlug(orgSlug)!;
  const pending = await getPendingApprovals(orgId);
  const row = {
    id: evolveUuid('mapp', pending.length + 1),
    organization_id: orgId,
    subject_type: subjectType,
    subject_id: subjectId,
    approval_type: approvalType,
    status: 'PENDING',
    requested_by: requestedBy ?? null,
    decided_by: null,
    decided_at: null,
    reason: null,
    metadata: {},
    created_at: new Date().toISOString(),
  };
  await insertApproval(row);
  return row;
}

export {
  approveManifestById,
  approveSubject,
  rejectSubject,
  requestStudioProduction,
  updateObjective,
  getObjectivesByOrgId,
  getChannelsByOrgId,
  getCampaignsByOrgId,
  getEvolveRoadmapByOrgId,
  getCalendarItemById,
};

export function listMarketingOrgs(): OrgContext[] {
  return Object.keys(ORG_NAMES).map((slug) => resolveOrgContext(slug));
}

export type CampaignListRow = {
  id: string;
  title: string;
  objective: string | null;
  status: string;
  channels: string[];
  targetDate: string | null;
  nextMilestone: string | null;
  productionState: string;
  approvalState: string;
  blockers: string[];
};

async function enrichCampaignRow(campaign: MarketingCampaignRow, orgId: string): Promise<CampaignListRow> {
  const meta = campaign.metadata as Record<string, unknown>;
  const production = (await getProductionRequestsByOrgId(orgId)).filter((p) => p.campaign_id === campaign.id);
  const approvals = (await getPendingApprovals(orgId)).filter((a) => a.subject_id === campaign.id);
  const prodState =
    production.length > 0
      ? production.some((p) => p.production_state === 'IN_PROGRESS')
        ? 'IN_PROGRESS'
        : production[0]?.production_state ?? 'REQUESTED'
      : String(meta.production_state ?? 'NOT_STARTED');

  return {
    id: campaign.id,
    title: campaign.title,
    objective: (meta.objective_label as string) ?? campaign.why ?? null,
    status: campaign.status,
    channels: campaign.channels,
    targetDate: (meta.target_date as string) ?? null,
    nextMilestone: (meta.next_milestone as string) ?? null,
    productionState: prodState,
    approvalState: approvals.length > 0 ? 'PENDING' : String(meta.approval_state ?? 'DRAFT'),
    blockers: (meta.blockers as string[]) ?? [],
  };
}

export async function getCampaignList(orgSlug: string): Promise<CampaignListRow[]> {
  await ensureEvolveStoreReady();
  const orgId = orgIdFromSlug(orgSlug)!;
  const campaigns = await getCampaignsByOrgId(orgId);
  return Promise.all(campaigns.map((c) => enrichCampaignRow(c, orgId)));
}

export async function getCampaignDetail(orgSlug: string, campaignId: string) {
  await ensureEvolveStoreReady();
  const orgId = orgIdFromSlug(orgSlug)!;
  const campaign = await getCampaignById(campaignId);
  if (!campaign || campaign.organization_id !== orgId) return null;
  const calendar = (await getCalendarByOrgId(orgId)).filter((c) => c.campaign_id === campaignId);
  const production = (await getProductionRequestsByOrgId(orgId)).filter((p) => p.campaign_id === campaignId);
  const approvals = (await getPendingApprovals(orgId)).filter((a) => a.subject_id === campaignId);
  return {
    campaign,
    listRow: await enrichCampaignRow(campaign, orgId),
    calendar,
    production,
    approvals,
  };
}

export async function getEmailOpsPayload(orgSlug: string) {
  await ensureEvolveStoreReady();
  const orgId = orgIdFromSlug(orgSlug)!;
  const channel = (await getChannelsByOrgId(orgId)).find((c) => c.channel_key === 'EMAIL');
  const providerState = process.env.EMAIL_PROVIDER?.trim() ? 'CONNECTED' : 'NOT_CONNECTED';
  return {
    channel,
    providerState,
    items: await getEmailItemsByOrgId(orgId),
    blockers: providerState === 'NOT_CONNECTED' ? ['EMAIL PROVIDER NOT CONNECTED'] : [],
  };
}

export async function getSocialOpsPayload(orgSlug: string) {
  await ensureEvolveStoreReady();
  const orgId = orgIdFromSlug(orgSlug)!;
  const channels = (await getChannelsByOrgId(orgId)).filter((c) =>
    ['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'LINKEDIN', 'PINTEREST', 'YOUTUBE'].includes(c.channel_key),
  );
  const deferred = channels.filter((c) => c.owner_decision === 'DEFERRED_BY_OWNER');
  return {
    channels,
    deferredByOwner: deferred,
    items: await getSocialItemsByOrgId(orgId),
    roadmapDeferred: (await getEvolveRoadmapByOrgId(orgId)).filter((r) => r.status === 'DEFERRED_BY_OWNER'),
  };
}

export async function getPlansPayload(orgSlug: string) {
  await ensureEvolveStoreReady();
  const orgId = orgIdFromSlug(orgSlug)!;
  return {
    plans: await getMarketingPlansByOrgId(orgId),
    roadmap: await getEvolveRoadmapByOrgId(orgId),
    objectives: await getObjectivesByOrgId(orgId),
  };
}

export async function getApprovalsInbox() {
  await ensureEvolveStoreReady();
  const pending = await getAllPendingApprovals();
  return pending.map((a) => {
    const orgSlug = slugFromOrgId(a.organization_id) ?? 'unknown';
    const org = resolveOrgContext(orgSlug);
    return { ...a, organizationSlug: orgSlug, organizationName: org.name };
  });
}

export async function createCampaignFromManifestItem(orgSlug: string, manifestItemKey: string, actorEmail?: string) {
  const manifest = await getMarketingManifest(orgSlug);
  const item = manifest.items.find((i) => i.item_key === manifestItemKey);
  if (!item) throw new Error('Manifest item not found');
  return createCampaign(orgSlug, {
    campaign_key: `manifest-${manifestItemKey}`,
    title: item.title,
    why: item.description ?? undefined,
    metadata: {
      source: 'MARKETING_MANIFEST',
      manifest_item_key: manifestItemKey,
      manifest_id: manifest.manifest?.id,
      created_by: actorEmail,
    },
  });
}
