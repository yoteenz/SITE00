/* OPUS3 after-captures: every overlay changed by P0.JURNL.GLOBAL-OVERLAYS.CLEAN-ARTWORK-CURATED-MOUNT-AND-CHILD-ENVIRONMENT-
 * CONVERGENCE, opened over its real page with synthetic worlds, in every required state: MANAGE POCKET (menu, rename, delete
 * confirm), SEARCH (recent, 0 / 4 / 20 results with a long merchant, keyboard open), the MENU (top, final item reached), SAFE TO
 * SPEND BUFFER (default, keyboard open, saved, long rate warning) and PRIVACY & CONSENTS (top, list end). Each capture records page
 * scroll and the overlay's art ids. Exchange rates are route-stubbed (no live provider).
 * Run: npx tsx scripts/jurnl/global-menu/capture_opus3_states.ts <out> [w x h,...]  (env BASE, DSF, ONLY) */
import { chromium, type Page } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { JURNL_E2E_STORAGE } from '../../../src/projects/jurnl/e2e/fixture';
import { dot01World, purchase } from '../../../e2e/jurnl/helpers/jurnl-dot01-world';
import { f05World } from '../../../e2e/jurnl/helpers/jurnl-f05-world';

const OUT = process.argv[2]!;
const VPS = (process.argv[3] ?? '360x640,393x660,393x852,430x932,820x1180,1440x900').split(',');
const DSF = Number(process.env.DSF ?? 2);
const BASE = process.env.BASE ?? 'http://127.0.0.1:5174/production/jurnl/runtime/';
const ONLY = (process.env.ONLY ?? '').split(',').filter(Boolean);
const T = (id: string) => `[data-jrn-trigger="${id}"]`;

function searchWorld(n: number) {
  const w = dot01World();
  const bank = w.snapshot.accounts.find((a) => a.account_id === 'bank')!;
  const now = new Date().toISOString();
  const rows = Array.from({ length: n }, (_, i) => purchase(`tx-opus3-${i}`, bank, i === 0 ? 'OPUS3 THE EXTREMELY LONG MERCHANT NAME THAT KEEPS GOING SO IT MUST WRAP' : `OPUS3 ROW ${String(i).padStart(2, '0')}`, 10 + i, 'SHOPPING', 1 + (i % 9), now));
  return { ...w, snapshot: { ...w.snapshot, transactions: [...w.snapshot.transactions, ...rows] } };
}
function deletableWorld() {
  const w = f05World('many');
  const now = new Date().toISOString();
  const accounts = w.snapshot.accounts.map((a) => (a.account_id === 'long' ? { ...a, balance: 18.5, available_balance: 18.5 } : a));
  const long = accounts.find((a) => a.account_id === 'long')!;
  return { ...w, snapshot: { ...w.snapshot, accounts, transactions: [purchase('tx-long-books', long, 'BOOKSHOP', 12.5, 'SHOPPING', 2, now), purchase('tx-long-cafe', long, 'CORNER CAFE', 6, 'DINING', 1, now)] } };
}
const keyboard = async (p: Page, field: string) => {
  await p.focus(T(field));
  const v = p.viewportSize()!;
  await p.setViewportSize({ width: v.width, height: Math.round(v.height * 0.6) }); // the software keyboard takes ~40 %
  await p.waitForTimeout(400);
};
const menu = async (p: Page) => { await p.click(T('f09-menu')); await p.waitForTimeout(500); };
const row = async (p: Page, id: string) => { await p.locator(T(id)).scrollIntoViewIfNeeded(); await p.click(T(id)); await p.waitForTimeout(700); };

