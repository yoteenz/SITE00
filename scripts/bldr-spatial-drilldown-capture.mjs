#!/usr/bin/env node
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

/**
 * Requires dev server with builder flags (same as cloud tunnel):
 *   SITE00_INTAKES_USE_MEMORY=1 VITE_SITE00_TEMPLATE_SYSTEM_V1=1 \
 *   VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1=1 VITE_SITE00_ROOT=1 \
 *   npm run dev -- --port 5175 --host 127.0.0.1
 * Usage: node scripts/bldr-spatial-drilldown-capture.mjs [baseUrl]
 */
const base = process.argv[2] ?? 'http://127.0.0.1:5175';
const out = '/opt/cursor/artifacts/bldr-spatial-drilldown';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 390, height: 844 });

// Frozen review sample (in-memory only) — SHOP module on, no intake API required.
await page.goto(`${base}/bldr/studio/work?reviewRoom=WORK`, { waitUntil: 'networkidle' });
await page.waitForSelector('.bs-root', { timeout: 60000 });
await page.screenshot({ path: join(out, 'work-shop-idle-390.png'), fullPage: true });
await page.locator('button.bs-drill__btn', { hasText: 'ENTER SHOP SPACE' }).click({ force: true });
await page.waitForTimeout(900);
await page.screenshot({ path: join(out, 'work-shop-focused-390.png'), fullPage: true });

await page.goto(`${base}/bldr/studio/feel?reviewRoom=FEEL&reviewFeel=BOLD`, { waitUntil: 'networkidle' });
await page.waitForSelector('.bs-root', { timeout: 60000 });
await page.waitForSelector('button:has-text("ENTER DIRECTION")', { timeout: 60000 });
await page.locator('button.bs-drill__btn', { hasText: 'ENTER DIRECTION' }).click({ force: true });
await page.waitForTimeout(900);
await page.screenshot({ path: join(out, 'feel-bold-focused-390.png'), fullPage: true });
await browser.close();
console.log('Wrote', out);
