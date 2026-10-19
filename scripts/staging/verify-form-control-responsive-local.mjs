#!/usr/bin/env node
/** Responsive overflow smoke on local Vite review harness (not staging deploy). */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const base = process.env.DF_CAPTURE_BASE ?? 'http://127.0.0.1:5174';
const outDir = '/opt/cursor/artifacts/form-control-staging-b/responsive';
mkdirSync(outDir, { recursive: true });

const viewports = [
  [320, 700],
  [375, 812],
  [390, 844],
  [430, 932],
  [768, 1024],
  [834, 1112],
  [1024, 768],
  [1194, 834],
  [1280, 800],
  [1440, 900],
  [1920, 1080],
];

const browser = await chromium.launch();
const results = [];

for (const [w, h] of viewports) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('site00-immersive-complete', '1');
    } catch {}
  });
  await page.goto(`${base}/foundation/review#df-r-P02`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('.df-screen', { timeout: 30000 }).catch(() => undefined);
  const overflow = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  const path = join(outDir, `P02-${w}x${h}.png`);
  await page.screenshot({ path, fullPage: false });
  results.push({
    viewport: `${w}x${h}`,
    horizontalOverflow: overflow.scrollW > overflow.clientW + 2,
    shot: path,
  });
  await page.close();
}

await browser.close();
writeFileSync(join(outDir, 'report.json'), JSON.stringify({ base, results }, null, 2));
console.log(JSON.stringify({ overflowFailures: results.filter((r) => r.horizontalOverflow).length }, null, 2));
