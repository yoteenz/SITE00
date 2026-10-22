import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const out = '/opt/cursor/artifacts/split-mark-alignment';
mkdirSync(out, { recursive: true });
const base = process.env.DF_REVIEW_BASE ?? 'http://127.0.0.1:5174';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(`${base}/bldr/studio/feel`, { waitUntil: 'networkidle', timeout: 120_000 });
await page.waitForTimeout(2000);
await page.screenshot({ path: `${out}/bldr-feel-headline-mobile.png`, fullPage: false });
await browser.close();
console.log('Wrote', `${out}/bldr-feel-headline-mobile.png`);
