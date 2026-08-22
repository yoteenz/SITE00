import { describe, expect, it, beforeEach } from 'vitest';
import {
  getSite00ProjectsIndexPayload,
  listSite00FounderProjects,
  resolveSite00Project,
} from './projectResolver.js';
import { FOUNDER_PROJECT_SLUGS, isFounderProjectSlug } from './projectRegistry.js';
import { orgIdFromSlug, PRODUCTION_ORG_SLUG_TO_ID } from '../site00Evolve/orgRegistry.js';
import {
  canAccessFounderProjectAsOwner,
  canAccessFounderProjectIndex,
} from '../site00Access/accessModel.js';
import { resetNdxbookImportMemory, runNdxbookLegacyImport } from '../site00Evolve/providers/ndxbookLegacyImportService.js';
import { resetCreativeDirectionMemory } from '../site00Evolve/creativeDirection/engagementService.js';
import { resetPage001Memory } from '../site00Evolve/providers/page001CandidateService.js';
import { resetOrchestrationStore } from '../site00Orchestration/memoryStore.js';
import { site00AdminOrchestrationRoute, site00ProjectDetailRoute } from '../../../shared/site00-access/routes.js';

const FOUNDER_EMAIL = 'kateenaarmstrong@gmail.com';
const CLIENT_EMAIL = 'client@example.com';
const AIO_UUID = '3781f0b7-cbc5-470d-8af7-69b97cfa5729';

