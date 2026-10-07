/**
 * P0.JURNL.F09-SAFE-TO-SPEND.THREE-CONCEPT-ART-DIRECTION-REGEN-CORRECTION1 — author the three F09 authority candidates.
 *
 * Scene (gpt-image-2.5-sunburst, text-free, art-directed to the F03 benchmark) + the product layer set here: exact copy,
 * official logo, JURNL fonts, runtime nav icons, territory-specific modules. Every overlay is lit, blended and grained with
 * the scene so the page reads as one finished image. No device chrome (no status bar, no home indicator, no phone frame).
 *
 *   node scripts/jurnl/f09-art-direction-regen-assemble.mjs          # full-res scenes in SCENES/ → COMPOSITES/ + board
 *   node scripts/jurnl/f09-art-direction-regen-assemble.mjs --proof  # 144×256 previews → LAYOUT_PROOF/ (never for review)
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DIR = join(ROOT, 'JURNL/F09_SAFE/THREE_CONCEPT_ART_DIRECTION_REGEN_CORRECTION1');
const PROOF = process.argv.includes('--proof');
const OUT = join(DIR, PROOF ? 'LAYOUT_PROOF' : 'COMPOSITES');
mkdirSync(OUT, { recursive: true });

const P = JSON.parse(readFileSync(join(ROOT, 'JURNL/F09_SAFE/F09_FOUNDER_REVIEW_PAYLOAD.json'), 'utf8'));
const W = 393, H = 852;
const uri = (file, type) => `data:${type};base64,${readFileSync(file).toString('base64')}`;
const FONT = (f) => uri(join(ROOT, `public/site00/projects/jurnl/fonts/${f}.woff2`), 'font/woff2');
const LOGO = uri(join(DIR, 'ASSETS/jurnl-logo-official-hires.png'), 'image/png');
const LOGO_RATIO = 607 / 977;

const TERRITORIES = [
  { t: 'T01', name: 'THE SURVEYED COURTYARD', file: 'F09_T01_SURVEYED_COURTYARD_393x852@3x.png', cx: 0.5 },
  { t: 'T02', name: 'THE ANSWER IN RAKING LIGHT', file: 'F09_T02_ANSWER_IN_RAKING_LIGHT_393x852@3x.png', cx: 0.5 },
  { t: 'T03', name: 'THE SORTING RACK', file: 'F09_T03_SORTING_RACK_393x852@3x.png', cx: 0.47 },
];

/* ─────────────── scene → viewport mapping + measurement ─────────────── */

function sceneFile(t) {
  const full = join(DIR, `SCENES/${t}_SCENE.png`);
  if (!PROOF) {
    if (!existsSync(full)) throw new Error(`missing ${full} (run with --proof for a layout proof)`);
    return full;
  }
  return join(DIR, `SCENES_PROOF/${t}_preview_144x256.jpg`);
}

async function load(file, cx) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const cropW = (info.height * W) / H;
  const left = Math.max(0, Math.min(info.width - cropW, cx * info.width - cropW / 2));
  const k = H / info.height; // px → pt
  const at = (x, y) => { const i = (Math.round(y) * info.width + Math.round(x)) * 3; return [data[i], data[i + 1], data[i + 2]]; };
  return { info, cropW, left, k, at, toPt: (x, y) => [(x - left) * k, y * k] };
}

