import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const base = process.env.DF_CAPTURE_BASE ?? 'http://127.0.0.1:5174';
const out = '/opt/cursor/artifacts/df-phase1-portal';
mkdirSync(out, { recursive: true });

const viewports = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-834', width: 834, height: 1194 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

const browser = await chromium.launch();
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(`${base}/foundation/review`, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.screenshot({ path: join(out, `${vp.name}-review-index.png`), fullPage: true });
  await page.close();
}
await browser.close();
console.log('Saved captures to', out);
