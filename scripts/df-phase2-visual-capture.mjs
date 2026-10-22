/**
 * Phase 2 selector evidence — P02 industry at mobile + desktop viewports.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, devices } from 'playwright';

const outDir = '/opt/cursor/artifacts/df-phase2-visual';
mkdirSync(outDir, { recursive: true });

const base = process.env.DF_CAPTURE_BASE ?? 'http://127.0.0.1:5175';
const meta = [];

async function capture(name, page, selector, note) {
  await page.locator(selector).scrollIntoViewIfNeeded().catch(() => undefined);
  await page.waitForTimeout(200);
  const path = join(outDir, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  meta.push({ name, note, path });
}

const browser = await chromium.launch();

// Mobile coarse — sheet
{
  const page = await browser.newPage({ ...devices['iPhone 13'] });
  await page.goto(`${base}/foundation/review#df-r-P02`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('#df-industry', { timeout: 60000 });
  await capture('V-01-mobile-closed', page, '#df-industry', '390×844 coarse, closed trigger');
  await page.locator('#df-industry').click();
  await page.waitForSelector('.idnty-sel-sheet__panel', { timeout: 10000 });
  await page.waitForTimeout(400);
  await capture('V-02-mobile-sheet-open', page, '.idnty-sel-sheet__panel', 'Editorial sheet open');
  await page.locator('.idnty-sel-sheet__option', { hasText: 'OTHER' }).first().click();
  await page.waitForSelector('.idnty-sel-sheet', { state: 'detached', timeout: 5000 }).catch(() => undefined);
  await capture('V-04-mobile-after-select', page, '#df-industry', 'OTHER selected, sheet closed');
  await page.locator('#df-industry').click();
  await page.waitForSelector('.idnty-sel-sheet__panel');
  await capture('V-03-mobile-current-selection', page, '.idnty-sel-sheet__panel', 'Sheet with OTHER selected');
  await page.locator('.idnty-sel-sheet__cancel').click({ force: true });
  await page.waitForTimeout(400);
  await capture('V-05-mobile-after-cancel', page, '#df-industry', 'Cancel preserves OTHER');
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(300);
  await capture('V-07-mobile-landscape', page, '#df-industry', '844×390 landscape');
  await page.close();
}

// Desktop listbox
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${base}/foundation/review#df-r-P02`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('#df-industry', { timeout: 60000 });
  await capture('V-10-desktop-closed', page, '#df-industry', '1440×900 fine pointer');
  await page.locator('#df-industry').click();
  await page.waitForSelector('.df-select__list:not([hidden])', { timeout: 5000 });
  await capture('V-11-desktop-listbox-open', page, '#df-industry', 'Anchored listbox open');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await capture('V-12-desktop-keyboard-highlight', page, '.df-select__option--active', 'Keyboard highlight');
  await page.close();
}

await browser.close();
writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(meta, null, 2));
console.log(JSON.stringify({ outDir, shots: meta.length }, null, 2));