/** T01: the sunlit open floor = rows / columns where most pixels are bright. */
function measureFloor(s) {
  const { info, left, cropW, at, k } = s;
  const lum = (x, y) => { const [r, g, b] = at(x, y); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const ys = [], vals = [];
  for (let y = Math.round(info.height * 0.15); y < info.height * 0.8; y++) for (let x = left; x < left + cropW; x += 2) vals.push(lum(x, y));
  vals.sort((a, b) => a - b);
  const thr = vals[Math.floor(vals.length * 0.6)];
  for (let y = Math.round(info.height * 0.15); y < info.height * 0.8; y++) {
    let n = 0, m = 0;
    for (let x = left; x < left + cropW; x += 2) { m++; if (lum(x, y) >= thr) n++; }
    if (n / m > 0.5) ys.push(y);
  }
  const top = ys[0], bottom = ys[ys.length - 1];
  const cols = [];
  for (let x = Math.round(left); x < left + cropW; x++) {
    let n = 0, m = 0;
    for (let y = top; y <= bottom; y += 2) { m++; if (lum(x, y) >= thr) n++; }
    if (n / m > 0.5) cols.push(x);
  }
  return { x: (cols[0] - left) * k, y: top * k, w: (cols[cols.length - 1] - cols[0]) * k, h: (bottom - top) * k };
}

/** T03: burgundy wax blobs → four sealed niches + the broken seal. */
function measureSeals(s) {
  const { info, at } = s;
  const step = Math.max(1, Math.round(info.width / 288));
  const gw = Math.ceil(info.width / step), gh = Math.ceil(info.height / step);
  const mask = new Uint8Array(gw * gh);
  for (let gy = Math.round(gh * 0.25); gy < gh * 0.65; gy++) for (let gx = 0; gx < gw; gx++) {
    const [r, g, b] = at(Math.min(info.width - 1, gx * step), Math.min(info.height - 1, gy * step));
    if (r > 60 && r > g * 2 && b >= g * 0.6 && g < 80) mask[gy * gw + gx] = 1; // burgundy wax keeps blue ≈ green; oak / shadow browns do not
  }
  const blobs = [], seen = new Uint8Array(gw * gh);
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i] || seen[i]) continue;
    const q = [i]; seen[i] = 1; let n = 0, sx = 0, sy = 0, x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
    while (q.length) {
      const j = q.pop(), x = j % gw, y = (j / gw) | 0; n++; sx += x; sy += y;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      for (const d of [-1, 1, -gw, gw]) { const nb = j + d; if (nb >= 0 && nb < mask.length && mask[nb] && !seen[nb]) { seen[nb] = 1; q.push(nb); } }
    }
    blobs.push({ n, cx: (sx / n) * step, cy: (sy / n) * step, d: Math.max(x1 - x0 + 1, y1 - y0 + 1) * step });
  }
  // Sealed envelopes sit on one row: take the y-cluster with the most sizeable blobs, then its four largest, left to right.
  const big = blobs.filter((b) => b.n >= 4);
  let best = [];
  for (const b of big) {
    const row = big.filter((o) => Math.abs(o.cy - b.cy) < info.height * 0.03);
    if (row.length > best.length || (row.length === best.length && row.reduce((t, o) => t + o.n, 0) > best.reduce((t, o) => t + o.n, 0))) best = row;
  }
  const seals = best.sort((a, b) => b.n - a.n).slice(0, 4).sort((a, b) => a.cx - b.cx).map((b) => { const [x, y] = s.toPt(b.cx, b.cy); return { x, y, d: b.d * s.k }; });
  if (seals.length === 4) return seals;
  if (!PROOF) throw new Error(`T03: found ${seals.length} wax seals; expected 4 — inspect the scene`);
  // Layout proof only (144-px preview: seals are ~4 px): the niche row read off the preview by eye.
  return [64, 140, 254, 330].map((x) => ({ x, y: 372, d: 20 }));
}

/* ─────────────── product layer components ─────────────── */

const ICON = {
  account: 'M12 4a3.8 3.8 0 1 0 0 7.6A3.8 3.8 0 1 0 12 4zM4.5 20.5c.9-3.6 3.8-5.6 7.5-5.6s6.6 2 7.5 5.6',
  money: 'M5 7.5h14v9H5zM5 11h14M8 7.5V6M16 7.5V6',
  plus: 'M12 5v14M5 12h14',
  clock: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 1 0 0-17zM12 7.5V12l3 2',
  document: 'M6 3.5h8l4 4v13H6zM14 3.5v4h4M9 12h6M9 15h6M9 18h4',
};
const icon = (name, size, color) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="${ICON[name]}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const logo = (x, y, h, extra = '') => `<img class="logo" src="${LOGO}" style="left:${x}px;top:${y}px;height:${h}px;width:${(h * LOGO_RATIO).toFixed(2)}px;${extra}">`;

function nav(y, tone) {
  const items = [['HOME', 'account'], ['MONEY', 'money'], ['', 'plus'], ['PLAN', 'clock'], ['CREDIT', 'document']];
  const cw = (340 - 16) / 5;
  return items.map(([label, ic], i) => {
    const active = i === 0;
    return `<div class="navcell ${active ? 'on' : ''} ${tone}" style="left:${26.5 + i * (cw + 4)}px;top:${y}px;width:${cw}px">
      ${icon(ic, i === 2 ? 18 : 16, active ? '#F6F1E6' : '#2B2620')}${label ? `<span>${label}</span>` : ''}</div>`;
  }).join('');
}

const cta = (y, h = 46) => `<div class="cta" style="top:${y}px;height:${h}px"><span>${P.primary_action}</span></div>`;

function purchase(y, style) {
  const b = P.purchase_bridge;
  if (style === 'editorial') {
    return `<div class="pb-ed" style="top:${y}px"><i class="rule"></i>
      <div class="pb-text"><b>${b.headline}</b><p>${b.body}</p></div>
      <div class="pb-btn">${b.cta}</div></div>`;
  }
  return `<div class="pb ${style}" style="top:${y}px"><div class="pb-text"><b>${b.headline}</b><p>${b.body}</p></div><div class="pb-btn">${b.cta}</div></div>`;
}

