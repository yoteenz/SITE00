/**
 * P0.JURNL.GLOBAL-INTERACTIVE-SURFACES.EDITORIAL-COLLAGE-COMPOSITION-AND-OVERLAY-ARCHITECTURE-CORRECTION.OPUS2 — the
 * editorial composition layer: the behaviour host imposes no generic drawer, each composition keeps every functional
 * trigger, decorative layers are hidden from assistive tech, labels stay uppercase (cursive lowercase), crops never stretch.
 */
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { JurnlStoreProvider } from '../src/projects/jurnl/runtime/state/store';
import { AddPlaceSheet } from '../src/projects/jurnl/runtime/screens/MoneyScreens';
import { TransferSheet } from '../src/projects/jurnl/runtime/finance/FinanceSheets';
import { MoneyActionSheet } from '../src/projects/jurnl/runtime/surfaces/editorial/MoneyOverlays';
import { GlobalSearchDrawer } from '../src/projects/jurnl/runtime/surfaces/editorial/SearchDrawer';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { ART, EdArt, EdLift, REGION } from '../src/projects/jurnl/runtime/surfaces/editorial/Editorial';
import { PART } from '../src/projects/jurnl/runtime/surfaces/editorial/boardParts';

const BASE = '/production/jurnl/runtime';
const noop = () => undefined;
function render(node: ReactNode) {
  return renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries: [`${BASE}/money`] }, createElement(Routes, null, createElement(Route, { path: '/production/:projectSlug/runtime/*', element: createElement(JurnlStoreProvider, { basePath: BASE, mode: 'design-preview' }, node) }))),
  );
}
const visible = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const nonScript = (html: string) => visible(html.replace(/<p class="jed-script"[^>]*>[\s\S]*?<\/p>/g, ' ').replace(/<span class="jed-script[^"]*"[^>]*>[\s\S]*?<\/span>/g, ' '));

describe('editorial overlays — composition, not a generic drawer', () => {
  const sheets = {
    action: render(createElement(MoneyActionSheet, { canMove: true, onAdd: noop, onMove: noop, onClose: noop })),
    register: render(createElement(AddPlaceSheet, { onClose: noop, onSaved: noop })),
    transfer: render(createElement(TransferSheet, { onClose: noop })),
    search: render(createElement(GlobalSearchDrawer, { onClose: noop })),
  };
  it('O1 every composition is its own data-jed geometry on the shared host; none renders the generic jrn-drawer', () => {
    for (const [k, html] of Object.entries(sheets)) {
      expect(html, k).toContain(`data-jed="${k}"`);
      expect(html, k).not.toContain('class="jrn-drawer');
      expect(html, k).toMatch(/role="dialog" aria-modal="true"/);
    }
  });
  it('O2 the functional triggers survive the recomposition (tests and journeys select by them)', () => {
    for (const t of ['f05m-actions-add', 'f05m-actions-move', 'f05m-actions-sheet-close']) expect(sheets.action, t).toContain(`data-jrn-trigger="${t}"`);
    for (const t of ['money-add-name', 'money-add-kind-checking', 'money-add-kind-savings', 'money-add-kind-debit-card', 'money-add-kind-credit-card', 'money-add-kind-cash', 'money-add-balance', 'money-add-save', 'money-add-cancel']) expect(sheets.register, t).toContain(`data-jrn-trigger="${t}"`);
    for (const t of ['transfer-amount', 'transfer-date', 'transfer-status-completed', 'transfer-status-in-transit', 'transfer-status-pending', 'transfer-status-scheduled', 'transfer-memo', 'transfer-save']) expect(sheets.transfer, t).toContain(`data-jrn-trigger="${t}"`);
    expect(sheets.transfer).toContain('data-testid="transfer-effect"');
    for (const t of ['search-input', 'search-filter-all', 'search-filter-pockets', 'search-filter-transactions', 'search-advanced', 'search-all-activity']) expect(sheets.search, t).toContain(`data-jrn-trigger="${t}"`);
  });
  it('O3 ADD A POCKET offers every supported type in a compact grid (no stacked full-width rows)', () => {
    expect(sheets.register).toContain('class="jed-choices"');
    expect(sheets.register).not.toContain('jrn-home__choices');
    expect((sheets.register.match(/data-jrn-trigger="money-add-kind-/g) ?? []).length).toBe(5);
  });
  it('O4 decorative layers are aria-hidden and never interactive; every label outside cursive is uppercase', () => {
    for (const [k, html] of Object.entries(sheets)) {
      const arts = html.match(/<span class="jed-art[^"]*"[^>]*>/g) ?? [];
      expect(arts.length, k).toBeGreaterThan(0);
      for (const a of arts) expect(a, k).toContain('aria-hidden="true"');
      expect(html.match(/<button[^>]*class="jed-art/g), k).toBeNull();
      expect(nonScript(html).match(/[a-z]/g), k).toBeNull();
    }
  });
  it('O5 MOVE MONEY says JURNL records the movement (it never claims to move real money)', () => {
    expect(visible(sheets.transfer)).toContain('IT DOES NOT MOVE REAL MONEY');
  });
});

describe('EdArt — a region is cropped by uniform scale, never stretched', () => {
  it('C1 background size and position place exactly the region in the box', () => {
    const html = renderToStaticMarkup(createElement(EdArt, { art: ART.sk01, region: REGION.bust, className: 'x' }));
    const [x, y, w, h] = REGION.bust;
    expect(html).toContain(`background-size:${(ART.sk01.w / w) * 100}% ${(ART.sk01.h / h) * 100}%`);
    expect(html).toContain(`background-position:${(x / (ART.sk01.w - w)) * 100}% ${(y / (ART.sk01.h - h)) * 100}%`);
  });
});

describe('EDITORIAL board pass — the board\'s own imagery, never stretched', () => {
  const sheets = {
    action: render(createElement(MoneyActionSheet, { canMove: true, onAdd: noop, onMove: noop, onClose: noop })),
    register: render(createElement(AddPlaceSheet, { onClose: noop, onSaved: noop })),
    transfer: render(createElement(TransferSheet, { onClose: noop })),
    search: render(createElement(GlobalSearchDrawer, { onClose: noop })),
  };
  it('E1 each composition mounts the board\'s own lifted subjects (no rectangular scene crops for them)', () => {
    const want: Record<string, string[]> = {
      action: ['B01_FABRIC', 'BUST', 'B01_AMPHORA', 'B01_COIN', 'B01_COAST'],
      register: ['B02_FABRIC', 'B02_MEDALLION', 'B02_COINS'],
      transfer: ['BUST'],
      search: ['B05_FABRIC', 'B05_BOOKS', 'B01_COAST'],
    };
    for (const [k, parts] of Object.entries(want)) for (const p of parts) expect(sheets[k as keyof typeof sheets], `${k} ${p}`).toContain(`data-part="${p}"`);
    // MOVE MONEY's direction mark is the board's red wax seal, between FROM and TO
    expect(sheets.transfer).toMatch(/class="jed-seal jed-direction jed-direction--wax"[^>]*><img src="[^"]*F05_ED_B03_SEAL\.webp"/);
    // the old rectangular amphora / coin scene bands are gone from MONEY
    expect(sheets.action).not.toMatch(/F05_DOT01_SCENE_0[45]\.webp/);
  });
  it('E2 a lift keeps its image\'s own aspect (height follows width), placed in board units', () => {
    for (const name of Object.keys(PART) as (keyof typeof PART)[]) {
      const html = renderToStaticMarkup(createElement(EdLift, { part: name, at: [10, 20, 100] }));
      const p = PART[name];
      expect(html, name).toContain(`aspect-ratio:${p.w} / ${p.h}`);
      expect(html, name).toContain('left:calc(var(--jb) * 10);top:calc(var(--jb) * 20);width:calc(var(--jb) * 100)');
      expect(html, name).not.toMatch(/height:/);
      expect(html, name).toContain('aria-hidden="true"');
    }
  });
  it('E3 headline and action papers are 9-sliced (torn rims at their drawn scale), never background-size 100% 100%', () => {
    const css = readFileSync(path.resolve('src/projects/jurnl/runtime/surfaces/editorial/jurnl-editorial.css'), 'utf8');
    const block = (sel: string) => css.slice(css.indexOf(`${sel} {`), css.indexOf('}', css.indexOf(`${sel} {`)));
    for (const sel of ['.jrn .jed-head__paper', '.jrn .jed-action__paper']) {
      expect(block(sel), sel).toMatch(/border-image: url\([^)]+\) \d+ \d+ fill/);
      expect(block(sel), sel).not.toMatch(/background-size:\s*100% 100%/);
    }
    for (const sel of ['.jrn .jed-head__paper', '.jrn .jed-action__paper', '.jrn .jed-action__strip']) expect(css).not.toMatch(new RegExp(`${sel.replace(/\./g, '\\.')}[^{]*\\{[^}]*background-size:\\s*100% 100%`));
  });
  it('E4 every part is a lift of approved pixels with its provenance (board box or SK01 box), and ships', () => {
    const doc = JSON.parse(readFileSync(path.resolve('src/projects/jurnl/families/F05_MONEY/EDITORIAL/F05_ED_PARTS.json'), 'utf8'));
    expect(doc.board.file).toBe('JURNL/MANIFEST/JURNL_EDITORIAL_OVERLAYS_OPUS2_V1/input/FOUNDER_EIGHT_PANEL_BOARD.webp');
    expect(doc.board.sha256).toMatch(/^[0-9a-f]{64}$/);
    for (const name of Object.keys(PART)) {
      const m = doc.parts[name];
      expect(m, name).toBeTruthy();
      expect(m.board_box ?? m.sk01_box, name).toHaveLength(4);
      expect(existsSync(path.resolve('src/projects/jurnl/families/F05_MONEY/EDITORIAL', m.runtime)), name).toBe(true);
      expect([PART[name as keyof typeof PART].w, PART[name as keyof typeof PART].h], name).toEqual(m.size);
    }
  });
});
