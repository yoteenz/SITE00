/* P0.JURNL.F05-MONEY.CANONICAL-UTILITY-ICON-FAMILY-INTEGRATION.OPUS1 — runtime screenshots of every target, on any server
 * (BASE env): run against the previous head for BEFORE and against this branch for AFTER. Reduced motion, so a frame is the
 * settled composition (no entrance or ambient light caught mid-way). Each state records, per utility control: its trigger,
 * whether the founder artwork is mounted and loaded, the button box, the visible disc (image box x 0.8065), how many line
 * glyphs remain inside it, the probed touch target (elementFromPoint around the centre) and page scroll.
 * Run: npx tsx scripts/jurnl/utility-icons/capture_utility_states.ts <out> */
import { chromium, type Browser, type Page } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { JURNL_E2E_STORAGE } from '../../../src/projects/jurnl/e2e/fixture';
import { f05World } from '../../../e2e/jurnl/helpers/jurnl-f05-world';

const OUT = process.argv[2]!;
const BASE = process.env.BASE ?? 'http://127.0.0.1:5174/production/jurnl/runtime/';
const T = (id: string) => `[data-jrn-trigger="${id}"]`;

async function newPage(b: Browser, vp: [number, number]): Promise<Page> {
  const ctx = await b.newContext({ viewport: { width: vp[0], height: vp[1] }, deviceScaleFactor: 3, isMobile: vp[0] < 600, hasTouch: vp[0] < 600, reducedMotion: 'reduce' });
  await ctx.route('https://open.er-api.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: 'success', base_code: 'USD', time_last_update_unix: Math.floor(Date.now() / 1000) - 3600, rates: { USD: 1, EUR: 0.92 } }) }));
  const bs = f05World('approved') as unknown as { session: unknown; device: unknown; snapshot: unknown };
  await ctx.addInitScript(({ st, bs }) => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.clear();
    localStorage.setItem(st.session, JSON.stringify(bs.session));
    localStorage.setItem(st.device, JSON.stringify(bs.device));
    localStorage.setItem(st.repositoryKey, JSON.stringify(bs.snapshot));
    sessionStorage.setItem('seeded', '1');
    sessionStorage.setItem('jurnl.f05.parent', 'motion');
  }, { st: JURNL_E2E_STORAGE, bs });
  const p = await ctx.newPage();
  await p.goto(`${BASE}money?parent=motion`);
  await p.locator('[data-jrn-f05-stage]').waitFor({ state: 'attached', timeout: 30_000 });
  await p.waitForTimeout(1200);
  return p;
}

/** One record per utility control on screen (string evaluate: no compiler helpers in the page). */
const FACTS = `(() => {
  const ids = ['f05m-search', 'f05m-actions', 'f09-menu', 'global-menu-close', 'global-search-close', 'global-buffer-close', 'settings-consents-sheet-close', 'money-add-place-close', 'transfer-sheet-close', 'f05m-actions-sheet-close'];
  const out = [];
  for (const id of ids) {
    for (const el of document.querySelectorAll('[data-jrn-trigger="' + id + '"]')) {
      if (el.closest('.jm-ghost')) continue;
      const b = el.getBoundingClientRect();
      if (!b.width) continue;
      const img = el.querySelector('img.jrn-uab__art');
      const ib = img ? img.getBoundingClientRect() : null;
      const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      const hits = (dx, dy) => { const h = document.elementFromPoint(cx + dx, cy + dy); return !!h && (h === el || el.contains(h)); };
      let up = 0, down = 0, left = 0, right = 0;
      for (let d = 0; d <= 40; d += 0.5) { if (hits(0, -d)) up = d; else break; }
      for (let d = 0; d <= 40; d += 0.5) { if (hits(0, d)) down = d; else break; }
      for (let d = 0; d <= 40; d += 0.5) { if (hits(-d, 0)) left = d; else break; }
      for (let d = 0; d <= 40; d += 0.5) { if (hits(d, 0)) right = d; else break; }
      out.push({ trigger: id, label: el.getAttribute('aria-label'), art: img ? img.getAttribute('data-asset-id') : null, artLoaded: img ? img.complete && img.naturalWidth > 0 : null,
        imgAlt: img ? img.getAttribute('alt') : null, imgAriaHidden: img ? img.getAttribute('aria-hidden') : null,
        box: [Math.round(b.left * 10) / 10, Math.round(b.top * 10) / 10, Math.round(b.width * 10) / 10, Math.round(b.height * 10) / 10],
        disc: ib ? Math.round(ib.width * 0.8065 * 10) / 10 : null, lineGlyphs: el.querySelectorAll('svg').length, utilityImgs: el.querySelectorAll('img').length,
        target: { w: Math.round((left + right) * 10) / 10, h: Math.round((up + down) * 10) / 10 },
        style: (() => { const cs = getComputedStyle(el); return { border: cs.borderTopWidth, background: cs.backgroundColor, boxShadow: cs.boxShadow, radius: cs.borderTopLeftRadius }; })() });
    }
  }
  return { controls: out, pageScroll: { y: document.documentElement.scrollHeight > innerHeight + 1, x: document.documentElement.scrollWidth > innerWidth + 1 }, viewport: [innerWidth, innerHeight] };
})()`;