const CSS = `
@font-face{font-family:IS;src:url(${FONT('instrument-serif-400')})}
@font-face{font-family:BSC;font-weight:300;src:url(${FONT('barlow-semi-condensed-300')})}
@font-face{font-family:BSC;font-weight:400;src:url(${FONT('barlow-semi-condensed-400')})}
@font-face{font-family:BSC;font-weight:500;src:url(${FONT('barlow-semi-condensed-500')})}
*{box-sizing:border-box;margin:0;padding:0}
body{width:${W}px;height:${H}px;overflow:hidden;background:#EDE7DC}
#c{position:relative;width:${W}px;height:${H}px;overflow:hidden;font-family:BSC;color:#2B2620}
#c>*{position:absolute}
.scene{top:0;height:${H}px;max-width:none}
.logo{mix-blend-mode:multiply;opacity:.94}
.ink{mix-blend-mode:multiply}
.lbl{font:500 10.5px/1 BSC;letter-spacing:.24em}
.small{font:500 8.5px/1 BSC;letter-spacing:.22em}
.disp{font-family:IS;font-weight:400;letter-spacing:-.01em;line-height:.86}
.emerald{color:#0F3D32}
.taupe{color:#7A6A5A}
.brass{color:#8E6B3C}
.cta{left:26.5px;width:340px;border-radius:8px;background:linear-gradient(180deg,#14473A 0%,#0F3D32 55%,#0C3329 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 1px 0 rgba(255,255,255,.12) inset,0 10px 22px -12px rgba(30,24,16,.55),0 2px 4px rgba(30,24,16,.16)}
.cta span{font:500 11.5px/1 BSC;letter-spacing:.26em;color:#F6F1E6;padding-left:.26em}
.pb{left:26.5px;width:340px;height:70px;border-radius:8px;display:flex;align-items:center;gap:12px;padding:0 12px 0 16px}
.pb-text b{display:block;font:500 9.5px/1.2 BSC;letter-spacing:.2em}
.pb-text p{font:400 9px/1.35 BSC;letter-spacing:.14em;color:#6E6052;margin-top:5px}
.pb-text{flex:1}
.pb-btn{flex:none;height:34px;padding:0 14px;border-radius:8px;border:1px solid rgba(43,38,32,.55);display:flex;align-items:center;font:500 9.5px/1 BSC;letter-spacing:.2em;background:rgba(249,246,239,.55)}
.pb.stone{background:rgba(246,240,229,.62);backdrop-filter:blur(14px) saturate(1.05);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.55);box-shadow:0 12px 26px -16px rgba(40,30,18,.5)}
.pb.editorial-type .pb-text b{font:400 13.5px/1.05 IS;letter-spacing:.02em}
.pb.paper{background:linear-gradient(180deg,#FCF9F2,#F5EFE3);border:1px solid rgba(160,140,112,.35);box-shadow:0 1px 0 #fff inset,0 14px 24px -14px rgba(50,36,20,.45),0 2px 3px rgba(50,36,20,.12)}
.pb-ed{left:26.5px;width:340px;height:58px;display:flex;align-items:center;gap:12px}
.pb-ed .rule{position:absolute;left:0;right:0;top:0;height:1px;background:rgba(43,38,32,.28)}
.pb-ed .pb-text{padding-top:10px}
.pb-ed .pb-btn{margin-top:10px}
.navcell{top:0;height:46px;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;font:500 7.5px/1 BSC;letter-spacing:.2em;color:#2B2620;background:rgba(249,246,239,.7);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.6);box-shadow:0 8px 18px -12px rgba(40,30,18,.45)}
.navcell.on{background:#0F3D32;color:#F6F1E6;border-color:#0F3D32}
.navcell span{padding-left:.2em}
.hair{background:rgba(43,38,32,.55)}
.grain{inset:0;pointer-events:none;mix-blend-mode:overlay;opacity:.22}
.proof{inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none}
.proof span{transform:rotate(-58deg);font:600 15px/1 BSC;letter-spacing:.3em;color:rgba(110,31,45,.55);border:1.5px solid rgba(110,31,45,.45);padding:8px 14px;background:rgba(246,240,229,.5)}
`;

const GRAIN = `<svg class="grain" width="${W}" height="${H}"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .9 0"/></filter><rect width="100%" height="100%" filter="url(#g)"/></svg>`;

/* ─────────────── the three authored pages ─────────────── */

