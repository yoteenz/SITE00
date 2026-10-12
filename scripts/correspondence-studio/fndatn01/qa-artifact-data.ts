/**
 * FNDATN-01 artifact-data QA. Renders every committed review preview in Chromium at desktop (760 viewport,
 * 680 canvas) and mobile (390) widths and checks:
 *   - hero art height is unchanged (live copy never stretches the background art);
 *   - mobile hero copy ends inside its copy zone, above the card or object in the art;
 *   - every card value ends before the card's printed rule (CARD_SPECS.valueMax);
 *   - the page never scrolls horizontally;
 *   - every angled-edge button stays 46 px tall (a wrapped label blunts the tip);
 *   - the same layout with web fonts blocked (fallback fonts) and with CSS transforms stripped
 *     (Gmail / Outlook behaviour for the card tilt).
 * Writes screenshots, authority-vs-render hero sheets and qa-report.json to the output directory.
 *
 *   npx tsx scripts/correspondence-studio/fndatn01/qa-artifact-data.ts [outDir]
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Page } from 'playwright';
import sharp from 'sharp';
import { CARD_SPECS, MOBILE_ART_HEIGHT, coverMap, mapSpec, type CardSpec } from '../../../shared/site00-correspondence-studio/fndatn01/cards.js';
import { FNDATN01_EMAILS } from '../../../shared/site00-correspondence-studio/fndatn01/pack.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const PUBLIC = path.join(ROOT, 'public');
const OUT = path.resolve(process.argv[2] ?? path.join(ROOT, 'docs/site00/correspondence/fndatn-01/artifact-data-qa'));
const PREVIEW_ROOT = '/site00-correspondence-studio/fndatn-01';

/** Hero crops of the authority, as extract_assets.py takes them. */
const HERO_CROPS: Record<string, { desktop: { rows: [number, number]; x1: number }; mobile: [number, number, number, number] }> = {
  '01_invitation': { desktop: { rows: [70, 660], x1: 1400 }, mobile: [62, 155, 879, 882] },
  '02_intake_received': { desktop: { rows: [72, 643], x1: 1360 }, mobile: [0, 91, 880, 1048] },
  '03_recommendation_quote': { desktop: { rows: [70, 676], x1: 1390 }, mobile: [0, 92, 838, 1070] },
  '04_payment_received': { desktop: { rows: [70, 685], x1: 1480 }, mobile: [131, 106, 811, 621] },
  '05_foundation_complete': { desktop: { rows: [70, 656], x1: 1440 }, mobile: [0, 92, 838, 880] },
  '06_resume_intake': { desktop: { rows: [70, 682], x1: 1460 }, mobile: [0, 88, 838, 935] },
  '07_quote_expiry': { desktop: { rows: [70, 668], x1: 1490 }, mobile: [0, 88, 838, 905] },
};

/** Mobile hero heights used by emails.ts for the card heroes (the art is mapped through `cover` at these). */
const MOBILE_CELL: Record<string, number> = { '01_invitation': 347, '02_intake_received': 440, '03_recommendation_quote': 470, '07_quote_expiry': 410 };

function fittedSpec(slug: string, device: 'desktop' | 'mobile'): CardSpec | undefined {
  const specs = (CARD_SPECS as Record<string, { desktop?: CardSpec; mobile?: CardSpec }>)[slug];
  if (device === 'desktop') return specs?.desktop;
  const art = (MOBILE_ART_HEIGHT as Record<string, number>)[slug];
  return specs?.mobile && art ? mapSpec(specs.mobile, coverMap(art, MOBILE_CELL[slug])) : undefined;
}

type Mode = 'webfonts' | 'fallback-fonts' | 'no-transform';
type Check = { email: string; file: string; device: 'desktop' | 'mobile'; width: number; mode: Mode; problems: string[]; metrics: Record<string, unknown> };

