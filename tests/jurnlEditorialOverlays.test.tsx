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
import { ART, EdArt, REGION } from '../src/projects/jurnl/runtime/surfaces/editorial/Editorial';

const BASE = '/production/jurnl/runtime';
const noop = () => undefined;
function render(node: ReactNode) {
  return renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries: [`${BASE}/money`] }, createElement(Routes, null, createElement(Route, { path: '/production/:projectSlug/runtime/*', element: createElement(JurnlStoreProvider, { basePath: BASE, mode: 'design-preview' }, node) }))),
  );
}
const visible = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const nonScript = (html: string) => visible(html.replace(/<p class="jed-script[^"]*"[^>]*>[\s\S]*?<\/p>/g, ' ').replace(/<span class="jed-script[^"]*"[^>]*>[\s\S]*?<\/span>/g, ' '));

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
    // OPUS3: SEARCH is drawn on the curated open composition (one aria-hidden art layer, no EdArt decor over it)
    const search = sheets.search.match(/<img class="jsh-shell"[^>]*>/g) ?? [];
    expect(search).toHaveLength(1);
    expect(search[0]).toContain('aria-hidden="true"');
    expect(sheets.search).not.toContain('class="jed-art');
    for (const [k, html] of Object.entries(sheets)) {
      const arts = html.match(/<span class="jed-art[^"]*"[^>]*>/g) ?? [];
      if (k !== 'search') expect(arts.length, k).toBeGreaterThan(0);
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