function t01(s, floor) {
  // The open floor is the money: the figure sits in the sunlit square; the shaded perimeter holds the four commitments.
  const cx = floor.x + floor.w / 2;
  const top = floor.y + floor.h * 0.2;
  const f = { x: floor.x + 8, y: floor.y + 6, w: floor.w - 16, h: floor.h - 12 };
  const tick = (x, y, dx, dy) => `<i class="hair" style="left:${x}px;top:${y}px;width:${dx || 0.8}px;height:${dy || 0.8}px"></i>`;
  const corners = [[f.x, f.y], [f.x + f.w, f.y], [f.x, f.y + f.h], [f.x + f.w, f.y + f.h]].map(([x, y], i) => tick(i % 2 ? x - 14 : x, y, 14, 0) + tick(x, i < 2 ? y : y - 14, 0, 14)).join('');
  // Survey annotations: tracked caps on the shaded perimeter, a short hairline leader into the sunlit square.
  const tag = (label, x, y, align, vertical = false) => vertical
    ? `<div class="small ink" style="left:${x}px;top:${y}px;transform:translate(${align === 'r' ? '-100%' : '0'},-50%) rotate(${align === 'r' ? 90 : -90}deg);transform-origin:${align === 'r' ? 'right' : 'left'} center;color:#3F352C">${label}</div>`
    : `<div class="small ink" style="left:${x}px;top:${y}px;transform:translateX(-50%);color:#3F352C">${label}</div>`;
  return `
  ${logo(22, 24, 50)}
  ${corners}
  ${tag('PLANS', cx, f.y - 16, 'c')}
  ${tag('BILLS', Math.max(14, f.x - 2), f.y + f.h * 0.5 - 4, 'l', true)}
  ${tag('GOALS', Math.min(W - 14, f.x + f.w + 2), f.y + f.h * 0.5 - 4, 'r', true)}
  ${tag('BUFFER', cx, f.y + f.h + 8, 'c')}
  <div class="lbl ink" style="left:0;width:${W}px;top:${top}px;text-align:center">${P.primary_signal}</div>
  <div class="disp emerald ink" style="left:0;width:${W}px;top:${top + 20}px;text-align:center;font-size:92px">${P.amount}</div>
  <div class="small ink taupe" style="left:0;width:${W}px;top:${top + 108}px;text-align:center">${P.date_line}</div>
  <div class="small ink" style="left:0;width:${W}px;top:${top + 128}px;text-align:center;color:#5C4F43;letter-spacing:.18em">${P.held_summary}</div>
  ${cta(Math.max(floor.y + floor.h + 34, 606))}
  ${purchase(Math.max(floor.y + floor.h + 92, 664), 'stone')}
  ${nav(770, '')}`;
}

function t02() {
  // The answer, set in the morning light: only the words that hold money are metal.
  const x = 24;
  return `
  ${logo(x, 24, 50)}
  <div class="lbl ink" style="left:${x}px;top:108px">${P.primary_signal}</div>
  <div class="disp ink" style="left:${x - 1}px;top:128px;font-size:31px;color:#3A3129">YOU CAN SPEND</div>
  <div class="disp emerald ink" style="left:${x - 4}px;top:160px;font-size:100px">${P.amount}</div>
  <div class="small ink taupe" style="left:${x}px;top:262px">${P.date_line}</div>
  <i class="hair ink" style="left:${x}px;top:284px;width:132px;height:.8px"></i>
  <div class="disp ink" style="left:${x - 1}px;top:300px;font-size:25px;line-height:1.02;color:#3A3129">AFTER <span class="brass">BILLS</span>, <span class="brass">PLANS</span>,<br><span class="brass">GOALS</span> &amp; <span class="brass">BUFFER</span>.</div>
  ${cta(628)}
  ${purchase(686, 'stone editorial-type')}
  ${nav(772, '')}`;
}

