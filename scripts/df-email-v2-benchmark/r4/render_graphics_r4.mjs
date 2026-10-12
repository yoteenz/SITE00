// Email V2 R4 — rasterise the R4 icons and composites (2x). SVG and HTML stay as the editable sources.
// Usage: node render_graphics_r4.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const icons = path.join(here, 'graphics', 'icons');
const out = path.join(here, 'assets', 'gfx');
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true });

for (const f of fs.readdirSync(icons).filter((n) => n.endsWith('.svg')).sort()) {
  const page = await browser.newPage({ viewport: { width: 200, height: 200 }, deviceScaleFactor: 2 });
  const tmp = path.join(icons, '.shot.html');
  fs.writeFileSync(tmp, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:transparent}</style><div id="g" style="display:inline-block;line-height:0">${fs.readFileSync(path.join(icons, f), 'utf8')}</div>`);
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  fs.rmSync(tmp);
  const dest = path.join(out, `icon-${f.replace('.svg', '.png')}`);
  await page.locator('#g').screenshot({ path: dest, omitBackground: true });
  await page.close();
  console.log(path.relative(here, dest));
}

{
  const page = await browser.newPage({ viewport: { width: 800, height: 1400 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(path.join(here, 'graphics', 'composites.html')).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const ok = await page.evaluate(() => document.fonts.check('900 40px "Barlow Condensed"') && [...document.images].every((i) => i.naturalWidth > 0));
  if (!ok) throw new Error('composite fonts or images did not load');
  for (const id of ['cover', 'section']) {
    const dest = path.join(out, `${id}-r4.jpg`);
    await page.locator(`[data-shot="${id}"]`).screenshot({ path: dest, type: 'jpeg', quality: 84 });
    console.log(path.relative(here, dest), Math.round(fs.statSync(dest).size / 1024), 'KB');
  }
  await page.close();
}

await browser.close();
