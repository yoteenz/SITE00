/**
 * P0.JURNL.GLOBAL-OVERLAYS.CANONICAL-MICRO-ASSETS-AND-UTILITY-BUTTONS.CLEAN-MOUNT-CONVERGENCE.OPUS5 — the GROK2 overlay
 * micro-assets:
 *   · the 59 masters and 3 candidates are installed byte-for-byte and match the handoff manifest; every runtime copy is
 *     registered with its source and runtime SHA-256
 *   · only qualified masters reach the runtime: held, unfit, superseded, baked, comparison and candidate files cannot mount
 *   · PRIVACY: one icon per row, the consent switch on its own track and thumb with React owning the value, policy
 *     statements carry no switch; MENU: 12 destinations, 11 art icons (BUFFER held), one chevron each
 *   · the art is decorative, never a target, scoped, and still under reduced motion; F09 / OV06 and OV07 are not touched
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { OVERLAY_ART } from '../src/projects/jurnl/runtime/global/overlayArt/registry';
import { JurnlArtToggle, JurnlMicroArt } from '../src/projects/jurnl/runtime/components/JurnlMicroArt';
import { PrivacyEnvironment } from '../src/projects/jurnl/runtime/global/ChildEnvironments';
import { GlobalMenu, GLOBAL_MENU_SECTIONS, MENU_ROW_ART } from '../src/projects/jurnl/runtime/global/GlobalMenu';
import { JurnlStoreProvider } from '../src/projects/jurnl/runtime/state/store';
import { installRateBook, resetCurrency } from '../src/projects/jurnl/data/home/currency';
import { world } from './helpers/jurnlFinancialWorld';

const BASE = '/production/jurnl/runtime';
const RT = 'src/projects/jurnl/runtime';
const PKG = 'JURNL/GLOBAL_EIGHT_OVERLAYS/MICRO_ASSETS_GROK2';
const noop = () => undefined;
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex');
const read = (p: string) => readFileSync(p, 'utf8');
function render(node: ReactNode) {
  return renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries: [`${BASE}/today`] }, createElement(Routes, null, createElement(Route, { path: '/production/:projectSlug/runtime/*', element: createElement(JurnlStoreProvider, { basePath: BASE, mode: 'design-preview' }, node) }))),
  );
}
const strip = (html: string) => html.replace(/^(?:<link [^>]*rel="preload"[^>]*>)*/, '');

beforeEach(() => {
  resetCurrency();
  installRateBook({ base: 'USD', rates: { USD: 1, EUR: 0.92 }, updatedAt: '2026-11-07T00:00:00Z', source: 'TEST' } as never);
  world({ user: 'opus5@jurnl.test' });
});

