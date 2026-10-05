#!/usr/bin/env node
/**
 * P0.VR.DESIGN-RELEASE429-EXACT-RESTORE1 — DESIGN + EXPERIENCE visual proof.
 *
 * Usage: timeout 420 node scripts/design-bench/release429-exact-restore1/capture.mjs [outDir] [base]
 */

import { mkdir } from 'node:fs/promises';

import { chromium } from 'playwright';

const OUT = process.argv[2] ?? '/opt/cursor/artifacts/design-release429-exact-restore1';
const BASE = process.argv[3] ?? 'http://127.0.0.1:5174';

const DESIGN_BASE = '/projects/design/ndxbook';

const SHOTS = [
  {
    name: '01-design-overview-mobile',
    url: DESIGN_BASE,
    viewport: { width: 390, height: 844 },
    assert: async (page) => {
      await page.waitForSelector('.site00-design-workspace', { timeout: 25000 });
      await page.waitForSelector('[data-testid="twin-opus-direct-screen"]', { timeout: 25000 });
    },
  },
  {
    name: '02-design-overview-desktop',
    url: DESIGN_BASE,
    viewport: { width: 1440, height: 1024 },
    assert: async (page) => {
      await page.waitForSelector('[data-testid="twin-opus-direct-screen"]', { timeout: 25000 });
      await page.waitForSelector('.tod-viewmode__group', { timeout: 15000 });
    },
  },
  {
    name: '03-design-viewmode-icons-desktop',
    url: DESIGN_BASE,
    viewport: { width: 1440, height: 1024 },
    assert: async (page) => {
      await page.waitForSelector('[data-dvs-viewmode-grok="1"]', { timeout: 25000 });
    },
    clipSelector: '.tod-viewmode__group',
  },
  {
    name: '04-design-references-mobile',
    url: `${DESIGN_BASE}/references`,
    viewport: { width: 390, height: 844 },
    assert: async (page) => {
      await page.waitForSelector('.tod-ps[data-surface="references"]', { timeout: 25000 });
    },
  },
  {
    name: '05-design-assets-mobile',
    url: `${DESIGN_BASE}/assets`,
    viewport: { width: 390, height: 844 },
    assert: async (page) => {
      await page.waitForSelector('.tod-ps[data-surface="assets"]', { timeout: 25000 });
    },
  },
  {
    name: '06-design-pages-mobile',
    url: `${DESIGN_BASE}/pages`,
    viewport: { width: 390, height: 844 },
    assert: async (page) => {
      await page.waitForSelector('.tod-ps[data-surface="pages"]', { timeout: 25000 });
    },
  },
  {
    name: '07-design-skins-mobile',
    url: `${DESIGN_BASE}/skins`,
    viewport: { width: 390, height: 844 },
    assert: async (page) => {
      await page.waitForSelector('.tod-ps[data-surface="skins"]', { timeout: 25000 });
    },
  },
  {
    name: '08-design-history-desktop',
    url: `${DESIGN_BASE}/history`,
    viewport: { width: 1440, height: 1024 },
    assert: async (page) => {
      await page.waitForSelector('.tod-ps[data-surface="history"]', { timeout: 25000 });
    },
  },
  {
    name: '09-design-more-mobile',
    url: `${DESIGN_BASE}/more`,
    viewport: { width: 390, height: 844 },
    assert: async (page) => {
      await page.waitForSelector('.tod-ps[data-surface="more"]', { timeout: 25000 });
    },
  },
  {
    name: '10-design-hamburger-mobile',
    url: DESIGN_BASE,
    viewport: { width: 390, height: 844 },
    assert: async (page) => {
      await page.waitForSelector('[data-testid="twin-opus-direct-screen"]', { timeout: 25000 });
      const menu = page.locator('button[aria-label="Open menu"], button[aria-label="Menu"]').first();
      if (await menu.count()) {
        await menu.click({ timeout: 8000 });
        await page.waitForTimeout(400);
      }
    },
  },
  {
    name: '11-design-panel-dock-assets-mobile',
    url: `${DESIGN_BASE}/assets`,
    viewport: { width: 390, height: 844 },
    assert: async (page) => {
      await page.waitForSelector('.tod-ps-actionbar', { timeout: 25000 });
      const main = page.locator('.tod-ps__main');
      if (await main.count()) {
        await main.evaluate((el) => {
          el.scrollTop = el.scrollHeight;
        });
        await page.waitForTimeout(300);
      }
      const docked = await page.evaluate(() => {
        const panel = document.querySelector('.tod-ps');
        const bar = document.querySelector('.tod-ps-actionbar');
        if (!panel || !bar) return false;
        const p = panel.getBoundingClientRect();
        const b = bar.getBoundingClientRect();
        return Math.abs(b.bottom - p.bottom) < 8 && b.top >= p.top;
      });
      if (!docked) throw new Error('action bar not docked to panel bottom');
    },
  },
  {
    name: '12-experience-baw-mobile',
    url: '/projects/frontal-slayer/experience/build-a-wig?goldenDiffCapture=1',
    viewport: { width: 390, height: 844 },
    assert: async (page) => {
      await page.waitForSelector('.site00-expws', { timeout: 35000, state: 'attached' });
    },
  },
  {
    name: '13-experience-baw-desktop',
    url: '/projects/frontal-slayer/experience/build-a-wig?goldenDiffCapture=1',
    viewport: { width: 1440, height: 1024 },
    assert: async (page) => {
      await page.waitForSelector('.site00-expws', { timeout: 35000, state: 'attached' });
    },
  },
];

await mkdir(OUT, { recursive: true });

async function runShot(browser, shot) {
  const context = await browser.newContext({ viewport: shot.viewport, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.goto(`${BASE}${shot.url}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(shot.url.includes('experience') ? 6500 : 2800);
  await shot.assert(page);
  const opts = { path: `${OUT}/${shot.name}.png`, fullPage: false };
  if (shot.clipSelector) {
    const el = page.locator(shot.clipSelector).first();
    await el.waitFor({ state: 'visible', timeout: 15000 });
    opts.clip = await el.boundingBox();
  }
  await page.screenshot(opts);
  await context.close();
  console.log('OK', shot.name);
}

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
for (const shot of SHOTS) {
  await runShot(browser, shot);
}
await browser.close();
console.log('Wrote screenshots to', OUT);
