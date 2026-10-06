/**
 * P0.JURNL.F09-SAFE-TO-SPEND.HYBRID-COMPOSITE-AUTHORITY-EXECUTION1
 * Deterministic 393×852 composite over accepted scene plates (Playwright).
 *
 *   node scripts/jurnl/f09-hybrid-composite-assemble.mjs [--only T01,T02,T03]
 *
 * Expects raw plates under HYBRID_COMPOSITE_AUTHORITY_EXECUTION1/RAW_PLATES/T0n_ENVIRONMENT.png
 */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const BP = join(ROOT, 'JURNL/F09_SAFE/COMPOSITION_BLUEPRINT_CORRECTION1');
const OUT = join(ROOT, 'JURNL/F09_SAFE/HYBRID_COMPOSITE_AUTHORITY_EXECUTION1');
const RAW = join(OUT, 'RAW_PLATES');
const COMP = join(OUT, 'COMPOSITES');
const WORK = join(OUT, 'WORK');
mkdirSync(COMP, { recursive: true });
mkdirSync(WORK, { recursive: true });

const readJson = (f) => JSON.parse(readFileSync(join(BP, f), 'utf8'));
const assembly = readJson('F09_COMPOSITE_ASSEMBLY_CONTRACT.json');
const geo = assembly.data_geometry;
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

/** Sprint execution sample (founder hybrid comparison set). */
const COPY = {
  label: 'SAFE TO SPEND',
  value: '$1,284',
  availability: 'AVAILABLE THROUGH OCT 18',
  cta: 'SEE WHY THIS AMOUNT',
  held: 'HELD FOR BILLS, PLANS, GOALS & BUFFER',
  inlineLeft: 'CHANGE WHAT’S HELD',
  inlineRight: 'PLAN',
  tagline: assembly.copy.brand.tagline,
  descriptor: assembly.copy.brand.descriptor,
  categories: ['BILLS', 'PLANS', 'GOALS', 'BUFFER'],
};

const LOGO = join(ROOT, assembly.logo.path);
const FONT_BASE = join(ROOT, 'public/site00/projects/jurnl/fonts');
const FRAME_CSS = join(ROOT, 'JURNL/F09_SAFE/VISUAL_AUTHORITY_3_TERRITORY_PROOF1/REFERENCE_CANDIDATES/source/f09-frame.css');

const NAV_SVG = {
  home: '<path d="M12 4a3.8 3.8 0 1 0 0 7.6A3.8 3.8 0 1 0 12 4zM4.5 20.5c.9-3.6 3.8-5.6 7.5-5.6s6.6 2 7.5 5.6"/>',
  money: '<path d="M5 7.5h14v9H5zM5 11h14M8 7.5V6M16 7.5V6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  plan: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 1 0 0-17zM12 7.5V12l3 2"/>',
  credit: '<path d="M6 3.5h8l4 4v13H6zM14 3.5v4h4M9 12h6M9 15h6M9 18h4"/>',
};

function chromeHtml() {
  return `
  <div class="status"><span>9:41</span><span><i style="width:17px"></i><i style="width:15px"></i><i style="width:25px;border-radius:3px"></i></span></div>
  <header class="chrome chrome--no-wm">
    <span class="ib" aria-label="BACK"><svg viewBox="0 0 24 24"><path d="M15 4.5 7.5 12l7.5 7.5"/></svg></span>
    <span style="flex:1"></span>
    <span class="ib" aria-label="ACCOUNT"><svg viewBox="0 0 24 24"><path d="M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6zM12 2.8l1.6 2.3 2.7-.6.6 2.7 2.4 1.4-1.2 2.4 1.2 2.4-2.4 1.4-.6 2.7-2.7-.6L12 21.2l-1.6-2.3-2.7.6-.6-2.7-2.4-1.4 1.2-2.4-1.2-2.4 2.4-1.4.6-2.7 2.7.6z"/></svg></span>
    <span class="ib" aria-label="ASK JURNL"><svg viewBox="0 0 24 24" style="stroke-width:2"><path d="M12 10.5v7M12 6.6v.4"/></svg></span>
  </header>`;
}

