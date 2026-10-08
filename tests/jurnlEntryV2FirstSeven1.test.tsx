/**
 * P0.JURNL.ENTRY-V2.FIRST-7.AUTHORITY-PLUS-PLATE-LIVE-WIRING1: the first seven ENTRY v2 parents are live, each drawn on
 * its approved plate (the page's environment) with every line, field and control live at the authority's place.
 * AUTHORITY = design authority (never mounted). PLATE = environment, once. Legacy behaviour is kept.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import JurnlRuntimeRoot from '../src/projects/jurnl/runtime/JurnlRuntimeRoot';
import { F01_COPY } from '../src/projects/jurnl/data/f01/copy';
import { F01_BINDINGS } from '../src/projects/jurnl/data/f01/interactionBindings';
import { F01_ENTRY_V2, F01_ENTRY_V2_SCREENS, F01_SCREENS } from '../src/projects/jurnl/data/f01/screens';
import { ENTRY_H, ENTRY_W, entryFit } from '../src/projects/jurnl/runtime/components/EntryV2Stage';
import * as LAYOUT from '../src/projects/jurnl/runtime/layout/entryV2Layout';

const BASE = '/production/jurnl/runtime';
const render = (route: string, query = '', mode: 'design-preview' | 'production' = 'design-preview') =>
  renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [`${BASE}/${route}${query ? `?${query}` : ''}`] },
      createElement(Routes, null, createElement(Route, { path: '/production/:projectSlug/runtime/*', element: createElement(JurnlRuntimeRoot, { basePath: BASE, mode }) })),
    ),
  );
const visible = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/\s+/g, ' ');
const PAGES = Object.entries(F01_ENTRY_V2).map(([id, dir]) => ({ id, dir, route: [...F01_SCREENS, ...F01_ENTRY_V2_SCREENS].find((s) => s.id === id)!.route }));
const MANIFEST = JSON.parse(readFileSync('src/projects/jurnl/families/F01_ENTRY/ENTRY_V2/ENTRY_V2_ASSET_MANIFEST.json', 'utf8'));

describe('ENTRY v2: the seven parents are live routes on their plates', () => {
  it('maps the seven approved screens to live routes, in the ENTRY order', () => {
    expect(PAGES.map((p) => p.dir)).toEqual(['01_WELCOME', '02_VALUE_PROPOSITION', '03_KEY_BENEFITS', '04_GET_STARTED', '05_CREATE_ACCOUNT', '06_EMAIL_VERIFICATION', '07_SIGN_IN']);
    expect(PAGES.map((p) => p.route)).toEqual(['entry', 'entry/value', 'entry/benefits', 'entry/begin', 'entry/create', 'entry/verify-email', 'entry/sign-in']);
  });

  for (const p of PAGES) {
    it(`${p.dir}: one plate as the environment, no authority image, live layer above`, () => {
      const html = render(p.route);
      expect(html).toContain(`data-jrn-screen="${p.id}"`);
      expect(html).toContain(`data-jrn-entry-v2="${p.dir}"`);
      const imgs = [...html.matchAll(/<img[^>]*src="([^"]+)"/g)].map((m) => m[1]!);
      // The plate is mounted once (no doubled / blurred copy), and the authority screenshot is never mounted.
      expect(imgs.filter((i) => i.includes(`ENTRY_V2_${p.dir}_PLATE.jpg`))).toHaveLength(1);
      expect(html).not.toMatch(/AUTHORITY\.jpg|-authority\.png|jurnl-logo-official/);
      expect(html).not.toContain('jrn-env__calm');
      // L0 (environment) carries no controls; every control lives in the stage above it.
      const env = html.slice(html.indexOf('data-testid="jurnl-environment"'), html.indexOf('data-runtime-bounds="column"'));
      expect(env).not.toMatch(/<(button|input|a)\b/);
      expect(visible(html).match(/[a-z]/g)).toBeNull();
    });
  }
});

describe('ENTRY v2: live copy and controls', () => {
  it('01 WELCOME: brand, manifesto, tagline, GET STARTED and SIGN IN', () => {
    const html = render('entry');
    const text = visible(html);
    for (const l of [...F01_COPY.welcome.headline, ...F01_COPY.welcome.tagline, F01_COPY.brand.line, 'GET STARTED', 'SIGN IN']) expect(text, l).toContain(l);
    expect(html).toContain('data-jrn-trigger="welcome-get-started"');
    expect(html).toContain('data-jrn-trigger="welcome-sign-in"');
    expect(F01_BINDINGS['F01.00.ROUTE.GET_STARTED']!.result).toEqual({ kind: 'route', screenId: 'F01.14' });
  });

  it('02–04: the broadside, the slips and the invitation carry their copy and CONTINUE / GET STARTED / SIGN IN', () => {
    const value = visible(render('entry/value'));
    for (const l of [...F01_COPY.value.headline, ...F01_COPY.value.body, 'CONTINUE']) expect(value, l).toContain(l);
    expect(render('entry/value')).toContain('data-jrn-trigger="value-continue"');
    const benefits = render('entry/benefits');
    for (const l of [...F01_COPY.benefits.headline, ...F01_COPY.benefits.items.flat(), 'CONTINUE']) expect(visible(benefits), l).toContain(l);
    expect(benefits).toContain('data-jrn-trigger="benefits-continue"');
    // Each benefit is printed on its own slip (a transformed surface), not a floating card.
    expect(benefits.match(/class="jrn-e2__surface"/g)!.length).toBe(5);
    expect(benefits).not.toMatch(/jrn-card|jrn-panel/);
    const begin = render('entry/begin');
    for (const l of ['BEGIN.', F01_COPY.begin.sub, 'GET STARTED', 'SIGN IN']) expect(visible(begin), l).toContain(l);
    expect(begin).toContain('data-jrn-trigger="begin-get-started"');
    expect(begin).toContain('data-jrn-trigger="begin-sign-in"');
    expect(begin).toMatch(/class="jrn-e2__surface" style="transform:matrix3d\(/);
  });

  it('05 CREATE ACCOUNT keeps every field, legal link, provider and state on the registration sheet', () => {
    const html = render('entry/create');
    for (const t of ['create-first-name', 'create-last-name', 'create-email', 'create-password', 'create-password-toggle', 'create-agree', 'create-terms-link', 'create-privacy-link', 'create-apple', 'create-google', 'create-submit', 'create-sign-in', 'create-password-requirements']) {
      expect(html, t).toContain(`data-jrn-trigger="${t}"`);
    }
    expect(html).toMatch(/<input[^>]*autoComplete="new-password"/);
    expect(html).toMatch(/<input[^>]*type="email"/);
    expect(html).toContain('role="checkbox" aria-checked="false"');
    expect(html).toMatch(/<form[^>]*class="jrn-e2__form"/);
    expect(html).toMatch(/<form[^>]*noValidate=""|<form[^>]*novalidate=""/);
    expect(render('entry/create', 'state=validation_error')).toContain('data-jrn-trigger="create-error-validation"');
    expect(render('entry/create', 'state=email_in_use')).toContain('data-jrn-trigger="create-go-sign-in"');
    expect(render('entry/create', 'state=loading')).toMatch(/data-jrn-trigger="create-submit" data-loading="true"/);
    expect(render('entry/create', 'state=focused')).toContain('data-focused="true"');
    expect(render('entry/create', 'overlay=terms')).toContain('data-jrn-overlay="terms"');
    expect(render('entry/create', 'overlay=social-google')).toContain('data-jrn-handoff="native"');
  });

  it('06 EMAIL VERIFICATION: address is live HTML; resend, change and every outcome kept', () => {
    const html = render('entry/verify-email');
    for (const t of ['verify-open-mail', 'verify-resend', 'verify-change-email', 'verify-email-address']) expect(html, t).toContain(`data-jrn-trigger="${t}"`);
    expect(visible(html)).toContain(F01_COPY.verify.fallbackEmail);
    expect(render('entry/verify-email', 'state=expired_link')).toContain('data-jrn-trigger="verify-error-expired"');
    expect(render('entry/verify-email', 'state=verification_success')).toContain('data-jrn-trigger="verify-success-continue"');
    expect(render('entry/verify-email', 'overlay=change-email')).toContain('data-jrn-overlay="change-email"');
    expect(render('entry/verify-email', 'overlay=mail')).toContain('data-jrn-overlay="mail"');
  });

  it('07 SIGN IN keeps email, password, reveal, keep-signed-in, forgot, create, providers and every error', () => {
    const html = render('entry/sign-in');
    for (const t of ['signin-email', 'signin-password', 'signin-password-toggle', 'signin-keep', 'signin-submit', 'signin-forgot', 'signin-create', 'signin-apple', 'signin-google']) expect(html, t).toContain(`data-jrn-trigger="${t}"`);
    expect(html).toMatch(/<input[^>]*autoComplete="current-password"/);
    for (const [state, marker] of [
      ['incorrect_password', 'signin-error-incorrect'],
      ['account_not_found', 'signin-error-not-found'],
      ['offline', 'signin-error-offline'],
      ['locked', 'data-jrn-overlay="locked"'],
    ] as const) {
      expect(render('entry/sign-in', `state=${state}`), state).toContain(marker);
    }
    expect(render('entry/sign-in', 'state=loading')).toMatch(/data-jrn-trigger="signin-submit" data-loading="true"/);
    // A production shell ignores inspection switches.
    expect(render('entry/sign-in', 'state=locked', 'production')).not.toContain('data-jrn-overlay="locked"');
  });

  it('inputs are real controls whose computed size never triggers iOS zoom (≥ 16 px; the stage scale is a transform)', () => {
    const css = readFileSync('src/projects/jurnl/runtime/jurnl-entry-v2.css', 'utf8');
    expect(css).toContain('.jrn .jrn-e2__input {');
    // iOS decides focus zoom from the input's computed font-size; the stage's scale transform does not change it.
    for (const route of ['entry/create', 'entry/sign-in']) {
      const sizes = [...render(route).matchAll(/class="jrn-e2__input"[^>]*font-size:(\d+(?:\.\d+)?)px/g)].map((m) => +m[1]!);
      expect(sizes.length, route).toBeGreaterThanOrEqual(2);
      for (const px of sizes) expect(px, route).toBeGreaterThanOrEqual(16);
    }
  });
});

describe('ENTRY v2: fit, layout, lineage', () => {
  const all = [LAYOUT.ENTRY_V2_WELCOME, LAYOUT.ENTRY_V2_VALUE, LAYOUT.ENTRY_V2_BENEFITS, LAYOUT.ENTRY_V2_BEGIN, LAYOUT.ENTRY_V2_CREATE, LAYOUT.ENTRY_V2_VERIFY, LAYOUT.ENTRY_V2_SIGNIN];

  it('covers a phone with the plate (no letterbox) and keeps the whole live layer on screen', () => {
    for (const L of all) {
      for (const [W, H] of [[393, 852], [393, 699], [402, 874], [375, 667], [430, 932]] as const) {
        const f = entryFit(W, H, L.ui, L.focal);
        expect(f.aligned, `${W}x${H}`).toBe(true);
        // Plate covers the viewport.
        expect(f.plateX).toBeLessThanOrEqual(0.001);
        expect(f.plateY).toBeLessThanOrEqual(0.001);
        expect(f.plateX + ENTRY_W * f.plateK).toBeGreaterThanOrEqual(W - 0.001);
        expect(f.plateY + ENTRY_H * f.plateK).toBeGreaterThanOrEqual(H - 0.001);
        // Live layer inside the viewport.
        expect(f.x + L.ui[0] * f.k).toBeGreaterThanOrEqual(-0.001);
        expect(f.y + L.ui[1] * f.k).toBeGreaterThanOrEqual(-0.001);
        expect(f.x + L.ui[2] * f.k).toBeLessThanOrEqual(W + 0.001);
        expect(f.y + L.ui[3] * f.k).toBeLessThanOrEqual(H + 0.001);
      }
    }
  });

  it('keeps the plate full-bleed on desktop and draws the live layer over its own part of the plate', () => {
    const f = entryFit(1440, 900, LAYOUT.ENTRY_V2_CREATE.ui, LAYOUT.ENTRY_V2_CREATE.focal);
    expect(f.aligned).toBe(false);
    expect(ENTRY_W * f.plateK).toBeGreaterThanOrEqual(1440);
    expect(f.k * (LAYOUT.ENTRY_V2_CREATE.ui[3] - LAYOUT.ENTRY_V2_CREATE.ui[1])).toBeLessThanOrEqual(900);
  });

  it('measured boxes and type stay inside the authority frame', () => {
    for (const L of all) {
      for (const [k, b] of Object.entries(L.box)) expect(b[0] >= 0 && b[2] <= ENTRY_W && b[1] >= 0 && b[3] <= ENTRY_H && b[0] < b[2] && b[1] < b[3], k).toBe(true);
      for (const [k, t] of Object.entries(L.text)) expect(t.size > 8 && t.top > 0 && t.top < ENTRY_H, k).toBe(true);
    }
  });

  it('plates are byte-identical to the package, with lineage back to ENTRY v2 → screen → plate → authority', () => {
    expect(MANIFEST.package).toBe('ENTRY-v2-env3.zip');
    expect(MANIFEST.screens).toHaveLength(7);
    for (const s of MANIFEST.screens) {
      const bytes = readFileSync(s.plate.runtime_path);
      expect(createHash('sha256').update(bytes).digest('hex'), s.screen_id).toBe(s.plate.sha256);
      expect(existsSync(path.resolve(s.authority.path)), s.authority.path).toBe(true);
      expect(existsSync(path.resolve(s.plate.source_png)), s.plate.source_png).toBe(true);
      expect(s.authority.role).toMatch(/REFERENCE_ONLY/);
    }
  });

  it('touches only the seven parents: ENTRY 08+ screens keep their F01 shells, and nothing is generated', () => {
    for (const s of F01_SCREENS.filter((x) => !(x.id in F01_ENTRY_V2))) {
      const html = render(s.route);
      expect(html, s.id).not.toContain('data-jrn-entry-v2');
      expect(html, s.id).toContain('data-jrn-logo="official"');
    }
    const runtime = ['src/projects/jurnl/runtime/components/EntryV2Stage.tsx', 'src/projects/jurnl/runtime/components/EntryV2Parts.tsx', 'src/projects/jurnl/runtime/screens/EntryScreens.tsx'].map((f) => readFileSync(f, 'utf8')).join('\n');
    expect(runtime).not.toMatch(/openart/i);
    expect(runtime).not.toMatch(/AUTHORITY\.jpg|-authority\.png/);
  });
});
