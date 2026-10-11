// Email V2 R3 — rasterise the vector sources into email-safe PNG fallbacks (2x).
// Inline SVG is unreliable across mail clients, so every icon and device ships as a PNG
// with the SVG kept as the editable source. Usage: node render_graphics.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const icons = path.join(here, 'graphics', 'icons');
const devices = path.join(here, 'graphics', 'devices');
const out = path.join(here, 'assets', 'gfx');
fs.mkdirSync(out, { recursive: true });

const fontCss = `
@font-face { font-family: "Saira Semi Condensed"; font-weight: 600; src: url("${pathToFileURL(path.join(here, '..', 'source', 'fonts', 'SairaSemiCondensed-600.ttf'))}"); }
html, body { margin: 0; background: transparent; }
`;

const browser = await chromium.launch({ headless: true });

async function shoot(html, selector, dest, { width = 1400, height = 1000, transparent = true } = {}) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
  const tmp = path.join(here, 'graphics', '.shot.html');
  fs.writeFileSync(tmp, `<!doctype html><meta charset="utf-8">${html}`);
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  fs.rmSync(tmp);
  await page.evaluate(() => document.fonts.ready);
  if (html.includes('<text') && !(await page.evaluate(() => document.fonts.check('600 16px "Saira Semi Condensed"')))) throw new Error(`Saira did not load for ${dest}`);
  await page.locator(selector).screenshot({ path: dest, omitBackground: transparent });
  await page.close();
  console.log(path.relative(here, dest), Math.round(fs.statSync(dest).size / 1024), 'KB');
}

for (const f of fs.readdirSync(icons).filter((n) => n.endsWith('.svg')).sort()) {
  const svg = fs.readFileSync(path.join(icons, f), 'utf8');
  await shoot(`<style>${fontCss}</style><div id="g" style="display:inline-block;line-height:0">${svg}</div>`, '#g', path.join(out, `icon-${f.replace('.svg', '.png')}`));
}

for (const f of ['completion-seal', 'plan-a-gallery', 'plan-b-courtyard', 'plan-c-open-hall']) {
  const svg = fs.readFileSync(path.join(devices, `${f}.svg`), 'utf8');
  await shoot(`<style>${fontCss}</style><div id="g" style="display:inline-block;line-height:0">${svg}</div>`, '#g', path.join(out, `${f}.png`), { transparent: false });
}

{
  const overlay = fs.readFileSync(path.join(devices, 'interior-annotations.svg'), 'utf8');
  const img = pathToFileURL(path.join(here, 'assets', 'inside.jpg'));
  const html = `<!doctype html><meta charset="utf-8"><style>${fontCss} #g{position:relative;width:580px;height:340px;line-height:0} #g img,#g svg{position:absolute;inset:0;width:580px;height:340px}</style>
    <div id="g"><img src="${img}">${overlay}</div>`;
  const tmp = path.join(here, 'graphics', 'devices', '.compose-interior.html');
  fs.writeFileSync(tmp, html);
  const page = await browser.newPage({ viewport: { width: 700, height: 400 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  fs.rmSync(tmp);
  if (!(await page.evaluate(() => document.images[0].naturalWidth > 0))) throw new Error('inside.jpg did not load');
  await page.evaluate(() => document.fonts.ready);
  const dest = path.join(out, 'inside-annotated.jpg');
  await page.locator('#g').screenshot({ path: dest, type: 'jpeg', quality: 86 });
  await page.close();
  console.log(path.relative(here, dest), Math.round(fs.statSync(dest).size / 1024), 'KB');
}

{
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.join(devices, 'lockups.html')).href, { waitUntil: 'load' });
  await page.waitForFunction(() => document.body.dataset.fitted === '1');
  const ok = await page.evaluate(() => document.fonts.check('900 40px "Barlow Condensed"'));
  if (!ok) throw new Error('Barlow Condensed 900 did not load for lockups');
  for (const id of ['groundwork', 'groundwork-m', 'bldr', 'bldr-m']) {
    const dest = path.join(out, `lockup-${id}.png`);
    await page.locator(`[data-lockup="${id}"]`).screenshot({ path: dest });
    console.log(path.relative(here, dest), Math.round(fs.statSync(dest).size / 1024), 'KB');
  }
  await page.close();
}

await browser.close();
