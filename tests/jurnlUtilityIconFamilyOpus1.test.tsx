/**
 * P0.JURNL.F05-MONEY.CANONICAL-UTILITY-ICON-FAMILY-INTEGRATION.OPUS1 — the four founder-supplied utility buttons:
 *   · the masters are kept byte-for-byte and registered with their SHA-256; the runtime copies are the derived files
 *   · every runtime copy shares one optical centre and one disc fraction (one visible diameter at any size)
 *   · the button is live (name, trigger, handlers, disabled); the artwork is decorative and takes no pointer
 *   · MONEY parent SEARCH / ADD / MENU and the eight overlays' closes wear the artwork, once, with no line glyph left
 *   · no CSS circle, border, background or second shadow is drawn behind the artwork; no circular tappable control
 *   · DOT 01 chips and the F09 account drawer keep their own authorities
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { UTILITY_ART, UTILITY_DISC_FRACTION } from '../src/projects/jurnl/runtime/global/utilityArt/registry';
import { claimMenuArt, isMenuArtClaimed, JurnlUtilityArtButton } from '../src/projects/jurnl/runtime/components/JurnlUtilityArtButton';
import { JurnlStoreProvider } from '../src/projects/jurnl/runtime/state/store';
import { BufferEnvironment, PrivacyEnvironment } from '../src/projects/jurnl/runtime/global/ChildEnvironments';
import { GlobalSearchDrawer } from '../src/projects/jurnl/runtime/surfaces/editorial/SearchDrawer';
import { GlobalMenu } from '../src/projects/jurnl/runtime/global/GlobalMenu';
import { AddPlaceSheet } from '../src/projects/jurnl/runtime/screens/MoneyScreens';
import { TransferSheet } from '../src/projects/jurnl/runtime/finance/FinanceSheets';
import { MoneyActionSheet } from '../src/projects/jurnl/runtime/surfaces/editorial/MoneyOverlays';

const RT = 'src/projects/jurnl/runtime';
const MASTERS = 'JURNL/F05_MONEY/UTILITY_ICONS/ORIGINAL_PNG_MASTERS';
const read = (p: string) => readFileSync(p, 'utf8');
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex');
const BASE = '/production/jurnl/runtime';
const noop = () => undefined;
function render(node: ReactNode) {
  return renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries: [`${BASE}/today`] }, createElement(Routes, null, createElement(Route, { path: '/production/:projectSlug/runtime/*', element: createElement(JurnlStoreProvider, { basePath: BASE, mode: 'design-preview' }, node) }))),
  );
}
const report = JSON.parse(read('JURNL/MANIFEST/F05_MONEY_UTILITY_ICONS_OPUS1/derive_report.json')) as {
  assets: { id: string; kind: string; master_file: string; source_sha256: string; source_px: number[]; transparency: { dust_px_cleared: number; alpha_max: number }; crop: { source_alpha_outside_crop_max: number }; runtime: { file: string; sha256: string; px: number[]; disc_w: number; disc_center: number[] } }[];
};
/** the close control of an overlay, as rendered */
const closeOf = (html: string, trigger: string) => html.match(new RegExp(`<button[^>]*data-jrn-trigger="${trigger}"[^>]*>[\\s\\S]*?</button>`))?.[0] ?? '';

