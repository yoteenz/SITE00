/**
 * Contact-sheet board for JURNL QA screenshots (no image library needed: an HTML grid screenshotted by Chromium).
 * Usage: node scripts/jurnl/qa-board.mjs <out.jpg> <columns> <cellWidthPx> <title> <image[::label]>...
 */
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { qaChromiumPath } from './qa-env.mjs';

const [out, cols, cellW, title, ...items] = process.argv.slice(2);
if (!out || !cols || !cellW || !items.length) throw new Error('usage: <out.jpg> <columns> <cellWidthPx> <title> <image[::label]>...');
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const cells = items
  .map((it) => {
    const [path, label = path.split('/').pop()] = it.split('::');
    const data = readFileSync(path).toString('base64');
    const mime = path.endsWith('.png') ? 'image/png' : 'image/jpeg';
    return `<figure><figcaption>${esc(label)}</figcaption><img src="data:${mime};base64,${data}"></figure>`;
  })
  .join('');
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:16px;background:#ece6dc;font:600 13px/1.3 system-ui,sans-serif;color:#2a1f1f;width:max-content}
h1{margin:0 0 12px;font-size:16px;letter-spacing:.12em}
main{display:grid;grid-template-columns:repeat(${Number(cols)},${Number(cellW)}px);gap:14px}
figure{margin:0}figcaption{margin:0 0 6px;letter-spacing:.06em}img{display:block;width:100%;border:1px solid #b6a594}
</style><h1>${esc(title)}</h1><main>${cells}</main>`;
const browser = await chromium.launch({ executablePath: qaChromiumPath() });
const page = await browser.newPage({ viewport: { width: 400, height: 300 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: out, type: 'jpeg', quality: 82, fullPage: true });
await browser.close();
console.log(out);
