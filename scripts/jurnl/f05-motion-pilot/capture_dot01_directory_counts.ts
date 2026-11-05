/* F05 DOT 01 — ALL ACCOUNTS (06) with 0, 1, 2, 3, 4, 5 and 7 real (synthetic) Pockets: screenshots + board-space rects.
 * Nothing is invented: each world is the first N records of the synthetic `many` world (BANK · RIDESHARE · CASH ·
 * CREDIT · SAVINGS · LONG NAME CHECKING · LOAN).
 * Run: npx tsx scripts/jurnl/f05-motion-pilot/capture_dot01_directory_counts.ts <out dir> [w x h,...]  (env BASE, DSF, COUNTS) */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { JURNL_E2E_STORAGE } from '../../../src/projects/jurnl/e2e/fixture';
import { f05World } from '../../../e2e/jurnl/helpers/jurnl-f05-world';

const OUT = process.argv[2]!;
const VPS = (process.argv[3] ?? '471x836,393x852,393x660').split(',');
const DSF = Number(process.env.DSF ?? 2);
const BASE = process.env.BASE ?? 'http://127.0.0.1:5174/production/jurnl/runtime/';
const COUNTS = (process.env.COUNTS ?? '0,1,2,3,4,5,7').split(',').map(Number);
const RECTS = `(() => {
  const vw = innerWidth, vh = innerHeight, de = document.documentElement;
  const board = document.querySelector('.jrn-d01__board');
  const br = board.getBoundingClientRect();
  const u = br.width / 941;
  const r = (e) => { const q = e.getBoundingClientRect(); return [+((q.left - br.left) / u).toFixed(1), +((q.top - br.top) / u).toFixed(1), +(q.width / u).toFixed(1), +(q.height / u).toFixed(1)]; };
  const pick = (sel) => [...document.querySelectorAll(sel)].map((e) => ({ sel, id: e.getAttribute('data-layer-id') || e.getAttribute('data-jrn-trigger') || String(e.className).slice(0, 40), rect: r(e) }));
  const grid = document.querySelector('[data-testid="d01-directory"] [role="list"]');
  return {
    u, page_scroll_y: de.scrollHeight > vh + 1, page_scroll_x: de.scrollWidth > vw + 1,
    grid_scrolls: grid ? grid.scrollHeight > grid.clientHeight + 1 : null,
    els: [].concat(pick('.jrn-d01__layer'), pick('[data-jrn-trigger^="d01-place-"]'), pick('[data-jrn-trigger="d01-add-account"]'), pick('[data-jrn-trigger="d01-reorder"]'), pick('.jrn-nav'), pick('[data-testid="d01-empty-accounts"]')),
  };
})()`;
(async () => {
  mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const all: Record<string, unknown> = {};
  for (const n of COUNTS) {
    const world = f05World('many');
    const accounts = world.snapshot.accounts.slice(0, n);
    const ids = new Set(accounts.map((a) => a.account_id));
    const bs = { ...world, snapshot: { ...world.snapshot, accounts, creditAttributes: world.snapshot.creditAttributes.filter((c: { account_id: string }) => ids.has(c.account_id)) } };
    for (const vp of VPS) {
      const [w, h] = vp.split('x').map(Number);
      const ctx = await b.newContext({ viewport: { width: w!, height: h! }, deviceScaleFactor: DSF, reducedMotion: 'reduce' });
      await ctx.addInitScript(({ st, bs }) => { if (sessionStorage.getItem('seeded')) return; localStorage.clear(); localStorage.setItem(st.session, JSON.stringify(bs.session)); localStorage.setItem(st.device, JSON.stringify(bs.device)); localStorage.setItem(st.repositoryKey, JSON.stringify(bs.snapshot)); sessionStorage.setItem('seeded', '1'); sessionStorage.setItem('jurnl.f05.parent', 'motion'); }, { st: JURNL_E2E_STORAGE, bs: bs as never });
      const p = await ctx.newPage();
      await p.goto(BASE + 'money/places', { waitUntil: 'networkidle' });
      await p.waitForSelector('[data-jrn-f05-dot01-stage]');
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(600);
      const m = await p.evaluate(RECTS);
      await p.screenshot({ path: `${OUT}/06-n${n}-${vp}.png` });
      all[`n${n}-${vp}`] = m;
      console.log(n, vp, JSON.stringify({ py: (m as { page_scroll_y: boolean }).page_scroll_y, grid: (m as { grid_scrolls: boolean }).grid_scrolls }));
      await ctx.close();
    }
  }
  writeFileSync(`${OUT}/rects.json`, JSON.stringify(all, null, 1));
  await b.close();
})();
