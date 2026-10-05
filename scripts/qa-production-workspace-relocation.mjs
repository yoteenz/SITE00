#!/usr/bin/env node
/**
 * Headless QA for production workspace relocation (local vite preview).
 */
import { chromium } from 'playwright';

const BASE = process.env.SITE00_QA_BASE || 'http://127.0.0.1:5175';

async function setUser(page, email) {
  await page.goto(`${BASE}/`);
  await page.evaluate(({ email }) => {
    localStorage.setItem('isSignedIn', 'true');
    localStorage.setItem(
      'currentUser',
      JSON.stringify({ email, name: email.split('@')[0], role: email.includes('admin') ? 'admin' : 'client' }),
    );
  }, { email });
}

const results = [];

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, pass: true });
    console.log(`PASS ${name}`);
  } catch (e) {
    results.push({ name, pass: false, error: e.message });
    console.log(`FAIL ${name}: ${e.message}`);
  }
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();

await check('legacy /projects/design/ndxbook → production design', async () => {
  await page.goto(`${BASE}/projects/design/ndxbook/pages`, { waitUntil: 'networkidle' });
  const url = page.url();
  if (!url.includes('/production/ndxbook/design')) throw new Error(`got ${url}`);
});

await check('admin /production hub', async () => {
  await setUser(page, 'admin@frontalslayer.com');
  await page.goto(`${BASE}/production`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="production-workspace-hub"]', { timeout: 15000 });
  if (page.url().includes('/sign-in')) throw new Error('admin blocked');
});

for (const path of ['/production/ndxbook/design', '/production/ndxbook/experience', '/production/ndxbook/expression']) {
  await check(`admin route ${path}`, async () => {
    await setUser(page, 'admin@frontalslayer.com');
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
    if (page.url().includes('/sign-in')) throw new Error('redirected to sign-in');
    if (!page.url().includes(path.split('?')[0])) throw new Error(`url ${page.url()}`);
  });
}

await check('projects index no ProjectIndexDesignCard marker', async () => {
  await setUser(page, 'admin@frontalslayer.com');
  await page.goto(`${BASE}/projects`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const html = await page.content();
  if (html.includes('ProjectIndexDesignCard')) throw new Error('design card still present');
});

await check('client blocked from /production', async () => {
  const clientCtx = await browser.newContext();
  const clientPage = await clientCtx.newPage();
  await setUser(clientPage, 'client@example.com');
  await clientPage.goto(`${BASE}/production`, { waitUntil: 'domcontentloaded' });
  await clientPage.waitForFunction(() => !window.location.pathname.startsWith('/production'), { timeout: 10000 });
  await clientCtx.close();
});

await browser.close();

const failed = results.filter((r) => !r.pass);
process.exit(failed.length ? 1 : 0);
