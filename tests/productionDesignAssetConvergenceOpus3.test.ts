/**
 * P0.STUDIOOS.PRODUCTION.DESIGN.ASSET-AUTHORITY-CONVERGENCE.OPUS3
 * The six DESIGN parent modes mount in one shell, use the supplied DWS icon + asset pack (exact crops, one resolver,
 * no CSS / text stand-ins, no override loop that hides pack files), keep the shared host + bottom nav, and fit
 * between the host and the bottom nav without page scroll.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PRODUCTION_DESIGN_MODE_ORDER } from '../src/site00/config/production-authority-registry';
import { DesignChamber, DesignModeBar } from '../src/site00/components/productionAuthority/DesignChamber';
import { DESIGN_CHAMBER, isDesignPackAsset } from '../src/site00/components/productionAuthority/designChamberConfig';
import { DESIGN_ICON_IDS, DESIGN_PACK_FILES, DESIGN_STAGES, designIcon } from '../src/site00/components/productionAuthority/designPackAssets';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const MODES = ['brand', 'experience', 'surfaces', 'compiler', 'assets', 'viewport'] as const;

const render = (mode: (typeof MODES)[number]) =>
  renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [`/production/ndxbook/design?mode=${mode}`] },
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

describe('all six Design parent modes mount in one shell with one mode nav', () => {
  it('the canonical mode order is unchanged', () => {
    expect([...PRODUCTION_DESIGN_MODE_ORDER]).toEqual([...MODES]);
  });
  for (const mode of MODES) {
    it(`${mode} mounts with shared nav, pipeline and On Your Table; active mode is ${mode}`, () => {
      const html = render(mode);
      expect(html).toContain(`data-testid="design-chamber-screen" data-mode="${mode}"`);
      for (const id of ['design-modes', 'design-chamber', 'design-pipeline', 'design-table']) expect(html, id).toContain(`data-testid="${id}"`);
      const nav = html.slice(html.indexOf('data-testid="design-modes"'), html.indexOf('</nav>'));
      expect(nav.match(/data-testid="design-mode-[a-z]+"/g)).toHaveLength(6);
      expect(nav).toMatch(new RegExp(`class="[^"]*is-active[^"]*"[^>]*data-testid="design-mode-${mode}"|data-testid="design-mode-${mode}"[^>]*class="[^"]*is-active`));
    });
  }
});

describe('canonical icon + asset pack', () => {
  const manifest = JSON.parse(read('public/site00/production-authority-assets/design-pack/SOURCE.json')) as {
    sources: Record<string, { path: string; sha256: string }>;
    assets: { file: string; box: number[] }[];
    navMask: { file: string };
  };
  it('pack sources are the supplied sheets (hash-locked) and every asset is an exact crop listed in SOURCE.json', () => {
    for (const s of Object.values(manifest.sources)) {
      const buf = readFileSync(path.join(root, s.path));
      expect(createHash('sha256').update(buf).digest('hex')).toBe(s.sha256);
    }
    expect(manifest.assets.length).toBe(DESIGN_PACK_FILES.length);
    for (const a of manifest.assets) expect(a.box).toHaveLength(4);
  });
  it('no missing supplied asset paths: every resolver path exists on disk and is in the manifest', () => {
    const listed = new Set(manifest.assets.map((a) => `/site00/production-authority-assets/${a.file}`));
    for (const f of DESIGN_PACK_FILES) {
      expect(existsSync(path.join(root, 'public', f)), f).toBe(true);
      expect(listed.has(f), f).toBe(true);
    }
  });
  it('the pipeline renders the pack stage objects (not CSS orbs) on every mode', () => {
    for (const mode of MODES) {
      const html = render(mode);
      const steps = DESIGN_CHAMBER[mode].pipeline.length;
      const stages = [...html.matchAll(/class="pxa-stage" src="([^"]+)"/g)].map((m) => m[1]);
      expect(stages, mode).toHaveLength(steps);
      for (const [i, src] of stages.entries()) expect(src).toBe(DESIGN_STAGES[i % DESIGN_STAGES.length]!.src);
      expect(html).not.toContain('pxa-orb');
    }
  });
  it('ASSETS · ICON FAMILIES shows the actual pack icon files', () => {
    const html = render('assets');
    const start = html.indexOf('data-testid="design-panel-02"');
    const panel = html.slice(start, html.indexOf('</article>', start));
    const icons = [...panel.matchAll(/<img src="([^"]+)"/g)].map((m) => m[1]);
    expect(icons.length).toBeGreaterThanOrEqual(6);
    for (const src of icons) expect(DESIGN_ICON_IDS.map(designIcon)).toContain(src);
    expect(panel).not.toMatch(/<i>(CORE|UI|SYSTEM)<\/i>/);
  });
  it('ASSETS · ENVIRONMENT PLATES / MATERIALS / TEMPLATES use pack plates, swatches and device frames', () => {
    const cfg = DESIGN_CHAMBER.assets;
    expect(cfg.panels.find((p) => p.n === '03')!.plates!.every(isDesignPackAsset)).toBe(true);
    const html = render('assets');
    expect(html).toContain('data-pack="swatches"');
    expect(html).toMatch(/design-pack\/swatches\/[a-z-]+\.jpg/);
    expect(html).toContain('data-pack="devices"');
    expect(html).toMatch(/design-pack\/devices\/(desktop|tablet|mobile)\.png/);
  });
  it('no stale fallback is selected where a canonical asset exists (stand-ins removed, override loop respects the pack)', () => {
    const chamber = read('src/site00/components/productionAuthority/DesignChamber.tsx');
    expect(chamber).not.toMatch(/\bOrb\b|case 'phones'|case 'frames'|'#e5231b', '#f5f5f7'/);
    expect(read('src/site00/components/productionAuthority/primitives.tsx')).not.toMatch(/export function Orb/);
    const cfg = read('src/site00/components/productionAuthority/designChamberConfig.ts');
    expect(cfg).toContain('isDesignPackAsset(u) ? u : art');
    expect(cfg).toContain('if (!isDesignPackAsset(card.plate))');
    for (const mode of MODES)
      for (const p of DESIGN_CHAMBER[mode].panels) {
        expect(['phones', 'frames', 'grid']).not.toContain(p.vis);
        for (const u of p.plates ?? []) if (/design-pack/.test(u)) expect(isDesignPackAsset(u)).toBe(true);
      }
    expect(strip(read('src/site00/styles/site00-production-authority.css') + read('src/site00/styles/site00-production-authority-opus.css'))).not.toMatch(/pxa-orb|vis--phones|vis--frames|vis--grid/);
  });
});

describe('Production bottom nav icons', () => {
  const nav = read('src/site00/components/productionHub/nav.tsx');
  const SOURCE = JSON.parse(read('public/site00/production-authority-assets/design-pack/SOURCE.json')) as { navMask: { file: string; name: string; section: string } };
  it('HUB uses the supplied home glyph (icon pack · 01 NAVIGATION ICONS · HUB), not the DESIGN stack', () => {
    expect(SOURCE.navMask).toMatchObject({ file: 'src/site00/components/productionHub/bottom-nav/01_HUB.png', name: 'hub', section: '01 NAVIGATION ICONS' });
    const hub = readFileSync(path.join(root, 'src/site00/components/productionHub/bottom-nav/01_HUB.png'));
    const design = readFileSync(path.join(root, 'src/site00/components/productionHub/bottom-nav/03_DESIGN.png'));
    expect(createHash('md5').update(hub).digest('hex')).not.toBe(createHash('md5').update(design).digest('hex'));
  });
  it('seven tabs, same order, one resolver; DESIGN glyph unchanged', () => {
    const order = ['01_HUB', '02_INBOX', '03_DESIGN', '04_EXPERIENCE', '05_EXPRESSION', '06_LIBRARY', '07_ACTIVITY'].map((f) => nav.indexOf(`bottom-nav/${f}.png`));
    expect(order.every((i) => i > -1)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
});

describe('viewport contract + shared shell', () => {
  const css = strip(read('src/site00/styles/site00-production-design-pack.css'));
  it('Design parent modes lock the body to the frame and let only the chamber flex', () => {
    expect(css).toMatch(/\.pxa\[data-screen\^='design-'\] \.pxa-scroll\s*\{\s*overflow: hidden;/);
    expect(css).toMatch(/\.pxa \.pxa-design \{[^}]*flex-direction: column;[^}]*height: 100%;[^}]*overflow: hidden;/);
    expect(css).toMatch(/\.pxa \.pxa-design > \.pxa-chamber \{[^}]*flex: 1 1 var\(--ch-h\);[^}]*min-height: 0;/);
    expect(css).not.toMatch(/\bzoom\s*:|scale\s*\(|\.pxh-|\.ph-top|\.ph-nav|prod-chrome/);
  });
  it('live proof: all six modes fit at 390×844, 360×640, 1024×768, 1440×810 and 1280×720 (no page / document scroll)', () => {
    const rows = JSON.parse(read('artifacts/production-design-asset-convergence-opus3/NO_SCROLL_REPORT.json')) as { fam: string; mode: string; overflow: number; docOverflow: number; activeMode: string; navActive: string; errs: string[] }[];
    expect(rows).toHaveLength(30);
    for (const r of rows) {
      expect(r.overflow, `${r.fam} ${r.mode}`).toBeLessThanOrEqual(1);
      expect(r.docOverflow, `${r.fam} ${r.mode}`).toBeLessThanOrEqual(1);
      expect(r.activeMode, `${r.fam} ${r.mode}`).toBe(r.mode.toUpperCase());
      expect(r.navActive, `${r.fam} ${r.mode}`).toBe('nav-design');
      expect(r.errs).toEqual([]);
    }
  });
  it('top host preserved: Design screens mount the shared frame (host header + nav), and the header clip report is clean', () => {
    const page = read('src/site00/pages/production/ProductionWorkspaceProjectHubPage.tsx');
    expect(page).toMatch(/<ProductionAuthorityFrame screen=\{`design-\$\{mode\}`\} subBar=\{<DesignModeBar active=\{mode\} \/>\}>/);
    const clip = JSON.parse(read('artifacts/production-design-asset-convergence-opus3/TOP_NAV_CLIP_REPORT.json')) as { issues: unknown[] }[];
    expect(clip.length).toBe(42);
    for (const r of clip) expect(r.issues).toEqual([]);
  });
  it('function unchanged: viewport controls, validation sheet and workspace links are still wired', () => {
    const html = render('viewport');
    for (const id of ['design-viewport-stage', 'design-viewport-controls', 'design-validation-sheet', 'design-viewport-safe-toggle']) expect(html).toContain(`data-testid="${id}"`);
    for (const mode of MODES) expect(render(mode)).toContain('href="/production/ndxbook/design/workspace"');
  });
});
