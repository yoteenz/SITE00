import { createRequire } from 'module';
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'fs';

const sharp = createRequire('/workspace/package.json')('sharp');

const SIZE = 512;
const TARGET = 320;
const INK = { r: 0x14, g: 0x14, b: 0x14 };
const RED = '#e5231b';
const BLACK_LUMA = 36;
const WHITE_LUMA = 248;
const OUT = '/workspace/docs/site00/bottom-nav/BOTTOM_NAV_ICON_FAMILY_V1';
const ASSET_DIR = '/home/ubuntu/.cursor/projects/workspace/assets';

const order = ['HUB', 'INBOX', 'DESIGN', 'EXPERIENCE', 'EXPRESSION', 'LIBRARY', 'ACTIVITY'];
const files = {
  HUB: '01_HUB',
  INBOX: '02_INBOX',
  DESIGN: '03_DESIGN',
  EXPERIENCE: '04_EXPERIENCE',
  EXPRESSION: '05_EXPRESSION',
  LIBRARY: '06_LIBRARY',
  ACTIVITY: '07_ACTIVITY',
};

// Pixel authority is the founder's high-quality renders, not a redraw.
// Both stack renders are open. HUB takes the tighter file; DESIGN takes the more open file.
const sources = {
  HUB: '01a0fd6b-c655-7ab2-beea-68feaa55981c.jpg',
  INBOX: '01a0fd6b-c67c-726b-ac8b-b51a36e1d059.jpg',
  DESIGN: '01a0fd6b-c687-7c7a-8f17-e95d11995549.jpg',
  EXPERIENCE: '01a0fd6b-c648-7d99-ace6-676af7cc02ae.jpg',
  EXPRESSION: '01a0fd6b-c670-7ae4-83a2-970c88dc3fcf.jpg',
  LIBRARY: '01a0fd6b-c664-77bf-b1bd-36eb90a09335.jpg',
  ACTIVITY: '01a0fd6b-c692-7364-a209-ae73cced5033.jpg',
};

function lumaOf(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function keyPixels(data, width, height, channels) {
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0, p = 0; i < data.length; i += channels, p += 4) {
    const luma = lumaOf(data[i], data[i + 1], data[i + 2]);
    let alpha = 0;
    if (luma <= BLACK_LUMA) alpha = 255;
    else if (luma < WHITE_LUMA) alpha = Math.round(((WHITE_LUMA - luma) / (WHITE_LUMA - BLACK_LUMA)) * 255);
    rgba[p] = INK.r;
    rgba[p + 1] = INK.g;
    rgba[p + 2] = INK.b;
    rgba[p + 3] = alpha;
  }
  return rgba;
}

function measureAlpha(data, width, height, cutoff = 16) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let n = 0;
  let sx = 0;
  let sy = 0;
  let red = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const a = data[i + 3];
      if (a > cutoff) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        n += 1;
        sx += x;
        sy += y;
        if (data[i] > 160 && data[i + 1] < 100 && data[i + 2] < 100) red += 1;
      }
    }
  }
  if (!n) return null;
  return {
    minX,
    minY,
    maxX,
    maxY,
    w: maxX - minX + 1,
    h: maxY - minY + 1,
    n,
    cx: sx / n,
    cy: sy / n,
    red,
  };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function estimateStroke(data, width, height, bounds) {
  const runs = [];
  const y0 = bounds.minY + 2;
  const y1 = bounds.maxY - 2;
  for (let y = y0; y <= y1; y += 3) {
    let run = 0;
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 128) run += 1;
      else if (run) {
        if (run >= 4 && run <= 80) runs.push(run);
        run = 0;
      }
    }
  }
  return runs.length ? median(runs) : 0;
}

async function keyedNative(role) {
  const src = `${OUT}/authority/hq/${files[role]}.jpg`;
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const rgba = keyPixels(data, info.width, info.height, info.channels);
  const bounds = measureAlpha(rgba, info.width, info.height, 12);
  const cropped = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .extract({ left: bounds.minX, top: bounds.minY, width: bounds.w, height: bounds.h })
    .png()
    .toBuffer();
  return { cropped, bounds };
}

async function fitToCanvas(cropped) {
  const meta = await sharp(cropped).metadata();
  const scale = TARGET / Math.max(meta.width, meta.height);
  const nw = Math.max(1, Math.round(meta.width * scale));
  const nh = Math.max(1, Math.round(meta.height * scale));
  const resized = await sharp(cropped).resize(nw, nh, { kernel: 'lanczos3', fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const mass = measureAlpha(resized.data, resized.info.width, resized.info.height, 16);
  const left = Math.round(SIZE / 2 - mass.cx);
  const top = Math.round(SIZE / 2 - mass.cy);
  const canvas = await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: await sharp(resized.data, { raw: resized.info }).png().toBuffer(), left, top }])
    .png()
    .toBuffer();
  const raw = await sharp(canvas).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const fitted = measureAlpha(raw.data, raw.info.width, raw.info.height, 16);
  const stroke = estimateStroke(raw.data, raw.info.width, raw.info.height, fitted);
  return { canvas, fitted, stroke };
}

for (const dir of ['masters', 'outputs', 'proof', 'qa', 'authority/hq']) mkdirSync(`${OUT}/${dir}`, { recursive: true });
for (const role of order) {
  const from = `${ASSET_DIR}/${sources[role]}`;
  const to = `${OUT}/authority/hq/${files[role]}.jpg`;
  copyFileSync(from, to);
}
for (const role of order) rmSync(`${OUT}/masters/${files[role]}.svg`, { force: true });

