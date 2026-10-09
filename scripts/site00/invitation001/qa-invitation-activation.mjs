/**
 * INVITATION 001 — browser QA for /invite/:code against a running Vite dev server (local API on).
 *
 *   node scripts/site00/invitation001/qa-invitation-activation.mjs --base http://127.0.0.1:5191 --out /opt/cursor/artifacts/invitation001-qa
 *
 * Real backend: welcome, activation, development verification, Foundation handoff, returning, unknown / expired / revoked.
 * Simulated by intercepting one response (labelled SIMULATED in the report): paused, network down, server error,
 * production verification delivery (PENDING_IDNTY), stale device record.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
};
const BASE = arg('--base', 'http://127.0.0.1:5191');
const OUT = arg('--out', '/opt/cursor/artifacts/invitation001-qa');
const CODE = 'aio-office-inv001';
const VIEWPORTS = [
  { name: '390x844', width: 390, height: 844, mobile: true },
  { name: '393x852', width: 393, height: 852, mobile: true },
  { name: '834x1194', width: 834, height: 1194, mobile: true },
  { name: '1440x900', width: 1440, height: 900, mobile: false },
];

mkdirSync(OUT, { recursive: true });
const report = [];
const consoleErrors = [];
const check = (vp, name, ok, detail = '') => {
  report.push({ viewport: vp, check: name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} [${vp}] ${name}${detail ? ` — ${detail}` : ''}`);
};

const exe = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? join(homedir(), '.cache/ms-playwright/chromium-1148/chrome-linux/chrome');
const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});

async function newPage(vp, opts = {}) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: vp.mobile && vp.width < 800,
    hasTouch: vp.mobile,
    reducedMotion: opts.reducedMotion ? 'reduce' : 'no-preference',
  });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const text = m.text();
    if (/WebSocket connection|\[vite\]/i.test(text)) return;
    consoleErrors.push({ viewport: vp.name, text: text.slice(0, 300) });
  });
  page.on('pageerror', (e) => consoleErrors.push({ viewport: vp.name, text: `pageerror: ${e.message.slice(0, 300)}` }));
  return { ctx, page };
}

const view = (page, kind) => page.waitForSelector(`.s00inv[data-view="${kind}"]`, { timeout: 25000 });
const shot = async (page, vp, name, full = false) => {
  await page.waitForTimeout(1300);
  await page.screenshot({ path: join(OUT, `${vp.name}-${name}.png`), fullPage: full });
};

for (const vp of VIEWPORTS) {
  /* Happy path on the real dev backend */
  {
    const { ctx, page } = await newPage(vp);
    await page.goto(`${BASE}/invite/${CODE}`, { waitUntil: 'domcontentloaded' });
    await view(page, 'WELCOME');
    await shot(page, vp, '01-welcome');
    await shot(page, vp, '01-welcome-full', true);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(vp.name, 'no horizontal overflow', overflow <= 1, `overflow=${overflow}px`);
    const ctaBox = await page.locator('.s00inv__cta').first().boundingBox();
    check(vp.name, 'primary CTA inside first viewport', Boolean(ctaBox && ctaBox.y + ctaBox.height <= vp.height), JSON.stringify(ctaBox));
    check(vp.name, 'tap target ≥ 44px', Boolean(ctaBox && ctaBox.height >= 44), `h=${ctaBox?.height}`);
    const bodyText = await page.locator('main').innerText();
    check(vp.name, 'no "free" promise', !/\bfree\b/i.test(bodyText));
    check(vp.name, 'price disclosed from catalog', /FROM \$500/.test(bodyText));
    check(vp.name, 'partner shown subtly in footer', /PRESENTED THROUGH ALL IN ONE ENTERPRISES INC/.test(bodyText));
    check(vp.name, 'URL carries no PII', !/@|%40/.test(page.url()));

    // Keyboard: focus the CTA and press Enter.
    await page.locator('.s00inv__cta').first().focus();
    await page.keyboard.press('Enter');
    await view(page, 'ACTIVATE_EMAIL');
    const focusedId = await page.evaluate(() => document.activeElement?.id);
    check(vp.name, 'stage change moves focus to heading', focusedId === 's00inv-heading', `active=${focusedId}`);
    const live = await page.locator('[aria-live="polite"]').innerText();
    check(vp.name, 'live region announces stage', /STEP 03 OF 05/.test(live), live);
    await shot(page, vp, '02-activate-email');

    await page.fill('#s00inv-email', 'not-an-email');
    await page.locator('#s00inv-email').blur();
    await page.click('button[type="submit"]');
    await page.waitForSelector('#s00inv-email-invalid');
    await shot(page, vp, '03-email-invalid');

    await page.fill('#s00inv-email', 'founder.review@example.com');
    let beginCalls = 0;
    page.on('request', (r) => {
      if (r.url().includes('action=begin-activation')) beginCalls += 1;
    });
    await page.locator('button[type="submit"]').dblclick();
    await view(page, 'ACTIVATE_VERIFY');
    check(vp.name, 'double submit sends one activation request', beginCalls === 1, `calls=${beginCalls}`);
    const devCode = (await page.locator('.s00inv__devcode').innerText()).trim();
    check(vp.name, 'development code labelled as development', /DEVELOPMENT ONLY/.test(await page.locator('.s00inv__devpanel').innerText()));
    await shot(page, vp, '04-verify-development-code');

    await page.fill('#s00inv-code', 'WRONG000');
    await page.click('button[type="submit"]');
    await page.waitForSelector('#s00inv-error');
    await shot(page, vp, '05-verify-wrong-code');

    await page.click('text=USE THIS CODE');
    check(vp.name, 'use-this-code fills input', (await page.inputValue('#s00inv-code')) === devCode);
    await page.click('button[type="submit"]');
    await view(page, 'READY');
    const href = await page.locator('[data-testid="foundation-handoff"]').getAttribute('href');
    check(vp.name, 'handoff to /foundation/:token', /^\/foundation\/[A-Za-z0-9_-]{8,}$/.test(href ?? ''), href ?? '');
    check(vp.name, 'in-memory persistence disclosed', await page.locator('[data-testid="persistence-note"]').isVisible());
    await shot(page, vp, '06-ready');
    await shot(page, vp, '06-ready-full', true);

    const stored = await page.evaluate((c) => localStorage.getItem(`site00.invitation.v1.${c}`), CODE);
    check(vp.name, 'device record holds no email or activation id', Boolean(stored) && !/@|activation/i.test(stored ?? ''), stored ?? '');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await view(page, 'RETURNING');
    check(vp.name, 'returning visitor sees Foundation status', /Nothing has been entered yet/i.test(await page.locator('main').innerText()));
    await shot(page, vp, '07-returning');

    await page.click('[data-testid="foundation-handoff"]');
    await page.waitForURL(/\/foundation\//, { timeout: 20000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: join(OUT, `${vp.name}-08-foundation-handoff.png`) });
    check(vp.name, 'existing Foundation page opens', /\/foundation\//.test(page.url()));
    await ctx.close();
  }

  /* Fresh visitor on another device sees nothing private */
  {
    const { ctx, page } = await newPage(vp);
    await page.goto(`${BASE}/invite/${CODE}`, { waitUntil: 'domcontentloaded' });
    await view(page, 'WELCOME');
    check(vp.name, 'second scanner gets a fresh welcome, no Foundation link', (await page.locator('[data-testid="foundation-handoff"]').count()) === 0);
    await ctx.close();
  }

  /* Unknown / expired / revoked on the real backend */
  const unavailableText = {};
  for (const [code, label, expectAvail] of [
    ['unknown-invitation-code', '09-unknown', 'UNAVAILABLE'],
    ['expired-invitation-fixture', '10-expired', 'EXPIRED'],
    ['revoked-invitation-fixture', '11-revoked', 'UNAVAILABLE'],
  ]) {
    const { ctx, page } = await newPage(vp);
    await page.goto(`${BASE}/invite/${code}`, { waitUntil: 'domcontentloaded' });
    await view(page, 'UNAVAILABLE');
    const avail = await page.locator('[data-availability]').getAttribute('data-availability');
    unavailableText[code] = await page.locator('main').innerText();
    check(vp.name, `${code} → ${expectAvail}`, avail === expectAvail, avail ?? '');
    await shot(page, vp, label);
    await ctx.close();
  }

  check(
    vp.name,
    'unknown and revoked codes are indistinguishable',
    unavailableText['unknown-invitation-code'] === unavailableText['revoked-invitation-fixture'],
  );

  /* SIMULATED: paused, network, server, production delivery, stale record */
  const simulated = [
    {
      label: '12-paused-SIMULATED',
      expect: 'UNAVAILABLE',
      route: async (page) =>
        page.route('**/api/site00/invitation?action=resolve*', async (r) => {
          const res = await r.fetch();
          const json = await res.json();
          json.presentation.resolution = 'PAUSED';
          json.resolution = 'PAUSED';
          json.valid = false;
          json.visit_id = null;
          await r.fulfill({ response: res, json });
        }),
    },
    { label: '13-network-SIMULATED', expect: 'FAILED', route: (page) => page.route('**/api/site00/invitation?action=resolve*', (r) => r.abort('internetdisconnected')) },
    {
      label: '14-server-error-SIMULATED',
      expect: 'FAILED',
      route: (page) => page.route('**/api/site00/invitation?action=resolve*', (r) => r.fulfill({ status: 500, json: { error: 'Invitation system unavailable' } })),
    },
    {
      label: '15-production-verification-pending-SIMULATED',
      expect: 'WELCOME',
      after: async (page) => {
        await page.click('.s00inv__cta');
        await view(page, 'ACTIVATE_BLOCKED');
        return (await page.locator('#s00inv-email').count()) === 0;
      },
      afterLabel: 'blocked state collects no email',
      route: (page) =>
        page.route('**/api/site00/invitation?action=resolve*', async (r) => {
          const res = await r.fetch();
          const json = await res.json();
          json.verification_delivery = 'PENDING_IDNTY';
          await r.fulfill({ response: res, json });
        }),
    },
    {
      label: '16-stale-device-record-SIMULATED',
      expect: 'RESET',
      route: (page) =>
        page.addInitScript((c) => {
          localStorage.setItem(`site00.invitation.v1.${c}`, JSON.stringify({ foundation_route: '/foundation/lostlostlostlost', linked_at: '2026-01-01' }));
        }, CODE),
    },
  ];
  for (const s of simulated) {
    const { ctx, page } = await newPage(vp);
    await s.route(page);
    await page.goto(`${BASE}/invite/${CODE}`, { waitUntil: 'domcontentloaded' });
    await view(page, s.expect);
    if (s.after) check(vp.name, s.afterLabel, await s.after(page));
    else check(vp.name, `${s.label} renders ${s.expect}`, true);
    await shot(page, vp, s.label);
    await ctx.close();
  }

  /* Reduced motion */
  {
    const { ctx, page } = await newPage(vp, { reducedMotion: true });
    await page.goto(`${BASE}/invite/${CODE}`, { waitUntil: 'domcontentloaded' });
    await view(page, 'WELCOME');
    const motion = await page.locator('.s00inv').getAttribute('data-motion');
    const anim = await page.evaluate(() => getComputedStyle(document.querySelector('.s00inv__frame--1')).animationName);
    check(vp.name, 'reduced motion disables arrival animation', motion === 'reduced' && anim === 'none', `motion=${motion} anim=${anim}`);
    await ctx.close();
  }
}

await browser.close();
const failed = report.filter((r) => !r.ok);
writeFileSync(join(OUT, 'qa-report.json'), JSON.stringify({ base: BASE, checks: report, consoleErrors, failed: failed.length }, null, 2));
console.log(`\n${report.length - failed.length}/${report.length} checks passed · console errors: ${consoleErrors.length}`);
for (const e of consoleErrors) console.log('console', e.viewport, e.text);
process.exit(failed.length ? 1 : 0);
