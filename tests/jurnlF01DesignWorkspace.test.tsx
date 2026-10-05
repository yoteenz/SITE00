/**
 * P0.JURNL.SITE00-INGEST-F01 — JURNL inside the real SITE 00 DESIGN workspace: project-reactive modes, inspector,
 * VIEWPORT project runtime (presets 393×852 / 834×1194 / 1440×900, SAFE AREA / GRID / BOUNDS / REFERENCE),
 * host chrome PROJECT switcher, NDXBOOK unchanged.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_DESIGN_MODE_ORDER, type ProductionDesignMode } from '../src/site00/config/production-authority-registry';
import { DesignChamber, DesignModeBar } from '../src/site00/components/productionAuthority/DesignChamber';
import { PROJECT_INSPECT_TABS } from '../src/site00/components/productionAuthority/projectFamilyChamber';
import { applyProjectViewportSize, resolveViewportTarget } from '../src/site00/components/productionAuthority/viewportTargets';
import { PW_IMG } from '../src/site00/components/production/productionImagery';
import { ProductionWorkspaceHeader } from '../src/site00/components/productionHub/chrome';
import { getIngestedProject } from '../src/projects/registry';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const render = (slug: string, mode: ProductionDesignMode, extra = '') =>
  renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [`/production/${slug}/design?mode=${mode}${extra}`] },
      createElement(
        Routes,
        null,
        createElement(Route, {
          path: '/production/:projectSlug/design',
          element: createElement('div', null, createElement(DesignModeBar, { active: mode }), createElement(DesignChamber, { mode })),
        }),
      ),
    ),
  );

const NDX_DESIGN_PLATES = Object.values(PW_IMG.designRows);

describe('DESIGN workspace ingests JURNL (project-reactive modes)', () => {
  for (const mode of PRODUCTION_DESIGN_MODE_ORDER.filter((m) => m !== 'viewport')) {
    it(`${mode}: JURNL project data in the host chamber, no NDXBOOK plates or NDX sample copy`, () => {
      const html = render('jurnl', mode);
      expect(html).toContain(`data-testid="design-chamber-screen" data-mode="${mode}" data-project="jurnl" data-project-type="PERSONAL"`);
      for (const id of ['design-modes', 'design-chamber', 'design-pipeline', 'design-table', 'design-overview']) expect(html, id).toContain(`data-testid="${id}"`);
      expect(html.match(/data-testid="design-panel-0[1-5]"/g)).toHaveLength(5);
      expect(html.match(/data-testid="design-mode-[a-z]+"/g)).toHaveLength(6);
      for (const plate of NDX_DESIGN_PLATES) expect(html).not.toContain(plate);
      expect(html).not.toMatch(/NDX|NDXBOOK|ENTRY 002/);
      expect(html).toContain('JURNL');
      expect(html).toContain(`/production/jurnl/design?mode=${mode}&amp;inspect=`);
    });
  }
  it('BRAND shows JURNL identity: palette, typography, voice, rules, official cover mark', () => {
    const html = render('jurnl', 'brand');
    expect(html).toContain('PLAN TODAY. GROW FREELY.');
    expect(html).toContain('QUIETLY ASSURED + SMART / HUMAN');
    for (const hex of ['#0F3D32', '#6E1F2D', '#C9949A', '#F9F6EF']) expect(html).toContain(hex);
    expect(html).toContain('INSTRUMENT SERIF');
    expect(html).toContain('/site00/projects/jurnl/brand/jurnl-cover.png');
  });
  it('EXPERIENCE shows the family tree, journeys, 27 states, 74 interactions, F01 → F02 transition', () => {
    const html = render('jurnl', 'experience');
    expect(html).toContain('14 SCREENS');
    expect(html).toContain('27 STATES');
    expect(html).toContain('74 MANIFEST ROWS');
    expect(html).toContain('NEW ACCOUNT: 00 → 01 → 02 → 09 → 10 → 11 → 12 → 13');
    expect(html).toContain('F01 → F02');
  });
  it('SURFACES deep-links each responsive target into the real VIEWPORT', () => {
    const html = render('jurnl', 'surfaces');
    for (const p of ['MOBILE', 'TABLET', 'DESKTOP']) expect(html).toContain(`/production/jurnl/design?mode=viewport&amp;preset=${p}`);
    expect(html).toContain('393 × 852');
  });
  it('COMPILER shows the gate (SCREEN COMPLETE ≠ FAMILY COMPLETE) and awaits founder approval', () => {
    const html = render('jurnl', 'compiler');
    expect(html).toContain('IMPLEMENTATION READY — AWAITING FOUNDER APPROVAL');
    expect(html).toContain('SCREEN COMPLETE ≠ FAMILY COMPLETE');
    expect(html).toContain('ASSET POLICY RESOLVED: LEGACY_EXCEPTION');
  });
  it('ASSETS shows F01 legacy exception + asset-first policy + budget', () => {
    const html = render('jurnl', 'assets');
    expect(html).toContain('F01 LEGACY EXCEPTION — LATER FAMILIES ASSET-FIRST');
    expect(html).toContain('14 ATTEMPTED · 7 ISOLATED · 50%');
    expect(html).toContain('CEILING LEFT');
  });
});

describe('PROJECT INSPECTOR', () => {
  const expectations: Record<string, string[]> = {
    brand: ['PALETTE', 'TYPOGRAPHY (PROJECT-SCOPED FONTS)', 'SIL OFL 1.1', 'NO CIRCULAR TAPPABLE CONTROLS'],
    screens: ['F01.00', 'F01.13', 'FOUNDER APPROVED', 'IMPLEMENTATION READY', '/production/jurnl/design?mode=viewport&amp;screen=F01.07'],
    states: ['LOCKED', 'BIOMETRIC DECLINED', 'STATES.SECURITY_NETWORK.jpg', 'state=incorrect_password'],
    interactions: ['F01.04.MODAL.SIGNOUT', 'JURNL_NATIVE_HANDOFF_BOUNDARY', 'FAMILY_02'],
    components: ['JURNL_DRAWER_LONG', 'JurnlDrawer (LONG)', 'JURNL_CHECKBOX', 'JurnlCheckbox'],
    assets: ['LEGACY EXCEPTION', 'ENTRY.ENVIRONMENT.PLATE.001', 'ENTRY.OBJECT.BUST', 'NOT CANONICAL', 'JURNL/F01_ENTRY/ASSETS/**', 'IMPLEMENTATION COMPONENT', '17 FOUNDER APPROVAL'],
    gate: ['SCREENS READY', 'LEGACY EXCEPTION', 'IMPLEMENTATION READY', 'FAMILY COMPLETE', 'FOUNDER APPROVAL'],
    budget: ['GPT IMAGE 2.5 SUNBURST', 'LEGACY PARTIAL', 'SAFE CEILING REMAINING', 'NOT CAPTURED'],
    claims: ['C01', 'ENCRYPTED DATA', 'WITHHELD', 'FLAGGED REQUIRES SUBSTANTIATION'],
  };
  it('has every tab', () => expect(Object.keys(expectations).sort()).toEqual([...PROJECT_INSPECT_TABS].sort()));
  for (const tab of PROJECT_INSPECT_TABS) {
    it(`${tab}`, () => {
      const html = render('jurnl', 'compiler', `&inspect=${tab}`);
      expect(html).toContain(`data-testid="project-inspector" data-tab="${tab}"`);
      for (const t of expectations[tab]!) expect(html, t).toContain(t);
    });
  }
});

describe('VIEWPORT renders the JURNL project runtime', () => {
  it('default: isolated iframe on the runtime route at the JURNL MOBILE authority size (393 × 852)', () => {
    const html = render('jurnl', 'viewport');
    expect(html).toContain('data-project-runtime="jurnl"');
    expect(html).toMatch(/<iframe[^>]*src="\/production\/jurnl\/runtime\/entry"/);
    expect(html).toContain('data-preset="MOBILE" data-target-w="393" data-target-h="852"');
    expect(html).toContain('MOBILE · 393 × 852 · PORTRAIT');
    for (const id of ['design-viewport-route', 'design-viewport-state', 'design-viewport-scenario', 'design-viewport-safe-toggle', 'design-viewport-grid-toggle', 'design-viewport-bounds-toggle', 'design-viewport-reference-toggle']) {
      expect(html, id).toContain(`data-testid="${id}"`);
    }
    for (let i = 0; i < 14; i++) expect(html).toContain(`value="F01.${String(i).padStart(2, '0')}"`);
    expect(html).toContain('F02 SETUP');
    expect(html).not.toContain('F02 SETUP BOUNDARY');
    expect(html).toContain('href="/production/jurnl/design?mode=compiler&amp;inspect=gate"');
    expect(html).not.toContain('fixture-app-ndxbook');
  });
  it('TABLET 834 × 1194 and DESKTOP 1440 × 900 targets; screen / state / overlay deep links', () => {
    const tab = render('jurnl', 'viewport', '&preset=TABLET&screen=F01.03');
    expect(tab).toContain('data-target-w="834" data-target-h="1194"');
    expect(tab).toMatch(/src="\/production\/jurnl\/runtime\/entry\/sign-in"/);
    const desk = render('jurnl', 'viewport', '&preset=DESKTOP&screen=F01.11&overlay=privacy-ai-access');
    expect(desk).toContain('data-target-w="1440" data-target-h="900"');
    expect(desk).toMatch(/src="\/production\/jurnl\/runtime\/entry\/privacy\?overlay=privacy-ai-access"/);
    const st = render('jurnl', 'viewport', '&screen=F01.03&state=locked');
    expect(st).toMatch(/src="\/production\/jurnl\/runtime\/entry\/sign-in\?state=locked"/);
    expect(st).toContain('OPEN: SOCIAL APPLE');
  });
  it('project-declared sizes override the host preset only for that project', () => {
    const j = getIngestedProject('jurnl')!.viewport.presets;
    expect(applyProjectViewportSize(resolveViewportTarget('MOBILE', 'PORTRAIT'), j.MOBILE)).toMatchObject({ w: 393, h: 852 });
    expect(applyProjectViewportSize(resolveViewportTarget('MOBILE', 'LANDSCAPE'), j.MOBILE)).toMatchObject({ w: 852, h: 393 });
    expect(applyProjectViewportSize(resolveViewportTarget('TABLET', 'PORTRAIT'), j.TABLET)).toMatchObject({ w: 834, h: 1194 });
    expect(applyProjectViewportSize(resolveViewportTarget('DESKTOP', 'PORTRAIT'), j.DESKTOP)).toMatchObject({ w: 1440, h: 900, orientationLocked: true });
    expect(resolveViewportTarget('MOBILE', 'PORTRAIT')).toMatchObject({ w: 390, h: 844 });
  });
  it('FAMILY selector lists the project families: F01 ENTRY live, F02 SETUP as its boundary (not hard-wired to one family)', () => {
    const html = render('jurnl', 'viewport');
    expect(html).toContain('data-testid="design-viewport-family"');
    expect(html).toMatch(/<option value="F01" selected="">F01 ENTRY<\/option>/);
    expect(html).toContain('>F02 SETUP</option>');
    expect(html).not.toContain('FINANCE');
    const fam = render('jurnl', 'viewport', '&family=F01&preset=DESKTOP');
    expect(fam).toMatch(/src="\/production\/jurnl\/runtime\/entry"/);
    expect(fam).toContain('data-target-w="1440" data-target-h="900"');
    const f02 = render('jurnl', 'viewport', '&family=F02');
    expect(f02).toMatch(/src="\/production\/jurnl\/runtime\/setup"/);
  });
  it('DIRECT PREVIEW opens the SAME runtime URL as the viewport iframe (one runtime, two inspection surfaces)', () => {
    for (const extra of ['', '&screen=F01.04', '&screen=F01.03&state=locked', '&screen=F01.11&overlay=privacy-ai-access']) {
      const html = render('jurnl', 'viewport', extra);
      const frame = html.match(/<iframe[^>]*src="([^"]+)"/)![1];
      const direct = html.match(/href="([^"]+)"[^>]*data-testid="design-viewport-direct-preview"/)![1];
      expect(direct, extra).toBe(frame);
      expect(direct).toMatch(/^\/production\/jurnl\/runtime\//);
    }
    expect(render('ndxbook', 'viewport')).not.toContain('design-viewport-direct-preview');
  });
  it('runtime-review cards open the LIVE viewport (not an authority image or the inspector)', () => {
    const surfaces = render('jurnl', 'surfaces');
    for (const p of ['MOBILE', 'TABLET', 'DESKTOP']) expect(surfaces).toContain(`href="/production/jurnl/design?mode=viewport&amp;family=F01&amp;preset=${p}"`);
    for (const size of ['393 × 852', '834 × 1194', '1440 × 900']) expect(surfaces).toContain(size);
    expect(render('jurnl', 'brand')).toMatch(/data-live="viewport" href="\/production\/jurnl\/design\?mode=viewport&amp;family=F01"><span[^>]*><\/span><span class="pxa-tcard__copy"><b>FAMILY RUNTIME<\/b>/);
  });
  it('controls follow live navigation inside the runtime without reloading it; explicit selection remounts the frame', () => {
    const src = read('src/site00/components/productionAuthority/DesignChamber.tsx');
    expect(src).toContain('followLive(m.screenId, m.path)');
    expect(src).toContain('key={pr.runtime ? `${src}#${pr.nonce}` : undefined}');
  });
  it('SAFE AREA uses the project insets; GRID uses the project layout grid; BOUNDS reads the isolated runtime', () => {
    const src = read('src/site00/components/productionAuthority/DesignChamber.tsx');
    expect(src).toContain('insets.top * scale');
    expect(src).toContain('gridTemplateColumns: `repeat(${layout.columns}, 1fr)`');
    expect(src).toContain("querySelectorAll<HTMLElement>('[data-runtime-bounds]')");
    expect(src).toContain('e.source !== frameRef.current?.contentWindow');
  });
});

describe('NDXBOOK behaviour preserved', () => {
  it('NDXBOOK modes still render the canonical host config, plates and validation link', () => {
    for (const mode of PRODUCTION_DESIGN_MODE_ORDER) {
      const html = render('ndxbook', mode);
      expect(html).not.toContain('data-project="ndxbook"');
      expect(html).toContain('href="/production/ndxbook/design/workspace"');
    }
    expect(render('ndxbook', 'brand')).toContain('NDX GROTESK');
    const vp = render('ndxbook', 'viewport');
    expect(vp).toMatch(/<iframe[^>]*title="LIVE CLIENT APP"/);
    expect(vp).toContain('data-preset="MOBILE XL" data-target-w="430" data-target-h="932"');
    expect(vp).not.toContain('design-viewport-grid-toggle');
  });
});

describe('host chrome stays SITE 00: PROJECT chip is a real switcher', () => {
  const header = (url: string) => renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [url] }, createElement(ProductionWorkspaceHeader)));
  it('JURNL is selected with its own cover; same host classes as before', () => {
    const html = header('/production/jurnl/design?mode=brand');
    expect(html).toMatch(/<button[^>]*class="ph-top__sel"[^>]*data-testid="production-chrome-project"[^>]*data-project="jurnl"/);
    expect(html).toContain('/site00/projects/jurnl/brand/jurnl-cover.png');
    expect(html).toContain('<b>JURNL</b>');
    expect(html).not.toContain('project/ndxbook/cover.webp');
  });
  it('NDXBOOK keeps its own cover', () => {
    expect(header('/production/ndxbook/design?mode=brand')).toContain('/site00/production-hub/project/ndxbook/cover.webp');
  });
  it('switcher panel lists projects and lands on the same workspace + mode', () => {
    const src = read('src/site00/components/productionHub/chrome.tsx');
    expect(src).toContain('title="PROJECTS" testId="production-project-menu"');
    const css = read('src/site00/styles/site00-production-host-chrome.css');
    expect(css).toContain('.ph--hub .ph-top > .prod-chrome-pop.pxm');
    expect(css).toContain('grid-column: 1 / -1');
    expect(src).toContain('projectSwitchPath(pathname, search, p.slug)');
    expect(src).not.toContain("slotId=\"project.ndxbook.cover\"");
  });
});
