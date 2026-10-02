import { createRequire } from 'module';
import { mkdirSync, writeFileSync } from 'fs';

const sharp = createRequire('/workspace/package.json')('sharp');

const SIZE = 512;
const STROKE = 30;
const INK = '#141414';
const RED = '#e5231b';
const TARGET = 300;

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

function roundedPoly(pts, rad) {
  const n = pts.length;
  const corners = pts.map((cur, i) => {
    const prev = pts[(i + n - 1) % n];
    const next = pts[(i + 1) % n];
    const v1 = [cur[0] - prev[0], cur[1] - prev[1]];
    const v2 = [next[0] - cur[0], next[1] - cur[1]];
    const l1 = Math.hypot(v1[0], v1[1]);
    const l2 = Math.hypot(v2[0], v2[1]);
    const t = Math.min(rad, l1 * 0.42, l2 * 0.42);
    return {
      a: [cur[0] - (v1[0] / l1) * t, cur[1] - (v1[1] / l1) * t],
      c: cur,
      b: [cur[0] + (v2[0] / l2) * t, cur[1] + (v2[1] / l2) * t],
    };
  });
  let d = `M${corners[0].a[0].toFixed(2)} ${corners[0].a[1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const corner = corners[i];
    const next = corners[(i + 1) % n];
    d += ` Q${corner.c[0].toFixed(2)} ${corner.c[1].toFixed(2)} ${corner.b[0].toFixed(2)} ${corner.b[1].toFixed(2)}`;
    d += ` L${next.a[0].toFixed(2)} ${next.a[1].toFixed(2)}`;
  }
  return `${d} Z`;
}

function diamond(cx, cy, hw, hh, rad) {
  return roundedPoly(
    [
      [cx, cy - hh],
      [cx + hw, cy],
      [cx, cy + hh],
      [cx - hw, cy],
    ],
    rad,
  );
}

/** Geometry traced from the attached bottom-nav sheet, not a reinterpretation. */
function rawGeometry() {
  const layer = (cy) => diamond(256, cy, 168, 86, 26);
  return {
    HUB: {
      fills: [layer(118)],
      strokes: [layer(196), layer(274)],
    },
    INBOX: {
      strokes: [
        roundRectPath(96, 150, 320, 230, 36),
        poly(
          [
            [132, 186],
            [256, 286],
            [380, 186],
          ],
          false,
        ),
      ],
    },
    DESIGN: {
      strokes: [layer(118), layer(196), layer(274)],
    },
    EXPERIENCE: {
      circles: [{ cx: 256, cy: 256, r: 132 }],
      strokes: [
        roundedPoly(
          [
            [188, 176],
            [348, 256],
            [188, 336],
          ],
          18,
        ),
      ],
    },
    EXPRESSION: {
      strokes: [
        roundedPoly(
          [
            [256, 78],
            [404, 160],
            [404, 318],
            [256, 400],
            [108, 318],
            [108, 160],
          ],
          22,
        ),
        poly(
          [
            [108, 160],
            [256, 242],
            [404, 160],
          ],
          false,
        ),
        poly(
          [
            [246, 242],
            [246, 262],
            [266, 262],
            [266, 242],
          ],
          false,
        ),
        poly(
          [
            [256, 262],
            [256, 400],
          ],
          false,
        ),
      ],
    },
    LIBRARY: {
      strokes: [
        roundRectPath(86, 176, 102, 242, 30),
        roundRectPath(196, 86, 108, 332, 32),
        roundRectPath(312, 206, 102, 212, 30),
      ],
      fillOnly: [roundRectPath(226, 352, 48, 14, 4)],
    },
    ACTIVITY: {
      linecap: 'round',
      linejoin: 'round',
      strokes: [
        poly(
          [
            [36, 236],
            [132, 236],
            [196, 236],
            [250, 64],
            [318, 392],
            [378, 236],
            [476, 236],
          ],
          false,
        ),
      ],
    },
  };
}

function svgFrom(icon) {
  const sw = icon.strokeWidth || STROKE;
  const cap = icon.linecap || 'butt';
  const join = icon.linejoin || 'miter';
  const fills = (icon.fills || []).map((d) => `<path d="${d}" fill="${INK}" stroke="${INK}"/>`).join('');
  const fillOnly = (icon.fillOnly || []).map((d) => `<path d="${d}" fill="${INK}" stroke="none"/>`).join('');
  const strokes = (icon.strokes || []).map((d) => `<path d="${d}"/>`).join('');
  const circles = (icon.circles || [])
    .map((c) => `<circle cx="${c.cx.toFixed(2)}" cy="${c.cy.toFixed(2)}" r="${c.r.toFixed(2)}"/>`)
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <g fill="none" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="${join}" stroke-linecap="${cap}" stroke-miterlimit="2.2">${fills}${fillOnly}${strokes}${circles}</g>
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
    fillOnly: (icon.fillOnly || []).map((d) => transformNumbers(d, s, ox, oy)),
    strokes: (icon.strokes || []).map((d) => transformNumbers(d, s, ox, oy)),
    circles: (icon.circles || []).map((c) => ({
      cx: c.cx * s + ox,
      cy: c.cy * s + oy,
      r: c.r * s,
    })),
    linecap: icon.linecap,
    linejoin: icon.linejoin,
    strokeWidth: icon.strokeWidth,
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
