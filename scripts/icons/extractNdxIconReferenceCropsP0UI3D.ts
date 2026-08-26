#!/usr/bin/env npx tsx
/**
 * P0.UI.3D — extract icon reference crops from attached icon reference sheet.
 */
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import { NDX_ICON_SHEET_REFERENCE_AUTHORITY } from '../../shared/site00-studio-world-ui/icons/p0ui3d/authority.js';
import { P0_UI_3D_TARGET_ICONS } from '../../shared/site00-studio-world-ui/icons/p0ui3d/constants.js';

const ROOT = join(import.meta.dirname, '../..');
const OUT_DIR = join(ROOT, 'visual-references/founder/ndxbook/icon-crops-v3');

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const authority = NDX_ICON_SHEET_REFERENCE_AUTHORITY;
  const sourcePath = join(ROOT, authority.sourceAssetPath);
  if (!existsSync(sourcePath)) {
    console.error('Missing reference asset:', sourcePath);
    process.exit(1);
  }

  for (const iconName of P0_UI_3D_TARGET_ICONS) {
    const crop = authority.iconCrops[iconName];
    if (!crop) {
      console.warn('skip', iconName, 'no crop');
      continue;
    }
    const outPath = join(OUT_DIR, `${iconName}.png`);
    await sharp(sourcePath)
      .extract({
        left: crop.cropX,
        top: crop.cropY,
        width: crop.cropWidth,
        height: crop.cropHeight,
      })
      .png()
      .toFile(outPath);
    const publicPath = join(ROOT, 'public/visual-references/founder/ndxbook/icon-crops-v3', `${iconName}.png`);
    mkdirSync(dirname(publicPath), { recursive: true });
    await sharp(sourcePath)
      .extract({
        left: crop.cropX,
        top: crop.cropY,
        width: crop.cropWidth,
        height: crop.cropHeight,
      })
      .png()
      .toFile(publicPath);
    console.log('wrote', outPath, `${crop.cropWidth}x${crop.cropHeight}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
