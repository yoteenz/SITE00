/**
 * P0.JURNL.F09-SAFE-TO-SPEND.THREE-DISTINCT-COMPOSITE-AUTHORITY-RERUN1
 * Three distinct 393×852 composites — product canvas only (no device chrome).
 */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const BP = join(ROOT, 'JURNL/F09_SAFE/COMPOSITION_BLUEPRINT_CORRECTION1');
const PAYLOAD_PATH = join(ROOT, 'JURNL/F09_SAFE/F09_FOUNDER_REVIEW_PAYLOAD.json');
const EXEC1 = join(ROOT, 'JURNL/F09_SAFE/HYBRID_COMPOSITE_AUTHORITY_EXECUTION1');
const OUT = join(ROOT, 'JURNL/F09_SAFE/THREE_DISTINCT_COMPOSITE_AUTHORITY_RERUN1');
const RAW = join(OUT, 'RAW_PLATES');
const COMP = join(OUT, 'COMPOSITES');
const WORK = join(OUT, 'WORK');
mkdirSync(RAW, { recursive: true });
mkdirSync(COMP, { recursive: true });
mkdirSync(WORK, { recursive: true });

const payload = JSON.parse(readFileSync(PAYLOAD_PATH, 'utf8'));
const assembly = JSON.parse(readFileSync(join(BP, 'F09_COMPOSITE_ASSEMBLY_CONTRACT.json'), 'utf8'));
const geo = assembly.data_geometry;
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const payloadHash = () => createHash('sha256').update(readFileSync(PAYLOAD_PATH)).digest('hex');

const LOGO = join(ROOT, assembly.logo.path);
const FONT_BASE = join(ROOT, 'public/site00/projects/jurnl/fonts');
const CANVAS_CSS = join(ROOT, 'JURNL/F09_SAFE/VISUAL_AUTHORITY_3_TERRITORY_PROOF1/REFERENCE_CANDIDATES/source/f09-product-canvas.css');

const NAV_SVG = {
  home: '<path d="M12 4a3.8 3.8 0 1 0 0 7.6A3.8 3.8 0 1 0 12 4zM4.5 20.5c.9-3.6 3.8-5.6 7.5-5.6s6.6 2 7.5 5.6"/>',
  money: '<path d="M5 7.5h14v9H5zM5 11h14M8 7.5V6M16 7.5V6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  plan: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 1 0 0-17zM12 7.5V12l3 2"/>',
  credit: '<path d="M6 3.5h8l4 4v13H6zM14 3.5v4h4M9 12h6M9 15h6M9 18h4"/>',
};

function fontFaces() {
  const f = (name) => pathToFileURL(join(FONT_BASE, name)).href;
  return `
@font-face{font-family:'JRN Display';src:url('${f('instrument-serif-400.woff2')}') format('woff2');font-weight:400}
@font-face{font-family:'JRN Sans';src:url('${f('barlow-semi-condensed-400.woff2')}') format('woff2');font-weight:400}
@font-face{font-family:'JRN Sans';src:url('${f('barlow-semi-condensed-500.woff2')}') format('woff2');font-weight:500}`;
}

function productChrome() {
  return `
  <header class="jurnl-chrome" aria-label="FAMILY CHROME">
    <span class="ib" aria-label="BACK"><svg viewBox="0 0 24 24"><path d="M15 4.5 7.5 12l7.5 7.5"/></svg></span>
    <span class="sp"></span>
    <span class="ib" aria-label="ACCOUNT"><svg viewBox="0 0 24 24"><path d="M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6zM12 2.8l1.6 2.3 2.7-.6.6 2.7 2.4 1.4-1.2 2.4 1.2 2.4-2.4 1.4-.6 2.7-2.7-.6L12 21.2l-1.6-2.3-2.7.6-.6-2.7-2.4-1.4 1.2-2.4-1.2-2.4 2.4-1.4.6-2.7 2.7.6z"/></svg></span>
    <span class="ib" aria-label="ASK JURNL"><svg viewBox="0 0 24 24" style="stroke-width:2"><path d="M12 10.5v7M12 6.6v.4"/></svg></span>
  </header>`;
}

function navBlock() {
  return `
  <nav class="jurnl-nav" aria-label="PRIMARY">
    <b data-active><svg viewBox="0 0 24 24">${NAV_SVG.home}</svg>HOME</b>
    <b><svg viewBox="0 0 24 24">${NAV_SVG.money}</svg>MONEY</b>
    <b class="plus" aria-label="QUICK ADD"><svg viewBox="0 0 24 24">${NAV_SVG.plus}</svg></b>
    <b><svg viewBox="0 0 24 24">${NAV_SVG.plan}</svg>PLAN</b>
    <b><svg viewBox="0 0 24 24">${NAV_SVG.credit}</svg>CREDIT</b>
  </nav>`;
}

