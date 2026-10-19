#!/usr/bin/env node
/**
 * IDNTY founder workspace visual authority — board renderer (Opus 1).
 *
 * Renders ./src/board-*.html to PNG with the repository's Vite server and Playwright Chromium at 2×.
 * Boards link the live DF stylesheets read-only and the proposal sheet ./src/fw.css (prefix fw-), which the
 * application never imports. Real values (icons, BUSINESS_TYPES, view labels, add-on catalog + base price,
 * DOMAIN_PATHS, disclosures, validation copy) and the DF threshold objects (server-rendered from objects.tsx)
 * are loaded from source at render time and handed to the page as window.__DF. Client identities on the boards
 * are fictional DEMO identities and are labelled as such.
 *
 * Usage (repo root): node docs/site00/idnty/founder-workspace-visual-authority-opus1/boards/render-boards.mjs [id ...]
 */
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../../../..');
const srcDir = join(here, 'src');

const BOARDS = readdirSync(srcDir)
  .filter((f) => /^board-\d\d[a-z]?-.+\.html$/.test(f))
  .sort()
  .map((file) => ({ id: file.match(/^board-(\d\d[a-z]?)-/)[1], file, out: file.replace(/\.html$/, '.png') }));

async function loadData(server) {
  const model = await server.ssrLoadModule('/src/site00/foundation-client/model.ts');
  const glyphs = await server.ssrLoadModule('/src/site00/foundation-client/icons/glyphs.ts');
  const meta = await server.ssrLoadModule('/src/site00/foundation-client/icons/meta.ts');
  const catalog = await server.ssrLoadModule('/shared/site00-digital-foundation/addonCatalog.ts');
  const commercial = await server.ssrLoadModule('/shared/site00-digital-foundation/commercialConfig.ts');
  const objects = await server.ssrLoadModule('/src/site00/foundation-client/objects.tsx');
  const req = createRequire(join(repo, 'package.json'));
  const React = req('react');
  const ReactDOMServer = req('react-dom/server');
  const aliases = {};
  for (const item of [...meta.DF_ICON_CATALOG, ...meta.DF_ICON_LEGACY_EXTRAS]) {
    aliases[item.id] = item.id;
    for (const a of item.aliases ?? []) aliases[a] = item.id;
  }
  const render = (C, props = {}) => ReactDOMServer.renderToStaticMarkup(React.createElement(C, props));
  const config = commercial.defaultDigitalFoundationCommercialConfig();
  return {
    glyphs: glyphs.DF_ICON_GLYPHS,
    aliases,
    BUSINESS_TYPES: model.BUSINESS_TYPES,
    DOMAIN_PATHS: model.DOMAIN_PATHS,
    DF_DISCLOSURES: model.DF_DISCLOSURES,
    VIEW_META: model.DF_VIEW_META,
    REVIEW_STATE_LABEL: model.REVIEW_STATE_LABEL,
    ACTIVATION_STATE_LABEL: model.ACTIVATION_STATE_LABEL,
    config,
    addons: catalog.buildDefaultAddonCatalog().map((a) => ({
      id: a.addon_id,
      price_minor_units: a.price_minor_units,
      quantity_unit: Boolean(a.quantity_unit),
      manual_review: a.requires_manual_review,
      ...model.addonPresentation(a.addon_id),
    })),
    objects: {
      hero: render(objects.DfThresholdHero),
      crown: render(objects.DfCrownObject, { variant: 'OVERVIEW' }),
      corner: render(objects.DfCornerFragment),
    },
  };
}

async function main() {
  const only = new Set(process.argv.slice(2));
  const { createServer } = await import(join(repo, 'node_modules/vite/dist/node/index.js'));
  const { chromium } = await import(join(repo, 'node_modules/playwright/index.mjs'));
  const server = await createServer({ root: repo, logLevel: 'error', server: { port: 5241, strictPort: false } });
  await server.listen();
  const base = server.resolvedUrls.local[0].replace(/\/$/, '');
  const data = await loadData(server);
  if (process.env.FW_DUMP_DATA) writeFileSync(process.env.FW_DUMP_DATA, JSON.stringify(data));
  const exe = ['/opt/pw-browsers/chromium'].find((p) => existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const manifestPath = join(here, 'board-manifest.json');
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { boards: {} };
  try {
    for (const b of BOARDS) {
      if (only.size && !only.has(b.id)) continue;
      const page = await browser.newPage({ viewport: { width: 2400, height: 1000 }, deviceScaleFactor: 2 });
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
      await page.addInitScript(`window.__DF = ${JSON.stringify(data)};`);
      const url = `${base}/${relative(repo, join(srcDir, b.file)).split('\\').join('/')}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 });
      const fonts = await page.evaluate(async () => {
        await document.fonts.load('900 40px "SITE 00 Display"', 'FOUNDATIONS');
        await document.fonts.load('700 10px "Saira Semi Condensed"', 'REVIEW INTAKE');
        return {
          'SITE 00 Display': document.fonts.check('900 40px "SITE 00 Display"', 'FOUNDATIONS'),
          'Saira Semi Condensed': document.fonts.check('700 10px "Saira Semi Condensed"', 'REVIEW INTAKE'),
        };
      });
      // Uppercase audit: any visible application text node rendered in lowercase outside .fw-data / board chrome.
      const lowercase = await page.evaluate(() => {
        const bad = [];
        document.querySelectorAll('.fw').forEach((root) => {
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          let n;
          while ((n = walker.nextNode())) {
            const t = n.textContent.trim();
            if (!t || !/[a-z]/.test(t)) continue;
            const el = n.parentElement;
            if (el.closest('.fw-data')) continue;
            if (getComputedStyle(el).textTransform === 'uppercase') continue;
            bad.push(t.slice(0, 40));
          }
        });
        return bad.slice(0, 20);
      });
      const board = await page.$('#board');
      const out = join(here, b.out);
      await board.screenshot({ path: out });
      const buf = readFileSync(out);
      const box = await board.boundingBox();
      manifest.boards[b.id] = {
        source: `src/${b.file}`,
        image: b.out,
        css_px: [Math.round(box.width), Math.round(box.height)],
        image_px: [Math.round(box.width * 2), Math.round(box.height * 2)],
        bytes: buf.length,
        sha256: createHash('sha256').update(buf).digest('hex'),
        fonts_loaded: fonts,
        lowercase_app_text: lowercase,
        page_errors: errors,
      };
      const flags = [errors.length ? `ERRORS ${errors.join(' | ')}` : '', lowercase.length ? `LOWERCASE ${lowercase.join(' | ')}` : ''].filter(Boolean);
      console.log(`board ${b.id} → ${b.out} ${manifest.boards[b.id].image_px.join('×')} ${flags.length ? flags.join(' ') : 'ok'}`);
      await page.close();
    }
  } finally {
    await browser.close();
    await server.close();
  }
  manifest.renderer = 'boards/render-boards.mjs (Vite SSR data + Playwright Chromium, deviceScaleFactor 2)';
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
