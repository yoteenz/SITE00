/**
 * P0.STUDIOOS.PRODUCTION.AUTHORITY-ALIGNMENT.SONNET1R1
 * Structural guards: 36-authority registry, shell canon (host chrome never scaled), nav order / layout,
 * design-mode order, and the untouched preview / live auth contract.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ProductionHostNav } from '../src/site00/components/productionHub/nav';
import {
  PRODUCTION_AUTHORITY_SCREENS,
  PRODUCTION_DESIGN_MODE_ORDER,
  PRODUCTION_GLOBAL_TAB_ORDER,
  PRODUCTION_VIEWPORT_FAMILIES,
  isProductionDesignMode,
  listProductionAuthorityEntries,
  productionAuthorityRoute,
  productionViewportFamilyForWidth,
} from '../src/site00/config/production-authority-registry';
import { DESIGN_CHAMBER } from '../src/site00/components/productionAuthority/designChamberConfig';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

describe('authority registry', () => {
  it('lists 12 screens x 3 viewport families = 36 authorities', () => {
    expect(PRODUCTION_AUTHORITY_SCREENS).toHaveLength(12);
    expect(PRODUCTION_VIEWPORT_FAMILIES).toEqual(['mobile', 'tablet', 'desktop']);
    const entries = listProductionAuthorityEntries();
    expect(entries).toHaveLength(36);
    expect(new Set(entries.map((e) => e.authorityFile)).size).toBe(36);
  });

  it('keeps the global tab order and the fixed six design modes', () => {
    expect(PRODUCTION_GLOBAL_TAB_ORDER).toEqual(['hub', 'inbox', 'design', 'experience', 'expression', 'library', 'activity']);
    expect(PRODUCTION_DESIGN_MODE_ORDER).toEqual(['brand', 'experience', 'surfaces', 'compiler', 'assets', 'viewport']);
    const designScreens = PRODUCTION_AUTHORITY_SCREENS.filter((s) => s.workspace === 'design');
    expect(designScreens.map((s) => s.designMode)).toEqual([...PRODUCTION_DESIGN_MODE_ORDER]);
    for (const s of PRODUCTION_AUTHORITY_SCREENS.filter((x) => x.workspace !== 'design')) expect(s.designMode).toBeNull();
  });

  it('routes every screen to a /production path; DESIGN modes stay under the DESIGN workspace', () => {
    for (const s of PRODUCTION_AUTHORITY_SCREENS) {
      const route = productionAuthorityRoute(s);
      expect(route.startsWith('/production')).toBe(true);
      if (s.designMode) expect(route).toBe(`/production/ndxbook/design?mode=${s.designMode}`);
    }
    expect(productionAuthorityRoute(PRODUCTION_AUTHORITY_SCREENS.find((s) => s.id === 'activity')!)).toBe('/production/activity');
  });

  it('classifies viewport families at the documented boundaries', () => {
    expect(productionViewportFamilyForWidth(360)).toBe('mobile');
    expect(productionViewportFamilyForWidth(699)).toBe('mobile');
    expect(productionViewportFamilyForWidth(700)).toBe('tablet');
    expect(productionViewportFamilyForWidth(1119)).toBe('tablet');
    expect(productionViewportFamilyForWidth(1120)).toBe('desktop');
    expect(isProductionDesignMode('viewport')).toBe(true);
    expect(isProductionDesignMode('workspace')).toBe(false);
  });

  it('has a chamber definition for each design mode with the authority panel / pipeline counts', () => {
    for (const mode of PRODUCTION_DESIGN_MODE_ORDER) {
      const cfg = DESIGN_CHAMBER[mode];
      expect(cfg.mode).toBe(mode);
      expect(cfg.table.length).toBeGreaterThanOrEqual(3);
      if (mode === 'viewport') {
        expect(cfg.pipeline).toHaveLength(7);
        expect(cfg.table).toHaveLength(4);
      } else {
        expect(cfg.panels).toHaveLength(5);
        expect(cfg.pipeline).toHaveLength(5);
      }
    }
  });
});

describe('host chrome canon', () => {
  const html = renderToStaticMarkup(
    createElement(MemoryRouter, null, createElement(ProductionHostNav, { active: 'design', projectId: 'ndxbook', inboxCount: 1 })),
  );

  it('renders the bottom nav in order with the icon LEFT of the label', () => {
    const labels = [...html.matchAll(/pxh-nav__label">([A-Z]+)</g)].map((m) => m[1]);
    expect(labels).toEqual(['HUB', 'INBOX', 'DESIGN', 'EXPERIENCE', 'EXPRESSION', 'LIBRARY', 'ACTIVITY']);
    expect(html).toContain('data-nav-layout="horizontal"');
    for (const item of html.split('<a ').slice(1)) {
      expect(item.indexOf('pxh-nav__icon')).toBeLessThan(item.indexOf('pxh-nav__label'));
    }
  });

  it('renders the architectural nav glyphs and marks the active tab', () => {
    expect([...html.matchAll(/data-nav-glyph="/g)]).toHaveLength(7);
    expect(html).toContain('data-nav-fidelity="reference-masters"');
    expect(html).toContain('aria-current="page"');
    expect(html.match(/is-active/g)).toHaveLength(1);
  });

  it('never scales host chrome: no zoom, transform, viewport/container units, rem or clamp in the host chrome CSS', () => {
    const css = stripComments(read('src/site00/styles/site00-production-host-chrome.css'));
    expect(css).not.toMatch(/\bzoom\s*:/);
    expect(css).not.toMatch(/(^|[^-])\btransform\s*:/m);
    expect(css).not.toMatch(/scale\s*\(/);
    expect(css).not.toMatch(/\d(vw|vh|vmin|vmax|cqw|cqh|cqi|cqb|cqmin|cqmax|rem)\b/);
    expect(css).not.toMatch(/clamp\s*\(/);
    expect(css).toMatch(/grid-template-columns:\s*repeat\(7/);
  });

  it('isolates the hamburger at the far right of the top panel (menu is outside the left cluster)', () => {
    const chrome = read('src/site00/components/productionHub/chrome.tsx');
    const top = chrome.slice(chrome.indexOf('function ProductionHostTop'));
    const order = ['production-host-cluster', 'pxh-top__project', 'pxh-top__attn', 'pxh-top__menu'].map((h) => top.indexOf(h));
    expect(order.every((i) => i > -1)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
});

describe('auth contract is untouched', () => {
  it('keeps preview-host sign-in bypass and live sign-in', () => {
    const paused = read('src/site00/config/signInPaused.ts');
    expect(paused).toContain("host === 'site00.fsbw-dev.com'");
    expect(paused).toContain("host === 'localhost'");
    expect(paused).not.toMatch(/site00\.com['"]/);
  });

  it('new authority modules never import auth / guard / session code', () => {
    const files = [
      'src/site00/components/productionAuthority/ProductionAuthorityFrame.tsx',
      'src/site00/components/productionAuthority/ProductionAuthorityData.tsx',
      'src/site00/components/productionAuthority/HubBody.tsx',
      'src/site00/components/productionAuthority/InboxBody.tsx',
      'src/site00/components/productionAuthority/ActivityBody.tsx',
      'src/site00/components/productionAuthority/ExperienceBody.tsx',
      'src/site00/components/productionAuthority/ExpressionBody.tsx',
      'src/site00/components/productionAuthority/LibraryBody.tsx',
      'src/site00/components/productionAuthority/DesignChamber.tsx',
      'src/site00/config/production-authority-registry.ts',
    ];
    for (const f of files) expect(read(f), f).not.toMatch(/Guard|signInPaused|adminAuth|supabase|sessionStorage|localStorage/i);
  });

  it('protected routes stay wrapped by the internal production guard', () => {
    const routes = read('src/routes/Site00Routes.tsx');
    for (const key of ['productionWorkspace', 'productionActivity', 'productionLibraries', 'productionQueue', 'productionProject']) {
      const at = routes.indexOf(`path={SITE00_ROUTES.${key}}`);
      expect(at, key).toBeGreaterThan(-1);
      expect(routes.slice(at, at + 400), key).toContain('Site00InternalProductionGuard');
    }
  });
});

describe('product hierarchy + Expression / Library canon', () => {
  it('puts Character Fabrication first among the Expression production floors', () => {
    const body = read('src/site00/components/productionAuthority/ExpressionBody.tsx');
    const floors = body.slice(body.indexOf('const FLOORS'), body.indexOf('const FORMATS'));
    expect(floors.indexOf("id: 'character-fabrication'")).toBeGreaterThan(-1);
    expect(floors.indexOf("id: 'character-fabrication'")).toBeLessThan(floors.indexOf("id: 'campaign-concepts'"));
    expect(floors).toContain('entryway: true');
  });

  it('renders the Library as a full-width vault (no narrow centered page wrapper)', () => {
    const css = stripComments(read('src/site00/styles/site00-production-authority.css'));
    expect(css).not.toMatch(/\.pxa-library\s*\{[^}]*max-width/);
    expect(css).not.toMatch(/\.pxa-body\s*\{[^}]*max-width/);
  });
});
