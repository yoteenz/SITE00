#!/usr/bin/env node
/**
 * Capture production hub + character fabrication for P0 compositing sprint.
 * Requires preview on :5174 with fresh local build.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = '/opt/cursor/artifacts/authority-compositing-qa';
mkdirSync(OUT, { recursive: true });

const founder = {
  email: 'kateenaarmstrong@gmail.com',
  name: 'Kateena Armstrong',
};

function seedAuth(page) {
  const backup = JSON.stringify({
    isSignedIn: true,
    currentUser: JSON.stringify(founder),
  });
  return page.addInitScript(({ backup, founder }) => {
    localStorage.setItem('isSignedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(founder));
    localStorage.setItem('baw_auth_backup', backup);
  }, { backup, founder });
}

async function box(page, sel) {
  return page.locator(sel).first().boundingBox();
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 432, height: 900 } });
const page = await ctx.newPage();
await seedAuth(page);

const hubUrl = 'http://127.0.0.1:5174/production?designPreview=1';
await page.goto(hubUrl, { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForSelector('[data-testid="production-workspace-hub"]', { timeout: 60000 }).catch(() => {});
await page.screenshot({ path: join(OUT, 'production-base-432.png'), fullPage: true });

const perf = page.locator('[data-testid="hub-node-performance"]');
if (await perf.count()) {
  const before = await box(page, '[data-testid="hub-node-performance"]');
  await perf.click();
  await page.waitForTimeout(400);
  const after = await box(page, '[data-testid="hub-node-performance"]');
  await page.screenshot({ path: join(OUT, 'production-performance-detail-432.png'), fullPage: true });
  const back = page.locator('[data-testid="hub-node-back-performance"]');
  if (await back.count()) await back.click();
  await page.screenshot({ path: join(OUT, 'production-performance-summary-432.png'), fullPage: true });
  console.log('PANEL_BOX', JSON.stringify({ before, after, same: before && after && before.height === after.height && before.width === after.width }));
}

const cfUrl =
  'http://127.0.0.1:5174/production/ndxbook/expression/character-fabrication?entry=002&station=identity&designPreview=1';
await page.goto(cfUrl, { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForSelector('[data-testid="cf-character-viewport"]', { timeout: 60000 }).catch(() => {});
await page.screenshot({ path: join(OUT, 'character-identity-432.png'), fullPage: true });

await page.setViewportSize({ width: 360, height: 780 });
await page.goto(hubUrl, { waitUntil: 'networkidle', timeout: 120000 });
await page.screenshot({ path: join(OUT, 'production-base-360.png'), fullPage: true });

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(hubUrl, { waitUntil: 'networkidle', timeout: 120000 });
await page.screenshot({ path: join(OUT, 'production-base-390.png'), fullPage: true });
await page.goto(cfUrl, { waitUntil: 'networkidle', timeout: 120000 });
await page.screenshot({ path: join(OUT, 'character-identity-390.png'), fullPage: true });

await browser.close();
console.log('WROTE', OUT);