describe('OPUS1 · ASSETS', () => {
  it('U1 · four founder masters, byte-for-byte, registered by SHA-256 under the canonical ids', () => {
    expect(Object.keys(UTILITY_ART).sort()).toEqual(['add', 'close', 'menu', 'search']);
    expect(Object.values(UTILITY_ART).map((a) => a.id).sort()).toEqual(['F05.UTILITY.ADD.GOLD', 'F05.UTILITY.CLOSE.GOLD', 'F05.UTILITY.MENU.GOLD', 'F05.UTILITY.SEARCH.GOLD']);
    const sums = Object.fromEntries(read(`${MASTERS}/SHA256SUMS.txt`).trim().split('\n').map((l) => l.split(/\s+/).reverse()));
    for (const r of report.assets) {
      const art = UTILITY_ART[r.kind as keyof typeof UTILITY_ART];
      expect(sha(`${MASTERS}/${r.master_file}`), r.master_file).toBe(r.source_sha256);
      expect(sums[r.master_file], r.master_file).toBe(r.source_sha256);
      expect(art.sourceSha256).toBe(r.source_sha256);
      expect(art.provenance).toBe('FOUNDER-SUPPLIED ARTWORK');
      expect(sha(`${RT}/global/utilityArt/${r.runtime.file}`), r.runtime.file).toBe(art.sha256);
      expect(r.source_px).toEqual([1254, 1254]);
    }
  });

  it('U2 · one visible diameter and one optical centre for all four; only invisible alpha dust was removed; nothing visible was cropped', () => {
    for (const r of report.assets) {
      expect(r.runtime.px).toEqual([256, 256]);
      expect(Math.abs(r.runtime.disc_w / 256 - UTILITY_DISC_FRACTION), r.id).toBeLessThan(0.006);
      expect(Math.abs(r.runtime.disc_center[0]! - 127.5), r.id).toBeLessThanOrEqual(1.5);
      expect(Math.abs(r.runtime.disc_center[1]! - 127.5), r.id).toBeLessThanOrEqual(1.5);
      expect(r.crop.source_alpha_outside_crop_max, r.id).toBeLessThanOrEqual(3); // ≤ 1.2 %: nothing visible lies outside the crop
      expect(r.transparency.alpha_max).toBe(255);
    }
    const discs = report.assets.map((r) => r.runtime.disc_w);
    expect(Math.max(...discs) - Math.min(...discs)).toBeLessThanOrEqual(1);
    // the derivation clears only alpha ≤ 2 (it never redraws): see the script
    expect(read('scripts/jurnl/utility-icons/derive_utility_icons.py')).toMatch(/dust = \(al > 0\) & \(al <= 2\)/);
  });
});

