/**
 * EVOLVE store adapter — Supabase in production (fail loud), memory for tests only.
 */

import { hasSupabaseServiceRole } from '../supabase.js';
import * as mem from './memoryStore.js';
import * as db from './supabaseStore.js';
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
import type { EvolveRoadmapSeed } from './seedFixtures.js';

export class EvolveStoreUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EvolveStoreUnavailableError';
  }
}

export function useMemoryStore(): boolean {
  return process.env.EVOLVE_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

let storeModeCache: 'memory' | 'supabase' | null = null;

export async function resolveStoreMode(): Promise<'memory' | 'supabase'> {
  if (useMemoryStore()) {
    storeModeCache = null;
    return 'memory';
  }
  if (storeModeCache) return storeModeCache;
  if (!hasSupabaseServiceRole()) {
    throw new EvolveStoreUnavailableError(
      'EVOLVE production requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY — memory fallback disabled',
    );
  }
  const exists = await db.evolveTablesExist();
  if (!exists) {
    const verification = await db.verifyEvolveSchema();
    throw new EvolveStoreUnavailableError(
      `EVOLVE Supabase schema incomplete — missing tables: ${verification.missing.join(', ') || 'unknown'}`,
    );
  }
  storeModeCache = 'supabase';
  return 'supabase';
}

export function resetStoreModeCache(): void {
  storeModeCache = null;
}

export async function ensureEvolveStoreReady(): Promise<void> {
  await resolveStoreMode();
  if ((await resolveStoreMode()) === 'supabase') {
    const { bootstrapEvolveIfEmpty } = await import('./bootstrap.js');
    await bootstrapEvolveIfEmpty();
  } else {
    mem.getEvolveStore();
  }
}

export async function getProfileByOrgId(orgId: string): Promise<MarketingProfileRow | undefined> {
  if ((await resolveStoreMode()) === 'memory') return mem.getProfileByOrgId(orgId);
  return db.loadProfile(orgId);
}

export async function getChannelsByOrgId(orgId: string): Promise<MarketingChannelRow[]> {
  if ((await resolveStoreMode()) === 'memory') return mem.getChannelsByOrgId(orgId);
  return db.loadChannels(orgId);
}

export async function getObjectivesByOrgId(orgId: string): Promise<MarketingObjectiveRow[]> {
  if ((await resolveStoreMode()) === 'memory') return mem.getObjectivesByOrgId(orgId);
  return db.loadObjectives(orgId);
}

export async function getCampaignsByOrgId(orgId: string): Promise<MarketingCampaignRow[]> {
  if ((await resolveStoreMode()) === 'memory') return mem.getCampaignsByOrgId(orgId);
  return db.loadCampaigns(orgId);
}

export async function getCampaignById(campaignId: string): Promise<MarketingCampaignRow | undefined> {
  if ((await resolveStoreMode()) === 'memory') return mem.getCampaignById(campaignId);
  return db.loadCampaignById(campaignId);
}

export async function getLatestAssessment(orgId: string): Promise<MarketingAssessmentRow | undefined> {
  if ((await resolveStoreMode()) === 'memory') return mem.getLatestAssessment(orgId);
  return db.loadLatestAssessment(orgId);
}

export async function getActiveManifest(orgId: string): Promise<MarketingManifestRow | undefined> {
  if ((await resolveStoreMode()) === 'memory') return mem.getActiveManifest(orgId);
  return db.loadActiveManifest(orgId);
}

export async function getManifestItems(manifestId: string): Promise<MarketingManifestItemRow[]> {
  if ((await resolveStoreMode()) === 'memory') return mem.getManifestItems(manifestId);
  return db.loadManifestItems(manifestId);
}

export async function getProductionRequestsByOrgId(orgId: string): Promise<StudioProductionRequestRow[]> {
  if ((await resolveStoreMode()) === 'memory') return mem.getProductionRequestsByOrgId(orgId);
  return db.loadProductionRequests(orgId);
}

export async function getPendingApprovals(orgId: string): Promise<MarketingApprovalRow[]> {
  if ((await resolveStoreMode()) === 'memory') return mem.getPendingApprovals(orgId);
  return db.loadPendingApprovals(orgId);
}

export async function getAllPendingApprovals(): Promise<MarketingApprovalRow[]> {
  if ((await resolveStoreMode()) === 'memory') return mem.getAllPendingApprovals();
  return db.loadPendingApprovals();
}

export async function getInsightsByOrgId(orgId: string): Promise<MarketingInsightRow[]> {
  if ((await resolveStoreMode()) === 'memory') return mem.getInsightsByOrgId(orgId);
  return db.loadInsights(orgId);
}

export async function getContentBrainByOrgId(orgId: string): Promise<Array<Record<string, unknown>>> {
  if ((await resolveStoreMode()) === 'memory') return mem.getContentBrainByOrgId(orgId);
  return [];
}

export async function getEvolveRoadmapByOrgId(orgId: string): Promise<EvolveRoadmapSeed[]> {
  if ((await resolveStoreMode()) === 'memory') return mem.getEvolveRoadmapByOrgId(orgId);
  const { loadEvolveItems } = await import('../site00Orchestration/supabaseStore.js');
  const items = await loadEvolveItems(orgId);
  return items.map((i) => ({
    id: i.id,
    organization_id: i.organization_id,
    title: i.title,
    description: i.description ?? '',
    category: i.category ?? 'LATER',
    priority: i.priority ?? 'MEDIUM',
    status: i.status ?? 'PLANNED',
    metadata: (i.metadata as Record<string, unknown>) ?? {},
  }));
}

export async function getCalendarByOrgId(orgId: string): Promise<ContentCalendarItemRow[]> {
  if ((await resolveStoreMode()) === 'memory') return mem.getCalendarByOrgId(orgId);
  return db.loadCalendar(orgId);
}

export async function getCalendarItemById(itemId: string): Promise<ContentCalendarItemRow | undefined> {
  if ((await resolveStoreMode()) === 'memory') return mem.getCalendarItemById(itemId);
  return db.loadCalendarItemById(itemId);
}

export async function getEmailItemsByOrgId(orgId: string): Promise<Array<Record<string, unknown>>> {
  if ((await resolveStoreMode()) === 'memory') return mem.getEmailItemsByOrgId(orgId);
  return db.loadEmailItems(orgId);
}

export async function getSocialItemsByOrgId(orgId: string): Promise<Array<Record<string, unknown>>> {
  if ((await resolveStoreMode()) === 'memory') return mem.getSocialItemsByOrgId(orgId);
  return db.loadSocialItems(orgId);
}

export async function getMarketingPlansByOrgId(orgId: string): Promise<Array<Record<string, unknown>>> {
  if ((await resolveStoreMode()) === 'memory') return mem.getMarketingPlansByOrgId(orgId);
  return db.loadMarketingPlans(orgId);
}

export async function insertAssessment(row: MarketingAssessmentRow): Promise<void> {
  if ((await resolveStoreMode()) === 'memory') {
    mem.insertAssessment(row);
    return;
  }
  await db.insertAssessmentDb(row);
}

export async function upsertManifest(manifest: MarketingManifestRow, items: MarketingManifestItemRow[]): Promise<void> {
  if ((await resolveStoreMode()) === 'memory') {
    mem.upsertManifest(manifest, items);
    return;
  }
  await db.upsertManifestDb(manifest, items);
}

export async function insertCampaign(campaign: MarketingCampaignRow): Promise<void> {
  if ((await resolveStoreMode()) === 'memory') {
    mem.insertCampaign(campaign);
    return;
  }
  await db.insertCampaignDb(campaign);
  await db.insertCampaignEventDb({
    campaign_id: campaign.id,
    event_type: 'CAMPAIGN_CREATED',
    summary: `Campaign created: ${campaign.title}`,
    after_state: { status: campaign.status },
  });
}

export async function updateCampaignStatus(
  campaignId: string,
  status: MarketingCampaignRow['status'],
  actorEmail?: string,
): Promise<MarketingCampaignRow | undefined> {
  if ((await resolveStoreMode()) === 'memory') return mem.updateCampaignStatus(campaignId, status);
  const before = await db.loadCampaignById(campaignId);
  const updated = await db.updateCampaignDb(campaignId, { status });
  if (updated && before) {
    await db.insertCampaignEventDb({
      campaign_id: campaignId,
      event_type: 'CAMPAIGN_STATUS_CHANGED',
      actor_email: actorEmail ?? null,
      summary: `Campaign status: ${before.status} → ${status}`,
      before_state: { status: before.status },
      after_state: { status },
    });
  }
  return updated;
}

export async function insertProductionRequest(req: StudioProductionRequestRow): Promise<void> {
  if ((await resolveStoreMode()) === 'memory') {
    mem.insertProductionRequest(req);
    return;
  }
  await db.insertProductionRequestDb(req);
}

export async function insertApproval(approval: MarketingApprovalRow): Promise<void> {
  if ((await resolveStoreMode()) === 'memory') {
    mem.insertApproval(approval);
    return;
  }
  await db.insertApprovalDb(approval);
}

export async function insertInsight(insight: MarketingInsightRow): Promise<void> {
  if ((await resolveStoreMode()) === 'memory') {
    mem.insertInsight(insight);
    return;
  }
  await db.insertInsightDb(insight);
}

export async function insertObjective(obj: MarketingObjectiveRow): Promise<void> {
  if ((await resolveStoreMode()) === 'memory') {
    mem.insertObjective(obj);
    return;
  }
  await db.insertObjectiveDb(obj);
}

export async function updateObjective(
  id: string,
  patch: Partial<MarketingObjectiveRow>,
): Promise<MarketingObjectiveRow | undefined> {
  if ((await resolveStoreMode()) === 'memory') return mem.updateObjective(id, patch);
  return db.updateObjectiveDb(id, patch);
}

export async function approveSubject(approvalId: string, decidedBy: string): Promise<void> {
  if ((await resolveStoreMode()) === 'memory') {
    mem.approveSubject(approvalId, decidedBy);
    return;
  }
  await db.decideApprovalDb(approvalId, 'APPROVED', decidedBy);
}

export async function rejectSubject(approvalId: string, decidedBy: string, reason: string): Promise<void> {
  if ((await resolveStoreMode()) === 'memory') {
    mem.rejectSubject(approvalId, decidedBy, reason);
    return;
  }
  await db.decideApprovalDb(approvalId, 'REJECTED', decidedBy, reason);
}

export async function approveManifestById(manifestId: string, approvedBy: string): Promise<MarketingManifestRow | null> {
  if ((await resolveStoreMode()) === 'memory') {
    const { approveManifestById: memApprove } = await import('./manifest.js');
    return memApprove(manifestId, approvedBy);
  }
  return db.approveManifestDb(manifestId, approvedBy);
}

export async function assertOrgRecord<T extends { organization_id: string }>(
  orgId: string,
  record: T | undefined | null,
  label: string,
): Promise<T> {
  if (!record) throw new Error(`${label} not found`);
  if (record.organization_id !== orgId) {
    throw new Error(`Cross-organization access denied for ${label}`);
  }
  return record;
}

export { mem as memoryStore, db as supabaseStore };
export { evolveUuid, resetEvolveStore } from './memoryStore.js';
