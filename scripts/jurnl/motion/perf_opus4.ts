/* OPUS4 performance validation: measured in Chromium through the DevTools protocol on the running dev server.
 *   1. idle ambience vs a still page (same page, ambience on vs reduced motion): layouts, style recalcs, script time,
 *      task time, over the same window, and whether any requestAnimationFrame / setInterval is used by the page
 *   2. leaks: 20 open / close cycles of four overlays, then GC: closing copies left, running one-shot animations,
 *      JS heap before / after, DOM node count before / after
 *   3. hidden page: the ambience is withdrawn and no animation keeps running
 * Run: npx tsx scripts/jurnl/motion/perf_opus4.ts <out.json> */
import { chromium, type Page } from 'playwright';
import { writeFileSync } from 'node:fs';
import { JURNL_E2E_STORAGE } from '../../../src/projects/jurnl/e2e/fixture';
import { f05World } from '../../../e2e/jurnl/helpers/jurnl-f05-world';

const OUT = process.argv[2]!;
const BASE = process.env.BASE ?? 'http://127.0.0.1:5174/production/jurnl/runtime/';
const T = (id: string) => `[data-jrn-trigger="${id}"]`;
const WINDOW_MS = 12_000;

async function open(reduced: boolean) {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const bs = f05World('approved') as unknown as { session: unknown; device: unknown; snapshot: unknown };
  await ctx.route('https://open.er-api.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: 'success', base_code: 'USD', time_last_update_unix: Math.floor(Date.now() / 1000) - 3600, rates: { USD: 1, EUR: 0.92 } }) }));
  await ctx.addInitScript(({ st, bs }) => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.clear();
    localStorage.setItem(st.session, JSON.stringify(bs.session));
    localStorage.setItem(st.device, JSON.stringify(bs.device));
    localStorage.setItem(st.repositoryKey, JSON.stringify(bs.snapshot));
    sessionStorage.setItem('seeded', '1');
    sessionStorage.setItem('jurnl.f05.parent', 'motion');
    // count frame callbacks and intervals requested by the page from now on
    const w = window as unknown as { __raf: number; __int: number };
    w.__raf = 0;
    w.__int = 0;
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => ((w.__raf += 1), raf(cb));
    const si = window.setInterval.bind(window);
    window.setInterval = ((fn: TimerHandler, ms?: number, ...a: unknown[]) => ((w.__int += 1), si(fn, ms, ...a))) as typeof window.setInterval;
  }, { st: JURNL_E2E_STORAGE, bs });
  const page = await ctx.newPage();
  await page.goto(`${BASE}money?parent=motion`);
  await page.locator('[data-jrn-f05-stage]').waitFor({ state: 'attached', timeout: 30_000 });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Performance.enable');
  return { b, page, cdp };
}

type Cdp = Awaited<ReturnType<typeof open>>['cdp'];
const metrics = async (cdp: Cdp) => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
const counters = (page: Page) => page.evaluate(() => ({ raf: (window as unknown as { __raf: number }).__raf, intervals: (window as unknown as { __int: number }).__int }));

async function idleWindow(reduced: boolean) {
  const { b, page, cdp } = await open(reduced);
  await page.waitForTimeout(2_500); // past the entrance and its quiet period
  const ambient = await page.evaluate(() => (document.querySelector('.jrn') as HTMLElement).dataset.jrnAmbient);
  const c0 = await counters(page);
  const m0 = await metrics(cdp);
  await page.waitForTimeout(WINDOW_MS);
  const m1 = await metrics(cdp);
  const c1 = await counters(page);
  const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').map((a) => (a as CSSAnimation).animationName ?? 'waapi'));
  await b.close();
  const d = (k: string) => Math.round(((m1[k] ?? 0) - (m0[k] ?? 0)) * 1000) / 1000;
  return { reducedMotion: reduced, ambient, windowMs: WINDOW_MS, running, layouts: d('LayoutCount'), styleRecalcs: d('RecalcStyleCount'), layoutSeconds: d('LayoutDuration'), recalcSeconds: d('RecalcStyleDuration'), scriptSeconds: d('ScriptDuration'), taskSeconds: d('TaskDuration'), rafCalls: c1.raf - c0.raf, intervalsCreated: c1.intervals - c0.intervals };
}

async function leaks() {
  const { b, page, cdp } = await open(false);
  await page.waitForTimeout(2_000);
  const heap = async () => {
    await cdp.send('HeapProfiler.collectGarbage');
    return Math.round(((await cdp.send('Runtime.getHeapUsage')).usedSize / 1024 / 1024) * 100) / 100;
  };
  const nodes = () => page.evaluate(() => document.getElementsByTagName('*').length);
  // warm up once so lazy chunks and caches are loaded before the baseline
  const cycle = async () => {
    for (const [o, id] of [['f09-menu', 'global-menu'], ['f05m-search', 'global-search'], ['f05m-move', 'transfer-sheet'], ['f05m-actions', 'f05m-actions-sheet']] as const) {
      await page.locator(T(o)).first().tap();
      await page.locator(`[data-jrn-overlay="${id}"]`).waitFor();
      await page.keyboard.press('Escape');
      await page.locator(`[data-jrn-overlay="${id}"]`).waitFor({ state: 'detached' });
    }
  };
  await cycle();
  await page.waitForTimeout(800);
  const h0 = await heap();
  const n0 = await nodes();
  for (let i = 0; i < 20; i += 1) await cycle();
  await page.waitForTimeout(1_200);
  const h1 = await heap();
  const n1 = await nodes();
  const left = await page.evaluate(() => ({ ghosts: document.querySelectorAll('.jm-ghost').length, oneShot: document.getAnimations().filter((a) => !String((a as CSSAnimation).animationName ?? '').startsWith('jm-amb-') && a.playState === 'running').length }));
  // hidden page
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const hidden = await page.evaluate(() => ({ phase: (document.querySelector('.jrn') as HTMLElement).dataset.jrnMotionPhase, ambient: (document.querySelector('.jrn') as HTMLElement).dataset.jrnAmbient, running: document.getAnimations().filter((a) => a.playState === 'running').length }));
  await b.close();
  return { cycles: 20 * 4, heapMbBefore: h0, heapMbAfter: h1, heapMbDelta: Math.round((h1 - h0) * 100) / 100, domNodesBefore: n0, domNodesAfter: n1, closingCopiesLeft: left.ghosts, oneShotAnimationsRunning: left.oneShot, hiddenPage: hidden };
}

(async () => {
  const ambientOn = await idleWindow(false);
  const still = await idleWindow(true);
  const leak = await leaks();
  const out = { measuredAt: new Date().toISOString(), base: BASE, idle: { ambientOn, stillReducedMotion: still }, leaks: leak };
  writeFileSync(OUT, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
})();
