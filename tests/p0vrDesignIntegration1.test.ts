/**
 * P0.VR.DESIGN-INTEGRATION1 — production DESIGN route promotion tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { DESIGN_INTEGRATION_LINEAGE } from '../shared/site00-design-workspace-production/designIntegrationLineage.js';
import { resolveLegacyProjectDesignRedirect } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3m/client.js';
import { findSurface } from '../api/_lib/site00OpusNative/designSurfaceRegistry.js';
import { site00ProjectDesignPath, site00ProjectDesignSectionPath } from '../src/site00/config/routes';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.DESIGN-INTEGRATION1', () => {
  it('records twin → production lineage', () => {
    expect(DESIGN_INTEGRATION_LINEAGE.sourceDesign).toBe('twin-opus-direct');
    expect(DESIGN_INTEGRATION_LINEAGE.promotedTo).toBe('production-design-workspace');
  });

  it('production DESIGN path is per-project slug', () => {
    expect(site00ProjectDesignPath('ndxbook')).toBe('/projects/ndxbook/design');
    expect(site00ProjectDesignSectionPath('ndxbook', 'pages')).toBe('/projects/ndxbook/design/pages');
  });

  it('registers production route against twin authority for Opus targeting', () => {
    const surface = findSurface({ route: '/projects/ndxbook/design' });
    expect(surface?.pageId).toBe('twin-opus-direct');
  });

  it('routes wire production workspace and child sections', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    expect(routes).toContain('DesignProductionRouteGate');
    expect(routes).toContain('path="pages"');
    expect(routes).toContain('DesignProductionSectionReferences');
  });

  it('registers index route so bare /design mounts the workspace layout', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    const productionStart = routes.indexOf('path={SITE00_ROUTES.projectDesign}');
    expect(productionStart).toBeGreaterThan(-1);
    const productionBlock = routes.slice(productionStart, routes.indexOf('path={SITE00_ROUTES.projectExperiments}', productionStart));
    expect(productionBlock).toMatch(/<Route\s+index\s+element=\{null\}\s*\/>/);
    const twinStart = routes.indexOf('path={SITE00_ROUTES.projectDesignTwinOpusDirect}');
    const twinBlock = routes.slice(twinStart, routes.indexOf('path={SITE00_ROUTES.projectDesignTwinFableDirect}', twinStart));
    expect(twinBlock).toMatch(/<Route\s+index\s+element=\{null\}\s*\/>/);
  });

  it('twin-opus-direct remains founder review route with functional banner', () => {
    const page = read('src/site00/pages/DesignTwinOpusDirectPage.tsx');
    const banner = read('src/site00/components/designBench/production/DesignTwinReviewBanner.tsx');
    expect(page).toContain('DesignTwinReviewBanner');
    expect(banner).toContain('design-twin-review-banner');
    expect(banner).toContain('TWIN REVIEW AUTHORITY');
  });

  it('design agent dock uses integrated open control not vertical rail', () => {
    const css = read('src/site00/styles/site00-design-agent.css');
    expect(css).not.toContain('.s00-dad__rail');
    expect(css).toContain('.s00-dad__close');
    expect(read('src/site00/components/designBench/designAgent/DesignAgentDockContext.tsx')).toContain(
      'DesignAgentOpenButton',
    );
  });

  it('ndxbook legacy redirect does not loop to site00 query route', () => {
    const resolution = resolveLegacyProjectDesignRedirect('ndxbook', '');
    expect(resolution.redirect).toBe(false);
    expect(resolution.target.pathname).toBe('/projects/ndxbook/design');
  });
});
