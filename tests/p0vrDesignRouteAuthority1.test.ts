/**
 * P0.VR.DESIGN-ROUTE-AUTHORITY1 — design route ownership + collision guards.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  buildCanonicalDesignWorkspacePath,
  designReconstructionLabPath,
  resolveLegacyProjectDesignRedirect,
  resolveStudioWorldDesignLegacyRedirect,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr3m/client.js';
import { SITE00_ROUTES } from '../src/site00/config/routes';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.DESIGN-ROUTE-AUTHORITY1', () => {
  it('product DESIGN for NDXBOOK is per-project production route (not host query URL)', () => {
    expect(buildCanonicalDesignWorkspacePath({ project: 'ndxbook' })).toBe('/projects/design/ndxbook');
    const resolution = resolveLegacyProjectDesignRedirect('ndxbook', '');
    expect(resolution.redirect).toBe(false);
    expect(resolution.target.pathname).toBe('/projects/design/ndxbook');
  });

  it('host /projects/site00/design?project=ndxbook redirects to production DESIGN', () => {
    const resolution = resolveLegacyProjectDesignRedirect('site00', '?project=ndxbook&viewport=mobile');
    expect(resolution.redirect).toBe(true);
    expect(resolution.target.pathname).toBe('/projects/design/ndxbook');
    expect(resolution.target.search).toContain('viewport=mobile');
  });

  it('bare /projects/site00/design redirects to default managed production subject', () => {
    const resolution = resolveLegacyProjectDesignRedirect('site00', '');
    expect(resolution.redirect).toBe(true);
    expect(resolution.target.pathname).toBe('/projects/design/ndxbook');
  });

  it('legacy reconstruction lab has explicit route (no collision with product DESIGN)', () => {
    expect(designReconstructionLabPath('ndxbook')).toBe('/projects/design/ndxbook/reconstruction-lab');
    expect(SITE00_ROUTES.projectDesignReconstructionLab).toBe('/projects/:projectSlug/design/reconstruction-lab');
    expect(SITE00_ROUTES.projectDesign).toBe('/projects/:projectSlug/design');
    expect(SITE00_ROUTES.projectDesignTwinOpusDirect).toBe('/projects/:projectSlug/design/twin-opus-direct');
    expect(SITE00_ROUTES.projectDesignOpusNative).toBe('/projects/:projectSlug/design/opus-native');
  });

  it('site00 platform legacy context routes to reconstruction lab', () => {
    const resolution = resolveLegacyProjectDesignRedirect('site00', '?project=site00&tab=pages');
    expect(resolution.redirect).toBe(true);
    expect(resolution.target.pathname).toBe('/projects/design/site00/reconstruction-lab');
  });

  it('/studio-world/design?project=ndxbook resolves to production workspace path', () => {
    const resolution = resolveStudioWorldDesignLegacyRedirect('?project=ndxbook&tab=review');
    expect(resolution.redirect).toBe(true);
    expect(resolution.target.pathname).toBe('/projects/design/ndxbook');
    expect(resolution.target.search).toContain('tab=review');
  });

  it('route wiring — production gate, lab, twin, native, host redirect hub', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    expect(routes).toContain('DesignProductionRouteGate');
    expect(routes).toContain('DesignReconstructionLabPage');
    expect(routes).toContain('Site00DesignHostRouteGate');
    expect(routes).toContain('DesignTwinOpusDirectRouteGate');
    expect(routes).toContain('DesignOpusNativePage');
    expect(routes).not.toContain('Site00OwnedDesignWorkspacePage');
  });

  it('dev-only implementation markers (stripped from production by import.meta.env.DEV)', () => {
    const core = read('src/site00/components/designBench/production/DesignWorkspaceCore.tsx');
    const lab = read('src/site00/pages/StudioWorldDesignPage.tsx');
    expect(core).toContain('NEW_WORKSPACE');
    expect(core).toContain('import.meta.env.DEV');
    expect(lab).toContain('LEGACY_RECONSTRUCTION_LAB');
    expect(lab).toContain('import.meta.env.DEV');
  });
});
