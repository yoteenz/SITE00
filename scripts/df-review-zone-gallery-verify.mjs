import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const out = '/opt/cursor/artifacts/df-review-zone-gallery';
mkdirSync(out, { recursive: true });
const base = process.env.DF_REVIEW_BASE ?? 'http://127.0.0.1:5174';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto(`${base}/foundation/review`, { waitUntil: 'networkidle', timeout: 120_000 });
await page.waitForSelector('#df-review-gallery [data-review-gallery-section]', { timeout: 60_000 });
await page.waitForTimeout(1500);

const inGallery = () => page.locator('#df-review-gallery [data-review-gallery-section]');
const intakeSections = await inGallery().count();
const hasStage = (await page.locator('.df-review__strip--stage').count()) === 0;
const hasContinuous = (await page.locator('.df-review__strip--continuous').count()) === 1;

await page.screenshot({ path: `${out}/intake-zone-scroll.png`, fullPage: true });

await page.getByRole('tab', { name: /CLIENT QUEUE/i }).click();
await page.waitForTimeout(3500);
const clientSections = await inGallery().count();
await page.screenshot({ path: `${out}/client-zone-scroll.png`, fullPage: true });

await page.getByRole('tab', { name: /FOUNDER DASHBOARD/i }).click();
await page.waitForTimeout(3500);
const founderSections = await inGallery().count();
await page.screenshot({ path: `${out}/founder-zone-top.png`, fullPage: false });

const report = {
  intakeSections,
  clientSections,
  founderSections,
  hasStage,
  hasContinuous,
  pass:
    hasContinuous &&
    hasStage &&
    intakeSections >= 8 &&
    clientSections >= 15 &&
    founderSections >= 40 &&
    intakeSections !== clientSections,
};
writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

await browser.close();
process.exit(report.pass ? 0 : 1);
