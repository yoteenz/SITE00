/**
 * P0.STUDIOOS.PRODUCTION.TOP-NAV.GLOBAL-CONVERGENCE.OPUS1
 * One shared Production host header on every root and descendant, in every viewport family: full tab title,
 * project, attention count + label and menu; geometry only from shared tokens; nothing in the header can mask,
 * ellipsize or crop text; no route-specific header overrides; no duplicate legacy workspace header.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { ProductionWorkspaceHeader } from '../src/site00/components/productionHub/chrome';
import { ProductionAuthorityDataContext } from '../src/site00/components/productionAuthority/ProductionAuthorityData';
import type { HubData } from '../src/site00/components/productionHub/useProductionHubData';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

const ROOTS: [string, string][] = [
  ['HUB', '/production'],
  ['INBOX', '/production/queue'],
  ['DESIGN', '/production/ndxbook/design'],
  ['EXPERIENCE', '/production/ndxbook/experience'],
  ['EXPRESSION', '/production/ndxbook/expression'],
  ['LIBRARY', '/production/libraries'],
  ['ACTIVITY', '/production/activity'],
];
const DESCENDANTS: [string, string][] = [
  ['INBOX', '/production/queue?view=approvals'],
  ['DESIGN', '/production/ndxbook/design?mode=brand'],
  ['EXPERIENCE', '/production/ndxbook/experience/world'],
  ['EXPRESSION', '/production/ndxbook/expression/casting'],
  ['ACTIVITY', '/production/activity?view=blockers'],
];

const data = { attention: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] } as unknown as HubData;

type Win = { innerWidth: number; addEventListener: () => void; removeEventListener: () => void };
const g = globalThis as unknown as { window?: Win };
const original = g.window;
afterEach(() => {
  g.window = original;
});

function render(url: string, width: number | null) {
  if (width == null) delete g.window;
  else g.window = { innerWidth: width, addEventListener: () => {}, removeEventListener: () => {} };
  return renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries: [url] }, createElement(ProductionAuthorityDataContext.Provider, { value: data }, createElement(ProductionWorkspaceHeader))),
  );
}

const FAMILIES: [string, number | null, string][] = [
  ['mobile', null, 'phone-top'],
  ['tablet', 1024, 'host-top'],
  ['desktop', 1440, 'host-top'],
];

describe('one shared header mounts on all 7 roots and descendants, every family', () => {
  for (const [fam, width, shell] of FAMILIES) {
    for (const [title, url] of [...ROOTS, ...DESCENDANTS]) {
      it(`${fam} ${url}`, () => {
        const html = render(url, width);
        expect(html).toContain('data-testid="production-workspace-header"');
        expect(html).toContain(`data-shell="${shell}"`);
        // full title, project, count, label, menu — as plain text (never truncated in markup)
        expect(html).toContain(`<b>${title}</b>`);
        expect(html).toContain('SITE 00 / STUDIO WORLD');
        expect(html).toContain('<small>PROJECT</small>');
        expect(html).toContain('<b>NDXBOOK</b>');
        expect(html).toContain('<b>03</b>');
        expect(html).toContain('<small>ITEMS NEED YOU</small>');
        expect(html).toContain('data-testid="production-host-menu"');
        expect(html).toContain('data-testid="production-chrome-project"');
        expect(html).toContain('data-testid="production-host-attention"');
        expect(html).toContain('data-testid="production-host-location"');
      });
    }
  }
  it('phone and host headers carry the same four groups in the same order (no extra CURRENT WORKSPACE group)', () => {
    for (const [, width] of FAMILIES) {
      const html = render('/production/ndxbook/expression', width);
      const order = ['production-host-location', 'production-chrome-project', 'production-host-attention', 'production-host-menu'].map((id) => html.indexOf(id));
      expect(order.every((i) => i > -1)).toBe(true);
      expect([...order].sort((a, b) => a - b)).toEqual(order);
      expect(html).not.toContain('ph-top__sel--prod');
      expect(html).not.toMatch(/<small>CURRENT (WORKSPACE|QUEUE|PRODUCTION)<\/small>|SHARED LIBRARY<\/small>/);
      expect(html).not.toContain('brand--long');
    }
  });
});

describe('no duplicate or route-specific workspace header', () => {
  it('every frame mounts ProductionWorkspaceHeader (authority frame, PwFrame, Design overlay)', () => {
    for (const f of ['src/site00/components/productionAuthority/ProductionAuthorityFrame.tsx', 'src/site00/components/production/PwFrame.tsx', 'src/site00/components/productionHub/chrome.tsx'])
      expect(read(f), f).toContain('<ProductionWorkspaceHeader />');
  });
  it('only chrome.tsx renders a workspace header (legacy hub machine + Character Fabrication keep their own documented headers)', () => {
    const dir = path.join(root, 'src/site00/components');
    const offenders: string[] = [];
    const walk = (d: string) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.tsx$/.test(e.name) && /data-testid="production-workspace-header"/.test(readFileSync(p, 'utf8'))) offenders.push(path.relative(root, p));
      }
    };
    walk(dir);
    expect(offenders).toEqual(['src/site00/components/productionHub/chrome.tsx']);
  });
  it('no stylesheet outside the host chrome sheet targets the shared header', () => {
    const dir = path.join(root, 'src/site00/styles');
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.css') && x !== 'site00-production-host-chrome.css')) {
      const css = stripComments(readFileSync(path.join(dir, f), 'utf8'));
      expect(css, f).not.toMatch(/\.pxh-top|\.ph-top--host|production-workspace-header/);
    }
  });
  it('the authority-frame-only phone TOP layer is gone (one geometry for every frame)', () => {
    const css = stripComments(read('src/site00/styles/site00-production-host-chrome.css'));
    expect(css).not.toMatch(/\.pxa \.prod-chrome-strip\.ph--hub \.ph-top[\s{_]/);
    expect(css).not.toMatch(/\.pxa \.ph-top /);
  });
});

describe('shared tokens and text-fit rules', () => {
  const css = stripComments(read('src/site00/styles/site00-production-host-chrome.css'));
  const block = (sel: RegExp) => [...css.matchAll(new RegExp(`${sel.source}\\s*\\{([^}]*)\\}`, 'g'))].map((m) => m[1]!).join('\n');
  it('header height is a shared token per family', () => {
    expect(css).toMatch(/--pxh-top-h: 64px/);
    expect(css).toMatch(/@media \(min-width: 1120px\)\s*\{\s*\.pxh-strip\s*\{[^}]*--pxh-top-h: 72px/);
    expect(css).toMatch(/--phh-top-h: 120px/);
    expect(block(/\.pxh-top/)).toMatch(/height: var\(--pxh-top-h\)/);
    expect(css).toMatch(/\.ph-top\.ph-top--host\s*\{[^}]*height: var\(--phh-top-h\)/);
  });
  it('type, gaps, icons, dividers and menu come from tokens', () => {
    for (const t of ['title-size', 'title-lh', 'sub-size', 'label-size', 'name-size', 'count-size', 'attn-label-size', 'gap', 'divider-inset', 'thumb-w', 'reticle', 'icon', 'menu-w']) {
      expect(css, `--pxh-${t}`).toMatch(new RegExp(`--pxh-${t}:`));
      expect(css, `--phh-${t}`).toMatch(new RegExp(`--phh-${t}:`));
    }
  });
  it('no header rule masks, ellipsizes, caps or shrinks text', () => {
    const rules = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].filter((m) => /pxh-top|ph-top--host/.test(m[1]!) && !/pxh-pop|prod-chrome-pop|pxm/.test(m[1]!));
    expect(rules.length).toBeGreaterThan(20);
    for (const [, sel, body] of rules) {
      const s = sel!.trim();
      if (/__thumb/.test(s)) continue; // the project image crops its own picture, never text
      expect(body, s).not.toMatch(/text-overflow:\s*ellipsis|max-height|(^|[^-])overflow(-[xy])?:\s*(hidden|clip)|-webkit-line-clamp/m);
      expect(body, s).not.toMatch(/translate|flex-shrink:\s*[1-9]|flex:\s*[0-9.]+\s+[1-9]/);
    }
  });
  it('line-heights clear the uppercase ink box (>= 1.15 for every header text token)', () => {
    for (const m of css.matchAll(/--p[xh]h-(?:title|text)-lh:\s*([0-9.]+)/g)) expect(Number(m[1])).toBeGreaterThanOrEqual(1.15);
  });
  it('host chrome still never scales (no zoom, transform, viewport units or clamp)', () => {
    expect(css).not.toMatch(/\bzoom\s*:|(^|[^-])\btransform\s*:|scale\s*\(|clamp\s*\(/m);
    expect(css).not.toMatch(/\d(vw|vh|vmin|vmax|rem)\b/);
  });
});
