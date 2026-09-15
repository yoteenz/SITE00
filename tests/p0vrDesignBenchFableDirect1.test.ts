/**
 * P0.VR.DESIGNBENCH.FABLE-DIRECT1 — isolated Claude Fable direct reconstruction of the
 * NDXBOOK DESIGN golden. Guards route isolation, the raster-cheat firewall, and the
 * live-text contract measured from the golden.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SITE00_ROUTES, site00ProjectDesignTwinFableDirectPath } from '../src/site00/config/routes';

const ROOT = join(import.meta.dirname, '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

const PAGE = 'src/site00/pages/DesignTwinFableDirectPage.tsx';
const CSS = 'src/site00/styles/site00-twin-fable-direct.css';

describe('P0.VR.DESIGNBENCH.FABLE-DIRECT1 — route + isolation', () => {
  it('registers the isolated twin-fable-direct route', () => {
    expect(SITE00_ROUTES.projectDesignTwinFableDirect).toBe('/projects/:projectSlug/design/twin-fable-direct');
    expect(site00ProjectDesignTwinFableDirectPath('NDXBOOK')).toBe('/projects/ndxbook/design/twin-fable-direct');
  });

  it('wires the route to the Fable page without the CTRL ROOM account guard', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    const idx = routes.indexOf('path={SITE00_ROUTES.projectDesignTwinFableDirect}');
    expect(idx).toBeGreaterThan(-1);
    const block = routes.slice(idx, routes.indexOf('</Site00Layout>', idx));
    expect(block).toContain('<DesignTwinFableDirectPage />');
    expect(block).not.toContain('Site00AccountRouteGuard');
    expect(routes).toContain("import('../site00/pages/DesignTwinFableDirectPage')");
  });

  it('leaves the other benchmark routes untouched', () => {
    expect(SITE00_ROUTES.projectDesignTwin).toBe('/projects/:projectSlug/design/twin');
    expect(SITE00_ROUTES.projectDesignTwinV4).toBe('/projects/:projectSlug/design/twin-v4');
    expect(SITE00_ROUTES.projectDesignTwinTestA).toBe('/projects/:projectSlug/design/twin-testA');
    expect(SITE00_ROUTES.projectDesignTwinTestB).toBe('/projects/:projectSlug/design/twin-testB');
    expect(SITE00_ROUTES.projectDesignTwinSolDirect).toBe('/projects/:projectSlug/design/twin-sol-direct');
    expect(SITE00_ROUTES.projectDesignTwinGrokDirect).toBe('/projects/:projectSlug/design/twin-grok-direct');
  });

  it('uses only its own scoped stylesheet and does not import other twin renderers', () => {
    const page = read(PAGE);
    expect(page).toContain("import '../styles/site00-twin-fable-direct.css'");
    expect(page).not.toMatch(/SolDirect|GrokDirect|OpusDirect|DesignTwinImplementation|DesignTwinV4/);
    const css = read(CSS);
    expect(css.match(/^\.fd-|^:where\(\.fd-viewport\)|^@import|^\/\*|^\s|^$|^}/gm)).toBeTruthy();
    expect(css).not.toMatch(/^\.(site00|twin|ndx|grok|sol)/m);
  });
});

describe('P0.VR.DESIGNBENCH.FABLE-DIRECT1 — raster-cheat firewall', () => {
  it('never renders the golden / mobile master screenshot or any screenshot slice', () => {
    const page = read(PAGE);
    const css = read(CSS);
    for (const src of [page, css]) {
      expect(src).not.toContain('mobile-master');
      expect(src).not.toContain('desktop-master');
      expect(src).not.toContain('founder-r5f2-ndxbook');
      expect(src).not.toContain('twin-v3-design-page-authority');
      expect(src).not.toMatch(/<img\b/);
      expect(src).not.toMatch(/<iframe\b/);
      expect(src).not.toMatch(/<canvas\b/);
      expect(src).not.toMatch(/data:image/);
    }
  });

  it('only references approved NDXBOOK creative-direction texture assets', () => {
    const css = read(CSS);
    const urls = Array.from(css.matchAll(/url\('([^']+)'\)/g)).map((m) => m[1]);
    const assetUrls = urls.filter((u) => !u.startsWith('https://fonts.googleapis.com'));
    expect(assetUrls.length).toBeGreaterThan(0);
    for (const u of assetUrls) {
      expect(u.startsWith('/site00/creative-direction/ndxbook/')).toBe(true);
    }
  });
});

describe('P0.VR.DESIGNBENCH.FABLE-DIRECT1 — live text + geometry contract', () => {
  const page = read(PAGE);
  const css = read(CSS);

  it('carries the golden live copy', () => {
    for (const copy of [
      'CULTURAL_INTELLIGENCE_EDITORIAL',
      'PROJECT CREATIVE CONTEXT',
      'REVIEW_ACTIVE_CONCEPT',
      'PAIR: UNLOCKED • V1.3',
      'CULTURAL RECEIPT',
      'THE SIGNAL',
      'IS THE INDEX',
      'CULTURE AS EVIDENCE.',
      'IDEAS AS INDEX.',
      'PAGE 001 INDEXED',
      'ARCHIVAL EVIDENCE',
      'SELECT FOR MOBILE',
      'SELECT FOR DESKTOP',
      'AUTHORITY PAIR',
      'PROMOTE MOBILE',
      'PAIR REVIEW',
      'REVIEW AUTHORITY',
      'LOCK MOBILE + DESKTOP',
      'CONCEPT CANDIDATE GALLERY',
      'COMPARE CONCEPTS',
      'REFINE CONCEPT',
      'REGENERATE CONCEPT',
      'INSPECT CANDIDATE',
      'VIEW FULLSCREEN',
      'STRUCTURED OUTPUT REVIEW',
      'PIPELINE / READINESS',
      'PROMOTE MOBILE MASTER',
      'TO AUTHORITY PAIR',
      'PRIMARY ACTION',
      'MOVE TO BUILD WHEN READY',
      'VIEW TECHNICAL DETAILS',
      'NAA-RSF1-AUTHORITY-SELECTION-V1',
      'ENTRY001-CAMPAIGN-ARCHIVE',
      'MASTER AMENDMENT STATUS',
      'CONTEXTUAL NEXT ACTION',
    ]) {
      expect(page).toContain(copy);
    }
  });

  it('locks the 608×1088 reference artboard and hero/rail split measured from the golden', () => {
    expect(page).toContain('width: 608, height: 1088');
    expect(css).toContain('width: 608px;');
    expect(css).toContain('height: 1088px;');
    expect(css).toContain('grid-template-columns: 410px 156px;');
    expect(css).toContain('column-gap: 13px;');
    expect(css).toContain('grid-template-columns: 118px 116px 116px 109px 1fr;');
    expect(css).toContain('grid-template-columns: 129px 131px 123px 1fr;');
  });

  it('keeps interactive function (viewport, candidate, tabs, bottom nav, authority selection)', () => {
    expect(page).toContain("useState<ViewportId>('MOBILE')");
    expect(page).toContain("useState('V1.3')");
    expect(page).toContain("useState<LowerTabId>('CONCEPT DATA')");
    expect(page).toContain("useState<BottomNavId>('WORKSPACE')");
    expect(page).toContain('aria-pressed={mobileSelected}');
    expect(page).toContain('role="tablist"');
    expect(page).toContain('role="listbox"');
  });
});
