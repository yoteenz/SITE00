/**
 * P0.SITE00.STUDIOWORLD.MEDIA-PROJECT-OWNERSHIP-AND-EXCHANGE-INDEPENDENCE.V1
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import { orgIdFromSlug } from '../api/_lib/site00Evolve/orgRegistry.js';
import {
  getSite00ManagedProject,
  hasProductionSpine,
  isIndependentMediaProductionProject,
  listDesignEnabledManagedProjects,
  listProductionManagedProjects,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import {
  INDEPENDENT_MEDIA_PROJECT_KEYS,
  STUDIO_WORLD_INFRASTRUCTURE_PROJECT_KEY,
} from '../shared/site00-media-projects/independentMediaProjects.js';
import { PROJECT_INDEX_CANONICAL_ORDER } from '../shared/site00-projects/projectIndexOrder.js';
import { scopedTabHref } from '../shared/site00-production-graph/projectScope.js';
import { listHostProductionProjects, projectSwitchPath } from '../src/site00/projectRuntime/projectHostProfile.js';
import { listSite00FounderProjects, resolveSite00Project } from '../api/_lib/site00Projects/projectResolver.js';
import { FOUNDER_PROJECT_SLUGS } from '../api/_lib/site00Projects/projectRegistry.js';
import { HUB_PROJECT_COVER_IDS } from '../shared/site00-production-hub/assets.js';

const root = join(import.meta.dirname, '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');

describe('THE EXCHANGE — independent media project (not Studio World child)', () => {
  beforeEach(() => {
    process.env.EVOLVE_USE_MEMORY = '1';
  });

  it('registries agree on canonical key the-exchange (single managed row)', () => {
    expect(FOUNDER_PROJECT_SLUGS).toContain('the-exchange');
    const managed = getSite00ManagedProject('the-exchange');
    expect(managed).toMatchObject({
      projectId: 'the-exchange',
      projectType: 'SERIALIZED_FICTION',
      designEnabled: false,
      productionSpine: true,
      platformRole: 'NONE',
    });
    expect(hasProductionSpine('the-exchange')).toBe(true);
    expect(listDesignEnabledManagedProjects().some((p) => p.projectId === 'the-exchange')).toBe(false);
  });

  it('appears in founder project index beside NDXBOOK, not under studio-world metadata', async () => {
    const projects = await listSite00FounderProjects();
    const slugs = projects.map((p) => p.slug);
    expect(slugs).toContain('the-exchange');
    expect(slugs).toContain('ndxbook');
    const exchange = projects.find((p) => p.slug === 'the-exchange')!;
    expect(exchange.organizationUuid).toBe(orgIdFromSlug('the-exchange'));
    expect(exchange.classification).toBe('SERIALIZED_FICTION');
    expect(exchange.surfaces.some((s) => s.route.includes('project=the-exchange'))).toBe(true);
    const sw = getSite00ManagedProject('studio-world');
    expect(sw?.platformRole).toBe('INFRASTRUCTURE');
    expect(exchange.slug).not.toBe(STUDIO_WORLD_INFRASTRUCTURE_PROJECT_KEY);
  });

  it('project index order lists the-exchange after ndxbook (peer media placement)', () => {
    const order = [...PROJECT_INDEX_CANONICAL_ORDER];
    expect(order.indexOf('ndxbook')).toBeLessThan(order.indexOf('the-exchange'));
    expect(order.indexOf('studio-world')).toBeLessThan(order.indexOf('the-exchange'));
  });

  it('production switcher includes THE EXCHANGE without requiring design workspace', () => {
    const hosts = listHostProductionProjects();
    expect(hosts.some((p) => p.slug === 'the-exchange')).toBe(true);
    expect(hosts.some((p) => p.slug === 'ndxbook')).toBe(true);
    const ex = hosts.find((p) => p.slug === 'the-exchange')!;
    expect(ex.kind).toMatch(/MEDIA PRODUCTION/);
  });

  it('project switch preserves tab and scopes URL to new project', () => {
    expect(projectSwitchPath('/production/the-exchange/expression', '', 'ndxbook')).toBe('/production/ndxbook/expression');
    expect(projectSwitchPath('/production/ndxbook/expression', '', 'the-exchange')).toBe('/production/the-exchange/expression');
    expect(scopedTabHref('EXPRESSION', 'the-exchange')).toBe('/production/the-exchange/expression');
  });

  it('independent media keys are distinct', () => {
    expect(new Set(INDEPENDENT_MEDIA_PROJECT_KEYS).size).toBe(2);
    expect(isIndependentMediaProductionProject('ndxbook')).toBe(true);
    expect(isIndependentMediaProductionProject('the-exchange')).toBe(true);
    expect(isIndependentMediaProductionProject('studio-world')).toBe(false);
  });

  it('hub cover slot exists for discovery parity', () => {
    expect(HUB_PROJECT_COVER_IDS).toContain('the-exchange');
  });

  it('resolve detail keeps fiction boundary note', async () => {
    const detail = await resolveSite00Project('the-exchange');
    expect(detail?.overview.boundaryNote).toMatch(/project-scoped|Do not merge/i);
    expect(detail?.evolve.isMarketingClient).toBe(false);
  });

  it('managed registry source does not parent the-exchange under studio-world', () => {
    const src = read('shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.ts');
    expect(src).not.toMatch(/parentProjectId.*studio-world/);
    expect(src).not.toMatch(/projectId:\s*'the-exchange'[\s\S]*platformRole:\s*'INFRASTRUCTURE'/);
  });
});
