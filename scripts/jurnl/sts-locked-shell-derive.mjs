/**
 * P0.JURNL.STS.LOCKED-SHELL-DERIVATION-CORRECTION1
 * One photographic plate from 07_CHECK_A_PURCHASE. Top brand and bottom nav
 * are pixel copies of that parent. Only the middle is recomposed.
 * Canvas lock: 853×1844.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PARENT = '/tmp/jurnl-sts-lean/jurnl_grok_pack/07_CHECK_A_PURCHASE.jpg';
const CAT = '/tmp/jurnl-sts-lean/jurnl_grok_pack/08_SELECT_A_CATEGORY_DRAWER.jpg';
const ACCT = '/tmp/jurnl-sts-lean/jurnl_grok_pack/09_SELECT_AN_ACCOUNT_DRAWER.jpg';
const OUT = resolve(ROOT, 'JURNL/F09_SAFE/PURCHASE_OUTCOMES_INCREMENT1');
const FONTS = '/tmp/jurnl-fonts';
const W = 853;
const H = 1844;

const parentMeta = await sharp(PARENT).metadata();
const S = H / parentMeta.height;

function sy(y) {
  return Math.round(y * S);
}

const TOP_LOCK = sy(340);
const NAV_START = 1640;

const shell = await sharp(PARENT)
  .resize(W, H, { fit: 'fill', kernel: 'lanczos3' })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const px = Buffer.from(shell.data);
const CH = shell.info.channels;

function lum(i) {
  return (px[i] + px[i + 1] + px[i + 2]) / 3;
}
function creamAt(i) {
  const r = px[i];
  const g = px[i + 1];
  const b = px[i + 2];
  return r > 226 && g > 216 && b > 198 && r + 8 >= g && r >= b - 4;
}
function greenBtn(i) {
  const r = px[i];
  const g = px[i + 1];
  const b = px[i + 2];
  return g > 70 && g > r + 8 && g > b + 4 && r < 140 && b < 130;
}

mkdirSync(OUT, { recursive: true });
const platePath = resolve(OUT, 'STS_ENVIRONMENT_PLATE_LOCKED_4K.png');
const { spawnSync } = await import('node:child_process');
const py = spawnSync('python3', ['-'], {
  input: `
import cv2, numpy as np
src = cv2.imread(${JSON.stringify(PARENT)})
orig = cv2.resize(src, (${W}, ${H}), interpolation=cv2.INTER_LANCZOS4)
gray = cv2.cvtColor(orig, cv2.COLOR_BGR2GRAY).astype(np.float32)
b, g, r = [c.astype(np.float32) for c in cv2.split(orig)]
TOP, NAV = ${TOP_LOCK}, ${NAV_START}
# Rows with no headline glyphs. Letters are replaced from these rows
# at the same x, so the arch, sea, and pier stay put.
clean = np.array(list(range(416, 430)) + list(range(478, 504)) + list(range(522, 540)) + list(range(566, 600)))
mask = np.zeros(gray.shape, np.uint8)
for y in range(428, 570):
    ya = clean[clean < y].max()
    yb = clean[clean > y].min()
    t = (y - ya) / (yb - ya)
    bg = (1 - t) * gray[ya] + t * gray[yb]
    hit = ((bg - gray[y])[120:750] > 10)
    mask[y, 120:750][hit] = 255
mask = cv2.dilate(mask, np.ones((7, 7), np.uint8), iterations=2)
mask[:TOP] = 0
mask[590:] = 0
leaf = (g > r + 10) & (g > b + 6) & (gray < 170)
mask[leaf] = 0
pre = orig.copy()
for y in np.where(mask.any(axis=1))[0]:
    ya = clean[clean < y].max()
    yb = clean[clean > y].min()
    t = (y - ya) / (yb - ya)
    sel = mask[y] > 0
    pre[y, sel] = ((1 - t) * orig[ya, sel].astype(np.float32) + t * orig[yb, sel].astype(np.float32)).astype(np.uint8)
out = cv2.inpaint(pre, mask, 5, cv2.INPAINT_TELEA)
# The form is lifted off once. The terrace underneath is the parent's own
# left pavement, stretched across the occluded span. Margins outside this
# span stay the original photograph (vase, pier, blanket, column).
sliver = orig[1300:1560, 8:70]
x0, x1 = 72, 824
y0, y1 = 696, 1606
tex = cv2.resize(sliver, (x1 - x0, y1 - y0), interpolation=cv2.INTER_CUBIC)
final = out.copy()
final[y0:y1, x0:x1] = tex
for i, a in enumerate(np.linspace(0, 1, 24)):
    final[y0 + i, x0:x1] = ((1 - a) * out[y0 + i, x0:x1].astype(np.float32) + a * tex[i].astype(np.float32)).astype(np.uint8)
# Below the form, match the real floor color on the left and right so the
# cleared area does not read as a separate panel. Samples are smoothed
# vertically so leaf shadows do not become scan lines.
yL, yR = 1280, 1606
left = cv2.GaussianBlur(orig[yL:yR, 6:36].mean(axis=1).astype(np.float32).reshape(-1, 1, 3), (1, 31), 0).reshape(-1, 3)
right = cv2.GaussianBlur(orig[yL:yR, 818:850].mean(axis=1).astype(np.float32).reshape(-1, 1, 3), (1, 31), 0).reshape(-1, 3)
span = np.linspace(0, 1, x1 - x0, dtype=np.float32)[:, None]
grad = (1 - span)[None, :, :] * left[:, None, :] + span[None, :, :] * right[:, None, :]
blend = np.linspace(0, 1, 48, dtype=np.float32)[:, None, None]
final[yL:yL + 48, x0:x1] = ((1 - blend) * final[yL:yL + 48, x0:x1].astype(np.float32) + blend * grad[:48]).astype(np.uint8)
final[yL + 48:yR, x0:x1] = np.clip(grad[48:], 0, 255).astype(np.uint8)
final[:TOP] = orig[:TOP]
final[NAV:] = orig[NAV:]
cv2.imwrite(${JSON.stringify(platePath)}, final)
`,
  encoding: 'utf8',
});
if (py.status !== 0) {
  console.error(py.stderr);
  process.exit(py.status ?? 1);
}
const plateRaw = await sharp(platePath).removeAlpha().raw().toBuffer();
const plate = Buffer.from(plateRaw);

async function thumb(src, box, name) {
  const dest = `/tmp/jurnl-outcomes-lock/${name}.jpg`;
  mkdirSync('/tmp/jurnl-outcomes-lock', { recursive: true });
  await sharp(src).extract(box).resize(160, 160, { fit: 'cover' }).jpeg({ quality: 90 }).toFile(dest);
  return dest;
}

const groceries = await thumb(CAT, { left: 360, top: 1064, width: 140, height: 110 }, 'groceries');
const dining = resolve(ROOT, 'src/projects/jurnl/families/F10_PURCHASES/THUMBS/dining.jpg');
const checking = await thumb(ACCT, { left: 28, top: 748, width: 310, height: 210 }, 'checking');
const CARD_TOP = sy(548) - TOP_LOCK;

const SCREENS = [
  {
    id: 'PURCHASE_RESULT_GOOD_TO_GO',
    kicker: 'PURCHASE CHECKED',
    title: 'YOU’RE GOOD<br>TO GO',
    support: 'THIS PURCHASE FITS WITH YOUR PLAN.',
    amount: '$86',
    category: 'GROCERIES',
    catImg: groceries,
    tone: 'good',
    panelTitle: 'SAFE TO SPEND',
    panelFigure: '$1,198',
    panelLine: 'AFTER THIS PURCHASE.',
    primary: 'DONE',
    secondary: 'ADD ANOTHER PURCHASE',
  },
  {
    id: 'PURCHASE_RESULT_QUICK_CHECK_IN',
    kicker: 'PURCHASE CHECKED',
    title: 'A QUICK<br>CHECK-IN',
    support: 'THIS PURCHASE IS A BIT HIGHER THAN USUAL FOR THIS CATEGORY.',
    amount: '$240',
    category: 'DINING',
    catImg: dining,
    tone: 'caution',
    notice: 'WHAT JURNL NOTICED',
    noticeBody: 'DINING IS USUALLY LOWER THAN THIS.',
    panelTitle: 'SAFE TO SPEND',
    panelFigure: '$1,044',
    panelLine: 'AFTER THIS PURCHASE.',
    primary: 'CONTINUE ANYWAY',
    secondary: 'EDIT PURCHASE',
  },
  {
    id: 'PURCHASE_RESULT_DOESNT_FIT',
    kicker: 'PURCHASE CHECKED',
    title: 'THIS DOESN’T FIT<br>YOUR PLAN',
    support: 'THIS PURCHASE WOULD PUT YOU OVER YOUR SAFE TO SPEND AMOUNT.',
    amount: '$1,560',
    category: 'DINING',
    catImg: dining,
    tone: 'over',
    panelTitle: 'OVER YOUR PLAN',
    panelFigure: 'OVER BY $276',
    panelAside: 'SAFE TO SPEND $1,284',
    primary: 'ADJUST PLAN',
    secondary: 'EDIT PURCHASE',
  },
];

function html(screen) {
  const notice = screen.notice
    ? `<div class="notice"><b>${screen.notice}</b><span>${screen.noticeBody}</span></div>`
    : '';
  const aside = screen.panelAside ? `<em>${screen.panelAside}</em>` : `<small>${screen.panelLine}</small>`;
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
@font-face { font-family: 'JURNL Display'; src: url('file://${FONTS}/instrument-serif-400.ttf') format('truetype'); font-weight: 400; }
@font-face { font-family: 'JURNL Sans'; src: url('file://${FONTS}/barlow-semi-condensed-400.ttf') format('truetype'); font-weight: 400; }
@font-face { font-family: 'JURNL Sans'; src: url('file://${FONTS}/barlow-semi-condensed-500.ttf') format('truetype'); font-weight: 500; }
* { box-sizing: border-box; }
html, body { margin: 0; width: ${W}px; height: ${NAV_START - TOP_LOCK}px; background: transparent; }
body { position: relative; font-family: 'JURNL Sans', sans-serif; color: #1c1a17; }
.head { padding: 6px 48px 0; }
.kicker { margin: 8px 0 0; text-align: center; letter-spacing: 0.22em; font-size: 14px; font-weight: 500; }
h1 { margin: 8px 0 0; text-align: center; font-family: 'JURNL Display', serif; font-weight: 400; font-size: 46px; line-height: 0.92; letter-spacing: -0.02em; }
.support { margin: 10px auto 0; max-width: 640px; text-align: center; letter-spacing: 0.11em; font-size: 13px; font-weight: 500; line-height: 1.35; }
.sheet { position: absolute; left: 64px; right: 64px; top: ${CARD_TOP}px; display: flex; flex-direction: column; background: transparent; }
.card { background: rgba(250,247,241,0.97); border-radius: 22px; padding: 16px 18px 6px; box-shadow: 0 10px 28px rgba(60,48,36,0.08); }
.label { letter-spacing: 0.16em; font-size: 13px; font-weight: 500; color: #3a342c; }
.amt { font-family: 'JURNL Display', serif; font-size: 64px; line-height: 1; margin: 4px 0 8px; }
.row { display: flex; gap: 14px; align-items: center; padding: 12px 0; border-top: 1px solid rgba(80,70,58,0.12); }
.row img { width: 92px; height: 72px; object-fit: cover; border-radius: 12px; }
.row b { display: block; font-family: 'JURNL Display', serif; font-size: 28px; font-weight: 400; letter-spacing: 0.02em; margin-top: 2px; }
.panel { margin-top: 14px; border-radius: 18px; padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.panel strong { font-family: 'JURNL Display', serif; font-size: 42px; font-weight: 400; display: block; line-height: 1; }
.panel small, .panel em { display: block; letter-spacing: 0.12em; font-style: normal; font-size: 13px; font-weight: 500; margin-top: 4px; }
.good { background: #5e6b52; color: #f7f4ee; }
.caution { background: #f4eadc; color: #6d5228; }
.caution strong { color: #8a6230; }
.over { background: #c48b7c; color: #fbf6f2; }
button { display: block; width: 100%; border-radius: 14px; letter-spacing: 0.16em; font-family: 'JURNL Sans', sans-serif; font-weight: 500; font-size: 16px; }
.primary { margin-top: 14px; height: 58px; border: 0; color: #f7f4ee; }
.good-btn { background: #4f5c46; }
.caution-btn { background: #8d6a3b; }
.over-btn { background: #c17d6e; }
.notice { margin-top: 12px; background: #f4eadc; border-radius: 16px; padding: 12px 14px; color: #6d5228; }
.notice b { display: block; letter-spacing: 0.14em; font-size: 12px; font-weight: 500; }
.notice span { display: block; margin-top: 4px; letter-spacing: 0.06em; font-size: 14px; line-height: 1.35; }
.secondary { margin-top: 10px; height: 54px; background: rgba(250,247,241,0.92); border: 1px solid rgba(70,60,50,0.18); color: #2a261f; }
.over .secondary, .caution .secondary { color: #3a342c; }
</style>
</head>
<body>
<div class="head">
<p class="kicker">${screen.kicker}</p>
<h1>${screen.title}</h1>
<p class="support">${screen.support}</p>
</div>
<div class="sheet">
<section class="card">
  <div class="label">PURCHASE AMOUNT</div>
  <div class="amt">${screen.amount}</div>
  <div class="row"><img src="${screen.catImg}" alt="" /><div><div class="label">PURCHASE CATEGORY</div><b>${screen.category}</b></div></div>
  <div class="row"><img src="${checking}" alt="" /><div><div class="label">PAY WITH</div><b>CHECKING</b></div></div>
</section>
${notice}
<section class="panel ${screen.tone}">
  <div><div class="label">${screen.panelTitle}</div><strong>${screen.panelFigure}</strong>${screen.panelAside ? '' : `<small>${screen.panelLine}</small>`}</div>
  ${screen.panelAside ? `<em>${screen.panelAside}</em>` : ''}
</section>
<button class="primary ${screen.tone}-btn" type="button">${screen.primary}</button>
<button class="secondary" type="button">${screen.secondary}</button>
</div>
</body>
</html>`;
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: W, height: NAV_START - TOP_LOCK }, deviceScaleFactor: 1 });

const qa = [];
for (const screen of SCREENS) {
  const file = `file:///tmp/jurnl-outcomes-lock/${screen.id}.html`;
  writeFileSync(`/tmp/jurnl-outcomes-lock/${screen.id}.html`, html(screen));
  await page.goto(file, { waitUntil: 'networkidle' });
  const mid = await page.screenshot({ omitBackground: true, type: 'png' });
  const base = Buffer.from(plate);
  const midRaw = await sharp(mid).ensureAlpha().resize(W, NAV_START - TOP_LOCK, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  const mw = midRaw.info.width;
  const mh = midRaw.info.height;
  const mc = midRaw.info.channels;
  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      const si = (y * mw + x) * mc;
      const a = midRaw.data[si + 3] / 255;
      if (a < 0.02) continue;
      const di = ((y + TOP_LOCK) * W + x) * CH;
      base[di] = Math.round(midRaw.data[si] * a + base[di] * (1 - a));
      base[di + 1] = Math.round(midRaw.data[si + 1] * a + base[di + 1] * (1 - a));
      base[di + 2] = Math.round(midRaw.data[si + 2] * a + base[di + 2] * (1 - a));
    }
  }
  for (let y = 0; y < TOP_LOCK; y++) {
    px.copy(base, y * W * CH, y * W * CH, (y + 1) * W * CH);
  }
  for (let y = NAV_START; y < H; y++) {
    px.copy(base, y * W * CH, y * W * CH, (y + 1) * W * CH);
  }
  let topDiff = 0;
  let navDiff = 0;
  for (let i = 0; i < TOP_LOCK * W * CH; i++) if (base[i] !== px[i]) topDiff++;
  for (let y = NAV_START; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * CH;
      if (base[i] !== px[i] || base[i + 1] !== px[i + 1] || base[i + 2] !== px[i + 2]) navDiff++;
    }
  }
  const dest = resolve(OUT, `${screen.id}.png`);
  await sharp(base, { raw: { width: W, height: H, channels: CH } }).png().toFile(dest);
  qa.push({ id: screen.id, topDiff, navDiff, width: W, height: H, topLock: TOP_LOCK, navStart: NAV_START });
  console.log(screen.id, 'topDiff', topDiff, 'navDiff', navDiff);
}
await browser.close();
writeFileSync(resolve(OUT, 'LOCKED_SHELL_QA.json'), JSON.stringify({
  sprint: 'P0.JURNL.STS.LOCKED-SHELL-DERIVATION-CORRECTION1',
  canvas: [W, H],
  parent: '07_CHECK_A_PURCHASE.jpg',
  parentSource: [parentMeta.width, parentMeta.height],
  scale: S,
  topLock: TOP_LOCK,
  navStart: NAV_START,
  plate: 'STS_ENVIRONMENT_PLATE_LOCKED_4K.png',
  screens: qa,
  pass: qa.every((q) => q.topDiff === 0 && q.navDiff === 0),
}, null, 2));
console.log('plate', platePath);
