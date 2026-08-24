#!/usr/bin/env npx tsx
/**
 * Generate founder-approved NDXBOOK workspace reference fixtures (P0.VR.1A).
 * Cream/paper-led desktop + mobile boards — not dark structural bands.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const OUT = join(process.cwd(), 'tests/fixtures/visual-reconstruction');
const PAPER = { r: 250, g: 248, b: 245 };
const INK = { r: 17, g: 17, b: 17 };
const LIME = { r: 183, g: 210, b: 54 };
const BORDER = { r: 232, g: 228, b: 220 };
const SURFACE = { r: 255, g: 255, b: 255 };

async function fillRect(
  base: Buffer,
  width: number,
  x: number,
  y: number,
  w: number,
  h: number,
  color: { r: number; g: number; b: number },
) {
  for (let row = y; row < y + h && row < base.length / (width * 3); row++) {
    for (let col = x; col < x + w && col < width; col++) {
      const i = (row * width + col) * 3;
      base[i] = color.r;
      base[i + 1] = color.g;
      base[i + 2] = color.b;
    }
  }
}

async function generateDesktop(): Promise<Buffer> {
  const width = 1440;
  const height = 900;
  const raw = Buffer.alloc(width * height * 3);
  for (let i = 0; i < raw.length; i += 3) {
    raw[i] = PAPER.r;
    raw[i + 1] = PAPER.g;
    raw[i + 2] = PAPER.b;
  }
  await fillRect(raw, width, 0, 0, 220, height, SURFACE);
  await fillRect(raw, width, 240, 80, 400, 200, SURFACE);
  await fillRect(raw, width, 660, 80, 360, 200, SURFACE);
  await fillRect(raw, width, 1040, 80, 360, 420, SURFACE);
  await fillRect(raw, width, 240, 300, 1160, 520, SURFACE);
  for (let i = 0; i < 6; i++) {
    await fillRect(raw, width, 260 + i * 180, 320, 160, 120, { r: 245, g: 242, b: 235 });
    await fillRect(raw, width, 260 + i * 180, 320, 160, 8, LIME);
  }
  await fillRect(raw, width, 0, 860, width, 40, INK);
  return sharp(raw, { raw: { width, height, channels: 3 } }).png().toBuffer();
}

async function generateMobile(): Promise<Buffer> {
  const width = 390;
  const height = 844;
  const raw = Buffer.alloc(width * height * 3);
  for (let i = 0; i < raw.length; i += 3) {
    raw[i] = PAPER.r;
    raw[i + 1] = PAPER.g;
    raw[i + 2] = PAPER.b;
  }
  await fillRect(raw, width, 0, 0, width, 56, SURFACE);
  await fillRect(raw, width, 16, 120, width - 32, 48, SURFACE);
  await fillRect(raw, width, 16, 190, 120, 140, { r: 245, g: 242, b: 235 });
  await fillRect(raw, width, 148, 190, 120, 140, { r: 245, g: 242, b: 235 });
  await fillRect(raw, width, 280, 190, 94, 140, { r: 245, g: 242, b: 235 });
  await fillRect(raw, width, 16, 360, width - 32, 200, SURFACE);
  await fillRect(raw, width, 0, 780, width, 64, SURFACE);
  await fillRect(raw, width, 60, 800, 48, 4, LIME);
  return sharp(raw, { raw: { width, height, channels: 3 } }).png().toBuffer();
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const desktop = await generateDesktop();
  const mobile = await generateMobile();
  writeFileSync(join(OUT, 'ndxbook-workspace-desktop-primary.png'), desktop);
  writeFileSync(join(OUT, 'ndxbook-workspace-mobile-primary.png'), mobile);
  console.log('Wrote founder reference fixtures to', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
