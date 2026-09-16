import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { SITE00_ROUTES, site00ProjectDesignTwinOpusDirectPath } from '../src/site00/config/routes';
import {
  TWIN_OPUS_DIRECT_DEFAULT_VIEW_MODE,
  TWIN_OPUS_DIRECT_VIEW_MODES,
  TWIN_OPUS_DIRECT_VIEW_MODE_LABELS,
} from '../src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace';
import {
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

  it('only sources imagery from the approved repo paper texture', () => {
    expect(TWIN_OPUS_DIRECT_PAPER_TEXTURE).toBe(
      '/site00/creative-direction/ndxbook/eu-branch-receipts-isolated.webp',
    );
    const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1]);
    for (const url of urls) {
      expect(url).toMatch(/fonts\.googleapis\.com|--tod-|var\(/);
    }
  });
});

describe('P0.VR.DESIGNBENCH.OPUS-DIRECT1 — live text fidelity', () => {
  it('carries the golden copy for every labelled region', () => {
    expect(TWIN_OPUS_DIRECT_HERO.headline).toEqual(['THE SIGNAL', 'IS THE INDEX']);
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

describe('P0.VR.DESIGNBENCH.OPUS-DIRECT1 — accessibility', () => {
  it('uses real controls with state exposed to assistive tech', () => {
    // The shell owns the chrome; the canonical renderer owns the workspace body.
    const rendered =
      screen + readRepo('src/site00/components/designBench/opusDirect/TwinOpusDirectCanonicalView.tsx');
    expect(rendered).toContain('aria-pressed');
    expect(rendered).toContain('aria-current');
    expect(rendered).toContain('aria-expanded');
    expect(rendered).toContain('role="tablist"');
    expect(rendered).toContain('role="tabpanel"');
    expect(rendered).toContain('aria-selected');
    expect(rendered).toContain('aria-label="Authority rail"');
  });

  it('renders decorative svg without exposing it to the a11y tree', () => {
    const icons = readRepo('src/site00/components/designBench/opusDirect/TwinOpusDirectIcons.tsx');
    const svgCount = (icons.match(/<svg/g) ?? []).length;
    const hiddenCount = (icons.match(/aria-hidden="true"/g) ?? []).length;
    expect(svgCount).toBeGreaterThan(20);
    expect(hiddenCount).toBe(svgCount);
  });
});

describe('P0.VR.DESIGNBENCH.OPUS-DIRECT1R2 — border hierarchy and small-UI weight', () => {
  const token = (name: string) => {
    const match = css.match(new RegExp(`--tod-border-${name}:\\s*#([0-9a-f]{6});`));
    if (!match) throw new Error(`missing --tod-border-${name}`);
    return parseInt(match[1].slice(0, 2), 16);
  };

  it('defines four border tiers ordered darkest to lightest', () => {
    const major = token('major');
    const panel = token('panel');
    const column = token('column');
    const subtle = token('subtle');
    expect(major).toBeLessThan(panel);
    expect(panel).toBeLessThan(column);
    expect(column).toBeLessThan(subtle);
    // Strong enough to read as a technical divider, never a heavy black frame.
    expect(major).toBeGreaterThan(130);
    expect(subtle).toBeLessThan(230);
  });

  it('puts every major panel frame on the strongest tier', () => {
    for (const selector of ['.tod-gallery {', '.tod-out {', '.tod-pipe {']) {
      const block = css.slice(css.indexOf(selector), css.indexOf('}', css.indexOf(selector)));
      expect(block).toContain('var(--tod-border-major)');
    }
  });

  it('keeps in-panel dividers subordinate to the frames that contain them', () => {
    for (const selector of ['.tod-out__col {', '.tod-pipe__col {', '.tod-actions__cell {']) {
      const block = css.slice(css.indexOf(selector), css.indexOf('}', css.indexOf(selector)));
      expect(block).toContain('var(--tod-border-column)');
    }
    for (const selector of ['.tod-nav__cell {', '.tod-band__col {', '.tod-bottom__cell {']) {
      const block = css.slice(css.indexOf(selector), css.indexOf('}', css.indexOf(selector)));
      expect(block).toContain('var(--tod-border-subtle)');
    }
  });

  it('routes every chrome border through the hierarchy instead of ad-hoc greys', () => {
    expect(css).not.toContain('--tod-line');
    expect(css).not.toContain('border-right: 1px solid #d6d6d6');
    expect(css).not.toContain('border-right: 1px solid #e2e2e2');
  });

  it('raises small UI text to a real variable-font cut without bolding it', () => {
    expect(css).toContain('--tod-weight-ui: 500');
    const uses = (css.match(/font-weight: var\(--tod-weight-ui\)/g) ?? []).length;
    expect(uses).toBeGreaterThan(20);
    // Restraint: the 500 cut does the work, 700 stays reserved for emphasis slots.
    const bold = (css.match(/font-weight: 700/g) ?? []).length;
    expect(uses).toBeGreaterThan(bold * 2);
  });

  it('leaves the hero headline and the reference imagery untouched', () => {
    const headline = css.slice(css.indexOf('.tod-hero__headline {'), css.indexOf('}', css.indexOf('.tod-hero__headline {')));
    expect(headline).toContain('font-weight: 400');
    expect(headline).not.toContain('--tod-weight-ui');
    expect(css).toContain('border: 1px solid #8e7d60');
    expect(css).toContain('border: 1.3px solid rgba(186, 38, 28, 0.9)');
  });
});

describe('P0.VR.DESIGNBENCH.OPUS-VIEWMODE1 — canonical / list view mode', () => {
  const workspaceModel = readRepo('src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts');
  const control = readRepo('src/site00/components/designBench/opusDirect/TwinOpusDirectViewModeControl.tsx');
  const canonicalView = readRepo('src/site00/components/designBench/opusDirect/TwinOpusDirectCanonicalView.tsx');
  const listView = readRepo('src/site00/components/designBench/opusDirect/TwinOpusDirectListView.tsx');

  it('declares exactly two modes and defaults to canonical', () => {
    expect(TWIN_OPUS_DIRECT_VIEW_MODES).toEqual(['canonical', 'list']);
    expect(TWIN_OPUS_DIRECT_DEFAULT_VIEW_MODE).toBe('canonical');
    expect(TWIN_OPUS_DIRECT_VIEW_MODE_LABELS).toEqual({ canonical: 'CANONICAL', list: 'LIST' });
  });

  it('routes both modes through one renderer registry on the same route', () => {
    expect(screen).toContain('const VIEW_RENDERERS');
    expect(screen).toContain('canonical: { body: TwinOpusDirectCanonicalBody, record: TwinOpusDirectCanonicalRecord }');
    expect(screen).toContain('list: { body: TwinOpusDirectListBody, record: TwinOpusDirectListRecord }');
    // One route, one screen: the mode is presentation state, never a path.
    expect(routeTable).not.toContain('twin-opus-direct/list');
    expect(routeTable).not.toContain('twin-opus-direct/canonical');
    const routes = readRepo('src/site00/config/routes.ts');
    expect(routes).not.toContain('twin-opus-direct/list');
  });

  it('keeps one shared state model with no per-view duplicates', () => {
    for (const forbidden of [
      'canonicalSelectedCandidate',
      'listSelectedCandidate',
      'canonicalReadiness',
      'listReadiness',
      'canonicalAuthorityPair',
      'listAuthorityPair',
    ]) {
      expect(workspaceModel + screen + canonicalView + listView).not.toContain(forbidden);
    }
    // Renderers present state; they never own it.
    expect(listView).not.toContain('useState');
    expect(canonicalView).not.toContain('useState');
    expect(workspaceModel).toContain('useTwinOpusDirectWorkspace');
  });

  it('switching mode cannot mutate workspace data', () => {
    const setter = workspaceModel.slice(
      workspaceModel.indexOf('const setViewMode = useCallback'),
      workspaceModel.indexOf('const actions = useMemo'),
    );
    for (const mutator of ['setCandidateId', 'setViewport', 'setAuthorityPairOpen', 'setRecordTabIndex', 'setDockIndex', 'setNavIndex']) {
      expect(setter).not.toContain(mutator);
    }
    expect(setter).toContain('sessionStorage.setItem');
  });

  it('presents the control as a labelled radiogroup in the utility row', () => {
    expect(control).toContain('role="radiogroup"');
    expect(control).toContain('role="radio"');
    expect(control).toContain('aria-checked={active}');
    expect(control).toContain('ArrowRight');
    expect(control).toContain('ArrowLeft');
    expect(screen).toContain('<TwinOpusDirectViewModeControl mode={viewMode} onChange={setViewMode} />');
    // Placed in the header utility row, never in hero / candidate / readiness / dock.
    const header = screen.slice(screen.indexOf('<header className="tod-header">'), screen.indexOf('</header>'));
    expect(header).toContain('TwinOpusDirectViewModeControl');
  });

  it('styles the control in the existing workspace language and keeps it usable at every width', () => {
    expect(css).toContain('.tod-viewmode__cell.is-active');
    const active = css.slice(css.indexOf('.tod-viewmode__cell.is-active'), css.indexOf('}', css.indexOf('.tod-viewmode__cell.is-active')));
    expect(active).toContain('var(--tod-black)');
    expect(active).toContain('var(--tod-lime)');
    expect(css).toContain('.tod-viewmode__cell:focus-visible');
    // Counter-scales against the artboard scale so it never renders microscopic.
    expect(css).toContain('scale(var(--tod-viewmode-boost, 1))');
    expect(screen).toContain('VIEW_MODE_MAX_BOOST');
  });

  it('freezes the canonical renderer and leaves the list surface a mount point', () => {
    for (const marker of ['tod-herorow', 'tod-gallery', 'tod-out', 'tod-pipe', 'tod-actions']) {
      expect(canonicalView).toContain(marker);
    }
    // Opus must not design the list view: no canonical panels rebuilt in another shape.
    for (const marker of ['tod-herorow', 'tod-gallery', 'tod-card', 'tod-out__col', 'tod-pipe__col', 'tod-rail']) {
      expect(listView).not.toContain(marker);
    }
    expect(listView).toContain('SPARK PRESENTATION PENDING');
    expect(listView).toContain('tod-listmount');
  });
});
