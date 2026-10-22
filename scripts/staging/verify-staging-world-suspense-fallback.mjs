#!/usr/bin/env node
/** After immersive gate, lazy Origin chunk must not leave a blank #root (fallback or error UI). */
import { chromium, devices } from 'playwright';

const BASE = process.env.STAGING_BASE || 'https://carefree-luck-staging.up.railway.app';

const browser = await chromium.launch();
const context = await browser.newContext({ ...devices['iPhone 13'] });
const page = await context.newPage();

await page.addInitScript(() => {
  sessionStorage.clear();
});

await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(12000);

const ok = await page.evaluate(() => {
  const root = document.getElementById('root');
  const text = (document.body?.innerText || '').trim();
  const mounted = root?.getAttribute('data-site00-app-mounted') === '1';
  return { mounted, textLen: text.length, hasOrigin: text.includes('SITE 00') || text.includes('ORIGIN') };
});

console.log(JSON.stringify({ base: BASE, ...ok, pass: ok.mounted && ok.textLen > 40 }));
await browser.close();
process.exit(ok.mounted && ok.textLen > 40 ? 0 : 1);
