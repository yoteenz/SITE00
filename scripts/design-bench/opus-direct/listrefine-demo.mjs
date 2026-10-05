/**
 * P0.VR.DESIGNBENCH.OPUS-LIST-REFINE1 — records the relocated view control,
 * the cleared concept-data strip and the CANONICAL <-> LIST round trip on a
 * phone viewport, against the running dev server.
 */

import { mkdirSync, renameSync, readdirSync } from 'node:fs';
import { chromium } from 'playwright';

const PAGE_URL = 'http://localhost:5174/projects/ndxbook/design/twin-opus-direct';
const DIR = '/tmp/lr/video';
mkdirSync(DIR, { recursive: true });

const browser = await chromium.launch({ executablePath: '/usr/local/bin/google-chrome', args: ['--no-sandbox'] });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  recordVideo: { dir: DIR, size: { width: 390, height: 844 } },
});
const page = await context.newPage();
await page.goto(PAGE_URL, { waitUntil: 'networkidle' });
await page.evaluate(() => window.sessionStorage.removeItem('site00:twin-opus-direct:view-mode:v1'));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2200);

// Move the workspace off its defaults so the round trip has something to lose.
await page.locator('.tod-device').nth(1).click();
await page.waitForTimeout(800);
await page.locator('.tod-card').nth(2).click();
await page.waitForTimeout(800);
await page.locator('.tod-tabs__tab').nth(2).click();
await page.waitForTimeout(1400);

// Into the Spark digest.
await page.getByRole('radio', { name: 'LIST' }).click();
await page.waitForTimeout(2000);

const main = page.locator('.tod-main--list');
for (const y of [900, 2400, 4200]) {
  await main.evaluate((el, yy) => el.scrollTo({ top: yy, behavior: 'smooth' }), y);
  await page.waitForTimeout(1600);
}
await main.evaluate((el) => el.scrollTo({ top: 0, behavior: 'smooth' }));
await page.waitForTimeout(1500);

// Keyboard operation of the relocated control, then back to canonical.
await page.getByRole('radio', { name: 'LIST' }).focus();
await page.waitForTimeout(1000);
await page.keyboard.press('ArrowLeft');
await page.waitForTimeout(2600);

await context.close();
await browser.close();

const file = readdirSync(DIR).find((name) => name.endsWith('.webm'));
renameSync(`${DIR}/${file}`, `${DIR}/listrefine.webm`);
console.log(`${DIR}/listrefine.webm`);
