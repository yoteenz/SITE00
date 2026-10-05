/**
 * P0.STUDIOOS.PRODUCTION.HUB.RECONSTRUCTION.OPUS1
 * Guards for the reference-locked HUB: authority module grammar, live-data wiring (no sample values),
 * per-family geometry tokens, hero plates from the approved authority, and host-chrome safety.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { AUTHORITY_ASSETS } from '../src/site00/components/productionAuthority/authorityAssets';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const HUB = 'src/site00/components/productionAuthority/HubBody.tsx';
const CSS = 'src/site00/styles/site00-production-hub-reconstruction.css';

function selectors(css: string): string[] {
  return [...stripComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => m[1]!.trim()).filter((s) => !s.startsWith('@'));
}

describe('HUB authority module grammar', () => {
  const src = read(HUB);
  const body = src.slice(src.indexOf('export function HubBody()'));

  it('renders hero → status strip → overview / entries / components / operations / activity in authority order', () => {
    const at = (cls: string) => body.indexOf(`className="${cls}`);
    const order = ['hubx-hero', 'hubx-status', 'hubx-card hubx-overview', 'hubx-card hubx-components', 'hubx-card hubx-entries', 'hubx-card hubx-ops', 'hubx-card hubx-feed'].map(at);
    expect(order.every((i) => i > -1), String(order)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('keeps every existing HUB test hook and link target', () => {
    for (const id of ['authority-hub', 'authority-hero', 'authority-status-bar', 'hub-overview', 'hub-entry-card', 'hub-entries', 'hub-entry-active', 'hub-entry-new', 'hub-components', 'hub-operations', 'hub-operations-empty', 'hub-activity', 'hub-activity-empty', 'hub-open-machine'])
      expect(body, id).toContain(`data-testid="${id}"`);
    expect(body).toContain('to="/production/queue"');
    expect(body).toContain('to="/production/activity"');
    expect(body).toContain('to="/production?view=machine"');
    expect(body).toMatch(/productionExpressionPath\(slug, NODE_SUB\[n\.id\]\)/);
  });

  it('status strip carries the five authority cells from live data (no authority sample numbers)', () => {
    const strip = body.slice(body.indexOf('hubx-status"'), body.indexOf('hubx-grid'));
    for (const t of ['LIVE STATUS', 'ITEMS NEED YOU', 'VIEW NOW', 'ACTIVE ENTRY', 'CURRENT PHASE', 'BLOCKERS']) expect(strip).toContain(t);
    expect(strip).toContain('pad2(attention.length)');
    expect(strip).toContain('pad2(graph.blockers.length)');
    expect(body).not.toMatch(/62%|SCENE BUILD|CHAPTER 01|2H AGO|12 ITEMS|VFX|SOCIALS/);
  });

  it('component tiles are icon-first with live counts / status and a status-derived meter', () => {
    const tiles = body.slice(body.indexOf('hubx-tiles'), body.indexOf('hubx-col--right'));
    expect(tiles).toContain('<NodeIcon id={n.id} />');
    expect(tiles).toMatch(/counts\[n\.id\] != null/);
    expect(tiles).toContain('STATUS_FILL[n.status]');
  });

  it('operations and activity rows show live node art when the item maps to a node', () => {
    expect(body).toMatch(/a\.assetSlotId \?\? slotFor\(a\.nodeId\)/);
    expect(body).toMatch(/a\.id\.startsWith\('state\.'\)/);
  });
});

describe('HUB hero plates', () => {
  it('ships one approved-authority plate per viewport family', () => {
    for (const fam of ['mobile', 'tablet', 'desktop'] as const) {
      const url = AUTHORITY_ASSETS.hubHero[fam];
      expect(existsSync(path.join(root, 'public', url)), url).toBe(true);
    }
    expect(read('public/site00/production-authority-assets/SOURCE.md')).toMatch(/HUB hero plates/);
  });

  it('switches plate per family in CSS', () => {
    const css = stripComments(read(CSS));
    expect(css).toMatch(/var\(--hero-desktop\)/);
    expect(css).toMatch(/@media \(min-width: 700px\) and \(max-width: 1119px\)[\s\S]*var\(--hero-tablet\)/);
    expect(css).toMatch(/@media \(max-width: 699px\)[\s\S]*var\(--hero-mobile\)/);
  });
});

describe('per-family geometry', () => {
  const css = stripComments(read(CSS));
  it('authors each family on its own authority artboard', () => {
    expect(css).toMatch(/--u: calc\(100cqi \/ 2000\)/);
    expect(css).toMatch(/--u: calc\(100cqi \/ 1792\)/);
    expect(css).toMatch(/--u: calc\(100cqi \/ 1125\)/);
  });
  it('mobile keeps a legibility floor on micro type', () => {
    expect(css).toMatch(/font-size: max\(6\.5px,/);
    expect(css).toMatch(/font-size: max\(7px,/);
  });
  it('the HUB body sheet never selects host chrome and never uses zoom or transform scale', () => {
    for (const sel of selectors(css)) expect(sel, sel).not.toMatch(/\.pxh-|\.ph-|prod-chrome|hub-bottom-nav/);
    expect(css).not.toMatch(/\bzoom\s*:/);
    expect(css).not.toMatch(/scale\s*\(/);
  });
});

describe('host chrome safety', () => {
  const css = stripComments(read('src/site00/styles/site00-production-host-chrome.css'));
  it('mobile strip height convergence is scoped to the authority frame and adds no scaling', () => {
    expect(css).toMatch(/\.pxa \.prod-chrome-strip\.ph--hub \.ph-top\s*\{\s*height: 120px/);
    expect(css).toMatch(/\.pxa \.prod-chrome-strip\.ph--hub \.ph-nav\s*\{\s*height: 112px/);
    expect(css).not.toMatch(/\bzoom\s*:/);
    expect(css).not.toMatch(/(^|[^-])\btransform\s*:/m);
  });
  it('desktop / tablet host anatomy is unchanged (canonical shell override)', () => {
    const nav = read('src/site00/components/productionHub/nav.tsx');
    expect(nav).toContain('data-nav-layout="horizontal"');
    const chrome = read('src/site00/components/productionHub/chrome.tsx');
    expect(chrome).toContain('production-host-cluster');
  });
});
