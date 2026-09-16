import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { SITE00_ROUTES, site00ProjectDesignTwinOpusDirectPath } from '../src/site00/config/routes';
import {
  TWIN_OPUS_DIRECT_ASSETS,
  TWIN_OPUS_DIRECT_BOTTOM_NAV,
  TWIN_OPUS_DIRECT_CANDIDATES,
  TWIN_OPUS_DIRECT_CANDIDATE_ACTIONS,
  TWIN_OPUS_DIRECT_CONCEPT_TABS,
  TWIN_OPUS_DIRECT_GOLDEN_MASTER_PATH,
  TWIN_OPUS_DIRECT_HERO,
  TWIN_OPUS_DIRECT_LINEAGE,
  TWIN_OPUS_DIRECT_OUTPUT_COLUMNS,
  TWIN_OPUS_DIRECT_PAPER_TEXTURE,
  TWIN_OPUS_DIRECT_PRIMARY_NAV,
  TWIN_OPUS_DIRECT_RAIL_ACTIONS,
  TWIN_OPUS_DIRECT_REFERENCE_VIEWPORT,
  TWIN_OPUS_DIRECT_VIEWPORTS,
} from '../src/site00/components/designBench/opusDirect/twinOpusDirectContent';

const repoRoot = path.resolve(__dirname, '..');
const readRepo = (relative: string) => readFileSync(path.join(repoRoot, relative), 'utf8');

const css = readRepo('src/site00/styles/site00-twin-opus-direct.css');
const screen = readRepo('src/site00/components/designBench/opusDirect/TwinOpusDirectScreen.tsx');
const page = readRepo('src/site00/pages/DesignTwinOpusDirectPage.tsx');
const routeTable = readRepo('src/routes/Site00Routes.tsx');

/** Golden geometry measured off the 608x1088 master, expressed at the 768x1376 artboard. */
const GOLDEN_BANDS = [
  { name: 'header', height: 41.1 },
  { name: 'nav', height: 33.5 },
  { name: 'context', height: 36 },
  { name: 'band', height: 92.3 },
  { name: 'tabs', height: 34.4 },
  { name: 'concept', height: 92.2 },
  { name: 'bottom', height: 49.7 },
];

