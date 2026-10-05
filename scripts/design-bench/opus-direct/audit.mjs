/**
 * OPUS-DIRECT1R1 forensic audit harness.
 * Golden (608x1088 master) is upscaled to the live 768x1376 viewport so both
 * sides are compared in one normalized coordinate space (Phase 3).
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';

const URL = process.env.TOD_URL || 'http://localhost:5174/projects/ndxbook/design/twin-opus-direct';
const GOLDEN = '/workspace/public/site00/twin-v3-design-page-authority/founder-r5f2-ndxbook/mobile-master.jpg';
const OUT = '/tmp/r1';
const TAG = process.argv[2] || 'x';
const W = 768, H = 1376;
fs.mkdirSync(OUT, { recursive: true });

/* ---------- live capture at the reference viewport ---------- */
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200);
const shot = `${OUT}/${TAG}-live.png`;
await page.screenshot({ path: shot });

const SECTIONS = {
  '01 SITE00_HEADER': '.tod-header',
  '02 PRIMARY_NAV': '.tod-nav',
  '03 NDXBOOK_CONTEXT_BAR': '.tod-context',
  '04 TARGET_VIEWPORT_STAGE': '.tod-band',
  '05 HERO_AUTHORITY_ROW': '.tod-herorow',
  '05a HERO': '.tod-hero',
  '05b AUTHORITY_RAIL': '.tod-rail',
  '06 CANDIDATE_GALLERY': '.tod-gallery',
  '07 CANDIDATE_ACTION_ROW': '.tod-actions',
  '08 STRUCTURED_OUTPUT': '.tod-out',
  '09 PIPELINE_READINESS': '.tod-pipe',
  '10 CONCEPT_HISTORY_TABS': '.tod-tabs',
  '11 CONCEPT_DATA_ROW': '.tod-concept',
  '12 BOTTOM_DOCK': '.tod-bottom',
};

const live = await page.evaluate((sel) => {
  const out = {};
  for (const [k, s] of Object.entries(sel)) {
    const el = document.querySelector(s);
    out[k] = el ? (({ x, y, width, height }) => ({
      x: +x.toFixed(1), y: +y.toFixed(1), w: +width.toFixed(1), h: +height.toFixed(1), b: +(y + height).toFixed(1),
    }))(el.getBoundingClientRect()) : null;
  }
  return out;
}, SECTIONS);

const shell = await page.evaluate(() => {
  const root = document.querySelector('.tod-root');
  const screen = document.querySelector('.tod-screen');
  const cs = (el) => (el ? getComputedStyle(el) : null);
  const rs = cs(root), ss = cs(screen);
  const sr = screen ? screen.getBoundingClientRect() : null;
  return {
    rootBg: rs?.backgroundColor,
    screenRadius: ss?.borderRadius,
    screenBg: ss?.backgroundColor,
    screenTransform: ss?.transform,
    screenBox: sr ? { x: +sr.x.toFixed(1), y: +sr.y.toFixed(1), w: +sr.width.toFixed(1), h: +sr.height.toFixed(1) } : null,
    docScrollH: document.documentElement.scrollHeight,
    iconCount: document.querySelectorAll('.tod-screen svg').length,
  };
});
await browser.close();

/* ---------- normalize golden to the live viewport ---------- */
const goldBuf = await sharp(GOLDEN).resize(W, H, { kernel: 'lanczos3' }).raw().toBuffer();
const liveBuf = await sharp(shot).raw().toBuffer();
const px = (b, x, y, c) => b[(y * W + x) * 3 + c];
const lum = (b, x, y) => 0.299 * px(b, x, y, 0) + 0.587 * px(b, x, y, 1) + 0.114 * px(b, x, y, 2);

function regionDiff(x0, y0, x1, y1) {
  let n = 0, t = 0, sum = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const d = (Math.abs(px(goldBuf, x, y, 0) - px(liveBuf, x, y, 0)) +
      Math.abs(px(goldBuf, x, y, 1) - px(liveBuf, x, y, 1)) +
      Math.abs(px(goldBuf, x, y, 2) - px(liveBuf, x, y, 2))) / 3;
    sum += d; t++; if (d > 40) n++;
  }
  return { pct: +(100 * n / t).toFixed(2), mean: +(sum / t).toFixed(1) };
}

/** Golden section boundaries measured in 608-space, converted to 768-space. */
const K = W / 608;
const GOLD = {
  '01 SITE00_HEADER': [0, 0, 608, 32.5],
  '02 PRIMARY_NAV': [0, 32.5, 608, 59],
  '03 NDXBOOK_CONTEXT_BAR': [0, 59, 608, 87.5],
  '04 TARGET_VIEWPORT_STAGE': [0, 87.5, 608, 160.5],
  '05 HERO_AUTHORITY_ROW': [12, 171, 592, 484],
  '05a HERO': [12, 171, 422, 484],
  '05b AUTHORITY_RAIL': [432, 171, 592, 484],
  '06 CANDIDATE_GALLERY': [12, 496.4, 592, 650.8],
  '07 CANDIDATE_ACTION_ROW': [12, 621.2, 592, 650.8],
  '08 STRUCTURED_OUTPUT': [12, 662.9, 592, 813.4],
  '09 PIPELINE_READINESS': [12, 823.3, 592, 942.4],
  '10 CONCEPT_HISTORY_TABS': [0, 949, 608, 977],
  '11 CONCEPT_DATA_ROW': [0, 977, 608, 1050],
  '12 BOTTOM_DOCK': [0, 1050, 608, 1088],
};

