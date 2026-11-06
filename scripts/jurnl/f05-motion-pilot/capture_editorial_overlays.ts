/* JURNL editorial overlays (founder board, eight compositions): open each real overlay over its real page with synthetic
 * worlds, screenshot it and measure it (page scroll, off-screen controls, primary action / close reachability).
 * Run: npx tsx scripts/jurnl/f05-motion-pilot/capture_editorial_overlays.ts <out> [w x h,...]  (env BASE, DSF, ONLY) */
import { chromium, type Page } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { JURNL_E2E_STORAGE } from '../../../src/projects/jurnl/e2e/fixture';
import { dot01World } from '../../../e2e/jurnl/helpers/jurnl-dot01-world';
import { f05World } from '../../../e2e/jurnl/helpers/jurnl-f05-world';

const OUT = process.argv[2]!;
const VPS = (process.argv[3] ?? '393x852,393x660').split(',');
const DSF = Number(process.env.DSF ?? 2);
const BASE = process.env.BASE ?? 'http://127.0.0.1:5174/production/jurnl/runtime/';
const ONLY = (process.env.ONLY ?? '').split(',').filter(Boolean);
const T = (id: string) => `[data-jrn-trigger="${id}"]`;
type S = { id: string; name: string; world: () => unknown; route: string; open: (p: Page) => Promise<void>; overlay: string; primary?: string };
const S: S[] = [
  { id: '01', name: 'MONEY ACTION SHEET', world: () => f05World('approved'), route: 'money?parent=motion', open: async (p) => { await p.click(T('f05m-actions')); }, overlay: 'f05m-actions-sheet', primary: 'f05m-actions-add' },
  { id: '02', name: 'ADD A POCKET', world: () => f05World('approved'), route: 'money?parent=motion', open: async (p) => { await p.click(T('f05m-actions')); await p.click(T('f05m-actions-add')); }, overlay: 'money-add-place', primary: 'money-add-save' },
  { id: '03', name: 'MOVE MONEY', world: () => f05World('approved'), route: 'money?parent=motion', open: async (p) => { await p.click(T('f05m-actions')); await p.click(T('f05m-actions-move')); }, overlay: 'transfer-sheet', primary: 'transfer-save' },
  { id: '04', name: 'MANAGE POCKET', world: () => f05World('approved'), route: 'money/places', open: async (p) => { await p.click('[data-testid="d01-directory"] [data-account-id="bank"]', { button: 'right' }); }, overlay: 'd01-pocket-menu', primary: 'd01-pocket-rename' },
  { id: '05', name: 'SEARCH DRAWER', world: () => dot01World(), route: 'money?parent=motion', open: async (p) => { await p.click(T('f05m-search')); }, overlay: 'global-search', primary: 'search-input' },
  { id: '06', name: 'ACCOUNT / SETTINGS', world: () => f05World('approved'), route: 'today', open: async (p) => { await p.click(T('f09-menu')); await p.click(T('menu-account')); }, overlay: 'account-drawer', primary: 'account-drawer-close' },
  { id: '07', name: 'ARCHIVE BLOCKED', world: () => dot01World(), route: 'money/places/bank/settings', open: async (p) => { await p.click(T('d01-archive')); }, overlay: 'd01-archive-blocked', primary: 'd01-blocker-details' },
  { id: '08', name: 'GLOBAL MENU', world: () => f05World('approved'), route: 'money?parent=motion', open: async (p) => { await p.click(T('f09-menu')); }, overlay: 'global-menu', primary: 'menu-sign-out' },
];
const MEASURE = `((overlay, primary) => {
  const vw = innerWidth, vh = innerHeight, de = document.documentElement;
  const o = document.querySelector('[data-jrn-overlay="' + overlay + '"]') || document.querySelector('[data-testid="' + overlay + '"]');
  const inView = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width > 0 && r.top >= -1 && r.bottom <= vh + 1 && r.left >= -1 && r.right <= vw + 1; };
  const scroller = (el) => { for (let e = el.parentElement; e; e = e.parentElement) { const cs = getComputedStyle(e); if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll' || cs.overflowX === 'auto') && (e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1)) return e; } return null; };
  const ctrls = o ? [...o.querySelectorAll('button, input, select, textarea, a[href]')].filter((e) => e.offsetParent !== null) : [];
  const off = ctrls.filter((e) => !inView(e) && !scroller(e)).map((e) => e.getAttribute('data-jrn-trigger') || e.getAttribute('aria-label') || e.tagName);
  const p = primary ? document.querySelector('[data-jrn-trigger="' + primary + '"]') : null;
  const close = o ? o.querySelector('[data-jrn-trigger$="-close"]') : null;
  const fr = o ? (o.querySelector('[role="dialog"], [role="menu"], .jed-folio') || o).getBoundingClientRect() : null;
  return { open: !!o, page_scroll_y: de.scrollHeight > vh + 1, page_scroll_x: de.scrollWidth > vw + 1, off, primary_in_view: inView(p), primary_found: !!p, close_in_view: inView(close),
    folio: fr ? [Math.round(fr.left), Math.round(fr.top), Math.round(fr.width), Math.round(fr.height)] : null, focus_inside: !!(o && o.contains(document.activeElement)) };
})`;
(async () => {
  mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const all: Record<string, unknown> = {};
  for (const s of S) {
    if (ONLY.length && !ONLY.includes(s.id)) continue;
    for (const vp of VPS) {
      const [w, h] = vp.split('x').map(Number);
      const ctx = await b.newContext({ viewport: { width: w!, height: h! }, deviceScaleFactor: DSF, reducedMotion: 'reduce' });
      const bs = s.world() as { session: unknown; device: unknown; snapshot: unknown };
      await ctx.addInitScript(({ st, bs }) => { if (sessionStorage.getItem('seeded')) return; localStorage.clear(); localStorage.setItem(st.session, JSON.stringify(bs.session)); localStorage.setItem(st.device, JSON.stringify(bs.device)); localStorage.setItem(st.repositoryKey, JSON.stringify(bs.snapshot)); sessionStorage.setItem('seeded', '1'); sessionStorage.setItem('jurnl.f05.parent', 'motion'); }, { st: JURNL_E2E_STORAGE, bs: bs as never });
      const p = await ctx.newPage();
      let m: unknown = null;
      try {
        await p.goto(BASE + s.route, { waitUntil: 'networkidle' });
        await p.evaluate(() => document.fonts.ready);
        await p.waitForTimeout(500);
        await s.open(p);
        await p.waitForTimeout(700);
        m = await p.evaluate(`${MEASURE}(${JSON.stringify(s.overlay)}, ${JSON.stringify(s.primary ?? null)})`);
        await p.screenshot({ path: `${OUT}/${s.id}-${vp}.png` });
      } catch (e) { m = { error: (e as Error).message.split('\n')[0] }; await p.screenshot({ path: `${OUT}/${s.id}-${vp}.png` }).catch(() => undefined); }
      all[`${s.id}-${vp}`] = { name: s.name, ...(m as object) };
      console.log(s.id, vp, JSON.stringify(m).slice(0, 200));
      await ctx.close();
    }
  }
  writeFileSync(`${OUT}/measure.json`, JSON.stringify(all, null, 1));
  await b.close();
})();
