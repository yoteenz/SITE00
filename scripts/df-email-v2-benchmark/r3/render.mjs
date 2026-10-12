// Email V2 R3 — render each composition at mobile, tablet and desktop widths, with web fonts and with
// web fonts blocked (fallback stacks only), and fail on missing assets or any horizontal overflow.
// Usage: node render.mjs [B02]   ·   R3_OUT=/path node render.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const emails = path.join(here, 'emails');
const out = process.env.R3_OUT ?? '/tmp/SITE00_EMAIL_V2_R3/RENDERS';
const only = process.argv[2];

const IDS = fs
  .readdirSync(emails)
  .filter((f) => /^B0\d_R3\.html$/.test(f))
  .map((f) => f.replace(/\.html$/, ''))
  .filter((id) => !only || id.startsWith(only))
  .sort();

const VIEWS = [
  { name: 'MOBILE', width: 390 },
  { name: 'TABLET', width: 768 },
  { name: 'DESKTOP', width: 1024 },
];

const report = [];
const browser = await chromium.launch({ headless: true });
for (const id of IDS) {
  for (const fallback of [false, true]) {
    for (const view of VIEWS) {
      const page = await browser.newPage({ viewport: { width: view.width, height: 900 }, deviceScaleFactor: 2 });
      const failed = [];
      page.on('requestfailed', (r) => {
        if (!(fallback && /\.(ttf|woff2?)$/.test(r.url()))) failed.push(r.url());
      });
      if (fallback) await page.route(/\.(ttf|woff2?)$/, (r) => r.abort());
      await page.goto(pathToFileURL(path.join(emails, `${id}.html`)).href, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const fonts = await page.evaluate(() => ({
        saira: document.fonts.check('400 16px "Saira Semi Condensed"') && [...document.fonts].some((f) => f.family.includes('Saira') && f.status === 'loaded'),
        barlow: [...document.fonts].some((f) => f.family.includes('Barlow') && f.status === 'loaded'),
      }));
      if (!fallback && !(fonts.saira && fonts.barlow)) throw new Error(`${id} ${view.name}: web fonts did not load ${JSON.stringify(fonts)}`);
      if (fallback && (fonts.saira || fonts.barlow)) throw new Error(`${id} ${view.name}: fallback run still loaded web fonts`);
      const broken = await page.evaluate(() =>
        [...document.images].filter((i) => i.offsetParent && (!i.complete || i.naturalWidth === 0)).map((i) => i.getAttribute('src')),
      );
      if (broken.length || failed.length) throw new Error(`${id} ${view.name}: missing assets ${[...broken, ...failed].join(', ')}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const escapes = await page.evaluate(() => {
        const wrap = document.querySelector('table.wrap').getBoundingClientRect();
        return [...document.querySelectorAll('table.wrap *')]
          .filter((el) => el.offsetParent && el.getClientRects().length)
          .map((el) => ({ el, r: el.getBoundingClientRect() }))
          .filter(({ r }) => r.width && (r.right > wrap.right + 0.5 || r.left < wrap.left - 0.5))
          .map(({ el, r }) => `${el.tagName}.${el.className} ${Math.round(r.left - wrap.left)}..${Math.round(r.right - wrap.left)}/${Math.round(wrap.width)}`)
          .slice(0, 6);
      });
      const height = await page.evaluate(() => Math.round(document.querySelector('table.wrap').getBoundingClientRect().height));
      const mode = fallback ? 'FALLBACK' : 'WEBFONT';
      const row = { id, view: view.name, width: view.width, mode, overflow, escapes, height, fonts };
      report.push(row);
      if (overflow > 0 || escapes.length) {
        console.error(`FAIL ${mode} ${view.name} ${id}: overflow ${overflow}px`, escapes);
        process.exitCode = 1;
      }
      const dest = path.join(out, fallback ? `FALLBACK_${view.name}` : view.name, `${id}_${view.name}${fallback ? '_FALLBACK' : ''}.png`);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      await page.locator('.stage').screenshot({ path: dest });
      await page.close();
      console.log(`${mode.padEnd(8)} ${view.name.padEnd(7)} ${id} ${height}px tall · ${Math.round(fs.statSync(dest).size / 1024)} KB`);
    }
  }
}
await browser.close();
fs.writeFileSync(path.join(out, 'render_report.json'), JSON.stringify(report, null, 2));
