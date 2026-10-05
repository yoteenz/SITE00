import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

mkdirSync('/opt/cursor/artifacts', { recursive: true });
const reviewUrl = `file://${join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../public/site00/page-concept-generator/staged/icons-only3/review.html',
)}`;

const browser = await chromium.launch();
const desktop = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
await desktop.goto(reviewUrl, { waitUntil: 'load' });

await desktop.locator('#manifest').scrollIntoViewIfNeeded();
await desktop.screenshot({ path: '/opt/cursor/artifacts/pcg-icons-only3-manifest.png' });

await desktop.locator('#sheet').scrollIntoViewIfNeeded();
await desktop.screenshot({ path: '/opt/cursor/artifacts/pcg-icons-only3-sheet.png' });

await desktop.locator('#compare').scrollIntoViewIfNeeded();
await desktop.screenshot({ path: '/opt/cursor/artifacts/pcg-icons-only3-icon-compare.png' });

const before = desktop.locator('[data-testid="pcg-icons-only3-before"]');
await before.scrollIntoViewIfNeeded();
await before.screenshot({ path: '/opt/cursor/artifacts/pcg-icons-only3-panel-before.png' });

const after = desktop.locator('[data-testid="pcg-icons-only3-after"]');
await after.scrollIntoViewIfNeeded();
await after.screenshot({ path: '/opt/cursor/artifacts/pcg-icons-only3-panel-after.png' });

await desktop.locator('#preview').scrollIntoViewIfNeeded();
await desktop.screenshot({ path: '/opt/cursor/artifacts/pcg-icons-only3-panel-compare.png' });

await browser.close();
console.log('icons-only3 artifacts saved');