type S = { id: string; vp: [number, number]; open?: (p: Page) => Promise<void>; clipTop?: boolean };
const menu = async (p: Page) => { await p.locator(T('f09-menu')).first().click(); await p.waitForTimeout(700); };
const S: S[] = [
  { id: '01-02_MONEY_PARENT_393x852', vp: [393, 852] },
  { id: '03_TOP_UTILITY_CONTROLS_393x852', vp: [393, 852], clipTop: true },
  { id: '04_GLOBAL_MENU_393x852', vp: [393, 852], open: menu },
  { id: '05_ADD_A_POCKET_393x852', vp: [393, 852], open: async (p) => { await p.locator(T('f05m-actions')).click(); await p.waitForTimeout(500); await p.locator(T('f05m-actions-add')).click(); await p.waitForTimeout(700); } },
  { id: '06_MOVE_MONEY_393x852', vp: [393, 852], open: async (p) => { await p.locator(T('f05m-actions')).click(); await p.waitForTimeout(500); await p.locator(T('f05m-actions-move')).click(); await p.waitForTimeout(700); } },
  { id: '07_PRIVACY_CONSENTS_393x852', vp: [393, 852], open: async (p) => { await menu(p); await p.locator(T('menu-privacy')).scrollIntoViewIfNeeded(); await p.locator(T('menu-privacy')).click(); await p.waitForTimeout(700); } },
  { id: '07b_SAFE_TO_SPEND_BUFFER_393x852', vp: [393, 852], open: async (p) => { await menu(p); await p.locator(T('menu-buffer')).click(); await p.waitForTimeout(700); } },
  { id: '08_SEARCH_393x852', vp: [393, 852], open: async (p) => { await p.locator(T('f05m-search')).click(); await p.waitForTimeout(700); } },
  { id: '08b_MONEY_ACTION_393x852', vp: [393, 852], open: async (p) => { await p.locator(T('f05m-actions')).click(); await p.waitForTimeout(700); } },
  { id: '09_SHORT_MOBILE_360x640', vp: [360, 640] },
  { id: '09_SHORT_MOBILE_360x640_TOP', vp: [360, 640], clipTop: true },
  { id: '09_SHORT_MOBILE_393x660', vp: [393, 660] },
  { id: '09_SHORT_MOBILE_393x660_SEARCH', vp: [393, 660], open: async (p) => { await p.locator(T('f05m-search')).click(); await p.waitForTimeout(700); } },
  { id: '09_MOBILE_430x932', vp: [430, 932] },
  { id: '10_TABLET_820x1180', vp: [820, 1180] },
  { id: '10_TABLET_820x1180_MENU', vp: [820, 1180], open: menu },
  { id: '10_DESKTOP_1440x900', vp: [1440, 900] },
  { id: '10_DESKTOP_1440x900_BUFFER', vp: [1440, 900], open: async (p) => { await menu(p); await p.locator(T('menu-buffer')).click(); await p.waitForTimeout(700); } },
];

(async () => {
  mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const all: Record<string, unknown> = {};
  for (const s of S) {
    const p = await newPage(b, s.vp);
    try {
      if (s.open) await s.open(p);
      const f = (await p.evaluate(FACTS)) as { controls: { box: number[] }[] };
      all[s.id] = f;
      if (s.clipTop) {
        const xs = f.controls.filter((c) => ['f05m-search', 'f05m-actions', 'f09-menu'].includes((c as unknown as { trigger: string }).trigger)).map((c) => c.box);
        const x0 = Math.max(0, Math.min(...xs.map((r) => r[0]!)) - 24);
        const y1 = Math.max(...xs.map((r) => r[1]! + r[3]!)) + 20;
        await p.screenshot({ path: join(OUT, `${s.id}.png`), clip: { x: x0, y: 0, width: s.vp[0] - x0, height: y1 } });
      } else {
        await p.screenshot({ path: join(OUT, `${s.id}.png`) });
      }
    } catch (e) {
      all[s.id] = { error: String(e).slice(0, 300) };
    }
    console.log(s.id, JSON.stringify(all[s.id]).slice(0, 200));
    await p.context().close();
  }
  writeFileSync(join(OUT, 'states.json'), JSON.stringify({ base: BASE, states: all }, null, 1));
  await b.close();
})();
