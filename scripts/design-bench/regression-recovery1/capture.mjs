#!/usr/bin/env node
/**
 * P0.VR.DESIGN-REGRESSION-RECOVERY1 — DESIGN + EXPERIENCE visual proof (short waits).
 *
 * Usage: timeout 300 node scripts/design-bench/regression-recovery1/capture.mjs [outDir] [base]
 */

import { mkdir } from 'node:fs/promises';

import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '/opt/cursor/artifacts/design-regression-recovery1';
const BASE = process.argv[3] ?? 'http://127.0.0.1:5174';

const SHOTS = [
  {
    name: 'design-ndxbook-overview-mobile',
    url: '/projects/design/ndxbook',
    viewport: { width: 390, height: 844 },
    assert: async (page) => {
      await page.waitForSelector('.site00-design-workspace', { timeout: 20000 });
      await page.waitForSelector('[data-testid="twin-opus-direct-screen"]', { timeout: 20000 });
    },
  },
  {
    name: 'design-ndxbook-overview-desktop',
    url: '/projects/design/ndxbook',
    viewport: { width: 1440, height: 1024 },
    assert: async (page) => {
      await page.waitForSelector('[data-testid="twin-opus-direct-screen"]', { timeout: 20000 });
    },
  },
  {
    name: 'design-ndxbook-references-mobile',
    url: '/projects/design/ndxbook/references',
    viewport: { width: 390, height: 844 },
    assert: async (page) => {
      await page.waitForSelector('.tod-ps[data-surface="references"]', { timeout: 20000 });
    },
  },
  {
    name: 'design-ndxbook-assets-mobile',
    url: '/projects/design/ndxbook/assets',
    viewport: { width: 390, height: 844 },
    assert: async (page) => {
      await page.waitForSelector('.tod-ps[data-surface="assets"]', { timeout: 20000 });
    },
  },
  {
    name: 'design-ndxbook-history-desktop',
    url: '/projects/design/ndxbook/history',
    viewport: { width: 1440, height: 1024 },
    assert: async (page) => {
      await page.waitForSelector('.tod-ps[data-surface="history"]', { timeout: 20000 });
    },
  },
  {
    name: 'experience-baw-mobile',
    url: '/projects/frontal-slayer/experience/build-a-wig?goldenDiffCapture=1',
    viewport: { width: 390, height: 844 },
    assert: async (page) => {
      await page.waitForSelector('.site00-expws', { timeout: 30000, state: 'attached' });
    },
  },
  {
    name: 'experience-baw-desktop',
    url: '/projects/frontal-slayer/experience/build-a-wig?goldenDiffCapture=1',
    viewport: { width: 1440, height: 1024 },
    assert: async (page) => {
      await page.waitForSelector('.site00-expws', { timeout: 30000, state: 'attached' });
    },
  },
];

await mkdir(OUT, { recursive: true });

async function runShot(browser, shot) {
  const context = await browser.newContext({ viewport: shot.viewport, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto(`${BASE}${shot.url}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(shot.url.includes('experience') ? 6500 : 2500);
  await shot.assert(page);
  await page.screenshot({ path: `${OUT}/${shot.name}.png`, fullPage: false });
  await context.close();
  console.log('OK', shot.name);
}

const designBrowser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
for (const shot of SHOTS.filter((s) => !s.url.includes('experience'))) {
  await runShot(designBrowser, shot);
}
await designBrowser.close();

const expBrowser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
for (const shot of SHOTS.filter((s) => s.url.includes('experience'))) {
  await runShot(expBrowser, shot);
}
await expBrowser.close();
console.log('Wrote screenshots to', OUT);
