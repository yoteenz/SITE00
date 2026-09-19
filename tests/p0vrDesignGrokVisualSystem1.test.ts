import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITE00_ROUTES, site00ProjectDesignVisualSystemPath } from '../src/site00/config/routes.js';
import { DVS_INSET, DVS_LIME, DVS_STROKE, DVS_VIEWBOX } from '../src/site00/visualSystem/geometry.js';
import { DVS_GLYPH_NAMES, DVS_GLYPHS } from '../src/site00/visualSystem/glyphs.js';
import {
  assertDvsManifestCoverage,
  DVS_MANIFEST,
  DVS_REQUIRED_IDS,
  DVS_STAGED_ASSET_COUNT,
} from '../src/site00/visualSystem/manifest.js';

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

const UNTOUCHED = [
  'src/site00/pages/DesignTwinImplementationPage.tsx',
  'src/site00/pages/DesignTwinV4ProofPage.tsx',
  'src/site00/pages/DesignTwinTestAPage.tsx',
  'src/site00/pages/SolDesignBenchmarkPage.tsx',
  'src/site00/pages/DesignTwinGrokDirectPage.tsx',
  'src/site00/pages/StudioWorldDesignPage.tsx',
  'src/site00/components/designWorkspace/DesignWorkspaceNavIcon.tsx',
  'src/site00/components/designWorkspace/DesignDwSectionIcon.tsx',
];

const ISOLATION_BAN = [
  'twin-grok-direct',
  'twin-sol-direct',
  'twin-opus-direct',
  'from \'lucide',
  'from "lucide',
];

describe('P0.VR.DESIGN.GROK-VISUAL-SYSTEM1 staged icon family', () => {
  it('registers the isolated visual-system review route without account guard', () => {
    expect(SITE00_ROUTES.projectDesignVisualSystem).toBe('/projects/:projectSlug/design/visual-system');
    expect(site00ProjectDesignVisualSystemPath('ndxbook')).toBe('/projects/ndxbook/design/visual-system');
    const routes = read('src/routes/Site00Routes.tsx');
    expect(routes).toContain('projectDesignVisualSystem');
    expect(routes).toContain('DesignVisualSystemPage');
    expect(routes).toMatch(/projectDesignVisualSystem[\s\S]{0,280}DesignVisualSystemPage/);
    expect(routes).not.toMatch(/projectDesignVisualSystem[\s\S]{0,280}Site00AccountRouteGuard/);
  });

  it('keeps one construction family', () => {
    expect(DVS_VIEWBOX).toBe(24);
    expect(DVS_STROKE).toBe(1.5);
    expect(DVS_INSET).toBe(4);
    expect(DVS_LIME).toBe('#cdee30');
    const geometry = read('src/site00/visualSystem/geometry.ts');
    expect(geometry).toContain("strokeLinecap: 'square'");
    expect(geometry).toContain("strokeLinejoin: 'miter'");
  });

  it('covers the required DESIGN workspace marks', () => {
    for (const id of DVS_REQUIRED_IDS) {
      expect(DVS_GLYPHS[id], id).toBeTypeOf('function');
      expect(DVS_MANIFEST.some((entry) => entry.id === id), id).toBe(true);
    }
    for (let n = 1; n <= 11; n += 1) {
      const id = `stage-${String(n).padStart(2, '0')}`;
      expect(DVS_GLYPHS[id], id).toBeTypeOf('function');
    }
  });

  it('keeps manifest and glyphs in lockstep', () => {
    const coverage = assertDvsManifestCoverage();
    expect(coverage.missingGlyphs).toEqual([]);
    expect(coverage.extraGlyphs).toEqual([]);
    expect(DVS_STAGED_ASSET_COUNT).toBe(DVS_MANIFEST.length);
    expect(DVS_GLYPH_NAMES.length).toBe(DVS_MANIFEST.length);
    expect(DVS_STAGED_ASSET_COUNT).toBeGreaterThanOrEqual(90);
  });

  it('keeps canonical and list related but distinct', () => {
    const glyphs = read('src/site00/visualSystem/glyphs.tsx');
    const pair = read('src/site00/visualSystem/viewModeIcons.tsx');
    expect(glyphs).toContain('canonical:');
    expect(glyphs).toContain('list:');
    expect(glyphs.indexOf('canonical:')).not.toBe(glyphs.indexOf('list:'));
    expect(pair).toContain('ViewModeCanonicalGlyph');
    expect(pair).toContain('ViewModeListGlyph');
    expect(pair).toMatch(/rect[\s\S]+width="16" height="16"/);
    expect(pair).toContain('M9.5 6h10.5');
  });

  it('does not mutate live Twin, DESIGN, or approved benches', () => {
    for (const file of UNTOUCHED) {
      const source = read(file);
      expect(source).not.toContain('DesignVisualSystemPage');
      expect(source).not.toContain('visualSystem/');
    }
    const routes = read('src/site00/config/routes.ts');
    expect(routes).toContain("projectDesignTwin: '/projects/:projectSlug/design/twin'");
    expect(routes).toContain("projectDesignTwinV4: '/projects/:projectSlug/design/twin-v4'");
    expect(routes).toContain("projectDesignTwinTestA: '/projects/:projectSlug/design/twin-testA'");
    expect(routes).toContain("projectDesignTwinTestB: '/projects/:projectSlug/design/twin-testB'");
    expect(routes).toContain("projectDesign: '/projects/:projectSlug/design'");
  });

  it('stays isolated from other benches and generic icon kits', () => {
    const family = [
      'src/site00/visualSystem/glyphs.tsx',
      'src/site00/visualSystem/DesignVisualIcon.tsx',
      'src/site00/visualSystem/manifest.ts',
      'src/site00/visualSystem/viewModeIcons.tsx',
      'src/site00/pages/DesignVisualSystemPage.tsx',
      'src/site00/styles/site00-design-visual-system.css',
    ];
    for (const file of family) {
      const source = read(file);
      for (const ban of ISOLATION_BAN) {
        expect(source, `${file} ${ban}`).not.toContain(ban);
      }
    }
  });
});