describe('P0.VR.DESIGNBENCH.OPUS-DIRECT1 — isolated route', () => {
  it('registers a dedicated design-bench route', () => {
    expect(SITE00_ROUTES.projectDesignTwinOpusDirect).toBe(
      '/projects/:projectSlug/design/twin-opus-direct',
    );
    expect(site00ProjectDesignTwinOpusDirectPath('NDXBOOK')).toBe(
      '/projects/ndxbook/design/twin-opus-direct',
    );
  });

  it('mounts the route without the CTRL ROOM account guard', () => {
    const start = routeTable.indexOf('SITE00_ROUTES.projectDesignTwinOpusDirect');
    const block = routeTable.slice(start, routeTable.indexOf('<Route', start));
    expect(block).toContain('<DesignTwinOpusDirectPage />');
    expect(block).not.toContain('Site00AccountRouteGuard');
  });

  it('leaves the other twin benches untouched by importing none of them', () => {
    const forbidden = [
      'twin-grok-direct',
      'twin-sol-direct',
      'twin-testA',
      'twin-testB',
      'twin-v4',
      'DesignPageV3',
      'StudioWorldDesignWorkspace',
      'twin-v3',
    ];
    const importsOf = (source: string) =>
      (source.match(/^\s*import[\s\S]*?from\s+'[^']+';/gm) ?? []).join('\n');
    for (const token of forbidden) {
      expect(importsOf(screen)).not.toContain(token);
      expect(importsOf(page)).not.toContain(token);
      expect(css).not.toContain(token);
    }
  });
});

describe('P0.VR.DESIGNBENCH.OPUS-DIRECT1 — reference fidelity contract', () => {
  it('locks the artboard to the golden reference viewport', () => {
    expect(TWIN_OPUS_DIRECT_REFERENCE_VIEWPORT).toEqual({ width: 768, height: 1376 });
    expect(css).toContain('--tod-w: 768px');
    expect(css).toContain('--tod-h: 1376px');
  });

  it('keeps the measured outer frame: 15.2 / 732.6 / 20.2 content grid', () => {
    expect(css).toContain('--tod-pad-l: 15.2px');
    expect(css).toContain('--tod-pad-r: 20.2px');
    expect(css).toContain('--tod-content: 732.6px');
  });

  it('keeps the measured hero / authority-rail ratio', () => {
    expect(css).toContain('--tod-hero-w: 517.9px');
    expect(css).toContain('--tod-hero-gap: 12.6px');
    expect(css).toContain('--tod-rail-w: 202.1px');
    const total = 517.9 + 12.6 + 202.1;
    expect(Math.abs(total - 732.6)).toBeLessThan(0.1);
  });

  it('keeps the measured chrome band heights', () => {
    for (const band of GOLDEN_BANDS) {
      expect(css).toContain(`${band.height}px`);
    }
    const chrome = GOLDEN_BANDS.reduce((sum, band) => sum + band.height, 0);
    // Chrome + main must fill the artboard; main is the flexible remainder (~996px).
    expect(1376 - chrome).toBeGreaterThan(980);
    expect(1376 - chrome).toBeLessThan(1010);
  });

  it('keeps the measured major section heights inside the main column', () => {
    for (const height of ['395.4px', '195.3px', '36.6px', '190.7px', '151.6px']) {
      expect(css).toContain(height);
    }
  });
});

describe('P0.VR.DESIGNBENCH.OPUS-DIRECT1 — no raster cheat', () => {
  it('never references the golden master anywhere in the rendered page', () => {
    expect(TWIN_OPUS_DIRECT_GOLDEN_MASTER_PATH).toContain('founder-r5f2-ndxbook');
    expect(screen).not.toContain('founder-r5f2-ndxbook');
    expect(css).not.toContain('founder-r5f2-ndxbook');
    expect(page).not.toContain('founder-r5f2-ndxbook');
    expect(screen).not.toContain('mobile-master');
    expect(css).not.toContain('mobile-master');
  });

  it('uses no iframe, canvas paint, or full-page background image', () => {
    expect(screen).not.toMatch(/<iframe/i);
    expect(screen).not.toMatch(/<canvas/i);
    expect(css).not.toMatch(/\.tod-screen\s*\{[^}]*background-image/);
  });

  it('keeps CSS url() limited to fonts and variables', () => {
    expect(TWIN_OPUS_DIRECT_PAPER_TEXTURE).toBe(
      '/site00/creative-direction/ndxbook/eu-branch-receipts-isolated.webp',
    );
    const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1]);
    for (const url of urls) {
      expect(url).toMatch(/fonts\.googleapis\.com|--tod-|var\(/);
    }
  });

  it('loads Grok rasters from the isolated opus-direct public folder via img tags', () => {
    const content = readRepo('src/site00/components/designBench/opusDirect/twinOpusDirectContent.ts');
    const assetPaths = Object.values(TWIN_OPUS_DIRECT_ASSETS);
    expect(assetPaths).toHaveLength(8);
    for (const assetPath of assetPaths) {
      expect(assetPath.startsWith('/site00/twin-opus-direct/')).toBe(true);
      expect(content).toContain(assetPath);
      expect(existsSync(path.join(repoRoot, 'public', assetPath.replace(/^\//, '')))).toBe(true);
    }
    expect(screen).toContain('TWIN_OPUS_DIRECT_ASSETS.hand');
    expect(screen).toContain('TWIN_OPUS_DIRECT_ASSETS.form');
    expect(screen).toContain('TWIN_OPUS_DIRECT_ASSETS.overlay');
    expect(screen).toContain('TWIN_OPUS_DIRECT_ASSETS.blueprint');
    expect(screen).toContain('TWIN_OPUS_DIRECT_ASSETS.split001');
    expect(screen).toContain('TWIN_OPUS_DIRECT_ASSETS.collage');
    expect(screen).toContain('TWIN_OPUS_DIRECT_ASSETS.evidence');
    expect(css).not.toContain('/site00/twin-opus-direct/');
    expect(screen).not.toMatch(/style=\{\{\s*backgroundImage/);
  });
});

describe('P0.VR.DESIGNBENCH.GROK-ASSET-OPUS1 — image slot wiring', () => {
  it('tags every raster slot without touching live copy or icons', () => {
    const slots = [
      'hand-plate',
      'authority-desktop',
      'candidate-grain',
      'candidate-collage',
      'candidate-archive',
      'output-grounding',
      'output-blueprint',
      'output-overlay',
      'output-assets',
    ];
    for (const slot of slots) {
      expect(screen).toContain(`data-tod-slot="${slot}"`);
    }
    expect(screen).not.toContain('TodPointingHandPlate');
    expect(screen).toContain('TWIN_OPUS_DIRECT_HERO.headline');
    expect(screen).toContain('TodIconMenu');
  });
});

describe('P0.VR.DESIGNBENCH.OPUS-DIRECT1 — live text fidelity', () => {
  it('carries the golden copy for every labelled region', () => {
    expect(TWIN_OPUS_DIRECT_HERO.headline).toEqual(['THE SIGNAL', 'IS THE', 'INDEX']);
    expect(TWIN_OPUS_DIRECT_HERO.standfirst).toEqual([
      'CULTURE AS EVIDENCE.',
      'IDEAS AS INDEX.',
      'NDXBOOK.',
    ]);
    expect(TWIN_OPUS_DIRECT_PRIMARY_NAV).toEqual([
      'REFERENCES',
      'ASSETS',
      'PAGES',
      'SKINS',
      'HISTORY',
    ]);
    expect(TWIN_OPUS_DIRECT_CONCEPT_TABS).toEqual([
      'CONCEPT DATA',
      'VERSION HISTORY',
      'CHANGE HISTORY',
      'MASTER UPDATE',
      'AMENDMENT',
    ]);
  });

  it('keeps the golden region counts', () => {
    expect(TWIN_OPUS_DIRECT_VIEWPORTS).toHaveLength(3);
    expect(TWIN_OPUS_DIRECT_CANDIDATES).toHaveLength(4);
    expect(TWIN_OPUS_DIRECT_CANDIDATE_ACTIONS).toHaveLength(4);
    expect(TWIN_OPUS_DIRECT_OUTPUT_COLUMNS).toHaveLength(5);
    expect(TWIN_OPUS_DIRECT_BOTTOM_NAV).toHaveLength(5);
    expect(TWIN_OPUS_DIRECT_RAIL_ACTIONS).toHaveLength(5);
    expect(TWIN_OPUS_DIRECT_OUTPUT_COLUMNS.map((c) => c.label)).toEqual([
      'GROUNDING',
      'BLUEPRINT',
      'OVERLAY',
      'ASSETS',
      'FUNCTION',
    ]);
  });

  it('records the sprint lineage', () => {
    expect(TWIN_OPUS_DIRECT_LINEAGE).toBe('P0.VR.DESIGNBENCH.OPUS-DIRECT1');
  });
});

describe('P0.VR.DESIGNBENCH.GROK-HERO-TEXT-R2 — hero headline reconstruction', () => {
  it('rebuilds a three-line editorial block instead of resizing Anton', () => {
    expect(TWIN_OPUS_DIRECT_HERO.headline).toEqual(['THE SIGNAL', 'IS THE', 'INDEX']);
    expect(css).toContain("font-family: 'Inter Tight', Inter, 'Helvetica Neue', Arial, sans-serif");
    expect(css).toContain('font-weight: 800');
    expect(css).toContain('line-height: 0.78');
    expect(css).toContain('letter-spacing: -0.078em');
    expect(css).toContain('font-stretch: condensed');
    expect(css).not.toMatch(/\.tod-hero__headlineInk\s*\{[^}]*scaleX/);
    expect(css).not.toContain('font-size: 67.2px');
    expect(screen).toContain('TWIN_OPUS_DIRECT_HERO.headline.map');
  });
});

describe('P0.VR.DESIGNBENCH.OPUS-DIRECT1 — accessibility', () => {
  it('uses real controls with state exposed to assistive tech', () => {
    expect(screen).toContain('aria-pressed');
    expect(screen).toContain('aria-current');
    expect(screen).toContain('aria-expanded');
    expect(screen).toContain('role="tablist"');
    expect(screen).toContain('role="tabpanel"');
    expect(screen).toContain('aria-selected');
    expect(screen).toContain('aria-label="Authority rail"');
  });

  it('renders decorative svg without exposing it to the a11y tree', () => {
    const icons = readRepo('src/site00/components/designBench/opusDirect/TwinOpusDirectIcons.tsx');
    const svgCount = (icons.match(/<svg/g) ?? []).length;
    const hiddenCount = (icons.match(/aria-hidden="true"/g) ?? []).length;
    expect(svgCount).toBeGreaterThan(20);
    expect(hiddenCount).toBe(svgCount);
  });
});