function purchaseBridge(extraClass = '') {
  const pb = payload.purchase_bridge;
  return `
  <section class="purchase-bridge ${extraClass}" aria-label="PURCHASE BRIDGE">
    <p class="pb-head">${pb.headline}</p>
    <p class="pb-body">${pb.body}</p>
    <div class="btn btn--bridge">${pb.cta}</div>
  </section>`;
}

function primaryCta() {
  return `<div class="btn btn--primary">${payload.primary_action}</div>`;
}

/** T01 — asymmetric courtyard object + floor inlay data on plate zone */
function htmlT01(plateUri, logoUri) {
  const c = geo['JURNL.F09.T01'].courtyard;
  const sb = geo['JURNL.F09.T01'].scale_bar;
  const heldRects = sb.held
    .map((h) => `<rect x="${h.rect.x - 41.5}" y="${h.rect.y - 276}" width="${h.rect.w}" height="${h.rect.h}" fill="#c6a676" opacity=".82"/>`)
    .join('');
  const courseLabels = c.courses
    .map((k) => {
      const mid = k.polyline[Math.floor(k.polyline.length / 2)];
      const label = k.course === 'PLAN' ? 'PLANS' : k.course === 'TRIPS' ? 'BUFFER' : k.course;
      return `<text x="${mid[0]}" y="${mid[1]}" text-anchor="middle" dominant-baseline="middle" font-family="'JRN Sans',sans-serif" font-size="7" letter-spacing=".18em" fill="#3b342d">${label}</text>`;
    })
    .join('');
  const chips = payload.held_categories.map((cat) => `<span class="chip">${cat}</span>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=393">
<link rel="stylesheet" href="${pathToFileURL(CANVAS_CSS).href}">
<style>${fontFaces()}
body{background:#ebe4d6}
.t01-signal{position:absolute;left:26.5px;top:52px;width:200px}
.t01-signal .display{font-size:56px;line-height:1;margin-top:8px}
.t01-signal .meta{margin-top:6px}
.t01-frame{position:absolute;left:26.5px;top:168px;width:340px;height:320px;border:1px solid rgba(198,166,118,.35);border-radius:2px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.25)}
.t01-brand{position:absolute;left:298px;top:52px;width:68px;height:88px;display:flex;align-items:flex-start;justify-content:center;padding-top:4px;background:rgba(249,246,239,.55);border:1px solid rgba(198,166,118,.4);border-radius:2px}
.t01-brand img{height:72px;width:auto;filter:contrast(1.05) brightness(.94)}
.t01-data{position:absolute;left:41.5px;top:276px;width:310px;height:270px;pointer-events:none}
.t01-held{position:absolute;left:26.5px;top:500px;width:340px;font-size:9px;letter-spacing:.16em;color:#4a4036;text-align:center}
.t01-chips{position:absolute;left:26.5px;top:528px;width:340px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap}
.chip{font:500 8px/1 'JRN Sans';letter-spacing:.14em;padding:5px 8px;border:1px solid rgba(198,166,118,.6);background:rgba(249,246,239,.75);border-radius:2px;color:#3b342d}
.t01-cta{position:absolute;left:26.5px;top:562px;width:340px}
.t01-bridge{position:absolute;left:26.5px;top:618px;width:340px}
</style></head><body>
<div class="plate" style="background-image:url('${plateUri}')" aria-hidden="true"></div>
<div class="ui">
${productChrome()}
<div class="t01-signal">
  <div class="label">${payload.primary_signal}</div>
  <div class="meta">${payload.date_line}</div>
  <div class="display">${payload.amount}</div>
</div>
<div class="t01-brand"><img src="${logoUri}" alt="JURNL"/></div>
<div class="t01-frame" aria-hidden="true"></div>
<svg class="t01-data" viewBox="0 0 310 270">${heldRects}
  <rect x="${sb.clear.x - 41.5}" y="${sb.clear.y - 276}" width="${sb.clear.w}" height="${sb.clear.h}" fill="#c6a676" opacity=".45"/>
</svg>
<svg style="position:absolute;inset:0;width:393px;height:852px;pointer-events:none">${courseLabels}</svg>
<div class="t01-held">${payload.held_summary}</div>
<div class="t01-chips">${chips}</div>
<div class="t01-cta">${primaryCta()}</div>
<div class="t01-bridge">${purchaseBridge('t01-pb')}</div>
${navBlock()}
</div></body></html>`;
}

/** T02 — editorial answer column + environment on right; brass material clause */
function htmlT02(plateUri, logoUri) {
  const cats = payload.held_categories.map((c) => `<span class="brass">${c}</span>`).join(' · ');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=393">
<link rel="stylesheet" href="${pathToFileURL(CANVAS_CSS).href}">
<style>${fontFaces()}
body{background:#e0d6c8}
.plate{clip-path:inset(0 0 0 38%)}
.t02-col{position:absolute;left:0;top:0;width:100%;height:100%;background:linear-gradient(90deg,rgba(249,246,239,.92) 0%,rgba(249,246,239,.88) 42%,rgba(249,246,239,0) 58%)}
.t02-signal{position:absolute;left:26.5px;top:48px;width:280px}
.t02-signal .display{font-size:78px;line-height:.92;margin-top:4px}
.t02-signal .meta{margin-top:8px}
.t02-clause{position:absolute;left:26.5px;top:248px;width:260px;font-family:'JRN Display',serif;font-size:20px;line-height:1.25;color:#3b342d;text-transform:none;font-variant:normal}
.t02-clause .brass{color:#a88b5a;font-family:'JRN Sans',sans-serif;font-size:11px;letter-spacing:.12em}
.t02-rule{position:absolute;left:26.5px;top:340px;width:240px;height:6px;background:linear-gradient(90deg,#c6a676 0%,#c6a676 72%,transparent 72%)}
.t02-held{position:absolute;left:26.5px;top:358px;width:260px;font-size:9px;letter-spacing:.16em;color:#5a5046}
.t02-plate{position:absolute;left:26.5px;top:388px;width:168px;padding:8px 10px;display:flex;align-items:center;gap:10px;background:rgba(198,174,128,.32);border-radius:2px;border:1px solid rgba(198,166,118,.45)}
.t02-plate img{height:40px;width:auto}
.t02-plate span{font-size:7px;letter-spacing:.1em;line-height:1.25;color:#3b342d;display:block;max-width:100px}
.t02-cta{position:absolute;left:26.5px;top:456px;width:340px}
.t02-bridge{position:absolute;left:26.5px;top:512px;width:340px;border-left:3px solid var(--emerald)}
</style></head><body>
<div class="plate" style="background-image:url('${plateUri}')" aria-hidden="true"></div>
<div class="t02-col" aria-hidden="true"></div>
<div class="ui">
${productChrome()}
<div class="t02-signal">
  <div class="label">${payload.primary_signal}</div>
  <div class="display">${payload.amount}</div>
  <div class="meta">${payload.date_line}</div>
</div>
<div class="t02-clause">YOU CAN SPEND AFTER<br/>${cats}</div>
<div class="t02-rule"></div>
<div class="t02-held">${payload.held_summary}</div>
<div class="t02-plate"><img src="${logoUri}" alt=""/><span>${payload.brand.descriptor}</span></div>
<div class="t02-cta">${primaryCta()}</div>
<div class="t02-bridge">${purchaseBridge()}</div>
${navBlock()}
</div></body></html>`;
}

/** T03 — slip letterhead + rack labels + folio purchase bridge */
function htmlT03(plateUri, logoUri) {
  const slots = geo['JURNL.F09.T03'].rack.slots.filter((s) => s.plate_label);
  const labels = slots
    .map((s) => {
      const lab = s.plate_label === 'PLAN' ? 'PLANS' : s.plate_label === 'TRIPS' ? 'BUFFER' : s.plate_label;
      return `<text x="${s.x + 26}" y="498" font-family="'JRN Sans',sans-serif" font-size="7" letter-spacing=".16em" fill="#3b342d">${lab}</text>`;
    })
    .join('');
  const seals = payload.held_categories
    .map((cat, i) => `<span class="seal" style="--i:${i}">${cat}</span>`)
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=393">
<link rel="stylesheet" href="${pathToFileURL(CANVAS_CSS).href}">
<style>${fontFaces()}
body{background:#eae2d5}
.t03-slip{position:absolute;left:58px;top:52px;width:278px;min-height:200px;padding:16px 20px 14px;display:flex;flex-direction:column;align-items:center;background:rgba(252,250,245,.78);border:1px solid rgba(203,189,171,.65);box-shadow:0 8px 24px rgba(0,0,0,.06)}
.t03-slip img{height:32px;margin-bottom:6px}
.t03-slip .tag{font-size:7px;letter-spacing:.14em;color:#8a7a68;margin-bottom:10px}
.t03-slip .display{font-size:52px;margin-top:4px}
.t03-slip .meta{margin-top:6px}
.t03-seals{position:absolute;left:26.5px;top:268px;width:340px;display:flex;justify-content:space-between;padding:0 8px}
.seal{font:500 7.5px/1 'JRN Sans';letter-spacing:.12em;padding:6px 10px;border:1px solid rgba(110,31,45,.35);border-radius:999px;background:rgba(249,246,239,.85);color:#6e1f2d;transform:rotate(calc(var(--i) * -2deg))}
.t03-held{position:absolute;left:26.5px;top:520px;width:340px;text-align:center;font-size:9px;letter-spacing:.16em;color:#4a4036}
.t03-cta{position:absolute;left:26.5px;top:548px;width:340px}
.t03-bridge{position:absolute;left:26.5px;top:604px;width:340px;background:rgba(252,250,245,.9);border-style:dashed}
</style></head><body>
<div class="plate" style="background-image:url('${plateUri}')" aria-hidden="true"></div>
<div class="ui">
${productChrome()}
<div class="t03-slip">
  <img src="${logoUri}" alt="JURNL"/>
  <div class="tag">${payload.brand.tagline}</div>
  <div class="label">${payload.primary_signal}</div>
  <div class="display">${payload.amount}</div>
  <div class="meta">${payload.date_line}</div>
</div>
<div class="t03-seals">${seals}</div>
<svg style="position:absolute;inset:0;width:393px;height:852px;pointer-events:none">${labels}</svg>
<div class="t03-held">${payload.held_summary}</div>
<div class="t03-cta">${primaryCta()}</div>
<div class="t03-bridge">${purchaseBridge()}</div>
${navBlock()}
</div></body></html>`;
}

const TERRITORIES = {
  T01: { html: htmlT01, out: 'F09_T01_SURVEYED_COURTYARD_393x852.png', layout_id: 'T01_COURTYARD_ASYMMETRIC_FRAME' },
  T02: { html: htmlT02, out: 'F09_T02_ANSWER_IN_RAKING_LIGHT_393x852.png', layout_id: 'T02_EDITORIAL_ANSWER_COLUMN' },
  T03: { html: htmlT03, out: 'F09_T03_SORTING_RACK_393x852.png', layout_id: 'T03_SLIP_FOLIO_BRIDGE' },
};

function ensureRawPlates() {
  const readme = join(RAW, 'NOT_A_FOUNDER_CONCEPT.txt');
  writeFileSync(
    readme,
    'RAW PLATES — PRODUCTION PROVENANCE ONLY\nNOT founder-review concepts.\nArt layer only; final authority = COMPOSITES/*.png\n',
  );
  for (const t of ['T01', 'T02', 'T03']) {
    const src = join(EXEC1, 'RAW_PLATES', `${t}_ENVIRONMENT.png`);
    const dst = join(RAW, `${t}_ENVIRONMENT.png`);
    if (!existsSync(dst) && existsSync(src)) copyFileSync(src, dst);
    if (!existsSync(dst)) throw new Error(`Missing raw plate ${dst}`);
  }
}

async function main() {
  ensureRawPlates();
  const only = (process.argv.find((a) => a.startsWith('--only=')) ?? '').slice(7).split(',').filter(Boolean);
  const exe = [process.env.JURNL_QA_CHROMIUM, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].filter(Boolean).find((p) => existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const logoUri = `data:image/png;base64,${readFileSync(LOGO).toString('base64')}`;
  const ph = payloadHash();
  const results = [];
  for (const [t, cfg] of Object.entries(TERRITORIES)) {
    if (only.length && !only.includes(t)) continue;
    const platePath = join(RAW, `${t}_ENVIRONMENT.png`);
    const plateUri = `data:image/png;base64,${readFileSync(platePath).toString('base64')}`;
    const html = cfg.html(plateUri, logoUri);
    const htmlPath = join(WORK, `${t}.html`);
    writeFileSync(htmlPath, html);
    const page = await (await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 })).newPage();
    await page.goto(pathToFileURL(htmlPath).href);
    await page.evaluate(() => document.fonts.ready);
    const outPath = join(COMP, cfg.out);
    await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 393, height: 852 } });
    await page.close();
    results.push({
      territory: t,
      layout_id: cfg.layout_id,
      payload_hash: ph,
      composite: outPath.slice(ROOT.length + 1),
      sha256: sha(outPath),
      plate: platePath.slice(ROOT.length + 1),
      plate_sha256: sha(platePath),
    });
  }
  await browser.close();
  writeFileSync(
    join(OUT, 'ASSEMBLE_LOG.json'),
    `${JSON.stringify({ sprint: payload.sprint, assembled_at: new Date().toISOString(), device_chrome_forbidden: true, payload_path: 'JURNL/F09_SAFE/F09_FOUNDER_REVIEW_PAYLOAD.json', payload_hash: ph, results }, null, 2)}\n`,
  );
  console.log(JSON.stringify({ payload_hash: ph, results }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
