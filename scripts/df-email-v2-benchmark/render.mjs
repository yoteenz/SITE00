// Email V2 benchmark — render each responsive email at desktop (600px column) and mobile (390px) at 2x.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(here, 'source');
const out = process.env.V2_OUT ?? '/tmp/SITE00_EMAIL_V2_BENCHMARK/RENDERS';
const only = process.argv[2];

const EMAILS = [
  'B01_personal-foundation-invitation',
  'B02_foundation-complete',
  'B03_M06-bldr-introduction',
].filter((id) => !only || id.startsWith(only));

const VIEWS = [
  { name: 'DESKTOP', width: 680 },
  { name: 'MOBILE', width: 390 },
];

const browser = await chromium.launch({ headless: true });
for (const id of EMAILS) {
  for (const view of VIEWS) {
    const page = await browser.newPage({ viewport: { width: view.width, height: 900 }, deviceScaleFactor: 2 });
    await page.goto('file://' + path.join(source, `${id}.html`), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const fontsOk = await page.evaluate(() => document.fonts.check('600 16px "Saira Semi Condensed"'));
    if (!fontsOk) throw new Error(`Saira did not load for ${id}`);
    const broken = await page.evaluate(() =>
      [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute('src')),
    );
    if (broken.length) throw new Error(`broken images in ${id}: ${broken.join(', ')}`);
    const dest = path.join(out, view.name, `${id}_${view.name}.png`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    await page.locator('.stage').screenshot({ path: dest });
    await page.close();
    const { size } = fs.statSync(dest);
    console.log(`${view.name.padEnd(7)} ${id} ${Math.round(size / 1024)} KB`);
  }
}
await browser.close();
