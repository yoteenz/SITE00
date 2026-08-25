import { describe, expect, it, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  assertNoDemoProjectsInIndex,
  getSite00ProjectsIndexPayload,
  listSite00FounderProjects,
  resolveSite00Project,
  DEMO_PROJECT_NAMES,
} from './projectResolver.js';
import { FOUNDER_PROJECT_SLUGS, isFounderProjectSlug } from './projectRegistry.js';
import { orgIdFromSlug } from '../site00Evolve/orgRegistry.js';
import { resetNdxbookImportMemory, runNdxbookLegacyImport } from '../site00Evolve/providers/ndxbookLegacyImportService.js';
import { resetCreativeDirectionMemory } from '../site00Evolve/creativeDirection/engagementService.js';
import { resetPage001Memory } from '../site00Evolve/providers/page001CandidateService.js';
import { PRODUCTION_ORG_SLUG_TO_ID } from '../site00Evolve/orgRegistry.js';

const PROJECTS_PAGE = readFileSync(
  join(process.cwd(), 'src/site00/pages/ProjectsPage.tsx'),
  'utf8',
);

describe('SITE 00 real project index + command surface', () => {
  beforeEach(async () => {
    process.env.EVOLVE_USE_MEMORY = '1';
    resetNdxbookImportMemory();
    resetCreativeDirectionMemory();
    resetPage001Memory();
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
  });

  it('1. founder index lists real projects — no demo names', async () => {
    const projects = await listSite00FounderProjects();
    const founderProjects = projects.filter((p) => isFounderProjectSlug(p.slug));
    expect(founderProjects.length).toBe(4);
    assertNoDemoProjectsInIndex(projects);
    for (const name of DEMO_PROJECT_NAMES) {
      expect(projects.some((p) => p.name.includes(name))).toBe(false);
    }
  });

  it('2. all founder slugs present (client projects may also appear)', async () => {
    const projects = await listSite00FounderProjects();
    const slugs = projects.map((p) => p.slug);
    for (const founderSlug of FOUNDER_PROJECT_SLUGS) {
      expect(slugs).toContain(founderSlug);
    }
  });

  it('3. NDXBOOK uses canonical UUID from org registry', async () => {
    const ndx = await resolveSite00Project('ndxbook');
    const expected = orgIdFromSlug('ndxbook');
    expect(ndx?.organizationUuid).toBe(expected);
    if (process.env.EVOLVE_USE_MEMORY !== '1') {
      expect(ndx?.organizationUuid).toBe(PRODUCTION_ORG_SLUG_TO_ID.ndxbook);
    }
  });

  it('4. no duplicate NDXBOOK — single registry entry', () => {
    expect(isFounderProjectSlug('ndxbook')).toBe(true);
    const ids = FOUNDER_PROJECT_SLUGS.filter((s) => s === 'ndxbook');
    expect(ids.length).toBe(1);
  });

  it('5. Frontal Slayer from real identity', async () => {
    const fs = await resolveSite00Project('frontal-slayer');
    expect(fs?.organizationSlug).toBe('frontal-slayer');
    expect(fs?.organizationUuid).toBe(orgIdFromSlug('frontal-slayer'));
    expect(fs?.classification).toBe('INTERNAL_BRAND');
  });

  it('6. Studio World from real identity with boundary', async () => {
    const sw = await resolveSite00Project('studio-world');
    expect(sw?.organizationSlug).toBe('studio-world');
    expect(sw?.classification).toBe('PRODUCTION_INFRASTRUCTURE');
    expect(sw?.overview.boundaryNote).toMatch(/DISTINCT PRODUCT/i);
    expect(sw?.evolve.isMarketingClient).toBe(false);
  });

  it('7. each project routes to detail page', async () => {
    const projects = await listSite00FounderProjects();
    for (const p of projects) {
      expect(p.detailRoute).toBe(`/projects/${p.slug}`);
      expect(p.detailRoute).not.toBe('#');
    }
  });

  it('8. NDXBOOK exposes Creative Direction engagement', async () => {
    const ndx = await resolveSite00Project('ndxbook');
    expect(ndx?.creativeDirection?.available).toBe(true);
    expect(ndx?.creativeDirection?.route).toBe('/projects/ndxbook/creative-direction');
    expect(ndx?.creativeDirection?.territoriesGenerated).toBe(true);
  });

  it('9. NDXBOOK Creative Direction awaiting founder decision by default', async () => {
    const ndx = await resolveSite00Project('ndxbook');
    expect(ndx?.creativeDirection?.founderDecision).toBe('PENDING');
  });

  it('10. Visual DNA remains INCOMPLETE until approval', async () => {
    const ndx = await resolveSite00Project('ndxbook');
    expect(ndx?.creativeDirection?.visualDnaStatus).toBe('INCOMPLETE');
    expect(ndx?.creativeDirection?.page001Gate.visualDnaApproved).toBe(false);
  });

  it('11. Page 001 remains gated', async () => {
    const ndx = await resolveSite00Project('ndxbook');
    expect(ndx?.creativeDirection?.page001Gate.productionEligible).toBe(false);
    expect(ndx?.production.page001?.visualApproval).toBe('NOT_APPROVED');
    expect(ndx?.production.page001?.publicationApproval).toBe('NOT_APPROVED');
  });

  it('12. publishing remains disabled for NDXBOOK', async () => {
    const ndx = await resolveSite00Project('ndxbook');
    expect(ndx?.production.publishingEnabled).toBe(false);
    expect(ndx?.production.crossPostingEnabled).toBe(false);
  });

  it('13. provider state is truthful — Instagram pilot, others locked for NDXBOOK', async () => {
    const ndx = await resolveSite00Project('ndxbook');
    const ig = ndx?.channels.find((c) => c.key === 'INSTAGRAM');
    expect(ig).toBeTruthy();
    const locked = ndx?.channels.filter((c) => c.key !== 'INSTAGRAM' && c.locked);
    expect((locked?.length ?? 0) > 0).toBe(true);
  });

  it('14. index payload preserves organization isolation per slug', async () => {
    const payload = await getSite00ProjectsIndexPayload();
    const uuids = new Set(payload.projects.map((p) => p.organizationUuid));
    const founderUuids = new Set(
      payload.projects.filter((p) => isFounderProjectSlug(p.slug)).map((p) => p.organizationUuid),
    );
    expect(founderUuids.size).toBe(4);
    expect(uuids.size).toBeGreaterThanOrEqual(4);
  });

  it('18. ProjectsPage does not import ecosystem seed data', () => {
    expect(PROJECTS_PAGE).not.toContain('useEcosystemData');
    expect(PROJECTS_PAGE).not.toContain('ECOSYSTEM_PROJECTS_SEED');
    expect(PROJECTS_PAGE).not.toContain('PROJECT_ACTIVITY_SEED');
    expect(PROJECTS_PAGE).toContain('useSite00ProjectsIndex');
  });

  it('19. failed state shows error — no silent demo fallback in ProjectsPage', () => {
    expect(PROJECTS_PAGE).toContain("state === 'error'");
    expect(PROJECTS_PAGE).not.toContain('ECOSYSTEM_PROJECTS_SEED');
    expect(PROJECTS_PAGE).not.toContain('northquarter');
  });

  it('20. NDXBOOK focus includes Creative Direction when import complete', async () => {
    const ndx = await resolveSite00Project('ndxbook');
    const hasCdFocus =
      ndx?.command.focusNow.some((i) => i.title.toLowerCase().includes('creative direction')) ||
      ndx?.focusNow?.toLowerCase().includes('creative direction');
    expect(hasCdFocus).toBe(true);
  });

  it('21. intelligence counts are computed not fabricated', async () => {
    const ndx = await resolveSite00Project('ndxbook');
    expect(typeof ndx?.intelligence.canonical).toBe('number');
    const total =
      (ndx?.intelligence.canonical ?? 0) +
      (ndx?.intelligence.reference ?? 0) +
      (ndx?.intelligence.ideas ?? 0) +
      (ndx?.intelligence.insights ?? 0);
    expect(ndx?.intelligence.available || total > 0).toBe(true);
  });

  it('22. Studio World boundary — no marketing client surfaces as live campaigns', async () => {
    const sw = await resolveSite00Project('studio-world');
    expect(sw?.evolve.activeCampaigns).toBe(0);
  });
});
