#!/usr/bin/env node
/**
 * IDNTY form-control visual authority — board renderer (Opus 1).
 *
 * Renders the HTML boards in ./src to PNG with the repository's own Vite server and Playwright Chromium.
 * Boards link the live Digital Foundation stylesheets read-only (src/site00/styles/site00-df-client.css,
 * site00-df-components.css) so existing states are shown exactly as they ship. Proposed treatments live in
 * ./src/proposal.css under the `ix-` prefix and are never imported by the application.
 *
 * Real data, not fabricated: icon glyphs, BUSINESS_TYPES, DOMAIN_PATHS, DF_DISCLOSURES, view labels, menu
 * states and validation messages are loaded from the source modules through Vite's SSR loader and handed to
 * the page as window.__DF.
 *
 * Usage (from the repository root):  node docs/site00/idnty/form-control-visual-authority-opus1/boards/render-boards.mjs [board-id ...]
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../../../..');
const srcDir = join(here, 'src');

export const BOARDS = [
  { id: '01a', file: 'board-01a-selector-territories-mobile.html', out: 'board-01a-selector-territories-mobile.png' },
  { id: '01b', file: 'board-01b-selector-territories-desktop.html', out: 'board-01b-selector-territories-desktop.png' },
  { id: '02', file: 'board-02-text-input-system.html', out: 'board-02-text-input-system.png' },
  { id: '03', file: 'board-03-choice-control-system.html', out: 'board-03-choice-control-system.png' },
  { id: '04', file: 'board-04-progression-system.html', out: 'board-04-progression-system.png' },
  { id: '05', file: 'board-05-validation-feedback.html', out: 'board-05-validation-feedback.png' },
  { id: '06', file: 'board-06-mobile-interaction-states.html', out: 'board-06-mobile-interaction-states.png' },
  { id: '07', file: 'board-07-component-system-overview.html', out: 'board-07-component-system-overview.png' },
];

async function loadData(server) {
  const model = await server.ssrLoadModule('/src/site00/foundation-client/model.ts');
  const glyphs = await server.ssrLoadModule('/src/site00/foundation-client/icons/glyphs.ts');
  const meta = await server.ssrLoadModule('/src/site00/foundation-client/icons/meta.ts');
  const aliases = {};
  for (const item of [...meta.DF_ICON_CATALOG, ...meta.DF_ICON_LEGACY_EXTRAS]) {
    aliases[item.id] = item.id;
    for (const a of item.aliases ?? []) aliases[a] = item.id;
  }
  const blank = {
    business_name: '',
    industry: '',
    contact_name: '',
    current_email: '',
    phone: '',
    domainPath: null,
    existing_domain: '',
    existing_registrar: '',
  };
  const empty = model.validateBusinessInfo(blank);
  const badEmail = model.validateBusinessInfo({ ...blank, current_email: 'founder@' });
  const noPath = model.validateForRecommendation({ ...blank, business_name: 'X', contact_name: 'X', current_email: 'a@b.co' });
  const ownBlank = model.validateForRecommendation({ ...blank, business_name: 'X', contact_name: 'X', current_email: 'a@b.co', domainPath: 'OWN' });
  const ownBad = model.validateForRecommendation({
    ...blank,
    business_name: 'X',
    contact_name: 'X',
    current_email: 'a@b.co',
    domainPath: 'OWN',
    existing_domain: 'jurnl',
  });
  const menu = model.buildDfMenu(['P01', 'P02', 'P03'], 'P02');
  const catalog = await server.ssrLoadModule('/shared/site00-digital-foundation/addonCatalog.ts');
  const addons = catalog.buildDefaultAddonCatalog().map((a) => ({
    id: a.addon_id,
    price_minor_units: a.price_minor_units,
    quantity_unit: Boolean(a.quantity_unit),
    manual_review: a.requires_manual_review,
    ...model.addonPresentation(a.addon_id),
  }));
  return {
    glyphs: glyphs.DF_ICON_GLYPHS,
    aliases,
    BUSINESS_TYPES: model.BUSINESS_TYPES,
    DOMAIN_PATHS: model.DOMAIN_PATHS,
    DF_DISCLOSURES: model.DF_DISCLOSURES,
    VIEW_META: model.DF_VIEW_META,
    VIEW_ORDER: model.DF_VIEW_ORDER,
    menu,
    addons,
    messages: {
      business_name: empty.business_name,
      contact_name: empty.contact_name,
      current_email_empty: empty.current_email,
      current_email_invalid: badEmail.current_email,
      domainPath: noPath.domainPath,
      existing_domain_empty: ownBlank.existing_domain,
      existing_domain_invalid: ownBad.existing_domain,
    },
  };
}

async function main() {
  const only = new Set(process.argv.slice(2));
  const { createServer } = await import(join(repo, 'node_modules/vite/dist/node/index.js'));
  const { chromium } = await import(join(repo, 'node_modules/playwright/index.mjs'));
  const server = await createServer({ root: repo, logLevel: 'error', server: { port: 5231, strictPort: false } });
  await server.listen();
  const base = server.resolvedUrls.local[0].replace(/\/$/, '');
  const data = await loadData(server);
  const exe = ['/opt/pw-browsers/chromium'].find((p) => existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const manifestPath = join(here, 'board-manifest.json');
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { boards: {} };
  try {
    for (const b of BOARDS) {
      if (only.size && !only.has(b.id)) continue;
      const page = await browser.newPage({ viewport: { width: 2200, height: 1000 }, deviceScaleFactor: 2 });
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
      await page.addInitScript(`window.__DF = ${JSON.stringify(data)};`);
      const url = `${base}/${relative(repo, join(srcDir, b.file)).split('\\').join('/')}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 });
      await page.evaluate(() => document.fonts.ready);
      // Load and verify the faces with real glyphs (the traced display face has no space glyph, so the
      // default check(" ") text would report false even when the face is in use).
      const fonts = await page.evaluate(async () => {
        await document.fonts.load('900 40px "SITE 00 Display"', 'TELL US');
        await document.fonts.load('700 10px "Saira Semi Condensed"', 'BUSINESS TYPE');
        return [
          ['SITE 00 Display', document.fonts.check('900 40px "SITE 00 Display"', 'TELL US')],
          ['Saira Semi Condensed', document.fonts.check('700 10px "Saira Semi Condensed"', 'BUSINESS TYPE')],
        ];
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
        fonts_loaded: Object.fromEntries(fonts),
        page_errors: errors,
      };
      console.log(`board ${b.id} → ${b.out} ${manifest.boards[b.id].image_px.join('×')} ${errors.length ? 'ERRORS ' + errors.join(' | ') : 'ok'}`);
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
