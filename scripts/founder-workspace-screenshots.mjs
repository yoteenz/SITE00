#!/usr/bin/env node
/**
 * Capture founder workspace React screenshots at authority viewports.
 * Requires dev server at BASE (default http://127.0.0.1:5174).
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const BASE = process.env.SITE00_SCREENSHOT_BASE ?? 'http://127.0.0.1:5174';
const OUT = process.env.SITE00_SCREENSHOT_OUT ?? '/opt/cursor/artifacts/founder-workspace-react-screenshots';

const VIEWPORTS = [
  { name: '320x700', width: 320, height: 700 },
  { name: '375x812', width: 375, height: 812 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '3440x1440', width: 3440, height: 1440 },
];

const ROUTES = [
  '/admin/site00/founder-workspace/overview',
  '/admin/site00/founder-workspace/foundations',
  '/admin/site00/founder-workspace/referrals',
  '/admin/site00/founder-workspace/system',
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  for (const route of ROUTES) {
    const url = `${BASE}${route}`;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(800);
      const slug = route.split('/').pop();
      const file = join(OUT, `${vp.name}-${slug}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log('saved', file);
    } catch (e) {
      console.error('fail', vp.name, route, e.message);
    }
  }
}

await browser.close();
console.log('done', OUT);