function t03(seals) {
  // The sorting cabinet: four sealed commitments; the centre niche is open — the only letter opened is what you can spend.
  const names = ['BILLS', 'PLANS', 'GOALS', 'BUFFER'];
  const sill = seals.length ? Math.max(...seals.map((q) => q.y)) + 74 : 440;
  const mark = (q) => {
    const d = q.d * 0.62;
    return `<div style="left:${q.x - d / 2}px;top:${q.y - d / 2}px;width:${d}px;height:${d}px;overflow:hidden;mix-blend-mode:multiply;opacity:.6">
      <img src="${LOGO}" style="position:absolute;height:${d}px;width:${d * LOGO_RATIO}px;left:${d * 0.22}px;top:0;filter:brightness(.35) sepia(1) hue-rotate(-30deg) saturate(2.2)"></div>`;
  };
  const centre = seals.length === 4 ? (seals[1].x + seals[2].x) / 2 : W / 2;
  return `
  ${logo(22, 24, 50)}
  <div class="lbl ink" style="left:0;width:${W}px;top:92px;text-align:center">${P.primary_signal}</div>
  <div class="disp emerald ink" style="left:0;width:${W}px;top:110px;font-size:88px;text-align:center">${P.amount}</div>
  <div class="small ink taupe" style="left:0;width:${W}px;top:198px;text-align:center">${P.date_line}</div>
  <i class="hair ink" style="left:${centre}px;top:216px;width:.8px;height:30px;opacity:.6"></i>
  ${seals.map(mark).join('')}
  ${seals.map((q, i) => `<div class="small ink" style="left:${q.x}px;top:${sill}px;transform:translateX(-50%);color:#4A3F35">${names[i]}</div>`).join('')}
  ${cta(620)}
  ${purchase(678, 'paper')}
  ${nav(770, '')}`;
}

/* ─────────────── render ─────────────── */

const exe = [process.env.JURNL_QA_CHROMIUM, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].filter(Boolean).find((p) => existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await (await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 3 })).newPage();
const report = [];
for (const T of TERRITORIES) {
  const file = sceneFile(T.t);
  const s = await load(file, T.cx);
  const measured = T.t === 'T01' ? { floor: measureFloor(s) } : T.t === 'T03' ? { seals: measureSeals(s) } : {};
  const body = T.t === 'T01' ? t01(s, measured.floor) : T.t === 'T02' ? t02(s) : t03(measured.seals);
  const sceneW = (s.info.width * H) / s.info.height;
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div id="c">
    <img class="scene" src="${uri(file, file.endsWith('.png') ? 'image/png' : 'image/jpeg')}" style="left:${(-s.left * s.k).toFixed(2)}px;width:${sceneW.toFixed(2)}px">
    ${body}${GRAIN}${PROOF ? '<div class="proof"><span>LAYOUT PROOF · NOT AUTHORITY</span></div>' : ''}</div></body></html>`;
  writeFileSync(join(OUT, `${T.t}.html`), html);
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete));
  const out = join(OUT, T.file);
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: W, height: H } });
  report.push({ territory: T.t, scene: file.slice(ROOT.length + 1), scene_px: `${s.info.width}×${s.info.height}`, crop_left_px: Math.round(s.left), measured, composite: out.slice(ROOT.length + 1) });
}
// Founder review board: the three candidates side by side, captions only.
const board = await (await browser.newContext({ viewport: { width: 1290, height: 980 }, deviceScaleFactor: 2 })).newPage();
await board.setContent(`<html><head><style>@font-face{font-family:BSC;src:url(${FONT('barlow-semi-condensed-500')})}@font-face{font-family:IS;src:url(${FONT('instrument-serif-400')})}
body{margin:0;background:#EEE8DD;font-family:BSC;color:#2B2620;padding:28px 30px}h1{font:400 30px/1 IS;margin:0 0 4px}h2{font:500 10px/1 BSC;letter-spacing:.24em;color:#7A6A5A;margin:0 0 22px}
.row{display:flex;gap:30px}.c img{width:393px;height:852px;display:block;border-radius:2px;box-shadow:0 20px 40px -24px rgba(40,30,18,.5)}.c p{font:500 10px/1.3 BSC;letter-spacing:.22em;margin:12px 0 0}</style></head><body>
<h1>F09 SAFE TO SPEND</h1><h2>THREE CONCEPT CANDIDATES · 393×852 · ${PROOF ? 'LAYOUT PROOF — NOT FOR REVIEW' : 'FOUNDER REVIEW'}</h2><div class="row">${TERRITORIES.map((T) => `<div class="c"><img src="${uri(join(OUT, T.file), 'image/png')}"><p>${T.t.replace('T0', '0')} ${T.name}</p></div>`).join('')}</div></body></html>`);
await board.evaluate(() => document.fonts.ready);
await board.screenshot({ path: join(OUT, 'F09_FOUNDER_REVIEW_BOARD.png'), fullPage: true });
await browser.close();
writeFileSync(join(OUT, 'ASSEMBLY_REPORT.json'), `${JSON.stringify({ proof: PROOF, payload: 'JURNL/F09_SAFE/F09_FOUNDER_REVIEW_PAYLOAD.json', device_chrome: 'NONE', territories: report }, null, 2)}\n`);
console.log(JSON.stringify(report.map((r) => ({ t: r.territory, px: r.scene_px, m: r.measured })), null, 1));
