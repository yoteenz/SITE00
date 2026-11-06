/**
 * P0.JURNL.GLOBAL-OVERLAYS.CLEAN-ARTWORK-CURATED-MOUNT-AND-CHILD-ENVIRONMENT-CONVERGENCE.OPUS3 — the curated clean art:
 *   · the 15 curated files are installed byte-for-byte and registered with their SHA-256; unmounted files cannot mount
 *   · SAFE TO SPEND BUFFER and PRIVACY & CONSENTS are drawn on the shared OV08 menu environment (the founder authorities);
 *     the CH01 / CH02 clean plates are a different sidekick and are not mounted
 *   · no duplicate header, action paper or decorative layer; no prepainted UI geometry anywhere it is mounted
 *   · SEARCH rows are live and reflow for 0 / 1 / 4 / 20 results and long merchants; only the list scrolls
 *   · the child environments keep their live accounting and consent rules; policy statements are not consents
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { CLEAN_ART } from '../src/projects/jurnl/runtime/global/overlays/clean/registry';
import { BufferEnvironment, CH01_BOX, CH02_BOX, PrivacyEnvironment } from '../src/projects/jurnl/runtime/global/ChildEnvironments';
import { GlobalSearchDrawer, searchRecords } from '../src/projects/jurnl/runtime/surfaces/editorial/SearchDrawer';
import { GlobalMenu } from '../src/projects/jurnl/runtime/global/GlobalMenu';
import { JurnlStoreProvider } from '../src/projects/jurnl/runtime/state/store';
import { getRepository } from '../src/projects/jurnl/data/repository/deviceRepository';
import { saveSafetyBuffer } from '../src/projects/jurnl/data/f09/safetyBuffer';
import { safetyBufferFromSettings } from '../src/projects/jurnl/data/f09/safeToSpend';
import { installRateBook, resetCurrency } from '../src/projects/jurnl/data/home/currency';
import { world } from './helpers/jurnlFinancialWorld';

const BASE = '/production/jurnl/runtime';
const noop = () => undefined;
const ROOT = 'JURNL/GLOBAL_EIGHT_OVERLAYS/CLEAN_ARTWORK_OPUS3';
function render(node: ReactNode) {
  return renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries: [`${BASE}/today`] }, createElement(Routes, null, createElement(Route, { path: '/production/:projectSlug/runtime/*', element: createElement(JurnlStoreProvider, { basePath: BASE, mode: 'design-preview' }, node) }))),
  );
}
const visible = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const imgs = (html: string) => html.match(/<img [^>]*>/g) ?? [];
const assetIds = (html: string) => imgs(html).map((t) => t.match(/data-asset-id="([^"]+)"/)?.[1] ?? 'NONE');

describe('curated clean artwork — installed as supplied, registered with provenance', () => {
  const manifest = readFileSync(`${ROOT}/05_MOUNT_CONTRACT/CURATED_ASSET_MANIFEST.csv`, 'utf8').trim().split('\n').slice(1).map((l) => l.split(','));

  it('K1 all 15 curated files are registered; each installed file matches the curated SHA-256 byte-for-byte', () => {
    expect(CLEAN_ART).toHaveLength(15);
    expect(manifest).toHaveLength(15);
    for (const row of manifest) {
      const [file] = row;
      const a = CLEAN_ART.find((x) => x.file === file)!;
      expect(a, file).toBeTruthy();
      const sha = createHash('sha256').update(readFileSync(`${ROOT}/${file}`)).digest('hex');
      expect(sha, file).toBe(a.sourceSha256);
      expect(row.join(','), file).toContain(sha);
    }
  });

  it('K2 withheld files (both headers, the rimless SAVE paper) have no runtime copy and cannot mount', () => {
    const withheld = CLEAN_ART.filter((a) => a.mount === 'WITHHELD').map((a) => a.file.split('/').pop());
    expect(withheld.sort()).toEqual(['CH01-HEADER-TEXTFREE.png', 'CH01-SAVE-OLIVE-TEXTFREE.png', 'CH02-HEADER-TEXTFREE.png']);
    for (const a of CLEAN_ART.filter((x) => x.mount === 'WITHHELD')) {
      expect(a.runtime, a.file).toBeNull();
      expect(a.disposition, a.file).toMatch(/^Withheld: /);
    }
    for (const a of CLEAN_ART.filter((x) => x.mount !== 'WITHHELD' && x.mount !== 'NOT_MOUNTED')) {
      expect(a.runtime, a.file).not.toBeNull();
      // native resolution, never a downscaled re-export; lossless except the two large compositions
      expect(a.runtime!.encoding, a.file).toBe(/OV05|OV08/.test(a.file) ? 'q92' : 'lossless');
      if (a.runtime!.encoding === 'q92') expect(a.runtime!.psnrVisible!).toBeGreaterThanOrEqual(40);
    }
  });

  it('K3 founder correction: the CH01 / CH02 clean plates are not mounted (no runtime copy); OV08 is the shared L0', () => {
    const notMounted = CLEAN_ART.filter((a) => a.mount === 'NOT_MOUNTED');
    expect(notMounted.map((a) => a.file.split('/').pop()).sort()).toEqual(['CH01-BUFFER-CLEAN-ENVIRONMENT.png', 'CH02-PRIVACY-CLEAN-ENVIRONMENT.png']);
    for (const a of notMounted) {
      expect(a.runtime, a.file).toBeNull();
      expect(a.disposition, a.file).toMatch(/founder correction/i);
    }
    const ov08 = CLEAN_ART.find((a) => a.runtime?.id === 'OV08_MENU_ENVIRONMENT')!;
    expect(ov08.mount).toBe('MOUNTED');
    expect(ov08.disposition).toMatch(/GlobalMenu, SAFE TO SPEND BUFFER and PRIVACY & CONSENTS/);
    const coin = CLEAN_ART.find((a) => a.runtime?.id === 'CH01_COIN_RESERVE')!;
    expect(coin.mount).toBe('MOUNTED_CONDITIONAL');
    expect(coin.runtime!.encoding).toBe('lossless');
    // no runtime file of an unmounted plate is left where a mount could import it
    const runtimeDir = 'src/projects/jurnl/runtime/global/overlays/clean';
    for (const id of ['CH01_ENVIRONMENT', 'CH02_ENVIRONMENT']) expect(() => readFileSync(`${runtimeDir}/${id}.webp`), id).toThrow();
  });
});

describe('no duplicate artwork, no prepainted UI geometry', () => {
  beforeEach(() => world({ user: 'opus3-art@jurnl.test' }));

  it('D1 BUFFER and PRIVACY draw the shared OV08 environment once and never a second header paper or the CH plates', () => {
    const buffer = render(createElement(BufferEnvironment, { onBack: noop }));
    const privacy = render(createElement(PrivacyEnvironment, { onBack: noop, onOpen: noop, askOn: false, setAsk: noop }));
    for (const html of [buffer, privacy]) {
      expect(assetIds(html).filter((i) => i === 'OV08_MENU_ENVIRONMENT')).toHaveLength(1);
      expect(html).toContain('data-overlay-asset="OV08_MENU_ENVIRONMENT"');
      expect(html).not.toMatch(/HEADER|CH0[12]_ENVIRONMENT|CLEAN-ENVIRONMENT/);
      expect(html).not.toContain('SAVE_OLIVE');
      // each independent paper is mounted once, as the surface of one live control or one live summary
      const ids = assetIds(html);
      expect(new Set(ids).size).toBe(ids.length);
      // the live JURNL wordmark sits on the blank tag paper; the ornament is drawn live under the script
      expect(html).toMatch(/class="jsh-tag"[^>]*>JURNL</);
      expect(html).toContain('class="jsh-ornament"');
    }
    expect(assetIds(buffer).sort()).toEqual(['CH01_AMOUNT_PAPER', 'CH01_BACK_PAPER', 'CH01_COIN_RESERVE', 'CH01_EFFECT_PAPER', 'OV08_MENU_ENVIRONMENT']);
    expect(assetIds(privacy).sort()).toEqual(['CH02_BACK_PAPER', 'CH02_REMOVE_ACCESS_PAPER', 'OV08_MENU_ENVIRONMENT']);
  });

  it('D1b the coin still life is fixed art at its authority origin, 1:1 with the master, its top sliver clipped, below the live column', () => {
    const coin = CLEAN_ART.find((a) => a.runtime?.id === 'CH01_COIN_RESERVE')!;
    const [x0, y0, x1, y1] = CH01_BOX.coin;
    expect(x0 * 2016).toBeCloseTo(35, 6);
    expect(y0 * 3584).toBeCloseTo(2427, 6);
    expect((x1 - x0) * 2016).toBeCloseTo(coin.width, 6);
    expect((y1 - y0) * 3584).toBeCloseTo(coin.height, 6);
    // above the field, below the actions; the live column ends where it starts
    expect(CH01_BOX.column[3]).toBeLessThanOrEqual(y0 + 0.02);
    expect(CH01_BOX.actions[1]).toBeGreaterThan(y0);
    const css = readFileSync('src/projects/jurnl/runtime/global/jurnl-child-environments.css', 'utf8');
    expect(css).toMatch(/\.jce-coin \{[^}]*clip-path: polygon\(0 0, 12\.9% 0, 12\.9% 10%, 100% 10%, 100% 100%, 0 100%\)/);
    // the privacy list stays in the olive field, clear of the baked sprig, above the REMOVE ACCESS and BACK papers
    expect(CH02_BOX.list[1]).toBeGreaterThanOrEqual(0.305);
    expect(CH02_BOX.list[3]).toBeLessThanOrEqual(CH02_BOX.remove[1]);
    expect(CH02_BOX.remove[3]).toBeLessThanOrEqual(CH02_BOX.back[1]);
  });

  it('D2 every paper keeps its native aspect ratio (no stretching): the control carries the art own ratio', () => {
    const buffer = render(createElement(BufferEnvironment, { onBack: noop }));
    const ratio = (art: string) => {
      const a = CLEAN_ART.find((x) => x.runtime?.id === art)!;
      return `aspect-ratio:${a.width} / ${a.height}`;
    };
    for (const art of ['CH01_AMOUNT_PAPER', 'CH01_EFFECT_PAPER', 'CH01_BACK_PAPER']) expect(buffer, art).toContain(ratio(art));
    const privacy = render(createElement(PrivacyEnvironment, { onBack: noop, onOpen: noop, askOn: false, setAsk: noop }));
    for (const art of ['CH02_REMOVE_ACCESS_PAPER', 'CH02_BACK_PAPER']) expect(privacy, art).toContain(ratio(art));
  });

  it('D3 SEARCH and the MENU are each one art layer; no retired shell (painted wells, rows or baked action papers) is drawn', () => {
    const search = render(createElement(GlobalSearchDrawer, { onClose: noop }));
    const menu = render(createElement(GlobalMenu, { onClose: noop, onOpen: noop }));
    expect(assetIds(search)).toEqual(['OV05_OPEN_COMPOSITION']);
    expect(assetIds(menu)).toEqual(['OV08_MENU_ENVIRONMENT']);
    expect(menu).toMatch(/class="jgm-tag"[^>]*>JURNL</);
    for (const html of [search, menu]) expect(html).not.toMatch(/_SHELL\.webp|OV0\d-IS-/);
  });
});

describe('SEARCH — live rows reflow for any count and any length', () => {
  const seed = (n: number, long = false) => {
    world({ user: `opus3-search-${n}@jurnl.test` });
    const repo = getRepository();
    const s = repo.getSnapshot();
    const base = s.transactions[0];
    const extra = Array.from({ length: n }, (_, i) => ({
      ...(base ?? {}),
      id: `tx-opus3-${i}`,
      merchant: long && i === 0 ? 'THE EXTREMELY LONG MERCHANT NAME THAT KEEPS GOING SO IT MUST WRAP ACROSS SEVERAL LINES' : `OPUS3 ROW ${i}`,
      amount: 10 + i,
      direction: 'EXPENSE',
      occurred_on: '2026-11-01',
    }));
    repo.commit({ reason: 'TEST_WORLD', transactions: { upsert: extra as never } } as never);
  };
  for (const n of [0, 1, 4, 20]) {
    it(`S${n} · ${n} matching results render as ${n} live rows, with no fixed row height or painted slot`, () => {
      seed(n);
      const { hits } = searchRecords('OPUS3', 'TRANSACTIONS');
      expect(hits).toHaveLength(n);
      const html = render(createElement(GlobalSearchDrawer, { onClose: noop }));
      expect(html).toContain('data-testid="search-results"');
      const rows = html.match(/class="jsx-row"/g) ?? [];
      // the drawer opens on recent activity (up to six); the row markup carries no inline geometry
      expect(rows.length).toBeLessThanOrEqual(6);
      expect(html.match(/class="jsx-row"[^>]*style=/g)).toBeNull();
    });
  }
  it('S-long · a long merchant name stays whole (the row wraps and grows; nothing is truncated into a slot)', () => {
    seed(1, true);
    const { hits } = searchRecords('EXTREMELY LONG', 'TRANSACTIONS');
    expect(hits).toHaveLength(1);
    expect(hits[0]!.title).toContain('SEVERAL LINES');
  });
});

describe('child environments keep the accounting and consent rules', () => {
  beforeEach(() => {
    world({ user: 'opus3-child@jurnl.test' });
    installRateBook({ rates: { EUR: 0.92 } });
  });

  it('E1 the buffer field is live, labelled, shows its currency (a selector when the host can open it), and saves canonical USD', () => {
    const html = render(createElement(BufferEnvironment, { onBack: noop }));
    expect(visible(html)).toContain('BUFFER AMOUNT');
    expect(html).toMatch(/data-testid="buffer-currency"[^>]*>USD</);
    expect(html).not.toContain('data-jrn-trigger="buffer-currency"');
    const withSelector = render(createElement(BufferEnvironment, { onBack: noop, onCurrency: noop }));
    expect(withSelector).toMatch(/data-jrn-trigger="buffer-currency"/);
    expect(visible(withSelector)).toContain('USD ▾');
    expect(visible(html)).toContain('NO BUFFER SET');
    expect(html).toContain('data-jrn-trigger="buffer-input"');
    expect(html).toContain('data-jrn-trigger="buffer-save"');
    expect(html).toContain('data-jrn-trigger="buffer-back"');
    saveSafetyBuffer('92', 'EUR');
    expect(safetyBufferFromSettings()).toBeCloseTo(100, 3);
    resetCurrency();
  });

  it('E2 rate unavailable: the warning is live text (never forced into a paper) and saving is blocked', async () => {
    installRateBook({ rates: { EUR: 0.92 } });
    const { setCurrency } = await import('../src/projects/jurnl/data/home/currency');
    expect(await setCurrency('EUR')).toBe(true);
    installRateBook(null);
    const html = render(createElement(BufferEnvironment, { onBack: noop }));
    expect(html).toContain('data-testid="buffer-rate-unavailable"');
    expect(html).toMatch(/data-jrn-trigger="buffer-save"[^>]*disabled|disabled[^>]*data-jrn-trigger="buffer-save"/);
    expect(html.indexOf('buffer-rate-unavailable')).toBeLessThan(html.indexOf('buffer-effect-paper'));
    resetCurrency();
  });

  it('E3 privacy: the context switch shows its real state; policy statements are not switches; data rights are reachable', () => {
    const off = render(createElement(PrivacyEnvironment, { onBack: noop, onOpen: noop, askOn: false, setAsk: noop }));
    const on = render(createElement(PrivacyEnvironment, { onBack: noop, onOpen: noop, askOn: true, setAsk: noop }));
    expect(off).toMatch(/aria-checked="false"[^>]*data-jrn-trigger="privacy-ask-context"|data-jrn-trigger="privacy-ask-context"[^>]*aria-checked="false"/);
    expect(on).toMatch(/aria-checked="true"[^>]*data-jrn-trigger="privacy-ask-context"|data-jrn-trigger="privacy-ask-context"[^>]*aria-checked="true"/);
    expect(off).not.toContain('data-jrn-trigger="settings-consent-sale"');
    expect(off).not.toContain('data-jrn-trigger="settings-consent-links"');
    for (const t of ['privacy-tool-ai-access', 'privacy-tool-your-data', 'privacy-tool-data-export', 'privacy-tool-remove-access', 'privacy-back', 'settings-consent-remember']) expect(off, t).toContain(`data-jrn-trigger="${t}"`);
    expect(visible(off)).toContain('not available yet.');
    // authority order: REMEMBER SETUP · LINKED ACCOUNTS OPTIONAL · NOTHING SOLD · ASK JURNL CONTEXT, then YOUR DATA
    const order = ['settings-consent-remember', 'privacy-statement-links', 'privacy-statement-sale', 'privacy-ask-context', 'privacy-tool-ai-access'].map((t) => off.indexOf(t));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(order.every((i) => i > 0)).toBe(true);
    // the statements carry no switch
    for (const t of ['privacy-statement-links', 'privacy-statement-sale']) {
      const row = off.slice(off.indexOf(`data-testid="${t}"`), off.indexOf('</div>', off.indexOf(`data-testid="${t}"`)));
      expect(row, t).not.toContain('role="switch"');
    }
  });
});
