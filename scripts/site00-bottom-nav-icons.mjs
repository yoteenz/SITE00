import { createRequire } from 'module';
import { writeFileSync, mkdirSync } from 'fs';
const require = createRequire('/workspace/package.json');
const sharp = require('sharp');

const SIZE = 512;
const STROKE = 26;
const INK = '#141414';

function hexPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = ((-90 + i * 60) * Math.PI) / 180;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

/** Symmetric geometric leaf along the current DESIGN diagonal. */
function leafPoints() {
  const stem = [132, 388];
  const tip = [388, 124];
  const axis = [tip[0] - stem[0], tip[1] - stem[1]];
  const len = Math.hypot(axis[0], axis[1]);
  const ux = axis[0] / len;
  const uy = axis[1] / len;
  const px = -uy;
  const py = ux;
  const at = (t, w) => [stem[0] + ux * len * t + px * w, stem[1] + uy * len * t + py * w];
  // Width peaks just past the middle, pinched at both ends.
  const outline = [at(0, 0), at(0.22, -46), at(0.55, -62), at(1, 0), at(0.55, 62), at(0.22, 46)];
  const vein = [at(0.08, 0), at(0.92, 0)];
  return { outline, vein };
}

function geometry() {
  const leaf = leafPoints();
  return {
    HUB: {
      paths: [
        [[108, 232], [256, 104], [404, 232], [404, 408], [108, 408]],
      ],
      closed: [true],
    },
    INBOX: {
      // Closed envelope. Flap is the top edge, so the lid stroke is not doubled.
      paths: [[[116, 156], [256, 286], [396, 156], [396, 372], [116, 372]]],
      closed: [true],
    },
    DESIGN: {
      paths: [leaf.outline, leaf.vein],
      closed: [true, false],
    },
    EXPERIENCE: {
      paths: [
        [[256, 100], [420, 412], [92, 412]],
        [[256, 176], [256, 412]],
      ],
      closed: [true, false],
    },
    EXPRESSION: {
      paths: [hexPoints(256, 256, 158), hexPoints(256, 256, 80)],
      closed: [true, true],
    },
    LIBRARY: {
      // Isometric wireframe. Diamond sits inside the top face, clear of every edge.
      paths: [
        [[256, 108], [412, 198], [256, 288], [100, 198]],
        [[100, 198], [100, 358]],
        [[412, 198], [412, 358]],
        [[256, 288], [256, 448]],
        [[100, 358], [256, 448], [412, 358]],
        [[256, 158], [294, 196], [256, 234], [218, 196]],
      ],
      closed: [true, false, false, false, false, true],
    },
    ACTIVITY: {
      paths: [
        [[64, 300], [156, 300], [204, 300], [250, 128], [312, 412], [366, 300], [448, 300]],
      ],
      closed: [false],
      circles: [{ cx: 392, cy: 196, r: 48 }],
    },
  };
}

function pathD(pts, closed) {
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
  return closed ? d + ' Z' : d;
}

function svgFrom(icon) {
  const paths = icon.paths.map((pts, i) => `<path d="${pathD(pts, icon.closed[i])}"/>`).join('\n  ');
  const circles = (icon.circles || []).map((c) => `<circle cx="${c.cx.toFixed(2)}" cy="${c.cy.toFixed(2)}" r="${c.r.toFixed(2)}"/>`).join('\n  ');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" fill="none">
  <g fill="none" stroke="${INK}" stroke-width="${STROKE}" stroke-linejoin="miter" stroke-linecap="butt" stroke-miterlimit="2.5">
  ${paths}
  ${circles}
  </g>
</svg>`;
}

function transformIcon(icon, s, ox, oy) {
  const map = (p) => [p[0] * s + ox, p[1] * s + oy];
  return {
    paths: icon.paths.map((pts) => pts.map(map)),
    closed: icon.closed,
    circles: (icon.circles || []).map((c) => ({ cx: c.cx * s + ox, cy: c.cy * s + oy, r: c.r * s })),
  };
}

async function inkBounds(xml) {
  const { data, info } = await sharp(Buffer.from(xml)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width, minY = height, maxX = 0, maxY = 0, n = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * channels + 3];
      if (a < 16) continue;
      n++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  return { minX, minY, maxX, maxY, n, w: maxX - minX + 1, h: maxY - minY + 1 };
}

const TARGET = 300; // longest ink side
const order = ['HUB', 'INBOX', 'DESIGN', 'EXPERIENCE', 'EXPRESSION', 'LIBRARY', 'ACTIVITY'];
const raw = geometry();
const fitted = {};

for (const name of order) {
  const first = svgFrom(raw[name]);
  const b = await inkBounds(first);
  const s = TARGET / Math.max(b.w, b.h);
  // Map ink center to canvas center. Path coords != ink coords (stroke extends),
  // so fit using the raster bounds: world = (pixel - origin) ... 
  // Our geometry is already in pixel space (1 user unit = 1 px before scale).
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  // new = (p - c) * s + 256, but ink center c is in the unscaled raster.
  // Path point p renders near p. Ink center ≈ geometric center for these shapes.
  const ox = 256 - cx * s;
  const oy = 256 - cy * s;
  fitted[name] = transformIcon(raw[name], s, ox, oy);
  const xml = svgFrom(fitted[name]);
  const b2 = await inkBounds(xml);
  console.log(name, 'raw', b.w, b.h, 'fit', b2.w, b2.h, 'at', b2.minX, b2.minY, 'ink', b2.n);
  fitted[name].xml = xml;
}

const OUT = '/workspace/docs/site00/bottom-nav/GROK_ICON_PACK';
const files = {
  HUB: '01_HUB',
  INBOX: '02_INBOX',
  DESIGN: '03_DESIGN',
  EXPERIENCE: '04_EXPERIENCE',
  EXPRESSION: '05_EXPRESSION',
  LIBRARY: '06_LIBRARY',
  ACTIVITY: '07_ACTIVITY',
};
mkdirSync(`${OUT}/masters`, { recursive: true });
mkdirSync(`${OUT}/outputs`, { recursive: true });
mkdirSync(`${OUT}/qa`, { recursive: true });
for (const name of order) {
  writeFileSync(`${OUT}/masters/${files[name]}.svg`, fitted[name].xml);
  await sharp(Buffer.from(fitted[name].xml)).png().toFile(`${OUT}/outputs/${files[name]}.png`);
}

// QA sheet on light gray + 26px strip + 64px strip
async function sheet(cell, file, bg) {
  const tiles = [];
  for (const name of order) {
    tiles.push(await sharp(`${OUT}/outputs/${files[name]}.png`).resize(cell, cell).png().toBuffer());
  }
  await sharp({ create: { width: cell * 7, height: cell, channels: 4, background: bg } })
    .composite(tiles.map((input, i) => ({ input, left: i * cell, top: 0 })))
    .png()
    .toFile(file);
}
await sheet(180, `${OUT}/qa/contact-sheet.png`, { r: 244, g: 244, b: 244, alpha: 1 });
await sheet(64, `${OUT}/qa/strip-64.png`, { r: 255, g: 255, b: 255, alpha: 1 });
await sheet(26, `${OUT}/qa/strip-26.png`, { r: 255, g: 255, b: 255, alpha: 1 });

const hub = await sharp(`${OUT}/outputs/01_HUB.png`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const a0 = hub.data[3];
const mid = hub.data[((256 * 512 + 256) * 4) + 3];
console.log('hub corner alpha', a0, 'center alpha', mid);
