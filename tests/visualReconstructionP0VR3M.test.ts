/**
 * P0.VR.3M-SITE00 — Design workspace ownership + route normalization tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildCanonicalDesignWorkspacePath,
  buildDesignWorkspaceBreadcrumb,
  buildManagedProjectDesignAdapterScope,
  crossProjectShellPropagationDefaultAllowed,
  designWorkspaceHostUsesSite00Red,
  getCanonicalDesignRouteAuthority,
  getSite00ManagedProject,
  listDesignEnabledManagedProjects,
  ndxbookOwnsDesignWorkspace,
  projectAccentRecolorsDesignHostShell,
  resolveLegacyProjectDesignRedirect,
  resolveManagedProjectForDesignContext,
  resolveStudioWorldDesignLegacyRedirect,
  site00CanDesignItsOwnWebsite,
  site00CanDesignStudioWorldWebsite,
  site00OwnsDesignWorkspace,
  studioWorldInternalRoutesImportedAsWebsiteRoutesByDefault,
  studioWorldNativePipelinesMergedIntoSite00Design,
  studioWorldOwnsSite00DesignWorkspace,
  websiteShellPropagationCanMutateDesignHost,
  CANONICAL_SITE00_DESIGN_ROUTE,
  DESIGN_WORKSPACE_OWNER,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3m/client.js';
import { SITE00_DESIGN_PROJECT_ID } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3/constants.js';
import { listDesignWorkspaceProjects } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3/designProjectRegistry.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.3M design workspace ownership', () => {
  it('SITE 00 owns the Design workspace', () => {
    expect(site00OwnsDesignWorkspace()).toBe(true);
    expect(ndxbookOwnsDesignWorkspace()).toBe(false);
    expect(studioWorldOwnsSite00DesignWorkspace()).toBe(false);
    expect(getCanonicalDesignRouteAuthority().workspaceOwner).toBe(DESIGN_WORKSPACE_OWNER);
  });

  it('canonical Design route resolves under SITE 00', () => {
    expect(CANONICAL_SITE00_DESIGN_ROUTE).toBe('/projects/site00/design');
    expect(buildCanonicalDesignWorkspacePath({ project: 'ndxbook' })).toBe(
      '/projects/site00/design?project=ndxbook',
    );
    expect(read('src/site00/config/routes.ts')).toContain("site00Design: '/projects/site00/design'");
  });

  it('legacy NDXBOOK design route redirects with context preserved', () => {
    const resolution = resolveLegacyProjectDesignRedirect('ndxbook', '?screen=campaign-board&viewport=mobile');
    expect(resolution.redirect).toBe(true);
    expect(resolution.loop).toBe(false);
    expect(resolution.target.pathname).toBe(CANONICAL_SITE00_DESIGN_ROUTE);
    expect(resolution.target.search).toContain('project=ndxbook');
    expect(resolution.target.search).toContain('screen=campaign-board');
  });

  it('legacy /studio-world/design redirects to canonical route', () => {
    const resolution = resolveStudioWorldDesignLegacyRedirect('?project=ndxbook&tab=review');
    expect(resolution.redirect).toBe(true);
    expect(resolution.loop).toBe(false);
    expect(resolution.target.pathname).toBe(CANONICAL_SITE00_DESIGN_ROUTE);
    expect(resolution.target.search).toContain('project=ndxbook');
  });

  it('SITE 00 red host persists — project accent does not recolor host shell', () => {
    expect(designWorkspaceHostUsesSite00Red()).toBe(true);
    expect(projectAccentRecolorsDesignHostShell('ndxbook')).toBe(false);
    expect(read('src/site00/styles/site00-design-workspace-p0vr2b.css')).toContain('--site00-dw-host-accent');
    expect(read('src/site00/styles/site00-design-workspace-p0vr2b.css')).not.toContain('--site00-dw-lime');
  });

  it('managed project registry supports all founder design projects', () => {
    const ids = listDesignEnabledManagedProjects().map((p) => p.projectId);
    expect(ids).toContain('site00');
    expect(ids).toContain('ndxbook');
    expect(ids).toContain('studio-world');
    expect(ids).toContain('frontal-slayer');
    expect(ids).toContain('all-in-one-enterprises');
  });

  it('Studio World platform role and website design authority', () => {
    const sw = getSite00ManagedProject('studio-world');
    expect(sw?.platformRole).toBe('INFRASTRUCTURE');
    expect(sw?.managedWebsiteRole).toBe('MANAGED_WEBSITE_PROJECT');
    expect(sw?.websiteDesignAuthority).toBe('SITE00');
    expect(studioWorldNativePipelinesMergedIntoSite00Design()).toBe(false);
    expect(site00CanDesignStudioWorldWebsite()).toBe(true);
    expect(site00CanDesignItsOwnWebsite()).toBe(true);
  });

  it('invalid project context falls back safely to SITE 00', () => {
    expect(resolveManagedProjectForDesignContext('unknown-brand')).toBe(SITE00_DESIGN_PROJECT_ID);
    expect(resolveManagedProjectForDesignContext(undefined)).toBe(SITE00_DESIGN_PROJECT_ID);
  });

  it('Studio World website adapter excludes internal platform routes', () => {
    const scope = buildManagedProjectDesignAdapterScope('studio-world');
    expect(studioWorldInternalRoutesImportedAsWebsiteRoutesByDefault()).toBe(false);
    expect(scope.excludedInternalRoutes.some((r) => r.startsWith('/studio/'))).toBe(true);
    expect(scope.websiteRoutes.every((r) => !r.startsWith('/studio/'))).toBe(true);
  });

  it('shell governance protects Design host from website propagation', () => {
    expect(websiteShellPropagationCanMutateDesignHost()).toBe(false);
    expect(crossProjectShellPropagationDefaultAllowed()).toBe(false);
  });

  it('breadcrumb shows SITE 00 ownership', () => {
    expect(buildDesignWorkspaceBreadcrumb()).toBe('PROJECTS > SITE 00 > DESIGN');
    expect(read('src/site00/components/designWorkspace/Site00DesignWorkspaceShell.tsx')).toContain('SITE 00');
    expect(read('src/site00/components/designWorkspace/Site00DesignWorkspaceShell.tsx')).toContain(
      'site00-dw-shell__project-context-badge',
    );
  });

  it('design project dropdown uses managed project registry', () => {
    const dropdown = listDesignWorkspaceProjects();
    expect(dropdown.length).toBeGreaterThanOrEqual(5);
    expect(dropdown.some((p) => p.slug === 'ndxbook')).toBe(true);
    expect(dropdown.some((p) => p.slug === 'site00')).toBe(true);
  });

  it('route wiring includes canonical + legacy redirect pages', () => {
    expect(read('src/routes/Site00Routes.tsx')).toContain('Site00OwnedDesignWorkspacePage');
    expect(read('src/routes/Site00Routes.tsx')).toContain('LegacyProjectDesignRedirectPage');
    expect(read('src/site00/pages/StudioWorldDesignPage.tsx')).toContain('resolveLegacyProjectDesignRedirect');
  });
});
