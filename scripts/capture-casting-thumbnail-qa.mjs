#!/usr/bin/env node
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const ROOT = join(process.cwd(), 'artifacts/studio-world-casting-thumbnails');
const BASE = process.env.SITE00_CAPTURE_BASE ?? 'http://127.0.0.1:5174';
const URL = `${BASE}/production/ndxbook/expression/casting?entry=002`;

const viewports = [
  { dir: 'mobile', width: 390, height: 844 },
  { dir: 'tablet', width: 768, height: 1024 },
  { dir: 'desktop', width: 1280, height: 900 },
];

mkdirSync(join(ROOT, 'mobile'), { recursive: true });
mkdirSync(join(ROOT, 'tablet'), { recursive: true });
mkdirSync(join(ROOT, 'desktop'), { recursive: true });

const browser = await chromium.launch({ headless: true });

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.getByTestId('casting-open-catalogue').click({ timeout: 15000 }).catch(async () => {
    await page.getByRole('button', { name: /^Actors$/i }).click();
  });
  await page.getByTestId('actor-row-SW-RESIDENT-001').waitFor({ timeout: 20000 });
  const thumbs = await page.locator('[data-visual-authority="CASTING_THUMBNAIL"]').count();
  if (thumbs < 8) {
    console.warn(`${vp.dir}: expected 8 CASTING_THUMBNAIL thumbs, saw ${thumbs}`);
  }
  await page.screenshot({
    path: join(ROOT, vp.dir, 'casting-actors.png'),
    fullPage: true,
  });
  console.log(`wrote ${vp.dir}/casting-actors.png (${thumbs} thumbs)`);
  await page.close();
}

await browser.close();
