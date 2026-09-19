import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITE00_ROUTES, site00ProjectDesignViewModeIconsPath } from '../src/site00/config/routes.js';
import { DVS_GLYPHS } from '../src/site00/visualSystem/glyphs.js';
import { VIEW_MODE_ICON_PUBLIC } from '../src/site00/visualSystem/viewModeIcons.js';

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

const LIVE_UI = [
  'src/site00/pages/StudioWorldDesignPage.tsx',
  'src/site00/components/designWorkspace/DesignWorkspaceNavIcon.tsx',
  'src/site00/components/designWorkspace/DesignDwSectionIcon.tsx',
];

describe('P0.VR.DESIGN.GROK-VIEWMODE-ICONS1 staged Canonical / List pair', () => {
  it('registers an isolated review route without account guard', () => {
    expect(SITE00_ROUTES.projectDesignViewModeIcons).toBe('/projects/:projectSlug/design/viewmode-icons');
    expect(site00ProjectDesignViewModeIconsPath('ndxbook')).toBe('/projects/ndxbook/design/viewmode-icons');
    const routes = read('src/routes/Site00Routes.tsx');
    expect(routes).toContain('DesignViewModeIconsPage');
    expect(routes).toMatch(/projectDesignViewModeIcons[\s\S]{0,280}DesignViewModeIconsPage/);
    expect(routes).not.toMatch(/projectDesignViewModeIcons[\s\S]{0,280}Site00AccountRouteGuard/);
  });

  it('ships currentColor SVG files with no embedded text or raster effects', () => {
    const canonical = read('public/site00/design-visual-system/canonical-view.svg');
    const list = read('public/site00/design-visual-system/list-view.svg');
    expect(VIEW_MODE_ICON_PUBLIC.canonical).toBe('/site00/design-visual-system/canonical-view.svg');
    expect(VIEW_MODE_ICON_PUBLIC.list).toBe('/site00/design-visual-system/list-view.svg');
    for (const svg of [canonical, list]) {
      expect(svg).toContain('viewBox="0 0 24 24"');
      expect(svg).toContain('currentColor');
      expect(svg).toContain('stroke-linecap="square"');
      expect(svg).not.toContain('<text');
      expect(svg).not.toContain('gradient');
      expect(svg).not.toContain('filter');
      expect(svg).not.toContain('<image');
    }
    expect(canonical).toContain('width="16" height="16"');
    expect(list).toContain('h12');
    expect(list).not.toContain('M3 6h18M3 12h18M3 18h18');
  });

  it('keeps Canonical and List as distinct glyphs in the staged family', () => {
    expect(DVS_GLYPHS.canonical).toBeTypeOf('function');
    expect(DVS_GLYPHS.list).toBeTypeOf('function');
    expect(DVS_GLYPHS['canonical-view']).toBeTypeOf('function');
    expect(DVS_GLYPHS['list-view']).toBeTypeOf('function');
    const source = read('src/site00/visualSystem/viewModeIcons.tsx');
    expect(source).toContain('ViewModeCanonicalGlyph');
    expect(source).toContain('ViewModeListGlyph');
    expect(source.indexOf('ViewModeCanonicalGlyph')).not.toBe(source.indexOf('ViewModeListGlyph'));
  });

  it('does not alter the live DESIGN toolbar', () => {
    for (const file of LIVE_UI) {
      const source = read(file);
      expect(source).not.toContain('DesignViewModeIconsPage');
      expect(source).not.toContain('canonical-view.svg');
      expect(source).not.toContain('viewModeIcons');
    }
    const page = read('src/site00/pages/DesignViewModeIconsPage.tsx');
    expect(page).toContain('ICON ONLY');
    expect(page).toContain('LIVE UI UNTOUCHED');
  });
});