function serve(): Promise<http.Server> {
  const types: Record<string, string> = { '.html': 'text/html', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.css': 'text/css' };
  const server = http.createServer((req, res) => {
    const file = path.join(PUBLIC, decodeURIComponent((req.url ?? '/').split('?')[0]));
    if (!file.startsWith(PUBLIC) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function measure(page: Page, device: 'desktop' | 'mobile') {
  return page.evaluate((dev) => {
    const hero = document.querySelector<HTMLElement>(dev === 'desktop' ? '.hero.desk-only' : '.hero.mob-only')!;
    const bg = hero.querySelector<HTMLElement>('td[background]')!;
    // Positions are measured from the art cell, the coordinate space of CARD_SPECS.
    const h = bg.getBoundingClientRect();
    const copy = hero.querySelector<HTMLElement>('.hero-copy');
    const copyInner = copy ? Array.from(copy.children).map((c) => c.getBoundingClientRect().bottom) : [];
    const values = Array.from(hero.querySelectorAll<HTMLElement>('.card-fields td td:last-child > *')).map((el) => {
      const r = el.getBoundingClientRect();
      return { text: el.textContent, left: r.left - h.left, right: r.right - h.left, top: r.top - h.top };
    });
    const labels = Array.from(hero.querySelectorAll<HTMLElement>('.card-fields td td:first-child')).map((el) => {
      const r = el.getBoundingClientRect();
      return { text: el.textContent, left: r.left - h.left, top: r.top - h.top, right: r.right - h.left };
    });
    return {
      heroHeight: Math.round(h.height),
      artLeft: Math.round(h.left),
      bgHeight: Number(bg.getAttribute('height')),
      copyBottom: copyInner.length ? Math.round(Math.max(...copyInner) - h.top) : null,
      copyZone: copy?.getAttribute('height') ? Number(copy.getAttribute('height')) : null,
      values,
      labels,
      scrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      buttons: Array.from(document.querySelectorAll<HTMLElement>('table.btn-full'))
        .map((t) => Math.round(t.getBoundingClientRect().height))
        .filter((height) => height > 0),
    };
  }, device);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await serve();
  const port = (server.address() as { port: number }).port;
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const checks: Check[] = [];
  const files = fs
    .readdirSync(path.join(PUBLIC, PREVIEW_ROOT))
    .filter((f) => f.endsWith('.html'))
    .sort();
  for (const mode of ['webfonts', 'fallback-fonts', 'no-transform'] as Mode[]) {
    for (const [device, width] of [
      ['desktop', 760],
      ['mobile', 360],
      ['mobile', 390],
      ['mobile', 430],
    ] as const) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 2 });
      if (mode === 'fallback-fonts') await context.route('**/*.woff2', (r) => r.abort());
      const page = await context.newPage();
      for (const file of files) {
        const slug = file.replace(/(--.*)?\.html$/, '');
        await page.goto(`http://127.0.0.1:${port}${PREVIEW_ROOT}/${file}`, { waitUntil: 'networkidle' });
        if (mode === 'no-transform') await page.addStyleTag({ content: '.hero-card div{transform:none!important;-webkit-transform:none!important}' });
        await page.evaluate(() => document.fonts.ready);
        const m = await measure(page, device);
        const problems: string[] = [];
        if (m.heroHeight !== m.bgHeight) problems.push(`hero ${m.heroHeight}px tall, art is ${m.bgHeight}px`);
        if (device === 'mobile' && m.copyZone != null && m.copyBottom != null && m.copyBottom > m.copyZone)
          problems.push(`copy ends at ${m.copyBottom}px, zone ends at ${m.copyZone}px`);
        const card = m.values.length > 0;
        const spec = card ? fittedSpec(slug, device) : undefined;
        if (spec) {
          for (const v of m.values) if (v.right > spec.valueMax + 3) problems.push(`"${v.text}" ends at ${Math.round(v.right)}px, rule at ${spec.valueMax}px`);
          if (m.labels[0] && Math.abs(m.labels[0].left - spec.first[0]) > 4 && mode !== 'no-transform')
            problems.push(`first label at x ${Math.round(m.labels[0].left)}, authority ${spec.first[0]}`);
        }
        if (m.scrollX > 0) problems.push(`horizontal scroll ${m.scrollX}px`);
        // The angled tip meets in a point at the designed 46 px; a wrapped label blunts it.
        for (const height of m.buttons) if (height !== 46) problems.push(`button ${height}px tall (label wraps; tip blunts)`);
        checks.push({ email: slug, file, device, width, mode, problems, metrics: { heroHeight: m.heroHeight, copyBottom: m.copyBottom, copyZone: m.copyZone, rows: m.values.length } });
        const tag = `${mode}-${device}${device === 'mobile' && width !== 390 ? `-${width}` : ''}-${file.replace('.html', '')}`;
        if (mode === 'webfonts' && (device === 'desktop' || width === 390)) await page.screenshot({ path: path.join(OUT, `page-${device}-${file.replace('.html', '')}.png`), fullPage: true });
        await page.locator(device === 'desktop' ? '.hero.desk-only' : '.hero.mob-only').first().screenshot({ path: path.join(OUT, `hero-${tag}.png`) });
      }
      await context.close();
    }
  }
  await browser.close();
  server.close();

  // Authority hero above / beside the rendered hero, same scale.
  for (const e of FNDATN01_EMAILS) {
    const crop = HERO_CROPS[e.slug];
    for (const device of ['desktop', 'mobile'] as const) {
      const rendered = path.join(OUT, `hero-webfonts-${device}-${e.slug}.png`);
      const meta = await sharp(rendered).metadata();
      const W = meta.width!;
      const src = path.join(PUBLIC, PREVIEW_ROOT, 'authority', e.slug, `${device}.jpg`);
      const region =
        device === 'desktop'
          ? (() => {
              const [y0, y1] = crop.desktop.rows;
              const w = Math.round(((y1 - y0) * 680) / 300);
              return { left: crop.desktop.x1 - w, top: y0, width: w, height: y1 - y0 };
            })()
          : { left: crop.mobile[0], top: crop.mobile[1], width: crop.mobile[2] - crop.mobile[0], height: crop.mobile[3] - crop.mobile[1] };
      const auth = await sharp(src).extract(region).resize({ width: W }).toBuffer();
      const am = await sharp(auth).metadata();
      const label = (text: string, w: number) =>
        Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="44"><rect width="100%" height="100%" fill="#1d1d20"/><text x="14" y="30" font-family="sans-serif" font-size="22" font-weight="700" fill="#fff">${text}</text></svg>`,
        );
      const stack = device === 'desktop';
      const width = stack ? W : W * 2 + 16;
      const height = stack ? 44 + am.height! + 44 + meta.height! : 44 + Math.max(am.height!, meta.height!);
      await sharp({ create: { width, height, channels: 3, background: '#1d1d20' } })
        .composite([
          { input: label(`AUTHORITY · ${e.id} ${device.toUpperCase()}`, stack ? W : W), left: 0, top: 0 },
          { input: auth, left: 0, top: 44 },
          { input: label(`RENDER · LIVE TEXT · DEMO DATA`, W), left: stack ? 0 : W + 16, top: stack ? 44 + am.height! : 0 },
          { input: rendered, left: stack ? 0 : W + 16, top: stack ? 88 + am.height! : 44 },
        ])
        .jpeg({ quality: 82 })
        .toFile(path.join(OUT, `compare-${device}-${e.slug}.jpg`));
    }
  }

  const failed = checks.filter((c) => c.problems.length);
  fs.writeFileSync(path.join(OUT, 'qa-report.json'), `${JSON.stringify({ generated_by: 'scripts/correspondence-studio/fndatn01/qa-artifact-data.ts', checks }, null, 2)}\n`);
  for (const c of checks) console.log(`${c.problems.length ? 'FAIL' : 'ok  '} ${c.mode.padEnd(14)} ${c.device.padEnd(7)} ${String(c.width).padEnd(4)} ${c.file.padEnd(48)} ${c.problems.join('; ')}`);
  console.log(`${checks.length - failed.length}/${checks.length} checks clean`);
  if (failed.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
