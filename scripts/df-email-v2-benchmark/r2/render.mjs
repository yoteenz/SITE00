// Email V2 R2 — render the nine art-direction territories at mobile, tablet and desktop widths.
// Usage: node render.mjs [B02_A]   ·   R2_OUT=/path node render.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const territories = path.join(here, 'territories');
const out = process.env.R2_OUT ?? '/tmp/SITE00_EMAIL_V2_R2/RENDERS';
const only = process.argv[2];

const IDS = fs
  .readdirSync(territories)
  .filter((f) => f.endsWith('.html'))
  .map((f) => f.replace(/\.html$/, ''))
  .filter((id) => !only || id.startsWith(only))
  .sort();

const VIEWS = [
  { name: 'MOBILE', width: 390 },
  { name: 'TABLET', width: 768 },
  { name: 'DESKTOP', width: 1024 },
];

const browser = await chromium.launch({ headless: true });
for (const id of IDS) {
  for (const view of VIEWS) {
    const page = await browser.newPage({ viewport: { width: view.width, height: 900 }, deviceScaleFactor: 2 });
    const failed = [];
    page.on('requestfailed', (r) => failed.push(r.url()));
    await page.goto('file://' + path.join(territories, `${id}.html`), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const fontsOk = await page.evaluate(() => document.fonts.check('600 16px "Saira Semi Condensed"'));
    if (!fontsOk) throw new Error(`Saira did not load for ${id}`);
    const broken = await page.evaluate(() =>
      [...document.images].filter((i) => i.offsetParent && (!i.complete || i.naturalWidth === 0)).map((i) => i.getAttribute('src')),
    );
    if (broken.length || failed.length) throw new Error(`missing assets in ${id}: ${[...broken, ...failed].join(', ')}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) throw new Error(`${id} overflows ${view.name} by ${overflow}px`);
    const dest = path.join(out, view.name, `${id}_${view.name}.png`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    await page.locator('.stage').screenshot({ path: dest });
    await page.close();
    console.log(`${view.name.padEnd(7)} ${id} ${Math.round(fs.statSync(dest).size / 1024)} KB`);
  }
}
if (!only) {
  for (const f of fs.readdirSync(path.join(here, '..', 'source')).filter((n) => /^B0\d_.*\.html$/.test(n))) {
    const page = await browser.newPage({ viewport: { width: 768, height: 900 }, deviceScaleFactor: 2 });
    await page.goto('file://' + path.join(here, '..', 'source', f), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const dest = path.join(out, 'R1_TABLET', `${f.slice(0, 3)}_R1_TABLET.png`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    await page.locator('.stage').screenshot({ path: dest });
    await page.close();
    console.log(`R1      ${f.slice(0, 3)} ${Math.round(fs.statSync(dest).size / 1024)} KB`);
  }
}
await browser.close();
