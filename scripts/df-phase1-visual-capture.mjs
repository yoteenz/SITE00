/**
 * Phase 1 visual evidence — P02 on /foundation/review at key viewports.
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const outDir = '/opt/cursor/artifacts/df-phase1-visual';
mkdirSync(outDir, { recursive: true });

const base = process.env.DF_CAPTURE_BASE ?? 'http://127.0.0.1:5174';
const viewports = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-320', width: 320, height: 568 },
  { name: 'tablet-834', width: 834, height: 1112 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

const browser = await chromium.launch();
const page = await browser.newPage();
const screen = page.locator('#df-r-P02');
await page.goto(`${base}/foundation/review#df-r-P02`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('#df-r-P02', { timeout: 60000 });
await screen.scrollIntoViewIfNeeded();

for (const vp of viewports) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(outDir, `p02-${vp.name}.png`), fullPage: true });
}

const fontSize = await page.locator('#df-business_name').evaluate((el) => getComputedStyle(el).fontSize);
await page.close();
await browser.close();

console.log(JSON.stringify({ outDir, businessNameInputFontSize: fontSize }, null, 2));
