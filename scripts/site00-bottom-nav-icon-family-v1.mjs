import { createRequire } from 'module';
import { mkdirSync, writeFileSync } from 'fs';

const sharp = createRequire('/workspace/package.json')('sharp');

const SIZE = 512;
const STROKE = 26;
const INK = '#141414';
const RED = '#e5231b';
const TARGET = 292;

function poly(pts, close = true) {
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
  return close ? `${d} Z` : d;
}
function rect(x, y, w, h) {
  return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
}
function roundRectPath(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  return `M${(x + rr).toFixed(2)} ${y.toFixed(2)} H${(x + w - rr).toFixed(2)} Q${(x + w).toFixed(2)} ${y.toFixed(2)} ${(x + w).toFixed(2)} ${(y + rr).toFixed(2)} V${(y + h - rr).toFixed(2)} Q${(x + w).toFixed(2)} ${(y + h).toFixed(2)} ${(x + w - rr).toFixed(2)} ${(y + h).toFixed(2)} H${(x + rr).toFixed(2)} Q${x.toFixed(2)} ${(y + h).toFixed(2)} ${x.toFixed(2)} ${(y + h - rr).toFixed(2)} V${(y + rr).toFixed(2)} Q${x.toFixed(2)} ${y.toFixed(2)} ${(x + rr).toFixed(2)} ${y.toFixed(2)} Z`;
}

/** Geometry in a 512 design space. Filled paths are the solid core. */
function rawGeometry() {
  return {
    HUB: {
      fills: [poly(rect(168, 88, 216, 68))],
      strokes: [poly(rect(142, 176, 216, 68)), poly(rect(116, 264, 216, 68))],
    },
    INBOX: {
      strokes: [
        poly([[112, 150], [400, 150], [400, 368], [112, 368]]),
        poly([[150, 182], [256, 276], [362, 182]], false),
      ],
    },
    DESIGN: {
      strokes: [poly(rect(176, 92, 160, 60)), poly(rect(146, 184, 220, 60)), poly(rect(112, 276, 288, 60))],
    },
    EXPERIENCE: {
      circles: [{ cx: 256, cy: 256, r: 124 }],
      strokes: [poly([[196, 176], [324, 256], [196, 336]], false)],
    },
    EXPRESSION: {
      strokes: [
        poly([[256, 104], [404, 186], [256, 268], [108, 186]]),
        poly([[108, 186], [108, 344]], false),
        poly([[404, 186], [404, 344]], false),
        poly([[256, 268], [256, 426]], false),
        poly([[108, 344], [256, 426], [404, 344]], false),
      ],
    },
    LIBRARY: {
      strokes: [
        roundRectPath(116, 156, 80, 220, 18),
        roundRectPath(216, 112, 80, 264, 18),
        roundRectPath(316, 172, 80, 204, 18),
      ],
    },
    ACTIVITY: {
      strokes: [poly([[64, 312], [132, 312], [196, 312], [268, 72], [340, 312], [392, 312]], false)],
      circles: [{ cx: 448, cy: 312, r: 48 }],
    },
  };
}

