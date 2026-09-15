import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITE00_ROUTES, site00ProjectDesignTwinGrokDirectPath } from '../src/site00/config/routes.js';

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

const UNTOUCHED = [
  'src/site00/pages/DesignTwinImplementationPage.tsx',
  'src/site00/pages/DesignTwinV4ProofPage.tsx',
  'src/site00/pages/DesignTwinTestAPage.tsx',
  'src/site00/pages/SolDesignBenchmarkPage.tsx',
  'src/site00/pages/StudioWorldDesignPage.tsx',
];

describe('P0.VR.DESIGNBENCH.GROK-DIRECT1 isolated reconstruction', () => {
  it('registers the isolated twin-grok-direct route', () => {
    expect(SITE00_ROUTES.projectDesignTwinGrokDirect).toBe('/projects/:projectSlug/design/twin-grok-direct');
    expect(site00ProjectDesignTwinGrokDirectPath('ndxbook')).toBe('/projects/ndxbook/design/twin-grok-direct');
    expect(read('src/routes/Site00Routes.tsx')).toContain('projectDesignTwinGrokDirect');
    expect(read('src/routes/Site00Routes.tsx')).toContain('DesignTwinGrokDirectPage');
  });

  it('boots without CTRL ROOM account guard', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    expect(routes).toMatch(/projectDesignTwinGrokDirect[\s\S]{0,280}DesignTwinGrokDirectPage/);
    expect(routes).not.toMatch(/projectDesignTwinGrokDirect[\s\S]{0,280}Site00AccountRouteGuard/);
  });

  it('recreates the golden as real DOM/CSS without a raster cheat', () => {
    const page = read('src/site00/pages/DesignTwinGrokDirectPage.tsx');
    const css = read('src/site00/styles/site00-twin-grok-direct.css');
    expect(page).toContain('THE SIGNAL');
    expect(page).toContain('IS THE');
    expect(page).toContain('INDEX');
    expect(page).toContain('SELECT FOR MOBILE');
    expect(page).toContain('CONCEPT CANDIDATE GALLERY');
    expect(page).toContain('STRUCTURED OUTPUT REVIEW');
    expect(page).not.toContain('01a0a6e3-aaa5-7bb3-9b94-2399d56a1d76');
    expect(page).not.toMatch(/backgroundImage:\s*['"]url\(/);
    expect(css).toContain('--tgd-page: 768px');
    expect(css).toContain('height: 1376px');
    expect(page).toContain('/site00/twin-grok-direct/tgd-hand-plate.png');
    expect(css).not.toMatch(/01a0a6e3-aaa5-7bb3-9b94-2399d56a1d76/);
    expect(css).not.toMatch(/01a0a6ff-1786-73ec-9452-05834517823e/);
    expect(css).not.toMatch(/mobile-master\.jpg/);
  });

  it('does not mutate existing Twin or DESIGN routes', () => {
    for (const file of UNTOUCHED) {
      expect(read(file)).not.toContain('twin-grok-direct');
      expect(read(file)).not.toContain('DesignTwinGrokDirectPage');
    }
    const routes = read('src/site00/config/routes.ts');
    expect(routes).toContain("projectDesignTwin: '/projects/:projectSlug/design/twin'");
    expect(routes).toContain("projectDesignTwinV4: '/projects/:projectSlug/design/twin-v4'");
    expect(routes).toContain("projectDesignTwinTestA: '/projects/:projectSlug/design/twin-testA'");
    expect(routes).toContain("projectDesignTwinTestB: '/projects/:projectSlug/design/twin-testB'");
    expect(routes).toContain("projectDesign: '/projects/:projectSlug/design'");
  });
});