describe('OPUS1 · COMPONENT', () => {
  it('C1 · a live button: name, trigger, handlers and disabled on the button; the artwork is decorative and never a target', () => {
    // React 19 hoists an image preload <link> ahead of the markup; the control itself is the <button> after it
    const raw = renderToStaticMarkup(createElement(JurnlUtilityArtButton, { kind: 'search', label: 'SEARCH', trigger: 'x-search', disabled: true, onClick: noop, 'aria-haspopup': 'dialog' }));
    const html = raw.replace(/^(?:<link [^>]*rel="preload"[^>]*>)*/, '');
    expect(html).toMatch(/^<button type="button"[^>]*disabled=""[^>]*class="jrn-uab"[^>]*data-utility-art="search"[^>]*data-jrn-trigger="x-search"[^>]*aria-label="SEARCH"/);
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toMatch(/<img class="jrn-uab__art"[^>]*alt=""[^>]*aria-hidden="true"[^>]*draggable="false"[^>]*data-asset-id="F05.UTILITY.SEARCH.GOLD"/);
    expect(html).not.toContain('<svg');
    expect((html.match(/<img/g) ?? []).length).toBe(1);
  });

  it('C2 · the corner hamburger takes the MENU artwork only while a screen claims it; a double release is harmless', () => {
    const src = read(`${RT}/components/JurnlCornerChrome.tsx`);
    expect(src).toMatch(/\{menuArt \? \([\s\S]*kind="menu"[\s\S]*trigger="f09-menu"[\s\S]*\) : \([\s\S]*<svg viewBox="0 0 40 26"/);
    expect(read(`${RT}/screens/f05/MoneyMotionParent.tsx`)).toMatch(/useEffect\(\(\) => claimMenuArt\(\), \[\]\)/);
    expect(isMenuArtClaimed()).toBe(false);
    const a = claimMenuArt();
    const b = claimMenuArt();
    expect(isMenuArtClaimed()).toBe(true);
    a();
    a(); // a second release of the same claim does not release the other screen's claim
    expect(isMenuArtClaimed()).toBe(true);
    b();
    expect(isMenuArtClaimed()).toBe(false);
  });
});

describe('OPUS1 · MOUNTS', () => {
  it('M1 · MONEY parent: SEARCH and ADD wear the artwork on the approved chips with their triggers, names and handlers; no line glyph is left', () => {
    const src = read(`${RT}/screens/f05/MoneyMotionParent.tsx`);
    expect(src).toMatch(/<JurnlUtilityArtButton kind="search" className="jrn-f05m__chip" trigger="f05m-search" label="SEARCH POCKETS AND ACTIVITY" aria-haspopup="dialog"[^>]*onClick=\{\(\) => setSheet\('search'\)\} \/>/);
    expect(src).toMatch(/<JurnlUtilityArtButton kind="add" className="jrn-f05m__chip" trigger="f05m-actions" label="ADD A POCKET OR MOVE YOUR MONEY"[^>]*onClick=\{\(\) => setSheet\('actions'\)\} \/>/);
    expect(src).not.toContain('<circle cx="10.5" cy="10.5" r="6.5"');
    expect(src).not.toContain('d="M12 4v16M4 12h16"');
  });

  it('M2 · every overlay close wears the CLOSE artwork once and keeps its trigger and name', () => {
    const cases: [string, string, string][] = [
      [render(createElement(BufferEnvironment, { onBack: noop })), 'global-buffer-close', 'CLOSE SAFE TO SPEND BUFFER'],
      [render(createElement(PrivacyEnvironment, { onBack: noop, onOpen: noop, askOn: false, setAsk: noop })), 'settings-consents-sheet-close', 'CLOSE PRIVACY &amp; CONSENTS'],
      [render(createElement(GlobalSearchDrawer, { onClose: noop })), 'global-search-close', ''],
      [render(createElement(GlobalMenu, { onClose: noop, onOpen: noop })), 'global-menu-close', 'CLOSE MENU'],
      [render(createElement(AddPlaceSheet, { onClose: noop, onSaved: noop })), 'money-add-place-close', ''],
      [render(createElement(TransferSheet, { onClose: noop })), 'transfer-sheet-close', ''],
      [render(createElement(MoneyActionSheet, { canMove: true, onAdd: noop, onMove: noop, onClose: noop })), 'f05m-actions-sheet-close', ''],
    ];
    for (const [html, trigger, label] of cases) {
      const btn = closeOf(html, trigger);
      expect(btn, trigger).toContain('data-utility-art="close"');
      expect(btn, trigger).toContain('data-asset-id="F05.UTILITY.CLOSE.GOLD"');
      expect(btn, trigger).not.toContain('<svg');
      if (label) expect(btn, trigger).toContain(`aria-label="${label}"`);
      expect((html.match(/data-asset-id="F05\.UTILITY\.CLOSE\.GOLD"/g) ?? []).length, trigger).toBe(1);
    }
  });

  it('M3 · DOT 01 chips and the F09 account drawer keep their own authorities (parchment chips, square outline close)', () => {
    expect(read(`${RT}/screens/f05/dot01/Dot01Frame.tsx`)).not.toContain('JurnlUtilityArtButton');
    expect(read(`${RT}/screens/AccountScreens.tsx`)).not.toContain('JurnlUtilityArtButton');
  });
});

describe('OPUS1 · STYLESHEET', () => {
  const css = read(`${RT}/components/jurnl-utility-art.css`).replace(/\/\*[\s\S]*?\*\//g, '');
  it('S1 · no CSS circle, border, background or extra shadow behind the artwork; the button stays square-rounded', () => {
    for (const m of css.matchAll(/border-radius:\s*([^;]+);/g)) expect(m[1]).not.toMatch(/50%|999|circle/);
    for (const m of css.matchAll(/(?:^|[;{\s])background:\s*([^;]+);/g)) expect(m[1]!.trim()).toBe('none');
    for (const m of css.matchAll(/box-shadow:\s*([^;]+);/g)) expect(m[1]!.trim()).toBe('none');
    for (const m of css.matchAll(/(?:^|[;{\s])border:\s*([^;]+);/g)) expect(m[1]!.trim()).toBe('0');
    expect(css).toMatch(/\.jrn \.jrn-uab__art \{[^}]*pointer-events: none;/);
    expect(css).toMatch(/width: calc\(var\(--uab-disc\) \/ 0\.8065\);/);
  });
  it('S2 · press is a small compression with a weighted settle, nothing while idle, nothing under reduced motion; every rule is scoped to .jrn', () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*:active:not\(:disabled\) \.jrn-uab__art \{[\s\S]*scale\(0\.955\)/);
    expect(css).not.toMatch(/animation:|@keyframes/);
    for (const m of css.matchAll(/([^{}]+)\{[^{}]*\}/g)) {
      const sel = m[1]!.trim();
      if (sel.startsWith('@media')) continue;
      for (const s of sel.split(',')) expect(s.trim(), s).toMatch(/^\.jrn[\s[]/);
    }
  });
});
