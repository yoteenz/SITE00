#!/usr/bin/env npx tsx
/**
 * Find tight icon bounding boxes in mobile-overview-menu-open.png
 */
import sharp from 'sharp';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '../..');
const SOURCE = join(ROOT, 'visual-references/founder/ndxbook/mobile-overview-menu-open.png');

function isDark(r: number, g: number, b: number, threshold = 120): boolean {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum < threshold;
}

function isLime(r: number, g: number, b: number): boolean {
  return g > 180 && r < 180 && b < 120;
}

function findBounds(
  data: Buffer,
  w: number,
  h: number,
  channels: number,
  region: { x0: number; y0: number; x1: number; y1: number },
  includeLime = false,
): { minX: number; minY: number; maxX: number; maxY: number; count: number } | null {
  let minX = w,
    minY = h,
    maxX = 0,
    maxY = 0,
    count = 0;
  for (let y = region.y0; y < region.y1; y++) {
    for (let x = region.x0; x < region.x1; x++) {
      const i = (y * w + x) * channels;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      if (isDark(r, g, b) || (includeLime && isLime(r, g, b))) {
        count++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (count === 0) return null;
  return { minX, minY, maxX, maxY, count };
}

async function main() {
  const meta = await sharp(SOURCE).metadata();
  const w = meta.width!;
  const h = meta.height!;
  const { data, info } = await sharp(SOURCE).raw().toBuffer({ resolveWithObject: true });

  const regions: Record<string, { x0: number; y0: number; x1: number; y1: number; lime?: boolean }> = {
    overview: { x0: 55, y0: 1540, x1: 120, y1: 1585, lime: true },
    campaigns: { x0: 240, y0: 1540, x1: 310, y1: 1585 },
    content_ops: { x0: 395, y0: 1540, x1: 465, y1: 1585 },
    lab: { x0: 555, y0: 1540, x1: 615, y1: 1585 },
    more: { x0: 710, y0: 1540, x1: 770, y1: 1585 },
    notifications: { x0: 755, y0: 70, x1: 815, y1: 120 },
    ellipsis: { x0: 865, y0: 70, x1: 925, y1: 120 },
    back_to_projects: { x0: 535, y0: 355, x1: 575, y1: 385 },
    return_to_origin: { x0: 535, y0: 395, x1: 575, y1: 425 },
    inspect: { x0: 535, y0: 445, x1: 575, y1: 475 },
    help: { x0: 535, y0: 505, x1: 575, y1: 535 },
    project_overview: { x0: 55, y0: 1540, x1: 120, y1: 1585, lime: true },
  };

  const crops: Record<string, { x: number; y: number; width: number; height: number; count: number }> = {};
  for (const [name, region] of Object.entries(regions)) {
    const bounds = findBounds(data, w, h, info.channels, region, region.lime);
    if (!bounds) {
      console.log(name, 'NO BOUNDS');
      continue;
    }
    const pad = 2;
    const crop = {
      x: Math.max(0, bounds.minX - pad),
      y: Math.max(0, bounds.minY - pad),
      width: Math.min(w, bounds.maxX + pad + 1) - Math.max(0, bounds.minX - pad),
      height: Math.min(h, bounds.maxY + pad + 1) - Math.max(0, bounds.minY - pad),
      count: bounds.count,
    };
    crops[name] = crop;
    console.log(
      name,
      crop,
      `norm: { x: ${(crop.x / w).toFixed(4)}, y: ${(crop.y / h).toFixed(4)}, w: ${(crop.width / w).toFixed(4)}, h: ${(crop.height / h).toFixed(4)} }`,
    );
  }
}

main().catch(console.error);
