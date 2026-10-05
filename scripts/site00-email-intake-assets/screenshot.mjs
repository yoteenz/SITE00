// Screenshots rendered intake-access HTML at required breakpoints for visual QA.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const OUT = '/tmp/site00-intake-render/shots';
await mkdir(OUT, { recursive: true });

const widths = [375, 390, 430, 640];
const pages = [
  { name: 'builder', file: '/tmp/site00-intake-render/builder.html' },
  { name: 'identity', file: '/tmp/site00-intake-render/identity.html' },
];

const browser = await chromium.launch();
for (const p of pages) {
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 1400 } });
    await page.goto(`file://${p.file}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/${p.name}-${w}.png`, fullPage: true });
    await page.close();
    console.log(`${p.name} @ ${w} done`);
  }
}
await browser.close();
