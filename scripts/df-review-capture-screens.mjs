import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const out = '/opt/cursor/artifacts/df-review-canonical';
mkdirSync(out, { recursive: true });
const base = process.env.DF_REVIEW_BASE ?? 'http://127.0.0.1:5174';

const shots = [
  { hash: 'df-r-P03', name: 'builder-p03' },
  { hash: 'df-r-P03-domain', name: 'builder-p03-domain' },
  { hash: 'df-r-client-portal', name: 'client-portal-shell' },
  { hash: 'df-r-founder-reviews', name: 'founder-reviews-queue' },
  { hash: 'df-r-P04', name: 'recommendation-p04' },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
for (const { hash, name } of shots) {
  await page.goto(`${base}/foundation/review#${hash}`, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/${name}-mobile.png`, fullPage: true });
}
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(`${base}/foundation/review#df-r-founder-overview`, { waitUntil: 'networkidle', timeout: 120_000 });
await page.waitForTimeout(3000);
await page.screenshot({ path: `${out}/founder-overview-desktop.png`, fullPage: true });
await browser.close();
console.log('Wrote screenshots to', out);