function svgFrom(icon) {
  const fills = (icon.fills || []).map((d) => `<path d="${d}" fill="${INK}" stroke="none"/>`).join('');
  const strokes = (icon.strokes || []).map((d) => `<path d="${d}"/>`).join('');
  const circles = (icon.circles || [])
    .map((c) => `<circle cx="${c.cx.toFixed(2)}" cy="${c.cy.toFixed(2)}" r="${c.r.toFixed(2)}"/>`)
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <g fill="none" stroke="${INK}" stroke-width="${STROKE}" stroke-linejoin="miter" stroke-linecap="butt" stroke-miterlimit="2.2">${fills}${strokes}${circles}</g>
</svg>`;
}

function transformNumbers(d, s, ox, oy) {
  const tokens = d.match(/[MLHVQZ]|-?\d+(?:\.\d+)?/gi) || [];
  let cmd = 'M';
  let i = 0;
  let out = '';
  const num = () => Number(tokens[i++]);
  const X = (n) => (n * s + ox).toFixed(2);
  const Y = (n) => (n * s + oy).toFixed(2);
  while (i < tokens.length) {
    const t = tokens[i];
    if (/[MLHVQZ]/i.test(t)) {
      cmd = t.toUpperCase();
      out += `${t} `;
      i += 1;
      continue;
    }
    if (cmd === 'H') out += `${X(num())} `;
    else if (cmd === 'V') out += `${Y(num())} `;
    else if (cmd === 'Q') out += `${X(num())} ${Y(num())} ${X(num())} ${Y(num())} `;
    else out += `${X(num())} ${Y(num())} `;
  }
  return out.trim();
}

function transformIcon(icon, s, ox, oy) {
  return {
    fills: (icon.fills || []).map((d) => transformNumbers(d, s, ox, oy)),
    strokes: (icon.strokes || []).map((d) => transformNumbers(d, s, ox, oy)),
    circles: (icon.circles || []).map((c) => ({
      cx: c.cx * s + ox,
      cy: c.cy * s + oy,
      r: c.r * s,
    })),
  };
}

async function inkBounds(xml) {
  const { data, info } = await sharp(Buffer.from(xml)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;
  let n = 0;
  let sx = 0;
  let sy = 0;
  let red = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      if (data[i + 3] < 16) continue;
      n += 1;
      sx += x;
      sy += y;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (data[i] > 160 && data[i + 1] < 100 && data[i + 2] < 100) red += 1;
    }
  }
  return {
    minX,
    minY,
    maxX,
    maxY,
    w: maxX - minX + 1,
    h: maxY - minY + 1,
    n,
    cx: n ? sx / n : 0,
    cy: n ? sy / n : 0,
    red,
  };
}

const order = ['HUB', 'INBOX', 'DESIGN', 'EXPERIENCE', 'EXPRESSION', 'LIBRARY', 'ACTIVITY'];
const raw = rawGeometry();
const fitted = {};

for (const name of order) {
  const first = svgFrom(raw[name]);
  const b = await inkBounds(first);
  const s = TARGET / Math.max(b.w, b.h);
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  const icon = transformIcon(raw[name], s, 256 - cx * s, 256 - cy * s);
  const xml = svgFrom(icon);
  const b2 = await inkBounds(xml);
  fitted[name] = { xml, bounds: b2 };
  console.log(
    name,
    `${b2.w}x${b2.h}`,
    'origin',
    b2.minX,
    b2.minY,
    'gravity',
    b2.cx.toFixed(1),
    b2.cy.toFixed(1),
    'red',
    b2.red,
  );
}

const OUT = '/workspace/docs/site00/bottom-nav/BOTTOM_NAV_ICON_FAMILY_V1';
const files = {
  HUB: '01_HUB',
  INBOX: '02_INBOX',
  DESIGN: '03_DESIGN',
  EXPERIENCE: '04_EXPERIENCE',
  EXPRESSION: '05_EXPRESSION',
  LIBRARY: '06_LIBRARY',
  ACTIVITY: '07_ACTIVITY',
};
for (const dir of ['masters', 'outputs', 'proof', 'qa', 'authority']) mkdirSync(`${OUT}/${dir}`, { recursive: true });
for (const name of order) {
  writeFileSync(`${OUT}/masters/${files[name]}.svg`, fitted[name].xml);
  await sharp(Buffer.from(fitted[name].xml)).png().toFile(`${OUT}/outputs/${files[name]}.png`);
}

const measurements = {};
for (const name of order) {
  measurements[name] = {
    file: `outputs/${files[name]}.png`,
    canvas: 512,
    inkWidth: fitted[name].bounds.w,
    inkHeight: fitted[name].bounds.h,
    centerOfGravityX: Number(fitted[name].bounds.cx.toFixed(2)),
    centerOfGravityY: Number(fitted[name].bounds.cy.toFixed(2)),
    redPixels: fitted[name].bounds.red,
    occupancy: Number((Math.max(fitted[name].bounds.w, fitted[name].bounds.h) / 512).toFixed(4)),
  };
}
writeFileSync(`${OUT}/qa/measurements.json`, JSON.stringify({ stroke: STROKE, ink: INK, target: TARGET, icons: measurements }, null, 2));

async function iconTile(name, cell) {
  return sharp(`${OUT}/outputs/${files[name]}.png`).resize(cell, cell).png().toBuffer();
}

const sheetW = 1400;
const sheetH = 520;
const cell = 168;
const sheetIcons = [];
for (let i = 0; i < order.length; i++) {
  sheetIcons.push({ input: await iconTile(order[i], cell), left: 16 + i * 196 + Math.round((180 - cell) / 2), top: 150 });
}
const roundDot = await sharp(
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"><circle cx="9" cy="9" r="8" fill="${RED}"/></svg>`,
  ),
)
  .png()
  .toBuffer();
const labels = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${sheetW}" height="${sheetH}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="700" y="78" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" letter-spacing="6" fill="#141414">BOTTOM NAV ICON FAMILY V1</text>
  <text x="700" y="118" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#555555">Charcoal masters. Red marks are host alert accents, not baked into the icon files.</text>
  ${order.map((name, i) => `<text x="${16 + i * 196 + 90}" y="390" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" letter-spacing="2" fill="#141414">${name}</text>`).join('')}
</svg>`;
const tileScale = cell / 512;
function hostDot(name, index, px, py) {
  const originLeft = 16 + index * 196 + Math.round((180 - cell) / 2);
  const originTop = 150;
  return {
    input: roundDot,
    left: Math.round(originLeft + px * tileScale - 9),
    top: Math.round(originTop + py * tileScale - 9),
  };
}
const inbox = fitted.INBOX.bounds;
const activity = fitted.ACTIVITY.bounds;
await sharp(Buffer.from(labels))
  .composite([
    ...sheetIcons,
    hostDot('INBOX', 1, inbox.maxX + 6, inbox.minY + 8),
    hostDot('ACTIVITY', 6, activity.maxX - 8, activity.maxY - 28),
  ])
  .png()
  .toFile(`${OUT}/proof/master-sheet.png`);

for (const px of [16, 20, 24, 26, 32]) {
  const tiles = [];
  for (const name of order) tiles.push(await iconTile(name, px));
  const gap = 18;
  const width = px * 7 + gap * 6;
  await sharp({
    create: { width, height: px, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite(tiles.map((input, i) => ({ input, left: i * (px + gap), top: 0 })))
    .png()
    .toFile(`${OUT}/proof/size-${px}.png`);
}

const ref = await sharp('/home/ubuntu/.cursor/projects/workspace/assets/2CF79989-F648-4873-832E-5171F949F905_L0_001.jpg')
  .resize({ width: 1400, withoutEnlargement: false })
  .png()
  .toBuffer();
const refMeta = await sharp(ref).metadata();
await sharp(ref).jpeg({ quality: 90 }).toFile(`${OUT}/authority/BOTTOM_NAV_ICON_PACK_SHEET.jpg`);
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

console.log('pack written', OUT);
