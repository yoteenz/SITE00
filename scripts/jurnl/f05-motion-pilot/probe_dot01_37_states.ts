/* Read-only DOT 01 audit probe: opens all 37 states, records one-viewport metrics per viewport, optional screenshots.
 * Run: npx tsx scripts/jurnl/f05-motion-pilot/probe_dot01_37_states.ts <out dir> <w x h,...>  (env BASE, ONLY, SHOTS, LABEL, HOLD_OCR) */
import { chromium, type BrowserContext, type Page } from 'playwright';
import { writeFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { JURNL_E2E_STORAGE } from '../../../src/projects/jurnl/e2e/fixture';
import { dot01World } from '../../../e2e/jurnl/helpers/jurnl-dot01-world';
import { f05World } from '../../../e2e/jurnl/helpers/jurnl-f05-world';
import { receiptDate, receiptPng } from '../../../e2e/jurnl/helpers/jurnl-receipt-image';
import { addDays, getTodayKey } from '../../../src/projects/jurnl/data/foundation/dates';

const OUT = process.argv[2]!;
const VIEWPORTS = (process.argv[3] ?? '393x852').split(',');
const SHOTS = (process.env.SHOTS ?? '393x852').split(',');
const ONLY = (process.env.ONLY ?? '').split(',').filter(Boolean);
const LABEL = process.env.LABEL ?? 'head';
const BASE = process.env.BASE ?? 'http://127.0.0.1:5174/production/jurnl/runtime/';
const T = (id: string) => `[data-jrn-trigger="${id}"]`;
type W = 'approved' | 'dot01' | 'none' | 'many' | 'many-zero';
const today = getTodayKey();
const RECEIPT_A = ['**OSTERIA DEL PORTO', 'VIA DEL MARE 12', receiptDate(addDays(today, -1)) + '  19:42', '', 'ANTIPASTO|18.00', 'PASTA|28.00', 'VINO|32.00', '', 'SUBTOTAL|78.00', 'TAX|6.20', '**TOTAL|84.20'];
const RECEIPT_DUP = ['**TRATTORIA LUCIA', receiptDate(addDays(today, -5)), '', 'ANTIPASTO|18.00', 'PASTA|28.00', 'VINO|32.00', 'TAX|6.20', '**TOTALE|84.20'];
type S = { id: string; name: string; world: W; route: string; steps?: (p: Page, c: BrowserContext) => Promise<void>; wait?: string };
const upload = async (p: Page, c: BrowserContext, lines: string[], blank = false) => {
  const png = await receiptPng(c, { lines, blank });
  await p.setInputFiles(T('d01-receipt-upload-input'), { name: 'receipt.png', mimeType: 'image/png', buffer: png });
};
const STATES: S[] = [
  { id: '01', name: 'MONEY DOT 01 VIEW ALL ACCOUNTS', world: 'approved', route: 'money?parent=motion', wait: '[data-jrn-f05-stage]' },
  { id: '02', name: 'BANK ACCOUNT', world: 'approved', route: 'money/places/bank' },
  { id: '03', name: 'RIDESHARE CARD', world: 'approved', route: 'money/places/ride' },
  { id: '04', name: 'CASH ON HAND', world: 'approved', route: 'money/places/cash' },
  { id: '05', name: 'CREDIT CARD', world: 'approved', route: 'money/places/visa' },
  { id: '06', name: 'ALL ACCOUNTS', world: 'approved', route: 'money/places' },
  { id: '07', name: 'BANK TRANSACTION HISTORY', world: 'dot01', route: 'money/places/bank/history' },
  { id: '08', name: 'RIDESHARE ACTIVITY', world: 'dot01', route: 'money/places/ride/history' },
  { id: '09', name: 'CASH USAGE HISTORY', world: 'dot01', route: 'money/places/cash/history' },
  { id: '10', name: 'CREDIT CARD ACTIVITY', world: 'dot01', route: 'money/places/visa/history' },
  { id: '11', name: 'TRANSACTION DETAIL', world: 'dot01', route: 'money/entries/tx-d01-trattoria' },
  { id: '12', name: 'ACCOUNT DETAILS AND SETTINGS', world: 'dot01', route: 'money/places/bank/settings' },
  { id: '13', name: 'ACCOUNT BALANCE REVIEW', world: 'dot01', route: 'money/places/bank/review' },
  { id: '14', name: 'ADD ACCOUNT', world: 'dot01', route: 'money/places', steps: async (p) => { await p.click(T('d01-add-account')); }, wait: '[data-jrn-overlay="d01-add-account"]' },
  { id: '15', name: 'EDIT ACCOUNT', world: 'dot01', route: 'money/places/bank/settings', steps: async (p) => { await p.click(T('d01-rename')); }, wait: '[data-jrn-overlay="d01-edit-account"]' },
  { id: '16', name: 'RECORD BANK TRANSACTION', world: 'dot01', route: 'money/places/bank/history', steps: async (p) => { await p.click(T('d01-record')); }, wait: '[data-jrn-overlay="d01-record"]' },
  { id: '17', name: 'ADD CASH', world: 'dot01', route: 'money/places/cash', steps: async (p) => { await p.click(T('d01-strip-add-cash')); }, wait: '[data-jrn-overlay="d01-add-cash"]' },
  { id: '18', name: 'RECORD CASH SPENDING', world: 'dot01', route: 'money/places/cash', steps: async (p) => { await p.click(T('d01-strip-spend')); }, wait: '[data-jrn-overlay="d01-record"]' },
  { id: '19', name: 'RECORD CREDIT CARD PURCHASE', world: 'dot01', route: 'money/places/visa', steps: async (p) => { await p.click(T('d01-strip-purchase')); }, wait: '[data-jrn-overlay="d01-record"]' },
  { id: '20', name: 'RECORD CREDIT CARD PAYMENT', world: 'dot01', route: 'money/places/visa', steps: async (p) => { await p.click(T('d01-strip-pay')); }, wait: '[data-jrn-overlay="d01-card-payment"]' },
  { id: '21', name: 'ACCOUNT PURPOSE PREFERENCES', world: 'dot01', route: 'money/places/bank/settings', steps: async (p) => { await p.click(T('d01-purposes')); }, wait: '[data-jrn-overlay="d01-purposes"]' },
  { id: '22', name: 'EMPTY ACCOUNTS', world: 'none', route: 'money/places', wait: '[data-testid="d01-empty-accounts"]' },
  { id: '23', name: 'BALANCE ADJUSTMENT REVIEW', world: 'dot01', route: 'money/places/bank/review', steps: async (p) => { await p.fill(T('d01-actual-input'), '984.55'); await p.click(T('d01-add-adjustment')); }, wait: '[data-jrn-overlay="d01-adjust"]' },
  { id: '24', name: 'TRANSACTION CORRECTION / REVERSAL', world: 'dot01', route: 'money/entries/tx-d01-trattoria', steps: async (p) => { await p.click(T('d01-tx-correct')); }, wait: '[data-jrn-overlay="d01-correct"]' },
  { id: '25', name: 'ACCOUNT ARCHIVE CONFIRMATION', world: 'many-zero', route: 'money/places/long/settings', steps: async (p) => { await p.click(T('d01-archive')); }, wait: '[data-jrn-overlay="d01-archive"]' },
  { id: '26', name: 'CAPTURE RECEIPT', world: 'dot01', route: 'money/places/bank/history', steps: async (p) => { await p.click(T('d01-history-scan')); }, wait: '[data-jrn-overlay="d01-receipt-capture"]' },
  { id: '27', name: 'SCANNING RECEIPT', world: 'dot01', route: 'money/places/bank/history', steps: async (p, c) => { await p.click(T('d01-history-scan')); await upload(p, c, RECEIPT_A); }, wait: '[data-jrn-overlay="d01-receipt-scanning"]' },
  { id: '28', name: 'REVIEW EXTRACTED PURCHASE', world: 'dot01', route: 'money/places/bank/history', steps: async (p, c) => { await p.click(T('d01-history-scan')); await upload(p, c, RECEIPT_A); await p.waitForSelector('[data-jrn-overlay="d01-review-purchase"]', { timeout: 90000 }); }, wait: '[data-jrn-overlay="d01-review-purchase"]' },
  { id: '29', name: 'RECEIPT EXCEPTION / DUPLICATE', world: 'dot01', route: 'money/places/bank/history', steps: async (p, c) => { await p.click(T('d01-history-scan')); await upload(p, c, RECEIPT_DUP); await p.waitForSelector('[data-jrn-overlay="d01-review-purchase"]', { timeout: 90000 }); await p.click(T('d01-review-save')); }, wait: '[data-jrn-overlay="d01-receipt-duplicate"]' },
  { id: '30', name: 'ACCOUNT SETUP DETAILS', world: 'dot01', route: 'money/places', steps: async (p) => { await p.click(T('d01-add-account')); await p.click(T('d01-kind-bank')); }, wait: '[data-jrn-overlay="d01-add-account"]' },
  { id: '31', name: 'TRANSACTION SEARCH AND FILTER', world: 'dot01', route: 'money/transactions' },
  { id: '32', name: 'REORDER ACCOUNTS', world: 'dot01', route: 'money/places', steps: async (p) => { await p.click(T('d01-reorder')); }, wait: '[data-testid="d01-reorder"]' },
  { id: '33', name: 'TRANSACTION REVIEW', world: 'dot01', route: 'money/places/bank/history', steps: async (p) => { await p.click(T('d01-record')); await p.fill(T('d01-merchant'), 'BAKERY'); await p.fill(T('d01-amount'), '9.50'); await p.click(T('d01-category')); await p.click('[data-jrn-listbox="d01-category"] [data-jrn-option="FOOD"]'); await p.click(T('d01-review-save')); }, wait: '[data-jrn-overlay="d01-transaction-review"]' },
  { id: '34', name: 'RECEIPT CAPTURE FAILURE', world: 'dot01', route: 'money/places/bank/history', steps: async (p, c) => { await p.click(T('d01-history-scan')); await upload(p, c, [], true); }, wait: '[data-jrn-overlay="d01-receipt-failure"]' },
  { id: '35', name: 'ACCOUNT NEEDS REVIEW', world: 'dot01', route: 'money/places/bank/attention' },
  { id: '36', name: 'ARCHIVE BLOCKED', world: 'dot01', route: 'money/places/bank/settings', steps: async (p) => { await p.click(T('d01-archive')); }, wait: '[data-jrn-overlay="d01-archive-blocked"]' },
  { id: '37', name: 'CORRECTION / REVERSAL CONFIRMATION', world: 'dot01', route: 'money/entries/tx-d01-trattoria', steps: async (p) => { await p.click(T('d01-tx-correct')); await p.click(T('d01-correct-edit')); await p.click(T('d01-correct-continue')); await p.fill(T('d01-correct-amount'), '35.00'); await p.click(T('d01-correct-review')); }, wait: '[data-jrn-overlay="d01-correct-confirm"]' },
];
// 25: the founder-approved archive policy (zero held balance) blocks archiving a pocket that still holds money, so the
// confirmation is reached with the long-name pocket at zero (balance and available balance), as the E2E suites do
const worldOf = (w: W) => {
  if (w === 'dot01') return dot01World();
  if (w !== 'many-zero') return f05World(w);
  const m = f05World('many');
  return { ...m, snapshot: { ...m.snapshot, accounts: m.snapshot.accounts.map((a) => (a.account_id === 'long' ? { ...a, balance: 0, available_balance: 0 } : a)) } };
};
// ICONS=1: every rendered icon with its real source (micro-asset ID, authority lift, inline fallback glyph, dock), its
// control, rendered size (css px) and colour — the evidence for the icon-mapping audit
const ICON_SCAN = `function icons() {
    const out = [];
    const owner = (e) => { const b = e.closest('[data-jrn-trigger]'); return b ? b.getAttribute('data-jrn-trigger') : (e.closest('.jrn-nav') ? 'dock' : null); };
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(e).visibility !== 'hidden'; };
    const root = document.querySelector('[data-jrn-overlay]') || document;
    for (const e of root.querySelectorAll('img[data-micro-asset], .d01-dir__glyph, .jrn-d01__chip svg, button svg, .jrn-nav svg, .jrn-nav img, [class*="__ico"] svg, [class*="__ico"] img, .d01-strip__ico > *')) {
      if (!vis(e) || out.some((o) => o.el === e)) continue;
      const r = e.getBoundingClientRect();
      let source = 'INLINE_SVG';
      if (e.matches('img[data-micro-asset]')) source = 'MICRO:' + e.getAttribute('data-micro-asset');
      else if (e.matches('.d01-dir__glyph')) source = 'AUTHORITY_LIFT:' + (e.getAttribute('src') || '').split('/').pop().replace(/[-.][\\w-]*\\.webp$/, '');
      else if (e.closest('.jrn-nav')) source = 'DOCK_COMPONENT';
      else if (e.tagName === 'IMG') source = 'IMG:' + (e.getAttribute('src') || '').split('/').pop().slice(0, 40);
      const sig = e.tagName === 'svg' ? (e.innerHTML.match(/d="([^"]{0,28})/) || [, e.innerHTML.slice(0, 28)])[1] : null;
      out.push({ el: e, owner: owner(e), source, sig, w: Math.round(r.width), h: Math.round(r.height), color: getComputedStyle(e).color });
    }
    return out.map(({ el, ...o }) => o);
  }`;
const ICONS = !!process.env.ICONS;
const METRICS = `(() => {
  const ICONS = ${ICONS};
  ${ICON_SCAN}
  const vw = innerWidth, vh = innerHeight, de = document.documentElement;
  const stage = document.querySelector('[data-jrn-overlay] [data-jrn-f05-dot01-stage]') || document.querySelector('[data-jrn-f05-dot01-stage]') || document.querySelector('[data-jrn-f05-stage]');
  const sr = stage ? stage.getBoundingClientRect() : null;
  const board = (stage && stage.querySelector('.jrn-d01__board, .jrn-f05m__board')) || null;
  const br = board ? board.getBoundingClientRect() : null;
  const scope = document.querySelector('[data-jrn-overlay]') || document;
  function scroller(el) { for (let e = el.parentElement; e; e = e.parentElement) { const cs = getComputedStyle(e); if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && e.scrollHeight > e.clientHeight + 1) return e; } return null; }
  const ctrls = [...scope.querySelectorAll('button, a[href], input:not([type=file]), select, textarea')].filter(function (e) { return e.offsetParent !== null && !e.closest('.d01-sr'); });
  const off = []; const inScroll = [];
  for (const e of ctrls) { const r = e.getBoundingClientRect(); if (r.width === 0) continue; const outside = r.bottom > vh + 1 || r.top < -1 || r.right > vw + 1 || r.left < -1; if (!outside) continue; const sc = scroller(e); if (sc) inScroll.push(e.getAttribute('data-jrn-trigger') || e.tagName); else off.push((e.getAttribute('data-jrn-trigger') || e.getAttribute('aria-label') || e.tagName).slice(0, 40)); }
  const content = scope.querySelector('.jrn-d01__content');
  const nav = document.querySelector('.jrn-nav');
  const navVisible = !!(nav && nav.getBoundingClientRect().height > 0 && getComputedStyle(nav).visibility !== 'hidden' && (function () { const r = nav.getBoundingClientRect(); const t = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return t && nav.contains(t); })());
  const corner = [...document.querySelectorAll('.jrn-corner .jrn-f09a__menu, .jrn-corner .jrn-f09a__back')].filter(function (e) { return e.offsetParent !== null; }).length;
  const chips = [...scope.querySelectorAll('.jrn-d01__chip, .jrn-f05m__chip')].filter(function (e) { return e.offsetParent !== null; }).map(function (e) { return e.getAttribute('data-jrn-trigger'); });
  return {
    page_scroll_x: de.scrollWidth > vw + 1, page_scroll_y: de.scrollHeight > vh + 1, doc: [de.scrollWidth, de.scrollHeight],
    stage: sr ? [Math.round(sr.left), Math.round(sr.top), Math.round(sr.width), Math.round(sr.height)] : null,
    board: br ? [Math.round(br.left), Math.round(br.top), Math.round(br.width), Math.round(br.height)] : null,
    pillarbox: br ? (br.left > 1 || br.right < vw - 1) : null, board_clipped_bottom: br ? Math.max(0, Math.round(br.bottom - vh)) : null,
    internal_scroll: content ? { sh: content.scrollHeight, ch: content.clientHeight, scrolls: content.scrollHeight > content.clientHeight + 1 } : null,
    offscreen_controls: off, offscreen_in_scroller: inScroll.length, nav_visible: navVisible, corner_chrome: corner, chips,
    icons: ICONS ? icons() : undefined,
  };
})()`;
(async () => {
  mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const rows: unknown[] = [];
  // states outer, viewports inner: each state is seeded and opened once at the first viewport, then the page is resized
  // through the remaining viewports (the runtime re-lays out on resize). Rows are appended as they are measured.
  const jsonl = `${OUT}/metrics-${LABEL}.jsonl`;
  writeFileSync(jsonl, '');
  for (const s of STATES) {
    if (ONLY.length && !ONLY.includes(s.id)) continue;
    const [w0, h0] = VIEWPORTS[0]!.split('x').map(Number);
    const ctx = await b.newContext({ viewport: { width: w0!, height: h0! }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const bs = worldOf(s.world);
    await ctx.addInitScript(({ st, bs }) => { if (sessionStorage.getItem('seeded')) return; localStorage.clear(); localStorage.setItem(st.session, JSON.stringify(bs.session)); localStorage.setItem(st.device, JSON.stringify(bs.device)); localStorage.setItem(st.repositoryKey, JSON.stringify(bs.snapshot)); sessionStorage.setItem('seeded', '1'); sessionStorage.setItem('jurnl.f05.parent', 'motion'); }, { st: JURNL_E2E_STORAGE, bs: bs as never });
    // HOLD_OCR: keep SCANNING on screen by holding the self-hosted OCR engine files (the engine is otherwise done in < 1 s)
    if (process.env.HOLD_OCR) await ctx.route('**/jurnl/ocr/**', async (r) => { await new Promise((res) => setTimeout(res, 25000)); await r.continue().catch(() => undefined); });
    const page = await ctx.newPage();
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
    let status = 'RENDERED';
    try {
      await page.goto(BASE + s.route, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForSelector(s.wait ?? '[data-jrn-f05-dot01-stage]', { timeout: 30000 }).catch(() => undefined);
      if (s.steps) await s.steps(page, ctx);
      await page.waitForSelector(s.wait ?? '[data-jrn-f05-dot01-stage]', { timeout: 90000 });
      await page.waitForTimeout(500);
    } catch (e) { status = 'FAILED: ' + (e as Error).message.split('\n')[0]!.slice(0, 120); }
    for (const vp of VIEWPORTS) {
      const [w, h] = vp.split('x').map(Number);
      await page.setViewportSize({ width: w!, height: h! });
      await page.waitForTimeout(350);
      const m = await page.evaluate(METRICS).catch(() => null);
      if (SHOTS.includes(vp)) await page.screenshot({ path: `${OUT}/${s.id}-${vp}.png` }).catch(() => undefined);
      const row = { label: LABEL, id: s.id, name: s.name, viewport: vp, status, errors: [...errors], ...(m as object) };
      rows.push(row);
      appendFileSync(jsonl, JSON.stringify(row) + '\n');
      console.log(vp, s.id, status.slice(0, 40), JSON.stringify(m ? { py: (m as any).page_scroll_y, px: (m as any).page_scroll_x, pb: (m as any).pillarbox, clip: (m as any).board_clipped_bottom, off: (m as any).offscreen_controls.length } : null));
    }
    await ctx.close();
  }
  writeFileSync(`${OUT}/metrics-${LABEL}.json`, JSON.stringify(rows, null, 1));
  await b.close();
})();