function navHtml() {
  return `
  <nav class="nav" aria-label="PRIMARY">
    <b data-active><svg viewBox="0 0 24 24">${NAV_SVG.home}</svg>HOME</b>
    <b><svg viewBox="0 0 24 24">${NAV_SVG.money}</svg>MONEY</b>
    <b class="plus" aria-label="QUICK ADD"><svg viewBox="0 0 24 24">${NAV_SVG.plus}</svg></b>
    <b><svg viewBox="0 0 24 24">${NAV_SVG.plan}</svg>PLAN</b>
    <b><svg viewBox="0 0 24 24">${NAV_SVG.credit}</svg>CREDIT</b>
  </nav>
  <div class="home-ind"></div>`;
}

function signalBlock(extra = '') {
  return `
  <div class="hy-signal">
    <div class="label">${COPY.label}</div>
    <div class="hy-date">${COPY.availability}</div>
    <div class="hy-value display">${COPY.value}</div>
    ${extra}
  </div>`;
}

function ctaBlock() {
  return `
  <div class="hy-cta"><div class="btn btn--primary">${COPY.cta}</div></div>
  <div class="hy-inline">
    <div class="inline-action">${COPY.inlineLeft}<span class="rule"></span><svg class="ic" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg></div>
    <div class="inline-action">${COPY.inlineRight}<span class="rule"></span><svg class="ic" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg></div>
  </div>`;
}

function t01CoursesSvg() {
  const c = geo['JURNL.F09.T01'].courtyard;
  const lines = c.courses
    .map((k) => {
      const mid = k.polyline[Math.floor(k.polyline.length / 2)];
      const label = k.course === 'PLAN' ? 'PLANS' : k.course === 'TRIPS' ? 'BUFFER' : k.course;
      return `<text x="${mid[0]}" y="${mid[1]}" text-anchor="middle" dominant-baseline="middle" font-family="'JRN Sans',sans-serif" font-size="7" letter-spacing=".18em" fill="#3b342d">${label}</text>`;
    })
    .join('');
  const sb = geo['JURNL.F09.T01'].scale_bar;
  const heldRects = sb.held
    .map((h) => `<rect x="${h.rect.x - 41.5}" y="${h.rect.y - 276}" width="${h.rect.w}" height="${h.rect.h}" fill="#c6a676" opacity=".85"/>`)
    .join('');
  return `<svg class="hy-t01-data" viewBox="0 0 310 270" style="left:41.5px;top:276px;width:310px;height:270px;position:absolute;pointer-events:none">
    ${heldRects}
    <rect x="${sb.clear.x - 41.5}" y="${sb.clear.y - 276}" width="${sb.clear.w}" height="${sb.clear.h}" fill="#c6a676" opacity=".55"/>
  </svg>
  <svg class="hy-t01-labels" viewBox="0 0 393 852" style="position:absolute;inset:0;pointer-events:none">${lines}</svg>`;
}

