#!/usr/bin/env node
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.env.DF_STAGING_SCREENSHOT_DIR ?? '/opt/cursor/artifacts/phase3b-staging';
const spa = process.env.SITE00_STAGING_SPA_ORIGIN ?? 'https://carefree-luck-staging.up.railway.app';

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const shots = [
  { name: 'staging-spa-sign-in-390.png', url: `${spa}/origin/sign-in` },
  { name: 'staging-foundation-review-390.png', url: `${spa}/foundation/review` },
];

for (const s of shots) {
  await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: join(outDir, s.name), fullPage: true });
  console.log('saved', s.name);
}

await browser.close();
