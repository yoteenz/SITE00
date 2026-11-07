/* JURNL global menu: open the hamburger over a real page with a synthetic world, then open every menu row and screenshot
 * its destination; measure page scroll, the contained list scroll and whether each row is reachable.
 * Run: npx tsx scripts/jurnl/global-menu/capture_menu_destinations.ts <out> [w x h,...]  (env BASE, DSF, ROWS) */
import { chromium, type Page } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { JURNL_E2E_STORAGE } from '../../../src/projects/jurnl/e2e/fixture';
import { f05World } from '../../../e2e/jurnl/helpers/jurnl-f05-world';

const OUT = process.argv[2]!;
const VPS = (process.argv[3] ?? '393x852').split(',');
const DSF = Number(process.env.DSF ?? 2);
const BASE = process.env.BASE ?? 'http://127.0.0.1:5174/production/jurnl/runtime/';
const ROWS = (process.env.ROWS ?? 'menu-connections,menu-currency,menu-buffer,menu-ask,menu-rules,menu-account,menu-preferences,menu-privacy,menu-membership,menu-add-ons,menu-help,menu-sign-out').split(',');
const T = (id: string) => `[data-jrn-trigger="${id}"]`;
const MEASURE = `(() => {
  const vw = innerWidth, vh = innerHeight, de = document.documentElement;
  const m = document.querySelector('[data-jrn-overlay="global-menu"]');
  const port = m && (m.querySelector('[data-jrn-menu-scrollport]') || m.querySelector('.jv3-drawer__body'));
  const rows = m ? [...m.querySelectorAll('[data-jrn-trigger^="menu-"]')].map((e) => e.getAttribute('data-jrn-trigger')) : [];
  return { open: !!m, page_scroll_y: de.scrollHeight > vh + 1, page_scroll_x: de.scrollWidth > vw + 1, rows,
    port: port ? { h: port.clientHeight, sh: port.scrollHeight, scrolls: port.scrollHeight > port.clientHeight + 1 } : null,
    overlays: [...document.querySelectorAll('[data-jrn-overlay]')].map((e) => e.getAttribute('data-jrn-overlay')), url: location.pathname };
})()`;
async function reveal(p: Page, id: string) { const el = p.locator(T(id)).first(); if (!(await el.count())) return false; await el.scrollIntoViewIfNeeded(); return true; }
(async () => {
  mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const all: Record<string, unknown> = {};
  for (const vp of VPS) {
    const [w, h] = vp.split('x').map(Number);
    for (const row of ['(menu)', ...ROWS]) {
      const ctx = await b.newContext({ viewport: { width: w!, height: h! }, deviceScaleFactor: DSF, reducedMotion: 'reduce' });
      const bs = f05World('approved') as { session: unknown; device: unknown; snapshot: unknown };
      await ctx.addInitScript(({ st, bs }) => { if (sessionStorage.getItem('seeded')) return; localStorage.clear(); localStorage.setItem(st.session, JSON.stringify(bs.session)); localStorage.setItem(st.device, JSON.stringify(bs.device)); localStorage.setItem(st.repositoryKey, JSON.stringify(bs.snapshot)); sessionStorage.setItem('seeded', '1'); sessionStorage.setItem('jurnl.f05.parent', 'motion'); }, { st: JURNL_E2E_STORAGE, bs: bs as never });
      const p = await ctx.newPage();
      const key = `${vp}-${row.replace(/[()]/g, '')}`;
      let m: Record<string, unknown> = {};
      try {
        await p.goto(BASE + 'today', { waitUntil: 'networkidle' });
        await p.evaluate(() => document.fonts.ready);
        await p.waitForTimeout(400);
        await p.click(T('f09-menu'));
        await p.waitForTimeout(500);
        const menu = (await p.evaluate(MEASURE)) as Record<string, unknown>;
        if (row !== '(menu)') {
          if (!(await reveal(p, row))) m = { missing: true, menu };
          else { await p.click(T(row)); await p.waitForTimeout(700); m = { menu, after: await p.evaluate(MEASURE) }; }
        } else m = menu;
        await p.screenshot({ path: `${OUT}/${key}.png` });
      } catch (e) { m = { error: (e as Error).message.split('\n')[0] }; await p.screenshot({ path: `${OUT}/${key}.png` }).catch(() => undefined); }
      all[key] = m;
      console.log(key, JSON.stringify(m).slice(0, 220));
      await ctx.close();
    }
  }
  writeFileSync(`${OUT}/measure.json`, JSON.stringify(all, null, 1));
  await b.close();
})();
