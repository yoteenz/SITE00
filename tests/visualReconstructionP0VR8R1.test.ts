/**
 * P0.VR.8R1 — Project-scoped design context + brand skin / page registry sync.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  bootstrapAllManagedDesignProjects,
  bootstrapManagedDesignProject,
  buildDesignProjectThemeTokens,
  buildProjectRouteManifest,
  clearManagedDesignBootstrapForTest,
  clearProjectSyncStateForTest,
  detectDesignContextLeaks,
  filterRecordsForActiveProject,
  assertProjectContextScope,
  createLoadingDesignProjectContext,
  resolveDesignProjectContext,
  resolveDesignProjectSelectorAccent,
  syncProjectRouteManifest,
  type DesignProjectContext,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3m/client.js';
import { clearDesignScreenRegistryForTest, listDesignScreensForProject } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/designScreenRegistry.js';
import { resetNdxPilotForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.js';
import { resetSite00PilotForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3a/site00PilotRegistration.js';
import { clearProjectPageRegistryForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vr8/client.js';
import { buildProjectPageCaptureId, upsertProjectPageCapture, assertCaptureProjectScope } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3m/projectPageCaptureRegistry.js';

describe('P0.VR.8R1 Design Project Context', () => {
  beforeEach(() => {
    clearDesignScreenRegistryForTest();
    resetNdxPilotForTest();
    resetSite00PilotForTest();
    clearProjectPageRegistryForTest();
    clearProjectSyncStateForTest();
    clearManagedDesignBootstrapForTest();
    bootstrapAllManagedDesignProjects();
  });

  it('1. resolves DesignProjectContext for managed projects', () => {
    const ctx = resolveDesignProjectContext('ndxbook');
    expect(ctx.status).toBe('PROJECT_CONTEXT_READY');
    expect(ctx.projectId).toBe('ndxbook');
    expect(ctx.pageRegistryId).toBe('ndxbook:page-registry');
    expect(ctx.themeTokens.brandFamilySkinId).toBe('NDXBOOK');
  });

  it('2. atomic context carries project-scoped registry ids', () => {
    const ctx: DesignProjectContext = resolveDesignProjectContext('studio-world');
    expect(ctx.captureRegistryId).toBe('studio-world:capture-registry');
    expect(ctx.referenceRegistryId).toBe('studio-world:reference-registry');
  });

  it('3. loading context blocks ready status', () => {
    const loading = createLoadingDesignProjectContext('ndxbook');
    expect(loading.status).toBe('PROJECT_CONTEXT_LOADING');
  });

  it('4. NDXBOOK theme uses lime not host red for project accent', () => {
    const tokens = buildDesignProjectThemeTokens('ndxbook');
    expect(tokens.primaryAccent.toLowerCase()).toBe('#b7d236');
    expect(tokens.accentKey).toBe('NDX_LIME');
  });

  it('5. Frontal Slayer theme binding', () => {
    const tokens = buildDesignProjectThemeTokens('frontal-slayer');
    expect(tokens.brandFamilySkinId).toBe('FRONTAL_SLAYER');
    expect(tokens.primaryAccent.toLowerCase()).toBe('#eb1c24');
  });

  it('6. AIO gold theme binding', () => {
    const tokens = buildDesignProjectThemeTokens('all-in-one-enterprises');
    expect(tokens.brandFamilySkinId).toBe('AIO');
    expect(tokens.accentKey).toBe('AIO_GOLD');
  });

  it('7. Astral purple theme binding', () => {
    const tokens = buildDesignProjectThemeTokens('astral-world');
    expect(tokens.brandFamilySkinId).toBe('ASTRAL_WORLD');
    expect(tokens.primaryAccent.toLowerCase()).toBe('#7b4fd4');
  });

  it('8. Studio World gold distinct from AIO gold', () => {
    const studio = buildDesignProjectThemeTokens('studio-world');
    const aio = buildDesignProjectThemeTokens('all-in-one-enterprises');
    expect(studio.primaryAccent.toLowerCase()).toBe('#d4af37');
    expect(aio.primaryAccent.toLowerCase()).toBe('#c9a227');
    expect(studio.primaryAccent).not.toBe(aio.primaryAccent);
  });

  it('9. ProjectRouteManifest discovers routes per project', () => {
    const ndx = buildProjectRouteManifest('ndxbook');
    const studio = buildProjectRouteManifest('studio-world');
    expect(ndx.routeCount).toBeGreaterThan(0);
    expect(studio.routeCount).toBeGreaterThan(0);
  });

  it('10. page identity includes projectId in pageId key', () => {
    const manifest = syncProjectRouteManifest('ndxbook');
    expect(manifest.routeCount).toBeGreaterThan(0);
    expect(manifest.routes.every((r) => r.screenId)).toBe(true);
    expect(manifest.syncState).toBe('SYNCED');
  });

  it('11. project capture scoping by project+route+viewport', () => {
    const captureId = buildProjectPageCaptureId('ndxbook', '/projects/ndxbook', 'mobile');
    upsertProjectPageCapture({
      projectId: 'ndxbook',
      route: '/projects/ndxbook',
      viewport: 'mobile',
      captureId,
      capturedAt: null,
      sourceVersion: null,
      deploymentVersion: null,
      screenshotAssetId: null,
      captureStatus: 'PENDING',
      staleReason: null,
      screenId: 'overview',
    });
    expect(assertCaptureProjectScope(
      { projectId: 'ndxbook', route: '/projects/ndxbook', viewport: 'mobile', captureId, capturedAt: null, sourceVersion: null, deploymentVersion: null, screenshotAssetId: null, captureStatus: 'PENDING', staleReason: null, screenId: 'overview' },
      'studio-world',
    )).toBe(false);
  });

  it('12. unsynced != zero when no routes registered', () => {
    clearDesignScreenRegistryForTest();
    clearManagedDesignBootstrapForTest();
    const manifest = buildProjectRouteManifest('frontal-slayer');
    expect(manifest.routeCount).toBe(0);
    expect(manifest.syncState).toBe('NEVER_SYNCED');
  });

  it('13. refresh/sync marks active project only', () => {
    syncProjectRouteManifest('studio-world');
    const studio = buildProjectRouteManifest('studio-world');
    const frontal = buildProjectRouteManifest('frontal-slayer');
    expect(studio.syncState).toBe('SYNCED');
    expect(frontal.syncState).toBe('SYNC_REQUIRED');
  });

  it('14. project context firewall blocks cross-project records', () => {
    const blocked = assertProjectContextScope({ projectId: 'ndxbook' }, 'studio-world');
    expect(blocked.allowed).toBe(false);
    const allowed = assertProjectContextScope({ projectId: 'ndxbook' }, 'ndxbook');
    expect(allowed.allowed).toBe(true);
  });

  it('15. filterRecordsForActiveProject scopes lists', () => {
    const rows = [
      { projectId: 'ndxbook', id: 'a' },
      { projectId: 'studio-world', id: 'b' },
    ];
    expect(filterRecordsForActiveProject(rows, 'ndxbook')).toHaveLength(1);
  });

  it('16. leak detector flags NDXBOOK with site00 red accent', () => {
    const report = detectDesignContextLeaks({
      activeDesignProjectId: 'ndxbook',
      contextProjectId: 'ndxbook',
      themeTokens: buildDesignProjectThemeTokens('site00'),
    });
    expect(report.pass).toBe(false);
    expect(report.failures.some((f) => f.code === 'LEAK_WRONG_BRAND_ACCENT')).toBe(true);
  });

  it('17. leak detector flags page bleed', () => {
    const report = detectDesignContextLeaks({
      activeDesignProjectId: 'ndxbook',
      contextProjectId: 'ndxbook',
      pageProjectIds: ['studio-world'],
    });
    expect(report.pass).toBe(false);
  });

  it('18. bootstrap registers all five client projects', () => {
    for (const projectId of ['frontal-slayer', 'studio-world', 'ndxbook', 'all-in-one-enterprises', 'astral-world']) {
      bootstrapManagedDesignProject(projectId);
      expect(listDesignScreensForProject(projectId).length).toBeGreaterThan(0);
    }
  });

  it('19. selector accents remain distinct for AIO vs Studio', () => {
    const aio = resolveDesignProjectSelectorAccent('all-in-one-enterprises');
    const studio = resolveDesignProjectSelectorAccent('studio-world');
    expect(aio.dotColor).not.toBe(studio.dotColor);
  });

  it('20. 5-project switch matrix preserves isolated contexts', () => {
    const order = ['ndxbook', 'studio-world', 'frontal-slayer', 'all-in-one-enterprises', 'astral-world', 'ndxbook'] as const;
    for (const projectId of order) {
      const ctx = resolveDesignProjectContext(projectId);
      expect(ctx.projectId).toBe(projectId);
      const leak = detectDesignContextLeaks({
        activeDesignProjectId: projectId,
        contextProjectId: ctx.projectId,
        themeTokens: ctx.themeTokens,
      });
      expect(leak.pass).toBe(true);
    }
  });

  it('21. invalid project returns error context not site00 fallback data', () => {
    const ctx = resolveDesignProjectContext('design-workspace');
    expect(ctx.status).toBe('PROJECT_CONTEXT_ERROR');
    expect(ctx.errorMessage).toContain('COULD NOT LOAD');
  });

  it('22. repository bindings are project-scoped', () => {
    const ctx = resolveDesignProjectContext('studio-world');
    expect(ctx.repositoryBindings[0]?.projectId).toBe('studio-world');
    expect(ctx.repositoryBindings[0]?.routePrefixes).toContain('/projects/studio-world');
  });
});
