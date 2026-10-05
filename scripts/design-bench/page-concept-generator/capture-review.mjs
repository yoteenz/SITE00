import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const html = readFileSync(
  new URL('../../../public/site00/page-concept-generator/staged/review.html', import.meta.url),
  'utf8',
);
const browser = await chromium.launch();

const desktop = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
await desktop.setContent(html, { waitUntil: 'load' });
await desktop.locator('#sheet').scrollIntoViewIfNeeded();
await desktop.screenshot({
  path: '/opt/cursor/artifacts/pcg-icon-sheet.png',
  fullPage: false,
});
await desktop.locator('#compare').scrollIntoViewIfNeeded();
await desktop.screenshot({
  path: '/opt/cursor/artifacts/pcg-icon-before-after.png',
  fullPage: false,
});
await desktop.locator('#preview').scrollIntoViewIfNeeded();
await desktop.screenshot({
  path: '/opt/cursor/artifacts/pcg-icon-panel-preview.png',
  fullPage: false,
});

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.setContent(html, { waitUntil: 'load' });
await mobile.locator('[data-testid="pcg-icon-preview"]').scrollIntoViewIfNeeded();
await mobile.locator('[data-testid="pcg-icon-preview"]').screenshot({
  path: '/opt/cursor/artifacts/pcg-icon-panel-preview-mobile.png',
  type: 'png',
});

await browser.close();
console.log('review artifacts saved');
