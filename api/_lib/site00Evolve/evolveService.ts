/**
 * EVOLVE Marketing OS — primary service layer.
 * Integrates with orchestration; does not replace it.
 */

import { runMarketingAssessment, explainMarketingHealth } from './assessment.js';
import { marketingRetrievalSummary } from './contentBrain.js';
import { generateMarketingManifest, getMarketingManifest, approveManifestById } from './manifest.js';
import { requestStudioProduction, canTransitionCampaignToLive } from './productionBridge.js';
import { listBlockedCapabilities, listAvailableCapabilities } from './governance.js';
import {
  evolveUuid,
  getCalendarByOrgId,
  getCampaignsByOrgId,
  getChannelsByOrgId,
  getEvolveRoadmapByOrgId,
  getInsightsByOrgId,
  getLatestAssessment,
  getObjectivesByOrgId,
  getPendingApprovals,
  getProductionRequestsByOrgId,
  getProfileByOrgId,
  insertApproval,
  insertCampaign,
  insertInsight,
  insertObjective,
  getEvolveStore,
  resetEvolveStore,
  updateCampaignStatus,
  updateObjective,
  approveSubject,
  rejectSubject,
} from './memoryStore.js';
import { isMarketingClientOrg, orgIdFromSlug } from './seedFixtures.js';
import type {
  EvolveOverview,
  MarketingCampaignRow,
  MarketingObjectiveRow,
  NextBestAction,
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
};

const ORG_CLASS: Record<string, string> = {
  'site-00': 'INTERNAL_BRAND_PLATFORM',
  'frontal-slayer': 'INTERNAL_BRAND',
  'all-in-one-enterprises': 'MANAGED_BRAND',
  'studio-world': 'PRODUCTION_INFRASTRUCTURE',
};

export function ensureEvolveSeeded(): void {
  getEvolveStore();
}

export function resolveOrgContext(orgSlug: string): OrgContext {
  return {
    slug: orgSlug,
    name: ORG_NAMES[orgSlug] ?? orgSlug.toUpperCase(),
    classification: ORG_CLASS[orgSlug] ?? 'MANAGED_BRAND',
  };
}

export function getEvolveOverview(orgSlug: string, ctx?: OrgContext): EvolveOverview {
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

  const profile = getProfileByOrgId(orgId);
  const channels = getChannelsByOrgId(orgId);
  const campaigns = getCampaignsByOrgId(orgId);
  const calendar = getCalendarByOrgId(orgId);
  const production = getProductionRequestsByOrgId(orgId);
  const approvals = getPendingApprovals(orgId);
  const assessment = getLatestAssessment(orgId);
  const roadmap = getEvolveRoadmapByOrgId(orgId);

  const activeCampaigns = campaigns.filter((c) =>
    ['IN_PRODUCTION', 'LIVE', 'MEASURING', 'APPROVED', 'SCHEDULED'].includes(c.status),
  ).length;

  const health = assessment?.marketing_health ?? (profile?.marketing_maturity === 'ASSESSMENT_REQUIRED' ? 'ASSESSMENT_REQUIRED' : 'ATTENTION_REQUIRED');
  const healthDims = assessment?.health_dimensions ?? explainMarketingHealth(orgSlug).dimensions;

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
    latestPerformanceSignal: assessment?.measurement_readiness?.analytics ?? 'UNKNOWN — ANALYTICS NOT CONNECTED',
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

export function getEvolveDebugPayload(orgSlug: string) {
  const org = resolveOrgContext(orgSlug);
  const orgId = orgIdFromSlug(orgSlug)!;
  const assessment = getLatestAssessment(orgId);
  const manifest = getMarketingManifest(orgSlug);

  return {
    organization: org,
    profile: getProfileByOrgId(orgId),
    objectives: getObjectivesByOrgId(orgId),
    channels: getChannelsByOrgId(orgId),
    assessment,
    assessmentInputs: assessment?.inputs_snapshot,
    manifest: manifest.manifest,
    manifestItems: manifest.items,
    campaigns: getCampaignsByOrgId(orgId),
    calendar: getCalendarByOrgId(orgId),
    productionRequests: getProductionRequestsByOrgId(orgId),
    approvals: getPendingApprovals(orgId),
    insights: getInsightsByOrgId(orgId),
    nextBestActions: assessment?.next_best_actions ?? [],
    roadmap: getEvolveRoadmapByOrgId(orgId),
    contentBrain: marketingRetrievalSummary(orgSlug),
    studioWorld: {
      blockedCapabilities: listBlockedCapabilities(),
      availableCapabilities: listAvailableCapabilities(org.classification),
    },
    overview: getEvolveOverview(orgSlug, org),
  };
}

export function runAssessmentForOrg(orgSlug: string, assessedBy?: string, connections?: OrgContext['externalConnections']) {
  const org = resolveOrgContext(orgSlug);
  return runMarketingAssessment(
    { orgSlug, orgClassification: org.classification, orgName: org.name, externalConnections: connections },
    assessedBy,
  );
}

export function generateManifestForOrg(orgSlug: string) {
  const orgId = orgIdFromSlug(orgSlug)!;
  return generateMarketingManifest(orgSlug, getProfileByOrgId(orgId), getChannelsByOrgId(orgId));
}

export function createObjective(orgSlug: string, data: Partial<MarketingObjectiveRow>): MarketingObjectiveRow {
  const orgId = orgIdFromSlug(orgSlug)!;
  const row: MarketingObjectiveRow = {
    id: evolveUuid('mobj', getObjectivesByOrgId(orgId).length + 100),
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
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  insertObjective(row);
  return row;
}

export function createCampaign(orgSlug: string, data: Partial<MarketingCampaignRow>): MarketingCampaignRow {
  const orgId = orgIdFromSlug(orgSlug)!;
  const row: MarketingCampaignRow = {
    id: evolveUuid('mcamp', getCampaignsByOrgId(orgId).length + 1),
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
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  insertCampaign(row);
  return row;
}

export function attemptCampaignLive(campaignId: string, deliverablesComplete: boolean): { ok: boolean; error?: string } {
  const campaign = getEvolveStore().campaigns.find((c) => c.id === campaignId);
  if (!campaign) return { ok: false, error: 'Campaign not found' };
  if (deliverablesComplete && !canTransitionCampaignToLive(campaign.status, true)) {
    return { ok: false, error: 'Asset completion does not authorize LIVE — campaign must be APPROVED or SCHEDULED' };
  }
  if (canTransitionCampaignToLive(campaign.status, deliverablesComplete)) {
    updateCampaignStatus(campaignId, 'LIVE');
    return { ok: true };
  }
  return { ok: false, error: `Cannot transition from ${campaign.status} to LIVE` };
}

export function createInsightFromPerformance(orgSlug: string, title: string, summary: string, evidence: unknown[]) {
  const orgId = orgIdFromSlug(orgSlug)!;
  const row = {
    id: evolveUuid('mins', getInsightsByOrgId(orgId).length + 1),
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
  insertInsight(row);
  return row;
}

export function requestApproval(orgSlug: string, subjectType: string, subjectId: string, approvalType: string, requestedBy?: string) {
  const orgId = orgIdFromSlug(orgSlug)!;
  const row = {
    id: evolveUuid('mapp', getPendingApprovals(orgId).length + 1),
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
  insertApproval(row);
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
};

export function listMarketingOrgs(): OrgContext[] {
  return Object.keys(ORG_NAMES).map((slug) => resolveOrgContext(slug));
}
