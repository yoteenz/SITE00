/**
 * P0.JURNL.OVERLAYS.QUICK-ADD-AND-HAMBURGER-EDITORIAL-REDESIGN1 (approved): QUICK ADD and the account menu are drawn on
 * their approved shells over the live screen, with every control of the replaced overlays kept.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import JurnlRuntimeRoot from '../src/projects/jurnl/runtime/JurnlRuntimeRoot';
import { overlayFit } from '../src/projects/jurnl/runtime/components/OverlayAuthority';
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

describe('QUICK ADD: tactile transaction slip', () => {
  it('is a bottom sheet on the approved shell over the live screen', () => {
    const html = render('safe', 'overlay=quick-add');
    expect(html).toContain('data-jrn-screen="F09.00"');
    expect(html).toContain('data-jrn-overlay="quick-add"');
    expect(html).toContain('data-jrn-overlay-authority="QUICK_ADD"');
    expect(html).toContain('data-asset-id="OVERLAY.QUICK_ADD.SHELL.001"');
    expect(html).toMatch(/--shell:url\(&quot;[^"]*QUICK_ADD_SHELL\.webp/);
    expect(html).toContain('jrn-ovl__scrim');
    const sheet = sliceOf(html, 'data-jrn-overlay="quick-add"');
    for (const line of ['QUICK ADD', 'ADD A TRANSACTION IN SECONDS.', 'NAME', 'AMOUNT', 'TYPE', 'EXPENSE', 'INCOME', 'ACCOUNT', 'SAVE TRANSACTION']) {
      expect(visible(sheet), line).toContain(line);
    }
    expect(visible(sheet).match(/[a-z]/g)).toBeNull();
  });

  it('keeps every control of the old sheet', () => {
    const html = render('safe', 'overlay=quick-add');
    for (const t of ['quick-add-name', 'quick-add-amount', 'quick-add-expense', 'quick-add-income', 'quick-add-save', 'quick-add-close']) {
      expect(html, t).toContain(`data-jrn-trigger="${t}"`);
    }
    expect(html).toContain('role="radiogroup" aria-label="DIRECTION"');
    expect(html).toContain('role="radiogroup" aria-label="ACCOUNT"');
    // Empty slip: SAVE waits for a name and an amount; EXPENSE is chosen.
    expect(html).toMatch(/data-jrn-trigger="quick-add-save" disabled=""/);
    expect(html).toMatch(/aria-pressed="true" data-active="true" data-jrn-trigger="quick-add-expense"/);
    expect(html).toContain('placeholder="WHAT WAS THIS FOR?"');
    expect(html).toContain('placeholder="0.00"');
    expect(html).toContain('inputMode="decimal"');
  });

  it('offers every record type where the family has more than one', () => {
    const html = render('today', 'overlay=quick-add');
    const group = html.match(/role="radiogroup" aria-label="TYPE">([\s\S]*?)<\/div>/)?.[1] ?? '';
    for (const label of ['MOVEMENT', 'INCOME', 'GOAL', 'PURCHASE', 'TRIP']) expect(visible(group), label).toContain(label);
    expect(visible(html)).toContain('RECORD');
  });
});

describe('HAMBURGER MENU: account folio', () => {
  it('is a drawer on the approved folio with the profile leading', () => {
    const html = renderDrawer();
    expect(html).toContain('data-jrn-overlay="account-drawer"');
    expect(html).toContain('data-jrn-overlay-authority="HAMBURGER_MENU"');
    expect(html).toContain('data-asset-id="OVERLAY.ACCOUNT_MENU.SHELL.001"');
    expect(html).toMatch(/--shell:url\(&quot;[^"]*ACCOUNT_MENU_SHELL\.webp/);
    expect(html).toContain('jrn-ovl__scrim');
    // The old drawer photograph and its card thumbnails are gone.
    expect(html).not.toContain('ACCOUNT_DRAWER_PLATE');
    expect(html).not.toContain('jrn-ref__card');
    const text = visible(html);
    for (const line of ['JURNL', 'ACCOUNT', 'PROFILE', 'PREVIEW GUEST', 'DISPLAY CURRENCY', 'CONNECTION', 'ASK JURNL CONTEXT', 'SAFE TO SPEND BUFFER', 'SAVE BUFFER', 'PRIVACY & CONSENTS', 'SIGN OUT']) {
      expect(text, line).toContain(line);
    }
    // Order: lockup and title, then the profile, utilities, settings, sign out at the foot.
    const at = (s: string) => text.indexOf(s);
    expect(at('PROFILE')).toBeLessThan(at('DISPLAY CURRENCY'));
    expect(at('DISPLAY CURRENCY')).toBeLessThan(at('ASK JURNL CONTEXT'));
    expect(at('SAFE TO SPEND BUFFER')).toBeLessThan(at('PRIVACY & CONSENTS'));
    expect(at('PRIVACY & CONSENTS')).toBeLessThan(at('SIGN OUT'));
    expect(text.match(/[a-z]/g)).toBeNull();
  });

  it('keeps every control of the old drawer', () => {
    const html = renderDrawer();
    for (const t of ['account-drawer-close', 'drawer-account', 'drawer-profile', 'drawer-currency', 'drawer-connection', 'drawer-ask-context', 'drawer-buffer', 'drawer-buffer-save', 'drawer-privacy', 'drawer-sign-out']) {
      expect(html, t).toContain(`data-jrn-trigger="${t}"`);
    }
    expect(html).toMatch(/role="switch" aria-checked="(true|false)" aria-label="ASK JURNL CONTEXT"/);
  });
});

describe('overlay fit and assets', () => {
  it('scales the 393 frame to the screen', () => {
    const phone = overlayFit(402, 874, 'sheet');
    expect(phone.s).toBeCloseTo(402 / 393, 5);
    expect(overlayFit(393, 699, 'sheet').s).toBe(1);
    // Wide screens keep the root hubs' column and never grow past 1.35.
    expect(overlayFit(1440, 900, 'sheet').s).toBeLessThanOrEqual(1.35);
    expect(overlayFit(1440, 900, 'sheet').s * 393).toBeLessThanOrEqual(0.6 * 900 + 1);
    // The drawer always keeps at least the 699 frame height.
    const desk = overlayFit(1440, 900, 'drawer');
    expect(900 / desk.s).toBeGreaterThanOrEqual(699);
  });

  it('ships the approved authorities and the runtime shells, with no slice seams or blur', () => {
    for (const f of ['QUICK_ADD/QUICK_ADD_AUTHORITY.png', 'QUICK_ADD/QUICK_ADD_SHELL.png', 'HAMBURGER_MENU/HAMBURGER_MENU_AUTHORITY.png', 'HAMBURGER_MENU/HAMBURGER_MENU_SHELL.png']) {
      expect(existsSync(path.resolve('JURNL/OVERLAYS_EDITORIAL_REDESIGN1', f)), f).toBe(true);
    }
    for (const f of ['QUICK_ADD_SHELL.webp', 'ACCOUNT_MENU_SHELL.webp']) {
      expect(existsSync(path.resolve('src/projects/jurnl/runtime/global/overlays', f)), f).toBe(true);
    }
    const css = readFileSync(path.resolve('src/projects/jurnl/runtime/jurnl-overlays.css'), 'utf8');
    expect(css).not.toMatch(/border-image/);
    expect(css).not.toMatch(/filter:\s*blur/);
    expect(css).not.toMatch(/border-radius:\s*(50%|999px)/);
  });
});
