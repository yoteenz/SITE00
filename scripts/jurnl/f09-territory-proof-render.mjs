/**
 * P0.JURNL.F09-SAFE-TO-SPEND.VISUAL-AUTHORITY-3-TERRITORY-PROOF1 — local render of the three F09 mobile reference-authority
 * candidates (393×852, CSS px) from hand-authored HTML / CSS / SVG sources. No provider, no paid generation, no legacy plate.
 *
 *   node scripts/jurnl/f09-territory-proof-render.mjs [--only t01,t02,t03]
 *
 * Outputs (under JURNL/F09_SAFE/VISUAL_AUTHORITY_3_TERRITORY_PROOF1/):
 *   REFERENCE_CANDIDATES/F09_T0n_*.png      the three candidates (device scale 3 → 1179×2556)
 *   BLUR_TEST/F09_T0n_*_IMAGERY_REMOVED.png  same page with every [data-imagery] layer removed (blur test evidence)
 *   BLUR_TEST/F09_T0n_*_IMAGERY_BLURRED.png  same page with imagery layers blurred 14px
 *   REFERENCE_CANDIDATES/F09_TERRITORY_BOARD.png  the three candidates side by side (review board, not a fourth candidate)
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PKG = join(ROOT, 'JURNL/F09_SAFE/VISUAL_AUTHORITY_3_TERRITORY_PROOF1');
const SRC = join(PKG, 'REFERENCE_CANDIDATES/source');
const OUT = join(PKG, 'REFERENCE_CANDIDATES');
const BLUR = join(PKG, 'BLUR_TEST');

export const F09_CANDIDATES = [
  { id: 't01', file: 'F09_T01_THE_OPEN_FLOOR_MOBILE_393x852.png' },
  { id: 't02', file: 'F09_T02_THE_PLAIN_ANSWER_MOBILE_393x852.png' },
  { id: 't03', file: 'F09_T03_THE_OPEN_ENVELOPE_MOBILE_393x852.png' },
];

function chromiumPath() {
  const candidates = [process.env.JURNL_QA_CHROMIUM, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].filter(Boolean);
  return candidates.find((p) => existsSync(p));
}

async function main() {
  const only = (process.argv.find((a) => a.startsWith('--only=')) ?? '').slice(7).split(',').filter(Boolean);
  mkdirSync(BLUR, { recursive: true });
  const exe = chromiumPath();
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();
  const ledger = [];
  for (const c of F09_CANDIDATES) {
    if (only.length && !only.includes(c.id)) continue;
    const url = pathToFileURL(join(SRC, `${c.id}.html`)).href;
    for (const mode of ['AUTHORITY', 'IMAGERY_REMOVED', 'IMAGERY_BLURRED']) {
      await page.goto(`${url}?mode=${mode}`);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate((m) => {
        if (m === 'IMAGERY_REMOVED') document.querySelectorAll('[data-imagery]').forEach((el) => (el.style.display = 'none'));
        if (m === 'IMAGERY_BLURRED') document.querySelectorAll('[data-imagery]').forEach((el) => (el.style.filter = 'blur(14px)'));
      }, mode);
      const overflow = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
      const name = mode === 'AUTHORITY' ? c.file : c.file.replace('.png', `_${mode}.png`);
      const path = join(mode === 'AUTHORITY' ? OUT : BLUR, name);
      await page.screenshot({ path, clip: { x: 0, y: 0, width: 393, height: 852 } });
      ledger.push({ id: c.id, mode, path: path.slice(ROOT.length + 1), page_scroll: overflow });
    }
  }
  if (!only.length) {
    // Review boards (not candidates): the three authorities side by side, and the imagery-removed blur-test row.
    const boardCtx = await browser.newContext({ viewport: { width: 1323, height: 960 }, deviceScaleFactor: 2 });
    const board = await boardCtx.newPage();
    const uri = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`;
    const boards = [
      ['F09_TERRITORY_BOARD.png', OUT, F09_CANDIDATES.map((c) => join(OUT, c.file)), 'TERRITORY'],
      ['F09_BLUR_TEST_BOARD.png', BLUR, F09_CANDIDATES.map((c) => join(BLUR, c.file.replace('.png', '_IMAGERY_REMOVED.png'))), 'IMAGERY REMOVED · TERRITORY'],
    ];
    for (const [name, dir, files, caption] of boards) {
      await board.setContent(`<body style="margin:0;background:#EDE7DC;display:flex;gap:24px;padding:30px 24px;font:500 11px/1 sans-serif;letter-spacing:.16em;color:#6b5f52">${files
        .map((f, i) => `<figure style="margin:0"><img src="${uri(f)}" style="width:393px;height:852px;display:block;box-shadow:0 1px 0 #cfc4b5"><figcaption style="padding-top:10px">${caption} 0${i + 1}</figcaption></figure>`)
        .join('')}</body>`);
      await board.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
      await board.screenshot({ path: join(dir, name), fullPage: true });
      ledger.push({ id: 'board', mode: 'REVIEW_BOARD', path: join(dir, name).slice(ROOT.length + 1) });
    }
    await boardCtx.close();
  }
  await browser.close();
  writeFileSync(join(PKG, 'RENDER_LOG.json'), `${JSON.stringify({ renderer: 'playwright chromium (local)', viewport: [393, 852], device_scale_factor: 3, paid_generation: false, provider: 'NONE', outputs: ledger }, null, 2)}\n`);
  console.log(JSON.stringify(ledger, null, 1));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
