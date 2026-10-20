import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const out = '/opt/cursor/artifacts/df-review-gallery-restoration';
mkdirSync(out, { recursive: true });
const base = process.env.DF_REVIEW_BASE ?? 'http://127.0.0.1:5174';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto(`${base}/foundation/review`, { waitUntil: 'networkidle', timeout: 120_000 });
await page.waitForTimeout(4000);

const sectionCount = await page.locator('[data-review-gallery-section]').count();
const mountedItems = await page.locator('.df-review__item:not(.df-review__item--placeholder)').count();
const yourNew = await page.locator('text=YOUR NEW').count();

await page.screenshot({ path: `${out}/A-initial-gallery-mobile.png`, fullPage: true });

await page.getByRole('button', { name: /SHOW REGISTRY/i }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}/B-registry-open-mobile.png`, fullPage: false });

await page.getByRole('link', { name: /Project overview/i }).first().click();
await page.waitForTimeout(2000);
const afterJumpItems = await page.locator('.df-review__item:not(.df-review__item--placeholder)').count();
await page.screenshot({ path: `${out}/G-registry-jump-overview.png`, fullPage: true });

await page.goto(`${base}/foundation/review#df-r-P03`, { waitUntil: 'networkidle', timeout: 120_000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}/C-builder-p03.png`, fullPage: false });

await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(`${base}/foundation/review`, { waitUntil: 'networkidle', timeout: 120_000 });
await page.waitForTimeout(3000);
await page.screenshot({ path: `${out}/I-desktop-gallery-top.png`, fullPage: true });

await browser.close();

const pass = sectionCount >= 40 && mountedItems >= 5 && yourNew >= 1 && afterJumpItems >= 5;
console.log(
  JSON.stringify({ sectionCount, mountedItems, yourNew, afterJumpItems, pass, out }, null, 2),
);
process.exit(pass ? 0 : 1);
