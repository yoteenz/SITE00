import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const pack = '/tmp/SITE00_DF_V2_EMAIL_PACK_LEAN';
const manifest = JSON.parse(fs.readFileSync(path.join(pack, 'MANIFESTS/DESIGN_ARCHETYPE_MAP.json'), 'utf8'));

const browser = await chromium.launch({ headless: true });
for (const row of manifest.templates) {
  for (const view of ['desktop', 'mobile']) {
    const html = path.join(pack, 'EDITABLE_SOURCE', `${String(row.index).padStart(2, '0')}_${row.template_id}`, `${view}.html`);
    const outRel = view === 'desktop' ? row.desktop : row.mobile;
    const out = path.join(pack, outRel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const page = await browser.newPage({
      viewport: { width: view === 'desktop' ? 688 : 390, height: 900 },
      deviceScaleFactor: 2,
    });
    await page.goto('file://' + html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const stage = page.locator('.stage');
    await stage.screenshot({ path: out });
    await page.close();
    const stat = fs.statSync(out);
    if (stat.size < 8000) throw new Error('small render ' + out);
    process.stdout.write(outRel + ' ' + stat.size + '\n');
  }
}
await browser.close();
console.log('rendered', manifest.templates.length * 2);