const fitted = {};
const strokes = [];
for (const role of order) {
  const native = await keyedNative(role);
  await sharp(native.cropped).png().toFile(`${OUT}/masters/${files[role]}.png`);
  const placed = await fitToCanvas(native.cropped);
  await sharp(placed.canvas).png().toFile(`${OUT}/outputs/${files[role]}.png`);
  fitted[role] = placed.fitted;
  strokes.push(placed.stroke);
  console.log(
    role,
    `${placed.fitted.w}x${placed.fitted.h}`,
    'gravity',
    placed.fitted.cx.toFixed(1),
    placed.fitted.cy.toFixed(1),
    'stroke',
    placed.stroke,
    'red',
    placed.fitted.red,
  );
}

const stroke = median(strokes);
const measurements = {};
for (const role of order) {
  const b = fitted[role];
  measurements[role] = {
    file: `outputs/${files[role]}.png`,
    canvas: SIZE,
    inkWidth: b.w,
    inkHeight: b.h,
    centerOfGravityX: Number(b.cx.toFixed(2)),
    centerOfGravityY: Number(b.cy.toFixed(2)),
    redPixels: b.red,
    occupancy: Number((Math.max(b.w, b.h) / SIZE).toFixed(4)),
    source: `authority/hq/${files[role]}.jpg`,
  };
}
writeFileSync(
  `${OUT}/qa/measurements.json`,
  JSON.stringify(
    {
      method: 'keyed-from-hq-render',
      ink: '#141414',
      target: TARGET,
      stroke,
      whiteLuma: WHITE_LUMA,
      blackLuma: BLACK_LUMA,
      icons: measurements,
    },
    null,
    2,
  ),
);
writeFileSync(
  `${OUT}/authority/hq/SOURCES.json`,
  JSON.stringify(
    {
      note: 'Founder high-quality renders. Pixels are keyed to transparent charcoal. They are not redrawn.',
      assignment: {
        HUB: 'Tighter open diamond stack (c655). The low-res sheet filled the top slab; this render does not.',
        DESIGN: 'More open diamond stack (c687). Also an outline, not a filled slab.',
        INBOX: 'Rounded envelope with an inner flap.',
        EXPERIENCE: 'Circle and rounded play triangle.',
        EXPRESSION: 'Isometric cube wireframe. No front-edge notch.',
        LIBRARY: 'Three rounded volumes. The right volume is tilted. No spine dash.',
        ACTIVITY: 'Pulse with a small rise, a deep valley, a tall peak, and an open ring joined to the stroke.',
      },
      files: sources,
    },
    null,
    2,
  ),
);

async function iconTile(role, cell) {
  return sharp(`${OUT}/outputs/${files[role]}.png`).resize(cell, cell).png().toBuffer();
}

const sheetW = 1400;
const sheetH = 520;
const cell = 168;
const sheetIcons = [];
for (let i = 0; i < order.length; i++) {
  sheetIcons.push({ input: await iconTile(order[i], cell), left: 16 + i * 196 + Math.round((180 - cell) / 2), top: 150 });
}
const roundDot = await sharp(
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"><circle cx="9" cy="9" r="8" fill="${RED}"/></svg>`),
)
  .png()
  .toBuffer();
const labels = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${sheetW}" height="${sheetH}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="700" y="78" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" letter-spacing="6" fill="#141414">BOTTOM NAV ICON FAMILY V1</text>
  <text x="700" y="118" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#555555">Keyed from the high-quality renders. Red marks are host accents, not baked into the icon files.</text>
  ${order.map((name, i) => `<text x="${16 + i * 196 + 90}" y="390" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" letter-spacing="2" fill="#141414">${name}</text>`).join('')}
</svg>`;
const tileScale = cell / SIZE;
function hostDot(index, px, py) {
  const originLeft = 16 + index * 196 + Math.round((180 - cell) / 2);
  const originTop = 150;
  return {
    input: roundDot,
    left: Math.round(originLeft + px * tileScale - 9),
    top: Math.round(originTop + py * tileScale - 9),
  };
}
const inbox = fitted.INBOX;
const activity = fitted.ACTIVITY;
await sharp(Buffer.from(labels))
  .composite([
    ...sheetIcons,
    hostDot(1, inbox.maxX + 8, inbox.minY - 4),
    hostDot(6, activity.maxX - 6, activity.minY + Math.round(activity.h * 0.22)),
  ])
  .png()
  .toFile(`${OUT}/proof/master-sheet.png`);

for (const px of [16, 20, 24, 26, 32]) {
  const tiles = [];
  for (const role of order) tiles.push(await iconTile(role, px));
  const gap = 18;
  const width = px * 7 + gap * 6;
  await sharp({
    create: { width, height: px, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite(tiles.map((input, i) => ({ input, left: i * (px + gap), top: 0 })))
    .png()
    .toFile(`${OUT}/proof/size-${px}.png`);
}

const ref = await sharp(`${OUT}/authority/BOTTOM_NAV_ICON_PACK_SHEET.jpg`).resize({ width: 1400 }).png().toBuffer();
const refMeta = await sharp(ref).metadata();
const ours = await sharp(`${OUT}/proof/master-sheet.png`).resize({ width: 1400 }).png().toBuffer();
const oursMeta = await sharp(ours).metadata();
const compareH = (refMeta.height || 0) + (oursMeta.height || 0) + 24;
await sharp({
  create: { width: 1400, height: compareH, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
})
  .composite([
    { input: ref, left: 0, top: 0 },
    { input: ours, left: 0, top: (refMeta.height || 0) + 24 },
  ])
  .png()
  .toFile(`${OUT}/proof/before-after.png`);

console.log('stroke median', stroke);
console.log('pack written', OUT);
