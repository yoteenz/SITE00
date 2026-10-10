/**
 * Shared Playwright helpers for the Builder studio QA scripts.
 *
 * The Vite dev server serves /api/* in-process (scripts/vite-site00-local-api.mjs). For founder-loop QA the
 * browser's intake API calls are forwarded to the memory-store harness (qa-api-server.ts) so the client studio
 * and the admin review talk to ONE real intake service instance. Forwarding only moves the request; the response
 * is whatever the real handler / service returned.
 */
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:5174';
const QA_API = process.env.QA_API || 'http://127.0.0.1:3100';
const VP = {
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  tablet: { viewport: { width: 834, height: 1194 }, deviceScaleFactor: 1 },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};

async function launch() {
  const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
  return chromium.launch({ args, ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) });
}

/** Forward intake API traffic to the QA harness. `offline: true` makes every intake call fail (LOCAL ONLY QA). */
async function wireApi(ctx, { offline = false, log = [] } = {}) {
  await ctx.route(/\/api\/(site00\/intakes|admin\/site00-intakes)(\?|$)/, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    log.push(`${req.method()} ${url.pathname}${url.search}`);
    if (offline) return route.abort('connectionrefused');
    try {
      // Node's fetch, not route.fetch: route.fetch can stall for requests issued during the first page load.
      const body = req.postData();
      const res = await fetch(QA_API + url.pathname + url.search, {
        method: req.method(),
        headers: { 'content-type': 'application/json' },
        body: req.method() === 'GET' ? undefined : body ?? undefined,
      });
      const text = await res.text();
      if (process.env.QA_DEBUG) log.push(`  fetched ${res.status} ${text.length}`);
      await route.fulfill({ status: res.status, contentType: 'application/json', body: text });
      if (process.env.QA_DEBUG) log.push(`  → ${res.status}`);
      return undefined;
    } catch (e) {
      log.push(`FORWARD FAILED ${url.search}: ${String(e && e.message).split('\n')[0]}`);
      return route.abort('failed').catch(() => undefined);
    }
  });
}

async function newPage(browser, vp, opts = {}) {
  // Reduced motion stops the Build Object's idle sway: several software-WebGL pages rendering at once starve the
  // dev server's module loading on this VM, and still frames make the captures deterministic.
  const ctx = await browser.newContext({ ...VP[vp], reducedMotion: 'reduce' });
  const log = opts.log || [];
  await wireApi(ctx, { offline: opts.offline, log });
  const page = await ctx.newPage();
  // A fresh context loads every dev module again; the first paint can be slow on this VM.
  page.setDefaultTimeout(90000);
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  return { ctx, page, errors, log };
}

const settle = (page, ms = 1500) => page.waitForTimeout(ms);

async function waitSync(page, statuses, timeout = 15000) {
  const list = Array.isArray(statuses) ? statuses : [statuses];
  await page.waitForFunction((l) => l.includes(document.querySelector('.bs-root')?.getAttribute('data-sync')), list, { timeout });
}

module.exports = { BASE, QA_API, VP, launch, newPage, settle, waitSync, wireApi };