console.log(`\n=== SHELL (${TAG}) ===`);
console.log(JSON.stringify(shell));
console.log('errors:', errors.length ? errors.slice(0, 4) : 'none');

console.log(`\n=== SECTION BOUNDARY MAP — golden vs live, 768x1376 space (${TAG}) ===`);
console.log('region'.padEnd(26) + 'GOLD x,y,w,h'.padEnd(30) + 'LIVE x,y,w,h'.padEnd(30) + 'drift dx,dy,dw,dh');
let maxDrift = 0;
const drifts = [];
for (const [name, g] of Object.entries(GOLD)) {
  const gx = g[0] * K, gy = g[1] * K, gw = (g[2] - g[0]) * K, gh = (g[3] - g[1]) * K;
  const l = live[name];
  if (!l) { console.log(name.padEnd(26) + 'MISSING'); continue; }
  const d = [l.x - gx, l.y - gy, l.w - gw, l.h - gh].map((v) => +v.toFixed(1));
  const m = Math.max(...d.map(Math.abs));
  if (m > maxDrift) maxDrift = m;
  drifts.push({ name, d, m });
  console.log(
    name.padEnd(26) +
    `${gx.toFixed(1)},${gy.toFixed(1)},${gw.toFixed(1)},${gh.toFixed(1)}`.padEnd(30) +
    `${l.x},${l.y},${l.w},${l.h}`.padEnd(30) +
    d.join(', ') + (m > 4 ? '   <== ' + m.toFixed(1) : ''),
  );
}
console.log('MAX_ABS_DRIFT:', maxDrift.toFixed(1), 'px');

console.log(`\n=== REGION DIFF (${TAG}) ===`);
const bands = [
  ['corners TL', 0, 0, 40, 40], ['corners TR', W - 40, 0, W, 40],
  ['corners BL', 0, H - 40, 40, H], ['corners BR', W - 40, H - 40, W, H],
  ['header', 0, 0, W, 41], ['nav', 0, 41, W, 75], ['context', 0, 75, W, 111],
  ['band', 0, 111, W, 203], ['hero', 15, 216, 533, 611], ['rail', 533, 216, W, 611],
  ['gallery', 0, 620, W, 784], ['actions', 0, 784, W, 822], ['structured', 0, 830, W, 1030],
  ['pipeline', 0, 1035, W, 1192], ['tabs', 0, 1196, W, 1236], ['concept', 0, 1236, W, 1328],
  ['dock', 0, 1328, W, H],
];
for (const [n, a, b, c, d] of bands) {
  const r = regionDiff(a, b, c, d);
  console.log(n.padEnd(14), 'pct>40 ' + String(r.pct).padStart(6), ' meanAbs ' + String(r.mean).padStart(6));
}
const all = regionDiff(0, 0, W, H);
console.log('OVERALL'.padEnd(14), 'pct>40 ' + String(all.pct).padStart(6), ' meanAbs ' + String(all.mean).padStart(6));

/* structural (blurred) score */
const gs = await sharp(GOLDEN).resize(96, 172, { kernel: 'lanczos3' }).raw().toBuffer();
const ls = await sharp(shot).resize(96, 172, { kernel: 'lanczos3' }).raw().toBuffer();
let ssum = 0, sbad = 0;
for (let i = 0; i < 96 * 172; i++) {
  const d = (Math.abs(gs[i * 3] - ls[i * 3]) + Math.abs(gs[i * 3 + 1] - ls[i * 3 + 1]) + Math.abs(gs[i * 3 + 2] - ls[i * 3 + 2])) / 3;
  ssum += d; if (d > 40) sbad++;
}
console.log('STRUCTURAL   meanAbs ' + (ssum / (96 * 172)).toFixed(2) + '  pct>40 ' + (100 * sbad / (96 * 172)).toFixed(2));

/* side-by-side + heatmap */
const heat = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) {
  const d = (Math.abs(goldBuf[i * 3] - liveBuf[i * 3]) + Math.abs(goldBuf[i * 3 + 1] - liveBuf[i * 3 + 1]) + Math.abs(goldBuf[i * 3 + 2] - liveBuf[i * 3 + 2])) / 3;
  if (d > 40) { heat[i * 3] = 255; heat[i * 3 + 1] = 30; heat[i * 3 + 2] = 30; }
  else { const g = Math.round(225 - d); heat[i * 3] = g; heat[i * 3 + 1] = g; heat[i * 3 + 2] = g; }
}
await sharp(heat, { raw: { width: W, height: H, channels: 3 } }).png().toFile(`${OUT}/${TAG}-heat.png`);
await sharp({ create: { width: W * 2 + 20, height: H, channels: 3, background: '#111' } })
  .composite([
    { input: await sharp(GOLDEN).resize(W, H, { kernel: 'lanczos3' }).png().toBuffer(), left: 0, top: 0 },
    { input: shot, left: W + 20, top: 0 },
  ]).png().toFile(`${OUT}/${TAG}-sbs.png`);
console.log('\nwrote', `${OUT}/${TAG}-{live,heat,sbs}.png`);
