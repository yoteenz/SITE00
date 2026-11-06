/**
 * P0.JURNL.GLOBAL-EIGHT-OVERLAYS.MENU-FUNCTIONAL-RECOVERY-AND-SECTIONED-NAVIGATION-CONVERGENCE — behaviour, not labels:
 *   · the SAFE TO SPEND BUFFER is typed in the display currency and kept in USD (no double conversion, honest failure)
 *   · ASK JURNL CONTEXT is its own consent: OFF stays OFF, AI choices and device sync never turn it on
 *   · DATA EXPORT promises nothing that does not exist
 *   · the menu is three sections over the OV08 production shell, secondary navigation only
 *   · the eight overlays' assets are installed exactly as supplied and registered with their provenance
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { resolveEntitlements } from '../shared/site00-monetization/entitlements.js';
import { JURNL_MONETIZATION_CONTRACT as CONTRACT } from '../src/projects/jurnl/data/monetization/contract';
import { bufferDisplayValue, bufferToCanonical, saveSafetyBuffer, storedBufferUsd } from '../src/projects/jurnl/data/f09/safetyBuffer';
import { computeSafeToSpend, safetyBufferFromSettings } from '../src/projects/jurnl/data/f09/safeToSpend';
import { installRateBook, resetCurrency, setCurrency } from '../src/projects/jurnl/data/home/currency';
import { getRepository } from '../src/projects/jurnl/data/repository/deviceRepository';
import { syncDeviceAiToRepository } from '../src/projects/jurnl/data/repository/consentSync';
import { consentGranted } from '../src/projects/jurnl/data/foundation/consent';
import { buildAskJurnlContext, explainFromContext } from '../src/projects/jurnl/data/foundation/askJurnl';
import { F01_CLAIMS, F01_COPY } from '../src/projects/jurnl/data/f01/copy';
import { DEFAULT_DEVICE } from '../src/projects/jurnl/runtime/state/store';
import { GLOBAL_MENU_SECTIONS, GlobalMenu, UnlockFolio, MembershipFolio } from '../src/projects/jurnl/runtime/global/GlobalMenu';
import { BufferFolio, ConnectionsFolio, HelpFolio, PreferencesFolio, PrivacyConsentsFolio, RulesFolio } from '../src/projects/jurnl/runtime/global/MenuDestinations';
import { OVERLAY_ASSETS, overlayShell } from '../src/projects/jurnl/runtime/global/overlays/eight/registry';
import { JurnlEntitlementsProvider } from '../src/projects/jurnl/runtime/monetization/JurnlEntitlements';
import { JurnlStoreProvider } from '../src/projects/jurnl/runtime/state/store';
import JurnlRuntimeRoot from '../src/projects/jurnl/runtime/JurnlRuntimeRoot';
import { world } from './helpers/jurnlFinancialWorld';

const BASE = '/production/jurnl/runtime';
const free = resolveEntitlements(CONTRACT, { source: 'DESIGN_PREVIEW', subscription: null });
const noop = () => undefined;
const nav = { onBack: noop, onOpen: noop };
function render(node: ReactNode) {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [`${BASE}/today`] },
      createElement(Routes, null, createElement(Route, { path: '/production/:projectSlug/runtime/*', element: createElement(JurnlStoreProvider, { basePath: BASE, mode: 'design-preview' }, createElement(JurnlEntitlementsProvider, { mode: 'design-preview', value: free }, node)) })),
    ),
  );
}
const renderRuntime = (route: string, query = '') =>
  renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries: [`${BASE}/${route}${query ? `?${query}` : ''}`] }, createElement(Routes, null, createElement(Route, { path: '/production/:projectSlug/runtime/*', element: createElement(JurnlRuntimeRoot, { basePath: BASE, mode: 'design-preview' }) }))),
  );
const visible = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const nonScript = (html: string) => visible(html.replace(/<p class="jv3-t-script"[^>]*>[\s\S]*?<\/p>/g, ' '));
const DAY = 24 * 60 * 60 * 1000;
const EUR = 0.92;
const JPY = 150;

describe('SAFE TO SPEND BUFFER — typed in the display currency, kept in canonical USD', () => {
  beforeEach(() => {
    world();
    installRateBook({ rates: { EUR, JPY, GBP: 0.79 } });
  });
  afterEach(() => {
    resetCurrency();
    installRateBook(null);
  });

  it('B1 USD: what is typed is what is kept and what Safe to Spend subtracts', () => {
    expect(saveSafetyBuffer('250', 'USD')).toEqual({ ok: true, storedUsd: '250', canonicalUsd: 250 });
    expect(getRepository().getSettings().safeToSpendBuffer).toBe('250');
    expect(safetyBufferFromSettings()).toBe(250);
    expect(bufferDisplayValue(250, 'USD')).toBe('250');
  });

  it('B2 non-USD: 100 EUR is kept as its USD value (not as 100, and not converted twice)', () => {
    const r = saveSafetyBuffer('100', 'EUR');
    expect(r.ok).toBe(true);
    const usd = storedBufferUsd();
    expect(usd).toBeCloseTo(100 / EUR, 3);
    expect(safetyBufferFromSettings()).toBeCloseTo(100 / EUR, 3); // the calculation is in USD
    expect(safetyBufferFromSettings()).not.toBeCloseTo(100, 1);
    expect(safetyBufferFromSettings()).not.toBeCloseTo(100 * EUR, 1); // no double conversion
    expect(bufferDisplayValue(usd, 'EUR')).toBe('100'); // and it reads back as typed
  });

  it('B3 switching the display currency re-shows the same kept amount; the kept USD never changes', () => {
    saveSafetyBuffer('100', 'USD');
    expect(bufferDisplayValue(storedBufferUsd(), 'EUR')).toBe(String(Math.round(100 * EUR * 100) / 100));
    expect(bufferDisplayValue(storedBufferUsd(), 'JPY')).toBe('15000'); // JPY has no minor digits
    expect(storedBufferUsd()).toBe(100);
  });

  it('B4 repeated saves of an unchanged figure are stable (no drift)', () => {
    saveSafetyBuffer('100', 'EUR');
    const first = getRepository().getSettings().safeToSpendBuffer;
    for (let i = 0; i < 5; i++) saveSafetyBuffer(bufferDisplayValue(storedBufferUsd(), 'EUR')!, 'EUR');
    expect(getRepository().getSettings().safeToSpendBuffer).toBe(first);
  });

  it('B5 a stale (cached) rate still converts; an expired or missing rate converts nothing and saves nothing', () => {
    installRateBook({ rates: { EUR }, retrievedAt: new Date(Date.now() - 2 * DAY).toISOString() });
    expect(bufferToCanonical('92', 'EUR')).toMatchObject({ ok: true });
    saveSafetyBuffer('50', 'USD');
    installRateBook({ rates: { EUR }, retrievedAt: new Date(Date.now() - 9 * DAY).toISOString() });
    expect(saveSafetyBuffer('92', 'EUR')).toEqual({ ok: false, reason: 'RATE_UNAVAILABLE' });
    expect(getRepository().getSettings().safeToSpendBuffer).toBe('50'); // untouched
    installRateBook(null);
    expect(saveSafetyBuffer('92', 'EUR')).toEqual({ ok: false, reason: 'RATE_UNAVAILABLE' });
    expect(bufferDisplayValue(50, 'EUR')).toBeNull(); // nothing shown in a currency we cannot convert to
  });

  it('B6 persistence and derivation: the saved buffer reaches Safe to Spend once, in USD; clearing removes it', () => {
    const before = computeSafeToSpend();
    saveSafetyBuffer('46', 'EUR');
    const after = computeSafeToSpend();
    expect(after.safetyBuffer).toBeCloseTo(46 / EUR, 2);
    expect(before.value - after.value).toBeCloseTo(Math.min(before.value, 46 / EUR), 0);
    expect(saveSafetyBuffer('', 'EUR')).toMatchObject({ ok: true, canonicalUsd: 0 });
    expect(computeSafeToSpend().safetyBuffer).toBe(0);
    expect(bufferToCanonical('-5', 'USD')).toEqual({ ok: false, reason: 'INVALID_AMOUNT' });
  });

  it('B7 a legacy value (saved before this fix) keeps its meaning: it was applied as USD and still is', () => {
    getRepository().patchSettings({ safeToSpendBuffer: '75' });
    expect(safetyBufferFromSettings()).toBe(75);
    expect(bufferDisplayValue(storedBufferUsd(), 'USD')).toBe('75');
  });

  it('B8 the buffer folio states the unit and blocks saving when the rate is unavailable', async () => {
    installRateBook(null);
    expect(await setCurrency('EUR')).toBe(false); // no rate: the currency is not applied at all
    installRateBook({ rates: { EUR } });
    expect(await setCurrency('EUR')).toBe(true);
    const html = render(createElement(BufferFolio, { onBack: noop }));
    expect(visible(html)).toContain('BUFFER · EUR');
    expect(visible(html)).toContain('JURNL KEEPS IT IN USD');
    installRateBook(null);
    const blocked = render(createElement(BufferFolio, { onBack: noop }));
    expect(blocked).toContain('data-testid="buffer-rate-unavailable"');
    expect(blocked).toMatch(/data-jrn-trigger="buffer-save"[^>]*disabled/);
  });
});

describe('ASK JURNL CONTEXT — its own consent', () => {
  beforeEach(() => world({ user: 'ask-consent@jurnl.test' }));
  const ask = () => consentGranted(getRepository().getConsent(), 'ASK_JURNL_CONTEXT');
  const allAi = { personalizedInsights: true, smartCategorization: true, budgetRecommendations: true, naturalLanguage: true, marketTrends: true };

  it('C1 granting AI choices (natural language, insights) never grants the context', () => {
    syncDeviceAiToRepository({ ...DEFAULT_DEVICE, ai: allAi });
    expect(consentGranted(getRepository().getConsent(), 'AI_NATURAL_LANGUAGE')).toBe(true);
    expect(ask()).toBe(false);
  });

  it('C2 OFF stays OFF: a later device sync cannot turn the context back on', () => {
    getRepository().patchConsent('ASK_JURNL_CONTEXT', true, 'GS.SETTINGS');
    getRepository().patchConsent('ASK_JURNL_CONTEXT', false, 'GS.SETTINGS');
    for (let i = 0; i < 3; i++) syncDeviceAiToRepository({ ...DEFAULT_DEVICE, ai: allAi });
    expect(ask()).toBe(false);
  });

  it('C3 ON is kept when the AI choices are turned off (separate consents both ways)', () => {
    getRepository().patchConsent('ASK_JURNL_CONTEXT', true, 'GS.SETTINGS');
    syncDeviceAiToRepository({ ...DEFAULT_DEVICE });
    expect(ask()).toBe(true);
  });

  it('C4 the explanation opens only on the context consent, never on an AI consent alone', () => {
    syncDeviceAiToRepository({ ...DEFAULT_DEVICE, ai: allAi });
    const ctx = buildAskJurnlContext('GS', '/runtime/today', 'GS.MENU');
    expect(explainFromContext(ctx).state).toBe('UNAVAILABLE');
    expect(explainFromContext(ctx).body).toContain('PRIVACY & CONSENTS');
    getRepository().patchConsent('ASK_JURNL_CONTEXT', true, 'GS.SETTINGS');
    expect(explainFromContext(ctx).state).toBe('READY');
  });

  it('C5 PRIVACY & CONSENTS carries the context switch with its real state, next to the setup consents and the tools', () => {
    const off = render(createElement(PrivacyConsentsFolio, nav));
    expect(off).toMatch(/data-jrn-trigger="privacy-ask-context"[^>]*aria-checked="false"|aria-checked="false"[^>]*data-jrn-trigger="privacy-ask-context"/);
    getRepository().patchConsent('ASK_JURNL_CONTEXT', true, 'GS.SETTINGS');
    const on = render(createElement(PrivacyConsentsFolio, nav));
    expect(on).toMatch(/data-jrn-trigger="privacy-ask-context"[^>]*aria-checked="true"|aria-checked="true"[^>]*data-jrn-trigger="privacy-ask-context"/);
    for (const t of ['settings-consent-remember', 'settings-consent-links', 'settings-consent-sale', 'privacy-tool-ai-access', 'privacy-tool-your-data', 'privacy-tool-data-export', 'privacy-tool-remove-access']) expect(on, t).toContain(`data-jrn-trigger="${t}"`);
  });
});

describe('DATA EXPORT — no promise without a pipeline', () => {
  it('E1 the export sheet says it is not available; nothing can be requested; the email promise (C10) never renders', () => {
    const html = renderRuntime('entry/privacy', 'overlay=privacy-data-export');
    expect(html).toContain('data-jrn-trigger="privacy-export-unavailable"'); // JurnlErrorPanel marks itself with its id
    expect(html).not.toContain('data-jrn-trigger="privacy-export-request"');
    expect(visible(html)).not.toContain("WE'LL SEND YOUR DATA");
    expect(visible(html)).not.toContain('WE&#x27;LL SEND YOUR DATA');
    expect(F01_CLAIMS.find((c) => c.id === 'C10')!.status).toBe('WITHHELD');
    expect(JSON.stringify(F01_COPY.privacy.exportData)).not.toMatch(/CSV|JSON|WE'LL|YOUR EMAIL/); // no file formats or delivery promised
  });
});

describe('GLOBAL MENU — three sections over the OV08 shell', () => {
  const html = render(createElement(GlobalMenu, { onClose: noop, onOpen: noop }));

  it('N1 YOUR FINANCES · YOUR INTELLIGENCE · YOUR ACCOUNT, in order, with every row of the founder contract', () => {
    expect(GLOBAL_MENU_SECTIONS.map((s) => s.title)).toEqual(['YOUR FINANCES', 'YOUR INTELLIGENCE', 'YOUR ACCOUNT']);
    expect(GLOBAL_MENU_SECTIONS.flatMap((s) => s.rows.map((r) => r.label))).toEqual([
      'CONNECTED ACCOUNTS & SYNC', 'CURRENCY & EXCHANGE', 'SAFE TO SPEND BUFFER',
      'ASK JURNL', 'CLASSIFICATION & LEARNING RULES',
      'ACCOUNT & PROFILE', 'PREFERENCES', 'PRIVACY & CONSENTS', 'MY MEMBERSHIP', 'EXPLORE ADD-ONS', 'HELP & SUPPORT', 'SIGN OUT',
    ]);
    const text = visible(html);
    let at = -1;
    for (const label of ['YOUR FINANCES', 'CONNECTED ACCOUNTS & SYNC', 'SAFE TO SPEND BUFFER', 'YOUR INTELLIGENCE', 'ASK JURNL', 'YOUR ACCOUNT', 'ACCOUNT & PROFILE', 'SIGN OUT']) {
      const i = text.indexOf(label, at + 1);
      expect(i, label).toBeGreaterThan(at);
      at = i;
    }
    for (const r of GLOBAL_MENU_SECTIONS.flatMap((s) => s.rows)) expect(html, r.trigger).toContain(`data-jrn-trigger="${r.trigger}"`);
  });

  it('N2 secondary navigation only: no dock destination; financial items are not hidden under PREFERENCES', () => {
    for (const t of ['nav-home', 'nav-money', 'nav-add', 'nav-plan', 'nav-credit']) expect(html).not.toContain(`data-jrn-trigger="${t}"`);
    const finance = GLOBAL_MENU_SECTIONS[0].rows.map((r) => r.to);
    expect(finance).toEqual(['connections', 'currency', 'buffer']);
    const prefs = render(createElement(PreferencesFolio, nav));
    for (const word of ['CURRENCY', 'BUFFER', 'CONNECTION']) expect(visible(prefs), word).not.toContain(word);
  });

  it('N3 the OV08 production shell is the menu, at one uniform scale; rows live in the olive scrollport; no duplicate art', () => {
    const shell = overlayShell('OV08');
    expect(html).toContain(`src="${shell.src}"`);
    expect(html).toContain('data-overlay-asset="OV08"');
    expect(html).toContain('data-jrn-menu-scrollport');
    expect(html).not.toContain('jed-menu-head'); // the old bust / lemon / paper stack is not drawn over the shell
    expect(html).not.toContain('jed-art');
    expect(shell.width / shell.height).toBeCloseTo(2016 / 3584, 6);
    const port = html.slice(html.indexOf('data-jrn-menu-scrollport'));
    expect(port.indexOf('data-jrn-trigger="menu-connections"')).toBeGreaterThan(0);
    expect(html).toMatch(/role="dialog" aria-modal="true" aria-label="MENU"/);
    expect(html).toContain('data-jrn-trigger="global-menu-close"');
  });

  it('N4 every non-cursive label is uppercase', () => {
    expect(nonScript(html).match(/[a-z]/g)).toBeNull();
  });
});

describe('honest destinations (no fake connection, no invented rule, no dead button)', () => {
  beforeEach(() => world({ user: 'honest@jurnl.test' }));

  it('H1 CONNECTED ACCOUNTS says there is no bank link and offers the manual path; never CONNECTED', () => {
    const html = render(createElement(ConnectionsFolio, { onBack: noop, onManual: noop }));
    expect(html).toContain('data-testid="connections-provider"');
    expect(html).toContain('data-jrn-trigger="connections-manual"');
    expect(visible(html), visible(html)).toMatch(/\d+ POCKETS? · BALANCES YOU RECORD/);
    expect(html).not.toMatch(/data-state="(ACTIVE|CONNECTED|INCLUDED)"/);
    expect(visible(html)).not.toMatch(/\bCONNECTED\b(?! ACCOUNTS)/);
  });

  it('H2 CLASSIFICATION & RULES shows no rule and says nothing is learned', () => {
    const html = render(createElement(RulesFolio, nav));
    expect(html).toContain('data-testid="rules-unavailable"');
    expect(visible(html)).toContain('NOTHING IS LEARNED');
  });

  it('H3 HELP & SUPPORT is an honest surface with no invented contact', () => {
    const html = render(createElement(HelpFolio, nav));
    expect(html).toContain('data-testid="help-unavailable"');
    expect(html).not.toMatch(/@[a-z0-9-]+\.[a-z]/i);
    expect(html).not.toMatch(/mailto:|tel:/);
  });

  it('H4 UNLOCK: the feature card is a description, not a button; MANAGE MEMBERSHIP is not a control', () => {
    const unlock = render(createElement(UnlockFolio, { addOnId: CONTRACT.addOns[0]!.addOnId, onClose: noop }));
    expect(unlock).toContain('data-testid="unlock-feature"');
    expect(unlock).not.toContain('data-jrn-trigger="unlock-feature"');
    expect(unlock).toMatch(/<div class="jv3-card" data-static="true" data-testid="unlock-feature"/);
    const m = render(createElement(MembershipFolio, { onClose: noop, onOpen: noop }));
    expect(m).toMatch(/<div class="jv3-row"[^>]*data-testid="membership-manage"/);
    expect(visible(m)).toContain('NOT AVAILABLE YET');
  });

  it('H5 PREFERENCES links the sign-in security tools (F01.12) that onboarding used to strand', () => {
    const html = render(createElement(PreferencesFolio, nav));
    for (const t of ['pref-security-biometric', 'pref-security-device', 'pref-security-sessions']) expect(html, t).toContain(`data-jrn-trigger="${t}"`);
  });
});

describe('the eight overlays\' assets — installed as supplied, registered with provenance', () => {
  const manifest = JSON.parse(readFileSync('JURNL/GLOBAL_EIGHT_OVERLAYS/DOCS/ASSET_MANIFEST.json', 'utf8')) as { assets: { file: string; width: number; height: number; historyId: string; visibleAlphaBounds: { x0: number; y0: number; x1: number; y1: number } }[] };

  it('A1 eighteen assets: every manifest entry is registered with its dimensions, alpha bounds and history id', () => {
    expect(OVERLAY_ASSETS).toHaveLength(18);
    expect(manifest.assets).toHaveLength(18);
    for (const m of manifest.assets) {
      const a = OVERLAY_ASSETS.find((x) => x.file === m.file)!;
      expect(a, m.file).toBeTruthy();
      expect([a.width, a.height]).toEqual([m.width, m.height]);
      expect(a.alphaBounds).toEqual([m.visibleAlphaBounds.x0, m.visibleAlphaBounds.y0, m.visibleAlphaBounds.x1, m.visibleAlphaBounds.y1]);
      expect(a.historyId).toBe(m.historyId);
    }
  });

  it('A2 the installed originals are byte-for-byte what the registry records', () => {
    for (const a of OVERLAY_ASSETS) {
      const buf = readFileSync(`JURNL/GLOBAL_EIGHT_OVERLAYS/ASSETS/${a.file}`);
      expect(buf.length, a.file).toBe(a.installedBytes);
      expect(createHash('sha256').update(buf).digest('hex'), a.file).toBe(a.installedSha256);
    }
  });

  it('A3 shells have a 9:16 runtime derivative (one uniform scale); foregrounds and SK04 are not mounted', () => {
    for (const a of OVERLAY_ASSETS) {
      if (a.id.startsWith('OV')) {
        expect(a.runtime, a.id).not.toBeNull();
        expect(a.runtime!.width / a.runtime!.height).toBeCloseTo(a.width / a.height, 6);
        expect(existsSync(`src/projects/jurnl/runtime/global/overlays/eight/${a.id}_SHELL.webp`), a.id).toBe(true);
      } else {
        expect(a.runtime, a.id).toBeNull();
        expect(a.mount).toMatch(a.id === 'SK04' ? /^CANDIDATE_NOT_MOUNTED$/ : /^NOT_MOUNTED_PRESENT_IN_SHELL$/);
      }
    }
    // seven shells are mounted on their live overlays; OV06 waits for the founder (the approved F09 drawer controls)
    for (const id of ['OV01', 'OV02', 'OV03', 'OV04', 'OV05', 'OV07', 'OV08']) expect(OVERLAY_ASSETS.find((a) => a.id === id)!.mount, id).toBe('MOUNTED');
    expect(OVERLAY_ASSETS.find((a) => a.id === 'OV06')!.mount).toBe('INSTALLED_NOT_MOUNTED');
  });
});
