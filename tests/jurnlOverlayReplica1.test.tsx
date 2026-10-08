/**
 * QUICK ADD and the account drawer are replicas of the founder references
 * (JURNL/F09_SAFE/AUTHORITIES/F09_QUICK_ADD_OVERLAY_SOURCE.jpg, F09_ACCOUNT_DRAWER_OVERLAY_SOURCE.jpg), drawn on the
 * founder's handoff shells over the live screen, with every control of the earlier overlays kept.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import JurnlRuntimeRoot from '../src/projects/jurnl/runtime/JurnlRuntimeRoot';
import { REPLICA_H, drawerScale, fitSize, sheetScale } from '../src/projects/jurnl/runtime/components/OverlayAuthority';
import { OVR_DRAWER, OVR_QUICK_ADD } from '../src/projects/jurnl/runtime/layout/overlayReferenceLayout';
import { getRepository } from '../src/projects/jurnl/data/repository/deviceRepository';
import { AccountDrawer } from '../src/projects/jurnl/runtime/screens/AccountScreens';
import { JurnlStoreProvider } from '../src/projects/jurnl/runtime/state/store';

const BASE = '/production/jurnl/runtime';
const render = (route: string, query = '') =>
  renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [`${BASE}/${route}${query ? `?${query}` : ''}`] },
      createElement(Routes, null, createElement(Route, { path: '/production/:projectSlug/runtime/*', element: createElement(JurnlRuntimeRoot, { basePath: BASE, mode: 'design-preview' }) })),
    ),
  );
const renderDrawer = () =>
  renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [`${BASE}/today`] },
      createElement(
        Routes,
        null,
        createElement(Route, {
          path: '/production/:projectSlug/runtime/*',
          element: createElement(JurnlStoreProvider, { basePath: BASE, mode: 'design-preview' }, createElement(AccountDrawer, { onClose: () => undefined })),
        }),
      ),
    ),
  );
const visible = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
/** The markup from the element that carries `marker` onward. */
const sliceOf = (html: string, marker: string) => html.slice(html.lastIndexOf('<', html.indexOf(marker)));