describe('OPUS5 · SOURCE MASTERS', () => {
  it('R1 · the 59 masters and 3 candidates are byte-for-byte the handoff files (manifest SHA-256 and SHA256SUMS)', () => {
    const rows = read(`${PKG}/05_AUDIT_AND_MANIFEST/CONVERGED_FILE_MANIFEST.csv`).trim().split('\n').slice(1);
    const want = new Map(rows.map((l) => [l.split(',')[0]!, l.match(/,([0-9a-f]{64}),/)![1]!]));
    let masters = 0;
    let candidates = 0;
    for (const [file, h] of want) {
      if (!/^0[12]_/.test(file)) continue;
      expect(sha(`${PKG}/${file}`), file).toBe(h);
      if (file.startsWith('01_')) masters += 1;
      else candidates += 1;
    }
    expect([masters, candidates]).toEqual([59, 3]);
    expect(readdirSync(`${PKG}/01_INSTALLABLE_SOURCE_MASTERS`)).toHaveLength(59);
    const sums = read(`${PKG}/SHA256SUMS.txt`).trim().split('\n');
    expect(sums).toHaveLength(62);
    for (const l of sums) {
      const [h, f] = l.split(/\s+/);
      expect(sha(`${PKG}/${f}`), f).toBe(h);
    }
  });

  it('R2 · every runtime copy is registered with its source and runtime hash; the source is the installed master', () => {
    const entries = Object.values(OVERLAY_ART);
    expect(entries).toHaveLength(38);
    for (const a of entries) {
      expect(sha(`${PKG}/01_INSTALLABLE_SOURCE_MASTERS/${a.stem}.png`), a.stem).toBe(a.sourceSha256);
      expect(sha(`${RT}/global/overlayArt/${a.stem}.webp`), a.stem).toBe(a.sha256);
      expect(a.id).toBe(`GROK2.${a.stem}`);
    }
  });

  it('R3 · held, unfit, superseded, baked, comparison and candidate files never reach the runtime', () => {
    const never = [
      'B04-TAG', // stray fragment of the neighbouring chip
      'B05-SAVE-BUFFER', // flat reconstruction with a visible inner seam
      'B05-SEARCH-FIELD', // would stretch or clip the live field
      'B06-CLOSE-DISC', // superseded by the founder CLOSE
      'B05-RENAME-CREAM', 'B05-DELETE-BLUSH', 'B05-BUFFER-BACK', // roles already worn by mounted papers
      'B05-RESOLVE', 'B05-ARCHIVE-CLOSE', 'B04-COINS-BALANCE', 'B04-CLOCK', // OV07: no clean shell (BLOCKED_ARTWORK)
      'B03-CALENDAR', // no clean slot in the live date field
      'B03-CHEVRON-ROW', 'B04-BANK-FILTER', 'B04-CALENDAR', 'B04-CHEVRON', 'B04-SEARCH-RESULT', // comparison extracts
    ];
    for (const n of never) {
      expect(Object.keys(OVERLAY_ART), n).not.toContain(n);
      expect(existsSync(`${RT}/global/overlayArt/${n}.webp`), n).toBe(false);
    }
    // the three founder-review candidates are installed for review only: no source file names them
    const src = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? src(`${dir}/${e.name}`) : /\.(tsx?|css)$/.test(e.name) ? [`${dir}/${e.name}`] : []));
    const all = src(RT).map(read).join('\n');
    for (const c of ['MANAGE_POCKET_CLEAN_BASE_NOTE_CANDIDATE', 'SEARCH_CLEAN_OPEN_FOLIO_CANDIDATE', 'MENU_BUFFER_PLAIN_SHIELD_NO_CHECK_CANDIDATE', 'B06-CLOSE-DISC']) expect(all, c).not.toContain(c);
    // no source master is imported directly (only the derived runtime copies are)
    expect(all).not.toMatch(/from ['"][^'"]*MICRO_ASSETS_GROK2/);
  });
});

describe('OPUS5 · COMPONENTS', () => {
  it('C1 · the art is decorative and named for its slot', () => {
    const html = strip(renderToStaticMarkup(createElement(JurnlMicroArt, { stem: 'B02-PROFILE', slot: 'x-icon', className: 'jma-icon' })));
    expect(html).toMatch(/^<img class="jma jma-icon"[^>]*alt=""[^>]*aria-hidden="true"[^>]*draggable="false"[^>]*data-asset-id="GROK2.B02-PROFILE"[^>]*data-micro-slot="x-icon"/);
  });

  it('C2 · the consent switch: role switch, the value in aria-checked, olive track + thumb right when ON, charcoal when OFF', () => {
    const on = strip(renderToStaticMarkup(createElement(JurnlArtToggle, { checked: true, onChange: noop, label: 'REMEMBER SETUP', trigger: 't', slot: 's' })));
    const off = strip(renderToStaticMarkup(createElement(JurnlArtToggle, { checked: false, onChange: noop, label: 'REMEMBER SETUP', trigger: 't', slot: 's' })));
    expect(on).toMatch(/^<button type="button" role="switch" aria-checked="true" aria-label="REMEMBER SETUP" class="jma-switch" data-on="true" data-jrn-trigger="t">/);
    expect(on).toContain('GROK2.B01-TOGGLE-TRACK-OLIVE');
    expect(off).toMatch(/aria-checked="false"[^>]*data-on="false"/);
    expect(off).toContain('GROK2.B01-TOGGLE-TRACK-CHARCOAL');
    for (const h of [on, off]) expect((h.match(/GROK2.B01-TOGGLE-THUMB/g) ?? []).length).toBe(1);
    const css = read(`${RT}/components/jurnl-micro-art.css`);
    expect(css).toMatch(/\.jma-switch\[data-on='true'\] \.jma-switch__thumb \{\s*left: calc\(100% - 20px\)/);
  });

  it('C3 · CSS: scoped to .jrn, no circle / border / background added to the art, motion only with motion allowed', () => {
    const css = read(`${RT}/components/jurnl-micro-art.css`);
    for (const rule of css.replace(/\/\*[\s\S]*?\*\//g, '').match(/[^{}]+\{/g) ?? []) {
      const sel = rule.slice(0, -1).trim();
      if (!sel || sel.startsWith('@')) continue;
      for (const s of sel.split(',')) expect(s.trim(), s).toMatch(/^\.jrn /);
    }
    expect(css).not.toMatch(/border-radius:\s*50%|background(-color)?:\s*(?!none)[^;]+;[^}]*\.jma\b/);
    const transitions = [...css.matchAll(/transition:/g)].length;
    const inside = (css.match(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}/g) ?? []).join('').match(/transition:/g)?.length ?? 0;
    expect(transitions).toBe(inside);
  });
});

