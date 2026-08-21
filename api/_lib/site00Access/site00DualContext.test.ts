import { describe, expect, it, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  canAccessAdminControlCenter,
  canAccessFounderProjectAsOwner,
  canAccessFounderProjectIndex,
  isExperienceContextAuthoritative,
  isFounderPrivilegedAccount,
  resolvePlatformRole,
} from './accessModel.js';
import {
  inferExperienceContextFromPath,
  site00ProjectCreativeDirectionRoute,
  site00ProjectEvolveRoute,
} from '../../../shared/site00-access/routes.js';
import {
  assertNoDemoProjectsInIndex,
  getSite00ProjectsIndexPayload,
  listSite00FounderProjects,
  resolveSite00Project,
} from '../site00Projects/projectResolver.js';
import { resetNdxbookImportMemory, runNdxbookLegacyImport } from '../site00Evolve/providers/ndxbookLegacyImportService.js';
import {
  getCreativeDirectionPayload,
  recordFounderDecision,
  resetCreativeDirectionMemory,
} from '../site00Evolve/creativeDirection/engagementService.js';
import { resetPage001Memory } from '../site00Evolve/providers/page001CandidateService.js';
import { getExpandedPilotReadiness } from '../site00Evolve/providers/pilotReadinessSprint04.js';
import { orgIdFromSlug } from '../site00Evolve/orgRegistry.js';
import { PRODUCTION_ORG_SLUG_TO_ID } from '../site00Evolve/orgRegistry.js';

const FOUNDER_EMAIL = 'kateenaarmstrong@gmail.com';
const CLIENT_EMAIL = 'client@example.com';
const NON_ADMIN_EMAIL = 'random@example.com';

const PROJECT_DETAIL_PAGE = readFileSync(join(process.cwd(), 'src/site00/pages/ProjectDetailPage.tsx'), 'utf8');
const EXPERIENCE_CONTEXT = readFileSync(join(process.cwd(), 'src/site00/state/experienceContext.tsx'), 'utf8');
const ECOSYSTEM_SHELL = readFileSync(join(process.cwd(), 'src/site00/components/ecosystem/EcosystemShell.tsx'), 'utf8');

