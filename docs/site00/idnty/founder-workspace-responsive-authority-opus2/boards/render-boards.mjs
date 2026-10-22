#!/usr/bin/env node
/**
 * IDNTY founder workspace RESPONSIVE authority — board renderer (Opus 2).
 *
 * Renders ./src/board-<ID>-*.html to PNG with the repository's Vite server and Playwright Chromium at 2×.
 * Each board embeds live specimens (./src/specimen.html) in iframes laid out at their true viewport widths.
 * Real icons, threshold objects and commercial config are loaded from source (lib.mjs → window.__DF, injected
 * into every frame). Client identities are fictional and labelled illustrative. The application never imports
 * anything from this folder.
 *
 * Usage (repo root): node docs/site00/idnty/founder-workspace-responsive-authority-opus2/boards/render-boards.mjs [D01 TP03 ...]
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { here, repo, start, measure } from './lib.mjs';

const srcDir = join(here, 'src');
const outDir = join(here, 'png');
mkdirSync(outDir, { recursive: true });
const BOARDS = readdirSync(srcDir)
  .filter((f) => /^board-(D|TP|TL|C)\d\d-.+\.html$/.test(f))
  .sort()
  .map((file) => ({ id: file.match(/^board-([A-Z]+\d\d)-/)[1], file, out: file.replace(/\.html$/, '.png') }));

const only = new Set(process.argv.slice(2));
const { base, data, browser, close } = await start(5245);
const manifestPath = join(here, 'board-manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { boards: {} };
try {
  for (const b of BOARDS) {
    if (only.size && !only.has(b.id)) continue;
    const page = await browser.newPage({ viewport: { width: 1700, height: 1000 }, deviceScaleFactor: 2 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
    await page.addInitScript(`window.__DF = ${JSON.stringify(data)};`);
    await page.goto(`${base}/${relative(repo, join(srcDir, b.file)).split('\\').join('/')}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 120000 });
    const audit = await page.evaluate(async () => {
      const frames = [...document.querySelectorAll('iframe')];
      const lower = [];
      const fonts = { 'SITE 00 Display': true, 'Saira Semi Condensed': true };
      for (const f of frames) {
        const d = f.contentDocument;
        if (!d) continue;
        fonts['SITE 00 Display'] &&= d.fonts.check('900 40px "SITE 00 Display"', 'FOUNDATIONS');
        fonts['Saira Semi Condensed'] &&= d.fonts.check('700 12px "Saira Semi Condensed"', 'REVIEW');
        const walker = d.createTreeWalker(d.body, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = walker.nextNode())) {
          const t = n.textContent.trim();
          if (!t || !/[a-z]/.test(t)) continue;
          const el = n.parentElement;
          if (el.closest('.ws-data, .ws-data--nowrap, .ws-read, script, style')) continue;
          if (getComputedStyle(el).textTransform === 'uppercase') continue;
          lower.push(t.slice(0, 40));
        }
      }
      return { frames: window.__BOARD_FRAMES, fonts, lower: [...new Set(lower)].slice(0, 20) };
    });
    // Per-frame layout checks inside every live specimen on the board (same measure() as audit-layout.mjs).
    const frameChecks = [];
    for (const f of page.frames()) {
      if (f === page.mainFrame() || !f.url().includes('specimen.html')) continue;
      const m = await f.evaluate(measure);
      const hard = ['overflow', 'collision', 'dimensions', 'inspector', 'truncation', 'multiline', 'minText', 'fonts'].filter((k) => m[k].length);
      frameChecks.push({ q: decodeURIComponent(f.url().split('?')[1] ?? ''), viewport: await f.evaluate(() => `${innerWidth}x${innerHeight}`), hard, stretch: m.stretch.length });
    }
    const board = await page.$('#board');
    const out = join(outDir, b.out);
    await board.screenshot({ path: out });
    const buf = readFileSync(out);
    const box = await board.boundingBox();
    manifest.boards[b.id] = {
      source: `src/${b.file}`,
      image: `png/${b.out}`,
      css_px: [Math.round(box.width), Math.round(box.height)],
      image_px: [Math.round(box.width * 2), Math.round(box.height * 2)],
      bytes: buf.length,
      sha256: createHash('sha256').update(buf).digest('hex'),
      live_frames: audit.frames,
      fonts_loaded: audit.fonts,
      lowercase_app_text: audit.lower,
      page_errors: errors,
      frame_layout: { frames: frameChecks.length, failing: frameChecks.filter((x) => x.hard.length) },
    };
    const flags = [errors.length ? `ERRORS ${errors.join(' | ')}` : '', audit.lower.length ? `LOWERCASE ${audit.lower.join(' | ')}` : '', audit.frames.ready !== audit.frames.total ? `FRAMES ${audit.frames.ready}/${audit.frames.total}` : '', frameChecks.some((x) => x.hard.length) ? `LAYOUT ${frameChecks.filter((x) => x.hard.length).map((x) => `${x.q}@${x.viewport}:${x.hard.join('+')}`).join(' | ')}` : ''].filter(Boolean);
    console.log(`board ${b.id} → png/${b.out} ${manifest.boards[b.id].image_px.join('×')} frames ${audit.frames.ready}/${audit.frames.total} ${flags.length ? flags.join(' ') : 'ok'}`);
    await page.close();
  }
} finally {
  await close();
}
manifest.renderer = 'boards/render-boards.mjs (Vite SSR data + Playwright Chromium, deviceScaleFactor 2; live specimens in iframes at true viewport widths)';
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
