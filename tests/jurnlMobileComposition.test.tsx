/**
 * P0.JURNL.MOBILE-COMPOSITION-CREATIVE-LANGUAGE-PAGINATION-REFINEMENT2
 * Atomic pagination rules (pure) + the frame / archetype / language contract on every family root (server render).
 * Interactive NEXT / context-aware BACK / dynamic re-pagination / nav centering are proven in the live browser by
 * scripts/jurnl/mobile-composition-qa.mjs (this repo has no DOM test environment).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { clampScreen, paginatePanels } from '../src/projects/jurnl/runtime/layout/paginate';
import JurnlRuntimeRoot from '../src/projects/jurnl/runtime/JurnlRuntimeRoot';

const BASE = '/production/jurnl/runtime';
const render = (route: string) =>
  renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [`${BASE}/${route}`] },
      createElement(Routes, null, createElement(Route, { path: '/production/:projectSlug/runtime/*', element: createElement(JurnlRuntimeRoot, { basePath: BASE, mode: 'design-preview' }) })),
    ),
  );
const visibleText = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');

const panels = (...heights: number[]) => heights.map((height, i) => ({ id: `p${i}`, height }));
const flat = (r: ReturnType<typeof paginatePanels>) => r.screens.flatMap((s) => s.panelIds);

describe('atomic panel pagination', () => {
  it('keeps everything on one screen when it fits', () => {
    const r = paginatePanels(panels(100, 100, 100), 400, 10);
    expect(r.screens).toHaveLength(1);
    expect(r.screens[0]!.panelIds).toEqual(['p0', 'p1', 'p2']);
  });

  it('moves a whole panel to a continuation screen instead of splitting it', () => {
    const r = paginatePanels(panels(200, 150, 120), 400, 10);
    expect(r.screens.map((s) => s.panelIds)).toEqual([['p0', 'p1'], ['p2']]);
  });

  it('creates three or more screens for long stacks, preserving order and never duplicating a panel', () => {
    const input = panels(180, 180, 180, 180, 180, 180, 180);
    const r = paginatePanels(input, 400, 10, 370);
    expect(r.screens.length).toBeGreaterThanOrEqual(3);
    expect(flat(r)).toEqual(input.map((p) => p.id));
    expect(new Set(flat(r)).size).toBe(input.length);
  });

  it('uses the shorter continuation height after screen 1', () => {
    // 2 × 190 + gap fits 400 but not a 380 continuation screen.
    const r = paginatePanels(panels(390, 190, 190), 400, 10, 380);
    expect(r.screens.map((s) => s.panelIds)).toEqual([['p0'], ['p1'], ['p2']]);
  });

  it('gives an oversize panel its own screen and flags it', () => {
    const r = paginatePanels(panels(100, 900, 100), 400, 10);
    expect(r.screens.map((s) => s.panelIds)).toEqual([['p0'], ['p1'], ['p2']]);
    expect(r.screens[1]!.oversize).toEqual(['p1']);
  });

  it('lets zero-height slots (sheets in the overlay host) take no space or gap', () => {
    const r = paginatePanels(panels(195, 0, 195), 400, 10);
    expect(r.screens).toHaveLength(1);
  });

  it('re-pagination keeps the screen that holds the panel being read', () => {
    const before = paginatePanels(panels(200, 190, 200, 190), 400, 10);
    const after = paginatePanels(panels(260, 190, 200, 190), 400, 10); // a validation message grew panel 0
    expect(before.screens[1]!.panelIds[0]).toBe('p2');
    const idx = clampScreen(before, after, 1);
    expect(after.screens[idx]!.panelIds).toContain('p2');
  });
});

const ROOTS: [string, string, string][] = [
  ['F03', 'today', 'FOCUS_REVEAL'],
  ['F05', 'money', 'CONTAINER_CABINET'],
  ['F06', 'income', 'LEDGER_GRID'],
  ['F07', 'upcoming', 'TIMELINE'],
  ['F08', 'plan', 'ROOM_ZONE'],
  ['F09', 'safe', 'TENSION_THRESHOLD'],
  ['F10', 'purchases', 'OBJECT_FOCUS'],
  ['F11', 'trips', 'MAP_ROUTE'],
  ['F12', 'credit', 'LEDGER_GRID'],
  ['F13', 'paydown', 'SEQUENTIAL_STEPS'],
  ['F14', 'goals', 'EDITORIAL_SPREAD'],
  ['F15', 'ahead', 'HORIZON_PATH'],
  ['F16', 'records', 'ARCHIVE_INDEX'],
];

describe('family roots on the finite composition frame', () => {
  for (const [family, route, archetype] of ROOTS) {
    it(`${family} renders the content rect, composition edge, nav reserve and its archetype`, () => {
      const html = render(route);
      expect(html).toContain('data-jrn-frame="family"');
      expect(html).toContain('data-jrn-zone="content-rect"');
      expect(html).toContain('data-jrn-zone="composition-edge"');
      expect(html).toContain('class="jrn-frame__navspace"');
      expect(html).toContain(`data-jrn-archetype="${archetype}"`);
      expect(html.match(/data-jrn-zone="bottom-nav"/g)).toHaveLength(1);
      expect(visibleText(html).match(/[a-z]/g)).toBeNull();
    });
  }

  it('gives the seven target families seven different archetypes and no adjacent repeats across F03–F16', () => {
    const target = ROOTS.filter(([f]) => ['F05', 'F09', 'F10', 'F11', 'F13', 'F15', 'F16'].includes(f)).map(([, , a]) => a);
    expect(new Set(target).size).toBe(7);
    for (let i = 1; i < ROOTS.length; i++) expect(ROOTS[i]![2]).not.toBe(ROOTS[i - 1]![2]);
  });

  it('states function, state and task in plain language on the target roots (editorial line is secondary)', () => {
    for (const route of ['money', 'safe', 'purchases', 'trips', 'paydown', 'ahead', 'records']) {
      const html = render(route);
      expect(html, route).toContain('class="jrn-lang__state');
      expect(html, route).toMatch(/<h1[^>]*>/);
    }
    expect(render('paydown')).toContain('YOUR DEBT PLAN ISN’T SET YET.');
    expect(render('records')).toContain('NO RECORDS YET.');
    expect(render('trips')).toContain('NO TRIP IS SET UP YET.');
    expect(render('purchases')).toContain('NOTHING IS UNDER CONSIDERATION.');
    expect(render('ahead')).toContain('LATER');
  });
});

describe('viewport nav geometry contract', () => {
  const css = readFileSync(path.resolve(__dirname, '../src/projects/jurnl/runtime/jurnl-frame.css'), 'utf8');
  it('docks the nav to the viewport host with five equal cells and the safe area', () => {
    expect(css).toMatch(/\.jrn \.jrn-nav \{[^}]*left: 50%;[^}]*transform: translateX\(-50%\)/);
    expect(css).toMatch(/grid-template-columns: repeat\(5, minmax\(0, 1fr\)\)/);
    expect(css).toMatch(/bottom: calc\(var\(--jrn-nav-gutter\) \+ env\(safe-area-inset-bottom, 0px\)\)/);
    expect(css).toContain('--jrn-nav-reserve: calc(var(--jrn-nav-h) + var(--jrn-nav-gutter) + var(--jrn-nav-gap-above) + env(safe-area-inset-bottom, 0px))');
  });

  it('keeps the plus as the third of five controls (the geometric center)', () => {
    const html = render('money');
    const nav = html.match(/<nav class="jrn-nav"[\s\S]*?<\/nav>/)?.[0] ?? '';
    const triggers = [...nav.matchAll(/data-jrn-trigger="(nav-[a-z]+)"/g)].map((m) => m[1]);
    expect(triggers).toEqual(['nav-home', 'nav-money', 'nav-add', 'nav-plan', 'nav-credit']);
  });
});
