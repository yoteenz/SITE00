import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

mkdirSync('/opt/cursor/artifacts', { recursive: true });

const reviewUrl = `file://${join(dirname(fileURLToPath(import.meta.url)), '../../../public/site00/page-concept-generator/staged/review.html')}`;
const browser = await chromium.launch();

const desktop = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
await desktop.goto(reviewUrl, { waitUntil: 'load' });

await desktop.locator('#classify').scrollIntoViewIfNeeded();
await desktop.screenshot({
  path: '/opt/cursor/artifacts/pcg-cleanup2-classification.png',
  fullPage: false,
});

await desktop.locator('#tags').scrollIntoViewIfNeeded();
await desktop.screenshot({
  path: '/opt/cursor/artifacts/pcg-cleanup2-tags-chips.png',
  fullPage: false,
});

await desktop.locator('#sheet').scrollIntoViewIfNeeded();
await desktop.screenshot({
  path: '/opt/cursor/artifacts/pcg-cleanup2-icon-sheet.png',
  fullPage: false,
});

await desktop.locator('#compare').scrollIntoViewIfNeeded();
await desktop.screenshot({
  path: '/opt/cursor/artifacts/pcg-cleanup2-icon-before-after.png',
  fullPage: false,
});

await desktop.locator('#preview').scrollIntoViewIfNeeded();
await desktop.screenshot({
  path: '/opt/cursor/artifacts/pcg-cleanup2-panel-before-after.png',
  fullPage: false,
});

const before = await desktop.locator('[data-testid="pcg-icon-preview-before"]');
await before.scrollIntoViewIfNeeded();
await before.screenshot({ path: '/opt/cursor/artifacts/pcg-cleanup2-panel-before.png' });

const after = await desktop.locator('[data-testid="pcg-icon-preview"]');
await after.scrollIntoViewIfNeeded();
await after.screenshot({ path: '/opt/cursor/artifacts/pcg-cleanup2-panel-after.png' });

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(reviewUrl, { waitUntil: 'load' });
await mobile.locator('[data-testid="pcg-icon-preview"]').scrollIntoViewIfNeeded();
await mobile.locator('[data-testid="pcg-icon-preview"]').screenshot({
  path: '/opt/cursor/artifacts/pcg-cleanup2-panel-after-mobile.png',
  type: 'png',
});

await browser.close();
console.log('cleanup2 review artifacts saved');
