import { describe, expect, it, beforeEach } from 'vitest';
import { resetEvolveStore, getEvolveStore, getChannelsByOrgId } from './memoryStore.js';
import { orgIdFromSlug } from './orgRegistry.js';
import {
  getEvolveOverview,
  runAssessmentForOrg,
  generateManifestForOrg,
  createCampaign,
  attemptCampaignLive,
  requestStudioProduction,
  createInsightFromPerformance,
  requestApproval,
  approveSubject,
} from './evolveService.js';
import { promoteEntryClass } from './contentBrain.js';
import { buildEvolveCommandItems } from './commandIntegration.js';
import { getPrimaryFamily } from '../../../shared/site00-email/registry/family-map.js';

describe('EVOLVE Marketing OS', () => {
  beforeEach(() => {
    resetEvolveStore();
  });

  it('marketing profile belongs to correct org', async () => {
    const site = await getEvolveOverview('site-00');
    const aio = await getEvolveOverview('all-in-one-enterprises');
    expect(site.organizationName).toBe('SITE 00');
    expect(aio.organizationName).toBe('ALL IN ONE ENTERPRISES');
    expect(site.currentObjective).toContain('Platform growth');
    expect(aio.currentObjective).toContain('service clients');
  });

  it('objectives differ by organization', async () => {
    const fs = await getEvolveOverview('frontal-slayer');
    const aio = await getEvolveOverview('all-in-one-enterprises');
    expect(fs.currentObjective).toContain('launch marketing');
    expect(aio.currentObjective).toContain('service clients');
  });

  it('NOT_REQUIRED channel does not reduce health as blocker', async () => {
    const assessment = await runAssessmentForOrg('site-00');
    const tiktok = assessment.channel_coverage.TIKTOK;
    expect(tiktok).toBe('NOT_REQUIRED');
    expect(assessment.blockers.some((b) => b.label.includes('TIKTOK'))).toBe(false);
  });

  it('DEFERRED channel does not become blocker', async () => {
    const assessment = await runAssessmentForOrg('all-in-one-enterprises');
    const ig = assessment.channel_coverage.INSTAGRAM;
    expect(ig).toBe('DEFERRED');
    expect(assessment.blockers.some((b) => b.label.includes('INSTAGRAM'))).toBe(false);
    expect(assessment.next_best_actions.some((a) => a.category === 'DEFERRED')).toBe(true);
  });

  it('BLOCKED required channel becomes actionable', async () => {
    const orgId = orgIdFromSlug('all-in-one-enterprises')!;
    const channels = getChannelsByOrgId(orgId);
    const email = channels.find((c) => c.channel_key === 'EMAIL')!;
    email.channel_state = 'BLOCKED';
    email.is_required = true;
    const assessment = await runAssessmentForOrg('all-in-one-enterprises');
    expect(assessment.blockers.length).toBeGreaterThan(0);
  });

  it('launch deferral appears in EVOLVE roadmap', async () => {
    const overview = await getEvolveOverview('all-in-one-enterprises');
    expect(overview.deferredItems).toContain('Social Marketing');
  });

  it('marketing manifest differs by organization', async () => {
    const fs = await generateManifestForOrg('frontal-slayer');
    const aio = await generateManifestForOrg('all-in-one-enterprises');
    const fsKeys = fs.items.map((i) => i.item_key);
    const aioKeys = aio.items.map((i) => i.item_key);
    expect(fsKeys).toContain('social_launch');
    expect(aioKeys).not.toContain('social_launch');
    expect(aioKeys).toContain('search_foundation');
    expect(fsKeys).not.toContain('search_foundation');
  });

  it('AIO social remains DEFERRED_BY_OWNER', async () => {
    const orgId = orgIdFromSlug('all-in-one-enterprises')!;
    const social = getChannelsByOrgId(orgId).filter((c) =>
      ['INSTAGRAM', 'TIKTOK', 'FACEBOOK'].includes(c.channel_key),
    );
    expect(social.every((c) => c.channel_state === 'DEFERRED' && c.owner_decision === 'DEFERRED_BY_OWNER')).toBe(true);
  });

  it('Studio World is infrastructure not marketing client', async () => {
    const sw = await getEvolveOverview('studio-world');
    expect(sw.isMarketingClient).toBe(false);
    expect(sw.marketingHealth).toBe('NOT_APPLICABLE');
  });

  it('campaign cannot become LIVE merely from asset completion', async () => {
    const campaign = await createCampaign('frontal-slayer', { campaign_key: 'test', title: 'Test' });
    const result = await attemptCampaignLive(campaign.id, true);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('APPROVED');
  });

  it('production request retains campaign lineage', async () => {
    const campaign = await createCampaign('frontal-slayer', { campaign_key: 'prod-test', title: 'Prod Test' });
    const result = await requestStudioProduction({
      orgSlug: 'frontal-slayer',
      orgClassification: 'INTERNAL_BRAND',
      productionType: 'CAMPAIGN_KEY_VISUALS',
      campaignId: campaign.id,
      brief: 'Hero visuals',
    });
    expect(result.ok).toBe(true);
    expect(result.request?.campaign_id).toBe(campaign.id);
  });

  it('production request respects Studio World governance', async () => {
    const result = await requestStudioProduction({
      orgSlug: 'frontal-slayer',
      orgClassification: 'INTERNAL_BRAND',
      productionType: 'PRODUCT_PHOTOGRAPHY',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('BLOCKED_BY_GOVERNANCE');
  });

  it('recommendation does not auto-approve', async () => {
    const insight = await createInsightFromPerformance('frontal-slayer', 'Test insight', 'Summary', [{ metric: 'ctr' }]);
    expect(insight.recommendation_status).toBe('SUGGESTED');
    const approval = await requestApproval('frontal-slayer', 'insight', insight.id, 'STRATEGY');
    expect(approval.status).toBe('PENDING');
  });

  it('Content Brain IDEA does not become CANON without approval', () => {
    const result = promoteEntryClass('frontal-slayer', 'cb-00000000-0000-4000-8000-000000000002', 'CANONICAL');
    expect(result.ok).toBe(false);
  });

  it('performance insight retains evidence', async () => {
    const evidence = [{ campaign: 'c1', metric: 'engagement', value: 0.12 }];
    const insight = await createInsightFromPerformance('frontal-slayer', 'Educational wins', 'Educational posts outperform', evidence);
    expect(insight.evidence).toEqual(evidence);
    expect(insight.confidence).toBe('LOW');
  });

  it('missing analytics produces UNKNOWN not fabricated performance', async () => {
    const assessment = await runAssessmentForOrg('site-00');
    expect(assessment.measurement_readiness.analytics).toContain('UNKNOWN');
    expect(assessment.measurement_readiness.email_performance).toContain('UNKNOWN');
  });

  it('next best action respects blockers', async () => {
    const orgId = orgIdFromSlug('all-in-one-enterprises')!;
    const email = getChannelsByOrgId(orgId).find((c) => c.channel_key === 'EMAIL')!;
    email.channel_state = 'BLOCKED';
    email.is_required = true;
    const assessment = await runAssessmentForOrg('all-in-one-enterprises');
    const blocked = assessment.next_best_actions.find((a) => a.category === 'BLOCKED');
    expect(blocked).toBeDefined();
  });

  it('organization isolation in store', async () => {
    const siteChannels = getChannelsByOrgId(orgIdFromSlug('site-00')!);
    const aioChannels = getChannelsByOrgId(orgIdFromSlug('all-in-one-enterprises')!);
    expect(siteChannels.every((c) => c.organization_id === orgIdFromSlug('site-00'))).toBe(true);
    expect(aioChannels.every((c) => c.organization_id === orgIdFromSlug('all-in-one-enterprises'))).toBe(true);
    expect(siteChannels.some((c) => c.channel_key === 'INSTAGRAM' && c.channel_state === 'DEFERRED')).toBe(false);
  });

  it('evolve command integration produces org-specific items', async () => {
    await runAssessmentForOrg('frontal-slayer');
    await runAssessmentForOrg('all-in-one-enterprises');
    const cmd = await buildEvolveCommandItems();
    expect(cmd.items.some((i) => i.organizationSlug === 'frontal-slayer')).toBe(true);
    expect(cmd.items.some((i) => i.organizationSlug === 'all-in-one-enterprises')).toBe(true);
    expect(cmd.deferred.some((i) => i.organizationSlug === 'all-in-one-enterprises')).toBe(true);
  });

  it('AI recommendation approval requires human action', async () => {
    const approval = await requestApproval('site-00', 'strategy', 'strat-1', 'STRATEGY');
    expect(getEvolveStore().approvals.find((a) => a.id === approval.id)?.status).toBe('PENDING');
    await approveSubject(approval.id, 'admin@site00.com');
    expect(getEvolveStore().approvals.find((a) => a.id === approval.id)?.status).toBe('APPROVED');
  });
});

describe('email pack regression', () => {
  it('sign-in-link still maps to ACCESS_SECURITY', () => {
    expect(getPrimaryFamily('sign-in-link')).toBe('ACCESS_SECURITY');
  });
});