function htmlT01(plateUri, logoUri) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=393"><link rel="stylesheet" href="${pathToFileURL(FRAME_CSS).href}">
<style>
@font-face{font-family:'JRN Display';src:url('${pathToFileURL(join(FONT_BASE, 'instrument-serif-400.woff2')).href}') format('woff2');font-weight:400}
@font-face{font-family:'JRN Sans';src:url('${pathToFileURL(join(FONT_BASE, 'barlow-semi-condensed-400.woff2')).href}') format('woff2');font-weight:400}
@font-face{font-family:'JRN Sans';src:url('${pathToFileURL(join(FONT_BASE, 'barlow-semi-condensed-500.woff2')).href}') format('woff2');font-weight:500}
body{background:#f6f1e7}
.plate{position:absolute;inset:0;background:url('${plateUri}') center/cover no-repeat;z-index:0}
.ui{position:relative;z-index:2}
.chrome--no-wm .wm{display:none}
.hy-signal{position:absolute;left:26.5px;top:120px;width:340px;text-align:center}
.hy-signal .label{letter-spacing:.24em;font-size:10.5px;font-weight:500;color:#4a4036}
.hy-date{margin-top:8px;font-size:10px;letter-spacing:.2em;color:#8a7a68}
.hy-value{margin-top:10px;font-size:62px;line-height:1;color:#0f3d32}
.hy-held{position:absolute;left:26.5px;top:558px;width:340px;text-align:center;font-size:10px;letter-spacing:.18em;color:#4a4036}
.hy-brand{position:absolute;left:69.5px;top:276px;width:38px;height:56px;display:flex;align-items:center;justify-content:center}
.hy-brand img{height:52px;width:auto;filter:contrast(1.05) brightness(.95)}
.hy-cta{position:absolute;left:26.5px;top:616px;width:340px}
.hy-inline{position:absolute;left:26.5px;top:672px;width:340px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
</style></head><body>
<div class="plate" aria-hidden="true"></div>
<div class="ui">
${chromeHtml()}
${signalBlock()}
<div class="hy-brand"><img src="${logoUri}" alt="JURNL"/></div>
${t01CoursesSvg()}
<div class="hy-held">${COPY.held}</div>
${ctaBlock()}
${navHtml()}
</div></body></html>`;
}

function htmlT02(plateUri, logoUri) {
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${pathToFileURL(FRAME_CSS).href}">
<style>
@font-face{font-family:'JRN Display';src:url('${pathToFileURL(join(FONT_BASE, 'instrument-serif-400.woff2')).href}') format('woff2')}
@font-face{font-family:'JRN Sans';src:url('${pathToFileURL(join(FONT_BASE, 'barlow-semi-condensed-400.woff2')).href}') format('woff2');font-weight:400}
@font-face{font-family:'JRN Sans';src:url('${pathToFileURL(join(FONT_BASE, 'barlow-semi-condensed-500.woff2')).href}') format('woff2');font-weight:500}
body{background:#e8dfd0}
.plate{position:absolute;inset:0;background:url('${plateUri}') center/cover no-repeat;z-index:0}
.ui{position:relative;z-index:2}
.hy-signal{position:absolute;left:26.5px;top:115px;width:260px}
.hy-signal .label{font-size:10.5px;letter-spacing:.24em;color:#4a4036}
.hy-date{margin-top:6px;font-size:10px;letter-spacing:.18em;color:#8a7a68}
.hy-value{margin-top:8px;font-size:72px;line-height:.95;color:#0f3d32;font-family:'JRN Display',serif}
.hy-sentence{position:absolute;left:26.5px;top:300px;width:260px;font-family:'JRN Display',serif;font-size:22px;line-height:1.15;color:#3b342d}
.hy-sentence .brass{color:#a88b5a}
.hy-rule{position:absolute;left:26.5px;top:452px;width:300px;height:8px;background:linear-gradient(90deg,#c6a676 0%,#c6a676 80%,transparent 80%)}
.hy-plate{position:absolute;left:26.5px;top:512px;width:150px;height:44px;display:flex;align-items:center;gap:8px;padding:6px 8px;background:rgba(198,174,128,.35);border-radius:2px}
.hy-plate img{height:36px;width:auto}
.hy-plate span{font-size:7px;letter-spacing:.12em;line-height:1.2;color:#3b342d;display:block}
.hy-cta{position:absolute;left:26.5px;top:596px;width:340px}
.hy-inline{position:absolute;left:26.5px;top:652px;width:340px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
</style></head><body>
<div class="plate"></div><div class="ui">
${chromeHtml()}
${signalBlock()}
<div class="hy-sentence">YOU CAN SPEND<br/><span class="brass">BILLS</span> · <span class="brass">PLANS</span> · <span class="brass">GOALS</span> · <span class="brass">BUFFER</span></div>
<div class="hy-rule"></div>
<div class="hy-plate"><img src="${logoUri}" alt=""/><span>${COPY.descriptor}</span></div>
${ctaBlock()}${navHtml()}
</div></body></html>`;
}

function htmlT03(plateUri, logoUri) {
  const slots = geo['JURNL.F09.T03'].rack.slots.filter((s) => s.plate_label);
  const labels = slots
    .map((s) => {
      const lab = s.plate_label === 'PLAN' ? 'PLANS' : s.plate_label === 'TRIPS' ? 'BUFFER' : s.plate_label;
      return `<text x="${s.x + 26}" y="520" font-family="'JRN Sans',sans-serif" font-size="7" letter-spacing=".16em" fill="#3b342d">${lab}</text>`;
    })
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${pathToFileURL(FRAME_CSS).href}">
<style>
@font-face{font-family:'JRN Display';src:url('${pathToFileURL(join(FONT_BASE, 'instrument-serif-400.woff2')).href}') format('woff2')}
@font-face{font-family:'JRN Sans';src:url('${pathToFileURL(join(FONT_BASE, 'barlow-semi-condensed-400.woff2')).href}') format('woff2');font-weight:400}
body{background:#eae2d5}
.plate{position:absolute;inset:0;background:url('${plateUri}') center/cover no-repeat;z-index:0}
.ui{position:relative;z-index:2}
.hy-slip{position:absolute;left:74px;top:108px;width:246px;height:184px;display:flex;flex-direction:column;align-items:center;padding-top:18px}
.hy-slip img{height:28px;margin-bottom:8px}
.hy-slip .tag{font-size:7px;letter-spacing:.16em;color:#8a7a68;margin-bottom:12px}
.hy-signal{text-align:center}
.hy-signal .label{font-size:10px;letter-spacing:.22em;color:#6b5f52}
.hy-value{font-size:48px;font-family:'JRN Display',serif;color:#0f3d32;margin-top:6px}
.hy-held{position:absolute;left:74px;top:520px;width:246px;text-align:center;font-size:9px;letter-spacing:.16em;color:#4a4036}
.hy-cta{position:absolute;left:26.5px;top:626px;width:340px}
.hy-inline{position:absolute;left:26.5px;top:682px;width:340px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
</style></head><body>
<div class="plate"></div><div class="ui">
${chromeHtml()}
<div class="hy-slip"><img src="${logoUri}" alt="JURNL"/><div class="tag">${COPY.tagline}</div>
  <div class="hy-signal"><div class="label">${COPY.label}</div><div class="hy-value">${COPY.value}</div></div>
</div>
<svg style="position:absolute;inset:0;pointer-events:none;width:393px;height:852px">${labels}</svg>
<div class="hy-held">${COPY.held}</div>
${ctaBlock()}${navHtml()}
</div></body></html>`;
}

const TERRITORIES = {
  T01: { html: htmlT01, out: 'F09_T01_SURVEYED_COURTYARD_MOBILE_393x852.png', name: 'THE SURVEYED COURTYARD' },
  T02: { html: htmlT02, out: 'F09_T02_ANSWER_IN_RAKING_LIGHT_MOBILE_393x852.png', name: 'THE ANSWER IN RAKING LIGHT' },
  T03: { html: htmlT03, out: 'F09_T03_SORTING_RACK_MOBILE_393x852.png', name: 'THE SORTING RACK' },
};

async function main() {
  const only = (process.argv.find((a) => a.startsWith('--only=')) ?? '').slice(7).split(',').filter(Boolean);
  const exe = [process.env.JURNL_QA_CHROMIUM, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].filter(Boolean).find((p) => existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const logoUri = `data:image/png;base64,${readFileSync(LOGO).toString('base64')}`;
  const results = [];
  for (const [t, cfg] of Object.entries(TERRITORIES)) {
    if (only.length && !only.includes(t)) continue;
    const platePath = join(RAW, `${t}_ENVIRONMENT.png`);
    if (!existsSync(platePath)) throw new Error(`Missing raw plate ${platePath}`);
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
    results.push({ territory: t, composite: outPath.slice(ROOT.length + 1), sha256: sha(outPath), plate: platePath.slice(ROOT.length + 1) });
  }
  await browser.close();
  writeFileSync(join(OUT, 'ASSEMBLE_LOG.json'), `${JSON.stringify({ assembled_at: new Date().toISOString(), results }, null, 2)}\n`);
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
