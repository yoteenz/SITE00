/** In-memory EVOLVE marketing store — tests + dev when Supabase unavailable */

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
import {
  buildSeedChannels,
  buildSeedEvolveRoadmapItems,
  buildSeedObjectives,
  buildSeedProfiles,
  orgIdFromSlug,
  type EvolveRoadmapSeed,
} from './seedFixtures.js';

export type EvolveMarketingStore = {
  profiles: MarketingProfileRow[];
  objectives: MarketingObjectiveRow[];
  channels: MarketingChannelRow[];
  assessments: MarketingAssessmentRow[];
  manifests: MarketingManifestRow[];
  manifestItems: MarketingManifestItemRow[];
  campaigns: MarketingCampaignRow[];
  calendarItems: ContentCalendarItemRow[];
  productionRequests: StudioProductionRequestRow[];
  approvals: MarketingApprovalRow[];
  insights: MarketingInsightRow[];
  evolveRoadmap: EvolveRoadmapSeed[];
  contentBrain: Array<Record<string, unknown>>;
  seeded: boolean;
};

let store: EvolveMarketingStore | null = null;

function uuid(prefix: string, n: number): string {
  return `${prefix}-00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
}

export function getEvolveStore(): EvolveMarketingStore {
  if (!store) store = createFreshStore();
  if (!store.seeded) seedEvolveStore(store);
  return store;
}

export function resetEvolveStore(): EvolveMarketingStore {
  store = createFreshStore();
  seedEvolveStore(store);
  return store;
}

function createFreshStore(): EvolveMarketingStore {
  return {
    profiles: [],
    objectives: [],
    channels: [],
    assessments: [],
    manifests: [],
    manifestItems: [],
    campaigns: [],
    calendarItems: [],
    productionRequests: [],
    approvals: [],
    insights: [],
    evolveRoadmap: [],
    contentBrain: [],
    seeded: false,
  };
}

function seedEvolveStore(s: EvolveMarketingStore): void {
  s.profiles = buildSeedProfiles();
  s.objectives = buildSeedObjectives();
  s.channels = buildSeedChannels();
  s.evolveRoadmap = buildSeedEvolveRoadmapItems();

  // Frontal Slayer — sample content brain (REFERENCE + CANONICAL distinction)
  s.contentBrain = [
    {
      id: uuid('cb', 1),
      organization_id: orgIdFromSlug('frontal-slayer')!,
      entry_type: 'brand_voice',
      entry_class: 'CANONICAL',
      title: 'Frontal Slayer Brand Voice',
      content: { tone: 'Bold, luxurious, unapologetic' },
      approval_state: 'APPROVED',
    },
    {
      id: uuid('cb', 2),
      organization_id: orgIdFromSlug('frontal-slayer')!,
      entry_type: 'campaign_narrative',
      entry_class: 'IDEA',
      title: 'Summer launch narrative concept',
      content: { hook: 'Draft concept — not approved' },
      approval_state: 'DRAFT',
    },
  ];

  s.seeded = true;
}

export function resolveOrgId(orgSlug: string): string {
  const id = orgIdFromSlug(orgSlug);
  if (!id) throw new Error(`Unknown organization slug: ${orgSlug}`);
  return id;
}

export function getProfileByOrgId(orgId: string): MarketingProfileRow | undefined {
  return getEvolveStore().profiles.find((p) => p.organization_id === orgId);
}

export function getChannelsByOrgId(orgId: string): MarketingChannelRow[] {
  return getEvolveStore().channels.filter((c) => c.organization_id === orgId);
}

export function getObjectivesByOrgId(orgId: string): MarketingObjectiveRow[] {
  return getEvolveStore().objectives.filter((o) => o.organization_id === orgId);
}

export function getCampaignsByOrgId(orgId: string): MarketingCampaignRow[] {
  return getEvolveStore().campaigns.filter((c) => c.organization_id === orgId);
}

export function getLatestAssessment(orgId: string): MarketingAssessmentRow | undefined {
  return getEvolveStore()
    .assessments.filter((a) => a.organization_id === orgId)
    .sort((a, b) => b.assessed_at.localeCompare(a.assessed_at))[0];
}

export function getActiveManifest(orgId: string): MarketingManifestRow | undefined {
  return getEvolveStore().manifests.find((m) => m.organization_id === orgId && m.is_active);
}

export function getManifestItems(manifestId: string): MarketingManifestItemRow[] {
  return getEvolveStore().manifestItems.filter((i) => i.manifest_id === manifestId);
}

export function getProductionRequestsByOrgId(orgId: string): StudioProductionRequestRow[] {
  return getEvolveStore().productionRequests.filter((p) => p.organization_id === orgId);
}

export function getPendingApprovals(orgId: string): MarketingApprovalRow[] {
  return getEvolveStore().approvals.filter((a) => a.organization_id === orgId && a.status === 'PENDING');
}

export function getInsightsByOrgId(orgId: string): MarketingInsightRow[] {
  return getEvolveStore().insights.filter((i) => i.organization_id === orgId);
}

export function getContentBrainByOrgId(orgId: string): Array<Record<string, unknown>> {
  return getEvolveStore().contentBrain.filter((e) => e.organization_id === orgId);
}

export function getEvolveRoadmapByOrgId(orgId: string): EvolveRoadmapSeed[] {
  return getEvolveStore().evolveRoadmap.filter((r) => r.organization_id === orgId);
}

export function getCalendarByOrgId(orgId: string): ContentCalendarItemRow[] {
  return getEvolveStore().calendarItems.filter((c) => c.organization_id === orgId);
}

export function insertAssessment(row: MarketingAssessmentRow): void {
  getEvolveStore().assessments.push(row);
}

export function upsertManifest(manifest: MarketingManifestRow, items: MarketingManifestItemRow[]): void {
  const s = getEvolveStore();
  s.manifests = s.manifests.filter((m) => !(m.organization_id === manifest.organization_id && m.is_active));
  s.manifestItems = s.manifestItems.filter((i) => i.manifest_id !== manifest.id);
  s.manifests.push(manifest);
  s.manifestItems.push(...items);
}

export function insertCampaign(campaign: MarketingCampaignRow): void {
  getEvolveStore().campaigns.push(campaign);
}

export function updateCampaignStatus(campaignId: string, status: MarketingCampaignRow['status']): MarketingCampaignRow | undefined {
  const c = getEvolveStore().campaigns.find((x) => x.id === campaignId);
  if (c) c.status = status;
  return c;
}

export function insertProductionRequest(req: StudioProductionRequestRow): void {
  getEvolveStore().productionRequests.push(req);
}

export function insertApproval(approval: MarketingApprovalRow): void {
  getEvolveStore().approvals.push(approval);
}

export function insertInsight(insight: MarketingInsightRow): void {
  getEvolveStore().insights.push(insight);
}

export function insertObjective(obj: MarketingObjectiveRow): void {
  getEvolveStore().objectives.push(obj);
}

export function updateObjective(id: string, patch: Partial<MarketingObjectiveRow>): MarketingObjectiveRow | undefined {
  const o = getEvolveStore().objectives.find((x) => x.id === id);
  if (o) Object.assign(o, patch, { updated_at: new Date().toISOString() });
  return o;
}

export function approveSubject(approvalId: string, decidedBy: string): void {
  const a = getEvolveStore().approvals.find((x) => x.id === approvalId);
  if (a) {
    a.status = 'APPROVED';
    a.decided_by = decidedBy;
    a.decided_at = new Date().toISOString();
  }
}

export function rejectSubject(approvalId: string, decidedBy: string, reason: string): void {
  const a = getEvolveStore().approvals.find((x) => x.id === approvalId);
  if (a) {
    a.status = 'REJECTED';
    a.decided_by = decidedBy;
    a.decided_at = new Date().toISOString();
    a.reason = reason;
  }
}

export { uuid as evolveUuid };