describe('QUICK ADD: founder reference replica', () => {
  it('is the reference sheet on the founder shell over the live screen', () => {
    const html = render('safe', 'overlay=quick-add');
    expect(html).toContain('data-jrn-screen="F09.00"');
    expect(html).toContain('data-jrn-overlay="quick-add"');
    expect(html).toContain('data-jrn-overlay-authority="F09_QUICK_ADD_OVERLAY_SOURCE"');
    expect(html).toContain('data-asset-id="F09_QUICK_ADD_OVERLAY_SHELL"');
    expect(html).toMatch(/src="[^"]*F09_QUICK_ADD_SHELL\.webp"/);
    const sheet = sliceOf(html, 'data-jrn-overlay="quick-add"');
    for (const line of ['QUICK ADD', 'ADD A TRANSACTION IN SECONDS.', 'NAME', 'AMOUNT', 'TYPE', 'EXPENSE', 'INCOME', 'ACCOUNT', 'SAVE TRANSACTION']) {
      expect(visible(sheet), line).toContain(line);
    }
    expect(visible(sheet).match(/[a-z]/g)).toBeNull();
    // SAFE TO SPEND offers one record type, so the sheet is the reference exactly: 686 → 1672.
    expect(sheet).not.toContain('RECORD');
    expect(sheet).toMatch(/class="jrn-qa"[^>]*style="height:986px/);
    // Every line sits at its measured place: the NAME field is 37 px under its block top (reference y 953).
    expect(sheet).toContain('left:67px;top:37px;width:810px;height:78px');
  });

  it('keeps every control of the old sheet', () => {
    const html = render('safe', 'overlay=quick-add');
    for (const t of ['quick-add-name', 'quick-add-amount', 'quick-add-expense', 'quick-add-income', 'quick-add-save', 'quick-add-close']) {
      expect(html, t).toContain(`data-jrn-trigger="${t}"`);
    }
    expect(html).toContain('role="radiogroup" aria-label="DIRECTION"');
    expect(html).toContain('role="radiogroup" aria-label="ACCOUNT"');
    // Empty sheet: SAVE waits for a name and an amount; EXPENSE is chosen.
    expect(html).toMatch(/data-jrn-trigger="quick-add-save" disabled=""/);
    expect(html).toMatch(/aria-pressed="true" data-active="true" data-jrn-trigger="quick-add-expense"/);
    expect(html).toContain('placeholder="WHAT WAS THIS FOR?"');
    expect(html).toContain('placeholder="0.00"');
    expect(html).toContain('inputMode="decimal"');
  });

  it('adds a RECORD row, set like NAME, where the family has more than one record type', () => {
    const html = render('today', 'overlay=quick-add');
    const group = html.match(/role="radiogroup" aria-label="TYPE">([\s\S]*?)<\/div>/)?.[1] ?? '';
    for (const label of ['MOVEMENT', 'INCOME', 'GOAL', 'PURCHASE', 'TRIP']) expect(visible(group), label).toContain(label);
    expect(visible(html)).toContain('RECORD');
    // The row is the NAME block's height (140) on top of the reference's 986.
    expect(html).toMatch(/class="jrn-qa"[^>]*style="height:1126px/);
  });
});

describe('ACCOUNT drawer: founder reference replica', () => {
  it('is the reference panel on the founder shell, in the reference order', () => {
    const html = renderDrawer();
    expect(html).toContain('data-jrn-overlay="account-drawer"');
    expect(html).toContain('data-jrn-overlay-authority="F09_ACCOUNT_DRAWER_OVERLAY_SOURCE"');
    expect(html).toContain('data-asset-id="F09_ACCOUNT_DRAWER_OVERLAY_SHELL"');
    for (const f of ['F09_ACCOUNT_DRAWER_SHELL.webp', 'F09_DRAWER_PROFILE_THUMB.jpg', 'F09_DRAWER_PRIVACY_PHOTO.jpg']) expect(html, f).toMatch(new RegExp(`src="[^"]*${f.replace('.', '\\.')}"`));
    const text = visible(html);
    for (const line of [
      'FINANCIAL LIFE.',
      'BEAUTIFULLY ORGANIZED.',
      'ACCOUNT',
      'PROFILE',
      'PREVIEW GUEST',
      'NO EMAIL ON DEVICE',
      'DISPLAY CURRENCY',
      'CHANGE',
      'CONNECTION',
      'SET UP',
      'ASK JURNL CONTEXT',
      'HELP JURNL GIVE YOU',
      'SAFE TO SPEND BUFFER',
      'AMOUNT TO KEEP AS A BUFFER',
      'SAVE BUFFER',
      'PRIVACY & CONSENTS',
      'MANAGE YOUR PRIVACY',
      'SIGN OUT',
    ]) {
      expect(text, line).toContain(line);
    }
    const at = (s: string) => text.indexOf(s);
    expect(at('PROFILE')).toBeLessThan(at('DISPLAY CURRENCY'));
    expect(at('DISPLAY CURRENCY')).toBeLessThan(at('CONNECTION'));
    expect(at('CONNECTION')).toBeLessThan(at('ASK JURNL CONTEXT'));
    expect(at('SAFE TO SPEND BUFFER')).toBeLessThan(at('PRIVACY & CONSENTS'));
    expect(at('PRIVACY & CONSENTS')).toBeLessThan(at('SIGN OUT'));
    expect(text.match(/[a-z]/g)).toBeNull();
    // Cards sit on the reference's boxes (source px).
    expect(html).toContain('left:340px;top:393px;width:577px;height:164px');
    expect(html).toContain('left:403px;top:1003px;width:514px;height:264px');
  });

  it('keeps every control of the old drawer', () => {
    const html = renderDrawer();
    for (const t of ['account-drawer-close', 'drawer-account', 'drawer-profile', 'drawer-currency', 'drawer-connection', 'drawer-ask-context', 'drawer-buffer', 'drawer-buffer-save', 'drawer-privacy', 'drawer-sign-out']) {
      expect(html, t).toContain(`data-jrn-trigger="${t}"`);
    }
    expect(html).toMatch(/role="switch" aria-checked="(true|false)" aria-label="ASK JURNL CONTEXT"/);
  });

  it('groups the safe to spend buffer the way quick add groups an amount', () => {
    const previous = getRepository().getSettings().safeToSpendBuffer;
    getRepository().patchSettings({ safeToSpendBuffer: '6500' });
    const html = renderDrawer();
    getRepository().patchSettings({ safeToSpendBuffer: previous });
    const at = html.indexOf('data-jrn-trigger="drawer-buffer"');
    expect(html.slice(at, at + 200)).toContain('value="6,500"');
  });
});

describe('overlay scrims blur the screen behind them', () => {
  const css = (file: string) => readFileSync(path.join(process.cwd(), file), 'utf8');
  it('uses the account-drawer blur on quick add, drawers, and selection sheets', () => {
    const ovl = css('src/projects/jurnl/runtime/jurnl-overlays.css');
    expect(ovl).toMatch(/\.jrn \.jrn-ovl__scrim \{[^}]*backdrop-filter: blur\(3px\)/);
    expect(ovl).not.toMatch(/\.jrn-ovl--drawer \.jrn-ovl__scrim/);
    expect(css('src/projects/jurnl/runtime/jurnl-runtime.css')).toMatch(/\.jrn \.jrn-overlay__scrim \{[^}]*backdrop-filter: blur\(3px\)/);
    expect(css('src/projects/jurnl/runtime/jurnl-reference.css')).toMatch(/\.jrn \.jrn-ref \.jrn-ref__scrim \{[^}]*backdrop-filter: blur\(3px\)/);
  });
});

describe('replica fit, layout and assets', () => {
  it('scales the reference frame to the screen', () => {
    // A phone with the reference's proportions shows the reference size for size.
    expect(sheetScale(393, 699, 986)).toBeCloseTo(393 / 941, 5);
    expect(drawerScale(393, 699)).toBeCloseTo(699 / REPLICA_H, 5);
    // Wide screens keep the root hubs' column; the drawer fills the height, never wider than 86% of the screen.
    expect(sheetScale(1440, 900, 986) * 941).toBeLessThanOrEqual(0.6 * 900 + 1);
    expect(drawerScale(402, 874) * 645).toBeLessThanOrEqual(0.86 * 402 + 0.01);
    expect(drawerScale(1440, 900)).toBeCloseTo(900 / REPLICA_H, 5);
  });

  it('shrinks a live value only when it would not fit its line', () => {
    expect(fitSize('NOT SET', 32.7, 19, 309, 15)).toBe(32.7);
    const long = fitSize('PREVIEW ONLY — NO LIVE BANK LINK', 32.7, 19, 309, 15);
    expect(long).toBeLessThan(32.7);
    expect(long).toBeGreaterThanOrEqual(15);
  });

  it('keeps the measured layout inside the reference frame', () => {
    for (const L of [OVR_QUICK_ADD, OVR_DRAWER]) {
      for (const [k, b] of Object.entries(L.box)) {
        expect(b[0] >= 0 && b[2] <= 941 && b[1] >= 0 && b[3] <= 1672 && b[0] < b[2] && b[1] < b[3], k).toBe(true);
      }
      for (const [k, t] of Object.entries(L.text)) expect(t.size > 8 && t.top > 0, k).toBe(true);
    }
  });

  it('ships the founder sources, shells and the runtime images; the superseded redesign is gone', () => {
    for (const f of ['AUTHORITIES/F09_QUICK_ADD_OVERLAY_SOURCE.jpg', 'AUTHORITIES/F09_ACCOUNT_DRAWER_OVERLAY_SOURCE.jpg', 'OVERLAYS/F09_QUICK_ADD_OVERLAY_SHELL.png', 'OVERLAYS/F09_ACCOUNT_DRAWER_OVERLAY_SHELL.png']) {
      expect(existsSync(path.resolve('JURNL/F09_SAFE', f)), f).toBe(true);
    }
    const dir = 'src/projects/jurnl/runtime/global/overlays';
    for (const f of ['F09_QUICK_ADD_SHELL.webp', 'F09_ACCOUNT_DRAWER_SHELL.webp', 'F09_DRAWER_PROFILE_THUMB.jpg', 'F09_DRAWER_PRIVACY_PHOTO.jpg']) expect(existsSync(path.resolve(dir, f)), f).toBe(true);
    for (const f of ['QUICK_ADD_SHELL.webp', 'ACCOUNT_MENU_SHELL.webp']) expect(existsSync(path.resolve(dir, f)), f).toBe(false);
    const manifest = JSON.parse(readFileSync(path.resolve('JURNL/OVERLAYS_EDITORIAL_REDESIGN1/MANIFEST.json'), 'utf8'));
    expect(manifest.status).toBe('SUPERSEDED');
    const css = readFileSync(path.resolve('src/projects/jurnl/runtime/jurnl-overlays.css'), 'utf8');
    expect(css).not.toMatch(/jrn-menu|jrn-ovl__paper/);
  });
});