describe('OPUS5 · MOUNTS', () => {
  it('P1 · PRIVACY: each row wears one GROK2 icon; NOTHING SOLD and LINKED ACCOUNTS OPTIONAL are statements with no switch', () => {
    const html = render(createElement(PrivacyEnvironment, { onBack: noop, onOpen: noop, askOn: false, setAsk: noop }));
    for (const [slot, id] of [
      ['settings-consent-remember-icon', 'B01-GEAR-REMEMBER-SETUP'],
      ['privacy-statement-links-icon', 'B01-BANK-LINKED-ACCOUNTS'],
      ['privacy-statement-sale-icon', 'B01-SHIELD-NOTHING-SOLD'],
      ['privacy-ask-context-icon', 'B01-SPARKLE-ASK-CONTEXT'],
      ['privacy-tool-ai-access-icon', 'B01-AI-STAR'],
      ['privacy-tool-your-data-icon', 'B01-DATABASE-YOUR-DATA'],
      ['privacy-tool-data-export-icon', 'B01-EXPORT-DOWN'],
      ['privacy-tool-remove-access-icon', 'B01-TRASH-REMOVE'],
    ]) {
      expect(html.match(new RegExp(`data-asset-id="GROK2.${id}" data-micro-slot="${slot}"`, 'g')), slot).toHaveLength(1);
    }
    // exactly two consent switches (REMEMBER SETUP, ASK JURNL CONTEXT), both on the art hardware; no CSS switch is left
    expect(html.match(/role="switch"/g)).toHaveLength(2);
    expect(html).not.toContain('jrn-toggle');
    expect(html).toMatch(/aria-checked="false" aria-label="ASK JURNL CONTEXT"/);
    for (const t of ['privacy-statement-links', 'privacy-statement-sale']) {
      const row = html.match(new RegExp(`<div class="jce-row jce-row--statement" data-testid="${t}">[\\s\\S]*?</div>`))![0];
      expect(row, t).not.toContain('role="switch"');
    }
    // no line glyph is left in the list or on REMOVE ACCESS
    const list = html.slice(html.indexOf('jce-list'), html.indexOf('data-jrn-trigger="privacy-back"'));
    expect(list.length).toBeGreaterThan(2000);
    expect(list).toContain('privacy-tool-remove-access');
    expect(list).not.toContain('<svg');
  });

  it('P2 · MENU: twelve destinations in three sections; eleven art icons, SAFE TO SPEND BUFFER held on its glyph; one chevron per row', () => {
    const rows = GLOBAL_MENU_SECTIONS.flatMap((s) => s.rows);
    expect(rows).toHaveLength(12);
    expect(GLOBAL_MENU_SECTIONS.map((s) => s.title)).toEqual(['YOUR FINANCES', 'YOUR INTELLIGENCE', 'YOUR ACCOUNT']);
    expect(Object.keys(MENU_ROW_ART)).toHaveLength(11);
    expect(MENU_ROW_ART['menu-buffer']).toBeUndefined();
    const html = render(createElement(GlobalMenu, { onClose: noop, onOpen: noop }));
    for (const r of rows) {
      const row = html.match(new RegExp(`<button[^>]*data-jrn-trigger="${r.trigger}"[^>]*>[\\s\\S]*?</button>`))![0];
      expect((row.match(/data-micro-slot="[^"]*-chevron"/g) ?? []).length, r.trigger).toBe(1);
      if (r.trigger === 'menu-buffer') {
        expect(row, 'held').not.toMatch(/data-micro-slot="menu-buffer-icon"/);
        expect((row.match(/<svg/g) ?? []).length).toBe(1);
      } else {
        expect(row, r.trigger).toContain(`data-asset-id="GROK2.${MENU_ROW_ART[r.trigger]}" data-micro-slot="${r.trigger}-icon"`);
        expect(row, r.trigger).not.toContain('<svg');
      }
    }
  });

  it('P3 · F09 ACCOUNT (OV06, FD-12) and OV07 ARCHIVE BLOCKED (BLOCKED_ARTWORK) carry no GROK2 art', () => {
    for (const f of [`${RT}/screens/AccountScreens.tsx`, `${RT}/screens/f05/dot01/ArchiveOverlay.tsx`]) {
      if (!existsSync(f)) continue;
      expect(read(f), f).not.toMatch(/JurnlMicroArt|overlayArt/);
    }
  });
});
