/* Read-only OPUS3B probe: long and dynamic content on the DOT 01 papers. A long pocket name (NEIGHBOURHOOD CREDIT UNION
 * EVERYDAY CHECKING), a large and a negative figure, a zero, and an "open keyboard" (the viewport shortened to 393 x 480
 * with a field focused): records every text run that leaves its paper, every control that cannot be reached, page scroll.
 * Run: npx tsx scripts/jurnl/f05-motion-pilot/probe_dot01_long_content.ts <out dir>   (env BASE) */
import { chromium, type Page } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { JURNL_E2E_STORAGE } from '../../../src/projects/jurnl/e2e/fixture';
import { f05World } from '../../../e2e/jurnl/helpers/jurnl-f05-world';

const OUT = process.argv[2]!;
const BASE = process.env.BASE ?? 'http://127.0.0.1:5174/production/jurnl/runtime/';
const T = (id: string) => `[data-jrn-trigger="${id}"]`;
// the long pocket also holds a large figure; the rideshare pocket a negative one (owed), the cash pocket zero
const world = () => {
  const m = f05World('many');
  return { ...m, snapshot: { ...m.snapshot, accounts: m.snapshot.accounts.map((a) => (a.account_id === 'long' ? { ...a, balance: 1234567.89, available_balance: 1234567.89 } : a.account_id === 'cash' ? { ...a, balance: 0, available_balance: 0 } : a)) } };
};
type C = { id: string; route: string; steps?: (p: Page) => Promise<void>; wait?: string; vp: [number, number]; focus?: string };
const CASES: C[] = [
  { id: 'L02-long-pocket-page', route: 'money/places/long', vp: [393, 852] },
  { id: 'L02-long-pocket-page-360', route: 'money/places/long', vp: [360, 780] },
  { id: 'L06-directory-many', route: 'money/places', vp: [393, 852], wait: '[data-testid="d01-directory"]' },
  { id: 'L12-long-settings', route: 'money/places/long/settings', vp: [393, 852] },
  { id: 'L15-rename-long', route: 'money/places/long/settings', steps: async (p) => { await p.click(T('d01-rename')); }, wait: '[data-jrn-overlay="d01-edit-account"]', vp: [393, 852] },
  { id: 'L16-record-long-account', route: 'money/places/long/history', steps: async (p) => { await p.click(T('d01-record')); await p.fill(T('d01-merchant'), 'THE VERY LONG NAMED NEIGHBOURHOOD BAKERY AND CAFE'); await p.fill(T('d01-amount'), '123456.78'); }, wait: '[data-jrn-overlay="d01-record"]', vp: [393, 852] },
  { id: 'L16-record-keyboard', route: 'money/places/long/history', steps: async (p) => { await p.click(T('d01-record')); }, wait: '[data-jrn-overlay="d01-record"]', vp: [393, 480], focus: 'd01-amount' },
  { id: 'L16-record-error', route: 'money/places/long/history', steps: async (p) => { await p.click(T('d01-record')); await p.click(T('d01-review-save')); }, wait: '[data-jrn-overlay="d01-record"]', vp: [393, 852] },
  { id: 'L07-history-long', route: 'money/places/long/history', vp: [393, 852] },
];
const SCAN = `(() => {
  const root = document.querySelector('[data-jrn-overlay]') || document;
  const PAPER = '.d01-field, .jrn-d01__strip, .d01-btn, .d01-chipbtn, .jrn-d01__chip, .d01-paper, .jrn-d01__heading, .d01-dir__action, .d01-dir__paper, .d01-row, .d01-scanblock, button';
  const leaks = [];
  const walker = document.createTreeWalker(root === document ? document.body : root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement; if (!el || el.closest('.d01-sr, [aria-hidden=true], script, style')) continue;
    if (el.offsetParent === null || getComputedStyle(el).visibility === 'hidden') continue;
    const rg = document.createRange(); rg.selectNodeContents(n); const t = rg.getBoundingClientRect();
    if (t.width < 1) continue;
    const paper = el.closest(PAPER); if (!paper) continue;
    let clip = null; for (let a = el; a && a !== paper.parentElement; a = a.parentElement) { if (getComputedStyle(a).overflow !== 'visible') { clip = a; break; } }
    const box = (clip || paper).getBoundingClientRect();
    if (t.left < box.left - 1 || t.right > box.right + 1 || t.top < box.top - 2 || t.bottom > box.bottom + 2) leaks.push({ text: n.textContent.trim().slice(0, 40), in: paper.getAttribute('data-jrn-trigger') || paper.className.split(' ')[0] });
  }
  const ellipsis = [...root.querySelectorAll('*')].filter((e) => e.offsetParent !== null && getComputedStyle(e).textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth + 1).map((e) => ({ text: (e.textContent || '').trim().slice(0, 40), title: e.getAttribute('title'), label: e.closest('[aria-label]')?.getAttribute('aria-label')?.slice(0, 60) }));
  function scroller(el) { for (let e = el.parentElement; e; e = e.parentElement) { const cs = getComputedStyle(e); if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && e.scrollHeight > e.clientHeight + 1) return e; } return null; }
  const off = [...root.querySelectorAll('button, input, select, textarea, a[href]')].filter((e) => e.offsetParent !== null).filter((e) => { const r = e.getBoundingClientRect(); return (r.bottom > innerHeight + 1 || r.top < -1) && !scroller(e); }).map((e) => e.getAttribute('data-jrn-trigger') || e.tagName);
  const de = document.documentElement;
  return { leaks, ellipsis, unreachable: off, page_scroll: de.scrollHeight > innerHeight + 1 || de.scrollWidth > innerWidth + 1, active: document.activeElement && document.activeElement.getAttribute('data-jrn-trigger') };
})()`;
(async () => {
  mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const rows: unknown[] = [];
  for (const c of CASES) {
    const ctx = await b.newContext({ viewport: { width: c.vp[0], height: c.vp[1] }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const bs = world();
    await ctx.addInitScript(({ st, bs }) => { if (sessionStorage.getItem('seeded')) return; localStorage.clear(); localStorage.setItem(st.session, JSON.stringify(bs.session)); localStorage.setItem(st.device, JSON.stringify(bs.device)); localStorage.setItem(st.repositoryKey, JSON.stringify(bs.snapshot)); sessionStorage.setItem('seeded', '1'); sessionStorage.setItem('jurnl.f05.parent', 'motion'); }, { st: JURNL_E2E_STORAGE, bs: bs as never });
    const p = await ctx.newPage();
    let status = 'RENDERED';
    try {
      await p.goto(BASE + c.route, { waitUntil: 'networkidle', timeout: 60000 });
      await p.waitForSelector('[data-jrn-f05-dot01-stage]', { timeout: 30000 });
      if (c.steps) await c.steps(p);
      if (c.wait) await p.waitForSelector(c.wait, { timeout: 30000 });
      if (c.focus) await p.focus(T(c.focus));
      await p.waitForTimeout(500);
    } catch (e) { status = 'FAILED: ' + (e as Error).message.split('\n')[0]!.slice(0, 120); }
    const m = await p.evaluate(SCAN).catch(() => null);
    // the primary action of a form overlay stays reachable: it can be scrolled into view inside the content region
    let primary: unknown = null;
    if (await p.locator(T('d01-review-save')).count()) {
      await p.locator(T('d01-review-save')).scrollIntoViewIfNeeded();
      const bb = await p.locator(T('d01-review-save')).boundingBox();
      primary = bb ? { reachable: bb.y >= 0 && bb.y + bb.height <= c.vp[1] + 1, h: Math.round(bb.height) } : null;
    }
    await p.screenshot({ path: `${OUT}/${c.id}.png` });
    const row = { id: c.id, vp: c.vp.join('x'), status, primary, ...(m as object) };
    rows.push(row);
    console.log(JSON.stringify(row).slice(0, 300));
    await ctx.close();
  }
  writeFileSync(`${OUT}/long-content.json`, JSON.stringify(rows, null, 1));
  await b.close();
})();
