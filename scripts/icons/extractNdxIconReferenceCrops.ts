#!/usr/bin/env npx tsx
/**
 * P0.UI.3A — extract icon reference crops from NDX mobile mood board fixture.
 */
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import { NDX_ICON_VISUAL_REFERENCE_AUTHORITY, boardToScreenCropBounds } from '../../shared/site00-studio-world-ui/icons/p0ui3a/authority.js';
import { NDX_ICON_FIRST_PASS_TRACED, NDX_ICON_EXTENDED_TRACED } from '../../shared/site00-studio-world-ui/icons/p0ui3a/constants.js';

const ROOT = join(import.meta.dirname, '../..');
const OUT_DIR = join(ROOT, 'visual-references/founder/ndxbook/icon-crops');

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const authority = NDX_ICON_VISUAL_REFERENCE_AUTHORITY;
  const sourcePath = join(ROOT, authority.sourceAssetPath);
  if (!existsSync(sourcePath)) {
    console.error('Missing reference asset:', sourcePath);
    process.exit(1);
  }
  const meta = await sharp(sourcePath).metadata();
  const boardW = meta.width ?? authority.boardWidth;
  const boardH = meta.height ?? authority.boardHeight;

  const icons = [...NDX_ICON_FIRST_PASS_TRACED, ...NDX_ICON_EXTENDED_TRACED];
  for (const iconName of icons) {
    const boardCrop = boardToScreenCropBounds(iconName);
    const left = Math.round(boardCrop.x * boardW);
    const top = Math.round(boardCrop.y * boardH);
    const width = Math.max(1, Math.round(boardCrop.width * boardW));
    const height = Math.max(1, Math.round(boardCrop.height * boardH));
    const outPath = join(OUT_DIR, `${iconName}.png`);
    await sharp(sourcePath).extract({ left, top, width, height }).png().toFile(outPath);
    const publicPath = join(ROOT, 'public/visual-references/founder/ndxbook/icon-crops', `${iconName}.png`);
    mkdirSync(dirname(publicPath), { recursive: true });
    await sharp(sourcePath).extract({ left, top, width, height }).png().toFile(publicPath);
    console.log('wrote', outPath, `${width}x${height}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
