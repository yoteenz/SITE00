import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { DF_ICON_CATALOG, DF_ICON_FAMILIES, DF_ICON_LEGACY_EXTRAS } from '../../src/site00/foundation-client/icons/meta.ts';
import { DF_ICON_GLYPHS } from '../../src/site00/foundation-client/icons/glyphs.ts';

const TONE: Record<string, string> = {
  muted: '#8A8A8A',
  danger: '#E50107',
  success: '#1B7F4E',
  warning: '#E08A1E',
};

function svg(id: string, px: number, tone?: string) {
  const color = tone ? TONE[tone] ?? '#0A0A0A' : '#0A0A0A';
  const raw = DF_ICON_GLYPHS[id]
    .split('{{step}}')
    .join(id === 'stepCurrent' ? '1' : id === 'stepUpcoming' ? '2' : '3')
    .split('{{progress}}')
    .join('9');
  return `<svg viewBox="0 0 24 24" width="${px}" height="${px}" fill="none" stroke="currentColor" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" style="color:${color}">${raw}</svg>`;
}

const families = DF_ICON_FAMILIES.map((family) => {
  const icons = DF_ICON_CATALOG.filter((icon) => icon.family === family.id);
  const cells = icons
    .map(
      (icon) =>
        `<div class="cell">${svg(icon.id, 28, icon.tone)}<span>${icon.label}</span></div>`,
    )
    .join('');
  return `<section><h2>${family.label}</h2><div class="grid">${cells}</div></section>`;
}).join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;background:#fff;color:#0a0a0a;font:11px/1.2 Arial,sans-serif}
  header{display:flex;justify-content:space-between;padding:28px 36px 12px;border-bottom:1px solid #e6e6e6}
  h1{font-size:22px;letter-spacing:.18em;margin:0}
  p{margin:4px 0 0;letter-spacing:.14em;font-size:11px}
  main{display:grid;grid-template-columns:1fr 1fr;gap:0 28px;padding:12px 36px 36px}
  section{border-top:1px solid #eee;padding:14px 0}
  h2{font-size:12px;letter-spacing:.12em;margin:0 0 10px}
  .grid{display:flex;flex-wrap:wrap;gap:14px 10px}
  .cell{width:78px;text-align:center}
  .cell span{display:block;margin-top:6px;font-size:9px;letter-spacing:.06em}
  .sizes{display:flex;gap:18px;align-items:end;padding:8px 36px 20px}
</style></head><body>
<header><div><h1>SITE 00</h1><p>DIGITAL FOUNDATION</p></div><div><h1>ICON LIBRARY</h1><p>IMPLEMENTED SVG REGISTRY</p></div></header>
<div class="sizes">${[16, 20, 24, 32].map((n) => `<div>${svg('domain', n)}<div>${n}PX</div></div>`).join('')}</div>
<main>${families}</main>
</body></html>`;

const outDir = '/opt/cursor/artifacts/df-icons';
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/contact-sheet.html`, html);

const manifest = {
  families: DF_ICON_FAMILIES.length,
  icons: DF_ICON_CATALOG.length,
  legacyExtras: DF_ICON_LEGACY_EXTRAS.map((i) => i.id),
  aliases: DF_ICON_CATALOG.flatMap((i) => (i.aliases ?? []).map((alias) => ({ alias, id: i.id }))),
  catalog: DF_ICON_CATALOG,
};
writeFileSync('docs/site00/idnty/DIGITAL_FOUNDATION_ICON_MANIFEST.json', JSON.stringify(manifest, null, 2));

const svgDir = 'public/site00/idnty/digital-foundation/icons';
mkdirSync(svgDir, { recursive: true });
for (const icon of DF_ICON_CATALOG) {
  const body = DF_ICON_GLYPHS[icon.id].split('{{step}}').join('1').split('{{progress}}').join('9');
  const file = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  writeFileSync(join(svgDir, `${icon.id}.svg`), file);
}

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const page = await browser.newPage({ viewport: { width: 1400, height: 1800 }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: `${outDir}/svg-contact-sheet.png`, fullPage: true });
await browser.close();
console.log('icons', DF_ICON_CATALOG.length, 'aliases', manifest.aliases.length);
