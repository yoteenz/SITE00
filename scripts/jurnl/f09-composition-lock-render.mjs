/**
 * P0.JURNL.F09-SAFE-TO-SPEND.CREATIVE-DIRECTION-BRAND-EXPRESSION-CORRECTION1 — render the F09 composition locks (9:16).
 * For each territory: a labelled LOCK diagram (documentation) and an unlabelled VALUE study (the composition reference a
 * reference-guided renderer receives). These are locks, not candidates.
 *
 *   node scripts/jurnl/f09-composition-lock-render.mjs
 */
import { chromium } from 'playwright';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DIR = join(ROOT, 'JURNL/F09_SAFE/CREATIVE_DIRECTION_CORRECTION1/COMPOSITION_LOCKS');
const NAMES = { 1: 'T01_SURVEYED_COURTYARD', 2: 'T02_ANSWER_IN_RAKING_LIGHT', 3: 'T03_SORTING_RACK' };

const exe = [process.env.JURNL_QA_CHROMIUM, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].filter(Boolean).find((p) => existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await (await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })).newPage();
const url = pathToFileURL(join(DIR, 'source/lock.html')).href;
const out = [];
for (const t of [1, 2, 3]) {
  for (const labels of [1, 0]) {
    await page.goto(`${url}?t=${t}&labels=${labels}`);
    await page.evaluate(() => document.fonts.ready);
    const file = join(DIR, `F09_${NAMES[t]}_${labels ? 'LOCK' : 'VALUE_STUDY'}_9x16.png`);
    await page.screenshot({ path: file });
    out.push(file.slice(ROOT.length + 1));
  }
}
const board = await (await browser.newContext({ viewport: { width: 1200, height: 760 }, deviceScaleFactor: 2 })).newPage();
const uri = (f) => `data:image/png;base64,${readFileSync(join(ROOT, f)).toString('base64')}`;
const locks = out.filter((f) => f.includes('_LOCK_'));
await board.setContent(`<body style="margin:0;background:#EDE7DC;display:flex;gap:24px;padding:24px;font:500 12px/1 sans-serif;letter-spacing:.14em;color:#6b5f52">${locks
  .map((f) => `<figure style="margin:0"><img src="${uri(f)}" style="width:360px;height:640px;display:block"><figcaption style="padding-top:8px">${f.split('/').pop().replace('_LOCK_9x16.png', '').replace(/_/g, ' ')}</figcaption></figure>`)
  .join('')}</body>`);
await board.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
await board.screenshot({ path: join(DIR, 'F09_COMPOSITION_LOCK_BOARD.png'), fullPage: true });
out.push(join(DIR, 'F09_COMPOSITION_LOCK_BOARD.png').slice(ROOT.length + 1));
await browser.close();
console.log(out.join('\n'));
