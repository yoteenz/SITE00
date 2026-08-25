#!/usr/bin/env npx tsx
import sharp from 'sharp';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '../..');
const path = join(ROOT, 'visual-references/founder/ndxbook/mobile-overview-menu-open.png');

async function main() {
  const meta = await sharp(path).metadata();
  console.log('dims', meta.width, meta.height);
  const { data, info } = await sharp(path).raw().toBuffer({ resolveWithObject: true });
  let dark = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (lum < 120) dark++;
  }
  console.log('dark pixels', dark, 'total', info.width! * info.height!);

  // Scan bottom nav row for dark pixel clusters (y > 85% of height)
  const w = info.width!;
  const h = info.height!;
  const navYStart = Math.floor(h * 0.88);
  const rowDark: number[] = new Array(w).fill(0);
  for (let y = navYStart; y < h - 20; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * info.channels;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum < 120) rowDark[x]++;
    }
  }
  // Find clusters
  let inCluster = false;
  let start = 0;
  const clusters: { start: number; end: number; count: number }[] = [];
  for (let x = 0; x < w; x++) {
    if (rowDark[x] > 2 && !inCluster) {
      inCluster = true;
      start = x;
    } else if (rowDark[x] <= 2 && inCluster) {
      inCluster = false;
      const count = rowDark.slice(start, x).reduce((a, b) => a + b, 0);
      clusters.push({ start, end: x, count });
    }
  }
  console.log('bottom nav clusters:', clusters.slice(0, 10));

  // Header scan (y < 8%)
  const headerYEnd = Math.floor(h * 0.08);
  const headerDark: number[] = new Array(w).fill(0);
  for (let y = 0; y < headerYEnd; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * info.channels;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum < 120) headerDark[x]++;
    }
  }
  inCluster = false;
  const headerClusters: { start: number; end: number; count: number }[] = [];
  for (let x = 0; x < w; x++) {
    if (headerDark[x] > 2 && !inCluster) {
      inCluster = true;
      start = x;
    } else if (headerDark[x] <= 2 && inCluster) {
      inCluster = false;
      const count = headerDark.slice(start, x).reduce((a, b) => a + b, 0);
      headerClusters.push({ start, end: x, count });
    }
  }
  console.log('header clusters:', headerClusters);

  for (const name of ['overview', 'campaigns', 'content_ops', 'lab', 'more', 'notifications', 'ellipsis']) {
    const p = join(ROOT, 'visual-references/founder/ndxbook/icon-crops', `${name}.png`);
    const m = await sharp(p).metadata();
    const { data: d, info: inf } = await sharp(p).raw().toBuffer({ resolveWithObject: true });
    let dpx = 0;
    for (let i = 0; i < d.length; i += inf.channels) {
      const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      if (lum < 120) dpx++;
    }
    console.log(name, `${m.width}x${m.height}`, 'dark', dpx);
  }
}

main().catch(console.error);
