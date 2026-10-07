/**
 * P0.JURNL.MOBILE-COMPOSITION.CENTER-STAGE-NAV-ALIGNED-REFINEMENT3
 * Composition mode contract: EDGE_LED (entry / welcome / setup, no product nav) vs CENTER_STAGE (every screen that
 * carries the 5-item product nav). Live geometry (field = nav footprint, `+` axis, background salience, clearance) is
 * proven in the browser by scripts/jurnl/center-stage-qa.mjs.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { F01_SCREENS } from '../src/projects/jurnl/data/f01/screens';
import { F02_SCREENS } from '../src/projects/jurnl/data/f02/screens';
import JurnlRuntimeRoot from '../src/projects/jurnl/runtime/JurnlRuntimeRoot';
import { COMPOSITION_OVERRIDES, resolveCompositionMode } from '../src/projects/jurnl/runtime/layout/compositionMode';

const BASE = '/production/jurnl/runtime';
const render = (route: string) =>
  renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [`${BASE}/${route}`] },
      createElement(Routes, null, createElement(Route, { path: '/production/:projectSlug/runtime/*', element: createElement(JurnlRuntimeRoot, { basePath: BASE, mode: 'design-preview' }) })),
    ),
  );
const modeOf = (html: string) => html.match(/data-jrn-composition="([A-Z_]+)"/)?.[1] ?? null;
const hasNav = (html: string) => html.includes('data-jrn-zone="bottom-nav"');

/** Founder reference replicas (P0.JURNL.F09.REFERENCE-REPLICA1): documented REFERENCE_STAGE overrides. */
const REFERENCE_ROUTES = ['account', 'safe/why', 'safe/check', 'safe/reference'];

const PRODUCT_ROUTES = [
  'today',
  'activity',
  'money',
  'money/places',
  'money/places/any',
  'income',
  'income/any',
  'upcoming',
  'upcoming/any',
  'plan',
  'plan/any',
  'safe',
  'purchases',
  'purchases/any',
  'trips',
  'trips/any',
  'credit',
  'credit/any',
  'paydown',
  'paydown/what-if',
  'goals',
  'goals/any',
  'ahead',
  'ahead/base',
  'records',
  'records/any',
];

describe('composition mode resolution', () => {
  it('defaults to CENTER_STAGE when the product nav is present and EDGE_LED otherwise', () => {
    expect(resolveCompositionMode({ screenId: 'X', hasProductNav: true })).toBe('CENTER_STAGE');
    expect(resolveCompositionMode({ screenId: 'X', hasProductNav: false })).toBe('EDGE_LED');
    expect(resolveCompositionMode({ screenId: 'X', hasProductNav: true, override: 'EDGE_LED' })).toBe('EDGE_LED');
  });

  it('has no undocumented exceptions', () => {
    for (const [screen, o] of Object.entries(COMPOSITION_OVERRIDES)) expect(o.reason.trim().length, screen).toBeGreaterThan(20);
  });
});

describe('every nav-bearing product route is CENTER_STAGE', () => {
  for (const route of PRODUCT_ROUTES) {
    it(route, () => {
      const html = render(route);
      expect(hasNav(html), route).toBe(true);
      expect(modeOf(html), route).toBe('CENTER_STAGE');
      // the functional field is declared for the host STAGE overlay (design / QA only)
      if (route !== 'activity') expect(html, route).toContain('data-runtime-stage="SAFE ZONE"');
      expect(html, route).toContain('data-runtime-stage="NAV FOOTPRINT"');
      // background: a calm copy of the plate frames the field
      expect(html, route).toContain('class="jrn-env__calm"');
    });
  }
});

describe('founder reference replicas are REFERENCE_STAGE (documented override)', () => {
  for (const route of REFERENCE_ROUTES) {
    it(route, () => {
      const html = render(route);
      expect(hasNav(html), route).toBe(true);
      expect(modeOf(html), route).toBe('REFERENCE_STAGE');
      expect(html, route).toContain('class="jrn-ref__plate"');
      expect(html, route).toContain('data-runtime-stage="NAV FOOTPRINT"');
      expect(html, route).not.toContain('jrn-env__calm');
    });
  }
  it('every REFERENCE_STAGE override names its reason', () => {
    for (const id of ['F09.00.REFERENCE', 'F09.WHY', 'F09.CHECK', 'GS.SETTINGS']) {
      expect(COMPOSITION_OVERRIDES[id]?.mode, id).toBe('REFERENCE_STAGE');
      expect(COMPOSITION_OVERRIDES[id]?.reason, id).toMatch(/REFERENCE-REPLICA1/);
    }
  });
});

describe('entry, welcome and setup screens stay EDGE_LED', () => {
  for (const s of [...F01_SCREENS, ...F02_SCREENS]) {
    it(`${s.id} ${s.route}`, () => {
      const html = render(s.route);
      expect(hasNav(html), s.route).toBe(false);
      expect(modeOf(html), s.route).toBe('EDGE_LED');
      expect(html).not.toContain('jrn-env__calm');
    });
  }
});

describe('CENTER_STAGE geometry contract (CSS)', () => {
  const css = readFileSync(path.resolve(__dirname, '../src/projects/jurnl/runtime/jurnl-center-stage.css'), 'utf8');
  it('the field shares the nav footprint on phones and is centred', () => {
    expect(css).toMatch(/\.jrn \{[^}]*--jrn-stage-w: var\(--jrn-nav-w\);/);
    expect(css).toMatch(/\[data-jrn-composition='CENTER_STAGE'\] \.jrn-frame \{[^}]*width: var\(--jrn-stage-w\);[^}]*margin-left: auto;[^}]*margin-right: auto;/);
  });
  it('removes the narrow left column inside the field', () => {
    expect(css).toMatch(/\[data-jrn-composition='CENTER_STAGE'\] \.jrn-frame__slot \{\s*max-width: none;/);
    expect(css).not.toMatch(/width: 45%|left: 5%/);
  });
  it('re-anchors plates per family instead of centre-centre everywhere', () => {
    expect(css).toMatch(/--jrn-plate-mobile: 0% 50%;/);
    expect((css.match(/\[data-jrn-family='F\d\d'\]/g) ?? []).length).toBeGreaterThanOrEqual(14);
  });
  it('feathers the calm layer to the safe zone so the perimeter keeps its detail', () => {
    expect(css).toContain('mask-composite: intersect;');
    expect(css).toContain('var(--jrn-stage-l)');
    expect(css).toContain('var(--jrn-nav-reserve)');
  });
});
