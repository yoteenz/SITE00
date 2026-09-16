/**
 * P0.VR.DESIGNBENCH.OPUS-VIEWMODE1 — records the CANONICAL -> LIST -> CANONICAL
 * round trip against the running dev server for the sprint walkthrough.
 */

import { mkdirSync, renameSync, readdirSync } from 'node:fs';
import { chromium } from 'playwright';

const PAGE_URL = 'http://localhost:5174/projects/ndxbook/design/twin-opus-direct';
const DIR = '/tmp/vm/video';
mkdirSync(DIR, { recursive: true });

const browser = await chromium.launch({ executablePath: '/usr/local/bin/google-chrome', args: ['--no-sandbox'] });
const context = await browser.newContext({
  viewport: { width: 768, height: 1376 },
  deviceScaleFactor: 1,
  recordVideo: { dir: DIR, size: { width: 768, height: 1376 } },
});
const page = await context.newPage();
await page.goto(PAGE_URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(1600);

// Move the workspace off its defaults so the round trip has something to lose.
await page.locator('.tod-device').nth(1).click();
await page.waitForTimeout(700);
await page.locator('.tod-card').nth(2).click();
await page.waitForTimeout(700);
await page.locator('.tod-tabs__tab').nth(2).click();
await page.waitForTimeout(900);
await page.locator('.tod-pair__head').click();
await page.waitForTimeout(1100);

await page.getByRole('radio', { name: 'LIST' }).click();
await page.waitForTimeout(2600);

await page.getByRole('radio', { name: 'CANONICAL' }).click();
await page.waitForTimeout(2400);

await context.close();
await browser.close();

const file = readdirSync(DIR).find((name) => name.endsWith('.webm'));
renameSync(`${DIR}/${file}`, `${DIR}/viewmode-roundtrip.webm`);
console.log(`${DIR}/viewmode-roundtrip.webm`);