type S = { id: string; world: () => unknown; route: string; overlay: string; rates?: 'ok' | 'down'; currency?: string; open: (p: Page) => Promise<void> };
const S: S[] = [
  { id: '04-manage-pocket', world: () => f05World('approved'), route: 'money/places', overlay: 'd01-pocket-menu', open: async (p) => { await p.click('[data-testid="d01-directory"] [data-account-id="bank"]', { button: 'right' }); } },
  { id: '04-rename', world: () => deletableWorld(), route: 'money/places/long', overlay: 'd01-rename-pocket', open: async (p) => { await p.click(T('d01-manage')); await p.focus(T('d01-pocket-rename')); await p.keyboard.press('Enter'); } },
  { id: '04-delete-confirm', world: () => deletableWorld(), route: 'money/places/long', overlay: 'd01-delete-pocket', open: async (p) => { await p.click(T('d01-manage')); await p.focus(T('d01-pocket-delete')); await p.keyboard.press('Enter'); } },
  { id: '05-search-recent', world: () => dot01World(), route: 'money?parent=motion', overlay: 'global-search', open: async (p) => { await p.click(T('f05m-search')); } },
  ...[0, 4, 20].map((n) => ({ id: `05-search-${String(n).padStart(2, '0')}-results`, world: () => searchWorld(n), route: 'money?parent=motion', overlay: 'global-search', open: async (p: Page) => { await p.click(T('f05m-search')); await p.fill(T('search-input'), 'OPUS3'); await p.locator(T('search-input')).blur(); } })),
  { id: '05-search-keyboard', world: () => searchWorld(4), route: 'money?parent=motion', overlay: 'global-search', open: async (p) => { await p.click(T('f05m-search')); await p.fill(T('search-input'), 'OPUS3'); await keyboard(p, 'search-input'); } },
  { id: '08-menu', world: () => f05World('approved'), route: 'money?parent=motion', overlay: 'global-menu', open: menu },
  { id: '08-menu-final-item', world: () => f05World('approved'), route: 'money?parent=motion', overlay: 'global-menu', open: async (p) => { await menu(p); await p.locator(T('menu-sign-out')).scrollIntoViewIfNeeded(); await p.locator(T('menu-sign-out')).focus(); } },
  { id: 'CH01-buffer', world: () => f05World('approved'), route: 'today', overlay: 'global-buffer', rates: 'ok', open: async (p) => { await menu(p); await row(p, 'menu-buffer'); } },
  { id: 'CH01-buffer-keyboard', world: () => f05World('approved'), route: 'today', overlay: 'global-buffer', rates: 'ok', open: async (p) => { await menu(p); await row(p, 'menu-buffer'); await keyboard(p, 'buffer-input'); await p.keyboard.type('250'); } },
  { id: 'CH01-buffer-saved', world: () => f05World('approved'), route: 'today', overlay: 'global-buffer', rates: 'ok', open: async (p) => { await menu(p); await row(p, 'menu-buffer'); await p.fill(T('buffer-input'), '250'); await p.click(T('buffer-save')); } },
  { id: 'CH01-buffer-rate-unavailable', world: () => f05World('approved'), route: 'today', overlay: 'global-buffer', rates: 'down', currency: 'EUR', open: async (p) => { await menu(p); await row(p, 'menu-buffer'); } },
  { id: 'CH02-privacy', world: () => f05World('approved'), route: 'today', overlay: 'settings-consents-sheet', open: async (p) => { await menu(p); await row(p, 'menu-privacy'); } },
  { id: 'CH02-privacy-list-end', world: () => f05World('approved'), route: 'today', overlay: 'settings-consents-sheet', open: async (p) => { await menu(p); await row(p, 'menu-privacy'); await p.locator(T('privacy-tool-data-export')).scrollIntoViewIfNeeded(); } },
];
const MEASURE = `((overlay) => {
  const vw = innerWidth, vh = innerHeight, de = document.documentElement;
  const o = document.querySelector('[data-jrn-overlay="' + overlay + '"]') || document.querySelector('[data-testid="' + overlay + '"]');
  const scrollers = o ? [...o.querySelectorAll('*')].filter((e) => { const s = getComputedStyle(e).overflowY; return (s === 'auto' || s === 'scroll') && e.scrollHeight > e.clientHeight + 1; }).map((e) => (e.getAttribute('data-testid') || e.className || e.tagName).toString().slice(0, 40)) : [];
  return { open: !!o, page_scroll_y: de.scrollHeight > vh + 1, page_scroll_x: de.scrollWidth > vw + 1, art: o ? [...o.querySelectorAll('img[data-asset-id]')].map((e) => e.getAttribute('data-asset-id')) : [],
    overlay_asset: o?.getAttribute('data-overlay-asset') ?? null, scrolling_regions: scrollers, focus: document.activeElement?.closest('[data-jrn-trigger]')?.getAttribute('data-jrn-trigger') ?? null, viewport: [vw, vh] };
})`;

(async () => {
  mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const all: Record<string, unknown> = {};
  for (const vp of VPS) {
    const [w, h] = vp.split('x').map(Number);
    for (const s of S.filter((x) => !ONLY.length || ONLY.includes(x.id))) {
      const ctx = await b.newContext({ viewport: { width: w!, height: h! }, deviceScaleFactor: DSF, reducedMotion: 'reduce' });
      await ctx.route('https://open.er-api.com/**', (r) =>
        s.rates === 'down' ? r.fulfill({ status: 503, body: 'unavailable' }) : r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: 'success', base_code: 'USD', time_last_update_unix: Math.floor(Date.now() / 1000) - 3600, rates: { USD: 1, EUR: 0.92, GBP: 0.79 } }) }),
      );
      const bs = s.world() as { session: unknown; device: unknown; snapshot: unknown };
      await ctx.addInitScript(({ st, bs, currency }) => {
        if (sessionStorage.getItem('seeded')) return;
        localStorage.clear();
        localStorage.setItem(st.session, JSON.stringify(bs.session));
        localStorage.setItem(st.device, JSON.stringify(bs.device));
        localStorage.setItem(st.repositoryKey, JSON.stringify(bs.snapshot));
        if (currency) localStorage.setItem('jurnl.currency', currency); // no rate book: the display currency has no rate
        sessionStorage.setItem('seeded', '1');
        sessionStorage.setItem('jurnl.f05.parent', 'motion');
      }, { st: JURNL_E2E_STORAGE, bs: bs as never, currency: s.currency ?? null });
      const p = await ctx.newPage();
      const key = `${s.id}__${vp}`;
      let m: Record<string, unknown> = {};
      try {
        await p.goto(BASE + s.route, { waitUntil: 'networkidle' });
        await p.evaluate(() => document.fonts.ready);
        await p.waitForTimeout(500);
        await s.open(p);
        await p.waitForTimeout(700);
        m = (await p.evaluate(`${MEASURE}(${JSON.stringify(s.overlay)})`)) as Record<string, unknown>;
        await p.screenshot({ path: `${OUT}/${key}.png` });
      } catch (e) {
        m = { error: (e as Error).message.split('\n')[0] };
        await p.screenshot({ path: `${OUT}/${key}.png` }).catch(() => undefined);
      }
      all[key] = m;
      console.log(key, JSON.stringify(m).slice(0, 200));
      await ctx.close();
    }
  }
  writeFileSync(`${OUT}/measure.json`, JSON.stringify(all, null, 1));
  await b.close();
})();