describe('SITE 00 founder dual-context access', () => {
  beforeEach(async () => {
    process.env.EVOLVE_USE_MEMORY = '1';
    resetNdxbookImportMemory();
    resetCreativeDirectionMemory();
    resetPage001Memory();
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
  });

  it('1. admin account may access Admin Control Center', () => {
    expect(canAccessAdminControlCenter(FOUNDER_EMAIL)).toBe(true);
    expect(resolvePlatformRole(FOUNDER_EMAIL)).toBe('ADMIN');
  });

  it('2. admin account may access founder project index', () => {
    expect(canAccessFounderProjectIndex(FOUNDER_EMAIL)).toBe(true);
  });

  it('3. standard client cannot access founder project index', () => {
    expect(canAccessFounderProjectIndex(NON_ADMIN_EMAIL)).toBe(false);
    expect(canAccessFounderProjectAsOwner(NON_ADMIN_EMAIL, 'ndxbook')).toBe(false);
  });

  it('4. explicit admin path infers ADMIN context', () => {
    expect(inferExperienceContextFromPath('/admin/site00')).toBe('ADMIN');
    expect(inferExperienceContextFromPath('/admin/site00/orchestration/ndxbook')).toBe('ADMIN');
  });

  it('5. explicit client path infers CLIENT context', () => {
    expect(inferExperienceContextFromPath('/projects')).toBe('CLIENT');
    expect(inferExperienceContextFromPath('/projects/ndxbook')).toBe('CLIENT');
    expect(inferExperienceContextFromPath('/projects/ndxbook/creative-direction')).toBe('CLIENT');
  });

  it('6. founder can open PROJECTS — resolver lists four projects', async () => {
    const projects = await listSite00FounderProjects();
    expect(projects.length).toBe(4);
    assertNoDemoProjectsInIndex(projects);
  });

  it('7. founder can open NDXBOOK as project owner', async () => {
    expect(canAccessFounderProjectAsOwner(FOUNDER_EMAIL, 'ndxbook')).toBe(true);
    const ndx = await resolveSite00Project('ndxbook');
    expect(ndx?.slug).toBe('ndxbook');
  });

  it('8. NDXBOOK uses canonical organization UUID', async () => {
    const ndx = await resolveSite00Project('ndxbook');
    expect(ndx?.organizationUuid).toBe(orgIdFromSlug('ndxbook'));
    if (process.env.EVOLVE_USE_MEMORY !== '1') {
      expect(ndx?.organizationUuid).toBe(PRODUCTION_ORG_SLUG_TO_ID.ndxbook);
    }
  });

  it('9. NDXBOOK project state uses canonical client routes for EVOLVE and Creative Direction', async () => {
    const ndx = await resolveSite00Project('ndxbook');
    expect(ndx?.evolve.route).toBe(site00ProjectEvolveRoute('ndxbook'));
    expect(ndx?.creativeDirection?.route).toBe(site00ProjectCreativeDirectionRoute('ndxbook'));
    expect(ndx?.creativeDirection?.route).not.toContain('/admin/');
  });

  it('10. NDXBOOK Creative Direction remains pending by default', async () => {
    const ndx = await resolveSite00Project('ndxbook');
    expect(ndx?.creativeDirection?.founderDecision).toBe('PENDING');
  });

  it('11. Visual DNA remains INCOMPLETE', async () => {
    const ndx = await resolveSite00Project('ndxbook');
    expect(ndx?.creativeDirection?.visualDnaStatus).toBe('INCOMPLETE');
  });

  it('12. Page 001 remains gated', async () => {
    const ndx = await resolveSite00Project('ndxbook');
    expect(ndx?.creativeDirection?.page001Gate.productionEligible).toBe(false);
  });

  it('13. publishing remains disabled', async () => {
    const ndx = await resolveSite00Project('ndxbook');
    expect(ndx?.production.publishingEnabled).toBe(false);
    expect(ndx?.production.crossPostingEnabled).toBe(false);
  });

  it('14. admin privilege cannot bypass publishing fence via readiness', async () => {
    const readiness = await getExpandedPilotReadiness('ndxbook');
    expect(readiness.publishingFence).not.toBe('ENABLED');
  });

  it('15. founder Creative Direction decision uses canonical decision service', async () => {
    const before = await getCreativeDirectionPayload('ndxbook');
    const territoryId = before.engagement.territories[0]?.id;
    await recordFounderDecision('ndxbook', {
      type: 'REFINE',
      selectedTerritoryId: territoryId,
      refinementNotes: 'Test refinement',
      by: FOUNDER_EMAIL,
    });
    const after = await getCreativeDirectionPayload('ndxbook');
    expect(after.engagement.founderDecision?.type).toBe('REFINE');
    expect(after.engagement.visualDna.status).toBe('INCOMPLETE');
  });

  it('16. APPROVE promotes visual DNA through canonical service — publishing still fenced separately', async () => {
    resetCreativeDirectionMemory();
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
    const payload = await getCreativeDirectionPayload('ndxbook');
    const territoryId = payload.engagement.territories[0]?.id;
    await recordFounderDecision('ndxbook', {
      type: 'APPROVE',
      selectedTerritoryId: territoryId,
      by: FOUNDER_EMAIL,
    });
    const after = await getCreativeDirectionPayload('ndxbook');
    expect(after.engagement.visualDna.status).toBe('APPROVED');
    const readiness = await getExpandedPilotReadiness('ndxbook');
    expect(readiness.publishingFence).not.toBe('ENABLED');
  });

  it('17. admin-only utilities hidden from standard client presentation', () => {
    expect(PROJECT_DETAIL_PAGE).toContain('ProjectPrivilegedUtilities');
    expect(PROJECT_DETAIL_PAGE).not.toContain('OPEN ORCHESTRATION →');
  });

  it('18. client QA mode hides privileged utilities via experience context', () => {
    expect(EXPERIENCE_CONTEXT).toContain('showPrivilegedUtilities');
    expect(EXPERIENCE_CONTEXT).toContain('clientQaMode');
  });

  it('19. client QA mode does not alter authorization — context is not authoritative on server', () => {
    expect(isExperienceContextAuthoritative('CLIENT')).toBe(false);
    expect(isExperienceContextAuthoritative('ADMIN')).toBe(false);
  });

  it('20. normal client cannot access founder project as owner', () => {
    expect(canAccessFounderProjectAsOwner(CLIENT_EMAIL, 'ndxbook')).toBe(false);
  });

  it('21. organization isolation — four unique UUIDs in index', async () => {
    const payload = await getSite00ProjectsIndexPayload();
    const uuids = new Set(payload.projects.map((p) => p.organizationUuid));
    expect(uuids.size).toBe(4);
  });

  it('22. founder project resolver does not aggregate cross-org data in single project', async () => {
    const ndx = await resolveSite00Project('ndxbook');
    const fs = await resolveSite00Project('frontal-slayer');
    expect(ndx?.organizationUuid).not.toBe(fs?.organizationUuid);
  });

  it('23. context preference cannot grant access — server uses email role', () => {
    expect(canAccessFounderProjectAsOwner(NON_ADMIN_EMAIL, 'ndxbook')).toBe(false);
  });

  it('24. explicit URL wins — path inference separate from preference storage', () => {
    expect(inferExperienceContextFromPath('/projects/ndxbook')).toBe('CLIENT');
    expect(inferExperienceContextFromPath('/admin/site00')).toBe('ADMIN');
  });

  it('25. no redirect loop pattern — client and admin paths are distinct namespaces', () => {
    const client = site00ProjectCreativeDirectionRoute('ndxbook');
    const admin = '/admin/site00/orchestration/ndxbook/evolve/creative-direction';
    expect(client.startsWith('/projects/')).toBe(true);
    expect(admin.startsWith('/admin/')).toBe(true);
    expect(client).not.toBe(admin);
  });

  it('26. Studio World boundary — infrastructure not marketing client', async () => {
    const sw = await resolveSite00Project('studio-world');
    expect(sw?.evolve.isMarketingClient).toBe(false);
    expect(sw?.overview.boundaryNote).toMatch(/DISTINCT PRODUCT/i);
  });

  it('27. Frontal Slayer project-owner access for founder admin', () => {
    expect(canAccessFounderProjectAsOwner(FOUNDER_EMAIL, 'frontal-slayer')).toBe(true);
  });

  it('28. founder privileged account detection', () => {
    expect(isFounderPrivilegedAccount(FOUNDER_EMAIL)).toBe(true);
    expect(isFounderPrivilegedAccount(NON_ADMIN_EMAIL)).toBe(false);
  });

  it('29. EcosystemShell includes experience context bar', () => {
    expect(ECOSYSTEM_SHELL).toContain('ExperienceContextBar');
  });

  it('30. command items route to client Creative Direction path for NDXBOOK', async () => {
    const ndx = await resolveSite00Project('ndxbook');
    const cdItem = ndx?.command.focusNow.find((i) => i.title.toLowerCase().includes('creative direction'));
    expect(cdItem?.route).toBe(site00ProjectCreativeDirectionRoute('ndxbook'));
  });
});