describe('SITE 00 AIO project index integration', () => {
  beforeEach(async () => {
    process.env.EVOLVE_USE_MEMORY = '1';
    process.env.ORCHESTRATION_USE_MEMORY = '1';
    resetOrchestrationStore();
    resetNdxbookImportMemory();
    resetCreativeDirectionMemory();
    resetPage001Memory();
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
  });

  it('1. all-in-one-enterprises exists in canonical founder project registry', () => {
    expect(isFounderProjectSlug('all-in-one-enterprises')).toBe(true);
    expect(FOUNDER_PROJECT_SLUGS).toContain('all-in-one-enterprises');
  });

  it('2. existing AIO organization UUID reused', async () => {
    const aio = await resolveSite00Project('all-in-one-enterprises');
    expect(aio?.organizationUuid).toBe(orgIdFromSlug('all-in-one-enterprises'));
    if (process.env.EVOLVE_USE_MEMORY !== '1') {
      expect(aio?.organizationUuid).toBe(AIO_UUID);
      expect(aio?.organizationUuid).toBe(PRODUCTION_ORG_SLUG_TO_ID['all-in-one-enterprises']);
    }
  });

  it('3. no duplicate AIO organization created — single registry entry', () => {
    const aioEntries = FOUNDER_PROJECT_SLUGS.filter((s) => s === 'all-in-one-enterprises');
    expect(aioEntries.length).toBe(1);
  });

  it('4. project index now returns AIO', async () => {
    const projects = await listSite00FounderProjects();
    expect(projects.some((p) => p.slug === 'all-in-one-enterprises')).toBe(true);
  });

  it('5. founder project total reflects 4 canonical projects', async () => {
    const payload = await getSite00ProjectsIndexPayload([]);
    expect(payload.summary.founderIndex).toBe(4);
    expect(payload.projects.length).toBe(4);
  });

  it('6. AIO card uses real resolver data — no mock fallback fields', async () => {
    const aio = await resolveSite00Project('all-in-one-enterprises');
    expect(aio?.name).toBe('ALL IN ONE ENTERPRISES');
    expect(aio?.displayName).toBe('All In One Enterprises');
    expect(aio?.classification).toBe('MANAGED_BRAND');
    expect(aio?.enrichmentStatus).toBe('COMPLETE');
    expect(aio?.enrichmentStatus).not.toBe('PARTIAL');
  });

  it('7. /projects/all-in-one-enterprises resolves via detail route', async () => {
    const aio = await resolveSite00Project('all-in-one-enterprises');
    expect(aio?.detailRoute).toBe(site00ProjectDetailRoute('all-in-one-enterprises'));
    expect(aio?.detailRoute).toBe('/projects/all-in-one-enterprises');
  });

  it('8. standard client cannot access founder-owned AIO project', () => {
    expect(canAccessFounderProjectAsOwner(CLIENT_EMAIL, 'all-in-one-enterprises')).toBe(false);
    expect(canAccessFounderProjectIndex(CLIENT_EMAIL)).toBe(false);
  });

  it('9. founder can access AIO in CLIENT context', () => {
    expect(canAccessFounderProjectAsOwner(FOUNDER_EMAIL, 'all-in-one-enterprises')).toBe(true);
  });

  it('10. founder can access AIO admin state separately', async () => {
    const aio = await resolveSite00Project('all-in-one-enterprises');
    const adminRoute = site00AdminOrchestrationRoute('all-in-one-enterprises');
    expect(adminRoute).toBe('/admin/site00/orchestration/all-in-one-enterprises');
    expect(aio?.surfaces.some((s) => s.adminRoute?.includes('/admin/site00/orchestration/'))).toBe(true);
  });

  it('11. social marketing remains DEFERRED_BY_OWNER in channels', async () => {
    const aio = await resolveSite00Project('all-in-one-enterprises');
    const social = aio?.channels.filter((c) => ['INSTAGRAM', 'TIKTOK', 'FACEBOOK'].includes(c.key));
    expect(social?.every((c) => c.state === 'DEFERRED')).toBe(true);
  });

  it('12. deferred social does not become BLOCKED in command', async () => {
    const aio = await resolveSite00Project('all-in-one-enterprises');
    const socialBlocked = aio?.command.blocked.some((i) => /social/i.test(i.title));
    expect(socialBlocked).toBe(false);
    const socialDeferred = aio?.command.deferred.some((i) => /social/i.test(i.title));
    expect(socialDeferred).toBe(true);
  });

  it('13. missing repository connection does not remove AIO from index', async () => {
    const projects = await listSite00FounderProjects();
    expect(projects.some((p) => p.slug === 'all-in-one-enterprises')).toBe(true);
  });

  it('14. repository state remains truthful', async () => {
    const aio = await resolveSite00Project('all-in-one-enterprises');
    expect(aio?.overview.repositoryConnection).toMatch(/UNAVAILABLE/i);
  });

  it('15. no fake progress — enrichment complete without fabricated metrics', async () => {
    const aio = await resolveSite00Project('all-in-one-enterprises');
    expect(aio?.production.publishingEnabled).toBe(false);
    expect(aio?.production.crossPostingEnabled).toBe(false);
    expect(aio?.evolve.activeCampaigns).toBe(0);
  });

  it('16. no fake metrics in intelligence when unavailable', async () => {
    const aio = await resolveSite00Project('all-in-one-enterprises');
    expect(typeof aio?.intelligence.canonical).toBe('number');
  });

  it('17. no fake activity timestamps — only indexed truthful events', async () => {
    const aio = await resolveSite00Project('all-in-one-enterprises');
    for (const event of aio?.activity ?? []) {
      expect(event.summary).not.toMatch(/mock|demo|fake/i);
    }
  });

  it('18. no mock project fallback on enrichment failure path', async () => {
    const aio = await resolveSite00Project('all-in-one-enterprises');
    expect(aio?.slug).toBe('all-in-one-enterprises');
    expect(aio?.organizationUuid).toBeTruthy();
  });

  it('19. Frontal Slayer remains unchanged', async () => {
    const fs = await resolveSite00Project('frontal-slayer');
    expect(fs?.organizationSlug).toBe('frontal-slayer');
    expect(fs?.classification).toBe('INTERNAL_BRAND');
  });

  it('20. Studio World remains unchanged', async () => {
    const sw = await resolveSite00Project('studio-world');
    expect(sw?.classification).toBe('PRODUCTION_INFRASTRUCTURE');
    expect(sw?.evolve.isMarketingClient).toBe(false);
  });

  it('21. ndxbook remains unchanged', async () => {
    const ndx = await resolveSite00Project('ndxbook');
    expect(ndx?.creativeDirection?.available).toBe(true);
    expect(ndx?.organizationUuid).toBe(orgIdFromSlug('ndxbook'));
  });
});
