#!/usr/bin/env node
/**
 * Extract SKINS reference visual assets from approved authority screenshots.
 * Deconstruction-first: crop from reference — no paid generation.
 */

import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const MOBILE_REF = join(ROOT, 'public/visual-references/founder/site00/skins-authority-mobile.jpg');
const DESKTOP_REF = join(ROOT, 'public/visual-references/founder/site00/skins-authority-desktop.jpg');
const OUT_BASE = join(ROOT, 'public/site00/skins/extracted');

/** Normalized crop boxes [x, y, w, h] in 0–1 space — calibrated against authority refs. */
const MOBILE_FAMILY_CROPS = {
  BRAND_FAMILY_NDXBOOK: [0.02, 0.335, 0.19, 0.095],
  BRAND_FAMILY_FRONTAL_SLAYER: [0.21, 0.335, 0.19, 0.095],
  BRAND_FAMILY_AIO: [0.40, 0.335, 0.19, 0.095],
  BRAND_FAMILY_ASTRAL_WORLD: [0.59, 0.335, 0.19, 0.095],
  BRAND_FAMILY_STUDIO_WORLD: [0.78, 0.335, 0.19, 0.095],
  SCREEN_OVERVIEW: [0.04, 0.72, 0.38, 0.22],
};

const DESKTOP_FAMILY_CROPS = {
  BRAND_FAMILY_NDXBOOK: [0.02, 0.24, 0.12, 0.11],
  BRAND_FAMILY_FRONTAL_SLAYER: [0.02, 0.36, 0.12, 0.11],
  BRAND_FAMILY_AIO: [0.02, 0.48, 0.12, 0.11],
  BRAND_FAMILY_ASTRAL_WORLD: [0.02, 0.60, 0.12, 0.11],
  BRAND_FAMILY_STUDIO_WORLD: [0.02, 0.72, 0.12, 0.11],
  SCREEN_OVERVIEW: [0.72, 0.22, 0.25, 0.55],
};

const DESKTOP_SCREEN_TILE_CROPS = {
  SCREEN_OVERVIEW: [0.28, 0.38, 0.11, 0.14],
  SCREEN_IDENTITY: [0.40, 0.38, 0.11, 0.14],
  SCREEN_BUILDER: [0.52, 0.38, 0.11, 0.14],
  SCREEN_EVOLVE: [0.64, 0.38, 0.11, 0.14],
  SCREEN_PRODUCTION: [0.28, 0.54, 0.11, 0.14],
  SCREEN_REVIEWS: [0.40, 0.54, 0.11, 0.14],
  SCREEN_LIBRARY: [0.52, 0.54, 0.11, 0.14],
  SCREEN_CONTROL_ROOM: [0.64, 0.54, 0.11, 0.14],
};

async function cropAndSave(refPath, viewport, slot, normBox) {
  const meta = await sharp(refPath).metadata();
  const w = meta.width ?? 1;
  const h = meta.height ?? 1;
  const [nx, ny, nw, nh] = normBox;
  const left = Math.round(nx * w);
  const top = Math.round(ny * h);
  const width = Math.round(nw * w);
  const height = Math.round(nh * h);

  const outDir = join(OUT_BASE, viewport);
  await mkdir(outDir, { recursive: true });
  const outPath = join(outDir, `${slot.toLowerCase()}.webp`);

  await sharp(refPath).extract({ left, top, width, height }).webp({ quality: 88 }).toFile(outPath);
  return `/site00/skins/extracted/${viewport}/${slot.toLowerCase()}.webp`;
}

async function main() {
  const manifest = { extractedAt: new Date().toISOString(), entries: [] };

  const familySlots = new Set(Object.keys(MOBILE_FAMILY_CROPS).filter((s) => s.startsWith('BRAND_FAMILY_')));

  for (const [slot, box] of Object.entries(MOBILE_FAMILY_CROPS)) {
    const sourceCropUrl = await cropAndSave(MOBILE_REF, 'mobile', slot, box);
    manifest.entries.push({
      viewport: 'MOBILE',
      assetSlot: slot,
      sourceCropUrl,
      canonicalUrl: null,
      status: familySlots.has(slot) ? 'RECONSTRUCTION_PENDING' : 'RECONSTRUCTION_PENDING',
      cropConfirmed: true,
      uiContaminationSuspected: familySlots.has(slot),
    });
  }

  for (const [slot, box] of Object.entries(DESKTOP_FAMILY_CROPS)) {
    const sourceCropUrl = await cropAndSave(DESKTOP_REF, 'desktop', slot, box);
    manifest.entries.push({
      viewport: 'DESKTOP',
      assetSlot: slot,
      sourceCropUrl,
      canonicalUrl: null,
      status: 'RECONSTRUCTION_PENDING',
      cropConfirmed: true,
      uiContaminationSuspected: familySlots.has(slot),
    });
  }

  for (const [slot, box] of Object.entries(DESKTOP_SCREEN_TILE_CROPS)) {
    const sourceCropUrl = await cropAndSave(DESKTOP_REF, 'desktop', slot, box);
    manifest.entries.push({
      viewport: 'DESKTOP',
      assetSlot: slot,
      sourceCropUrl,
      canonicalUrl: null,
      status: 'RECONSTRUCTION_PENDING',
      cropConfirmed: true,
      uiContaminationSuspected: false,
    });
  }

  const manifestPath = join(OUT_BASE, 'manifest.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Extracted ${manifest.entries.length} assets → ${manifestPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
