/**
 * Marketing assessment + health engine — deterministic, evidence-backed.
 */

import type {
  MarketingAssessmentRow,
  MarketingChannelRow,
  MarketingHealthLevel,
  MarketingProfileRow,
  NextBestAction,
} from './types.js';
import {
  getChannelsByOrgId,
  getContentBrainByOrgId,
  getEvolveRoadmapByOrgId,
  getLatestAssessment,
  getObjectivesByOrgId,
  getProfileByOrgId,
  getProductionRequestsByOrgId,
  getCampaignsByOrgId,
  getPendingApprovals,
  insertAssessment,
  evolveUuid,
} from './storeAdapter.js';
import { orgIdFromSlug } from './orgRegistry.js';
import { buildNextBestActions } from './nextBestAction.js';

export type AssessmentInput = {
  orgSlug: string;
  orgClassification: string;
  orgName: string;
  externalConnections?: Array<{ logicalName: string; connectionState: string; systemType?: string }>;
  contentBrainCount?: number;
};

function channelCoverageLabel(channels: MarketingChannelRow[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const c of channels) {
    out[c.channel_key] = c.channel_state;
  }
  return out;
}

function deriveHealthDimensions(
  profile: MarketingProfileRow | undefined,
  channels: MarketingChannelRow[],
  hasAssessment: boolean,
): Record<string, string> {
  if (!profile || profile.marketing_maturity === 'ASSESSMENT_REQUIRED') {
    return {
      STRATEGY: 'NOT_STARTED',
      CONTENT: profile?.metadata?.content_brain_available ? 'REFERENCE_AVAILABLE' : 'UNKNOWN',
      PRODUCTION: 'NOT_STARTED',
      CHANNELS: channels.length > 0 ? 'CONFIGURED' : 'UNKNOWN',
      MEASUREMENT: 'UNKNOWN — provider not connected',
      CAMPAIGN_EXECUTION: 'NOT_STARTED',
    };
  }

  const email = channels.find((c) => c.channel_key === 'EMAIL');
  const socialDeferred = channels.some(
    (c) => ['INSTAGRAM', 'TIKTOK', 'FACEBOOK'].includes(c.channel_key) && c.channel_state === 'DEFERRED',
  );

  return {
    STRATEGY: profile.strategy_status === 'NOT_STARTED' ? 'NOT_STARTED' : 'READY',
    CONTENT: 'ACTIVE',
    PRODUCTION: 'ACTIVE',
    CHANNELS: socialDeferred ? 'PARTIAL — SOCIAL DEFERRED BY OWNER' : 'CONFIGURED',
    MEASUREMENT: hasAssessment ? 'PARTIAL' : 'UNKNOWN — provider not connected',
    CAMPAIGN_EXECUTION: 'NOT_STARTED',
    EMAIL: email?.channel_state === 'BLOCKED' ? 'BLOCKED — provider missing' : email?.channel_state ?? 'UNKNOWN',
  };
}

function deriveMarketingHealth(
  profile: MarketingProfileRow | undefined,
  channels: MarketingChannelRow[],
  blockers: Array<{ label: string }>,
): MarketingHealthLevel {
  if (!profile) return 'NOT_APPLICABLE';
  if (profile.marketing_maturity === 'ASSESSMENT_REQUIRED') return 'ASSESSMENT_REQUIRED';
  if (blockers.some((b) => b.label.includes('BLOCKED') && !b.label.includes('DEFERRED'))) return 'BLOCKED';
  if (blockers.length > 0) return 'ATTENTION_REQUIRED';
  return 'HEALTHY';
}

function buildBlockers(
  channels: MarketingChannelRow[],
  connections: AssessmentInput['externalConnections'],
): Array<{ kind: 'FACT' | 'OWNER_DECISION'; label: string; detail: string }> {
  const blockers: Array<{ kind: 'FACT' | 'OWNER_DECISION'; label: string; detail: string }> = [];

  const emailProvider = connections?.find(
    (c) => c.systemType === 'EMAIL_PROVIDER' || c.logicalName.toLowerCase().includes('email'),
  );
  const emailChannel = channels.find((c) => c.channel_key === 'EMAIL' && c.is_required);
  if (emailChannel && emailChannel.channel_state === 'BLOCKED') {
    blockers.push({
      kind: 'FACT',
      label: 'EMAIL PROVIDER NOT CONNECTED',
      detail: 'Email marketing requires a connected email provider',
    });
  } else if (emailChannel && emailProvider?.connectionState === 'NOT_CONNECTED') {
    blockers.push({
      kind: 'FACT',
      label: 'EMAIL PROVIDER NOT CONNECTED',
      detail: 'Analytics and delivery require email provider integration',
    });
  }

  // DEFERRED channels are NOT blockers
  return blockers;
}

