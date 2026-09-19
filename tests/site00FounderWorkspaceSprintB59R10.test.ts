/**
 * B5.9R10 — Client simulation selector + Jane Doe fixture tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildJaneDoeMemberships,
  buildJaneDoeSimulationContext,
  JANE_DOE_CLIENT_ID,
  JANE_DOE_PROJECT_IDS,
  isJaneDoeFixtureEnabled,
} from '../shared/site00-projects/clientSimulation/janeDoeFixture.js';
import {
  clientCanAccessProject,
  getClient,
  getClientProjectMemberships,
  getClientProjects,
  listClients,
  resetClientDirectoryForTests,
  searchClients,
  seedDemoClientFixtures,
} from '../shared/site00-projects/clientSimulation/clientDirectoryService.js';
import { resolveProjectsViewAccountIdentity } from '../shared/site00-projects/projectsAccountIdentityAdapter.js';
import { buildProjectsViewData } from '../shared/site00-projects/projectsViewDataAdapter.js';
import { buildProjectIndexItemsFromEntries } from '../shared/site00-projects/buildProjectIndexItems.js';
import { computeProjectIndexSummaryMetrics } from '../shared/site00-projects/projectIndexMetrics.js';
import {
  enterClientSimulation,
  selectSimulatedClient,
  createDefaultViewModeSession,
} from '../shared/site00-projects/projectViewMode.js';
import { resolveVisibleModules } from '../shared/site00-projects/projectCapabilityManifest.js';
import type { Site00ProjectIndexEntry } from '../shared/site00-projects/types.js';

const ROOT = join(import.meta.dirname, '..');

function syntheticEntry(slug: string, overrides: Partial<Site00ProjectIndexEntry> = {}): Site00ProjectIndexEntry {
  return {
    slug,
    name: slug.toUpperCase().replace(/-/g, ' '),
    displayName: slug.toUpperCase().replace(/-/g, ' '),
    organizationSlug: slug,
    organizationUuid: slug,
    classification: 'FOUNDER_PROJECT',
    currentSystem: 'SITE 00',
    currentPhase: 'ACTIVE',
    focusNow: null,
    lastActivity: null,
    surfaces: [],
    detailRoute: `/projects/${slug}`,
    ...overrides,
  };
}
const VIEW_STRIP = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectIndexViewStrip.tsx'), 'utf8');
const SELECTOR = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ClientSimulationSelector.tsx'), 'utf8');
const CSS = readFileSync(join(ROOT, 'src/site00/styles/site00-project-index.css'), 'utf8');
const INSPECTOR = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectsAccountIdentityInspector.tsx'), 'utf8');

function founderEntries() {
  return JANE_DOE_PROJECT_IDS.map((slug) => syntheticEntry(slug));
}

describe('B5.9R10 client simulation selector + Jane Doe fixture', () => {
  beforeEach(() => {
    resetClientDirectoryForTests();
    seedDemoClientFixtures();
  });

  it('1. client selector component exists', () => {
    expect(SELECTOR).toContain('ClientSimulationSelector');
    expect(VIEW_STRIP).toContain('<ClientSimulationSelector');
  });

  it('2. selector anchored to Client View control', () => {
    expect(VIEW_STRIP).toContain('site00-pidx-view-strip-wrap');
    expect(VIEW_STRIP).toContain('CLIENT VIEW');
    expect(CSS).toContain('site00-pidx-client-selector');
  });

  it('3. no duplicate Client View bar', () => {
    expect(VIEW_STRIP.match(/CLIENT VIEW/g)?.length).toBe(1);
    expect(VIEW_STRIP).not.toContain('ClientSimulationBanner');
  });

  it('4. client internal search exists', () => {
    expect(SELECTOR).toContain('SEARCH CLIENTS');
    expect(SELECTOR).toContain('type="search"');
  });

  it('5–7. search matches first, last, full name', () => {
    expect(searchClients('Jane').some((c) => c.clientId === JANE_DOE_CLIENT_ID)).toBe(true);
    expect(searchClients('Doe').some((c) => c.clientId === JANE_DOE_CLIENT_ID)).toBe(true);
    expect(searchClients('Jane Doe').some((c) => c.clientId === JANE_DOE_CLIENT_ID)).toBe(true);
  });

  it('8. search can match project name (ASTRAL)', () => {
    const hits = searchClients('ASTRAL');
    expect(hits.some((c) => c.clientId === JANE_DOE_CLIENT_ID)).toBe(true);
    expect(hits[0]?.matchReason).toContain('PROJECT');
  });

  it('9. activeSimulatedClientId on session model', () => {
    const session = selectSimulatedClient(createDefaultViewModeSession(true), JANE_DOE_CLIENT_ID);
    expect(session.activeSimulatedClientId).toBe(JANE_DOE_CLIENT_ID);
  });

  it('10. Jane Doe fixture exists', () => {
    expect(getClient(JANE_DOE_CLIENT_ID)?.fullName).toBe('Jane Doe');
  });

  it('11. Jane Doe is marked demo', () => {
    expect(buildJaneDoeSimulationContext().isDemoFixture).toBe(true);
  });

  it('12. Jane Doe has 5 memberships', () => {
    expect(getClientProjectMemberships(JANE_DOE_CLIENT_ID).length).toBe(5);
  });

  it('13–17. Jane Doe includes all five projects', () => {
    for (const slug of [
      'frontal-slayer',
      'studio-world',
      'ndxbook',
      'all-in-one-enterprises',
      'astral-world',
    ]) {
      expect(clientCanAccessProject(JANE_DOE_CLIENT_ID, slug)).toBe(true);
    }
  });

  it('18. Jane Doe does not include SITE 00', () => {
    expect(clientCanAccessProject(JANE_DOE_CLIENT_ID, 'site00')).toBe(false);
  });

  it('19–20. excludes design workspace and new project', () => {
    const items = getClientProjects({ clientId: JANE_DOE_CLIENT_ID, founderEntries: founderEntries() });
    expect(items.some((i) => i.projectId === 'site00')).toBe(false);
    expect(items.some((i) => i.projectName.toUpperCase().includes('NEW PROJECT'))).toBe(false);
  });

  it('21. memberships use real relationship model', () => {
    const memberships = buildJaneDoeMemberships();
    expect(memberships.every((m) => m.role === 'CLIENT_MEMBER' && m.clientId === JANE_DOE_CLIENT_ID)).toBe(true);
  });

  it('22. no jane-doe UI special-case filter in directory service', () => {
    const src = readFileSync(
      join(ROOT, 'shared/site00-projects/clientSimulation/clientDirectoryService.ts'),
      'utf8',
    );
    expect(src).not.toContain('if (client === janeDoe)');
    expect(src).not.toContain('showAllProjectsExceptSite00');
  });

  it('23. YOUR PROJECTS resolves to 05', () => {
    const items = getClientProjects({ clientId: JANE_DOE_CLIENT_ID, founderEntries: founderEntries() });
    const viewData = buildProjectsViewData({
      viewMode: 'CLIENT',
      founderItems: [],
      clientItems: items,
      projectItems: items,
      availableFilters: ['ALL', 'ACTIVE'],
      showFilteredEmpty: false,
    });
    expect(viewData.summaryTiles[0]?.value).toBe('05');
    expect(viewData.summaryTiles[0]?.label).toBe('YOUR PROJECTS');
  });

  it('24. client status counts derive from project state', () => {
    const items = getClientProjects({ clientId: JANE_DOE_CLIENT_ID, founderEntries: founderEntries() });
    const metrics = computeProjectIndexSummaryMetrics(items);
    expect(metrics.total).toBe(5);
    expect(typeof metrics.active).toBe('number');
  });

  it('25. client eyebrow resolves JANE DOE /', () => {
    const client = getClient(JANE_DOE_CLIENT_ID)!;
    const result = resolveProjectsViewAccountIdentity({
      viewMode: 'CLIENT',
      isSimulatingClient: true,
      activeSimulatedClientId: JANE_DOE_CLIENT_ID,
      simulatedClientDirectoryProfile: {
        firstName: client.firstName,
        lastName: client.lastName,
        displayName: client.displayName,
      },
      authenticatedProfile: { email: 'founder@site00.com' },
      founderEmail: 'founder@site00.com',
    });
    expect(result.eyebrow).toBe('JANE DOE /');
  });

  it('26. Founder View restores founder name path', () => {
    const result = resolveProjectsViewAccountIdentity({
      viewMode: 'FOUNDER',
      isSimulatingClient: false,
      authenticatedProfile: { firstName: 'Teena', lastName: 'Armstrong', email: 'founder@site00.com' },
    });
    expect(result.eyebrow).toBe('TEENA ARMSTRONG /');
  });

  it('27. client project search excludes SITE 00', () => {
    const items = getClientProjects({ clientId: JANE_DOE_CLIENT_ID, founderEntries: founderEntries() });
    const hit = items.some((i) => i.projectName.toLowerCase().includes('site 00'));
    expect(hit).toBe(false);
  });

  it('28. client project cards show only authorized memberships', () => {
    const items = getClientProjects({ clientId: JANE_DOE_CLIENT_ID, founderEntries: founderEntries() });
    expect(items.map((i) => i.projectId).sort()).toEqual([...JANE_DOE_PROJECT_IDS].sort());
  });

  it('29. client project opening enforces membership', () => {
    expect(clientCanAccessProject(JANE_DOE_CLIENT_ID, 'ndxbook')).toBe(true);
    expect(clientCanAccessProject(JANE_DOE_CLIENT_ID, 'site00')).toBe(false);
  });

  it('30. client module entitlements enforced via manifest helper', () => {
    const item = buildProjectIndexItemsFromEntries([syntheticEntry('ndxbook')])[0]!;
    const visible = resolveVisibleModules(item.projectCapabilityManifest, 'CLIENT');
    expect(visible.length).toBeGreaterThan(0);
    expect(visible.length).toBeLessThanOrEqual(item.enabledModules.length);
  });

  it('31. client manifest filter limits modules vs founder view', () => {
    const item = buildProjectIndexItemsFromEntries([syntheticEntry('ndxbook')])[0]!;
    const clientVisible = resolveVisibleModules(item.projectCapabilityManifest, 'CLIENT');
    const founderVisible = resolveVisibleModules(item.projectCapabilityManifest, 'FOUNDER');
    expect(clientVisible.length).toBeLessThanOrEqual(founderVisible.length);
  });

  it('32. client directory lists demo in dev', () => {
    expect(isJaneDoeFixtureEnabled({ production: false })).toBe(true);
    expect(listClients().some((c) => c.clientId === JANE_DOE_CLIENT_ID)).toBe(true);
  });

  it('33. switching client uses same shell components', () => {
    const shell = readFileSync(join(ROOT, 'src/site00/components/projectIndex/ProjectsPageShell.tsx'), 'utf8');
    expect(shell).toContain('ProjectIndexViewStrip');
    expect(shell).not.toContain('ClientProjectsPage');
  });

  it('34. selector overlay does not shift layout', () => {
    expect(CSS).toContain('position: fixed');
    expect(CSS).toContain('site00-pidx-client-selector__backdrop');
    expect(SELECTOR).not.toContain('<select');
  });

  it('35–36. mobile + desktop selector styles', () => {
    expect(CSS).toContain('@media (min-width: 900px)');
    expect(CSS).toContain('site00-pidx-client-selector');
  });

  it('37. accessibility — search input + listbox roles', () => {
    expect(SELECTOR).toContain('role="listbox"');
    expect(SELECTOR).toContain('role="option"');
    expect(SELECTOR).toContain('aria-selected');
  });

  it('38. System Inspector exposes client simulation context', () => {
    expect(INSPECTOR).toContain('ACTIVE CLIENT ID');
    expect(INSPECTOR).toContain('MEMBERSHIP COUNT');
    expect(INSPECTOR).toContain('FIREWALL STATUS');
  });

  it('39. enter client simulation opens selector when no client', () => {
    const session = enterClientSimulation(createDefaultViewModeSession(true));
    expect(session.clientSelectorOpen).toBe(true);
    expect(session.activeSimulatedClientId).toBeNull();
  });
});
