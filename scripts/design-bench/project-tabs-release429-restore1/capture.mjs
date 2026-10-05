#!/usr/bin/env node
/**
 * P0.VR.DESIGN-PROJECT-TABS-RELEASE429-RESTORE1 — six tab surfaces mobile + desktop.
 */

import { mkdir } from 'node:fs/promises';

import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '/opt/cursor/artifacts/design-project-tabs-release429-restore1';
const BASE = process.argv[3] ?? 'http://127.0.0.1:5174';
const BASE_PATH = '/projects/design/ndxbook';

const TABS = ['references', 'assets', 'pages', 'skins', 'history', 'more'];

await mkdir(OUT, { recursive: true });

async function shot(browser, tab, vp, suffix) {
  const context = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto(`${BASE}${BASE_PATH}/${tab}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.waitForSelector('.tod-ps__main', { timeout: 25000 });
  const ok = await page.evaluate(() => {
    const main = document.querySelector('.tod-ps__main');
    const rich = document.querySelector(
      '.tod-ps-modules, .tod-ps-panes, .tod-ps-cards, .tod-ps-timeline, .tod-ps-feature',
    );
    return (main?.clientHeight ?? 0) > 200 && !!rich;
  });
  if (!ok) throw new Error(`tab ${tab} ${suffix}: empty or collapsed main`);
  await page.screenshot({ path: `${OUT}/${tab}-${suffix}.png`, fullPage: false });
  await context.close();
  console.log('OK', tab, suffix);
}

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
for (const tab of TABS) {
  await shot(browser, tab, { width: 390, height: 844 }, 'mobile');
  await shot(browser, tab, { width: 1440, height: 1024 }, 'desktop');
}
await browser.close();
console.log('Wrote', OUT);
