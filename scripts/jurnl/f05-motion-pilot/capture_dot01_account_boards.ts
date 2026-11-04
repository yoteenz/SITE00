/* Board-space capture of the account pages 02–05: a DSF screenshot plus the DOM rects (board px) of every live element.
 * Run: npx tsx scripts/jurnl/f05-motion-pilot/capture_dot01_account_boards.ts <out dir> 471x890  (env BASE, DSF, ONLY) */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { JURNL_E2E_STORAGE } from '../../../src/projects/jurnl/e2e/fixture';
import { f05World } from '../../../e2e/jurnl/helpers/jurnl-f05-world';
const OUT = process.argv[2]!;
const VP = (process.argv[3] ?? '471x836').split(',');
const DSF = Number(process.env.DSF ?? 2);
const BASE = process.env.BASE ?? 'http://127.0.0.1:5174/production/jurnl/runtime/';
const IDS = (process.env.ONLY ?? '02,03,04,05').split(',');
const ROUTE: Record<string, string> = { '02': 'money/places/bank', '03': 'money/places/ride', '04': 'money/places/cash', '05': 'money/places/visa' };
(async () => {
  mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const all: Record<string, unknown> = {};
  for (const vp of VP) {
    const [w, h] = vp.split('x').map(Number);
    for (const id of IDS) {
      const ctx = await b.newContext({ viewport: { width: w!, height: h! }, deviceScaleFactor: DSF, reducedMotion: 'reduce' });
      const bs = f05World('approved');
      await ctx.addInitScript(({ st, bs }) => { if (sessionStorage.getItem('seeded')) return; localStorage.clear(); localStorage.setItem(st.session, JSON.stringify(bs.session)); localStorage.setItem(st.device, JSON.stringify(bs.device)); localStorage.setItem(st.repositoryKey, JSON.stringify(bs.snapshot)); sessionStorage.setItem('seeded', '1'); sessionStorage.setItem('jurnl.f05.parent', 'motion'); }, { st: JURNL_E2E_STORAGE, bs: bs as never });
      const p = await ctx.newPage();
      await p.goto(BASE + ROUTE[id], { waitUntil: 'networkidle' });
      await p.waitForSelector('[data-jrn-f05-dot01-stage]');
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(700);
      const m = await p.evaluate(`(() => {
        var board = document.querySelector('.jrn-d01__board');
        var br = board.getBoundingClientRect();
        var u = br.width / 941;
        function r(e) { var q = e.getBoundingClientRect(); return [+((q.left - br.left) / u).toFixed(1), +((q.top - br.top) / u).toFixed(1), +(q.width / u).toFixed(1), +(q.height / u).toFixed(1)]; }
        function pick(sel) { return Array.from(document.querySelectorAll(sel)).map(function (e) { return { sel: sel, id: e.getAttribute('data-layer-id') || e.getAttribute('data-stat') || e.getAttribute('data-jrn-trigger') || String(e.className), text: (e.textContent || '').trim().slice(0, 40), rect: r(e), font: getComputedStyle(e).fontSize }; }); }
        return { u: u, board: [br.left, br.top, br.width, br.height], els: [].concat(pick('.jrn-d01__layer'), pick('.jrn-d01__on'), pick('.jrn-d01__stat'), pick('.jrn-d01__strip'), pick('.jrn-d01__title'), pick('.jrn-d01__chip')) };
      })()`);
      await p.screenshot({ path: `${OUT}/${id}-${vp}.png` });
      all[`${id}-${vp}`] = m;
      console.log(id, vp, (m as any).u.toFixed(4));
      await ctx.close();
    }
  }
  writeFileSync(`${OUT}/rects.json`, JSON.stringify(all, null, 1));
  await b.close();
})();