function buildOpportunities(
  profile: MarketingProfileRow | undefined,
  channels: MarketingChannelRow[],
  orgSlug: string,
): Array<{ kind: 'RECOMMENDATION' | 'INFERENCE'; label: string; detail: string }> {
  const opps: Array<{ kind: 'RECOMMENDATION' | 'INFERENCE'; label: string; detail: string }> = [];

  if (profile?.marketing_maturity === 'ASSESSMENT_REQUIRED') {
    opps.push({
      kind: 'RECOMMENDATION',
      label: 'Complete Marketing Assessment',
      detail: 'Establish objectives, channel priorities, and manifest before campaign work',
    });
  }

  const seo = channels.find((c) => c.channel_key === 'SEO' && c.channel_state === 'RECOMMENDED');
  if (seo && orgSlug === 'all-in-one-enterprises') {
    opps.push({
      kind: 'RECOMMENDATION',
      label: 'Search foundation recommended',
      detail: 'Local/search visibility aligns with service client acquisition objective',
    });
  }

  const deferredSocial = channels.filter(
    (c) => c.channel_state === 'DEFERRED' && c.owner_decision === 'DEFERRED_BY_OWNER',
  );
  if (deferredSocial.length > 0) {
    opps.push({
      kind: 'INFERENCE',
      label: 'Social channels deferred — not blocking',
      detail: 'Consider activating social after core service launch when owner is ready',
    });
  }

  return opps;
}

export async function runMarketingAssessment(input: AssessmentInput, assessedBy?: string): Promise<MarketingAssessmentRow> {
  const orgId = orgIdFromSlug(input.orgSlug)!;
  const profile = await getProfileByOrgId(orgId);
  const channels = await getChannelsByOrgId(orgId);
  const objectives = await getObjectivesByOrgId(orgId);
  const contentBrain = await getContentBrainByOrgId(orgId);
  const roadmap = await getEvolveRoadmapByOrgId(orgId);
  const campaigns = await getCampaignsByOrgId(orgId);
  const production = await getProductionRequestsByOrgId(orgId);

  const blockers = buildBlockers(channels, input.externalConnections);
  const opportunities = buildOpportunities(profile, channels, input.orgSlug);
  const healthDimensions = deriveHealthDimensions(profile, channels, false);
  const marketingHealth = deriveMarketingHealth(profile, channels, blockers);

  const measurementReadiness: Record<string, string> = {
    analytics: 'UNKNOWN — ANALYTICS NOT CONNECTED',
    email_performance: 'UNKNOWN — ANALYTICS NOT CONNECTED',
  };
  const analyticsConn = input.externalConnections?.find(
    (c) => c.systemType === 'ANALYTICS_PROVIDER' || c.logicalName.toLowerCase().includes('analytics'),
  );
  if (analyticsConn?.connectionState === 'CONNECTED') {
    measurementReadiness.analytics = 'CONNECTED';
    measurementReadiness.email_performance = 'PARTIAL';
  }

  const nextBestActions = buildNextBestActions({
    orgSlug: input.orgSlug,
    orgName: input.orgName,
    profile,
    channels,
    blockers,
    opportunities,
    pendingApprovals: (await getPendingApprovals(orgId)).length,
    productionCount: production.filter((p) => p.production_state === 'IN_PROGRESS').length,
  });

  const prev = await getLatestAssessment(orgId);
  const version = (prev?.assessment_version ?? 0) + 1;

  const row: MarketingAssessmentRow = {
    id: evolveUuid('massess', version),
    organization_id: orgId,
    assessment_version: version,
    marketing_health: marketingHealth,
    health_dimensions: healthDimensions,
    objective_alignment: {
      objectiveCount: objectives.length,
      primary: profile?.primary_objective ?? null,
    },
    channel_coverage: channelCoverageLabel(channels),
    content_readiness: {
      contentBrainEntries: contentBrain.length,
      canonicalEntries: contentBrain.filter((e) => e.entry_class === 'CANONICAL').length,
      ideaEntries: contentBrain.filter((e) => e.entry_class === 'IDEA').length,
    },
    production_readiness: {
      activeRequests: production.length,
      studioWorldNote: input.orgClassification === 'PRODUCTION_INFRASTRUCTURE' ? 'N/A — infrastructure org' : 'Governed capabilities apply',
    },
    measurement_readiness: measurementReadiness,
    blockers,
    opportunities,
    next_best_actions: nextBestActions,
    inputs_snapshot: {
      orgSlug: input.orgSlug,
      objectiveCount: objectives.length,
      channelCount: channels.length,
      campaignCount: campaigns.length,
      roadmapCount: roadmap.length,
      deferredRoadmap: roadmap.filter((r) => r.status === 'DEFERRED_BY_OWNER').map((r) => r.title),
    },
    assessed_at: new Date().toISOString(),
    assessed_by: assessedBy ?? null,
  };

  await insertAssessment(row);
  return row;
}

export async function explainMarketingHealth(orgSlug: string): Promise<{
  level: MarketingHealthLevel;
  dimensions: Record<string, string>;
  explanation: string[];
}> {
  const orgId = orgIdFromSlug(orgSlug)!;
  const latest = await getLatestAssessment(orgId);
  const profile = await getProfileByOrgId(orgId);
  if (latest) {
    return {
      level: latest.marketing_health,
      dimensions: latest.health_dimensions,
      explanation: Object.entries(latest.health_dimensions).map(([k, v]) => `${k}: ${v}`),
    };
  }
  const channels = await getChannelsByOrgId(orgId);
  const dims = deriveHealthDimensions(profile, channels, false);
  return {
    level: profile?.marketing_maturity === 'ASSESSMENT_REQUIRED' ? 'ASSESSMENT_REQUIRED' : 'ATTENTION_REQUIRED',
    dimensions: dims,
    explanation: Object.entries(dims).map(([k, v]) => `${k}: ${v}`),
  };
}
