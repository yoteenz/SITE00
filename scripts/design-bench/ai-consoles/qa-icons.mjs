/**
 * P0.VR.DESIGN.GROK-AI-CONSOLE-ASSETS1 — screenshot the staged icon sheet
 * plus the three consoles at desktop and mobile control sizes.
 */

import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:5174';
const OUT = process.argv[3] ?? '/tmp/ai-console-icon-qa';
mkdirSync(OUT, { recursive: true });

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(name);
}

const browser = await chromium.launch({ headless: true });

for (const [label, size] of [
  ['desktop', { width: 1440, height: 980 }],
  ['mobile', { width: 430, height: 932 }],
]) {
  const page = await browser.newPage({ viewport: size });
  await page.goto(`${BASE}/site00/ai-consoles/staged/review.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  await shot(page, `sheet-marks-${label}`);
  await page.evaluate(() => document.getElementById('status-ready')?.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(200);
  await shot(page, `sheet-status-${label}`);
  await page.evaluate(() => document.getElementById('opus-design')?.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(200);
  await shot(page, `sheet-opus-${label}`);
  await page.evaluate(() => document.getElementById('grok-generate')?.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(200);
  await shot(page, `sheet-grok-${label}`);
  await page.evaluate(() => document.getElementById('auth-mobile')?.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(200);
  await shot(page, `sheet-authority-${label}`);
  await page.close();
}

const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
await page.goto(`${BASE}/projects/design/ndxbook`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.tod-root', { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(1500);

async function openAndCapture(trigger, name) {
  const btn = page.getByRole('button', { name: trigger }).first();
  if (await btn.count()) {
    await btn.click();
    await page.waitForTimeout(600);
    await shot(page, name);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  } else {
    console.log('skip', name);
  }
}

await openAndCapture('Open Opus design agent', 'opus-icons-desktop');
await openAndCapture('Open Grok asset agent', 'grok-icons-desktop');
await openAndCapture('Open mobile authority editor', 'authority-icons-desktop');

const mobile = await browser.newPage({ viewport: { width: 430, height: 932 } });
await mobile.goto(`${BASE}/projects/design/ndxbook`, { waitUntil: 'domcontentloaded' });
await mobile.waitForSelector('.tod-root', { timeout: 30000 }).catch(() => {});
await mobile.waitForTimeout(1500);

async function openMobile(trigger, name) {
  const btn = mobile.getByRole('button', { name: trigger }).first();
  if (await btn.count()) {
    await btn.click();
    await mobile.waitForTimeout(600);
    await mobile.screenshot({ path: `${OUT}/${name}.png` });
    console.log(name);
    await mobile.keyboard.press('Escape');
    await mobile.waitForTimeout(300);
  } else {
    console.log('skip', name);
  }
}

await openMobile('Open Opus design agent', 'opus-icons-mobile');
await openMobile('Open Grok asset agent', 'grok-icons-mobile');
await openMobile('Open mobile authority editor', 'authority-icons-mobile');

await browser.close();
console.log(`icon QA captures in ${OUT}`);
