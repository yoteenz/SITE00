import { chromium } from 'playwright';
import { JURNL_E2E_STORAGE } from '/home/user/SITE00/src/projects/jurnl/e2e/fixture';
import { dot01World } from '/home/user/SITE00/e2e/jurnl/helpers/jurnl-dot01-world';
const OUT = process.argv[2]!;
const VP = (process.argv[3] ?? '393x852').split(',');
const BASE = process.env.BASE ?? 'http://127.0.0.1:5174/production/jurnl/runtime/';
const T = (id: string) => `[data-jrn-trigger="${id}"]`;
const STEPS: [string, string, (p: any) => Promise<void>, string][] = [
  ['fragment', 'money/places/bank', async (p) => { await p.click(T('d01-manage')); }, '[data-testid="d01-pocket-menu"]'],
  ['caution', 'money/places/bank', async (p) => { await p.click(T('d01-manage')); await p.click(T('d01-pocket-delete')); }, '[data-jrn-overlay="d01-delete-blocked"]'],
  ['archive-blocked', 'money/places/bank/settings', async (p) => { await p.click(T('d01-archive')); }, '[data-jrn-overlay="d01-archive-blocked"]'],
  ['transfer', 'money/places/bank', async (p) => { await p.click(T('d01-strip-move')); }, '[data-jrn-overlay="transfer-sheet"]'],
  ['menu', 'today', async (p) => { await p.click(T('f09-menu')); }, '[data-jrn-overlay="global-menu"]'],
  ['consents', 'today', async (p) => { await p.click(T('f09-menu')); await p.click(T('menu-privacy')); }, '[data-jrn-overlay="settings-consents-sheet"]'],
  ['preferences', 'today', async (p) => { await p.click(T('f09-menu')); await p.click(T('menu-preferences')); }, '[data-jrn-overlay="account-drawer"]'],
  ['membership', 'today', async (p) => { await p.click(T('f09-menu')); await p.click(T('menu-membership')); }, '[data-jrn-overlay="global-membership"]'],
  ['addons', 'today', async (p) => { await p.click(T('f09-menu')); await p.click(T('menu-add-ons')); }, '[data-jrn-overlay="global-add-ons"]'],
  ['unlock', 'today', async (p) => { await p.click(T('f09-menu')); await p.click(T('menu-add-ons')); await p.click(T('add-on-jurnl_add_on_travel')); }, '[data-jrn-overlay="global-unlock"]'],
];
const ONLY = (process.env.ONLY ?? '').split(',').filter(Boolean);
const METRICS = `(() => {
  const vw = innerWidth, vh = innerHeight, de = document.documentElement;
  const scope = [...document.querySelectorAll('[data-jrn-overlay], [data-testid="d01-pocket-menu"]')].pop() || document;
  function scroller(el) { for (let e = el.parentElement; e; e = e.parentElement) { const cs = getComputedStyle(e); if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && e.scrollHeight > e.clientHeight + 1) return e; } return null; }
  const ctrls = [...scope.querySelectorAll('button, a[href], input, select, textarea')].filter((e) => e.offsetParent !== null);
  const off = [];
  for (const e of ctrls) { const r = e.getBoundingClientRect(); if (r.width === 0) continue; if ((r.bottom > vh + 1 || r.top < -1 || r.right > vw + 1 || r.left < -1) && !scroller(e)) off.push(e.getAttribute('data-jrn-trigger') || e.tagName); }
  const small = ctrls.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 24 || r.width < 24); }).map((e) => e.getAttribute('data-jrn-trigger') || e.tagName);
  const lower = [...scope.querySelectorAll('*')].filter((e) => e.children.length === 0 && e.textContent && /[a-z]/.test(e.textContent) && getComputedStyle(e).textTransform !== 'uppercase' && !/Script|cursive/.test(getComputedStyle(e).fontFamily)).map((e) => e.textContent.trim().slice(0, 30));
  return { pageY: de.scrollHeight > vh + 1, pageX: de.scrollWidth > vw + 1, off, small, lowerNonScript: lower.slice(0, 5), focus: document.activeElement && (document.activeElement.getAttribute('data-jrn-trigger') || document.activeElement.tagName) };
})()`;
(async () => {
  const b = await chromium.launch();
  const rows: unknown[] = [];
  for (const [id, route, steps, wait] of STEPS) {
    if (ONLY.length && !ONLY.includes(id)) continue;
    const [w0, h0] = VP[0]!.split('x').map(Number);
    const ctx = await b.newContext({ viewport: { width: w0!, height: h0! }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
    const bs = dot01World();
    await ctx.addInitScript(({ st, bs }) => { if (sessionStorage.getItem('seeded')) return; localStorage.clear(); localStorage.setItem(st.session, JSON.stringify(bs.session)); localStorage.setItem(st.device, JSON.stringify(bs.device)); localStorage.setItem(st.repositoryKey, JSON.stringify(bs.snapshot)); sessionStorage.setItem('seeded', '1'); sessionStorage.setItem('jurnl.f05.parent', 'motion'); }, { st: JURNL_E2E_STORAGE, bs: bs as never });
    const p = await ctx.newPage();
    await p.goto(BASE + route, { waitUntil: 'networkidle' });
    await p.waitForTimeout(500);
    await steps(p);
    await p.waitForSelector(wait);
    for (const vp of VP) {
      const [w, h] = vp.split('x').map(Number);
      await p.setViewportSize({ width: w!, height: h! });
      await p.waitForTimeout(350);
      const m = await p.evaluate(METRICS);
      if (vp === VP[0] || process.env.ALLSHOTS) await p.screenshot({ path: `${OUT}/${id}-${vp}.png` });
      rows.push({ id, vp, ...(m as object) });
      console.log(id, vp, JSON.stringify(m));
    }
    await ctx.close();
  }
  require('node:fs').writeFileSync(`${OUT}/surfaces.json`, JSON.stringify(rows, null, 1));
  await b.close();
})();
