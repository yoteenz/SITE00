/**
 * Shared Playwright helpers for Digital Foundation client QA.
 *
 * Vite dev serves /api/* in-process, so the browser's artifact API calls are forwarded to the QA harness
 * (qa-df-api-server.ts), which runs Composer's real handler on the in-memory store. Forwarding only moves the
 * request; responses are whatever the real handler returned.
 */
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:5174';
const QA_API = process.env.QA_DF_API || 'http://127.0.0.1:3110';
const VP = {
  m390: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  m393: { viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  tablet: { viewport: { width: 834, height: 1194 }, deviceScaleFactor: 1 },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};

async function launch() {
  return chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
}

async function wireApi(ctx, { log = [], failActions = [] } = {}) {
  await ctx.route(/\/api\/site00\/digital-foundation-artifact(\?|$)/, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const action = url.searchParams.get('action');
    log.push(`${req.method()} ${action}`);
    if (failActions.includes(action)) return route.abort('connectionrefused');
    try {
      const res = await fetch(QA_API + url.pathname + url.search, {
        method: req.method(),
        headers: { 'content-type': 'application/json' },
        body: req.method() === 'GET' ? undefined : req.postData() ?? undefined,
      });
      const text = await res.text();
      return route.fulfill({ status: res.status, contentType: 'application/json', body: text });
    } catch (e) {
      log.push(`FORWARD FAILED ${action}: ${String(e && e.message).split('\n')[0]}`);
      return route.abort('failed').catch(() => undefined);
    }
  });
}

async function newPage(browser, vp, opts = {}) {
  const ctx = await browser.newContext({ ...VP[vp], reducedMotion: opts.motion ? 'no-preference' : 'reduce' });
  // The SITE 00 cold-start world loader runs once per browser session before any route; QA starts after it.
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem('site00-immersive-complete', '1');
    } catch {}
  });
  const log = opts.log || [];
  await wireApi(ctx, { log, failActions: opts.failActions || [] });
  const page = await ctx.newPage();
  page.setDefaultTimeout(60000);
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  const failed = [];
  page.on('requestfailed', (r) => failed.push(`${r.failure()?.errorText ?? 'failed'} ${r.url()}`));
  return { ctx, page, errors, log, failed };
}

async function qa(path, body = {}) {
  const res = await fetch(`${QA_API}/__qa/df/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`qa ${path}: ${json.error}`);
  return json;
}

async function api(method, action, body) {
  const url = `${QA_API}/api/site00/digital-foundation-artifact?action=${action}${method === 'GET' ? `&token=${body.token}` : ''}`;
  const res = await fetch(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: method === 'GET' ? undefined : JSON.stringify(body),
  });
  return { status: res.status, json: await res.json() };
}

async function view(page) {
  return page.evaluate(() => {
    const s = document.querySelector('.df-screen');
    return {
      view: s?.getAttribute('data-view'),
      state: s?.getAttribute('data-state'),
      review: document.querySelector('[data-review-state]')?.getAttribute('data-review-state') ?? null,
      activation: document.querySelector('[data-activation-state]')?.getAttribute('data-activation-state') ?? null,
    };
  });
}

async function waitView(page, v, timeout = 30000) {
  await page.waitForFunction((x) => document.querySelector('.df-screen')?.getAttribute('data-view') === x, v, { timeout });
  await page.evaluate(() => document.fonts.ready);
}

const settle = (page, ms = 600) => page.waitForTimeout(ms);

module.exports = { BASE, QA_API, VP, launch, newPage, qa, api, view, waitView, settle };
