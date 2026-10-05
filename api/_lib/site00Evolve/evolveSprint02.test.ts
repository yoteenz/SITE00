import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { resetEvolveStore } from './memoryStore.js';
import { resetStoreModeCache, resolveStoreMode, useMemoryStore, EvolveStoreUnavailableError } from './storeAdapter.js';
import { EVOLVE_EXPECTED_TABLES } from './supabaseStore.js';
import { orgIdFromSlug, PRODUCTION_ORG_SLUG_TO_ID } from './orgRegistry.js';
import {
  createCampaign,
  attemptCampaignLive,
  transitionCampaignStatus,
  createCampaignFromManifestItem,
  generateManifestForOrg,
  getCampaignDetail,
  getEmailOpsPayload,
  getSocialOpsPayload,
} from './evolveService.js';
import { canTransitionCampaign } from './campaignLifecycle.js';
import { requestStudioProduction } from './productionBridge.js';
import { assertOrgRecord } from './storeAdapter.js';
import { getPrimaryFamily } from '../../../shared/site00-email/registry/family-map.js';

describe('EVOLVE Sprint 02 — persistence layer', () => {
  beforeEach(() => {
    vi.stubEnv('VITEST', 'true');
    vi.stubEnv('EVOLVE_USE_MEMORY', '');
    resetEvolveStore();
    resetStoreModeCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetStoreModeCache();
  });

  it('schema defines 21 expected EVOLVE tables', () => {
    expect(EVOLVE_EXPECTED_TABLES.length).toBe(21);
    expect(EVOLVE_EXPECTED_TABLES).toContain('site00_marketing_campaigns');
    expect(EVOLVE_EXPECTED_TABLES).toContain('site00_campaign_events');
    expect(EVOLVE_EXPECTED_TABLES).toContain('site00_marketing_insights');
  });

  it('uses memory store in vitest', async () => {
    expect(useMemoryStore()).toBe(true);
    expect(await resolveStoreMode()).toBe('memory');
  });

  it('production mode fails loudly without Supabase — no silent memory fallback', async () => {
    vi.stubEnv('VITEST', '');
    vi.stubEnv('EVOLVE_USE_MEMORY', '');
    resetStoreModeCache();
    const { hasSupabaseServiceRole } = await import('../supabase.js');
    if (hasSupabaseServiceRole()) {
      // In CI/cloud with real Supabase credentials, verify mode is supabase not memory
      expect(await resolveStoreMode()).toBe('supabase');
    } else {
      await expect(resolveStoreMode()).rejects.toBeInstanceOf(EvolveStoreUnavailableError);
    }
    vi.stubEnv('VITEST', 'true');
    resetStoreModeCache();
  });

  it('real production org IDs differ from fixture IDs', () => {
    const fixtureId = 'org-00000000-0000-4000-8000-000000000002';
    expect(PRODUCTION_ORG_SLUG_TO_ID['frontal-slayer']).not.toBe(fixtureId);
    expect(PRODUCTION_ORG_SLUG_TO_ID['frontal-slayer']).toBe('b5b9c48a-f9e0-41e9-afd0-8478600b94fd');
  });

  it('campaign persists in memory store', async () => {
    vi.stubEnv('EVOLVE_USE_MEMORY', '1');
    resetStoreModeCache();
    resetEvolveStore();
    const { getCampaignsByOrgId, getCampaignById } = await import('./memoryStore.js');
    const orgId = orgIdFromSlug('frontal-slayer')!;
    const before = getCampaignsByOrgId(orgId).length;
    const campaign = await createCampaign('frontal-slayer', { campaign_key: 'persist-1', title: 'Persist Test' });
    expect(getCampaignsByOrgId(orgId).length).toBe(before + 1);
    expect(getCampaignById(campaign.id)?.title).toBe('Persist Test');
    const detail = await getCampaignDetail('frontal-slayer', campaign.id);
    expect(detail?.campaign.title).toBe('Persist Test');
  });

  it('campaign org isolation rejects cross-org access', async () => {
    const campaign = await createCampaign('frontal-slayer', { campaign_key: 'iso-1', title: 'FS Only' });
    const detail = await getCampaignDetail('site-00', campaign.id);
    expect(detail).toBeNull();
  });

  it('invalid lifecycle transition rejected server-side', () => {
    const result = canTransitionCampaign('IDEA', 'LIVE', { hasLiveEvidence: false });
    expect(result.ok).toBe(false);
  });

  it('approval required before APPROVED', () => {
    const result = canTransitionCampaign('AWAITING_APPROVAL', 'APPROVED', { hasRequiredApproval: false });
    expect(result.ok).toBe(false);
  });

  it('asset existence does not mark campaign LIVE', async () => {
    const campaign = await createCampaign('frontal-slayer', { campaign_key: 'live-guard', title: 'Live Guard' });
    const result = await attemptCampaignLive(campaign.id, true);
    expect(result.ok).toBe(false);
  });

  it('READY_TO_PUBLISH calendar status distinct from PUBLISHED', async () => {
    const { getCalendarByOrgId } = await import('./memoryStore.js');
    const items = getCalendarByOrgId(orgIdFromSlug('frontal-slayer')!);
    const statuses = new Set(items.map((i) => i.status));
    expect(statuses.has('PUBLISHED')).toBe(false);
    expect(items.some((i) => i.status === 'IN_PRODUCTION' || i.status === 'PLANNED')).toBe(true);
  });

  it('marketing email persists separately from transactional email family', async () => {
    const payload = await getEmailOpsPayload('frontal-slayer');
    expect(payload.items.length).toBeGreaterThan(0);
    expect(getPrimaryFamily('sign-in-link')).toBe('ACCESS_SECURITY');
    expect(payload.providerState).toBe('NOT_CONNECTED');
  });

  it('social content persists per platform independently', async () => {
    const payload = await getSocialOpsPayload('frontal-slayer');
    expect(payload.items.length).toBeGreaterThan(0);
    const platforms = new Set(payload.items.map((i) => i.platform));
    expect(platforms.has('INSTAGRAM')).toBe(true);
  });

  it('AIO social remains deferred and not a blocker', async () => {
    const payload = await getSocialOpsPayload('all-in-one-enterprises');
    expect(payload.deferredByOwner.length).toBeGreaterThan(0);
    expect(payload.roadmapDeferred.some((r) => r.title.includes('Social'))).toBe(true);
  });

  it('blocked governance capability cannot reach approved dispatch', async () => {
    const result = await requestStudioProduction({
      orgSlug: 'frontal-slayer',
      orgClassification: 'INTERNAL_BRAND',
      productionType: 'PRODUCT_PHOTOGRAPHY',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('BLOCKED_BY_GOVERNANCE');
  });

  it('manifest item → campaign preserves lineage', async () => {
    await generateManifestForOrg('frontal-slayer');
    const campaign = await createCampaignFromManifestItem('frontal-slayer', 'lifecycle_email');
    expect((campaign.metadata as Record<string, unknown>).source).toBe('MARKETING_MANIFEST');
    expect((campaign.metadata as Record<string, unknown>).manifest_item_key).toBe('lifecycle_email');
  });

  it('cross-org record access denied via assertOrgRecord', async () => {
    const campaign = await createCampaign('frontal-slayer', { campaign_key: 'cross', title: 'Cross' });
    const wrongOrg = orgIdFromSlug('site-00')!;
    await expect(assertOrgRecord(wrongOrg, campaign, 'Campaign')).rejects.toThrow(/Cross-organization/);
  });

  it('transitionCampaignStatus enforces lifecycle', async () => {
    const campaign = await createCampaign('site-00', { campaign_key: 'trans', title: 'Trans' });
    const result = await transitionCampaignStatus('site-00', campaign.id, 'LIVE');
    expect(result.ok).toBe(false);
  });
});
